import { use } from "react";
import { Flame } from "lucide-react";

import type { ZombieTab } from "../lib/types";
import { getZombieTabKey } from "../lib/tab-keys";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";

interface ZombieTabsProps {
  promise: Promise<ZombieTab[]>;
}

export function ZombieTabs({ promise }: ZombieTabsProps) {
  const zombieTabs = use(promise);

  return (
    <Card className="border-border/70 bg-card/70">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">Zombie Tabs</CardTitle>
          <p className="mt-2 text-sm text-muted-foreground">
            Repeat offenders that keep crawling back into your sessions.
          </p>
        </div>
        <Flame className="h-5 w-5 text-destructive" />
      </CardHeader>
      <CardContent>
        {zombieTabs.length ? (
          <ScrollArea className="h-64 pr-4">
            <div className="space-y-3">
              {zombieTabs.map((tab, index) => (
                <div key={getZombieTabKey(tab, index)} className="rounded-xl border border-border/60 bg-background/50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{tab.title}</p>
                      <p className="truncate text-sm text-muted-foreground">{tab.url}</p>
                    </div>
                    <Badge variant="destructive">{tab.appearances} sessions</Badge>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="rounded-xl border border-dashed border-border/70 bg-background/40 p-6 text-sm text-muted-foreground">
            No zombie tabs yet. Seed data or archive more sessions to surface repeat offenders.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
