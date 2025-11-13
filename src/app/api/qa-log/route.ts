import { NextRequest, NextResponse } from 'next/server';
import { readQALog, filterQALog, syncQALog } from '@/lib/qa-log-service';
import { readCalls } from '@/lib/storage';
import type { QALogFilters } from '@/types/qa-log';

/**
 * GET /api/qa-log
 * Retrieve QA Log entries with optional filtering
 *
 * Query params:
 * - startDate: ISO date string
 * - endDate: ISO date string
 * - agentId: string
 * - agentName: string (partial match)
 * - callType: CallType
 * - complianceStatus: "pass" | "fail"
 * - internalScore: 1 | 2 | 3 | 4 | 5
 * - actionRequired: "true" | "false"
 * - status: "open" | "closed"
 * - sync: "true" to sync with calls before returning
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Check if sync requested
    const shouldSync = searchParams.get('sync') === 'true';
    if (shouldSync) {
      const calls = await readCalls();
      await syncQALog(calls);
    }

    // Read QA Log
    const entries = await readQALog();

    // Build filters
    const filters: QALogFilters = {};

    if (searchParams.has('startDate')) {
      filters.startDate = searchParams.get('startDate')!;
    }
    if (searchParams.has('endDate')) {
      filters.endDate = searchParams.get('endDate')!;
    }
    if (searchParams.has('agentId')) {
      filters.agentId = searchParams.get('agentId')!;
    }
    if (searchParams.has('agentName')) {
      filters.agentName = searchParams.get('agentName')!;
    }
    if (searchParams.has('auditorName')) {
      filters.auditorName = searchParams.get('auditorName')!;
    }
    if (searchParams.has('callType')) {
      filters.callType = searchParams.get('callType') as any;
    }
    if (searchParams.has('complianceStatus')) {
      filters.complianceStatus = searchParams.get('complianceStatus') as 'pass' | 'fail';
    }
    if (searchParams.has('internalScore')) {
      filters.internalScore = parseInt(searchParams.get('internalScore')!) as 1 | 2 | 3 | 4 | 5;
    }
    if (searchParams.has('actionRequired')) {
      filters.actionRequired = searchParams.get('actionRequired') === 'true';
    }
    if (searchParams.has('status')) {
      filters.status = searchParams.get('status') as 'open' | 'closed';
    }

    // Apply filters
    const filteredEntries = filterQALog(entries, filters);

    return NextResponse.json({
      success: true,
      data: {
        entries: filteredEntries,
        total: filteredEntries.length,
        filters,
      },
    });
  } catch (error) {
    console.error('Error fetching QA Log:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch QA Log',
      },
      { status: 500 }
    );
  }
}
