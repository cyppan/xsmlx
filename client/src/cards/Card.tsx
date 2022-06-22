import classNames from 'classnames';

import './Card.css';

interface CardProps extends React.PropsWithChildren {
  isSelected: boolean;
  isClickable: boolean;
  handleClick: () => void;
}

export default function Card({
  isSelected,
  isClickable,
  handleClick,
  children,
}: CardProps) {
  return (
    <div
      className={classNames('Card', {
        'Card-selected': isSelected,
        'Card-clickable': isClickable,
      })}
      onClick={() => {
        if (isClickable) {
          handleClick();
        }
      }}
    >
      {children}
    </div>
  );
}
