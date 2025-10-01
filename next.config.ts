import { withWhopAppConfig } from "@whop/react/next.config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	images: {
		remotePatterns: [{ hostname: "**" }],
	},
	async headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					{
						key: "X-Frame-Options",
						value: "ALLOWALL",
					},
					{
						key: "Content-Security-Policy",
						value: "frame-ancestors 'self' https://*.whop.com https://whop.com https://dash.whop.com https://app.whop.com https://*.whop.io https://whop.io",
					},
					{
						key: "Referrer-Policy",
						value: "strict-origin-when-cross-origin",
					},
				],
			},
		];
	},
};

export default withWhopAppConfig(nextConfig);
