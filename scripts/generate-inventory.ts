#!/usr/bin/env bun
/**
 * Generate product docs inventory from migration state + Dropbox metadata.
 *
 * Usage:
 *   DROPBOX_TOKEN=xxx bun scripts/generate-inventory.ts
 *
 * Or without Dropbox (uses state file only, no file sizes):
 *   bun scripts/generate-inventory.ts --from-state
 */

import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const DROPBOX_TOKEN = process.env.DROPBOX_TOKEN;
const SOURCE_FOLDER = "/Solamp Product Library";
const STATE_FILE = join(import.meta.dir, "..", "dropbox-migration-state.json");
const OUTPUT_FILE = join(import.meta.dir, "..", "product-docs-inventory.json");
const FROM_STATE = process.argv.includes("--from-state");

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
      throw new Error(`Dropbox API error: ${await response.text()}`);
    }

    const data = await response.json();
    files.push(...(data.entries as DropboxFile[]).filter((e) => e[".tag"] === "file"));
    cursor = data.cursor;
    hasMore = data.has_more;
    process.stdout.write(`\r  Listed ${files.length} files...`);
  }
  console.log("");
  return files;
}

function toR2Key(dropboxPath: string): string {
  let key = dropboxPath.replace(/^\/Solamp Product Library\/?/i, "");
  key = key.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-_./]/g, "");
  return `products/${key}`;
}

function getExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}

async function main() {
  console.log("=== Generating Product Docs Inventory ===\n");

  // Load state
  const state = JSON.parse(readFileSync(STATE_FILE, "utf8"));
  const completedKeys = new Set<string>(state.completed);
  console.log(`State: ${completedKeys.size} files in R2\n`);

  // Build file metadata map
  const fileMap = new Map<string, { size: number; filename: string }>();

  if (!FROM_STATE && DROPBOX_TOKEN) {
    console.log("Fetching Dropbox metadata for file sizes...");
    const dropboxFiles = await listDropboxFiles(SOURCE_FOLDER);

    for (const f of dropboxFiles) {
      const key = toR2Key(f.path_display);
      if (completedKeys.has(key)) {
        fileMap.set(key, { size: f.size, filename: f.name });
      }
    }
    console.log(`Matched ${fileMap.size} files with Dropbox metadata\n`);
  }

  // Build inventory
  const byType: Record<string, number> = {};
  const byBrand: Record<string, number> = {};
  let totalSize = 0;

  const files: Array<{
    r2_key: string;
    filename: string;
    brand: string;
    size: number;
    content_type: string;
    source: string;
  }> = [];

  for (const key of [...completedKeys].sort()) {
    const parts = key.split("/");
    const brand = parts[1] || "unknown";
    const filename = parts[parts.length - 1] || "unknown";
    const ext = getExtension(filename);
    const contentType = CONTENT_TYPES[ext] || "application/octet-stream";
    const meta = fileMap.get(key);
    const size = meta?.size || 0;

    byType[ext] = (byType[ext] || 0) + 1;
    byBrand[brand] = (byBrand[brand] || 0) + 1;
    totalSize += size;

    files.push({
      r2_key: key,
      filename: meta?.filename || filename,
      brand,
      size,
      content_type: contentType,
      source: "dropbox",
    });
  }

  const inventory = {
    generated_at: new Date().toISOString(),
    total_files: files.length,
    total_size_mb: Math.round(totalSize / (1024 * 1024)),
    by_type: Object.fromEntries(
      Object.entries(byType).sort(([, a], [, b]) => b - a)
    ),
    by_brand: Object.fromEntries(
      Object.entries(byBrand).sort(([, a], [, b]) => b - a)
    ),
    files,
  };

  writeFileSync(OUTPUT_FILE, JSON.stringify(inventory, null, 2));
  console.log(`Inventory written to ${OUTPUT_FILE}`);
  console.log(`  Total files: ${inventory.total_files}`);
  console.log(`  Total size: ${inventory.total_size_mb} MB`);
  console.log(`  File types: ${Object.keys(byType).length}`);
  console.log(`  Brands: ${Object.keys(byBrand).length}`);
  console.log("\nTop brands:");
  Object.entries(byBrand)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15)
    .forEach(([brand, count]) => console.log(`  ${brand}: ${count}`));
  console.log("\nFile types:");
  Object.entries(byType)
    .sort(([, a], [, b]) => b - a)
    .forEach(([ext, count]) => console.log(`  .${ext}: ${count}`));
}

main().catch(console.error);
