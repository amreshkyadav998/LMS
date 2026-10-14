import type { Metadata } from "next";
import { PortalOverview } from "@/components/portal/PortalOverview";

export const metadata: Metadata = { title: "My loans" };

export default function PortalPage() {
  return <PortalOverview />;
}
