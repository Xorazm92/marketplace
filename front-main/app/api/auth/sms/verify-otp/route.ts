import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { phoneNumber, otp } = await request.json();
    
    if (!phoneNumber || !otp) {
      return NextResponse.json(
        { error: 'Phone number and OTP are required' },
        { status: 400 }
      );
    }

    // In a real app, you would call your backend to verify the OTP
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/sms/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber, otp }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to verify OTP');
    }
    
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
