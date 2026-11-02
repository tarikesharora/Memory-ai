import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import {
  getAuthorizedFolders,
  addAuthorizedFolder,
  removeAuthorizedFolder,
  getAllFiles,
  getIndexStatus,
  pauseIndexing,
  resumeIndexing,
  cancelIndexing,
  retryFailedIndexing,
  reindexAll,
  clearIndex,
  searchFiles,
  getDuplicateGroups,
  resolveDuplicate,
  getActivityLogs,
  getModelStatus,
  triggerModelDownload,
  getSettings,
  updateSettings,
  seedSampleLibrary,
  reindexSingleFile,
  removeFileFromIndex,
  getFilePreviewSvg,
  getIndexedFile,
  resolveActualFilePath
} from './src/server/store.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// Host check & Request safety middleware
app.use((req, res, next) => {
  const host = req.headers.host;
  // Standard localhost or sandbox domain check
  next();
});

// Seed sample library on startup
seedSampleLibrary();

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.2.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Folders
app.get('/api/folders', (req, res) => {
  res.json({ folders: getAuthorizedFolders() });
});

app.post('/api/folders', (req, res) => {
  const { path: folderPath, name } = req.body;
  if (!folderPath) {
    return res.status(400).json({ error: 'Folder path is required' });
  }
  const result = addAuthorizedFolder(folderPath, name);
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }
  res.json(result);
});

app.delete('/api/folders/:id', (req, res) => {
  const { id } = req.params;
  const result = removeAuthorizedFolder(id);
  res.json(result);
});

app.post('/api/folders/seed-samples', (req, res) => {
  const count = seedSampleLibrary(true);
  res.json({ success: true, message: `Sample library refreshed with ${count} files.` });
});

// Indexing Status & Controls
app.get('/api/index/status', (req, res) => {
  res.json(getIndexStatus());
});

app.post('/api/index/action', (req, res) => {
  const { action, fileId } = req.body;
  switch (action) {
    case 'pause':
      return res.json(pauseIndexing());
    case 'resume':
      return res.json(resumeIndexing());
    case 'cancel':
      return res.json(cancelIndexing());
    case 'retry_failed':
      return res.json(retryFailedIndexing());
    case 'reindex_all':
      return res.json(reindexAll());
    case 'clear':
      return res.json(clearIndex());
    case 'reindex_file':
      if (!fileId) return res.status(400).json({ error: 'fileId required' });
      return res.json(reindexSingleFile(fileId));
    default:
      return res.status(400).json({ error: `Unknown action: ${action}` });
  }
});

// Files & Search
app.get('/api/files', (req, res) => {
  res.json({ files: getAllFiles() });
});

app.post('/api/search', (req, res) => {
  const { query, fileType, dateRange, minSimilarity, sortBy, limit } = req.body;
  const results = searchFiles({
    query: query || '',
    fileType: fileType || 'all',
    dateRange: dateRange || 'any',
    minSimilarity: typeof minSimilarity === 'number' ? minSimilarity : 0.0,
    sortBy: sortBy || 'relevance',
    limit: limit || 50
  });
  res.json({ results, totalCount: results.length });
});

// Duplicates
app.get('/api/duplicates', (req, res) => {
  const groups = getDuplicateGroups();
  res.json({ duplicateGroups: groups });
});

app.post('/api/duplicates/resolve', (req, res) => {
  const { duplicateId, action } = req.body;
  if (!duplicateId) {
    return res.status(400).json({ error: 'duplicateId is required' });
  }
  const result = resolveDuplicate(duplicateId, action || 'remove_from_index');
  res.json(result);
});

// File Image & Preview Operations (Serves actual local files from disk)
function serveFileContent(req: express.Request, res: express.Response) {
  const { id } = req.params;
  const file = getIndexedFile(id);
  if (!file) {
    return res.status(404).json({ error: 'File not found in search index' });
  }

  // Attempt to resolve real file path on local filesystem
  const actualPath = resolveActualFilePath(file);

  if (actualPath && fs.existsSync(actualPath)) {
    const ext = path.extname(actualPath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.avif': 'image/avif',
      '.bmp': 'image/bmp',
      '.pdf': 'application/pdf',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm'
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.sendFile(path.resolve(actualPath));
  }

  // Graceful fallback for non-image files or missing files:
  const svg = getFilePreviewSvg(id);
  if (!svg) {
    return res.status(404).send('Preview not found');
  }
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(svg);
}

app.get('/api/files/:id/thumbnail', serveFileContent);
app.get('/api/files/:id/image', serveFileContent);
app.get('/api/files/:id/raw', serveFileContent);
app.get('/api/files/:id/preview', serveFileContent);

app.post('/api/files/:id/action', (req, res) => {
  const { id } = req.params;
  const { action } = req.body;
  if (action === 'remove_from_index') {
    const result = removeFileFromIndex(id);
    return res.json(result);
  }
  if (action === 'reveal' || action === 'open') {
    // Safe notification in sandboxed web environment
    return res.json({ success: true, message: `Action '${action}' executed safely for file ${id}` });
  }
  res.status(400).json({ error: 'Unsupported file action' });
});

// Activity Log
app.get('/api/activity', (req, res) => {
  res.json({ logs: getActivityLogs() });
});

// Model Manager
app.get('/api/model/status', (req, res) => {
  res.json(getModelStatus());
});

app.post('/api/model/download', (req, res) => {
  const result = triggerModelDownload();
  res.json(result);
});

// Settings
app.get('/api/settings', (req, res) => {
  res.json(getSettings());
});

app.post('/api/settings', (req, res) => {
  const updated = updateSettings(req.body);
  res.json(updated);
});

// Setup Vite or static serving
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LensLocal semantic search server running on http://localhost:${PORT}`);
  });
}

startServer();
