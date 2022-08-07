import type { Session } from '../../../server/src/sessions';
import Cards from '../cards/Cards';
import Button from '../ui/Button';
import Header from '../ui/Header';
import Timer from '../ui/Timer';
import Toolbar from '../ui/Toolbar';
import { trpc } from '../App';
import { useEffect, useState } from 'react';
import classNames from 'classnames';

interface InSessionPageProps {
  user?: string | null;
  session: Session;
}

export default function InSessionPage({ user, session }: InSessionPageProps) {
  const revealMutation = trpc.useMutation('reveal');
  const nextMutation = trpc.useMutation('next');
  const exitMutation = trpc.useMutation('exit');

  const [dropdownActive, setIsDropdownActive] = useState<boolean>(false);
  useEffect(() => {
    const closeDropdownCallback = () => {
      if (dropdownActive) {
        setIsDropdownActive(false);
      }
    };
    document.addEventListener('click', closeDropdownCallback);
    return () => {
      document.removeEventListener('click', closeDropdownCallback);
    };
  }, [dropdownActive]);

  const usersWhoVoted = new Set(
    session.users.filter((u) => session.votes[u] != null)
  );
  const canReveal = Object.keys(session.votes).length > 0;

  if (!['vote', 'result'].includes(session.state)) return null;

  return (
    <>
      <Header
        left={
          <div className="level-item hide-mobile">
            <p className="subtitle is-6">
              <strong>{session.estimationsCount}</strong>{' '}
              {session.estimationsCount > 1 ? 'estimates' : 'estimate'}
            </p>
          </div>
        }
        right={<Timer startDate={session.startedAt!} />}
      />
      <div className="level-item hide-desktop">
        <p className="subtitle is-6">
          <strong>{session.estimationsCount}</strong> estimates
        </p>
      </div>
      <br />
      <Toolbar
        left={
          <div
            className={classNames('dropdown', { 'is-active': dropdownActive })}
          >
            <div
              className="dropdown-trigger"
              onClick={(e) => {
                setIsDropdownActive(!dropdownActive);
                e.stopPropagation();
              }}
            >
              <button
                className="button is-white"
                aria-haspopup="true"
                aria-controls="dropdown-menu4"
              >
                <span>
                  {usersWhoVoted.size}{' '}
                  {usersWhoVoted.size > 1 ? 'votes' : 'vote'} /{' '}
                  {session.users.length}{' '}
                  {session.users.length > 1 ? 'users' : 'user'}
                </span>
                <span className="icon is-small">
                  <i className="fas fa-angle-down" aria-hidden="true"></i>
                </span>
              </button>
            </div>
            <div
              className="dropdown-menu"
              id="dropdown-menu4"
              role="menu"
              style={{ width: 300 }}
            >
              <div className="dropdown-content">
                <div className="dropdown-item">
                  <ul>
                    {session.users.map((username) => (
                      <li key={username}>
                        {username}{' '}
                        {usersWhoVoted.has(username) && (
                          <i className="far fa-check-circle has-text-success"></i>
                        )}{' '}
                        <i
                          className="fas fa-user-slash is-clickable is-pulled-right"
                          onClick={() => {
                            exitMutation.mutate({
                              user: username,
                              sessionId: session.id,
                            });
                          }}
                        ></i>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        }
        right={
          session.state === 'vote' ? (
            <Button
              handleClick={() => {
                revealMutation.mutate({
                  sessionId: session.id,
                });
              }}
              disabled={!canReveal}
            >
              reveal
            </Button>
          ) : (
            <Button
              handleClick={() => {
                nextMutation.mutate({
                  sessionId: session.id,
                });
              }}
            >
              next
            </Button>
          )
        }
      />
      <br />
      <Cards user={user} session={session} />
    </>
  );
}
