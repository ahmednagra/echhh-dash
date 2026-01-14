// src/utils/validation.ts - Updated with name validation

export const validatePassword = (password: string): { valid: boolean; message: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  return { valid: true, message: '' };
};

export const validateEmail = (email: string): { valid: boolean; message: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Please enter a valid email address' };
  }
  
  return { valid: true, message: '' };
};

export const validatePhoneNumber = (phone: string): { valid: boolean; message: string } => {
  // Skip validation if phone is empty (since it's optional)
  if (!phone) return { valid: true, message: '' };
  
  // Basic international phone number validation
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  if (!phoneRegex.test(phone)) {
    return { valid: false, message: 'Please enter a valid international phone number (e.g., +1234567890)' };
  }
  
  return { valid: true, message: '' };
};

// New name validation functions
export const validateFirstName = (firstName: string): { valid: boolean; message: string } => {
  if (!firstName || !firstName.trim()) {
    return { valid: false, message: 'First name is required' };
  }
  
  if (firstName.trim().length < 1) {
    return { valid: false, message: 'First name cannot be empty' };
  }
  
  if (firstName.length > 100) {
    return { valid: false, message: 'First name cannot exceed 100 characters' };
  }
  
  // Basic character validation - letters, spaces, hyphens, apostrophes
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  if (!nameRegex.test(firstName)) {
    return { valid: false, message: 'First name can only contain letters, spaces, hyphens, and apostrophes' };
  }
  
  return { valid: true, message: '' };
};

export const validateLastName = (lastName: string): { valid: boolean; message: string } => {
  if (!lastName || !lastName.trim()) {
    return { valid: false, message: 'Last name is required' };
  }
  
  if (lastName.trim().length < 1) {
    return { valid: false, message: 'Last name cannot be empty' };
  }
  
  if (lastName.length > 100) {
    return { valid: false, message: 'Last name cannot exceed 100 characters' };
  }
  
  // Basic character validation - letters, spaces, hyphens, apostrophes
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  if (!nameRegex.test(lastName)) {
    return { valid: false, message: 'Last name can only contain letters, spaces, hyphens, and apostrophes' };
  }
  
  return { valid: true, message: '' };
};

export const validateFullName = (fullName: string): { valid: boolean; message: string } => {
  if (!fullName || !fullName.trim()) {
    return { valid: false, message: 'Full name is required' };
  }
  
  if (fullName.trim().length < 2) {
    return { valid: false, message: 'Full name must be at least 2 characters long' };
  }
  
  if (fullName.length > 200) {
    return { valid: false, message: 'Full name cannot exceed 200 characters' };
  }
  
  // Basic character validation - letters, spaces, hyphens, apostrophes
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  if (!nameRegex.test(fullName)) {
    return { valid: false, message: 'Full name can only contain letters, spaces, hyphens, and apostrophes' };
  }
  
  return { valid: true, message: '' };
};

// Utility function to generate full name from first and last names
export const generateFullName = (firstName: string, lastName: string): string => {
  const first = firstName.trim();
  const last = lastName.trim();
  
  if (!first && !last) return '';
  if (!first) return last;
  if (!last) return first;
  
  return `${first} ${last}`;
};

// Utility function to parse full name into first and last names
export const parseFullName = (fullName: string): { firstName: string; lastName: string } => {
  const trimmedName = fullName.trim();
  
  if (!trimmedName) {
    return { firstName: '', lastName: '' };
  }
  
  const nameParts = trimmedName.split(' ').filter(part => part.length > 0);
  
  if (nameParts.length === 0) {
    return { firstName: '', lastName: '' };
  } else if (nameParts.length === 1) {
    return { firstName: nameParts[0], lastName: '' };
  } else {
    // First part is first name, rest is last name
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');
    return { firstName, lastName };
  }
};