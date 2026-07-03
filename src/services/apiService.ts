import axios from 'axios';
import toast from 'react-hot-toast';
import type { Patient } from '../types/patient';
import type { StaffMember } from '../types/staff';
import type { ClinicBranch } from '../types/branches';
import type { Doctor } from '../types/doctor';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4042/api/v1';


const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

// Attach Bearer token from localStorage on every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('es_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Add a response interceptor to handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    // Automatically show success toasts for modifying requests (POST, PUT, DELETE, PATCH)
    // if the backend provides a success message. We ignore GET requests to prevent spam on page loads.
    if (response.config.method !== 'get' && response.data?.message) {
      toast.success(response.data.message);
    }
    return response;
  },
  (error) => {
    // If the error has a response from the server, use that message.
    // Otherwise use a fallback network error message.
    const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';

    // Ignore 401 Unauthorized errors on initial load, these are handled by the AuthContext/Login page usually without wanting a popup immediately on screen load
    // Actually, maybe we only ignore 401 if it's hitting specific initial routes, or we just show them.
    // Given the user asked for all errors, we will show it. If it's a 401 on /login, it's fine.
    // To prevent spam on load, we can check if it's an initial load 401, but the previous AppDataContext fix already stops those.

    toast.error(errorMessage);

    return Promise.reject(error);
  }
);

