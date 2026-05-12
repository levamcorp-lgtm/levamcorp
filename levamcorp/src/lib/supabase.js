import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

export const LEVAM = {
  name: 'Levam Corp Distributors',
  address: '6315 NW 99th Ave',
  city: 'Doral, FL 33178',
  email: 'partners@levamcorp.com',
  phone: '+1 (305) 000-0000',
  website: 'levamcorp.com',
}
