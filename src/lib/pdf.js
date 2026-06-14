/**
 * PDF text extraction utility (server-side only)
 */

export async function extractTextFromPdf(buffer) {
  const pdfParse = (await import('pdf-parse')).default || require('pdf-parse');
  const data = await pdfParse(buffer);
  
  return {
    text: data.text,
    numPages: data.numpages,
    info: data.info,
    metadata: data.metadata,
  };
}
