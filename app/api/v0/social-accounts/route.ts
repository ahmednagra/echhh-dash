// src/app/api/v0/social-accounts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';

// Mock data for testing with realistic data
const mockSocialAccounts = [
  {
    id: '1',
    influencer_id: 'inf_1',
    platform_id: '1',
    platform_account_id: 'ig_123456',
    account_handle: 'johndoe',
    full_name: 'John Doe',
    profile_pic_url: 'https://picsum.photos/200/200?random=1',
    profile_pic_url_hd: 'https://picsum.photos/400/400?random=1',
    account_url: 'https://instagram.com/johndoe',
    is_private: false,
    is_verified: true,
    is_business: false,
    media_count: 150,
    followers_count: 25000,
    following_count: 500,
    subscribers_count: null,
    likes_count: null,
    biography: 'Content creator and photographer 📸 Living my best life ✨',
    has_highlight_reels: true,
    category_id: null,
    has_clips: false,
    platform: {
      id: '1',
      name: 'Instagram'
    },
    created_at: '2024-01-15T10:30:00Z',
    additional_metrics: {
      engagement_rate: 4.2,
      average_likes: 1200
    }
  },
  {
    id: '2',
    influencer_id: 'inf_2',
    platform_id: '2',
    platform_account_id: 'yt_789012',
    account_handle: 'janesmith',
    full_name: 'Jane Smith',
    profile_pic_url: 'https://picsum.photos/200/200?random=2',
    profile_pic_url_hd: 'https://picsum.photos/400/400?random=2',
    account_url: 'https://youtube.com/@janesmith',
    is_private: false,
    is_verified: false,
    is_business: true,
    media_count: 89,
    followers_count: 15000,
    following_count: 200,
    subscribers_count: 15000,
    likes_count: null,
    biography: 'Tech reviewer and educator 💻 Helping you make better tech decisions',
    has_highlight_reels: false,
    category_id: null,
    has_clips: true,
    platform: {
      id: '2',
      name: 'YouTube'
    },
    created_at: '2024-02-20T14:15:00Z',
    additional_metrics: {
      engagement_rate: 6.8,
      average_likes: 850,
      average_views: 5500
    }
  },
  {
    id: '3',
    influencer_id: 'inf_3',
    platform_id: '3',
    platform_account_id: 'tt_345678',
    account_handle: 'mikecreator',
    full_name: 'Mike Creator',
    profile_pic_url: 'https://picsum.photos/200/200?random=3',
    profile_pic_url_hd: 'https://picsum.photos/400/400?random=3',
    account_url: 'https://tiktok.com/@mikecreator',
    is_private: false,
    is_verified: true,
    is_business: false,
    media_count: 200,
    followers_count: 50000,
    following_count: 150,
    subscribers_count: null,
    likes_count: 125000,
    biography: 'Comedy and lifestyle content 😂 Making your day brighter!',
    has_highlight_reels: false,
    category_id: null,
    has_clips: true,
    platform: {
      id: '3',
      name: 'TikTok'
    },
    created_at: '2024-03-10T09:45:00Z',
    additional_metrics: {
      engagement_rate: 8.5,
      average_likes: 2500
    }
  }
];

// In-memory storage for imported accounts (shared across the application)
let importedAccountsFromCSV: any[] = [];

// GET /api/v0/social-accounts - Get all social accounts
export async function GET(request: NextRequest) {
  try {
    console.log('📋 GET /api/v0/social-accounts - Mock API called');

    // Get auth token using the utility function
    const authToken = extractBearerToken(request);
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '20');
    const search = searchParams.get('search')?.toLowerCase();
    const platformId = searchParams.get('platform_id');

    console.log('🔍 Query params:', { page, pageSize, search, platformId });

    // Combine mock data with imported data from CSV
    const allAccounts = [...mockSocialAccounts, ...importedAccountsFromCSV];

    console.log('📊 Total accounts available:', {
      mock: mockSocialAccounts.length,
      imported: importedAccountsFromCSV.length,
      total: allAccounts.length
    });

    // Filter accounts based on search and platform
    let filteredAccounts = allAccounts;

    if (search) {
      filteredAccounts = filteredAccounts.filter(account => 
        account.account_handle.toLowerCase().includes(search) ||
        account.full_name.toLowerCase().includes(search)
      );
    }

    if (platformId) {
      filteredAccounts = filteredAccounts.filter(account => 
        account.platform_id === platformId
      );
    }

    // Pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedAccounts = filteredAccounts.slice(startIndex, endIndex);

    const totalItems = filteredAccounts.length;
    const totalPages = Math.ceil(totalItems / pageSize);

    const response = {
      success: true,
      accounts: paginatedAccounts,
      pagination: {
        page,
        page_size: pageSize,
        total_items: totalItems,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_previous: page > 1
      }
    };

    console.log('✅ Returning social accounts:', {
      total: totalItems,
      page,
      accounts: paginatedAccounts.length,
      accountNames: paginatedAccounts.map(a => a.account_handle)
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('💥 Error in GET /api/v0/social-accounts:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      accounts: [],
      pagination: {
        page: 1,
        page_size: 20,
        total_items: 0,
        total_pages: 0,
        has_next: false,
        has_previous: false
      }
    }, { status: 500 });
  }
}

