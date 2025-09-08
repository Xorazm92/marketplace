import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import type { Notification } from '../types/notification.types';

interface UseNotificationSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  unreadCount: number;
  notifications: Notification[];
  markAsRead: (notificationId: number) => void;
}

export const useNotificationSocket = (): UseNotificationSocketReturn => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      return;
    }

    // Initialize socket connection
    const socket = io(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/notifications`, {
      auth: {
        token: token
      },
      transports: ['websocket'],
      forceNew: true,
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('Connected to notification server');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from notification server');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
    });

    // Notification event handlers
    socket.on('new_notification', (notification: Notification) => {
      console.log('New notification received:', notification);
      
      // Add to notifications list
      setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep only 10 most recent
      
      // Show toast notification
      toast.success(notification.title, {
        duration: 5000,
        position: 'top-right',
      });
    });

    socket.on('unread_count', (data: { count: number }) => {
      console.log('Unread count updated:', data.count);
      setUnreadCount(data.count);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsConnected(false);
    };
  }, []);

  const markAsRead = (notificationId: number) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('mark_as_read', { notificationId });
      
      // Optimistically update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      );
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    unreadCount,
    notifications,
    markAsRead,
  };
};
