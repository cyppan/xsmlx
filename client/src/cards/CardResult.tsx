import type { Session, CardSize } from '../../../server/src/sessions';
import './CardResult.css';
import _ from 'lodash';

function getUsersBySize(session: Session): Record<CardSize, string[]> {
  let votes: { user: string; size: CardSize; at: Date }[] = Object.entries(
    session.votes
  ).map(([user, { at, size }]) => ({ user, at, size }));
  votes = _.sortBy(votes, 'at');
  const usersBySize = _.mapValues(_.groupBy(votes, 'size'), (vals) =>
    _.map(vals, 'user')
  );
  return usersBySize as Record<CardSize, string[]>;
}

type CardResultProps = {
  size: string;
  session: Session;
};

export default function CardResult({ size, session }: CardResultProps) {
  const usersBySize = getUsersBySize(session);
  return (
    <>
      {session.state === 'result' && (usersBySize[size] ?? []).length > 0 && (
        <div className="CardResult" key={size}>
          {usersBySize[size].map((user) => (
            <div className="CardResultUser" title={user} key={user}>
              {user}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
