import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // In a real app, you might want to fetch this from your backend or environment variables
    const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'your_telegram_bot_username';
    
    return NextResponse.json({ username: botUsername });
  } catch (error) {
    console.error('Error fetching Telegram bot username:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Telegram bot username' },
      { status: 500 }
    );
  }
}
