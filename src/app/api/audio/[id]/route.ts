import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { readCalls } from '@/lib/storage';

/**
 * GET /api/audio/[id]
 * Serves the audio file for a given call ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get call data to find the filename
    const calls = await readCalls();
    const call = calls.find((c) => c.id === id);

    if (!call || !call.filename) {
      return NextResponse.json(
        { error: 'Call not found or no audio file' },
        { status: 404 }
      );
    }

    // Construct the file path
    const uploadsDir = path.join(process.cwd(), 'data', 'uploads');
    const filePath = path.join(uploadsDir, call.filename);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json(
        { error: 'Audio file not found' },
        { status: 404 }
      );
    }

    // Read the file
    const fileBuffer = await fs.readFile(filePath);

    // Determine content type based on file extension
    const ext = path.extname(call.filename).toLowerCase();
    let contentType = 'audio/wav';
    if (ext === '.mp3') contentType = 'audio/mpeg';
    if (ext === '.m4a') contentType = 'audio/mp4';
    if (ext === '.ogg') contentType = 'audio/ogg';

    // Return the audio file with appropriate headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    });
  } catch (error) {
    console.error('[API] Error serving audio:', error);
    return NextResponse.json(
      { error: 'Failed to serve audio file' },
      { status: 500 }
    );
  }
}
