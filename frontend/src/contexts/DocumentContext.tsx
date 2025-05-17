import React, { createContext, useState, useContext, useEffect } from 'react';
import { Document, Signer, FormField, AuditEvent } from '../types';
import { mockDocuments } from '../data/mockData';
import { useUser } from './UserContext';

interface DocumentContextType {
  documents: Document[];
  getDocument: (id: string) => Document | undefined;
  createDocument: (document: Partial<Document>) => Promise<Document>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<Document>;
  uploadDocument: (file: File, title: string, description?: string) => Promise<Document>;
  addSigner: (documentId: string, signer: Partial<Signer>) => Promise<Document>;
  addField: (documentId: string, field: Partial<FormField>) => Promise<Document>;
  sendDocument: (documentId: string) => Promise<Document>;
  signDocument: (documentId: string, signerId: string, fields: Partial<FormField>[]) => Promise<Document>;
  isLoading: boolean;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useUser();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load documents for the current user
    if (currentUser) {
      loadUserDocuments();
    } else {
      setDocuments([]);
    }
  }, [currentUser]);

  const loadUserDocuments = () => {
    setIsLoading(true);
    try {
      // Simulate API call
      // In a real app, this would fetch from your backend
      const userDocs = mockDocuments.filter(doc => doc.ownerId === currentUser?.id);
      setDocuments(userDocs);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDocument = (id: string) => {
    console.log('documents',documents)
    return documents.find(doc => doc.id === id);
  };

  const createDocument = async (document: Partial<Document>): Promise<Document> => {
    setIsLoading(true);
    try {
      // Simulate API call
      const newDocument: Document = {
        id: `doc-${Date.now()}`,
        title: document.title || 'Untitled Document',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ownerId: currentUser?.id || '',
        status: 'draft',
        fileUrl: '/sample-documents/sales-agreement.pdf',
        // fileUrl: document.fileUrl || '',
        fileType: document.fileType || 'application/pdf',
        signers: document.signers || [],
        fields: document.fields || [],
        auditTrail: [{
          id: `audit-${Date.now()}`,
          documentId: `doc-${Date.now()}`,
          userId: currentUser?.id,
          email: currentUser?.email,
          action: 'document_created',
          timestamp: new Date().toISOString(),
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent,
        }],
        ...document,
      };

      setDocuments(prev => [...prev, newDocument]);
      return newDocument;
    } finally {
      setIsLoading(false);
    }
  };

  const updateDocument = async (id: string, updates: Partial<Document>): Promise<Document> => {
    setIsLoading(true);
    try {
      // Simulate API call
      const updatedDocuments = documents.map(doc => {
        if (doc.id === id) {
          return {
            ...doc,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
        }
        return doc;
      });

      setDocuments(updatedDocuments);
      const updatedDoc = updatedDocuments.find(doc => doc.id === id);
      
      if (!updatedDoc) {
        throw new Error('Document not found');
      }
      
      return updatedDoc;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadDocument = async (file: File, title: string, description?: string): Promise<Document> => {
    setIsLoading(true);
    try {
      // Simulate file upload and API call
      // In a real app, this would upload to cloud storage
      // const fileUrl = URL.createObjectURL(file);
      const fileUrl = '/sample-documents/sales-agreement.pdf'
      const newDocument: Document = {
        id: `doc-${Date.now()}`,
        title: title || file.name,
        description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ownerId: currentUser?.id || '',
        status: 'draft',
        fileUrl,
        fileType: file.type,
        signers: [],
        fields: [],
        auditTrail: [{
          id: `audit-${Date.now()}`,
          documentId: `doc-${Date.now()}`,
          userId: currentUser?.id,
          email: currentUser?.email,
          action: 'document_uploaded',
          timestamp: new Date().toISOString(),
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent,
        }],
      };

      setDocuments(prev => [...prev, newDocument]);
      return newDocument;
    } finally {
      setIsLoading(false);
    }
  };

  const addSigner = async (documentId: string, signer: Partial<Signer>): Promise<Document> => {
    const document = getDocument(documentId);
    
    if (!document) {
      throw new Error('Document not found');
    }

    const newSigner: Signer = {
      id: `signer-${Date.now()}`,
      email: signer.email || '',
      name: signer.name || '',
      role: signer.role || 'signer',
      order: signer.order || document.signers.length + 1,
      status: 'pending',
      ...signer,
    };

    return updateDocument(documentId, {
      signers: [...document.signers, newSigner],
      auditTrail: [...document.auditTrail, {
        id: `audit-${Date.now()}`,
        documentId,
        userId: currentUser?.id,
        email: currentUser?.email,
        action: 'signer_added',
        timestamp: new Date().toISOString(),
        details: `Added signer: ${newSigner.email}`,
      }],
    });
  };

  const addField = async (documentId: string, field: Partial<FormField>): Promise<Document> => {
    const document = getDocument(documentId);
    
    if (!document) {
      throw new Error('Document not found');
    }

    const newField: FormField = {
      id: `field-${Date.now()}`,
      type: field.type || 'signature',
      x: field.x || 0,
      y: field.y || 0,
      width: field.width || 200,
      height: field.height || 50,
      page: field.page || 1,
      required: field.required !== undefined ? field.required : true,
      signerId: field.signerId || '',
      ...field,
    };

    return updateDocument(documentId, {
      fields: [...document.fields, newField],
      auditTrail: [...document.auditTrail, {
        id: `audit-${Date.now()}`,
        documentId,
        userId: currentUser?.id,
        email: currentUser?.email,
        action: 'field_added',
        timestamp: new Date().toISOString(),
        details: `Added ${newField.type} field`,
      }],
    });
  };

  const sendDocument = async (documentId: string): Promise<Document> => {
    const document = getDocument(documentId);
    
    if (!document) {
      throw new Error('Document not found');
    }

    // Simulate sending emails to signers
    console.log(`Sending document ${documentId} to signers:`, document.signers);

    return updateDocument(documentId, {
      status: 'sent',
      auditTrail: [...document.auditTrail, {
        id: `audit-${Date.now()}`,
        documentId,
        userId: currentUser?.id,
        email: currentUser?.email,
        action: 'document_sent',
        timestamp: new Date().toISOString(),
        details: `Document sent to ${document.signers.length} signers`,
      }],
    });
  };

  const signDocument = async (
    documentId: string, 
    signerId: string, 
    fields: Partial<FormField>[]
  ): Promise<Document> => {
    const document = getDocument(documentId);
    
    if (!document) {
      throw new Error('Document not found');
    }

    const signer = document.signers.find(s => s.id === signerId);
    
    if (!signer) {
      throw new Error('Signer not found');
    }

    // Update fields with values
    const updatedFields = document.fields.map(field => {
      const updatedField = fields.find(f => f.id === field.id);
      if (updatedField && field.signerId === signerId) {
        return { ...field, ...updatedField };
      }
      return field;
    });

    // Update signer status
    const updatedSigners = document.signers.map(s => {
      if (s.id === signerId) {
        return { ...s, status: 'signed', signedAt: new Date().toISOString() };
      }
      return s;
    });

    // Check if all signers have signed
    const allSigned = updatedSigners.every(s => s.status === 'signed');
    const newStatus = allSigned ? 'completed' : 'sent';

    return updateDocument(documentId, {
      status: newStatus,
      signers: updatedSigners,
      fields: updatedFields,
      auditTrail: [...document.auditTrail, {
        id: `audit-${Date.now()}`,
        documentId,
        email: signer.email,
        action: 'document_signed',
        timestamp: new Date().toISOString(),
        ipAddress: '127.0.0.1',
        userAgent: navigator.userAgent,
        details: `Document signed by ${signer.name} (${signer.email})`,
      }],
    });
  };

  return (
    <DocumentContext.Provider
      value={{
        documents,
        getDocument,
        createDocument,
        updateDocument,
        uploadDocument,
        addSigner,
        addField,
        sendDocument,
        signDocument,
        isLoading,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};