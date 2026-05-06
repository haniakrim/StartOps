import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="relative overflow-hidden bg-expo-black py-24">
      <div className="absolute inset-0 bg-gradient-to-t from-expo-blue/5 via-transparent to-transparent" />
      
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-h1 sm:text-display text-expo-white">
          Ready to start building?
        </h2>
        <p className="mt-6 text-body-lg text-expo-gray-400 max-w-2xl mx-auto">
          Join thousands of developers shipping faster with Expo. Get started for free today.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            size="lg"
            className="bg-expo-blue hover:bg-expo-blue/90 text-white rounded-expo-lg px-8 py-3 text-body font-medium transition-all duration-200 hover:shadow-expo-lg"
          >
            Get started for free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="border-expo-gray-800 text-expo-gray-300 hover:text-expo-white hover:bg-expo-gray-900 rounded-expo-lg px-8 py-3 text-body font-medium"
          >
            View pricing
          </Button>
        </div>
      </div>
    </section>
  );
}
