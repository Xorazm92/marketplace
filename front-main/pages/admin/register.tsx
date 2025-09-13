import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import styles from '../../styles/AdminAuth.module.scss';

interface RegisterFormData {
  first_name: string;
  last_name: string;
  phone_number: string;
  password: string;
  confirm_password: string;
  role: 'ADMIN' | 'MODERATOR';
}

interface OtpFormData {
  otp_code: string;
  verification_key: string;
}

const AdminRegister: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otpData, setOtpData] = useState<{ verification_key: string; phone_number: string }>({
    verification_key: '',
    phone_number: ''
  });

  const [registerForm, setRegisterForm] = useState<RegisterFormData>({
    first_name: '',
    last_name: '',
    phone_number: '',
    password: '',
    confirm_password: '',
    role: 'ADMIN'
  });

  const [otpForm, setOtpForm] = useState<OtpFormData>({
    otp_code: '',
    verification_key: ''
  });

  // Telefon raqam formatini tekshirish
  const formatPhoneNumber = (phone: string): string => {
    const digits = phone.replace(/\D/g, '');
    
    if (digits.startsWith('998')) {
      return '+' + digits;
    }
    
    if (digits.startsWith('9') && digits.length === 9) {
      return '+998' + digits;
    }
    
    return phone;
  };

  // Form validatsiyasi
  const validateForm = (): boolean => {
    if (!registerForm.first_name.trim()) {
      toast.error('Ismni kiriting');
      return false;
    }

    if (!registerForm.last_name.trim()) {
      toast.error('Familiyani kiriting');
      return false;
    }

    if (!registerForm.phone_number.trim()) {
      toast.error('Telefon raqamni kiriting');
      return false;
    }

    if (registerForm.password.length < 6) {
      toast.error('Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
      return false;
    }

    if (registerForm.password !== registerForm.confirm_password) {
      toast.error('Parollar mos kelmaydi');
      return false;
    }

    return true;
  };

  // OTP yuborish va registratsiya boshlash
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const formattedPhone = formatPhoneNumber(registerForm.phone_number);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/admin/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: formattedPhone,
          purpose: 'registration'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setOtpData({
          verification_key: data.key,
          phone_number: formattedPhone
        });
        setShowOtpForm(true);
        toast.success('SMS kod yuborildi!');
        
        // Development mode'da OTP'ni ko'rsatish
        if (data.otp) {
          toast.success(`Development: OTP kodi - ${data.otp}`);
        }
      } else {
        toast.error(data.message || 'SMS yuborishda xatolik');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      toast.error('Tizimda xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  // Registratsiyani yakunlash
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/admin/auth/phone-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: registerForm.first_name,
          last_name: registerForm.last_name,
          phone_number: otpData.phone_number,
          password: registerForm.password,
          role: registerForm.role,
          otp_code: otpForm.otp_code,
          verification_key: otpData.verification_key
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Token'ni localStorage'ga saqlash
        localStorage.setItem('admin_access_token', data.access_token);
        localStorage.setItem('admin_user', JSON.stringify(data.admin));
        
        toast.success('Muvaffaqiyatli ro\'yxatdan o\'tdingiz!');
        router.push('/admin');
      } else {
        toast.error(data.message || 'Registratsiya xatosi');
      }
    } catch (error) {
      console.error('Register error:', error);
      toast.error('Tizimda xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Admin Ro'yxatdan O'tish - INBOLA</title>
        <meta name="description" content="INBOLA admin panelga ro'yxatdan o'tish" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <h1>Admin Ro'yxatdan O'tish</h1>
            <p>INBOLA boshqaruv tizimiga qo'shilish</p>
          </div>

          {!showOtpForm ? (
            <form onSubmit={handleSendOtp} className={styles.authForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="firstName">Ism</label>
                  <input
                    type="text"
                    id="firstName"
                    placeholder="Ismingizni kiriting"
                    value={registerForm.first_name}
                    onChange={(e) => setRegisterForm({ ...registerForm, first_name: e.target.value })}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="lastName">Familiya</label>
                  <input
                    type="text"
                    id="lastName"
                    placeholder="Familiyangizni kiriting"
                    value={registerForm.last_name}
                    onChange={(e) => setRegisterForm({ ...registerForm, last_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="phone">Telefon raqam</label>
                <input
                  type="tel"
                  id="phone"
                  placeholder="+998 90 123 45 67"
                  value={registerForm.phone_number}
                  onChange={(e) => setRegisterForm({ ...registerForm, phone_number: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="role">Rol</label>
                <select
                  id="role"
                  value={registerForm.role}
                  onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value as 'ADMIN' | 'MODERATOR' })}
                  required
                >
                  <option value="ADMIN">Admin</option>
                  <option value="MODERATOR">Moderator</option>
                </select>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="password">Parol</label>
                  <input
                    type="password"
                    id="password"
                    placeholder="Parolingizni kiriting"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword">Parolni tasdiqlang</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    placeholder="Parolni qayta kiriting"
                    value={registerForm.confirm_password}
                    onChange={(e) => setRegisterForm({ ...registerForm, confirm_password: e.target.value })}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={isLoading}
              >
                {isLoading ? 'SMS yuborilmoqda...' : 'SMS kod yuborish'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className={styles.authForm}>
              <div className={styles.formGroup}>
                <label htmlFor="otpCode">SMS kod</label>
                <input
                  type="text"
                  id="otpCode"
                  placeholder="4 raqamli kodni kiriting"
                  value={otpForm.otp_code}
                  onChange={(e) => setOtpForm({ ...otpForm, otp_code: e.target.value })}
                  maxLength={4}
                  required
                />
                <small>SMS kod {otpData.phone_number} raqamiga yuborildi</small>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.backButton}
                  onClick={() => setShowOtpForm(false)}
                >
                  Orqaga
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isLoading}
                >
                  {isLoading ? 'Ro\'yxatdan o\'tish...' : 'Ro\'yxatdan o\'tish'}
                </button>
              </div>
            </form>
          )}

          <div className={styles.authFooter}>
            <p>
              Allaqachon hisobingiz bormi?{' '}
              <a href="/admin/login" className={styles.link}>
                Kirish
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminRegister;
