"use client";

import { useWhopApp } from "@whop/react";
import BetTrackerDashboard from "@/components/BetTrackerDashboard";

export default function Page() {
	const { hasAccess, experienceId } = useWhopApp();

	if (!hasAccess) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
				<div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 text-center max-w-md">
					<h2 className="text-2xl font-bold text-white mb-4">Access Required</h2>
					<p className="text-white/70 mb-6">
						You need to purchase access to this betting community to use BetTracker Pro.
					</p>
					<button
						onClick={() => window.location.href = "https://whop.com"}
						className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
					>
						Get Access
					</button>
				</div>
			</div>
		);
	}

	if (!experienceId) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
					<p className="text-white/70">Loading BetTracker Pro...</p>
				</div>
			</div>
		);
	}

	return <BetTrackerDashboard experienceId={experienceId} />;
}
