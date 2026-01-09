import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Employee = {
  id: string;
  email: string;
  full_name: string;
  password_hash: string;
  role: 'admin' | 'creator' | 'viewer';
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type User = {
  id: string;
  email: string;
  full_name: string;
  city: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type UserPreference = {
  id: string;
  user_id: string;
  promotional_offers: boolean;
  order_updates: boolean;
  newsletters: boolean;
  email_channel: boolean;
  sms_channel: boolean;
  push_channel: boolean;
  updated_at: string;
};

export type Campaign = {
  id: string;
  name: string;
  notification_type: 'promotional_offers' | 'order_updates' | 'newsletters';
  city_filter: string | null;
  content: string;
  status: 'draft' | 'sent';
  created_by: string;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
};

export type NotificationLog = {
  id: string;
  campaign_id: string;
  user_id: string;
  status: 'success' | 'failed';
  sent_at: string;
  error_message: string | null;
};
