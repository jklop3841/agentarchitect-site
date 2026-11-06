import { NextResponse } from "next/server";

// OpenAI Plugin Directory domain verification, documented at
// https://developers.openai.com/plugins/deploy/submission
// The token is supplied ONLY as a server-side deployment environment variable.
// The caller never supplies or chooses the challenge value.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const token = process.env.OPENAI_APPS_CHALLENGE_TOKEN?.trim();
  if (!token || token.length > 2048 || /[\r\n]/.test(token)) {
    return new NextResponse("Not configured", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }
  return new NextResponse(token, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
