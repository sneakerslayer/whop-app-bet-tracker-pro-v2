import { WhopApp } from "@whop/react/components";
import { WhopIframeSdkProvider } from "@whop/react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "BetTracker Pro",
	description: "Professional sports betting portfolio management for Whop communities",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<WhopIframeSdkProvider>
					<WhopApp>{children}</WhopApp>
				</WhopIframeSdkProvider>
			</body>
		</html>
	);
}
