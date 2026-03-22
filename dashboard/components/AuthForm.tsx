"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

import { createBrowserSupabaseClient } from "../lib/supabase-browser";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";

type Mode = "signin" | "signup";

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(searchParams.get("message"));
  const [error, setError] = useState<string | null>(searchParams.get("error"));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    const supabase = createBrowserSupabaseClient();

    if (!supabase) {
      setError("Supabase is not configured.");
      setIsSubmitting(false);
      return;
    }

    try {
      if (mode === "signup") {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/confirm`,
          },
        });

        if (authError) {
          throw authError;
        }

        if (data.session) {
          router.replace("/");
          router.refresh();
          return;
        }

        setMessage("Account created. Check your inbox to confirm your email, then come back to sign in.");
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) {
          throw authError;
        }

        router.replace("/");
        router.refresh();
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="border-border/70 bg-card/80 shadow-2xl shadow-background/30">
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">Email + password</Badge>
          <Badge variant="outline">Supabase Auth</Badge>
        </div>
        <CardTitle className="text-3xl">Get Your Graveyard</CardTitle>
        <CardDescription>
          Create an account, connect the extension, and your archived tab sessions become personal instead of shared demo data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-border/70 bg-background/40 p-1">
          <Button type="button" variant={mode === "signup" ? "default" : "ghost"} onClick={() => setMode("signup")}>
            Sign Up
          </Button>
          <Button type="button" variant={mode === "signin" ? "default" : "ghost"} onClick={() => setMode("signin")}>
            Sign In
          </Button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />
          <Input
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 6 characters"
            minLength={6}
            required
          />
          <Button className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Working..." : mode === "signup" ? "Create Account" : "Sign In"}
          </Button>
        </form>

        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <p className="text-sm text-muted-foreground">
          By continuing, you can archive tabs privately, search your own sessions, and create a personal extension token for Chrome.
        </p>
        <p className="text-sm text-muted-foreground">
          Need the dashboard later? <Link href="/" className="underline underline-offset-4">Open Tab Graveyard home</Link>.
        </p>
      </CardContent>
    </Card>
  );
}
