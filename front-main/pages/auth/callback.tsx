import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../store/features/authSlice';
import { toast } from 'react-toastify';
import styles from './callback.module.scss';

const AuthCallback = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { token, refresh, user, error: authError } = router.query;

        if (authError) {
          setError('Google orqali kirish muvaffaqiyatsiz tugadi');
          toast.error('Google orqali kirish muvaffaqiyatsiz tugadi');
          setTimeout(() => router.push('/login'), 3000);
          return;
        }

        if (token && refresh && user) {
          // Save tokens to localStorage
          localStorage.setItem('accessToken', token as string);
          localStorage.setItem('refreshToken', refresh as string);
          
          // Parse user data
          const userData = JSON.parse(decodeURIComponent(user as string));
          
          // Update Redux store
          dispatch(loginSuccess({
            id: userData.id,
            phone_number: userData.phone_number || '',
            full_name: `${userData.first_name} ${userData.last_name}`,
            email: userData.email,
            profile_img: userData.profile_img,
            is_active: userData.is_active
          }));

          toast.success('Google orqali muvaffaqiyatli kirdingiz!');
          
          // Redirect to home page
          router.push('/');
        } else {
          setError('Noto\'g\'ri callback ma\'lumotlari');
          setTimeout(() => router.push('/login'), 3000);
        }
      } catch (err) {
        console.error('Callback processing error:', err);
        setError('Xatolik yuz berdi');
        setTimeout(() => router.push('/login'), 3000);
      } finally {
        setLoading(false);
      }
    };

    if (router.isReady) {
      handleCallback();
    }
  }, [router.isReady, router.query, dispatch]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <h2>Google orqali kirish...</h2>
          <p>Iltimos, kuting...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>❌</div>
          <h2>Xatolik yuz berdi</h2>
          <p>{error}</p>
          <p>Siz login sahifasiga yo'naltirilasiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.successContainer}>
        <div className={styles.successIcon}>✅</div>
        <h2>Muvaffaqiyatli!</h2>
        <p>Siz asosiy sahifaga yo'naltirilasiz...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
