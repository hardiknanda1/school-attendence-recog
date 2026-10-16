import { normaliseContact, validateContact } from "@/lib/contact-schema";
import { deliverContact } from "@/lib/contact-delivery";

const MAX_BODY_BYTES = 16 * 1024;
const MIN_FILL_MS = 1500;
const RATE_LIMIT = { max: 5, windowMs: 10 * 60 * 1000 };

/**
 * Best-effort, per-instance rate limiter. On serverless or multi-instance
 * deployments each instance keeps its own window, so pair this with
 * platform-level protection (e.g. a WAF or edge rate-limit rule).
 */
const hits = new Map<string, number[]>();

function rateLimited(key: string, now: number): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  if (recent.length >= RATE_LIMIT.max) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= RATE_LIMIT.windowMs)) hits.delete(k);
    }
  }
  return false;
}

function json(status: number, body: Record<string, unknown>) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  // Reject cross-site form posts.
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) return json(403, { code: "forbidden_origin" });
    } catch {
      return json(403, { code: "forbidden_origin" });
    }
  }

  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return json(415, { code: "unsupported_media_type" });
  }

  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) return json(413, { code: "payload_too_large" });

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const now = Date.now();
  if (rateLimited(ip, now)) {
    return json(429, { code: "rate_limited" });
  }

  let raw: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return json(413, { code: "payload_too_large" });
    raw = JSON.parse(text);
  } catch {
    return json(400, { code: "malformed_request" });
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return json(400, { code: "malformed_request" });
  }

  const body = raw as Record<string, unknown>;
  // Honeypot field (hidden from people) and minimum fill time deter simple bots.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return json(400, { code: "rejected" });
  }
  const startedAt = Number(body.startedAt);
  if (!Number.isFinite(startedAt) || now - startedAt < MIN_FILL_MS) {
    return json(400, { code: "rejected" });
  }

  const input = normaliseContact(body);
  const errors = validateContact(input);
  if (Object.keys(errors).length > 0) {
    return json(422, { code: "invalid", errors });
  }

  const result = await deliverContact(input);
  if (result === "sent") return json(200, { ok: true });
  if (result === "not_configured") return json(503, { code: "not_configured" });
  return json(502, { code: "delivery_failed" });
}
