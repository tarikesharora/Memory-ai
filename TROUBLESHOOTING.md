# LensLocal — Troubleshooting & FAQ Guide

### 1. In-Batch Duplicate Handling
**Issue**: Two copies of the same image in a single folder batch were previously being added twice, throwing off counts and duplicate groups.
**Resolution**: The indexer now tracks in-batch hashes. When a duplicate is detected in the active batch, its duplicate association is deferred until the primary item's embedding is committed to storage. The duplicate is then marked with `is_duplicate = True`, pointing to the primary ID and reusing its embedding vector without redundant GPU/CPU passes.

### 2. Model Download Fails or Hangs
**Issue**: Insufficient disk space or interrupted network connection when downloading the CLIP model.
**Resolution**:
- The model manager performs an upfront disk space check requiring at least 1.5 GB free.
- Uses `safetensors` format (~605 MB) and streams with resumable chunks.
- If a download is interrupted, click **Retry Download** in the Model Manager dashboard or restart the service; partial downloads resume automatically.

### 3. Folder Authorization Rejections
**Issue**: App rejects adding `C:\` or `/` as an authorized folder.
**Resolution**: LensLocal intentionally refuses whole root drives to prevent accidentally indexing operating system files, pagefiles, or protected directories. Select your specific user folders (e.g. `C:\Users\<Name>\Pictures` or `~/Documents`).

### 4. Port 3000 Conflict
**Issue**: `Error: listen EADDRINUSE: address already in use :::3000`.
**Resolution**:
Check what process is using port 3000:
- Windows: `netstat -ano | findstr :3000`
- Linux/Mac: `lsof -i :3000`
Terminate the conflicting process or launch with a custom port: `PORT=3001 npm run dev`.

### 5. Slow Embedding Generation on CPU
**Issue**: High indexing latency when processing large batches on CPU.
**Resolution**:
- In **Settings**, adjust **Batch Size** to 8 or 16.
- Enable AVX2 / MKL optimizations.
- If an NVIDIA GPU is present, PyTorch will automatically utilize CUDA acceleration.
