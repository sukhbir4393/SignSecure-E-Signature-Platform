import React from 'react';
import { FileSignature as Signature, File, Calendar, CheckSquare, Edit } from 'lucide-react';
import { FormField } from '../../types';

interface SignatureFieldProps {
  field: FormField;
  isSelected?: boolean;
  isEditable?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
}

const SignatureField: React.FC<SignatureFieldProps> = ({
  field,
  isSelected = false,
  isEditable = false,
  onClick,
  onRemove
}) => {
  // Add null check for field prop
  if (!field) {
    return null;
  }

  // Get icon and label based on field type
  const getFieldIcon = () => {
    switch (field.type) {
      case 'signature':
        return <Signature className="h-4 w-4" />;
      case 'initial':
        return <Edit className="h-4 w-4" />;
      case 'date':
        return <Calendar className="h-4 w-4" />;
      case 'checkbox':
        return <CheckSquare className="h-4 w-4" />;
      case 'text':
        return <File className="h-4 w-4" />;
      default:
        return <Signature className="h-4 w-4" />;
    }
  };
  
  const getFieldLabel = () => {
    switch (field.type) {
      case 'signature':
        return 'Signature';
      case 'initial':
        return 'Initial';
      case 'date':
        return 'Date';
      case 'checkbox':
        return 'Checkbox';
      case 'text':
        return field.label || 'Text';
      default:
        return 'Field';
    }
  };
  
  // Get field content (if signed)
  const getFieldContent = () => {
    if (!field.value) return null;
    
    switch (field.type) {
      case 'signature':
      case 'initial':
        return (
          <img 
            src={field.value} 
            alt="Signature" 
            className="w-full h-full object-contain"
          />
        );
      case 'date':
        return <span className="text-sm">{field.value}</span>;
      case 'checkbox':
        return field.value === 'true' ? <CheckSquare className="h-5 w-5 text-primary-600" /> : null;
      case 'text':
        return <span className="text-sm">{field.value}</span>;
      default:
        return null;
    }
  };
  console.log('SignatureField',field)
  return (
    <div
      className={`
        absolute pointer-events-auto flex flex-col justify-center items-center
        border-2 rounded-md overflow-hidden bg-white bg-opacity-70
        ${isSelected ? 'border-primary-500 shadow-md z-10' : 'border-dashed border-gray-400'}
        ${isEditable ? 'cursor-move' : 'cursor-pointer'}
        ${field.value ? 'bg-opacity-90' : 'hover:border-primary-400'}
      `}
      style={{
        left: `${field.x}px`,
        top: `${field.y}px`,
        width: `${field.width}px`,
        height: `${field.height}px`,
      }}
      onClick={onClick}
    >
      {field.value ? (
        getFieldContent()
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-full p-1">
          <div className="text-gray-500 flex items-center justify-center">
            {getFieldIcon()}
            <span className="ml-1 text-xs font-medium truncate">
              {getFieldLabel()}
            </span>
          </div>
          {field.required && (
            <span className="text-xs text-error-600">Required</span>
          )}
        </div>
      )}
      
      {isSelected && isEditable && onRemove && (
        <button
          className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow-sm hover:bg-error-100 focus:outline-none"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5 text-error-600"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default SignatureField;