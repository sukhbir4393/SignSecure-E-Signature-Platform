import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set up the worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface PDFViewerProps {
  fileUrl: string;
  currentPage: number;
  scale?: number;
  onTotalPagesChange?: (totalPages: number) => void;
  onPageChange?: (pageNumber: number) => void;
  children?: React.ReactNode;
  isEditable?: boolean;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  selectedTool?: 'signature' | 'initial' | 'date' | 'text' | 'checkbox' | null;
  selectedSigner?: any;
  onAddSignature?: (position: { x: number; y: number }, type: string) => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  fileUrl,
  currentPage,
  scale = 1.0,
  onTotalPagesChange,
  onPageChange,
  children,
  isEditable = false,
  onClick,
  selectedTool,
  selectedSigner,
  onAddSignature
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log('PDFViewer', numPages);
    setNumPages(numPages);
    if (onTotalPagesChange) {
      onTotalPagesChange(numPages);
    }
  };

  const handlePageClick = (event: React.MouseEvent<HTMLDivElement>) => {
    console.log('handlePageClick', event,onClick);
    console.log('handlePageClick', isEditable ,selectedTool,selectedSigner);
    
    if (!isEditable || !selectedTool || !selectedSigner) {
      if (onClick) onClick(event);
      return;
    }
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    console.log('handlePageClick', x, y);
    setClickPosition({ x, y });
    
    if (onAddSignature) {
      onAddSignature({ x, y }, selectedTool);
    }
  };

  useEffect(() => {
    if (currentPage !== pageNumber) {
      setPageNumber(currentPage);
    }
  }, [currentPage]);

  return (
    <div className="pdf-viewer relative"  onClick={handlePageClick}>
      <div 
        className={`relative ${isEditable ? 'cursor-crosshair' : ''}`} >
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}

        >
          <div
            ref={containerRef}
          >
          <Page 
            pageNumber={pageNumber} 
            scale={scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            width={900}
            className={'shadow-2xl'}
          />
          </div>
        </Document>
      </div>
      
      {children && (
        <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
          {children}
        </div>
      )}
      
      {/* Navigation controls */}
      {numPages > 1 && (
        <div className="mt-4 flex justify-center items-center space-x-4">
          <button
            className="px-3 py-1 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={pageNumber <= 1}
            onClick={() => {
              const newPage = pageNumber - 1;
              setPageNumber(newPage);
              if (onPageChange) onPageChange(newPage);
            }}
          >
            Previous
          </button>
          <span className="text-sm">
            Page {pageNumber} of {numPages}
          </span>
          <button
            className="px-3 py-1 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={pageNumber >= numPages}
            onClick={() => {
              const newPage = pageNumber + 1;
              setPageNumber(newPage);
              if (onPageChange) onPageChange(newPage);
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;