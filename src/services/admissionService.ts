import { apiService } from './apiService';
import type { AdmittedPatient, Room } from '../types/admission';

export const admissionService = {
  getAllAdmissions: async (): Promise<AdmittedPatient[]> => {
    const response = await apiService.get('/admissions');
    return response.admissions || [];
  },

  admit: async (admission: Partial<AdmittedPatient>): Promise<AdmittedPatient> => {
    const response = await apiService.post('/admissions/admit', admission);
    return response.admission;
  },

  discharge: async (id: string): Promise<AdmittedPatient> => {
    const response = await apiService.put(`/admissions/discharge/${id}`, {});
    return response.admission;
  },

  getRooms: async (): Promise<Room[]> => {
    const response = await apiService.get('/admissions/rooms');
    return response.rooms || [];
  },

  createRoom: async (room: Partial<Room>): Promise<Room> => {
    const response = await apiService.post('/admissions/rooms', room);
    return response.room;
  },

  deleteRoom: async (id: string): Promise<void> => {
    await apiService.delete(`/admissions/rooms/${id}`);
  }
};
