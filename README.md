# 웹소설 문체 체크

한국어 웹소설 원고를 붙여넣으면 TypeSafe **Jev**(Glasser 경유)로 여섯 문체 신호(반복·재진술, 과설명·종합결론, 대화 후 해설, 문장 리듬, 감정 빈약, 말투 이질감)를 0–100점으로 보여주는 앱입니다.

> **AI 작성 여부를 판별하지 않습니다.** 독자의 몰입을 방해할 수 있는 문체 패턴이 얼마나 두드러지는지만 보여줍니다.

## 설치 및 실행

```bash
npm install
npm run dev
```

http://localhost:3000 을 엽니다.

## Glasser 키 발급 및 설정

1. https://app.glasser.ai 에 로그인합니다.
2. https://app.glasser.ai/keys 에서 Key를 생성합니다. 값은 한 번만 보이므로 바로 복사하세요.
3. 프로젝트 루트(`package.json`과 같은 폴더)에 `.env.local`을 만들고 다음을 추가합니다.

```
GLASSER_API_KEY=여기에_발급받은_키
```

서버를 재시작하세요. `.env.local`은 `.gitignore` 대상입니다. `TYPESAFE_API_KEY`는 사용하지 않습니다.

개발 중 키가 없으면 화면 테스트용 mock이 나오며, 결과에 "개발용 목업 결과 — Jev 분석이 아닙니다"라고 명확히 표시됩니다. 로컬에서도 끄려면 `ENABLE_MOCK_MODE=false`를 설정하세요. 프로덕션에서는 mock이 동작하지 않습니다.

## Vercel 배포

Git 저장소를 Vercel에서 Import한 뒤 **Settings → Environment Variables**에 `GLASSER_API_KEY`를 추가하고 Production(필요 시 Preview) 환경을 선택합니다. Deploy 또는 Redeploy를 실행하세요.

## 보안 및 API

`GLASSER_API_KEY`는 `src/app/api/check/route.ts` 서버 API route에서만 읽습니다. `NEXT_PUBLIC_` 접두사를 붙이지 않으므로 클라이언트 번들에 들어가지 않습니다. 브라우저는 `/api/check`로 원고를 보내며, Glasser 키는 서버에서만 Bearer 인증에 사용합니다.

공식 문서: [Glasser Runs API](https://glasser.ai/docs/api-reference/runs/create), [TypeSafe Jev API](https://docs.typesafe.ai/api).

- `POST https://api.glasser.ai/v1/runs`, provider `typesafe`, endpoint `/v1/systemone`, endpoint version `1`.
- `input`은 Jev 형식 `{ state, model: "jev-latest", questions }`입니다. 여섯 Score 질문을 한 번에 실행합니다.
- 매 분석 요청마다 고유 UUID `Idempotency-Key`를 사용합니다.
- Score answer는 0–4의 확률 가중 평균으로 정규화해 `Math.round(score / 4 * 100)`으로 UI에 표시합니다.
- 점수 구간: 0–24 안정, 25–49 약간 보임, 50–69 점검 권장, 70–100 강하게 보임.
