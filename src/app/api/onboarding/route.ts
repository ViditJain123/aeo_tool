import { NextRequest, NextResponse } from 'next/server';
import crawl from '@/utils/crawl';
import getAnalysisQueries from '@/utils/prompts/getAnalysisQueries';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    const result = await crawl(url);
    const markdownContent = result.data[0]?.markdown;

    if (typeof markdownContent !== 'string') {
      return NextResponse.json(
        { error: 'Failed to extract markdown content from crawl result' },
        { status: 500 }
      );
    }

    const analysisQueries = await getAnalysisQueries(markdownContent, url);
    console.log(analysisQueries);

    return NextResponse.json({ 
      success: true, 
      data: result 
    });
    
  } catch (error) {
    console.error('Crawl error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to crawl URL',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}