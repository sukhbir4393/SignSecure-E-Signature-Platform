import React, { useState } from 'react';
import { FileSignature as Signature, File, Calendar, CheckSquare, Edit, X } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { FormField } from '../../types';

interface SignatureFieldProps {
  field: FormField;
  isSelected?: boolean;
  isEditable?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  onUpdate?: (updates: Partial<FormField>) => void;
  selectedTool?: 'signature' | 'text' | 'date' | 'checkbox' | 'initial' | 'move' | null;
}

const SignatureField: React.FC<SignatureFieldProps> = ({
  field,
  isSelected = false,
  isEditable = false,
  onClick,
  onRemove,
  onUpdate,
  selectedTool
}) => {
  
  console.log('SignatureField selectedTool ',selectedTool);
  console.log('SignatureField isSelected ',isSelected);
  console.log('SignatureField isEditable ',isEditable);
  

  const [isDragging, setIsDragging] = useState(false);

  // Add null check for field prop
  if (!field) {
    return null;
  }

  // Set up draggable functionality
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: field.id,
    disabled: !isEditable || (!isSelected && selectedTool !== 'move'),
  });

  const style = transform ? {
    transform: CSS.Transform.toString(transform),
  } : undefined;

  // Handle drag start
  const handleDragStart = () => {
    setIsDragging(true);
  };

  // Handle drag end
  const handleDragEnd = () => {
    if (onUpdate && transform) {
      onUpdate({
        x: field.x + transform.x,
        y: field.y + transform.y
      });
    }
    setIsDragging(false);
  };

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

  const handleResizeStop = (e: any, { size }: { size: { width: number; height: number } }) => {
    if (onUpdate) {
      onUpdate({
        width: size.width,
        height: size.height
      });
    }
  };

  const fieldContent = (
    <div
      className={`
        relative flex flex-col justify-center items-center
        border-2 rounded-md overflow-hidden bg-white bg-opacity-70
        ${isSelected ? 'border-primary-500 shadow-md z-10' : 'border-dashed border-gray-400'}
        ${(isEditable && (isSelected || selectedTool === 'move')) ? 'cursor-move' : 'cursor-pointer'}
        ${field.value ? 'bg-opacity-90' : 'hover:border-primary-400'}
        ${isDragging ? 'opacity-50' : ''}
      `}
      style={{
        width: '100%',
        height: '100%',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
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
          className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm hover:bg-error-100 focus:outline-none z-20"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <X className="h-4 w-4 text-error-600" />
        </button>
      )}
    </div>
  );

  if (!isEditable) {
    return (
      <div
        className="absolute"
        style={{
          left: `${field.x}px`,
          top: `${field.y}px`,
          width: `${field.width}px`,
          height: `${field.height}px`,
        }}
      >
        {fieldContent}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        position: 'absolute',
        left: `${field.x}px`,
        top: `${field.y}px`,
        ...style,
      }}
      {...listeners}
      {...attributes}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <ResizableBox
        width={field.width}
        height={field.height}
        minConstraints={[50, 30]}
        maxConstraints={[400, 200]}
        onResizeStop={handleResizeStop}
        resizeHandles={isSelected ? ['se'] : []}
        handle={
          <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-20">
            <div className="w-2 h-2 border-b-2 border-r-2 border-primary-500 absolute bottom-0 right-0" />
          </div>
        }
      >
        {fieldContent}
      </ResizableBox>
    </div>
  );
};

export default SignatureField;