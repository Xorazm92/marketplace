import React, { useState, useEffect } from 'react';
import { Send, Users, BarChart3, Clock, Plus, Trash2 } from 'lucide-react';
import { 
  createNotification, 
  createBulkNotification, 
  getAllNotifications, 
  getNotificationStats,
  processScheduledNotifications 
} from '../../endpoints/notification';
import { formatNotificationTime, getNotificationTypeIcon, getNotificationTypeColor } from '../../endpoints/notification';
import type { 
  CreateNotificationDto, 
  BulkNotificationDto, 
  Notification, 
  NotificationStats,
  NotificationType,
  NotificationChannel 
} from '../../types/notification.types';

const AdminNotificationPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'bulk' | 'list' | 'stats'>('create');
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form states
  const [createForm, setCreateForm] = useState<CreateNotificationDto>({
    title: '',
    message: '',
    type: 'SYSTEM',
    channel: 'IN_APP',
    user_id: 0
  });

  const [bulkForm, setBulkForm] = useState<BulkNotificationDto>({
    title: '',
    message: '',
    type: 'SYSTEM',
    channel: 'IN_APP',
    user_ids: []
  });

  const [userIdsInput, setUserIdsInput] = useState('');

  useEffect(() => {
    if (activeTab === 'stats') {
      fetchStats();
    } else if (activeTab === 'list') {
      fetchNotifications();
    }
  }, [activeTab, currentPage]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const data = await getNotificationStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await getAllNotifications(currentPage, 20);
      setNotifications(response.notifications);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await createNotification(createForm);
      setCreateForm({
        title: '',
        message: '',
        type: 'SYSTEM',
        channel: 'IN_APP',
        user_id: 0
      });
    } catch (error) {
      console.error('Failed to create notification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userIds = userIdsInput
        .split(',')
        .map(id => parseInt(id.trim()))
        .filter(id => !isNaN(id));
      
      await createBulkNotification({
        ...bulkForm,
        user_ids: userIds
      });
      
      setBulkForm({
        title: '',
        message: '',
        type: 'SYSTEM',
        channel: 'IN_APP',
        user_ids: []
      });
      setUserIdsInput('');
    } catch (error) {
      console.error('Failed to create bulk notification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessScheduled = async () => {
    setIsLoading(true);
    try {
      await processScheduledNotifications();
      if (activeTab === 'stats') {
        fetchStats();
      }
    } catch (error) {
      console.error('Failed to process scheduled notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-900">Notification Management</h2>
        <p className="text-gray-600 mt-1">Create and manage notifications for users</p>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'create', label: 'Create Single', icon: Plus },
            { id: 'bulk', label: 'Bulk Send', icon: Users },
            { id: 'list', label: 'All Notifications', icon: Send },
            { id: 'stats', label: 'Statistics', icon: BarChart3 }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Create Single Notification */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateNotification} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User ID
                </label>
                <input
                  type="number"
                  value={createForm.user_id || ''}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, user_id: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={createForm.type}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, type: e.target.value as NotificationType }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="SYSTEM">System</option>
                  <option value="ORDER">Order</option>
                  <option value="PAYMENT">Payment</option>
                  <option value="PRODUCT">Product</option>
                  <option value="PROMOTION">Promotion</option>
                  <option value="SECURITY">Security</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Channel
                </label>
                <select
                  value={createForm.channel}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, channel: e.target.value as NotificationChannel }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="IN_APP">In-App</option>
                  <option value="EMAIL">Email</option>
                  <option value="SMS">SMS</option>
                  <option value="PUSH">Push</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={createForm.message}
                onChange={(e) => setCreateForm(prev => ({ ...prev, message: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action URL (optional)
              </label>
              <input
                type="url"
                value={createForm.action_url || ''}
                onChange={(e) => setCreateForm(prev => ({ ...prev, action_url: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/action"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Notification'}
            </button>
          </form>
        )}

        {/* Bulk Notifications */}
        {activeTab === 'bulk' && (
          <form onSubmit={handleBulkNotification} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={bulkForm.title}
                  onChange={(e) => setBulkForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={bulkForm.type}
                  onChange={(e) => setBulkForm(prev => ({ ...prev, type: e.target.value as NotificationType }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="SYSTEM">System</option>
                  <option value="ORDER">Order</option>
                  <option value="PAYMENT">Payment</option>
                  <option value="PRODUCT">Product</option>
                  <option value="PROMOTION">Promotion</option>
                  <option value="SECURITY">Security</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User IDs (comma-separated)
              </label>
              <textarea
                value={userIdsInput}
                onChange={(e) => setUserIdsInput(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1, 2, 3, 4, 5"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter user IDs separated by commas
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={bulkForm.message}
                onChange={(e) => setBulkForm(prev => ({ ...prev, message: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send Bulk Notification'}
            </button>
          </form>
        )}

        {/* Notifications List */}
        {activeTab === 'list' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">All Notifications</h3>
              <button
                onClick={handleProcessScheduled}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                <Clock className="w-4 h-4" />
                <span>Process Scheduled</span>
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading notifications...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <span className="text-lg">
                          {getNotificationTypeIcon(notification.type)}
                        </span>
                        <div>
                          <h4 className="font-medium text-gray-900">{notification.title}</h4>
                          <p className="text-gray-600 mt-1">{notification.message}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>User: {notification.user?.first_name} {notification.user?.last_name}</span>
                            <span>Type: {notification.type}</span>
                            <span>Channel: {notification.channel}</span>
                            <span>{formatNotificationTime(notification.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {notification.is_read ? (
                          <span className="text-green-600 text-sm">Read</span>
                        ) : (
                          <span className="text-blue-600 text-sm">Unread</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center mt-6">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Statistics */}
        {activeTab === 'stats' && (
          <div>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading statistics...</p>
              </div>
            ) : stats ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-900">Total Notifications</h3>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{stats.total}</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-green-900">Sent</h3>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.sent}</p>
                </div>
                <div className="bg-orange-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-orange-900">Pending</h3>
                  <p className="text-3xl font-bold text-orange-600 mt-2">{stats.pending}</p>
                </div>

                {/* By Type */}
                <div className="md:col-span-3 bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">By Type</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {Object.entries(stats.byType).map(([type, count]) => (
                      <div key={type} className="text-center">
                        <div className="text-2xl mb-1">{getNotificationTypeIcon(type)}</div>
                        <div className="text-sm font-medium text-gray-900">{type}</div>
                        <div className="text-lg font-bold text-gray-600">{count}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotificationPanel;
