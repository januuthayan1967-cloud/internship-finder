import React, { useState } from 'react';
import FileUpload from '../components/FileUpload';
import { User, FileText, Image, Award, Building } from 'lucide-react';

const FileUploadDemo = () => {
  const [uploadResults, setUploadResults] = useState({});

  const handleUploadSuccess = (type, data) => {
    setUploadResults(prev => ({
      ...prev,
      [type]: { success: true, data, timestamp: new Date().toISOString() }
    }));
  };

  const handleUploadError = (type, error) => {
    setUploadResults(prev => ({
      ...prev,
      [type]: { success: false, error, timestamp: new Date().toISOString() }
    }));
  };

  const clearResults = () => {
    setUploadResults({});
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            File Upload Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Test different types of file uploads with drag-and-drop functionality
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* CV Upload */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <FileText className="h-6 w-6 text-blue-500 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                CV/Resume Upload
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Upload your CV or resume in PDF format
            </p>
            <FileUpload
              endpoint="/api/upload/cv"
              acceptedTypes={['application/pdf']}
              maxSize={10 * 1024 * 1024}
              fieldName="cv"
              label="Upload CV/Resume"
              description="Drag and drop your CV here or click to browse"
              onUploadSuccess={(data) => handleUploadSuccess('cv', data)}
              onUploadError={(error) => handleUploadError('cv', error)}
            />
          </div>

          {/* Profile Picture Upload */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <Image className="h-6 w-6 text-green-500 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Profile Picture
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Upload your profile picture
            </p>
            <FileUpload
              endpoint="/api/upload/profile-picture"
              acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/gif']}
              maxSize={5 * 1024 * 1024}
              fieldName="profilePicture"
              label="Upload Profile Picture"
              description="Drag and drop your image here or click to browse"
              onUploadSuccess={(data) => handleUploadSuccess('profile', data)}
              onUploadError={(error) => handleUploadError('profile', error)}
            />
          </div>

          {/* Document Upload */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <Building className="h-6 w-6 text-purple-500 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Company Documents
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Upload company documents and policies
            </p>
            <FileUpload
              endpoint="/api/upload/document"
              acceptedTypes={[
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
              ]}
              maxSize={15 * 1024 * 1024}
              fieldName="document"
              label="Upload Document"
              description="Drag and drop your document here or click to browse"
              onUploadSuccess={(data) => handleUploadSuccess('document', data)}
              onUploadError={(error) => handleUploadError('document', error)}
            />
          </div>

          {/* Certificate Upload */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <Award className="h-6 w-6 text-yellow-500 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Certificates
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Upload certificates and achievements
            </p>
            <FileUpload
              endpoint="/api/upload/certificate"
              acceptedTypes={['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']}
              maxSize={10 * 1024 * 1024}
              fieldName="certificate"
              label="Upload Certificate"
              description="Drag and drop your certificate here or click to browse"
              onUploadSuccess={(data) => handleUploadSuccess('certificate', data)}
              onUploadError={(error) => handleUploadError('certificate', error)}
            />
          </div>
        </div>

        {/* Upload Results */}
        {Object.keys(uploadResults).length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Upload Results
              </h3>
              <button
                onClick={clearResults}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Clear Results
              </button>
            </div>
            
            <div className="space-y-4">
              {Object.entries(uploadResults).map(([type, result]) => (
                <div
                  key={type}
                  className={`p-4 rounded-lg border ${
                    result.success
                      ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                      : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                        {type} Upload
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {result.success ? 'Success' : 'Failed'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {result.success ? (
                        <div className="text-green-600 dark:text-green-400">
                          ✓ Success
                        </div>
                      ) : (
                        <div className="text-red-600 dark:text-red-400">
                          ✗ Failed
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {result.success && result.data && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      <p><strong>File:</strong> {result.data.fileUrl || result.data.fileId}</p>
                      {result.data.originalName && (
                        <p><strong>Original Name:</strong> {result.data.originalName}</p>
                      )}
                      {result.data.size && (
                        <p><strong>Size:</strong> {(result.data.size / 1024).toFixed(2)} KB</p>
                      )}
                    </div>
                  )}
                  
                  {!result.success && result.error && (
                    <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                      <p><strong>Error:</strong> {result.error}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            📋 How to Test
          </h3>
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <p><strong>Note:</strong> You need to be logged in to test file uploads.</p>
            <p><strong>Steps:</strong></p>
            <ol className="list-decimal list-inside ml-4 space-y-1">
              <li>Login to your account first</li>
              <li>Try uploading different file types</li>
              <li>Test drag-and-drop functionality</li>
              <li>Check upload progress and results</li>
              <li>Verify file validation (try wrong file types)</li>
            </ol>
            <p><strong>Supported Formats:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong>CV:</strong> PDF only (max 10MB)</li>
              <li><strong>Profile Picture:</strong> JPG, PNG, GIF (max 5MB)</li>
              <li><strong>Documents:</strong> PDF, DOC, DOCX (max 15MB)</li>
              <li><strong>Certificates:</strong> PDF, JPG, PNG (max 10MB)</li>
            </ul>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default FileUploadDemo; 