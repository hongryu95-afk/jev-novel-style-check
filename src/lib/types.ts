export const SIGNAL_IDS = [
  "repetition",
  "over_explanation",
  "dialogue_explanation",
  "sentence_rhythm",
  "emotion_thinness",
  "voice_inconsistency",
] as const;

export type SignalId = (typeof SIGNAL_IDS)[number];

export const SIGNAL_NAMES: Record<SignalId, string> = {
  repetition: "반복·재진술",
  over_explanation: "과설명·종합결론",
  dialogue_explanation: "대화 후 해설",
  sentence_rhythm: "문장 리듬",
  emotion_thinness: "감정 빈약",
  voice_inconsistency: "말투 이질감",
};

export type SignalResult = { id: SignalId; name: string; /** 0-100; higher = stronger issue */ score: number };
export type CheckRequest = { manuscript: string; genre?: string; pov?: string; characterNotes?: string };
export type CheckSuccess = { ok: true; source: "jev" | "mock"; results: SignalResult[] };
export type ErrorCode = "EMPTY" | "TOO_LONG" | "BAD_REQUEST" | "MISSING_API_KEY" | "JEV_AUTH" | "JEV_BALANCE" | "JEV_RATE_LIMIT" | "JEV_ERROR";
export type CheckFailure = { ok: false; code: ErrorCode; message: string };
export type CheckResponse = CheckSuccess | CheckFailure;
export const MAX_MANUSCRIPT_CHARS = 10000;
export const MAX_FIELD_CHARS = 2000;
