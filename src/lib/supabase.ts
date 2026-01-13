import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

/* =======================
   EMPLOYEES
======================= */

export type Employee = {
  employee_id: number;
  email: string;
  password: string; // hashed
  role_id: number;
  is_active: boolean;
  created_at: string;
};

/* =======================
   ROLES
======================= */

export type Role = {
  role_id: number;
  role_name: 'Admin' | 'Creator' | 'Viewer';
};

/* =======================
   USERS
======================= */

export type User = {
  user_id: string;
  email: string;
  name: string;
  phone: string | null;
  gender: string | null;
  city: string | null;
  is_active: boolean;
  created_at: string;
  password: string;
};

/* =======================
   USER PREFERENCES
======================= */

export type UserPreference = {
  user_id: string;
  offers: boolean;
  order_updates: boolean;
  newsletter: boolean;
  email_channel:boolean;
  sms_channel:boolean;
  push_channel:boolean;
  updated_at: string;
};

/* =======================
   CAMPAIGNS
======================= */

export type Campaign = {
  campaign_id: string;
  campaign_name: string;
  city_filter: string | null;
  content: 'string' | null;
  status: 'draft' | 'sent';
  created_by: string; // employee_id
  created_at: string;
};

/* =======================
   CAMPAIGN LOGS
======================= */

export type CampaignLog = {
  log_id: string;
  campaign_id: string;
  user_id: string;
  status: 'success' | 'failed';
  sent_at: string;
};

