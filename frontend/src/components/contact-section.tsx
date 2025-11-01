import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Phone, MapPin, Clock } from "lucide-react"

export function ContactSection() {
  return (
    <section className="py-24 px-4 bg-muted/30">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Get In Touch</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Our investment advisors are ready to help you start your crypto mining journey
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Email Us</h3>
                  <a
                    href="mailto:invest@satoshivertex.com"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    invest@satoshivertex.com
                  </a>
                  <br />
                  <a
                    href="mailto:support@satoshivertex.com"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    support@satoshivertex.com
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Phone className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Call Us</h3>
                  <a
                    href="tel:+18005284746"
                    className="text-sm text-muted-foreground hover:text-accent transition-colors"
                  >
                    +1 (800) 528-4746
                  </a>
                  <br />
                  <a
                    href="tel:+442071234567"
                    className="text-sm text-muted-foreground hover:text-accent transition-colors"
                  >
                    +44 (20) 7123-4567
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Visit Us</h3>
                  <p className="text-sm text-muted-foreground">
                    123 Blockchain Avenue
                    <br />
                    San Francisco, CA 94105
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Business Hours</h3>
                  <p className="text-sm text-muted-foreground">
                    Mon - Fri: 9:00 AM - 6:00 PM
                    <br />
                    24/7 Support Available
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <Card className="border-primary/20 max-w-2xl mx-auto">
            <CardContent className="pt-8 pb-8">
              <h3 className="text-2xl font-bold mb-4">Schedule a Consultation</h3>
              <p className="text-muted-foreground mb-6">
                Speak with our investment specialists to create a customized mining strategy
              </p>
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Book Appointment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
