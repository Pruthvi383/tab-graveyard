import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { searchSessions } from "../../../../lib/gemini";
import { resolveRequestActor } from "../../../../lib/request";
import { getRecentSessions } from "../../../../lib/supabase";

export async function POST(request: NextRequest) {
  const actor = await resolveRequestActor(request);

  if (!actor) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = (await request.json()) as { query?: string };
  const query = body.query?.trim() ?? "";

  if (!query) {
    const sessions = await getRecentSessions(actor.userId, 8);
    return NextResponse.json({ sessions });
  }

  const sessions = await searchSessions({ userId: actor.userId, query });
  return NextResponse.json({ sessions });
}
