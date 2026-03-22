import { createHash, randomBytes } from "node:crypto";

import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

import {
  createServerSupabaseClient,
  findExtensionTokenByHash,
  getCurrentUser,
  insertExtensionToken,
  listExtensionTokens,
  markExtensionTokenUsed,
  revokeExtensionToken,
} from "./supabase";

export interface RequestActor {
  source: "dashboard" | "extension";
  userId: string;
}

function hashToken(rawToken: string) {
  return createHash("sha256").update(rawToken).digest("hex");
}

export async function getOptionalUser() {
  return getCurrentUser();
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function getDashboardRequestActor() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return {
    source: "dashboard" as const,
    userId: user.id,
  };
}

export async function resolveRequestActor(request: NextRequest): Promise<RequestActor | null> {
  const extensionToken = request.headers.get("x-extension-token")?.trim();

  if (extensionToken) {
    const token = await findExtensionTokenByHash(hashToken(extensionToken));

    if (!token) {
      return null;
    }

    await markExtensionTokenUsed(token.id);

    return {
      source: "extension",
      userId: token.user_id,
    };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return {
    source: "dashboard",
    userId: user.id,
  };
}

export async function issueExtensionToken(userId: string, label: string) {
  const tokenPrefix = randomBytes(4).toString("hex");
  const secret = randomBytes(24).toString("base64url");
  const rawToken = `tg_${tokenPrefix}_${secret}`;

  const summary = await insertExtensionToken({
    userId,
    label,
    tokenHash: hashToken(rawToken),
    tokenPrefix,
  });

  return {
    token: rawToken,
    summary,
  };
}

export { listExtensionTokens, revokeExtensionToken };

