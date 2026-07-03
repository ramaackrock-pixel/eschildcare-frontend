import { apiService } from './apiService';
// import type { Appointment } from '../types/appointment'; // Unused

export const appointmentService = {
  getAll: async () => {
    const response = await apiService.get('/appointments');
    return response.appointments || [];
  },


  create: async (appointmentData: any) => {
    const response = await apiService.post('/appointments', appointmentData);
    return response.appointment;
  },

  update: async (id: string | number, appointmentData: any) => {
    const response = await apiService.patch(`/appointments/${id}`, appointmentData);
    return response.appointment;
  },

  delete: async (id: string | number) => {
    await apiService.delete(`/appointments/${id}`);
  }
};
