import { apiService } from './apiService';

export const billingService = {
  getAll: async () => {
    const response = await apiService.get('/billing');
    return response.invoices || [];
  },

  create: async (invoiceData: any) => {
    const response = await apiService.post('/billing', invoiceData);
    return response.billing || response.invoice;
  },

  update: async (id: string, invoiceData: any) => {
    const response = await apiService.patch(`/billing/${id}`, invoiceData);
    return response.invoice;
  },

  delete: async (id: string) => {
    await apiService.delete(`/billing/${id}`);
  },

  sendWhatsAppInvoice: async (formData: FormData) => {
    // We don't use the standard json apiService since it's multipart/form-data
    // So we use fetch directly or the base api url
    const token = localStorage.getItem('es_token');
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4043/api/v1';
    const response = await fetch(`${baseUrl}/billing/send-whatsapp`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to send WhatsApp invoice');
    }
    
    return response.json();
  }
};
