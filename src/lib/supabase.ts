import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// supabase will be null when env vars aren't set (local dev without .env.local)
export const supabase = url && key ? createClient(url, key) : null

export async function getOrCreateUserId(): Promise<string | null> {
  if (!supabase) return null

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session?.user?.id) return session.user.id

  // Create a silent anonymous session — no email/password needed
  const { data, error } = await supabase.auth.signInAnonymously()
  if (error || !data.user) {
    console.error('Anonymous auth failed:', error?.message)
    return null
  }
  return data.user.id
}
