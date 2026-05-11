import { lazy, type ComponentType } from "react";

export function LazyRouteDisplay(
  factory: () => Promise<{ default: ComponentType }>
): ComponentType {
  const LazyComponent = lazy(factory);
  // No inner Suspense here — the parent ProtectedLayout Suspense catches the promise
  return function LazyRouteWrapper() {
    return <LazyComponent />;
  };
}
