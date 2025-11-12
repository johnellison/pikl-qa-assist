import { NextRequest, NextResponse } from 'next/server';
import { getCompleteCallData, deleteCall as deleteCallFromStorage } from '@/lib/storage';
import type { ApiResponse } from '@/types';

/**
 * GET /api/calls/[id]
 * Get complete call data including transcript and analysis
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), 5000)
    );

    const data = await Promise.race([
      getCompleteCallData(id),
      timeoutPromise
    ]) as Awaited<ReturnType<typeof getCompleteCallData>>;

    if (!data.call) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Call not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<typeof data>>(
      {
        success: true,
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    // Don't log ENOENT errors as 500s - these are expected during polling
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.error(`[API] Error fetching call:`, error);
    }

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Failed to fetch call',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/calls/[id]
 * Delete a call and all associated data
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteCallFromStorage(id);

    if (!success) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Failed to delete call',
        },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<{ deleted: boolean }>>(
      {
        success: true,
        data: { deleted: true },
        message: 'Call deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting call:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Failed to delete call',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
