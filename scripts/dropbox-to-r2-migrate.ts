#!/usr/bin/env bun
/**
 * Dropbox → R2 Migration Script
 * Migrates "Solamp Product Library" from Dropbox to solampio-product-docs R2 bucket.
 *
 * Usage:
 *   DROPBOX_TOKEN=xxx bun scripts/dropbox-to-r2-migrate.ts
 *   DROPBOX_TOKEN=xxx bun scripts/dropbox-to-r2-migrate.ts --dry-run
 *   DROPBOX_TOKEN=xxx bun scripts/dropbox-to-r2-migrate.ts --list-only
 */

import { execSync } from "child_process";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

const DROPBOX_TOKEN = process.env.DROPBOX_TOKEN;
const R2_BUCKET = "solampio-product-docs";
const SOURCE_FOLDER = "/Solamp Product Library";
const DRY_RUN = process.argv.includes("--dry-run");
const LIST_ONLY = process.argv.includes("--list-only");
const CONCURRENCY = parseInt(process.env.CONCURRENCY || "3");
const STATE_FILE = join(import.meta.dir, "..", "dropbox-migration-state.json");

const ALLOWED_EXTENSIONS = new Set([
  "pdf", "jpg", "jpeg", "png", "gif", "webp", "svg",
  "docx", "doc", "xlsx", "xls", "pptx", "mp4",
]);

const CONTENT_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  mp4: "video/mp4",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  doc: "application/msword",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xls: "application/vnd.ms-excel",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

if (!DROPBOX_TOKEN && !LIST_ONLY) {
  console.error("DROPBOX_TOKEN environment variable required");
  process.exit(1);
}

// --- State management ---

interface State {
  completed: string[];
  failed: string[];
}

function loadState(): State {
  // Also check old state file location (solampio-migration repo)
  const oldStateFile = "/home/chris/projects/solampio-migration/dropbox-migration-state.json";

  if (existsSync(STATE_FILE)) {
    const data = readFileSync(STATE_FILE, "utf8");
    return JSON.parse(data);
  }
  if (existsSync(oldStateFile)) {
    console.log("Importing state from solampio-migration repo...");
    const data = readFileSync(oldStateFile, "utf8");
    const state = JSON.parse(data);
    writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    return state;
  }
  return { completed: [], failed: [] };
}

function saveState(state: State) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// --- Dropbox API ---

interface DropboxFile {
  ".tag": string;
  name: string;
  path_display: string;
  path_lower: string;
  size: number;
}

async function listDropboxFiles(path: string): Promise<DropboxFile[]> {
  const files: DropboxFile[] = [];
  let cursor: string | null = null;
  let hasMore = true;

  while (hasMore) {
    const url = cursor
      ? "https://api.dropboxapi.com/2/files/list_folder/continue"
      : "https://api.dropboxapi.com/2/files/list_folder";

    const body = cursor ? { cursor } : { path, recursive: true, include_deleted: false };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DROPBOX_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Dropbox API error (${response.status}): ${error}`);
    }

    const data = await response.json();
    const fileEntries = (data.entries as DropboxFile[]).filter((e) => e[".tag"] === "file");
    files.push(...fileEntries);

    cursor = data.cursor;
    hasMore = data.has_more;

    process.stdout.write(`\r  Listed ${files.length} files...`);
  }
  console.log("");

  return files;
}

/**
 * Escape non-ASCII chars for Dropbox-API-Arg header (must be 7-bit ASCII).
 * Replaces any char > U+007F with \uXXXX escape sequences.
 */
function asciiSafeJson(obj: unknown): string {
  return JSON.stringify(obj).replace(/[\u0080-\uffff]/g, (ch) => {
    return "\\u" + ch.charCodeAt(0).toString(16).padStart(4, "0");
  });
}

async function downloadFromDropbox(path: string): Promise<ArrayBuffer> {
  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch("https://content.dropboxapi.com/2/files/download", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${DROPBOX_TOKEN}`,
          "Dropbox-API-Arg": asciiSafeJson({ path }),
        },
      });

      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get("Retry-After") || "5");
        console.log(`    Rate limited, waiting ${retryAfter}s...`);
        await new Promise((r) => setTimeout(r, retryAfter * 1000));
        continue;
      }

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${await response.text()}`);
      }

      return response.arrayBuffer();
    } catch (err) {
      if (attempt === maxRetries) throw err;
      console.log(`    Retry ${attempt}/${maxRetries}...`);
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
  throw new Error("Unreachable");
}

// --- R2 upload via wrangler ---

function uploadToR2(key: string, data: ArrayBuffer, contentType: string): boolean {
  const tempFile = join(tmpdir(), `r2-upload-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  try {
    writeFileSync(tempFile, Buffer.from(data));
    execSync(
      `bunx wrangler r2 object put "${R2_BUCKET}/${key}" --file="${tempFile}" --content-type="${contentType}"`,
      { stdio: "pipe", timeout: 60000 }
    );
    return true;
  } catch (err: any) {
    console.error(`    Upload error: ${err.message?.slice(0, 200)}`);
    return false;
  } finally {
    try { require("fs").unlinkSync(tempFile); } catch {}
  }
}

