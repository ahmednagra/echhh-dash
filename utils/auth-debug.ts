// src/utils/auth-debug.ts - Debug utilities for auth issues
export const debugAuthState = () => {
  if (typeof window === 'undefined') return;
  
  console.group('🔐 Auth State Debug');
  
  // Check localStorage
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  const tokenExpiry = localStorage.getItem('tokenExpiry');
  const userString = localStorage.getItem('user');
  const rolesString = localStorage.getItem('roles');
  const companyString = localStorage.getItem('company');
  
  console.log('📦 localStorage Contents:');
  console.log('  - accessToken:', accessToken ? 'Present' : 'Missing');
  console.log('  - refreshToken:', refreshToken ? 'Present' : 'Missing');
  console.log('  - tokenExpiry:', tokenExpiry ? new Date(parseInt(tokenExpiry)) : 'Missing');
  console.log('  - user:', userString ? 'Present' : 'Missing');
  console.log('  - roles:', rolesString ? 'Present' : 'Missing');
  console.log('  - company:', companyString ? 'Present' : 'Missing');
  
  // Parse and show user data
  if (userString) {
    try {
      const user = JSON.parse(userString);
      console.log('👤 User Data:');
      console.log('  - id:', user.id);
      console.log('  - email:', user.email);
      console.log('  - full_name:', user.full_name);
      console.log('  - user_type:', user.user_type);
      console.log('  - status:', user.status);
      console.log('  - email_verified:', user.email_verified);
    } catch (e) {
      console.error('❌ Failed to parse user data:', e);
    }
  }
  
  // Parse and show roles data
  if (rolesString) {
    try {
      const roles = JSON.parse(rolesString);
      console.log('🎭 Roles Data:');
      roles.forEach((role: any, index: number) => {
        console.log(`  - Role ${index + 1}:`, role.name, `(${role.id})`);
      });
    } catch (e) {
      console.error('❌ Failed to parse roles data:', e);
    }
  }
  
  // Parse and show company data
  if (companyString) {
    try {
      const company = JSON.parse(companyString);
      console.log('🏢 Company Data:');
      if (Array.isArray(company)) {
        company.forEach((comp: any, index: number) => {
          console.log(`  - Company ${index + 1}:`, comp.name, `(${comp.id})`);
        });
      } else {
        console.log('  - Company:', company.name, `(${company.id})`);
      }
    } catch (e) {
      console.error('❌ Failed to parse company data:', e);
    }
  }
  
  // Check token expiry
  if (tokenExpiry) {
    const expiry = parseInt(tokenExpiry);
    const now = Date.now();
    const isExpired = now > expiry;
    const timeToExpiry = expiry - now;
    
    console.log('⏰ Token Status:');
    console.log('  - Is Expired:', isExpired);
    if (!isExpired) {
      console.log('  - Expires in:', Math.round(timeToExpiry / 60000), 'minutes');
    } else {
      console.log('  - Expired:', Math.round(Math.abs(timeToExpiry) / 60000), 'minutes ago');
    }
  }
  
  console.groupEnd();
};

// Hook to debug auth state in components
export const useAuthDebug = () => {
  if (process.env.NODE_ENV === 'development') {
    debugAuthState();
  }
};