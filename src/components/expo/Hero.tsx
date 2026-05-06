import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-expo-black dark:bg-expo-black">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-expo-blue/10 via-transparent to-transparent" />
      
      <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-expo-gray-900/80 px-4 py-1.5 text-caption text-expo-blue border border-expo-gray-800">
            <Zap className="h-3.5 w-3.5" />
            <span>Now with Expo Design System</span>
          </div>

          {/* Heading */}
          <h1 className="text-h1 sm:text-display text-expo-white tracking-tight">
            Everything you need to{" "}
            <span className="text-expo-blue">build apps</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-body-lg text-expo-gray-400 max-w-2xl mx-auto">
            A full-stack framework with powerful cloud services to help you move faster at every stage of the app lifecycle.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg"
              className="bg-expo-blue hover:bg-expo-blue/90 text-white rounded-expo-lg px-6 py-3 text-body font-medium transition-all duration-200 hover:shadow-expo-md"
            >
              Get started for free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="lg"
              className="text-expo-gray-300 hover:text-expo-white hover:bg-expo-gray-900 rounded-expo-lg px-6 py-3 text-body font-medium"
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
              <div className="text-h3 text-expo-white">{stat.value}</div>
              <div className="mt-1 text-body-sm text-expo-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
