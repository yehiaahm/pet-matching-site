/**
 * File Upload Controller - Production Ready
 * File upload with Cloudinary integration
 */

const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer for memory storage
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WebP, MP4, and MOV files are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 5 // Maximum 5 files
  },
  fileFilter
});

/**
 * @desc    Upload single file
 * @route   POST /api/upload/single
 * @access  Private
 */
const uploadSingleFile = async (req, res) => {
  try {
    const userId = req.userId;

    upload.single('file')(req, res, async (err) => {
      if (err) {
        console.error('❌ Multer error:', err);
        return res.status(400).json({
          success: false,
          error: err.message,
          timestamp: new Date().toISOString()
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file provided',
          timestamp: new Date().toISOString()
        });
      }

      try {
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload_stream({
          resource_type: req.file.mimetype.startsWith('video/') ? 'video' : 'image',
          folder: `pet-breeding-platform/${userId}`,
          public_id: `${Date.now()}-${req.file.originalname}`,
          transformation: req.file.mimetype.startsWith('image/') ? [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ] : []
        });

        // Pipe file to Cloudinary
        req.file.stream.pipe(result);

        result.on('end', async () => {
          const { public_id, secure_url, format, resource_type, bytes } = result;

          // Save file record to database
          const fileRecord = await prisma.file.create({
            data: {
              userId,
              filename: req.file.originalname,
              originalName: req.file.originalname,
              mimeType: req.file.mimetype,
              size: bytes,
              publicId: public_id,
              url: secure_url,
              format,
              resourceType: resource_type,
              folder: `pet-breeding-platform/${userId}`
            }
          });

          console.log(`📁 File uploaded: ${req.file.originalname} by user ${userId}`);

          res.status(201).json({
            success: true,
            data: {
              file: {
                id: fileRecord.id,
                filename: fileRecord.filename,
                originalName: fileRecord.originalName,
                mimeType: fileRecord.mimeType,
                size: fileRecord.size,
                url: fileRecord.url,
                publicId: fileRecord.publicId,
                format: fileRecord.format,
                resourceType: fileRecord.resourceType
              }
            },
            message: 'File uploaded successfully',
            timestamp: new Date().toISOString()
          });
        });

        result.on('error', (error) => {
          console.error('❌ Cloudinary upload error:', error);
          res.status(500).json({
            success: false,
            error: 'Failed to upload file to cloud storage',
            timestamp: new Date().toISOString()
          });
        });

      } catch (uploadError) {
        console.error('❌ Upload error:', uploadError);
        res.status(500).json({
          success: false,
          error: 'Internal server error while uploading file',
          timestamp: new Date().toISOString()
        });
      }
    });

  } catch (error) {
    console.error('❌ Upload single file error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while uploading file',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * @desc    Upload multiple files
 * @route   POST /api/upload/multiple
 * @access  Private
 */
const uploadMultipleFiles = async (req, res) => {
  try {
    const userId = req.userId;

    upload.array('files', 5)(req, res, async (err) => {
      if (err) {
        console.error('❌ Multer error:', err);
        return res.status(400).json({
          success: false,
          error: err.message,
          timestamp: new Date().toISOString()
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No files provided',
          timestamp: new Date().toISOString()
        });
      }

      try {
        const uploadPromises = req.files.map((file, index) => {
          return new Promise((resolve, reject) => {
            const result = cloudinary.uploader.upload_stream({
              resource_type: file.mimetype.startsWith('video/') ? 'video' : 'image',
              folder: `pet-breeding-platform/${userId}`,
              public_id: `${Date.now()}-${index}-${file.originalname}`,
              transformation: file.mimetype.startsWith('image/') ? [
                { width: 1200, height: 1200, crop: 'limit' },
                { quality: 'auto' },
                { fetch_format: 'auto' }
              ] : []
            });

            file.stream.pipe(result);

            result.on('end', () => {
              resolve({
                filename: file.originalname,
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
                publicId: result.public_id,
                url: result.secure_url,
                format: result.format,
                resourceType: result.resource_type
              });
            });

            result.on('error', (error) => {
              reject(error);
            });
          });
        });

        const uploadedFiles = await Promise.all(uploadPromises);

        // Save all file records to database
        const fileRecords = await Promise.all(
          uploadedFiles.map(fileData =>
            prisma.file.create({
              data: {
                userId,
                ...fileData,
                folder: `pet-breeding-platform/${userId}`
              }
            })
          )
        );

        console.log(`📁 Multiple files uploaded: ${fileRecords.length} files by user ${userId}`);

        res.status(201).json({
          success: true,
          data: {
            files: fileRecords.map(file => ({
              id: file.id,
              filename: file.filename,
              originalName: file.originalName,
              mimeType: file.mimeType,
              size: file.size,
              url: file.url,
              publicId: file.publicId,
              format: file.format,
              resourceType: file.resourceType
            }))
          },
          message: `${fileRecords.length} files uploaded successfully`,
          timestamp: new Date().toISOString()
        });

      } catch (uploadError) {
        console.error('❌ Multiple upload error:', uploadError);
        res.status(500).json({
          success: false,
          error: 'Internal server error while uploading files',
          timestamp: new Date().toISOString()
        });
      }
    });

  } catch (error) {
    console.error('❌ Upload multiple files error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while uploading files',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * @desc    Get user files
 * @route   GET /api/upload/files
 * @access  Private
 */
const getUserFiles = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 20, type } = req.query;

    // Build filter
    const where = { userId };
    if (type) {
      where.resourceType = type.toUpperCase();
    }

    // Get files with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [files, totalCount] = await Promise.all([
      prisma.file.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.file.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / take);

    res.status(200).json({
      success: true,
      data: {
        files,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Get user files error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching files',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * @desc    Delete file
 * @route   DELETE /api/upload/files/:id
 * @access  Private
 */
const deleteFile = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    // Check if file exists and belongs to user
    const file = await prisma.file.findUnique({
      where: { id }
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found',
        timestamp: new Date().toISOString()
      });
    }

    if (file.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You can only delete your own files',
        timestamp: new Date().toISOString()
      });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(file.publicId, {
      resource_type: file.resourceType
    });

    // Delete from database
    await prisma.file.delete({
      where: { id }
    });

    console.log(`🗑️ File deleted: ${file.filename} by user ${userId}`);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Delete file error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while deleting file',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * @desc    Get file info
 * @route   GET /api/upload/files/:id/info
 * @access  Private
 */
const getFileInfo = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const file = await prisma.file.findUnique({
      where: { id }
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found',
        timestamp: new Date().toISOString()
      });
    }

    if (file.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You can only view your own files',
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      success: true,
      data: { file },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Get file info error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching file info',
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  uploadSingleFile,
  uploadMultipleFiles,
  getUserFiles,
  deleteFile,
  getFileInfo
};
