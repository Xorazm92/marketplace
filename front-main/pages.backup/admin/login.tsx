
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from '@tanstack/react-query';
import { adminApi } from '../../endpoints/admin';
import styles from '../../styles/AdminAuth.module.scss';

const AdminLogin: React.FC = () => {
  const [formData, setFormData] = useState({
    phone_number: '',
    password: '',
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: adminApi.login,
    onSuccess: (response) => {
      localStorage.setItem('admin_token', response.access_token);
      router.push('/admin');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Login failed');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    loginMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1>Admin Panel</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="phone_number">Telefon raqam</label>
            <input
              type="text"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="+998901234567"
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="password">Parol</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          {error && <div className={styles.error}>{error}</div>}
          
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? 'Kirish...' : 'Kirish'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
