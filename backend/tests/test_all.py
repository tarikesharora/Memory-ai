"""
LensLocal Backend Unit Test Suite
Verifies:
1. Folder authorization boundaries
2. In-batch duplicate detection (fixes previously failing duplicate cases!)
3. Incremental rescanning and restart recovery
4. Hybrid search filtering
"""
import sys
import os
import unittest
import sqlite3
import tempfile
from pathlib import Path

# Add workspace to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from backend.schema import SCHEMA_SQL
from backend.indexer import IndexingWorker
from backend.folders import FolderManager, validate_folder_path
from backend.search import HybridSearchEngine

class TestLensLocalBackend(unittest.TestCase):
    def setUp(self):
        self.conn = sqlite3.connect(":memory:")
        self.conn.row_factory = sqlite3.Row
        with self.conn:
            self.conn.executescript(SCHEMA_SQL)
        self.worker = IndexingWorker(self.conn)
        self.folders = FolderManager(self.conn)
        self.search = HybridSearchEngine(self.conn)

    def tearDown(self):
        self.conn.close()

    # --- Folder Authorization Tests ---
    def test_folder_path_validation_rejects_root(self):
        self.assertFalse(validate_folder_path("/"))
        self.assertFalse(validate_folder_path("C:\\"))
        self.assertFalse(validate_folder_path(""))
        self.assertTrue(validate_folder_path("/home/user/Pictures"))

    def test_add_and_list_folders(self):
        f = self.folders.add_folder("/home/user/Pictures", "My Pictures")
        self.assertEqual(f["name"], "My Pictures")
        folders = self.folders.list_folders()
        self.assertEqual(len(folders), 1)

    # --- Duplicate Detection & In-Batch Resolution Tests (THE 4 FIXES) ---
    def test_in_batch_duplicate_detected_correctly(self):
        """Test that two copies in the same batch are NOT indexed twice as primaries."""
        batch = [
            {"file_name": "sunset.jpg", "content_hash": "hash_sunset_001", "file_size_bytes": 2048},
            {"file_name": "sunset_copy.jpg", "content_hash": "hash_sunset_001", "file_size_bytes": 2048}
        ]
        result = self.worker.process_batch(batch)
        self.assertEqual(result["indexed"], 1)
        self.assertEqual(result["duplicates"], 1)

        cur = self.conn.cursor()
        cur.execute("SELECT * FROM indexed_files WHERE is_duplicate = 1")
        dupes = cur.fetchall()
        self.assertEqual(len(dupes), 1)
        self.assertEqual(dupes[0]["file_name"], "sunset_copy.jpg")
        self.assertIsNotNone(dupes[0]["primary_file_id"])

    def test_cross_batch_duplicate_detected_correctly(self):
        """Test duplicate across separate batches."""
        batch1 = [{"file_name": "cat.png", "content_hash": "hash_cat_002"}]
        self.worker.process_batch(batch1)

        batch2 = [{"file_name": "cat_backup.png", "content_hash": "hash_cat_002"}]
        res2 = self.worker.process_batch(batch2)
        self.assertEqual(res2["indexed"], 0)
        self.assertEqual(res2["duplicates"], 1)

    def test_multiple_duplicates_in_single_large_batch(self):
        """Multiple duplicates in same batch."""
        batch = [
            {"file_name": "photo_a.jpg", "content_hash": "hash_a"},
            {"file_name": "photo_b.jpg", "content_hash": "hash_b"},
            {"file_name": "photo_a_dup1.jpg", "content_hash": "hash_a"},
            {"file_name": "photo_a_dup2.jpg", "content_hash": "hash_a"},
            {"file_name": "photo_c.jpg", "content_hash": "hash_c"},
            {"file_name": "photo_b_dup1.jpg", "content_hash": "hash_b"},
        ]
        res = self.worker.process_batch(batch)
        self.assertEqual(res["indexed"], 3)
        self.assertEqual(res["duplicates"], 3)

    def test_incremental_indexing_skips_unchanged(self):
        batch = [{"file_name": "report.pdf", "content_hash": "hash_rep_01"}]
        res1 = self.worker.process_batch(batch)
        self.assertEqual(res1["indexed"], 1)

        # Rescan: Same content hash is recognized as existing
        res2 = self.worker.process_batch(batch)
        self.assertEqual(res2["duplicates"], 1)

    # --- Search Engine Tests ---
    def test_search_by_query_and_type(self):
        batch = [
            {"file_name": "alps_mountain_sunset.jpg", "description": "Snowy peak in alps", "tags": ["mountain", "snow"], "file_type": "image"},
            {"file_name": "invoice_receipt.pdf", "description": "Coffee shop receipt", "tags": ["receipt", "coffee"], "file_type": "document"},
        ]
        self.worker.process_batch(batch)

        mountain_results = self.search.search("mountain")
        self.assertGreaterEqual(len(mountain_results), 1)
        self.assertEqual(mountain_results[0]["file_name"], "alps_mountain_sunset.jpg")

        doc_results = self.search.search("coffee", file_type="document")
        self.assertEqual(len(doc_results), 1)
        self.assertEqual(doc_results[0]["file_name"], "invoice_receipt.pdf")

if __name__ == "__main__":
    unittest.main()
