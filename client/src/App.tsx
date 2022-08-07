import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import type { TRPCRouter } from '../../server/src/router';
import { createReactQueryHooks } from '@trpc/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { httpLink } from '@trpc/client/links/httpLink';
import { splitLink } from '@trpc/client/links/splitLink';
import { wsLink, createWSClient } from '@trpc/client/links/wsLink';
import superjson from 'superjson';
import { useSession } from './hooks';
import InSessionPage from './pages/InSessionPage';
import CreateSessionPage from './pages/CreateSessionPage';
import WaitingRoomPage from './pages/WaitingRoomPage';
import PromptUsernameModal from './PromptUsernameModal';
import { UserContext } from './user-context';
import type { Session } from '../../server/src/sessions';

const host = process.env.REACT_APP_HOST;
const apiUrl = `http${
  process.env.REACT_APP_TLS === 'true' ? 's' : ''
}://${host}/trpc`;
const websocketUrl = `ws${
  process.env.REACT_APP_TLS === 'true' ? 's' : ''
}://${host}/websockets`;

if (!host || host.trim() === '') {
  throw new Error('missing env var REACT_APP_HOST');
}
console.debug('config', { apiUrl, websocketUrl });

export const trpc = createReactQueryHooks<TRPCRouter>();

function App({
  username,
  session,
}: {
  username: string | null;
  session: Session | null;
}) {
  return (
    <>
      {session == null ? (
        <CreateSessionPage user={username} />
      ) : session.state === 'waiting' ? (
        <WaitingRoomPage user={username} session={session} />
      ) : (
        <InSessionPage user={username} session={session} />
      )}
    </>
  );
}

function withUserAndSession(
  WrappedComponent: React.FunctionComponent<{
    username: string | null;
    session: Session | null;
  }>
): React.FunctionComponent {
  return function () {
    const [isEditingUsername, setIsEditingUsername] = useState<boolean>(false);
    const [username, setUsername] = useState<string | null>(
      localStorage.getItem('username')
    );
    const { session, joinSession, rename } = useSession();

    // Open username prompt modal on page load if no local storage
    useEffect(() => {
      const currentUsername = localStorage.getItem('username');
      if (currentUsername == null || currentUsername.length === 0) {
        setIsEditingUsername(true);
      }
    }, [setIsEditingUsername]);

    // automatically join the session on page load if local storage
    const shouldAutoJoinSession = useRef<boolean>(true);
    useEffect(() => {
      if (isEditingUsername) {
        shouldAutoJoinSession.current = false;
      }
      const currentUsername = localStorage.getItem('username');
      if (
        currentUsername != null &&
        currentUsername.length > 0 &&
        shouldAutoJoinSession.current &&
        session &&
        !session?.users.includes(currentUsername)
      ) {
        joinSession(currentUsername);
        shouldAutoJoinSession.current = false;
      }
    }, [isEditingUsername, joinSession, session]);

    return (
      <>
        <UserContext.Provider
          value={{
            username,
            setUsername,
            isEditingUsername,
            setIsEditingUsername,
          }}
        >
          <PromptUsernameModal
            isOpen={isEditingUsername}
            onFilled={(oldUsername, newUsername) => {
              if (newUsername != null && newUsername.length > 0) {
                localStorage.setItem('username', newUsername);
                if (oldUsername != null && oldUsername.length > 0) {
                  rename(oldUsername, newUsername);
                } else {
                  joinSession(newUsername);
                }
                setIsEditingUsername(false);
              }
            }}
          ></PromptUsernameModal>
          <WrappedComponent username={username} session={session} />
        </UserContext.Provider>
      </>
    );
  };
}

function withTrpc(
  WrappedComponent: React.FunctionComponent
): React.FunctionComponent {
  return function () {
    const [queryClient] = useState(() => new QueryClient());
    const [trpcClient] = useState(() =>
      trpc.createClient({
        transformer: superjson,
        links: [
          splitLink({
            condition(op) {
              return op.type === 'subscription';
            },
            true: wsLink({
              client: createWSClient({
                url: websocketUrl,
              }),
            }),
            false: httpLink({
              url: apiUrl,
            }),
          }),
        ],
      })
    );
    return (
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <WrappedComponent />
        </QueryClientProvider>
      </trpc.Provider>
    );
  };
}

export default withTrpc(withUserAndSession(App));
