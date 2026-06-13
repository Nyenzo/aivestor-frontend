import StitchFrame from "../components/StitchFrame";

export const dynamic = "force-static";
export const revalidate = 300;
export const fetchCache = "force-cache";
export const metadata = {
  title: "Aivestor Login",
};

export default function LoginPage() {
  return <StitchFrame title="Aivestor Login" src="/stitch/authentication-light.html" />;
}
