/**
 * File Manager Component - Production Ready
 * Centralized file management with preview, organization, and bulk operations
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Grid, List, Download, Trash2, Eye, 
  Upload, FolderOpen, Calendar, FileText, Image as ImageIcon,
  MoreVertical, CheckCircle, AlertCircle, Loader2
} from 'lucide-react';
import { fileUploadService, type UploadedFile } from '../services/fileUploadService';
import { GradientButton } from './ui/ModernButton';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Checkbox } from './ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { fadeInUpVariants, scaleUpVariants } from '../../lib/animations';

interface FileManagerProps {
  folder?: string;
  onFileSelect?: (file: UploadedFile) => void;
  className?: string;
}

interface FileWithSelection extends UploadedFile {
  selected: boolean;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'date' | 'size' | 'type';
type FilterType = 'all' | 'image' | 'document';

export function FileManager({
  folder = 'general',
  onFileSelect,
  className = ''
}: FileManagerProps) {
  const [files, setFiles] = useState<FileWithSelection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const pageSize = 20;

  // Load files
  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fileUploadService.getUserFiles(folder, page, pageSize);
      
      if (response.success && response.files) {
        const filesWithSelection: FileWithSelection[] = response.files.map(file => ({
          ...file,
          selected: false
        }));
        
        setFiles(filesWithSelection);
        setTotalPages(Math.ceil((response.total || 0) / pageSize));
      } else {
        setError(response.error || 'Failed to load files');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load files');
    } finally {
      setLoading(false);
    }
  }, [folder, page]);

  // Initial load
  useState(() => {
    loadFiles();
  });

  // Filter and sort files
  const filteredAndSortedFiles = files
    .filter(file => {
      // Search filter
      if (searchQuery && !file.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Type filter
      if (filterType === 'image' && !fileUploadService.isImageFile(file)) {
        return false;
      }
      if (filterType === 'document' && !fileUploadService.isDocumentFile(file)) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        case 'size':
          return b.size - a.size;
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

  const handleFileSelect = useCallback((file: FileWithSelection) => {
    onFileSelect?.(file);
  }, [onFileSelect]);

  const handleFileDelete = async (fileId: string) => {
    try {
      const response = await fileUploadService.deleteFile(fileId);
      
      if (response.success) {
        setFiles(prev => prev.filter(f => f.id !== fileId));
      } else {
        setError(response.error || 'Failed to delete file');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete file');
    }
  }, [files]);

  const handleFileDownload = useCallback((file: UploadedFile) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const handleBulkDelete = async () => {
    const filesToDelete = Array.from(selectedFiles);
    
    for (const fileId of filesToDelete) {
      await handleFileDelete(fileId);
    }
    
    setSelectedFiles(new Set());
  };

  const handleSelectAll = useCallback(() => {
    if (selectedFiles.size === filteredAndSortedFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filteredAndSortedFiles.map(f => f.id)));
    }
  }, [selectedFiles, filteredAndSortedFiles]);

  const toggleFileSelection = useCallback((fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  }, []);

  const getFileIcon = (file: UploadedFile) => {
    if (fileUploadService.isImageFile(file)) {
      return <ImageIcon className="w-5 h-5 text-green-600" />;
    }
    return <FileText className="w-5 h-5 text-blue-600" />;
  };

  const getFileTypeColor = (file: UploadedFile) => {
    if (fileUploadService.isImageFile(file)) {
      return 'border-green-200 bg-green-50';
    }
    return 'border-blue-200 bg-blue-50';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <motion.div
        variants={fadeInUpVariants}
        initial="initial"
        animate="animate"
      >
        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">File Manager</h2>
              <p className="text-sm text-gray-600">
                {filteredAndSortedFiles.length} files • {selectedFiles.size} selected
              </p>
            </div>

            <div className="flex items-center gap-3">
              <GradientButton onClick={() => {}}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </GradientButton>
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="flex flex-col md:flex-row gap-4 mt-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filter */}
            <Select value={filterType} onValueChange={(value: FilterType) => setFilterType(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Files</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="size">Size</SelectItem>
                <SelectItem value="type">Type</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none border-r-0"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {/* Bulk Actions */}
            {selectedFiles.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {selectedFiles.size} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            variants={fadeInUpVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Files Grid/List */}
      <motion.div
        variants={fadeInUpVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.1 }}
      >
        {loading ? (
          <Card className="p-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading files...</p>
            </div>
          </Card>
        ) : filteredAndSortedFiles.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No files found</h3>
              <p className="text-gray-600">
                {searchQuery ? 'Try adjusting your search or filters' : 'Upload some files to get started'}
              </p>
            </div>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredAndSortedFiles.map((file) => (
                <motion.div
                  key={file.id}
                  layout
                  variants={scaleUpVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <Card className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    file.selected ? 'ring-2 ring-indigo-500' : ''
                  } ${getFileTypeColor(file)}`}
                  onClick={() => handleFileSelect(file)}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Checkbox
                        checked={file.selected}
                        onCheckedChange={(checked) => {
                          setFiles(prev => prev.map(f => 
                            f.id === file.id ? { ...f, selected: checked } : f
                          ));
                          toggleFileSelection(file.id);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleFileDownload(file); }}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => { e.stopPropagation(); handleFileDelete(file.id); }}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* File Preview */}
                    <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                      {fileUploadService.isImageFile(file) ? (
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        getFileIcon(file)
                      )}
                    </div>

                    {/* File Info */}
                    <div className="space-y-1">
                      <h4 className="font-medium text-sm text-gray-900 truncate">
                        {file.name}
                      </h4>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{fileUploadService.formatFileSize(file.size)}</span>
                        <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <Card>
            <div className="divide-y">
              <AnimatePresence mode="popLayout">
                {filteredAndSortedFiles.map((file) => (
                  <motion.div
                    key={file.id}
                    layout
                    variants={scaleUpVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      file.selected ? 'bg-indigo-50' : ''
                    }`}
                    onClick={() => handleFileSelect(file)}
                  >
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={file.selected}
                        onCheckedChange={(checked) => {
                          setFiles(prev => prev.map(f => 
                            f.id === file.id ? { ...f, selected: checked } : f
                          ));
                          toggleFileSelection(file.id);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getFileTypeColor(file)}`}>
                          {getFileIcon(file)}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 truncate">
                            {file.name}
                          </h4>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleFileDownload(file); }}>
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={(e) => { e.stopPropagation(); handleFileDelete(file.id); }}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{fileUploadService.formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>{file.type}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(file.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            variants={fadeInUpVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-2"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Button
                  key={p}
                  variant={page === p ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPage(p)}
                  className="w-8 h-8 p-0"
                >
                  {p}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
