import { describe, expect, it, vi } from "vitest";
import { DEFAULT_STATE, loadState, saveState, STORAGE_KEY } from "./storage";

describe("state persistence", () => {
  it("restores a saved range and history", () => {
    const state = { ranges: [{ from: "20", to: "500" }], history: [22, 91] };
    expect(loadState({ getItem: () => JSON.stringify(state) })).toEqual(state);
  });
  it("uses defaults for corrupt storage", () => {
    expect(loadState({ getItem: () => "{bad" })).toEqual(DEFAULT_STATE);
  });
  it("saves state under the application key", () => {
    const setItem = vi.fn();
    const state = { ranges: [{ from: "1", to: "10" }], history: [] };
    saveState(state, { setItem });
    expect(setItem).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify(state));
  });
  it("represents history clearing as an empty saved history", () => {
    const state = { ranges: [{ from: "1", to: "10" }], history: [] };
    expect(loadState({ getItem: () => JSON.stringify(state) }).history).toEqual(
      [],
    );
  });
  it("migrates the previous single-range storage format", () => {
    const legacy = { from: "5", to: "50", history: [9] };
    expect(loadState({ getItem: () => JSON.stringify(legacy) })).toEqual({
      ranges: [{ from: "5", to: "50" }],
      history: [9],
    });
  });
});
