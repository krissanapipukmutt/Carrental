import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';

let cached: SupabaseClient<Database> | null = null;

/**
 * ใช้ Service Role key สำหรับงานแบ็กเอนด์ (Server Action/CRON)
 * อย่าเรียกใช้จากฝั่งเบราว์เซอร์
 */
export const getAdminClient = () => {
  if (cached) {
    return cached;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Missing Supabase admin env vars');
  }

  cached = createClient<Database>(url, serviceRoleKey, {
    db: {
      schema: 'car_rental',
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return cached;
};
