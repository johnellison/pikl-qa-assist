import { NextRequest, NextResponse } from 'next/server';
import { readCalls, getStorageStats } from '@/lib/storage';
import type { ApiResponse, Call } from '@/types';

/**
 * GET /api/calls
 * List all calls with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    let calls = await readCalls();

    // Filter by status
    if (status) {
      calls = calls.filter((call) => call.status === status);
    }

    const total = calls.length;

    // Apply pagination
    const offsetNum = offset ? parseInt(offset, 10) : 0;
    const limitNum = limit ? parseInt(limit, 10) : calls.length;

    calls = calls.slice(offsetNum, offsetNum + limitNum);

    return NextResponse.json<ApiResponse<{ calls: Call[]; total: number }>>(
      {
        success: true,
        data: { calls, total },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error listing calls:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Failed to list calls',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
