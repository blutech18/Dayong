import { useRouterState } from "@tanstack/react-router";

/**
 * A thin indeterminate progress bar fixed to the top of the viewport that
 * appears immediately whenever the router is navigating (running route
 * loaders/beforeLoad), giving instant feedback on click before the next
 * page's data is ready.
 */
export function RouteProgress() {
  const isNavigating = useRouterState({
    select: (s) => s.status === "pending" || s.isLoading || s.isTransitioning,
  });

  if (!isNavigating) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-0.5 overflow-hidden bg-primary/20"
      role="progressbar"
      aria-label="Loading"
    >
      <div className="route-progress-bar h-full w-1/3 bg-primary" />
    </div>
  );
}
