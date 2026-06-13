import StitchFrame from "../components/StitchFrame";

export const dynamic = "force-static";
export const revalidate = 300;
export const fetchCache = "force-cache";
export default function DashboardPage() {
  return (
    <StitchFrame
      protectedRoute
      title="Aivestor System Dashboard"
      src="/stitch/system-dashboard-institutional-light.html"
    />
  );
}
