import { NextRequest, NextResponse } from 'next/server';
import crawl from '@/utils/crawl';
import getAnalysisQueries from '@/utils/prompts/getAnalysisQueries';
import dbConnect from '@/utils/dbConnect';
import BrandData from '@/schemas/brandData';

export async function POST(request: NextRequest) {
  try {
    // Connect to database first
    await dbConnect();
    
    const { brandName, url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    if (!brandName) {
      return NextResponse.json(
        { error: 'Brand name is required' },
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

    const promptData = await getAnalysisQueries(markdownContent, url);

    // Save the brand data to database
    const brandData = new BrandData({
      brandName: brandName,
      url: url,
      promptData
    });

    const savedBrandData = await brandData.save();

    return NextResponse.json({ 
      success: true, 
      data: {
        crawlResult: result,
        brandData: savedBrandData
      },
      message: 'Onboarding data processed and saved successfully'
    },
    { status: 200 }
  );
    
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process onboarding data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}