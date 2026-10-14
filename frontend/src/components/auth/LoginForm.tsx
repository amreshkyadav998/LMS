"use client";

import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { homePathForRole } from "@/lib/access";
import { api, errorMessage } from "@/lib/api";
import type { User } from "@/types";
import { DemoAccounts } from "./DemoAccounts";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const { user } = await api<{ user: User }>("/auth/login", { method: "POST", body: { email, password } });
      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
      const next = searchParams.get("next");
      // Only follow same-site relative paths; the proxy re-checks access anyway.
      router.replace(next?.startsWith("/") && !next.startsWith("//") ? next : homePathForRole(user.role));
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">Welcome back</h1>
      <p className="mt-2 text-sm text-slate-500">Log in to continue to your account.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
        <Field label="Email address" htmlFor="email">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            leading={<Mail className="size-4" />}
            required
          />
        </Field>
        <Field label="Password" htmlFor="password" error={error ?? undefined}>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            leading={<Lock className="size-4" />}
            invalid={Boolean(error)}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="rounded p-1 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            }
            required
          />
        </Field>
        <Button type="submit" size="lg" className="w-full" loading={submitting} disabled={!email || !password}>
          Log in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        New to LoanFlow?{" "}
        <Link href="/signup" className="font-semibold text-brand-600 hover:text-brand-700">
          Create an account
        </Link>
      </p>

      <DemoAccounts
        onSelect={(account) => {
          setEmail(account.email);
          setPassword(account.password);
          setError(null);
        }}
      />
    </div>
  );
}
