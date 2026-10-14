import type { Metadata } from "next";
import { ApplyWizard } from "@/components/portal/apply/ApplyWizard";

export const metadata: Metadata = { title: "Apply for a loan" };

export default function ApplyPage() {
  return <ApplyWizard />;
}
