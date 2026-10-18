import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function requireUser() {
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { getAll: () => cookies().getAll() },
  });
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Response("unauthorized", { status: 401 });
  return data.user;
}
