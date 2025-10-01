/**
 * Betting calculation utilities for BetTracker Pro
 */

export function calculatePotentialReturn(stake: number, oddsAmerican: number): number {
  if (!stake || !oddsAmerican) return 0;
  
  if (oddsAmerican > 0) {
    return stake * (oddsAmerican / 100);
  } else {
    return stake * (100 / Math.abs(oddsAmerican));
  }
}

export function convertAmericanToDecimal(american: number): number {
  if (american > 0) {
    return (american / 100) + 1;
  } else {
    return (100 / Math.abs(american)) + 1;
  }
}

export function calculateROI(totalReturned: number, totalStaked: number): number {
  if (totalStaked === 0) return 0;
  return ((totalReturned - totalStaked) / totalStaked) * 100;
}

export function calculateWinRate(wins: number, totalBets: number): number {
  if (totalBets === 0) return 0;
  return (wins / totalBets) * 100;
}

export function updateStreak(currentStreak: number, betResult: string): number {
  if (betResult === "won") {
    return currentStreak >= 0 ? currentStreak + 1 : 1;
  } else if (betResult === "lost") {
    return currentStreak <= 0 ? currentStreak - 1 : -1;
  }
  return currentStreak;
}

export function calculateActualReturn(stake: number, potentialReturn: number, result: string): number {
  switch (result) {
    case "won":
      return stake + potentialReturn;
    case "lost":
      return 0;
    case "push":
      return stake;
    case "void":
      return stake;
    default:
      return 0;
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatOdds(odds: number): string {
  return odds > 0 ? `+${odds}` : `${odds}`;
}
