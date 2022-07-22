import React from 'react';
import './Button.css';

interface ButtonProps extends React.PropsWithChildren {
  disabled?: boolean;
  handleClick: React.MouseEventHandler<HTMLButtonElement>;
}

export default function Button({
  children,
  handleClick,
  disabled,
}: ButtonProps) {
  return (
    <button className="Button" onClick={handleClick} disabled={disabled}>
      {children}
    </button>
  );
}
