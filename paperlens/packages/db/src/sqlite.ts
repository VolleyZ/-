import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { SCHEMA_SQL, initSchema } from './schema'

function findProjectRoot(): string {
  if (process.env.PAPERLENS_ROOT) {
    return process.env.PAPERLENS_ROOT
  }
  
  let dir = process.cwd()
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))) {
      return dir
    }
    const pkgPath = path.join(dir, 'package.json')
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
        if (pkg.name === 'paperlens') {
          return dir
        }
      } catch {}
    }
    dir = path.dirname(dir)
  }
  
  return process.cwd()
}

let _projectRoot: string | null = null

function getProjectRootInternal(): string {
  if (_projectRoot === null) {
    _projectRoot = findProjectRoot()
  }
  return _projectRoot
}

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
    const root = getProjectRootInternal()
    const resolvedPath = dbPath || path.join(root, 'data', 'db', 'paperlens.db')
    dbInstance = new SQLiteDB(resolvedPath)
  }
  return dbInstance
}

export function getProjectRoot(): string {
  return getProjectRootInternal()
}

export function resetDB(): void {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
}
