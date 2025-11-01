import { Card, CardContent } from "@/components/ui/card"
import { Shield, Zap, TrendingUp, Lock } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "Bank-grade security with multi-signature wallets and cold storage protection for your mining rewards.",
  },
  {
    icon: Zap,
    title: "High Performance",
    description: "State-of-the-art ASIC miners delivering optimal hash rates with 99.9% uptime guarantee.",
  },
  {
    icon: TrendingUp,
    title: "Guaranteed Returns",
    description:
      "Transparent and predictable returns with flexible contract periods tailored to your investment goals.",
  },
  {
    icon: Lock,
    title: "Instant Withdrawals",
    description: "Access your mining rewards anytime with instant withdrawals to your preferred wallet.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="border-b border-border bg-muted/30 py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight md:text-5xl">Why Choose Satoshi Vertex</h2>
          <p className="text-pretty text-lg text-muted-foreground">
            Industry-leading mining infrastructure designed for maximum profitability and security
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card key={index} className="border-border bg-card transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
