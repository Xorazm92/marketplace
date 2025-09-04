import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { JWT } from 'next-auth/jwt';

// Extend the default session and JWT types to include our custom fields
declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    error?: string;
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
  
  interface User {
    id?: string | number;
    email?: string | null;
    name?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    image?: string | null;
    profile_img?: string | null;
    accessToken?: string;
    refreshToken?: string;
    expires_in?: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
    user?: {
      id: string;
      email: string;
      name: string;
      image: string | null;
    };
  }
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/admin/sign-in`, {
            method: 'POST',
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
            headers: { 'Content-Type': 'application/json' },
          });

          const data = await res.json();

          if (res.ok && data.success) {
            return {
              ...data.data.user,
              accessToken: data.data.access_token,
              refreshToken: data.data.refresh_token,
            };
          }
          return null;
        } catch (error) {
          console.error('Authorization error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user, account }: { token: JWT; user?: any; account?: any }) {
      // Initial sign in
      if (account && user) {
        const userData = {
          id: 'id' in user ? String(user.id) : token.user?.id || '',
          email: 'email' in user ? String(user.email || '') : token.user?.email || '',
          name: 'name' in user ? String(user.name || '') : 
                ('first_name' in user || 'last_name' in user) ? 
                  `${user.first_name || ''} ${user.last_name || ''}`.trim() : 
                  token.user?.name || '',
          image: 'image' in user ? String(user.image || '') : 
                 'profile_img' in user ? String(user.profile_img || '') : 
                 token.user?.image || null,
        };

        return {
          ...token,
          accessToken: 'accessToken' in user ? String(user.accessToken) : token.accessToken || '',
          refreshToken: 'refreshToken' in user ? String(user.refreshToken) : token.refreshToken || '',
          accessTokenExpires: Date.now() + ('expires_in' in user ? Number(user.expires_in) : 60) * 1000,
          user: userData,
        };
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Access token has expired, try to refresh it
      return refreshAccessToken(token);
    },
    async session({ session, token }: { session: any; token: JWT }) {
      // Send properties to the client
      session.user = token.user || session.user;
      session.accessToken = token.accessToken;
      session.error = token.error;
      
      return session;
    },
  },
  pages: {
    signIn: '/UserLoginPage',
    error: '/UserLoginPage',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

interface RefreshTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  user?: {
    id?: string;
    email?: string;
    name?: string;
    image?: string | null;
  };
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    if (!token.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: token.refreshToken,
      }),
    });

    const refreshedTokens: RefreshTokenResponse = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    const updatedToken: JWT = { ...token };
    
    if (refreshedTokens.access_token) {
      updatedToken.accessToken = refreshedTokens.access_token;
    }
    
    if (refreshedTokens.refresh_token) {
      updatedToken.refreshToken = refreshedTokens.refresh_token;
    }
    
    updatedToken.accessTokenExpires = Date.now() + (refreshedTokens.expires_in || 60) * 1000;
    
    if (refreshedTokens.user && token.user) {
      updatedToken.user = {
        id: refreshedTokens.user.id || token.user.id,
        email: refreshedTokens.user.email || token.user.email,
        name: refreshedTokens.user.name || token.user.name,
        image: refreshedTokens.user.image !== undefined ? refreshedTokens.user.image : token.user.image,
      };
    }

    return updatedToken;
  } catch (error) {
    console.error('Error refreshing access token', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

const handler = NextAuth(authOptions as any);

export { handler as GET, handler as POST };
