import axiosClient from './axiosClient';

export const leaveApi = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.employeeId) params.append('employeeId', filters.employeeId);
    if (filters.status) params.append('status', filters.status);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await axiosClient.get(`/leaves${queryString}`);
    return res.data;
  },

  getById: async (id) => {
    const res = await axiosClient.get(`/leaves/${id}`);
    return res.data;
  },

  create: async (leaveData) => {
    const res = await axiosClient.post('/leaves', leaveData);
    return res.data;
  },

  approve: async (id) => {
    const res = await axiosClient.patch(`/leaves/${id}/approve`);
    return res.data;
  },

  reject: async (id, rejectionReason) => {
    const res = await axiosClient.patch(`/leaves/${id}/reject`, { rejectionReason });
    return res.data;
  },

  getStats: async () => {
    const res = await axiosClient.get('/leaves/stats');
    return res.data;
  },
};
