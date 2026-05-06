import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Expo is amazing. It made React Native dev so much easier.",
    author: "Peter Piekarczyk",
    handle: "@peterpme",
    avatar: "https://cdn.sanity.io/images/9r24npb8/production/fc0fb70dcbb17181f7cae6deb47388a56f31dc45-400x400.jpg?auto=format&fit=max&q=75&w=48",
  },
  {
    quote: "The more time flies, the more I love @reactnative & @expo",
    author: "Antonin Marchard",
    handle: "@antomarchard",
    avatar: "https://cdn.sanity.io/images/9r24npb8/production/184101ef2f04fd522c15ab2b6b490c063f29cca5-400x400.jpg?auto=format&fit=max&q=75&w=48",
  },
  {
    quote: "dude, react native + expo is the best option out there.",
    author: "Prince Ajuzie",
    handle: "@princeajuzie7",
    avatar: "https://cdn.sanity.io/images/9r24npb8/production/159691c1af9aa380b65115e8e68027a16cae0f58-400x400.jpg?auto=format&fit=max&q=75&w=48",
  },
  {
    quote: "I love @expo, it made React Native dev so much easier.",
    author: "NicoDevs",
    handle: "@Nico_Devs",
    avatar: "https://cdn.sanity.io/images/9r24npb8/production/2107c732c719236f0918d45face1c71ca1095730-400x400.jpg?auto=format&fit=max&q=75&w=48",
  },
  {
    quote: "It's almost shocking how much I take Expo API routes for granted.",
    author: "Simon Grimm",
    handle: "@schlimmson",
    avatar: "https://cdn.sanity.io/images/9r24npb8/production/4317219ac0c1f192d953db4954ff03c3cdb07aae-400x400.jpg?auto=format&fit=max&q=75&w=48",
  },
  {
    quote: "Just use @expo",
    author: "Patrick Aljord",
    handle: "@patcito",
    avatar: "https://cdn.sanity.io/images/9r24npb8/production/3315bc9b2fea5d7939384253b8cd490959d98826-400x400.jpg?auto=format&fit=max&q=75&w=48",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 bg-expo-gray-50 dark:bg-expo-dark-surface">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-h2 text-expo-black dark:text-expo-white">
            Loved by developers
          </h2>
          <p className="mt-4 text-body-lg text-expo-gray-500">
            See what the community is saying about Expo.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative rounded-expo-xl bg-expo-white dark:bg-expo-dark-elevated p-6 shadow-expo-sm dark:shadow-expo-dark-sm border border-expo-gray-100 dark:border-expo-dark-border"
            >
              <Quote className="h-5 w-5 text-expo-blue/40 mb-3" />
              <p className="text-body text-expo-gray-700 dark:text-expo-gray-300 leading-relaxed">
                {testimonial.quote}
              </p>
              <div className="mt-4 flex items-center gap-3">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.author}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <div className="text-body-sm font-medium text-expo-black dark:text-expo-white">
                    {testimonial.author}
                  </div>
                  <div className="text-caption text-expo-gray-500">
                    {testimonial.handle}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
