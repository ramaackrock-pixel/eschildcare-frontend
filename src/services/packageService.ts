import { apiService } from './apiService';

export const packageService = {
  getAll: async () => {
    const response = await apiService.get('/packages');
    return response.packages || [];
  }
};
