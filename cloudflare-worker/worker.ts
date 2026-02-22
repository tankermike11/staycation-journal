/**
 * Cloudflare Worker (optional) for authenticated image serving from R2.
 * 
 * This is a starting point only — you’ll likely refine auth + caching.
 */
export interface Env {
  R2_BUCKET: R2Bucket;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const m = url.pathname.match(/^\/img\/(.+)$/);
    if (!m) return new Response("Not found", { status: 404 });

    const imageId = m[1];
    const size = (url.searchParams.get("size") ?? "web") as "thumb" | "web" | "orig";

    // Very simple auth placeholder:
    // In production, validate user JWT (from Authorization header/cookie) via Supabase.
    // For now, require Authorization: Bearer <anything-nonempty> to avoid accidental public access.
    const auth = request.headers.get("authorization");
    if (!auth || !auth.toLowerCase().startsWith("bearer ")) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Look up the image row from Supabase via REST (service role).
    const rowResp = await fetch(`${env.SUPABASE_URL}/rest/v1/images?id=eq.${encodeURIComponent(imageId)}&select=storage_key_original,storage_key_web,storage_key_thumb`, {
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
      }
    });
    if (!rowResp.ok) return new Response("Not found", { status: 404 });
    const rows = await rowResp.json() as any[];
    if (!rows.length) return new Response("Not found", { status: 404 });

    const row = rows[0];
    const key = size === "orig" ? row.storage_key_original : size === "thumb" ? row.storage_key_thumb : row.storage_key_web;

    const obj = await env.R2_BUCKET.get(key);
    if (!obj) return new Response("Not found", { status: 404 });

    return new Response(obj.body, {
      headers: {
        "content-type": "image/jpeg",
        "cache-control": "private, max-age=0, must-revalidate"
      }
    });
  }
};
