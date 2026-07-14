import { TradingScreen } from "../components/AppScreens";

export const dynamic = "force-static";
export const revalidate = 300;
export const fetchCache = "force-cache";

export default function TerminalPage() {
  return <TradingScreen />;
}
