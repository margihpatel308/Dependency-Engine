import axios, { AxiosInstance } from 'axios';

export interface Task {
  id: string;
  description: string;
  priority: string;
  dependencies: string[];
  status?: string;
}

export interface GenerateResponse {
  transcriptId: number;
  tasks: Task[];
  hasCycles: boolean;
  cycleNodes: string[];
  error?: string;
}

export interface Transcript {
  id: number;
  content: string;
  createdAt: string;
}

class ApiService {
  private client: AxiosInstance;

  constructor() {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    this.client = axios.create({
      baseURL: apiUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async health() {
    return this.client.get('/health');
  }

  async generateTasks(transcriptText: string): Promise<GenerateResponse> {
    const response = await this.client.post('/generate', {
      prompt: transcriptText,
    });
    return response.data;
  }

  async generateTasksFromFile(file: File): Promise<GenerateResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.client.post('/generate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getTranscripts() {
    const response = await this.client.get('/transcripts');
    return response.data;
  }

  async getTasks(transcriptId: number) {
    const response = await this.client.get(`/tasks/${transcriptId}`);
    return response.data;
  }
}

export default new ApiService();
