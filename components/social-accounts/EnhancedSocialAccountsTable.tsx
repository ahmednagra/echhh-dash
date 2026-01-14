// src/components/social-accounts/EnhancedSocialAccountsTable.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { ExternalLink } from 'react-feather';
import { SocialAccount } from '@/services/social-accounts/social-accounts.service';
import { getInfluencerContacts } from '@/services/influencer-contacts/influencer-contacts.service';
import { EnhancedSocialAccountsTableProps } from './types';
import { PricePopup, ContactPopup, ViewContactsModal } from './Modals';
import { 
  ActionsDropdown, 
  calculatePopupPosition, 
  getSocialAccountColumnDefinitions,
  getAdditionalMetric 
} from './TableComponents';

const EnhancedSocialAccountsTable: React.FC<EnhancedSocialAccountsTableProps> = ({
  accounts,
  isLoading,
  searchText,
  pagination,
  onPageChange,
  onPageSizeChange,
  onDeleteAccount,
  deleteLoading
}) => {
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: 'asc' | 'desc' | null;
  }>({ key: null, direction: null });
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);

  // State management for local data updates
  const [localAccounts, setLocalAccounts] = useState<SocialAccount[]>([]);
  const [accountContacts, setAccountContacts] = useState<Record<string, any[]>>({});
  const [loadingContacts, setLoadingContacts] = useState<Record<string, boolean>>({});

  // Price popup state
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [selectedAccountForPrice, setSelectedAccountForPrice] = useState<SocialAccount | null>(null);
  const [pricePosition, setPricePosition] = useState({ x: 0, y: 0 });

  // Contact popup state
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedAccountForContact, setSelectedAccountForContact] = useState<SocialAccount | null>(null);
  const [contactPosition, setContactPosition] = useState({ x: 0, y: 0 });

  // View contacts modal state
  const [viewContactsModalOpen, setViewContactsModalOpen] = useState(false);
  const [selectedAccountForViewContacts, setSelectedAccountForViewContacts] = useState<SocialAccount | null>(null);

  // Initialize local accounts when props change
  useEffect(() => {
    setLocalAccounts(accounts);
  }, [accounts]);

  // FIXED: Function to load contacts for an account with better error handling
  const loadContactsForAccount = async (accountId: string) => {
    if (loadingContacts[accountId] || accountContacts[accountId]) {
      return; // Already loading or loaded
    }

    setLoadingContacts(prev => ({ ...prev, [accountId]: true }));
    
    try {
      console.log(`Loading contacts for account: ${accountId}`);
      const contacts = await getInfluencerContacts(accountId);
      console.log(`Loaded ${contacts.length} contacts for account ${accountId}:`, contacts);
      
      setAccountContacts(prev => ({
        ...prev,
        [accountId]: contacts.map(contact => ({
          id: contact.id,
          type: contact.contact_type,
          value: contact.contact_value,
          name: contact.name,
          is_primary: contact.is_primary
        }))
      }));
    } catch (error) {
      console.error(`Failed to load contacts for account: ${accountId}`, error);
      setAccountContacts(prev => ({
        ...prev,
        [accountId]: [] // Set empty array on error
      }));
    } finally {
      setLoadingContacts(prev => ({ ...prev, [accountId]: false }));
    }
  };

  // FIXED: Budget update handler - properly updates local state
  const handleBudgetUpdate = (updatedAccount: SocialAccount) => {
    console.log('Table: Received budget update:', {
      accountId: updatedAccount.id,
      newPrice: updatedAccount.collaboration_price,
      newCurrency: updatedAccount.currency
    });
    
    setLocalAccounts(prev => 
      prev.map(account => 
        account.id === updatedAccount.id ? {
          ...account,
          collaboration_price: updatedAccount.collaboration_price,
          currency: updatedAccount.currency,
          updated_at: updatedAccount.updated_at || new Date().toISOString()
        } : account
      )
    );
    
    console.log('Table: Local accounts updated successfully');
  };

  // FIXED: Contact handlers with proper refresh
  const handleContactAdded = async (accountId: string) => {
    console.log(`Contact added for account: ${accountId}, refreshing contacts...`);
    
    // Clear existing contacts and reload
    setAccountContacts(prev => {
      const updated = { ...prev };
      delete updated[accountId];
      return updated;
    });
    
    // Reload contacts
    await loadContactsForAccount(accountId);
  };

  const handleContactUpdate = async (account: SocialAccount, contactId: string, contactData: any) => {
    setAccountContacts(prev => ({
      ...prev,
      [account.id]: (prev[account.id] || []).map(contact => 
        contact.id === contactId ? { ...contact, ...contactData } : contact
      )
    }));
    
    // Refresh contacts from database to ensure consistency
    await loadContactsForAccount(account.id);
  };

  const handleContactDelete = async (account: SocialAccount, contactId: string) => {
    setAccountContacts(prev => ({
      ...prev,
      [account.id]: (prev[account.id] || []).filter(contact => contact.id !== contactId)
    }));
    
    // Refresh contacts from database to ensure consistency
    await loadContactsForAccount(account.id);
  };

  // Price popup handlers
  const handleBudgetClick = (account: SocialAccount, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const position = calculatePopupPosition(event.currentTarget as HTMLElement, 350, 300);
    console.log('Budget position calculated:', position);
    
    setPricePosition(position);
    setSelectedAccountForPrice(account);
    setPriceModalOpen(true);
  };

  // Contact popup handlers
  const handleContactClick = (account: SocialAccount, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const position = calculatePopupPosition(event.currentTarget as HTMLElement, 320, 200);
    console.log('Contact position calculated:', position);
    
    setContactPosition(position);
    setSelectedAccountForContact(account);
    setContactModalOpen(true);
  };

  // View profile handler
  const handleViewProfile = (account: SocialAccount) => {
    const accountUrl = account.account_url || getAdditionalMetric(account, 'url');
    if (accountUrl) {
      window.open(accountUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // FIXED: View contacts handler - loads contacts before showing modal
  const handleViewContacts = async (account: SocialAccount) => {
    console.log(`View contacts clicked for account: ${account.id}`);
    
    // Load contacts if not already loaded
    await loadContactsForAccount(account.id);
    
    setSelectedAccountForViewContacts(account);
    setViewContactsModalOpen(true);
  };

  // Create column definitions with callbacks
  const allColumns = React.useMemo(() => getSocialAccountColumnDefinitions({
    onBudgetClick: handleBudgetClick,
    onContactClick: handleContactClick
  }), []);

  // Initialize visible columns
  useEffect(() => {
    const initialVisible = new Set<string>();
    
    allColumns.forEach(column => {
      if (column.defaultVisible) {
        initialVisible.add(column.key);
      }
    });
    
    setVisibleColumns(initialVisible);
  }, [allColumns]);

  // Use local accounts for filtering and display
  const workingAccounts = localAccounts;

  // Filter accounts based on search
  const filteredAccounts = searchText
    ? workingAccounts.filter(account =>
        account.account_handle?.toLowerCase().includes(searchText.toLowerCase()) ||
        account.full_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        account.platform?.name?.toLowerCase().includes(searchText.toLowerCase())
      )
    : workingAccounts;

  // Sort accounts
  const sortedAccounts = React.useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return filteredAccounts;
    }

    const column = allColumns.find(col => col.key === sortConfig.key);
    if (!column) return filteredAccounts;

    return [...filteredAccounts].sort((a, b) => {
      const aValue = column.getValue(a);
      const bValue = column.getValue(b);

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) return sortConfig.direction === 'asc' ? 1 : -1;
      if (bValue === null || bValue === undefined) return sortConfig.direction === 'asc' ? -1 : 1;

      // Handle different data types
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // String comparison (convert to string if needed)
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (sortConfig.direction === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }, [filteredAccounts, sortConfig, allColumns]);

  // Handle sorting
  const handleSort = (columnKey: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key: columnKey, direction });
  };

  // Get sort icon
  const getSortIcon = (columnKey: string) => {
    if (sortConfig.key !== columnKey) {
      return (
        <div className="flex flex-col items-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-0.5">
          <svg className="w-3 h-3 text-gray-400 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          <svg className="w-3 h-3 text-gray-400 -mt-0.5 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }

    if (sortConfig.direction === 'asc') {
      return (
        <div className="flex flex-col items-center animate-pulse">
          <svg className="w-3.5 h-3.5 text-purple-600 drop-shadow-md filter brightness-110" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          <svg className="w-3 h-3 text-gray-300 -mt-0.5 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center animate-pulse">
          <svg className="w-3 h-3 text-gray-300 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          <svg className="w-3.5 h-3.5 text-purple-600 -mt-0.5 drop-shadow-md filter brightness-110" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
  };

  // Handle column visibility toggle
  const toggleColumnVisibility = (columnKey: string) => {
    setVisibleColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(columnKey)) {
        newSet.delete(columnKey);
      } else {
        newSet.add(columnKey);
      }
      return newSet;
    });
  };

  // Toggle row selection
  const toggleRowSelection = (accountId: string) => {
    setSelectedAccounts(prev => {
      if (prev.includes(accountId)) {
        return prev.filter(id => id !== accountId);
      }
      return [...prev, accountId];
    });
  };

  // Toggle all selection
  const toggleAllSelection = () => {
    if (selectedAccounts.length === sortedAccounts.length) {
      setSelectedAccounts([]);
    } else {
      setSelectedAccounts(sortedAccounts.map(account => account.id));
    }
  };

  const visibleColumnsData = allColumns.filter(column => visibleColumns.has(column.key));

  if (isLoading) {
    return (
      <div className="w-full bg-white border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-3 text-left">
                  <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                </th>
                {[...Array(7)].map((_, i) => (
                  <th key={i} className="px-2 py-3 text-left">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </th>
                ))}
                <th className="px-2 py-3 text-center w-20">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...Array(8)].map((_, i) => (
                <tr key={i}>
                  <td className="px-2 py-4">
                    <div className="h-4 w-4 bg-gray-100 rounded animate-pulse"></div>
                  </td>
                  {[...Array(7)].map((_, j) => (
                    <td key={j} className="px-2 py-4">
                      <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
                    </td>
                  ))}
                  <td className="px-2 py-4">
                    <div className="h-4 w-6 bg-gray-100 rounded animate-pulse mx-auto"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-2 py-3 text-left w-12">
                <input 
                  type="checkbox"
                  checked={selectedAccounts.length === sortedAccounts.length && sortedAccounts.length > 0}
                  onChange={toggleAllSelection}
                  className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                />
              </th>
              {visibleColumnsData.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-2 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider ${column.width} cursor-pointer hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 group select-none`}
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center justify-between">
                    <span className="group-hover:text-purple-700 transition-colors duration-200">
                      {column.key === 'name' ? `${column.label} (${pagination.total_items})` : column.label}
                    </span>
                    <div className="transform group-hover:scale-110 transition-transform duration-200">
                      {getSortIcon(column.key)}
                    </div>
                  </div>
                </th>
              ))}
              <th scope="col" className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20 relative">
                <div className="flex items-center justify-center space-x-2">
                  <span>Action</span>
                  <div className="column-dropdown">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowColumnDropdown(!showColumnDropdown);
                      }}
                      className="inline-flex items-center justify-center w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                      title="Toggle Columns"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                    
                    {showColumnDropdown && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowColumnDropdown(false)}></div>
                        
                        <div className="fixed right-4 top-20 w-56 bg-white rounded-lg shadow-2xl border border-gray-300 z-50 max-h-[28rem] overflow-hidden">
                          <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-800 flex items-center">
                              <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
                              </svg>
                              Column Visibility
                            </h3>
                            <p className="text-xs text-gray-600 mt-1">Select columns to display</p>
                          </div>
                          
                          <div className="py-3 max-h-80 overflow-y-auto">
                            {allColumns.map((column) => {
                              const hasData = accounts.some(account => {
                                const value = column.getValue(account);
                                return value !== null && value !== undefined && value !== '';
                              });
                              
                              return (
                                <label
                                  key={column.key}
                                  className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer group transition-colors duration-150"
                                >
                                  <input
                                    type="checkbox"
                                    checked={visibleColumns.has(column.key)}
                                    onChange={() => toggleColumnVisibility(column.key)}
                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mr-3"
                                  />
                                  <div className="flex-1 flex items-center justify-between">
                                    <span className={`text-sm transition-colors duration-150 ${
                                      visibleColumns.has(column.key) 
                                        ? 'text-gray-900 group-hover:text-purple-700' 
                                        : 'text-gray-400 group-hover:text-gray-500'
                                    }`}>
                                      {column.label}
                                    </span>
                                  </div>
                                  <div className="ml-2 flex-shrink-0">
                                    {hasData ? (
                                      <div className="w-2 h-2 bg-green-400 rounded-full" title="Data available"></div>
                                    ) : (
                                      <div className="w-2 h-2 bg-gray-300 rounded-full" title="No data"></div>
                                    )}
                                  </div>
                                </label>
                              );
                            })}
                            <div className="h-2"></div>
                          </div>
                          
                          <div className="px-4 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                            <button
                              onClick={() => {
                                const columnsWithData = new Set<string>();
                                allColumns.forEach(column => {
                                  const hasData = accounts.some(account => {
                                    const value = column.getValue(account);
                                    return value !== null && value !== undefined && value !== '';
                                  });
                                  if (hasData || column.defaultVisible) {
                                    columnsWithData.add(column.key);
                                  }
                                });
                                setVisibleColumns(columnsWithData);
                              }}
                              className="text-xs text-purple-600 hover:text-purple-700 font-medium transition-colors"
                            >
                              Select All
                            </button>
                            <button
                              onClick={() => {
                                const defaultColumns = new Set<string>();
                                allColumns.forEach(column => {
                                  if (column.defaultVisible) {
                                    defaultColumns.add(column.key);
                                  }
                                });
                                setVisibleColumns(defaultColumns);
                              }}
                              className="text-xs text-gray-600 hover:text-gray-700 font-medium transition-colors"
                            >
                              Reset
                            </button>
                          </div>
                          
                          <div className="h-3 bg-gray-50"></div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedAccounts.length === 0 ? (
              <tr>
                <td colSpan={visibleColumnsData.length + 2} className="px-3 py-8 text-center text-gray-500">
                  {searchText ? 'No accounts match your search.' : 'No social accounts yet.'}
                </td>
              </tr>
            ) : (
              sortedAccounts.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50">
                  <td className="px-2 py-4 whitespace-nowrap">
                    <input 
                      type="checkbox"
                      checked={selectedAccounts.includes(account.id)}
                      onChange={() => toggleRowSelection(account.id)}
                      className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                    />
                  </td>
                  {visibleColumnsData.map((column) => (
                    <td key={column.key} className={`px-2 py-4 whitespace-nowrap text-sm text-gray-500 ${column.width}`}>
                      <span className="truncate block">
                        {column.render ? column.render(
                          column.getValue(account), 
                          account
                        ) : column.getValue(account) || 'N/A'}
                      </span>
                    </td>
                  ))}
                  <td className="px-2 py-4 whitespace-nowrap text-center w-20">
                    <div className="flex items-center justify-center space-x-2">
                      {account.account_url && (
                        <button
                          onClick={() => window.open(account.account_url, '_blank')}
                          className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-purple-50 text-purple-400 hover:bg-purple-100 hover:text-purple-600 transition-all duration-200"
                          title="View Profile"
                        >
                          <ExternalLink size={14} />
                        </button>
                      )}
                      
                      <ActionsDropdown
                        account={account}
                        onViewProfile={handleViewProfile}
                        onViewContacts={handleViewContacts}
                        onDeleteAccount={onDeleteAccount}
                        deleteLoading={deleteLoading}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Price Modal */}
      <PricePopup
        account={selectedAccountForPrice}
        isOpen={priceModalOpen}
        onClose={() => {
          setPriceModalOpen(false);
          setSelectedAccountForPrice(null);
        }}
        onUpdate={handleBudgetUpdate}
        position={pricePosition}
      />

      {/* Contact Modal */}
      <ContactPopup
        account={selectedAccountForContact}
        isOpen={contactModalOpen}
        onClose={() => {
          setContactModalOpen(false);
          setSelectedAccountForContact(null);
        }}
        onContactAdded={handleContactAdded}
        position={contactPosition}
      />

      {/* View Contacts Modal */}
      <ViewContactsModal
        account={selectedAccountForViewContacts}
        isOpen={viewContactsModalOpen}
        onClose={() => {
          setViewContactsModalOpen(false);
          setSelectedAccountForViewContacts(null);
        }}
        contacts={selectedAccountForViewContacts ? (accountContacts[selectedAccountForViewContacts.id] || []) : []}
        onContactUpdate={handleContactUpdate}
        onContactDelete={handleContactDelete}
      />
    </div>
  );
};

export default EnhancedSocialAccountsTable;