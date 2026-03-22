import Link from "next/link";
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  Chrome,
  Clock3,
  LockKeyhole,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";

const benefits = [
  {
    title: "Group tabs by meaning",
    description: "Gemini organizes open tabs into useful sessions like research, work, videos, and admin instead of dumping them by domain.",
    icon: Bot,
  },
  {
    title: "Find sessions from memory",
    description: 'Search with phrases like “that Redis study session from Tuesday” and recover the right stack without remembering exact page titles.',
    icon: Search,
  },
  {
    title: "Keep every archive private",
    description: "Each user signs in, gets a personal extension token, and sees only their own sessions and restore history.",
    icon: LockKeyhole,
  },
];

const workflow = [
  {
    step: "1",
    title: "Sign in once",
    body: "Create an account and open your private dashboard.",
  },
  {
    step: "2",
    title: "Connect Chrome",
    body: "Generate a personal token and paste it into the extension popup.",
  },
  {
    step: "3",
    title: "Archive and restore",
    body: "Group active tabs, save the session, and recover it later from search.",
  },
];

const trustPoints = [
  {
    title: "Built for deployment",
    description: "Next.js 16, Supabase Auth, extension tokens, and deploy-ready metadata are already wired.",
    icon: ShieldCheck,
  },
  {
    title: "Browser-friendly flow",
    description: "The extension can archive, suspend, search, and restore without asking users to keep the dashboard open.",
    icon: Chrome,
  },
  {
    title: "Lower tab anxiety",
    description: "Stop keeping tab piles around just because you are afraid to lose context.",
    icon: BrainCircuit,
  },
];

const faqs = [
  {
    question: "Does this work for real users or only seeded demo data?",
    answer: "Real users. Accounts are authenticated with Supabase, data is user-scoped, and the extension uses personal tokens instead of a shared secret.",
  },
  {
    question: "Can I revoke a browser if I no longer trust it?",
    answer: "Yes. Each extension token can be revoked from the dashboard, and users can create a fresh token whenever they need one.",
  },
  {
    question: "Do I need exact titles to recover a session?",
    answer: "No. Search is built around natural-language recall, so users can describe the session in plain English and get the best matches back.",
  },
];

