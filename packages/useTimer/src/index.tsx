// base
import { useMemo, useState, useEffect, useCallback } from 'react';

// modules
import {
  differenceInDays,
  differenceInMilliseconds,
  getUnixTime,
  intervalToDuration,
} from 'date-fns';

interface UseTimerProps {
  start: Date;
  end: Date;
  afterStarted?: () => void;
  afterEnded?: () => void;
}

export const useTimer = (props: UseTimerProps) => {
  const { start, end, afterStarted, afterEnded } = props;

  const [duration, setDuration] = useState<Duration>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const startTime = useMemo(() => getUnixTime(start), [start]);
  const endTime = useMemo(() => getUnixTime(end), [end]);

  const onStarted = useCallback(() => {
    if (afterStarted) {
      afterStarted();
    }
  }, [afterStarted]);

  const onEnded = useCallback(() => {
    if (afterEnded) {
      afterEnded();
    }
  }, [afterEnded]);

  const interval = useMemo(
    () =>
      window.setInterval(() => {
        const current = new Date();
        const currentTime = getUnixTime(current);

        if (currentTime < startTime) {
          const days = differenceInDays(start, current);
          const { hours, minutes, seconds } = intervalToDuration({
            start: current,
            end: startTime,
          });

          setDuration({
            days,
            hours,
            minutes,
            seconds,
          });
        } else if (currentTime < endTime) {
          const days = differenceInDays(end, current);
          const { hours, minutes, seconds } = intervalToDuration({
            start: current,
            end,
          });

          setDuration({
            days,
            hours,
            minutes,
            seconds,
          });
        }
      }, 1000),
    [start, end]
  );

  useEffect(() => {
    return () => {
      clearInterval(interval);
    };
  }, [interval]);

  useEffect(() => {
    const diff = endTime - startTime;

    if (interval && diff <= 0) {
      clearInterval(interval);
    }
  }, [interval, startTime, endTime]);

  useEffect(() => {
    const currentTime = getUnixTime(new Date());

    if (currentTime < startTime) {
      const ms = differenceInMilliseconds(startTime, currentTime);

      setTimeout(onStarted, ms);
    } else if (currentTime < endTime) {
      const ms = differenceInMilliseconds(endTime, currentTime);

      setTimeout(onEnded, ms);
    }
  }, [start, end, onStarted, onEnded]);

  return {
    ...duration,
  };
};
