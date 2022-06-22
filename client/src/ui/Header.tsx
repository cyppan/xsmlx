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
        <h1>XSMLX</h1>
        {left}
      </div>
      <div className="Header-right">
        {right}
      </div>
    </div>
  );
}
