import { Session } from '../../../server/src/sessions';
import { trpc } from '../App';
import Button from '../ui/Button';
import Header from '../ui/Header';
import Toolbar from '../ui/Toolbar';

export default function WaitingRoomPage({
  user,
  session,
}: {
  user: string;
  session: Session;
}) {
  const launchMutation = trpc.useMutation('launch');
  if (session.state !== 'waiting') return null;
  return (
    <>
      <Header left={'waiting for users to join'} right={user} />
      <br />
      <ul>
        <li>{session.users[0]} created this session</li>
        {session.users.slice(1).map((user) => (
          <li>{user} joined</li>
        ))}
      </ul>
      <br />
      <Toolbar>
        <Button
          handleClick={() => {
            launchMutation.mutate({ sessionId: session.id });
          }}
        >
          launch session
        </Button>
      </Toolbar>
    </>
  );
}
