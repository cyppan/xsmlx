import z from 'zod';
import * as trpc from '@trpc/server';
import produce from 'immer';
import { v4 as uuid } from 'uuid';
import { RedisClientType } from 'redis';
import superjson from 'superjson';

export type CardSize = string;
export const Session = z.object({
  id: z.string(),
  startedAt: z.date().nullish(),
  estimationsCount: z.number(),
  possibleSizes: z.array(z.string()),
  users: z.array(z.string()),
  votes: z.record(
    z.object({
      size: z.string(),
      at: z.date(),
    })
  ),
  state: z.enum(['waiting', 'vote', 'result']),
});
export type Session = z.infer<typeof Session>;

export class SessionsStore {
  constructor(private redisClient: RedisClientType) {}

  createSession(user: string, possibleSizes: string[]): Session {
    const session: Session = {
      id: uuid(),
      possibleSizes,
      users: [user],
      votes: {},
      estimationsCount: 0,
      state: 'waiting',
    };
    return session;
  }
  async saveSession(session: Session): Promise<Session> {
    await this.redisClient.set(session.id, superjson.stringify(session), {
      EX: 24 * 60 * 60,
    });
    return session;
  }
  async mutateSession(
    id: string,
    imperativeUpdater: (session: Session) => void
  ): Promise<Session> {
    const session = await this.getSession(id);
    const updated = produce(session, imperativeUpdater);
    await this.saveSession(updated);
    return updated;
  }
  async getSession(id: string): Promise<Session> {
    const sessionRaw = await this.redisClient.get(id);
    if (!sessionRaw) {
      throw new trpc.TRPCError({
        code: 'BAD_REQUEST',
        message: `could not find a session with id ${id}`,
      });
    }
    return superjson.parse<Session>(sessionRaw);
  }
}

export function mapAnonymousVotes(session: Session): Session {
  if (session.state === 'vote') {
    const safeSession = produce(session, (draft) => {
      for (const k in draft.votes) {
        draft.votes[k].size = '?';
      }
    });
    return safeSession;
  }
  return session;
}
