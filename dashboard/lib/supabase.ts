import { cookies } from "next/headers";

import { createServerClient, type SetAllCookies } from "@supabase/ssr";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

import type { DashboardStats, ExtensionTokenSummary, Session, Tab, ZombieTab } from "./types";

type SessionRow = {
  id: string;
  user_id: string;
  topic: string;
  tabs: unknown;
  created_at: string;
  restored_count: number | null;
};

function getPublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

function getAdminEnv() {
  const publicEnv = getPublicEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!publicEnv || !serviceRoleKey) {
    return null;
  }

  return { ...publicEnv, serviceRoleKey };
}

function mapTabs(value: unknown): Tab[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((entry): entry is Tab => {
      return Boolean(
        entry &&
          typeof entry === "object" &&
          typeof (entry as Tab).title === "string" &&
          typeof (entry as Tab).url === "string",
      );
    })
    .map((tab) => ({
      id: tab.id,
      title: tab.title,
      url: tab.url,
      favicon: tab.favicon,
      description: tab.description,
      lastAccessed: tab.lastAccessed,
    }));
}

function mapSession(row: SessionRow): Session {
  return {
    id: row.id,
    userId: row.user_id,
    topic: row.topic,
    tabs: mapTabs(row.tabs),
    createdAt: row.created_at,
    restoredCount: row.restored_count ?? 0,
  };
}

function getAdminClient() {
  const env = getAdminEnv();

  if (!env) {
    return null;
  }

  return createClient(env.url, env.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function createServerSupabaseClient() {
  const env = getPublicEnv();

  if (!env) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components may not be able to set cookies. Middleware handles refreshes.
        }
      },
    },
  });
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ?? null;
}

export async function getRecentSessions(userId: string, limit = 8): Promise<Session[]> {
  const supabase = getAdminClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("sessions")
    .select("id, user_id, topic, tabs, created_at, restored_count")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data.map(mapSession);
}

export async function getSessionCandidates(userId: string, limit = 100) {
  const supabase = getAdminClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("sessions")
    .select("id, topic, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data;
}

export async function getSessionsByIds(userId: string, ids: string[]): Promise<Session[]> {
  if (!ids.length) {
    return [];
  }

  const supabase = getAdminClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("sessions")
    .select("id, user_id, topic, tabs, created_at, restored_count")
    .eq("user_id", userId)
    .in("id", ids);

  if (error || !data) {
    return [];
  }

  const ordered = new Map(data.map((row) => [row.id, mapSession(row as SessionRow)]));

  return ids.map((id) => ordered.get(id)).filter((session): session is Session => Boolean(session));
}

export async function saveSession(input: { userId: string; topic: string; tabs: Tab[] }) {
  const supabase = getAdminClient();

  if (!supabase) {
    throw new Error("Supabase environment variables are not configured.");
  }

  const { data, error } = await supabase
    .from("sessions")
    .insert({
      user_id: input.userId,
      topic: input.topic,
      tabs: input.tabs,
    })
    .select("id, user_id, topic, tabs, created_at, restored_count")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to save session.");
  }

  return mapSession(data as SessionRow);
}

