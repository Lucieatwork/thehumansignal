import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Generate PDF from the report page content
export async function generateReportPDF(): Promise<void> {
  const reportElement = document.getElementById('report-content');
  if (!reportElement) {
    throw new Error('Report content element not found');
  }

  // Show loading state
  const loadingOverlay = document.createElement('div');
  loadingOverlay.id = 'pdf-loading';
  loadingOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(248, 246, 242, 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  `;
  loadingOverlay.innerHTML = `
    <div style="text-align: center;">
      <div style="width: 48px; height: 48px; border: 4px solid #d95e40; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px;"></div>
      <div style="font-family: Inter, sans-serif; font-size: 16px; color: #3a3a3a;">Generating PDF...</div>
    </div>
  `;
  document.body.appendChild(loadingOverlay);

  try {
    // Note: PDF generation will capture current expanded state
    // Users should expand sections they want included before generating PDF
    // Wait a moment for any ongoing animations to settle
    await new Promise(resolve => setTimeout(resolve, 500));

    // Capture the report content
    const canvas = await html2canvas(reportElement, {
      useCORS: true,
      logging: false,
      backgroundColor: '#f8f6f2',
      windowWidth: reportElement.scrollWidth,
      windowHeight: reportElement.scrollHeight,
      onclone: (clonedDoc: Document) => {
        // Ensure all canvas elements are rendered
        const canvases = clonedDoc.querySelectorAll('canvas');
        canvases.forEach((canvas) => {
          canvas.style.display = 'block';
        });
      }
    } as any);

    const imgData = canvas.toDataURL('image/png', 1.0);
    
    // Calculate PDF dimensions
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = (imgHeight * pdfWidth) / imgWidth;
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: pdfHeight > pdfWidth ? 'portrait' : 'landscape',
      unit: 'mm',
      format: [pdfWidth, pdfHeight]
    });
    
    // Add image to PDF
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    // Generate filename
    const date = new Date();
    const filename = `human-signal-report-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}.pdf`;
    
    // Save PDF
    pdf.save(filename);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF. Please try again.');
  } finally {
    // Remove loading overlay
    const overlay = document.getElementById('pdf-loading');
    if (overlay) {
      overlay.remove();
    }
  }
}

// Generate image from report
export async function generateReportImage(): Promise<void> {
  const reportElement = document.getElementById('report-content');
  if (!reportElement) {
    throw new Error('Report content element not found');
  }

  try {
    const canvas = await html2canvas(reportElement, {
      useCORS: true,
      logging: false,
      backgroundColor: '#f8f6f2',
      windowWidth: reportElement.scrollWidth,
      windowHeight: reportElement.scrollHeight
    } as any);

    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (!blob) return;
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const date = new Date();
      link.download = `human-signal-report-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}.png`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 'image/png');
    
  } catch (error) {
    console.error('Error generating image:', error);
    alert('Failed to generate image. Please try again.');
  }
}

// Share link functionality
export async function shareReportLink(): Promise<void> {
  const url = window.location.href;
  
  try {
    if (navigator.share) {
      await navigator.share({
        title: 'My Human Signal Report',
        text: 'Check out my personalized health report',
        url: url
      });
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(url);
      
      // Show toast notification
      const toast = document.createElement('div');
      toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: #d95e40;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-family: Inter, sans-serif;
        font-size: 14px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      `;
      toast.textContent = 'Link copied to clipboard!';
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.remove();
      }, 3000);
    }
  } catch (error) {
    console.error('Error sharing link:', error);
  }
}

// Print functionality
export function printReport(): void {
  window.print();
}

