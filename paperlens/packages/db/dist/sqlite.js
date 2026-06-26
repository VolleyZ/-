import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { initSchema } from './schema';
export class SQLiteDB {
    constructor(dbPath) {
        const dir = path.dirname(dbPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        this.db = new Database(dbPath);
        this.db.pragma('journal_mode = WAL');
        this.db.pragma('foreign_keys = ON');
        initSchema(this.db);
    }
    get instance() {
        return this.db;
    }
    prepare(sql) {
        return this.db.prepare(sql);
    }
    close() {
        this.db.close();
    }
    transaction(fn) {
        return this.db.transaction(fn)();
    }
}
let dbInstance = null;
export function getDB(dbPath) {
    if (!dbInstance) {
        const resolvedPath = dbPath || path.join(process.cwd(), 'data', 'db', 'paperlens.db');
        dbInstance = new SQLiteDB(resolvedPath);
    }
    return dbInstance;
}
export function resetDB() {
    if (dbInstance) {
        dbInstance.close();
        dbInstance = null;
    }
}
