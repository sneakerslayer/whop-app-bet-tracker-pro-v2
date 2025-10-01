"use client";

import { TrendingUp, TrendingDown, Target, DollarSign, Zap, Trophy } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/lib/calculations";

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

interface StatsOverviewProps {
  stats: UserStats;
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend?: "up" | "down" | "neutral";
}

function StatCard({ title, value, icon: Icon, color, trend }: StatCardProps) {
  const getTrendIcon = () => {
    if (trend === "up") return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (trend === "down") return <TrendingDown className="w-4 h-4 text-red-400" />;
    return null;
  };

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {getTrendIcon()}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-white/70 text-sm">{title}</div>
    </div>
  );
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  const getProfitColor = () => {
    if (stats.net_profit > 0) return "bg-green-500/20";
    if (stats.net_profit < 0) return "bg-red-500/20";
    return "bg-blue-500/20";
  };

  const getROIColor = () => {
    if (stats.roi > 0) return "bg-green-500/20";
    if (stats.roi < 0) return "bg-red-500/20";
    return "bg-blue-500/20";
  };

  const getStreakColor = () => {
    if (stats.current_streak > 0) return "bg-green-500/20";
    if (stats.current_streak < 0) return "bg-red-500/20";
    return "bg-blue-500/20";
  };

  const getWinRateColor = () => {
    if (stats.win_rate >= 60) return "bg-green-500/20";
    if (stats.win_rate >= 50) return "bg-yellow-500/20";
    return "bg-red-500/20";
  };

  const getUnitsColor = () => {
    if (stats.units_won > 0) return "bg-green-500/20";
    if (stats.units_won < 0) return "bg-red-500/20";
    return "bg-blue-500/20";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard
        title="Total Bets"
        value={stats.total_bets.toString()}
        icon={Target}
        color="bg-blue-500/20"
        trend="neutral"
      />
      
      <StatCard
        title="Win Rate"
        value={formatPercentage(stats.win_rate)}
        icon={Trophy}
        color={getWinRateColor()}
        trend={stats.win_rate >= 50 ? "up" : "down"}
      />
      
      <StatCard
        title="ROI"
        value={formatPercentage(stats.roi)}
        icon={TrendingUp}
        color={getROIColor()}
        trend={stats.roi > 0 ? "up" : stats.roi < 0 ? "down" : "neutral"}
      />
      
      <StatCard
        title="Net Profit"
        value={formatCurrency(stats.net_profit)}
        icon={DollarSign}
        color={getProfitColor()}
        trend={stats.net_profit > 0 ? "up" : stats.net_profit < 0 ? "down" : "neutral"}
      />
      
      <StatCard
        title="Current Streak"
        value={stats.current_streak > 0 ? `+${stats.current_streak}` : stats.current_streak.toString()}
        icon={Zap}
        color={getStreakColor()}
        trend={stats.current_streak > 0 ? "up" : stats.current_streak < 0 ? "down" : "neutral"}
      />
      
      <StatCard
        title="Units Won"
        value={stats.units_won > 0 ? `+${stats.units_won.toFixed(2)}` : stats.units_won.toFixed(2)}
        icon={Trophy}
        color={getUnitsColor()}
        trend={stats.units_won > 0 ? "up" : stats.units_won < 0 ? "down" : "neutral"}
      />
    </div>
  );
}
