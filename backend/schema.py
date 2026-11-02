"""
SQLite Database Schema and Initialization
"""
import sqlite3
from pathlib import Path
from backend.config import DB_PATH

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS authorized_folders (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    path TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'idle',
    file_count INTEGER DEFAULT 0,
    added_at TEXT NOT NULL,
    last_scanned_at TEXT
);

CREATE TABLE IF NOT EXISTS indexed_files (
    id TEXT PRIMARY KEY,
    folder_id TEXT NOT NULL,
    folder_path TEXT NOT NULL,
    relative_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_extension TEXT NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    content_hash TEXT NOT NULL,
    perceptual_hash TEXT,
    created_at TEXT NOT NULL,
    modified_at TEXT NOT NULL,
    indexed_at TEXT NOT NULL,
    is_available INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'indexed',
    error_message TEXT,
    is_duplicate INTEGER NOT NULL DEFAULT 0,
    primary_file_id TEXT,
    duplicate_confidence REAL,
    tags TEXT,
    description TEXT,
    ocr_snippet TEXT,
    width INTEGER,
    height INTEGER,
    embedding BLOB,
    FOREIGN KEY(folder_id) REFERENCES authorized_folders(id)
);

CREATE TABLE IF NOT EXISTS activity_log (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    category TEXT NOT NULL,
    level TEXT NOT NULL,
    message TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_files_hash ON indexed_files(content_hash);
CREATE INDEX IF NOT EXISTS idx_files_folder ON indexed_files(folder_id);
CREATE INDEX IF NOT EXISTS idx_files_type ON indexed_files(file_type);
"""

def init_db(db_path: Path = DB_PATH) -> sqlite3.Connection:
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    with conn:
        conn.executescript(SCHEMA_SQL)
        cur = conn.cursor()
        cur.execute("SELECT version FROM schema_version")
        if not cur.fetchone():
            cur.execute("INSERT INTO schema_version (version) VALUES (1)")
    return conn
