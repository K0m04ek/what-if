import OpenAI from "openai";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { requireUser } from "@/lib/auth";
import { withRetry } from "@/lib/retry";
import { spendCredit } from "@/lib/credits";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, maxRetries: 3 });
const limit = new Ratelimit({ redis: Redis.fromEnv(), limiter: Ratelimit.slidingWindow(30, "1 h") });

export async function POST(req: Request) {
  const user = await requireUser();
  const { success } = await limit.limit(user.id);
  if (!success) return new Response("slow down", { status: 429 });
  const { messages } = await req.json();
  const completion = await withRetry(() =>
    openai.chat.completions.create({ model: "gpt-4o", messages: messages.slice(-20), max_tokens: 1500 })
  );
  await spendCredit(user.id);
  return Response.json(completion.choices[0].message);
}
