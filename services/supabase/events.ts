import { SupabaseClient } from '@supabase/supabase-js'
import { definitions } from '../../types/supabase'
import { supabase } from './supabase'

export type Event = Partial<definitions['events']>
export type LogEvent = {
  tag: string
  message: string
  level?: string | undefined
  env?: string | undefined
  data?: string | undefined
}
export type Level = 'error' | 'warn' | 'info' | 'debug'

const DEFAULT_EVENT: Event = {
  env: process.env.NODE_ENV,
  level: 'info',
}

export async function logEvent(event: LogEvent) {
  const e = {
    ...DEFAULT_EVENT,
    event,
  }
  const { error } = await supabase
    .from<Event>('events')
    .insert(e, { returning: 'minimal' })

  return error
}

// all the functions below are known to need non-anon privileges, so client prop is passed in.
// there might be a better way; this is sort of ad-hoc DI :internet-shrugz:
export async function getEvents(limit = 1000, client?: SupabaseClient) {
  const c = client ? client : supabase
  const { data: events, error } = await c
    .from<Event>('events')
    .select()
    .limit(limit)

  return events
}

export async function deleteEvent(id: number, client?: SupabaseClient) {
  const c = client ? client : supabase

  const { error } = await c
    .from<Event>('events')
    .delete({ returning: 'minimal' })
    .eq('id', id)

  return error
}
