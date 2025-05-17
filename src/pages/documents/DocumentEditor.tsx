import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, FileSignature as Signature, FileText, Calendar, CheckSquare, Edit, UserPlus, Save, Send } from 'lucide-react';
import { useDocuments } from '../../contexts/DocumentContext';
import { FormField, Signer } from '../../types';
import Card, { CardBody, CardHeader, CardFooter } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import PDFViewer from '../../components/document/PDFViewer';
import SignatureField from '../../components/document/SignatureField';
import SignersList from '../../components/document/SignersList';

type ToolType = 'signature' | 'text' | 'date' | 'checkbox' | 'initial';

const DocumentEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDocument, updateDocument, addSigner, addField, sendDocument, isLoading } = useDocuments();
  
  const [document, setDocument] = useState(getDocument(id || ''));
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [selectedTool, setSelectedTool] = useState<ToolType | null>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [selectedSigner, setSelectedSigner] = useState<string | null>(null);
  const [isSignersOpen, setIsSignersOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  console.log('DocumentEditor: document',document)
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
  
  const handleAddField = async (x: number, y: number) => {
    if (!document || !selectedTool || !selectedSigner) return;
    
    const field: Partial<FormField> = {
      type: selectedTool,
      x,
      y,
      width: selectedTool === 'signature' ? 200 : selectedTool === 'initial' ? 100 : 150,
      height: selectedTool === 'checkbox' ? 40 : 50,
      page: currentPage,
      required: true,
      signerId: selectedSigner,
    };
    
    if (selectedTool === 'text') {
      field.label = 'Text Field';
    }
    
    try {
      const updatedDoc = await addField(document.id, field);
      setDocument(updatedDoc);
      
      // Reset selected tool after placing
      setSelectedTool(null);
    } catch (error) {
      console.error('Failed to add field:', error);
    }
  };
  
  const handlePDFClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedTool || !selectedSigner) return;
    
    const canvas = event.currentTarget as HTMLElement;
    const rect = canvas.getBoundingClientRect();
    
    // Calculate position relative to the canvas
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    handleAddField(x, y);
  };
  
  const handleAddSigner = async (signer: Partial<Signer>) => {
    if (!document) return;
    
    try {
      const updatedDoc = await addSigner(document.id, signer);
      setDocument(updatedDoc);
      
      // Auto-select the new signer
      const newSigner = updatedDoc.signers[updatedDoc.signers.length - 1];
      setSelectedSigner(newSigner.id);
      
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to add signer:', error);
      return Promise.reject(error);
    }
  };
  
  const handleRemoveField = async (fieldId: string) => {
    if (!document) return;
    
    try {
      const updatedFields = document.fields.filter(field => field.id !== fieldId);
      const updatedDoc = await updateDocument(document.id, { fields: updatedFields });
      setDocument(updatedDoc);
      setSelectedField(null);
    } catch (error) {
      console.error('Failed to remove field:', error);
    }
  };
  
  const handleRemoveSigner = async (signerId: string) => {
    if (!document) return;
    
    // First check if this signer has any fields
    const signerHasFields = document.fields.some(field => field.signerId === signerId);
    
    if (signerHasFields) {
      // Show confirmation dialog
      const confirmed = window.confirm(
        'This signer has fields assigned to them. Removing this signer will also remove all their fields. Continue?'
      );
      
      if (!confirmed) return;
      
      // Remove signer's fields
      const fieldsToKeep = document.fields.filter(field => field.signerId !== signerId);
      
      // Update the document with remaining fields
      try {
        await updateDocument(document.id, { fields: fieldsToKeep });
      } catch (error) {
        console.error('Failed to remove signer fields:', error);
        return;
      }
    }
    
    // Now remove the signer
    try {
      const updatedSigners = document.signers.filter(signer => signer.id !== signerId);
      const updatedDoc = await updateDocument(document.id, { signers: updatedSigners });
      setDocument(updatedDoc);
      
      // If the selected signer was removed, clear selection
      if (selectedSigner === signerId) {
        setSelectedSigner(null);
      }
    } catch (error) {
      console.error('Failed to remove signer:', error);
    }
  };
  
  const handleSaveDocument = async () => {
    if (!document) return;
    
    setIsSaving(true);
    
    try {
      // Just update the timestamp
      const updatedDoc = await updateDocument(document.id, { 
        updatedAt: new Date().toISOString() 
      });
      setDocument(updatedDoc);
    } catch (error) {
      console.error('Failed to save document:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSendDocument = async () => {
    if (!document) return;
    
    // Validate the document is ready to send
    if (document.signers.length === 0) {
      alert('You need to add at least one signer before sending the document.');
      return;
    }
    
    const signerIds = document.signers.map(signer => signer.id);
    const allSignersHaveFields = signerIds.every(signerId => 
      document.fields.some(field => field.signerId === signerId)
    );
    
    if (!allSignersHaveFields) {
      alert('Each signer must have at least one field assigned to them.');
      return;
    }
    
    setIsSending(true);
    
    try {
      const updatedDoc = await sendDocument(document.id);
      setDocument(updatedDoc);
      
      // Redirect to document view
      navigate(`/documents/view/${document.id}`);
    } catch (error) {
      console.error('Failed to send document:', error);
    } finally {
      setIsSending(false);
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
            <p className="text-gray-600">{document.description}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={handleSaveDocument}
            isLoading={isSaving}
            leftIcon={<Save className="h-4 w-4" />}
          >
            Save
          </Button>
          <Button
            variant="primary"
            onClick={handleSendDocument}
            isLoading={isSending}
            leftIcon={<Send className="h-4 w-4" />}
          >
            Send for Signature
          </Button>
        </div>
      </div>
      
      {/* Editor layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left panel - Tools and signers */}
        <div className="w-full lg:w-64 space-y-6">
          {/* Tools panel */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Field Tools</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  className={`p-2 flex flex-col items-center rounded border text-sm
                    ${selectedTool === 'signature' 
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }
                  `}
                  onClick={() => setSelectedTool('signature')}
                  disabled={!selectedSigner}
                >
                  <Signature className="h-5 w-5 mb-1" />
                  Signature
                </button>
                <button
                  className={`p-2 flex flex-col items-center rounded border text-sm
                    ${selectedTool === 'initial' 
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }
                  `}
                  onClick={() => setSelectedTool('initial')}
                  disabled={!selectedSigner}
                >
                  <Edit className="h-5 w-5 mb-1" />
                  Initial
                </button>
                <button
                  className={`p-2 flex flex-col items-center rounded border text-sm
                    ${selectedTool === 'date' 
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }
                  `}
                  onClick={() => setSelectedTool('date')}
                  disabled={!selectedSigner}
                >
                  <Calendar className="h-5 w-5 mb-1" />
                  Date
                </button>
                <button
                  className={`p-2 flex flex-col items-center rounded border text-sm
                    ${selectedTool === 'text' 
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }
                  `}
                  onClick={() => setSelectedTool('text')}
                  disabled={!selectedSigner}
                >
                  <FileText className="h-5 w-5 mb-1" />
                  Text
                </button>
                <button
                  className={`p-2 flex flex-col items-center rounded border text-sm
                    ${selectedTool === 'checkbox' 
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }
                  `}
                  onClick={() => setSelectedTool('checkbox')}
                  disabled={!selectedSigner}
                >
                  <CheckSquare className="h-5 w-5 mb-1" />
                  Checkbox
                </button>
                {/* Empty space to keep grid even */}
                <div className="invisible"></div>
              </div>
              
              {!selectedSigner && (
                <div className="bg-warning-50 text-warning-800 p-2 rounded text-sm">
                  Select a signer before adding fields
                </div>
              )}
            </CardBody>
          </Card>
          
          {/* Signers panel */}
          <Card>
            <CardBody>
              <SignersList
                signers={document.signers}
                onAddSigner={handleAddSigner}
                onRemoveSigner={handleRemoveSigner}
              />
              
              {document.signers.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Signer</h4>
                  <div className="flex flex-wrap gap-2">
                    {document.signers.map(signer => (
                      <button
                        key={signer.id}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm
                          ${selectedSigner === signer.id 
                            ? 'bg-primary-100 text-primary-800 border-2 border-primary-300'
                            : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
                          }
                        `}
                        onClick={() => setSelectedSigner(signer.id)}
                      >
                        {signer.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
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
                isEditable={true}
                onClick={handlePDFClick}
              >
                {/* Render existing fields for the current page */}
                {document.fields
                  .filter(field => field.page === currentPage)
                  .map(field => (
                    <SignatureField
                      key={field.id}
                      field={field}
                      isSelected={selectedField === field.id}
                      isEditable={true}
                      onClick={() => setSelectedField(field.id)}
                      onRemove={() => handleRemoveField(field.id)}
                    />
                  ))}
              </PDFViewer>
            </CardBody>
            <CardFooter className="bg-gray-50 border-t border-gray-200 flex justify-between items-center">
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
              <div className="text-sm text-gray-600">
                {selectedTool ? (
                  <span className="text-primary-600">
                    Click on the document to place a {selectedTool} field
                  </span>
                ) : (
                  <span>
                    Select a tool and click on the document to add fields
                  </span>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DocumentEditor;