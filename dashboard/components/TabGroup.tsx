"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

import type { Tab } from "../lib/types";
import { getTabListKey } from "../lib/tab-keys";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface TabGroupProps {
  topic: string;
  emoji?: string;
  tabs: Tab[];
  defaultOpen?: boolean;
}

export function TabGroup({ topic, emoji = "🪦", tabs, defaultOpen = false }: TabGroupProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card className="border-border/60 bg-background/50">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
        <div className="space-y-2">
          <CardTitle className="text-base">
            <span className="mr-2">{emoji}</span>
            {topic}
          </CardTitle>
          <Badge variant="outline">{tabs.length} tabs</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setOpen((value) => !value)}>
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CardHeader>
      {open ? (
        <CardContent className="space-y-3 pt-0">
          {tabs.map((tab, index) => (
            <a
              key={getTabListKey(tab, index)}
              href={tab.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-start justify-between gap-3 rounded-lg border border-border/50 bg-card/40 p-3 transition-colors hover:bg-accent/30"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{tab.title}</p>
                <p className="truncate text-xs text-muted-foreground">{tab.url}</p>
              </div>
              <ExternalLink className="mt-0.5 h-4 w-4 text-muted-foreground" />
            </a>
          ))}
        </CardContent>
      ) : null}
    </Card>
  );
}
