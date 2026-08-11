import { useEffect, useState } from 'react';
import { useAuth } from './auth';
import { supabase } from './supabase';

export function useIsAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setIsAdmin(false);
      setChecking(false);
      return;
    }

    let active = true;
    setChecking(true);
    supabase.rpc('is_admin').then(({ data, error }) => {
      if (!active) return;
      if (error) {
        console.error('is_admin check failed:', error.message);
      }
      setIsAdmin(!error && data === true);
      setChecking(false);
    });

    return () => {
      active = false;
    };
  }, [user, authLoading]);

  return { isAdmin, checking: checking || authLoading };
}
