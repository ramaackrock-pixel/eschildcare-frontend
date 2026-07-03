import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { FRONT_PARTS, BACK_PARTS, BODY_SILHOUETTE_PATH } from '../components/dashboard/AnatomyMap';

const sanitizeFilename = (str: string): string => {
  return (str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/__+/g, '_')
    .replace(/^_+|_+$/g, '');
};

const getCroppedCircularLogo = async (imageUrl: string): Promise<ArrayBuffer | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const size = Math.min(img.width, img.height);
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }

      // Draw circular mask
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // Draw image cropped to square center
      const sourceX = (img.width - size) / 2;
      const sourceY = (img.height - size) / 2;
      ctx.drawImage(img, sourceX, sourceY, size, size, 0, 0, size, size);

      // Convert to blob then arrayBuffer
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(null);
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as ArrayBuffer);
        };
        reader.readAsArrayBuffer(blob);
      }, 'image/png');
    };
    img.onerror = () => {
      resolve(null);
    };
    img.src = imageUrl + '?t=' + Date.now();
  });
};

export const generateAssessmentPDF = async (patient: any) => {
  const rawName = patient.name || 'patient';
  const rawPid = patient.pid || patient.id || 'unknown';
  const now = new Date();
  const monthYearStr = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }).toLowerCase().replace(' ', '_');
  const fileName = `${sanitizeFilename(rawName)}_${sanitizeFilename(String(rawPid))}_assessment_${monthYearStr}`;
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const page = pdfDoc.addPage([595, 842]); // A4 Size
  const { width, height } = page.getSize();
  const fontSize = 10;
  const margin = 50;
  let activePage = page;
  let currentY = height - 160; // Pushed down further to avoid header overlap

  // Helper to draw text
  const drawText = (text: string, x: number, y: number, font = timesRomanFont, size = fontSize, pg = activePage) => {
    pg.drawText(text || '', { x, y, size, font, color: rgb(0.1, 0.1, 0.1) });
  };

  // Helper for Table Rows (Column Layout with Borders)
  const drawRow = (label: string, value: string, y: number, isSubHeader = false) => {
    const rowHeight = 25;
    const col1Width = 180;

    // Page Break Logic
    if (y < 80) {
      activePage = pdfDoc.addPage([595, 842]);
      y = 800;
      // Re-draw initial border if new page
      activePage.drawLine({ start: { x: margin, y: y + 20 }, end: { x: width - margin, y: y + 20 }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
    }

    // Row Backgrounds
    activePage.drawRectangle({ x: margin, y: y - 5, width: width - (margin * 2), height: rowHeight, color: isSubHeader ? rgb(0.92, 0.95, 0.95) : rgb(1, 1, 1) });
    activePage.drawRectangle({ x: margin, y: y - 5, width: col1Width, height: rowHeight, color: rgb(0.97, 0.98, 0.99) });

    // Grid Lines (Vertical)
    const lineYStart = y - 5;
    const lineYEnd = y + 20;
    activePage.drawLine({ start: { x: margin, y: lineYStart }, end: { x: margin, y: lineYEnd }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });
    activePage.drawLine({ start: { x: margin + col1Width, y: lineYStart }, end: { x: margin + col1Width, y: lineYEnd }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });
    activePage.drawLine({ start: { x: width - margin, y: lineYStart }, end: { x: width - margin, y: lineYEnd }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });

    // Grid Line (Horizontal Bottom)
    activePage.drawLine({ start: { x: margin, y: lineYStart }, end: { x: width - margin, y: lineYStart }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });

    // Cell Text
    activePage.drawText((label || '').toUpperCase(), { x: margin + 10, y: y + 5, size: 7.5, font: timesBoldFont, color: rgb(0.2, 0.3, 0.3) });

    const cleanValue = String(value || 'N/A');
    activePage.drawText(cleanValue.substring(0, 75), { x: margin + col1Width + 10, y: y + 5, size: 9, font: timesRomanFont, color: rgb(0.1, 0.1, 0.1) });

    return y - rowHeight;
  };

  // Section Header Helper
  const drawSectionHeader = (title: string, y: number) => {
    if (y < 120) {
      activePage = pdfDoc.addPage([595, 842]);
      y = 800;
    }
    activePage.drawRectangle({ x: margin, y: y - 5, width: width - (margin * 2), height: 22, color: rgb(0.80, 0.09, 0.39) });
    activePage.drawText(title, { x: margin + 10, y: y, size: 10, font: timesBoldFont, color: rgb(1, 1, 1) });

    // Initial border for the first row under this header
    activePage.drawLine({ start: { x: margin, y: y - 5 }, end: { x: width - margin, y: y - 5 }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });

    return y - 27;
  };

  // Load logo images
  let circularLogo = null;
  
  try {
    const circBytes = await getCroppedCircularLogo('/logo.png');
    if (circBytes) {
      circularLogo = await pdfDoc.embedPng(circBytes);
    }
  } catch (e) {
    console.error('Circular logo loading failed:', e);
  }

  

  // Draw circular logo in the top-left corner
  if (circularLogo) {
    activePage.drawImage(circularLogo, {
      x: margin,
      y: height - 70,
      width: 50,
      height: 50,
    });
  }

  

  // Top Right: ASSESSMENT
  activePage.drawText('ASSESSMENT', { x: width - margin - 150, y: height - 60, size: 22, font: timesBoldFont, color: rgb(0.80, 0.09, 0.39) });

  // Branch Details (Positioned below the centered logo)
  const branchY = height - 100;
  const col1X = margin;
  const col2X = margin + 180;

  // ES Child Care Centre Branch
  activePage.drawText('ES Child Care Centre - KK Nagar', { x: col1X, y: branchY, size: 11, font: timesBoldFont, color: rgb(0.80, 0.09, 0.39) });
  activePage.drawText('PLOT 299, Rajaram Rd,', { x: col1X, y: branchY - 12, size: 8, font: timesRomanFont, color: rgb(0.3, 0.3, 0.3) });
  activePage.drawText('Opposite to Whiteline orchid avenue apartment,', { x: col1X, y: branchY - 24, size: 8, font: timesRomanFont, color: rgb(0.3, 0.3, 0.3) });
  activePage.drawText('K K Nagar, Tiruchirappalli, Tamil Nadu 620021', { x: col1X, y: branchY - 36, size: 8, font: timesRomanFont, color: rgb(0.3, 0.3, 0.3) });
  activePage.drawText('Dr.pratheep (MD Paediatrics)', { x: col1X, y: branchY - 48, size: 9, font: timesBoldFont, color: rgb(0.80, 0.09, 0.39) });

  // Metadata (Below Title)
  const metaY = height - 100;
  const metaX = width - margin - 150;
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  activePage.drawText(`Date: ${dateStr}`, { x: metaX, y: metaY, size: 9, font: timesRomanFont, color: rgb(0.3, 0.3, 0.3) });

  // Line separator
  activePage.drawLine({ start: { x: margin, y: height - 155 }, end: { x: width - margin, y: height - 155 }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });

  currentY = height - 175;

  const data = patient.assessmentData || {};

  // --- PAEDIATRIC CLINICAL ASSESSMENT ---
  activePage.drawText('PAEDIATRIC CLINICAL ASSESSMENT', { x: margin, y: height - 165, size: 12, font: timesBoldFont, color: rgb(0.2, 0.3, 0.3) });

  // 1. ADMINISTRATIVE
  currentY = drawSectionHeader('1. ADMINISTRATIVE & DEMOGRAPHIC DETAILS', height - 195);
  currentY = drawRow('Full Name', patient.name, currentY);
  const displayPid = patient.pid || patient.id;
  const pidValue = displayPid?.toString().startsWith('ES-') ? displayPid : `ES-${displayPid}`;
  currentY = drawRow('Patient ID', pidValue, currentY);
  currentY = drawRow('Age / Gender', `${patient.age || 'N/A'} ${patient.ageUnit || 'Yrs'} / ${patient.gender || 'N/A'}`, currentY);
  currentY = drawRow('Contact', patient.contact, currentY);
  currentY = drawRow('Branch', patient.branch, currentY);
  currentY -= 15;

  const vitals = data.vitals || {};
  const clinical = data.clinical || {};

  // 2. VITALS & MEASUREMENTS
  currentY = drawSectionHeader('2. VITALS & MEASUREMENTS', currentY);
  currentY = drawRow('Weight (kg)', vitals.weight, currentY);
  currentY = drawRow('Height (cm)', vitals.height, currentY);
  currentY = drawRow('Temperature / SpO2', `${vitals.temperature || 'N/A'} / ${vitals.spo2 ? vitals.spo2 + '%' : 'N/A'}`, currentY);
  currentY = drawRow('Head Circumference (cm)', vitals.headCircumference, currentY);
  currentY -= 15;

  // 3. CLINICAL HISTORY & EXAM
  currentY = drawSectionHeader('3. CLINICAL HISTORY & EXAMINATION', currentY);
  currentY = drawRow('Current Symptoms / Illness', clinical.currentSymptoms, currentY);
  currentY = drawRow('Growth & Development', clinical.growthAndDevelopment, currentY);
  currentY = drawRow('Vaccination History', clinical.vaccinationHistory, currentY);
  currentY = drawRow('Physical Examination', clinical.physicalExamination, currentY);
  currentY -= 15;

  // 4. PLAN & PRESCRIPTION
  currentY = drawSectionHeader('4. TREATMENT PLAN & PRESCRIPTION', currentY);
  currentY = drawRow('Plan / Prescription', clinical.planAndPrescription, currentY);
  currentY -= 15;

  // Footer / Signature (on the last page)
  const footerY = 80;
  if (currentY < 120) {
    activePage = pdfDoc.addPage([595, 842]);
    currentY = 800;
  }
  activePage.drawLine({ start: { x: margin, y: footerY + 40 }, end: { x: width - margin, y: footerY + 40 }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
  activePage.drawText('Physiotherapist Signature', { x: margin, y: footerY, size: 9, font: timesBoldFont });
  activePage.drawText('Date of Report', { x: margin + 200, y: footerY, size: 9, font: timesBoldFont });
  activePage.drawText('Clinical Lead Approval', { x: width - margin - 120, y: footerY, size: 9, font: timesBoldFont });

  pdfDoc.setTitle(fileName);
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
  saveAs(blob, `${fileName}.pdf`);
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
};

export const generateFinancialReport = async (invoices: any[], branches: any[]) => {
  const nowStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '_');
  const fileName = `financial_report_${nowStr}`;
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const page = pdfDoc.addPage([595, 842]);
  const { width, height } = page.getSize();
  const margin = 50;
  let currentY = height - 160;

  // Load logo images
  let circularLogo = null;
  
  try {
    const circBytes = await getCroppedCircularLogo('/logo.png');
    if (circBytes) {
      circularLogo = await pdfDoc.embedPng(circBytes);
    }
  } catch (e) {
    console.error('Circular logo loading failed:', e);
  }

  

  // Draw circular logo in the top-left corner
  if (circularLogo) {
    page.drawImage(circularLogo, {
      x: margin,
      y: height - 70,
      width: 50,
      height: 50,
    });
  }

  

  // Top Right: FINANCIAL AUDIT
  page.drawText('FINANCIAL AUDIT', { x: width - margin - 145, y: height - 60, size: 16, font: timesBoldFont, color: rgb(0.2, 0.2, 0.2) });

  // Branch Details
  const branchY = height - 100;
  const col1X = margin;

  page.drawText('ES Child Care Centre - KK Nagar', { x: col1X, y: branchY, size: 11, font: timesBoldFont, color: rgb(0.80, 0.09, 0.39) });
  page.drawText('PLOT 299, Rajaram Rd,', { x: col1X, y: branchY - 12, size: 8, font: timesRomanFont, color: rgb(0.3, 0.3, 0.3) });
  page.drawText('Opposite to Whiteline orchid avenue apartment,', { x: col1X, y: branchY - 24, size: 8, font: timesRomanFont, color: rgb(0.3, 0.3, 0.3) });
  page.drawText('K K Nagar, Tiruchirappalli, Tamil Nadu 620021', { x: col1X, y: branchY - 36, size: 8, font: timesRomanFont, color: rgb(0.3, 0.3, 0.3) });
  page.drawText('Dr.pratheep (MD Paediatrics)', { x: col1X, y: branchY - 48, size: 9, font: timesBoldFont, color: rgb(0.80, 0.09, 0.39) });

  // Metadata (Below Title)
  const metaY = height - 100;
  const metaX = width - margin - 180;
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  page.drawText(`Date: ${dateStr}`, { x: metaX, y: metaY, size: 9, font: timesRomanFont, color: rgb(0.3, 0.3, 0.3) });

  // Line separator
  page.drawLine({ start: { x: margin, y: height - 155 }, end: { x: width - margin, y: height - 155 }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });

  currentY = height - 175;

  const drawSection = (title: string, y: number) => {
    page.drawRectangle({ x: margin, y: y - 5, width: width - (margin * 2), height: 22, color: rgb(0.80, 0.09, 0.39) });
    page.drawText(title, { x: margin + 10, y: y, size: 10, font: timesBoldFont, color: rgb(1, 1, 1) });
    return y - 30;
  };

  const drawRow = (label: string, value: string, y: number, isTotal = false) => {
    const colWidth = 250;
    page.drawRectangle({ x: margin, y: y - 5, width: width - (margin * 2), height: 25, color: isTotal ? rgb(0.95, 0.98, 0.98) : rgb(1, 1, 1) });
    page.drawText(label.toUpperCase(), { x: margin + 10, y: y + 5, size: 8, font: timesBoldFont, color: rgb(0.3, 0.4, 0.4) });
    page.drawText(value || 'N/A', { x: margin + colWidth, y: y + 5, size: 10, font: isTotal ? timesBoldFont : timesRomanFont, color: rgb(0.1, 0.1, 0.1) });
    page.drawLine({ start: { x: margin, y: y - 5 }, end: { x: width - margin, y: y - 5 }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
    return y - 25;
  };

  // Calculations
  const totalBilled = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const totalCollected = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
  const totalOutstanding = invoices.reduce((sum, inv) => sum + (inv.dueAmount || 0), 0);
  const taxCollected = totalCollected * 0.18; // 18% GST Assumption

  // 1. EXECUTIVE SUMMARY
  currentY = drawSection('1. EXECUTIVE FINANCIAL SUMMARY', currentY);
  currentY = drawRow('Total Billed Amount', `INR ${totalBilled.toLocaleString('en-IN')}`, currentY);
  currentY = drawRow('Total Collected Revenue', `INR ${totalCollected.toLocaleString('en-IN')}`, currentY);
  currentY = drawRow('Total Outstanding (Due)', `INR ${totalOutstanding.toLocaleString('en-IN')}`, currentY, true);
  currentY = drawRow('Tax Liability (18% GST Est.)', `INR ${taxCollected.toLocaleString('en-IN')}`, currentY);
  currentY -= 30;

  // 2. BRANCH PERFORMANCE
  currentY = drawSection('2. BRANCH-WISE PERFORMANCE AUDIT', currentY);
  branches.forEach(branch => {
    const branchInvoices = invoices.filter(inv => inv.branch === branch.name);
    const branchRev = branchInvoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
    const branchDue = branchInvoices.reduce((sum, inv) => sum + (inv.dueAmount || 0), 0);

    currentY = drawRow(branch.name, `Rev: INR ${branchRev.toLocaleString('en-IN')} | Due: INR ${branchDue.toLocaleString('en-IN')}`, currentY);
  });

  if (branches.length === 0) {
    currentY = drawRow('Data Availability', 'No Branch Data Available (N/A)', currentY);
  }

  currentY -= 30;

  // 3. INSURANCE & CLAIMS
  currentY = drawSection('3. INSURANCE CLAIM SUMMARIES', currentY);
  currentY = drawRow('Active Insurance Claims', 'N/A (Module Pending)', currentY);
  currentY = drawRow('Processed Reimbursements', 'INR 0.00', currentY);

  // Footer
  const footerY = 60;
  page.drawLine({ start: { x: margin, y: footerY + 40 }, end: { x: width - margin, y: footerY + 40 }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
  page.drawText('Clinic Director Signature', { x: margin, y: footerY, size: 9, font: timesBoldFont });
  page.drawText('Audit Seal', { x: width - margin - 80, y: footerY, size: 9, font: timesBoldFont });

  pdfDoc.setTitle(fileName);
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
  saveAs(blob, `${fileName}.pdf`);
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
};

export const generateInvoicePDF = async (invoice: any, options: { returnBlob?: boolean } = {}) => {
  const rawName = invoice.patientName || 'patient';
  const rawPid = invoice.patientId || invoice.pid || 'unknown';
  const dateObj = new Date(invoice.date || new Date());
  const monthYearStr = dateObj.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }).toLowerCase().replace(' ', '_');
  const fileName = `${sanitizeFilename(rawName)}_${sanitizeFilename(String(rawPid))}_invoice_${monthYearStr}`;
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const page = pdfDoc.addPage([595, 842]);
  const { width, height } = page.getSize();
  const margin = 50;
  let currentY = height - 160;

  const dateStr = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  // Load logo images
  let circularLogo = null;
  
  try {
    const circBytes = await getCroppedCircularLogo('/logo.png');
    if (circBytes) {
      circularLogo = await pdfDoc.embedPng(circBytes);
    }
  } catch (e) {
    console.error('Circular logo loading failed:', e);
  }

  

  // Draw circular logo in the top-left corner
  if (circularLogo) {
    page.drawImage(circularLogo, {
      x: margin,
      y: height - 70,
      width: 50,
      height: 50,
    });
  }

  

  // Top Right: INVOICE
  page.drawText('INVOICE', { x: width - margin - 100, y: height - 60, size: 22, font: timesBoldFont, color: rgb(0.80, 0.09, 0.39) });

  // Branch Details
  const branchY = height - 100;
  const col1X = margin;

  page.drawText('ES Child Care Centre - KK Nagar', { x: col1X, y: branchY, size: 11, font: timesBoldFont, color: rgb(0.80, 0.09, 0.39) });
  page.drawText('PLOT 299, Rajaram Rd,', { x: col1X, y: branchY - 12, size: 8, font: timesRomanFont, color: rgb(0.3, 0.3, 0.3) });
  page.drawText('Opposite to Whiteline orchid avenue apartment,', { x: col1X, y: branchY - 24, size: 8, font: timesRomanFont, color: rgb(0.3, 0.3, 0.3) });
  page.drawText('K K Nagar, Tiruchirappalli, Tamil Nadu 620021', { x: col1X, y: branchY - 36, size: 8, font: timesRomanFont, color: rgb(0.3, 0.3, 0.3) });
  page.drawText('Dr.pratheep (MD Paediatrics)', { x: col1X, y: branchY - 48, size: 9, font: timesBoldFont, color: rgb(0.80, 0.09, 0.39) });

  // Invoice Metadata (Below Title)
  const metaY = height - 100;
  const metaX = width - margin - 100;
  page.drawText(`Invoice #: ${invoice.id?.substring(0, 8).toUpperCase()}`, { x: metaX, y: metaY, size: 9, font: timesBoldFont, color: rgb(0.2, 0.2, 0.2) });
  page.drawText(`Date: ${dateStr}`, { x: metaX, y: metaY - 12, size: 9, font: timesRomanFont, color: rgb(0.3, 0.3, 0.3) });

  // Line separator
  page.drawLine({ start: { x: margin, y: height - 155 }, end: { x: width - margin, y: height - 155 }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });

  currentY = height - 175;

  const drawSection = (title: string, y: number) => {
    page.drawRectangle({ x: margin, y: y - 5, width: width - (margin * 2), height: 22, color: rgb(0.80, 0.09, 0.39) });
    page.drawText(title, { x: margin + 10, y: y, size: 10, font: timesBoldFont, color: rgb(1, 1, 1) });
    return y - 30;
  };

  const drawRow = (label: string, value: string, y: number, isTotal = false) => {
    const colWidth = 250;
    page.drawRectangle({ x: margin, y: y - 5, width: width - (margin * 2), height: 25, color: isTotal ? rgb(0.95, 0.98, 0.98) : rgb(1, 1, 1) });
    page.drawText(label.toUpperCase(), { x: margin + 10, y: y + 5, size: 8, font: timesBoldFont, color: rgb(0.3, 0.4, 0.4) });
    page.drawText(value || 'N/A', { x: margin + colWidth, y: y + 5, size: 10, font: isTotal ? timesBoldFont : timesRomanFont, color: rgb(0.1, 0.1, 0.1) });
    page.drawLine({ start: { x: margin, y: y - 5 }, end: { x: width - margin, y: y - 5 }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
    return y - 25;
  };

  // 1. BILL TO
  page.drawText('BILL TO:', { x: margin, y: currentY, size: 10, font: timesBoldFont, color: rgb(0.1, 0.1, 0.1) });
  currentY -= 15;

  page.drawText(invoice.patientName || 'Unknown', { x: margin, y: currentY, size: 10, font: timesBoldFont, color: rgb(0.2, 0.2, 0.2) });
  currentY -= 12;

  const displayPid = invoice.patientId || invoice.pid;
  if (displayPid) {
    const pidVal = displayPid.toString().startsWith('ES-') ? displayPid : `ES-${displayPid}`;
    page.drawText(`Patient ID: ${pidVal}`, { x: margin, y: currentY, size: 9, font: timesBoldFont, color: rgb(0.2, 0.2, 0.2) });
    currentY -= 12;
  }

  const branchVal = invoice.registeredBranch || invoice.branch;
  if (branchVal) {
    page.drawText(`Registered Branch: ${branchVal}`, { x: margin, y: currentY, size: 9, font: timesRomanFont, color: rgb(0.3, 0.3, 0.3) });
    currentY -= 12;
  }

  page.drawText(invoice.patientAddress || 'N/A', { x: margin, y: currentY, size: 9, font: timesRomanFont, color: rgb(0.3, 0.3, 0.3) });
  currentY -= 12;

  page.drawText(invoice.patientPhone || 'N/A', { x: margin, y: currentY, size: 9, font: timesRomanFont, color: rgb(0.3, 0.3, 0.3) });
  currentY -= 20;

  // Calculate Medicine Charges
  const medicineTotal = (invoice.medicines || []).reduce((sum: number, med: any) => sum + (Number(med.price) || 0), 0);

  const hasConsultingFee = invoice.consultingFee !== undefined && invoice.consultingFee !== null && Number(invoice.consultingFee) > 0;
  const hasOtherCharges = invoice.otherCharges !== undefined && invoice.otherCharges !== null && Number(invoice.otherCharges) > 0;
  const hasFareBreakdown = invoice.fareBreakdown && invoice.fareBreakdown.length > 0;
  
  let extras: string[] = [];
  if (invoice.lab) extras.push(`Lab: ${invoice.lab}`);
  if (invoice.brace) extras.push(`Brace: ${invoice.brace}`);
  if (invoice.nutraceutical) extras.push(`Nutra: ${invoice.nutraceutical}`);
  
  const hasExtras = extras.length > 0;

  // 2. FARE BREAKDOWN
  if (hasConsultingFee || hasOtherCharges || hasFareBreakdown || hasExtras) {
    currentY -= 10;

    // Table Headers
    page.drawText('FARE BREAKDOWN', { x: margin, y: currentY, size: 9, font: timesBoldFont, color: rgb(0.1, 0.1, 0.1) });
    page.drawText('COST', { x: width - margin - 50, y: currentY, size: 9, font: timesBoldFont, color: rgb(0.1, 0.1, 0.1) });
    currentY -= 5;

    // Line below headers
    page.drawLine({ start: { x: margin, y: currentY }, end: { x: width - margin, y: currentY }, thickness: 0.5, color: rgb(0.5, 0.5, 0.5) });
    currentY -= 15;

    // Consulting Fee
    if (hasConsultingFee) {
      page.drawText('Consulting Fee', { x: margin, y: currentY, size: 9, font: timesRomanFont, color: rgb(0.2, 0.2, 0.2) });
      page.drawText(`INR ${Number(invoice.consultingFee).toLocaleString('en-IN')}`, { x: width - margin - 50, y: currentY, size: 9, font: timesRomanFont, color: rgb(0.2, 0.2, 0.2) });
      currentY -= 15;
    }

    // Fare Breakdown Items
    if (hasFareBreakdown) {
      invoice.fareBreakdown.forEach((bd: any) => {
        if (bd.item || bd.amount > 0) {
          page.drawText(bd.item || 'Item', { x: margin, y: currentY, size: 9, font: timesRomanFont, color: rgb(0.2, 0.2, 0.2) });
          page.drawText(`INR ${Number(bd.amount || 0).toLocaleString('en-IN')}`, { x: width - margin - 50, y: currentY, size: 9, font: timesRomanFont, color: rgb(0.2, 0.2, 0.2) });
          currentY -= 15;
        }
      });
    }

    // Other Charges & Extras (Lab, Brace, Nutraceutical)
    if (hasOtherCharges || hasExtras) {
      let otherLabel = 'Other Charges';
      if (hasExtras) {
        otherLabel += ` (${extras.join(', ')})`;
      }
      // Truncate if too long
      if (otherLabel.length > 80) otherLabel = otherLabel.substring(0, 77) + '...';
      
      page.drawText(otherLabel, { x: margin, y: currentY, size: 9, font: timesRomanFont, color: rgb(0.2, 0.2, 0.2) });
      page.drawText(`INR ${Number(invoice.otherCharges || 0).toLocaleString('en-IN')}`, { x: width - margin - 50, y: currentY, size: 9, font: timesRomanFont, color: rgb(0.2, 0.2, 0.2) });
      currentY -= 15;
    }
  }

  // Medicine Charges
  if (medicineTotal > 0 || (invoice.medicines && invoice.medicines.length > 0)) {
    page.drawText('Medicine Charges', { x: margin, y: currentY, size: 9, font: timesRomanFont, color: rgb(0.2, 0.2, 0.2) });
    page.drawText(`INR ${medicineTotal.toLocaleString('en-IN')}`, { x: width - margin - 50, y: currentY, size: 9, font: timesRomanFont, color: rgb(0.2, 0.2, 0.2) });
    currentY -= 15;
  }

  // Fallback for older invoices that used 'service' or 'package' or if nothing else was added
  if (!hasConsultingFee && !hasOtherCharges && !hasFareBreakdown && (!invoice.medicines || invoice.medicines.length === 0)) {
    let serviceName = 'General Consultation';
    const cost = invoice.totalAmount || 0;
    if (invoice.billingType === 'SERVICE' || invoice.service) {
      serviceName = `${invoice.service || 'Service'} - ${invoice.subService || 'N/A'}`;
    } else if (invoice.billingType === 'PACKAGE' || invoice.packageCategory) {
      serviceName = `${invoice.packageCategory || 'Package'} (${invoice.sessions || 'N/A'})`;
    }
    
    // Fallback creates its own Breakdown section if nothing else existed
    currentY -= 10;
    page.drawText('FARE BREAKDOWN', { x: margin, y: currentY, size: 9, font: timesBoldFont, color: rgb(0.1, 0.1, 0.1) });
    page.drawText('COST', { x: width - margin - 50, y: currentY, size: 9, font: timesBoldFont, color: rgb(0.1, 0.1, 0.1) });
    currentY -= 5;
    page.drawLine({ start: { x: margin, y: currentY }, end: { x: width - margin, y: currentY }, thickness: 0.5, color: rgb(0.5, 0.5, 0.5) });
    currentY -= 15;
    
    page.drawText(serviceName, { x: margin, y: currentY, size: 9, font: timesRomanFont, color: rgb(0.2, 0.2, 0.2) });
    page.drawText(`INR ${cost.toLocaleString('en-IN')}`, { x: width - margin - 50, y: currentY, size: 9, font: timesRomanFont, color: rgb(0.2, 0.2, 0.2) });
    currentY -= 15;
  }

  // PRESCRIPTION DETAILS
  if (invoice.medicines && invoice.medicines.length > 0) {
    currentY -= 5;
    page.drawLine({ start: { x: margin, y: currentY }, end: { x: width - margin, y: currentY }, thickness: 0.5, color: rgb(0.9, 0.9, 0.9) });
    currentY -= 15;

    page.drawText('PRESCRIPTION DETAILS', { x: margin, y: currentY, size: 9, font: timesBoldFont, color: rgb(0.1, 0.1, 0.1) });
    currentY -= 10;

    // Table Header
    page.drawRectangle({ x: margin, y: currentY - 12, width: width - (margin * 2), height: 18, color: rgb(0.95, 0.98, 0.98) });
    page.drawText('MEDICINE NAME', { x: margin + 5, y: currentY - 6, size: 8, font: timesBoldFont, color: rgb(0.3, 0.4, 0.4) });
    page.drawText('INTAKE (M-A-E-N)', { x: margin + 180, y: currentY - 6, size: 8, font: timesBoldFont, color: rgb(0.3, 0.4, 0.4) });
    page.drawText('QTY', { x: margin + 320, y: currentY - 6, size: 8, font: timesBoldFont, color: rgb(0.3, 0.4, 0.4) });
    page.drawText('PRICE', { x: width - margin - 45, y: currentY - 6, size: 8, font: timesBoldFont, color: rgb(0.3, 0.4, 0.4) });
    
    currentY -= 12; // Move past header

    invoice.medicines.forEach((med: any, idx: number) => {
      currentY -= 18; // Row height

      const intakeStr = med.morning || med.afternoon || med.evening || med.night 
        ? [med.morning || '0', med.afternoon || '0', med.evening || '0', med.night || '0'].join('-') 
        : (med.intakeTime || '');
        
      let medNameStr = `${idx + 1}. ${med.name || 'Medicine'}`;
      let timingStr = med.timing ? `(${med.timing})` : '';
      
      // Values
      page.drawText(medNameStr.substring(0, 30), { x: margin + 5, y: currentY, size: 8, font: timesBoldFont, color: rgb(0.2, 0.2, 0.2) });
      page.drawText(`${intakeStr} ${timingStr}`, { x: margin + 180, y: currentY, size: 8, font: timesRomanFont, color: rgb(0.2, 0.2, 0.2) });
      page.drawText(String(med.quantity || '-'), { x: margin + 320, y: currentY, size: 8, font: timesRomanFont, color: rgb(0.2, 0.2, 0.2) });
      
      if (med.price > 0) {
        page.drawText(`INR ${Number(med.price).toLocaleString('en-IN')}`, { x: width - margin - 45, y: currentY, size: 8, font: timesRomanFont, color: rgb(0.5, 0.5, 0.5) });
      } else {
        page.drawText('-', { x: width - margin - 45, y: currentY, size: 8, font: timesRomanFont, color: rgb(0.5, 0.5, 0.5) });
      }

      // Small separator line between rows
      page.drawLine({ start: { x: margin, y: currentY - 4 }, end: { x: width - margin, y: currentY - 4 }, thickness: 0.2, color: rgb(0.95, 0.95, 0.95) });
    });
    currentY -= 10;
  }

  // Line below content
  page.drawLine({ start: { x: margin, y: currentY }, end: { x: width - margin, y: currentY }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });
  currentY -= 20;

  // 3. PAYMENT SUMMARY (Redesigned)
  currentY -= 10;

  const rightLabelX = width - margin - 200;
  const rightValueX = width - margin - 50;

  const drawSummaryRow = (label: string, value: string, y: number, isBold = false) => {
    page.drawText(label, { x: rightLabelX, y: y, size: 9, font: timesBoldFont, color: rgb(0.2, 0.2, 0.2) });
    page.drawText(value, { x: rightValueX, y: y, size: 9, font: isBold ? timesBoldFont : timesRomanFont, color: rgb(0.1, 0.1, 0.1) });
    return y - 15;
  };

  currentY = drawSummaryRow('TOTAL AMOUNT:', `INR ${invoice.totalAmount?.toLocaleString('en-IN') || 0}`, currentY);
  currentY = drawSummaryRow('DISCOUNT:', `INR ${invoice.discount?.toLocaleString('en-IN') || 0}`, currentY);
  currentY = drawSummaryRow('PAID AMOUNT:', `INR ${invoice.paidAmount?.toLocaleString('en-IN') || 0}`, currentY);
  currentY = drawSummaryRow('PAYMENT MODE:', invoice.paymentMode || 'Cash', currentY);

  currentY -= 5; // Add space before line

  // Draw a small line above Due Amount to separate it
  page.drawLine({ start: { x: rightLabelX, y: currentY }, end: { x: width - margin, y: currentY }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });

  currentY -= 10; // Add space after line

  currentY = drawSummaryRow('DUE AMOUNT:', `INR ${invoice.dueAmount?.toLocaleString('en-IN') || 0}`, currentY, true);
  currentY = drawSummaryRow('STATUS:', invoice.status || 'PENDING', currentY, true);
  currentY -= 20;

  // Status Stamp
  const status = invoice.status || 'PENDING';
  let stampColor = rgb(0.5, 0.5, 0.5); // Default grey
  let stampBg = rgb(0.95, 0.95, 0.95);

  if (status === 'PAID') {
    stampColor = rgb(0.0, 0.6, 0.2);
    stampBg = rgb(0.9, 0.98, 0.95);
  } else if (status === 'PENDING') {
    stampColor = rgb(0.9, 0.5, 0.0);
    stampBg = rgb(1.0, 0.96, 0.9);
  } else if (status === 'PARTIALLY PAID') {
    stampColor = rgb(0.0, 0.4, 0.8);
    stampBg = rgb(0.9, 0.95, 1.0);
  } else if (status === 'OVERDUE') {
    stampColor = rgb(0.8, 0.1, 0.1);
    stampBg = rgb(1.0, 0.9, 0.9);
  }

  const stampX = margin;
  const stampY = currentY - 10;

  page.drawRectangle({
    x: stampX,
    y: stampY,
    width: 90, // Give more space for "PARTIALLY PAID"
    height: 25,
    color: stampBg,
    borderColor: stampColor,
    borderWidth: 1.5,
  });

  const labelText = status === 'PARTIALLY PAID' ? 'PARTIAL' : status;
  page.drawText(labelText, {
    x: stampX + 15,
    y: stampY + 8,
    size: 10,
    font: timesBoldFont,
    color: stampColor,
  });

  // Footer
  const footerY = 60;
  page.drawLine({ start: { x: margin, y: footerY + 40 }, end: { x: width - margin, y: footerY + 40 }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
  page.drawText('Authorized Signatory', { x: margin, y: footerY, size: 9, font: timesBoldFont });
  page.drawText('Thank you for choosing H2F Rehab', { x: width / 2 - 80, y: footerY, size: 9, font: timesRomanFont, color: rgb(0.5, 0.5, 0.5) });

  pdfDoc.setTitle(fileName);
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
  if (options.returnBlob) {
    return blob;
  }
  saveAs(blob, `${fileName}.pdf`);
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
};

export const generatePayrollPDF = async (staff: any, monthStr: string) => {
  const rawName = staff.name || 'staff';
  const rawPid = staff.id || staff.staffId || 'unknown';
  const fileName = `${sanitizeFilename(rawName)}_${sanitizeFilename(String(rawPid))}_payslip_${sanitizeFilename(monthStr)}`;
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const page = pdfDoc.addPage([595, 842]);
  const { width, height } = page.getSize();
  const margin = 50;
  let currentY = height - 160;

  // Load logo images
  let circularLogo = null;
  
  try {
    const circBytes = await getCroppedCircularLogo('/logo.png');
    if (circBytes) {
      circularLogo = await pdfDoc.embedPng(circBytes);
    }
  } catch (e) {
    console.error('Circular logo loading failed:', e);
  }

  

  // Draw circular logo in the top-left corner
  if (circularLogo) {
    page.drawImage(circularLogo, {
      x: margin,
      y: height - 70,
      width: 50,
      height: 50,
    });
  }

  

  // Top Right: PAYSLIP
  page.drawText('PAYSLIP', { x: width - margin - 100, y: height - 60, size: 22, font: timesBoldFont, color: rgb(0.2, 0.2, 0.2) });

  // Branch Details
  const branchY = height - 100;
  const col1X = margin;

  page.drawText('ES Child Care Centre - KK Nagar', { x: col1X, y: branchY, size: 11, font: timesBoldFont, color: rgb(0.80, 0.09, 0.39) });
  page.drawText('PLOT 299, Rajaram Rd,', { x: col1X, y: branchY - 12, size: 8, font: timesRomanFont, color: rgb(0.3, 0.3, 0.3) });
  page.drawText('Opposite to Whiteline orchid avenue apartment,', { x: col1X, y: branchY - 24, size: 8, font: timesRomanFont, color: rgb(0.3, 0.3, 0.3) });
  page.drawText('K K Nagar, Tiruchirappalli, Tamil Nadu 620021', { x: col1X, y: branchY - 36, size: 8, font: timesRomanFont, color: rgb(0.3, 0.3, 0.3) });
  page.drawText('Dr.pratheep (MD Paediatrics)', { x: col1X, y: branchY - 48, size: 9, font: timesBoldFont, color: rgb(0.80, 0.09, 0.39) });

  // Metadata (Below Title)
  const metaY = height - 100;
  const metaX = width - margin - 100;
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  page.drawText(`Date: ${dateStr}`, { x: metaX, y: metaY, size: 9, font: timesRomanFont, color: rgb(0.3, 0.3, 0.3) });

  // Line separator
  page.drawLine({ start: { x: margin, y: height - 155 }, end: { x: width - margin, y: height - 155 }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });

  currentY = height - 175;

  const drawSection = (title: string, y: number) => {
    page.drawRectangle({ x: margin, y: y - 5, width: width - (margin * 2), height: 22, color: rgb(0.80, 0.09, 0.39) });
    page.drawText(title, { x: margin + 10, y: y, size: 10, font: timesBoldFont, color: rgb(1, 1, 1) });
    return y - 30;
  };

  const drawRow = (label: string, value: string, y: number, isTotal = false) => {
    const colWidth = 250;
    page.drawRectangle({ x: margin, y: y - 5, width: width - (margin * 2), height: 25, color: isTotal ? rgb(0.95, 0.98, 0.98) : rgb(1, 1, 1) });
    page.drawText(label.toUpperCase(), { x: margin + 10, y: y + 5, size: 8, font: timesBoldFont, color: rgb(0.3, 0.4, 0.4) });
    page.drawText(value || '0', { x: margin + colWidth, y: y + 5, size: 10, font: isTotal ? timesBoldFont : timesRomanFont, color: rgb(0.1, 0.1, 0.1) });
    page.drawLine({ start: { x: margin, y: y - 5 }, end: { x: width - margin, y: y - 5 }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
    return y - 25;
  };

  // 1. STAFF DETAILS
  currentY = drawSection('1. STAFF DETAILS', currentY);
  currentY = drawRow('Staff Name', staff.name || 'Unknown', currentY);
  currentY = drawRow('Role / Branch', `${staff.role || 'N/A'} / ${staff.branch || 'N/A'}`, currentY);
  currentY = drawRow('Payroll Month', monthStr, currentY);
  currentY = drawRow('Date Generated', dateStr, currentY);
  currentY -= 15;

  // 2. EARNINGS & DEDUCTIONS
  currentY = drawSection('2. EARNINGS & DEDUCTIONS', currentY);
  currentY = drawRow('Days Present', String(staff.daysPresent || 0), currentY);
  currentY = drawRow('Base Salary', `INR ${staff.salary?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || 0}`, currentY);
  currentY = drawRow('Bonus / Allowance', `INR ${staff.bonus?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || 0}`, currentY);
  currentY = drawRow('Deductions', `INR ${staff.deductions?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || 0}`, currentY);
  currentY = drawRow('Net Pay', `INR ${staff.netPay?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || 0}`, currentY, true);
  currentY -= 30;

  // Footer
  const footerY = 60;
  page.drawLine({ start: { x: margin, y: footerY + 40 }, end: { x: width - margin, y: footerY + 40 }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
  page.drawText('Authorized HR Signatory', { x: margin, y: footerY, size: 9, font: timesBoldFont });
  page.drawText('Confidential Document', { x: width / 2 - 40, y: footerY, size: 9, font: timesRomanFont, color: rgb(0.5, 0.5, 0.5) });

  pdfDoc.setTitle(fileName);
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
  saveAs(blob, `${fileName}.pdf`);
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
};
