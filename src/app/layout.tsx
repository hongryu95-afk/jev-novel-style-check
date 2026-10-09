import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "웹소설 문체 체크",
  description: "AI 작성 여부를 판별하지 않습니다. 독자의 몰입을 방해할 수 있는 문체 신호를 검사합니다.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ko"><body>{children}</body></html>;
}
