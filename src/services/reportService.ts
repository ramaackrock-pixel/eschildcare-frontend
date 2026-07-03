import { apiService } from './apiService';

export const reportService = {
  getReportData: async (timeRange: string, branch?: string) => {
    let url = `/reports/data?timeRange=${timeRange}`;
    if (branch && branch !== 'All Branches') {
      url += `&branch=${encodeURIComponent(branch)}`;
    }
    const data = await apiService.get(url);
    return data;
  }
};
