"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { Button, Card, Input } from "@/components/ui";
import { useRouter, useSearchParams } from "next/navigation";

const supabase = supabaseBrowser();

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/events";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password, options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`
  } });
        if (error) throw error;
      }
      router.push(next);
      router.refresh();
    } catch (err: any) {
      setMsg(err?.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-md gap-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm text-gray-600">
          Private staycation journal for you and your spouse.
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={onSubmit} className="grid gap-3">
          <label className="text-sm font-semibold">Email</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />

          <label className="text-sm font-semibold">Password</label>
          <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />

          {msg ? <p className="text-sm text-red-600">{msg}</p> : null}

          <Button disabled={busy} className="mt-2">
            {busy ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
          </Button>

          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-left text-sm font-semibold text-gray-600 hover:text-gray-900"
          >
            {mode === "login" ? "Need an account? Sign up" : "Already have an account? Log in"}
          </button>
        </form>
      </Card>
    </div>
  );
}
