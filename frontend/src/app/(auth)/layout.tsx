import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/Logo";

const POINTS = [
  "Eligibility decision in seconds",
  "Transparent simple-interest pricing",
  "Track your loan from application to closure",
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden overflow-hidden bg-brand-950 p-12 lg:flex lg:flex-col lg:justify-between">

        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.04)_1px,transparent_1px)] bg-[size:44px_44px]" />

        <Logo inverted className="relative" />

        <div className="relative max-w-md">
          <h2 className="text-4xl leading-tight font-bold tracking-tight text-white">
            Smarter lending for borrowers and the teams who serve them.
          </h2>
          <ul className="mt-8 space-y-4">
            {POINTS.map((point) => (
              <li key={point} className="flex items-center gap-3 text-slate-300">
                <CheckCircle2 className="size-5 text-slate-400" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative grid max-w-md grid-cols-3 gap-4 rounded-xl border border-white/10 p-5">
          {[
            ["₹5L", "Max loan"],
            ["12%", "Flat p.a."],
            ["365d", "Max tenure"],
          ].map(([value, label]) => (
            <div key={label}>
              <p className="text-xl font-bold text-white">{value}</p>
              <p className="text-xs text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex flex-col bg-white">
        <div className="p-6 lg:hidden">
          <Logo />
        </div>
        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </main>
    </div>
  );
}
