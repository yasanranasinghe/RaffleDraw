import { describe, expect, it } from "vitest";
import {
  eligibleNumbers,
  eligibleNumbersFromRanges,
  pickRandom,
  validateRange,
} from "./draw";

describe("draw utilities", () => {
  it("generates an inclusive range", () => {
    expect(eligibleNumbers({ from: 1, to: 3, total: 3 }, [])).toEqual([
      1, 2, 3,
    ]);
  });
  it("excludes all previous winners", () => {
    const pool = eligibleNumbers({ from: 1, to: 4, total: 4 }, [2, 4]);
    expect(pool).toEqual([1, 3]);
    for (let i = 0; i < 30; i++) expect([1, 3]).toContain(pickRandom(pool));
  });
  it("combines multiple ranges without duplicating overlaps", () => {
    expect(
      eligibleNumbersFromRanges(
        [
          { from: 1, to: 3, total: 3 },
          { from: 3, to: 5, total: 3 },
        ],
        [2],
      ),
    ).toEqual([1, 3, 4, 5]);
  });
  it("recognizes exhausted ranges", () => {
    expect(eligibleNumbers({ from: 5, to: 6, total: 2 }, [5, 6])).toEqual([]);
    expect(pickRandom([])).toBeNull();
  });
  it.each([
    ["", "10", "Enter both"],
    ["1.2", "10", "whole numbers"],
    ["20", "10", "less than or equal"],
  ])("validates %s to %s", (from, to, message) => {
    expect(validateRange(from, to)).toEqual(expect.stringContaining(message));
  });
  it("accepts equal endpoints", () => {
    expect(validateRange("7", "7")).toEqual({ from: 7, to: 7, total: 1 });
  });
});
