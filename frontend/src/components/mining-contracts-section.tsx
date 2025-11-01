'use client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"

import { useApiQuery } from "@/hooks/useApi"
import { miningContractService } from "@/services"
    const features= [
      "Flexible payouts",
      "Real-time analytics",
      "24/7 dedicated support",
      "180-day contract",
      "Premium rewards",
      "Custom configurations",
    ]


export function MiningContractsSection() {

    const { data: contracts = [], isLoading, error, refetch } = useApiQuery(
      ['admin-mining-contracts'],
      () => miningContractService.getAllContracts()
    );
  return (
    <section id="contracts" className="border-b border-border bg-muted/30 py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight md:text-5xl">
            Choose Your Mining Contract
          </h2>
          <p className="text-pretty text-lg text-muted-foreground">
            Flexible plans designed to match your investment goals and mining ambitions
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {contracts.map((contract) => (
            <Card
              key={contract.id}
              className={`relative border-border bg-card transition-all hover:shadow-xl ${
                "border-primary shadow-lg" 
              }`}
            >
     
     

              <CardHeader>
                <CardTitle className="text-2xl">{contract.period}</CardTitle>
                <CardDescription>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-foreground">{contract.periodReturn}%</span>
             
                  </div>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Hash Rate</span>
                    <span className="font-semibold">{contract.miningServer?.hashRate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Power</span>
                    <span className="font-semibold">{contract.miningServer?.powerConsumptionInKwH}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Returns</span>
                    <span className="font-semibold text-accent">
                      {contract.periodReturn}% {contract.period}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 border-t border-border pt-6">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/10">
                        <Check className="h-3 w-3 text-accent" />
                      </div>
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter>
                <Button className="w-full" variant={ "outline"}>
                  Get Started
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

