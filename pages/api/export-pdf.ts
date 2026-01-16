import type { NextApiRequest, NextApiResponse } from "next";
import PDFDocument from "pdfkit";
import * as Sentry from "@sentry/nextjs";

const MAX_ANALYSIS_LENGTH = 50000;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { analysis, riskLevel } = req.body;

  // Validering
  if (!analysis || !riskLevel) {
    return res.status(400).json({ error: "Missing analysis data" });
  }

  if (typeof analysis !== 'string' || typeof riskLevel !== 'string') {
    return res.status(400).json({ error: "Invalid data format" });
  }

  if (analysis.length > MAX_ANALYSIS_LENGTH) {
    return res.status(400).json({
      error: "Analysis too large for PDF export"
    });
  }

  try {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      bufferPages: true,
      autoFirstPage: true,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="TrustTerms_Contract_Analysis.pdf"'
    );

    // Error handling för PDF stream
    doc.on('error', (err) => {
      console.error('PDF generation error:', err);
      Sentry.captureException(err, {
        tags: { api_route: 'export-pdf' },
      });
      if (!res.headersSent) {
        res.status(500).json({ error: "PDF generation failed" });
      }
    });

    doc.pipe(res);

    // Header med logo-simulering
    doc
      .fontSize(28)
      .font("Helvetica-Bold")
      .fillColor("#6366f1")
      .text("TrustTerms", { align: "left" });

    doc
      .fontSize(12)
      .font("Helvetica")
      .fillColor("#64748b")
      .text("Contract Risk Analysis Report", { align: "left" });

    doc.moveDown(1.5);

    // Risk badge
    const riskColor =
      riskLevel === "HIGH"
        ? "#DC2626"
        : riskLevel === "MEDIUM"
        ? "#EA580C"
        : "#16A34A";

    doc
      .fontSize(16)
      .fillColor(riskColor)
      .font("Helvetica-Bold")
      .text(`Overall Risk Level: ${riskLevel}`, { align: "left" });

    doc.moveDown();
    
    // Date
    doc
      .fontSize(10)
      .fillColor("#64748b")
      .font("Helvetica")
      .text(`Generated: ${new Date().toLocaleString('sv-SE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, { align: "left" });

    doc.moveDown(2);

    // Horizontal line
    doc
      .strokeColor("#e2e8f0")
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke();

    doc.moveDown(1.5);

    // Analysis body med smart formatting
    doc.fillColor("#0f172a").font("Helvetica").fontSize(11);

    const lines = analysis.split('\n');
    const pageHeight = 792; // A4 height in points
    const bottomMargin = 100;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if we need a new page
      if (doc.y > pageHeight - bottomMargin) {
        doc.addPage();
        doc.y = 50; // Reset to top margin
      }
      
      // Handle different formatting
      if (line.startsWith('##')) {
        // Main headers
        doc.moveDown(0.5);
        doc
          .font("Helvetica-Bold")
          .fontSize(14)
          .fillColor("#1e293b")
          .text(line.replace(/^##\s*/, ''), {
            lineGap: 6
          });
        doc.moveDown(0.3);
        doc.font("Helvetica").fontSize(11).fillColor("#0f172a");
      } else if (line.startsWith('###')) {
        // Sub-headers
        doc.moveDown(0.4);
        doc
          .font("Helvetica-Bold")
          .fontSize(12)
          .fillColor("#334155")
          .text(line.replace(/^###\s*/, ''), {
            lineGap: 5
          });
        doc.moveDown(0.2);
        doc.font("Helvetica").fontSize(11).fillColor("#0f172a");
      } else if (line.startsWith('**') && line.endsWith('**')) {
        // Bold lines
        doc
          .font("Helvetica-Bold")
          .text(line.replace(/\*\*/g, ''), {
            lineGap: 4
          });
        doc.font("Helvetica");
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        // Bullet points
        const bulletText = line.replace(/^[-*]\s*/, '');
        doc.text(`• ${bulletText}`, {
          indent: 20,
          lineGap: 4
        });
      } else if (line.trim().length > 0) {
        // Regular text
        doc.text(line, {
          align: 'left',
          lineGap: 4
        });
      } else {
        // Empty line
        doc.moveDown(0.3);
      }
    }

    // Footer on last page
    doc.moveDown(3);

    // Horizontal line
    doc
      .strokeColor("#e2e8f0")
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke();

    doc.moveDown(1);

    // Disclaimer
    doc
      .fontSize(9)
      .fillColor("#64748b")
      .font("Helvetica")
      .text(
        "DISCLAIMER: This analysis is generated by an AI system for informational purposes only and does not constitute legal advice. The analysis may contain errors or omissions. Always consult a qualified lawyer before making legal decisions or signing contracts.",
        {
          align: 'left',
          lineGap: 3,
        }
      );

    doc.moveDown(0.5);

    // Footer link
    doc
      .fontSize(8)
      .fillColor("#6366f1")
      .text("TrustTerms.vercel.app", {
        align: 'center',
        link: 'https://trustterms.vercel.app'
      });

    doc.end();

  } catch (err: any) {
    console.error('❌ PDF export error:', err);
   
    Sentry.captureException(err, {
      tags: {
        api_route: 'export-pdf',
      },
      extra: {
        analysis_length: analysis?.length,
        risk_level: riskLevel,
      },
    });

    if (!res.headersSent) {
      res.status(500).json({ error: "PDF generation failed. Please try again." });
    }
  }
}