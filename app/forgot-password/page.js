import { AuthScreen } from "../components/AppScreens";

export const dynamic = "force-static";
export const revalidate = 300;
export const fetchCache = "force-cache";
export const metadata = { title: "Forgot Password | Aivestor" };

export default function ForgotPasswordPage() {
  return <AuthScreen mode="forgot" />;
}
