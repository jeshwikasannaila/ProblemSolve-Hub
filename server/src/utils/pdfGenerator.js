const PDFDocument = require('pdfkit');

/**
 * Generates an official, print-ready Certificate PDF for an awarded developer
 * 
 * @param {Object} cert - Certificate data from SQLite
 * @param {stream.Writable} outputStream - Stream to pipe PDF bytes into
 */
function generateCertificatePDF(cert, outputStream) {
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margins: { top: 30, bottom: 30, left: 30, right: 30 },
    info: {
      Title: `ProblemSolve Hub Certificate - ${cert.developer_name}`,
      Author: 'ProblemSolve Hub Platform',
      Subject: `Engineering Challenge Award - ${cert.certificate_code}`,
      Keywords: 'certificate, award, engineering, winner, bounty, problemsolve hub'
    }
  });

  doc.pipe(outputStream);

  const width = doc.page.width;
  const height = doc.page.height;

  // 1. Background Tint
  doc.rect(0, 0, width, height).fill('#fcfdfd');

  // 2. Outer Charcoal Border
  doc.rect(26, 26, width - 52, height - 52)
     .lineWidth(3.5)
     .strokeColor('#0f172a')
     .stroke();

  // 3. Inner Gold Accent Border
  doc.rect(34, 34, width - 68, height - 68)
     .lineWidth(1.2)
     .strokeColor('#d97706')
     .stroke();

  // 4. Elegant Corner Accents
  const cornerSize = 14;
  const corners = [
    [34, 34],
    [width - 34 - cornerSize, 34],
    [34, height - 34 - cornerSize],
    [width - 34 - cornerSize, height - 34 - cornerSize]
  ];
  corners.forEach(([cx, cy]) => {
    doc.rect(cx, cy, cornerSize, cornerSize).fill('#0f172a');
  });

  // 5. Header: Platform Branding
  doc.font('Helvetica-Bold')
     .fontSize(22)
     .fillColor('#059669')
     .text('ProblemSolve Hub', 0, 52, { align: 'center' });

  doc.font('Helvetica-Bold')
     .fontSize(7.5)
     .fillColor('#64748b')
     .text('CUSTOMER PROBLEM SOLVING & REWARD PLATFORM', 0, 78, { align: 'center', characterSpacing: 2 });

  // 6. Certificate Title
  doc.font('Helvetica-Bold')
     .fontSize(19)
     .fillColor('#0f172a')
     .text('CERTIFICATE OF ACHIEVEMENT', 0, 102, { align: 'center', characterSpacing: 1.5 });

  doc.font('Helvetica-Bold')
     .fontSize(10)
     .fillColor('#d97706')
     .text(cert.award_title || '1ST PLACE WINNER & BEST SOLUTION', 0, 126, { align: 'center', characterSpacing: 1 });

  // Decorative Accent Line
  doc.moveTo(width / 2 - 130, 144)
     .lineTo(width / 2 + 130, 144)
     .lineWidth(1)
     .strokeColor('#e2e8f0')
     .stroke();

  // 7. Recipient Introduction
  doc.font('Helvetica')
     .fontSize(11)
     .fillColor('#475569')
     .text('This official certificate is proudly presented to', 0, 160, { align: 'center' });

  // 8. Winning Developer's Full Name
  doc.font('Helvetica-Bold')
     .fontSize(26)
     .fillColor('#0f172a')
     .text(cert.developer_name, 0, 182, { align: 'center' });

  // Underline beneath developer's name
  const nameWidth = doc.widthOfString(cert.developer_name);
  const lineWidth = Math.max(nameWidth * 0.7, 120);
  doc.moveTo(width / 2 - lineWidth, 216)
     .lineTo(width / 2 + lineWidth, 216)
     .lineWidth(1.5)
     .strokeColor('#059669')
     .stroke();

  // 9. Context text
  doc.font('Helvetica')
     .fontSize(10.5)
     .fillColor('#475569')
     .text('for architecting and delivering the winning solution to the engineering challenge:', 0, 228, { align: 'center' });

  // 10. Challenge Statement Title
  doc.font('Helvetica-Bold')
     .fontSize(15)
     .fillColor('#047857')
     .text(`"${cert.problem_title}"`, 60, 248, { align: 'center', width: width - 120 });

  // 11. Three Clean Info Cards (Company, Reward, Date)
  const metaY = 300;
  const cardW = 210;
  const cardH = 50;
  const cardGap = 20;
  const totalW = (cardW * 3) + (cardGap * 2);
  const startX = (width - totalW) / 2;

  // Card 1: Issuing Company
  doc.rect(startX, metaY, cardW, cardH).fillAndStroke('#f8fafc', '#e2e8f0');
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#64748b').text('ISSUING COMPANY', startX, metaY + 9, { align: 'center', width: cardW, characterSpacing: 1 });
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#0f172a').text(cert.company_name || cert.customer_name, startX, metaY + 24, { align: 'center', width: cardW });

  // Card 2: Bounty Amount
  const card2X = startX + cardW + cardGap;
  doc.rect(card2X, metaY, cardW, cardH).fillAndStroke('#f8fafc', '#e2e8f0');
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#64748b').text('GUARANTEED REWARD BOUNTY', card2X, metaY + 9, { align: 'center', width: cardW, characterSpacing: 1 });
  doc.font('Helvetica-Bold').fontSize(12).fillColor('#059669').text(`$${Number(cert.reward_amount || 0).toLocaleString()} USD`, card2X, metaY + 24, { align: 'center', width: cardW });

  // Card 3: Issue Date
  const card3X = card2X + cardW + cardGap;
  doc.rect(card3X, metaY, cardW, cardH).fillAndStroke('#f8fafc', '#e2e8f0');
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#64748b').text('DATE OF ISSUE', card3X, metaY + 9, { align: 'center', width: cardW, characterSpacing: 1 });
  const formattedDate = new Date(cert.issue_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#0f172a').text(formattedDate, card3X, metaY + 24, { align: 'center', width: cardW });

  // 12. Optional Customer Review Feedback
  if (cert.customer_review) {
    doc.font('Helvetica-Oblique')
       .fontSize(8.5)
       .fillColor('#64748b')
       .text(`"${cert.customer_review}"`, 100, 368, { align: 'center', width: width - 200, lineGap: 2 });
  }

  // 13. Signatures & Official Platform Seal Block
  const sigY = 432;
  const sigColW = 180;

  // Left: Customer Signature Line
  const leftSigX = 75;
  doc.moveTo(leftSigX, sigY).lineTo(leftSigX + sigColW, sigY).lineWidth(1).strokeColor('#94a3b8').stroke();
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#0f172a').text(cert.company_name || cert.customer_name, leftSigX, sigY + 6, { align: 'center', width: sigColW });
  doc.font('Helvetica').fontSize(7.5).fillColor('#64748b').text('Challenge Sponsor & Customer', leftSigX, sigY + 18, { align: 'center', width: sigColW });

  // Center: Official Platform Seal Badge
  const sealX = width / 2;
  const sealY = sigY + 3;
  doc.circle(sealX, sealY, 32).lineWidth(1.5).strokeColor('#d97706').stroke();
  doc.circle(sealX, sealY, 28).lineWidth(0.5).strokeColor('#d97706').stroke();
  doc.font('Helvetica-Bold').fontSize(7).fillColor('#d97706').text('VERIFIED', sealX - 25, sealY - 14, { align: 'center', width: 50, characterSpacing: 1 });
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#059669').text('★ WINNER ★', sealX - 35, sealY - 3, { align: 'center', width: 70 });
  doc.font('Helvetica-Bold').fontSize(6).fillColor('#64748b').text('ESCROW SETTLED', sealX - 35, sealY + 10, { align: 'center', width: 70, characterSpacing: 0.5 });

  // Right: Platform Authority Signature Line
  const rightSigX = width - 75 - sigColW;
  doc.moveTo(rightSigX, sigY).lineTo(rightSigX + sigColW, sigY).lineWidth(1).strokeColor('#94a3b8').stroke();
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#0f172a').text('ProblemSolve Hub', rightSigX, sigY + 6, { align: 'center', width: sigColW });
  doc.font('Helvetica').fontSize(7.5).fillColor('#64748b').text('Platform Verification Authority', rightSigX, sigY + 18, { align: 'center', width: sigColW });

  // 14. Bottom Ledger Verification Footer
  doc.font('Helvetica-Bold')
     .fontSize(8.5)
     .fillColor('#0f172a')
     .text(`CERTIFICATE ID: ${cert.certificate_code}`, 0, height - 52, { align: 'center', characterSpacing: 1 });

  doc.font('Helvetica')
     .fontSize(7.5)
     .fillColor('#64748b')
     .text(`Online Verification Link: http://localhost:3000/verify/${cert.certificate_code}`, 0, height - 40, { align: 'center' });

  doc.end();
}

module.exports = { generateCertificatePDF };
