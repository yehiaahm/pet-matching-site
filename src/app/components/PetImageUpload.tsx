/**
 * Pet Image Upload Component - Production Ready
 * Handles pet image uploads with preview, cropping, and management
 */

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, X, Camera, ZoomIn, 
  RotateCw, Trash2, Check, AlertCircle, Loader2 
} from 'lucide-react';
import { fileUploadService, type UploadProgress, SUPPORTED_IMAGE_TYPES } from '../services/fileUploadService';
import { GradientButton } from './ui/ModernButton';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { fadeInUpVariants, scaleUpVariants } from '../../lib/animations';

interface PetImageUploadProps {
  petId?: string;
  currentImages?: string[];
  maxImages?: number;
  onImagesChange?: (images: string[]) => void;
  onUploadComplete?: (file: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

interface UploadedImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  name: string;
  size: number;
  isPrimary?: boolean;
  uploading?: boolean;
  progress?: number;
  error?: string;
}

export function PetImageUpload({
  petId,
  currentImages = [],
  maxImages = 10,
  onImagesChange,
  onUploadComplete,
  onError,
  className = ''
}: PetImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize with current images
  useState(() => {
    if (currentImages.length > 0) {
      const initialImages: UploadedImage[] = currentImages.map((url, index) => ({
        id: `existing-${index}`,
        url,
        name: `Image ${index + 1}`,
        size: 0,
        isPrimary: index === 0
      }));
      setImages(initialImages);
    }
  });

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        onError?.(`File ${file.name} is not an image`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        onError?.(`File ${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Check max images limit
    const totalImages = images.length + validFiles.length;
    if (totalImages > maxImages) {
      onError?.(`Maximum ${maxImages} images allowed`);
      return;
    }

    uploadFiles(validFiles);
  }, [images.length, maxImages, onError]);

  const uploadFiles = async (files: File[]) => {
    setUploading(true);

    for (const file of files) {
      const tempId = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Add temporary image entry
      const tempImage: UploadedImage = {
        id: tempId,
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        uploading: true,
        progress: 0
      };

      setImages(prev => [...prev, tempImage]);

      try {
        const response = await fileUploadService.uploadFile(file, {
          folder: 'pet-images',
          generateThumbnail: true,
          maxSize: 5 * 1024 * 1024,
          allowedTypes: SUPPORTED_IMAGE_TYPES,
          metadata: {
            petId,
            uploadedAt: new Date().toISOString()
          },
          onProgress: (progress: UploadProgress) => {
            setImages(prev => prev.map(img => 
              img.id === tempId 
                ? { ...img, progress: progress.percentage }
                : img
            ));
          }
        });

        // Replace temporary image with uploaded one
        if (response.success && response.file) {
          const uploadedImage: UploadedImage = {
            id: response.file.id,
            url: response.file.url,
            thumbnailUrl: response.file.thumbnailUrl,
            name: response.file.name,
            size: response.file.size,
            isPrimary: images.length === 0 // Make first image primary
          };

          setImages(prev => prev.map(img => 
            img.id === tempId ? uploadedImage : img
          ));

          // Revoke temporary URL
          URL.revokeObjectURL(tempImage.url);

          onUploadComplete?.(response.file);
        } else {
          // Mark as failed
          setImages(prev => prev.map(img => 
            img.id === tempId 
              ? { ...img, uploading: false, error: response.error || 'Upload failed' }
              : img
          ));
          onError?.(response.error || `Failed to upload ${file.name}`);
        }
      } catch (error) {
        setImages(prev => prev.map(img => 
          img.id === tempId 
            ? { ...img, uploading: false, error: 'Upload failed' }
            : img
        ));
        onError?.(`Failed to upload ${file.name}`);
      }
    }

    setUploading(false);
    updateImagesChange();
  };

  const updateImagesChange = useCallback(() => {
    const validImages = images.filter(img => !img.uploading && !img.error);
    const imageUrls = validImages.map(img => img.url);
    onImagesChange?.(imageUrls);
  }, [images, onImagesChange]);

  const removeImage = useCallback((imageId: string) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove) {
        // Revoke object URL if it's a temporary one
        if (imageToRemove.url.startsWith('blob:')) {
          URL.revokeObjectURL(imageToRemove.url);
        }
      }
      return prev.filter(img => img.id !== imageId);
    });
    
    if (selectedImage === imageId) {
      setSelectedImage(null);
    }
    
    updateImagesChange();
  }, [selectedImage, updateImagesChange]);

  const setAsPrimary = useCallback((imageId: string) => {
    setImages(prev => prev.map(img => ({
      ...img,
      isPrimary: img.id === imageId
    })));
    updateImagesChange();
  }, [updateImagesChange]);

  const retryUpload = useCallback((imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (image && image.error) {
      // Remove failed image and let user re-upload
      removeImage(imageId);
    }
  }, [images, removeImage]);

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

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Area */}
      <motion.div
        variants={fadeInUpVariants}
        initial="initial"
        animate="animate"
      >
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
          <div className="p-8 text-center">
            <motion.div
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-100 flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
            >
              <Upload className="w-8 h-8 text-indigo-600" />
            </motion.div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Upload Pet Images
              </h3>
              <p className="text-sm text-gray-600">
                Drag and drop images here, or click to select files
              </p>
              <p className="text-xs text-gray-500">
                JPG, PNG, WebP up to 5MB each • Max {maxImages} images
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />

            <GradientButton
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || images.length >= maxImages}
              className="mt-4"
            >
              <Camera className="w-4 h-4 mr-2" />
              Select Images
            </GradientButton>

            {images.length >= maxImages && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Maximum {maxImages} images reached. Remove some images to add more.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Image Grid */}
      {images.length > 0 && (
        <motion.div
          variants={fadeInUpVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Pet Images ({images.length}/{maxImages})
            </h3>
            <Badge variant="outline">
              {images.filter(img => img.isPrimary).length} Primary
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {images.map((image) => (
                <motion.div
                  key={image.id}
                  layout
                  variants={scaleUpVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="relative group"
                >
                  <Card className="overflow-hidden border-2 transition-all duration-300 hover:border-indigo-300 hover:shadow-lg">
                    {/* Image */}
                    <div className="aspect-square relative bg-gray-100">
                      <img
                        src={image.thumbnailUrl || image.url}
                        alt={image.name}
                        className="w-full h-full object-cover"
                        onClick={() => setSelectedImage(image.url)}
                      />
                      
                      {/* Primary Badge */}
                      {image.isPrimary && (
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-green-500 text-white">
                            Primary
                          </Badge>
                        </div>
                      )}

                      {/* Upload Progress */}
                      {image.uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="text-center space-y-2">
                            <Loader2 className="w-8 h-8 text-white animate-spin mx-auto" />
                            <div className="text-white text-sm">
                              {image.progress || 0}%
                            </div>
                            <Progress value={image.progress || 0} className="w-20" />
                          </div>
                        </div>
                      )}

                      {/* Error Overlay */}
                      {image.error && (
                        <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                          <div className="text-center space-y-2">
                            <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
                            <div className="text-red-600 text-xs px-2">
                              {image.error}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="flex gap-2">
                          {!image.uploading && !image.error && (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setSelectedImage(image.url)}
                                className="p-2 bg-white/90 rounded-full"
                              >
                                <ZoomIn className="w-4 h-4 text-gray-800" />
                              </motion.button>
                              
                              {!image.isPrimary && (
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => setAsPrimary(image.id)}
                                  className="p-2 bg-white/90 rounded-full"
                                >
                                  <Check className="w-4 h-4 text-gray-800" />
                                </motion.button>
                              )}
                            </>
                          )}
                          
                          {image.error && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => retryUpload(image.id)}
                              className="p-2 bg-white/90 rounded-full"
                            >
                              <RotateCw className="w-4 h-4 text-gray-800" />
                            </motion.button>
                          )}
                          
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeImage(image.id)}
                            className="p-2 bg-red-500/90 rounded-full"
                          >
                            <Trash2 className="w-4 h-4 text-white" />
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    {/* Image Info */}
                    <div className="p-2">
                      <p className="text-xs text-gray-600 truncate">
                        {image.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {fileUploadService.formatFileSize(image.size)}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Image Preview Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              className="relative max-w-4xl max-h-full"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt="Pet image preview"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
