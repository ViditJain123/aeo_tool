import mongoose from 'mongoose';

// TypeScript interface for brand data
export interface IBrandData {
  brandName: string;
  url: string;
  _id?: string;
  promptData?: IPromptData;
}

interface IPromptData {
  categories: {
    name: string;
    questions: string[];
}[];
}

// Simple Mongoose schema definition for brand data
const BrandDataSchema = new mongoose.Schema({
  brandName: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  promptData: {
    type: [Object],
    required: false
  }
}, {
  timestamps: true
});

// Prevent re-compilation error in development
const BrandData = mongoose.models.BrandData || mongoose.model<IBrandData>('BrandData', BrandDataSchema);

export default BrandData;
