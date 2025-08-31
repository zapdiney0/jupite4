import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, Zap, Globe, Package, Clock, Shield, ArrowRight, CheckCircle } from "lucide-react";

export default function Services() {
  const services = [
    {
      icon: Zap,
      name: "Express Delivery",
      description: "Next-day delivery for urgent shipments",
      features: ["24-48 hour delivery", "Priority handling", "Real-time tracking", "Insurance included"],
      price: "Starting at $25",
      popular: true
    },
    {
      icon: Truck,
      name: "Standard Shipping",
      description: "Reliable delivery for everyday needs",
      features: ["3-5 day delivery", "Package tracking", "Standard insurance", "Cost effective"],
      price: "Starting at $10",
      popular: false
    },
    {
      icon: Globe,
      name: "International",
      description: "Worldwide shipping to 200+ countries",
      features: ["Global network", "Customs handling", "Multiple carriers", "Door-to-door service"],
      price: "Starting at $35",
      popular: false
    },
    {
      icon: Package,
      name: "Freight Services",
      description: "Heavy and bulk shipment solutions",
      features: ["Large packages", "Pallet shipping", "Special handling", "Dedicated support"],
      price: "Custom pricing",
      popular: false
    }
  ];

  const additionalServices = [
    {
      icon: Shield,
      title: "Package Insurance",
      description: "Comprehensive coverage for your valuable shipments"
    },
    {
      icon: Clock,
      title: "Scheduled Delivery",
      description: "Choose specific delivery time slots that work for you"
    },
    {
      icon: Package,
      title: "Packaging Services",
      description: "Professional packaging for fragile and valuable items"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Our Shipping Services</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Choose from our range of shipping solutions designed to meet your specific needs, 
          from express delivery to international freight services.
        </p>
      </div>

      {/* Main Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {services.map((service, index) => (
          <Card key={index} className={`relative shadow-soft hover:shadow-medium transition-smooth ${
            service.popular ? 'ring-2 ring-primary' : ''
          }`}>
            {service.popular && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                Most Popular
              </Badge>
            )}
            <CardHeader className="text-center">
              <div className="w-16 h-16 primary-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                <service.icon className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-xl">{service.name}</CardTitle>
              <p className="text-muted-foreground text-sm">{service.description}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="text-center">
                <div className="text-lg font-semibold text-primary mb-3">{service.price}</div>
                <Button className="w-full primary-gradient">
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Services */}
      <section className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Additional Services</h2>
          <p className="text-muted-foreground">
            Enhance your shipping experience with our value-added services
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {additionalServices.map((service, index) => (
            <Card key={index} className="text-center shadow-soft hover:shadow-medium transition-smooth">
              <CardContent className="p-6">
                <div className="w-12 h-12 primary-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                  <service.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                <p className="text-muted-foreground text-sm">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Service Comparison */}
      <section className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Service Comparison</h2>
          <p className="text-muted-foreground">
            Compare our shipping options to find the perfect fit for your needs
          </p>
        </div>
        
        <Card className="shadow-soft overflow-x-auto">
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left p-4 font-semibold">Feature</th>
                  <th className="text-center p-4 font-semibold">Express</th>
                  <th className="text-center p-4 font-semibold">Standard</th>
                  <th className="text-center p-4 font-semibold">International</th>
                  <th className="text-center p-4 font-semibold">Freight</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="p-4">Delivery Time</td>
                  <td className="p-4 text-center">24-48h</td>
                  <td className="p-4 text-center">3-5 days</td>
                  <td className="p-4 text-center">5-15 days</td>
                  <td className="p-4 text-center">Custom</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4">Weight Limit</td>
                  <td className="p-4 text-center">30kg</td>
                  <td className="p-4 text-center">30kg</td>
                  <td className="p-4 text-center">30kg</td>
                  <td className="p-4 text-center">No limit</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4">Tracking</td>
                  <td className="p-4 text-center">
                    <CheckCircle className="w-5 h-5 text-accent mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <CheckCircle className="w-5 h-5 text-accent mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <CheckCircle className="w-5 h-5 text-accent mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <CheckCircle className="w-5 h-5 text-accent mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="p-4">Insurance</td>
                  <td className="p-4 text-center">$500</td>
                  <td className="p-4 text-center">$100</td>
                  <td className="p-4 text-center">$200</td>
                  <td className="p-4 text-center">Custom</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>

      {/* CTA */}
      <section className="text-center primary-gradient text-primary-foreground rounded-lg p-12 shadow-medium">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Ready to Ship Your Package?
        </h2>
        <p className="text-lg mb-6 opacity-90">
          Get a quote or start shipping with SwiftShip today
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" variant="secondary">
            Get Quote
          </Button>
          <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
            Contact Sales
          </Button>
        </div>
      </section>
    </div>
  );
}