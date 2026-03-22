import { redirect } from "next/navigation";

import { AuthForm } from "../../components/AuthForm";
import { getOptionalUser } from "../../lib/request";

export default async function LoginPage() {
  const user = await getOptionalUser();

  if (user) {
    redirect("/");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6">
          <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">Tab Graveyard</p>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            A real tab archive for real users, not a shared demo account.
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
            Sign in to get private sessions, natural-language search over your own history, and a personal extension token that lets Chrome archive tabs straight into your account.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-card/60 p-5">
              <p className="text-sm font-medium">Private sessions</p>
              <p className="mt-2 text-sm text-muted-foreground">Each user sees only their own archive.</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card/60 p-5">
              <p className="text-sm font-medium">Searchable memory</p>
              <p className="mt-2 text-sm text-muted-foreground">Gemini turns vague recall into useful retrieval.</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card/60 p-5">
              <p className="text-sm font-medium">Extension access</p>
              <p className="mt-2 text-sm text-muted-foreground">Generate and revoke browser tokens whenever you need.</p>
            </div>
          </div>
        </section>
        <section>
          <AuthForm />
        </section>
      </div>
    </main>
  );
}

