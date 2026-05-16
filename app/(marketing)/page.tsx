import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { PricingTeaser } from "@/components/marketing/pricing-teaser";
import { Testimonials } from "@/components/marketing/testimonials";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { CtaBanner } from "@/components/marketing/cta-banner";

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <FeatureGrid />
      <PricingTeaser />
      <Testimonials />
      <FaqAccordion />
      <CtaBanner />
    </>
  );
}
