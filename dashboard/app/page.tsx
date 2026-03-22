import { headers } from "next/headers";
import { Suspense } from "react";

import { ExtensionAccessCard } from "../components/ExtensionAccessCard";
import { LandingPage } from "../components/LandingPage";
import { SearchBox } from "../components/SearchBox";
import { SignOutButton } from "../components/SignOutButton";
import { StatsBar } from "../components/StatsBar";
import { ZombieTabs } from "../components/ZombieTabs";
import { Card, CardContent } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { getOptionalUser } from "../lib/request";
import { getDashboardStats, getRecentSessions, getZombieTabs, listExtensionTokens } from "../lib/supabase";

function StatsFallback() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="border-border/70 bg-card/70">
          <CardContent className="space-y-3 p-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ZombieFallback() {
  return (
    <Card className="border-border/70 bg-card/70">
      <CardContent className="space-y-3 p-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-24 w-full" />
      </CardContent>
    </Card>
  );
}

export default async function HomePage() {
  const optionalUser = await getOptionalUser();

  if (!optionalUser) {
    return <LandingPage />;
  }

  const user = optionalUser;
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "";
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";
  const dashboardUrl = host ? `${protocol}://${host}` : "";
  const statsPromise = getDashboardStats(user.id);
  const zombieTabsPromise = getZombieTabs(user.id);
  const initialSessions = await getRecentSessions(user.id, 12);
  const extensionTokens = await listExtensionTokens(user.id);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-border/60 bg-card/50 px-6 py-10 shadow-2xl shadow-background/30 backdrop-blur md:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">Tab Graveyard</p>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Turn tab chaos into named sessions, searchable memory, and fewer browser zombie outbreaks.
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
              Group live tabs with Gemini, archive them into Supabase, cache hot queries in Upstash, and restore them when your brain finally remembers what that Redis article was called.
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-border/60 bg-background/60 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Signed in as</p>
                <p className="mt-2 text-2xl font-semibold">{user.email ?? user.id}</p>
              </div>
              <SignOutButton />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Your archive is now private to this account. Generate a personal extension token below to connect Chrome and start saving real sessions.
            </p>
          </div>
        </div>
      </section>

      <section>
        <Suspense fallback={<StatsFallback />}>
          <StatsBar promise={statsPromise} />
        </Suspense>
      </section>

      <section>
        <SearchBox initialSessions={initialSessions} />
      </section>

      <section>
        <ExtensionAccessCard initialTokens={extensionTokens} dashboardUrl={dashboardUrl} />
      </section>

      <section>
        <Suspense fallback={<ZombieFallback />}>
          <ZombieTabs promise={zombieTabsPromise} />
        </Suspense>
      </section>
    </main>
  );
}
