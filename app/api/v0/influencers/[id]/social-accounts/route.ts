// src/app/api/v0/influencers/[id]/social-accounts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { addImportedAccount } from '../../../social-accounts/route';

interface RouteParams {
  params: Promise<{
    id: string; // influencer_id
  }>;
}

// In-memory storage for social accounts (for demo purposes)
let socialAccountsStorage: any[] = [];

// GET /api/v0/influencers/[id]/social-accounts - Get social accounts for specific influencer
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    console.log(`📋 GET /api/v0/influencers/${id}/social-accounts`);

    // Get auth token using the utility function
    const authToken = extractBearerToken(request);
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Filter accounts by influencer ID
    const influencerAccounts = socialAccountsStorage.filter(
      account => account.influencer_id === id
    );

    console.log(`✅ Retrieved ${influencerAccounts.length} social accounts for influencer ${id}`);
    return NextResponse.json({
      success: true,
      accounts: influencerAccounts
    });

  } catch (error) {
    console.error(`💥 Error in GET /api/v0/influencers/[id]/social-accounts:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/v0/influencers/[id]/social-accounts - Create a new social account for influencer
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    console.log(`📝 POST /api/v0/influencers/${id}/social-accounts`);

    // Get auth token using the utility function
    const authToken = extractBearerToken(request);
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'platform_id',
      'platform_account_id',
      'account_handle',
      'full_name'
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create social account with real data from CSV import
    const newAccount = {
      id: `sa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      influencer_id: id,
      platform_id: String(body.platform_id),
      platform_account_id: String(body.platform_account_id),
      account_handle: String(body.account_handle),
      full_name: String(body.full_name),
      profile_pic_url: body.profile_pic_url || null,
      profile_pic_url_hd: body.profile_pic_url_hd || null,
      account_url: body.account_url || null,
      is_private: Boolean(body.is_private),
      is_verified: Boolean(body.is_verified),
      is_business: Boolean(body.is_business),
      media_count: body.media_count || null,
      followers_count: body.followers_count || null,
      following_count: body.following_count || null,
      subscribers_count: body.subscribers_count || null,
      likes_count: body.likes_count || null,
      biography: body.biography || null,
      has_highlight_reels: Boolean(body.has_highlight_reels),
      category_id: body.category_id || null,
      has_clips: Boolean(body.has_clips),
      platform: {
        id: String(body.platform_id),
        name: body.platform_id === '2' ? 'YouTube' : body.platform_id === '3' ? 'TikTok' : 'Instagram'
      },
      created_at: new Date().toISOString(),
      additional_metrics: body.additional_metrics || {}
    };

    // Store in local memory
    socialAccountsStorage.push(newAccount);

    // Also add to the shared storage for the main social-accounts endpoint
    try {
      addImportedAccount(newAccount);
      console.log('✅ Added account to shared storage for main endpoint');
    } catch (error) {
      console.warn('⚠️ Could not add to shared storage:', error);
      // Continue anyway - the account is still stored locally
    }

    // Log the fields being created with real data
    console.log('📊 Real social account created from CSV import:', {
      id: newAccount.id,
      influencer_id: newAccount.influencer_id,
      platform_id: newAccount.platform_id,
      account_handle: newAccount.account_handle,
      full_name: newAccount.full_name,
      followers_count: newAccount.followers_count,
      is_verified: newAccount.is_verified,
      engagement_rate: newAccount.additional_metrics?.engagement_rate,
      profile_pic_url: newAccount.profile_pic_url ? 'provided' : 'not provided',
      biography: newAccount.biography ? 'provided' : 'not provided',
      source: newAccount.additional_metrics?.csv_data?.source || 'unknown'
    });

    console.log('✅ Social account created successfully for influencer:', id);
    return NextResponse.json({
      success: true,
      account: newAccount
    }, { status: 201 });

  } catch (error) {
    console.error(`💥 Error in POST /api/v0/influencers/[id]/social-accounts:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}