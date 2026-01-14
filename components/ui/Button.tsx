// import React from 'react';

// interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
//   variant?: 'primary' | 'outline';
// }

// const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, ...props }) => {
//   const baseStyles = 'px-6 py-2 rounded-md font-medium transition-colors';
//   const variantStyles = {
//     primary: 'bg-blue-600 text-white hover:bg-blue-700',
//     outline: 'border border-blue-600 text-blue-600 hover:bg-blue-50',
//   };

//   return (
//     <button className={`${baseStyles} ${variantStyles[variant]}`} {...props}>
//       {children}
//     </button>
//   );
// };

// export default Button;

// src/components/ui/Button.tsx
// =============================================================================
// Unified Button Component - Consistent Styling Across Dashboard
// =============================================================================

import React from 'react';

// =============================================================================
// TYPES
// =============================================================================

export type ButtonVariant =
  | 'primary'
  | 'outline'
  | 'toggle-active'
  | 'toggle-inactive'
  | 'feature'
  | 'action';

export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonState = 'default' | 'hover' | 'disabled';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

// =============================================================================
// STYLE CONSTANTS
// =============================================================================

const BASE_STYLES = 'inline-flex items-center justify-center font-medium transition-all duration-200';

/**
 * Size styles - All buttons use rounded-full for consistent pill shape
 */
const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: 'px-4 py-1.5 text-xs gap-1.5 rounded-full',
  md: 'px-5 py-2 text-sm gap-2 rounded-full',
  lg: 'px-6 py-2.5 text-base gap-2.5 rounded-full',
};

const isToggleVariant = (variant: ButtonVariant): boolean => 
  variant === 'toggle-active' || variant === 'toggle-inactive';

/**
 * Variant styles - Unified aesthetic across all button types
 */
const VARIANT_STYLES: Record<ButtonVariant, {
  default: string;
  hover: string;
  disabled: string;
}> = {
  // Primary: Update All, Apply Filters (purple solid)
  primary: {
    default: 'bg-purple-600 text-white shadow-md',
    hover: 'hover:bg-purple-700 hover:shadow-lg',
    disabled: 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none',
  },

  // Outline: Cancel, Clear (gray border)
  outline: {
    default: 'bg-white text-gray-700 border border-gray-300 shadow-sm',
    hover: 'hover:bg-gray-50 hover:border-gray-400',
    disabled: 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed',
  },

  // Toggle Active: Active tab - sky-blue to stand out
  'toggle-active': {
    default: 'bg-gradient-to-r from-sky-500 to-sky-600 text-white border border-sky-400 shadow-md',
    hover: 'hover:from-sky-600 hover:to-sky-700 hover:shadow-lg',
    disabled: 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none border-gray-200',
  },

  // Toggle Inactive: Inactive tab - Matches feature button style
  'toggle-inactive': {
    default: 'bg-gradient-to-r from-purple-50 to-blue-50 text-gray-700 border border-purple-200 shadow-sm',
    hover: 'hover:border-purple-300 hover:shadow-md hover:from-purple-100 hover:to-blue-100',
    disabled: 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed',
  },

  // Feature: View Analytics, Sentiment Analysis
  feature: {
    default: 'bg-gradient-to-r from-purple-50 to-blue-50 text-gray-700 border border-purple-200 shadow-sm',
    hover: 'hover:border-purple-300 hover:shadow-md hover:from-purple-100 hover:to-blue-100',
    disabled: 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed',
  },

  // Action: Add Video, Share, Collapse Filters
  action: {
    default: 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200 shadow-sm',
    hover: 'hover:border-gray-300 hover:shadow-md',
    disabled: 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed',
  },
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function getButtonStyles(
  variant: ButtonVariant,
  state: ButtonState = 'default',
  size: ButtonSize = 'md'
): string {
  const variantStyle = VARIANT_STYLES[variant];
  const sizeStyle = SIZE_STYLES[size];

  if (state === 'disabled') {
    return `${BASE_STYLES} ${sizeStyle} ${variantStyle.disabled}`.trim();
  }

  return `${BASE_STYLES} ${sizeStyle} ${variantStyle.default} ${variantStyle.hover}`.trim();
}

export function getToggleStyles(
  isActive: boolean,
  size: ButtonSize = 'md',
  isDisabled: boolean = false
): string {
  const variant: ButtonVariant = isActive ? 'toggle-active' : 'toggle-inactive';
  const state: ButtonState = isDisabled ? 'disabled' : 'default';
  return getButtonStyles(variant, state, size);
}

/**
 * Container for toggle button groups
 */
export function getToggleContainerStyles(): string {
  return 'flex items-center gap-2';
}

export function getPrimaryWithBadgeStyles(isActive: boolean): string {
  return getButtonStyles('primary', isActive ? 'default' : 'disabled');
}

export function getBadgeStyles(isActive: boolean): string {
  if (isActive) {
    return 'bg-white text-purple-600 text-xs font-bold px-2 py-0.5 rounded-full';
  }
  return 'bg-gray-200 text-gray-500 text-xs font-bold px-2 py-0.5 rounded-full';
}

// =============================================================================
// LOADING SPINNER
// =============================================================================

const LoadingSpinner: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

// =============================================================================
// BUTTON COMPONENT
// =============================================================================

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  isLoading = false,
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...props
}) => {
  const isDisabled = disabled || isLoading;
  const state: ButtonState = isDisabled ? 'disabled' : 'default';

  const buttonClasses = [
    getButtonStyles(variant, state, size),
    fullWidth ? 'w-full' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button className={buttonClasses} disabled={isDisabled} {...props}>
      {isLoading ? (
        <LoadingSpinner className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      ) : leftIcon ? (
        <span className="flex-shrink-0">{leftIcon}</span>
      ) : null}
      {children && <span>{children}</span>}
      {rightIcon && !isLoading && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  );
};

// =============================================================================
// EXPORTS
// =============================================================================

export default Button;

export {
  BASE_STYLES,
  SIZE_STYLES,
  VARIANT_STYLES,
  isToggleVariant,
};