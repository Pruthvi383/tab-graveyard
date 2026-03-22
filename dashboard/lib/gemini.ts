import { createHash } from "node:crypto";

import { GoogleGenerativeAI } from "@google/generative-ai";

import { readCache, writeCache } from "./redis";
import { getSessionCandidates, getSessionsByIds } from "./supabase";
import type { Session, Tab, TabGroupResult } from "./types";

function getModel() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return null;
  }

  const client = new GoogleGenerativeAI(apiKey);
  return client.getGenerativeModel({ model: "gemini-2.5-flash" });
}

function extractJson<T>(value: string): T {
  const trimmed = value.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const source = fenced?.[1] ?? trimmed;
  return JSON.parse(source) as T;
}

function sanitizeGroups(groups: TabGroupResult[]) {
  return groups
    .filter((group) => group.topic && Array.isArray(group.tabs) && group.tabs.length > 0)
    .slice(0, 8)
    .map((group) => ({
      topic: group.topic.trim(),
      emoji: group.emoji?.trim() || "🪦",
      tabs: group.tabs
        .filter((tab) => tab.title && tab.url)
        .map((tab) => ({
          title: tab.title.trim(),
          url: tab.url.trim(),
          favicon: tab.favicon,
          description: tab.description,
          id: tab.id,
          lastAccessed: tab.lastAccessed,
        })),
    }));
}

function fallbackGroupName(tab: Tab) {
  const text = `${tab.title} ${tab.url} ${tab.description ?? ""}`.toLowerCase();

  if (/(github|gitlab|vercel|docker|cloudflare|cursor|vscode|supabase|redis|next\.js|react|typescript|tailwind)/.test(text)) {
    return { topic: "Builder's Bench", emoji: "🛠️" };
  }

  if (/(docs|documentation|guide|reference|readme|api|tutorial|stack overflow|mdn)/.test(text)) {
    return { topic: "Research Stack", emoji: "📚" };
  }

  if (/(youtube|loom|netflix|spotify|podcast|playlist|watch)/.test(text)) {
    return { topic: "Watch Later", emoji: "🎬" };
  }

  if (/(x\.com|twitter|linkedin|instagram|reddit|news|feed)/.test(text)) {
    return { topic: "Social Orbit", emoji: "🛰️" };
  }

  if (/(gmail|calendar|notion|slack|linear|figma|drive|meet|zoom)/.test(text)) {
    return { topic: "Ops Desk", emoji: "🗂️" };
  }

  if (/(amazon|flipkart|shop|cart|pricing|compare|product)/.test(text)) {
    return { topic: "Shopping Trail", emoji: "🛒" };
  }

  return { topic: "Loose Ends", emoji: "🪦" };
}

function heuristicGroupTabs(tabs: Tab[]) {
  const groups = new Map<string, TabGroupResult>();

  for (const tab of tabs) {
    const { topic, emoji } = fallbackGroupName(tab);
    const existing = groups.get(topic);

    if (existing) {
      existing.tabs.push(tab);
    } else {
      groups.set(topic, { topic, emoji, tabs: [tab] });
    }
  }

  return { groups: [...groups.values()].slice(0, 8) };
}

function hashTabs(tabs: Tab[]) {
  return createHash("sha1")
    .update(JSON.stringify(tabs.map((tab) => [tab.title, tab.url])))
    .digest("hex");
}

export async function groupTabs(input: { userId: string; tabs: Tab[] }) {
  const cacheKey = `groups:${input.userId}`;
  const signature = hashTabs(input.tabs);
  const cached = await readCache<{ signature: string; payload: { groups: TabGroupResult[] } }>(cacheKey);

  if (cached && cached.signature === signature) {
    return cached.payload;
  }

  const model = getModel();

  if (!model) {
    const payload = heuristicGroupTabs(input.tabs);
    await writeCache(cacheKey, { signature, payload }, 300);
    return payload;
  }

  const prompt = [
    "You are organizing browser tabs into semantic study or work sessions.",
    "Return ONLY valid JSON matching this schema:",
    '{"groups":[{"topic":"string","emoji":"string","tabs":[{"title":"string","url":"string","favicon":"string"}]}]}',
    "Rules:",
    "- Group by semantic meaning, not by domain.",
    "- Maximum 8 groups.",
    "- Include every tab exactly once.",
    "- Keep topic labels concise and useful.",
    "- Preserve input title and URL values faithfully.",
    "",
    "Tabs:",
    JSON.stringify(
      input.tabs.map((tab) => ({
        title: tab.title,
        url: tab.url,
        favicon: tab.favicon ?? "",
      })),
    ),
  ].join("\n");

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = extractJson<{ groups: TabGroupResult[] }>(text);
    const payload = { groups: sanitizeGroups(parsed.groups ?? []) };

    await writeCache(cacheKey, { signature, payload }, 300);

    return payload;
  } catch {
    const payload = heuristicGroupTabs(input.tabs);
    await writeCache(cacheKey, { signature, payload }, 300);
    return payload;
  }
}

function scoreSession(query: string, session: Session) {
  const haystack = [session.topic, ...session.tabs.map((tab) => `${tab.title} ${tab.url}`)]
    .join(" ")
    .toLowerCase();

  return query
    .toLowerCase()
    .split(/\W+/)
    .filter(Boolean)
    .reduce((score, term) => (haystack.includes(term) ? score + 1 : score), 0);
}

export async function searchSessions(input: { userId: string; query: string }) {
  const normalizedQuery = input.query.trim();
  const cacheKey = `search:${input.userId}:${createHash("sha1").update(normalizedQuery.toLowerCase()).digest("hex")}`;
  const cached = await readCache<Session[]>(cacheKey);

  if (cached) {
    return cached;
  }

  const candidates = await getSessionCandidates(input.userId, 100);

  if (!candidates.length) {
    return [];
  }

  const model = getModel();

  if (!model) {
    const sessions = await getSessionsByIds(
      input.userId,
      candidates.map((candidate) => candidate.id),
    );

    const fallback = sessions
      .map((session) => ({ session, score: scoreSession(normalizedQuery, session) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((entry) => entry.session);

    await writeCache(cacheKey, fallback, 120);

    return fallback;
  }

  const prompt = [
    `User query: "${normalizedQuery}".`,
    "From the session list below, return the top 3 matching session IDs as a JSON array.",
    "Return ONLY valid JSON. Example: [\"uuid-1\", \"uuid-2\"]",
    "",
    JSON.stringify(
      candidates.map((candidate) => ({
        id: candidate.id,
        topic: candidate.topic,
        createdAt: candidate.created_at,
      })),
    ),
  ].join("\n");

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const ids = extractJson<string[]>(text).slice(0, 3);
    const sessions = await getSessionsByIds(input.userId, ids);

    await writeCache(cacheKey, sessions, 120);

    return sessions;
  } catch {
    const sessions = await getSessionsByIds(
      input.userId,
      candidates.map((candidate) => candidate.id),
    );

    const fallback = sessions
      .map((session) => ({ session, score: scoreSession(normalizedQuery, session) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((entry) => entry.session);

    await writeCache(cacheKey, fallback, 120);

    return fallback;
  }
}
