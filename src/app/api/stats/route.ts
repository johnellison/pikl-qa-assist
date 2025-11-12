import { NextRequest, NextResponse } from 'next/server';
import { getStorageStats } from '@/lib/storage';
import type { ApiResponse } from '@/types';

/**
 * GET /api/stats
 * Get storage and processing statistics
 */
export async function GET(request: NextRequest) {
  try {
    const stats = await getStorageStats();

    return NextResponse.json<ApiResponse<typeof stats>>(
      {
        success: true,
        data: stats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Failed to fetch statistics',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
