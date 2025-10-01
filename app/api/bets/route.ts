import { NextRequest, NextResponse } from "next/server";
import { whopSdk } from "@/lib/whop-sdk";
import { supabase } from "@/lib/supabase";
import { getOrCreateUser } from "@/lib/auth";
import { calculatePotentialReturn, convertAmericanToDecimal } from "@/lib/calculations";
import { updateUserStats } from "@/lib/stats";
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
    
    const { data: bets, error } = await supabase
      .from("bets")
      .select("*")
      .eq("user_id", user.id)
      .eq("whop_experience_id", experienceId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching bets:", error);
      return NextResponse.json({ error: "Failed to fetch bets" }, { status: 500 });
    }

    return NextResponse.json({ bets: bets || [] });
  } catch (error) {
    console.error("Error in GET /api/bets:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await validateWhopToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      experience_id, 
      sport, 
      bet_type, 
      description, 
      odds_american, 
      stake, 
      sportsbook, 
      game_date, 
      notes,
      league,
      tags
    } = body;

    // Validation
    if (!experience_id || !sport || !bet_type || !description || !odds_american || !stake) {
      return NextResponse.json({ 
        error: "Missing required fields: experience_id, sport, bet_type, description, odds_american, stake" 
      }, { status: 400 });
    }

    // Validate bet type
    const validBetTypes = ['moneyline', 'spread', 'total', 'prop', 'parlay', 'teaser'];
    if (!validBetTypes.includes(bet_type)) {
      return NextResponse.json({ 
        error: `Invalid bet_type. Must be one of: ${validBetTypes.join(', ')}` 
      }, { status: 400 });
    }

    // Validate stake amount
    const stakeAmount = parseFloat(stake);
    if (isNaN(stakeAmount) || stakeAmount <= 0) {
      return NextResponse.json({ 
        error: "Stake must be a positive number" 
      }, { status: 400 });
    }

    // Validate odds
    const oddsValue = parseInt(odds_american);
    if (isNaN(oddsValue) || oddsValue === 0) {
      return NextResponse.json({ 
        error: "Odds must be a non-zero integer" 
      }, { status: 400 });
    }

    const user = await getOrCreateUser(userId, experience_id);
    
    const potentialReturn = calculatePotentialReturn(stakeAmount, oddsValue);
    const oddsDecimal = convertAmericanToDecimal(oddsValue);

    const { data: bet, error } = await supabase
      .from("bets")
      .insert({
        user_id: user.id,
        whop_experience_id: experience_id,
        sport,
        league: league || null,
        bet_type,
        description,
        odds_american: oddsValue,
        odds_decimal: oddsDecimal,
        stake: stakeAmount,
        potential_return: potentialReturn,
        sportsbook: sportsbook || null,
        game_date: game_date ? new Date(game_date) : null,
        notes: notes || null,
        tags: tags || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating bet:", error);
      return NextResponse.json({ error: "Failed to create bet" }, { status: 500 });
    }

    // Update user stats asynchronously
    updateUserStats(user.id).catch(console.error);

    return NextResponse.json({ bet }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/bets:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
