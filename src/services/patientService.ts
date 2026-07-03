import { apiService } from './apiService';
import type { Patient } from '../types/patient';

export const patientService = {
  async getAll() {
    const response = await apiService.get('/patients');
    return response.patients;
  },

  async create(patientData: any) {
    const response = await apiService.post('/patients', patientData);
    return response.patient;
  },

  async update(id: string, patientData: any) {
    const response = await apiService.put(`/patients/${id}`, patientData);
    return response.patient;
  },

  async delete(id: string) {
    await apiService.delete(`/patients/${id}`);
  }
};
