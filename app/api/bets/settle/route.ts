import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { updateUserStats } from "@/lib/stats";
import { calculateActualReturn } from "@/lib/calculations";
import { validateWhopToken } from "@/lib/auth-helpers";

export async function POST(request: NextRequest) {
  try {
    const userId = await validateWhopToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { bet_id, result } = body;

    if (!bet_id || !result) {
      return NextResponse.json({ 
        error: "Missing required fields: bet_id, result" 
      }, { status: 400 });
    }

    // Validate result
    const validResults = ['won', 'lost', 'push', 'void'];
    if (!validResults.includes(result)) {
      return NextResponse.json({ 
        error: `Invalid result. Must be one of: ${validResults.join(', ')}` 
      }, { status: 400 });
    }

    // Get the bet and verify ownership
    const { data: bet, error: betError } = await supabase
      .from("bets")
      .select("*, users!inner(whop_user_id)")
      .eq("id", bet_id)
      .single();

    if (betError || !bet) {
      return NextResponse.json({ error: "Bet not found" }, { status: 404 });
    }

    if (bet.users.whop_user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized - you can only settle your own bets" }, { status: 403 });
    }

    // Check if bet is already settled
    if (bet.result !== 'pending') {
      return NextResponse.json({ 
        error: `Bet is already settled as: ${bet.result}` 
      }, { status: 400 });
    }

    // Calculate actual return based on result
    const actualReturn = calculateActualReturn(
      parseFloat(bet.stake.toString()), 
      parseFloat(bet.potential_return.toString()), 
      result
    );

    // Update the bet
    const { data: updatedBet, error: updateError } = await supabase
      .from("bets")
      .update({ 
        result, 
        actual_return: actualReturn, 
        settled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", bet_id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating bet:", updateError);
      return NextResponse.json({ error: "Failed to settle bet" }, { status: 500 });
    }

    // Update user statistics
    const statsUpdateResult = await updateUserStats(bet.user_id);
    if (!statsUpdateResult) {
      console.error("Failed to update user stats after bet settlement");
      // Don't fail the request, just log the error
    }

    return NextResponse.json({ 
      bet: updatedBet,
      message: `Bet settled as ${result}` 
    });
  } catch (error) {
    console.error("Error in POST /api/bets/settle:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
