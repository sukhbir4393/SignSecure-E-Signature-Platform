export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface Signer {
  id: string;
  email: string;
  name: string;
  role: string;
  order: number;
  status: 'pending' | 'viewed' | 'signed' | 'declined';
  signedAt?: string;
  viewedAt?: string;
}

export interface FormField {
  id: string;
  type: 'signature' | 'text' | 'date' | 'checkbox' | 'initial' | 'move';
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  required: boolean;
  signerId: string;
  value?: string;
  label?: string;
}

export interface Document {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  status: 'draft' | 'sent' | 'completed' | 'declined' | 'expired';
  expiresAt?: string;
  fileUrl: string;
  fileType: string;
  signers: Signer[];
  fields: FormField[];
  auditTrail: AuditEvent[];
}

export interface AuditEvent {
  id: string;
  documentId: string;
  userId?: string;
  email?: string;
  action: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  details?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  documentId?: string;
  type: 'document_sent' | 'document_viewed' | 'document_signed' | 'document_declined' | 'reminder';
}