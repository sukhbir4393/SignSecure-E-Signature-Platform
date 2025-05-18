export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt: string;
  modifiedAt: string;
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
  type: 'signature' | 'text' | 'date' | 'checkbox' | 'initial';
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  required: boolean;
  signer: string;
  value?: string;
  label?: string;
}

export interface Document {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  modified_at: string;
  ownerId: string;
  status: 'draft' | 'sent' | 'completed' | 'declined' | 'expired';
  expires_at?: string;
  file: string;
  fileType: string;
  signers: Signer[];
  fields: FormField[];
  audit_trail: AuditEvent[];
  current_signer?: Signer
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