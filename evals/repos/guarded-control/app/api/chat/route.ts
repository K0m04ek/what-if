import OpenAI from "openai";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { requireUser } from "@/lib/auth";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, maxRetries: 1 });
const limit = new Ratelimit({ redis: Redis.fromEnv(), limiter: Ratelimit.slidingWindow(20, "1 d") });

export async function POST(req: Request) {
  const user = await requireUser();
  const { success } = await limit.limit(user.id);
  if (!success) return new Response("daily limit reached", { status: 429 });
  const { question } = await req.json();
  const r = await openai.chat.completions.create({
    model: "gpt-4o-mini", max_tokens: 400,
    messages: [{ role: "user", content: String(question).slice(0, 2000) }],
  });
  return Response.json(r.choices[0].message);
}
