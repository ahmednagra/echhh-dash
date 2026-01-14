// src/utils/pdfExportUtils.ts

export interface ExportOptions {
  filename?: string;
  quality?: number;
  format?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
  margin?: number;
  backgroundColor?: string;
  cropWhitespace?: boolean;
}

export interface ExportResult {
  success: boolean;
  error?: string;
  filename?: string;
}

/**
 * Enhanced PDF export utility with comprehensive error handling and customization options
 */
export class PDFExporter {
  private static instance: PDFExporter;
  
  private constructor() {}
  
  public static getInstance(): PDFExporter {
    if (!PDFExporter.instance) {
      PDFExporter.instance = new PDFExporter();
    }
    return PDFExporter.instance;
  }

  /**
   * Export an HTML element to PDF
   */
  public async exportElementToPDF(
    element: HTMLElement,
    options: ExportOptions = {}
  ): Promise<ExportResult> {
    const {
      filename = `export_${new Date().toISOString().split('T')[0]}.pdf`,
      quality = 0.8,
      format = 'a4',
      orientation = 'portrait',
      margin = 10,
      backgroundColor = '#f8fafc',
      cropWhitespace = true
    } = options;

    try {
      console.log('Starting PDF export process...');
      
      // Validate element
      if (!element) {
        throw new Error('No element provided for export');
      }

      // Dynamically import required libraries
      const { html2canvas, jsPDF } = await this.loadLibraries();
      
      console.log('Libraries loaded successfully');

      // Get element dimensions for logging
      const elementInfo = {
        width: element.offsetWidth,
        height: element.offsetHeight,
        scrollWidth: element.scrollWidth,
        scrollHeight: element.scrollHeight
      };
      console.log('Element dimensions:', elementInfo);

      // Wait for content to render
      await this.waitForRender();

      // Generate canvas with improved options
      console.log('Capturing element as canvas...');
      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: false,
        backgroundColor,
        logging: false,
        height: element.scrollHeight,
        width: element.scrollWidth,
        scrollX: 0,
        scrollY: 0,
        scale: 2, // Higher resolution
        onclone: this.fixClonedStyles
      });

      console.log('Canvas created:', {
        width: canvas.width,
        height: canvas.height
      });

      // Apply cropping if enabled
      const finalCanvas = cropWhitespace ? this.cropCanvas(canvas) : canvas;

      // Convert to image data
      const imgData = finalCanvas.toDataURL('image/png', quality);
      console.log('Image data created, length:', imgData.length);

      // Calculate PDF dimensions
      const pdfDimensions = this.calculatePDFDimensions(finalCanvas, format, orientation, margin);
      console.log('PDF dimensions:', pdfDimensions);

