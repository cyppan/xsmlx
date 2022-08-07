import React from 'react';
import { UserContext } from '../user-context';
import './Header.css';

interface HeaderProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
}

export default function Header({ left, right }: HeaderProps) {
  return (
    <UserContext.Consumer>
      {({ setIsEditingUsername, username }) => (
        <nav className="level is-mobile">
          <div className="level-left">
            <div
              className="title Header-title is-clickable"
              onClick={() => {
                window.location.href =
                  window.location.protocol + '//' + window.location.host;
              }}
            >
              <span style={{ fontSize: '0.6em' }}>X</span>
              <span style={{ fontSize: '0.7em' }}>S</span>
              <span style={{ fontSize: '0.8em' }}>M</span>
              <span style={{ fontSize: '0.9em' }}>L</span>
              <span>X</span>
            </div>
            {left}
          </div>
          <div className="level-right">
            <span
              className="is-clickable mr-2"
              onClick={() => {
                setIsEditingUsername(true);
              }}
            >
              {username}
            </span>
            {right}
          </div>
        </nav>
      )}
    </UserContext.Consumer>
  );
}
