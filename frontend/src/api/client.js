import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const authStorageKey = 'acos_auth';

export const getStoredAuth = () => {
  try {
    const raw = localStorage.getItem(authStorageKey);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setStoredAuth = (auth) => {
  localStorage.setItem(authStorageKey, JSON.stringify(auth));
};

export const clearStoredAuth = () => {
  localStorage.removeItem(authStorageKey);
};

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

client.interceptors.request.use(
  (config) => {
    const auth = getStoredAuth();
    if (auth?.token) {
      // eslint-disable-next-line no-param-reassign
      config.headers.Authorization = `Bearer ${auth.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearStoredAuth();
    }
    return Promise.reject(error);
  }
);

export default client;

