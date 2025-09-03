// Database utility functions for common operations

import dbConnect from './dbConnect';
import Onboarding, { IOnboarding } from '@/models/Onboarding';

/**
 * Database utility class with common CRUD operations
 */
export class DatabaseUtils {
  
  /**
   * Ensure database connection before any operation
   */
  private static async ensureConnection() {
    await dbConnect();
  }

  /**
   * Create a new onboarding record
   */
  static async createOnboarding(data: Partial<IOnboarding>): Promise<IOnboarding> {
    await this.ensureConnection();
    
    try {
      const onboarding = new Onboarding(data);
      const saved = await onboarding.save();
      
      console.log('✅ Onboarding record created:', saved._id);
      return saved;
    } catch (error) {
      console.error('❌ Failed to create onboarding record:', error);
      throw error;
    }
  }

  /**
   * Find onboarding by ID
   */
  static async findOnboardingById(id: string): Promise<IOnboarding | null> {
    await this.ensureConnection();
    
    try {
      const onboarding = await Onboarding.findById(id);
      return onboarding;
    } catch (error) {
      console.error('❌ Failed to find onboarding by ID:', error);
      throw error;
    }
  }

  /**
   * Find onboarding by brand name
   */
  static async findOnboardingByBrandName(brandName: string): Promise<IOnboarding[]> {
    await this.ensureConnection();
    
    try {
      const onboardings = await Onboarding.find({ 
        brandName: new RegExp(brandName, 'i') 
      }).sort({ createdAt: -1 });
      
      return onboardings;
    } catch (error) {
      console.error('❌ Failed to find onboarding by brand name:', error);
      throw error;
    }
  }

  /**
   * Find onboarding by website URL
   */
  static async findOnboardingByWebsite(website: string): Promise<IOnboarding | null> {
    await this.ensureConnection();
    
    try {
      const onboarding = await Onboarding.findOne({ website });
      return onboarding;
    } catch (error) {
      console.error('❌ Failed to find onboarding by website:', error);
      throw error;
    }
  }

  /**
   * Update onboarding record
   */
  static async updateOnboarding(id: string, data: Partial<IOnboarding>): Promise<IOnboarding | null> {
    await this.ensureConnection();
    
    try {
      const updated = await Onboarding.findByIdAndUpdate(
        id, 
        { ...data, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      
      if (updated) {
        console.log('✅ Onboarding record updated:', updated._id);
      }
      
      return updated;
    } catch (error) {
      console.error('❌ Failed to update onboarding record:', error);
      throw error;
    }
  }

  /**
   * Delete onboarding record
   */
  static async deleteOnboarding(id: string): Promise<boolean> {
    await this.ensureConnection();
    
    try {
      const deleted = await Onboarding.findByIdAndDelete(id);
      
      if (deleted) {
        console.log('✅ Onboarding record deleted:', deleted._id);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Failed to delete onboarding record:', error);
      throw error;
    }
  }

  /**
   * Get all onboarding records with pagination
   */
  static async getAllOnboardings(page: number = 1, limit: number = 10): Promise<{
    data: IOnboarding[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    await this.ensureConnection();
    
    try {
      const skip = (page - 1) * limit;
      
      const [data, total] = await Promise.all([
        Onboarding.find({})
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Onboarding.countDocuments({})
      ]);
      
      const totalPages = Math.ceil(total / limit);
      
      return {
        data,
        total,
        page,
        totalPages
      };
    } catch (error) {
      console.error('❌ Failed to get onboarding records:', error);
      throw error;
    }
  }

  /**
   * Search onboarding records
   */
  static async searchOnboardings(query: string, page: number = 1, limit: number = 10): Promise<{
    data: IOnboarding[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    await this.ensureConnection();
    
    try {
      const skip = (page - 1) * limit;
      
      const searchRegex = new RegExp(query, 'i');
      const searchFilter = {
        $or: [
          { brandName: searchRegex },
          { website: searchRegex }
        ]
      };
      
      const [data, total] = await Promise.all([
        Onboarding.find(searchFilter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Onboarding.countDocuments(searchFilter)
      ]);
      
      const totalPages = Math.ceil(total / limit);
      
      return {
        data,
        total,
        page,
        totalPages
      };
    } catch (error) {
      console.error('❌ Failed to search onboarding records:', error);
      throw error;
    }
  }

  /**
   * Get onboarding statistics
   */
  static async getOnboardingStats(): Promise<{
    totalOnboardings: number;
    todayOnboardings: number;
    thisWeekOnboardings: number;
    thisMonthOnboardings: number;
  }> {
    await this.ensureConnection();
    
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const [totalOnboardings, todayOnboardings, thisWeekOnboardings, thisMonthOnboardings] = await Promise.all([
        Onboarding.countDocuments({}),
        Onboarding.countDocuments({ createdAt: { $gte: today } }),
        Onboarding.countDocuments({ createdAt: { $gte: thisWeek } }),
        Onboarding.countDocuments({ createdAt: { $gte: thisMonth } })
      ]);
      
      return {
        totalOnboardings,
        todayOnboardings,
        thisWeekOnboardings,
        thisMonthOnboardings
      };
    } catch (error) {
      console.error('❌ Failed to get onboarding stats:', error);
      throw error;
    }
  }
}

// Export individual functions for convenience
export const {
  createOnboarding,
  findOnboardingById,
  findOnboardingByBrandName,
  findOnboardingByWebsite,
  updateOnboarding,
  deleteOnboarding,
  getAllOnboardings,
  searchOnboardings,
  getOnboardingStats
} = DatabaseUtils;

export default DatabaseUtils;
