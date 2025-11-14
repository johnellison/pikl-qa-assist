import { NextRequest, NextResponse } from 'next/server';
import { updateQALogEntry } from '@/lib/qa-log-service';
import type { QALogUpdatePayload } from '@/types/qa-log';

/**
 * PATCH /api/qa-log/[qaNumber]
 * Update manual fields in a QA Log entry
 *
 * Body:
 * {
 *   mainFeedbackArea?: string;
 *   actionRequired?: boolean;
 *   actionTaken?: string | null;
 *   dateClosed?: string | null;
 * }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ qaNumber: string }> }
) {
  try {
    const { qaNumber } = await params;
    const body = await request.json();
    const updates: QALogUpdatePayload = {};

    // Validate and extract allowed fields
    if (body.mainFeedbackArea !== undefined) {
      updates.mainFeedbackArea = body.mainFeedbackArea;
    }
    if (body.actionRequired !== undefined) {
      updates.actionRequired = body.actionRequired;
    }
    if (body.actionTaken !== undefined) {
      updates.actionTaken = body.actionTaken;
    }
    if (body.dateClosed !== undefined) {
      updates.dateClosed = body.dateClosed;
    }

    // Update entry
    const updatedEntry = await updateQALogEntry(qaNumber, updates, 'user');

    if (!updatedEntry) {
      return NextResponse.json(
        {
          success: false,
          error: 'QA Log entry not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedEntry,
    });
  } catch (error) {
    console.error('Error updating QA Log entry:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update QA Log entry',
      },
      { status: 500 }
    );
  }
}
