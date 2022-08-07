import classNames from 'classnames';
import { useCallback, useEffect, useRef, useState } from 'react';
import Button from './ui/Button';
import { UserContext } from './user-context';

type PromptUsernameModalProps = {
  isOpen: boolean;
  onFilled: (oldUsername: string | null, newUsername: string | null) => void
};

export default function PromptUsernameModal({
  isOpen,
  onFilled
}: PromptUsernameModalProps) {
  const inputRef = useRef<HTMLInputElement | null>();
  const [isError, setIsError] = useState<boolean>(false);
  const oldUsername = useRef<string | null>(localStorage.getItem('username'));
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);
  const commitUsername = useCallback((username: string | null) => {
    if ((username ?? "").trim().length === 0) {
      setIsError(true);
    } else {
      setIsError(false);
      onFilled(oldUsername.current, username);
      oldUsername.current = username;
    }
  }, [onFilled, setIsError]);
  return (
    <UserContext.Consumer>
      {({username, setUsername}) => (
        <div className={classNames('modal', { 'is-active': isOpen })}>
          <div className="modal-background"></div>
          <div className="modal-card">
            <header className="modal-card-head">
              <p className="modal-card-title">Your username please?</p>
            </header>
            <section className="modal-card-body">
              <input
                ref={el => inputRef.current = el}
                className={classNames('input', { 'is-danger': isError })}
                type="text"
                value={username ?? ""}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={e => e.currentTarget.select()}
                onKeyUp={(e) => {
                  if (e.key === 'Enter') {
                    commitUsername(username);
                  }
                }}
              />
            </section>
            <footer className="modal-card-foot">
              <Button handleClick={() => {
                commitUsername(username);
              }}>
                OK!
              </Button>
            </footer>
          </div>
        </div>
      )}
    </UserContext.Consumer>
  );
}
