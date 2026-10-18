import { handleSendEmailHook } from "@/lib/email/send-email-hook";

// Supabase Auth "Send Email Hook" (HTTPS). Configure in Supabase:
//   Authentication -> Hooks -> Send Email -> HTTPS -> https://www.agentarchitect.me/api/auth/send-email-hook
// Primary provider Resend, automatic failover to Brevo (swap with EMAIL_PRIMARY=brevo).

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  return handleSendEmailHook(request, {
    env: {
      SEND_EMAIL_HOOK_SECRET: process.env.SEND_EMAIL_HOOK_SECRET,
      SUPABASE_URL: process.env.SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      BREVO_API_KEY: process.env.BREVO_API_KEY,
      EMAIL_PRIMARY: process.env.EMAIL_PRIMARY,
      EMAIL_FROM_ADDRESS: process.env.EMAIL_FROM_ADDRESS,
      EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME,
    },
  });
}

export function GET() {
  return new Response(JSON.stringify({ error: { http_code: 405, message: "POST only." } }), {
    status: 405,
    headers: { "Content-Type": "application/json", Allow: "POST" },
  });
}
