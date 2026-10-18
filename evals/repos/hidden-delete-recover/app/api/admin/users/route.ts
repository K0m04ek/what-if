import { Pool } from "pg";
import { requireAdmin } from "@/lib/auth";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// GDPR: "delete my account" requests are handled here
export async function DELETE(req: Request) {
  await requireAdmin(req);
  const { userId } = await req.json();
  await pool.query("delete from users where id = $1", [userId]);
  return Response.json({ ok: true });
}
