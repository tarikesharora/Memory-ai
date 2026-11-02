"""
Indexing Worker & Batch Processing with In-Batch Duplicate Resolution
"""
import uuid
import hashlib
from datetime import datetime
from typing import List, Dict, Any, Optional

def compute_sha256(content_bytes: bytes) -> str:
    return hashlib.sha256(content_bytes).hexdigest()

class IndexingWorker:
    def __init__(self, db_conn, embedder=None):
        self.conn = db_conn
        self.embedder = embedder
        self.is_paused = False
        self.is_cancelled = False

    def process_batch(self, batch_items: List[Dict[str, Any]]) -> Dict[str, int]:
        """
        Processes a batch of files.
        BUG FIX IMPLEMENTED:
        Tracks in-batch hashes. If an item shares a hash with an earlier item
        in the SAME batch, its duplicate marking is deferred until after the
        primary embedding is generated and stored.
        """
        batch_seen_hashes = {}  # hash -> primary_file_id
        deferred_duplicates = []
        indexed_count = 0
        duplicate_count = 0

        # Existing global hashes
        cur = self.conn.cursor()
        cur.execute("SELECT id, content_hash FROM indexed_files WHERE is_duplicate = 0")
        global_hashes = {row["content_hash"]: row["id"] for row in cur.fetchall()}

        for item in batch_items:
            content_hash = item.get("content_hash") or hashlib.sha256(item["file_name"].encode()).hexdigest()
            file_id = str(uuid.uuid4())
            item["id"] = file_id
            item["content_hash"] = content_hash

            # 1. In-batch duplicate check
            if content_hash in batch_seen_hashes:
                deferred_duplicates.append((item, content_hash))
                continue

            # 2. Existing database duplicate check
            if content_hash in global_hashes:
                primary_id = global_hashes[content_hash]
                self._insert_file_record(
                    item,
                    is_duplicate=1,
                    primary_file_id=primary_id,
                    embedding=None
                )
                duplicate_count += 1
                continue

            # 3. New primary item
            embedding = None
            if self.embedder:
                embedding = self.embedder.embed_text(item.get("description", item["file_name"]))

            self._insert_file_record(
                item,
                is_duplicate=0,
                primary_file_id=None,
                embedding=embedding
            )
            batch_seen_hashes[content_hash] = file_id
            global_hashes[content_hash] = file_id
            indexed_count += 1

        # Resolve deferred duplicates now that all primary batch embeddings are in DB
        for item, content_hash in deferred_duplicates:
            primary_id = batch_seen_hashes[content_hash]
            self._insert_file_record(
                item,
                is_duplicate=1,
                primary_file_id=primary_id,
                embedding=None
            )
            duplicate_count += 1

        self.conn.commit()
        return {
            "processed": len(batch_items),
            "indexed": indexed_count,
            "duplicates": duplicate_count
        }

    def _insert_file_record(self, item: Dict[str, Any], is_duplicate: int, primary_file_id: Optional[str], embedding: Any):
        cur = self.conn.cursor()
        cur.execute("""
            INSERT OR REPLACE INTO indexed_files (
                id, folder_id, folder_path, relative_path, file_name,
                file_type, file_extension, file_size_bytes, content_hash,
                perceptual_hash, created_at, modified_at, indexed_at,
                is_available, status, is_duplicate, primary_file_id,
                tags, description, ocr_snippet, width, height, embedding
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            item["id"],
            item.get("folder_id", "default"),
            item.get("folder_path", "/photos"),
            item.get("relative_path", item["file_name"]),
            item["file_name"],
            item.get("file_type", "image"),
            item.get("file_extension", "jpg"),
            item.get("file_size_bytes", 1024),
            item["content_hash"],
            item.get("perceptual_hash", item["content_hash"][:16]),
            item.get("created_at", datetime.utcnow().isoformat()),
            item.get("modified_at", datetime.utcnow().isoformat()),
            datetime.utcnow().isoformat(),
            1,
            "indexed",
            is_duplicate,
            primary_file_id,
            ",".join(item.get("tags", [])),
            item.get("description", ""),
            item.get("ocr_snippet", ""),
            item.get("width", 1920),
            item.get("height", 1080),
            bytes(embedding) if embedding else None
        ))
