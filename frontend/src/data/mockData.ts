import { User, Document, Signer, FormField, AuditEvent } from '../types';

// Mock users for testing
export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'alice@example.com',
    name: 'Alice Johnson',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
    role: 'admin',
    createdAt: '2023-01-15T08:30:00Z',
  },
  {
    id: 'user-2',
    email: 'bob@example.com',
    name: 'Bob Smith',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    role: 'user',
    createdAt: '2023-02-20T10:15:00Z',
  },
  {
    id: 'user-3',
    email: 'demo@example.com',
    name: 'Demo User',
    role: 'user',
    createdAt: '2023-04-10T14:20:00Z',
  },
];

// Mock documents for testing
export const mockDocuments: Document[] = [
  {
    id: 'doc-1',
    title: 'Employment Contract',
    description: 'Standard employment contract for new hires',
    createdAt: '2023-03-10T09:45:00Z',
    updatedAt: '2023-03-15T11:30:00Z',
    ownerId: 'user-1',
    status: 'completed',
    fileUrl: '/sample-documents/employment-contract.pdf',
    fileType: 'application/pdf',
    signers: [
      {
        id: 'signer-1',
        email: 'candidate@example.com',
        name: 'Jane Candidate',
        role: 'Candidate',
        order: 1,
        status: 'signed',
        signedAt: '2023-03-14T15:20:00Z',
        viewedAt: '2023-03-14T15:10:00Z',
      },
      {
        id: 'signer-2',
        email: 'hr@example.com',
        name: 'HR Manager',
        role: 'Manager',
        order: 2,
        status: 'signed',
        signedAt: '2023-03-15T10:45:00Z',
        viewedAt: '2023-03-15T10:40:00Z',
      },
    ],
    fields: [
      {
        id: 'field-1',
        type: 'signature',
        x: 100,
        y: 500,
        width: 200,
        height: 50,
        page: 3,
        required: true,
        signerId: 'signer-1',
        value: 'signature-data-url',
      },
      {
        id: 'field-2',
        type: 'date',
        x: 400,
        y: 500,
        width: 150,
        height: 40,
        page: 3,
        required: true,
        signerId: 'signer-1',
        value: '2023-03-14',
      },
      {
        id: 'field-3',
        type: 'signature',
        x: 100,
        y: 600,
        width: 200,
        height: 50,
        page: 3,
        required: true,
        signerId: 'signer-2',
        value: 'signature-data-url-2',
      },
    ],
    auditTrail: [
      {
        id: 'audit-1',
        documentId: 'doc-1',
        userId: 'user-1',
        email: 'alice@example.com',
        action: 'document_created',
        timestamp: '2023-03-10T09:45:00Z',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      },
      {
        id: 'audit-2',
        documentId: 'doc-1',
        userId: 'user-1',
        email: 'alice@example.com',
        action: 'document_sent',
        timestamp: '2023-03-12T10:30:00Z',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      },
      {
        id: 'audit-3',
        documentId: 'doc-1',
        email: 'candidate@example.com',
        action: 'document_viewed',
        timestamp: '2023-03-14T15:10:00Z',
        ipAddress: '192.168.1.2',
        userAgent: 'Mozilla/5.0',
      },
      {
        id: 'audit-4',
        documentId: 'doc-1',
        email: 'candidate@example.com',
        action: 'document_signed',
        timestamp: '2023-03-14T15:20:00Z',
        ipAddress: '192.168.1.2',
        userAgent: 'Mozilla/5.0',
      },
      {
        id: 'audit-5',
        documentId: 'doc-1',
        email: 'hr@example.com',
        action: 'document_viewed',
        timestamp: '2023-03-15T10:40:00Z',
        ipAddress: '192.168.1.3',
        userAgent: 'Mozilla/5.0',
      },
      {
        id: 'audit-6',
        documentId: 'doc-1',
        email: 'hr@example.com',
        action: 'document_signed',
        timestamp: '2023-03-15T10:45:00Z',
        ipAddress: '192.168.1.3',
        userAgent: 'Mozilla/5.0',
      },
      {
        id: 'audit-7',
        documentId: 'doc-1',
        action: 'document_completed',
        timestamp: '2023-03-15T10:45:00Z',
      },
    ],
  },
  {
    id: 'doc-2',
    title: 'Non-Disclosure Agreement',
    description: 'Confidentiality agreement for contractors',
    createdAt: '2023-04-05T14:20:00Z',
    updatedAt: '2023-04-05T14:20:00Z',
    ownerId: 'user-1',
    status: 'sent',
    fileUrl: '/sample-documents/nda.pdf',
    fileType: 'application/pdf',
    signers: [
      {
        id: 'signer-3',
        email: 'contractor@example.com',
        name: 'Contractor Name',
        role: 'Contractor',
        order: 1,
        status: 'pending',
      },
    ],
    fields: [
      {
        id: 'field-4',
        type: 'signature',
        x: 100,
        y: 700,
        width: 200,
        height: 50,
        page: 2,
        required: true,
        signerId: 'signer-3',
      },
      {
        id: 'field-5',
        type: 'date',
        x: 400,
        y: 700,
        width: 150,
        height: 40,
        page: 2,
        required: true,
        signerId: 'signer-3',
      },
      {
        id: 'field-6',
        type: 'text',
        x: 100,
        y: 600,
        width: 300,
        height: 40,
        page: 2,
        required: true,
        signerId: 'signer-3',
        label: 'Company Name',
      },
    ],
    auditTrail: [
      {
        id: 'audit-8',
        documentId: 'doc-2',
        userId: 'user-1',
        email: 'alice@example.com',
        action: 'document_created',
        timestamp: '2023-04-05T14:20:00Z',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      },
      {
        id: 'audit-9',
        documentId: 'doc-2',
        userId: 'user-1',
        email: 'alice@example.com',
        action: 'document_sent',
        timestamp: '2023-04-05T14:25:00Z',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      },
    ],
  },
  {
    id: 'doc-3',
    title: 'Sales Agreement',
    description: 'Product sales agreement',
    createdAt: '2023-04-10T11:15:00Z',
    updatedAt: '2023-04-10T11:15:00Z',
    ownerId: 'user-1',
    status: 'draft',
    fileUrl: '/sample-documents/sales-agreement.pdf',
    fileType: 'application/pdf',
    signers: [],
    fields: [],
    auditTrail: [
      {
        id: 'audit-10',
        documentId: 'doc-3',
        userId: 'user-1',
        email: 'alice@example.com',
        action: 'document_created',
        timestamp: '2023-04-10T11:15:00Z',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      },
    ],
  },
];