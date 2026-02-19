/**
 * Health Document Upload Component - Production Ready
 * Handles health document uploads with preview and management
 */

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, X, FileText, Download, Eye, Trash2, AlertCircle, 
  Loader2, Clock 
} from 'lucide-react';
import { fileUploadService, type UploadProgress, SUPPORTED_DOCUMENT_TYPES } from '../services/fileUploadService';
import { GradientButton } from './ui/ModernButton';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { fadeInUpVariants, scaleUpVariants } from '../../lib/animations';

interface HealthDocumentUploadProps {
  petId?: string;
  currentDocuments?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    uploadedAt: string;
    category?: string;
    expiryDate?: string;
  }>;
  onDocumentsChange?: (documents: any[]) => void;
  onUploadComplete?: (file: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  uploadedAt: string;
  category?: string;
  expiryDate?: string;
  uploading?: boolean;
  progress?: number;
  error?: string;
}

const DOCUMENT_CATEGORIES = [
  { value: 'vaccination', label: 'Vaccination Records' },
  { value: 'health-check', label: 'Health Check' },
  { value: 'genetic-test', label: 'Genetic Test' },
  { value: 'breeding-certificate', label: 'Breeding Certificate' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'other', label: 'Other' },
];

export function HealthDocumentUpload({
  petId,
  currentDocuments = [],
  onDocumentsChange,
  onUploadComplete,
  onError,
  className = ''
}: HealthDocumentUploadProps) {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('health-check');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<UploadedDocument | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize with current documents
  useState(() => {
    if (currentDocuments.length > 0) {
      const initialDocs: UploadedDocument[] = currentDocuments.map(doc => ({
        ...doc,
        size: 0, // Default size for existing documents
        uploading: false
      }));
      setDocuments(initialDocs);
    }
  });

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter(file => {
      if (!SUPPORTED_DOCUMENT_TYPES.includes(file.type)) {
        onError?.(`File ${file.name} is not a supported document type`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        onError?.(`File ${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    uploadFiles(validFiles);
  }, [onError]);

  const uploadFiles = async (files: File[]) => {
    setUploading(true);

    for (const file of files) {
      const tempId = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Add temporary document entry
      const tempDoc: UploadedDocument = {
        id: tempId,
        name: file.name,
        type: file.type,
        url: '',
        size: file.size,
        uploadedAt: new Date().toISOString(),
        category: selectedCategory,
        expiryDate: expiryDate || undefined,
        uploading: true,
        progress: 0
      };

      setDocuments(prev => [...prev, tempDoc]);

      try {
        const response = await fileUploadService.uploadFile(file, {
          folder: 'health-documents',
          maxSize: 10 * 1024 * 1024,
          allowedTypes: SUPPORTED_DOCUMENT_TYPES,
          metadata: {
            petId,
            category: selectedCategory,
            expiryDate: expiryDate || null,
            uploadedAt: new Date().toISOString()
          },
          onProgress: (progress: UploadProgress) => {
            setDocuments(prev => prev.map(doc => 
              doc.id === tempId 
                ? { ...doc, progress: progress.percentage }
                : doc
            ));
          }
        });

        // Replace temporary document with uploaded one
        if (response.success && response.file) {
          const uploadedDoc: UploadedDocument = {
            id: response.file.id,
            name: response.file.name,
            type: response.file.type,
            url: response.file.url,
            size: response.file.size,
            uploadedAt: response.file.uploadedAt,
            category: selectedCategory,
            expiryDate: expiryDate || undefined,
            uploading: false
          };

          setDocuments(prev => prev.map(doc => 
            doc.id === tempId ? uploadedDoc : doc
          ));

          onUploadComplete?.(response.file);
        } else {
          // Mark as failed
          setDocuments(prev => prev.map(doc => 
            doc.id === tempId 
              ? { ...doc, uploading: false, error: response.error || 'Upload failed' }
              : doc
          ));
          onError?.(response.error || `Failed to upload ${file.name}`);
        }
      } catch (error) {
        setDocuments(prev => prev.map(doc => 
          doc.id === tempId 
            ? { ...doc, uploading: false, error: 'Upload failed' }
            : doc
        ));
        onError?.(`Failed to upload ${file.name}`);
      }
    }

    setUploading(false);
    updateDocumentsChange();
  };

  const updateDocumentsChange = useCallback(() => {
    const validDocs = documents.filter(doc => !doc.uploading && !doc.error);
    onDocumentsChange?.(validDocs);
  }, [documents, onDocumentsChange]);

  const removeDocument = useCallback((docId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
    
    if (previewDocument?.id === docId) {
      setPreviewDocument(null);
    }
    
    updateDocumentsChange();
  }, [previewDocument, updateDocumentsChange]);

  const retryUpload = useCallback((docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (doc && doc.error) {
      // Remove failed document and let user re-upload
      removeDocument(docId);
    }
  }, [documents, removeDocument]);

  const downloadDocument = useCallback((doc: UploadedDocument) => {
    const link = document.createElement('a');
    link.href = doc.url;
    link.download = doc.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    return expiry < new Date();
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Controls */}
      <motion.div
        variants={fadeInUpVariants}
        initial="initial"
        animate="animate"
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Upload Health Documents
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="category">Document Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_CATEGORIES.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date (Optional)</Label>
              <Input
                id="expiry"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                placeholder="Select expiry date"
              />
            </div>
          </div>

          <Card 
            className={`border-2 border-dashed transition-all duration-300 ${
              isDragging 
                ? 'border-indigo-500 bg-indigo-50' 
                : 'border-gray-300 hover:border-gray-400'
            } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="p-6 text-center">
              <motion.div
                className="w-12 h-12 mx-auto mb-3 rounded-full bg-indigo-100 flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
              >
                <Upload className="w-6 h-6 text-indigo-600" />
              </motion.div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">
                  Drag and drop documents here
                </p>
                <p className="text-xs text-gray-600">
                  or click to select files
                </p>
                <p className="text-xs text-gray-500">
                  PDF, DOC, DOCX, XLS, XLSX up to 10MB
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />

              <GradientButton
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                size="sm"
                className="mt-3"
              >
                <FileText className="w-4 h-4 mr-2" />
                Select Documents
              </GradientButton>
            </div>
          </Card>
        </Card>
      </motion.div>

      {/* Documents List */}
      {documents.length > 0 && (
        <motion.div
          variants={fadeInUpVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Health Documents ({documents.length})
              </h3>
              <Badge variant="outline">
                {documents.filter(doc => !doc.uploading && !doc.error).length} Uploaded
              </Badge>
            </div>

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {documents.map((doc) => (
                  <motion.div
                    key={doc.id}
                    layout
                    variants={scaleUpVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <Card className={`border transition-all duration-300 ${
                      doc.error ? 'border-red-200 bg-red-50' : 
                      doc.uploading ? 'border-yellow-200 bg-yellow-50' : 
                      'border-gray-200 hover:border-indigo-300'
                    }`}>
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <FileText className="w-5 h-5 text-gray-600" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-gray-900 truncate">
                                  {doc.name}
                                </h4>
                                {doc.category && (
                                  <Badge variant="secondary" className="text-xs">
                                    {DOCUMENT_CATEGORIES.find(c => c.value === doc.category)?.label}
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                                <span>{fileUploadService.formatFileSize(doc.size)}</span>
                                <span>•</span>
                                <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                {doc.expiryDate && (
                                  <>
                                    <span>•</span>
                                    <span className={`flex items-center gap-1 ${
                                      isExpired(doc.expiryDate) ? 'text-red-600' :
                                      isExpiringSoon(doc.expiryDate) ? 'text-yellow-600' : ''
                                    }`}>
                                      <Clock className="w-3 h-3" />
                                      Expires: {new Date(doc.expiryDate).toLocaleDateString()}
                                    </span>
                                  </>
                                )}
                              </div>

                              {/* Upload Progress */}
                              {doc.uploading && (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 text-yellow-600 animate-spin" />
                                    <span className="text-sm text-yellow-600">
                                      Uploading... {doc.progress || 0}%
                                    </span>
                                  </div>
                                  <Progress value={doc.progress || 0} className="h-2" />
                                </div>
                              )}

                              {/* Error Message */}
                              {doc.error && (
                                <div className="flex items-center gap-2 text-red-600 text-sm">
                                  <AlertCircle className="w-4 h-4" />
                                  <span>{doc.error}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            {!doc.uploading && !doc.error && (
                              <>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => setPreviewDocument(doc)}
                                  className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                                >
                                  <Eye className="w-4 h-4" />
                                </motion.button>
                                
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => downloadDocument(doc)}
                                  className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                                >
                                  <Download className="w-4 h-4" />
                                </motion.button>
                              </>
                            )}
                            
                            {doc.error && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => retryUpload(doc.id)}
                                className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200"
                              >
                                <AlertCircle className="w-4 h-4" />
                              </motion.button>
                            )}
                            
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => removeDocument(doc.id)}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Document Preview Modal */}
      <AnimatePresence>
        {previewDocument && (
          <motion.div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewDocument(null)}
          >
            <motion.div
              className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full overflow-hidden"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{previewDocument.name}</h3>
                  <p className="text-sm text-gray-500">
                    {fileUploadService.formatFileSize(previewDocument.size)}
                  </p>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setPreviewDocument(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
              
              <div className="p-4">
                <iframe
                  src={previewDocument.url}
                  className="w-full h-[60vh] border rounded"
                  title={previewDocument.name}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
