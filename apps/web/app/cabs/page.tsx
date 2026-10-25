import type { Metadata } from "next";
import { CabsBookingExperience } from "@/components/cabs/CabsBookingExperience";

export const metadata: Metadata = {
  title: "KBC Cabs | KBC Trip",
  description: "Book local city rides, hourly rentals and airport transfers with KBC Cabs.",
};

export default function CabsPage() {
  return <CabsBookingExperience />;
}
