import type { Session } from '../../server/src/sessions';
import { trpc } from './App';
import { useState } from 'react';

export function useUser(): string {
  let user = localStorage.getItem('user');
  while (user == null || user.trim() === '') {
    user = window.prompt("What's your name?");
  }
  localStorage.setItem('user', user);
  return user!;
}

export function useSession(user: string): Session | null {
  const sessionId = window.location.hash && window.location.hash.substring(1);
  const [session, setSession] = useState<Session | null>(null);
  trpc.useSubscription(['onSessionChanged', { sessionId }], {
    onNext: (session) => {
      setSession(session);
    },
  });
  // used at application start
  const sessionQuery = trpc.useQuery(['get', { sessionId, user }]);
  const joinMutation = trpc.useMutation('join');
  if (session == null) {
    if (sessionQuery.data != null) {
      setSession(sessionQuery.data);
      joinMutation.mutate({ sessionId: sessionQuery.data.id, user });
    }
  }
  return session;
}
