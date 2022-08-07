import type { Session } from '../../server/src/sessions';
import { trpc } from './App';
import { useCallback, useState } from 'react';

export function useSession(): {
  session: Session | null;
  joinSession: (username: string) => void;
  rename: (oldUsername: string, newUsername: string) => void;
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
  const renameMutation = trpc.useMutation('rename');
  if (session == null) {
    if (sessionQuery.data != null) {
      setSession(sessionQuery.data);
    }
  }
  const joinSession = useCallback(
    (username: string) => {
      if (session != null) {
        joinMutation.mutate({ sessionId: session.id, user: username });
      }
    },
    [session, joinMutation]
  );
  const rename = useCallback(
    (oldUsername: string, newUsername: string) => {
      if (session != null) {
        renameMutation.mutate({
          sessionId: session.id,
          oldUsername,
          newUsername,
        });
      }
    },
    [session, renameMutation]
  );
  return { session, joinSession, rename };
}
