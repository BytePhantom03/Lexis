import readingTime from 'reading-time/lib/reading-time'

export function CalculateTime(text) {
  const  res = readingTime(text);
  if(res.minutes < 1) res.text = `${Math.floor(res.minutes*60)} sec read`
  return res;
}