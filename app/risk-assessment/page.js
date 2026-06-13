import OnboardingExperience from "../components/OnboardingExperience";

export const dynamic = "force-static";
export const revalidate = 300;
export const fetchCache = "force-cache";
export default function RiskAssessmentPage() {
  return <OnboardingExperience />;
}
