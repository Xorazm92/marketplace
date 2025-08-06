import { useEffect } from 'react';
import { useRouter } from 'next/router';

// Bu sahifa faqat redirect uchun ishlatiladi
// Asosiy admin panel /admin/index.tsx da joylashgan
const AdminDashboard: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Admin dashboard'ga o'tish o'rniga asosiy admin panelga yo'naltirish
    router.replace('/admin');
  }, [router]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
        <p>Admin panelga yo'naltirilmoqda...</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
