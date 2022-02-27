import { SupabaseClient } from '@supabase/supabase-js'
import { Member } from '../../types/supatypes'
import { supabase } from './supabase'

export async function checkIfEmailAvailable(
  email: string,
  client?: SupabaseClient
) {
  const c = client ? client : supabase

  const { error, count } = await c
    .from<Member>('Members')
    .select('*', { count: 'exact' })
    .eq('registration_email', email)
  console.log(
    'checkIfEmailAvailable, email:',
    email,
    ' data, error, count',
    error,
    count
  )

  if (error) throw new Error(error.message)
  return count === 0
}

export async function insertMember(
  member: Partial<Member>,
  client?: SupabaseClient
) {
  const c = client ? client : supabase

  const { data, error } = await c
    .from<Member>('Members')
    .insert(member, { returning: 'representation' })
    .single()

  if (error) {
    return {
      msg: error.message,
      member: null,
    }
  }
  return {
    msg: 'Success!',
    member: data,
  }
}
