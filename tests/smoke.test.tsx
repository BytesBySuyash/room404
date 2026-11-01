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
const { render, screen, within, cleanup, fireEvent, waitFor, act } =
  await import("@testing-library/react");
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
    screen.getByRole("main", { name: "Rohan’s Windows 98 desktop" }),
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

test("malformed storage recovers; mobile windows use the usable viewport; sound starts muted", () => {
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
  assert.ok(screen.getByRole("button", { name: "Enable sound" }));
  open("My Documents");
  const frame = windowNamed("My Documents").closest(
    ".os-window",
  ) as HTMLElement;
  assert.equal(frame.style.width, "390px");
  assert.equal(frame.style.height, "808px");
  cleanup();
});
