import StitchFrame from "../components/StitchFrame";

export const dynamic = "force-static";
export const revalidate = 300;
export const fetchCache = "force-cache";
export const metadata = {
  title: "Forgot Password | Aivestor",
};

export default function ForgotPasswordPage() {
  return <StitchFrame title="Forgot Password" src="/stitch/authentication-light.html" />;
}
