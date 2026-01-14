// src/components/dashboard/profile-analytics/sections/PricingSection.tsx
'use client';

import { 
  Play,
  Clock,
  Camera,
  Star,
  Zap,
  Users,
  MapPin,
  Shield,
  Info,
  HelpCircle,
  Globe,
  ChevronDown
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Profile, Pricing, PriceExplanations } from '@/types/insightiq/profile-analytics';
import { validateSectionProps, safeProfileAccess } from '@/types/section-component-types';

interface PricingSectionProps {
  pricing: Pricing | null;
  price_explanations: PriceExplanations | null;
  profile: Profile | null;
  formatCurrency: (amount: number) => string;
}

// Currency data with exchange rates
const CURRENCIES = {
  USD: { symbol: '$', rate: 1, name: 'US Dollar' },
  EUR: { symbol: '€', rate: 0.85, name: 'Euro' },
  GBP: { symbol: '£', rate: 0.73, name: 'British Pound' },
  AED: { symbol: 'AED', rate: 3.67, name: 'UAE Dirham (Dubai)' },
  QAR: { symbol: 'QAR', rate: 3.64, name: 'Qatari Riyal' },
  SAR: { symbol: 'SAR', rate: 3.75, name: 'Saudi Riyal' },
  PKR: { symbol: 'PKR', rate: 278, name: 'Pakistani Rupee' },
  CNY: { symbol: '¥', rate: 7.24, name: 'Chinese Yuan' },
  INR: { symbol: '₹', rate: 83.2, name: 'Indian Rupee' },
  JPY: { symbol: '¥', rate: 149, name: 'Japanese Yen' },
  KRW: { symbol: '₩', rate: 1320, name: 'South Korean Won' },
  CAD: { symbol: 'C$', rate: 1.36, name: 'Canadian Dollar' },
  AUD: { symbol: 'A$', rate: 1.52, name: 'Australian Dollar' },
  CHF: { symbol: 'CHF', rate: 0.88, name: 'Swiss Franc' },
  BRL: { symbol: 'R$', rate: 4.95, name: 'Brazilian Real' },
  MXN: { symbol: 'MX$', rate: 17.1, name: 'Mexican Peso' },
  SGD: { symbol: 'S$', rate: 1.34, name: 'Singapore Dollar' },
  NZD: { symbol: 'NZ$', rate: 1.64, name: 'New Zealand Dollar' },
  ZAR: { symbol: 'R', rate: 18.7, name: 'South African Rand' },
  THB: { symbol: '฿', rate: 35.8, name: 'Thai Baht' },
  MYR: { symbol: 'RM', rate: 4.67, name: 'Malaysian Ringgit' },
  IDR: { symbol: 'Rp', rate: 15680, name: 'Indonesian Rupiah' },
  PHP: { symbol: '₱', rate: 56.2, name: 'Philippine Peso' },
  VND: { symbol: '₫', rate: 24350, name: 'Vietnamese Dong' },
  EGP: { symbol: 'EGP', rate: 30.9, name: 'Egyptian Pound' },
  TRY: { symbol: '₺', rate: 28.7, name: 'Turkish Lira' },
  RUB: { symbol: '₽', rate: 92.5, name: 'Russian Ruble' },
  NGN: { symbol: '₦', rate: 825, name: 'Nigerian Naira' },
  KES: { symbol: 'KSh', rate: 150, name: 'Kenyan Shilling' },
  GHS: { symbol: '₵', rate: 12.1, name: 'Ghanaian Cedi' },
  LKR: { symbol: 'LKR', rate: 326, name: 'Sri Lankan Rupee' },
  BDT: { symbol: '৳', rate: 110, name: 'Bangladeshi Taka' },
  NPR: { symbol: 'NPR', rate: 133, name: 'Nepalese Rupee' }
} as const;

type CurrencyCode = keyof typeof CURRENCIES;

// Tooltip Component
const Tooltip = ({ children, content }: { children: React.ReactNode; content: string }) => {
  return (
    <div className="group relative inline-block">
      {children}
      <div className="invisible group-hover:visible absolute z-50 w-64 p-3 mt-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-y-0 translate-y-1 -left-32">
        <div className="relative">
          {content}
          <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
        </div>
      </div>
    </div>
  );
};

