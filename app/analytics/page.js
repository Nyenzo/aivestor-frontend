import { MarketScreen } from "../components/AppScreens";

export const dynamic = "force-static";
export const revalidate = 300;
export const fetchCache = "force-cache";

export default function AnalyticsPage() {
  return <MarketScreen title="Market Intelligence Hub" />;
}
