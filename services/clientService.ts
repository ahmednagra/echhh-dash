import api from '@/lib/apiHelper';
import { API_ENDPOINTS } from '@/lib/constants';

export interface Client {
  name: string;
  company_name: string;
}

// Get Client
export const getClientById = async (id: number): Promise<Client> => {
  const response = await api.get(`${API_ENDPOINTS.CLIENTS}/${id}`);
  return response.data;
};

// Get all Clients
export const getClients = async () => {
  const response = await api.get(API_ENDPOINTS.CLIENTS);
  return response.data;
};

// Create a new Client
export const createClient = async (data: Client): Promise<Client> => {
  const response = await api.post(API_ENDPOINTS.CLIENTS, data);
  return response.data;
};

// Update an Client
export const updateClient = async (id: number, data: Client): Promise<Client> => {
  const response = await api.put(`${API_ENDPOINTS.CLIENTS}/${id}`, data);
  return response.data;
};

// Delete an Client
export const deleteClient = async (id: number): Promise<void> => {
  await api.delete(`${API_ENDPOINTS.CLIENTS}/${id}`);
};