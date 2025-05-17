import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  Download, 
  Send, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  File, 
  Activity
} from 'lucide-react';
import { useDocuments } from '../../contexts/DocumentContext';
import { AuditEvent } from '../../types';
import Card, { CardBody, CardHeader, CardFooter } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import PDFViewer from '../../components/document/PDFViewer';
import SignatureField from '../../components/document/SignatureField';
import SignersList from '../../components/document/SignersList';
import { format } from 'date-fns';

const DocumentView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDocument, sendDocument, isLoading } = useDocuments();
  
  const [document, setDocument] = useState(getDocument(id || ''));
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isAuditTrailOpen, setIsAuditTrailOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // Update local document when it changes in context
  useEffect(() => {
    const updatedDoc = getDocument(id || '');
    if (updatedDoc) {
      setDocument(updatedDoc);
    } else {
      // Document not found, redirect to documents list
      navigate('/documents');
    }
  }, [id, getDocument, navigate]);
  
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  
  const handleSendDocument = async () => {
    if (!document) return;
    
    // Validate the document is ready to send
    if (document.signers.length === 0) {
      alert('You need to add at least one signer before sending the document.');
      return;
    }
    
    setIsSending(true);
    
    try {
      const updatedDoc = await sendDocument(document.id);
      setDocument(updatedDoc);
    } catch (error) {
      console.error('Failed to send document:', error);
    } finally {
      setIsSending(false);
    }
  };
  
  const downloadDocument = () => {
    if (!document) return;
    
    // Create an anchor element and trigger download
    const a = document.createElement('a');
    a.href = document.fileUrl;
    a.download = `${document.title}.pdf`;
    a.click();
  };
  
  const formatActionText = (action: string): string => {
    switch(action) {
      case 'document_created': return 'Document created';
      case 'document_uploaded': return 'Document uploaded';
      case 'document_sent': return 'Document sent for signature';
      case 'document_viewed': return 'Document viewed';
      case 'document_signed': return 'Document signed';
      case 'document_completed': return 'Document completed';
      case 'signer_added': return 'Signer added';
      case 'field_added': return 'Field added';
      default: return action.replace(/_/g, ' ');
    }
  };
  
  if (isLoading || !document) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            className="mr-2"
            onClick={() => navigate('/documents')}
            leftIcon={<ChevronLeft className="h-4 w-4" />}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 truncate max-w-md">{document.title}</h1>
            {document.description && <p className="text-gray-600">{document.description}</p>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
            ${document.status === 'draft' ? 'bg-gray-100 text-gray-800' : ''}
            ${document.status === 'sent' ? 'bg-warning-100 text-warning-800' : ''}
            ${document.status === 'completed' ? 'bg-success-100 text-success-800' : ''}
            ${document.status === 'declined' ? 'bg-error-100 text-error-800' : ''}
            ${document.status === 'expired' ? 'bg-gray-100 text-gray-800' : ''}
          `}>
            {document.status === 'draft' && <File className="h-4 w-4 mr-1" />}
            {document.status === 'sent' && <Clock className="h-4 w-4 mr-1" />}
            {document.status === 'completed' && <CheckCircle className="h-4 w-4 mr-1" />}
            {document.status === 'declined' && <AlertTriangle className="h-4 w-4 mr-1" />}
            {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
          </span>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={downloadDocument}
              leftIcon={<Download className="h-4 w-4" />}
            >
              Download
            </Button>
            
            {document.status === 'draft' && (
              <>
                <Button
                  as={Link}
                  to={`/documents/edit/${document.id}`}
                  variant="outline"
                >
                  Edit
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSendDocument}
                  isLoading={isSending}
                  leftIcon={<Send className="h-4 w-4" />}
                >
                  Send for Signature
                </Button>
              </>
            )}
            
            <Button
              variant={isAuditTrailOpen ? 'primary' : 'outline'}
              onClick={() => setIsAuditTrailOpen(!isAuditTrailOpen)}
              leftIcon={<Activity className="h-4 w-4" />}
            >
              Audit Trail
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left panel - Document info */}
        <div className="w-full lg:w-64 space-y-6">
          {/* Signers panel */}
          <Card>
            <CardBody>
              <SignersList
                signers={document.signers}
                onAddSigner={() => {}}
                readOnly={true}
              />
            </CardBody>
          </Card>
          
          {/* Audit trail panel (visible when activated) */}
          {isAuditTrailOpen && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">Audit Trail</h2>
              </CardHeader>
              <CardBody className="p-0 max-h-96 overflow-y-auto">
                <div className="divide-y divide-gray-200">
                  {document.auditTrail
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((event) => (
                      <div key={event.id} className="py-3 px-4 hover:bg-gray-50">
                        <div className="flex items-start">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {formatActionText(event.action)}
                            </p>
                            <div className="mt-1 flex items-center text-xs text-gray-500">
                              <span>
                                {format(new Date(event.timestamp), 'MMM d, yyyy h:mm a')}
                              </span>
                              {event.email && (
                                <>
                                  <span className="mx-1">•</span>
                                  <span>{event.email}</span>
                                </>
                              )}
                            </div>
                            {event.details && (
                              <p className="mt-1 text-xs text-gray-600">
                                {event.details}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>
        
        {/* Main content - PDF viewer */}
        <div className="flex-1">
          <Card className="overflow-hidden">
            <CardBody className="p-4">
              <PDFViewer
                fileUrl={document.fileUrl}
                currentPage={currentPage}
                scale={scale}
                onTotalPagesChange={setTotalPages}
                onPageChange={handlePageChange}
              >
                {/* Render existing fields for the current page */}
                {document.fields
                  .filter(field => field.page === currentPage)
                  .map(field => (
                    <SignatureField
                      key={field.id}
                      field={field}
                    />
                  ))}
              </PDFViewer>
            </CardBody>
            <CardFooter className="bg-gray-50 border-t border-gray-200 flex justify-between items-center p-4">
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
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DocumentView;