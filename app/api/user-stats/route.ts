import { NextRequest, NextResponse } from "next/server";
import { getUserStats } from "@/lib/stats";
import { getOrCreateUser } from "@/lib/auth";
import { validateWhopToken } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  try {
    const userId = await validateWhopToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const experienceId = searchParams.get("experience_id");
    if (!experienceId) {
      return NextResponse.json({ error: "Missing experience_id" }, { status: 400 });
    }

    const user = await getOrCreateUser(userId, experienceId);
    const stats = await getUserStats(user.id);

    if (!stats) {
      return NextResponse.json({ 
        error: "User stats not found" 
      }, { status: 404 });
    }

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Error in GET /api/user-stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
