# File Upload Guide

## 📁 Overview

This guide explains how to implement file upload functionality in your application. The system supports multiple file types, drag-and-drop, progress tracking, and proper error handling.

## 🚀 Quick Start

### 1. Basic File Upload Component

```jsx
import FileUpload from '../components/FileUpload';

function MyComponent() {
  const handleUploadSuccess = (data) => {
    console.log('File uploaded successfully:', data);
  };

  const handleUploadError = (error) => {
    console.error('Upload failed:', error);
  };

  return (
    <FileUpload
      onUploadSuccess={handleUploadSuccess}
      onUploadError={handleUploadError}
      endpoint="/api/upload/cv"
      acceptedTypes={['application/pdf']}
      maxSize={10 * 1024 * 1024} // 10MB
      fieldName="cv"
      label="Upload CV"
      description="Upload your resume in PDF format"
    />
  );
}
```

### 2. Profile Picture Upload

```jsx
<FileUpload
  endpoint="/api/upload/profile-picture"
  acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/gif']}
  maxSize={5 * 1024 * 1024} // 5MB
  fieldName="profilePicture"
  label="Upload Profile Picture"
  description="Upload your profile picture"
/>
```

### 3. Document Upload

```jsx
<FileUpload
  endpoint="/api/upload/document"
  acceptedTypes={[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]}
  maxSize={15 * 1024 * 1024} // 15MB
  fieldName="document"
  label="Upload Document"
  description="Upload your document"
/>
```

## 📋 Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onUploadSuccess` | Function | - | Callback when upload succeeds |
| `onUploadError` | Function | - | Callback when upload fails |
| `endpoint` | String | `/api/upload/cv` | API endpoint for upload |
| `acceptedTypes` | Array | `['application/pdf']` | Allowed MIME types |
| `maxSize` | Number | `10MB` | Maximum file size in bytes |
| `fieldName` | String | `'cv'` | Form field name |
| `label` | String | `'Upload File'` | Component label |
| `description` | String | `'Drag and drop...'` | Component description |
| `className` | String | `''` | Additional CSS classes |

## 🔧 Server-Side Setup

### 1. Upload Middleware

The upload middleware is already configured in `server/middleware/upload.js`:

```javascript
// Supported file types
const allowedMimeTypes = {
  cv: ['application/pdf'],
  profilePicture: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  certificate: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
};

// File size limits
const maxFileSizes = {
  cv: 10 * 1024 * 1024, // 10MB
  profilePicture: 5 * 1024 * 1024, // 5MB
  document: 15 * 1024 * 1024, // 15MB
  certificate: 10 * 1024 * 1024 // 10MB
};
```

### 2. Upload Routes

Available upload endpoints:

- `POST /api/upload/cv` - Upload CV/Resume
- `POST /api/upload/profile-picture` - Upload profile picture
- `POST /api/upload/document` - Upload general documents
- `POST /api/upload/certificate` - Upload certificates

### 3. File Storage

Files are stored in the `server/uploads/` directory:

```
uploads/
├── cvs/           # CV/Resume files
├── profiles/      # Profile pictures
├── documents/     # General documents
└── certificates/  # Certificate files
```

## 🎯 Usage Examples

### 1. Student Profile with CV Upload

```jsx
import React, { useState } from 'react';
import FileUpload from '../components/FileUpload';

function StudentProfile() {
  const [cvData, setCvData] = useState(null);

  const handleCvUpload = (data) => {
    setCvData(data);
    // Update student profile with CV information
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Student Profile</h2>
      
      <div className="space-y-6">
        {/* CV Upload */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Upload CV</h3>
          <FileUpload
            endpoint="/api/upload/cv"
            acceptedTypes={['application/pdf']}
            maxSize={10 * 1024 * 1024}
            fieldName="cv"
            label="Upload CV/Resume"
            description="Upload your CV or resume in PDF format"
            onUploadSuccess={handleCvUpload}
            onUploadError={(error) => console.error('CV upload failed:', error)}
          />
        </div>

        {/* Profile Picture Upload */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Profile Picture</h3>
          <FileUpload
            endpoint="/api/upload/profile-picture"
            acceptedTypes={['image/jpeg', 'image/jpg', 'image/png']}
            maxSize={5 * 1024 * 1024}
            fieldName="profilePicture"
            label="Upload Profile Picture"
            description="Upload your profile picture"
            onUploadSuccess={(data) => console.log('Profile picture uploaded:', data)}
          />
        </div>
      </div>
    </div>
  );
}
```

