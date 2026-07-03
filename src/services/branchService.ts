import { apiService } from './apiService';
import type { ClinicBranch } from '../types/branches';

export const branchService = {
  getAll: async (): Promise<ClinicBranch[]> => {
    const response = await apiService.get('/branches');
    return response.branches || [];
  },

  create: async (branch: Partial<ClinicBranch>): Promise<ClinicBranch> => {
    const response = await apiService.post('/branches', branch);
    return response.branch;
  },

  update: async (id: string, branch: Partial<ClinicBranch>): Promise<ClinicBranch> => {
    const response = await apiService.put(`/branches/${id}`, branch);
    return response.branch;
  },

  delete: async (id: string): Promise<void> => {
    await apiService.delete(`/branches/${id}`);
  }
};
