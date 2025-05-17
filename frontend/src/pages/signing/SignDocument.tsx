import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { useDocuments } from '../../contexts/DocumentContext';
import Card, { CardBody, CardHeader, CardFooter } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import PDFViewer from '../../components/document/PDFViewer';
import SignatureField from '../../components/document/SignatureField';
import SignaturePad from '../../components/document/SignatureCanvas';
import Input from '../../components/ui/Input';
import { FormField ,Document} from '../../types';

const SignDocument: React.FC = () => {
  const { documentId, token } = useParams<{ documentId: string; token: string }>();
  const navigate = useNavigate();
  const { getDocument, signDocument } = useDocuments();
  
  // const [document, setDocument] = useState(getDocument(documentId || ''));
  const [document, setDocument] = useState<Document>();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [signerId, setSignerId] = useState<string | null>(null);
  const [signerName, setSignerName] = useState('');
  const [fieldValues, setFieldValues] = useState<{ [key: string]: string }>({});
  const [currentField, setCurrentField] = useState<FormField | null>(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Validate token and find signer
  useEffect(() => {
    if (!document || !token) {
      navigate('/login');
      return;
    }
    
    // In a real app, you would validate the token against the backend
    // Here we're just simulating this by finding a matching signer
    const signer = document.signers.find(s => s.id === token);
    
    if (!signer) {
      navigate('/login');
      return;
    }
    
    setSignerId(signer.id);
    setSignerName(signer.name);
    
    // Initialize field values
    const initialValues: { [key: string]: string } = {};
    document.fields
      .filter(field => field.signerId === signer.id)
      .forEach(field => {
        if (field.value) {
          initialValues[field.id] = field.value;
        }
      });
    
    setFieldValues(initialValues);
  }, [document, token, navigate]);
  
  // Update document when it changes in context
  useEffect(() => {
    const updatedDoc = getDocument(documentId || '');
    if (updatedDoc) {
      setDocument(updatedDoc);
    } else {
      navigate('/login');
    }
  }, [documentId, getDocument, navigate]);
  
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  
  const handleFieldClick = (field: FormField) => {
    if (!signerId || field.signerId !== signerId) return;
    
    setCurrentField(field);
    
    // Open the appropriate modal based on field type
    if (field.type === 'signature' || field.type === 'initial') {
      setIsSignatureModalOpen(true);
    } else if (field.type === 'date') {
      setIsDateModalOpen(true);
    } else if (field.type === 'text') {
      setIsTextModalOpen(true);
    } else if (field.type === 'checkbox') {
      // Toggle checkbox value directly
      setFieldValues(prev => ({
        ...prev,
        [field.id]: prev[field.id] === 'true' ? 'false' : 'true'
      }));
    }
  };
  
  const handleSignatureComplete = (dataUrl: string) => {
    if (!currentField) return;
    
    setFieldValues(prev => ({
      ...prev,
      [currentField.id]: dataUrl
    }));
    
    setIsSignatureModalOpen(false);
  };
  
  const handleDateComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentField) return;
    
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    setFieldValues(prev => ({
      ...prev,
      [currentField.id]: today
    }));
    
    setIsDateModalOpen(false);
  };
  
  const handleTextComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentField) return;
    
    const textValue = (document.getElementById('text-input') as HTMLInputElement)?.value || '';
    
    setFieldValues(prev => ({
      ...prev,
      [currentField.id]: textValue
    }));
    
    setIsTextModalOpen(false);
  };
  
  const handleSubmit = async () => {
    if (!document || !signerId) return;
    
    // Check if all required fields are completed
    const signerFields = document.fields.filter(field => field.signerId === signerId);
    const requiredFields = signerFields.filter(field => field.required);
    
    const allRequiredFieldsFilled = requiredFields.every(field => 
      fieldValues[field.id] !== undefined && fieldValues[field.id] !== ''
    );
    
    if (!allRequiredFieldsFilled) {
      setError('Please complete all required fields before submitting.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Prepare fields with values
      const fieldsWithValues = signerFields.map(field => ({
        id: field.id,
        value: fieldValues[field.id] || ''
      }));
      
      await signDocument(document.id, signerId, fieldsWithValues);
      
      // Show success message and redirect
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/signing-complete');
      }, 2000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred while signing the document.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Calculate progress
  const calculateProgress = () => {
    if (!document || !signerId) return 0;
    
    const signerFields = document.fields.filter(field => field.signerId === signerId);
    if (signerFields.length === 0) return 100;
    
    const completedFields = signerFields.filter(field => fieldValues[field.id]);
    return Math.round((completedFields.length / signerFields.length) * 100);
  };
  
  if (!document || !signerId) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  // Get fields for the current signer on the current page
  const currentPageFields = document.fields.filter(
    field => field.signerId === signerId && field.page === currentPage
  );
  
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in">
      {/* Success message */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
            <CheckCircle className="h-16 w-16 text-success-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Signed!</h2>
            <p className="text-gray-600 mb-4">
              Thank you for signing the document. You will be redirected shortly.
            </p>
          </div>
        </div>
      )}
      
      {/* Document header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{document.title}</h1>
        {document.description && <p className="text-gray-600 mt-1">{document.description}</p>}
        
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-gray-600">Hello, <span className="font-medium">{signerName}</span></p>
            <p className="text-sm text-gray-500">Please review and sign the document</p>
          </div>
          
          <div className="flex items-center">
            <div className="w-full sm:w-48 bg-gray-200 rounded-full h-2.5 mr-2">
              <div 
                className="bg-primary-600 h-2.5 rounded-full" 
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
            <span className="text-sm text-gray-600">{calculateProgress()}%</span>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 text-error-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-error-700">{error}</p>
        </div>
      )}
      
      {/* Main content */}
      <Card className="overflow-hidden">
        <CardBody className="p-4">
          <PDFViewer
            fileUrl={document.fileUrl}
            currentPage={currentPage}
            scale={scale}
            onTotalPagesChange={setTotalPages}
            onPageChange={handlePageChange}
          >
            {/* Render all fields to show context */}
            {document.fields
              .filter(field => field.page === currentPage)
              .map(field => (
                <SignatureField
                  key={field.id}
                  field={{
                    ...field,
                    value: field.signerId === signerId ? fieldValues[field.id] : field.value
                  }}
                  isSelected={currentField?.id === field.id}
                  onClick={() => field.signerId === signerId && handleFieldClick(field)}
                />
              ))}
          </PDFViewer>
        </CardBody>
        <CardFooter className="bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setScale(scale - 0.1)}
              disabled={scale <= 0.5}
            >
              Zoom Out
            </Button>
            <span className="text-sm text-gray-600">{Math.round(scale * 100)}%</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setScale(scale + 0.1)}
              disabled={scale >= 2.0}
            >
              Zoom In
            </Button>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {/* Fields to complete */}
      {currentPageFields.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-3">
            Fields to Complete on Page {currentPage}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentPageFields.map(field => (
              <Card key={field.id} hoverable onClick={() => handleFieldClick(field)}>
                <CardBody className="p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {field.type === 'signature' && 'Signature'}
                      {field.type === 'initial' && 'Initial'}
                      {field.type === 'date' && 'Date'}
                      {field.type === 'checkbox' && (field.label || 'Checkbox')}
                      {field.type === 'text' && (field.label || 'Text Field')}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {field.required ? 'Required' : 'Optional'}
                    </p>
                  </div>
                  
                  {fieldValues[field.id] ? (
                    <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-success-600" />
                    </div>
                  ) : (
                    <Button variant="outline" size="sm">
                      Complete
                    </Button>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Submit button */}
      <div className="mt-8 flex justify-center">
        <Button
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          isLoading={isSubmitting}
          disabled={calculateProgress() < 100}
        >
          {calculateProgress() < 100 ? 'Complete All Fields to Sign' : 'Complete Signing'}
        </Button>
      </div>
      
      {/* Signature modal */}
      {isSignatureModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {currentField?.type === 'signature' ? 'Draw Your Signature' : 'Draw Your Initials'}
            </h3>
            <SignaturePad 
              onSave={handleSignatureComplete}
              onCancel={() => setIsSignatureModalOpen(false)}
              width={400}
              height={200}
            />
          </div>
        </div>
      )}
      
      {/* Date modal */}
      {isDateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add Date</h3>
            <form onSubmit={handleDateComplete}>
              <p className="mb-4 text-gray-600">
                The current date will be added to the document.
              </p>
              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Add Date
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Text modal */}
      {isTextModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {currentField?.label || 'Add Text'}
            </h3>
            <form onSubmit={handleTextComplete}>
              <Input
                id="text-input"
                fullWidth
                defaultValue={currentField ? fieldValues[currentField.id] || '' : ''}
                placeholder="Enter text here"
                autoFocus
              />
              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsTextModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignDocument;