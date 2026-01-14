// src/utils/create-user-validation.ts

import { ValidationError } from '@/types/create-user';

export const validateEmail = (email: string): { valid: boolean; message: string } => {
  if (!email) {
    return { valid: false, message: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Please enter a valid email address' };
  }
  
  return { valid: true, message: '' };
};

export const validatePassword = (password: string): { valid: boolean; message: string } => {
  if (!password) {
    return { valid: false, message: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  return { valid: true, message: '' };
};

export const validatePhoneNumber = (phone: string): { valid: boolean; message: string } => {
  if (!phone) {
    return { valid: true, message: '' }; // Phone is optional
  }
  
  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (digitsOnly.length < 10 || digitsOnly.length > 15) {
    return { valid: false, message: 'Please enter a valid phone number' };
  }
  
  return { valid: true, message: '' };
};

export const validateDomain = (domain: string): { valid: boolean; message: string } => {
  if (!domain) {
    return { valid: false, message: 'Domain is required' };
  }
  
  // Basic domain validation
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
  if (!domainRegex.test(domain)) {
    return { valid: false, message: 'Please enter a valid domain (e.g., example.com)' };
  }
  
  return { valid: true, message: '' };
};

export const validateRequired = (value: string, fieldName: string): { valid: boolean; message: string } => {
  if (!value || !value.trim()) {
    return { valid: false, message: `${fieldName} is required` };
  }
  return { valid: true, message: '' };
};

export const getFieldError = (errors: ValidationError[], fieldName: string): string | undefined => {
  return errors.find(error => error.field === fieldName)?.message;
};

export const validateForm = (formData: any, userType: string): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Basic validation
  if (!formData.first_name?.trim()) {
    errors.push({ field: 'first_name', message: 'First name is required' });
  }

  if (!formData.last_name?.trim()) {
    errors.push({ field: 'last_name', message: 'Last name is required' });
  }

  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.valid) {
    errors.push({ field: 'email', message: emailValidation.message });
  }

  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.valid) {
    errors.push({ field: 'password', message: passwordValidation.message });
  }

  if (formData.password !== formData.confirm_password) {
    errors.push({ field: 'confirm_password', message: 'Passwords do not match' });
  }

  if (formData.phone_number) {
    const phoneValidation = validatePhoneNumber(formData.phone_number);
    if (!phoneValidation.valid) {
      errors.push({ field: 'phone_number', message: phoneValidation.message });
    }
  }

  // User type specific validation
  if (userType === 'b2c' || userType === 'b2b') {
    if (!formData.role) {
      errors.push({ field: 'role', message: 'Role is required' });
    }

    if (formData.company_association === 'new') {
      if (!formData.company_name?.trim()) {
        errors.push({ field: 'company_name', message: 'Company name is required' });
      }

      if (formData.company_domain) {
        const domainValidation = validateDomain(formData.company_domain);
        if (!domainValidation.valid) {
          errors.push({ field: 'company_domain', message: domainValidation.message });
        }
      }
    } else if (formData.company_association === 'existing') {
      if (!formData.company_id) {
        errors.push({ field: 'company_id', message: 'Please select a company' });
      }
    }
  }

  if (userType === 'platform' && !formData.role) {
    errors.push({ field: 'role', message: 'Platform role is required' });
  }

  if (userType === 'influencer' && !formData.role) {
    errors.push({ field: 'role', message: 'Influencer role is required' });
  }

  return errors;
};