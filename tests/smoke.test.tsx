import { test } from "node:test";
import React from "react";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://room404.test/",
});
for (const key of [
  "window",
  "document",
  "HTMLElement",
  "Element",
  "Node",
  "Event",
  "MouseEvent",
  "KeyboardEvent",
  "MutationObserver",
  "localStorage",
  "getComputedStyle",
]) {
  Object.defineProperty(globalThis, key, {
    value: (dom.window as unknown as Record<string, unknown>)[key],
    configurable: true,
    writable: true,
  });
}
Object.defineProperty(globalThis, "navigator", {
  value: dom.window.navigator,
  configurable: true,
});
Object.defineProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT", {
  value: true,
  configurable: true,
  writable: true,
});
const { render, screen, within, cleanup, fireEvent, waitFor, act, configure } =
  await import("@testing-library/react");
configure({ getElementError: (message) => new Error(message) });
const { default: App } = await import("../src/App");
const KEY = "room404.experience.v1";
function fresh() {
  cleanup();
  localStorage.clear();
  render(<App />);
}
function resume(data: Record<string, unknown> = {}) {
  cleanup();
  localStorage.setItem(
    KEY,
    JSON.stringify({ version: 1, resumed: true, ...data }),
  );
  render(<App />);
}
function desktop(name: string) {
  return within(
    screen
      .getByRole("main", { name: "Rohan’s Windows 98 desktop" })
      .querySelector(".desktop-icons")!,
  ).getByRole("button", { name, exact: true });
}
function open(name: string) {
  fireEvent.doubleClick(desktop(name));
}
function windowNamed(name: string) {
  return screen.getByRole("region", { name });
}

test("power-on can be skipped and opens the welcome note", () => {
  fresh();
  fireEvent.click(screen.getByRole("button", { name: /Power on/ }));
  fireEvent.click(screen.getByRole("button", { name: "Skip boot →" }));
  assert.ok(screen.getByText("Someone left in a hurry."));
  fireEvent.click(screen.getByRole("button", { name: "Read his note" }));
  assert.match(
    (
      screen.getByRole("textbox", {
        name: "README_FIRST.txt",
      }) as HTMLTextAreaElement
    ).value,
    /delete my browser history/,
  );
});

