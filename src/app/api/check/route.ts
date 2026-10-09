import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { QUESTIONS } from "@/lib/questions";
import { normalizeScore } from "@/lib/scoring";
import { mockResults } from "@/lib/mock";
import {
  MAX_FIELD_CHARS,
  MAX_MANUSCRIPT_CHARS,
  SIGNAL_IDS,
  SIGNAL_NAMES,
  type CheckFailure,
  type CheckRequest,
  type CheckSuccess,
  type ErrorCode,
  type SignalResult,
} from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

// Glasser runs Jev using provider-native input. See https://glasser.ai/docs/api-reference/runs/create
const GLASSER_RUNS_URL = "https://api.glasser.ai/v1/runs";
const JEV_PROVIDER = "typesafe";
const JEV_ENDPOINT = "/v1/systemone";
const JEV_ENDPOINT_VERSION = 1;
const JEV_MODEL = "jev-latest";

function fail(code: ErrorCode, message: string, status: number) {
  const body: CheckFailure = { ok: false, code, message };
  return NextResponse.json(body, { status });
}

/** Mock mode is development-only, opt-out via ENABLE_MOCK_MODE=false, never active in production. */
function mockEnabled(): boolean {
  return process.env.NODE_ENV !== "production" && process.env.ENABLE_MOCK_MODE !== "false";
}

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(req: Request) {
  let input: Partial<CheckRequest>;
  try {
    input = (await req.json()) as Partial<CheckRequest>;
  } catch {
    return fail("BAD_REQUEST", "요청 형식이 올바르지 않습니다.", 400);
  }

  const manuscript = typeof input.manuscript === "string" ? input.manuscript.trim() : "";
  if (!manuscript) return fail("EMPTY", "검사할 원고를 입력해 주세요.", 400);
  if (manuscript.length > MAX_MANUSCRIPT_CHARS) {
    return fail("TOO_LONG", `원고가 너무 깁니다. ${MAX_MANUSCRIPT_CHARS.toLocaleString("ko-KR")}자 이하로 나누어 검사해 주세요.`, 400);
  }

  const genre = clean(input.genre, 200);
  const pov = clean(input.pov, 200);
  const characterNotes = clean(input.characterNotes, MAX_FIELD_CHARS);
  const apiKey = process.env.GLASSER_API_KEY?.trim();

  if (!apiKey) {
    if (mockEnabled()) {
      const body: CheckSuccess = { ok: true, source: "mock", results: mockResults(manuscript) };
      return NextResponse.json(body);
    }
    return fail("MISSING_API_KEY", "서버에 API 키가 설정되지 않았습니다. 관리자에게 GLASSER_API_KEY 설정을 요청해 주세요.", 503);
  }

  const state: Record<string, string> = { manuscript };
  if (genre) state.genre = genre;
  if (pov) state.pov = pov;
  if (characterNotes) state.character_notes = characterNotes;

  // All six independent Score questions are submitted in ONE Jev request.
  const questions = Object.fromEntries(SIGNAL_IDS.map((id) => [id, QUESTIONS[id]]));
  let res: Response;
  try {
    res = await fetch(GLASSER_RUNS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": randomUUID(),
      },
      body: JSON.stringify({
        provider: JEV_PROVIDER,
        endpoint: JEV_ENDPOINT,
        endpoint_version: JEV_ENDPOINT_VERSION,
        input: { state, model: JEV_MODEL, questions },
      }),
      signal: AbortSignal.timeout(55_000),
      cache: "no-store",
    });
  } catch {
    return fail("JEV_ERROR", "분석 서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.", 502);
  }

  if (!res.ok) {
    console.error(`[glasser] status ${res.status}`);
    if (res.status === 401) return fail("JEV_AUTH", "API 키가 올바르지 않습니다. 서버의 GLASSER_API_KEY 값을 확인해 주세요.", 502);
    if (res.status === 402) return fail("JEV_BALANCE", "분석 크레딧이 부족합니다. Glasser 잔액을 확인해 주세요.", 502);
    if (res.status === 403) return fail("JEV_AUTH", "이 API 키로는 Jev를 사용할 수 없습니다. Glasser 권한을 확인해 주세요.", 502);
    if (res.status === 429 || res.status === 503) return fail("JEV_RATE_LIMIT", "요청이 많아 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.", 503);
    return fail("JEV_ERROR", "Jev 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.", 502);
  }

  let run: {
    status?: string;
    provider_response?: { http_status?: number } | null;
    output?: { answers?: Record<string, { type?: string; score?: unknown }> } | null;
  };
  try {
    run = await res.json();
  } catch {
    return fail("JEV_ERROR", "분석 응답을 해석하지 못했습니다.", 502);
  }

  if (run.status !== "COMPLETED" || (run.provider_response?.http_status ?? 200) >= 400) {
    console.error(`[glasser] run status ${run.status}, provider ${run.provider_response?.http_status}`);
    return fail("JEV_ERROR", "Jev 분석에 실패했습니다. 잠시 후 다시 시도해 주세요.", 502);
  }
  const answers = run.output?.answers;
  const results: SignalResult[] = [];
  for (const id of SIGNAL_IDS) {
    const answer = answers?.[id];
    if (!answer || answer.type !== "score" || typeof answer.score !== "number") {
      console.error(`[glasser] unexpected Jev answer for ${id}`);
      return fail("JEV_ERROR", "Jev 응답 형식이 예상과 달라 결과를 만들지 못했습니다.", 502);
    }
    results.push({ id, name: SIGNAL_NAMES[id], score: normalizeScore(answer.score, QUESTIONS[id].criteria.length) });
  }
  const body: CheckSuccess = { ok: true, source: "jev", results };
  return NextResponse.json(body);
}
