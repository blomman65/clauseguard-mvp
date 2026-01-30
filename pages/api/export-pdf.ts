import type { NextApiRequest, NextApiResponse } from "next";
import PDFDocument from "pdfkit";
import * as Sentry from "@sentry/nextjs";

const MAX_ANALYSIS_LENGTH = 50000;
const VALID_RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH'] as const;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { analysis, riskLevel } = req.body;

  if (!analysis || !riskLevel) {
    return res.status(400).json({ error: "Missing analysis data" });
  }

  if (typeof analysis !== 'string' || typeof riskLevel !== 'string') {
    return res.status(400).json({ error: "Invalid data format" });
  }

  if (!VALID_RISK_LEVELS.includes(riskLevel as any)) {
    return res.status(400).json({ error: "Invalid risk level" });
  }

  if (analysis.length > MAX_ANALYSIS_LENGTH) {
    return res.status(400).json({
      error: "Analysis too large for PDF export"
    });
  }

  try {
    const pdfBuffer = await generatePDF(analysis, riskLevel);
    
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="TrustTerms_Contract_Analysis.pdf"'
    );
    res.setHeader("Content-Length", pdfBuffer.length.toString());
    
    res.status(200).send(pdfBuffer);

  } catch (err: any) {
    console.error('❌ PDF export error:', err);
    
    Sentry.captureException(err, {
      tags: { api_route: 'export-pdf' },
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

async function generatePDF(analysis: string, riskLevel: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      bufferPages: true,
      autoFirstPage: true,
    });

    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    try {
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

      doc
        .strokeColor("#e2e8f0")
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .stroke();

      doc.moveDown(1.5);

      doc.fillColor("#0f172a").font("Helvetica").fontSize(11);

      const lines = analysis.split('\n');
      const pageHeight = 792;
      const bottomMargin = 100;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (doc.y > pageHeight - bottomMargin) {
          doc.addPage();
          doc.y = 50;
        }
        
        if (line.startsWith('##')) {
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
          doc
            .font("Helvetica-Bold")
            .text(line.replace(/\*\*/g, ''), {
              lineGap: 4
            });
          doc.font("Helvetica");
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
          const bulletText = line.replace(/^[-*]\s*/, '');
          doc.text(`• ${bulletText}`, {
            indent: 20,
            lineGap: 4
          });
        } else if (line.trim().length > 0) {
          doc.text(line, {
            align: 'left',
            lineGap: 4
          });
        } else {
          doc.moveDown(0.3);
        }
      }

      doc.moveDown(3);

      doc
        .strokeColor("#e2e8f0")
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .stroke();

      doc.moveDown(1);

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

      doc
        .fontSize(8)
        .fillColor("#6366f1")
        .text("TrustTerms.vercel.app", {
          align: 'center',
          link: 'https://trustterms.vercel.app'
        });

      doc.end();

    } catch (err) {
      reject(err);
    }
  });
}