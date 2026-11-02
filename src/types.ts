export type FileType = 'image' | 'document' | 'video';

export interface AuthorizedFolder {
  id: string;
  name: string;
  path: string;
  status: 'indexed' | 'scanning' | 'idle' | 'error';
  fileCount: number;
  addedAt: string;
  lastScannedAt: string;
}

export interface IndexedFile {
  id: string;
  folderId: string;
  folderPath: string;
  relativePath: string;
  fileName: string;
  fileType: FileType;
  fileExtension: string;
  fileSizeBytes: number;
  contentHash: string;
  perceptualHash: string;
  createdAt: string;
  modifiedAt: string;
  indexedAt: string;
  isAvailable: boolean;
  status: 'indexed' | 'failed' | 'pending';
  errorMessage?: string;
  
  // Duplicate fields
  isDuplicate: boolean;
  primaryFileId?: string;
  duplicateConfidence?: number;

  // Visual & Metadata
  width?: number;
  height?: number;
  durationSeconds?: number;
  pageCount?: number;
  dominantColor?: string;
  tags: string[];
  description: string;
  ocrSnippet?: string;
  embedding?: number[];

  // Endpoint URLs
  thumbnailUrl?: string;
  imageUrl?: string;
}

export interface SearchResultItem {
  file: IndexedFile;
  score: number;
  clipSimilarity: number;
  lexicalScore: number;
  matchedTags: string[];
}

export interface DuplicateGroup {
  hash: string;
  primaryFile: IndexedFile;
  duplicates: IndexedFile[];
  wastedBytes: number;
}

export interface IndexerStatus {
  state: 'idle' | 'indexing' | 'paused' | 'cancelled';
  totalItems: number;
  indexedItems: number;
  failedItems: number;
  duplicateItems: number;
  currentBatch: number;
  totalBatches: number;
  currentFileName: string;
  itemsPerSecond: number;
  etaSeconds: number;
  lastRunStartedAt?: string;
  lastRunCompletedAt?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'success' | 'error';
  category: 'indexer' | 'duplicate' | 'scanner' | 'model' | 'search' | 'system';
  message: string;
}

export interface ModelStatus {
  modelName: string;
  architecture: string;
  version: string;
  status: 'ready' | 'downloading' | 'cached' | 'error';
  fileFormat: string;
  totalSizeBytes: number;
  downloadedBytes: number;
  downloadProgressPercent: number;
  cachePath: string;
  embeddingDimension: number;
  device: string;
  lastVerifiedAt: string;
}

export interface AppSettings {
  autoIndexNewFiles: boolean;
  hybridLexicalWeight: number;
  duplicateSimilarityThreshold: number;
  maxBatchSize: number;
  hardwareAcceleration: 'cpu' | 'cuda' | 'mps';
  skipHiddenFiles: boolean;
  skipSymlinks: boolean;
  thumbnailQuality: 'low' | 'medium' | 'high';
}
