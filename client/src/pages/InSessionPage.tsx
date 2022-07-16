import type { Session } from '../../../server/src/sessions';
import Cards from '../cards/Cards';
import Button from '../ui/Button';
import Header from '../ui/Header';
import Timer from '../ui/Timer';
import Toolbar from '../ui/Toolbar';
import { trpc } from '../App';

interface InSessionPageProps {
  user: string;
  session: Session;
}

export default function InSessionPage({ user, session }: InSessionPageProps) {
  const revealMutation = trpc.useMutation('reveal');
  const nextMutation = trpc.useMutation('next');
  
  const waitingForUsers = session.users.filter((u) => session.votes[u] == null);
  const canReveal = Object.keys(session.votes).length > 0;

  if (!['vote', 'result'].includes(session.state)) return null;

  return (
    <>
      <Header
        left={
          <span>
            <strong>{session.estimationsCount}</strong> estimated cards so far
          </span>
        }
        right={<>{user}<Timer startDate={session.startedAt!} /></>}
      />
      <br />
      <Toolbar
        left={
          session.state === 'vote' &&
          waitingForUsers.length > 0 && (
            <>waiting for {waitingForUsers.join(', ')}</>
          )
        }
        right={
          session.state === 'vote' ? (
            <Button handleClick={() => {
              revealMutation.mutate({
                sessionId: session.id
              })
            }} disabled={!canReveal}>
              reveal
            </Button>
          ) : (
            <Button handleClick={() => {
              nextMutation.mutate({
                sessionId: session.id
              })
            }}>next</Button>
          )
        }
      />
      <br />
      <Cards user={user} session={session} />
    </>
  );
}