// --- Path normalization ---

function toR2Key(dropboxPath: string): string {
  let key = dropboxPath.replace(/^\/Solamp Product Library\/?/i, "");
  key = key
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-_./]/g, "");
  return `products/${key}`;
}

function getExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}

// --- Concurrency helper ---

async function processWithConcurrency<T>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<void>
) {
  let index = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (index < items.length) {
      const i = index++;
      await fn(items[i], i);
    }
  });
  await Promise.all(workers);
}

// --- Main ---

async function main() {
  console.log("=== Dropbox → R2 Migration ===");
  console.log(`Source: ${SOURCE_FOLDER}`);
  console.log(`Destination: ${R2_BUCKET}`);
  console.log(`Mode: ${DRY_RUN ? "DRY RUN" : LIST_ONLY ? "LIST ONLY" : "LIVE"}`);
  console.log(`Concurrency: ${CONCURRENCY}`);
  console.log("");

  // Load state - clear failed list so they get retried
  const state = loadState();
  if (state.failed.length > 0) {
    console.log(`Clearing ${state.failed.length} previous failures for retry`);
    state.failed = [];
    saveState(state);
  }
  const completedSet = new Set(state.completed);
  console.log(`State: ${completedSet.size} previously completed`);
  console.log("");

  // List Dropbox files
  console.log("Listing Dropbox files...");
  const allFiles = await listDropboxFiles(SOURCE_FOLDER);
  console.log(`Total files in Dropbox: ${allFiles.length}`);

  // Filter to allowed types
  const eligible = allFiles.filter((f) => ALLOWED_EXTENSIONS.has(getExtension(f.name)));
  console.log(`Eligible files (filtered by type): ${eligible.length}`);

  // Compute R2 keys and filter out completed
  const toMigrate = eligible
    .map((f) => ({ file: f, r2Key: toR2Key(f.path_display) }))
    .filter(({ r2Key }) => !completedSet.has(r2Key));

  console.log(`Already migrated: ${eligible.length - toMigrate.length}`);
  console.log(`Remaining to migrate: ${toMigrate.length}`);

  // Size summary
  const totalSizeMB = toMigrate.reduce((acc, { file }) => acc + file.size, 0) / (1024 * 1024);
  console.log(`Total size remaining: ${totalSizeMB.toFixed(1)} MB`);
  console.log("");

  if (LIST_ONLY) {
    // Print brand breakdown
    const byBrand = new Map<string, number>();
    for (const { r2Key } of toMigrate) {
      const brand = r2Key.split("/")[1] || "unknown";
      byBrand.set(brand, (byBrand.get(brand) || 0) + 1);
    }
    console.log("Remaining files by brand:");
    for (const [brand, count] of [...byBrand.entries()].sort((a, b) => b[1] - a[1])) {
      console.log(`  ${brand}: ${count}`);
    }
    return;
  }

  if (DRY_RUN) {
    console.log("[DRY RUN] Would migrate these files:");
    for (const { file, r2Key } of toMigrate.slice(0, 20)) {
      console.log(`  ${file.path_display} → ${r2Key} (${(file.size / 1024).toFixed(1)} KB)`);
    }
    if (toMigrate.length > 20) {
      console.log(`  ... and ${toMigrate.length - 20} more`);
    }
    return;
  }

  // --- Live migration ---
  const stats = { uploaded: 0, failed: 0, bytes: 0 };
  const startTime = Date.now();

  await processWithConcurrency(toMigrate, CONCURRENCY, async ({ file, r2Key }, i) => {
    const ext = getExtension(file.name);
    const contentType = CONTENT_TYPES[ext] || "application/octet-stream";
    const progress = `[${i + 1}/${toMigrate.length}]`;

    console.log(`${progress} ${file.name} (${(file.size / 1024).toFixed(0)} KB)`);
    console.log(`    → ${r2Key}`);

    try {
      // Download from Dropbox
      const data = await downloadFromDropbox(file.path_lower);

      // Upload to R2
      const success = uploadToR2(r2Key, data, contentType);

      if (success) {
        stats.uploaded++;
        stats.bytes += file.size;
        state.completed.push(r2Key);
        completedSet.add(r2Key);
        console.log(`    ✓ Done`);
      } else {
        stats.failed++;
        state.failed.push(r2Key);
        console.log(`    ✗ Upload failed`);
      }
    } catch (err: any) {
      stats.failed++;
      state.failed.push(r2Key);
      console.error(`    ✗ Error: ${err.message?.slice(0, 200)}`);
    }

    // Save state every 10 files
    if ((stats.uploaded + stats.failed) % 10 === 0) {
      saveState(state);
    }
  });

  // Final state save
  saveState(state);

  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log("");
  console.log("=== Migration Complete ===");
  console.log(`Uploaded: ${stats.uploaded}`);
  console.log(`Failed: ${stats.failed}`);
  console.log(`Data transferred: ${(stats.bytes / 1024 / 1024).toFixed(1)} MB`);
  console.log(`Time: ${elapsed} minutes`);
  console.log(`Total in R2 now: ${state.completed.length}`);

  if (stats.failed > 0) {
    console.log(`\nFailed files saved to state. Re-run to retry.`);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
