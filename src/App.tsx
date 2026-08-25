import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { eligibleNumbersFromRanges, pickRandom, validateRange } from "./draw";
import type { RangeInput, ValidRange } from "./types";
import { loadState, saveState } from "./storage";

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

function App() {
  const [initial] = useState(() => loadState());
  const [ranges, setRanges] = useState<RangeInput[]>(initial.ranges);
  const [history, setHistory] = useState(initial.history);
  const [display, setDisplay] = useState<number | null>(
    initial.history.at(-1) ?? null,
  );
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const actionLock = useRef(false);

  const validation = useMemo(() => {
    const validated: ValidRange[] = [];
    for (let index = 0; index < ranges.length; index += 1) {
      const result = validateRange(ranges[index].from, ranges[index].to);
      if (typeof result === "string") return `Range ${index + 1}: ${result}`;
      validated.push(result);
    }
    return validated;
  }, [ranges]);
  const validRanges = typeof validation === "string" ? null : validation;
  const eligible = useMemo(
    () => (validRanges ? eligibleNumbersFromRanges(validRanges, history) : []),
    [validRanges, history],
  );
  const totalNumbers = useMemo(
    () =>
      validRanges ? eligibleNumbersFromRanges(validRanges, []).length : null,
    [validRanges],
  );
  const exhausted = Boolean(validRanges && eligible.length === 0);

  useEffect(() => saveState({ ranges, history }), [ranges, history]);
  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
    },
    [],
  );

  const stopDraw = useCallback(() => {
    if (!running || actionLock.current) return;
    actionLock.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setRunning(false);
    setDisplay((current) => {
      const winner =
        current !== null && eligible.includes(current)
          ? current
          : pickRandom(eligible);
      if (winner !== null) {
        setHistory((previous) =>
          previous.includes(winner) ? previous : [...previous, winner],
        );
        setAnnouncement(`Winning number ${winner}`);
      }
      return winner;
    });
    window.setTimeout(() => {
      actionLock.current = false;
    }, 120);
  }, [eligible, running, setHistory]);

  const startDraw = useCallback(() => {
    if (running || actionLock.current) return;
    if (typeof validation === "string") {
      setError(validation);
      return;
    }
    if (eligible.length === 0) {
      setError(
        "All numbers in this range have been drawn. Clear the history or choose another range.",
      );
      return;
    }
    actionLock.current = true;
    setError("");
    setAnnouncement("Draw started");
    setCopied(false);
    setRunning(true);
    setDisplay(pickRandom(eligible));
    timerRef.current = setInterval(() => setDisplay(pickRandom(eligible)), 80);
    window.setTimeout(() => {
      actionLock.current = false;
    }, 120);
  }, [eligible, running, validation]);

  const toggleDraw = useCallback(
    () => (running ? stopDraw() : startDraw()),
    [running, startDraw, stopDraw],
  );

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        event.code === "Space" &&
        !["INPUT", "TEXTAREA", "BUTTON", "SELECT"].includes(target.tagName)
      ) {
        event.preventDefault();
        toggleDraw();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [toggleDraw]);

  const clearHistory = () => {
    if (
      !history.length ||
      !window.confirm("Clear the entire draw history? This cannot be undone.")
    )
      return;
    setHistory([]);
    setDisplay(null);
    setAnnouncement("Draw history cleared");
    setError("");
  };

  const copyHistory = async () => {
    if (!history.length) return;
    try {
      await navigator.clipboard.writeText(history.join(", "));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("History could not be copied. Please try again.");
    }
  };

  const updateRange = (
    index: number,
    field: keyof RangeInput,
    value: string,
  ) => {
    setRanges((current) =>
      current.map((range, rangeIndex) =>
        rangeIndex === index ? { ...range, [field]: value } : range,
      ),
    );
  };

  const addRange = () =>
    setRanges((current) => [...current, { from: "", to: "" }]);

  const removeRange = (index: number) =>
    setRanges((current) =>
      current.filter((_, rangeIndex) => rangeIndex !== index),
    );

  const inputError =
    !running && typeof validation === "string" ? validation : "";
  const statusMessage = exhausted
    ? "All numbers in this range have been drawn. Clear the history or choose another range."
    : error;

  return (
    <main className="page-shell">
      <header className="masthead">
        <div className="eyebrow">
          <span /> Official raffle draw <span />
        </div>
        <h1>KDU Ball - 2026</h1>
      </header>

      <section className="draw-panel" aria-label="Raffle draw controls">
        <div className="range-card">
          <div className="section-heading">
            <div>
              <span className="step">01</span>
              <h2>Set number ranges</h2>
            </div>
            <span className="inclusive">Inclusive range</span>
          </div>
          <div className="ranges-list">
            {ranges.map((range, index) => (
              <div className="range-row" key={index}>
                <span className="range-number">Range {index + 1}</span>
                <div className="range-fields">
                  <label>
                    From
                    <input
                      value={range.from}
                      onChange={(event) =>
                        updateRange(index, "from", event.target.value)
                      }
                      disabled={running}
                      inputMode="numeric"
                      aria-invalid={Boolean(inputError)}
                    />
                  </label>
                  <span className="range-line" aria-hidden="true" />
                  <label>
                    To
                    <input
                      value={range.to}
                      onChange={(event) =>
                        updateRange(index, "to", event.target.value)
                      }
                      disabled={running}
                      inputMode="numeric"
                      aria-invalid={Boolean(inputError)}
                    />
                  </label>
                </div>
                {ranges.length > 1 && (
                  <button
                    className="remove-range"
                    onClick={() => removeRange(index)}
                    disabled={running}
                    aria-label={`Remove range ${index + 1}`}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          <button className="add-range" onClick={addRange} disabled={running}>
            ＋ Add another range
          </button>
          {inputError && (
            <p className="field-error" role="alert">
              {inputError}
            </p>
          )}
        </div>

        <div className="stage">
          <div
            className={`ball ${running ? "shuffling" : ""} ${history.length && display === history.at(-1) ? "winner" : ""}`}
            aria-label={
              display === null
                ? "No number selected"
                : `Current number ${display}`
            }
          >
            <div className="ball-rim">
              <div className="ball-face">
                <span className="ball-label">
                  {running
                    ? "Drawing"
                    : display === null
                      ? "Ready"
                      : "Winning number"}
                </span>
                <strong key={display}>
                  {display === null ? "—" : formatNumber(display)}
                </strong>
                <span className="ball-mark">KDU • 2026</span>
              </div>
            </div>
          </div>
          <p className="stage-note">
            {running
              ? "Numbers are shuffling… press stop to reveal the winner"
              : display === null
                ? "Set your range and begin the draw"
                : ""}
          </p>
          <button
            className={`draw-button ${running ? "stop" : ""}`}
            onClick={toggleDraw}
            disabled={!running && (Boolean(inputError) || exhausted)}
          >
            <span className="button-icon">{running ? "■" : "▶"}</span>
            {running ? "STOP DRAW" : "START DRAW"}
          </button>
          <p className="shortcut">
            Press <kbd>Space</kbd> to {running ? "stop" : "start"}
          </p>
          {statusMessage && (
            <p className="status-error" role="alert">
              {statusMessage}
            </p>
          )}
        </div>

        <div className="stats" aria-label="Draw statistics">
          <div>
            <span>Total in ranges</span>
            <strong>
              {totalNumbers !== null ? formatNumber(totalNumbers) : "—"}
            </strong>
          </div>
          <div>
            <span>Completed draws</span>
            <strong>{formatNumber(history.length)}</strong>
          </div>
          <div>
            <span>Eligible remaining</span>
            <strong>{validRanges ? formatNumber(eligible.length) : "—"}</strong>
          </div>
        </div>
      </section>

      <section className="history-panel">
        <div className="history-header">
          <div>
            <span className="step">02</span>
            <div>
              <h2>Draw history</h2>
              <p>Winners appear in the order drawn</p>
            </div>
          </div>
          <div className="history-actions">
            <button
              className="utility-button"
              onClick={copyHistory}
              disabled={!history.length}
            >
              {copied ? "✓ Copied" : "⧉ Copy history"}
            </button>
            <button
              className="utility-button danger"
              onClick={clearHistory}
              disabled={!history.length}
            >
              ↻ Clear history
            </button>
          </div>
        </div>
        <div className="history-scroll">
          {history.length === 0 ? (
            <div className="empty-state">
              <div className="empty-ball">?</div>
              <strong>No winners yet</strong>
              <span>Your completed draws will appear here.</span>
            </div>
          ) : (
            <ol className="history-grid">
              {history.map((number, index) => (
                <li
                  className={index === history.length - 1 ? "latest" : ""}
                  key={`${number}-${index}`}
                >
                  <span>Draw {index + 1}</span>
                  <strong>{formatNumber(number)}</strong>
                  {index === history.length - 1 && <em>Latest</em>}
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
      <footer>
        <span>Secure random selection</span>
        <i /> <span>No repeated winners</span>
        <i /> <span>Saved on this device</span>
      </footer>
      <div className="sr-only" aria-live="assertive" aria-atomic="true">
        {announcement}
      </div>
    </main>
  );
}

export default App;
