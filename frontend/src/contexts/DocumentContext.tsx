import React, { createContext, useState, useContext, useEffect } from 'react';
import { Document, Signer, FormField, AuditEvent } from '../types';
import { mockDocuments } from '../data/mockData';
import { useUser } from './UserContext';
import api from '../config/api';
import axios from 'axios';

interface DocumentContextType {
  documents: Document[];
  getDocument: (id: string) => Promise<Document>;
  getDocumentForSigning: (id: string,token: string) => Promise<Document>;
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

  const loadUserDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<Document[]>('/documents/');
      setDocuments(response.data);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Load documents for the current user
    if (currentUser) {
      loadUserDocuments();
    } else {
      setDocuments([]);
    }
  }, [currentUser]);


  const getDocumentForSigning = async (id: string,token: string) => {
    setIsLoading(true);
    try {
      const response = await api.post<Document>(`/documents/${id}/get_document_for_signing/`,{
        'token':token
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching document:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getDocument = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await api.get<Document>(`/documents/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching document:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createDocument = async (document: Partial<Document>): Promise<Document> => {
    setIsLoading(true);
    try {
      const response = await api.post<Document>('/documents/', {
        title: document.title || 'Untitled Document',
        description: document.description || '',
        file_type: document.fileType || 'application/pdf',
        status: 'draft',
        ...document
      });

      const newDocument = response.data;
      setDocuments(prev => [...prev, newDocument]);
      return newDocument;
    } catch (error) {
      console.error('Failed to create document:', error);
      throw error;
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
            modifiedAt: new Date().toISOString(),
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
      const formData = new FormData();
      formData.append('title', title || file.name);
      formData.append('description', description || '');
      formData.append('status', 'draft');
      formData.append('file', file);
      formData.append('file_type', file.type);

      const response = await api.post<Document>('/documents/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const newDocument = response.data;
      setDocuments(prev => [...prev, newDocument]);
      return newDocument;
    } catch (error) {
      console.error('Failed to upload document:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addSigner = async (documentId: string, signer: Partial<Signer>): Promise<Document> => {
    setIsLoading(true);
    try {
      const response = await api.post<Signer>('/signers/', {
        document: documentId,
        email: signer.email || '',
        name: signer.name || '',
        role: signer.role || 'signer',
        order: signer.order || 0,
        status: 'pending'
      });

      // return updateDocument(documentId, {
      //   signers: [...document.signers, newSigner],
      //   auditTrail: [...document.auditTrail, {
      //     id: `audit-${Date.now()}`,
      //     documentId,
      //     userId: currentUser?.id,
      //     email: currentUser?.email,
      //     action: 'signer_added',
      //     timestamp: new Date().toISOString(),
      //     details: `Added signer: ${newSigner.email}`,
      //   }],
      // });
      
      // Refresh the document to get updated signers
      const updatedDocument = await getDocument(documentId);
      console.log('updatedDocument',updatedDocument)
      if (!updatedDocument) {
        throw new Error('Document not found after adding signer');
      }

      return updatedDocument;
    } catch (error) {
      console.error('Failed to add signer:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addField = async (documentId: string, field: Partial<FormField>): Promise<Document> => {
    const document = await getDocument(documentId);
    
    if (!document) {
      throw new Error('Document not found');
    }

    try {
      const response = await api.post<FormField>('/fields/', {
        document: documentId,
        signer: field.signerId,
        type: field.type || 'signature',
        x: field.x || 0,
        y: field.y || 0,
        width: field.width || 200,
        height: field.height || 50,
        page: field.page || 1,
        required: field.required !== undefined ? field.required : true,
        value: field.value || '',
        label: field.label || ''
      });

      // Refresh the document to get the updated fields
      return await getDocument(documentId);
    } catch (error) {
      console.error('Error adding field:', error);
      throw error;
    }
  };

  const sendDocument = async (documentId: string): Promise<Document> => {
    try {
      // Call the send_for_signature endpoint
      const response = await api.post<Document>(`/documents/${documentId}/send_for_signature/`);
      
      // Refresh the document to get the updated status
      const updatedDocument = await getDocument(documentId);
      if (!updatedDocument) {
        throw new Error('Document not found after sending');
      }

      return updatedDocument;
    } catch (error) {
      console.error('Failed to send document:', error);
      throw error;
    }
  };

  const signDocument = async (
    documentId: string, 
    signerId: string, 
    fields: Partial<FormField>[]
  ): Promise<Document> => {
    const document = await getDocument(documentId);
    
    if (!document) {
      throw new Error('Document not found');
    }

    const signer = document.signers.find((s: Signer) => s.id === signerId);
    
    if (!signer) {
      throw new Error('Signer not found');
    }

    // Update fields with values
    const updatedFields = document.fields.map((field: FormField) => {
      const updatedField = fields.find(f => f.id === field.id);
      if (updatedField && field.signerId === signerId) {
        return { ...field, ...updatedField };
      }
      return field;
    });

    // Update signer status
    const updatedSigners = document.signers.map((s: Signer) => {
      if (s.id === signerId) {
        return { ...s, status: 'signed', signedAt: new Date().toISOString() };
      }
      return s;
    });

    // Check if all signers have signed
    const allSigned = updatedSigners.every((s: Signer) => s.status === 'signed');
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
        getDocumentForSigning,
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