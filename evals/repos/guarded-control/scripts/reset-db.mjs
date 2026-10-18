import pg from "pg";

const url = process.env.LOCAL_DATABASE_URL ?? "";
const host = new URL(url).hostname;
if (!["localhost", "127.0.0.1"].includes(host)) {
  throw new Error(`refusing to reset non-local database: ${host}`);
}
const client = new pg.Client({ connectionString: url });
await client.connect();
await client.query("DROP SCHEMA public CASCADE");
await client.query("CREATE SCHEMA public");
await client.end();
