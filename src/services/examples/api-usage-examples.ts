// Example usage of the API service
import api from '../api';

// Example interfaces for type safety
interface User {
  id: string;
  name: string;
  email: string;
}

interface CreateUserRequest {
  name: string;
  email: string;
}

interface OnboardingRequest {
  brandName: string;
  website: string;
}

// Example usage functions
export const apiExamples = {
  // GET request example
  async getUsers(): Promise<User[]> {
    try {
      const users = await api.get<User[]>('/users');
      return users;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  },

  // POST request example
  async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      const newUser = await api.post<User>('/users', userData);
      return newUser;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  },

  // PUT request example
  async updateUser(userId: string, userData: Partial<CreateUserRequest>): Promise<User> {
    try {
      const updatedUser = await api.put<User>(`/users/${userId}`, userData);
      return updatedUser;
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  },

  // DELETE request example
  async deleteUser(userId: string): Promise<void> {
    try {
      await api.delete(`/users/${userId}`);
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  },

  // Onboarding API call example
  async submitOnboarding(data: OnboardingRequest): Promise<unknown> {
    try {
      const result = await api.post('/onboarding', data);
      return result;
    } catch (error) {
      console.error('Failed to submit onboarding:', error);
      throw error;
    }
  },

  // File upload example
  async uploadFile(file: File): Promise<unknown> {
    try {
      const result = await api.uploadFile('/upload', file, 'document', {
        description: 'Uploaded document',
      });
      return result;
    } catch (error) {
      console.error('Failed to upload file:', error);
      throw error;
    }
  },

  // Example with custom headers
  async getProtectedData(): Promise<unknown> {
    try {
      // Set auth token first
      api.setAuthToken('your-jwt-token');
      
      const data = await api.get('/protected-endpoint');
      return data;
    } catch (error) {
      console.error('Failed to fetch protected data:', error);
      throw error;
    }
  },
};
