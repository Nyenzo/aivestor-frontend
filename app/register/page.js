import { AuthScreen } from "../components/AppScreens";

export const dynamic = "force-static";
export const revalidate = 300;
export const fetchCache = "force-cache";
export const metadata = { title: "Aivestor Register" };

export default function RegisterPage() {
  return <AuthScreen mode="register" />;
}
