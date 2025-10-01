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
						key: "Content-Security-Policy",
						value: "frame-ancestors 'self' https://whop.com https://*.whop.com;",
					},
				],
			},
		];
	},
};

export default withWhopAppConfig(nextConfig);
