// src/services/social-accounts/social-accounts.service.ts
// FIXED: Use Next.js API route for pricing updates (no backend auth required)

import { getCreatorProfile } from '@/services/ensembledata/creator-profile';
import {
  createInfluencerContact
} from '@/services/influencer-contacts/influencer-contacts.service';
import type { 
  SocialAccount, 
  CSVInfluencerRow, 
  CreateSocialAccountRequest, 
  BulkImportResponse,
  SocialAccountsListResponse 
} from '@/types/social-accounts';

/**
 * Make API request to backend with authentication
 */
async function makeApiRequest<T>(
  url: string, 
  options: RequestInit = {}
): Promise<T> {
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV || 'local';
  let baseUrl = '';
  
  if (appEnv === 'production') {
    baseUrl = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL_PRO!;
  } else if (appEnv === 'development') {
    baseUrl = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL_DEV!;
  } else if (appEnv === 'local') {
    baseUrl = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL_LOC!;
  } else {
    baseUrl = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL_LOC!;
  }
  
  if (!baseUrl) {
    baseUrl = 'http://192.168.18.74:8000/api';
  }
  
  const apiVersion = process.env.NEXT_PUBLIC_API_VERSION || 'v0';
  
  let fullUrl: string;
  if (baseUrl.endsWith('/api')) {
    fullUrl = `${baseUrl}/${apiVersion}${url}`;
  } else {
    fullUrl = `${baseUrl}/${apiVersion}${url}`;
  }
  
  const authToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  
  // FIXED: Explicitly type headers as Record<string, string>
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  
  // FIXED: Now we can safely assign Authorization
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  
  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error:', {
      status: response.status,
      error: errorText,
      url: fullUrl
    });
    
    if (response.status === 401 && !authToken) {
      throw new Error('Authentication required. Please log in first.');
    }
    
    throw new Error(`API request failed: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  return data;
}

/**
 * FIXED: Update social account pricing following MembersTable pattern
 * This replicates the exact approach used in MembersTable/PricePopup
 */
export async function updateSocialAccountPricing(
  accountId: string,
  price: number | null,
  currency: string = 'USD'
): Promise<SocialAccount> {
  try {
    console.log('MEMBERSTABLE PATTERN: Updating pricing following MembersTable approach for account:', accountId);
    console.log('MEMBERSTABLE PATTERN: Price:', price, 'Currency:', currency);
    
    // Get auth token if available (following MembersTable pattern)
    const authToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    
    // Create headers following MembersTable pattern
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    // Add auth token if available (like MembersTable does)
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }
    
    // Call the simplified Next.js API route (no server service)
    const response = await fetch(`/api/v0/social-accounts/${accountId}/pricing`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        collaboration_price: price,
        currency: currency
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('MEMBERSTABLE PATTERN: API call failed:', {
        status: response.status,
        error: errorText
      });
      throw new Error(`Pricing update failed: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('MEMBERSTABLE PATTERN: Raw response:', result);
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to update pricing');
    }
    
    console.log('MEMBERSTABLE PATTERN: Pricing update successful:', {
      accountId: result.data.id,
      collaboration_price: result.data.collaboration_price,
      currency: result.data.currency
    });
    
    // Return the updated account data
    return result.data as SocialAccount;
    
  } catch (error) {
    console.error('MEMBERSTABLE PATTERN: Pricing update failed:', error);
    throw error;
  }
}

/**
 * Store contact information for a social account
 */
export async function storeSocialAccountContacts(
  socialAccountId: string,
  email?: string,
  phone?: string
): Promise<void> {
  try {
    const contacts: Array<{
      contact_type: string;
      contact_value: string;
      is_primary: boolean;
      name?: string;
    }> = [];

    if (email && email.trim()) {
      contacts.push({
        contact_type: 'email',
        contact_value: email.trim(),
        is_primary: true,
        name: 'Primary Email'
      });
    }

    if (phone && phone.trim()) {
      contacts.push({
        contact_type: 'phone',
        contact_value: phone.trim(),
        is_primary: !email,
        name: 'Primary Phone'
      });
    }

    for (const contact of contacts) {
      const contactData = {
        social_account_id: socialAccountId,
        contact_type: contact.contact_type as any,
        contact_value: contact.contact_value,
        name: contact.name || `${contact.contact_type} Contact`,
        is_primary: contact.is_primary,
        platform_specific: false
      };

      await createInfluencerContact(contactData);
    }
    
    if (contacts.length > 0) {
      console.log(`Stored ${contacts.length} contacts for social account ${socialAccountId}`);
    }
  } catch (error) {
    console.error('Error storing contacts for social account:', error);
  }
}

