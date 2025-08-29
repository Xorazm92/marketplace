import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import styles from '../../styles/AdminAuth.module.scss';

interface LoginFormData {
  phone_number: string;
  password: string;
}



const AdminLogin: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  // Admin login faqat parol bilan

  const [loginForm, setLoginForm] = useState<LoginFormData>({
    phone_number: '',
    password: ''
  });



  // Telefon raqam formatini tekshirish
  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // If starts with 998, add +
    if (digits.startsWith('998')) {
      return '+' + digits;
    }
    
    // If starts with 9, add +998
    if (digits.startsWith('9') && digits.length === 9) {
      return '+998' + digits;
    }
    
    return phone;
  };

  // Parol bilan kirish
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formattedPhone = formatPhoneNumber(loginForm.phone_number);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/admin/auth/phone-signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: formattedPhone,
          password: loginForm.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Token'ni localStorage'ga saqlash
        localStorage.setItem('admin_access_token', data.access_token);
        localStorage.setItem('admin_user', JSON.stringify(data.admin));
        
        toast.success('Muvaffaqiyatli tizimga kirdingiz!');
        router.push('/admin');
      } else {
        toast.error(data.message || 'Kirish xatosi');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Tizimda xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };





  return (
    <>
      <Head>
        <title>Admin Kirish - INBOLA</title>
        <meta name="description" content="INBOLA admin panelga kirish" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <h1>Admin Panel</h1>
            <p>INBOLA boshqaruv tizimiga kirish</p>
          </div>

          {/* Admin login faqat parol bilan */}

          <form onSubmit={handlePasswordLogin} className={styles.authForm}>
              <div className={styles.formGroup}>
                <label htmlFor="phone">Telefon raqam</label>
                <input
                  type="tel"
                  id="phone"
                  placeholder="+998 90 123 45 67"
                  value={loginForm.phone_number}
                  onChange={(e) => setLoginForm({ ...loginForm, phone_number: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password">Parol</label>
                <input
                  type="password"
                  id="password"
                  placeholder="Parolingizni kiriting"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={isLoading}
              >
                {isLoading ? 'Kirish...' : 'Kirish'}
              </button>
            </form>


          <div className={styles.authFooter}>
            <p>
              Admin hisobingiz yo'qmi?{' '}
              <a href="/admin/register" className={styles.link}>
                Ro'yxatdan o'tish
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
