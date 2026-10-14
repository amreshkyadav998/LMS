import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Clock,
  FileText,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  Wallet,
} from "lucide-react";
import { HeroCalculator } from "@/components/landing/HeroCalculator";
import { Logo } from "@/components/Logo";
import { ButtonLink } from "@/components/ui/Button";

const STEPS = [
  { icon: UserRound, title: "Create your account", text: "Sign up with your email in under a minute." },
  { icon: BadgeCheck, title: "Instant eligibility", text: "Share basic details and get an eligibility decision right away." },
  { icon: FileText, title: "Upload salary slip", text: "Attach your latest salary slip as a PDF, JPG or PNG." },
  { icon: SlidersHorizontal, title: "Configure & apply", text: "Pick an amount and tenure, review the repayment and apply." },
];

const HIGHLIGHTS = [
  { icon: Banknote, label: "Loan amount", value: "₹50K–₹5L" },
  { icon: Clock, label: "Tenure", value: "30–365 days" },
  { icon: Wallet, label: "Interest", value: "12% p.a. flat" },
];

const CRITERIA = [
  "Aged between 23 and 50 years",
  "Monthly income of ₹25,000 or more",
  "Salaried or self-employed",
  "A valid PAN card",
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-stone-200/70 bg-cream/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm font-medium text-stone-600 md:flex">
            <a href="#how-it-works" className="transition hover:text-black">How it works</a>
            <a href="#eligibility" className="transition hover:text-black">Eligibility</a>
          </nav>
          <div className="flex items-center gap-2">
            <ButtonLink href="/login" variant="ghost">Log in</ButtonLink>
            <ButtonLink href="/signup">Get started</ButtonLink>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative isolate overflow-hidden bg-cream">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgb(15_23_42/0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgb(15_23_42/0.04)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />

          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
            <div>
              <span className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-1 text-xs font-semibold text-stone-600 ring-1 ring-stone-200">
                <ShieldCheck className="size-3.5" /> Transparent pricing · No hidden charges
              </span>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-black sm:text-5xl">
                Personal loans,{" "}
                <span>
                  approved in minutes
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone-600">
                Check your eligibility instantly, upload your salary slip and choose a loan that fits your
                budget — with the full repayment amount shown upfront.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/signup" size="lg">
                  Apply now <ArrowRight className="size-4" />
                </ButtonLink>
                <ButtonLink href="/login" size="lg" variant="secondary">
                  I have an account
                </ButtonLink>
              </div>
              <dl className="mt-12 grid max-w-lg grid-cols-3 gap-4">
                {HIGHLIGHTS.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="min-w-0 rounded-xl bg-white p-3 ring-1 ring-stone-200 sm:p-4">
                    <Icon className="hidden size-5 text-black sm:block" />
                    <dt className="text-xs font-medium text-stone-500 sm:mt-3">{label}</dt>
                    <dd className="mt-0.5 text-xs font-bold text-black sm:text-sm">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <HeroCalculator />
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-16 border-t border-stone-200/70 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold text-stone-500">How it works</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-black">Four simple steps to your loan</h2>
              <p className="mt-3 text-stone-600">A fully digital journey — no paperwork, no branch visits.</p>
            </div>
            <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map(({ icon: Icon, title, text }, index) => (
                <li key={title} className="rounded-xl border border-stone-200 bg-white p-6">
                                    <span className="flex size-11 items-center justify-center rounded-lg bg-cream text-black ring-1 ring-stone-200">
                    <Icon className="size-5" />
                  </span>
                  <p className="mt-5 text-xs font-semibold text-stone-400">Step {index + 1}</p>
                  <h3 className="mt-1 font-semibold text-black">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Eligibility */}
        <section id="eligibility" className="scroll-mt-16 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl bg-black px-6 py-12 sm:px-12 lg:flex lg:items-center lg:justify-between lg:gap-12">
              <div className="relative max-w-xl">
                <h2 className="text-3xl font-bold tracking-tight text-white">Who can apply?</h2>
                <p className="mt-3 text-stone-300">
                  Our rule engine checks these criteria the moment you submit your details.
                </p>
                <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                  {CRITERIA.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm font-medium text-stone-200">
                      <BadgeCheck className="size-5 shrink-0 text-stone-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative mt-10 lg:mt-0">
                <ButtonLink href="/signup" size="lg" className="bg-white text-black shadow-none hover:bg-stone-100">
                  Check my eligibility <ArrowRight className="size-4" />
                </ButtonLink>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-stone-200/70">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-stone-500 sm:flex-row sm:px-6 lg:px-8">
          <Logo />
          <p>© {new Date().getFullYear()} LoanFlow. Loan Management System.</p>
        </div>
      </footer>
    </div>
  );
}
