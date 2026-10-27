import { useEffect, useState, type ReactNode } from 'react';
import { getJson } from '../api/client.js';

type Props<T, K extends string> = {
  title: string;
  description: string;
  endpoint: string;
  dataKey: K;
  emptyMessage: string;
  renderItem: (item: T) => ReactNode;
};

export function CapabilityCard<T, K extends string>({
  title,
  description,
  endpoint,
  dataKey,
  emptyMessage,
  renderItem,
}: Props<T, K>) {
  const [items, setItems] = useState<T[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getJson<{ [key in K]: T[] }>(endpoint)
      .then((response) => {
        if (active) setItems(response[dataKey]);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Request failed');
      });

    return () => {
      active = false;
    };
  }, [dataKey, endpoint]);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {error ? (
          <p role="alert">Unable to load {title.toLowerCase()}: {error}</p>
        ) : items === null ? (
          <p role="status">Loading {title.toLowerCase()}...</p>
        ) : items.length === 0 ? (
          <p>{emptyMessage}</p>
        ) : (
          <ul className="list-unstyled mb-0">{items.map((item, index) => <li key={index}>{renderItem(item)}</li>)}</ul>
        )}
      </div>
    </section>
  );
}
