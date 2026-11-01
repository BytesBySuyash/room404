import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import type { ReactNode } from "react";
import { folderPath, ramFile, receipt, seedFiles } from "./files";
import type { VFile } from "./files";
import type { IconName } from "./icons";
import { systemSounds } from "./sound";
import type { SoundName } from "./sound";

export const STORAGE_KEY = "room404.experience.v1";
export type AppKind =
  | "explorer"
  | "notepad"
  | "browser"
  | "bin"
  | "image"
  | "installer"
  | "welcome"
  | "hint"
  | "word"
  | "paint"
  | "calculator"
  | "mail"
  | "pdf"
  | "media"
  | "sounds"
  | "minesweeper"
  | "solitaire"
  | "pinball";
export interface Win {
  id: string;
  app: AppKind;
  title: string;
  icon: IconName;
  fileId?: string;
  folderId?: string;
  draft?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
  min: boolean;
  max: boolean;
}
const EMPTY_DOCUMENT = JSON.stringify({
  text: "",
  font: "Times New Roman",
  size: 16,
  bold: false,
  italic: false,
  underline: false,
  align: "left",
});
export function windowIsDirty(w: Win, files: VFile[]) {
  return (
    ["notepad", "word"].includes(w.app) &&
    (w.draft || "") !==
      (files.find((f) => f.id === w.fileId)?.content ||
        (w.app === "word" ? EMPTY_DOCUMENT : ""))
  );
}
interface State {
  files: VFile[];
  windows: Win[];
  topZ: number;
  sound: boolean;
  volume: number;
  crt: boolean;
  discoveries: string[];
  resumed: boolean;
}
type Action =
  | { type: "open"; window: Win }
  | { type: "patch"; id: string; patch: Partial<Win> }
  | { type: "focus"; id: string }
  | { type: "close"; id: string }
  | { type: "save"; id: string; content: string }
  | { type: "file"; file: VFile }
  | { type: "discover"; id: string }
  | { type: "settings"; key: "sound" | "crt"; value: boolean }
  | { type: "settings"; key: "volume"; value: number }
  | { type: "reset" };
