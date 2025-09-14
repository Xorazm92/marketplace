import React from 'react';
import Layout from '../layout';
import ChildSafetyDashboard from '../components/child-safety/ChildSafetyDashboard';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const ChildSafetyPage: React.FC = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout 
      title="Bolalar Xavfsizligi | INBOLA Kids Marketplace"
      description="Farzandlaringiz uchun xavfsiz va ta'limiy onlayn xarid muhitini yarating"
      keywords="bolalar xavfsizligi, ota-ona nazorati, xavfsiz xarid, ta'lim"
    >
      <ChildSafetyDashboard />
    </Layout>
  );
};

export default ChildSafetyPage;