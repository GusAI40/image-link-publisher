// This creates a Supabase client for server-side operations
// Used in server components, API routes, and server actions
// Handles cookies for authentication state management
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * Creates a server-side Supabase client with cookie handling
 * Important: Always create a new client within each function - don't use global variables
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The "setAll" method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}
