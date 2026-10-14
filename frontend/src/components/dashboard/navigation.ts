import { Banknote, ClipboardCheck, LayoutDashboard, Users, Wallet, type LucideIcon } from "lucide-react";
import type { DashboardModule } from "@/lib/access";

export interface NavItem {
  module: DashboardModule;
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { module: "overview", label: "Overview", description: "Portfolio at a glance", href: "/dashboard/overview", icon: LayoutDashboard },
  { module: "sales", label: "Sales", description: "Leads & sign-ups", href: "/dashboard/sales", icon: Users },
  { module: "sanction", label: "Sanction", description: "Review applications", href: "/dashboard/sanction", icon: ClipboardCheck },
  { module: "disbursement", label: "Disbursement", description: "Release funds", href: "/dashboard/disbursement", icon: Banknote },
  { module: "collection", label: "Collection", description: "Record repayments", href: "/dashboard/collection", icon: Wallet },
];
