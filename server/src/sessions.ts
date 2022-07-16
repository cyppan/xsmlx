import z from 'zod';
import * as trpc from '@trpc/server';
import produce from 'immer';
import { v4 as uuid } from 'uuid';

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
  private sessions: Record<string, Session> = {};

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
  saveSession(session: Session): void {
    this.sessions[session.id] = session;
  }
  mutateSession(id: string, imperativeUpdater: (session: Session) => void) {
    const session = this.getSession(id);
    const updated = produce(session, imperativeUpdater);
    this.saveSession(updated);
  }
  getSession(id: string): Session {
    const session = this.sessions[id];
    if (!session) {
      throw new trpc.TRPCError({
        code: 'BAD_REQUEST',
        message: `could not find a session with id ${id}`,
      });
    }
    return session;
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
