"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const pg_1 = require("pg");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
async function runMigrations() {
    const pool = new pg_1.Pool({
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
    }
    catch (error) {
        console.error('[Migrate] Error:', error);
        process.exit(1);
    }
    finally {
        await pool.end();
    }
}
runMigrations();
//# sourceMappingURL=migrate.js.map