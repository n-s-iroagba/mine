import { Button } from "@/components/ui/button"
import { ArrowRight, Zap } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-2 text-sm">
            <Zap className="h-4 w-4 text-accent" />
            <span className="text-muted-foreground">Powered by cutting-edge mining technology</span>
          </div>

          <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            Mine Bitcoin with{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Satoshi Vertex
            </span>
          </h1>

          <p className="mb-10 text-pretty text-lg text-muted-foreground md:text-xl">
            Join thousands of miners earning passive income through our enterprise-grade mining infrastructure. Start
            mining Bitcoin today with flexible contracts and guaranteed returns.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="group w-full sm:w-auto">
              Start Mining Now
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
              View Contracts
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-foreground md:text-4xl">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-foreground md:text-4xl">50K+</div>
              <div className="text-sm text-muted-foreground">Active Miners</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-foreground md:text-4xl">$2.5M</div>
              <div className="text-sm text-muted-foreground">Daily Volume</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-foreground md:text-4xl">24/7</div>
              <div className="text-sm text-muted-foreground">Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
