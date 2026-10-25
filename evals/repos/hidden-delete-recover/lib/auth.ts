export async function requireAdmin(req: Request) {
  if (req.headers.get("x-admin-token") !== process.env.ADMIN_TOKEN) throw new Response("forbidden", { status: 403 });
}
