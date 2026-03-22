import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { resolveRequestActor } from "../../../../lib/request";
import { incrementRestoreCount, recordTabEvents, saveSession } from "../../../../lib/supabase";
import type { Tab } from "../../../../lib/types";

export async function POST(request: NextRequest) {
  const actor = await resolveRequestActor(request);

  if (!actor) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = (await request.json()) as {
    action?: string;
    sessionId?: string;
    topic?: string;
    tabs?: Tab[];
  };

  try {
    if (body.action === "increment_restore") {
      if (!body.sessionId) {
        return NextResponse.json({ error: "sessionId is required." }, { status: 400 });
      }

      const restoredCount = await incrementRestoreCount(body.sessionId, actor.userId);
      return NextResponse.json({ ok: true, restoredCount });
    }

    if (!body.topic || !Array.isArray(body.tabs) || !body.tabs.length) {
      return NextResponse.json({ error: "topic and tabs are required." }, { status: 400 });
    }

    const session = await saveSession({
      userId: actor.userId,
      topic: body.topic,
      tabs: body.tabs,
    });

    await recordTabEvents(actor.userId, "archived", body.tabs);

    return NextResponse.json({ ok: true, session });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save session." },
      { status: 500 },
    );
  }
}
