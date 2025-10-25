import { useEffect, useState } from 'react';
import { useBackend } from '@/hooks/useBackend';
import { useJwtContext } from '@lit-protocol/vincent-app-sdk/react';

export function useHealthFactor() {
  const { authInfo } = useJwtContext();
  const { getHealthFactor } = useBackend();
  const [healthFactor, setHealthFactor] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if user is authenticated
    if (!authInfo?.jwt) {
      setHealthFactor(null);
      return;
    }

    const fetchHealthFactor = async () => {
      try {
        setLoading(true);
        setError(null);
        const hf = await getHealthFactor();
        setHealthFactor(hf);
      } catch (err) {
        console.error('Error fetching health factor:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch health factor');
      } finally {
        setLoading(false);
      }
    };

    fetchHealthFactor();
    // Refresh health factor every 60 seconds
    const interval = setInterval(fetchHealthFactor, 60000);
    return () => clearInterval(interval);
  }, [getHealthFactor, authInfo?.jwt]);

  return { healthFactor, loading, error };
}

export default useHealthFactor;
