import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

/**
 * Server-side Supabase client (anon key, RLS-enforced) bound to the
 * request's auth cookies. Use in Server Components, Route Handlers, and
 * Server Actions.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component where setting cookies is not
            // allowed — safe to ignore; middleware refreshes the session.
          }
        },
      },
    },
  );
}

/**
 * Returns the current user, or null if unauthenticated OR if Supabase is
 * misconfigured/unreachable. Never throws — use on public pages so a missing
 * env var or transient error can't produce an opaque server exception.
 */
export async function getOptionalUser() {
  try {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      return null;
    }
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (err) {
    console.error("[getOptionalUser] failed:", err);
    return null;
  }
}
