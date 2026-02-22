# Optional: Cloudflare Worker image gateway (R2)

This is optional. The V1 app already serves images privately via Next.js `/api/img/...`.

If you prefer moving image serving to a Worker (lower latency + edge cache), use this folder as a starting point.

Key idea:
- Worker endpoint: `/img/<imageId>?size=thumb|web|orig`
- Worker validates Supabase JWT (from `Authorization: Bearer <token>` or cookie),
  then fetches the corresponding R2 key and streams it.

You’ll need:
- A way for Worker to look up `imageId` → storage key.
  Option A: call Supabase REST (with service role in Worker env) to fetch `images` row.
  Option B: mirror a small KV mapping (more complex).

See `worker.ts` for a simple Supabase REST approach.
