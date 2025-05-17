import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Document as PDFDocument } from '@react-pdf/renderer';

// Initialize PDF.js worker with the correct version
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js`;

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
  const [pdfDocument, setPdfDocument] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [renderComplete, setRenderComplete] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(fileUrl);
        const pdf = await loadingTask.promise;
        setPdfDocument(pdf);
        setTotalPages(pdf.numPages);
        if (onTotalPagesChange) {
          onTotalPagesChange(pdf.numPages);
        }
      } catch (error) {
        console.error('Error loading PDF:', error);
      }
    };

    loadPdf();
  }, [fileUrl, onTotalPagesChange]);

  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDocument || !canvasRef.current) return;

      try {
        setRenderComplete(false);
        const page = await pdfDocument.getPage(currentPage);
        
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if (!context) return;
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext = {
          canvasContext: context,
          viewport,
        };
        
        await page.render(renderContext).promise;
        setRenderComplete(true);
      } catch (error) {
        console.error('Error rendering PDF page:', error);
      }
    };

    renderPage();
  }, [pdfDocument, currentPage, scale]);

  return (
    <div className="pdf-viewer relative" ref={containerRef}>
      <canvas 
        ref={canvasRef} 
        className={`mx-auto shadow-md ${isEditable ? 'cursor-crosshair' : ''}`}
        onClick={onClick}
      />
      
      {renderComplete && children && (
        <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
          {children}
        </div>
      )}
      
      {/* Navigation controls */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center items-center space-x-4">
          <button
            className="px-3 py-1 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentPage <= 1}
            onClick={() => onPageChange && onPageChange(currentPage - 1)}
          >
            Previous
          </button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="px-3 py-1 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentPage >= totalPages}
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