# Company Profile CRUD Functionality Guide

## Overview
The Company Dashboard now includes complete CRUD (Create, Read, Update, Delete) functionality for company profile management. Companies can view, edit, and manage their profile information directly from the dashboard.

## Features

### 1. **READ (View Profile)**
- **Location**: Company Dashboard → Company Information section
- **Displayed Fields**:
  - Company Name
  - Industry
  - Website (if provided)
  - Location
  - Company Size
  - Profile Picture
  - Description (if provided)
- **Real-time Updates**: Profile information updates automatically after changes

### 2. **UPDATE (Edit Profile)**
- **Access**: Click "Edit Profile" button in Company Information section
- **Editable Fields**:
  - Company Name (required)
  - Industry (required)
  - Website (optional, URL validation)
  - Description (optional, max 500 characters)
  - Location (required)
  - Company Size (required, dropdown selection)
- **Validation**: Server-side validation for all fields
- **Profile Picture**: Separate upload functionality

### 3. **UPDATE Profile Picture**
- **Access**: Click "Update" button next to Profile Picture
- **Features**:
  - File picker opens automatically
  - Supports image formats (JPEG, JPG, PNG, GIF)
  - Automatic upload to server
  - Real-time preview update
  - Error handling for failed uploads

### 4. **DELETE (Deactivate Profile)**
- **Access**: "Danger Zone" section in Company Information
- **Safety**: Confirmation dialog required
- **Action**: Soft delete (marks profile as inactive)
- **Result**: Redirects to home page after deactivation

## Technical Implementation

### Backend API Endpoints

#### 1. GET Company Profile
```http
GET /api/companies/profile
Authorization: Bearer <token>
```
**Response**:
```json
{
  "_id": "company_id",
  "name": "Company Name",
  "email": "company@example.com",
  "industry": "Technology",
  "website": "https://example.com",
  "profilePicture": "/uploads/profiles/image.jpg",
  "description": "Company description",
  "location": "New York",
  "size": "51-200",
  "isApproved": true
}
```

#### 2. UPDATE Company Profile
```http
PUT /api/companies/profile
Authorization: Bearer <token>
Content-Type: application/json
```
**Request Body**:
```json
{
  "name": "Updated Company Name",
  "industry": "Technology",
  "website": "https://example.com",
  "description": "Updated description",
  "location": "San Francisco",
  "size": "201-500"
}
```
**Response**:
```json
{
  "message": "Company profile updated successfully",
  "company": {
    "_id": "company_id",
    "name": "Updated Company Name",
    "email": "company@example.com",
    "industry": "Technology",
    "website": "https://example.com",
    "profilePicture": "/uploads/profiles/image.jpg",
    "description": "Updated description",
    "location": "San Francisco",
    "size": "201-500",
    "isApproved": true
  }
}
```

#### 3. UPDATE Profile Picture
```http
PUT /api/companies/profile-picture
Authorization: Bearer <token>
Content-Type: application/json
```
**Request Body**:
```json
{
  "profilePicture": "/uploads/profiles/new-image.jpg"
}
```
**Response**:
```json
{
  "message": "Profile picture updated successfully",
  "profilePicture": "/uploads/profiles/new-image.jpg"
}
```

#### 4. DELETE Company Profile
```http
DELETE /api/companies/profile
Authorization: Bearer <token>
```
**Response**:
```json
{
  "message": "Company profile deactivated successfully"
}
```

### Frontend Components

#### 1. Company Information Section
- **Location**: Left sidebar in Company Dashboard
- **Features**:
  - Display current profile information
  - Edit Profile button
  - Profile picture management
  - Danger zone for profile deactivation

#### 2. Profile Edit Modal
- **Trigger**: Edit Profile button
- **Features**:
  - Form validation
  - Real-time character count for description
  - Required field indicators
  - Responsive design
  - Loading states

#### 3. Profile Picture Upload
- **Trigger**: Update button in profile picture section
- **Features**:
  - Automatic file picker
  - Image format validation
  - Upload progress handling
  - Error handling

## Database Schema Updates

### Company Model Additions
```javascript
// Profile status fields
isActive: {
  type: Boolean,
  default: true
},
deletedAt: Date
```

## Validation Rules

### Server-side Validation
- **Company Name**: 1-100 characters, required
- **Industry**: Required, non-empty string
- **Website**: Optional, valid URL format
- **Description**: Optional, max 500 characters
- **Location**: Required, non-empty string
- **Company Size**: Required, must be one of predefined values
- **Profile Picture**: Optional, valid image URL

### Client-side Validation
- **Real-time**: Character count for description
- **Form validation**: Required fields marked with asterisk
- **URL validation**: Website field accepts valid URLs
- **File validation**: Image upload validates file type and size

## Error Handling

### Frontend Error Handling
- **Network errors**: Displayed to user with descriptive messages
- **Validation errors**: Field-specific error messages
- **Upload errors**: Clear feedback for failed uploads
- **Confirmation dialogs**: For destructive actions

### Backend Error Handling
- **Validation errors**: Detailed field-specific messages
- **Database errors**: Graceful error responses
- **File upload errors**: Proper error status codes
- **Authentication errors**: 401/403 status codes

## Security Features

### Authentication
- All CRUD operations require valid authentication token
- Token validation on every request
- Automatic logout on token expiration

### Authorization
- Companies can only modify their own profile
- Profile picture uploads are validated
- Soft delete prevents data loss

### Data Validation
- Server-side validation for all inputs
- SQL injection prevention through Mongoose
- XSS protection through input sanitization

## Usage Examples

### Updating Company Profile
1. Navigate to Company Dashboard
2. Click "Edit Profile" in Company Information section
3. Modify desired fields
4. Click "Update Profile"
5. Profile updates immediately

### Uploading Profile Picture
1. In Company Information section, click "Update" next to Profile Picture
2. Select image file from file picker
3. File uploads automatically
4. Profile picture updates immediately

### Deactivating Profile
1. Scroll to "Danger Zone" in Company Information
2. Click "Deactivate Profile"
3. Confirm action in dialog
4. Profile is deactivated and user redirected

## Best Practices

### For Companies
1. **Keep Information Updated**: Regularly update company information
2. **Use Professional Images**: Upload high-quality profile pictures
3. **Provide Complete Information**: Fill all required fields
4. **Verify Website**: Ensure website URL is correct and accessible

### For Developers
1. **Error Handling**: Always handle potential errors gracefully
2. **Validation**: Implement both client and server-side validation
3. **Security**: Validate all inputs and authenticate all requests
4. **User Experience**: Provide clear feedback for all actions

## Future Enhancements
- **Profile Completion Score**: Track profile completeness
- **Profile Analytics**: View profile visit statistics
- **Bulk Updates**: Update multiple fields at once
- **Profile Templates**: Pre-defined profile templates
- **Social Media Integration**: Link social media profiles
- **Profile Verification**: Admin verification system
- **Profile Export**: Export profile data
- **Profile History**: Track profile change history 