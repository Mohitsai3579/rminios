import { createClient, createServiceClient } from '@/lib/supabase/server';
import { extractMultimodalPdf } from '@/lib/gemini';
import { chunkText } from '@/lib/chunker';
import { generateEmbedding } from '@/lib/gemini';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { fileId, workspaceId } = await request.json();
    const supabase = await createClient();
    const supabaseAdmin = await createServiceClient();

    // Get file record
    const { data: file, error: fileError } = await supabase
      .from('files').select('*').eq('id', fileId).single();
    if (fileError || !file) return NextResponse.json({ error: 'File not found' }, { status: 404 });

    // Update status to processing using admin client
    await supabaseAdmin.from('files').update({ processing_status: 'processing' }).eq('id', fileId);

    // Download file from storage
    const { data: fileData, error: dlError } = await supabaseAdmin.storage
      .from('papers').download(file.storage_path);
    if (dlError) {
      console.error('Download failed:', dlError);
      await supabaseAdmin.from('files').update({ processing_status: 'error' }).eq('id', fileId);
      return NextResponse.json({ error: 'Download failed' }, { status: 500 });
    }

    // Extract multimodally from PDF via Gemini
    const buffer = Buffer.from(await fileData.arrayBuffer());
    let extracted;
    try {
      extracted = await extractMultimodalPdf(buffer, file.name);
    } catch (err) {
      console.error('Multimodal PDF extraction failed:', err);
      await supabaseAdmin.from('files').update({ processing_status: 'error' }).eq('id', fileId);
      return NextResponse.json({ error: 'Multimodal PDF extraction failed' }, { status: 500 });
    }

    // Update file with extracted text
    await supabaseAdmin.from('files').update({
      extracted_text: extracted.text,
      page_count: extracted.numPages,
    }).eq('id', fileId);

    // Chunk the text
    const chunks = chunkText(extracted.text);

    // Generate embeddings and store chunks
    for (const chunk of chunks) {
      try {
        const embedding = await generateEmbedding(chunk.content);

        const { error: insertError } = await supabaseAdmin.from('chunks').insert({
          file_id: fileId,
          workspace_id: workspaceId,
          content: chunk.content,
          chunk_index: chunk.index,
          page_number: Math.ceil(((chunk.index * 1000) / (extracted.text.length || 1)) * (extracted.numPages || 1)),
          embedding: embedding,
        });
        
        if (insertError) {
          console.error('Error inserting chunk:', insertError.message);
        }

        // Delay between embedding requests to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (err) {
        console.error('Chunk processing error:', err);
        // Continue with other chunks even if one fails
      }
    }

    // Update status to ready
    await supabaseAdmin.from('files').update({ processing_status: 'ready' }).eq('id', fileId);

    return NextResponse.json({ success: true, chunks: chunks.length });
  } catch (error) {
    console.error('Process error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
