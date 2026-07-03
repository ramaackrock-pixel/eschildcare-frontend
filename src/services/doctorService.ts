import { apiService } from './apiService';
// import type { Doctor } from '../types/doctor'; // Unused

export const doctorService = {
  getAll: async () => {
    const response = await apiService.get('/doctors');
    return response.doctors || [];
  },

  create: async (doctorData: any) => {
    const response = await apiService.post('/doctors', doctorData);
    return response.doctor;
  },

  update: async (id: string, doctorData: any) => {
    const response = await apiService.put(`/doctors/${id}`, doctorData);
    return response.doctor;
  },

  delete: async (id: string) => {
    await apiService.delete(`/doctors/${id}`);
  }
};
