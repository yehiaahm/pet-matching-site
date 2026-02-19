/**
 * File Upload Routes - Production Ready
 * File upload with Cloudinary integration
 */

const express = require('express');
const { param, query, validationResult } = require('express-validator');

const {
  uploadSingleFile,
  uploadMultipleFiles,
  getUserFiles,
  deleteFile,
  getFileInfo
} = require('../controllers/fileUploadController');

const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array(),
      timestamp: new Date().toISOString()
    });
  }
  next();
};

/**
 * @route   POST /api/upload/single
 * @desc    Upload single file
 * @access  Private
 */
router.post('/single',
  authenticate,
  uploadSingleFile
);

/**
 * @route   POST /api/upload/multiple
 * @desc    Upload multiple files
 * @access  Private
 */
router.post('/multiple',
  authenticate,
  uploadMultipleFiles
);

/**
 * @route   GET /api/upload/files
 * @desc    Get user files
 * @access  Private
 */
router.get('/files',
  authenticate,
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('type')
      .optional()
      .isIn(['IMAGE', 'VIDEO'])
      .withMessage('Type must be IMAGE or VIDEO')
  ],
  handleValidationErrors,
  getUserFiles
);

/**
 * @route   GET /api/upload/files/:id/info
 * @desc    Get file info
 * @access  Private
 */
router.get('/files/:id/info',
  authenticate,
  [
    param('id')
      .isUUID()
      .withMessage('File ID must be a valid UUID')
  ],
  handleValidationErrors,
  getFileInfo
);

/**
 * @route   DELETE /api/upload/files/:id
 * @desc    Delete file
 * @access  Private
 */
router.delete('/files/:id',
  authenticate,
  [
    param('id')
      .isUUID()
      .withMessage('File ID must be a valid UUID')
  ],
  handleValidationErrors,
  deleteFile
);

module.exports = router;
