import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Michael Chen",
    role: "Crypto Investor",
    content:
      "Satoshi Vertex has transformed my passive income strategy. The returns are consistent, and the platform is incredibly user-friendly. I've been mining for 6 months and couldn't be happier.",
    rating: 5,
  },
  {
    name: "Sarah Williams",
    role: "Tech Entrepreneur",
    content:
      "The transparency and security measures are top-notch. I appreciate the detailed analytics and instant withdrawals. This is the future of Bitcoin mining.",
    rating: 5,
  },
  {
    name: "David Rodriguez",
    role: "Financial Analyst",
    content:
      "After researching multiple mining platforms, Satoshi Vertex stood out for its enterprise-grade infrastructure and competitive returns. Highly recommended for serious miners.",
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="border-b border-border bg-background py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight md:text-5xl">
            Trusted by Miners Worldwide
          </h2>
          <p className="text-pretty text-lg text-muted-foreground">
            Join thousands of satisfied miners earning consistent returns
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-border bg-card">
              <CardContent className="p-6">
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="mb-6 leading-relaxed text-muted-foreground">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
