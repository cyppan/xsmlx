import React, { useState } from 'react';
import './App.css';
import type { TRPCRouter } from '../../server/src/router';
import { createReactQueryHooks } from '@trpc/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { httpLink } from '@trpc/client/links/httpLink';
import { splitLink } from '@trpc/client/links/splitLink';
import { wsLink, createWSClient } from '@trpc/client/links/wsLink';
import superjson from 'superjson';
import { useUser, useSession } from './hooks';
import InSessionPage from './pages/InSessionPage';
import CreateSessionPage from './pages/CreateSessionPage';
import WaitingRoomPage from './pages/WaitingRoomPage';

const httpApiHost =
  process.env.REACT_APP_HTTP_API_BASE_URL ||
  'http://poker-planning-http-api.localhost:8080';
const wsApiHost =
  process.env.REACT_APP_WS_API_BASE_URL ||
  'ws://poker-planning-ws-api.localhost:8081';
const apiUrl = `${httpApiHost}/session`;
const websocketUrl = `${wsApiHost}`;

console.debug('config', { apiUrl, websocketUrl });

export const trpc = createReactQueryHooks<TRPCRouter>();

function App() {
  const user = useUser();
  const session = useSession(user);

  if (session == null) {
    return <CreateSessionPage user={user} />
  } else if (session.state === 'waiting') {
    return <WaitingRoomPage user={user} session={session} />;
  } else {
    return <InSessionPage user={user} session={session} />;
  }
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

export default withTrpc(App);
