import { CapabilityCard } from './CapabilityCard.js';

type Team = { name: string; mascot: string; members: unknown[] };

export default function Teams() {
  return (
    <CapabilityCard<Team, 'teams'>
      title="Teams"
      description="Manage teams and members."
      endpoint="/api/teams"
      dataKey="teams"
      emptyMessage="No teams yet."
      renderItem={(team) => `${team.name} (${team.mascot}) - ${team.members.length} members`}
    />
  );
}
