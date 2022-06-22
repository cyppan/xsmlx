import type { Session, CardSize } from '../../../server/src/sessions';
import './Cards.css';
import './Results.css';
import _ from 'lodash';

const cardSizes = ['XS', 'S', 'M', 'L', 'XL'] as const;

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

export default function Results({
  user,
  session,
}: {
  user: string;
  session: Session;
}) {
  const usersBySize = getUsersBySize(session);
  return (
    <>
      {session.state === 'result' && (
        <div className="SizesChart">
          {session.state === 'result' &&
            cardSizes.map((size) => (
              <div className="SizeBar" key={size}>
                {(usersBySize[size] ?? []).map((user) => (
                  <div className="SizeBarPart">{user}</div>
                ))}
              </div>
            ))}
        </div>
      )}
    </>
  );
}
