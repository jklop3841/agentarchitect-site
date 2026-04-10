import { NextResponse } from "next/server";

import { createAccessRequest } from "@/lib/store";
import type { AccessRequestInput } from "@/lib/types";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<AccessRequestInput>;

  if (!payload.name || !payload.email || !payload.useCase || !payload.locale) {
    return NextResponse.json({ message: "Missing required fields." }, { status: 422 });
  }

  if (!isValidEmail(payload.email)) {
    return NextResponse.json({ message: "Please provide a valid email." }, { status: 422 });
  }

  const record = await createAccessRequest({
    name: payload.name.trim(),
    email: payload.email.trim(),
    organization: payload.organization?.trim(),
    role: payload.role?.trim(),
    useCase: payload.useCase.trim(),
    expectedVolume: payload.expectedVolume?.trim(),
    locale: payload.locale,
  });

  return NextResponse.json(
    {
      message: "Access request received.",
      requestId: record.id,
    },
    { status: 201 },
  );
}
