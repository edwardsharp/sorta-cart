import { createClient, SupabaseClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON || ''
)

let supabaseServiceRole: SupabaseClient | null

export function getSupabaseServiceRoleClient() {
  if (!supabaseServiceRole) {
    supabaseServiceRole = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_KEY || ''
    )
  }
  return supabaseServiceRole
}
