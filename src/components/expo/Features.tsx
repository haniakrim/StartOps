import { Code2, Cloud, Rocket, Shield } from "lucide-react";

const features = [
  {
    icon: Code2,
    title: "Develop",
    description: "Write your native app with React. Pro-grade libraries and all the tools you need.",
    color: "text-expo-blue",
    bgColor: "bg-expo-blue/10",
  },
  {
    icon: Cloud,
    title: "Deploy",
    description: "Use Expo services to build, submit, update, and iterate on your apps as they grow.",
    color: "text-expo-green",
    bgColor: "bg-expo-green/10",
  },
  {
    icon: Rocket,
    title: "Ship Faster",
    description: "Over-the-air updates to get the latest fixes and improvements to your users fast.",
    color: "text-expo-orange",
    bgColor: "bg-expo-orange/10",
  },
  {
    icon: Shield,
    title: "Enterprise Ready",
    description: "SOC 2 Type 2 and GDPR compliant. Serving 100s of millions of end users.",
    color: "text-expo-purple",
    bgColor: "bg-expo-purple/10",
  },
];

export function Features() {
  return (
    <section className="py-24 bg-expo-white dark:bg-expo-black">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-h2 text-expo-black dark:text-expo-white">
            Build your app with the best tools
          </h2>
          <p className="mt-4 text-body-lg text-expo-gray-500">
            From development to deployment, Expo has you covered.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-expo-xl bg-expo-gray-50 dark:bg-expo-dark-surface p-6 transition-all duration-200 hover:shadow-expo-md dark:hover:shadow-expo-dark-md border border-transparent hover:border-expo-gray-100 dark:hover:border-expo-dark-border"
            >
              <div className={`inline-flex rounded-expo-lg ${feature.bgColor} p-3`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="mt-4 text-h4 text-expo-black dark:text-expo-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-body-sm text-expo-gray-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
