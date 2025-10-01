"use client";

import { useState, useEffect } from "react";
import { useWhopApp } from "@whop/react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import BetForm from "./BetForm";
import BetCard from "./BetCard";
import StatsOverview from "./StatsOverview";
import LeaderboardTable from "./LeaderboardTable";
import { formatCurrency, formatPercentage } from "@/lib/calculations";

interface Bet {
  id: string;
  sport: string;
  league?: string;
  bet_type: string;
  description: string;
  odds_american: number;
  stake: number;
  potential_return: number;
  result: string;
  actual_return: number;
  settled_at?: string;
  sportsbook?: string;
  notes?: string;
  created_at: string;
}

interface UserStats {
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
  current_streak: number;
  units_won: number;
}

interface LeaderboardUser {
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
  current_streak: number;
  units_won: number;
  unit_size: number;
  last_bet_at: string | null;
  updated_at: string;
  users: {
    username: string;
    display_name?: string;
    is_verified: boolean;
    avatar_url?: string;
  };
}

interface BetTrackerDashboardProps {
  experienceId: string;
}

export default function BetTrackerDashboard({ experienceId }: BetTrackerDashboardProps) {
  const { user } = useWhopApp();
  const [bets, setBets] = useState<Bet[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the user's token from Whop SDK
      const authToken = user?.token || "dev-token-123";

      // Fetch bets
      const betsResponse = await fetch(`/api/bets?experience_id=${experienceId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (!betsResponse.ok) throw new Error("Failed to fetch bets");
      const betsData = await betsResponse.json();
      setBets(betsData.bets || []);

      // Fetch user stats
      const statsResponse = await fetch(`/api/user-stats?experience_id=${experienceId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (!statsResponse.ok) throw new Error("Failed to fetch stats");
      const statsData = await statsResponse.json();
      setStats(statsData.stats);

      // Fetch leaderboard
      const leaderboardResponse = await fetch(`/api/leaderboard?experience_id=${experienceId}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (!leaderboardResponse.ok) throw new Error("Failed to fetch leaderboard");
      const leaderboardData = await leaderboardResponse.json();
      setLeaderboard(leaderboardData.leaderboard || []);

    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [experienceId]);

  const handleBetCreated = () => {
    fetchData();
  };

  const handleBetSettled = () => {
    fetchData();
  };

  // Prepare chart data
  const prepareChartData = () => {
    if (!bets || bets.length === 0) return [];

    const settledBets = bets
      .filter(bet => bet.result !== "pending")
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    let cumulativeProfit = 0;
    let cumulativeStaked = 0;
    let cumulativeReturned = 0;

    return settledBets.map((bet, index) => {
      cumulativeStaked += bet.stake;
      cumulativeReturned += bet.actual_return;
      cumulativeProfit = cumulativeReturned - cumulativeStaked;

      const roi = cumulativeStaked > 0 ? ((cumulativeReturned - cumulativeStaked) / cumulativeStaked) * 100 : 0;

      return {
        date: new Date(bet.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        profit: cumulativeProfit,
        roi: roi,
        stake: bet.stake,
        return: bet.actual_return,
        result: bet.result,
      };
    });
  };

  const chartData = prepareChartData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/70">Loading your betting dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold text-white mb-4">Error Loading Dashboard</h2>
          <p className="text-white/70 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">BetTracker Pro</h1>
            <p className="text-white/70">Professional sports betting portfolio management</p>
          </div>
          <BetForm experienceId={experienceId} onBetCreated={handleBetCreated} />
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="mb-8">
            <StatsOverview stats={stats} />
          </div>
        )}

        {/* Charts */}
        {chartData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Profit Chart */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Cumulative Profit</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="rgba(255,255,255,0.7)"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.7)"
                    fontSize={12}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "8px",
                      color: "white"
                    }}
                    formatter={(value: number) => [formatCurrency(value), "Profit"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    stroke="#10b981"
                    fill="rgba(16, 185, 129, 0.2)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* ROI Chart */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">ROI Progression</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="rgba(255,255,255,0.7)"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.7)"
                    fontSize={12}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "8px",
                      color: "white"
                    }}
                    formatter={(value: number) => [formatPercentage(value), "ROI"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="roi"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Bets */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Recent Bets</h3>
              {bets.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-white/70 mb-4">No bets yet</p>
                  <p className="text-white/50 text-sm">Create your first bet to start tracking your performance!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bets.slice(0, 10).map((bet) => (
                    <BetCard
                      key={bet.id}
                      bet={bet}
                      onBetSettled={handleBetSettled}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Leaderboard */}
          <div>
            <LeaderboardTable leaderboard={leaderboard} experienceId={experienceId} />
          </div>
        </div>
      </div>
    </div>
  );
}
