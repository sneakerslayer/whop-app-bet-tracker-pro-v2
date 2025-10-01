"use client";

import { Crown, Shield, Trophy, TrendingUp, Users } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/lib/calculations";

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

interface LeaderboardTableProps {
  leaderboard: LeaderboardUser[];
  experienceId: string;
}

export default function LeaderboardTable({ leaderboard, experienceId }: LeaderboardTableProps) {
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-5 h-5 text-yellow-400" />;
      case 1:
        return <Crown className="w-5 h-5 text-gray-300" />;
      case 2:
        return <Crown className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-white/70 font-medium">#{index + 1}</span>;
    }
  };

  const getProfitColor = (profit: number) => {
    if (profit > 0) return "text-green-400";
    if (profit < 0) return "text-red-400";
    return "text-white/70";
  };

  const getROIColor = (roi: number) => {
    if (roi > 0) return "text-green-400";
    if (roi < 0) return "text-red-400";
    return "text-white/70";
  };

  const getStreakColor = (streak: number) => {
    if (streak > 0) return "text-green-400";
    if (streak < 0) return "text-red-400";
    return "text-white/70";
  };

  if (leaderboard.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 text-center">
        <Users className="w-12 h-12 text-white/50 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Rankings Yet</h3>
        <p className="text-white/70">
          Be the first to place bets and climb the leaderboard!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <h3 className="text-xl font-semibold text-white">Community Leaderboard</h3>
        </div>
        <p className="text-white/70 text-sm mt-1">
          Ranked by ROI • {leaderboard.length} members
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/20">
              <th className="text-left p-4 text-white/70 font-medium">Rank</th>
              <th className="text-left p-4 text-white/70 font-medium">User</th>
              <th className="text-right p-4 text-white/70 font-medium">Bets</th>
              <th className="text-right p-4 text-white/70 font-medium">Win Rate</th>
              <th className="text-right p-4 text-white/70 font-medium">ROI</th>
              <th className="text-right p-4 text-white/70 font-medium">Profit</th>
              <th className="text-right p-4 text-white/70 font-medium">Streak</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((user, index) => (
              <tr 
                key={user.user_id} 
                className={`border-b border-white/10 hover:bg-white/5 transition-colors ${
                  index < 3 ? "bg-gradient-to-r from-white/5 to-transparent" : ""
                }`}
              >
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {getRankIcon(index)}
                  </div>
                </td>
                
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {user.users.avatar_url ? (
                      <img 
                        src={user.users.avatar_url} 
                        alt={user.users.username}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.users.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">
                          {user.users.display_name || user.users.username}
                        </span>
                        {user.users.is_verified && (
                          <Shield className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                
                <td className="p-4 text-right text-white">
                  {user.total_bets}
                </td>
                
                <td className="p-4 text-right">
                  <span className="text-white font-medium">
                    {formatPercentage(user.win_rate)}
                  </span>
                </td>
                
                <td className="p-4 text-right">
                  <span className={`font-medium ${getROIColor(user.roi)}`}>
                    {formatPercentage(user.roi)}
                  </span>
                </td>
                
                <td className="p-4 text-right">
                  <span className={`font-medium ${getProfitColor(user.net_profit)}`}>
                    {formatCurrency(user.net_profit)}
                  </span>
                </td>
                
                <td className="p-4 text-right">
                  <span className={`font-medium ${getStreakColor(user.current_streak)}`}>
                    {user.current_streak > 0 ? `+${user.current_streak}` : user.current_streak}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {leaderboard.length > 10 && (
        <div className="p-4 text-center border-t border-white/20">
          <p className="text-white/70 text-sm">
            Showing top {leaderboard.length} performers
          </p>
        </div>
      )}
    </div>
  );
}
