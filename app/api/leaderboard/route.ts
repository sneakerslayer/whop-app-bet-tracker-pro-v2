import { NextRequest, NextResponse } from "next/server";
import { validateToken } from "@whop/next";
import { getLeaderboard } from "@/lib/stats";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await validateToken({ headers: request.headers });
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const experienceId = searchParams.get("experience_id");
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!experienceId) {
      return NextResponse.json({ error: "Missing experience_id" }, { status: 400 });
    }

    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json({ 
        error: "Limit must be a number between 1 and 100" 
      }, { status: 400 });
    }

    const leaderboard = await getLeaderboard(experienceId, limit);

    return NextResponse.json({ 
      leaderboard,
      total: leaderboard.length 
    });
  } catch (error) {
    console.error("Error in GET /api/leaderboard:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
