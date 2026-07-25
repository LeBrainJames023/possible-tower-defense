/** Shared math helpers for grid / path / combat. */

export interface Vec2 {
  x: number;
  y: number;
}

export function dist(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function lengthAlongPath(waypoints: Vec2[], t: number): Vec2 {
  if (waypoints.length === 0) return { x: 0, y: 0 };
  if (waypoints.length === 1) return { ...waypoints[0] };

  const lengths: number[] = [];
  let total = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const d = dist(waypoints[i], waypoints[i + 1]);
    lengths.push(d);
    total += d;
  }
  if (total <= 0) return { ...waypoints[0] };

  let travel = clamp(t, 0, 1) * total;
  for (let i = 0; i < lengths.length; i++) {
    if (travel <= lengths[i]) {
      const local = lengths[i] === 0 ? 0 : travel / lengths[i];
      return {
        x: lerp(waypoints[i].x, waypoints[i + 1].x, local),
        y: lerp(waypoints[i].y, waypoints[i + 1].y, local),
      };
    }
    travel -= lengths[i];
  }
  return { ...waypoints[waypoints.length - 1] };
}

export function pathTotalLength(waypoints: Vec2[]): number {
  let total = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    total += dist(waypoints[i], waypoints[i + 1]);
  }
  return total;
}

/** Nearest point on the polyline path to a world position. */
export function nearestPathSample(
  waypoints: Vec2[],
  x: number,
  y: number,
  samples = 220,
): { pos: Vec2; progress: number } {
  if (waypoints.length === 0) return { pos: { x, y }, progress: 0 };
  if (waypoints.length === 1) return { pos: { ...waypoints[0] }, progress: 0 };

  let bestD = Infinity;
  let bestProgress = 0;
  let bestPos = { ...waypoints[0] };
  const target = { x, y };
  for (let i = 0; i <= samples; i++) {
    const progress = i / samples;
    const pos = lengthAlongPath(waypoints, progress);
    const d = dist(pos, target);
    if (d < bestD) {
      bestD = d;
      bestProgress = progress;
      bestPos = pos;
    }
  }
  return { pos: bestPos, progress: bestProgress };
}
