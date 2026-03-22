"use client";

import { use } from "react";
import { Archive, Flame, Layers3, MemoryStick } from "lucide-react";

import type { DashboardStats } from "../lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

const numberFormatter = new Intl.NumberFormat("en-US");

interface StatsBarProps {
  promise: Promise<DashboardStats>;
}

export function StatsBar({ promise }: StatsBarProps) {
  const stats = use(promise);

  const metrics = [
    {
      label: "Total Archived",
      value: numberFormatter.format(stats.totalArchived),
      detail: "All session snapshots stored in Supabase for this user.",
      icon: Archive,
    },
    {
      label: "This Week",
      value: numberFormatter.format(stats.sessionsThisWeek),
      detail: "Sessions archived in the last seven days.",
      icon: Layers3,
    },
    {
      label: "RAM Saved",
      value: `${stats.ramSavedGb.toFixed(1)} GB`,
      detail: "Estimated from archived tab count using a lightweight per-tab memory model.",
      icon: MemoryStick,
    },
    {
      label: "Zombie Count",
      value: numberFormatter.format(stats.zombieCount),
      detail: "Tabs that reappear in at least five separate sessions.",
      icon: Flame,
    },
  ];

  return (
    <TooltipProvider>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <Tooltip key={metric.label}>
              <TooltipTrigger asChild>
                <Card className="border-border/70 bg-card/70 transition-transform hover:-translate-y-0.5">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold tracking-tight">{metric.value}</div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>{metric.detail}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
