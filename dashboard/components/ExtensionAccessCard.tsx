"use client";

import { Copy, PlugZap, Shield, Trash2 } from "lucide-react";
import { useState } from "react";

import type { ExtensionTokenSummary } from "../lib/types";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";

interface ExtensionAccessCardProps {
  initialTokens: ExtensionTokenSummary[];
  dashboardUrl: string;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function ExtensionAccessCard({ initialTokens, dashboardUrl }: ExtensionAccessCardProps) {
  const [tokens, setTokens] = useState(initialTokens);
  const [label, setLabel] = useState("Primary browser");
  const [latestToken, setLatestToken] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState("");

  async function generateToken() {
    setIsBusy(true);
    setError("");

    try {
      const response = await fetch("/api/extension/tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          label: label.trim() || "Primary browser",
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        token?: string;
        summary?: ExtensionTokenSummary;
      };

      if (!response.ok || !payload.token || !payload.summary) {
        throw new Error(payload.error || "Unable to generate token.");
      }

      setLatestToken(payload.token);
      setTokens((current) => [payload.summary!, ...current]);
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "Unable to generate token.");
    } finally {
      setIsBusy(false);
    }
  }

  async function revokeToken(tokenId: string) {
    setIsBusy(true);
    setError("");

    try {
      const response = await fetch("/api/extension/tokens", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tokenId,
        }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Unable to revoke token.");
      }

      setTokens((current) => current.filter((token) => token.id !== tokenId));
    } catch (revokeError) {
      setError(revokeError instanceof Error ? revokeError.message : "Unable to revoke token.");
    } finally {
      setIsBusy(false);
    }
  }

  async function copyValue(value: string) {
    if (!value || typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(value);
  }

  return (
    <Card className="border-border/70 bg-card/70">
      <CardHeader className="gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-xl">Connect The Extension</CardTitle>
            <CardDescription className="mt-2">
              Generate a personal token, paste it into the Chrome popup once, and the extension will archive tabs into your own account.
            </CardDescription>
          </div>
          <Badge variant="outline">
            <Shield className="mr-2 h-3.5 w-3.5" />
            Personal access
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <Input value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Primary browser" />
          <Button onClick={generateToken} disabled={isBusy}>
            <PlugZap className="h-4 w-4" />
            {isBusy ? "Generating..." : "Generate Token"}
          </Button>
        </div>

        <div className="rounded-xl border border-border/70 bg-background/40 p-4">
          <p className="text-sm font-medium">Dashboard URL</p>
          <div className="mt-3 flex gap-2">
            <Input value={dashboardUrl} readOnly />
            <Button type="button" variant="ghost" onClick={() => copyValue(dashboardUrl)}>
              <Copy className="h-4 w-4" />
              Copy
            </Button>
          </div>
        </div>

        {latestToken ? (
          <div className="rounded-xl border border-border/70 bg-background/40 p-4">
            <p className="text-sm font-medium">New Extension Token</p>
            <p className="mt-2 text-sm text-muted-foreground">
              This is shown once. Paste it into the extension popup and keep it somewhere safe.
            </p>
            <div className="mt-3 flex gap-2">
              <Input value={latestToken} readOnly />
              <Button type="button" variant="ghost" onClick={() => copyValue(latestToken)}>
                <Copy className="h-4 w-4" />
                Copy
              </Button>
            </div>
          </div>
        ) : null}

        <div className="rounded-xl border border-border/70 bg-background/40 p-4">
          <p className="text-sm font-medium">Setup Steps</p>
          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
            <p>1. Reload the unpacked Chrome extension so it picks up the latest popup.</p>
            <p>2. Paste the dashboard URL and token into the Connect panel in the extension.</p>
            <p>3. Click Save Connection, then Group My Tabs.</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">Active Tokens</p>
            <Badge variant="outline">{tokens.length}</Badge>
          </div>
          <ScrollArea className="h-48 pr-4">
            <div className="space-y-3">
              {tokens.length ? (
                tokens.map((token) => (
                  <div key={token.id} className="rounded-xl border border-border/70 bg-background/40 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{token.label}</p>
                        <p className="mt-1 text-sm text-muted-foreground">Prefix: {token.tokenPrefix}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Created {dateFormatter.format(new Date(token.createdAt))}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {token.lastUsedAt
                            ? `Last used ${dateFormatter.format(new Date(token.lastUsedAt))}`
                            : "Not used yet"}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={isBusy}
                        onClick={() => revokeToken(token.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Revoke
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-border/70 bg-background/30 p-4 text-sm text-muted-foreground">
                  No extension tokens yet. Generate one to connect Chrome.
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </CardContent>
    </Card>
  );
}
