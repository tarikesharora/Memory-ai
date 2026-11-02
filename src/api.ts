import {
  AuthorizedFolder,
  IndexedFile,
  SearchResultItem,
  DuplicateGroup,
  IndexerStatus,
  ActivityLog,
  ModelStatus,
  AppSettings
} from './types.ts';

export async function fetchHealth() {
  const res = await fetch('/api/health');
  return res.json();
}

export async function fetchFolders(): Promise<{ folders: AuthorizedFolder[] }> {
  const res = await fetch('/api/folders');
  return res.json();
}

export async function addFolder(path: string, name?: string): Promise<{ success: boolean; folder?: AuthorizedFolder; error?: string }> {
  const res = await fetch('/api/folders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, name })
  });
  return res.json();
}

export async function removeFolder(folderId: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`/api/folders/${folderId}`, {
    method: 'DELETE'
  });
  return res.json();
}

export async function seedSampleLibrary(): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/folders/seed-samples', { method: 'POST' });
  return res.json();
}

export async function fetchIndexerStatus(): Promise<IndexerStatus> {
  const res = await fetch('/api/index/status');
  return res.json();
}

export async function postIndexerAction(action: string, fileId?: string) {
  const res = await fetch('/api/index/action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, fileId })
  });
  return res.json();
}

export async function searchFiles(params: {
  query?: string;
  fileType?: string;
  dateRange?: string;
  minSimilarity?: number;
  sortBy?: string;
  limit?: number;
}): Promise<{ results: SearchResultItem[]; totalCount: number }> {
  const res = await fetch('/api/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  return res.json();
}

export async function fetchDuplicates(): Promise<{ duplicateGroups: DuplicateGroup[] }> {
  const res = await fetch('/api/duplicates');
  return res.json();
}

export async function resolveDuplicate(duplicateId: string, action: 'remove_from_index' | 'keep_both') {
  const res = await fetch('/api/duplicates/resolve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ duplicateId, action })
  });
  return res.json();
}

export async function fetchActivityLogs(): Promise<{ logs: ActivityLog[] }> {
  const res = await fetch('/api/activity');
  return res.json();
}

export async function fetchModelStatus(): Promise<ModelStatus> {
  const res = await fetch('/api/model/status');
  return res.json();
}

export async function triggerModelDownload() {
  const res = await fetch('/api/model/download', { method: 'POST' });
  return res.json();
}

export async function fetchSettings(): Promise<AppSettings> {
  const res = await fetch('/api/settings');
  return res.json();
}

export async function updateSettings(partial: Partial<AppSettings>): Promise<AppSettings> {
  const res = await fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(partial)
  });
  return res.json();
}

export async function executeFileAction(fileId: string, action: 'reveal' | 'open' | 'remove_from_index') {
  const res = await fetch(`/api/files/${fileId}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action })
  });
  return res.json();
}
