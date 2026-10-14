import type { Metadata } from "next";
import { SalesModule } from "@/components/dashboard/modules/SalesModule";

export const metadata: Metadata = { title: "Sales" };

export default function SalesPage() {
  return <SalesModule />;
}
