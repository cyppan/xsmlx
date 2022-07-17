import classNames from 'classnames';

import './Card.css';

type CardProps = {
  isSelected: boolean;
  isClickable: boolean;
  onClick: () => void;
  size: string;
  belowCardSlot: React.ReactNode | undefined
}

export default function Card({
  size,
  isSelected,
  isClickable,
  onClick,
  belowCardSlot
}: CardProps) {
  return (
    <div className="CardContainer">
      <div
        className={classNames('Card', {
          'Card-selected': isSelected,
          'Card-clickable': isClickable,
        })}
        onClick={() => {
          if (isClickable) {
            onClick();
          }
        }}
      >
        {size}
      </div>
      {belowCardSlot}
      {/* {session.state === 'result' && (usersBySize[size] ?? []).length > 0 && (
        <div className="SizeBar">
          {usersBySize[size].map((user) => (
            <div className="SizeBarPart" key={user}>
              {user}
            </div>
          ))}
        </div>
      )} */}
    </div>
  );
}
