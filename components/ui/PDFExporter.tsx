import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToPDF = async () => {
  try {
    const element = document.getElementById('pdf-export-root');
    if (!element) {
      console.error('Root element not found');
      return;
    }

    // Create clone to avoid affecting original DOM
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    document.body.appendChild(clone);

    // Temporary fix for transparent backgrounds
    clone.style.backgroundColor = 'white';

    const canvas = await html2canvas(clone, {
      scale: 2,
      logging: true,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null, // Keep original background colors
      ignoreElements: (element) => {
        // Skip problematic elements
        return element.classList.contains('no-export');
      }
    });

    document.body.removeChild(clone);

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('profile-export.pdf');

  } catch (error) {
    console.error('PDF export failed:', error);
  }
};