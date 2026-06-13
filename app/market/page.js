import StitchFrame from "../components/StitchFrame";

export const dynamic = "force-static";
export const revalidate = 300;
export const fetchCache = "force-cache";
export default function MarketPage() {
  return (
    <StitchFrame
      protectedRoute
      title="Aivestor Market Analytics"
      src="/stitch/market-analytics-light.html"
    />
  );
}
