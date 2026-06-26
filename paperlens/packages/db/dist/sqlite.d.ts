import Database from 'better-sqlite3';
export declare class SQLiteDB {
    private db;
    constructor(dbPath: string);
    get instance(): Database.Database;
    prepare(sql: string): Database.Statement;
    close(): void;
    transaction<T>(fn: () => T): T;
}
export declare function getDB(dbPath?: string): SQLiteDB;
export declare function resetDB(): void;
//# sourceMappingURL=sqlite.d.ts.map