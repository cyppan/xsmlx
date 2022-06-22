import { useEffect, useState } from 'react';
import './Timer.css';

type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
type Horloge = [`${Digit}${Digit}`, `${Digit}${Digit}`, `${Digit}${Digit}`]
type HorlogePart = Horloge[number];

function formatHorlogePart(part: number):HorlogePart {
  return String(part).padStart(2, '0') as HorlogePart;
}

function durationToHorloge(durationInMillis: number): Horloge {
  const hoursElapsed = Math.floor(durationInMillis / (1000 * 60 * 60));
  const minutesElapsed = Math.floor(
    (durationInMillis - hoursElapsed * 60 * 60 * 1000) / (1000 * 60)
  );
  const secondsElapsed = Math.floor(
    (durationInMillis -
      hoursElapsed * 60 * 60 * 1000 -
      minutesElapsed * 60 * 1000) /
      1000
  );
  return [
    formatHorlogePart(hoursElapsed),
    formatHorlogePart(minutesElapsed),
    formatHorlogePart(secondsElapsed)
  ];
}

export default function Timer({ startDate }: { startDate: Date }) {
  const [hoursElapsed, setHoursElapsed] = useState<HorlogePart>('00');
  const [minutesElapsed, setMinutesElapsed] = useState<HorlogePart>('00');
  const [secondsElapsed, setSecondsElapsed] = useState<HorlogePart>('00');

  useEffect(() => {
    const updateTimer = () => {
      const elapsedSoFar = Date.now() - startDate.getTime();
      const [hours, minutes, seconds] = durationToHorloge(elapsedSoFar);
      setHoursElapsed(hours);
      setMinutesElapsed(minutes);
      setSecondsElapsed(seconds);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [startDate]);

  return (
    <span className="Timer">
      {hoursElapsed !== '00' && <>{hoursElapsed}:</>}
      {minutesElapsed}:{secondsElapsed}
    </span>
  );
}
