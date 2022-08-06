import React, { useEffect, useState } from 'react';
import { trpc } from '../App';
import Button from '../ui/Button';
import Header from '../ui/Header';
import Toolbar from '../ui/Toolbar';

import './CreateSessionPage.css';

function fibonacci(n: number): number[] {
  if (n === 1) return [1];
  if (n === 2) return [1, 2];
  const prev = fibonacci(n - 1);
  return [...prev, prev[prev.length - 2] + prev[prev.length - 1]];
}

const cardSizePatterns = ['TeeShirtSize', 'Fibonacci'] as const;
type CardSizePattern = typeof cardSizePatterns[number];
function isCardSizePattern(size: string): size is CardSizePattern {
  const patterns: string[] = [...cardSizePatterns];
  return patterns.includes(size);
}
const cardSizeDefaults: Record<CardSizePattern, string[]> = {
  TeeShirtSize: ['XS', 'S', 'M', 'L', 'XL'],
  Fibonacci: fibonacci(5).map((n) => String(n)),
};

const possibleTeeShirtSizes: string[] = [
  'XXS',
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  '?',
];
const possibleFibonacciSizes: string[] = [
  ...fibonacci(8).map((n) => String(n)),
  '?',
];

type EnumerableSizeFormProps = {
  cardSizes: string[];
  setCardSizes: (sizes: string[]) => void;
  possibleSizes: string[];
};

const EnumerableSizeForm: React.FunctionComponent<EnumerableSizeFormProps> = ({
  cardSizes,
  setCardSizes,
  possibleSizes,
}) => {
  return (
    <div className="EnumerableSizeForm">
      {possibleSizes.map((size) => (
        <label key={size}>
          <input
            type="checkbox"
            checked={cardSizes.includes(size)}
            onChange={(e) => {
              setCardSizes(
                possibleSizes.filter(
                  (possibleSize) =>
                    (e.target.checked &&
                      (cardSizes.includes(possibleSize) ||
                        possibleSize === size)) ||
                    (cardSizes.includes(possibleSize) &&
                      !(possibleSize === size))
                )
              );
            }}
          />
          {size}
        </label>
      ))}
    </div>
  );
};

export default function CreateSessionPage({ user }: { user: string | null }) {
  const createSessionMutation = trpc.useMutation('create');
  const [cardSizePattern, setCardSizePattern] =
    useState<CardSizePattern>('TeeShirtSize');
  const [cardSizes, setCardSizes] = useState<string[]>(
    cardSizeDefaults['TeeShirtSize']
  );

  useEffect(() => {
    setCardSizes(cardSizeDefaults[cardSizePattern]);
  }, [cardSizePattern]);

  return (
    <>
      <Header left={<h2>poker planning</h2>} right={user} />
      <Toolbar>
        <div className="CreateSessionPageForm">
          <h3>Create a poker planning session:</h3>
          <label htmlFor="CardSizePattern">
            Card size pattern:{' '}
            <select
              name="CardSizePattern"
              onChange={(e) => {
                if (isCardSizePattern(e.target.value)) {
                  setCardSizePattern(e.target.value as CardSizePattern);
                }
              }}
              value={cardSizePattern}
            >
              <option value="TeeShirtSize">Tee-shirt sizes</option>
              <option value="Fibonacci">Fibonacci</option>
            </select>
          </label>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {cardSizePattern === 'TeeShirtSize' && (
              <EnumerableSizeForm
                cardSizes={cardSizes}
                setCardSizes={setCardSizes}
                possibleSizes={possibleTeeShirtSizes}
              />
            )}
            {cardSizePattern === 'Fibonacci' && (
              <EnumerableSizeForm
                cardSizes={cardSizes}
                setCardSizes={setCardSizes}
                possibleSizes={possibleFibonacciSizes}
              />
            )}
          </div>

          <Button
            handleClick={() => {
              if (user != null) {
                createSessionMutation.mutate(
                  {
                    user,
                    possibleSizes: cardSizes,
                  },
                  {
                    onSuccess: (sessionId) => {
                      window.location.hash = sessionId;
                      window.location.reload();
                    },
                  }
                );
              }
            }}
            disabled={user == null}
          >
            Create
          </Button>
        </div>
      </Toolbar>
    </>
  );
}
