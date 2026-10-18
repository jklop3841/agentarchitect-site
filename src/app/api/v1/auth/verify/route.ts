import { verifyEmailOtp } from "@/lib/network/db";
import { errorResponse, handleError, json, rateLimit, readJsonBody } from "@/lib/network/http";
import { isEmail } from "@/lib/network/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const limited = rateLimit(request, "v1-verify", 10, 600_000);
  if (limited) return limited;

  const body = await readJsonBody(request, 2_000);
  if (!body.ok) return body.response;

  const email = typeof body.data.email === "string" ? body.data.email.trim().toLowerCase() : "";
  const token = typeof body.data.token === "string" ? body.data.token.trim() : "";
  if (!isEmail(email) || !/^\d{6,10}$/.test(token)) {
    return errorResponse("invalid_input", 400, "email and numeric token are required.");
  }

  try {
    return json(await verifyEmailOtp(email, token));
  } catch (error) {
    return handleError(error);
  }
}
