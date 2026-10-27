import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type LeaderboardEntry = { teamName: string; totalPoints: number; rank: number };
type LeaderboardResponse = { leaderboard: LeaderboardEntry[] };

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getJson<LeaderboardResponse>('/api/leaderboard')
      .then(({ leaderboard }) => {
        if (active) setEntries(leaderboard);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Request failed');
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <CapabilityCard<LeaderboardEntry>
      title="Leaderboard"
      description="Compare team point totals."
      items={entries}
      error={error}
      emptyMessage="No leaderboard rankings yet."
      renderItem={(entry) => `${entry.rank}. ${entry.teamName} - ${entry.totalPoints} points`}
    />
  );
}
