import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Call } from '@/types/call';
import type { Analysis } from '@/types/analysis';
import type { QALogEntry } from '@/types/qa-log';

/**
 * Export individual call analysis as PDF
 */
export function exportCallToPDF(call: Call, analysis: Analysis, qaLogEntry?: QALogEntry) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Pikl Insurance QA Report', pageWidth / 2, yPos, { align: 'center' });

  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, pageWidth / 2, yPos, { align: 'center' });

  if (qaLogEntry) {
    yPos += 5;
    doc.text(`QA Number: ${qaLogEntry.qaNumber}`, pageWidth / 2, yPos, { align: 'center' });
  }

  yPos += 15;
  doc.setDrawColor(0);
  doc.line(14, yPos, pageWidth - 14, yPos);

  yPos += 10;

  // Call Metadata
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text('Call Information', 14, yPos);

  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const metadata = [
    ['Agent', call.agentName],
    ['Agent ID', call.agentId],
    ['Date', new Date(call.timestamp).toLocaleDateString('en-GB')],
    ['Duration', `${Math.floor(call.duration / 60)}m ${Math.floor(call.duration % 60)}s`],
    ['Call Type', analysis.callType?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'N/A'],
    ['Reference', call.filename],
  ];

  metadata.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, 14, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 60, yPos);
    yPos += 6;
  });

  yPos += 10;

  // Overall Score
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Overall Performance', 14, yPos);

  yPos += 8;
  doc.setFontSize(24);
  doc.setTextColor(analysis.overallScore >= 8 ? 34 : analysis.overallScore >= 6 ? 200 : 220,
                   analysis.overallScore >= 8 ? 197 : analysis.overallScore >= 6 ? 120 : 38,
                   analysis.overallScore >= 8 ? 94 : analysis.overallScore >= 6 ? 40 : 38);
  doc.text(`${analysis.overallScore.toFixed(1)}/10`, pageWidth / 2, yPos, { align: 'center' });

  // Add weighted calculation subtitle
  yPos += 6;
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.setFont('helvetica', 'italic');
  doc.text('Weighted Average: 70% QA + 30% Compliance', pageWidth / 2, yPos, { align: 'center' });

  if (qaLogEntry) {
    yPos += 8;
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'normal');
    doc.text(`Internal Score: ${qaLogEntry.internalScore}/5`, pageWidth / 2, yPos, { align: 'center' });
    doc.text(`Compliance: ${qaLogEntry.mandatoryCompliance.toUpperCase()}`, pageWidth / 2, yPos + 5, { align: 'center' });
  }

  // Add new page for scores
  doc.addPage();
  yPos = 20;

  // QA Dimensions Scores
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text('Quality Assurance Dimensions', 14, yPos);

  // Add QA aggregate score if available
  if (analysis.qaScore !== undefined) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`QA Score: ${analysis.qaScore.toFixed(1)}/10`, 14, yPos + 5);
    yPos += 8;
  }

  yPos += 8;

  const qaScores = [
    ['Rapport', analysis.scores.rapport],
    ['Needs Discovery', analysis.scores.needsDiscovery],
    ['Product Knowledge', analysis.scores.productKnowledge],
    ['Objection Handling', analysis.scores.objectionHandling],
    ['Closing', analysis.scores.closing],
    ['Professionalism', analysis.scores.professionalism],
    ['Follow-Up', analysis.scores.followUp],
  ].filter(([_, score]) => score !== undefined && score !== null); // Filter out undefined scores

  const qaTableData = qaScores.map(([dimension, score]) => {
    const numScore = typeof score === 'number' ? score : parseFloat(String(score));
    return [
      dimension,
      `${score}/10`,
      numScore >= 8 ? 'Excellent' : numScore >= 6 ? 'Good' : numScore >= 4 ? 'Fair' : 'Needs Improvement'
    ];
  });

  autoTable(doc, {
    startY: yPos,
    head: [['Dimension', 'Score', 'Rating']],
    body: qaTableData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 9 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // UK Compliance Scores
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('UK Compliance Dimensions', 14, yPos);

  // Add Compliance aggregate score if available
  if (analysis.complianceScore !== undefined) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Compliance Score: ${analysis.complianceScore.toFixed(1)}/10`, 14, yPos + 5);
    yPos += 8;
  }

  yPos += 8;

  const complianceScores = [
    ['Call Opening Compliance', analysis.scores.callOpeningCompliance],
    ['Data Protection Compliance', analysis.scores.dataProtectionCompliance],
    ['Mandatory Disclosures', analysis.scores.mandatoryDisclosures],
    ['TCF Compliance', analysis.scores.tcfCompliance],
    ['Sales Process Compliance', analysis.scores.salesProcessCompliance || null],
    ['Complaints Handling', analysis.scores.complaintsHandling || null],
  ];

  const complianceTableData = complianceScores
    .filter(([_, score]) => score !== null)
    .map(([dimension, score]) => {
      const numScore = typeof score === 'number' ? score : parseFloat(String(score ?? 0));
      return [
        dimension,
        `${score}/10`,
        numScore === 10 ? 'Full Compliance' : numScore >= 8 ? 'Compliant' : numScore >= 7 ? 'Minor Gap' : 'Breach'
      ];
    });

  autoTable(doc, {
    startY: yPos,
    head: [['Dimension', 'Score', 'Status']],
    body: complianceTableData,
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235] },
    styles: { fontSize: 9 },
  });

  // Add new page for compliance issues
  if (analysis.complianceIssues && analysis.complianceIssues.length > 0) {
    doc.addPage();
    yPos = 20;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Compliance Issues', 14, yPos);

    yPos += 8;

    analysis.complianceIssues.forEach((issue, idx) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');

      // Severity color
      const severityColor: [number, number, number] =
        issue.severity === 'critical' ? [220, 38, 38] :
        issue.severity === 'high' ? [234, 88, 12] :
        issue.severity === 'medium' ? [202, 138, 4] : [59, 130, 246];

      doc.setTextColor(severityColor[0], severityColor[1], severityColor[2]);
      doc.text(`${idx + 1}. ${issue.severity.toUpperCase()}`, 14, yPos);

      doc.setTextColor(0);
      yPos += 6;
      doc.setFont('helvetica', 'normal');

      // Issue description
      const issueText = doc.splitTextToSize(issue.issue, pageWidth - 28);
      doc.text(issueText, 14, yPos);
      yPos += issueText.length * 5;

      // Regulatory reference
      yPos += 4;
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100);
      doc.text(`Reference: ${issue.regulatoryReference}`, 14, yPos);

      yPos += 10;
    });
  }

  // Add new page for coaching recommendations
  doc.addPage();
  yPos = 20;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text('Coaching Recommendations', 14, yPos);

  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  if (analysis.coachingRecommendations && analysis.coachingRecommendations.length > 0) {
    analysis.coachingRecommendations.forEach((recommendation: string, idx: number) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      const recText = doc.splitTextToSize(`${idx + 1}. ${recommendation}`, pageWidth - 28);
      doc.text(recText, 14, yPos);
      yPos += recText.length * 5 + 5;
    });
  }

  // Summary
  yPos += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', 14, yPos);

  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const summaryText = doc.splitTextToSize(analysis.summary || 'No summary available', pageWidth - 28);
  doc.text(summaryText, 14, yPos);

  // Footer with signature section
  doc.addPage();
  yPos = 20;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('QA Manager Sign-Off', 14, yPos);

  yPos += 20;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Reviewed by: _______________________________', 14, yPos);

  yPos += 15;
  doc.text('Date: _______________________________', 14, yPos);

  yPos += 15;
  doc.text('Signature: _______________________________', 14, yPos);

  // Footer on each page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Pikl Insurance QA Report - Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Download
  const filename = `QA-Report-${call.agentName.replace(/\s+/g, '-')}-${new Date(call.timestamp).toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

/**
 * Export individual call analysis as CSV
 */
export function exportCallToCSV(call: Call, analysis: Analysis, qaLogEntry?: QALogEntry) {
  const rows: string[][] = [];

  // Metadata
  rows.push(['Call Information']);
  rows.push(['Agent', call.agentName]);
  rows.push(['Agent ID', call.agentId]);
  rows.push(['Date', new Date(call.timestamp).toLocaleDateString('en-GB')]);
  rows.push(['Duration (seconds)', call.duration.toString()]);
  rows.push(['Call Type', analysis.callType || 'N/A']);
  rows.push(['Reference', call.filename]);
  // Always include QA fields for consistent CSV structure
  rows.push(['QA Number', qaLogEntry?.qaNumber || 'N/A']);
  rows.push(['Internal Score', qaLogEntry?.internalScore?.toString() || 'N/A']);
  rows.push(['Mandatory Compliance', qaLogEntry?.mandatoryCompliance || 'N/A']);
  rows.push([]);

  // Overall Score
  rows.push(['Overall Performance']);
  rows.push(['Overall Score', analysis.overallScore.toFixed(1)]);
  rows.push(['Note', 'Weighted Average: 70% QA + 30% Compliance']);
  if (analysis.qaScore !== undefined) {
    rows.push(['QA Score', analysis.qaScore.toFixed(1)]);
  }
  if (analysis.complianceScore !== undefined) {
    rows.push(['Compliance Score', analysis.complianceScore.toFixed(1)]);
  }
  rows.push([]);

  // QA Dimensions
  rows.push(['QA Dimensions (7 core dimensions)', 'Score']);
  rows.push(['Rapport', analysis.scores.rapport.toString()]);
  rows.push(['Needs Discovery', analysis.scores.needsDiscovery.toString()]);
  rows.push(['Product Knowledge', analysis.scores.productKnowledge.toString()]);
  rows.push(['Objection Handling', analysis.scores.objectionHandling.toString()]);
  rows.push(['Closing', analysis.scores.closing.toString()]);
  rows.push(['Professionalism', analysis.scores.professionalism.toString()]);
  rows.push(['Follow-Up', analysis.scores.followUp.toString()]);
  rows.push([]);

  // UK Compliance
  rows.push(['UK Compliance Dimensions (6 dimensions)', 'Score']);
  rows.push(['Call Opening Compliance', analysis.scores.callOpeningCompliance?.toString() || 'N/A']);
  rows.push(['Data Protection Compliance', analysis.scores.dataProtectionCompliance?.toString() || 'N/A']);
  rows.push(['Mandatory Disclosures', analysis.scores.mandatoryDisclosures?.toString() || 'N/A']);
  rows.push(['TCF Compliance', analysis.scores.tcfCompliance?.toString() || 'N/A']);
  rows.push(['Sales Process Compliance', analysis.scores.salesProcessCompliance?.toString() || 'N/A']);
  rows.push(['Complaints Handling', analysis.scores.complaintsHandling?.toString() || 'N/A']);
  rows.push([]);

  // Compliance Issues
  if (analysis.complianceIssues && analysis.complianceIssues.length > 0) {
    rows.push(['Compliance Issues']);
    rows.push(['Severity', 'Issue', 'Regulatory Reference']);
    analysis.complianceIssues.forEach((issue: any) => {
      rows.push([
        issue.severity,
        `"${issue.issue.replace(/"/g, '""')}"`,
        issue.regulatoryReference
      ]);
    });
    rows.push([]);
  }

  // Coaching Recommendations
  if (analysis.coachingRecommendations && analysis.coachingRecommendations.length > 0) {
    rows.push(['Coaching Recommendations']);
    analysis.coachingRecommendations.forEach((rec: string, idx: number) => {
      rows.push([`${idx + 1}`, `"${rec.replace(/"/g, '""')}"`]);
    });
    rows.push([]);
  }

  // Summary
  rows.push(['Summary']);
  rows.push([`"${(analysis.summary || '').replace(/"/g, '""')}"`]);

  // Convert to CSV string
  const csvContent = rows.map(row => row.join(',')).join('\n');

  // Download
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `QA-Report-${call.agentName.replace(/\s+/g, '-')}-${new Date(call.timestamp).toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
