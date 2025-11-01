import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { InvestmentChartsSection } from "@/components/investment-charts-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { MiningContractsSection } from "@/components/mining-contracts-section"
import { FaqSection } from "@/components/faq-section"
import { ContactSection } from "@/components/contact-section"
import { CtaSection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <InvestmentChartsSection />
        <TestimonialsSection />
        <MiningContractsSection />
        <FaqSection />
        <ContactSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