export async function incrementRestoreCount(sessionId: string, userId: string) {
  const supabase = getAdminClient();

  if (!supabase) {
    throw new Error("Supabase environment variables are not configured.");
  }

  const { data: current, error: fetchError } = await supabase
    .from("sessions")
    .select("restored_count")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .single();

  if (fetchError || !current) {
    throw new Error(fetchError?.message ?? "Unable to load session restore count.");
  }

  const restoredCount = (current.restored_count ?? 0) + 1;

  const { error } = await supabase
    .from("sessions")
    .update({ restored_count: restoredCount })
    .eq("id", sessionId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  return restoredCount;
}

export async function recordTabEvents(
  userId: string,
  eventType: string,
  tabs: Array<Pick<Tab, "title" | "url">>,
) {
  const supabase = getAdminClient();

  if (!supabase || !tabs.length) {
    return;
  }

  const rows = tabs.map((tab) => ({
    user_id: userId,
    event_type: eventType,
    tab_title: tab.title,
    tab_url: tab.url,
  }));

  await supabase.from("tab_events").insert(rows);
}

async function countSessions(
  supabase: SupabaseClient,
  userId: string,
  options?: { since?: string },
) {
  let query = supabase
    .from("sessions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (options?.since) {
    query = query.gte("created_at", options.since);
  }

  const { count } = await query;

  return count ?? 0;
}

export async function getZombieTabs(userId: string, limit = 12): Promise<ZombieTab[]> {
  const supabase = getAdminClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("sessions")
    .select("id, tabs")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(250);

  if (error || !data) {
    return [];
  }

  const counter = new Map<string, ZombieTab>();

  for (const row of data) {
    const seenInSession = new Set<string>();

    for (const tab of mapTabs(row.tabs)) {
      const key = tab.url.trim().toLowerCase();

      if (!key || seenInSession.has(key)) {
        continue;
      }

      seenInSession.add(key);

      const current = counter.get(key);

      if (current) {
        current.appearances += 1;
      } else {
        counter.set(key, {
          title: tab.title,
          url: tab.url,
          appearances: 1,
        });
      }
    }
  }

  return [...counter.values()]
    .filter((tab) => tab.appearances >= 5)
    .sort((a, b) => b.appearances - a.appearances)
    .slice(0, limit);
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const supabase = getAdminClient();

  if (!supabase) {
    return {
      totalArchived: 0,
      sessionsThisWeek: 0,
      ramSavedGb: 0,
      zombieCount: 0,
    };
  }

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [totalArchived, sessionsThisWeek, zombieTabs, recentSessions] = await Promise.all([
    countSessions(supabase, userId),
    countSessions(supabase, userId, { since: weekAgo }),
    getZombieTabs(userId),
    getRecentSessions(userId, 250),
  ]);

  const totalTabs = recentSessions.reduce((count, session) => count + session.tabs.length, 0);
  const ramSavedGb = Number((totalTabs * 0.12).toFixed(1));

  return {
    totalArchived,
    sessionsThisWeek,
    ramSavedGb,
    zombieCount: zombieTabs.length,
  };
}

type ExtensionTokenRow = {
  id: string;
  user_id: string;
  label: string;
  token_hash: string;
  token_prefix: string;
  created_at: string;
  last_used_at: string | null;
};

function mapExtensionToken(row: ExtensionTokenRow): ExtensionTokenSummary {
  return {
    id: row.id,
    label: row.label,
    tokenPrefix: row.token_prefix,
    createdAt: row.created_at,
    lastUsedAt: row.last_used_at,
  };
}

export async function listExtensionTokens(userId: string): Promise<ExtensionTokenSummary[]> {
  const supabase = getAdminClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("extension_tokens")
    .select("id, user_id, label, token_prefix, token_hash, created_at, last_used_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((row) => mapExtensionToken(row as ExtensionTokenRow));
}

export async function insertExtensionToken(input: {
  userId: string;
  label: string;
  tokenHash: string;
  tokenPrefix: string;
}) {
  const supabase = getAdminClient();

  if (!supabase) {
    throw new Error("Supabase environment variables are not configured.");
  }

  const { data, error } = await supabase
    .from("extension_tokens")
    .insert({
      user_id: input.userId,
      label: input.label,
      token_hash: input.tokenHash,
      token_prefix: input.tokenPrefix,
    })
    .select("id, user_id, label, token_prefix, token_hash, created_at, last_used_at")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to create extension token.");
  }

  return mapExtensionToken(data as ExtensionTokenRow);
}

export async function revokeExtensionToken(userId: string, tokenId: string) {
  const supabase = getAdminClient();

  if (!supabase) {
    throw new Error("Supabase environment variables are not configured.");
  }

  const { error } = await supabase
    .from("extension_tokens")
    .delete()
    .eq("id", tokenId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function findExtensionTokenByHash(tokenHash: string) {
  const supabase = getAdminClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("extension_tokens")
    .select("id, user_id, label, token_prefix, token_hash, created_at, last_used_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as ExtensionTokenRow;
}

export async function markExtensionTokenUsed(tokenId: string) {
  const supabase = getAdminClient();

  if (!supabase) {
    return;
  }

  await supabase
    .from("extension_tokens")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", tokenId);
}
