import { apiService } from './apiService';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4042/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

export const medicalRecordService = {
  getAll: async () => {
    const response = await apiService.get('/records');
    return response.data || [];
  },

  create: async (recordData: FormData | any) => {
    let response;
    if (recordData instanceof FormData) {
      response = await apiClient.post('/records', recordData);
      return response.data.data;
    } else {
      response = await apiService.post('/records', recordData);
      return response.data;
    }
  },

  delete: async (id: string) => {
    await apiService.delete(`/records/${id}`);
  }
};
