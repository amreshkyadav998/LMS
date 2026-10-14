import type { Metadata } from "next";
import { SanctionModule } from "@/components/dashboard/modules/SanctionModule";

export const metadata: Metadata = { title: "Sanction" };

export default function SanctionPage() {
  return <SanctionModule />;
}
