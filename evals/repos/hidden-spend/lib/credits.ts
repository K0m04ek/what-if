import { createClient } from "@supabase/supabase-js";
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function spendCredit(userId: string) {
  await db.rpc("spend_credit", { p_user: userId });
}
export async function addCredits(userId: string, amount: number) {
  await db.rpc("add_credits", { p_user: userId, p_amount: amount });
}
