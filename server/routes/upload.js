import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticate } from '../middleware/auth.js';
import fs from 'fs';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'uploads/';
    
    // Determine upload path based on file type
    switch (file.fieldname) {
      case 'cv':
        uploadPath += 'cvs/';
        break;
      case 'profilePicture':
        uploadPath += 'profiles/';
        break;
      case 'document':
        uploadPath += 'documents/';
        break;
      case 'certificate':
        uploadPath += 'certificates/';
        break;
      case 'postImage':
        uploadPath += 'posts/';
        break;
      default:
        uploadPath += 'misc/';
    }
    
    // Create directory if it doesn't exist
    const fullPath = path.join(__dirname, '..', uploadPath);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    
    cb(null, fullPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const originalName = path.basename(file.originalname, ext);
    cb(null, `${file.fieldname}-${originalName}-${uniqueSuffix}${ext}`);
  }
});

// File filter with detailed validation
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = {
    cv: ['application/pdf'],
    profilePicture: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    certificate: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
    postImage: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
  };

  const maxFileSizes = {
    cv: 10 * 1024 * 1024, // 10MB
    profilePicture: 5 * 1024 * 1024, // 5MB
    document: 15 * 1024 * 1024, // 15MB
    certificate: 10 * 1024 * 1024, // 10MB
    postImage: 5 * 1024 * 1024 // 5MB
  };

  // Check if field is allowed
  if (!allowedMimeTypes[file.fieldname]) {
    return cb(new Error(`Field '${file.fieldname}' is not allowed`), false);
  }

  // Check file type
  if (!allowedMimeTypes[file.fieldname].includes(file.mimetype)) {
    return cb(new Error(`File type not allowed for ${file.fieldname}. Allowed: ${allowedMimeTypes[file.fieldname].join(', ')}`), false);
  }

  // Check file size
  if (file.size > maxFileSizes[file.fieldname]) {
    return cb(new Error(`File too large for ${file.fieldname}. Max size: ${maxFileSizes[file.fieldname] / (1024 * 1024)}MB`), false);
  }

  cb(null, true);
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});

// Upload single file
const uploadSingle = (fieldName) => upload.single(fieldName);

// Upload multiple files
const uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);

// Upload multiple fields
const uploadFields = upload.fields([
  { name: 'cv', maxCount: 1 },
  { name: 'profilePicture', maxCount: 1 },
  { name: 'document', maxCount: 5 },
  { name: 'certificate', maxCount: 10 },
  { name: 'postImage', maxCount: 1 }
]);

// Upload CV
router.post('/cv', authenticate, uploadSingle('cv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path,
      fieldname: req.file.fieldname,
      uploadedBy: req.user._id,
      uploadedAt: new Date()
    };

    res.json({
      message: 'CV uploaded successfully',
      file: fileInfo
    });
  } catch (error) {
    console.error('CV upload error:', error);
    res.status(500).json({ message: 'Server error during CV upload' });
  }
});

// Upload profile picture
router.post('/profile-picture', authenticate, uploadSingle('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path,
      fieldname: req.file.fieldname,
      uploadedBy: req.user._id,
      uploadedAt: new Date()
    };

    res.json({
      message: 'Profile picture uploaded successfully',
      file: fileInfo
    });
  } catch (error) {
    console.error('Profile picture upload error:', error);
    res.status(500).json({ message: 'Server error during profile picture upload' });
  }
});

// Upload documents
router.post('/documents', authenticate, uploadMultiple('document', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const filesInfo = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      path: file.path,
      fieldname: file.fieldname,
      uploadedBy: req.user._id,
      uploadedAt: new Date()
    }));

    res.json({
      message: `${req.files.length} document(s) uploaded successfully`,
      files: filesInfo
    });
  } catch (error) {
    console.error('Documents upload error:', error);
    res.status(500).json({ message: 'Server error during documents upload' });
  }
});

// Upload certificates
router.post('/certificates', authenticate, uploadMultiple('certificate', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const filesInfo = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      path: file.path,
      fieldname: file.fieldname,
      uploadedBy: req.user._id,
      uploadedAt: new Date()
    }));

    res.json({
      message: `${req.files.length} certificate(s) uploaded successfully`,
      files: filesInfo
    });
  } catch (error) {
    console.error('Certificates upload error:', error);
    res.status(500).json({ message: 'Server error during certificates upload' });
  }
});

// Upload post image
router.post('/post-image', authenticate, uploadSingle('postImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path,
      fieldname: req.file.fieldname,
      uploadedBy: req.user._id,
      uploadedAt: new Date()
    };

    res.json({
      message: 'Post image uploaded successfully',
      file: fileInfo,
      fileUrl: `/uploads/posts/${req.file.filename}`
    });
  } catch (error) {
    console.error('Post image upload error:', error);
    res.status(500).json({ message: 'Server error during post image upload' });
  }
});

// Upload multiple file types at once
router.post('/multiple', authenticate, uploadFields, async (req, res) => {
  try {
    const uploadedFiles = {};
    let totalFiles = 0;

    // Process each field
    Object.keys(req.files).forEach(fieldName => {
      const files = req.files[fieldName];
      uploadedFiles[fieldName] = files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        path: file.path,
        fieldname: file.fieldname,
        uploadedBy: req.user._id,
        uploadedAt: new Date()
      }));
      totalFiles += files.length;
    });

    res.json({
      message: `${totalFiles} file(s) uploaded successfully`,
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Multiple files upload error:', error);
    res.status(500).json({ message: 'Server error during files upload' });
  }
});

// Get file info
router.get('/file/:filename', authenticate, async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '..', 'uploads', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    const stats = fs.statSync(filePath);
    res.json({
      filename,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime
    });
  } catch (error) {
    console.error('Get file info error:', error);
    res.status(500).json({ message: 'Server error getting file info' });
  }
});

// Delete file
router.delete('/file/:filename', authenticate, async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '..', 'uploads', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    fs.unlinkSync(filePath);
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ message: 'Server error deleting file' });
  }
});

// Get upload limits and allowed types
router.get('/limits', (req, res) => {
  res.json({
    limits: {
      cv: { maxSize: '10MB', types: ['PDF'] },
      profilePicture: { maxSize: '5MB', types: ['JPEG', 'JPG', 'PNG', 'GIF'] },
      document: { maxSize: '15MB', types: ['PDF', 'DOC', 'DOCX'] },
      certificate: { maxSize: '10MB', types: ['PDF', 'JPEG', 'JPG', 'PNG'] },
      postImage: { maxSize: '5MB', types: ['JPEG', 'JPG', 'PNG', 'GIF'] }
    }
  });
});

export default router; 