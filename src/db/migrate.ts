import 'dotenv/config';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

async function runMigrations() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  console.log('[Migrate] Connecting to database...');

  try {
    const migrationFiles = [
      '001_regions.sql',
      '002_locations.sql',
      '003_world_events.sql',
      '004_characters.sql',
      '005_diary_entries.sql',
      '006_milestones.sql',
      '007_npcs.sql',
      '008_relations.sql',
      '009_player_suggestions.sql',
      '010_seed_world.sql',
    ];

    for (const file of migrationFiles) {
      const filePath = path.join(__dirname, 'migrations', file);
      if (!fs.existsSync(filePath)) {
        console.log(`[Migrate] Skipping ${file} (not found)`);
        continue;
      }

      const sql = fs.readFileSync(filePath, 'utf-8');
      console.log(`[Migrate] Running ${file}...`);
      await pool.query(sql);
      console.log(`[Migrate] ${file} completed`);
    }

    console.log('[Migrate] All migrations completed');
  } catch (error) {
    console.error('[Migrate] Error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
