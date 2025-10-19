import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/lib/supabase/types';

/**
 * ใช้ใน Server Component หรือ Route Handler
 */
export const createClient = async () => {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Missing Supabase server env vars');
  }

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      get: async (name) => {
        return cookieStore.get(name)?.value;
      },
      set: async (name, value, options) => {
        cookieStore.set({
          name,
          value,
          httpOnly: options?.httpOnly,
          maxAge: options?.maxAge,
          path: options?.path,
          sameSite: options?.sameSite,
          secure: options?.secure,
        });
      },
      remove: async (name, options) => {
        cookieStore.set({
          name,
          value: '',
          httpOnly: options?.httpOnly,
          maxAge: 0,
          path: options?.path,
          sameSite: options?.sameSite,
          secure: options?.secure,
        });
      },
    },
  });
};
