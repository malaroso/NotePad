export type Notification = {
  notification_id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  is_read: number;
  created_at: string;
  read_at: string | null;
  priority: 'low' | 'medium' | 'high';
  link: string;
  item_id: number;
  item_type: string;
  is_deleted: number;
}; 