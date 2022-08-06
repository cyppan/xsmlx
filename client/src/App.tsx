import React, { useState } from 'react';
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

function App({ username }: { username: string | null }) {
  const { session, joinSession } = useSession(username);

  return (
    <>
      <PromptUsernameModal
        isOpen={username == null}
        onFilled={() => joinSession()}
      ></PromptUsernameModal>
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

function withUser(
  WrappedComponent: React.FunctionComponent<{ username: string | null }>
): React.FunctionComponent {
  return function () {
    const [username, setUsername] = useState<string | null>(
      localStorage.getItem('user')
    );
    return (
      <UserContext.Provider value={{ username, setUsername }}>
        <WrappedComponent username={username} />
      </UserContext.Provider>
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

export default withTrpc(withUser(App));
