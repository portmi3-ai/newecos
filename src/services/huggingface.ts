// This service handles all interactions with AI model APIs

const API_BASE_URL = 'https://api.mport.ai/models';

export interface ModelConfig {
  model: string;
  task: string;
  parameters?: Record<string, any>;
}

export interface ModelResponse {
  success: boolean;
  data?: any;
  error?: string;
}

class AIModelService {
  private apiKey: string | null = null;

  constructor() {
    // In a real implementation, this would get the API key from environment variables
    this.apiKey = process.env.MODEL_API_KEY || null;
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  async query(config: ModelConfig, input: string): Promise<ModelResponse> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'API key not set',
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${config.model}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          inputs: input,
          parameters: config.parameters || {},
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Unknown error',
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getAvailableModels(task?: string): Promise<string[]> {
    // In a real implementation, this would fetch available models from the API
    const models = [
      'basic',
      'standard',
      'advanced',
      'enterprise',
      'specialized-nlp',
      'specialized-vision',
      'multilingual-small',
      'multilingual-large',
    ];

    return models;
  }
}

export const modelService = new AIModelService();