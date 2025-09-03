import { NextRequest, NextResponse } from 'next/server';
import BrandData from '@/schemas/brandData';
import dbConnect from '@/utils/dbConnect';

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await dbConnect();

    // Parse request body
    const body = await request.json();
    const { _id, promptData } = body;

    // Validate required fields
    if (!_id) {
      return NextResponse.json(
        { success: false, message: 'Brand ID is required' },
        { status: 400 }
      );
    }

    if (!promptData) {
      return NextResponse.json(
        { success: false, message: 'Prompt data is required' },
        { status: 400 }
      );
    }

    // Validate promptData structure
    if (!Array.isArray(promptData.categories)) {
      return NextResponse.json(
        { success: false, message: 'Invalid prompt data structure. Expected categories array.' },
        { status: 400 }
      );
    }

    // Validate each category
    for (const category of promptData.categories) {
      if (!category.name || typeof category.name !== 'string') {
        return NextResponse.json(
          { success: false, message: 'Each category must have a valid name' },
          { status: 400 }
        );
      }
      if (!Array.isArray(category.questions)) {
        return NextResponse.json(
          { success: false, message: 'Each category must have a questions array' },
          { status: 400 }
        );
      }
    }

    // Update the brand data with new prompt data
    const updatedBrandData = await BrandData.findByIdAndUpdate(
      _id,
      { 
        promptData: promptData.categories,
        updatedAt: new Date()
      },
      { 
        new: true, // Return updated document
        runValidators: true // Run schema validators
      }
    );

    if (!updatedBrandData) {
      return NextResponse.json(
        { success: false, message: 'Brand not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Prompts updated successfully',
      data: {
        _id: updatedBrandData._id,
        brandName: updatedBrandData.brandName,
        url: updatedBrandData.url,
        promptData: updatedBrandData.promptData,
        updatedAt: updatedBrandData.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating prompts:', error);
    
    // Handle specific MongoDB errors
    if (error instanceof Error) {
      if (error.name === 'CastError') {
        return NextResponse.json(
          { success: false, message: 'Invalid brand ID format' },
          { status: 400 }
        );
      }
      if (error.name === 'ValidationError') {
        return NextResponse.json(
          { success: false, message: 'Validation error: ' + error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}