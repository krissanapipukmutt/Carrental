import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/supabase/types';

/**
 * Factory สำหรับสร้าง Supabase client ฝั่งเบราว์เซอร์
 */
export const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Missing Supabase browser env vars');
  }

  return createBrowserClient<Database>(url, anonKey, {
    cookieOptions: {
      name: 'sb-car-rental-auth',
      lifetime: 60 * 60 * 24 * 7, // 7 วัน
      sameSite: 'lax',
    },
  });
};
