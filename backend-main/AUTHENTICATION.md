# Authentication System

This document outlines the authentication system implemented in the marketplace application.

## Overview

The authentication system supports multiple authentication providers:
- **SMS/Phone Authentication**: Users can sign in using their phone number with OTP verification
- **Google OAuth**: Users can sign in with their Google account
- **Telegram Login**: Users can sign in using their Telegram account

## Backend Architecture

### Key Components

1. **UnifiedAuthService**: Central service handling all authentication providers
2. **AuthMethod Model**: Stores user authentication methods in the database
3. **JWT Strategy**: Handles token-based authentication
4. **Guards**: Protect routes based on authentication status and permissions

### Database Schema

```prisma
model User {
  id             Int          @id @default(autoincrement())
  phone_number   String?      @unique
  email          String?      @unique
  first_name     String
  last_name      String
  profile_img    String?
  is_active      Boolean      @default(true)
  is_verified    Boolean      @default(false)
  last_online    DateTime     @default(now())
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  authMethods    AuthMethod[]
}

model AuthMethod {
  id             Int      @id @default(autoincrement())
  userId         Int
  provider       String   // 'sms', 'google', 'telegram'
  providerId     String?  // External ID from provider
  passwordHash   String?  // For SMS/password auth
  refreshToken   String?  @db.Text
  isPrimary      Boolean  @default(false)
  lastUsed       DateTime @default(now())
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  user           User     @relation(fields: [userId], references: [id])

  @@unique([userId, provider])
}
```

## API Endpoints

### SMS Authentication

- `POST /auth/sms/send-otp`: Send OTP to phone number
- `POST /auth/sms/verify-otp`: Verify OTP and authenticate user

### Google OAuth

- `GET /auth/google`: Initiate Google OAuth flow
- `GET /auth/google/callback`: Google OAuth callback

### Telegram Login

- `POST /auth/telegram/login`: Authenticate with Telegram
- `GET /auth/telegram/bot-username`: Get Telegram bot username

### Common

- `POST /auth/refresh-token`: Refresh access token
- `POST /auth/logout`: Log out user

## Frontend Implementation

The frontend provides a unified login interface with multiple authentication options:

1. **Phone Login**: Users can enter their phone number to receive an OTP
2. **Google Sign-In**: Button to sign in with Google
3. **Telegram Login**: Button to sign in with Telegram

## Environment Variables

### Backend

```
# JWT
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_OTP_SECRET=your_otp_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=your_callback_url

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_BOT_USERNAME=your_bot_username
TELEGRAM_AUTH_EXPIRATION=86400  # 24 hours

# SMS (if using a provider)
SMS_API_KEY=your_sms_api_key
SMS_API_SECRET=your_sms_api_secret
SMS_FROM=your_sender_id
```

### Frontend

```
# API
NEXT_PUBLIC_API_URL=http://localhost:3001

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=your_telegram_bot_username
```

## Security Considerations

1. **Token Security**:
   - Access tokens have a short expiry (15 minutes)
   - Refresh tokens are securely stored in HTTP-only cookies
   - Tokens are signed with strong secrets

2. **Rate Limiting**:
   - Implement rate limiting on authentication endpoints
   - Limit OTP attempts

3. **Data Validation**:
   - All user inputs are validated
   - SQL injection prevention with parameterized queries

4. **HTTPS**:
   - Always use HTTPS in production
   - Enable HSTS

## Testing

To test the authentication system:

1. Start the backend server:
   ```bash
   cd backend-main
   npm run start:dev
   ```

2. Start the frontend:
   ```bash
   cd front-main
   npm run dev
   ```

3. Access the login page at `http://localhost:3000/login`

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure CORS is properly configured on the backend
2. **Invalid Tokens**: Verify token secrets match between services
3. **Database Connection**: Check database connection strings and migrations

## Future Improvements

1. Implement passwordless email authentication
2. Add two-factor authentication
3. Support more social login providers (Facebook, Apple, etc.)
4. Implement account linking between different auth methods
5. Add more comprehensive logging and monitoring

## License

[Your License Here]
