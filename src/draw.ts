import type { ValidRange } from "./types";

export const validateRange = (
  fromText: string,
  toText: string,
): ValidRange | string => {
  if (!fromText.trim() || !toText.trim())
    return "Enter both From and To values.";
  if (!/^-?\d+$/.test(fromText.trim()) || !/^-?\d+$/.test(toText.trim())) {
    return "Range values must be whole numbers.";
  }
  const from = Number(fromText);
  const to = Number(toText);
  if (!Number.isSafeInteger(from) || !Number.isSafeInteger(to)) {
    return "Range values are outside the supported integer limit.";
  }
  if (from > to) return "From must be less than or equal to To.";
  const total = to - from + 1;
  if (!Number.isSafeInteger(total) || total > 1_000_000) {
    return "Choose a range containing no more than 1,000,000 numbers.";
  }
  return { from, to, total };
};

export const eligibleNumbers = (
  range: ValidRange,
  history: number[],
): number[] => {
  const drawn = new Set(history);
  return Array.from(
    { length: range.total },
    (_, index) => range.from + index,
  ).filter((number) => !drawn.has(number));
};

export const eligibleNumbersFromRanges = (
  ranges: ValidRange[],
  history: number[],
): number[] => {
  const drawn = new Set(history);
  const eligible = new Set<number>();
  for (const range of ranges) {
    for (let number = range.from; number <= range.to; number += 1) {
      if (!drawn.has(number)) eligible.add(number);
    }
  }
  return [...eligible];
};

const secureIndex = (length: number): number => {
  if (length <= 1) return 0;
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi?.getRandomValues) return Math.floor(Math.random() * length);

  const max = 0x1_0000_0000;
  const limit = max - (max % length);
  const values = new Uint32Array(1);
  do cryptoApi.getRandomValues(values);
  while (values[0] >= limit);
  return values[0] % length;
};

export const pickRandom = (eligible: number[]): number | null => {
  if (eligible.length === 0) return null;
  return eligible[secureIndex(eligible.length)];
};
