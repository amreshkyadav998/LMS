"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { UserMenu } from "@/components/UserMenu";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { canAccessModule } from "@/lib/access";
import { ROLE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { NAV_ITEMS } from "./navigation";

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user } = useCurrentUser();

  // Only modules the role can open are rendered; the API enforces the same rules.
  const items = user ? NAV_ITEMS.filter((item) => canAccessModule(user.role, item.module)) : [];

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Logo href={items[0]?.href ?? "/dashboard"} />
      </div>
      <div className="px-3 pt-4">
        <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          {user?.role === "admin" ? "All modules" : "Your module"}
        </p>
        <nav className="space-y-1">
          {!user &&
            Array.from({ length: 2 }, (_, index) => (
              <div key={index} className="mx-1 h-12 animate-pulse rounded-xl bg-slate-100" />
            ))}
          {items.map(({ href, label, description, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onNavigate}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 transition",
                  active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100 hover:text-black",
                )}
              >
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-lg transition",
                    active ? "bg-brand-600 text-white" : "bg-black/5 text-slate-600 group-hover:bg-white",
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{label}</span>
                  <span className={cn("block truncate text-xs", active ? "text-brand-600/80" : "text-slate-400")}>
                    {description}
                  </span>
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
      {user && (
        <div className="mt-auto p-4">
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs text-slate-500">Signed in as</p>
            <p className="mt-0.5 text-sm font-semibold text-black">{ROLE_LABELS[user.role]}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200/80 bg-cream lg:block">
        <SidebarNav />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-slate-950/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative h-full w-72 animate-scale-in bg-cream shadow-elevated">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-3 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              aria-label="Close menu"
            >
              <X className="size-5" />
            </button>
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-slate-200/80 bg-cream/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="-ml-1 rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
          <p className="hidden text-sm font-medium text-slate-500 lg:block">Operations Dashboard</p>
          <UserMenu />
        </header>
        <main className="px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
