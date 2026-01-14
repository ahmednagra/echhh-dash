// src/components/dashboard/campaign-funnel/discover/shortlisted-influencers/ImportCsvButton.tsx
'use client';

import { useState, useRef } from 'react';
import { Download, X, AlertCircle, CheckCircle } from 'react-feather';

interface CSVRow {
  username: string;
  phone?: string;
  currency?: string; // NEW
  price?: string; // NEW
  budgetEntries?: Array<{ currency: string; price: number }>; // NEW - for grouping
}

interface ImportCsvButtonProps {
  onImportInfluencer: (csvRow: CSVRow) => Promise<boolean>;
  disabled?: boolean;
  className?: string;
  onImportComplete?: (successCount: number) => void;
  iconOnly?: boolean; // NEW: Icon-only mode with tooltip
}

interface ImportProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  currentUsername: string;
  errors: Array<{ username: string; error: string }>;
}

const ImportCsvButton: React.FC<ImportCsvButtonProps> = ({
  onImportInfluencer,
  disabled = false,
  className = '',
  onImportComplete,
  iconOnly = false, // NEW
}) => {
  const [isImporting, setIsImporting] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false); // NEW: For icon-only tooltip
  const [progress, setProgress] = useState<ImportProgress>({
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    currentUsername: '',
    errors: [],
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = () => {
    if (disabled || isImporting) return;
    fileInputRef.current?.click();
  };

  const parseCSV = (content: string): CSVRow[] => {
    const lines = content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line);

    if (lines.length === 0) return [];

    // Parse headers
    const headers = lines[0].split(',').map((h) =>
      h
        .trim()
        .toLowerCase()
        .replace(/^["']|["']$/g, ''),
    );

    // ✅ NEW: Find username column index dynamically
    const usernameColumnNames = [
      'username',
      'user',
      'handle',
      'account',
      'user_name',
      'account_handle',
    ];
    let usernameIndex = -1;

    for (const userCol of usernameColumnNames) {
      const index = headers.indexOf(userCol);
      if (index !== -1) {
        usernameIndex = index;
        break;
      }
    }

    // ✅ NEW: Throw error if no username column found
    if (usernameIndex === -1) {
      throw new Error(
        'CSV file must contain a username column (username, user, handle, or account)',
      );
    }

    const allRows: CSVRow[] = [];

    // Process data rows
    for (let i = 1; i < lines.length; i++) {
      const columns = lines[i]
        .split(',')
        .map((col) => col.trim().replace(/^["']|["']$/g, ''));

      // ✅ FIXED: Get username from the found username column index
      let username = columns[usernameIndex]?.trim() || '';
      // Remove @ symbol if present
      username = username.replace(/^@/, '');

      // Skip empty usernames and header rows
      if (username && username.toLowerCase() !== 'username') {
        const row: CSVRow = {
          username,
        };

        // Look for phone number in common column names
        const phoneColumnNames = ['phone', 'mobile', 'contact', 'number'];
        for (const phoneCol of phoneColumnNames) {
          const phoneIndex = headers.indexOf(phoneCol);
          if (
            phoneIndex !== -1 &&
            columns[phoneIndex] &&
            columns[phoneIndex].trim()
          ) {
            row.phone = columns[phoneIndex].trim();
            break;
          }
        }

        // NEW: Look for currency in common column names
        const currencyColumnNames = ['currency', 'curr', 'currency_code'];
        for (const currencyCol of currencyColumnNames) {
          const currencyIndex = headers.indexOf(currencyCol);
          if (
            currencyIndex !== -1 &&
            columns[currencyIndex] &&
            columns[currencyIndex].trim()
          ) {
            row.currency = columns[currencyIndex].trim().toUpperCase();
            break;
          }
        }

        // NEW: Look for price in common column names
        const priceColumnNames = ['price', 'budget', 'amount', 'cost'];
        for (const priceCol of priceColumnNames) {
          const priceIndex = headers.indexOf(priceCol);
          if (
            priceIndex !== -1 &&
            columns[priceIndex] &&
            columns[priceIndex].trim()
          ) {
            const cleanPrice = columns[priceIndex].replace(/[,$]/g, '').trim();
            if (!isNaN(Number(cleanPrice))) {
              row.price = cleanPrice;
            }
            break;
          }
        }

        allRows.push(row);
      }
    }

    // NEW: Group by username and merge budget data
    const groupedRows = new Map<string, CSVRow>();

    allRows.forEach((row) => {
      if (groupedRows.has(row.username)) {
        const existing = groupedRows.get(row.username)!;
        // Initialize budgetEntries if not exists
        if (!existing.budgetEntries) {
          existing.budgetEntries = [];
        }
        // Add new budget entry if both currency and price exist
        if (row.currency && row.price) {
          existing.budgetEntries.push({
            currency: row.currency,
            price: Number(row.price),
          });
        }
      } else {
        // First occurrence of this username
        if (row.currency && row.price) {
          row.budgetEntries = [
            {
              currency: row.currency,
              price: Number(row.price),
            },
          ];
        }
        groupedRows.set(row.username, row);
      }
    });

    return Array.from(groupedRows.values());
  };

  // Process the uploaded file
  const processFile = async (file: File) => {
    try {
      const content = await file.text();
      const csvRows = parseCSV(content);

      if (csvRows.length === 0) {
        alert(
          'No valid usernames found in the CSV file. Please ensure the file contains a username column.',
        );
        return;
      }

      // Initialize progress
      const initialProgress: ImportProgress = {
        total: csvRows.length,
        processed: 0,
        successful: 0,
        failed: 0,
        currentUsername: '',
        errors: [],
      };

      setProgress(initialProgress);
      setShowProgressModal(true);
      setIsImporting(true);

      let successfulImports = 0;

      // Process CSV rows one by one
      for (let i = 0; i < csvRows.length; i++) {
        const csvRow = csvRows[i];

        setProgress((prev) => ({
          ...prev,
          currentUsername: csvRow.username,
          processed: i + 1,
        }));

        try {
          const success = await onImportInfluencer(csvRow);

          if (success) {
            successfulImports++;
          }

          setProgress((prev) => ({
            ...prev,
            successful: success ? prev.successful + 1 : prev.successful,
            failed: success ? prev.failed : prev.failed + 1,
            errors: success
              ? prev.errors
              : [
                  ...prev.errors,
                  { username: csvRow.username, error: 'Failed to add to list' },
                ],
          }));

          // Add a small delay to prevent overwhelming the API
          if (i < csvRows.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        } catch (error) {
          setProgress((prev) => ({
            ...prev,
            failed: prev.failed + 1,
            errors: [
              ...prev.errors,
              {
                username: csvRow.username,
                error: error instanceof Error ? error.message : 'Unknown error',
              },
            ],
          }));
        }
      }

      setProgress((prev) => ({ ...prev, currentUsername: '' }));
      setIsImporting(false);

      // Trigger parent refresh after completion
      if (successfulImports > 0 && onImportComplete) {
        onImportComplete(successfulImports);
      }
    } catch (error) {
      console.error('Error processing CSV file:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Error processing the CSV file. Please check the file format and try again.',
      );
      setShowProgressModal(false);
      setIsImporting(false);
    }
  };

  // Handle file input change
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
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

    await processFile(file);

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Close progress modal
  const closeProgressModal = () => {
    if (!isImporting) {
      setShowProgressModal(false);
      setProgress({
        total: 0,
        processed: 0,
        successful: 0,
        failed: 0,
        currentUsername: '',
        errors: [],
      });
    }
  };

  // Calculate progress percentage
  const progressPercentage =
    progress.total > 0 ? (progress.processed / progress.total) * 100 : 0;

  return (
    <>
      {/* Import CSV Button */}
      {iconOnly ? (
        // Icon-only mode with tooltip
        <div className="relative">
          <button
            onClick={handleFileSelect}
            disabled={disabled || isImporting}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className={`p-2.5 rounded-xl border transition-all duration-200 ${
              disabled || isImporting
                ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300 hover:shadow-md hover:shadow-purple-500/10'
            } ${className}`}
            title="Import CSV"
          >
            {isImporting ? (
              <div className="w-4 h-4 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
          </button>
          {/* Tooltip */}
          {showTooltip && !isImporting && (
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none">
              <div className="px-2.5 py-1 text-xs font-medium bg-gray-900 text-white rounded-lg whitespace-nowrap shadow-lg">
                Import CSV
              </div>
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
            </div>
          )}
        </div>
      ) : (
        // Full button mode (original)
        <button
          onClick={handleFileSelect}
          disabled={disabled || isImporting}
          className={`flex items-center px-4 py-2 bg-gray-50 border border-blue-200 rounded-md text-sm font-medium hover:bg-gray-60 text-gray-700 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${className}`}
        >
          <Download className="w-4 h-4 mr-2 text-gray-500" />
          {isImporting ? 'Importing...' : 'Import'}
        </button>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Progress Modal */}
      {showProgressModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="pointer-events-auto bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg mx-4 border border-gray-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Download className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Importing Influencers
                </h3>
              </div>
              {!isImporting && (
                <button
                  onClick={closeProgressModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-3">
                <span className="font-medium">Progress</span>
                <span className="font-semibold">
                  {progress.processed} / {progress.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>0%</span>
                <span className="font-medium">
                  {Math.round(progressPercentage)}%
                </span>
                <span>100%</span>
              </div>
            </div>

            {/* Current Status */}
            {isImporting && progress.currentUsername && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                <div className="flex items-center">
                  <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full mr-3" />
                  <div>
                    <div className="text-sm font-medium text-blue-900">
                      Currently Processing
                    </div>
                    <div className="text-lg font-bold text-blue-700">
                      @{progress.currentUsername}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="text-sm font-medium text-green-800 mb-1">
                  Successful
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {progress.successful}
                </div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-lg border border-red-200">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="text-sm font-medium text-red-800 mb-1">
                  Failed
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {progress.failed}
                </div>
              </div>
            </div>

            {/* Errors List */}
            {progress.errors.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                  Failed Imports ({progress.errors.length})
                </h4>
                <div className="max-h-32 overflow-y-auto bg-gray-50 rounded-lg p-3 border border-gray-200">
                  {progress.errors.map((error, index) => (
                    <div
                      key={index}
                      className="text-xs text-gray-700 mb-2 last:mb-0 p-2 bg-white rounded border-l-2 border-red-300"
                    >
                      <span className="font-semibold text-red-600">
                        @{error.username}:
                      </span>{' '}
                      {error.error}
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
                    <div className="font-semibold text-green-800">
                      Import Complete!
                    </div>
                    <div className="text-sm text-green-700">
                      {progress.successful} influencer(s) added successfully
                      {progress.failed > 0 && `, ${progress.failed} failed`}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-end">
              {!isImporting && (
                <button
                  onClick={closeProgressModal}
                  className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImportCsvButton;
