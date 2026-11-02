# LensLocal — System Architecture

LensLocal is designed around a decoupled, local-first multimodal indexing and retrieval pipeline.

```
┌────────────────────────────────────────────────────────┐
│                   React Frontend UI                    │
│   (Search Bar, Duplicate Hub, Indexer Controls, EXIF)   │
└───────────────────────────┬────────────────────────────┘
                            │ REST / JSON (port 3000)
┌───────────────────────────▼────────────────────────────┐
│                  Express & FastAPI API                  │
├────────────────────────────────────────────────────────┤
│  • Folder Authorization Guard & Boundary Validator     │
│  • Background Indexing Worker & Batch Scheduler         │
│  • Safe In-Batch & Cross-Batch Duplicate Detector      │
│  • Multimodal CLIP Embedder (ViT-B/32 safetensors)     │
│  • Cosine + Lexical Hybrid Search Scorer               │
│  • SQLite Storage & In-Memory Vector Matrix            │
└───────────────────────────┬────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
      Authorized Folders           SQLite & Cache
      (Original Files)         (Embeddings & Metadata)
```

## Core Subsystems

### 1. Folder Scanner & Authorization Guard
- Restricts file access strictly to user-whitelisted folders.
- Prevents directory traversal attacks (`../`) and rejects system root paths.
- Skips symlinks and NTFS junctions to avoid infinite recursive loops.

### 2. In-Batch Duplicate Resolution Algorithm
```python
# Pseudo-code of in-batch duplicate resolution:
batch_seen_hashes = {}
deferred_duplicates = []

for file in batch:
    hash = compute_sha256(file)
    if hash in batch_seen_hashes:
        # Detected duplicate within this active batch!
        deferred_duplicates.append((file, hash))
    elif hash in global_db_hashes:
        # Duplicate of already stored file
        mark_duplicate_now(file, primary_id=global_db_hashes[hash])
    else:
        primary_record = save_primary(file)
        generate_and_store_embedding(primary_record)
        batch_seen_hashes[hash] = primary_record.id

# Resolve deferred duplicates against the primary items indexed in this batch
for file, hash in deferred_duplicates:
    primary_id = batch_seen_hashes[hash]
    mark_duplicate(file, primary_id=primary_id, reuse_embedding_from=primary_id)
```

### 3. Hybrid Scoring Formula
The search retrieval blends multimodal semantic embeddings with keyword signals:

$$\text{FinalScore} = (1 - \alpha) \cdot \cos(\vec{q}, \vec{v}_{\text{image}}) + \alpha \cdot \text{LexicalMatch}(\text{query}, \text{metadata})$$

Where $\alpha \in [0.0, 1.0]$ is the configurable hybrid weight (default $0.25$).
