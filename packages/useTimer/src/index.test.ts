import { renderHook, act } from '@testing-library/react-hooks';
import {
  differenceInDays,
  getUnixTime,
  intervalToDuration,
  isAfter,
} from 'date-fns';
import { useTimer } from './index';

const getDuration = (start: Date, end: Date) => {
  const current = new Date();
  const currentTime = getUnixTime(current);

  const duration = {};

  if (currentTime < getUnixTime(start)) {
    const days = differenceInDays(start, current);
    const { hours, minutes, seconds } = intervalToDuration({
      start: current,
      end: start,
    });

    Object.assign(duration, { days, hours, minutes, seconds });
  } else if (currentTime < getUnixTime(end)) {
    const days = differenceInDays(end, current);
    const { hours, minutes, seconds } = intervalToDuration({
      start: current,
      end,
    });

    Object.assign(duration, { days, hours, minutes, seconds });
  }

  return duration;
};

describe('useTimer', () => {
  it('test state and nextUpdated state', async () => {
    const start = new Date();
    const end = new Date();

    end.setMonth(end.getMonth() + 1);

    const { result, waitForNextUpdate } = renderHook(() =>
      useTimer({
        start,
        end,
      })
    );

    expect(JSON.stringify(result.current)).toBe(
      JSON.stringify({ days: 0, hours: 0, minutes: 0, seconds: 0 })
    );

    await waitForNextUpdate();

    expect(JSON.stringify(result.current)).toBe(
      JSON.stringify(getDuration(start, end))
    );

    await waitForNextUpdate();

    expect(JSON.stringify(result.current)).toBe(
      JSON.stringify(getDuration(start, end))
    );
  });
});
