import { PageLoader } from "@/components/ui/Spinner";

/** proxy.ts redirects /dashboard to the signed-in role's module; this is only a fallback. */
export default function DashboardIndexPage() {
  return <PageLoader label="Opening your dashboard…" />;
}
