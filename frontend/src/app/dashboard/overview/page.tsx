import type { Metadata } from "next";
import { OverviewModule } from "@/components/dashboard/modules/OverviewModule";

export const metadata: Metadata = { title: "Overview" };

export default function OverviewPage() {
  return <OverviewModule />;
}
