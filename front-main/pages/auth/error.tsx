import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function AuthErrorPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const message = router.query.message as string;
    const error = router.query.error as string;
    
    if (message) {
      setErrorMessage(decodeURIComponent(message));
    } else if (error) {
      switch (error) {
        case 'access_denied':
          setErrorMessage('Siz Google hisobi orqali kirishni bekor qildingiz.');
          break;
        case 'invalid_request':
          setErrorMessage('Noto\'g\'ri so\'rov yuborildi.');
          break;
        case 'server_error':
          setErrorMessage('Server xatosi yuz berdi. Iltimos, keyinroq qaytadan urinib ko\'ring.');
          break;
        default:
          setErrorMessage('Autentifikatsiyada xatolik yuz berdi.');
      }
    } else {
      setErrorMessage('Noma\'lum xatolik yuz berdi.');
    }
  }, [router.query]);

  const handleRetry = () => {
    router.push('/login');
  };

  const handleHome = () => {
    router.push('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-md">
        <div className="text-center space-y-4">
          {/* Error Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          {/* Error Title */}
          <h1 className="text-2xl font-bold text-gray-900">
            Autentifikatsiya xatosi
          </h1>

          {/* Error Message */}
          <p className="text-red-600 text-sm">
            {errorMessage}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3 pt-4">
            <button
              onClick={handleRetry}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Qaytadan urinish
            </button>
            
            <button
              onClick={handleHome}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Bosh sahifaga qaytish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
