/**
 * Transactional email sender (server-only).
 *
 * Uses Resend if RESEND_API_KEY is configured; otherwise it logs and no-ops so
 * the app works in development without an email provider. Never throws into the
 * caller — email is always best-effort.
 */
export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(msg: EmailMessage): Promise<{ ok: boolean; skipped?: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "DAYONG <onboarding@resend.dev>";

  if (!apiKey) {
    console.log(`[email:noop] to=${msg.to} subject="${msg.subject}"`);
    return { ok: false, skipped: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: msg.to, subject: msg.subject, html: msg.html }),
    });
    if (!res.ok) {
      console.error("[email] send failed:", res.status, await res.text());
      return { ok: false };
    }
    return { ok: true };
  } catch (err) {
    console.error("[email] send error:", err);
    return { ok: false };
  }
}

/** Minimal branded HTML wrapper for a message body. */
export function emailTemplate(heading: string, bodyHtml: string): string {
  return `<div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:24px">
    <h2 style="color:#0f172a;font-size:18px">${heading}</h2>
    <div style="color:#334155;font-size:14px;line-height:1.6">${bodyHtml}</div>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0" />
    <p style="color:#94a3b8;font-size:12px">DAYONG Member Assistance &amp; Collection Management</p>
  </div>`;
}
