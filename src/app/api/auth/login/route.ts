import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const CORRECT_PASSWORD = 'Pikl what you love 2025!';
const AUTH_COOKIE_NAME = 'pikl-qa-auth';
const AUTH_TOKEN = 'authenticated-pikl-2025';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (password === CORRECT_PASSWORD) {
      // Set authentication cookie (expires in 7 days)
      const cookieStore = await cookies();
      cookieStore.set(AUTH_COOKIE_NAME, AUTH_TOKEN, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
