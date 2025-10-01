import { supabase } from "./supabase";
import { calculateROI, calculateWinRate, updateStreak } from "./calculations";

export interface UserStats {
  user_id: string;
  whop_experience_id: string;
  total_bets: number;
  wins: number;
  losses: number;
  pushes: number;
  pending: number;
  total_staked: number;
  total_returned: number;
  net_profit: number;
  roi: number;
  win_rate: number;
  average_odds: number;
  current_streak: number;
  best_streak: number;
  worst_streak: number;
  units_wagered: number;
  units_won: number;
  unit_size: number;
  last_bet_at: string | null;
  updated_at: string;
}

export async function updateUserStats(userId: string): Promise<UserStats | null> {
  try {
    // Get all settled bets for the user
    const { data: bets, error: betsError } = await supabase
      .from("bets")
      .select("*")
      .eq("user_id", userId)
      .neq("result", "pending")
      .order("created_at", { ascending: true });

    if (betsError) {
      console.error("Error fetching bets for stats:", betsError);
      return null;
    }

    if (!bets || bets.length === 0) {
      // No settled bets yet, just update pending count
      const { data: pendingBets } = await supabase
        .from("bets")
        .select("id")
        .eq("user_id", userId)
        .eq("result", "pending");

      const { data: currentStats } = await supabase
        .from("user_stats")
        .select("unit_size, whop_experience_id")
        .eq("user_id", userId)
        .single();

      if (currentStats) {
        await supabase
          .from("user_stats")
          .update({
            pending: pendingBets?.length || 0,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);
      }

      return null;
    }

    // Calculate statistics
    const totalBets = bets.length;
    const wins = bets.filter(b => b.result === "won").length;
    const losses = bets.filter(b => b.result === "lost").length;
    const pushes = bets.filter(b => b.result === "push").length;

    const totalStaked = bets.reduce((sum, b) => sum + parseFloat(b.stake.toString()), 0);
    const totalReturned = bets.reduce((sum, b) => sum + parseFloat(b.actual_return.toString()), 0);
    const netProfit = totalReturned - totalStaked;
    const roi = calculateROI(totalReturned, totalStaked);
    const winRate = calculateWinRate(wins, totalBets);

    // Calculate streaks
    let currentStreak = 0;
    let bestStreak = 0;
    let worstStreak = 0;
    let tempStreak = 0;

    for (const bet of bets) {
      tempStreak = updateStreak(tempStreak, bet.result);
      if (tempStreak > bestStreak) bestStreak = tempStreak;
      if (tempStreak < worstStreak) worstStreak = tempStreak;
    }
    currentStreak = tempStreak;

    // Calculate average odds
    const averageOdds = bets.reduce((sum, b) => sum + (b.odds_american || 0), 0) / totalBets;

    // Get pending bets count
    const { data: pendingBets } = await supabase
      .from("bets")
      .select("id")
      .eq("user_id", userId)
      .eq("result", "pending");

    // Get current unit size
    const { data: currentStats } = await supabase
      .from("user_stats")
      .select("unit_size, whop_experience_id")
      .eq("user_id", userId)
      .single();

    const unitSize = currentStats?.unit_size || 100;
    const unitsWon = netProfit / unitSize;
    const unitsWagered = totalStaked / unitSize;

    // Update user stats
    const { data: updatedStats, error: updateError } = await supabase
      .from("user_stats")
      .update({
        total_bets: totalBets,
        wins,
        losses,
        pushes,
        pending: pendingBets?.length || 0,
        total_staked: totalStaked,
        total_returned: totalReturned,
        net_profit: netProfit,
        roi,
        win_rate: winRate,
        average_odds: averageOdds,
        current_streak: currentStreak,
        best_streak: bestStreak,
        worst_streak: worstStreak,
        units_won: unitsWon,
        units_wagered: unitsWagered,
        last_bet_at: bets[bets.length - 1]?.created_at || null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating user stats:", updateError);
      return null;
    }

    return updatedStats;
  } catch (error) {
    console.error("Error in updateUserStats:", error);
    return null;
  }
}

export async function getUserStats(userId: string): Promise<UserStats | null> {
  const { data: stats, error } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching user stats:", error);
    return null;
  }

  return stats;
}

export async function getLeaderboard(experienceId: string, limit: number = 50): Promise<UserStats[]> {
  const { data: stats, error } = await supabase
    .from("user_stats")
    .select(`
      *,
      users!inner(username, display_name, is_verified, avatar_url)
    `)
    .eq("whop_experience_id", experienceId)
    .gte("total_bets", 1) // Only include users with at least 1 bet
    .order("roi", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }

  return stats || [];
}
