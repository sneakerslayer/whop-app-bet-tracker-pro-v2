"use client";

import BetTrackerDashboard from "@/components/BetTrackerDashboard";

export default function Page() {
	// For now, we'll use a hardcoded experience ID for development
	// In production, this would come from the Whop context
	const experienceId = "dev-experience-123";

	return <BetTrackerDashboard experienceId={experienceId} />;
}
