import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CtaSection() {
  return (
    <section className="border-b border-border bg-background py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-balance text-3xl font-bold tracking-tight md:text-5xl">
            Ready to Start Mining Bitcoin?
          </h2>
          <p className="mb-10 text-pretty text-lg text-muted-foreground">
            Join Satoshi Vertex today and start earning passive income with our enterprise-grade mining infrastructure.
            No technical knowledge required.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="group w-full sm:w-auto">
              Create Your Account
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
              Schedule a Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
