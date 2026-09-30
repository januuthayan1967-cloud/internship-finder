import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'uploads/';
    
    if (file.fieldname === 'cv') {
      uploadPath += 'cvs/';
    } else if (file.fieldname === 'profilePicture') {
      uploadPath += 'profiles/';
    }
    
    cb(null, path.join(__dirname, '..', uploadPath));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'cv') {
    // Only allow PDF files for CV
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('CV must be a PDF file'), false);
    }
  } else if (file.fieldname === 'profilePicture') {
    // Only allow image files for profile picture
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Profile picture must be an image file'), false);
    }
  } else {
    cb(new Error('Unexpected field'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
});

export const uploadFiles = upload.fields([
  { name: 'cv', maxCount: 1 },
  { name: 'profilePicture', maxCount: 1 }
]);

export const uploadSingle = (fieldName) => upload.single(fieldName);