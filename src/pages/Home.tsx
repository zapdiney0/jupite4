import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Truck, Shield, Clock, Globe, Star, ArrowRight } from "lucide-react";

export default function Home() {
  const [trackingNumber, setTrackingNumber] = useState("");

  const features = [
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Express delivery in 24-48 hours to major cities worldwide"
    },
    {
      icon: Shield,
      title: "Secure Shipping",
      description: "Your packages are protected with comprehensive insurance coverage"
    },
    {
      icon: Clock,
      title: "Real-time Tracking",
      description: "Track your shipment every step of the way with live updates"
    },
    {
      icon: Globe,
      title: "Global Network",
      description: "Shipping to over 200 countries and territories worldwide"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      company: "Tech Startup",
      content: "SwiftShip has been incredibly reliable for our business shipments. Fast and professional service every time.",
      rating: 5
    },
    {
      name: "Michael Chen",
      company: "E-commerce Store",
      content: "The tracking system is fantastic. Our customers love being able to see exactly where their packages are.",
      rating: 5
    },
    {
      name: "Emma Davis",
      company: "Small Business Owner",
      content: "Competitive pricing and excellent customer service. They handle our international shipments seamlessly.",
      rating: 5
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-gradient text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            Ship Faster, Ship Smarter
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto animate-fade-in">
            Reliable shipping solutions for businesses and individuals. Track your packages in real-time with our advanced logistics network.
          </p>
          
          {/* Quick Track */}
          <div className="max-w-md mx-auto mb-8 animate-fade-in">
            <div className="flex gap-2">
              <Input
                placeholder="Enter tracking number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="bg-background/10 border-background/20 text-primary-foreground placeholder:text-primary-foreground/70"
              />
              <Link to={`/track?number=${trackingNumber}`}>
                <Button variant="secondary" size="icon">
                  <Search className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Link to="/track">
              <Button size="lg" variant="secondary" className="shadow-medium">
                Track Your Package
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/services">
              <Button size="lg" variant="outline" className="border-background/20 text-primary-foreground hover:bg-background/10">
                Our Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose SwiftShip?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We provide comprehensive shipping solutions with cutting-edge technology and exceptional service quality.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center shadow-soft hover:shadow-medium transition-smooth">
                <CardContent className="p-6">
                  <div className="w-16 h-16 primary-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">1M+</div>
              <div className="text-muted-foreground">Packages Delivered</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">200+</div>
              <div className="text-muted-foreground">Countries Served</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-muted-foreground">On-Time Delivery</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">Customer Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-muted-foreground text-lg">
              Trusted by thousands of businesses and individuals worldwide
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="shadow-soft hover:shadow-medium transition-smooth">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-secondary fill-secondary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.company}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 primary-gradient text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Ship with SwiftShip?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of satisfied customers who trust us with their shipments
          </p>
          <Link to="/track">
            <Button size="lg" variant="secondary" className="shadow-medium">
              Get Started Today
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}