import type { DrawState } from "./types";

export const STORAGE_KEY = "kdu-ball-2026-state";
export const DEFAULT_STATE: DrawState = {
  ranges: [{ from: "1", to: "100" }],
  history: [],
};

export const loadState = (
  storage: Pick<Storage, "getItem"> = localStorage,
): DrawState => {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      Array.isArray((parsed as DrawState).history) &&
      (parsed as DrawState).history.every(Number.isSafeInteger)
    ) {
      const candidate = parsed as DrawState & { from?: string; to?: string };
      if (
        Array.isArray(candidate.ranges) &&
        candidate.ranges.length > 0 &&
        candidate.ranges.every(
          (range) =>
            typeof range.from === "string" && typeof range.to === "string",
        )
      )
        return { ranges: candidate.ranges, history: candidate.history };
      if (
        typeof candidate.from === "string" &&
        typeof candidate.to === "string"
      )
        return {
          ranges: [{ from: candidate.from, to: candidate.to }],
          history: candidate.history,
        };
    }
  } catch {
    /* use safe defaults */
  }
  return DEFAULT_STATE;
};

export const saveState = (
  state: DrawState,
  storage: Pick<Storage, "setItem"> = localStorage,
) => {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable */
  }
};
