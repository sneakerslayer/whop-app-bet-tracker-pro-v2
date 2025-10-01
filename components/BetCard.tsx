"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Minus, Clock, Trophy, DollarSign } from "lucide-react";
import { formatCurrency, formatOdds, formatPercentage } from "@/lib/calculations";

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

interface BetCardProps {
  bet: Bet;
  onBetSettled: () => void;
}

const RESULT_COLORS = {
  won: "text-green-400",
  lost: "text-red-400",
  push: "text-yellow-400",
  void: "text-gray-400",
  pending: "text-blue-400",
};

const RESULT_ICONS = {
  won: CheckCircle,
  lost: XCircle,
  push: Minus,
  void: Minus,
  pending: Clock,
};

export default function BetCard({ bet, onBetSettled }: BetCardProps) {
  const [isSettling, setIsSettling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ResultIcon = RESULT_ICONS[bet.result as keyof typeof RESULT_ICONS];
  const resultColor = RESULT_COLORS[bet.result as keyof typeof RESULT_COLORS];

  const handleSettleBet = async (result: string) => {
    setIsSettling(true);
    setError(null);

    try {
      const response = await fetch("/api/bets/settle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bet_id: bet.id,
          result,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to settle bet");
      }

      onBetSettled();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSettling(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <ResultIcon className={`w-5 h-5 ${resultColor}`} />
          <span className="text-white font-medium">{bet.sport}</span>
          {bet.league && (
            <>
              <span className="text-white/50">•</span>
              <span className="text-white/70 text-sm">{bet.league}</span>
            </>
          )}
        </div>
        <div className="text-right">
          <div className="text-white/70 text-sm">
            {formatDate(bet.created_at)}
          </div>
          {bet.settled_at && (
            <div className="text-white/50 text-xs">
              Settled: {formatDate(bet.settled_at)}
            </div>
          )}
        </div>
      </div>

      <div className="mb-3">
        <h3 className="text-white font-medium mb-1">{bet.description}</h3>
        <div className="flex items-center gap-4 text-sm text-white/70">
          <span className="flex items-center gap-1">
            <Trophy className="w-4 h-4" />
            {bet.bet_type.charAt(0).toUpperCase() + bet.bet_type.slice(1)}
          </span>
          <span>Odds: {formatOdds(bet.odds_american)}</span>
          <span className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            {formatCurrency(bet.stake)}
          </span>
        </div>
      </div>

      {bet.sportsbook && (
        <div className="mb-3">
          <span className="text-xs bg-white/10 px-2 py-1 rounded text-white/70">
            {bet.sportsbook}
          </span>
        </div>
      )}

      {bet.notes && (
        <div className="mb-3 p-2 bg-white/5 rounded text-white/80 text-sm">
          {bet.notes}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <div className="text-sm">
            <div className="text-white/70">Potential Return:</div>
            <div className="text-white font-medium">
              {formatCurrency(bet.potential_return)}
            </div>
          </div>
          {bet.result !== "pending" && (
            <div className="text-sm">
              <div className="text-white/70">Actual Return:</div>
              <div className={`font-medium ${
                bet.actual_return > bet.stake ? "text-green-400" : 
                bet.actual_return < bet.stake ? "text-red-400" : 
                "text-yellow-400"
              }`}>
                {formatCurrency(bet.actual_return)}
              </div>
            </div>
          )}
        </div>

        {bet.result === "pending" && (
          <div className="flex gap-2">
            {error && (
              <div className="text-red-400 text-xs mb-2">{error}</div>
            )}
            <button
              onClick={() => handleSettleBet("won")}
              disabled={isSettling}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white text-sm rounded transition-colors"
            >
              Won
            </button>
            <button
              onClick={() => handleSettleBet("lost")}
              disabled={isSettling}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white text-sm rounded transition-colors"
            >
              Lost
            </button>
            <button
              onClick={() => handleSettleBet("push")}
              disabled={isSettling}
              className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-600/50 text-white text-sm rounded transition-colors"
            >
              Push
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
