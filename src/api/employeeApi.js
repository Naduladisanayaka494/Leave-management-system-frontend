import axiosClient from './axiosClient';

export const employeeApi = {
  getAll: async () => {
    const res = await axiosClient.get('/employees');
    return res.data;
  },

  getById: async (id) => {
    const res = await axiosClient.get(`/employees/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await axiosClient.post('/employees', data);
    return res.data;
  },
};
