import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { groupTabs } from "../../../../lib/gemini";
import { resolveRequestActor } from "../../../../lib/request";
import type { Tab } from "../../../../lib/types";

export async function POST(request: NextRequest) {
  const actor = await resolveRequestActor(request);

  if (!actor) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = (await request.json()) as { tabs?: Tab[] };
  const tabs = Array.isArray(body.tabs) ? body.tabs : [];

  if (!tabs.length) {
    return NextResponse.json({ error: "No tabs were provided." }, { status: 400 });
  }

  const result = await groupTabs({ userId: actor.userId, tabs });

  return NextResponse.json(result);
}
