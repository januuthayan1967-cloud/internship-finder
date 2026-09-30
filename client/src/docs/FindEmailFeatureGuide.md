# Find Email Feature Guide

## Overview
The Find Email feature allows users to recover their account by entering their phone number or recovery email. This page is displayed after clicking the "Forgot password?" link from the login page.

## Features

### 1. **User Interface**
- **Dark Theme Design**: Matches the modern dark blue-grey background
- **Responsive Layout**: Works on desktop and mobile devices
- **Professional Header**: Contains logo and navigation links
- **Form Card**: Clean, centered form with proper spacing

### 2. **Input Validation**
- **Required Field**: Phone number or recovery email is mandatory
- **Real-time Validation**: Immediate feedback on input errors
- **User-friendly Messages**: Clear error and success messages

### 3. **Database Integration**
- **Multi-User Search**: Searches across Students, Companies, and Admins
- **Phone Number Search**: Finds users by phone number
- **Email Search**: Finds users by recovery email
- **Secure Response**: Returns masked email for display

## Page Structure

### Header Section
- **Logo**: Internship Finder with search icon
- **Navigation**: "Sign" and "Register" links
- **Dark Theme**: Transparent background with white text

### Main Content
- **Left Section** (Desktop only):
  - Large "G" letter
  - "Find your email" heading
  - Descriptive text

- **Right Section** (Form Card):
  - Form title and description
  - Input field with mail icon
  - Error/Success message display
  - "Next" button with loading state
  - "Back to login" link

## Database Schema Integration

### User Models Supported
1. **Student Model** (`Student.js`)
   - `email`: Primary email field
   - `phone`: Phone number field

2. **Company Model** (`Company.js`)
   - `email`: Primary email field
   - `phone`: Phone number field

3. **Admin Model** (`Admin.js`)
   - `email`: Primary email field
   - `phone`: Phone number field

### Search Logic
```javascript
// Email search (case-insensitive)
user = await Student.findOne({ email: identifier.toLowerCase() });
user = await Company.findOne({ email: identifier.toLowerCase() });
user = await Admin.findOne({ email: identifier.toLowerCase() });

// Phone number search (exact match)
user = await Student.findOne({ phone: identifier });
user = await Company.findOne({ phone: identifier });
user = await Admin.findOne({ phone: identifier });
```

## API Endpoint

### POST `/api/auth/find-email`

#### Request Body
```json
{
  "identifier": "phone_number_or_email"
}
```

#### Response (Success)
```json
{
  "success": true,
  "message": "Email found successfully",
  "email": "user@example.com",
  "maskedEmail": "us***@example.com",
  "userType": "student"
}
```

#### Response (Error)
```json
{
  "message": "No account found with this phone number or recovery email"
}
```

## User Flow

### 1. **Login Page**
- User clicks "Forgot password?" link
- Redirects to `/find-email`

### 2. **Find Email Page**
- User enters phone number or recovery email
- System searches database
- Shows success/error message

### 3. **Success Flow**
- Email found and displayed
- Automatically redirects to forgot password page
- Email pre-filled in forgot password form

### 4. **Error Flow**
- Shows error message
- User can try again or go back to login

## Security Features

### 1. **Input Validation**
- Server-side validation using express-validator
- Client-side validation for immediate feedback
- Email format validation

### 2. **Data Protection**
- Masked email display for security
- No sensitive data exposure in error messages
- Secure API responses

### 3. **Rate Limiting**
- Prevents abuse of the find email feature
- Implements proper error handling

## Technical Implementation

### Frontend Components
- **FindEmail.jsx**: Main component
- **Form Validation**: Real-time input validation
- **Loading States**: Spinner during API calls
- **Error Handling**: User-friendly error messages

### Backend Implementation
- **Route**: `/api/auth/find-email`
- **Validation**: express-validator middleware
- **Database Queries**: Mongoose queries across models
- **Response Format**: Standardized JSON responses

### State Management
```javascript
const [identifier, setIdentifier] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState('');
const [success, setSuccess] = useState('');
const [foundEmail, setFoundEmail] = useState('');
```

## Error Handling

### Client-side Errors
1. **Empty Input**: "Please enter your phone number or recovery email"
2. **Network Error**: "Failed to connect to server"
3. **API Error**: Server response message

### Server-side Errors
1. **Validation Error**: Invalid input format
2. **Not Found**: No user found with identifier
3. **Server Error**: Database connection issues

## Integration Points

### 1. **Login Page Integration**
- "Forgot password?" link redirects to `/find-email`
- Updated to use "Sign" instead of "Login"

### 2. **Forgot Password Integration**
- Receives email parameter from FindEmail page
- Pre-fills email field automatically
- Continues password reset flow

### 3. **Navigation Flow**
```
Login Page → Find Email Page → Forgot Password Page → Reset Password Page
```

## Styling and Design

### Color Scheme
- **Background**: Dark blue-grey gradient
- **Form Card**: Dark grey with rounded corners
- **Text**: White and light grey
- **Accents**: Blue for interactive elements

### Responsive Design
- **Desktop**: Two-column layout with large "G"
- **Mobile**: Single column with centered form
- **Tablet**: Adaptive layout

### Interactive Elements
- **Hover Effects**: Button and link hover states
- **Focus States**: Input field focus indicators
- **Loading States**: Spinner animation
- **Transitions**: Smooth animations

## Testing Scenarios

### 1. **Valid Inputs**
- Email address that exists in database
- Phone number that exists in database
- Different user types (student, company, admin)

### 2. **Invalid Inputs**
- Non-existent email
- Non-existent phone number
- Invalid email format
- Empty input

### 3. **Edge Cases**
- Case sensitivity in email search
- Phone number formatting variations
- Network connectivity issues
- Server errors

## Future Enhancements

### 1. **Additional Features**
- SMS verification for phone numbers
- Multiple recovery email support
- Account recovery questions
- Two-factor authentication integration

### 2. **Security Improvements**
- Rate limiting per IP address
- CAPTCHA integration
- Email verification before password reset
- Audit logging for security events

### 3. **User Experience**
- Remember device functionality
- Progressive disclosure of information
- Accessibility improvements
- Multi-language support

## Troubleshooting

### Common Issues
1. **Email Not Found**: Verify user exists in database
2. **Phone Number Issues**: Check format and leading zeros
3. **Network Errors**: Check server connectivity
4. **Validation Errors**: Ensure proper input format

### Debug Information
- Check browser console for client errors
- Check server logs for API errors
- Verify database connection
- Test API endpoint directly

## Best Practices

### 1. **Security**
- Never expose full email addresses in error messages
- Implement proper rate limiting
- Use HTTPS for all communications
- Validate all inputs server-side

### 2. **User Experience**
- Provide clear, helpful error messages
- Show loading states during API calls
- Maintain consistent navigation flow
- Ensure responsive design

### 3. **Performance**
- Optimize database queries
- Implement proper caching
- Minimize API response time
- Use efficient search algorithms

## API Documentation

### Endpoint Details
- **Method**: POST
- **Path**: `/api/auth/find-email`
- **Content-Type**: application/json
- **Authentication**: Not required

### Request Example
```bash
curl -X POST http://localhost:5000/api/auth/find-email \
  -H "Content-Type: application/json" \
  -d '{"identifier": "user@example.com"}'
```

### Response Example
```json
{
  "success": true,
  "message": "Email found successfully",
  "email": "user@example.com",
  "maskedEmail": "us***@example.com",
  "userType": "student"
}
```

This comprehensive Find Email feature provides a secure and user-friendly way for users to recover their accounts using either their phone number or recovery email, with full database integration and modern UI design. 