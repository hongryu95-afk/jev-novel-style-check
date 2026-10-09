/** Jev Score's weighted level index (0..criteria.length-1) mapped to 0..100. */
export function normalizeScore(score: number, levelCount: number): number {
  const top = Math.max(levelCount - 1, 1);
  return Math.round(Math.min(Math.max(score / top, 0), 1) * 100);
}

export type StatusInfo = { label: string; tone: "safe" | "mild" | "warn" | "strong" };
export function getStatus(score: number): StatusInfo {
  if (score >= 70) return { label: "강하게 보임", tone: "strong" };
  if (score >= 50) return { label: "점검 권장", tone: "warn" };
  if (score >= 25) return { label: "약간 보임", tone: "mild" };
  return { label: "안정", tone: "safe" };
}
export const NOTICEABLE_THRESHOLD = 50;
