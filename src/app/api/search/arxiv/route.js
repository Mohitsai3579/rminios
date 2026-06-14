import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  
  if (!q) return NextResponse.json({ results: [] });

  try {
    const res = await fetch(`http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(q)}&start=0&max_results=10`);
    if (!res.ok) throw new Error('ArXiv API failed');
    const xml = await res.text();

    const entries = xml.split('<entry>').slice(1);
    const results = entries.map(entry => {
      const idMatch = entry.match(/<id>(.*?)<\/id>/);
      const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/);
      const summaryMatch = entry.match(/<summary>([\s\S]*?)<\/summary>/);
      const publishedMatch = entry.match(/<published>(.*?)<\/published>/);
      
      const authors = [];
      const authorRegex = /<author>\s*<name>([\s\S]*?)<\/name>/g;
      let match;
      while ((match = authorRegex.exec(entry)) !== null) {
        authors.push(match[1].trim());
      }
      
      const id = idMatch ? idMatch[1].trim() : '';
      const pdfLink = id.replace('/abs/', '/pdf/') + '.pdf';
      
      return {
        id: id,
        pdfLink: pdfLink,
        title: titleMatch ? titleMatch[1].replace(/\n/g, ' ').trim() : 'Unknown Title',
        summary: summaryMatch ? summaryMatch[1].replace(/\n/g, ' ').trim() : '',
        authors: authors.length > 0 ? authors.join(', ') : 'Unknown Authors',
        year: publishedMatch ? new Date(publishedMatch[1]).getFullYear() : 'Unknown',
        source: 'ArXiv'
      };
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error('ArXiv search error:', error);
    return NextResponse.json({ error: 'Failed to search ArXiv' }, { status: 500 });
  }
}
