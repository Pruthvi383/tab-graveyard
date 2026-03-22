import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { issueExtensionToken, listExtensionTokens, resolveRequestActor, revokeExtensionToken } from "../../../../lib/request";

export async function GET(request: NextRequest) {
  const actor = await resolveRequestActor(request);

  if (!actor || actor.source !== "dashboard") {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const tokens = await listExtensionTokens(actor.userId);
  return NextResponse.json({ tokens });
}

export async function POST(request: NextRequest) {
  const actor = await resolveRequestActor(request);

  if (!actor || actor.source !== "dashboard") {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = (await request.json()) as { label?: string };
  const label = body.label?.trim() || "Primary browser";

  try {
    const payload = await issueExtensionToken(actor.userId, label);
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create extension token." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const actor = await resolveRequestActor(request);

  if (!actor || actor.source !== "dashboard") {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = (await request.json()) as { tokenId?: string };

  if (!body.tokenId) {
    return NextResponse.json({ error: "tokenId is required." }, { status: 400 });
  }

  try {
    await revokeExtensionToken(actor.userId, body.tokenId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to revoke extension token." },
      { status: 500 },
    );
  }
}

