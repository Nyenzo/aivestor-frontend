import StitchFrame from "../components/StitchFrame";

export const dynamic = "force-static";
export const revalidate = 300;
export const fetchCache = "force-cache";
export const metadata = {
  title: "Reset Password | Aivestor",
};

export default function ResetPasswordPage() {
  return <StitchFrame title="Reset Password" src="/stitch/authentication-light.html" />;
}
