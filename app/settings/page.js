import StitchFrame from "../components/StitchFrame";

export const dynamic = "force-static";
export const revalidate = 300;
export const fetchCache = "force-cache";
export default function SettingsPage() {
  return (
    <StitchFrame
      protectedRoute
      title="Aivestor Account Settings"
      src="/stitch/account-settings-light.html"
    />
  );
}
