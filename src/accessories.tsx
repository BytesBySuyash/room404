import { useEffect, useRef, useState } from "react";
import { useOS } from "./store";
import type { Win } from "./store";
import { Icon } from "./icons";
import { SOUND_NAMES } from "./sound";
import type { SoundName } from "./sound";

const defaultDoc = {
  text: "",
  font: "Times New Roman",
  size: 16,
  bold: false,
  italic: false,
  underline: false,
  align: "left",
};
export function parseDocument(raw: string) {
  try {
    const d = JSON.parse(raw);
    return {
      ...defaultDoc,
      text: typeof d.text === "string" ? d.text : "",
      font: ["Times New Roman", "Arial", "Courier New"].includes(d.font)
        ? d.font
        : defaultDoc.font,
      size: [12, 14, 16, 18, 24, 32].includes(d.size) ? d.size : 16,
      bold: d.bold === true,
      italic: d.italic === true,
      underline: d.underline === true,
      align: ["left", "center", "right"].includes(d.align) ? d.align : "left",
    };
  } catch {
    return { ...defaultDoc, text: raw };
  }
}
export function Word({ win }: { win: Win }) {
  const { state, dispatch, closeWindow } = useOS();
  const file = state.files.find((f) => f.id === win.fileId);
  const doc = parseDocument(win.draft || "");
  const [saved, setSaved] = useState(false);
  function edit(patch: Partial<typeof defaultDoc>) {
    dispatch({
      type: "patch",
      id: win.id,
      patch: { draft: JSON.stringify({ ...doc, ...patch }) },
    });
    setSaved(false);
  }
  function save() {
    const content = win.draft || JSON.stringify(defaultDoc);
    if (file) dispatch({ type: "save", id: file.id, content });
    else {
      dispatch({
        type: "file",
        file: {
          id: "user-word",
          parentId: "docs",
          name: "Document1.doc",
          type: "document",
          content,
          modifiedAt: "2002-10-31",
        },
      });
      dispatch({
        type: "patch",
        id: win.id,
        patch: { fileId: "user-word", title: "Document1.doc - Microsoft Word" },
      });
    }
    setSaved(true);
  }
  return (
    <div
      className="application word-app"
      onKeyDown={(e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "s") {
          e.preventDefault();
          save();
        }
      }}
    >
      <div className="app-menubar">
        <button onClick={save}>Save</button>
        <button onClick={() => closeWindow(win)}>Close</button>
        <span className="toolbar-note">Microsoft Word · Personal edition</span>
      </div>
      <div className="toolbar word-tools">
        <select
          aria-label="Document font"
          value={doc.font}
          onChange={(e) => edit({ font: e.target.value })}
        >
          {["Times New Roman", "Arial", "Courier New"].map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>
        <select
          aria-label="Font size"
          value={doc.size}
          onChange={(e) => edit({ size: Number(e.target.value) })}
        >
          {[12, 14, 16, 18, 24, 32].map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
        <span className="toolbar-divider" />
        {(["bold", "italic", "underline"] as const).map((key, i) => (
          <button
            key={key}
            aria-label={key[0].toUpperCase() + key.slice(1)}
            aria-pressed={doc[key]}
            onClick={() => edit({ [key]: !doc[key] })}
          >
            <span
              style={{
                fontWeight: i === 0 ? "bold" : undefined,
                fontStyle: i === 1 ? "italic" : undefined,
                textDecoration: i === 2 ? "underline" : undefined,
              }}
            >
              {["B", "I", "U"][i]}
            </span>
          </button>
        ))}
        <span className="toolbar-divider" />
        {["left", "center", "right"].map((align) => (
          <button
            key={align}
            aria-label={"Align " + align}
            aria-pressed={doc.align === align}
            onClick={() => edit({ align })}
          >
            {align === "left" ? "≡←" : align === "right" ? "→≡" : "≡"}
          </button>
        ))}
      </div>
      <div className="word-ruler" aria-hidden="true">
        1 · · · · 2 · · · · 3 · · · · 4 · · · · 5 · · · · 6 · · · · 7
      </div>
      <div className="word-workspace">
        <textarea
          className="word-paper"
          aria-label="Word document"
          value={doc.text}
          maxLength={50000}
          onChange={(e) => edit({ text: e.target.value })}
          style={{
            fontFamily: doc.font,
            fontSize: doc.size,
            fontWeight: doc.bold ? "bold" : "normal",
            fontStyle: doc.italic ? "italic" : "normal",
            textDecoration: doc.underline ? "underline" : "none",
            textAlign: doc.align as "left" | "center" | "right",
          }}
        />
      </div>
      <div className="status-bar">
        <p className="status-bar-field">
          {saved
            ? "Saved to My Documents"
            : "Page 1 · " +
              (doc.text.trim() ? doc.text.trim().split(/\s+/).length : 0) +
              " words"}
        </p>
        <p className="status-bar-field">
          {doc.font} · {doc.size} pt
        </p>
      </div>
    </div>
  );
}

const colors = [
  "#000000",
  "#808080",
  "#800000",
  "#808000",
  "#008000",
  "#008080",
  "#000080",
  "#800080",
  "#ffffff",
  "#c0c0c0",
  "#ff0000",
  "#ffff00",
  "#00ff00",
  "#00ffff",
  "#0000ff",
  "#ff00ff",
];
export function Paint({ win }: { win: Win }) {
  const { state, dispatch, beep } = useOS();
  const canvas = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<"pencil" | "eraser" | "line" | "rectangle">(
    "pencil",
  );
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(3);
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState("Draw with the mouse or your finger.");
  const history = useRef<ImageData[]>([]);
  const stroke = useRef<{ x: number; y: number; snapshot: ImageData } | null>(
    null,
  );
  const file = state.files.find((f) => f.id === (win.fileId || "user-paint"));
  function context() {
    return canvas.current?.getContext("2d", { willReadFrequently: true });
  }
  useEffect(() => {
    if (typeof window.CanvasRenderingContext2D === "undefined") return;
    const ctx = context();
    if (!ctx) return;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, 640, 400);
    if (file?.asset) {
      const image = new Image();
      image.onload = () => ctx.drawImage(image, 0, 0, 640, 400);
      image.src = file.asset;
    }
  }, []);
  function save() {
    const c = canvas.current;
    if (!c) return;
    try {
      const asset = c.toDataURL("image/png");
      dispatch({
        type: "file",
        file: {
          id: file?.id || "user-paint",
          parentId: "pictures",
          name: file?.name || "Drawing.png",
          type: "image",
          asset,
          content: "A drawing made in Paint on Rohan’s computer.",
          modifiedAt: "2002-10-31",
        },
      });
      setStatus("Saved to My Documents\\Pictures\\Drawing.png");
    } catch {
      setStatus("The drawing could not be saved.");
      beep("error");
    }
  }
  function point(e: React.PointerEvent<HTMLCanvasElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) * 640) / r.width,
      y: ((e.clientY - r.top) * 400) / r.height,
    };
  }
  function push(snapshot: ImageData) {
    history.current = [...history.current.slice(-19), snapshot];
    setCount(history.current.length);
  }
  function down(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = context();
    if (!ctx) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = point(e),
      snapshot = ctx.getImageData(0, 0, 640, 400);
    stroke.current = { ...p, snapshot };
    push(snapshot);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
    ctx.lineWidth = tool === "eraser" ? size * 5 : size;
    ctx.lineCap = "round";
    if (tool === "pencil" || tool === "eraser") {
      ctx.lineTo(p.x + 0.1, p.y + 0.1);
      ctx.stroke();
    }
  }
  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    const s = stroke.current,
      ctx = context();
    if (!s || !ctx) return;
    const p = point(e);
    if (tool === "pencil" || tool === "eraser") {
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    } else {
      ctx.putImageData(s.snapshot, 0, 0);
      ctx.beginPath();
      if (tool === "line") {
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(p.x, p.y);
      } else ctx.rect(s.x, s.y, p.x - s.x, p.y - s.y);
      ctx.stroke();
    }
  }
  function end() {
    if (stroke.current) {
      stroke.current = null;
      save();
    }
  }
  return (
    <div className="application paint-app">
      <div className="app-menubar">
        <button onClick={save}>Save picture</button>
        <button
          disabled={!count}
          onClick={() => {
            const ctx = context(),
              snapshot = history.current.pop();
            if (ctx && snapshot) {
              ctx.putImageData(snapshot, 0, 0);
              setCount(history.current.length);
              save();
            }
          }}
        >
          Undo
        </button>
        <button
          onClick={() => {
            const ctx = context();
            if (ctx) {
              push(ctx.getImageData(0, 0, 640, 400));
              ctx.fillStyle = "#fff";
              ctx.fillRect(0, 0, 640, 400);
              save();
            }
          }}
        >
          Clear
        </button>
      </div>
      <div className="paint-workspace">
        <aside className="paint-tools">
          {(["pencil", "eraser", "line", "rectangle"] as const).map((t) => (
            <button
              key={t}
              aria-pressed={tool === t}
              onClick={() => setTool(t)}
            >
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
          <label>
            Size
            <select
              aria-label="Brush size"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
            >
              {[1, 3, 7, 12].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
          <div
            className="paint-swatch"
            style={{ background: color }}
            aria-label={"Selected color " + color}
          />
        </aside>
        <div className="paint-canvas-wrap inset">
          <canvas
            width={640}
            height={400}
            ref={canvas}
            aria-label="Paint drawing canvas"
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={end}
            onPointerCancel={end}
          >
            Drawing canvas
          </canvas>
        </div>
      </div>
      <div className="paint-palette" aria-label="Color palette">
        {colors.map((c) => (
          <button
            key={c}
            aria-label={"Choose color " + c}
            aria-pressed={color === c}
            style={{ background: c }}
            onClick={() => setColor(c)}
          />
        ))}
      </div>
      <div className="status-bar">
        <p className="status-bar-field">{status}</p>
        <p className="status-bar-field">640 × 400</p>
      </div>
    </div>
  );
}

export function Calculator() {
  const { beep } = useOS();
  const [display, setDisplay] = useState("0");
  const [stored, setStored] = useState<number | null>(null);
  const [op, setOp] = useState("");
  const [replace, setReplace] = useState(true);
  const [memory, setMemory] = useState(0);
  function calc(a: number, b: number, o: string) {
    switch (o) {
      case "+":
        return a + b;
      case "−":
        return a - b;
      case "×":
        return a * b;
      case "÷":
        return b === 0 ? NaN : a / b;
      default:
        return b;
    }
  }
  function show(n: number, reason = "Invalid input") {
    if (!Number.isFinite(n)) {
      setDisplay(reason);
      beep("error");
    } else setDisplay(String(Number(n.toPrecision(12))));
    setReplace(true);
  }
  function press(key: string) {
    const n = Number(display);
    if (/^\d$/.test(key) || key === ".") {
      if (replace || !Number.isFinite(n)) {
        setDisplay(key === "." ? "0." : key);
        setReplace(false);
      } else if (display.length < 16 && (key !== "." || !display.includes(".")))
        setDisplay(display === "0" && key !== "." ? key : display + key);
      return;
    }
    if (key === "C") {
      setDisplay("0");
      setStored(null);
      setOp("");
      setReplace(true);
    } else if (key === "CE") {
      setDisplay("0");
      setReplace(true);
    } else if (key === "Backspace") {
      setDisplay(display.length > 1 ? display.slice(0, -1) : "0");
    } else if (key === "±") show(-n);
    else if (key === "√") show(Math.sqrt(n));
    else if (key === "%") show(stored !== null ? (stored * n) / 100 : n / 100);
    else if (key === "1/x") show(1 / n, "Cannot divide by zero");
    else if (key === "=") {
      if (stored !== null && op) {
        show(
          calc(stored, n, op),
          op === "÷" && n === 0 ? "Cannot divide by zero" : "Invalid input",
        );
        setStored(null);
        setOp("");
      }
    } else {
      const next = stored !== null && op && !replace ? calc(stored, n, op) : n;
      show(next);
      setStored(Number.isFinite(next) ? next : null);
      setOp(key);
    }
  }
  const keys = [
    "7",
    "8",
    "9",
    "÷",
    "√",
    "4",
    "5",
    "6",
    "×",
    "%",
    "1",
    "2",
    "3",
    "−",
    "1/x",
    "0",
    "±",
    ".",
    "+",
    "=",
  ];
  return (
    <div
      className="application calculator-app"
      tabIndex={0}
      onKeyDown={(e) => {
        let key = e.key;
        if (key === "Enter") key = "=";
        if (key === "Escape") key = "C";
        key =
          ({ "-": "−", "*": "×", "/": "÷" } as Record<string, string>)[key] ||
          key;
        if ([...keys, "Backspace", "C"].includes(key)) {
          e.preventDefault();
          press(key);
        }
      }}
    >
      <div className="calc-mode">Standard</div>
      <input
        className="calc-display"
        aria-label="Calculator result"
        value={display}
        readOnly
      />
      <div className="calc-pending">
        {stored !== null ? stored + " " + op : " "}
      </div>
      <div className="calc-clear">
        <span>{memory ? "M" : ""}</span>
        <button onClick={() => press("Backspace")}>Backspace</button>
        <button onClick={() => press("CE")}>CE</button>
        <button onClick={() => press("C")}>C</button>
      </div>
      <div className="calc-body">
        <div className="calc-memory">
          {["MC", "MR", "MS", "M+"].map((k) => (
            <button
              key={k}
              onClick={() => {
                if (k === "MC") setMemory(0);
                if (k === "MR") show(memory);
                if (k === "MS") setMemory(Number(display) || 0);
                if (k === "M+") setMemory((m) => m + (Number(display) || 0));
              }}
            >
              {k}
            </button>
          ))}
        </div>
        <div className="calc-keys">
          {keys.map((k) => (
            <button
              className={/[÷×−+=]/.test(k) ? "calc-operation" : ""}
              key={k}
              onClick={() => press(k)}
            >
              {k}
            </button>
          ))}
        </div>
      </div>
      <div className="status-bar">
        <p className="status-bar-field">
          {op ? "Enter the next number." : "Ready"}
        </p>
      </div>
    </div>
  );
}

function parseMail(raw: string) {
  const [headers, ...parts] = raw.split("\n\n");
  const get = (name: string) =>
    headers
      .split("\n")
      .find((l) => l.startsWith(name + ":"))
      ?.slice(name.length + 1)
      .trim() || "";
  return {
    from: get("From"),
    to: get("To"),
    subject: get("Subject"),
    date: get("Date"),
    body: parts.join("\n\n"),
  };
}
export function Mail({ win }: { win: Win }) {
  const { state, dispatch, beep } = useOS();
  const [folder, setFolder] = useState<"inbox" | "sent">("inbox");
  const [selected, setSelected] = useState(win.fileId || "mail-amit");
  const [compose, setCompose] = useState(false);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState(
    "Working offline. Messages stay inside this computer.",
  );
  useEffect(() => {
    if (win.fileId) {
      setSelected(win.fileId);
      setFolder(win.fileId.startsWith("user-mail") ? "sent" : "inbox");
    }
  }, [win.fileId]);
  const messages = state.files.filter(
    (f) =>
      f.type === "mail" &&
      (folder === "sent"
        ? f.id.startsWith("user-mail")
        : !f.id.startsWith("user-mail")),
  );
  const message = parseMail(
    state.files.find((f) => f.id === selected)?.content || "",
  );
  function send() {
    if (!to.trim() || !subject.trim()) {
      setStatus("Enter a recipient and a subject.");
      beep("error");
      return;
    }
    const id = "user-mail-" + Date.now();
    dispatch({
      type: "file",
      file: {
        id,
        parentId: "mail-folder",
        type: "mail",
        name: subject.slice(0, 50) + ".eml",
        content: `From: Rohan <rohan@hostel.test>\nTo: ${to}\nSubject: ${subject}\nDate: 31 Oct 2002, 11:58 PM\n\n${body}`,
        modifiedAt: "2002-10-31",
      },
    });
    setSelected(id);
    setFolder("sent");
    setCompose(false);
    setStatus(
      "Message saved in Sent Items. No email was sent over the Internet.",
    );
    beep("mail");
  }
  return (
    <div className="application mail-app">
      <div className="toolbar">
        <button
          onClick={() => {
            setCompose(true);
            setTo("");
            setSubject("");
            setBody("");
          }}
        >
          Create Mail
        </button>
        <button
          disabled={!message.from}
          onClick={() => {
            setCompose(true);
            setTo(message.from);
            setSubject("Re: " + message.subject);
            setBody("\n\n--- Original message ---\n" + message.body);
          }}
        >
          Reply
        </button>
        <button
          onClick={() => {
            setStatus(
              "Offline mail checked. 2 messages from the last session.",
            );
            beep("mail");
          }}
        >
          Send / Receive
        </button>
        <span className="toolbar-note">Outlook Express · Offline</span>
      </div>
      <div className="mail-body">
        <nav className="mail-folders" aria-label="Mail folders">
          <strong>Local Folders</strong>
          <button
            className={folder === "inbox" ? "pressed" : ""}
            onClick={() => {
              setFolder("inbox");
              setCompose(false);
              setSelected("mail-amit");
            }}
          >
            Inbox (2)
          </button>
          <button
            className={folder === "sent" ? "pressed" : ""}
            onClick={() => {
              setFolder("sent");
              setCompose(false);
              setSelected(
                state.files.find((f) => f.id.startsWith("user-mail"))?.id || "",
              );
            }}
          >
            Sent Items
          </button>
        </nav>
        <div className="mail-content">
          {compose ? (
            <form
              className="mail-compose"
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
            >
              <label>
                To:
                <input
                  aria-label="Mail recipient"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </label>
              <label>
                Subject:
                <input
                  aria-label="Mail subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </label>
              <textarea
                aria-label="Mail body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={20000}
              />
              <div>
                <button type="submit">Send locally</button>
                <button type="button" onClick={() => setCompose(false)}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="mail-message-list inset">
                {messages.map((f) => {
                  const m = parseMail(f.content || "");
                  return (
                    <button
                      className={selected === f.id ? "selected" : ""}
                      key={f.id}
                      onClick={() => setSelected(f.id)}
                    >
                      <Icon name="mail" size={16} />
                      <span>{m.subject}</span>
                      <small>{m.from.split("<")[0]}</small>
                    </button>
                  );
                })}
                {!messages.length && <p>No messages in this folder.</p>}
              </div>
              <article className="mail-message inset">
                {message.subject ? (
                  <>
                    <h2>{message.subject}</h2>
                    <dl>
                      <dt>From:</dt>
                      <dd>{message.from}</dd>
                      <dt>To:</dt>
                      <dd>{message.to}</dd>
                      <dt>Sent:</dt>
                      <dd>{message.date}</dd>
                    </dl>
                    <pre>{message.body}</pre>
                  </>
                ) : (
                  <p>Select a message to read it.</p>
                )}
              </article>
            </>
          )}
        </div>
      </div>
      <div className="status-bar">
        <p className="status-bar-field">{status}</p>
      </div>
    </div>
  );
}

export function DocumentReader({ win }: { win: Win }) {
  const { state } = useOS();
  const file = state.files.find((f) => f.id === win.fileId);
  const [zoom, setZoom] = useState(false);
  return (
    <div className="application pdf-reader">
      <div className="toolbar">
        <button aria-pressed={!zoom} onClick={() => setZoom(false)}>
          Fit width
        </button>
        <button aria-pressed={zoom} onClick={() => setZoom(true)}>
          Actual size
        </button>
        <a
          className="retro-link-button"
          href={file?.asset}
          target="_blank"
          rel="noreferrer"
        >
          Open PDF
        </a>
        <span className="toolbar-note">1 / 1</span>
      </div>
      <div className={"pdf-page-area " + (zoom ? "actual" : "")}>
        <img src={file?.preview} alt={file?.content} />
      </div>
      <div className="status-bar">
        <p className="status-bar-field">
          Historical news archive · Page 1 of 1
        </p>
      </div>
    </div>
  );
}
export function MediaPlayer({ win }: { win: Win }) {
  const { state } = useOS();
  const file = state.files.find((f) => f.id === win.fileId);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audio = useRef<HTMLAudioElement>(null);
  const source = file?.asset || "./files/Windows/Media/hostel_loop.wav";
  useEffect(() => {
    const element = audio.current;
    return () => element?.pause();
  }, []);
  useEffect(() => {
    if (audio.current) {
      audio.current.muted = !state.sound;
      audio.current.volume = state.volume;
    }
  }, [state.sound, state.volume]);
  return (
    <div className="application media-player">
      <div className="media-screen">
        <div className="media-title">WINDOWS MEDIA PLAYER</div>
        <Icon name="sound" size={45} />
        <strong>
          {file?.asset ? file.name : "Rohan’s original hostel loop"}
        </strong>
        <span>
          {playing ? "▶ Playing" : "■ Stopped"} · {Math.floor(time)} /{" "}
          {Math.floor(duration)} sec
        </span>
      </div>
      <div className="media-controls">
        <button
          onClick={() => {
            void audio.current
              ?.play()
              .then(() => setPlaying(true))
              .catch(() => setPlaying(false));
          }}
        >
          Play
        </button>
        <button
          onClick={() => {
            audio.current?.pause();
            setPlaying(false);
          }}
        >
          Pause
        </button>
        <button
          onClick={() => {
            if (audio.current) {
              audio.current.pause();
              audio.current.currentTime = 0;
            }
            setTime(0);
            setPlaying(false);
          }}
        >
          Stop
        </button>
        <label>
          Loop{" "}
          <input
            type="checkbox"
            aria-label="Loop media"
            onChange={(e) => {
              if (audio.current) audio.current.loop = e.target.checked;
            }}
          />
        </label>
      </div>
      <div className="media-details">
        {file?.content?.split("\n").map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
      <audio
        ref={audio}
        src={source}
        onTimeUpdate={() => setTime(audio.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audio.current?.duration || 0)}
        onEnded={() => setPlaying(false)}
      />
    </div>
  );
}
const soundLabels: Record<SoundName, string> = {
  startup: "Windows startup",
  shutdown: "Exit Windows",
  open: "Open program",
  close: "Close program",
  click: "Menu / file click",
  minimize: "Minimize window",
  maximize: "Maximize window",
  error: "Critical stop",
  notify: "System notification",
  mail: "New mail notification",
  recycle: "Recycle Bin restore",
  done: "Task complete",
  modem: "Dial-up modem",
  pinball: "Pinball bumper",
};
export function Sounds() {
  const { state, dispatch, beep } = useOS();
  const [selected, setSelected] = useState<SoundName>("startup");
  return (
    <div className="application sounds-app">
      <div className="sounds-heading">
        <Icon name="sound" size={40} />
        <div>
          <h2>Bring the old machine back.</h2>
          <p>Original Windows 98-inspired sounds, bundled locally.</p>
        </div>
      </div>
      <div className="sound-settings-row">
        <label>
          <input
            type="checkbox"
            aria-label="Enable system sounds"
            checked={state.sound}
            onChange={(e) =>
              dispatch({
                type: "settings",
                key: "sound",
                value: e.target.checked,
              })
            }
          />{" "}
          Enable system sounds
        </label>
        <label>
          Volume{" "}
          <input
            type="range"
            aria-label="System sound volume"
            min="0"
            max="100"
            value={Math.round(state.volume * 100)}
            onChange={(e) =>
              dispatch({
                type: "settings",
                key: "volume",
                value: Number(e.target.value) / 100,
              })
            }
          />
        </label>
      </div>
      <div
        className="sound-list inset"
        role="listbox"
        aria-label="Program events"
      >
        {SOUND_NAMES.map((name) => (
          <button
            key={name}
            role="option"
            aria-selected={selected === name}
            className={selected === name ? "selected" : ""}
            onClick={() => setSelected(name)}
            onDoubleClick={() => beep(name)}
          >
            <Icon name="sound" size={16} />
            {soundLabels[name]}
          </button>
        ))}
      </div>
      <div className="sound-preview">
        <span>
          {soundLabels[selected]}
          <small>C:\Windows\Media\{selected}.wav</small>
        </span>
        <button disabled={!state.sound} onClick={() => beep(selected)}>
          ▶ Play sound
        </button>
      </div>
      <div className="status-bar">
        <p className="status-bar-field">
          {state.sound
            ? "Sounds on. Startup plays after Power on."
            : "Muted. Enable sounds to preview."}
        </p>
      </div>
    </div>
  );
}
