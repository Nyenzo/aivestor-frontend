import StitchFrame from "../components/StitchFrame";

export const dynamic = "force-static";
export const revalidate = 300;
export const fetchCache = "force-cache";
export default function TerminalPage() {
  return (
    <StitchFrame
      protectedRoute
      title="Aivestor Trading Terminal"
      src="/stitch/trading-terminal-light.html"
    />
  );
}
