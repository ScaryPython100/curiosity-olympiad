/**
 * Learning path helpers: stars per test, which test is next, and where each
 * bubble sits on the winding path. Pure functions so the tests can use them.
 */

/** 1–3 stars for a score (3 = all right, 2 = at least 60%). Same as the end-of-test screen. */
export function starsFor(score: number, total: number): 1 | 2 | 3 {
  if (!(total > 0)) return 1;
  const ratio = score / total;
  return ratio >= 0.99 ? 3 : ratio >= 0.6 ? 2 : 1;
}

/** First test (in path order) without a finished result, or null when all are done. */
export function nextTestId(testIds: number[], done: Record<number, { completed?: boolean } | undefined>): number | null {
  return testIds.find((id) => !done[id]?.completed) ?? null;
}

/** Sideways offset pattern (in px) that makes the path wind left and right. */
const WIGGLE = [0, 56, 84, 56, 0, -56, -84, -56];

/** Horizontal offset of bubble `index` from the centre line. */
export function pathOffset(index: number, maxOffset = 84): number {
  const raw = WIGGLE[index % WIGGLE.length];
  return Math.round((raw / 84) * maxOffset);
}

/** SVG path through bubble centres, with smooth curves between them. */
export function pathCurve(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const midY = (a.y + b.y) / 2;
    d += ` C ${a.x} ${midY}, ${b.x} ${midY}, ${b.x} ${b.y}`;
  }
  return d;
}
