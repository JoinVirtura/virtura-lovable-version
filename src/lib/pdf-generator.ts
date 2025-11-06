import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface FinancialReportData {
  dateRange: { start: string; end: string };
  metrics: {
    totalRevenue: number;
    totalCosts: number;
    netProfit: number;
    profitMargin: number;
  };
  chartIds: string[];
  transactions: any[];
  summary: {
    activeSubscriptions: number;
    mrr: number;
    tokenUtilization: number;
    avgCostPerToken: number;
  };
}

export async function generateFinancialPDF(data: FinancialReportData): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;

  // Header
  pdf.setFontSize(20);
  pdf.setTextColor(79, 70, 229); // Primary color
  pdf.text('Financial Report', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 10;
  pdf.setFontSize(12);
  pdf.setTextColor(100, 100, 100);
  pdf.text(
    `Period: ${new Date(data.dateRange.start).toLocaleDateString()} - ${new Date(data.dateRange.end).toLocaleDateString()}`,
    pageWidth / 2,
    yPosition,
    { align: 'center' }
  );
  pdf.text(
    `Generated: ${new Date().toLocaleString()}`,
    pageWidth / 2,
    yPosition + 6,
    { align: 'center' }
  );

  yPosition += 20;

  // Revenue Metrics Summary
  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Revenue Summary', 15, yPosition);
  yPosition += 10;

  pdf.setFontSize(11);
  const metrics = [
    ['Total Revenue', `$${data.metrics.totalRevenue.toFixed(2)}`],
    ['Total API Costs', `$${data.metrics.totalCosts.toFixed(2)}`],
    ['Net Profit', `$${data.metrics.netProfit.toFixed(2)}`],
    ['Profit Margin', `${data.metrics.profitMargin.toFixed(2)}%`],
  ];

  metrics.forEach(([label, value]) => {
    pdf.setTextColor(100, 100, 100);
    pdf.text(label, 20, yPosition);
    pdf.setTextColor(0, 0, 0);
    pdf.text(value, 100, yPosition);
    yPosition += 7;
  });

  yPosition += 10;

  // Capture charts
  for (let i = 0; i < data.chartIds.length; i++) {
    const chartElement = document.getElementById(data.chartIds[i]);
    if (chartElement) {
      try {
        const canvas = await html2canvas(chartElement, {
          scale: 2,
          backgroundColor: '#ffffff',
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 30;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Check if we need a new page
        if (yPosition + imgHeight > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.addImage(imgData, 'PNG', 15, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 10;
      } catch (error) {
        console.error('Error capturing chart:', error);
      }
    }
  }

  // Financial Summary
  if (yPosition + 60 > pageHeight) {
    pdf.addPage();
    yPosition = 20;
  }

  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Financial Summary', 15, yPosition);
  yPosition += 10;

  pdf.setFontSize(11);
  const summaryItems = [
    ['Active Subscriptions', data.summary.activeSubscriptions.toString()],
    ['MRR', `$${data.summary.mrr.toFixed(2)}`],
    ['Token Utilization', `${data.summary.tokenUtilization.toFixed(2)}%`],
    ['Avg Cost Per Token', `$${data.summary.avgCostPerToken.toFixed(4)}`],
  ];

  summaryItems.forEach(([label, value]) => {
    pdf.setTextColor(100, 100, 100);
    pdf.text(label, 20, yPosition);
    pdf.setTextColor(0, 0, 0);
    pdf.text(value, 100, yPosition);
    yPosition += 7;
  });

  // Transaction Table (first 50 transactions)
  if (data.transactions.length > 0) {
    pdf.addPage();
    yPosition = 20;
    
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Transaction Details', 15, yPosition);
    yPosition += 10;

    pdf.setFontSize(9);
    const headers = ['Date', 'User', 'Type', 'Tokens', 'USD'];
    const columnWidths = [30, 60, 30, 25, 25];
    let xPosition = 15;

    // Headers
    pdf.setTextColor(100, 100, 100);
    headers.forEach((header, i) => {
      pdf.text(header, xPosition, yPosition);
      xPosition += columnWidths[i];
    });
    yPosition += 6;

    // Transactions (limit to 50)
    pdf.setTextColor(0, 0, 0);
    const transactionsToShow = data.transactions.slice(0, 50);
    
    transactionsToShow.forEach((txn) => {
      if (yPosition > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
      }

      xPosition = 15;
      const row = [
        new Date(txn.created_at).toLocaleDateString(),
        txn.user_email?.substring(0, 20) || 'N/A',
        txn.transaction_type,
        txn.amount?.toString() || '0',
        txn.cost_usd ? `$${Number(txn.cost_usd).toFixed(2)}` : '-',
      ];

      row.forEach((cell, i) => {
        pdf.text(cell, xPosition, yPosition);
        xPosition += columnWidths[i];
      });
      yPosition += 5;
    });

    if (data.transactions.length > 50) {
      yPosition += 5;
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Showing 50 of ${data.transactions.length} transactions`, 15, yPosition);
    }
  }

  // Footer on all pages
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(9);
    pdf.setTextColor(150, 150, 150);
    pdf.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  const filename = `financial-report-${data.dateRange.start}-${data.dateRange.end}.pdf`;
  pdf.save(filename);
}
