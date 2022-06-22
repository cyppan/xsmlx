import { useEffect, useState } from 'react';
import { Session } from '../../../server/src/sessions';
import { trpc } from '../App';
import Card from './Card';
import './Cards.css';

const cardSizes = ['XS', 'S', 'M', 'L', 'XL'] as const;

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
    if (myVote.size == null) {
      setRememberChoice(null);
    }
  }, [myVote]);

  const canVote = session.state === 'vote' || myVote?.size == null;

  return (
    <div className="Cards">
      {cardSizes.map(size => (
        <Card
        isSelected={rememberChoice === size}
        isClickable={canVote}
        handleClick={() => {
          estimateMutation.mutate({user, sessionId: session.id, chosenSize: size});
          setRememberChoice(size);
        }}
      >
        {size}
      </Card>
      ))}
    </div>
  );
}
