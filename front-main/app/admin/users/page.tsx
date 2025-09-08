'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import UserList from '@/components/UserManagement/UserList';
import UserModal from '@/components/UserManagement/UserModal';
import { User } from '@/types/user.types';

export default function AdminUsersPage() {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUserSelect = (user: User) => {
    setSelectedUserId(user.id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUserId(null);
  };

  return (
    <div className="container mx-auto p-6">
      <UserList onUserSelect={handleUserSelect} />
      
      <UserModal
        userId={selectedUserId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
