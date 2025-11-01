"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FaqSection() {
  const faqs = [
    {
      question: "How does crypto mining investment work?",
      answer:
        "When you invest in our mining contracts, you're purchasing hash power from our state-of-the-art mining facilities. Your investment is used to mine cryptocurrency, and you receive regular returns based on the mining output. We handle all the technical aspects, maintenance, and operational costs.",
    },
    {
      question: "What are the expected returns on investment?",
      answer:
        "Returns vary based on market conditions, mining difficulty, and the contract tier you choose. Historically, our investors have seen annual returns ranging from 18-28%. The Starter plan offers daily returns, while Professional and Enterprise plans provide higher frequency payouts with enhanced returns.",
    },
    {
      question: "How often will I receive payouts?",
      answer:
        "Payout frequency depends on your chosen contract. Starter plans receive daily payouts, Professional plans offer weekly distributions, and Enterprise contracts provide fortnightly or monthly payouts with compounded returns. All payouts are automatically transferred to your wallet.",
    },
    {
      question: "What cryptocurrencies can I mine?",
      answer:
        "Our mining operations primarily focus on Bitcoin (BTC) and Ethereum (ETH), which represent 75% of our hash power. We also mine select altcoins including Litecoin, Bitcoin Cash, and other profitable proof-of-work cryptocurrencies based on market conditions.",
    },
    {
      question: "Is my investment secure?",
      answer:
        "Yes. We employ bank-grade security measures including cold storage for mined assets, multi-signature wallets, and comprehensive insurance coverage. Our mining facilities are secured with 24/7 surveillance, and all operations are fully compliant with regulatory requirements.",
    },
    {
      question: "Can I withdraw my investment early?",
      answer:
        "Contract terms vary by tier. Starter plans offer flexible withdrawal after 30 days with a small fee. Professional plans have a 90-day minimum commitment, while Enterprise contracts are typically locked for 6-12 months for optimal returns. Early withdrawal options are available with adjusted terms.",
    },
    {
      question: "What are the fees and costs?",
      answer:
        "Our fees are transparent and competitive. We charge a 15% management fee on mining profits, which covers electricity, maintenance, hardware upgrades, and operational costs. There are no hidden fees, and the initial investment amount is clearly stated for each contract tier.",
    },
    {
      question: "How do I get started?",
      answer:
        "Getting started is simple: choose your preferred mining contract, complete the registration process with KYC verification, fund your account via cryptocurrency or bank transfer, and start earning returns. Our support team is available 24/7 to assist you through the onboarding process.",
    },
  ]

  return (
    <section className="py-24 px-4 bg-background">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Frequently Asked Questions</h2>
          <p className="text-xl text-muted-foreground text-balance">
            Everything you need to know about investing in crypto mining
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border border-border rounded-lg px-6 bg-card">
              <AccordionTrigger className="text-left hover:no-underline py-6">
                <span className="font-semibold text-lg pr-4">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
