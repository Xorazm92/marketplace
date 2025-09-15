'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { adminApi } from '../../../endpoints/admin';
import { useAdminAuth } from '../../../hooks/useAdminAuth';
import styles from '../../../styles/AdminAuth.module.scss';

interface LoginForm {
  phone_number: string;
  password: string;
}

export default function AdminLoginPage() {
  const [formData, setFormData] = useState<LoginForm>({
    phone_number: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  
  const router = useRouter();
  const { login } = useAdminAuth();

  const loginMutation = useMutation({
    mutationFn: adminApi.login,
    onSuccess: (response) => {
      const { access_token, admin } = response.data;
      login(access_token, admin);
      toast.success('Muvaffaqiyatli kirildi!');
      router.push('/admin');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login xatosi');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.phone_number || !formData.password) {
      toast.error('Barcha maydonlarni to\'ldiring');
      return;
    }

    loginMutation.mutate(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>🧸</span>
            <h1 className={styles.logoText}>INBOLA Admin</h1>
          </div>
          <p className={styles.subtitle}>Admin panelga kirish</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.formGroup}>
            <label htmlFor="phone_number" className={styles.label}>
              Telefon raqami
            </label>
            <input
              id="phone_number"
              name="phone_number"
              type="tel"
              value={formData.phone_number}
              onChange={handleInputChange}
              placeholder="+998901234567"
              className={styles.input}
              disabled={loginMutation.isPending}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Parol
            </label>
            <div className={styles.passwordContainer}>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Parolingizni kiriting"
                className={styles.input}
                disabled={loginMutation.isPending}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? 'Kirish...' : 'Kirish'}
          </button>
        </form>

        <div className={styles.authFooter}>
          <p className={styles.footerText}>
            Parolingizni unutdingizmi? 
            <button className={styles.linkButton}>
              Qayta tiklash
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
