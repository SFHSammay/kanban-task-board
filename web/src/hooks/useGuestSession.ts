import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useGuestSession() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function ensureGuestSession() {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        if (active) {
          setError(sessionError.message);
        }
        return;
      }

      if (session) {
        if (active) {
          setReady(true);
        }
        return;
      }

      const { error: signInError } = await supabase.auth.signInAnonymously();
      if (active) {
        setError(signInError?.message ?? null);
        setReady(!signInError);
      }
    }

    void ensureGuestSession();
    return () => {
      active = false;
    };
  }, []);

  return { ready, error };
}

