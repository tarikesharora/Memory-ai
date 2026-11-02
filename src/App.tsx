import React, { useState, useEffect, useCallback } from 'react';
import {
  AuthorizedFolder,
  IndexedFile,
  SearchResultItem,
  DuplicateGroup,
  IndexerStatus,
  ActivityLog,
  ModelStatus,
  FileType
} from './types.ts';
import {
  fetchFolders,
  addFolder,
  removeFolder,
  seedSampleLibrary,
  fetchIndexerStatus,
  postIndexerAction,
  searchFiles,
  fetchDuplicates,
  resolveDuplicate,
  fetchActivityLogs,
  fetchModelStatus,
  triggerModelDownload,
  executeFileAction
} from './api.ts';
import { Header, ActiveTab } from './components/Header.tsx';
import { SearchHero } from './components/SearchHero.tsx';
import { FileGrid } from './components/FileGrid.tsx';
import { FileList } from './components/FileList.tsx';
import { DuplicatesHub } from './components/DuplicatesHub.tsx';
import { IndexingDashboard } from './components/IndexingDashboard.tsx';
import { FolderManager } from './components/FolderManager.tsx';
import { ModelManager } from './components/ModelManager.tsx';
import { ActivityLogView } from './components/ActivityLogView.tsx';
import { FileInspectorModal } from './components/FileInspectorModal.tsx';
import { AddFolderModal } from './components/AddFolderModal.tsx';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('search');

  // Search & Filter State
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [dateRange, setDateRange] = useState('any');
  const [minSimilarity, setMinSimilarity] = useState(0.0);
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Data States
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [folders, setFolders] = useState<AuthorizedFolder[]>([]);
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [indexerStatus, setIndexerStatus] = useState<IndexerStatus>({
    state: 'idle',
    totalItems: 0,
    indexedItems: 0,
    failedItems: 0,
    duplicateItems: 0,
    currentBatch: 0,
    totalBatches: 0,
    currentFileName: '',
    itemsPerSecond: 18.5,
    etaSeconds: 0
  });
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [modelStatus, setModelStatus] = useState<ModelStatus>({
    modelName: 'openai/clip-vit-base-patch32',
    architecture: 'ViT-B/32',
    version: 'safetensors-v1.4',
    status: 'ready',
    fileFormat: 'safetensors',
    totalSizeBytes: 605000000,
    downloadedBytes: 605000000,
    downloadProgressPercent: 100,
    cachePath: '~/.cache/lenslocal/models/clip-vit-base-patch32.safetensors',
    embeddingDimension: 512,
    device: 'CPU (AVX2 optimized)',
    lastVerifiedAt: new Date().toISOString()
  });

  const [isSearching, setIsSearching] = useState(false);
  const [selectedFile, setSelectedFile] = useState<IndexedFile | null>(null);
  const [isAddFolderOpen, setIsAddFolderOpen] = useState(false);

  // Load all initial data
  const loadInitialData = useCallback(async () => {
    try {
      const [foldersRes, duplicatesRes, statusRes, logsRes, modelRes] = await Promise.all([
        fetchFolders(),
        fetchDuplicates(),
        fetchIndexerStatus(),
        fetchActivityLogs(),
        fetchModelStatus()
      ]);

      if (foldersRes?.folders) setFolders(foldersRes.folders);
      if (duplicatesRes?.duplicateGroups) setDuplicateGroups(duplicatesRes.duplicateGroups);
      if (statusRes) setIndexerStatus(statusRes);
      if (logsRes?.logs) setActivityLogs(logsRes.logs);
      if (modelRes) setModelStatus(modelRes);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  }, []);

  // Execute search
  const performSearch = useCallback(async () => {
    setIsSearching(true);
    try {
      const res = await searchFiles({
        query,
        fileType: selectedType,
        dateRange,
        minSimilarity,
        sortBy
      });
      if (res?.results) {
        setSearchResults(res.results);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  }, [query, selectedType, dateRange, minSimilarity, sortBy]);

  // Initial load
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Re-run search when filters or query change
  useEffect(() => {
    performSearch();
  }, [performSearch]);

  // Background polling for indexer status and logs
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [statusRes, logsRes] = await Promise.all([
          fetchIndexerStatus(),
          fetchActivityLogs()
        ]);
        if (statusRes) setIndexerStatus(statusRes);
        if (logsRes?.logs) setActivityLogs(logsRes.logs);
      } catch {
        // silent polling catch
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // File Handlers
  const handleReindexFile = async (fileId: string) => {
    await postIndexerAction('reindex_file', fileId);
    await performSearch();
    await loadInitialData();
  };

  const handleRemoveFile = async (fileId: string) => {
    await executeFileAction(fileId, 'remove_from_index');
    await performSearch();
    await loadInitialData();
  };

  const handleResolveDuplicate = async (dupId: string, action: 'remove_from_index' | 'keep_both') => {
    await resolveDuplicate(dupId, action);
    const dupRes = await fetchDuplicates();
    if (dupRes?.duplicateGroups) setDuplicateGroups(dupRes.duplicateGroups);
    await performSearch();
    await loadInitialData();
  };

  const handleIndexerAction = async (action: string) => {
    const res = await postIndexerAction(action);
    const statusRes = await fetchIndexerStatus();
    if (statusRes) setIndexerStatus(statusRes);
    await performSearch();
    await loadInitialData();
    return res;
  };

  const handleRefreshSampleLibrary = async () => {
    await seedSampleLibrary();
    await loadInitialData();
    await performSearch();
  };

  const handleAddFolder = async (path: string, name?: string) => {
    const res = await addFolder(path, name);
    if (res.success) {
      await loadInitialData();
      await performSearch();
    }
    return res;
  };

  const handleRemoveFolder = async (id: string) => {
    const res = await removeFolder(id);
    if (res.success) {
      await loadInitialData();
      await performSearch();
    }
    return res;
  };

  const handleModelDownload = async () => {
    const res = await triggerModelDownload();
    const modelRes = await fetchModelStatus();
    if (modelRes) setModelStatus(modelRes);
    return res;
  };

  const totalDuplicatesCount = duplicateGroups.reduce(
    (acc, g) => acc + g.duplicates.length,
    0
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-200">
      {/* Top Navigation Bar */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddFolderClick={() => setIsAddFolderOpen(true)}
        duplicateCount={totalDuplicatesCount}
        isIndexing={indexerStatus.state === 'indexing'}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 space-y-6">
        {/* Search & Browse View */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            <SearchHero
              query={query}
              onQueryChange={setQuery}
              onSearchSubmit={performSearch}
              selectedType={selectedType}
              onTypeChange={setSelectedType}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              minSimilarity={minSimilarity}
              onMinSimilarityChange={setMinSimilarity}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              totalResults={searchResults.length}
              isSearching={isSearching}
            />

            {/* Results Counter Strip */}
            <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
              <div>
                <span>{searchResults.length} items found</span>
                {query && (
                  <span className="text-neutral-500 ml-1">
                    for query &ldquo;{query}&rdquo;
                  </span>
                )}
              </div>
              <div className="text-[11px] text-neutral-500">
                Hybrid CLIP score: 75% visual semantics + 25% lexical tags
              </div>
            </div>

            {/* Results Grid or List */}
            {viewMode === 'grid' ? (
              <FileGrid
                results={searchResults}
                onSelectFile={setSelectedFile}
                onReindexFile={handleReindexFile}
                onRemoveFile={handleRemoveFile}
              />
            ) : (
              <FileList
                results={searchResults}
                onSelectFile={setSelectedFile}
                onReindexFile={handleReindexFile}
                onRemoveFile={handleRemoveFile}
              />
            )}
          </div>
        )}

        {/* Duplicates Hub */}
        {activeTab === 'duplicates' && (
          <DuplicatesHub
            groups={duplicateGroups}
            onResolve={handleResolveDuplicate}
            onSelectFile={setSelectedFile}
          />
        )}

        {/* Indexing Worker Dashboard */}
        {activeTab === 'indexer' && (
          <IndexingDashboard
            status={indexerStatus}
            onAction={handleIndexerAction}
            onRefreshSampleLibrary={handleRefreshSampleLibrary}
          />
        )}

        {/* Authorized Folders */}
        {activeTab === 'folders' && (
          <FolderManager
            folders={folders}
            onAddFolderClick={() => setIsAddFolderOpen(true)}
            onRemoveFolder={handleRemoveFolder}
          />
        )}

        {/* Model Manager */}
        {activeTab === 'model' && (
          <ModelManager
            modelStatus={modelStatus}
            onDownload={handleModelDownload}
          />
        )}

        {/* Activity Logs */}
        {activeTab === 'activity' && (
          <ActivityLogView logs={activityLogs} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 py-6 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-400">LensLocal</span>
            <span>·</span>
            <span>Privacy-first multimodal vector search engine</span>
          </div>
          <div className="font-mono text-[11px]">
            100% On-Device · Zero Telemetry · Localhost Only
          </div>
        </div>
      </footer>

      {/* Modals */}
      <FileInspectorModal
        file={selectedFile}
        onClose={() => setSelectedFile(null)}
        onReindexFile={handleReindexFile}
        onRemoveFile={handleRemoveFile}
      />

      <AddFolderModal
        isOpen={isAddFolderOpen}
        onClose={() => setIsAddFolderOpen(false)}
        onAddFolder={handleAddFolder}
      />
    </div>
  );
}
