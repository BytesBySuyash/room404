import { useEffect, useRef, useState } from "react";
import { useOS } from "./store";
import {
  drawCard,
  foundationIndex,
  makeMines,
  moveCards,
  neighbors,
  newSolitaire,
  red,
  revealMines,
  selectedCards,
} from "./gameLogic";
import type { Card, CardSource, SolitaireState } from "./gameLogic";

export function Minesweeper() {
  const { beep } = useOS();
  const [bombs, setBombs] = useState<Set<number> | null>(null);
  const [opened, setOpened] = useState(new Set<number>());
  const [flags, setFlags] = useState(new Set<number>());
  const [state, setState] = useState<"ready" | "playing" | "lost" | "won">(
    "ready",
  );
  const [flagMode, setFlagMode] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [seed, setSeed] = useState(404);
  const [help, setHelp] = useState(false);
  useEffect(() => {
    if (state !== "playing") return;
    const t = setInterval(() => setSeconds((s) => Math.min(999, s + 1)), 1000);
    return () => clearInterval(t);
  }, [state]);
  function reset() {
    setBombs(null);
    setOpened(new Set());
    setFlags(new Set());
    setState("ready");
    setSeconds(0);
    setSeed((s) => s + 1);
  }
  function flag(i: number) {
    if (opened.has(i) || state === "lost" || state === "won") return;
    setFlags((f) => {
      const next = new Set(f);
      if (next.has(i)) next.delete(i);
      else if (next.size < 10) next.add(i);
      return next;
    });
  }
  function reveal(i: number) {
    if (flagMode) {
      flag(i);
      return;
    }
    if (flags.has(i) || state === "lost" || state === "won") return;
    const b = bombs || makeMines(i, seed);
    if (!bombs) {
      setBombs(b);
      setState("playing");
    }
    if (b.has(i)) {
      setOpened((o) => new Set([...o, i]));
      setState("lost");
      beep("error");
      return;
    }
    const next = revealMines(i, b, opened, flags);
    setOpened(next);
    if (next.size === 71) {
      setState("won");
      beep("done");
    }
  }
  return (
    <div className="application mines-app">
      <div className="app-menubar">
        <button onClick={reset}>New game</button>
        <button onClick={() => setHelp(!help)}>How to play</button>
        <button aria-pressed={flagMode} onClick={() => setFlagMode(!flagMode)}>
          Flag mode {flagMode ? "on" : "off"}
        </button>
      </div>
      {help && (
        <p className="game-help">
          Reveal all 71 safe squares. Numbers count neighboring mines.
          Right-click to flag, or enable Flag mode on touch. Your first square
          and its neighbors are safe.
        </p>
      )}
      <div className="mine-panel">
        <div className="mine-scoreboard inset">
          <output aria-label="Mines remaining">
            {String(10 - flags.size).padStart(3, "0")}
          </output>
          <button
            aria-label="New Minesweeper game"
            onClick={reset}
            className="mine-face"
          >
            {state === "lost" ? "×_×" : state === "won" ? "B) " : ":)"}
          </button>
          <output aria-label="Seconds elapsed">
            {String(seconds).padStart(3, "0")}
          </output>
        </div>
        <div
          className="mine-grid inset"
          role="group"
          aria-label="Minesweeper field"
        >
          {Array.from({ length: 81 }, (_, i) => {
            const isOpen = opened.has(i),
              mine = bombs?.has(i),
              number = bombs
                ? neighbors(i).filter((n) => bombs.has(n)).length
                : 0,
              showMine = mine && (isOpen || state === "lost");
            return (
              <button
                key={i}
                className={`${isOpen || showMine ? "revealed" : ""} ${showMine && isOpen ? "exploded" : ""}`}
                data-number={number}
                aria-label={`Row ${Math.floor(i / 9) + 1} column ${(i % 9) + 1}: ${showMine ? "mine" : flags.has(i) ? "flagged" : isOpen ? number + " neighboring mines" : "covered"}`}
                onClick={() => reveal(i)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  flag(i);
                }}
              >
                {showMine
                  ? "✹"
                  : flags.has(i)
                    ? "⚑"
                    : isOpen && number
                      ? number
                      : ""}
              </button>
            );
          })}
        </div>
      </div>
      <div className="game-message" role="status">
        {state === "won"
          ? "You cleared the field. Put that on your project report."
          : state === "lost"
            ? "One small click for you. One missed deadline for Rohan."
            : state === "ready"
              ? "A quick game. Then back to the project."
              : "Careful. Your project deadline is already a minefield."}
      </div>
    </div>
  );
}

