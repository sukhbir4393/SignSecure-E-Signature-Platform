import React, { useState, useRef } from 'react';
import { Document, Page ,pdfjs} from 'react-pdf';
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
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  fileUrl,
  currentPage,
  scale = 1.0,
  onTotalPagesChange,
  onPageChange,
  children,
  isEditable = false,
  onClick
}) => {
  console.log('PDFViewer fileUrl',fileUrl)
  
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log('PDFViewer',numPages)
    setNumPages(numPages);
    if (onTotalPagesChange) {
      onTotalPagesChange(numPages);
    }
  };

  return (
    <div className="pdf-viewer relative" ref={containerRef}>
      <div 
        className={`relative ${isEditable ? 'cursor-crosshair' : ''}`}
        onClick={onClick}
      >
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          className="mx-auto shadow-md"
        >
          <Page 
            pageNumber={pageNumber} 
            scale={scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
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
            disabled={currentPage <= 1}
            onClick={() => onPageChange && onPageChange(currentPage - 1)}
          >
            Previous
          </button>
          <span className="text-sm">
            Page {currentPage} of {numPages}
          </span>
          <button
            className="px-3 py-1 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentPage >= numPages}
            onClick={() => onPageChange && onPageChange(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;