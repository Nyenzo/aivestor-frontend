import { AuthScreen } from "../components/AppScreens";

export const dynamic = "force-static";
export const revalidate = 300;
export const fetchCache = "force-cache";
export const metadata = { title: "Verify Email | Aivestor" };

export default function VerifyEmailPage() {
  return <AuthScreen mode="verify" />;
}
