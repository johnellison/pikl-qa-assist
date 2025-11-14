import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

// Admin password for database import
const ADMIN_PASSWORD = 'Pikl what you love 2025!';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const password = formData.get('password') as string;
    const sqlDump = formData.get('sqlDump') as File;

    // Verify admin password
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin password' },
        { status: 401 }
      );
    }

    if (!sqlDump) {
      return NextResponse.json(
        { success: false, error: 'SQL dump file required' },
        { status: 400 }
      );
    }

    // Read SQL dump content
    const sqlContent = await sqlDump.text();

    // Ensure data directory exists
    const dbDir = path.join(process.cwd(), 'data', 'db');
    await mkdir(dbDir, { recursive: true });

    const dbPath = path.join(dbDir, 'qa-assist.db');
    const tempSqlPath = path.join(dbDir, 'import.sql');

    // Save SQL dump to temp file
    await writeFile(tempSqlPath, sqlContent);

    // Remove existing database
    try {
      await execAsync(`rm -f "${dbPath}"`);
    } catch (e) {
      // Database might not exist yet
    }

    // Import SQL dump
    await execAsync(`sqlite3 "${dbPath}" < "${tempSqlPath}"`);

    // Clean up temp file
    await execAsync(`rm -f "${tempSqlPath}"`);

    // Verify import
    const { stdout } = await execAsync(`sqlite3 "${dbPath}" "SELECT COUNT(*) FROM Call;"`);
    const callCount = parseInt(stdout.trim());

    return NextResponse.json({
      success: true,
      message: `Database imported successfully. ${callCount} calls loaded.`,
      callCount,
    });
  } catch (error) {
    console.error('Database import error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to import database',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
