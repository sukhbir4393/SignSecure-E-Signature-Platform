import React, { useState } from 'react';
import { UserPlus, X, User, Mail, Edit2, Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Signer } from '../../types';

interface SignersListProps {
  signers: Signer[];
  onAddSigner: (signer: Partial<Signer>) => Promise<void>;
  onRemoveSigner?: (signerId: string) => void;
  readOnly?: boolean;
}

const SignersList: React.FC<SignersListProps> = ({
  signers,
  onAddSigner,
  onRemoveSigner,
  readOnly = false
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!newName.trim()) {
      setError('Name is required');
      return;
    }
    
    if (!newEmail.trim()) {
      setError('Email is required');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onAddSigner({
        name: newName.trim(),
        email: newEmail.trim(),
        role: newRole.trim() || 'Signer',
        order: signers.length + 1,
      });
      
      // Reset form
      setNewName('');
      setNewEmail('');
      setNewRole('');
      setIsAddingNew(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to add signer');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Signers</h3>
        
        {!readOnly && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<UserPlus className="h-4 w-4" />}
            onClick={() => setIsAddingNew(true)}
            disabled={isAddingNew}
          >
            Add Signer
          </Button>
        )}
      </div>
      
      {signers.length === 0 && !isAddingNew && (
        <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-200">
          <User className="h-8 w-8 text-gray-400 mx-auto" />
          <p className="mt-2 text-sm text-gray-500">No signers added yet</p>
          {!readOnly && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => setIsAddingNew(true)}
            >
              Add a signer
            </Button>
          )}
        </div>
      )}
      
      {isAddingNew && !readOnly && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 animate-fade-in">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-gray-700">Add New Signer</h4>
            <button 
              onClick={() => setIsAddingNew(false)} 
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          {error && (
            <div className="mb-3 p-2 bg-error-50 border border-error-200 rounded text-error-700 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              label="Name"
              placeholder="Full Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              leftIcon={<User className="h-4 w-4" />}
              fullWidth
              required
            />
            
            <Input
              label="Email"
              type="email"
              placeholder="Email Address"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              leftIcon={<Mail className="h-4 w-4" />}
              fullWidth
              required
            />
            
            <Input
              label="Role (Optional)"
              placeholder="e.g., Manager, Client, Witness"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              fullWidth
            />
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsAddingNew(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                isLoading={isSubmitting}
              >
                Add Signer
              </Button>
            </div>
          </form>
        </div>
      )}
      
      {signers.length > 0 && (
        <ul className="space-y-2">
          {signers.map((signer, index) => (
            <li 
              key={signer.id} 
              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                  {signer.name.charAt(0)}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{signer.name}</p>
                  <p className="text-xs text-gray-500">{signer.email}</p>
                  {signer.role && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mt-1">
                      {signer.role}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center">
                {signer.status === 'signed' && (
                  <span className="mr-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-success-100 text-success-800">
                    Signed
                  </span>
                )}
                {signer.status === 'viewed' && (
                  <span className="mr-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-warning-100 text-warning-800">
                    Viewed
                  </span>
                )}
                {signer.status === 'declined' && (
                  <span className="mr-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-error-100 text-error-800">
                    Declined
                  </span>
                )}
                
                {!readOnly && onRemoveSigner && signer.status === 'pending' && (
                  <button
                    onClick={() => onRemoveSigner(signer.id)}
                    className="p-1 text-gray-400 hover:text-error-500"
                    title="Remove signer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SignersList;