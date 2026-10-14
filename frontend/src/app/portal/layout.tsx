import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { UserMenu } from "@/components/UserMenu";

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-stone-200/70 bg-cream/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Logo href="/portal" />
          <UserMenu />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
