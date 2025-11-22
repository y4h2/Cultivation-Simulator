// Time System Constants
// 1 Ke (刻) = 15 minutes real-world equivalent
// 4 Ke = 1 Hour
// 96 Ke = 1 Day
// 10 Days = 1 Ten-Day Period (旬)
// 3 Ten-Day Periods = 1 Month
// 12 Months = 1 Year

export const TIME_CONSTANTS = {
  KE_PER_DAY: 96,
  DAYS_PER_TEN_DAY: 10,
  TEN_DAYS_PER_MONTH: 3,
  MONTHS_PER_YEAR: 12,

  // Game tick rate (ms per ke in real time)
  // Default: 1 second per ke
  BASE_TICK_RATE: 1000,
};

export const TIME_NAMES = {
  ke: '刻',
  day: '日',
  tenDay: '旬',
  month: '月',
  year: '年',
};

export const formatGameTime = (
  year: number,
  month: number,
  tenDay: number,
  day: number,
  ke: number
): string => {
  const dayInMonth = (tenDay - 1) * TIME_CONSTANTS.DAYS_PER_TEN_DAY + day;
  return `第${year}年 ${month}月${dayInMonth}日 第${ke}刻`;
};

export const formatGameTimeShort = (
  year: number,
  month: number,
  day: number
): string => {
  return `${year}年${month}月${day}日`;
};
