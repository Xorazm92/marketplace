import { NextResponse } from 'next/server';

interface TelegramUserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export async function POST(request: Request) {
  try {
    const userData: TelegramUserData = await request.json();
    
    // In a real app, you would verify the Telegram data here
    // and exchange it for a JWT token from your backend
    
    // For now, we'll just forward the data to the backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/telegram/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to authenticate with Telegram');
    }
    
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Telegram login error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to authenticate with Telegram' },
      { status: 500 }
    );
  }
}
