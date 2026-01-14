// src/components/public/order-track/utils.ts

// Format currency
export const formatCurrency = (amount: number, currency = 'USD') => {
  if (amount === null || amount === undefined) return '-'
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

// Format date with time
export const formatDateTime = (date: string) => {
  if (!date) return '-'
  
  const dateObj = new Date(date)
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Format phone number
export const formatPhoneNumber = (phone: string) => {
  if (!phone) return '-'
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Format based on length
  if (cleaned.length === 10) {
    // US phone number format
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    // US phone number with country code
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  } else {
    // International or unknown format
    return phone
  }
}

// Format number with commas
export const formatNumber = (number: number) => {
  if (number === null || number === undefined) return '-'
  return new Intl.NumberFormat('en-US').format(number)
}

// Format percentage
export const formatPercentage = (value: number, decimals = 1) => {
  if (value === null || value === undefined) return '-'
  return `${parseFloat(value.toString()).toFixed(decimals)}%`
}

// Truncate text
export const truncateText = (text: string, maxLength = 50) => {
  if (!text) return '-'
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// Utility function for className merging
export const cn = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ')
}