export interface Card {
  id: number;
  suit: number;
  rank: number;
  face: boolean;
}
export interface SolitaireState {
  stock: Card[];
  waste: Card[];
  columns: Card[][];
  foundations: Card[][];
}
export type CardSource =
  { kind: "waste" } | { kind: "column"; column: number; index: number };
export function newSolitaire(seed = 404): SolitaireState {
  let n = seed;
  const random = () => {
    n = (Math.imul(n, 1664525) + 1013904223) >>> 0;
    return n / 4294967296;
  };
  const deck: Card[] = Array.from({ length: 52 }, (_, id) => ({
    id,
    suit: Math.floor(id / 13),
    rank: (id % 13) + 1,
    face: false,
  }));
  for (let i = 51; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  const columns = Array.from({ length: 7 }, (_, col) =>
    Array.from({ length: col + 1 }, (_, i) => ({
      ...deck.pop()!,
      face: i === col,
    })),
  );
  return { stock: deck, waste: [], columns, foundations: [[], [], [], []] };
}
export function drawCard(s: SolitaireState): SolitaireState {
  if (!s.stock.length)
    return {
      ...s,
      stock: [...s.waste].reverse().map((c) => ({ ...c, face: false })),
      waste: [],
    };
  return {
    ...s,
    stock: s.stock.slice(0, -1),
    waste: [...s.waste, { ...s.stock[s.stock.length - 1], face: true }],
  };
}
export function selectedCards(s: SolitaireState, from: CardSource) {
  return from.kind === "waste"
    ? s.waste.slice(-1)
    : s.columns[from.column].slice(from.index);
}
export function red(card: Card) {
  return card.suit === 1 || card.suit === 2;
}
export function foundationIndex(s: SolitaireState, card: Card) {
  const matching = s.foundations.findIndex(
    (f) => f.length && f[f.length - 1].suit === card.suit,
  );
  return matching >= 0 ? matching : s.foundations.findIndex((f) => !f.length);
}
export function moveCards(
  s: SolitaireState,
  from: CardSource,
  to: { kind: "column" | "foundation"; index: number },
): SolitaireState | null {
  const cards = selectedCards(s, from);
  if (!cards.length || !cards[0].face) return null;
  if (
    from.kind === "column" &&
    to.kind === "column" &&
    from.column === to.index
  )
    return null;
  for (let i = 1; i < cards.length; i++)
    if (
      !cards[i].face ||
      cards[i - 1].rank !== cards[i].rank + 1 ||
      red(cards[i - 1]) === red(cards[i])
    )
      return null;
  const target =
    to.kind === "column" ? s.columns[to.index] : s.foundations[to.index];
  const top = target[target.length - 1],
    card = cards[0];
  if (to.kind === "column") {
    if (
      top
        ? red(top) === red(card) || top.rank !== card.rank + 1
        : card.rank !== 13
    )
      return null;
  } else if (
    cards.length !== 1 ||
    (top
      ? top.suit !== card.suit || top.rank + 1 !== card.rank
      : card.rank !== 1)
  )
    return null;
  const next: SolitaireState = {
    stock: s.stock,
    waste: [...s.waste],
    columns: s.columns.map((c) => [...c]),
    foundations: s.foundations.map((c) => [...c]),
  };
  if (from.kind === "waste") next.waste.pop();
  else {
    next.columns[from.column] = next.columns[from.column].slice(0, from.index);
    const col = next.columns[from.column];
    if (col.length)
      col[col.length - 1] = { ...col[col.length - 1], face: true };
  }
  if (to.kind === "column") next.columns[to.index].push(...cards);
  else next.foundations[to.index].push(...cards);
  return next;
}
export function makeMines(first: number, seed = 404) {
  const bombs = new Set<number>();
  let n = seed;
  while (bombs.size < 10) {
    n = (Math.imul(n, 1664525) + 1013904223) >>> 0;
    const cell = n % 81;
    if (
      Math.abs((cell % 9) - (first % 9)) <= 1 &&
      Math.abs(Math.floor(cell / 9) - Math.floor(first / 9)) <= 1
    )
      continue;
    bombs.add(cell);
  }
  return bombs;
}
export function neighbors(i: number) {
  const result: number[] = [];
  for (let y = -1; y <= 1; y++)
    for (let x = -1; x <= 1; x++) {
      const xx = (i % 9) + x,
        yy = Math.floor(i / 9) + y;
      if ((x || y) && xx >= 0 && xx < 9 && yy >= 0 && yy < 9)
        result.push(yy * 9 + xx);
    }
  return result;
}
export function revealMines(
  index: number,
  bombs: Set<number>,
  opened: Set<number>,
  flags: Set<number>,
) {
  const next = new Set(opened),
    queue = [index];
  while (queue.length) {
    const i = queue.pop()!;
    if (next.has(i) || flags.has(i)) continue;
    next.add(i);
    if (!bombs.has(i) && neighbors(i).every((n) => !bombs.has(n)))
      queue.push(...neighbors(i).filter((n) => !bombs.has(n)));
  }
  return next;
}