### 2. Company Document Upload

```jsx
function CompanyDocuments() {
  return (
    <div className="space-y-6">
      {/* Company Documents */}
      <FileUpload
        endpoint="/api/upload/document"
        acceptedTypes={[
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]}
        maxSize={15 * 1024 * 1024}
        fieldName="document"
        label="Upload Company Documents"
        description="Upload company documents, policies, or other files"
        onUploadSuccess={(data) => {
          console.log('Document uploaded:', data);
          // Handle document upload success
        }}
      />
    </div>
  );
}
```

### 3. Certificate Upload

```jsx
function CertificateUpload() {
  return (
    <FileUpload
      endpoint="/api/upload/certificate"
      acceptedTypes={['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']}
      maxSize={10 * 1024 * 1024}
      fieldName="certificate"
      label="Upload Certificate"
      description="Upload your certificate or achievement"
      onUploadSuccess={(data) => {
        console.log('Certificate uploaded:', data);
        // Handle certificate upload
      }}
    />
  );
}
```

## 🔒 Security Features

### 1. File Type Validation
- Server-side MIME type checking
- Client-side file type validation
- Whitelist approach for security

### 2. File Size Limits
- Configurable size limits per file type
- Client and server-side validation
- Prevents large file uploads

### 3. Authentication
- All upload endpoints require authentication
- Token-based authorization
- User-specific file storage

### 4. File Naming
- Unique file names with timestamps
- Original filename preservation
- No path traversal vulnerabilities

## 🛠️ Customization

### 1. Custom File Types

To add new file types, update the middleware:

```javascript
// In server/middleware/upload.js
const allowedMimeTypes = {
  // ... existing types
  video: ['video/mp4', 'video/avi', 'video/mov'],
  audio: ['audio/mp3', 'audio/wav', 'audio/m4a']
};
```

### 2. Custom Upload Endpoint

Create a new route in `server/routes/upload.js`:

```javascript
router.post('/video', authenticate, uploadSingle('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    res.json({
      message: 'Video uploaded successfully',
      fileUrl: `/uploads/videos/${req.file.filename}`,
      fileId: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed' });
  }
});
```

### 3. Custom Component Styling

```jsx
<FileUpload
  className="custom-upload-styles"
  // ... other props
/>
```

Add custom CSS:

```css
.custom-upload-styles {
  /* Your custom styles */
}

.custom-upload-styles .upload-area {
  border-color: #your-color;
  background-color: #your-bg-color;
}
```

## 🐛 Troubleshooting

### Common Issues

1. **File not uploading**
   - Check file size limits
   - Verify file type is allowed
   - Ensure authentication token is valid

2. **Upload progress not showing**
   - Check network connection
   - Verify server is running
   - Check browser console for errors

3. **File type error**
   - Verify MIME type is in allowed list
   - Check file extension
   - Ensure file is not corrupted

### Debug Tips

1. **Check Network Tab**
   - Monitor upload requests
   - Verify response status
   - Check request headers

2. **Console Logging**
   - Add console.log in success/error callbacks
   - Monitor file validation
   - Check file object properties

3. **Server Logs**
   - Check server console for errors
   - Verify file storage directory
   - Monitor upload middleware

## 📚 Best Practices

1. **Always validate files** on both client and server
2. **Use appropriate file size limits** for your use case
3. **Implement proper error handling** for better UX
4. **Show upload progress** for large files
5. **Provide clear feedback** for success/error states
6. **Use secure file naming** to prevent conflicts
7. **Implement file cleanup** for failed uploads
8. **Test with various file types** and sizes

## 🎯 API Response Format

Successful upload response:

```json
{
  "message": "File uploaded successfully",
  "fileUrl": "/uploads/cvs/cv-1234567890.pdf",
  "fileId": "cv-1234567890.pdf",
  "originalName": "my-resume.pdf",
  "size": 1024000,
  "mimeType": "application/pdf"
}
```

Error response:

```json
{
  "message": "File type not allowed",
  "error": "Only PDF files are allowed for CV upload"
}
```

This comprehensive file upload system provides a secure, user-friendly way to handle file uploads in your application! 