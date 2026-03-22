"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";

import type { Session } from "../lib/types";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { TabGroup } from "./TabGroup";

const sessionDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

async function restoreTabs(session: Session) {
  const chromeApi =
    typeof window !== "undefined"
      ? (window as Window & {
          chrome?: {
            tabs?: {
              create?: (properties: { url: string; active?: boolean }) => Promise<unknown> | unknown;
            };
          };
        }).chrome
      : undefined;

  if (chromeApi?.tabs?.create) {
    for (const tab of session.tabs) {
      await chromeApi.tabs.create({ url: tab.url, active: false });
    }
  } else {
    for (const tab of session.tabs) {
      window.open(tab.url, "_blank", "noopener,noreferrer");
    }
  }

  await fetch("/api/tabs/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "increment_restore",
      sessionId: session.id,
    }),
  });
}

interface SessionCardProps {
  session: Session;
}

export function SessionCard({ session }: SessionCardProps) {
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoredCount, setRestoredCount] = useState(session.restoredCount);

  return (
    <Card className="border-border/70 bg-card/75">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <CardTitle className="text-lg">{session.topic}</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{session.tabs.length} archived tabs</Badge>
              <Badge variant="outline">{sessionDateFormatter.format(new Date(session.createdAt))}</Badge>
            </div>
          </div>
          <Badge variant="outline">{restoredCount} restores</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-52 pr-4">
          <TabGroup topic={session.topic} emoji={session.emoji} tabs={session.tabs} defaultOpen />
        </ScrollArea>
      </CardContent>
      <Separator />
      <CardFooter className="justify-between gap-3 pt-6">
        <p className="text-sm text-muted-foreground">Bring this whole stack back into your browser.</p>
        <Button
          variant="ghost"
          onClick={async () => {
            try {
              setIsRestoring(true);
              await restoreTabs(session);
              setRestoredCount((count) => count + 1);
            } finally {
              setIsRestoring(false);
            }
          }}
          disabled={isRestoring}
        >
          <RotateCcw className="h-4 w-4" />
          {isRestoring ? "Restoring..." : "Restore"}
        </Button>
      </CardFooter>
    </Card>
  );
}
