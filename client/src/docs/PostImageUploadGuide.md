# Post Image Upload Feature Guide

## Overview
The Company Dashboard now supports adding images to internship posts, making them more visually appealing and informative.

## Features

### 1. Image Upload in Post Creation
- **Location**: Company Dashboard → "New Post" button
- **Supported Formats**: JPEG, JPG, PNG, GIF
- **Maximum Size**: 5MB
- **Optional**: Images are not required for post creation

### 2. Image Upload Process
1. Click "New Post" in the Company Dashboard
2. Fill in the required post details (title, description, location, duration, stipend)
3. In the "Post Image (Optional)" section:
   - Drag and drop an image file or click to browse
   - Supported formats will be automatically validated
   - File size is checked (max 5MB)
4. Preview the uploaded image
5. Remove the image if needed using the X button
6. Submit the post

### 3. Image Display
- **Company Dashboard**: Images are displayed in the post cards with a height of 32 (h-32)
- **Public Posts Page**: Images are displayed with a height of 48 (h-48) for better visibility
- **Responsive**: Images maintain aspect ratio and cover the container properly

### 4. Image Editing
- Existing posts can be edited to add, change, or remove images
- The edit modal includes the same image upload functionality
- Current images are displayed with a remove option

## Technical Implementation

### Backend Changes
1. **Upload Route**: `/api/upload/post-image`
2. **Storage**: Files stored in `server/uploads/posts/`
3. **Database**: Added `image` field to internship postings schema
4. **File Validation**: Type and size validation on server

### Frontend Changes
1. **FileUpload Component**: Reused existing component with post-specific configuration
2. **Image Preview**: Real-time preview of uploaded images
3. **Error Handling**: Proper error messages for upload failures
4. **Responsive Design**: Images adapt to different screen sizes

## File Structure
```
server/
├── uploads/
│   ├── posts/          # Post images
│   ├── profiles/       # Profile pictures
│   ├── cvs/           # CV files
│   └── certificates/   # Certificate files
```

## API Endpoints

### Upload Post Image
- **POST** `/api/upload/post-image`
- **Authentication**: Required
- **File Field**: `postImage`
- **Response**: 
  ```json
  {
    "message": "Post image uploaded successfully",
    "file": {
      "filename": "postImage-example-1234567890.jpg",
      "originalName": "example.jpg",
      "size": 1024000,
      "mimetype": "image/jpeg",
      "path": "uploads/posts/postImage-example-1234567890.jpg",
      "fieldname": "postImage",
      "uploadedBy": "company_id",
      "uploadedAt": "2024-01-01T00:00:00.000Z"
    },
    "fileUrl": "/uploads/posts/postImage-example-1234567890.jpg"
  }
  ```

## Usage Examples

### Creating a Post with Image
1. Navigate to Company Dashboard
2. Click "New Post"
3. Fill in post details
4. Upload an image using the file upload component
5. Preview the image
6. Submit the post

### Editing a Post's Image
1. Find the post in Company Dashboard
2. Click "Edit"
3. Use the image upload section to add/change/remove image
4. Save changes

## Error Handling
- **File Type Error**: Only image files (JPEG, JPG, PNG, GIF) are allowed
- **File Size Error**: Maximum file size is 5MB
- **Upload Error**: Network or server errors are displayed to user
- **Validation Error**: Form validation prevents submission with invalid data

## Best Practices
1. **Image Quality**: Use high-quality images that represent the internship well
2. **File Size**: Optimize images to stay under 5MB limit
3. **Aspect Ratio**: Consider using images with good aspect ratios for display
4. **Content**: Ensure images are relevant to the internship or company
5. **Accessibility**: Provide meaningful alt text for screen readers

## Future Enhancements
- Multiple image support per post
- Image cropping and editing tools
- Automatic image optimization
- Image gallery view for posts
- Image lazy loading for better performance 