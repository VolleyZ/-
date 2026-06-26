import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { initSchema } from './schema';
function findProjectRoot() {
    if (process.env.PAPERLENS_ROOT) {
        return process.env.PAPERLENS_ROOT;
    }
    let dir = process.cwd();
    while (dir !== path.dirname(dir)) {
        if (fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))) {
            return dir;
        }
        const pkgPath = path.join(dir, 'package.json');
        if (fs.existsSync(pkgPath)) {
            try {
                const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
                if (pkg.name === 'paperlens') {
                    return dir;
                }
            }
            catch { }
        }
        dir = path.dirname(dir);
    }
    return process.cwd();
}
let _projectRoot = null;
function getProjectRootInternal() {
    if (_projectRoot === null) {
        _projectRoot = findProjectRoot();
    }
    return _projectRoot;
}
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
        const root = getProjectRootInternal();
        const resolvedPath = dbPath || path.join(root, 'data', 'db', 'paperlens.db');
        dbInstance = new SQLiteDB(resolvedPath);
    }
    return dbInstance;
}
export function getProjectRoot() {
    return getProjectRootInternal();
}
export function resetDB() {
    if (dbInstance) {
        dbInstance.close();
        dbInstance = null;
    }
}
