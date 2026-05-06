import { Hero } from "@/components/expo/Hero";
import { Features } from "@/components/expo/Features";
import { Testimonials } from "@/components/expo/Testimonials";
import { CTA } from "@/components/expo/CTA";

export default function Index() {
  return (
    <div className="min-h-screen bg-expo-white dark:bg-expo-black">
      <Hero />
      <Features />
      <Testimonials />
      <CTA />
      
      {/* Footer */}
      <footer className="border-t border-expo-gray-100 dark:border-expo-dark-border bg-expo-white dark:bg-expo-black py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-body-sm text-expo-gray-500">
              Design system extracted from{" "}
              <a 
                href="https://expo.dev" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-expo-blue hover:underline"
              >
                expo.dev
              </a>
            </p>
            <p className="text-caption text-expo-gray-400">
              Built with React + Tailwind CSS
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
