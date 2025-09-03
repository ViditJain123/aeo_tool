import api from './api';

export interface PromptData {
  categories: {
    name: string;
    questions: string[];
  }[];
}

export interface SetPromptsRequest {
  _id: string;
  promptData: PromptData;
}

export interface SetPromptsResponse {
  success: boolean;
  message: string;
  data?: {
    _id: string;
    brandName: string;
    url: string;
    promptData: PromptData['categories'];
    updatedAt: string;
  };
}

/**
 * Update prompts data for a specific brand
 * @param _id - The brand ID
 * @param promptData - The prompt data to update
 * @returns Promise<SetPromptsResponse>
 */
export async function setPrompts(_id: string, promptData: PromptData): Promise<SetPromptsResponse> {
  try {
    const response = await api.post('/setPrompts', {
      _id,
      promptData
    });
    console.log(response);
    return response as SetPromptsResponse;
  } catch (error) {
    console.error('Error updating prompts:', error);
    throw error;
  }
}

/**
 * Convert store prompts format to API format
 * @param prompts - Prompts from the store
 * @returns PromptData in the correct format for the API
 */
export function formatPromptsForAPI(prompts: { name: string; questions: string[] }[]): PromptData {
  return {
    categories: prompts
  };
}