test("Notepad saves, reopens, persists, and guards unsaved changes", () => {
  resume();
  open("README_FIRST.txt");
  const area = screen.getByRole("textbox", { name: "README_FIRST.txt" });
  fireEvent.change(area, {
    target: { value: "Rohan, your project finally made someone laugh." },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Close README_FIRST.txt - Notepad" }),
  );
  assert.ok(screen.getByRole("dialog", { name: "Notepad" }));
  fireEvent.click(screen.getByRole("button", { name: "Cancel", exact: true }));
  fireEvent.click(screen.getByRole("button", { name: "Save", exact: true }));
  fireEvent.click(
    screen.getByRole("button", { name: "Close README_FIRST.txt - Notepad" }),
  );
  open("README_FIRST.txt");
  assert.equal(
    (
      screen.getByRole("textbox", {
        name: "README_FIRST.txt",
      }) as HTMLTextAreaElement
    ).value,
    "Rohan, your project finally made someone laugh.",
  );
  const saved = JSON.parse(localStorage.getItem(KEY)!);
  cleanup();
  render(<App />);
  open("README_FIRST.txt");
  assert.equal(
    (
      screen.getByRole("textbox", {
        name: "README_FIRST.txt",
      }) as HTMLTextAreaElement
    ).value,
    saved.text.readme,
  );
  fireEvent.change(screen.getByRole("textbox", { name: "README_FIRST.txt" }), {
    target: { value: "unsaved" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Close README_FIRST.txt - Notepad" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Discard", exact: true }));
  open("README_FIRST.txt");
  assert.notEqual(
    (
      screen.getByRole("textbox", {
        name: "README_FIRST.txt",
      }) as HTMLTextAreaElement
    ).value,
    "unsaved",
  );
});

test("window minimize, taskbar restore, maximize, and multiple application focus", () => {
  resume();
  open("README_FIRST.txt");
  open("My Documents");
  const note = windowNamed("README_FIRST.txt - Notepad");
  fireEvent.click(
    screen.getByRole("button", { name: "Minimize README_FIRST.txt - Notepad" }),
  );
  assert.equal(
    note
      .closest(".os-window")
      ?.getAttribute("style")
      ?.includes("display: none"),
    true,
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Restore README_FIRST.txt - Notepad" }),
  );
  assert.ok(note.closest(".active-window"));
  fireEvent.click(
    screen.getByRole("button", { name: "Maximize README_FIRST.txt - Notepad" }),
  );
  assert.ok(
    screen.getByRole("button", {
      name: "Restore README_FIRST.txt - Notepad",
      exact: true,
    }),
  );
  const restore = within(note).getByRole("button", {
    name: "Restore README_FIRST.txt - Notepad",
  });
  fireEvent.click(restore);
  assert.ok(
    within(note).getByRole("button", {
      name: "Maximize README_FIRST.txt - Notepad",
    }),
  );
});

test("browser local search, address errors, back/forward, fake RAM download, cancel, install, receipt", async () => {
  resume();
  open("Internet Explorer");
  assert.ok(screen.getByText("ROHAN’S CYBER DEN"));
  fireEvent.click(
    screen.getAllByRole("button", { name: "History", exact: true })[0],
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: "how to finish semester project in one night",
    }),
  );
  assert.ok(screen.getByText("Local results for"));
  fireEvent.click(
    screen.getByRole("button", {
      name: "Rohan’s Cyber Den — A future software legend",
    }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Download More RAM", exact: true }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Download 128 MB of RAM" }),
  );
  const downloads = windowNamed("Downloads");
  fireEvent.doubleClick(
    within(downloads).getByRole("button", { name: "DownloadMoreRAM.exe" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Install >" }));
  fireEvent.click(screen.getByRole("button", { name: "Cancel", exact: true }));
  assert.ok(screen.getByText("Welcome to the future of memory."));
  fireEvent.click(screen.getByRole("button", { name: "Install >" }));
  await act(async () => {
    await new Promise((r) => setTimeout(r, 2300));
  });
  assert.ok(screen.getByText("0 MB"));
  assert.ok(screen.getByText("128 MB", { selector: ".ram-result strong" }));
  fireEvent.click(screen.getByRole("button", { name: "View receipt" }));
  await waitFor(() =>
    assert.ok(screen.getByRole("textbox", { name: "RAM_receipt.txt" })),
  );
  assert.match(
    (
      screen.getByRole("textbox", {
        name: "RAM_receipt.txt",
      }) as HTMLTextAreaElement
    ).value,
    /RAM added:\s+0 MB/,
  );
  const browser = windowNamed("Internet Explorer");
  fireEvent.mouseDown(browser);
  const address = screen.getByRole("textbox", { name: "Address" });
  fireEvent.change(address, { target: { value: "unknown.test" } });
  fireEvent.click(screen.getByRole("button", { name: "Go", exact: true }));
  assert.ok(screen.getByText("The page cannot be displayed"));
  fireEvent.click(
    within(browser).getByRole("button", { name: "← Back", exact: true }),
  );
  assert.ok(screen.getByRole("button", { name: "Download 128 MB of RAM" }));
  fireEvent.click(screen.getByRole("button", { name: "Forward", exact: true }));
  assert.ok(screen.getByText("The page cannot be displayed"));
  assert.equal(JSON.parse(localStorage.getItem(KEY)!).ram, true);
});

test("Recycle Bin restore, confession, shared image opening, final reveal and image persistence", () => {
  resume();
  open("Recycle Bin");
  fireEvent.click(screen.getByRole("button", { name: "Restore", exact: true }));
  fireEvent.click(screen.getByRole("button", { name: "Open restored file" }));
  assert.match(
    (
      screen.getByRole("textbox", {
        name: "confession.txt",
      }) as HTMLTextAreaElement
    ).value,
    /night bus home/,
  );
  open("My Documents");
  const explorer = windowNamed("My Documents");
  fireEvent.doubleClick(
    within(explorer.querySelector(".file-grid")!).getByRole("button", {
      name: "Pictures",
      exact: true,
    }),
  );
  const pictures = windowNamed("Pictures");
  fireEvent.doubleClick(
    within(pictures).getByRole("button", {
      name: "architecture.bmp",
      exact: true,
    }),
  );
  assert.ok(screen.getByRole("dialog", { name: "Project evaluation" }));
  fireEvent.click(screen.getByRole("button", { name: "Submit anyway" }));
  assert.ok(
    screen.getByText(
      "“If this made you laugh, at least one of my projects finally worked.”",
    ),
  );
  fireEvent.click(screen.getByRole("button", { name: "Thanks, Rohan" }));
  assert.ok(
    screen.getByRole("img", { name: /REVOLUTIONARY DISTRIBUTED SYSTEM/ }),
  );
  assert.equal(JSON.parse(localStorage.getItem(KEY)!).restored, true);
});

test("shutdown, restart, reset confirmation, and namespaced storage", () => {
  resume();
  localStorage.setItem("unrelated-app", "keep");
  fireEvent.click(screen.getByRole("button", { name: "Start", exact: true }));
  fireEvent.click(screen.getByRole("button", { name: "Shut Down…" }));
  fireEvent.click(screen.getByRole("button", { name: "OK", exact: true }));
  assert.ok(screen.getByText(/It is now safe to stop pretending/));
  fireEvent.click(screen.getByRole("button", { name: "Restart" }));
  assert.ok(desktop("My Computer"));
  fireEvent.click(screen.getByRole("button", { name: "Start", exact: true }));
  fireEvent.click(screen.getByRole("button", { name: "Reset Experience…" }));
  fireEvent.click(screen.getByRole("button", { name: "Reset", exact: true }));
  assert.ok(screen.getByRole("button", { name: /Power on/ }));
  assert.equal(localStorage.getItem("unrelated-app"), "keep");
  assert.equal(JSON.parse(localStorage.getItem(KEY)!).resumed, false);
});

test("malformed storage recovers; mobile windows use the usable viewport; system sounds start enabled", () => {
  cleanup();
  localStorage.setItem(KEY, "{not JSON");
  render(<App />);
  assert.ok(screen.getByRole("button", { name: /Power on/ }));
  Object.defineProperty(window, "innerWidth", {
    value: 390,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(window, "innerHeight", {
    value: 844,
    writable: true,
    configurable: true,
  });
  resume();
  assert.ok(screen.getByRole("button", { name: "Mute sound" }));
  open("My Documents");
  const frame = windowNamed("My Documents").closest(
    ".os-window",
  ) as HTMLElement;
  assert.equal(frame.style.width, "390px");
  assert.equal(frame.style.height, "808px");
  cleanup();
});

test("the exact archive images and personal photograph open from the requested folders", () => {
  Object.defineProperty(window, "innerWidth", {
    value: 1280,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(window, "innerHeight", {
    value: 900,
    writable: true,
    configurable: true,
  });
  resume();
  open("My Documents");
  fireEvent.doubleClick(
    within(windowNamed("My Documents").querySelector(".file-grid")!).getByRole(
      "button",
      { name: "1998", exact: true },
    ),
  );
  const archive = windowNamed("1998");
  for (const name of [
    "titanic_1997.jpg",
    "world_cup_1998.jpg",
    "most_wanted_list.jpg",
    "news_clipping_2001.jpg",
  ])
    assert.ok(within(archive).getByRole("button", { name, exact: true }));
  fireEvent.doubleClick(
    within(archive).getByRole("button", {
      name: "world_cup_1998.jpg",
      exact: true,
    }),
  );
  const image = within(
    windowNamed("world_cup_1998.jpg - Image Viewer"),
  ).getByRole("img");
  assert.equal(
    image.getAttribute("src"),
    "./files/My Documents/1998/world_cup_1998.jpg",
  );
  open("My Pictures");
  fireEvent.doubleClick(
    within(windowNamed("My Pictures")).getByRole("button", {
      name: "family_memory.jpg",
    }),
  );
  assert.ok(windowNamed("family_memory.jpg - Image Viewer"));
  cleanup();
});

test("Calculator performs arithmetic and reports divide-by-zero without executing text", () => {
  resume();
  open("Calculator");
  const calc = within(windowNamed("Calculator"));
  for (const name of ["7", "+", "8", "="])
    fireEvent.click(calc.getByRole("button", { name, exact: true }));
  assert.equal(
    (
      calc.getByRole("textbox", {
        name: "Calculator result",
      }) as HTMLInputElement
    ).value,
    "15",
  );
  for (const name of ["÷", "0", "="])
    fireEvent.click(calc.getByRole("button", { name, exact: true }));
  assert.equal(
    (
      calc.getByRole("textbox", {
        name: "Calculator result",
      }) as HTMLInputElement
    ).value,
    "Cannot divide by zero",
  );
  fireEvent.click(calc.getByRole("button", { name: "C", exact: true }));
  assert.equal(
    (
      calc.getByRole("textbox", {
        name: "Calculator result",
      }) as HTMLInputElement
    ).value,
    "0",
  );
  cleanup();
});

test("Word edits, formats, saves, reopens from Explorer, and persists a new document", () => {
  resume();
  open("Microsoft Word");
  const word = within(windowNamed("Document1 - Microsoft Word"));
  fireEvent.change(word.getByRole("textbox", { name: "Word document" }), {
    target: { value: "The project has finally been submitted." },
  });
  fireEvent.click(word.getByRole("button", { name: "Bold", exact: true }));
  fireEvent.click(word.getByRole("button", { name: "Save", exact: true }));
  const saved = JSON.parse(localStorage.getItem(KEY)!);
  assert.equal(
    JSON.parse(
      saved.userFiles.find((f: { id: string }) => f.id === "user-word").content,
    ).bold,
    true,
  );
  cleanup();
  render(<App />);
  open("My Documents");
  fireEvent.doubleClick(
    within(windowNamed("My Documents")).getByRole("button", {
      name: "Document1.doc",
    }),
  );
  assert.equal(
    (
      screen.getByRole("textbox", {
        name: "Word document",
      }) as HTMLTextAreaElement
    ).value,
    "The project has finally been submitted.",
  );
  assert.equal(
    screen
      .getByRole("button", { name: "Bold", exact: true })
      .getAttribute("aria-pressed"),
    "true",
  );
  cleanup();
});

test("Outlook Express reads personal mail and sends only to its local Sent Items", () => {
  resume();
  open("Outlook Express");
  const mail = within(windowNamed("Outlook Express"));
  assert.ok(mail.getByText(/You can’t submit a folder/));
  fireEvent.click(mail.getByRole("button", { name: "Create Mail" }));
  fireEvent.change(mail.getByRole("textbox", { name: "Mail recipient" }), {
    target: { value: "ma@family.test" },
  });
  fireEvent.change(mail.getByRole("textbox", { name: "Mail subject" }), {
    target: { value: "Coming home" },
  });
  fireEvent.change(mail.getByRole("textbox", { name: "Mail body" }), {
    target: { value: "Keep one paratha for me." },
  });
  fireEvent.click(mail.getByRole("button", { name: "Send locally" }));
  assert.ok(mail.getByText("Keep one paratha for me."));
  assert.ok(
    mail.getByText(
      "Message saved in Sent Items. No email was sent over the Internet.",
    ),
  );
  assert.equal(
    JSON.parse(localStorage.getItem(KEY)!).userFiles.filter(
      (f: { type: string }) => f.type === "mail",
    ).length,
    1,
  );
  cleanup();
});

test("Sounds panel lists all events, controls volume, and preserves an explicit mute", () => {
  resume();
  fireEvent.click(screen.getByRole("button", { name: "Start", exact: true }));
  fireEvent.click(
    screen.getByRole("button", { name: "Settings", exact: true }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Sounds…", exact: true }));
  const panel = within(windowNamed("Sounds — Control Panel"));
  assert.equal(panel.getAllByRole("option").length, 14);
  assert.ok(panel.getByRole("option", { name: "Windows startup" }));
  fireEvent.change(panel.getByRole("slider", { name: "System sound volume" }), {
    target: { value: 35 },
  });
  assert.equal(JSON.parse(localStorage.getItem(KEY)!).volume, 0.35);
  fireEvent.click(
    panel.getByRole("checkbox", { name: "Enable system sounds" }),
  );
  assert.equal(
    (panel.getByRole("button", { name: "▶ Play sound" }) as HTMLButtonElement)
      .disabled,
    true,
  );
  cleanup();
  render(<App />);
  assert.ok(screen.getByRole("button", { name: "Enable sound" }));
  cleanup();
});

test("Games folder launches Minesweeper, Solitaire, and the original Pinball table", () => {
  resume();
  open("Games");
  const files = within(windowNamed("Games").querySelector(".file-grid")!);
  fireEvent.doubleClick(files.getByRole("button", { name: "Minesweeper.exe" }));
  const mines = within(windowNamed("Minesweeper"));
  fireEvent.click(
    mines.getByRole("button", { name: "Row 5 column 5: covered" }),
  );
  assert.ok(
    mines.getByRole("button", { name: "Row 5 column 5: 0 neighboring mines" }),
  );
  fireEvent.click(mines.getByRole("button", { name: "New game", exact: true }));
  assert.equal(
    mines.getByRole("button", { name: "Row 5 column 5: covered" }).textContent,
    "",
  );
  fireEvent.doubleClick(files.getByRole("button", { name: "Solitaire.exe" }));
  const solitaire = within(windowNamed("Solitaire"));
  fireEvent.click(solitaire.getByRole("button", { name: "Draw a card" }));
  assert.equal(
    (
      solitaire.getByRole("button", {
        name: "Undo",
        exact: true,
      }) as HTMLButtonElement
    ).disabled,
    false,
  );
  fireEvent.click(solitaire.getByRole("button", { name: "Undo", exact: true }));
  fireEvent.doubleClick(files.getByRole("button", { name: "Pinball.exe" }));
  const pinball = within(windowNamed("Room 404 Pinball"));
  fireEvent.click(pinball.getByRole("button", { name: "Launch", exact: true }));
  assert.equal(
    (
      pinball.getByRole("button", {
        name: "Launch",
        exact: true,
      }) as HTMLButtonElement
    ).disabled,
    true,
  );
  fireEvent.click(pinball.getByRole("button", { name: "Pause", exact: true }));
  assert.ok(pinball.getByRole("button", { name: "Resume", exact: true }));
  cleanup();
});

test("Solitaire rules conserve cards, enforce alternating colors, and build foundations correctly", async () => {
  const { newSolitaire, drawCard, moveCards, foundationIndex } =
    await import("../src/gameLogic");
  const game = newSolitaire();
  const deck = [...game.stock, ...game.columns.flat()];
  assert.equal(deck.length, 52);
  assert.equal(new Set(deck.map((c) => c.id)).size, 52);
  assert.equal(game.stock.length, 24);
  const drawn = drawCard(game);
  assert.equal(drawn.stock.length, 23);
  assert.equal(drawn.waste.length, 1);
  const k = { id: 1, suit: 0, rank: 13, face: true },
    q = { id: 2, suit: 1, rank: 12, face: true },
    ace = { id: 3, suit: 2, rank: 1, face: true };
  const fixture = {
    stock: [],
    waste: [ace],
    columns: [[k], [q], [], [], [], [], []],
    foundations: [[], [], [], []],
  };
  const moved = moveCards(
    fixture,
    { kind: "column", column: 1, index: 0 },
    { kind: "column", index: 0 },
  );
  assert.equal(moved?.columns[0].length, 2);
  assert.equal(
    moveCards(
      fixture,
      { kind: "column", column: 1, index: 0 },
      { kind: "column", index: 2 },
    ),
    null,
  );
  const foundation = moveCards(
    fixture,
    { kind: "waste" },
    { kind: "foundation", index: 0 },
  );
  assert.equal(foundation?.foundations[0][0].rank, 1);
  assert.equal(foundation?.waste.length, 0);
  assert.equal(
    foundationIndex(
      { ...fixture, foundations: [[], [], [], [ace]] },
      { ...ace, rank: 2 },
    ),
    3,
  );
});

test("Minesweeper first click is safe and flood reveal never opens a mine", async () => {
  const { makeMines, revealMines, neighbors } =
    await import("../src/gameLogic");
  for (const first of [0, 40, 80]) {
    const bombs = makeMines(first);
    assert.equal(bombs.size, 10);
    assert.equal(bombs.has(first), false);
    assert.ok(neighbors(first).every((i) => !bombs.has(i)));
    const opened = revealMines(first, bombs, new Set(), new Set());
    assert.ok(opened.has(first));
    assert.ok([...opened].every((i) => !bombs.has(i)));
  }
});

test("sound engine loads the local startup WAV, schedules playback, and stops when muted", async () => {
  const { SoundEngine } = await import("../src/sound");
  const original = window.AudioContext,
    originalFetch = globalThis.fetch;
  const sources: { started: boolean; stopped: boolean }[] = [];
  const fetched: string[] = [];
  class FakeContext {
    state = "running";
    destination = {};
    resume() {
      return Promise.resolve();
    }
    createGain() {
      return { gain: { value: 1 }, connect() {} };
    }
    decodeAudioData() {
      return Promise.resolve({});
    }
    createBufferSource() {
      const source = {
        started: false,
        stopped: false,
        buffer: null,
        onended: null,
        connect() {},
        start() {
          this.started = true;
        },
        stop() {
          this.stopped = true;
        },
      };
      sources.push(source);
      return source;
    }
  }
  Object.defineProperty(window, "AudioContext", {
    value: FakeContext,
    configurable: true,
    writable: true,
  });
  globalThis.fetch = async (input) => {
    fetched.push(String(input));
    return new Response(new ArrayBuffer(44));
  };
  try {
    const engine = new SoundEngine();
    engine.setPreferences(true, 0.5);
    await engine.play("startup");
    assert.ok(fetched[0].endsWith("/files/Windows/Media/startup.wav"));
    assert.equal(sources[0].started, true);
    engine.setPreferences(false, 0.5);
    assert.equal(sources[0].stopped, true);
    await engine.play("startup");
    assert.equal(sources.length, 1);
  } finally {
    Object.defineProperty(window, "AudioContext", {
      value: original,
      configurable: true,
      writable: true,
    });
    globalThis.fetch = originalFetch;
  }
});

test("all seeded image/audio/PDF assets exist locally and the startup file is real non-silent PCM audio", async () => {
  const { readFile } = await import("node:fs/promises");
  const { seedFiles } = await import("../src/files");
  const assets = new Set(
    seedFiles.flatMap((f) =>
      [f.asset, f.preview].filter((p): p is string => !!p),
    ),
  );
  for (const asset of assets) {
    assert.ok(asset.startsWith("./"));
    const bytes = await readFile(
      new URL("../public/" + asset.slice(2), import.meta.url),
    );
    assert.ok(bytes.length > 100, asset + " should contain real asset bytes");
    if (asset.endsWith(".jpg")) assert.equal(bytes.readUInt16BE(0), 0xffd8);
    if (asset.endsWith(".pdf"))
      assert.equal(bytes.subarray(0, 5).toString(), "%PDF-");
  }
  const wav = await readFile(
    new URL("../public/files/Windows/Media/startup.wav", import.meta.url),
  );
  assert.equal(wav.subarray(0, 4).toString(), "RIFF");
  assert.equal(wav.subarray(8, 12).toString(), "WAVE");
  assert.ok(wav.length > 22050 * 2 * 3);
  assert.ok(wav.subarray(44).some((byte) => byte !== 0));
});
