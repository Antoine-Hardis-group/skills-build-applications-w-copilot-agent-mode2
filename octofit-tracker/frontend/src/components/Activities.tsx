import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Activity = { type: string; minutes: number; points: number };
type ActivitiesResponse = { activities: Activity[] };

export default function Activities() {
  const [activities, setActivities] = useState<Activity[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getJson<ActivitiesResponse>('/api/activities')
      .then(({ activities: data }) => {
        if (active) setActivities(data);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Request failed');
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <CapabilityCard<Activity>
      title="Activities"
      description="Track student activity minutes and points."
      items={activities}
      error={error}
      emptyMessage="No activities yet."
      renderItem={(activity) => `${activity.type} - ${activity.minutes} minutes - ${activity.points} points`}
    />
  );
}
