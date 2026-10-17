import { reportRequest } from "@/lib/network/db";
import { errorResponse, getBearerToken, handleError, json, rateLimit, readJsonBody } from "@/lib/network/http";
import { isUuid, validateReport } from "@/lib/network/validation";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context) {
  const limited = rateLimit(request, "v1-report", 10, 3_600_000);
  if (limited) return limited;

  const { id } = await context.params;
  if (!isUuid(id)) return errorResponse("not_found", 404, "Request not found.");

  const body = await readJsonBody(request, 4_000);
  if (!body.ok) return body.response;

  const parsed = validateReport(body.data);
  if (!parsed.ok) return errorResponse("invalid_input", 400, "Input failed validation.", parsed.errors);

  try {
    await reportRequest(getBearerToken(request), id, parsed.value.reason, parsed.value.details);
    return json({ received: true }, 202);
  } catch (error) {
    return handleError(error);
  }
}
