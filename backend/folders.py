"""
Folders Management and Scanning Boundaries
"""
import uuid
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any, Optional

def validate_folder_path(path_str: str) -> bool:
    clean = path_str.strip()
    if not clean:
        return False
    # Prohibit whole drive or root authorization
    if clean in ("/", "\\", "C:\\", "C:/", "D:\\", "D:/"):
        return False
    return True

class FolderManager:
    def __init__(self, db_conn):
        self.conn = db_conn

    def list_folders(self) -> List[Dict[str, Any]]:
        cur = self.conn.cursor()
        cur.execute("SELECT * FROM authorized_folders ORDER BY added_at DESC")
        return [dict(row) for row in cur.fetchall()]

    def add_folder(self, folder_path: str, name: Optional[str] = None) -> Dict[str, Any]:
        if not validate_folder_path(folder_path):
            raise ValueError("Invalid or restricted folder path.")
        
        folder_id = str(uuid.uuid4())
        folder_name = name or Path(folder_path).name or "Folder"
        now = datetime.utcnow().isoformat()

        cur = self.conn.cursor()
        cur.execute("""
            INSERT INTO authorized_folders (id, name, path, status, added_at, last_scanned_at)
            VALUES (?, ?, ?, 'idle', ?, ?)
        """, (folder_id, folder_name, folder_path, now, now))
        self.conn.commit()

        return {
            "id": folder_id,
            "name": folder_name,
            "path": folder_path,
            "status": "idle",
            "added_at": now
        }

    def remove_folder(self, folder_id: str) -> bool:
        cur = self.conn.cursor()
        cur.execute("DELETE FROM indexed_files WHERE folder_id = ?", (folder_id,))
        cur.execute("DELETE FROM authorized_folders WHERE id = ?", (folder_id,))
        self.conn.commit()
        return True
