import { SIGNAL_IDS, SIGNAL_NAMES, type SignalResult } from "./types";

/** Development-only mock scores; never presented as Jev results. */
export function mockResults(text: string): SignalResult[] {
  const sentences = text.split(/[.!?。\n]+/).map((s) => s.trim()).filter(Boolean);
  const n = Math.max(sentences.length, 1);
  const endings = sentences.map((s) => s.slice(-2));
  const mostCommon = Math.max(...Array.from(new Set(endings)).map((e) => endings.filter((x) => x === e).length), 1);
  const rhythm = Math.min(100, Math.round((mostCommon / n) * 140));
  const dialogueLines = (text.match(/["“「]/g) ?? []).length / 2;
  const explain = (text.match(/(것이었다|뜻이었다|의미였다|했기 때문이었다|수 있었다|느꼈다|생각했다)/g) ?? []).length;
  const repetition = Math.min(100, Math.round((explain / n) * 160) + 20);
  const dialogue = Math.min(100, Math.round((dialogueLines ? explain / Math.max(dialogueLines, 1) : 0.2) * 70));
  const over = Math.min(100, Math.round((explain / n) * 200) + 10);
  const values = [repetition, over, dialogue, rhythm, 38, 14];
  return SIGNAL_IDS.map((id, i) => ({ id, name: SIGNAL_NAMES[id], score: Math.max(0, Math.min(100, values[i])) }));
}