// Function to add imported account to storage (called from social-accounts creation)
export function addImportedAccount(account: any) {
  console.log('📝 Adding imported account to storage:', account.account_handle);
  importedAccountsFromCSV.push(account);
  console.log('📊 Total imported accounts now:', importedAccountsFromCSV.length);
}

// Function to get imported accounts (for external use)
export function getImportedAccounts() {
  return importedAccountsFromCSV;
}

// POST /api/v0/social-accounts - Add new social accounts (for testing CSV import)
export async function POST(request: NextRequest) {
  try {
    console.log('📝 POST /api/v0/social-accounts - Mock import called');

    // Get auth token using the utility function
    const authToken = extractBearerToken(request);
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('📊 Import request body:', body);

    // Generate realistic data for imported accounts
    const platformId = String(body.platform_id || '1');
    const username = String(body.username || 'unknown_user').replace(/^@/, '');
    const fullname = String(body.fullname || body.username || 'Unknown User');
    const email = String(body.email || '');
    const phone = String(body.phone || '');
    
    // Generate realistic follower counts based on platform
    const generateFollowerCount = () => {
      const base = Math.floor(Math.random() * 100000) + 1000; // 1K to 100K base
      return Math.floor(base * (Math.random() * 5 + 1)); // Multiply by 1-6 for variety
    };

    const followerCount = generateFollowerCount();
    const engagementRate = Math.random() * 8 + 1; // 1-9%
    const avgLikes = Math.floor(followerCount * (engagementRate / 100));
    
    // Create realistic biography
    const biographies = [
      `${fullname} • Content Creator 📸`,
      `Living my best life ✨ • ${fullname}`,
      `Digital creator sharing daily moments 🌟`,
      `${fullname} • Lifestyle & Travel 🌍`,
      `Creating content that inspires ✨ • ${fullname}`,
      `${fullname} • Entrepreneur & Influencer 💼`,
      `Making memories & sharing stories 📖`
    ];
    const randomBio = biographies[Math.floor(Math.random() * biographies.length)];

    const newAccount = {
      id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      influencer_id: `inf_${Date.now()}`,
      platform_id: platformId,
      platform_account_id: `${platformId}_${Date.now()}`,
      account_handle: username,
      full_name: fullname,
      profile_pic_url: `https://picsum.photos/200/200?random=${Date.now()}`,
      profile_pic_url_hd: `https://picsum.photos/400/400?random=${Date.now()}`,
      account_url: platformId === '2' 
        ? `https://youtube.com/@${username}` 
        : platformId === '3' 
        ? `https://tiktok.com/@${username}` 
        : `https://instagram.com/${username}`,
      is_private: false,
      is_verified: Math.random() > 0.7, // 30% chance of being verified
      is_business: Math.random() > 0.6, // 40% chance of being business
      media_count: Math.floor(Math.random() * 300) + 20, // 20-320 posts
      followers_count: followerCount,
      following_count: Math.floor(Math.random() * 2000) + 100, // 100-2100 following
      subscribers_count: platformId === '2' ? followerCount : null, // Only for YouTube
      likes_count: platformId === '3' ? Math.floor(avgLikes * 10) : null, // Only for TikTok
      biography: randomBio,
      has_highlight_reels: platformId === '1' && Math.random() > 0.5, // Only Instagram, 50% chance
      category_id: null,
      has_clips: platformId !== '1' && Math.random() > 0.3, // Not Instagram, 70% chance
      platform: {
        id: platformId,
        name: platformId === '2' ? 'YouTube' : platformId === '3' ? 'TikTok' : 'Instagram'
      },
      created_at: new Date().toISOString(),
      additional_metrics: {
        engagement_rate: parseFloat(engagementRate.toFixed(2)),
        average_likes: avgLikes,
        ...(platformId === '2' && { average_views: Math.floor(avgLikes * 3) }), // YouTube gets views
        source: 'csv_import',
        import_date: new Date().toISOString(),
        csv_data: {
          email: email || null,
          phone: phone || null
        }
      }
    };

    // Add to imported accounts storage
    addImportedAccount(newAccount);

    console.log('✅ Mock account added:', {
      username: newAccount.account_handle,
      fullname: newAccount.full_name,
      platform: newAccount.platform.name,
      followers: newAccount.followers_count,
      engagement: newAccount.additional_metrics.engagement_rate
    });

    return NextResponse.json({
      success: true,
      account: newAccount
    }, { status: 201 });

  } catch (error) {
    console.error('💥 Error in POST /api/v0/social-accounts:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to add account'
    }, { status: 500 });
  }
}