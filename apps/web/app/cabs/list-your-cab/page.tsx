import type { Metadata } from "next";
import { PartnerOnboarding } from "@/components/cabs/PartnerOnboarding";

export const metadata: Metadata = {
  title: "List Your Cab | KBC Cabs",
  description: "Join the KBC Cabs partner network.",
};

export default function ListYourCabPage() {
  return <PartnerOnboarding />;
}