function initialState(): State {
  const base: State = {
    files: seedFiles.map((f) => ({ ...f })),
    windows: [],
    topZ: 10,
    sound: true,
    volume: 0.5,
    crt: false,
    discoveries: [],
    resumed: false,
  };
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (data?.version !== 1) return base;
    base.resumed = data.resumed === true;
    base.sound = data.soundChoiceMade === true ? data.sound === true : true;
    base.volume =
      typeof data.volume === "number"
        ? Math.max(0, Math.min(1, data.volume))
        : 0.5;
    base.crt = data.crt === true;
    if (Array.isArray(data.discoveries))
      base.discoveries = data.discoveries.filter(
        (x: unknown) => typeof x === "string",
      );
    if (data.text && typeof data.text === "object")
      base.files = base.files.map((f) =>
        ["text", "document", "mail"].includes(f.type) &&
        typeof data.text[f.id] === "string"
          ? { ...f, content: data.text[f.id].slice(0, 100000) }
          : f,
      );
    if (data.restored)
      base.files = base.files.map((f) =>
        f.id === "confession" ? { ...f, deleted: false } : f,
      );
    if (data.ram) base.files.push({ ...ramFile });
    if (data.receipt)
      base.files.push({
        ...receipt,
        content:
          typeof data.text?.[receipt.id] === "string"
            ? data.text[receipt.id].slice(0, 100000)
            : receipt.content,
      });
    if (Array.isArray(data.userFiles))
      for (const f of data.userFiles) {
        if (
          !f ||
          typeof f.id !== "string" ||
          !f.id.startsWith("user-") ||
          base.files.some((x) => x.id === f.id) ||
          typeof f.name !== "string" ||
          !["docs", "pictures", "mail-folder"].includes(f.parentId)
        )
          continue;
        if (!["text", "document", "mail", "image"].includes(f.type)) continue;
        if (
          f.type === "image" &&
          (typeof f.asset !== "string" ||
            !f.asset.startsWith("data:image/png;base64,") ||
            f.asset.length > 400000)
        )
          continue;
        base.files.push({
          id: f.id,
          parentId: f.parentId,
          name: f.name.slice(0, 80),
          type: f.type,
          content:
            typeof f.content === "string" ? f.content.slice(0, 100000) : "",
          asset: f.type === "image" ? f.asset : undefined,
          modifiedAt: "2002-10-31",
        });
      }
  } catch {
    /* Unavailable or malformed storage starts a fresh machine. */
  }
  return base;
}
function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "open": {
      const old = s.windows.find((w) => w.id === a.window.id);
      return {
        ...s,
        topZ: s.topZ + 1,
        windows: old
          ? s.windows.map((w) =>
              w.id === old.id ? { ...w, min: false, z: s.topZ + 1 } : w,
            )
          : [...s.windows, { ...a.window, z: s.topZ + 1 }],
      };
    }
    case "patch":
      return {
        ...s,
        windows: s.windows.map((w) =>
          w.id === a.id ? { ...w, ...a.patch } : w,
        ),
      };
    case "focus":
      return {
        ...s,
        topZ: s.topZ + 1,
        windows: s.windows.map((w) =>
          w.id === a.id ? { ...w, min: false, z: s.topZ + 1 } : w,
        ),
      };
    case "close":
      return { ...s, windows: s.windows.filter((w) => w.id !== a.id) };
    case "save":
      return {
        ...s,
        files: s.files.map((f) =>
          f.id === a.id
            ? { ...f, content: a.content, modifiedAt: "2002-10-31" }
            : f,
        ),
      };
    case "file":
      return {
        ...s,
        files: s.files.some((f) => f.id === a.file.id)
          ? s.files.map((f) => (f.id === a.file.id ? a.file : f))
          : [...s.files, a.file],
      };
    case "discover":
      return s.discoveries.includes(a.id)
        ? s
        : { ...s, discoveries: [...s.discoveries, a.id] };
    case "settings":
      return { ...s, [a.key]: a.value };
    case "reset":
      return {
        files: seedFiles.map((f) => ({ ...f })),
        windows: [],
        topZ: 10,
        sound: true,
        volume: 0.5,
        crt: false,
        discoveries: [],
        resumed: false,
      };
  }
}
export interface DialogConfig {
  title: string;
  text: ReactNode;
  icon?: IconName;
  buttons: { label: string; action: () => void; primary?: boolean }[];
}
interface OSContext {
  state: State;
  dispatch: React.Dispatch<Action>;
  phase: "power" | "boot" | "desktop" | "off";
  setPhase: React.Dispatch<
    React.SetStateAction<"power" | "boot" | "desktop" | "off">
  >;
  openApp: (
    app: AppKind,
    options?: { fileId?: string; folderId?: string },
  ) => void;
  openFile: (id: string) => void;
  closeWindow: (w: Win) => void;
  dialog: DialogConfig | null;
  setDialog: React.Dispatch<React.SetStateAction<DialogConfig | null>>;
  hint: () => void;
  reset: () => void;
  shutdown: () => void;
  beep: (kind?: SoundName) => void;
  unlockAudio: () => void;
  storageOK: boolean;
}
const OS = createContext<OSContext | null>(null);
export function useOS() {
  const c = useContext(OS);
  if (!c) throw new Error("OS provider missing");
  return c;
}
export function OSProvider({ children }: { children: ReactNode }) {
  const [state, rawDispatch] = useReducer(reducer, undefined, initialState);
  function dispatch(a: Action) {
    if (a.type === "settings" && a.key === "sound") {
      systemSounds.setPreferences(a.value, state.volume);
      if (a.value) void systemSounds.play("notify");
    } else if (a.type === "settings" && a.key === "volume")
      systemSounds.setPreferences(state.sound, a.value);
    else if (
      a.type === "open" &&
      !state.windows.some((w) => w.id === a.window.id)
    )
      void systemSounds.play("open");
    else if (a.type === "close") void systemSounds.play("close");
    else if (a.type === "patch" && a.patch.min)
      void systemSounds.play("minimize");
    else if (a.type === "patch" && a.patch.max !== undefined)
      void systemSounds.play(a.patch.max ? "maximize" : "minimize");
    else if (a.type === "save") void systemSounds.play("click");
    rawDispatch(a);
  }
  const [phase, setPhase] = useState<"power" | "boot" | "desktop" | "off">(
    state.resumed ? "desktop" : "power",
  );
  const [dialog, setDialog] = useState<DialogConfig | null>(null);
  const [storageOK, setStorageOK] = useState(true);
  useEffect(() => {
    systemSounds.setPreferences(state.sound, state.volume);
  }, [state.sound, state.volume]);
  useEffect(() => {
    const unlock = () => systemSounds.unlock();
    document.addEventListener("pointerdown", unlock, { capture: true });
    document.addEventListener("keydown", unlock, { capture: true });
    return () => {
      document.removeEventListener("pointerdown", unlock, { capture: true });
      document.removeEventListener("keydown", unlock, { capture: true });
      systemSounds.stop();
    };
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: 1,
          resumed: phase === "desktop" || state.resumed,
          sound: state.sound,
          soundChoiceMade: true,
          volume: state.volume,
          crt: state.crt,
          discoveries: state.discoveries,
          text: Object.fromEntries(
            state.files
              .filter((f) => ["text", "document", "mail"].includes(f.type))
              .map((f) => [f.id, f.content]),
          ),
          restored: !state.files.find((f) => f.id === "confession")?.deleted,
          ram: state.files.some((f) => f.id === "ram-exe"),
          receipt: state.files.some((f) => f.id === "ram-receipt"),
          userFiles: state.files.filter((f) => f.id.startsWith("user-")),
        }),
      );
      setStorageOK(true);
    } catch {
      setStorageOK(false);
    }
  }, [
    state.files,
    state.sound,
    state.volume,
    state.crt,
    state.discoveries,
    state.resumed,
    phase,
  ]);
  function beep(kind: SoundName = "click") {
    void systemSounds.play(kind);
  }
  function openApp(
    app: AppKind,
    opts: { fileId?: string; folderId?: string } = {},
  ) {
    const f = state.files.find((f) => f.id === opts.fileId);
    const info: Record<AppKind, [string, IconName, number, number]> = {
      explorer: [
        opts.folderId === "computer"
          ? "My Computer"
          : state.files.find((f) => f.id === opts.folderId)?.name ||
            "My Documents",
        "folder",
        710,
        460,
      ],
      notepad: [`${f?.name || "Untitled"} - Notepad`, "text", 620, 400],
      browser: ["Internet Explorer", "browser", 820, 590],
      bin: ["Recycle Bin", "bin", 670, 420],
      image: [`${f?.name || "Picture"} - Image Viewer`, "image", 780, 570],
      installer: ["Download More RAM Setup", "installer", 480, 360],
      welcome: ["Welcome to Room 404", "computer", 470, 345],
      hint: ["Help — Where should I look?", "help", 450, 310],
      word: [`${f?.name || "Document1"} - Microsoft Word`, "word", 760, 565],
      paint: [`${f?.name || "Untitled"} - Paint`, "paint", 760, 565],
      calculator: ["Calculator", "calculator", 340, 390],
      mail: ["Outlook Express", "mail", 800, 555],
      pdf: [`${f?.name || "Document"} - Document Reader`, "text", 740, 610],
      media: [
        `${f?.name || "Media"} - Windows Media Player`,
        "sound",
        500,
        390,
      ],
      sounds: ["Sounds — Control Panel", "sound", 560, 480],
      minesweeper: ["Minesweeper", "minesweeper", 390, 490],
      solitaire: ["Solitaire", "cards", 820, 600],
      pinball: ["Room 404 Pinball", "pinball", 570, 680],
    };
    const [title, icon, width, height] = info[app];
    const id = ["notepad", "image", "word", "pdf", "media"].includes(app)
      ? `${app}-${opts.fileId || "untitled"}`
      : app;
    const n = state.windows.length % 5;
    const maxX = Math.max(0, window.innerWidth - width),
      maxY = Math.max(0, window.innerHeight - height - 36);
    dispatch({
      type: "open",
      window: {
        id,
        app,
        title,
        icon,
        ...opts,
        draft:
          app === "notepad"
            ? f?.content || ""
            : app === "word"
              ? f?.content ||
                JSON.stringify({
                  text: "",
                  font: "Times New Roman",
                  size: 16,
                  bold: false,
                  italic: false,
                  underline: false,
                  align: "left",
                })
              : undefined,
        x: Math.min(
          maxX,
          Math.max(108, (window.innerWidth - width) / 2 - 55 + n * 25),
        ),
        y: Math.min(
          maxY,
          Math.max(28, (window.innerHeight - height) / 2 - 44 + n * 22),
        ),
        width,
        height,
        z: 0,
        min: false,
        max: false,
      },
    });
    if (app === "explorer" && state.windows.some((w) => w.id === id))
      dispatch({
        type: "patch",
        id,
        patch: { folderId: opts.folderId || "docs", title },
      });
    if (app === "mail") beep("mail");
    if (app === "mail" && opts.fileId)
      dispatch({ type: "patch", id, patch: { fileId: opts.fileId } });
  }
  function openFile(id: string) {
    const f = state.files.find((f) => f.id === id);
    if (!f || f.deleted) return;
    if (f.type === "folder") openApp("explorer", { folderId: id });
    else if (f.type === "game" && f.game) openApp(f.game);
    else if (f.type === "document") openApp("word", { fileId: id });
    else if (f.type === "mail") openApp("mail", { fileId: id });
    else if (f.type === "pdf") openApp("pdf", { fileId: id });
    else if (f.type === "audio") openApp("media", { fileId: id });
    else if (f.type === "text") {
      openApp("notepad", { fileId: id });
      if (id === "readme" || id === "confession")
        dispatch({ type: "discover", id });
    } else if (f.type === "installer") openApp("installer");
    else {
      openApp("image", { fileId: id });
      if (
        id === "architecture" &&
        !state.discoveries.includes("architecture")
      ) {
        dispatch({ type: "discover", id: "architecture" });
        setDialog({
          title: "Project evaluation",
          icon: "computer",
          text: (
            <>
              <p>Project successfully located.</p>
              <p>
                Working software: <strong>not found.</strong>
                <br />
                Presentation confidence: <strong>dangerously high.</strong>
              </p>
            </>
          ),
          buttons: [
            {
              label: "Submit anyway",
              primary: true,
              action: () => {
                dispatch({ type: "discover", id: "ending" });
                setDialog({
                  title: "A note from Rohan",
                  icon: "text",
                  text: (
                    <>
                      <p>
                        “If this made you laugh, at least one of my projects
                        finally worked.”
                      </p>
                      <p>— Rohan, Room 404</p>
                      <small>
                        The drawing is still open behind this note. Keep
                        exploring.
                      </small>
                    </>
                  ),
                  buttons: [
                    {
                      label: "Thanks, Rohan",
                      primary: true,
                      action: () => setDialog(null),
                    },
                  ],
                });
                beep("done");
              },
            },
          ],
        });
      }
    }
  }
  function closeWindow(w: Win) {
    const f = state.files.find((f) => f.id === w.fileId);
    if (windowIsDirty(w, state.files))
      setDialog({
        title: w.app === "word" ? "Microsoft Word" : "Notepad",
        icon: w.app === "word" ? "word" : "text",
        text: (
          <>
            The text in {f?.name || "Untitled"} has changed.
            <br />
            <br />
            Do you want to save the changes?
          </>
        ),
        buttons: [
          {
            label: "Save",
            primary: true,
            action: () => {
              if (f)
                dispatch({ type: "save", id: f.id, content: w.draft || "" });
              else
                dispatch({
                  type: "file",
                  file: {
                    id: w.app === "word" ? "user-word" : "user-note",
                    parentId: "docs",
                    name: w.app === "word" ? "Document1.doc" : "Untitled.txt",
                    type: w.app === "word" ? "document" : "text",
                    content: w.draft || "",
                    modifiedAt: "2002-10-31",
                  },
                });
              dispatch({ type: "close", id: w.id });
              setDialog(null);
            },
          },
          {
            label: "Discard",
            action: () => {
              dispatch({ type: "close", id: w.id });
              setDialog(null);
            },
          },
          { label: "Cancel", action: () => setDialog(null) },
        ],
      });
    else dispatch({ type: "close", id: w.id });
  }
  function hint() {
    openApp("hint");
  }
  function reset() {
    setDialog({
      title: "Reset Experience",
      icon: "computer",
      text: "Return to Rohan’s last session? Your saved edits, discoveries, and settings on this computer will be cleared.",
      buttons: [
        {
          label: "Reset",
          action: () => {
            systemSounds.stop();
            try {
              localStorage.removeItem(STORAGE_KEY);
            } catch {
              /* no storage */
            }
            dispatch({ type: "reset" });
            setDialog(null);
            setPhase("power");
          },
        },
        { label: "Cancel", primary: true, action: () => setDialog(null) },
      ],
    });
  }
  function shutdown() {
    setDialog({
      title: "Shut Down Windows",
      icon: "windows",
      text: (
        <>
          What do you want the computer to do?
          <p>
            <strong>Shut down.</strong> Your saved files will be kept.
          </p>
        </>
      ),
      buttons: [
        {
          label: "OK",
          primary: true,
          action: () => {
            const dirty = state.windows.find((w) =>
              windowIsDirty(w, state.files),
            );
            if (dirty) {
              closeWindow(dirty);
              return;
            }
            setDialog(null);
            beep("shutdown");
            setPhase("off");
          },
        },
        { label: "Cancel", action: () => setDialog(null) },
      ],
    });
  }
  useEffect(() => {
    function before(e: BeforeUnloadEvent) {
      if (state.windows.some((w) => windowIsDirty(w, state.files))) {
        e.preventDefault();
      }
    }
    window.addEventListener("beforeunload", before);
    return () => window.removeEventListener("beforeunload", before);
  }, [state.windows, state.files]);
  return (
    <OS.Provider
      value={{
        state,
        dispatch,
        phase,
        setPhase,
        openApp,
        openFile,
        closeWindow,
        dialog,
        setDialog,
        hint,
        reset,
        shutdown,
        beep,
        unlockAudio: () => systemSounds.unlock(),
        storageOK,
      }}
    >
      {children}
    </OS.Provider>
  );
}
export { folderPath };
