import { AuthScreen } from "../components/AppScreens";

export const dynamic = "force-static";
export const revalidate = 300;
export const fetchCache = "force-cache";
export const metadata = { title: "Reset Password | Aivestor" };

export default function ResetPasswordPage() {
  return <AuthScreen mode="reset" />;
}