const suits = ["♠", "♥", "♦", "♣"];
const rank = (n: number) =>
  (({ 1: "A", 11: "J", 12: "Q", 13: "K" }) as Record<number, string>)[n] ||
  String(n);
function PlayingCard({
  card,
  selected,
  onClick,
  onDoubleClick,
  style,
}: {
  card: Card;
  selected?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <button
      className={`playing-card ${card.face ? "face-up" : "face-down"} ${red(card) ? "red-card" : ""} ${selected ? "card-selected" : ""}`}
      aria-label={
        card.face
          ? rank(card.rank) +
            " of " +
            ["spades", "hearts", "diamonds", "clubs"][card.suit]
          : "Face-down card"
      }
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      style={style}
      disabled={!card.face}
    >
      <span className="card-corner">
        {rank(card.rank)}
        <br />
        {suits[card.suit]}
      </span>
      <span className="card-center">{suits[card.suit]}</span>
      <span className="card-bottom">
        {rank(card.rank)}
        {suits[card.suit]}
      </span>
    </button>
  );
}
export function Solitaire() {
  const { beep } = useOS();
  const [game, setGame] = useState(() => newSolitaire());
  const [selected, setSelected] = useState<CardSource | null>(null);
  const [history, setHistory] = useState<SolitaireState[]>([]);
  const [message, setMessage] = useState(
    "Draw from the stock, then click a face-up card and its destination.",
  );
  const [seed, setSeed] = useState(404);
  function update(next: SolitaireState) {
    setHistory((h) => [...h.slice(-29), game]);
    setGame(next);
    setSelected(null);
  }
  function move(
    to: { kind: "column" | "foundation"; index: number },
    source = selected,
  ) {
    if (!source) return;
    const next = moveCards(game, source, to);
    if (next) {
      update(next);
      setMessage("Moved. Rohan calls this “resource allocation.”");
      if (next.foundations.every((f) => f.length === 13)) {
        setMessage("You won. Finally, something on this computer is complete.");
        beep("done");
      }
    } else {
      setMessage(
        "That move doesn’t fit. Build alternating colors down; foundations go Ace to King by suit.",
      );
      beep("click");
    }
  }
  function choose(source: CardSource) {
    if (
      selected &&
      source.kind === "column" &&
      (selected.kind !== "column" || selected.column !== source.column)
    ) {
      move({ kind: "column", index: source.column });
      return;
    }
    setSelected(source);
    setMessage(
      "Selected " +
        rank(selectedCards(game, source)[0]?.rank || 1) +
        ". Click a column or a foundation.",
    );
  }
  const top = game.waste[game.waste.length - 1];
  const won = game.foundations.every((f) => f.length === 13);
  return (
    <div className="application solitaire-app">
      <div className="app-menubar">
        <button
          onClick={() => {
            setSeed((s) => s + 1);
            setGame(newSolitaire(seed + 1));
            setHistory([]);
            setSelected(null);
            setMessage("Fresh deal. The project can wait another minute.");
          }}
        >
          New game
        </button>
        <button
          disabled={!history.length}
          onClick={() => {
            setGame(history[history.length - 1]);
            setHistory((h) => h.slice(0, -1));
            setSelected(null);
          }}
        >
          Undo
        </button>
        <button
          onClick={() => {
            setSelected(null);
            setMessage(
              "Klondike, draw one. Stack alternating colors from King down. Only Kings fill empty columns. Move Aces up to the foundations, then build by suit. Click to select and click a destination; double-click a top card to try a foundation.",
            );
          }}
        >
          Rules
        </button>
        <span className="toolbar-note">
          Score: {game.foundations.flat().length * 10}
        </span>
      </div>
      <div className="solitaire-table">
        <div className="solitaire-top">
          <button
            className={`card-slot stock-slot ${game.stock.length ? "has-stock" : ""}`}
            aria-label={game.stock.length ? "Draw a card" : "Recycle waste"}
            disabled={won || (!game.stock.length && !game.waste.length)}
            onClick={() => {
              update(drawCard(game));
              setMessage(
                game.stock.length
                  ? "One card drawn."
                  : "Waste returned to the stock.",
              );
            }}
          >
            {game.stock.length ? <span className="stock-pattern" /> : "↶"}
          </button>
          <div className="card-slot">
            {top && (
              <PlayingCard
                card={top}
                selected={selected?.kind === "waste"}
                onClick={() => choose({ kind: "waste" })}
                onDoubleClick={() => {
                  const index = foundationIndex(game, top);
                  move({ kind: "foundation", index }, { kind: "waste" });
                }}
              />
            )}
          </div>
          <div className="solitaire-spacer" />
          {game.foundations.map((f, i) => (
            <button
              key={i}
              className="card-slot foundation-slot"
              aria-label={"Foundation " + (i + 1)}
              onClick={() => move({ kind: "foundation", index: i })}
            >
              {f.length ? (
                <span className={red(f[f.length - 1]) ? "red-card" : ""}>
                  {rank(f[f.length - 1].rank)}
                  <br />
                  {suits[f[f.length - 1].suit]}
                </span>
              ) : (
                <span> A </span>
              )}
            </button>
          ))}
        </div>
        <div className="solitaire-columns">
          {game.columns.map((column, i) => (
            <div
              className="solitaire-column"
              key={i}
              style={{ minHeight: Math.max(180, column.length * 27 + 93) }}
            >
              <button
                className="card-slot empty-column"
                aria-label={"Column " + (i + 1)}
                onClick={() => move({ kind: "column", index: i })}
              />
              {column.map((card, j) => (
                <PlayingCard
                  key={card.id}
                  card={card}
                  selected={
                    selected?.kind === "column" &&
                    selected.column === i &&
                    j >= selected.index
                  }
                  style={{ top: j * 27, position: "absolute", zIndex: j + 1 }}
                  onClick={() =>
                    choose({ kind: "column", column: i, index: j })
                  }
                  onDoubleClick={() => {
                    if (j !== column.length - 1) return;
                    const index = foundationIndex(game, card);
                    move(
                      { kind: "foundation", index },
                      { kind: "column", column: i, index: j },
                    );
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="status-bar">
        <p className="status-bar-field" role="status">
          {message}
        </p>
      </div>
    </div>
  );
}

export function Pinball() {
  const { beep } = useOS();
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [running, setRunning] = useState(false);
  const [launched, setLaunched] = useState(false);
  const [left, setLeft] = useState(false);
  const [right, setRight] = useState(false);
  const [message, setMessage] = useState(
    "Launch, then use ← / → or the flipper buttons.",
  );
  const ball = useRef({ x: 430, y: 500, vx: 0, vy: 0 });
  const circle = useRef<SVGCircleElement>(null);
  const flippers = useRef({ left: false, right: false });
  const bumper = [
    { x: 130, y: 142 },
    { x: 310, y: 142 },
    { x: 220, y: 255 },
  ];
  useEffect(() => {
    flippers.current = { left, right };
  }, [left, right]);
  function launch() {
    if (!lives) return;
    ball.current = { x: 425, y: 495, vx: -70, vy: -850 };
    setLaunched(true);
    setRunning(true);
    setMessage("Keep the ball in play. Every bumper is worth 100 marks.");
    beep("click");
  }
  useEffect(() => {
    if (!running || typeof requestAnimationFrame !== "function") return;
    let frame = 0,
      last = performance.now();
    function tick(now: number) {
      const dt = Math.min(0.025, (now - last) / 1000);
      last = now;
      const b = ball.current;
      b.vy += 480 * dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.vx *= 0.999;
      if (b.x < 24) {
        b.x = 24;
        b.vx = Math.abs(b.vx) * 0.92;
      }
      if (b.x > 436) {
        b.x = 436;
        b.vx = -Math.abs(b.vx) * 0.92;
      }
      if (b.y < 32) {
        b.y = 32;
        b.vy = Math.abs(b.vy) * 0.92;
        b.vx -= 120;
      }
      for (const p of bumper) {
        const dx = b.x - p.x,
          dy = b.y - p.y,
          d = Math.hypot(dx, dy);
        if (d < 35) {
          const nx = dx / (d || 1),
            ny = dy / (d || 1);
          b.x = p.x + nx * 36;
          b.y = p.y + ny * 36;
          const dot = b.vx * nx + b.vy * ny;
          b.vx -= 2 * dot * nx;
          b.vy -= 2 * dot * ny;
          b.vx += nx * 110;
          b.vy += ny * 110;
          setScore((s) => s + 100);
          beep("pinball");
        }
      }
      // Slanted lower rails funnel the ball toward two real collision segments.
      if (b.y > 345 && b.y < 465 && b.x < 75) {
        b.vx = Math.abs(b.vx) + 20;
        b.vy -= 25;
      }
      if (b.y > 345 && b.y < 465 && b.x > 385) {
        b.vx = -Math.abs(b.vx) - 20;
        b.vy -= 25;
      }
      for (const side of ["left", "right"] as const) {
        const active = flippers.current[side],
          ax = side === "left" ? 85 : 375,
          ay = 470,
          bx = side === "left" ? 195 : 265,
          by = active ? 435 : 495;
        const dx = bx - ax,
          dy = by - ay,
          t = Math.max(
            0,
            Math.min(
              1,
              ((b.x - ax) * dx + (b.y - ay) * dy) / (dx * dx + dy * dy),
            ),
          ),
          px = ax + t * dx,
          py = ay + t * dy,
          d = Math.hypot(b.x - px, b.y - py);
        if (d < 15 && b.vy > 0) {
          b.y = py - 16;
          b.vy = active ? -620 : -b.vy * 0.7;
          b.vx += (side === "left" ? 1 : -1) * (active ? 160 : 50);
          if (active) beep("click");
        }
      }
      if (b.y > 550) {
        setRunning(false);
        setLaunched(false);
        setLives((n) => n - 1);
        setMessage("Ball lost. Launch the next one, or start a new game.");
        beep("error");
        return;
      }
      circle.current?.setAttribute("cx", String(b.x));
      circle.current?.setAttribute("cy", String(b.y));
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running]);
  function key(e: React.KeyboardEvent, down: boolean) {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      if (e.key === "ArrowLeft") setLeft(down);
      else setRight(down);
    }
    if (down && e.key === " ") {
      e.preventDefault();
      if (!launched) launch();
    }
  }
  return (
    <div
      className="application pinball-app"
      tabIndex={0}
      onKeyDown={(e) => key(e, true)}
      onKeyUp={(e) => key(e, false)}
      onBlur={() => {
        setLeft(false);
        setRight(false);
      }}
    >
      <div className="app-menubar">
        <button
          onClick={() => {
            setRunning(false);
            setLaunched(false);
            setLives(3);
            setScore(0);
            setMessage("Fresh semester. Fresh chances.");
            ball.current = { x: 430, y: 500, vx: 0, vy: 0 };
            circle.current?.setAttribute("cx", "430");
            circle.current?.setAttribute("cy", "500");
          }}
        >
          New game
        </button>
        <button disabled={!launched} onClick={() => setRunning(!running)}>
          {running ? "Pause" : "Resume"}
        </button>
        <span className="toolbar-note">Original 2D table</span>
      </div>
      <div className="pinball-score">
        <span>
          SCORE <b>{String(score).padStart(6, "0")}</b>
        </span>
        <span>
          BALLS <b>{lives}</b>
        </span>
      </div>
      <div className="pinball-board">
        <svg
          viewBox="0 0 460 560"
          aria-label="Room 404 pinball table with three scoring bumpers and two flippers"
        >
          <defs>
            <pattern
              id="pin-stars"
              width="42"
              height="42"
              patternUnits="userSpaceOnUse"
            >
              <path d="M8 8h2v2H8z" fill="#444478" />
            </pattern>
            <radialGradient id="pin-ball">
              <stop stopColor="white" />
              <stop offset="1" stopColor="#727b97" />
            </radialGradient>
          </defs>
          <rect
            x="10"
            y="10"
            width="440"
            height="540"
            rx="60"
            fill="#11152e"
            stroke="#676498"
            strokeWidth="6"
          />
          <rect
            x="18"
            y="18"
            width="424"
            height="524"
            rx="55"
            fill="url(#pin-stars)"
          />
          <path
            d="M30 320L80 438M430 320l-50 118"
            stroke="#724eaa"
            strokeWidth="12"
          />
          <path
            d="M38 72Q230-20 422 72"
            fill="none"
            stroke="#c9a447"
            strokeWidth="4"
          />
          <text
            x="230"
            y="77"
            textAnchor="middle"
            fill="#ead47a"
            fontFamily="monospace"
            fontSize="30"
          >
            ROOM 404
          </text>
          <text
            x="230"
            y="99"
            textAnchor="middle"
            fill="#b4acce"
            fontFamily="monospace"
            fontSize="10"
          >
            THE NEVER-ENDING SEMESTER
          </text>
          {bumper.map((b, i) => (
            <g key={i}>
              <circle
                cx={b.x}
                cy={b.y}
                r="30"
                fill="#59346c"
                stroke="#b993cf"
                strokeWidth="4"
              />
              <circle cx={b.x} cy={b.y} r="18" fill="#deaf3d" />
              <text
                x={b.x}
                y={b.y + 5}
                textAnchor="middle"
                fill="#34213a"
                fontFamily="monospace"
                fontSize="14"
              >
                100
              </text>
            </g>
          ))}
          <text
            x="230"
            y="350"
            textAnchor="middle"
            fill="#706c9a"
            fontFamily="monospace"
            fontSize="13"
          >
            HIT BUMPERS. COLLECT MARKS.
          </text>
          <text
            x="230"
            y="374"
            textAnchor="middle"
            fill="#706c9a"
            fontFamily="monospace"
            fontSize="11"
          >
            IF ONLY THE PROJECT WORKED THIS WAY.
          </text>
          <path
            d={`M85 470L195 ${left ? 435 : 495}`}
            stroke="#dc6a95"
            strokeWidth="16"
            strokeLinecap="round"
          />
          <path
            d={`M375 470L265 ${right ? 435 : 495}`}
            stroke="#dc6a95"
            strokeWidth="16"
            strokeLinecap="round"
          />
          <circle
            ref={circle}
            cx="430"
            cy="500"
            r="8"
            fill="url(#pin-ball)"
            stroke="#ddd"
          />
          <text
            x="230"
            y="535"
            textAnchor="middle"
            fill="#655b80"
            fontFamily="monospace"
            fontSize="10"
          >
            DRAIN / GPA GOES HERE
          </text>
        </svg>
      </div>
      <div className="pinball-controls">
        <button
          aria-pressed={left}
          onPointerDown={() => setLeft(true)}
          onPointerUp={() => setLeft(false)}
          onPointerLeave={() => setLeft(false)}
        >
          ← Left flipper
        </button>
        <button disabled={launched || !lives} onClick={launch}>
          Launch
        </button>
        <button
          aria-pressed={right}
          onPointerDown={() => setRight(true)}
          onPointerUp={() => setRight(false)}
          onPointerLeave={() => setRight(false)}
        >
          Right flipper →
        </button>
      </div>
      <div className="game-message" role="status">
        {!lives
          ? "Game over. Rohan’s project remains unbeaten at doing nothing."
          : message}
      </div>
    </div>
  );
}
