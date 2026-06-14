/**
 * Text chunking utility for RAG pipeline.
 * Splits text into overlapping chunks for embedding.
 * Optimized for research papers with sentence-boundary awareness.
 */

const DEFAULT_MAX_CHUNK_SIZE = 1200; // Larger for semantic completeness
const DEFAULT_MIN_CHUNK_SIZE = 100;

export function chunkText(text, options = {}) {
  const maxChunkSize = options.maxChunkSize || DEFAULT_MAX_CHUNK_SIZE;
  const minChunkSize = options.minChunkSize || DEFAULT_MIN_CHUNK_SIZE;

  // Clean the text
  const cleaned = text
    .replace(/\r\n/g, '\n')
    .replace(/\u0000/g, '') // Remove null bytes
    .trim();

  if (!cleaned) return [];

  const chunks = [];
  let index = 0;

  // Split semantic boundaries (Headers level 1, 2, 3)
  const sections = cleaned.split(/(?=\n#{1,3}\s)/g);

  for (const section of sections) {
    let currentChunk = '';
    
    // Split section into paragraphs or tables
    const paragraphs = section.split(/\n\n+/g);

    for (const p of paragraphs) {
      const paragraph = p.trim();
      if (!paragraph) continue;

      if (currentChunk.length + paragraph.length <= maxChunkSize) {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      } else {
        // Current chunk is full, push it and start new
        if (currentChunk.length >= minChunkSize) {
          chunks.push({ content: currentChunk.trim(), index: index++ });
        }
        
        // If single paragraph is larger than max chunk, split it aggressively by sentences
        if (paragraph.length > maxChunkSize) {
          const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
          let subChunk = '';
          for (const s of sentences) {
            if (subChunk.length + s.length <= maxChunkSize) {
              subChunk += (subChunk ? ' ' : '') + s.trim();
            } else {
              chunks.push({ content: subChunk.trim(), index: index++ });
              subChunk = s.trim();
            }
          }
          if (subChunk.length > 0) currentChunk = subChunk;
        } else {
          currentChunk = paragraph;
        }
      }
    }

    // Push remainder of the section
    if (currentChunk.length >= minChunkSize) {
      chunks.push({ content: currentChunk.trim(), index: index++ });
    }
  }

  return chunks;
}

/**
 * Estimate page number based on character position.
 * Rough estimate: ~3000 chars per page.
 */
export function estimatePageNumber(charPosition, totalChars, totalPages) {
  if (!totalPages) return null;
  const ratio = charPosition / totalChars;
  return Math.min(Math.ceil(ratio * totalPages), totalPages);
}
