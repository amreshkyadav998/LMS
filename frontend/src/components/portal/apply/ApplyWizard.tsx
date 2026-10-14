"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";
import { Alert } from "@/components/ui/Alert";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { PageLoader } from "@/components/ui/Spinner";
import { fetcher } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import type { BorrowerOverview, BorrowerProfile, Loan } from "@/types";
import { LoanConfigStep } from "./LoanConfigStep";
import { PersonalDetailsStep } from "./PersonalDetailsStep";
import { SalarySlipStep } from "./SalarySlipStep";
import { Stepper } from "./Stepper";

const STEPS = [
  { title: "Personal details", description: "Eligibility check" },
  { title: "Salary slip", description: "Upload document" },
  { title: "Loan details", description: "Amount & tenure" },
];

const STEP_HEADINGS = [
  { title: "Tell us about yourself", text: "We’ll instantly check your eligibility against our lending criteria." },
  { title: "Upload your salary slip", text: "Attach your most recent salary slip so we can verify your income." },
  { title: "Configure your loan", text: "Choose an amount and tenure. Your repayment updates as you go." },
];

function initialStep(profile: BorrowerProfile | null): number {
  if (!profile) return 0;
  return profile.salarySlip ? 2 : 1;
}

function ApplicationSubmitted({ loan }: { loan: Loan }) {
  return (
    <Card className="mx-auto max-w-xl text-center">
      <CardBody className="py-12">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-50/50">
          <CheckCircle2 className="size-9 text-emerald-500" />
        </span>
        <h1 className="mt-6 text-2xl font-bold text-black">Application submitted!</h1>
        <p className="mx-auto mt-2 max-w-sm text-slate-500">
          Your request for <span className="font-semibold text-black">{formatCurrency(loan.principal)}</span> over{" "}
          {loan.tenureDays} days is now with our sanction team.
        </p>
        <p className="mt-4 text-sm text-slate-500">
          Reference: <span className="font-mono font-semibold text-slate-700">{loan._id.slice(-8).toUpperCase()}</span>
        </p>
        <ButtonLink href="/portal" size="lg" className="mt-8">
          Track my application <ArrowRight className="size-4" />
        </ButtonLink>
      </CardBody>
    </Card>
  );
}

function Wizard({ overview, onApplied }: { overview: BorrowerOverview; onApplied: (loan: Loan) => void }) {
  const [profile, setProfile] = useState(overview.profile);
  const [step, setStep] = useState(() => initialStep(overview.profile));

  const goTo = (next: number) => {
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">Loan application</h1>
        <p className="mt-1 text-slate-500">Complete these three steps to submit your application.</p>
      </div>

      <Stepper steps={STEPS} current={step} />

      <Card>
        <div className="border-b border-slate-100 px-5 py-5 sm:px-8">
          <p className="text-xs font-semibold tracking-wider text-brand-600 uppercase">
            Step {step + 1} of {STEPS.length}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-black">{STEP_HEADINGS[step].title}</h2>
          <p className="mt-0.5 text-sm text-slate-500">{STEP_HEADINGS[step].text}</p>
        </div>
        <CardBody className="sm:px-8 sm:py-7">
          {step === 0 && (
            <PersonalDetailsStep
              profile={profile}
              onComplete={(saved) => {
                setProfile(saved);
                goTo(1);
              }}
            />
          )}
          {step === 1 && profile && (
            <SalarySlipStep
              profile={profile}
              onBack={() => goTo(0)}
              onComplete={(updated) => {
                setProfile(updated);
                goTo(2);
              }}
            />
          )}
          {step === 2 && profile && (
            <LoanConfigStep
              profile={profile}
              onBack={() => goTo(1)}
              onApplied={onApplied}
            />
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export function ApplyWizard() {
  const { data, error, isLoading, mutate } = useSWR<BorrowerOverview>("/borrower/overview", fetcher, {
    revalidateOnFocus: false,
  });
  // Kept here, above the active-loan check, because refreshing the overview
  // after applying makes the new loan the active one.
  const [submittedLoan, setSubmittedLoan] = useState<Loan | null>(null);

  if (submittedLoan) return <ApplicationSubmitted loan={submittedLoan} />;
  if (isLoading) return <PageLoader />;
  if (error || !data) {
    return <Alert tone="error" title="Could not load your application">Please refresh the page to try again.</Alert>;
  }

  if (data.activeLoan) {
    return (
      <Card className="mx-auto max-w-xl text-center">
        <CardBody className="py-12">
          <h1 className="text-xl font-bold text-black">You already have a loan in progress</h1>
          <p className="mt-2 text-slate-500">You can apply for a new loan once your current loan is closed.</p>
          <ButtonLink href="/portal" className="mt-6">
            View my loan <ArrowRight className="size-4" />
          </ButtonLink>
        </CardBody>
      </Card>
    );
  }

  return (
    <Wizard
      overview={data}
      onApplied={(loan) => {
        setSubmittedLoan(loan);
        void mutate();
      }}
    />
  );
}
