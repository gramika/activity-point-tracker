import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
const PYTHON_SERVICE_URL = 'http://localhost:5001';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth services
export const registerUser = (userData) => api.post('/users', userData);
export const loginUser = (credentials) => api.post('/users/login', credentials);
export const getUserProfile = () => api.get('/users/profile');

// Certificate services
export const uploadCertificate = (formData) => {
  return api.post('/certificates', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getUserCertificates = () => api.get('/certificates');
export const getClassCertificates = (className) => api.get(`/certificates/class/${className}`);
export const updateCertificateStatus = (id, updateData) => api.put(`/certificates/${id}`, updateData);
export const deleteCertificate = (id) => api.delete(`/certificates/${id}`);

// Python service for QR code scanning
export const scanQRCode = (formData) => {
  return axios.post(`${PYTHON_SERVICE_URL}/scan-qr`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export default api;