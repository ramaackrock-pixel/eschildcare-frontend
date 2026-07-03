import { apiService } from './apiService';
import type { StaffMember } from '../types/staff';

export const staffService = {
  getAll: async () => {
    const response = await apiService.get('/staff');
    return response.staff || [];
  },

  create: async (staffData: any) => {
    const response = await apiService.post('/staff', staffData);
    return response.staff;
  },

  update: async (id: string, staffData: any) => {
    const response = await apiService.put(`/staff/${id}`, staffData);
    return response.staff;
  },

  delete: async (id: string) => {
    await apiService.delete(`/staff/${id}`);
  }
};
