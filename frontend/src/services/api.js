
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  timeout: 30000,
});

export const predictRole = async (data) => {
  const response = await api.post("/predict-role", data);
  return response.data;
};

export const predictSalary = async (data) => {
  const response = await api.post("/predict-salary", data);
  return response.data;
};

export const predictCluster = async (data) => {
  const response = await api.post("/predict-cluster", data);
  return response.data;
};

export default api;