/**
 * Store budget information for a social account
 */
export async function storeSocialAccountBudget(
  accountId: string,
  budget: number | string,
  currency: string = 'USD'
): Promise<void> {
  try {
    const price = typeof budget === 'string' ? parseFloat(budget) : budget;
    
    if (!isNaN(price) && price > 0) {
      await updateSocialAccountPricing(accountId, price, currency);
      console.log(`Stored budget ${currency} ${price} for social account ${accountId}`);
    }
  } catch (error) {
    console.error('Error storing budget for social account:', error);
  }
}

/**
 * Store contacts and budget from CSV import
 */
export async function storeCsvImportData(
  accountId: string,
  csvData: {
    budget?: number | null;
    currency?: string;
    email?: string;
    phone?: string;
  }
): Promise<{ account?: SocialAccount; contacts: any[] }> {
  try {
    console.log(`Storing CSV import data for account ${accountId}`);
    
    const results: { account?: SocialAccount; contacts: any[] } = { contacts: [] };
    
    if (csvData.budget !== undefined || csvData.currency) {
      try {
        results.account = await updateSocialAccountPricing(
          accountId,
          csvData.budget || null,
          csvData.currency || 'USD'
        );
      } catch (pricingError) {
        console.warn('Failed to update pricing:', pricingError);
      }
    }
    
    if (csvData.email || csvData.phone) {
      try {
        if (csvData.email) {
          await createInfluencerContact({
            social_account_id: accountId,
            contact_type: 'email',
            contact_value: csvData.email,
            name: 'CSV Import Email',
            is_primary: true,
            platform_specific: false
          });
          results.contacts.push({ contact_type: 'email', contact_value: csvData.email });
        }
        
        if (csvData.phone) {
          await createInfluencerContact({
            social_account_id: accountId,
            contact_type: 'phone',
            contact_value: csvData.phone,
            name: 'CSV Import Phone',
            is_primary: !csvData.email,
            platform_specific: false
          });
          results.contacts.push({ contact_type: 'phone', contact_value: csvData.phone });
        }
      } catch (contactError) {
        console.warn('Failed to store contacts:', contactError);
      }
    }
    
    console.log('CSV import data stored successfully');
    return results;
  } catch (error) {
    console.error('Error storing CSV import data:', error);
    throw error;
  }
}

/**
 * Handle post-import data storage for CSV imports
 */
export async function handlePostImportDataStorage(
  socialAccountId: string,
  csvRow: CSVInfluencerRow
): Promise<void> {
  try {
    console.log(`Storing additional data for social account ${socialAccountId}`);
    
    if (csvRow.budget) {
      const budgetValue = typeof csvRow.budget === 'string' 
        ? parseFloat(csvRow.budget.replace(/[$,â‚¬Â£Â¥]/g, '').trim()) 
        : csvRow.budget;
      
      if (!isNaN(budgetValue) && budgetValue > 0) {
        await storeSocialAccountBudget(socialAccountId, budgetValue, 'USD');
        console.log(`Budget stored: $${budgetValue}`);
      }
    }

    if (csvRow.email || csvRow.phone) {
      await storeSocialAccountContacts(
        socialAccountId,
        csvRow.email,
        csvRow.phone
      );
      console.log(`Contacts stored: email=${csvRow.email || 'N/A'}, phone=${csvRow.phone || 'N/A'}`);
    }

  } catch (error) {
    console.error(`Error storing additional data for ${socialAccountId}:`, error);
  }
}

/**
 * Import influencers from CSV data into social accounts table with database storage
 */
