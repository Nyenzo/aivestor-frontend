import StitchFrame from "../components/StitchFrame";

export const dynamic = "force-static";
export const revalidate = 300;
export const fetchCache = "force-cache";
export default function ProfilePage() {
  return (
    <StitchFrame
      protectedRoute
      title="Aivestor Profile"
      src="/stitch/account-settings-light.html"
    />
  );
}
