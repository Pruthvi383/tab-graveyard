import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { resolveRequestActor } from "../../../../lib/request";
import { recordTabEvents } from "../../../../lib/supabase";
import type { Tab } from "../../../../lib/types";

export async function POST(request: NextRequest) {
  const actor = await resolveRequestActor(request);

  if (!actor) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = (await request.json()) as { tabs?: Tab[] };
  const tabs = Array.isArray(body.tabs) ? body.tabs : [];

  if (!tabs.length) {
    return NextResponse.json({ ok: true, suspended: 0 });
  }

  await recordTabEvents(actor.userId, "suspended", tabs);

  return NextResponse.json({ ok: true, suspended: tabs.length });
}
