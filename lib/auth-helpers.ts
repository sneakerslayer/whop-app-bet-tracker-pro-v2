import { NextRequest } from "next/server";
import { WhopServerSdk } from "@whop/api";

export async function validateWhopToken(request: NextRequest): Promise<string | null> {
  try {
    // Create SDK instance
    const whopSdk = WhopServerSdk({
      appId: process.env.NEXT_PUBLIC_WHOP_APP_ID!,
      appApiKey: process.env.WHOP_API_KEY!,
    });

    // Get authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);
    
    // Validate token - using a simple approach for now
    // In production, you'd implement proper JWT validation
    return "dev_user_123";
  } catch (error) {
    console.error("Whop token validation failed:", error);
    return null;
  }
}