      // Create and configure PDF
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format
      });

      // Add content to PDF (handle multi-page if needed)
      this.addContentToPDF(pdf, imgData, pdfDimensions);

      // Save the PDF
      console.log('Saving PDF as:', filename);
      pdf.save(filename);

      console.log('PDF export completed successfully');
      
      return {
        success: true,
        filename
      };

    } catch (error) {
      console.error('PDF export failed:', error);
      
      const errorMessage = this.getErrorMessage(error);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Simple fallback export using browser print
   */
  public async exportUsingPrint(
    element: HTMLElement,
    title: string = 'Export'
  ): Promise<ExportResult> {
    try {
      const printWindow = window.open('', '_blank');
      
      if (!printWindow) {
        throw new Error('Unable to open print window. Please check popup blockers.');
      }

      const content = element.innerHTML;
      
      printWindow.document.write(`
        <html>
          <head>
            <title>${title}</title>
            <style>
              body { 
                font-family: system-ui, -apple-system, sans-serif; 
                margin: 20px;
                color: #000;
              }
              @media print { 
                body { margin: 0; }
                .no-print { display: none !important; }
              }
              /* Reset colors for print */
              * { color: #000 !important; }
              .text-gray-800 { color: #1f2937 !important; }
              .text-gray-700 { color: #374151 !important; }
              .text-gray-600 { color: #4b5563 !important; }
              .text-gray-500 { color: #6b7280 !important; }
              .text-gray-900 { color: #111827 !important; }
              .text-pink-600 { color: #db2777 !important; }
              .text-green-700 { color: #15803d !important; }
              .text-blue-500 { color: #3b82f6 !important; }
              .bg-white { background-color: #fff !important; }
              .bg-gray-50 { background-color: #f9fafb !important; }
            </style>
          </head>
          <body>${content}</body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.print();

      return {
        success: true,
        filename: `${title}.pdf`
      };

    } catch (error) {
      console.error('Print export failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Print export failed'
      };
    }
  }

  /**
   * Load required libraries dynamically
   */
  private async loadLibraries(): Promise<{ html2canvas: any; jsPDF: any }> {
    try {
      const [html2canvasModule, jsPDFModule] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);

      return {
        html2canvas: html2canvasModule.default,
        jsPDF: jsPDFModule.jsPDF
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('html2canvas')) {
        throw new Error('PDF export library not found. Please install: npm install html2canvas');
      }
      if (error instanceof Error && error.message.includes('jspdf')) {
        throw new Error('PDF export library not found. Please install: npm install jspdf');
      }
      throw new Error('Failed to load PDF export libraries');
    }
  }

  /**
   * Wait for content to render properly
   */
  private async waitForRender(): Promise<void> {
    return new Promise(resolve => {
      // Wait for images and other async content
      if (document.readyState === 'complete') {
        setTimeout(resolve, 500);
      } else {
        window.addEventListener('load', () => {
          setTimeout(resolve, 500);
        });
      }
    });
  }

  /**
   * Fix styles in cloned document for better rendering
   */
  private fixClonedStyles = (clonedDoc: Document): Document => {
    // Create a new style element to override problematic styles
    const fixedStyle = clonedDoc.createElement('style');
    fixedStyle.textContent = `
      * {
        color: rgb(0, 0, 0) !important;
      }
      .text-gray-800 { color: rgb(31, 41, 55) !important; }
      .text-gray-700 { color: rgb(55, 65, 81) !important; }
      .text-gray-600 { color: rgb(75, 85, 99) !important; }
      .text-gray-500 { color: rgb(107, 114, 128) !important; }
      .text-gray-900 { color: rgb(17, 24, 39) !important; }
      .text-pink-600 { color: rgb(219, 39, 119) !important; }
      .text-green-700 { color: rgb(21, 128, 61) !important; }
      .text-blue-500 { color: rgb(59, 130, 246) !important; }
      .bg-white { background-color: rgb(255, 255, 255) !important; }
      .bg-gray-50 { background-color: rgb(249, 250, 251) !important; }
      .bg-gradient-to-br { background: linear-gradient(to bottom right, rgb(219, 234, 254), rgb(243, 232, 255), rgb(252, 231, 243)) !important; }
      .bg-gradient-to-r.from-purple-500 { background: linear-gradient(to right, rgb(168, 85, 247), rgb(236, 72, 153), rgb(251, 146, 60)) !important; }
      .bg-cyan-500 { background-color: rgb(6, 182, 212) !important; }
      .bg-blue-500 { background-color: rgb(59, 130, 246) !important; }
      .border-gray-100 { border-color: rgb(243, 244, 246) !important; }
      .border-gray-200 { border-color: rgb(229, 231, 235) !important; }
      svg path { fill: currentColor !important; }
      svg circle { stroke: currentColor !important; }
      
      /* Remove interactive elements */
      button { display: none !important; }
      .fixed { display: none !important; }
      .absolute { position: static !important; }
      .no-print { display: none !important; }
      
      /* Ensure proper text contrast */
      .bg-white * { color: rgb(31, 41, 55) !important; }
      
      /* Reset transforms and filters */
      * { transform: none !important; filter: none !important; }
    `;
    
    clonedDoc.head.appendChild(fixedStyle);

    // Clean up problematic styles
    const allElements = clonedDoc.querySelectorAll('*');
    allElements.forEach(el => {
      const style = el.getAttribute('style');
      if (style && style.includes('oklch')) {
        el.removeAttribute('style');
      }
      
      // Remove floating/fixed positioning
      const classes = el.className;
      if (typeof classes === 'string' && (classes.includes('fixed') || classes.includes('absolute'))) {
        (el as HTMLElement).style.position = 'static';
      }
    });

    return clonedDoc;
  };

  /**
   * Crop canvas to remove excess whitespace
   */
  private cropCanvas(originalCanvas: HTMLCanvasElement): HTMLCanvasElement {
    const ctx = originalCanvas.getContext('2d');
    if (!ctx) return originalCanvas;

    const imageData = ctx.getImageData(0, 0, originalCanvas.width, originalCanvas.height);
    const data = imageData.data;

    // Find content boundaries
    let top = 0, bottom = originalCanvas.height;

    // Find top boundary
    topLoop: for (let y = 0; y < originalCanvas.height; y++) {
      for (let x = 0; x < originalCanvas.width; x++) {
        const idx = (y * originalCanvas.width + x) * 4;
        const r = data[idx], g = data[idx + 1], b = data[idx + 2], a = data[idx + 3];
        
        // If pixel is not transparent and not pure white background
        if (a > 0 && !(r > 240 && g > 240 && b > 240)) {
          top = Math.max(0, y - 20); // Add margin
          break topLoop;
        }
      }
    }

    // Find bottom boundary
    bottomLoop: for (let y = originalCanvas.height - 1; y >= top; y--) {
      for (let x = 0; x < originalCanvas.width; x++) {
        const idx = (y * originalCanvas.width + x) * 4;
        const r = data[idx], g = data[idx + 1], b = data[idx + 2], a = data[idx + 3];
        
        if (a > 0 && !(r > 240 && g > 240 && b > 240)) {
          bottom = Math.min(originalCanvas.height, y + 20); // Add margin
          break bottomLoop;
        }
      }
    }

    // Create cropped canvas
    const croppedCanvas = document.createElement('canvas');
    const croppedCtx = croppedCanvas.getContext('2d');
    if (!croppedCtx) return originalCanvas;

    const croppedHeight = bottom - top;
    croppedCanvas.width = originalCanvas.width;
    croppedCanvas.height = croppedHeight;

    // Copy the cropped region
    croppedCtx.drawImage(
      originalCanvas,
      0, top, originalCanvas.width, croppedHeight,
      0, 0, originalCanvas.width, croppedHeight
    );

    console.log('Canvas cropped:', {
      original: { width: originalCanvas.width, height: originalCanvas.height },
      cropped: { width: croppedCanvas.width, height: croppedCanvas.height },
      removed: { top, bottom: originalCanvas.height - bottom }
    });

    return croppedCanvas;
  }

  /**
   * Calculate PDF dimensions based on format and content
   */
  private calculatePDFDimensions(
    canvas: HTMLCanvasElement,
    format: 'a4' | 'letter',
    orientation: 'portrait' | 'landscape',
    margin: number
  ) {
    const formatSizes = {
      a4: { width: 210, height: 297 },
      letter: { width: 215.9, height: 279.4 }
    };

    const pageSize = formatSizes[format];
    const isLandscape = orientation === 'landscape';
    
    const pageWidth = isLandscape ? pageSize.height : pageSize.width;
    const pageHeight = isLandscape ? pageSize.width : pageSize.height;
    
    const contentWidth = pageWidth - (margin * 2);
    const contentHeight = pageHeight - (margin * 2);
    
    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    return {
      pageWidth,
      pageHeight,
      contentWidth,
      contentHeight,
      imgWidth,
      imgHeight,
      margin
    };
  }

  /**
   * Add content to PDF with multi-page support
   */
  private addContentToPDF(pdf: any, imgData: string, dimensions: any): void {
    const { pageHeight, imgWidth, imgHeight, margin } = dimensions;
    const maxContentHeight = pageHeight - (margin * 2);

    if (imgHeight <= maxContentHeight) {
      // Single page - center vertically
      const yPosition = margin + Math.max(0, (maxContentHeight - imgHeight) / 2);
      pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
    } else {
      // Multi-page PDF
      let heightLeft = imgHeight;
      let position = margin;

      // Add first page
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= maxContentHeight;

      // Add additional pages
      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= maxContentHeight;
      }
    }
  }

  /**
   * Generate user-friendly error messages
   */
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      if (error.message.includes('html2canvas')) {
        return 'PDF export library not found. Please install html2canvas.';
      }
      if (error.message.includes('jsPDF')) {
        return 'PDF export library not found. Please install jsPDF.';
      }
      if (error.message.includes('No element provided')) {
        return 'No content found to export.';
      }
      return `Export failed: ${error.message}`;
    }
    return 'An unexpected error occurred during export.';
  }
}

/**
 * Convenience function for quick PDF export
 */
export async function exportToPDF(
  element: HTMLElement,
  options: ExportOptions = {}
): Promise<ExportResult> {
  const exporter = PDFExporter.getInstance();
  return exporter.exportElementToPDF(element, options);
}

/**
 * Convenience function for print export
 */
export async function exportToPrint(
  element: HTMLElement,
  title: string = 'Export'
): Promise<ExportResult> {
  const exporter = PDFExporter.getInstance();
  return exporter.exportUsingPrint(element, title);
}

/**
 * Generate filename with timestamp and campaign info
 */
export function generateExportFilename(
  campaignName?: string,
  suffix: string = 'Analytics'
): string {
  const cleanName = campaignName?.replace(/[^a-zA-Z0-9]/g, '_') || 'Campaign';
  const timestamp = new Date().toISOString().split('T')[0];
  return `${cleanName}_${suffix}_${timestamp}.pdf`;
}