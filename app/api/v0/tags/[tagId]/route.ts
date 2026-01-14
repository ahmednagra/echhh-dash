// src/app/api/v0/tags/[tagId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { updateTagServer, deleteTagServer } from '@/services/tags/tags.server';

interface RouteParams {
  params: Promise<{ tagId: string }>;
}

/**
 * PATCH /api/v0/tags/[tagId]
 * Update a tag
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { tagId } = await params;

    if (!tagId) {
      return NextResponse.json({ error: 'Tag ID is required' }, { status: 400 });
    }

    const authToken = extractBearerToken(request);
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 },
      );
    }

    const body = await request.json();

    if (!body.tag || typeof body.tag !== 'string' || !body.tag.trim()) {
      return NextResponse.json(
        { error: 'Tag name is required and must be a non-empty string' },
        { status: 400 },
      );
    }

    const result = await updateTagServer(
      tagId,
      { tag: body.tag.trim() },
      authToken,
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('❌ API Route: Error updating tag:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * DELETE /api/v0/tags/[tagId]
 * Delete a tag
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { tagId } = await params;

    if (!tagId) {
      return NextResponse.json({ error: 'Tag ID is required' }, { status: 400 });
    }

    const authToken = extractBearerToken(request);
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 },
      );
    }

    const result = await deleteTagServer(tagId, authToken);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('❌ API Route: Error deleting tag:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}