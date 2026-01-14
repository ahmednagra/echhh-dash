// src/components/dashboard/campaign-funnel/discover/BrandInfoForm.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, X } from 'react-feather';
import { fetchCategories, Category } from '@/services/category/category.service';
import { createCampaign } from '@/services/campaign/campaign.service';
import { CreateCampaignRequest } from '@/types/campaign';
import { useApiCall } from '@/hooks/useApiCall';
import { useAuth } from '@/context/AuthContext';
import { getStoredCompany } from '@/services/auth/auth.utils';

interface BrandInfoFormProps {
  onComplete: (formData: any) => void;
}

type FormStep = 1 | 2 | 3 | 4 | 5;

// Currency options
interface Currency {
  code: string;
  symbol: string;
  name: string;
}

// Brand interface based on API response
interface Brand {
  id: string;
  name: string;
  logo_url: string;
}

const currencies: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
];

// Age options from Age.tsx component
const AGE_OPTIONS = [
  { value: 13, label: '13' },
  { value: 18, label: '18' },
  { value: 25, label: '25' },
  { value: 35, label: '35' },
  { value: 45, label: '45' },
  { value: 55, label: '55' },
  { value: 65, label: '65+' },
];

const BrandInfoForm: React.FC<BrandInfoFormProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [formData, setFormData] = useState({
    brandName: '',
    brandCategory: '',
    audienceAgeGroup: '',
    audienceAgeMin: 18,
    audienceAgeMax: 65,
    campaignBudget: 0,
    campaignCurrency: 'USD',
    campaignName: ''
  });
  
  // States for brand search
  const [brandSearchQuery, setBrandSearchQuery] = useState('');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [isManualBrandEntry, setIsManualBrandEntry] = useState(false);
  const [isBrandSearchLoading, setIsBrandSearchLoading] = useState(false);
  
  // States for category search
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  
  // States for age dropdowns
  const [showAgeMinDropdown, setShowAgeMinDropdown] = useState(false);
  const [showAgeMaxDropdown, setShowAgeMaxDropdown] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Refs for dropdowns
  const brandDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const ageMinDropdownRef = useRef<HTMLDivElement>(null);
  const ageMaxDropdownRef = useRef<HTMLDivElement>(null);
  
  // Use auth context to get user info
  const { user } = useAuth();
  
  // Use custom hook for API calls
  const categoriesApi = useApiCall<Category[]>();
  const campaignApi = useApiCall();
  const brandsApi = useApiCall<{success: boolean, data: Brand[], total: number}>();
  
  // Fetch company data on component mount
  useEffect(() => {
    const company = getStoredCompany();
    if (company && company.id) {
      setCompanyId(company.id);
    }
  }, []);
  
  // Fetch categories when component loads
  useEffect(() => {
    const getCategories = async () => {
      await categoriesApi.execute(fetchCategories());
    };
    getCategories();
  }, []);
  
  // Update categories from API response
  useEffect(() => {
    if (categoriesApi.data) {
      setCategories(categoriesApi.data);
      setFilteredCategories(categoriesApi.data);
    }
    
    if (categoriesApi.error) {
      setError('Could not load categories. Please try again.');
      // Mock data for development
      const mockCategories = [
        { id: '1', name: 'Fashion' },
        { id: '2', name: 'Beauty' },
        { id: '3', name: 'Technology' },
        { id: '4', name: 'Food & Beverage' },
        { id: '5', name: 'Travel' },
        { id: '6', name: 'Fitness' },
        { id: '7', name: 'Lifestyle' }
      ];
      setCategories(mockCategories);
      setFilteredCategories(mockCategories);
    }
  }, [categoriesApi.data, categoriesApi.error]);

  // Fetch brands function
  const fetchBrands = async (searchQuery: string = '') => {
    try {
      setIsBrandSearchLoading(true);
      const url = searchQuery 
        ? `/api/v0/discover/brands?q=${encodeURIComponent(searchQuery)}`
        : '/api/v0/discover/brands';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success && data.data) {
        setBrands(data.data);
        setFilteredBrands(data.data);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setIsBrandSearchLoading(false);
    }
  };

  // Handle brand search with debouncing
  const handleBrandSearch = (query: string) => {
    setBrandSearchQuery(query);
    setShowBrandDropdown(true);
    
    if (query.length >= 2) {
      // Clear previous results and show loading
      setFilteredBrands([]);
      setIsManualBrandEntry(false);
      
      // Debounce the API call
      const timeoutId = setTimeout(() => {
        fetchBrands(query);
      }, 300);
      
      // Store timeout ID to clear it if user types again
      return () => clearTimeout(timeoutId);
    } else if (query.length === 0) {
      setFilteredBrands([]);
      setIsManualBrandEntry(false);
      setIsBrandSearchLoading(false);
    }
  };

  // Handle brand selection
  const handleBrandSelect = (brandName: string) => {
    setFormData(prev => ({ ...prev, brandName }));
    setBrandSearchQuery(brandName);
    setShowBrandDropdown(false);
    setIsManualBrandEntry(false);
  };

  // Handle manual brand entry
  const handleManualBrandEntry = () => {
    setFormData(prev => ({ ...prev, brandName: brandSearchQuery }));
    setIsManualBrandEntry(true);
    setShowBrandDropdown(false);
  };

  // Handle category search
  const handleCategorySearch = (query: string) => {
    setCategorySearchQuery(query);
    setShowCategoryDropdown(true);
    
    const filtered = categories.filter(category =>
      category.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCategories(filtered);
  };

  // Handle category selection
  const handleCategorySelect = (category: Category) => {
    setFormData(prev => ({ ...prev, brandCategory: category.id }));
    setCategorySearchQuery(category.name);
    setShowCategoryDropdown(false);
  };

  // Handle age selection
  const handleAgeSelection = (type: 'min' | 'max', value: number) => {
    setFormData(prev => {
      const newData = { ...prev, [`audienceAge${type === 'min' ? 'Min' : 'Max'}`]: value };
      // Update the combined age group string
      newData.audienceAgeGroup = `${newData.audienceAgeMin}-${newData.audienceAgeMax}`;
      return newData;
    });
    
    if (type === 'min') {
      setShowAgeMinDropdown(false);
    } else {
      setShowAgeMaxDropdown(false);
    }
  };

  // Handle budget input change with auto-remove zero
  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // If user starts typing and the current value is 0, clear it
    if (formData.campaignBudget === 0 && value !== '0' && value !== '') {
      value = value.replace(/^0+/, '');
    }
    
    setFormData(prev => ({
      ...prev,
      campaignBudget: parseFloat(value) || 0
    }));
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (brandDropdownRef.current && !brandDropdownRef.current.contains(event.target as Node)) {
        setShowBrandDropdown(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
      if (ageMinDropdownRef.current && !ageMinDropdownRef.current.contains(event.target as Node)) {
        setShowAgeMinDropdown(false);
      }
      if (ageMaxDropdownRef.current && !ageMaxDropdownRef.current.contains(event.target as Node)) {
        setShowAgeMaxDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Validate the current step
  const validateCurrentStep = (): boolean => {
    setError(null); // Clear any existing errors first
    
    switch (currentStep) {
      case 1:
        if (!formData.brandName.trim()) {
          setError('Please enter or select your brand name');
          return false;
        }
        break;
      case 2:
        if (!formData.brandCategory.trim()) {
          setError('Please select a brand category');
          return false;
        }
        break;
      case 3:
        if (!formData.audienceAgeGroup) {
          setError('Please select an audience age group');
          return false;
        }
        break;
      case 4:
        if (!formData.campaignBudget || formData.campaignBudget <= 0) {
          setError('Please enter a valid budget amount greater than 0');
          return false;
        }
        
        const budget = formData.campaignBudget;
        if (isNaN(budget)) {
          setError('Please enter a valid budget amount');
          return false;
        }
        break;
      case 5:
        if (!formData.campaignName.trim()) {
          setError('Please enter a campaign name');
          return false;
        }
        break;
    }
    return true;
  };

  // Handle next step
  const handleNext = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!validateCurrentStep()) {
      return;
    }
    
    if (currentStep < 5) {
      setCurrentStep((prev => (prev + 1) as FormStep));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCurrentStep()) {
      return;
    }
    
    if (!companyId) {
      setError('Company information not found. Please log in again.');
      return;
    }
    
    // Set submitting state to true
    setIsSubmitting(true);
    
    const campaignData: CreateCampaignRequest = {
      name: formData.campaignName,
      brand_name: formData.brandName,
      category_id: formData.brandCategory,
      audience_age_group: formData.audienceAgeGroup,
      budget: formData.campaignBudget,
      currency_code: formData.campaignCurrency,
      company_id: companyId
    };
    
    try {
      const createdCampaign = await campaignApi.execute(createCampaign(campaignData));
      
      if (campaignApi.error) {
        setError('Failed to create the campaign. Please try again.');
        console.error('API error:', campaignApi.error);
      } else if (createdCampaign) {
        console.log('Campaign created successfully:', createdCampaign);
        onComplete(createdCampaign);
      } else {
        setError('Unexpected error: No campaign data returned');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      // Always reset submitting state
      setIsSubmitting(false);
    }
  };

  // Handle key press events for form navigation
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentStep < 5) {
        handleNext();
      } else {
        handleSubmit(e);
      }
    }
  };

  // Determine if we're in a loading state
  const isLoading = categoriesApi.isLoading || campaignApi.isLoading || brandsApi.isLoading || isSubmitting;

  // Get selected currency symbol
  const getSelectedCurrencySymbol = () => {
    const currency = currencies.find(c => c.code === formData.campaignCurrency);
    return currency ? currency.symbol : '$';
  };

  // Get selected category name
  const getSelectedCategoryName = () => {
    const category = categories.find(c => c.id === formData.brandCategory);
    return category ? category.name : '';
  };

  // Render the appropriate form step
  const renderFormStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <form onSubmit={handleNext} onKeyPress={handleKeyPress}>
            <div className="relative" ref={brandDropdownRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search your brand or enter manually"
                  value={brandSearchQuery}
                  onChange={(e) => handleBrandSearch(e.target.value)}
                  onFocus={() => setShowBrandDropdown(true)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={isLoading}
                  required
                />
              </div>
              
              {showBrandDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {isBrandSearchLoading ? (
                    <div className="px-4 py-3 text-center text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                        <span>Searching brands...</span>
                      </div>
                    </div>
                  ) : filteredBrands.length > 0 ? (
                    filteredBrands.map((brand) => (
                      <button
                        key={brand.id}
                        type="button"
                        onClick={() => handleBrandSelect(brand.name)}
                        className="w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors flex items-center gap-3"
                      >
                        {brand.logo_url && (
                          <img src={brand.logo_url} alt={brand.name} className="w-6 h-6 object-contain" />
                        )}
                        <span className="text-gray-700">{brand.name}</span>
                      </button>
                    ))
                  ) : brandSearchQuery.length >= 2 && !isBrandSearchLoading ? (
                    <button
                      type="button"
                      onClick={handleManualBrandEntry}
                      className="w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors text-purple-600"
                    >
                      + Add "{brandSearchQuery}" as custom brand
                    </button>
                  ) : null}
                </div>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full mt-8 px-6 py-3 bg-purple-500 text-white rounded-full font-medium hover:bg-purple-600 transition-colors disabled:bg-purple-300"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Next'}
            </button>
          </form>
        );
        
      case 2:
        return (
          <form onSubmit={handleNext} onKeyPress={handleKeyPress}>
            <div className="relative" ref={categoryDropdownRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search brand category"
                  value={categorySearchQuery}
                  onChange={(e) => handleCategorySearch(e.target.value)}
                  onFocus={() => setShowCategoryDropdown(true)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={isLoading}
                  required
                />
              </div>
              
              {showCategoryDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredCategories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleCategorySelect(category)}
                      className="w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors text-gray-700"
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full mt-8 px-6 py-3 bg-purple-500 text-white rounded-full font-medium hover:bg-purple-600 transition-colors disabled:bg-purple-300"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Next'}
            </button>
          </form>
        );
        
      case 3:
        return (
          <form onSubmit={handleNext} onKeyPress={handleKeyPress}>
            <div className="grid grid-cols-2 gap-4">
              {/* Min Age Dropdown */}
              <div className="relative" ref={ageMinDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowAgeMinDropdown(!showAgeMinDropdown)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none text-left"
                  disabled={isLoading}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Min: {formData.audienceAgeMin}</span>
                    <ChevronDown className={`transition-transform ${showAgeMinDropdown ? 'rotate-180' : ''}`} size={20} />
                  </div>
                </button>
                
                {showAgeMinDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {AGE_OPTIONS.filter(opt => opt.value < formData.audienceAgeMax).map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleAgeSelection('min', option.value)}
                        className={`w-full px-4 py-2 text-left hover:bg-purple-50 transition-colors ${
                          formData.audienceAgeMin === option.value ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Max Age Dropdown */}
              <div className="relative" ref={ageMaxDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowAgeMaxDropdown(!showAgeMaxDropdown)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none text-left"
                  disabled={isLoading}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Max: {formData.audienceAgeMax === 65 ? '65+' : formData.audienceAgeMax}</span>
                    <ChevronDown className={`transition-transform ${showAgeMaxDropdown ? 'rotate-180' : ''}`} size={20} />
                  </div>
                </button>
                
                {showAgeMaxDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {AGE_OPTIONS.filter(opt => opt.value > formData.audienceAgeMin).map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleAgeSelection('max', option.value)}
                        className={`w-full px-4 py-2 text-left hover:bg-purple-50 transition-colors ${
                          formData.audienceAgeMax === option.value ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {formData.audienceAgeGroup && (
              <div className="mt-4 p-3 bg-purple-50 rounded-lg text-center">
                <span className="text-purple-700 font-medium">Selected Age Group: {formData.audienceAgeGroup}</span>
              </div>
            )}
            
            <button
              type="submit"
              className="w-full mt-8 px-6 py-3 bg-purple-500 text-white rounded-full font-medium hover:bg-purple-600 transition-colors disabled:bg-purple-300"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Next'}
            </button>
          </form>
        );
        
      case 4:
        return (
          <form onSubmit={handleNext} onKeyPress={handleKeyPress}>
            <div>
              <label htmlFor="campaignBudget" className="block text-sm font-medium text-gray-700 mb-1">
                Campaign Budget
              </label>
              <div className="flex">
                <div className="relative w-1/3 mr-2">
                  <select
                    name="campaignCurrency"
                    value={formData.campaignCurrency}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                    required
                    disabled={isLoading}
                  >
                    {currencies.map(currency => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code} ({currency.symbol})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </div>
                <div className="relative flex-1">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    {getSelectedCurrencySymbol()}
                  </div>
                  <input
                    type="number"
                    name="campaignBudget"
                    placeholder="Enter amount"
                    min="0.01"
                    step="0.01"
                    value={formData.campaignBudget === 0 ? '' : formData.campaignBudget}
                    onChange={handleBudgetChange}
                    className="w-full pl-8 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="w-full mt-8 px-6 py-3 bg-purple-500 text-white rounded-full font-medium hover:bg-purple-600 transition-colors disabled:bg-purple-300"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Next'}
            </button>
          </form>
        );
        
      case 5:
        return (
          <form onSubmit={handleSubmit} onKeyPress={handleKeyPress}>
            <input
              type="text"
              name="campaignName"
              placeholder="Campaign Name"
              value={formData.campaignName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
              disabled={isLoading}
            />
            <button
              type="submit"
              className="w-full mt-8 px-6 py-3 bg-purple-500 text-white rounded-full font-medium hover:bg-purple-600 transition-colors disabled:bg-purple-300 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Campaign...</span>
                </div>
              ) : isLoading ? 'Processing...' : 'Complete'}
            </button>
          </form>
        );
        
      default:
        return null;
    }
  };

  // Render progress dots
  const renderProgressDots = () => {
    return (
      <div className="flex justify-center space-x-2 mt-12">
        {[1, 2, 3, 4, 5].map(step => (
          <div
            key={step}
            className={`w-3 h-3 rounded-full ${
              step < currentStep 
                ? 'bg-purple-500' 
                : step === currentStep 
                  ? 'bg-purple-500' 
                  : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  // Company information warning
  const renderCompanyWarning = () => {
    if (!companyId) {
      return (
        <div className="mb-6 p-3 bg-yellow-50 text-yellow-700 rounded-lg text-sm">
          Company information not found. You may need to log in again or contact support.
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg py-12 px-6">
      <h2 className="text-2xl font-bold text-gray-700 text-center mb-12">
        Tell Us Little About Your Campaign
      </h2>

      {renderCompanyWarning()}

      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="max-w-sm mx-auto">
        {renderFormStep()}
      </div>

      {renderProgressDots()}
    </div>
  );
};

export default BrandInfoForm;