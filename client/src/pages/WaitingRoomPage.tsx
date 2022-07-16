import { useEffect, useState } from 'react';
import type { Session } from '../../../server/src/sessions';
import { trpc } from '../App';
import Button from '../ui/Button';
import Header from '../ui/Header';
import Toolbar from '../ui/Toolbar';

import './WaitingRoomPage.css';

function useJustCopied(): [boolean, () => void] {
  const [justCopied, setJustCopied] = useState<boolean>(false);

  useEffect(() => {
    let currentTimeoutId: NodeJS.Timeout;
    if (justCopied) {
      currentTimeoutId = setTimeout(() => {
        setJustCopied(false);
      }, 1000);
    }
    return () => {
      if (currentTimeoutId != null) {
        clearTimeout(currentTimeoutId);
      }
    }
  }, [justCopied]);

  const onCopy = () => {
    if (!justCopied) {
      setJustCopied(true)
    }
  };
  return [justCopied, onCopy];
}

export default function WaitingRoomPage({
  user,
  session,
}: {
  user: string;
  session: Session;
}) {
  const [justCopied, onCopy] = useJustCopied();

  const launchMutation = trpc.useMutation('launch');
  if (session.state !== 'waiting') return null;
  return (
    <>
      <Header left={'waiting for users to join'} right={user} />
      <Toolbar>
        <div className="WaitingRoomContainer">
          <div className="CopySessionLink">
            <input
              className="CopySessionLinkInput"
              readOnly
              value={window.location.href}
            />
            <button
              onClick={(_) => {
                navigator.clipboard
                  .writeText(window.location.href)
                  .then(() => {
                    onCopy();
                  })
                  .catch((err) => {
                    console.error(err);
                  });
              }}
              className="CopySessionLinkButton"
            >
              {justCopied ? <>copied!&nbsp;&nbsp;</> : 'copy link'}
            </button>
          </div>
          <ul>
            <li>{session.users[0]} created this session</li>
            {session.users.slice(1).map((user) => (
              <li>{user} joined</li>
            ))}
          </ul>
          <Button
            handleClick={() => {
              launchMutation.mutate({ sessionId: session.id });
            }}
          >
            launch session
          </Button>
        </div>
      </Toolbar>
    </>
  );
}
