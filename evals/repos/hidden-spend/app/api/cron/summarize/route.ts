import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// called by Vercel Cron every night (vercel.json)
export async function GET() {
  const { data: notes } = await db.from("notes").select("id, body");
  for (const n of notes ?? []) {
    const r = await openai.chat.completions.create({ model: "gpt-4o", messages: [{ role: "user", content: `Summarize: ${n.body}` }] });
    await db.from("notes").update({ summary: r.choices[0].message.content }).eq("id", n.id);
  }
  return Response.json({ done: notes?.length ?? 0 });
}
