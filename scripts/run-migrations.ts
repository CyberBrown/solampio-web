/**
 * Migration Runner for D1 Database
 *
 * Tracks applied migrations in a _migrations table and only runs new ones.
 *
 * Usage:
 *   npx tsx scripts/run-migrations.ts           # Run on local database
 *   npx tsx scripts/run-migrations.ts --remote  # Run on production database
 *   npx tsx scripts/run-migrations.ts --status  # Show migration status
 */

import { execSync } from 'child_process';
import { readdirSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MIGRATIONS_DIR = resolve(__dirname, '../migrations');
const DB_NAME = 'solampio-migration';

interface MigrationRecord {
  name: string;
  applied_at: string;
}

function runD1Command(command: string, remote: boolean): string {
  const remoteFlag = remote ? '--remote' : '--local';
  const fullCommand = `npx wrangler d1 execute ${DB_NAME} ${remoteFlag} --command "${command.replace(/"/g, '\\"')}"`;

  try {
    const result = execSync(fullCommand, {
      encoding: 'utf-8',
      cwd: resolve(__dirname, '..'),
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return result;
  } catch (error: any) {
    // Check if it's just a "no such table" error for _migrations
    if (error.stderr?.includes('no such table: _migrations')) {
      return '{"results":[]}';
    }
    throw error;
  }
}

function runD1File(filePath: string, remote: boolean): void {
  const remoteFlag = remote ? '--remote' : '--local';
  const fullCommand = `npx wrangler d1 execute ${DB_NAME} ${remoteFlag} --file "${filePath}"`;

  execSync(fullCommand, {
    encoding: 'utf-8',
    cwd: resolve(__dirname, '..'),
    stdio: 'inherit'
  });
}

function parseD1Output(output: string): any[] {
  try {
    // Find the JSON array in the output
    const jsonMatch = output.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed[0]?.results || [];
    }
    return [];
  } catch {
    return [];
  }
}

async function ensureMigrationsTable(remote: boolean): Promise<void> {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT DEFAULT (datetime('now'))
    )
  `.replace(/\n/g, ' ').trim();

  runD1Command(createTableSQL, remote);
  console.log('✓ Migrations table ready\n');
}

async function getAppliedMigrations(remote: boolean): Promise<Set<string>> {
  const output = runD1Command('SELECT name FROM _migrations ORDER BY name', remote);
  const results = parseD1Output(output) as MigrationRecord[];
  return new Set(results.map(r => r.name));
}

function getMigrationFiles(): string[] {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();
  return files;
}

async function recordMigration(name: string, remote: boolean): Promise<void> {
  runD1Command(`INSERT INTO _migrations (name) VALUES ('${name}')`, remote);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const remote = args.includes('--remote');
  const statusOnly = args.includes('--status');

  const target = remote ? 'PRODUCTION (remote)' : 'LOCAL';
  console.log(`\n🗄️  Migration Runner - Target: ${target}\n`);

  if (remote && !statusOnly) {
    console.log('⚠️  WARNING: Running migrations on PRODUCTION database!');
    console.log('   Press Ctrl+C within 3 seconds to cancel...\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  // Ensure migrations table exists
  await ensureMigrationsTable(remote);

  // Get applied migrations
  const applied = await getAppliedMigrations(remote);
  const allMigrations = getMigrationFiles();

  console.log(`Found ${allMigrations.length} migration files`);
  console.log(`Already applied: ${applied.size}\n`);

  // Show status
  console.log('Migration Status:');
  console.log('─'.repeat(60));

  const pending: string[] = [];

  for (const file of allMigrations) {
    const isApplied = applied.has(file);
    const status = isApplied ? '✓ Applied' : '○ Pending';
    console.log(`  ${status}  ${file}`);

    if (!isApplied) {
      pending.push(file);
    }
  }

  console.log('─'.repeat(60));

  if (statusOnly) {
    console.log(`\n${pending.length} pending migration(s)\n`);
    return;
  }

  if (pending.length === 0) {
    console.log('\n✓ All migrations are up to date!\n');
    return;
  }

  // Run pending migrations
  console.log(`\nRunning ${pending.length} pending migration(s)...\n`);

  for (const file of pending) {
    console.log(`▶ Running: ${file}`);
    const filePath = resolve(MIGRATIONS_DIR, file);

    try {
      runD1File(filePath, remote);
      await recordMigration(file, remote);
      console.log(`  ✓ Success\n`);
    } catch (error: any) {
      console.error(`  ✗ Failed: ${error.message}\n`);
      console.error('Migration aborted. Fix the error and run again.\n');
      process.exit(1);
    }
  }

  console.log(`✓ All migrations complete!\n`);
}

main().catch(error => {
  console.error('Migration error:', error);
  process.exit(1);
});
