#!/usr/bin/env bun
/**
 * NAS → R2 Migration Script
 * Uploads NAS-only files (not already in R2) to solampio-product-docs.
 *
 * Usage:
 *   bun scripts/nas-to-r2-migrate.ts [--dry-run]
 */

import { execSync } from "child_process";
import { readFileSync, writeFileSync, unlinkSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

const R2_BUCKET = "solampio-product-docs";
const DRY_RUN = process.argv.includes("--dry-run");
const NAS_FILES = join(import.meta.dir, "..", "nas-only-files.json");
const STATE_FILE = join(import.meta.dir, "..", "dropbox-migration-state.json");

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

interface NasFile {
  path: string;
  rel: string;
  name: string;
  size: number;
  source: string;
  r2_key: string;
}

function uploadToR2(key: string, filePath: string, contentType: string): boolean {
  try {
    execSync(
      `bunx wrangler r2 object put "${R2_BUCKET}/${key}" --file="${filePath}" --content-type="${contentType}"`,
      { stdio: "pipe", timeout: 120000 }
    );
    return true;
  } catch (err: any) {
    console.error(`    Upload error: ${err.message?.slice(0, 200)}`);
    return false;
  }
}

async function main() {
  console.log("=== NAS → R2 Migration ===");
  console.log(`Mode: ${DRY_RUN ? "DRY RUN" : "LIVE"}\n`);

  const files: NasFile[] = JSON.parse(readFileSync(NAS_FILES, "utf8"));
  console.log(`Files to upload: ${files.length}`);
  const totalMB = files.reduce((a, f) => a + f.size, 0) / (1024 * 1024);
  console.log(`Total size: ${totalMB.toFixed(1)} MB\n`);

  // Load state to update after uploads
  const state = JSON.parse(readFileSync(STATE_FILE, "utf8"));

  const stats = { uploaded: 0, failed: 0, bytes: 0 };

  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const ext = f.name.split(".").pop()?.toLowerCase() || "";
    const contentType = CONTENT_TYPES[ext] || "application/octet-stream";

    console.log(`[${i + 1}/${files.length}] ${f.name} (${(f.size / 1024).toFixed(0)} KB)`);
    console.log(`    ${f.source}: ${f.rel}`);
    console.log(`    → ${f.r2_key}`);

    if (DRY_RUN) {
      console.log("    [DRY RUN] Would upload\n");
      continue;
    }

    const success = uploadToR2(f.r2_key, f.path, contentType);
    if (success) {
      stats.uploaded++;
      stats.bytes += f.size;
      state.completed.push(f.r2_key);
      console.log("    ✓ Done");
    } else {
      stats.failed++;
      state.failed.push(f.r2_key);
      console.log("    ✗ Failed");
    }

    // Save state every 20 files
    if ((stats.uploaded + stats.failed) % 20 === 0) {
      writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    }
    console.log("");
  }

  // Final state save
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));

  console.log("=== NAS Migration Complete ===");
  console.log(`Uploaded: ${stats.uploaded}`);
  console.log(`Failed: ${stats.failed}`);
  console.log(`Data transferred: ${(stats.bytes / 1024 / 1024).toFixed(1)} MB`);
  console.log(`Total in R2 now: ${state.completed.length}`);
}

main().catch(console.error);
