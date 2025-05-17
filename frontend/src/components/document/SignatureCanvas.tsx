import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import Button from '../ui/Button';

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
  width?: number;
  height?: number;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ 
  onSave, 
  onCancel,
  width = 400, 
  height = 200
}) => {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Effect to handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (sigCanvas.current) {
        const ratio = Math.min(width / window.innerWidth, 1);
        const canvas = sigCanvas.current.getCanvas();
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        sigCanvas.current.clear();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [width, height]);
  
  const handleBegin = () => {
    setIsDrawing(true);
  };
  
  const handleEnd = () => {
    setIsDrawing(false);
    setIsEmpty(sigCanvas.current?.isEmpty() || true);
  };
  
  const handleClear = () => {
    sigCanvas.current?.clear();
    setIsEmpty(true);
  };
  
  const handleSave = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const dataUrl = sigCanvas.current.toDataURL('image/png');
      onSave(dataUrl);
    }
  };
  
  return (
    <div className="signature-pad-container">
      <div className="mb-3 text-sm font-medium text-gray-700">
        Sign below
      </div>
      
      <div className="border rounded-md overflow-hidden bg-white mb-4">
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            width,
            height,
            className: 'signature-canvas',
            style: {
              width: '100%',
              height: '100%',
              minHeight: '150px',
              backgroundColor: '#FFFFFF',
            }
          }}
          onBegin={handleBegin}
          onEnd={handleEnd}
          backgroundColor="white"
        />
      </div>
      
      <div className="flex justify-between">
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={isEmpty}
          >
            Clear
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
        
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handleSave}
          disabled={isEmpty}
        >
          Save Signature
        </Button>
      </div>
    </div>
  );
};

export default SignaturePad;