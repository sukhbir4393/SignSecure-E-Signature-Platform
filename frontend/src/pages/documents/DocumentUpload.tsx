import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useDocuments } from '../../contexts/DocumentContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card, { CardBody, CardHeader, CardFooter } from '../../components/ui/Card';

const DocumentUpload: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const { uploadDocument } = useDocuments();
  const navigate = useNavigate();
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      
      // Check if file is a PDF or other supported document type
      if (selectedFile.type === 'application/pdf' || 
          selectedFile.type === 'application/msword' || 
          selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setFile(selectedFile);
        setError('');
        
        // Auto-populate title with filename if empty
        if (!title) {
          setTitle(selectedFile.name.replace(/\.[^/.]+$/, '')); // Remove extension
        }
      } else {
        setError('Please upload a PDF or Word document');
        setFile(null);
      }
    }
  }, [title]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    multiple: false
  });
  
  const handleRemoveFile = () => {
    setFile(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please upload a document');
      return;
    }
    
    if (!title.trim()) {
      setError('Please enter a title for your document');
      return;
    }
    
    setIsUploading(true);
    
    try {
      const document = await uploadDocument(file, title, description);
      navigate(`/documents/edit/${document.id}`);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to upload document. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Upload Document</h1>
        <p className="text-gray-600 mt-1">Upload a document to prepare it for signatures</p>
      </div>
      
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">Document Details</h2>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardBody className="space-y-6">
            {error && (
              <div className="p-3 bg-error-50 border border-error-200 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 text-error-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-error-700 text-sm">{error}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <Input
                label="Document Title"
                placeholder="Enter a title for your document"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                required
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={3}
                  className="block w-full rounded-md border border-gray-300 px-4 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
                  placeholder="Add a description for your document"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Document
                </label>
                
                {!file ? (
                  <div 
                    {...getRootProps()} 
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                      ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'}`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm font-medium text-gray-900">
                      {isDragActive ? 'Drop your document here' : 'Drag and drop your document here'}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      or <span className="text-primary-600">browse from your computer</span>
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                      Supported formats: PDF, DOC, DOCX
                    </p>
                  </div>
                ) : (
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-10 w-10 text-primary-500" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="ml-4 p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 focus:outline-none"
                      >
                        <X className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardBody>
          
          <CardFooter className="flex justify-end space-x-3 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/documents')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isUploading}
              disabled={!file || !title.trim()}
            >
              {isUploading ? 'Uploading...' : 'Continue to Add Signers'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default DocumentUpload;