import classNames from 'classnames';
import { useState } from 'react';
import { UserContext } from './user-context';

type PromptUsernameModalProps = {
  isOpen: boolean;
  onFilled: () => void
};

export default function PromptUsernameModal({
  isOpen,
  onFilled
}: PromptUsernameModalProps) {
  const [modalOpen, setModalOpen] = useState<boolean>(isOpen);
  const [isError, setIsError] = useState<boolean>(false);
  return (
    <UserContext.Consumer>
      {({username, setUsername}) => (
        <div className={classNames('modal', { 'is-active': modalOpen })}>
          <div className="modal-background"></div>
          <div className="modal-card">
            <header className="modal-card-head">
              <p className="modal-card-title">Your username please?</p>
            </header>
            <section className="modal-card-body">
              <input
                className={classNames('input', { 'is-danger': isError })}
                type="text"
                value={username ?? ""}
                onChange={(e) => setUsername(e.target.value)}
              />
            </section>
            <footer className="modal-card-foot">
              <button
                className="button is-success"
                onClick={() => {
                  if ((username ?? "").trim().length === 0) {
                    setIsError(true);
                  } else {
                    setIsError(false);
                    setUsername(username!);
                    setModalOpen(false);
                    onFilled();
                  }
                }}
              >
                Ok!
              </button>
            </footer>
          </div>
        </div>
      )}
    </UserContext.Consumer>
  );
}
