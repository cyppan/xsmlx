import * as trpc from '@trpc/server';
import z from 'zod';
import { EventEmitter } from 'events';
import { SessionsStore, Session, mapAnonymousVotes } from './sessions';
import superjson from 'superjson';
import { RedisClientType } from 'redis';

interface MyEvents {
  sessionChanged: (session: Session) => void;
}
declare interface MyEventEmitter {
  on<U extends keyof MyEvents>(event: U, listener: MyEvents[U]): this;
  once<U extends keyof MyEvents>(event: U, listener: MyEvents[U]): this;
  emit<U extends keyof MyEvents>(
    event: U,
    ...args: Parameters<MyEvents[U]>
  ): boolean;
}
class MyEventEmitter extends EventEmitter {}
const ee = new MyEventEmitter();

interface Context {}

export const buildTrpcRouter = (sessionsStore: SessionsStore) =>
  trpc
    .router<Context>()
    .transformer(superjson)
    .query('get', {
      input: z.object({ sessionId: z.string(), user: z.string() }),
      output: Session,
      async resolve(req) {
        return mapAnonymousVotes(
          await sessionsStore.getSession(req.input.sessionId)
        );
      },
    })
    .mutation('create', {
      input: z.object({ user: z.string(), possibleSizes: z.array(z.string()) }),
      output: z.string(),
      async resolve(req) {
        const session = sessionsStore.createSession(
          req.input.user,
          req.input.possibleSizes
        );
        await sessionsStore.saveSession(session);
        return session.id;
      },
    })
    .mutation('join', {
      input: z.object({
        user: z.string(),
        sessionId: z.string(),
      }),
      async resolve(req) {
        const session = await sessionsStore.mutateSession(
          req.input.sessionId,
          (session) => {
            if (!session.users.includes(req.input.user)) {
              session.users.push(req.input.user);
            }
          }
        );
        ee.emit('sessionChanged', session);
      },
    })
    .mutation('launch', {
      input: z.object({
        sessionId: z.string(),
      }),
      async resolve(req) {
        const session = await sessionsStore.mutateSession(
          req.input.sessionId,
          (session) => {
            session.state = 'vote';
            session.startedAt = new Date();
          }
        );
        ee.emit('sessionChanged', session);
      },
    })
    .mutation('estimateSize', {
      input: z.object({
        sessionId: z.string(),
        user: z.string(),
        chosenSize: z.string(),
      }),
      async resolve(req) {
        const session = await sessionsStore.mutateSession(
          req.input.sessionId,
          (session) => {
            session.votes[req.input.user] = {
              size: req.input.chosenSize,
              at: new Date(),
            };
            if (
              session.users.every((user) => session.votes[user] != null) &&
              session.state === 'vote'
            ) {
              session.estimationsCount += 1;
              session.state = 'result';
            }
          }
        );
        ee.emit('sessionChanged', session);
      },
    })
    .mutation('reveal', {
      input: z.object({
        sessionId: z.string(),
      }),
      async resolve(req) {
        const session = await sessionsStore.mutateSession(
          req.input.sessionId,
          (session) => {
            session.state = 'result';
            session.estimationsCount += 1;
          }
        );
        ee.emit('sessionChanged', session);
      },
    })
    .mutation('next', {
      input: z.object({ sessionId: z.string() }),
      async resolve(req) {
        const session = await sessionsStore.mutateSession(
          req.input.sessionId,
          (session) => {
            session.votes = {};
            session.state = 'vote';
          }
        );
        ee.emit('sessionChanged', session);
      },
    })
    .subscription('onSessionChanged', {
      input: z.object({ sessionId: z.string() }),
      resolve({ ctx, input }) {
        // undefined input, no input schema equivalent to the mutations or queries?
        return new trpc.Subscription<Session>((emit) => {
          const onSessionChanged = (session: Session) => {
            if (session.id === input.sessionId) {
              emit.data(mapAnonymousVotes(session));
            }
          };
          ee.on('sessionChanged', onSessionChanged);
          return () => {
            ee.off('sessionChanged', onSessionChanged);
          };
        });
      },
    });

export type TRPCRouter = ReturnType<typeof buildTrpcRouter>;
