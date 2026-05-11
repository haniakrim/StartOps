import { lazy, Suspense, type ComponentType } from "react";

const PageSpinner = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

export function LazyRouteDisplay(
  factory: () => Promise<{ default: ComponentType }>
): ComponentType {
  const LazyComponent = lazy(factory);

  return function LazyRouteWrapper() {
    return (
      <Suspense fallback={<PageSpinner />}>
        <LazyComponent />
      </Suspense>
    );
  };
}
