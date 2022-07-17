import { useEffect, useState } from 'react';
import type { Session } from '../../../server/src/sessions';
import { trpc } from '../App';
import Card from './Card';
import CardResult from './CardResult';
import './Cards.css';

export default function Cards({
  user,
  session,
}: {
  user: string;
  session: Session;
}) {
  const [rememberChoice, setRememberChoice] = useState<string | null>(null);
  const estimateMutation = trpc.useMutation('estimateSize');

  const myVote = session.votes[user];
  useEffect(() => {
    if (myVote?.size == null) {
      setRememberChoice(null);
    }
  }, [myVote]);

  const canVote = session.state === 'vote' || myVote?.size == null;

  return (
    <div className="Cards">
      {session.possibleSizes.map((size) => (
        <Card
          size={size}
          key={size}
          isSelected={rememberChoice === size}
          isClickable={canVote}
          onClick={() => {
            estimateMutation.mutate({
              user,
              sessionId: session.id,
              chosenSize: size,
            });
            setRememberChoice(size);
          }}
          belowCardSlot={<CardResult session={session} size={size} />}
        />
      ))}
    </div>
  );
}
