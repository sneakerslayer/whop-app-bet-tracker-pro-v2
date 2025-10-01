"use client";

import { useState, useEffect } from "react";
import { useIframeSdk } from "@whop/react";
import BetTrackerDashboard from "@/components/BetTrackerDashboard";

export default function Page() {
	const sdk = useIframeSdk();
	const [experienceId, setExperienceId] = useState<string>("dev-experience-123");
	const [hasAccess, setHasAccess] = useState(true);
	const [loading, setLoading] = useState(true);
	const [sdkError, setSdkError] = useState<string | null>(null);

	useEffect(() => {
		let timeout: NodeJS.Timeout;
		
		// Set a timeout to prevent infinite loading
		timeout = setTimeout(() => {
			console.log("SDK timeout - falling back to default experience ID");
			setLoading(false);
		}, 2000);

		// Try to get experience ID from SDK, but don't block on it
		if (sdk) {
			sdk.getTopLevelUrlData({})
				.then((data) => {
					console.log("SDK success:", data);
					setExperienceId(data.experienceId);
					setLoading(false);
					clearTimeout(timeout);
				})
				.catch((error) => {
					console.error("SDK error:", error);
					setSdkError(error.message || "SDK call failed");
					setLoading(false);
					clearTimeout(timeout);
				});
		} else {
			console.log("No SDK available - using default experience ID");
			setLoading(false);
			clearTimeout(timeout);
		}

		return () => {
			if (timeout) clearTimeout(timeout);
		};
	}, [sdk]);

	// Show loading only briefly
	if (loading) {
		return (
			<div 
				className="min-h-screen flex items-center justify-center"
				style={{ 
					background: 'linear-gradient(to bottom right, #0f172a, #581c87, #0f172a)',
					color: '#ffffff'
				}}
			>
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
					<p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Loading BetTracker Pro...</p>
					{sdkError && (
						<p className="text-yellow-400 text-sm mt-2">SDK Error: {sdkError}</p>
					)}
				</div>
			</div>
		);
	}

	// Show access required message only if explicitly denied
	if (!hasAccess) {
		return (
			<div 
				className="min-h-screen flex items-center justify-center"
				style={{ 
					background: 'linear-gradient(to bottom right, #0f172a, #581c87, #0f172a)',
					color: '#ffffff'
				}}
			>
				<div 
					className="rounded-xl p-8 text-center max-w-md"
					style={{
						backgroundColor: 'rgba(255, 255, 255, 0.1)',
						backdropFilter: 'blur(12px)',
						border: '1px solid rgba(255, 255, 255, 0.2)'
					}}
				>
					<h2 className="text-2xl font-bold mb-4" style={{ color: '#ffffff' }}>Access Required</h2>
					<p className="mb-6" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
						You need to purchase access to this betting community to use BetTracker Pro.
					</p>
					<button
						onClick={() => window.location.href = "https://whop.com"}
						className="px-6 py-3 rounded-lg transition-colors"
						style={{ 
							backgroundColor: '#2563eb',
							color: '#ffffff'
						}}
						onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8'}
						onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb'}
					>
						Get Access
					</button>
				</div>
			</div>
		);
	}

	// Always show the dashboard - let the dashboard handle its own loading states
	return <BetTrackerDashboard experienceId={experienceId} />;
}
