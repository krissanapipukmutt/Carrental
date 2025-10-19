import type {
  PostgrestError,
  PostgrestResponse,
  PostgrestSingleResponse,
  SupabaseClient,
} from '@supabase/supabase-js';
import { getAdminClient } from '@/lib/supabase/admin';
import { createClient as createServerClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';

const SCHEMA_PERMISSION_DENIED = '42501';

type PostgrestResult<Data> =
  | PostgrestResponse<Data>
  | PostgrestSingleResponse<Data>;

type QueryExecutor<Data> = (
  client: SupabaseClient<Database>,
) => Promise<PostgrestResult<Data>>;

type ClientDescriptor = {
  client: SupabaseClient<Database>;
  isAdmin: boolean;
};

const isSchemaPermissionError = (error: PostgrestError | null | undefined) =>
  error?.code === SCHEMA_PERMISSION_DENIED;

export const getPreferAdminClient = async (): Promise<ClientDescriptor> => {
  try {
    return {
      client: getAdminClient(),
      isAdmin: true,
    };
  } catch {
    return {
      client: await createServerClient(),
      isAdmin: false,
    };
  }
};

export const executeWithAdminFallback = async <Data>(
  executor: QueryExecutor<Data>,
): Promise<PostgrestResult<Data>> => {
  const { client, isAdmin } = await getPreferAdminClient();
  let response = await executor(client);

  if (isAdmin && isSchemaPermissionError(response.error)) {
    const fallbackClient = await createServerClient();
    response = await executor(fallbackClient);
  }

  return response;
};
