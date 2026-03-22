"use client";

import { useDeferredValue, useEffect, useState, useTransition } from "react";
import { Search, Sparkles, X } from "lucide-react";

import type { Session } from "../lib/types";
import { SessionCard } from "./SessionCard";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Skeleton } from "./ui/skeleton";

interface SearchBoxProps {
  initialSessions: Session[];
}

const searchExamples = [
  "Redis session from Tuesday",
  "browser memory rabbit hole",
  "that docs stack about auth",
];

export function SearchBox({ initialSessions }: SearchBoxProps) {
  const [query, setQuery] = useState("");
  const [sessions, setSessions] = useState(initialSessions);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isTransitionPending, startTransition] = useTransition();
  const deferredQuery = useDeferredValue(query);
  const trimmedQuery = deferredQuery.trim();
  const searchActive = trimmedQuery.length > 0;

  useEffect(() => {
    if (!trimmedQuery) {
      setSessions(initialSessions);
      setHasSearched(false);
      return;
    }

    if (trimmedQuery.length < 3) {
      return;
    }

    const controller = new AbortController();

    void (async () => {
      try {
        setIsSearching(true);

        const response = await fetch("/api/tabs/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: trimmedQuery,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as { sessions: Session[] };

        startTransition(() => {
          setSessions(payload.sessions);
          setHasSearched(true);
        });
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
      } finally {
        setIsSearching(false);
      }
    })();

    return () => controller.abort();
  }, [initialSessions, trimmedQuery]);

  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-card/70">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-xl">Search Your Graveyard</CardTitle>
            {searchActive ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setQuery("");
                  setSessions(initialSessions);
                  setHasSearched(false);
                }}
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            Ask naturally. Try “I was studying Redis last Tuesday...” or “that YouTube rabbit hole on browser memory”.
          </p>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="I was studying Redis last Tuesday..."
              className="h-12 pl-10 text-base"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {searchExamples.map((example) => (
              <button
                key={example}
                type="button"
                className="rounded-full border border-border/70 bg-background/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
                onClick={() => setQuery(example)}
              >
                {example}
              </button>
            ))}
          </div>
          {searchActive && trimmedQuery.length < 3 ? (
            <p className="mt-3 text-sm text-muted-foreground">Type at least 3 characters to search your saved sessions.</p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/60">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="text-xl">{searchActive ? "Search Results" : "Recent Sessions"}</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchActive ? "Gemini is matching your language against recent archived sessions." : "Your latest AI-grouped tab piles live here."}
            </p>
          </div>
          <Sparkles className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[32rem] pr-4">
            <div className="space-y-4">
              {isSearching || isTransitionPending ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="rounded-xl border border-border/60 bg-background/40 p-6">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="mt-3 h-4 w-32" />
                    <Skeleton className="mt-6 h-28 w-full" />
                  </div>
                ))
              ) : sessions.length ? (
                sessions.map((session) => <SessionCard key={session.id} session={session} />)
              ) : (
                <div className="rounded-xl border border-dashed border-border/70 bg-background/40 p-6 text-sm text-muted-foreground">
                  {hasSearched
                    ? "No matching sessions yet. Try a different phrase, or archive more sessions from the extension."
                    : "No archived sessions yet. Save your first grouped set in the extension and it will show up here."}
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
