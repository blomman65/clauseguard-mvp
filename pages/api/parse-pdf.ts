import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable({ maxFileSize: 10 * 1024 * 1024 });

  let files: formidable.Files;
  try {
    [, files] = await form.parse(req);
  } catch (err: any) {
    return res.status(400).json({ error: "Failed to parse upload." });
  }

  const fileField = files.pdf;
  const file: File | undefined = Array.isArray(fileField) ? fileField[0] : fileField;

  if (!file) {
    return res.status(400).json({ error: "No PDF file uploaded." });
  }

  try {
    const buffer = fs.readFileSync(file.filepath);

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pdfParse = require("pdf-parse-fork") as (buffer: Buffer) => Promise<{ text: string }>;
    const parsed = await pdfParse(buffer);

    const text = parsed.text?.trim();

    if (!text || text.length < 50) {
      return res.status(400).json({
        error: "Could not extract text from this PDF. It may be a scanned document. Please paste the contract text manually instead.",
      });
    }

    fs.unlinkSync(file.filepath);

    return res.status(200).json({ text });
  } catch (err: any) {
    console.error("PDF parse error:", err);
    return res.status(500).json({
      error: "Failed to read PDF. Please paste the contract text manually instead.",
    });
  }
}