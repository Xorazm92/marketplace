import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNotificationSocket } from '../hooks/useNotificationSocket';
import type { Notification } from '../types/notification.types';

interface NotificationContextType {
  unreadCount: number;
  notifications: Notification[];
  isConnected: boolean;
  markAsRead: (notificationId: number) => void;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { socket, isConnected, unreadCount, notifications, markAsRead } = useNotificationSocket();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshNotifications = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const value: NotificationContextType = {
    unreadCount,
    notifications,
    isConnected,
    markAsRead,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
