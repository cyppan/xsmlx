import cookieParser from 'cookie-parser';
import { Application } from 'express';
import express, { Request } from 'express';
import cors from 'cors';
import * as trpcExpress from '@trpc/server/adapters/express';
import trpcRouter from './router';
import ws from 'ws';
import { applyWSSHandler } from '@trpc/server/adapters/ws';

export type Config = {
  port: number;
  serveFront: boolean;
};

export function startApp(config: Config) {
  const app: Application = express();
  app.use(cookieParser());

  const createContext = ({
    req,
  }: trpcExpress.CreateExpressContextOptions) => ({});

  app.use(express.json());
  app.use(cors());
  app.options('*', cors<Request>());
  if (config.serveFront) {
    app.use(express.static(__dirname + '/../../client/build'));
  }
  app.use(
    '/trpc',
    trpcExpress.createExpressMiddleware({
      router: trpcRouter,
      createContext,
    })
  );
  const httpServer = app.listen(config.port, () => {
    console.log(`server running on port ${config.port}`);
  });

  const wsServer = new ws.Server({
    noServer: true,
    path: '/websockets',
  });

  httpServer.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, (websocket) => {
      wsServer.emit('connection', websocket, request);
    });
  });

  const handler = applyWSSHandler({
    wss: wsServer,
    router: trpcRouter,
    createContext: () => ({}),
  });

  // wsServer.on('connection', (ws) => {
  //   console.log(`+1 Connection (${wsServer.clients.size})`);
  //   ws.once('close', () => {
  //     console.log(`-1 Connection (${wsServer.clients.size})`);
  //   });
  // });

  process.on('SIGTERM', () => {
    console.log('SIGTERM');
    handler.broadcastReconnectNotification();
    wsServer.close();
  });
}