export const apiService = {
  // --- HTTP Methods ---
  async get(endpoint: string) {
    const response = await apiClient.get(endpoint);
    return response.data;
  },

  async post(endpoint: string, data: any) {
    const isFormData = data instanceof FormData;
    const response = await apiClient.post(endpoint, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    });
    return response.data;
  },

  async importPatientsBulk(patients: any[]) {
    const response = await apiClient.post('/patients/bulk', { patients });
    return response.data;
  },

  async put(endpoint: string, data: any) {
    const isFormData = data instanceof FormData;
    const response = await apiClient.put(endpoint, data, {
      headers: !isFormData ? { 'Content-Type': 'application/json' } : {}
    });
    return response.data;
  },

  async patch(endpoint: string, data: any) {
    const response = await apiClient.patch(endpoint, data);
    return response.data;
  },

  async delete(endpoint: string) {
    const response = await apiClient.delete(endpoint);
    return response.data;
  },

  // --- Campaign Logic ---
  async getCampaignStats() {
    const response = await apiClient.get('/campaign/stats');
    return response.data;
  },

  async sendCampaign(formData: FormData) {
    const response = await apiClient.post('/campaign/send', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async resetCampaignBadges(patientIds?: string[]) {
    const response = await apiClient.post('/campaign/reset-badges', { patientIds });
    return response.data;
  },

  // --- Patient Logic ---
  preparePatient(data: Partial<Patient>): Patient {
    const name = data.name || 'Unknown Patient';
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    // Status color logic
    let statusColor = 'bg-slate-50 text-slate-600 border border-slate-200';
    if (data.status === 'ACTIVE') statusColor = 'bg-[#e1f5f5] text-primary border border-[#b2dfdf]';
    if (data.status === 'CRITICAL') statusColor = 'bg-[#fff5f4] text-[#c73a3a] border border-[#ffdbdb]';
    if (data.status === 'PENDING') statusColor = 'bg-[#fff8e6] text-[#b38600] border border-[#ffeca3]';
    if (data.status === 'DISCHARGED') statusColor = 'bg-[#f4f6f8] text-[#5c6d86] border border-[#d6dde9]';

    const generatedId = data.id || `PID-${Math.floor(Math.random() * 9000) + 1000}`;

    let formattedLastVisit = new Date().toLocaleDateString('en-US');
    if (data.lastVisit) {
      try {
        const d = new Date(data.lastVisit);
        if (!isNaN(d.getTime())) {
          formattedLastVisit = d.toISOString().split('T')[0];
        } else {
          formattedLastVisit = data.lastVisit;
        }
      } catch (e) {
        formattedLastVisit = data.lastVisit;
      }
    }

    return {
      ...data,
      id: generatedId,
      pid: data.pid || generatedId, // Backend requires 'pid'
      initials,
      statusColor,
      initialsBg: data.initialsBg || 'bg-primary/10 text-primary',
      lastVisit: formattedLastVisit,
      diseases: data.diseases || [],
      conditions: data.conditions || [],
      assignments: data.assignments || [],
      whatsappConsent: data.whatsappConsent !== false,
      assignedDoctor: data.assignedDoctor || data.consultedBy || 'Dr. Elias Thorne'
    } as Patient;
  },

  // --- Appointment Logic ---
  prepareAppointment(data: any): any {
    try {
      let finalDate = new Date();
      let formattedTime = data.time;
      if (data.appointmentDate && data.time) {
        // Safe parsing
        const dateStr = data.appointmentDate.includes('T') ? data.appointmentDate.split('T')[0] : data.appointmentDate;
        const [year, month, day] = dateStr.split('-').map(Number);

        let [timeStr, modifier] = data.time.split(' ');
        let hours = 9;
        let minutes = 0;

        if (timeStr) {
          const timeParts = timeStr.split(':').map(Number);
          hours = timeParts[0] || 9;
          minutes = timeParts[1] || 0;
        }

        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;

        finalDate = new Date(year, month - 1, day, hours, minutes);

        const displayHours = hours % 12 || 12;
        const ampm = hours >= 12 ? 'PM' : 'AM';
        formattedTime = `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
      }

      let durationNum = 45;
      if (typeof data.duration === 'string') {
        durationNum = parseInt(data.duration.replace(/\D/g, '')) || 45;
      } else if (typeof data.duration === 'number') {
        durationNum = data.duration;
      }

      const isDateValid = !isNaN(finalDate.getTime());

      return {
        ...data,
        id: data.id || Date.now().toString(),
        appointmentDate: isDateValid ? finalDate.toISOString() : new Date().toISOString(),
        time: formattedTime,
        duration: durationNum,
        initials: data.patientName ? data.patientName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : '??',
        initialsBg: data.initialsBg || 'bg-primary/10 text-primary',
        therapist: data.therapistName || data.therapist || (data.therapists && data.therapists.length > 0 ? data.therapists[0].name : 'Unassigned'),
        doctorId: data.doctorId,
        doctorName: data.doctorName,
        therapists: data.therapists || [],
      };
    } catch (e) {
      console.error("Error preparing appointment:", e);
      return data;
    }
  },

  // --- Staff Logic ---
  prepareStaff(data: Partial<StaffMember>): StaffMember {
    const name = data.name || 'Staff';
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    return {
      ...data,
      id: data.id || `STF-${Math.floor(Math.random() * 10000)}`,
      department: data.department || (data.role === 'Admin / Receptionist' ? 'Administration' : 'Physiotherapy'),
      avatar: (data.avatar && data.avatar.trim() !== '') ? data.avatar : '',
      initials,
      initialsBg: 'bg-primary/10 text-primary',
      status: data.status || 'Active'
    } as StaffMember;
  },

  // --- Branch Logic ---
  prepareBranch(data: Partial<ClinicBranch>): ClinicBranch {
    return {
      ...data,
      id: data._id || data.id || `BR-${Math.floor(Math.random() * 1000)}`,
      status: data.status || 'Active',
      staffCount: data.staffCount || 0,
      patientCount: data.patientCount || 0,
      totalRevenue: data.totalRevenue || 0,
      performance: data.performance || { weeklyRevenue: [0, 0, 0, 0, 0, 0, 0], revenueGrowth: 0 }
    } as ClinicBranch;
  },

  // --- Doctor Logic ---
  prepareDoctor(data: any): Doctor {
    const name = data.name || 'Doctor';
    const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
    return {
      ...data,
      id: data._id || data.id,
      role: data.role || data.specialization || 'Physiotherapist',
      avatar: (data.avatar && data.avatar.trim() !== '') ? data.avatar : '',
      initials,
      initialsBg: 'bg-primary/10 text-primary',
      status: data.status || 'active'
    } as Doctor;
  },

  // --- Vaccination API ---
  async getVaccinations() {
    const response = await apiClient.get('/vaccinations');
    return response.data;
  },

  async addVaccination(data: any) {
    const response = await apiClient.post('/vaccinations/add', data);
    return response.data;
  },

  async updateVaccination(id: string, data: any) {
    const response = await apiClient.put(`/vaccinations/${id}`, data);
    return response.data;
  },

  async deleteVaccination(id: string) {
    const response = await apiClient.delete(`/vaccinations/${id}`);
    return response.data;
  }
};
