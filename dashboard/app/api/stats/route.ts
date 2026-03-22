import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { resolveRequestActor } from "../../../lib/request";
import { getDashboardStats } from "../../../lib/supabase";

export async function GET(request: NextRequest) {
  const actor = await resolveRequestActor(request);

  if (!actor) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const stats = await getDashboardStats(actor.userId);

  return NextResponse.json(stats);
}
