// src/components/social-accounts/CSVImportModal.tsx
'use client';

import { useState, useRef } from 'react';
import { Upload, X, AlertCircle, CheckCircle, FileText, Download } from 'react-feather';
import { 
  handlePostImportDataStorage
} from '@/services/social-accounts/social-accounts.service';
import type { 
  CSVInfluencerRow, 
  BulkImportResponse 
} from '@/types/social-accounts';

// Define Platform interface locally - FIXED to match DiscoverTab platform structure
interface Platform {
  id: string;
  name: string;
  work_platform_id: string; // Make this required since we need it for the API
}

interface ImportProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  currentUsername: string;
  errors: Array<{ username: string; error: string }>;
}

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (results: BulkImportResponse) => void;
  platforms: Platform[];
  selectedPlatform: Platform | null;
}

// Parse CSV content function
const parseCSVContent = (csvContent: string): CSVInfluencerRow[] => {
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    throw new Error('CSV file must contain at least a header row and one data row');
  }

  // Parse header - handle quoted fields
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
  
  // Validate required columns
  if (!headers.includes('username')) {
    throw new Error('CSV file must contain a "username" column');
  }

  console.log('📋 CSV Headers found:', headers);

  // Parse data rows
  const data: CSVInfluencerRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Partial<CSVInfluencerRow> = {};
    
    headers.forEach((header, index) => {
      if (values[index]) {
        const value = values[index].replace(/['"]/g, '');
        
        // Handle budget as number
        if (header === 'budget' && value) {
          // Remove currency symbols and convert to number
          const cleanBudget = value.replace(/[$,€£¥]/g, '').trim();
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

  console.log('📊 Parsed CSV data:', data.length, 'rows');
  return data;
};

// UPDATED: Real API import function with database storage
const realApiBulkImport = async (
  csvData: CSVInfluencerRow[],
  platform: Platform,
  onProgress?: (progress: { processed: number; total: number; current: string }) => void
): Promise<BulkImportResponse> => {
  console.log('🚀 Starting real API bulk import with database storage for', csvData.length, 'influencers');
  console.log('🎯 Using platform:', platform.name, 'with ID:', platform.id, 'and work_platform_id:', platform.work_platform_id);
  
  const results: BulkImportResponse = {
    success: true,
    total_processed: csvData.length,
    successful_imports: 0,
    failed_imports: 0,
    errors: [],
    imported_accounts: []
  };

  // Import the actual getCreatorProfile function
  const { getCreatorProfile } = await import('@/services/ensembledata/creator-profile');

  // Process each influencer
  for (let i = 0; i < csvData.length; i++) {
    const row = csvData[i];
    const rowNumber = i + 1;
    
    try {
      // Update progress
      onProgress?.({
        processed: i + 1,
        total: csvData.length,
        current: row.username
      });

      console.log(`🔄 Processing influencer ${rowNumber}/${csvData.length}: ${row.username} (Budget: ${row.budget || 'N/A'})`);

      // Clean username (remove @ if present)
      const cleanUsername = row.username.replace(/^@/, '').trim();
      
      if (!cleanUsername) {
        throw new Error('Username is required');
      }

      // Determine the platform for API call based on platform name
      let apiPlatform = 'instagram'; // default
      if (platform.name.toLowerCase().includes('youtube')) {
        apiPlatform = 'youtube';
      } else if (platform.name.toLowerCase().includes('tiktok')) {
        apiPlatform = 'tiktok';
      }

      // Step 1: Use the exact same getCreatorProfile call as in "Add to List"
      console.log(`🔍 Fetching profile data for @${cleanUsername} using getCreatorProfile for ${apiPlatform}`);
      
      const creatorProfileResponse = await getCreatorProfile({
        username: cleanUsername,
        platform: apiPlatform as 'instagram' | 'youtube' | 'tiktok',
        include_detailed_info: true,
      });

      console.log('📊 Creator profile response:', creatorProfileResponse);

      if (!creatorProfileResponse.success || !creatorProfileResponse.data) {
        throw new Error('No creator profile data received');
      }

      const influencerProfile = creatorProfileResponse.data;

      // Step 2: Create or get influencer first
      console.log(`🔍 Creating influencer record for ${influencerProfile.username}`);
      
      const influencerData = {
        username: influencerProfile.username,
        name: influencerProfile.name || row.fullname || influencerProfile.username,
        email: row.email || null,
        phone: row.phone || null,
        profile_data: influencerProfile
      };

      // Get auth token
      const authToken = localStorage.getItem('accessToken');
      
      if (!authToken) {
        throw new Error('No authentication token found. Please login first.');
      }

      const influencerResponse = await fetch('/api/v0/influencers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(influencerData)
      });

      let influencerId: string | undefined;

      if (!influencerResponse.ok) {
        // If influencer already exists, try to get by username
        console.log(`🔍 Influencer might exist, trying to fetch by username`);
        const existingResponse = await fetch(`/api/v0/influencers/by-username/${cleanUsername}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          }
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

      if (!influencerId) {
        throw new Error('No influencer ID received');
      }

      // Step 3: Create social account with the real data from getCreatorProfile
      console.log(`📱 Creating social account for influencer ID: ${influencerId}`);
      
      // UPDATED: Enhanced CSV data storage in additional_metrics
      const socialAccountData = {
        platform_id: platform.id,
        platform_account_id: influencerProfile.id || influencerProfile.external_id || '',
        account_handle: influencerProfile.username,
        full_name: influencerProfile.name || row.fullname || influencerProfile.username,
        profile_pic_url: influencerProfile.profileImage || undefined,
        profile_pic_url_hd: influencerProfile.profileImage || undefined,
        account_url: influencerProfile.url || getDefaultAccountUrl(apiPlatform, influencerProfile.username),
        is_private: false,
        is_verified: influencerProfile.isVerified || false,
        is_business: false,
        media_count: influencerProfile.content_count || undefined,
        followers_count: influencerProfile.followers || undefined,
        following_count: influencerProfile.following_count || influencerProfile.following || undefined,
        subscribers_count: influencerProfile.subscriber_count || undefined,
        likes_count: undefined,
        biography: influencerProfile.introduction || undefined,
        has_highlight_reels: false,
        category_id: influencerProfile.category || undefined,
        has_clips: false,
        added_through: 'import', // ADD THIS
        additional_metrics: {
          // Store the complete profile data exactly like "Add to List" does
          profile_data: influencerProfile,
          engagement_rate: influencerProfile.engagementRate || undefined,
          average_likes: influencerProfile.average_likes || undefined,
          average_views: influencerProfile.average_views || undefined,
          // Enhanced CSV data storage
          csv_data: {
            email: row.email,
            phone: row.phone,
            budget: row.budget,
            source: 'csv_import',
            import_date: new Date().toISOString(),
            original_csv_row: row,
            platform_info: {
              platform_id: platform.id,
              work_platform_id: platform.work_platform_id,
              platform_name: platform.name
            }
          }
        }
      };

      // Call API to create social account
      const socialAccountResponse = await fetch(`/api/v0/influencers/${influencerId}/social-accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(socialAccountData)
      });

      if (!socialAccountResponse.ok) {
        const errorText = await socialAccountResponse.text();
        console.error('❌ Social account creation failed:', {
          status: socialAccountResponse.status,
          statusText: socialAccountResponse.statusText,
          error: errorText
        });
        throw new Error(`Failed to create social account: ${socialAccountResponse.status} - ${errorText}`);
      }

      const socialAccountResult = await socialAccountResponse.json();
      console.log('✅ Social account created:', socialAccountResult);

      // Step 4: NEW - Store additional budget and contact data in database
      if (socialAccountResult?.id) {
        await handlePostImportDataStorage(socialAccountResult.id, row);
      }

      console.log(`✅ Successfully imported real data for: ${cleanUsername} (Budget: ${row.budget || 'N/A'})`);
      results.successful_imports++;
      results.imported_accounts.push(cleanUsername);

      // Add delay to avoid rate limiting the real API (same as "Add to List")
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay

    } catch (error) {
      console.error(`❌ Failed to import ${row.username}:`, error);
      results.failed_imports++;
      results.errors.push({
        row: rowNumber,
        username: row.username,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      // Add shorter delay for failed requests
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  console.log('📊 Real API bulk import completed:', {
    successful: results.successful_imports,
    failed: results.failed_imports
  });

  return results;
};

// Helper function to get default account URL based on platform
const getDefaultAccountUrl = (platform: string, username: string): string => {
  switch (platform) {
    case 'youtube':
      return `https://youtube.com/@${username}`;
    case 'tiktok':
      return `https://tiktok.com/@${username}`;
    case 'instagram':
    default:
      return `https://instagram.com/${username}`;
  }
};

const CSVImportModal: React.FC<CSVImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
  platforms,
  selectedPlatform
}) => {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress>({
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    currentUsername: '',
    errors: []
  });
  const [selectedPlatformId, setSelectedPlatformId] = useState<string>(
    selectedPlatform?.id || ''
  );
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<CSVInfluencerRow[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Parse CSV content and extract data
  const parseCSV = async (file: File) => {
    const content = await file.text();
    return parseCSVContent(content);
  };

  // Handle file input change
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Please select a CSV file.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB.');
      return;
    }

    try {
      // Preview the CSV content
      const csvData = await parseCSV(file);
      setCsvFile(file);
      setCsvPreview(csvData.slice(0, 5)); // Show first 5 rows for preview
      console.log('📋 CSV Preview:', csvData.slice(0, 5));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error reading CSV file');
      setCsvFile(null);
      setCsvPreview([]);
    }
    
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Process the uploaded file and import accounts with real API
  const handleImport = async () => {
    if (!csvFile || !selectedPlatformId) {
      alert('Please select a CSV file and platform.');
      return;
    }

    // FIXED: Find the full platform object instead of just using the ID
    const platform = platforms.find(p => p.id === selectedPlatformId);
    if (!platform) {
      alert('Selected platform not found. Please refresh and try again.');
      return;
    }

    try {
      // Parse CSV file
      const csvData = await parseCSV(csvFile);

      if (csvData.length === 0) {
        alert('No valid data found in the CSV file. Please ensure the file contains usernames.');
        return;
      }

      // Show confirmation dialog for real API usage
      const confirmImport = confirm(
        `You are about to import ${csvData.length} influencer(s) using real API calls for ${platform.name}. Budget and contact data will be stored in the database. This may take some time and consume API resources. Do you want to continue?`
      );

      if (!confirmImport) {
        return;
      }

      // Initialize progress
      const initialProgress: ImportProgress = {
        total: csvData.length,
        processed: 0,
        successful: 0,
        failed: 0,
        currentUsername: '',
        errors: []
      };

      setProgress(initialProgress);
      setIsImporting(true);

      // FIXED: Use real API bulk import with full platform object
      const importResults = await realApiBulkImport(
        csvData,
        platform, // Pass the full platform object
        (progressUpdate) => {
          setProgress(prev => ({
            ...prev,
            processed: progressUpdate.processed,
            currentUsername: progressUpdate.current
          }));
        }
      );

      // Update final progress state
      setProgress(prev => ({
        ...prev,
        successful: importResults.successful_imports,
        failed: importResults.failed_imports,
        errors: importResults.errors.map(err => ({
          username: err.username,
          error: err.error
        })),
        currentUsername: ''
      }));

      setIsImporting(false);

      // Call completion handler
      onImportComplete(importResults);

    } catch (error) {
      console.error('Error processing CSV file:', error);
      alert(error instanceof Error ? error.message : 'Error processing the CSV file. Please check the file format and try again.');
      setIsImporting(false);
    }
  };

  // Reset modal state
  const handleClose = () => {
    if (isImporting) return;
    
    setCsvFile(null);
    setCsvPreview([]);
    setProgress({
      total: 0,
      processed: 0,
      successful: 0,
      failed: 0,
      currentUsername: '',
      errors: []
    });
    onClose();
  };

  // Download sample CSV template with budget column
  const handleDownloadTemplate = () => {
    const csvContent = 'username,fullname,email,phone,budget\nexample_user1,John Doe,john@example.com,123-456-7890,1000\nexample_user2,Jane Smith,jane@example.com,098-765-4321,1500\nexample_user3,Bob Johnson,bob@example.com,555-123-4567,2000';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'social_accounts_import_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Calculate progress percentage
  const progressPercentage = progress.total > 0 ? (progress.processed / progress.total) * 100 : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Import Influencers with Budget & Contacts
              </h3>
              <p className="text-sm text-gray-600">
                Upload CSV with usernames, budgets, and contacts - all data will be stored in database
              </p>
            </div>
          </div>
          {!isImporting && (
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!isImporting ? (
            <>
              {/* Platform Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Platform
                </label>
                <select
                  value={selectedPlatformId}
                  onChange={(e) => setSelectedPlatformId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Choose a platform...</option>
                  {platforms.map((platform) => (
                    <option key={platform.id} value={platform.id}>
                      {platform.name} (ID: {platform.id})
                    </option>
                  ))}
                </select>
                {selectedPlatformId && (
                  <p className="mt-1 text-xs text-gray-500">
                    Selected: {platforms.find(p => p.id === selectedPlatformId)?.name} | 
                    Platform ID: {selectedPlatformId} | 
                    Work Platform ID: {platforms.find(p => p.id === selectedPlatformId)?.work_platform_id}
                  </p>
                )}
              </div>

              {/* API Warning */}
              <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-yellow-900 mb-1">
                      Real API Import with Database Storage
                    </h4>
                    <p className="text-sm text-yellow-700">
                      This will fetch real influencer data from APIs and automatically store budget and contact information in the database. Budget and contact data will persist and survive page refreshes.
                    </p>
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CSV File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                  {csvFile ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center space-x-3">
                        <FileText className="w-8 h-8 text-purple-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{csvFile.name}</p>
                          <p className="text-xs text-gray-500">
                            {(csvFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setCsvFile(null);
                            setCsvPreview([]);
                          }}
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* CSV Preview */}
                      {csvPreview.length > 0 && (
                        <div className="mt-4 text-left">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Preview (first 5 rows):</h4>
                          <div className="bg-gray-50 rounded p-3 text-xs overflow-x-auto">
                            <table className="min-w-full">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left py-1 px-2">Username</th>
                                  <th className="text-left py-1 px-2">Full Name</th>
                                  <th className="text-left py-1 px-2">Email</th>
                                  <th className="text-left py-1 px-2">Phone</th>
                                  <th className="text-left py-1 px-2">Budget</th>
                                </tr>
                              </thead>
                              <tbody>
                                {csvPreview.map((row, index) => (
                                  <tr key={index} className="border-b">
                                    <td className="py-1 px-2 font-medium">@{row.username}</td>
                                    <td className="py-1 px-2">{row.fullname || '-'}</td>
                                    <td className="py-1 px-2">{row.email || '-'}</td>
                                    <td className="py-1 px-2">{row.phone || '-'}</td>
                                    <td className="py-1 px-2">{row.budget ? `$${row.budget}` : '-'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <div className="mb-4">
                        <button
                          type="button"
                          onClick={handleFileSelect}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        >
                          Choose File
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Upload a CSV file with columns: username (required), fullname, email, phone, budget (all optional)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Template Download */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-blue-900 mb-1">
                      CSV Format with Database Storage
                    </h4>
                    <p className="text-sm text-blue-700 mb-3">
                      Your CSV file should have a "username" column (required). Optional columns: "budget" (for collaboration pricing), "email", "phone" (for contacts). All budget and contact data will be automatically stored in the database and remain available after page refreshes.
                    </p>
                    <button
                      onClick={handleDownloadTemplate}
                      className="inline-flex items-center text-sm font-medium text-blue-700 hover:text-blue-800"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download Template (with Budget & Contacts)
                    </button>
                  </div>
                </div>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </>
          ) : (
            /* Import Progress */
            <>
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-3">
                  <span className="font-medium">Fetching Data & Storing in Database...</span>
                  <span className="font-semibold">{progress.processed} / {progress.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>{progressPercentage.toFixed(0)}% complete</span>
                  <span>{progress.successful} successful, {progress.failed} failed</span>
                </div>
              </div>

              {/* Current Status */}
              {progress.currentUsername && (
                <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                    <div>
                      <div className="text-sm font-medium text-purple-900">
                        Fetching profile data & storing budget/contacts...
                      </div>
                      <div className="text-sm text-purple-700">
                        @{progress.currentUsername}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Errors */}
              {progress.errors.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-red-900 mb-3 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
                    Import Errors ({progress.errors.length})
                  </h4>
                  <div className="max-h-32 overflow-y-auto space-y-2">
                    {progress.errors.map((error, index) => (
                      <div key={index} className="text-xs text-gray-700 p-2 bg-white rounded border-l-2 border-red-300">
                        <span className="font-semibold text-red-600">@{error.username}:</span> {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completion Message */}
              {!isImporting && progress.total > 0 && (
                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                  <div className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
                    <div>
                      <div className="font-semibold text-green-800">Import Complete with Database Storage!</div>
                      <div className="text-sm text-green-700">
                        {progress.successful} profile(s) imported successfully with budget and contact data stored in database
                        {progress.failed > 0 && `, ${progress.failed} failed`}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          {!isImporting ? (
            <>
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!csvFile || !selectedPlatformId}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Import with Database Storage
              </button>
            </>
          ) : (
            <button
              onClick={handleClose}
              disabled={isImporting}
              className="px-6 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isImporting ? 'Importing & Storing Data...' : 'Close'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CSVImportModal;