"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

interface BetFormProps {
  experienceId: string;
  onBetCreated: () => void;
}

interface BetFormData {
  sport: string;
  bet_type: string;
  description: string;
  odds_american: string;
  stake: string;
  sportsbook: string;
  game_date: string;
  notes: string;
  league: string;
}

const SPORTS = [
  "NFL", "NBA", "MLB", "NHL", "NCAAB", "NCAAF", "Soccer", "Tennis", 
  "Golf", "MMA", "Boxing", "Other"
];

const BET_TYPES = [
  "moneyline", "spread", "total", "prop", "parlay", "teaser"
];

export default function BetForm({ experienceId, onBetCreated }: BetFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<BetFormData>({
    sport: "",
    bet_type: "",
    description: "",
    odds_american: "",
    stake: "",
    sportsbook: "",
    game_date: "",
    notes: "",
    league: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/bets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          experience_id: experienceId,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create bet");
      }

      setSuccess("Bet created successfully!");
      setFormData({
        sport: "",
        bet_type: "",
        description: "",
        odds_american: "",
        stake: "",
        sportsbook: "",
        game_date: "",
        notes: "",
        league: "",
      });
      
      onBetCreated();
      
      // Close form after a short delay
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(null);
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add New Bet
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Add New Bet</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-200">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Sport *
              </label>
              <select
                name="sport"
                value={formData.sport}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Sport</option>
                {SPORTS.map(sport => (
                  <option key={sport} value={sport} className="bg-slate-800 text-white">
                    {sport}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Bet Type *
              </label>
              <select
                name="bet_type"
                value={formData.bet_type}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Bet Type</option>
                {BET_TYPES.map(type => (
                  <option key={type} value={type} className="bg-slate-800 text-white">
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              placeholder="e.g., Lakers -5.5 vs Warriors"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Odds (American) *
              </label>
              <input
                type="number"
                name="odds_american"
                value={formData.odds_american}
                onChange={handleInputChange}
                required
                placeholder="e.g., -110 or +150"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Stake ($) *
              </label>
              <input
                type="number"
                step="0.01"
                name="stake"
                value={formData.stake}
                onChange={handleInputChange}
                required
                placeholder="e.g., 100.00"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Sportsbook
              </label>
              <input
                type="text"
                name="sportsbook"
                value={formData.sportsbook}
                onChange={handleInputChange}
                placeholder="e.g., DraftKings, FanDuel"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Game Date
              </label>
              <input
                type="datetime-local"
                name="game_date"
                value={formData.game_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              League/Competition
            </label>
            <input
              type="text"
              name="league"
              value={formData.league}
              onChange={handleInputChange}
              placeholder="e.g., NBA, Premier League"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Additional notes or analysis..."
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white rounded-lg transition-colors"
            >
              {isSubmitting ? "Creating..." : "Create Bet"}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