// Currency Selector Component
const CurrencySelector = ({ 
  selectedCurrency, 
  onCurrencyChange 
}: { 
  selectedCurrency: CurrencyCode; 
  onCurrencyChange: (currency: CurrencyCode) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-currency-selector]')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative" data-currency-selector>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
      >
        <Globe className="w-4 h-4 text-gray-600" />
        <span className="font-medium text-gray-800">
          {CURRENCIES[selectedCurrency].symbol} {selectedCurrency}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {Object.entries(CURRENCIES).map(([code, currency]) => (
            <button
              key={code}
              onClick={() => {
                onCurrencyChange(code as CurrencyCode);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center justify-between ${
                selectedCurrency === code ? 'bg-purple-50 border-r-2 border-purple-500' : ''
              }`}
            >
              <div>
                <div className="font-medium text-gray-800">
                  {currency.symbol} {code}
                </div>
                <div className="text-sm text-gray-600">{currency.name}</div>
              </div>
              {selectedCurrency === code && (
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const PricingSection: React.FC<PricingSectionProps> = ({
  pricing,
  price_explanations,
  profile,
  formatCurrency
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('USD');

  // Function to convert USD to selected currency
  const convertCurrency = (usdAmount: number): number => {
    const rate = CURRENCIES[selectedCurrency].rate;
    return usdAmount * rate;
  };

  // Function to format currency with proper locale
  const formatConvertedCurrency = (usdAmount: number): string => {
    const convertedAmount = convertCurrency(usdAmount);
    const currency = CURRENCIES[selectedCurrency];
    
    // Handle special formatting for different currencies
    const noDecimalCurrencies = ['JPY', 'KRW', 'IDR', 'VND', 'NGN', 'KES'];
    const shouldShowDecimals = !noDecimalCurrencies.includes(selectedCurrency) && convertedAmount < 1000;
    
    const formattedNumber = convertedAmount.toLocaleString('en-US', { 
      maximumFractionDigits: shouldShowDecimals ? 2 : 0 
    });
    
    return `${currency.symbol}${formattedNumber}`;
  };

  // Validate props
  const validation = validateSectionProps(profile);
  if (!validation.isValid) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="text-center py-8">
          <p className="text-gray-500">{validation.error}</p>
        </div>
      </div>
    );
  }

  // Handle missing pricing data
  if (!pricing) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="text-center py-8">
          <p className="text-gray-500">Pricing data not available</p>
        </div>
      </div>
    );
  }

  // Safe access to profile data with fallbacks
  const topInterests = safeProfileAccess(profile, p => p.top_interests, []);
  const location = safeProfileAccess(profile, p => p.location, { city: null, state: null, country: null });
  const ageGroup = safeProfileAccess(profile, p => p.age_group, 'Not specified');
  const isVerified = safeProfileAccess(profile, p => p.is_verified, false);
  const engagementRate = safeProfileAccess(profile, p => p.engagement_rate, 0);

  // Helper function to get post type description
  const getPostTypeDescription = (postType: string) => {
    switch (postType) {
      case 'reels':
        return 'Short-form vertical videos with high viral potential and algorithm preference. Typically receive the highest reach and engagement rates on Instagram.';
      case 'story':
        return '24-hour temporary content ideal for behind-the-scenes, quick updates, and time-sensitive promotions. Great for maintaining daily engagement.';
      case 'static_post':
        return 'Traditional single-image posts perfect for high-quality visuals, detailed captions, and evergreen content that stays on the profile permanently.';
      case 'carousel':
        return 'Multi-image/video posts that allow for storytelling, step-by-step tutorials, and detailed product showcases. Higher engagement due to swipe interaction.';
      default:
        return 'Standard social media content post.';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Currency Selector */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-bold text-gray-900">Collaboration Pricing</h2>
            <Tooltip content="Estimated pricing ranges for different types of branded content collaborations. Prices are calculated based on engagement rates, follower quality, audience demographics, and market positioning to provide fair market value estimates.">
              <HelpCircle className="w-6 h-6 text-gray-400 hover:text-gray-600 cursor-help" />
            </Tooltip>
          </div>
          
          {/* Currency Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 font-medium">Currency:</span>
            <CurrencySelector 
              selectedCurrency={selectedCurrency}
              onCurrencyChange={setSelectedCurrency}
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-gray-600">Estimated rates for brand collaborations across different content formats</p>
          {selectedCurrency !== 'USD' && (
            <p className="text-xs text-gray-500">
              * Converted from USD at rate: 1 USD = {CURRENCIES[selectedCurrency].rate} {selectedCurrency}
            </p>
          )}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(pricing.post_type).map(([postType, priceData]) => (
          <div key={postType} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                {postType === 'reels' && <Play className="w-8 h-8 text-white" />}
                {postType === 'story' && <Clock className="w-8 h-8 text-white" />}
                {postType === 'static_post' && <Camera className="w-8 h-8 text-white" />}
                {postType === 'carousel' && <Star className="w-8 h-8 text-white" />}
              </div>
              <div className="flex items-center justify-center space-x-2 mb-2">
                <h4 className="text-lg font-semibold capitalize">
                  {postType.replace('_', ' ')}
                </h4>
                <Tooltip content={getPostTypeDescription(postType)}>
                  <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                </Tooltip>
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">
                {formatConvertedCurrency(priceData.price_range.min)} - {formatConvertedCurrency(priceData.price_range.max)}
              </div>
              <p className="text-sm text-gray-600">Per post</p>
              {selectedCurrency !== 'USD' && (
                <p className="text-xs text-gray-500 mt-1">
                  (${priceData.price_range.min} - ${priceData.price_range.max} USD)
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Price Explanations */}
      {price_explanations && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-2 mb-6">
            <h3 className="text-xl font-semibold">Pricing Factors Analysis</h3>
            <Tooltip content="Detailed breakdown of the key factors that influence pricing recommendations. Understanding these factors helps both creators and brands negotiate fair partnerships based on objective data and market standards.">
              <HelpCircle className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-help" />
            </Tooltip>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(price_explanations).map(([factor, data]) => {
              // Get factor-specific tooltip content
              const getFactorTooltip = (factorKey: string) => {
                switch (factorKey) {
                  case 'engagement':
                    return 'Engagement rate quality affects pricing. Higher engagement rates typically command premium pricing as they indicate stronger audience connection and better campaign performance potential.';
                  case 'follower_level':
                    return 'Follower count tier (nano, micro, macro, mega) influences pricing structure. Each tier has different market rates and collaboration expectations in the influencer marketing ecosystem.';
                  case 'audience_location':
                    return 'Geographic distribution of audience affects pricing based on regional purchasing power and market value. Tier 1 markets (US, UK, etc.) typically command higher rates than developing markets.';
                  case 'audience_credibility':
                    return 'Quality and authenticity of followers impacts pricing. Higher credibility scores (more real, active followers) justify premium rates as they deliver better campaign ROI for brands.';
                  default:
                    return 'This factor contributes to the overall pricing calculation based on market standards and performance metrics.';
                }
              };

              return (
                <div key={factor} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium capitalize flex items-center">
                        {factor === 'engagement' && <Zap className="w-4 h-4 mr-2" />}
                        {factor === 'follower_level' && <Users className="w-4 h-4 mr-2" />}
                        {factor === 'audience_location' && <MapPin className="w-4 h-4 mr-2" />}
                        {factor === 'audience_credibility' && <Shield className="w-4 h-4 mr-2" />}
                        {factor.replace('_', ' ')}
                      </h4>
                      <Tooltip content={getFactorTooltip(factor)}>
                        <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                      </Tooltip>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      data.level === 'Very High' ? 'bg-red-100 text-red-800' :
                      data.level === 'High' ? 'bg-orange-100 text-orange-800' :
                      data.level === 'Medium High' ? 'bg-yellow-100 text-yellow-800' :
                      data.level === 'Medium-High' ? 'bg-yellow-100 text-yellow-800' :
                      data.level === 'Micro Influencer' ? 'bg-blue-100 text-blue-800' :
                      data.level === 'Low' ? 'bg-green-100 text-green-800' :
                      data.level === 'Tier 3' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {data.level}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{data.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pricing Recommendations */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center space-x-2 mb-4">
          <h3 className="text-lg font-semibold flex items-center text-blue-800">
            <Info className="w-5 h-5 mr-2" />
            Collaboration Recommendations
          </h3>
          <Tooltip content="Strategic recommendations for successful brand collaborations based on the creator's strengths, audience characteristics, and market positioning. These insights help optimize partnership opportunities and campaign effectiveness.">
            <HelpCircle className="w-5 h-5 text-blue-400 hover:text-blue-600 cursor-help" />
          </Tooltip>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="font-medium text-blue-800">✓ Strengths:</div>
              <Tooltip content="Key advantages and selling points that make this creator attractive for brand partnerships. These strengths can be leveraged to negotiate better rates and secure premium collaborations.">
                <HelpCircle className="w-4 h-4 text-blue-400 hover:text-blue-600 cursor-help" />
              </Tooltip>
            </div>
            <ul className="space-y-1 text-blue-700">
              <li>• High engagement rate ({engagementRate.toFixed(2)}%)</li>
              <li>• Strong audience interaction</li>
              <li>• Consistent content creation</li>
              {isVerified && <li>• Verified account status</li>}
            </ul>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="font-medium text-blue-800">📋 Best For:</div>
              <Tooltip content="Optimal collaboration types and target markets based on audience demographics, interests, and engagement patterns. These recommendations help identify the most suitable brand partnerships for maximum ROI.">
                <HelpCircle className="w-4 h-4 text-blue-400 hover:text-blue-600 cursor-help" />
              </Tooltip>
            </div>
            <ul className="space-y-1 text-blue-700">
              <li>• {topInterests[0]?.name || 'General'} campaigns</li>
              <li>• {location.country || 'Global'} market targeting</li>
              <li>• {ageGroup} demographic</li>
              <li>• Authentic brand partnerships</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Additional Pricing Insights */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center space-x-2 mb-4">
          <h3 className="text-lg font-semibold">Pricing Insights & Tips</h3>
          <Tooltip content="Additional insights and best practices for pricing negotiations and collaboration success. These tips help both creators and brands understand market dynamics and optimize partnership outcomes.">
            <HelpCircle className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-help" />
          </Tooltip>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2 mb-2">
              <h4 className="font-semibold text-green-800">💰 Rate Optimization</h4>
              <Tooltip content="Strategies to maximize collaboration rates through performance improvement, audience growth, and market positioning. Focus on these areas to command higher pricing in future partnerships.">
                <HelpCircle className="w-4 h-4 text-green-600 hover:text-green-800 cursor-help" />
              </Tooltip>
            </div>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Maintain high engagement rates</li>
              <li>• Grow audience quality over quantity</li>
              <li>• Develop niche expertise</li>
              <li>• Showcase successful campaigns</li>
            </ul>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center space-x-2 mb-2">
              <h4 className="font-semibold text-purple-800">🎯 Campaign Types</h4>
              <Tooltip content="Different types of brand collaborations and their typical pricing structures. Understanding these options helps creators diversify income streams and negotiate appropriate rates for various campaign formats.">
                <HelpCircle className="w-4 h-4 text-purple-600 hover:text-purple-800 cursor-help" />
              </Tooltip>
            </div>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Product reviews & unboxings</li>
              <li>• Brand awareness campaigns</li>
              <li>• Seasonal promotions</li>
              <li>• Long-term ambassadorships</li>
            </ul>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center space-x-2 mb-2">
              <h4 className="font-semibold text-orange-800">📊 Performance Metrics</h4>
              <Tooltip content="Key performance indicators that brands typically evaluate when considering collaboration rates. Strong performance in these areas justifies premium pricing and attracts high-quality partnerships.">
                <HelpCircle className="w-4 h-4 text-orange-600 hover:text-orange-800 cursor-help" />
              </Tooltip>
            </div>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• Engagement rate consistency</li>
              <li>• Audience demographic match</li>
              <li>• Content quality standards</li>
              <li>• Brand safety compliance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingSection;