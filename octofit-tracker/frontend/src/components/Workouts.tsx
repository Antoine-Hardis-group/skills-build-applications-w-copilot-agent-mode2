import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type WorkoutSuggestion = { title: string; reason: string };
type WorkoutSuggestionsResponse = { suggestions: WorkoutSuggestion[] };

export default function Workouts() {
  const [suggestions, setSuggestions] = useState<WorkoutSuggestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getJson<WorkoutSuggestionsResponse>(`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`)
      .then(({ suggestions: data }) => {
        if (active) setSuggestions(data);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Request failed');
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <CapabilityCard<WorkoutSuggestion>
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      items={suggestions}
      error={error}
      emptyMessage="No workout suggestions yet."
      renderItem={(suggestion) => `${suggestion.title} - ${suggestion.reason}`}
    />
  );
}
