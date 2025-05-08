// src/pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import openai from '@/lib/openai';
import { getPineconeIndex } from '@/lib/pinecone';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function parsePDF(filePath: string) {
  const buffer = await fs.readFile(filePath);
  const data = await pdfParse(buffer);
  return data.text.split('\n');
}

async function parseDocx(filePath: string) {
  const buffer = await fs.readFile(filePath);
  const result = await mammoth.extractRawText({ buffer });
  return result.value.split('\n').filter(line => line.trim());
}

function splitText(texts: string[], chunkSize = 1000, overlap = 100): string[] {
  const chunks: string[] = [];
  texts.forEach((text) => {
    let start = 0;
    while (start < text.length) {
      const end = start + chunkSize;
      chunks.push(text.slice(start, end));
      start += chunkSize - overlap;
    }
  });
  return chunks;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const uploadDir = '/tmp/uploads';
  await fs.mkdir(uploadDir, { recursive: true });

  // Pass options to the constructor
  const form = new IncomingForm({
    uploadDir,
    keepExtensions: true,
  });
  
  const { fields, files } = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
  
  try {
    // If only one file is uploaded, files.file might not be an array.
    const fileData = Array.isArray(files.file) ? files.file[0] : files.file;
    const originalName: string = fileData.originalFilename;
    const filePath: string = fileData.filepath;
  
    const isPDF = originalName.endsWith('.pdf');
    const isDocx = originalName.endsWith('.docx');
  
    let rawText: string[] = [];
    if (isPDF) rawText = await parsePDF(filePath);
    else if (isDocx) rawText = await parseDocx(filePath);
  
    if (!rawText.length) throw new Error('No text could be extracted.');
  
    const chunks = splitText(rawText);
  
    const embedRes = await openai.embeddings.create({
      input: chunks,
      model: 'text-embedding-ada-002',
    });
  
    const vectors = embedRes.data.map((item, i) => ({
      id: uuidv4(),
      values: item.embedding,
      metadata: {
        source: originalName,
        text: chunks[i],
      },
    }));
  
    const index = await getPineconeIndex();
    await index.upsert(vectors);
  
    res.status(200).json({ message: `✅ ${originalName} uploaded and indexed!` });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Upload failed' });
  }
}
