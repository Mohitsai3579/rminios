export const maxDuration = 60;

import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = '';

    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      const parsed = await pdfParse(buffer);
      text = parsed.text;
    } else if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
      file.name.toLowerCase().endsWith('.docx')
    ) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      // Fallback for txt, md, etc.
      text = buffer.toString('utf-8');
    }

    // Return the extracted text
    return NextResponse.json({ text: text.trim() });
  } catch (error) {
    console.error('Template parsing error:', error);
    return NextResponse.json({ error: 'Failed to parse template file. Make sure it is a valid PDF or DOCX.' }, { status: 500 });
  }
}
