import { NextResponse } from "next/server";

import type { EmailOtpType } from "@supabase/supabase-js";

import { createServerSupabaseClient } from "../../../lib/supabase";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";
  const redirectTo = new URL(next, origin);
  const failure = new URL("/login?error=Unable%20to%20confirm%20email", origin);

  if (!tokenHash || !type) {
    return NextResponse.redirect(failure);
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.redirect(failure);
  }

  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash: tokenHash,
  });

  if (error) {
    return NextResponse.redirect(failure);
  }

  return NextResponse.redirect(redirectTo);
}

