import { LenisWrapper } from "@/components/landing/lenis-wrapper";
import { LandingNavbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { CourtsSection } from "@/components/landing/courts-section";
import { EventsSection } from "@/components/landing/events-section";
import { LandingFooter } from "@/components/landing/footer";

export const metadata = {
  title: "CourtManager — Book a Court",
  description:
    "Check live availability, compare courts, and secure your spot instantly.",
};

export default function LandingPage() {
  return (
    <LenisWrapper>
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
        <LandingNavbar />
        <HeroSection />
        <CourtsSection />
        <EventsSection />
        <LandingFooter />
      </div>
    </LenisWrapper>
  );
}
