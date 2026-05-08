import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
      
      <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-muted border border-border px-4 py-1.5 text-caption text-primary">
            <Zap className="h-3.5 w-3.5" />
            <span>Now with Expo Design System</span>
          </div>

          {/* Heading */}
          <h1 className="text-h1 sm:text-display text-foreground tracking-tight">
            Everything you need to{" "}
            <span className="text-primary">build apps</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-body-lg text-muted-foreground max-w-2xl mx-auto">
            A full-stack framework with powerful cloud services to help you move faster at every stage of the app lifecycle.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-expo-lg px-6 py-3 text-body font-medium transition-all duration-200 hover:shadow-expo-md"
            >
              Get started for free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="lg"
              className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-expo-lg px-6 py-3 text-body font-medium"
            >
              Read the docs
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 gap-8 sm:grid-cols-4">
          {[
            { value: "50K+", label: "Discord members" },
            { value: "80%", label: "Choose Expo" },
            { value: "40K+", label: "GitHub stars" },
            { value: "500K+", label: "Projects created" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-h3 text-foreground">{stat.value}</div>
              <div className="mt-1 text-body-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
