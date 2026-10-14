import type { Metadata } from "next";
import { DisbursementModule } from "@/components/dashboard/modules/DisbursementModule";

export const metadata: Metadata = { title: "Disbursement" };

export default function DisbursementPage() {
  return <DisbursementModule />;
}
