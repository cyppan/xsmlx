import express, { Application } from 'express';
import { Request } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import * as trpcExpress from '@trpc/server/adapters/express';
import appRouter from './router';

const app: Application = express();
app.use(cookieParser());

const createContext = ({
  req,
}: trpcExpress.CreateExpressContextOptions) => ({});

app.use(express.json());
app.use(cors());
app.options('*', cors<Request>());
app.use(
  '/session',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

app.listen(8080, () => {
  console.log('Server running on port 8080');
});

import ws from 'ws';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
const wss = new ws.Server({
  port: 8081,
});
const handler = applyWSSHandler({
  wss,
  router: appRouter,
  createContext: () => ({}),
});

wss.on('connection', (ws) => {
  console.log(`+1 Connection (${wss.clients.size})`);
  ws.once('close', () => {
    console.log(`-1 Connection (${wss.clients.size})`);
  });
});
console.log('WebSocket Server listening on ws://localhost:8081');

process.on('SIGTERM', () => {
  console.log('SIGTERM');
  handler.broadcastReconnectNotification();
  wss.close();
});
