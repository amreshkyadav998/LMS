import type { Metadata } from "next";
import { CollectionModule } from "@/components/dashboard/modules/CollectionModule";

export const metadata: Metadata = { title: "Collection" };

export default function CollectionPage() {
  return <CollectionModule />;
}
