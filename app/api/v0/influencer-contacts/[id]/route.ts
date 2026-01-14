// src/app/api/v0/influencer-contacts/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Contact ID is required' },
        { status: 400 }
      );
    }
    
    const authToken = extractBearerToken(request);
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }
    
    const requestData = await request.json();
    
    // Get backend URL
    const baseUrl = 'http://192.168.18.74:8001';
    const endpoint = `${baseUrl}/api/v0/influencer-contacts/${id}`;

    console.log('Updating contact at:', endpoint);
    console.log('Request data:', requestData);

    // Call backend API
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend API Error:', {
        status: response.status,
        error: errorText
      });
      throw new Error(`Backend API Error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Contact updated successfully');

    return NextResponse.json({ success: true, data: result }, { status: 200 });
    
  } catch (error) {
    console.error('Error updating contact:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Contact ID is required' },
        { status: 400 }
      );
    }
    
    const authToken = extractBearerToken(request);
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }
    
    // Get backend URL
    const baseUrl = 'http://192.168.18.74:8001';
    const endpoint = `${baseUrl}/api/v0/influencer-contacts/${id}`;

    console.log('Deleting contact at:', endpoint);

    // Call backend API
    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend API Error:', {
        status: response.status,
        error: errorText
      });
      throw new Error(`Backend API Error: ${response.status} - ${errorText}`);
    }

    console.log('Contact deleted successfully');

    return NextResponse.json({ success: true }, { status: 200 });
    
  } catch (error) {
    console.error('Error deleting contact:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}