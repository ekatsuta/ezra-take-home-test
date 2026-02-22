const API_BASE_URL = '/api/v1';

export interface HealthResponse {
  status: string;
  message: string;
}

export const api = {
  async checkHealth(): Promise<HealthResponse> {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
};
