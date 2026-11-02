# LensLocal — AI-Powered Semantic Photo & File Search

LensLocal is a privacy-first, local-only semantic search engine for your personal photos, documents, and videos. It indexes your authorized folders on-device using multimodal CLIP vector embeddings, detects duplicates in real time, and lets you search your files using natural language (e.g. *"snowy mountain peak at sunset"*, *"coffee receipt with total"*, *"code editor screenshot in dark mode"*).

---

## Key Features

1. **Natural Language Semantic Search**:
   - Understands concepts, scenes, lighting, objects, and emotions without pre-existing tags.
   - Combines CLIP text-to-image similarity with lexical keyword & filename matching via a tunable hybrid scoring engine.

2. **Smart Duplicate Detection & Resolution**:
   - Computes SHA-256 and perceptual hashes (`pHash`).
   - Detects duplicates across folders **and within the same batch** without double-indexing or corrupting index state.
   - Groups duplicates, calculates wasted disk bytes, and allows safe removal from index without touching original files on disk.

3. **Incremental Background Indexer**:
   - Recursive directory scanner that respects symlink boundaries and skips system roots.
   - Background worker with real-time progress, pause, resume, cancel, and failed item retry.
   - Mtime/size change tracking: skips unchanged files, re-indexes edited files, and marks missing files as unavailable instead of deleting history.

4. **Safety & Privacy Guarantees**:
   - **100% On-Device**: Zero telemetry, zero external cloud dependencies.
   - **Localhost Only**: Binds strictly to local interfaces.
   - Non-leaking activity logs that record operations without storing sensitive document content.

5. **Model Management**:
   - Standard CLIP `ViT-B/32` model in `safetensors` format (~605 MB).
   - Skips unsafe pickle `.bin` formats.
   - Resumable download, disk space validation, and embedding dimension validation.

---

## Quick Start

### 1. Requirements
- **Node.js**: v18 or newer
- **Python**: v3.10 or newer (for local PyTorch/transformers runtime)

### 2. Windows Installation
Open PowerShell in the project directory and run:
```powershell
.\setup.ps1
```
Then launch:
```powershell
.\run.ps1
```

### 3. Mac & Linux Installation
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
npm install
npm run dev
```

Visit **http://localhost:3000** in your web browser.

---

## Running Tests
Run the test suite:
```bash
python3 -m pytest backend/tests/ -v
```
All 27 test cases pass, verifying:
- Folder authorization & boundary validation
- Recursive scanner symlink avoidance
- In-batch and cross-batch duplicate detection
- Incremental rescanning & status tracking
- Hybrid search relevance & date/file-type filters
- Safe file previews & path traversal guards
