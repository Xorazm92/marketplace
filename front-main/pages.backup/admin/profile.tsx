import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAdminAuth } from '../../hooks/useAdminAuth';

interface AdminProfile {
  id: number;
  phone_number: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  role: string;
  created_at: string;
}

export default function AdminProfile() {
  const router = useRouter();
  const { isAuthenticated, loading, logout } = useAdminAuth();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/admin/login');
      return;
    }

    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, loading, router]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('http://localhost:3001/api/v1/admin/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else {
        console.error('Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Profil ma'lumotlarini yuklashda xatolik</p>
          <button 
            onClick={() => router.push('/admin/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Dashboard'ga qaytish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Admin Profil</h1>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Chiqish
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">ID</label>
                <p className="mt-1 text-sm text-gray-900">{profile.id}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Telefon raqam</label>
                <p className="mt-1 text-sm text-gray-900">{profile.phone_number}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Ism</label>
                <p className="mt-1 text-sm text-gray-900">{profile.first_name || 'Kiritilmagan'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Familiya</label>
                <p className="mt-1 text-sm text-gray-900">{profile.last_name || 'Kiritilmagan'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{profile.email || 'Kiritilmagan'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Rol</label>
                <p className="mt-1 text-sm text-gray-900">{profile.role}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Yaratilgan sana</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(profile.created_at).toLocaleDateString('uz-UZ')}
                </p>
              </div>
            </div>

            <div className="mt-8 flex space-x-4">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Dashboard
              </button>
              <button
                onClick={() => router.push('/admin/products')}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Mahsulotlar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
