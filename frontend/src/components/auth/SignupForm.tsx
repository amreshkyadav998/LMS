"use client";

import { Lock, Mail, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { ApiClientError, api, errorMessage } from "@/lib/api";
import type { User } from "@/types";

type FormErrors = Partial<Record<"name" | "email" | "password" | "form", string>>;

function validate(name: string, email: string, password: string): FormErrors {
  const errors: FormErrors = {};
  if (name.trim().length < 2) errors.name = "Name must be at least 2 characters";
  if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = "Enter a valid email address";
  if (password.length < 8) errors.password = "Password must be at least 8 characters";
  else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    errors.password = "Password must contain at least one letter and one number";
  }
  return errors;
}

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validate(name, email, password);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      await api<{ user: User }>("/auth/signup", { method: "POST", body: { name, email, password } });
      toast.success("Account created! Let's get your loan application started.");
      router.replace("/portal/apply");
      router.refresh();
    } catch (err) {
      const isConflict = err instanceof ApiClientError && err.status === 409;
      setErrors(isConflict ? { email: errorMessage(err) } : { form: errorMessage(err) });
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Create your account</h1>
      <p className="mt-2 text-sm text-slate-500">Start your loan application in just a few minutes.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
        <Field label="Full name" htmlFor="name" error={errors.name}>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Priya Sharma"
            value={name}
            onChange={(event) => setName(event.target.value)}
            leading={<UserRound className="size-4" />}
            invalid={Boolean(errors.name)}
          />
        </Field>
        <Field label="Email address" htmlFor="email" error={errors.email}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            leading={<Mail className="size-4" />}
            invalid={Boolean(errors.email)}
          />
        </Field>
        <Field
          label="Password"
          htmlFor="password"
          error={errors.password}
          hint="At least 8 characters, including a letter and a number."
        >
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Create a password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            leading={<Lock className="size-4" />}
            invalid={Boolean(errors.password)}
          />
        </Field>
        {errors.form && <p className="text-sm font-medium text-rose-600">{errors.form}</p>}
        <Button type="submit" size="lg" className="w-full" loading={submitting}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
          Log in
        </Link>
      </p>
    </div>
  );
}
