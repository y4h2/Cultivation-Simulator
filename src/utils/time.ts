import type { GameTime } from '../types/game';
import { TIME_CONSTANTS } from '../constants/time';

export const createInitialTime = (): GameTime => ({
  ke: 1,
  day: 1,
  tenDay: 1,
  month: 1,
  year: 1,
});

export const advanceTime = (time: GameTime, keToAdvance: number = 1): GameTime => {
  let { ke, day, tenDay, month, year } = time;

  ke += keToAdvance;

  // Roll over ke to days
  while (ke > TIME_CONSTANTS.KE_PER_DAY) {
    ke -= TIME_CONSTANTS.KE_PER_DAY;
    day += 1;
  }

  // Roll over days to ten-days
  while (day > TIME_CONSTANTS.DAYS_PER_TEN_DAY) {
    day -= TIME_CONSTANTS.DAYS_PER_TEN_DAY;
    tenDay += 1;
  }

  // Roll over ten-days to months
  while (tenDay > TIME_CONSTANTS.TEN_DAYS_PER_MONTH) {
    tenDay -= TIME_CONSTANTS.TEN_DAYS_PER_MONTH;
    month += 1;
  }

  // Roll over months to years
  while (month > TIME_CONSTANTS.MONTHS_PER_YEAR) {
    month -= TIME_CONSTANTS.MONTHS_PER_YEAR;
    year += 1;
  }

  return { ke, day, tenDay, month, year };
};

export const isNewDay = (oldTime: GameTime, newTime: GameTime): boolean => {
  return oldTime.day !== newTime.day ||
         oldTime.tenDay !== newTime.tenDay ||
         oldTime.month !== newTime.month ||
         oldTime.year !== newTime.year;
};

export const isNewTenDay = (oldTime: GameTime, newTime: GameTime): boolean => {
  return oldTime.tenDay !== newTime.tenDay ||
         oldTime.month !== newTime.month ||
         oldTime.year !== newTime.year;
};

export const isNewMonth = (oldTime: GameTime, newTime: GameTime): boolean => {
  return oldTime.month !== newTime.month || oldTime.year !== newTime.year;
};

export const isNewYear = (oldTime: GameTime, newTime: GameTime): boolean => {
  return oldTime.year !== newTime.year;
};

export const compareTimes = (a: GameTime, b: GameTime): number => {
  const aTotal = a.year * 360 * 96 +
                 a.month * 30 * 96 +
                 a.tenDay * 10 * 96 +
                 a.day * 96 +
                 a.ke;
  const bTotal = b.year * 360 * 96 +
                 b.month * 30 * 96 +
                 b.tenDay * 10 * 96 +
                 b.day * 96 +
                 b.ke;
  return aTotal - bTotal;
};

export const formatTime = (time: GameTime, lang: 'zh' | 'en' = 'zh'): string => {
  const totalDayInMonth = (time.tenDay - 1) * TIME_CONSTANTS.DAYS_PER_TEN_DAY + time.day;
  if (lang === 'en') {
    return `Year ${time.year}, Month ${time.month}, Day ${totalDayInMonth}`;
  }
  return `第${time.year}年 ${time.month}月${totalDayInMonth}日`;
};

export const formatTimeDetailed = (time: GameTime, lang: 'zh' | 'en' = 'zh'): string => {
  const totalDayInMonth = (time.tenDay - 1) * TIME_CONSTANTS.DAYS_PER_TEN_DAY + time.day;
  if (lang === 'en') {
    return `Year ${time.year}, Month ${time.month}, Day ${totalDayInMonth}, Ke ${time.ke}`;
  }
  return `第${time.year}年 ${time.month}月${totalDayInMonth}日 第${time.ke}刻`;
};
