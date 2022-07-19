import React from 'react';
import './Header.css';

interface HeaderProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
}

export default function Header({ left, right }: HeaderProps) {
  return (
    <div className="Header">
      <div className="Header-left">
        <h1>
          <span style={{ fontSize: '0.6em' }}>X</span>
          <span style={{ fontSize: '0.7em' }}>S</span>
          <span style={{ fontSize: '0.8em' }}>M</span>
          <span style={{ fontSize: '0.9em' }}>L</span>
          <span>X</span>
        </h1>
        {left}
      </div>
      <div className="Header-right">{right}</div>
    </div>
  );
}
