import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import fs from 'fs';
import os from 'os';
import path from 'path';

import { createClient } from '@supabase/supabase-js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY);

// Helper to interact with Supabase outside of Request context
const getAdminSupabase = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
};

// Fallback chain for general text generation (prioritizing active & high-capacity models)
const FALLBACK_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-2.5-flash',
];

// Active embedding model (gemini-embedding-001 replaces deprecated text-embedding-004)
export const embeddingModel = genAI.getGenerativeModel({
  model: 'gemini-embedding-001',
});

// Helper to fetch active model and log usage
async function getActiveModelAndLogUsage() {
  let activeModel = 'gemini-3.5-flash';
  try {
    const supabase = getAdminSupabase();
    if (!supabase) return activeModel;
    const { data } = await supabase.from('site_settings').select('gemini_model').eq('id', 'global').single();
    // Ignore obsolete/deprecated models that now return 404
    const obsoleteModels = ['gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-1.5-pro', 'gemini-2.0-flash', 'gemini-2.0-flash-exp'];
    if (data?.gemini_model && !obsoleteModels.includes(data.gemini_model)) {
      activeModel = data.gemini_model;
    }
    
    // Log the usage
    await supabase.from('api_usage').insert({ model: activeModel, tokens: 0 });
  } catch (err) {
    console.warn('Gemini Admin check failed (using fallback model):', err.message);
  }
  return activeModel;
}

export async function generateText(prompt, systemInstruction = '') {
  const activeModel = await getActiveModelAndLogUsage();
  const modelsToTry = Array.from(new Set([activeModel, ...FALLBACK_MODELS]));
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemInstruction || undefined,
      });

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      lastError = err;
      console.warn(`[Gemini generateText] Model ${modelName} failed (${err.message}). Trying fallback model...`);
      // Brief pause if hitting 503 high demand or 429 rate limit
      if (err.message?.includes('503') || err.message?.includes('429')) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }

  throw lastError || new Error('All Gemini generation models failed.');
}

export async function generateTextStream(prompt, systemInstruction = '') {
  const activeModel = await getActiveModelAndLogUsage();
  const modelsToTry = Array.from(new Set([activeModel, ...FALLBACK_MODELS]));
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemInstruction || undefined,
      });

      const result = await model.generateContentStream(prompt);
      return result.stream;
    } catch (err) {
      lastError = err;
      console.warn(`[Gemini generateTextStream] Model ${modelName} failed (${err.message}). Trying fallback model...`);
      if (err.message?.includes('503') || err.message?.includes('429')) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }

  throw lastError || new Error('All Gemini streaming models failed.');
}

/**
 * Generate embedding for text. Returns array of floats or null on failure.
 * Automatically tries current supported embedding models.
 */
export async function generateEmbedding(text) {
  const embedModels = ['gemini-embedding-001', 'gemini-embedding-2'];
  for (const m of embedModels) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.embedContent({
        content: { parts: [{ text }] },
        outputDimensionality: 768,
      });
      if (result?.embedding?.values) {
        return result.embedding.values;
      }
    } catch (err) {
      console.warn(`Embedding generation failed with ${m}:`, err.message);
    }
  }
  return null;
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
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const fileManager = new GoogleAIFileManager(apiKey);
  
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

    const activeModel = await getActiveModelAndLogUsage();
    const modelsToTry = Array.from(new Set([activeModel, ...FALLBACK_MODELS]));
    const prompt = `You are a sophisticated Multimodal Document Parser. I have provided a PDF document.
Please transcribe this entire PDF into a comprehensive Markdown document.
Rules:
1. Preserve all text exactly as written. Keep the original document structure with appropriate Markdown headers (##, ###).
2. For any charts, graphs, diagrams, or images you see, insert a Markdown image block like \`![Chart description](image)\` and follow it immediately with a highly detailed, comprehensive textual description of what the visual data shows, including key numbers, trends, or visual elements, so it can be indexed for semantic search.
3. Convert all tabular data into strictly formatted Markdown tables.
Do not skip any pages. Be exhaustive.`;

    let extractedText = null;
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent([
          { fileData: { fileUri, mimeType: uploadResult.file.mimeType } },
          { text: prompt }
        ]);
        extractedText = result.response.text();
        if (extractedText) break;
      } catch (err) {
        lastError = err;
        console.warn(`[extractMultimodalPdf] Model ${modelName} failed (${err.message}). Trying fallback...`);
        if (err.message?.includes('503') || err.message?.includes('429')) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
    }

    if (!extractedText && lastError) {
      throw lastError;
    }

    return {
      text: extractedText || '',
      numPages: 1, // Gemini doesn't report page count natively, default to 1 or estimate
      metadata: { multimodal_extraction: true },
    };

  } finally {
    // Clean up temp file
    if (fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (e) {}
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
