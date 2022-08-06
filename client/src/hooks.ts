import type { Session } from '../../server/src/sessions';
import { trpc } from './App';
import { useCallback, useState } from 'react';

export function useSession(user: string | null): {
  session: Session | null;
  joinSession: () => void;
} {
  const sessionId = window.location.hash && window.location.hash.substring(1);
  const [session, setSession] = useState<Session | null>(null);
  trpc.useSubscription(['onSessionChanged', { sessionId }], {
    onNext: (session) => {
      setSession(session);
    },
  });
  // used at application start
  const sessionQuery = trpc.useQuery(['get', { sessionId }]);
  const joinMutation = trpc.useMutation('join');
  if (session == null) {
    if (sessionQuery.data != null) {
      setSession(sessionQuery.data);
    }
  }
  const joinSession = useCallback(() => {
    if (session != null && user != null) {
      joinMutation.mutate({ sessionId: session.id, user });
    }
  }, [session, user, joinMutation]);
  return { session, joinSession };
}
