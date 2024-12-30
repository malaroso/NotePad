import axios from '../config/axios';
import { Notification } from '../types/notification';

type NotificationsResponse = {
  status: boolean;
  data: Notification[];
};

type MarkAsReadResponse = {
  status: boolean;
  message?: string;
};

type DeleteNotificationResponse = {
  status: boolean;
  message?: string;
};

type UnreadCountResponse = {
  status: boolean;
  count: number;
};

type NotificationFilters = {
  priority?: 'low' | 'medium' | 'high';
  is_read?: number;
};

export const getNotifications = async (): Promise<NotificationsResponse> => {
  try {
    const response = await axios.get<NotificationsResponse>('/notifications');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId: number): Promise<MarkAsReadResponse> => {
  try {
    const response = await axios.post<MarkAsReadResponse>('/notifications/mark-read', {
      notification_id: notificationId
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteNotification = async (notificationId: number): Promise<DeleteNotificationResponse> => {
  try {
    const response = await axios.delete<DeleteNotificationResponse>('/notifications', {
      data: { notification_id: notificationId }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUnreadCount = async (): Promise<UnreadCountResponse> => {
  try {
    const response = await axios.get<UnreadCountResponse>('/notifications/unread-count');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getFilteredNotifications = async (filters: NotificationFilters): Promise<NotificationsResponse> => {
  try {
    const params = new URLSearchParams();
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.is_read !== undefined) params.append('is_read', filters.is_read.toString());
    
    const response = await axios.get<NotificationsResponse>(`/notifications/filtered?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}; 