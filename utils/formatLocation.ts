// src/utils/formatLocation.ts

// Country name to abbreviation mapping
export const countryToAbbreviation: { [key: string]: string } = {
  Pakistan: 'PK',
  'United States': 'US',
  India: 'IN',
  'Saudi Arabia': 'SA',
  'United Kingdom': 'GB',
  'United Arab Emirates': 'AE',
  Bangladesh: 'BD',
  Turkey: 'TR',
  Canada: 'CA',
  Australia: 'AU',
  France: 'FR',
  Germany: 'DE',
  Italy: 'IT',
  Spain: 'ES',
  Brazil: 'BR',
  Mexico: 'MX',
  Indonesia: 'ID',
  Malaysia: 'MY',
  Thailand: 'TH',
  Singapore: 'SG',
  Japan: 'JP',
  'South Korea': 'KR',
  China: 'CN',
  Russia: 'RU',
  Egypt: 'EG',
  Nigeria: 'NG',
  'South Africa': 'ZA',
  Argentina: 'AR',
  Chile: 'CL',
  Colombia: 'CO',
  Peru: 'PE',
};

/**
 * Format location with country abbreviation
 * Handles missing city/country gracefully
 */
export function formatLocation(location: any): string {
  if (!location) return 'N/A';

  // Handle if location is a string (try to parse)
  if (typeof location === 'string') {
    try {
      location = JSON.parse(location);
    } catch {
      return location; // Return as-is if can't parse
    }
  }

  // If both city and country exist
  if (location.city && location.country) {
    const countryAbbr = countryToAbbreviation[location.country] || location.country;
    return `${location.city}, ${countryAbbr}`;
  }

  // If only country exists (no comma, just abbreviation)
  if (location.country) {
    const countryAbbr = countryToAbbreviation[location.country] || location.country;
    return countryAbbr;
  }

  // If only city exists
  if (location.city) {
    return location.city;
  }

  return 'N/A';
}