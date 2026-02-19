/**
 * File Upload Service - Production Ready
 * Handles file uploads to server or cloud storage with progress tracking
 */

import { safePost, safeGet } from '../utils/safeFetch';

// File upload configuration
const UPLOAD_BASE_URL = '/api/v1/upload';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const CHUNK_SIZE = 1024 * 1024; // 1MB chunks for large files

// Supported file types
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml'
];

export const SUPPORTED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv'
];

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  speed?: number;
  timeRemaining?: number;
}

export interface UploadResponse {
  success: boolean;
  file?: {
    id: string;
    name: string;
    originalName: string;
    size: number;
    type: string;
    url: string;
    thumbnailUrl?: string;
    uploadedAt: string;
  };
  error?: string;
  message?: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  originalName: string;
  size: number;
  type: string;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: string;
  metadata?: Record<string, any>;
}

export interface UploadOptions {
  folder?: string;
  generateThumbnail?: boolean;
  compress?: boolean;
  maxSize?: number;
  allowedTypes?: string[];
  metadata?: Record<string, any>;
  onProgress?: (progress: UploadProgress) => void;
  signal?: AbortSignal;
}

class FileUploadService {
  private uploadQueue: Map<string, AbortController> = new Map();

  /**
   * Validate file before upload
   */
  private validateFile(file: File, options: UploadOptions): { valid: boolean; error?: string } {
    // Check file size
    const maxSize = options.maxSize || MAX_FILE_SIZE;
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (${(maxSize / 1024 / 1024).toFixed(2)}MB)`
      };
    }

    // Check file type
    if (options.allowedTypes && options.allowedTypes.length > 0) {
      if (!options.allowedTypes.includes(file.type)) {
        return {
          valid: false,
          error: `File type ${file.type} is not allowed. Allowed types: ${options.allowedTypes.join(', ')}`
        };
      }
    }

    return { valid: true };
  }

  /**
   * Create thumbnail for image files
   */
  private createThumbnail(file: File): Promise<string | undefined> {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve(undefined);
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate thumbnail dimensions (max 200x200)
        const maxSize = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        } else {
          resolve(undefined);
        }
      };

      img.onerror = () => resolve(undefined);
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Upload file with progress tracking
   */
  async uploadFile(file: File, options: UploadOptions = {}): Promise<UploadResponse> {
    const uploadId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const controller = new AbortController();
    this.uploadQueue.set(uploadId, controller);

    try {
      // Validate file
      const validation = this.validateFile(file, options);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Create thumbnail if requested and it's an image
      let thumbnailUrl: string | undefined;
      if (options.generateThumbnail && file.type.startsWith('image/')) {
        thumbnailUrl = await this.createThumbnail(file);
      }

      // Prepare form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', options.folder || 'general');
      formData.append('generateThumbnail', String(options.generateThumbnail || false));
      formData.append('compress', String(options.compress || false));
      
      if (options.metadata) {
        formData.append('metadata', JSON.stringify(options.metadata));
      }

      // Upload file
      const response = await fetch(`${UPLOAD_BASE_URL}/file`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Upload failed with status ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Add thumbnail if generated locally
        if (thumbnailUrl && !result.file.thumbnailUrl) {
          result.file.thumbnailUrl = thumbnailUrl || undefined;
        }

        return {
          success: true,
          file: result.file
        };
      } else {
        return {
          success: false,
          error: result.message || 'Upload failed'
        };
      }
    } catch (error) {
      console.error('File upload error:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Upload was cancelled'
          };
        }
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: false,
        error: 'Unknown upload error'
      };
    } finally {
      this.uploadQueue.delete(uploadId);
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    files: File[], 
    options: UploadOptions = {}
  ): Promise<{ results: UploadResponse[]; errors: string[] }> {
    const results: UploadResponse[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileOptions = {
        ...options,
        onProgress: (progress: UploadProgress) => {
          // Calculate overall progress
          const overallProgress = ((i + progress.percentage / 100) / files.length) * 100;
          options.onProgress?.({
            ...progress,
            percentage: overallProgress
          });
        }
      };

      try {
        const result = await this.uploadFile(file, fileOptions);
        results.push(result);
        
        if (!result.success) {
          errors.push(`File ${file.name}: ${result.error}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        errors.push(`File ${file.name}: ${errorMessage}`);
        results.push({
          success: false,
          error: errorMessage
        });
      }
    }

    return { results, errors };
  }

  /**
   * Upload with chunking for large files
   */
  async uploadLargeFile(
    file: File, 
    options: UploadOptions = {}
  ): Promise<UploadResponse> {
    const uploadId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const controller = new AbortController();
    this.uploadQueue.set(uploadId, controller);

    try {
      // Validate file
      const validation = this.validateFile(file, options);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Initialize upload
      const initResponse = await safePost(`${UPLOAD_BASE_URL}/init`, {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        folder: options.folder || 'general',
        metadata: options.metadata || {}
      });

      if (!initResponse.success || !initResponse.data) {
        return {
          success: false,
          error: initResponse.error || 'Failed to initialize upload'
        };
      }

      const { uploadId: serverUploadId, uploadUrl } = initResponse.data;

      // Upload chunks
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      let uploadedChunks = 0;

      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        const chunkFormData = new FormData();
        chunkFormData.append('chunk', chunk);
        chunkFormData.append('chunkIndex', String(chunkIndex));
        chunkFormData.append('totalChunks', String(totalChunks));
        chunkFormData.append('uploadId', serverUploadId);

        const chunkResponse = await fetch(uploadUrl, {
          method: 'POST',
          body: chunkFormData,
          signal: controller.signal,
        });

        if (!chunkResponse.ok) {
          throw new Error(`Chunk ${chunkIndex} upload failed`);
        }

        uploadedChunks++;
        
        // Report progress
        const percentage = (uploadedChunks / totalChunks) * 100;
        options.onProgress?.({
          loaded: uploadedChunks * CHUNK_SIZE,
          total: file.size,
          percentage
        });
      }

      // Complete upload
      const completeResponse = await safePost(`${UPLOAD_BASE_URL}/complete`, {
        uploadId: serverUploadId
      });

      if (completeResponse.success && completeResponse.data) {
        return {
          success: true,
          file: completeResponse.data.file
        };
      } else {
        return {
          success: false,
          error: completeResponse.error || 'Failed to complete upload'
        };
      }
    } catch (error) {
      console.error('Large file upload error:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Upload was cancelled'
          };
        }
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: false,
        error: 'Unknown upload error'
      };
    } finally {
      this.uploadQueue.delete(uploadId);
    }
  }

  /**
   * Cancel upload
   */
  cancelUpload(uploadId: string): boolean {
    const controller = this.uploadQueue.get(uploadId);
    if (controller) {
      controller.abort();
      this.uploadQueue.delete(uploadId);
      return true;
    }
    return false;
  }

  /**
   * Delete uploaded file
   */
  async deleteFile(fileId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await safePost(`${UPLOAD_BASE_URL}/delete`, { fileId });
      
      if (response.success) {
        return { success: true };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to delete file'
        };
      }
    } catch (error) {
      console.error('Delete file error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed'
      };
    }
  }

  /**
   * Get uploaded file info
   */
  async getFileInfo(fileId: string): Promise<{ success: boolean; file?: UploadedFile; error?: string }> {
    try {
      const response = await safeGet(`${UPLOAD_BASE_URL}/file/${fileId}`);
      
      if (response.success && response.data) {
        return {
          success: true,
          file: response.data
        };
      } else {
        return {
          success: false,
          error: response.error || 'File not found'
        };
      }
    } catch (error) {
      console.error('Get file info error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get file info'
      };
    }
  }

  /**
   * Get user's uploaded files
   */
  async getUserFiles(
    folder?: string, 
    page: number = 1, 
    limit: number = 20
  ): Promise<{ success: boolean; files?: UploadedFile[]; total?: number; error?: string }> {
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit)
      });
      
      if (folder) {
        params.append('folder', folder);
      }

      const response = await safeGet(`${UPLOAD_BASE_URL}/files?${params}`);
      
      if (response.success && response.data) {
        return {
          success: true,
          files: response.data.files,
          total: response.data.total
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to get files'
        };
      }
    } catch (error) {
      console.error('Get user files error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get files'
      };
    }
  }

  /**
   * Get file URL for display
   */
  getFileUrl(file: UploadedFile): string {
    return file.url;
  }

  /**
   * Get thumbnail URL
   */
  getThumbnailUrl(file: UploadedFile): string | null {
    return file.thumbnailUrl || null;
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get file extension
   */
  getFileExtension(filename: string): string {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  }

  /**
   * Check if file is an image
   */
  isImageFile(file: File | UploadedFile): boolean {
    const mimeType = file.type;
    return mimeType.startsWith('image/');
  }

  /**
   * Check if file is a document
   */
  isDocumentFile(file: File | UploadedFile): boolean {
    const mimeType = file.type;
    return SUPPORTED_DOCUMENT_TYPES.includes(mimeType);
  }
}

// Export singleton instance
export const fileUploadService = new FileUploadService();