export function LandingPage() {
  const primaryCtaClass =
    "inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-transparent bg-[linear-gradient(135deg,hsl(var(--chart-2)),hsl(var(--chart-1)))] px-6 text-sm font-semibold text-black shadow-lg shadow-[hsl(var(--chart-1)/0.22)] transition-transform duration-150 hover:-translate-y-0.5";
  const secondaryCtaClass =
    "inline-flex h-12 items-center justify-center rounded-xl border border-border/70 bg-background/70 px-6 text-sm font-medium text-foreground transition-colors hover:bg-accent/60";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-border/60 bg-card/45 px-5 py-5 shadow-2xl shadow-background/30 backdrop-blur md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-background/80 text-lg">
              🪦
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">Tab Graveyard</p>
              <p className="text-sm text-muted-foreground">AI tab management for overloaded browsers.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/login" className={secondaryCtaClass}>
              Sign In
            </Link>
            <Link href="/login" className={primaryCtaClass}>
              Start Free
            </Link>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[2.5rem] border border-border/60 bg-card/50 px-6 py-10 shadow-2xl shadow-background/30 backdrop-blur md:px-8 md:py-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--chart-2)/0.18),transparent_28%),radial-gradient(circle_at_85%_15%,hsl(var(--chart-1)/0.18),transparent_22%),radial-gradient(circle_at_bottom_right,hsl(var(--chart-5)/0.14),transparent_28%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Chrome Extension</Badge>
              <Badge variant="outline">Private user accounts</Badge>
              <Badge variant="outline">AI search + grouping</Badge>
            </div>

            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Save tab chaos now.
                <br />
                Restore the right context later.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Tab Graveyard turns open tabs into named sessions, stores them in your private account, and helps you recover them with natural language instead of tab hoarding.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/login" className={primaryCtaClass}>
                Create Your Archive
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/login" className={secondaryCtaClass}>
                Open Dashboard
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border/60 bg-background/45 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">One-click cleanup</p>
                <p className="mt-3 text-2xl font-semibold tracking-tight">40+ tabs</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Turn a cluttered browser window into named sessions without dragging tabs around by hand.</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/45 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Search from memory</p>
                <p className="mt-3 text-2xl font-semibold tracking-tight">Plain English</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Recover sessions by describing what you were doing, not by recalling exact titles.</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/45 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Private by design</p>
                <p className="mt-3 text-2xl font-semibold tracking-tight">User-scoped</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Sessions, tokens, and restore history belong to one authenticated account.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <Card className="border-border/70 bg-background/70">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">What users see</CardTitle>
                    <CardDescription>From overloaded browser window to restorable sessions.</CardDescription>
                  </div>
                  <Badge variant="outline">UX snapshot</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-xl border border-border/60 bg-card/70 p-4">
                  <p className="text-sm text-muted-foreground">Before</p>
                  <p className="mt-2 font-medium">43 open tabs, no useful grouping, too risky to close anything.</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-card/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">🛠️ Builder&apos;s Bench</p>
                    <Badge variant="outline">12 tabs</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">Docs, repos, logs, SQL editor, deployment tabs.</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-card/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">📚 Research Stack</p>
                    <Badge variant="outline">9 tabs</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">References, architecture notes, API docs, reading list.</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-card/70 p-4">
                  <p className="text-sm text-muted-foreground">Later</p>
                  <p className="mt-2 font-medium">Search “that Redis session from Tuesday” and restore the exact stack.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-background/70">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Why it feels better</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {trustPoints.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.title} className="rounded-xl border border-border/60 bg-card/70 p-4">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <p className="mt-3 font-medium">{item.title}</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card className="border-border/70 bg-card/60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-2xl">Why people use it</CardTitle>
            </div>
            <CardDescription>The value proposition should be obvious without reading a wall of copy.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <div key={benefit.title} className="rounded-2xl border border-border/60 bg-background/40 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-card/80">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="font-medium">{benefit.title}</p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{benefit.description}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Clock3 className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-2xl">How it works</CardTitle>
            </div>
            <CardDescription>Three steps. No mystery setup flow.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {workflow.map((item) => (
              <div key={item.step} className="rounded-2xl border border-border/60 bg-background/40 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-card text-sm font-medium">
                    {item.step}
                  </div>
                  <p className="font-medium">{item.title}</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.95fr]">
        <Card className="border-border/70 bg-card/60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-2xl">Ready to ship</CardTitle>
            </div>
            <CardDescription>The product surface and deployment story are aligned now.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-background/40 p-5">
              <p className="text-sm font-medium">User auth</p>
              <p className="mt-2 text-sm text-muted-foreground">Supabase Auth with private accounts and dashboard login flow.</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/40 p-5">
              <p className="text-sm font-medium">Private data model</p>
              <p className="mt-2 text-sm text-muted-foreground">Sessions and extension tokens are designed for per-user ownership, not shared demo traffic.</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/40 p-5">
              <p className="text-sm font-medium">Deploy metadata</p>
              <p className="mt-2 text-sm text-muted-foreground">Canonical metadata, sitemap, and robots are already part of the app router setup.</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/40 p-5">
              <p className="text-sm font-medium">Extension onboarding</p>
              <p className="mt-2 text-sm text-muted-foreground">Users generate a token in the dashboard and connect their browser in one explicit flow.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/60">
          <CardHeader>
            <CardTitle className="text-2xl">FAQ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={faq.question}>
                <div className="rounded-2xl border border-border/60 bg-background/40 p-5">
                  <p className="font-medium">{faq.question}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
                </div>
                {index < faqs.length - 1 ? <Separator className="mt-4" /> : null}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="rounded-[2rem] border border-border/60 bg-card/60 px-6 py-8 shadow-xl shadow-background/20">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">Start with less friction</p>
            <h2 className="text-3xl font-semibold tracking-tight">Archive the tabs you are scared to close.</h2>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              The landing page now leads with the problem, explains the product in plain language, and gives users one clear next step instead of asking them to parse too many competing blocks.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/login" className={primaryCtaClass}>
              Start Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className={secondaryCtaClass}>
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
