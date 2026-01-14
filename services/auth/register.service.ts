// src/services/auth/register.service.ts - Updated with first_name and last_name
import { API_CONFIG } from '../api/config';
import { ENDPOINTS } from '../api/endpoints';

export interface RegistrationData {
  email: string;
  password: string;
  first_name?: string;      // New field
  last_name?: string;       // New field
  full_name?: string;       // Keep for backward compatibility
  phone_number?: string;
  user_type: 'influencer' | 'b2c' | 'b2b';
  role_name: string;
  company_name?: string;
  company_domain?: string;
}

export async function registerUser(data: RegistrationData) {
  try {
    // Auto-generate full_name if first_name and last_name are provided but full_name is not
    const registrationPayload = { ...data };
    if (registrationPayload.first_name && registrationPayload.last_name && !registrationPayload.full_name) {
      registrationPayload.full_name = `${registrationPayload.first_name} ${registrationPayload.last_name}`;
    }

    const response = await fetch(`${API_CONFIG.baseUrl}${ENDPOINTS.AUTH.REGISTER}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(registrationPayload)
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.detail || 'Registration failed');
    }
    
    return responseData;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}