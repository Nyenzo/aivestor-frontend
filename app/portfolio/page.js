import StitchFrame from "../components/StitchFrame";

export const dynamic = "force-static";
export const revalidate = 300;
export const fetchCache = "force-cache";
export default function PortfolioPage() {
  return (
    <StitchFrame
      protectedRoute
      title="Aivestor Portfolio"
      src="/stitch/portfolio-institutional-light.html"
    />
  );
}
