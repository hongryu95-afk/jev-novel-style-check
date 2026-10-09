"use client";

import { useRef, useState } from "react";
import { SAMPLE_MANUSCRIPT } from "@/lib/sample";
import { NOTICEABLE_THRESHOLD, getStatus } from "@/lib/scoring";
import { MAX_FIELD_CHARS, MAX_MANUSCRIPT_CHARS, type CheckResponse, type CheckSuccess } from "@/lib/types";

export default function Home() {
  const [manuscript, setManuscript] = useState("");
  const [genre, setGenre] = useState("");
  const [pov, setPov] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CheckSuccess | null>(null);
  const resultRef = useRef<HTMLElement>(null);

  function loadSample() {
    setManuscript(SAMPLE_MANUSCRIPT);
    setGenre("현대 판타지 / 로맨스");
    setPov("3인칭 제한 시점 (서윤)");
    setNotes("서윤: 20대 남성, 평소 반말을 쓰는 현대적인 말투.\n하윤: 서윤의 동생, 다정한 반말.");
    setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    if (!manuscript.trim()) { setError("검사할 원고를 입력해 주세요."); return; }
    if (manuscript.trim().length > MAX_MANUSCRIPT_CHARS) {
      setError(`원고가 너무 깁니다. ${MAX_MANUSCRIPT_CHARS.toLocaleString("ko-KR")}자 이하로 나누어 검사해 주세요.`); return;
    }
    setError(null); setResult(null); setLoading(true);
    try {
      const res = await fetch("/api/check", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manuscript, genre, pov, characterNotes: notes }),
      });
      let data: CheckResponse | null = null;
      try { data = (await res.json()) as CheckResponse; } catch { data = null; }
      if (!data || !data.ok) setError(data && !data.ok ? data.message : "서버 응답을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      else {
        setResult(data);
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
      }
    } catch {
      setError("네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인한 뒤 다시 시도해 주세요.");
    } finally { setLoading(false); }
  }

  const noticeable = result ? result.results.filter((r) => r.score >= NOTICEABLE_THRESHOLD).length : 0;
  return (
    <main className="wrap">
      <header className="top">
        <h1>웹소설 문체 체크</h1>
        <p>AI 작성 여부를 판별하지 않습니다.<br />독자의 몰입을 방해할 수 있는 문체 신호를 검사합니다.</p>
      </header>
      <form className="card" onSubmit={submit} noValidate>
        <label htmlFor="manuscript">원고</label>
        <textarea id="manuscript" className="manuscript" value={manuscript} onChange={(e) => setManuscript(e.target.value)} placeholder="검사할 웹소설 원고를 붙여넣으세요." />
        <div className="meta-row"><span>{manuscript.trim().length.toLocaleString("ko-KR")} / {MAX_MANUSCRIPT_CHARS.toLocaleString("ko-KR")}자</span></div>
        <div className="grid-2" style={{ marginTop: 20 }}>
          <div className="field"><label htmlFor="genre">장르<span className="optional">선택</span></label><input id="genre" type="text" value={genre} maxLength={200} onChange={(e) => setGenre(e.target.value)} /></div>
          <div className="field"><label htmlFor="pov">시점<span className="optional">선택</span></label><input id="pov" type="text" value={pov} maxLength={200} onChange={(e) => setPov(e.target.value)} /></div>
        </div>
        <div className="field"><label htmlFor="notes">캐릭터 참고사항<span className="optional">선택</span></label><textarea id="notes" className="notes" value={notes} maxLength={MAX_FIELD_CHARS} onChange={(e) => setNotes(e.target.value)} /></div>
        <div className="actions">
          <button type="submit" className="primary" disabled={loading}>{loading ? "검사 중…" : "문체 체크하기"}</button>
          <button type="button" className="secondary" onClick={loadSample} disabled={loading}>샘플 원고 불러오기</button>
        </div>
        <div aria-live="polite">
          {loading && <div className="loading"><span className="spinner" aria-hidden="true" /><span>원고의 문체 신호를 분석하고 있습니다. 잠시만 기다려 주세요.</span></div>}
          {error && <div className="alert" role="alert">{error}</div>}
        </div>
      </form>
      {result && <section className="card results" ref={resultRef} aria-label="검사 결과">
        {result.source === "mock" && <div className="badge-mock">개발용 목업 결과 — Jev 분석이 아닙니다</div>}
        <h2>문체 신호 6개 중 <span className="n">{noticeable}개</span>가 눈에 띕니다.</h2>
        <ul className="rows">{result.results.map((r) => {
          const status = getStatus(r.score);
          return <li className="row" key={r.id}>
            <span className="name">{r.name}</span><span className="num">{r.score}</span>
            <div className="bar" role="progressbar" aria-label={r.name} aria-valuemin={0} aria-valuemax={100} aria-valuenow={r.score}><span className={`fill-${status.tone}`} style={{ width: `${r.score}%` }} /></div>
            <span className={`status tone-${status.tone}`}>{status.label}</span>
          </li>;
        })}</ul>
        <p className="notice">이 결과는 AI 작성 여부를 판별하지 않습니다.<br />원고에서 특정 문체 패턴이 얼마나 두드러지는지 보여줍니다.</p>
      </section>}
    </main>
  );
}
