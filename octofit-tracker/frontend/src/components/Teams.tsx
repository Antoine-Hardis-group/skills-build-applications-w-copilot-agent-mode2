import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Team = { name: string; mascot: string; members: unknown[] };
type TeamsResponse = { teams: Team[] };

export default function Teams() {
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getJson<TeamsResponse>('/api/teams')
      .then(({ teams: data }) => {
        if (active) setTeams(data);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Request failed');
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <CapabilityCard<Team>
      title="Teams"
      description="Manage teams and members."
      items={teams}
      error={error}
      emptyMessage="No teams yet."
      renderItem={(team) => `${team.name} (${team.mascot}) - ${team.members.length} members`}
    />
  );
}
