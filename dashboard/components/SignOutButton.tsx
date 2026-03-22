"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { createBrowserSupabaseClient } from "../lib/supabase-browser";
import { Button } from "./ui/button";

export function SignOutButton() {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      onClick={async () => {
        const supabase = createBrowserSupabaseClient();

        if (!supabase) {
          return;
        }

        await supabase.auth.signOut();
        router.replace("/login");
        router.refresh();
      }}
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </Button>
  );
}
