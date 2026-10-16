/**
 * Contact form delivery — the single integration point for sending enquiries.
 * Server-only: credentials are read from environment variables and never
 * reach the browser.
 *
 * Supported providers (first match wins):
 *   1. Webhook  — CONTACT_WEBHOOK_URL (+ optional CONTACT_WEBHOOK_SECRET, sent
 *                 as a Bearer token). Receives the enquiry as JSON; use it for
 *                 a CRM, Zapier/Make, Slack workflow or your own backend.
 *   2. Resend   — RESEND_API_KEY + CONTACT_TO_EMAIL + CONTACT_FROM_EMAIL.
 *                 Sends a plain-text email via https://resend.com.
 *
 * To add another provider, add a branch to `deliverContact` that returns
 * "sent" only once the provider has accepted the message.
 */
import { institutionLabel, type ContactInput } from "./contact-schema";

export type DeliveryResult = "sent" | "not_configured" | "failed";

const TIMEOUT_MS = 10_000;

export async function deliverContact(input: ContactInput): Promise<DeliveryResult> {
  const env = process.env;

  if (env.CONTACT_WEBHOOK_URL) {
    return post(
      env.CONTACT_WEBHOOK_URL,
      {
        type: "contact_enquiry",
        submittedAt: new Date().toISOString(),
        ...input,
        institutionTypeLabel: institutionLabel(input.institutionType),
      },
      env.CONTACT_WEBHOOK_SECRET,
    );
  }

  if (env.RESEND_API_KEY && env.CONTACT_TO_EMAIL && env.CONTACT_FROM_EMAIL) {
    return post(
      "https://api.resend.com/emails",
      {
        from: env.CONTACT_FROM_EMAIL,
        to: env.CONTACT_TO_EMAIL.split(",").map((s) => s.trim()).filter(Boolean),
        reply_to: input.email,
        subject: `Website enquiry: ${input.institution}`,
        text: formatEmail(input),
      },
      env.RESEND_API_KEY,
    );
  }

  return "not_configured";
}

async function post(url: string, body: unknown, bearer?: string): Promise<DeliveryResult> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`[contact] delivery rejected: HTTP ${res.status}`);
      return "failed";
    }
    return "sent";
  } catch (err) {
    console.error("[contact] delivery error:", err instanceof Error ? err.message : err);
    return "failed";
  }
}

function formatEmail(input: ContactInput): string {
  return [
    "New enquiry from the website contact form",
    "",
    `Name:             ${input.fullName}`,
    `Email:            ${input.email}`,
    `Institution:      ${input.institution}`,
    `Institution type: ${institutionLabel(input.institutionType)}`,
    `Phone:            ${input.phone || "—"}`,
    `Students / users: ${input.studentCount || "—"}`,
    "",
    "Message:",
    input.message,
  ].join("\n");
}