export async function bulkImportSocialAccounts(
  csvData: CSVInfluencerRow[],
  platformId: string,
  onProgress?: (progress: { processed: number; total: number; current: string }) => void
): Promise<BulkImportResponse> {
  try {
    console.log('Starting bulk import with database storage for', csvData.length, 'influencers');
    
    const results: BulkImportResponse = {
      success: true,
      total_processed: csvData.length,
      successful_imports: 0,
      failed_imports: 0,
      errors: [],
      imported_accounts: []
    };

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      const rowNumber = i + 1;
      
      try {
        onProgress?.({
          processed: i + 1,
          total: csvData.length,
          current: row.username
        });

        console.log(`Processing influencer ${rowNumber}/${csvData.length}: ${row.username} (Budget: ${row.budget || 'N/A'})`);

        const cleanUsername = row.username.replace(/^@/, '').trim();
        
        if (!cleanUsername) {
          throw new Error('Username is required');
        }

        const profileResponse = await getCreatorProfile({
          username: cleanUsername,
          platform: 'instagram',
          include_detailed_info: true
        });

        if (!profileResponse.success || !profileResponse.data) {
          throw new Error(`Profile not found or inaccessible`);
        }

        const profileData = profileResponse.data;

        const influencerData = {
          username: profileData.username,
          name: profileData.name || row.fullname || profileData.username,
          email: row.email || null,
          phone: row.phone || null,
          profile_data: profileData
        };

        let influencerId: string | undefined;
        
        try {
          const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
          
          // FIXED: Create headers object properly
          const headers: Record<string, string> = {
            'Content-Type': 'application/json'
          };
          
          if (token) {
            headers.Authorization = `Bearer ${token}`;
          }
          
          const influencerResponse = await fetch('/api/v0/influencers', {
            method: 'POST',
            headers,
            body: JSON.stringify(influencerData)
          });

          if (!influencerResponse.ok) {
            const existingHeaders: Record<string, string> = {};
            if (token) {
              existingHeaders.Authorization = `Bearer ${token}`;
            }
            
            const existingResponse = await fetch(`/api/v0/influencers/by-username/${cleanUsername}`, {
              headers: existingHeaders
            });
            
            if (!existingResponse.ok) {
              throw new Error('Failed to create or find influencer');
            }
            
            const existingData = await existingResponse.json();
            influencerId = existingData.id;
          } else {
            const newInfluencerData = await influencerResponse.json();
            influencerId = newInfluencerData.id;
          }
        } catch (error) {
          console.error('Error with influencer creation:', error);
          throw new Error('Failed to create or find influencer');
        }

        if (!influencerId) {
          throw new Error('No influencer ID received');
        }

        const socialAccountData: CreateSocialAccountRequest = {
          platform_id: platformId,
          platform_account_id: profileData.id || profileData.external_id || '',
          account_handle: profileData.username,
          full_name: profileData.name || row.fullname || profileData.username,
          profile_pic_url: profileData.profileImage || undefined,
          profile_pic_url_hd: undefined,
          account_url: profileData.url || `https://instagram.com/${profileData.username}`,
          is_private: false,
          is_verified: profileData.isVerified || false,
          is_business: false,
          media_count: profileData.content_count || undefined,
          followers_count: profileData.followers || undefined,
          following_count: profileData.following || undefined,
          subscribers_count: undefined,
          likes_count: undefined,
          biography: profileData.introduction || undefined,
          has_highlight_reels: false,
          category_id: undefined,
          has_clips: false,
          additional_metrics: {
            profile_data: profileData,
            csv_data: {
              email: row.email,
              phone: row.phone,
              budget: row.budget,
              source: 'csv_import',
              import_date: new Date().toISOString(),
              original_csv_row: row
            }
          }
        };

        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        
        // FIXED: Create headers object properly
        const socialAccountHeaders: Record<string, string> = {
          'Content-Type': 'application/json'
        };
        
        if (token) {
          socialAccountHeaders.Authorization = `Bearer ${token}`;
        }
        
        const response = await fetch(`/api/v0/influencers/${influencerId}/social-accounts`, {
          method: 'POST',
          headers: socialAccountHeaders,
          body: JSON.stringify(socialAccountData)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to create social account: ${response.status} - ${errorText}`);
        }

        const socialAccountResult = await response.json();
        const createdAccount = socialAccountResult.account || socialAccountResult;

        if (row.budget || row.email || row.phone) {
          await handlePostImportDataStorage(createdAccount.id, row);
        }

        console.log(`Successfully imported: ${cleanUsername}`);
        results.successful_imports++;
        results.imported_accounts.push(cleanUsername);

        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Failed to import ${row.username}:`, error);
        results.failed_imports++;
        results.errors.push({
          row: rowNumber,
          username: row.username,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log('Bulk import completed:', {
      successful: results.successful_imports,
      failed: results.failed_imports
    });

    return results;

  } catch (error) {
    console.error('Bulk import failed:', error);
    throw error;
  }
}

/**
 * Get all social accounts (paginated)
 */
export async function getSocialAccounts(
  page: number = 1,
  pageSize: number = 20,
  search?: string,
  platformId?: string
): Promise<SocialAccountsListResponse> {
  try {
    console.log('Fetching social accounts from backend API...');
    
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());
    params.append('limit', pageSize.toString());
    params.append('per_page', pageSize.toString());
    params.append('size', pageSize.toString());
    
    const offset = (page - 1) * pageSize;
    params.append('offset', offset.toString());
    params.append('skip', offset.toString());

    if (search) {
      params.append('search', search);
      params.append('q', search);
      params.append('query', search);
    }

    if (platformId) {
      params.append('platform_id', platformId);
    }

    const queryString = params.toString();
    
    const response = await makeApiRequest<any>(
      `/social-accounts?${queryString}`
    );

    let accounts: SocialAccount[] = [];
    let pagination = {
      page: page,
      page_size: pageSize,
      total_items: 0,
      total_pages: 0,
      has_next: false,
      has_previous: false
    };

    if (Array.isArray(response)) {
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      
      accounts = response.slice(startIndex, endIndex);
      pagination.total_items = response.length;
      pagination.total_pages = Math.ceil(response.length / pageSize);
      pagination.has_next = endIndex < response.length;
      pagination.has_previous = page > 1;
    } else if (response && typeof response === 'object') {
      if (response.data && Array.isArray(response.data)) {
        accounts = response.data;
      } else if (response.items && Array.isArray(response.items)) {
        accounts = response.items;
      } else if (response.results && Array.isArray(response.results)) {
        accounts = response.results;
      } else if (response.accounts && Array.isArray(response.accounts)) {
        accounts = response.accounts;
      }

      if (response.pagination) {
        pagination = {
          page: response.pagination.page || page,
          page_size: response.pagination.page_size || response.pagination.limit || pageSize,
          total_items: response.pagination.total_items || response.pagination.total || 0,
          total_pages: response.pagination.total_pages || Math.ceil((response.pagination.total_items || 0) / pageSize),
          has_next: response.pagination.has_next || false,
          has_previous: response.pagination.has_previous || false
        };
      } else if (response.total !== undefined) {
        pagination.total_items = response.total;
        pagination.total_pages = Math.ceil(response.total / pageSize);
        pagination.has_next = (page * pageSize) < response.total;
        pagination.has_previous = page > 1;
      } else if (response.count !== undefined) {
        pagination.total_items = response.count;
        pagination.total_pages = Math.ceil(response.count / pageSize);
        pagination.has_next = (page * pageSize) < response.count;
        pagination.has_previous = page > 1;
      }
    }

    const processedAccounts = accounts.map(account => ({
      ...account,
      platform: account.platform || { 
        id: account.platform_id, 
        name: getPlatformNameById(account.platform_id) 
      }
    }));

    return {
      success: true,
      data: processedAccounts,
      pagination
    };

  } catch (error) {
    console.error('Error fetching social accounts:', error);
    
    return {
      success: false,
      data: [],
      pagination: {
        page: 1,
        page_size: pageSize,
        total_items: 0,
        total_pages: 0,
        has_next: false,
        has_previous: false
      }
    };
  }
}

/**
 * Helper function to get platform name by ID
 */
function getPlatformNameById(platformId: string): string {
  const platformMap: Record<string, string> = {
    '1': 'Instagram',
    '2': 'YouTube', 
    '3': 'TikTok'
  };
  return platformMap[platformId] || 'Unknown';
}

/**
 * Delete a social account
 */
export async function deleteSocialAccount(influencerId: string, socialAccountId: string): Promise<boolean> {
  try {
    await makeApiRequest(`/social-accounts/${socialAccountId}`, {
      method: 'DELETE'
    });
    return true;
  } catch (error) {
    console.error('Error deleting social account:', error);
    return false;
  }
}

/**
 * Get social accounts for a specific influencer
 */
export async function getInfluencerSocialAccounts(influencerId: string): Promise<SocialAccount[]> {
  try {
    const response = await makeApiRequest<SocialAccount[]>(`/influencers/${influencerId}/social-accounts`);
    return response || [];
  } catch (error) {
    console.error('Error fetching influencer social accounts:', error);
    throw error;
  }
}

/**
 * Parse CSV file content
 */ 
export function parseCSVContent(csvContent: string): CSVInfluencerRow[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    throw new Error('CSV file must contain at least a header row and one data row');
  }

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/['"]/g, ''));
  
  if (!headers.includes('username')) {
    throw new Error('CSV file must contain a "username" column');
  }

  const data: CSVInfluencerRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Partial<CSVInfluencerRow> = {};
    
    headers.forEach((header, index) => {
      if (values[index]) {
        const value = values[index].replace(/['"]/g, '');
        
        if (header === 'budget' && value) {
          const cleanBudget = value.replace(/[$,â‚¬Â£Â¥]/g, '').trim();
          row[header] = parseFloat(cleanBudget) || 0;
        } else {
          row[header] = value;
        }
      }
    });
    
    if (row.username && row.username.trim()) {
      data.push(row as CSVInfluencerRow);
    }
  }

  return data;
}

export type { 
  SocialAccount, 
  CSVInfluencerRow, 
  CreateSocialAccountRequest, 
  BulkImportResponse,
  SocialAccountsListResponse 
};