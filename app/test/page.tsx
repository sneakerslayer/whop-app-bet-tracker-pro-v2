"use client";

import BetTrackerDashboard from "@/components/BetTrackerDashboard";

export default function TestPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-4 p-4">Test Page - Direct Access</h1>
      <BetTrackerDashboard experienceId="test-experience-123" />
    </div>
  );
}
