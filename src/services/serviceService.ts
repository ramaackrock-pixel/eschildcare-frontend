import { apiService } from './apiService';

export const serviceService = {
  getAll: async () => {
    const response = await apiService.get('/services');
    return response.services || [];
  }
};
