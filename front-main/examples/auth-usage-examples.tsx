import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { loginWithTelegram, loginWithGoogle, loginWithSMS } from '../endpoints/auth-providers';
import { getAccessToken, getUserData, isAuthenticated } from '../utils/auth-helper';

// ===================================
// 1. TELEGRAM LOGIN EXAMPLE
// ===================================
const TelegramLoginExample = () => {
  const handleTelegramLogin = async (telegramData: any) => {
    try {
      // Telegram Login
      const result = await loginWithTelegram(telegramData);
      console.log('Telegram login result:', result);
      
      // Tokens automatically saved to localStorage:
      // - accessToken
      // - refreshToken  
      // - user_data
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Telegram login error:', error);
    }
  };

  return (
    <div>
      {/* Telegram widget will call this function */}
      <script>
        {`window.onTelegramAuth = ${handleTelegramLogin.toString()}`}
      </script>
    </div>
  );
};

// ===================================
// 2. GOOGLE LOGIN EXAMPLE
// ===================================
const GoogleLoginExample = () => {
  const handleGoogleLogin = () => {
    // Google Login - redirects to Google OAuth
    loginWithGoogle();
  };

  return (
    <button onClick={handleGoogleLogin}>
      Google orqali kirish
    </button>
  );
};

// ===================================
// 3. SMS LOGIN EXAMPLE
// ===================================
const SMSLoginExample = () => {
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [code, setCode] = React.useState('');

  const handleSMSLogin = async () => {
    try {
      // SMS Login
      const result = await loginWithSMS(phoneNumber, code);
      console.log('SMS login result:', result);
      
      // Tokens automatically saved to localStorage
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('SMS login error:', error);
    }
  };

  return (
    <div>
      <input 
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        placeholder="Telefon raqam"
      />
      <input 
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="SMS kod"
      />
      <button onClick={handleSMSLogin}>
        SMS orqali kirish
      </button>
    </div>
  );
};

// ===================================
// 4. TOKEN USAGE EXAMPLE
// ===================================
const TokenUsageExample = () => {
  React.useEffect(() => {
    // Usage in API calls:
    const token = localStorage.getItem('accessToken');
    
    // Or using helper function:
    const tokenFromHelper = getAccessToken();
    
    // Make authenticated API request
    fetch('/api/protected-endpoint', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }, []);

  return <div>Check console for token usage</div>;
};

// ===================================
// 5. AUTH HOOK USAGE EXAMPLE
// ===================================
const AuthHookExample = () => {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    loginTelegram, 
    loginGoogle, 
    loginSMS, 
    logout 
  } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return (
      <div>
        <h2>Xush kelibsiz, {user?.firstName}!</h2>
        <p>Provider: {user?.provider}</p>
        <button onClick={logout}>Chiqish</button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => loginGoogle()}>
        Google orqali kirish
      </button>
      
      <button onClick={() => loginSMS('+998901234567', '123456')}>
        SMS orqali kirish
      </button>
      
      {/* Telegram login via component */}
    </div>
  );
};

// ===================================
// 6. PROTECTED ROUTE EXAMPLE
// ===================================
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // Redirect to login
    window.location.href = '/login';
    return null;
  }

  return <>{children}</>;
};

// ===================================
// 7. API REQUEST WITH AUTH EXAMPLE
// ===================================
const AuthenticatedAPIExample = () => {
  const makeAuthenticatedRequest = async () => {
    const token = getAccessToken();
    
    if (!token) {
      console.error('No token found');
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/protected-endpoint', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('API response:', data);
      } else {
        console.error('API request failed:', response.status);
      }
    } catch (error) {
      console.error('API request error:', error);
    }
  };

  return (
    <button onClick={makeAuthenticatedRequest}>
      Make Authenticated Request
    </button>
  );
};

// ===================================
// 8. COMPLETE LOGIN PAGE EXAMPLE
// ===================================
const CompleteLoginPage = () => {
  const { isAuthenticated, loginSMS } = useAuth();
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [smsCode, setSmsCode] = React.useState('');

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/dashboard';
    }
  }, [isAuthenticated]);

  const handleTelegramSuccess = (userData: any) => {
    console.log('Telegram login successful:', userData);
    window.location.href = '/dashboard';
  };

  const handleGoogleLogin = () => {
    loginWithGoogle();
  };

  const handleSMSSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginSMS(phoneNumber, smsCode);
      window.location.href = '/dashboard';
    } catch (error) {
      alert('SMS login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Kirish</h1>
      
      {/* Google Login */}
      <button 
        onClick={handleGoogleLogin}
        className="w-full mb-4 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
      >
        Google orqali kirish
      </button>

      {/* Telegram Login */}
      <div className="mb-4">
        <div id="telegram-login-container"></div>
      </div>

      {/* SMS Login */}
      <form onSubmit={handleSMSSubmit} className="space-y-4">
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Telefon raqam"
          className="w-full px-3 py-2 border rounded"
          required
        />
        <input
          type="text"
          value={smsCode}
          onChange={(e) => setSmsCode(e.target.value)}
          placeholder="SMS kod"
          className="w-full px-3 py-2 border rounded"
          required
        />
        <button 
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          SMS orqali kirish
        </button>
      </form>
    </div>
  );
};

export {
  TelegramLoginExample,
  GoogleLoginExample,
  SMSLoginExample,
  TokenUsageExample,
  AuthHookExample,
  ProtectedRoute,
  AuthenticatedAPIExample,
  CompleteLoginPage
};
