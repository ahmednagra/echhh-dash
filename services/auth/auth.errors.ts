// src/services/auth/auth.errors.ts
export class AuthError extends Error {
    public readonly isAuthError = true;
    public readonly code: string;
  
    constructor(message: string, code: string = 'auth_error') {
      super(message);
      this.name = 'AuthError';
      this.code = code;
      Object.setPrototypeOf(this, AuthError.prototype);
    }
  }
  
  export class InvalidCredentialsError extends AuthError {
    constructor(message: string = 'Invalid credentials') {
      super(message, 'invalid_credentials');
      this.name = 'InvalidCredentialsError';
      Object.setPrototypeOf(this, InvalidCredentialsError.prototype);
    }
  }
  
  export class AccountInactiveError extends AuthError {
    constructor(message: string = 'Account is inactive') {
      super(message, 'account_inactive');
      this.name = 'AccountInactiveError';
      Object.setPrototypeOf(this, AccountInactiveError.prototype);
    }
  }
  
  export class TokenExpiredError extends AuthError {
    constructor(message: string = 'Token has expired') {
      super(message, 'token_expired');
      this.name = 'TokenExpiredError';
      Object.setPrototypeOf(this, TokenExpiredError.prototype);
    }
  }
  
  // Helper to check if an error is an AuthError
  export const isAuthError = (error: any): error is AuthError => {
    return error && typeof error === 'object' && 'isAuthError' in error;
  };