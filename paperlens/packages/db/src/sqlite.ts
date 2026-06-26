import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { SCHEMA_SQL, initSchema } from './schema'

export class SQLiteDB {
  private db: Database.Database

  constructor(dbPath: string) {
    const dir = path.dirname(dbPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    this.db = new Database(dbPath)
    this.db.pragma('journal_mode = WAL')
    this.db.pragma('foreign_keys = ON')
    initSchema(this.db)
  }

  get instance(): Database.Database {
    return this.db
  }

  prepare(sql: string): Database.Statement {
    return this.db.prepare(sql)
  }

  close(): void {
    this.db.close()
  }

  transaction<T>(fn: () => T): T {
    return this.db.transaction(fn)()
  }
}

let dbInstance: SQLiteDB | null = null

export function getDB(dbPath?: string): SQLiteDB {
  if (!dbInstance) {
    const resolvedPath = dbPath || path.join(process.cwd(), 'data', 'db', 'paperlens.db')
    dbInstance = new SQLiteDB(resolvedPath)
  }
  return dbInstance
}

export function resetDB(): void {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
}
