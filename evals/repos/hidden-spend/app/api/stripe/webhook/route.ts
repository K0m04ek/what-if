import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { addCredits } from "@/lib/credits";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: Request) {
  const event = stripe.webhooks.constructEvent(await req.text(), req.headers.get("stripe-signature")!, process.env.STRIPE_WEBHOOK_SECRET!);
  const { error } = await db.from("processed_events").insert({ event_id: event.id });
  if (error) return new Response("duplicate", { status: 200 });

  // monthly plan: 500 credits
  if (event.type === "checkout.session.completed") {
    const s = event.data.object as Stripe.Checkout.Session;
    await addCredits(s.metadata!.user_id, 500);
  }
  if (event.type === "invoice.paid") {
    const inv = event.data.object as Stripe.Invoice;
    await addCredits(inv.subscription_details!.metadata!.user_id, 500);
  }
  return new Response("ok");
}
