import { useRoute } from 'vue-router';

/**
 * Reusable active-route behavior.
 * Rule: exact match always; section roots (1–2 path segments) stay highlighted
 * on their child routes; leaf items (3+ segments) match exactly only.
 * Uses useRoute() so it works with any router instance (incl. tests).
 */
export function useActiveRoute() {
  const route = useRoute();

  /** Visual highlight: exact match, or section parent (1–2 segments) matching a child route. */
  function isRouteActive(to: string): boolean {
    const current = route.path;
    if (current === to) return true;
    const segmentCount = to.split('/').filter(Boolean).length;
    return segmentCount < 3 && current.startsWith(to + '/');
  }

  /** Strict a11y marker: only the exact route is aria-current="page". */
  function isRouteExact(to: string): boolean {
    return route.path === to;
  }

  return { isRouteActive, isRouteExact };
}
