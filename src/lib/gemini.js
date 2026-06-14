import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import fs from 'fs';
import os from 'os';
import path from 'path';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const geminiModel = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
});

export const embeddingModel = genAI.getGenerativeModel({
  model: 'gemini-embedding-2',
});

export async function generateText(prompt, systemInstruction = '') {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: systemInstruction || undefined,
  });

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function generateTextStream(prompt, systemInstruction = '') {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: systemInstruction || undefined,
  });

  const result = await model.generateContentStream(prompt);
  return result.stream;
}

/**
 * Generate embedding for text. Returns array of floats or null on failure.
 */
export async function generateEmbedding(text) {
  try {
    const result = await embeddingModel.embedContent({
      content: { parts: [{ text }] },
      outputDimensionality: 768,
    });
    return result.embedding.values;
  } catch (err) {
    console.error('Embedding generation failed:', err.message);
    return null;
  }
}

/**
 * Generate embeddings for multiple texts. Skips failures gracefully.
 */
export async function generateEmbeddings(texts) {
  const results = [];
  for (const text of texts) {
    const embedding = await generateEmbedding(text);
    results.push(embedding);
    // Small delay to respect rate limits
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  return results;
}

/**
 * Safely parse JSON from AI response text.
 * Strips markdown code fences and attempts parse.
 */
export function safeParseJSON(text, fallback = null) {
  try {
    const cleaned = text
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();
    return JSON.parse(cleaned);
  } catch {
    console.error('JSON parse failed for AI response');
    return fallback;
  }
}

/**
 * Parses a PDF buffer multimodally using Gemini's File API.
 * Extracts text, formats tables as Markdown, and describes charts/images.
 */
export async function extractMultimodalPdf(buffer, filename = 'document.pdf') {
  const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
  
  // Write buffer to temporary file for upload
  const tempFilePath = path.join(os.tmpdir(), `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '')}`);
  fs.writeFileSync(tempFilePath, buffer);

  let fileUri = null;
  let fileId = null;

  try {
    // Upload the file to Gemini File API
    const uploadResult = await fileManager.uploadFile(tempFilePath, {
      mimeType: 'application/pdf',
      displayName: filename,
    });
    
    fileUri = uploadResult.file.uri;
    fileId = uploadResult.file.name;

    // Wait for the file to be processed
    let fileState = uploadResult.file.state;
    while (fileState === 'PROCESSING') {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const checkResult = await fileManager.getFile(fileId);
      fileState = checkResult.state;
    }

    if (fileState === 'FAILED') {
      throw new Error('Gemini failed to process the PDF document.');
    }

    // Call the model to extract and describe everything
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `You are a sophisticated Multimodal Document Parser. I have provided a PDF document.
Please transcribe this entire PDF into a comprehensive Markdown document.
Rules:
1. Preserve all text exactly as written. Keep the original document structure with appropriate Markdown headers (##, ###).
2. For any charts, graphs, diagrams, or images you see, insert a Markdown image block like \`![Chart description](image)\` and follow it immediately with a highly detailed, comprehensive textual description of what the visual data shows, including key numbers, trends, or visual elements, so it can be indexed for semantic search.
3. Convert all tabular data into strictly formatted Markdown tables.
Do not skip any pages. Be exhaustive.`;

    const result = await model.generateContent([
      { fileData: { fileUri, mimeType: uploadResult.file.mimeType } },
      { text: prompt }
    ]);

    const extractedText = result.response.text();

    return {
      text: extractedText,
      numPages: 1, // Gemini doesn't report page count natively, default to 1 or estimate
      metadata: { multimodal_extraction: true },
    };

  } finally {
    // Clean up temp file
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    // Optionally delete from Gemini to save space/quota
    if (fileId) {
      try {
        await fileManager.deleteFile(fileId);
      } catch (err) {
        console.error('Failed to delete file from Gemini API:', err.message);
      }
    }
  }
}
