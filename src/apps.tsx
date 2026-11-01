import { useEffect, useRef, useState } from "react";
import { Icon } from "./icons";
import type { IconName } from "./icons";
import { useOS, folderPath } from "./store";
import type { Win } from "./store";
import type { VFile } from "./files";
import { ramFile, receipt } from "./files";

export function FileIcon({ file }: { file: VFile }) {
  return (
    <Icon
      name={
        file.type === "folder"
          ? "folder"
          : file.type === "image"
            ? "image"
            : file.type === "installer"
              ? "installer"
              : "text"
      }
    />
  );
}
export function Application({ win }: { win: Win }) {
  switch (win.app) {
    case "explorer":
      return <Explorer win={win} />;
    case "notepad":
      return <Notepad win={win} />;
    case "browser":
      return <RetroBrowser />;
    case "bin":
      return <RecycleBin />;
    case "image":
      return <ImageViewer win={win} />;
    case "installer":
      return <RamInstaller />;
    case "welcome":
      return <Welcome win={win} />;
    case "hint":
      return <Hints />;
  }
}
export function MenuBar({ children }: { children: React.ReactNode }) {
  return <div className="app-menubar">{children}</div>;
}
function FileItems({
  files,
  onOpen,
}: {
  files: VFile[];
  onOpen: (f: VFile) => void;
}) {
  const [selected, setSelected] = useState("");
  return (
    <div className="file-grid">
      {files.map((f) => (
        <button
          className={`file-item ${selected === f.id ? "selected" : ""}`}
          key={f.id}
          title={`${f.name}\nModified: ${f.modifiedAt}`}
          onClick={(e) => {
            setSelected(f.id);
            if (e.detail === 0) onOpen(f);
          }}
          onDoubleClick={() => onOpen(f)}
          onPointerUp={(e) => {
            if (e.pointerType === "touch") {
              setSelected(f.id);
              onOpen(f);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onOpen(f);
            }
          }}
        >
          <FileIcon file={f} />
          <span>{f.name}</span>
        </button>
      ))}
    </div>
  );
}
function Explorer({ win }: { win: Win }) {
  const { state, dispatch, openFile } = useOS();
  const [past, setPast] = useState<string[]>([]);
  const folder = win.folderId || "docs";
  const files = state.files.filter((f) => f.parentId === folder && !f.deleted);
  function nav(id: string, back = false) {
    if (id === folder) return;
    if (!back) setPast((p) => [...p, folder]);
    dispatch({
      type: "patch",
      id: win.id,
      patch: {
        folderId: id,
        title:
          id === "computer"
            ? "My Computer"
            : state.files.find((f) => f.id === id)?.name || "My Documents",
      },
    });
  }
  function open(f: VFile) {
    if (f.type === "folder") nav(f.id);
    else openFile(f.id);
  }
  return (
    <div className="application explorer">
      <MenuBar>
        <button onClick={() => nav("docs")}>My Documents</button>
        <button onClick={() => nav("pictures")}>Pictures</button>
        <button onClick={() => nav("downloads")}>Downloads</button>
      </MenuBar>
      <div className="toolbar">
        <button
          disabled={!past.length}
          onClick={() => {
            nav(past[past.length - 1], true);
            setPast((p) => p.slice(0, -1));
          }}
        >
          <span className="tool-arrow">←</span> Back
        </button>
        <button
          disabled={folder === "computer"}
          onClick={() =>
            nav(
              state.files.find((f) => f.id === folder)?.parentId || "computer",
            )
          }
        >
          <span className="tool-arrow">↑</span> Up
        </button>
        <span className="toolbar-divider" />
        <span className="toolbar-note">Double-click to open</span>
      </div>
      <label className="address-row">
        <span>Address</span>
        <div className="address-display">
          <Icon name="folder" size={16} />
          <span>{folderPath(folder, state.files)}</span>
        </div>
      </label>
      <div className="explorer-main inset">
        <nav className="folder-tree" aria-label="Folder tree">
          <button
            className={folder === "computer" ? "tree-active" : ""}
            onClick={() => nav("computer")}
          >
            <Icon name="computer" size={16} /> My Computer
          </button>
          <button
            className={`tree-level-1 ${folder === "drive" ? "tree-active" : ""}`}
            onClick={() => nav("drive")}
          >
            <Icon name="folder" size={16} /> Local Disk (C:)
          </button>
          <button
            className={`tree-level-2 ${folder === "docs" ? "tree-active" : ""}`}
            onClick={() => nav("docs")}
          >
            <Icon name="folder" size={16} /> My Documents
          </button>
          <button
            className={`tree-level-3 ${folder === "pictures" ? "tree-active" : ""}`}
            onClick={() => nav("pictures")}
          >
            <Icon name="folder" size={16} /> Pictures
          </button>
          <button
            className={`tree-level-3 ${folder === "downloads" ? "tree-active" : ""}`}
            onClick={() => nav("downloads")}
          >
            <Icon name="folder" size={16} /> Downloads
          </button>
          <div className="folder-aside">
            {folder === "pictures" ? (
              <>
                A few things worth keeping.
                <br />
                <br />
                Not everything made it into the project.
              </>
            ) : (
              <>
                Rohan’s personal files.
                <br />
                <br />
                Last changed
                <br />
                31 October 2002.
              </>
            )}
          </div>
        </nav>
        <div className="file-area">
          {files.length ? (
            <FileItems files={files} onOpen={open} />
          ) : (
            <p className="empty-folder">This folder is empty.</p>
          )}
        </div>
      </div>
      <div className="status-bar">
        <p className="status-bar-field">
          {files.length} object{files.length === 1 ? "" : "s"}
        </p>
        <p className="status-bar-field">
          {folder === "downloads"
            ? "Files stay inside this fictional computer."
            : "Local Disk (C:)"}
        </p>
      </div>
    </div>
  );
}
function Notepad({ win }: { win: Win }) {
  const { state, dispatch, closeWindow, setDialog } = useOS();
  const [menu, setMenu] = useState(false);
  const [saved, setSaved] = useState(false);
  const file = state.files.find((f) => f.id === win.fileId);
  const value = win.draft || "";
  const dirty = value !== (file?.content || "");
  function save() {
    if (file) dispatch({ type: "save", id: file.id, content: value });
    else {
      const f: VFile = {
        id: "user-note",
        parentId: "docs",
        name: "Untitled.txt",
        type: "text",
        content: value,
        modifiedAt: "2002-10-31",
      };
      dispatch({ type: "file", file: f });
      dispatch({
        type: "patch",
        id: win.id,
        patch: { fileId: f.id, title: "Untitled.txt - Notepad" },
      });
    }
    setSaved(true);
    setMenu(false);
  }
  return (
    <div
      className="application notepad"
      onKeyDown={(e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "s") {
          e.preventDefault();
          save();
        }
        if (e.key === "Escape") setMenu(false);
      }}
    >
      <MenuBar>
        <div className="menu-holder">
          <button aria-expanded={menu} onClick={() => setMenu(!menu)}>
            File
          </button>
          {menu && (
            <>
              <div className="menu-dismiss" onClick={() => setMenu(false)} />
              <div className="dropdown-menu">
                <button onClick={save}>
                  Save <span>Ctrl+S</span>
                </button>
                <hr />
                <button
                  onClick={() => {
                    setMenu(false);
                    closeWindow(win);
                  }}
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
        <button
          onClick={() => {
            setDialog({
              title: "About Notepad",
              icon: "text",
              text: (
                <>
                  Notepad
                  <br />A place for the next version of the final version.
                  <p>Plain text is saved locally on this browser.</p>
                </>
              ),
              buttons: [
                { label: "OK", primary: true, action: () => setDialog(null) },
              ],
            });
          }}
        >
          Help
        </button>
        <button className="save-tool" onClick={save}>
          Save
        </button>
      </MenuBar>
      <textarea
        aria-label={file?.name || "Untitled document"}
        spellCheck={false}
        value={value}
        onChange={(e) => {
          dispatch({
            type: "patch",
            id: win.id,
            patch: { draft: e.target.value },
          });
          setSaved(false);
        }}
      />
      <div className="status-bar">
        <p className="status-bar-field">
          {dirty
            ? "Modified"
            : saved
              ? "Saved to C:\\My Documents"
              : "Text document"}
        </p>
        <p className="status-bar-field">{value.length} characters</p>
        <p className="status-bar-field">Ln {value.split("\n").length}</p>
      </div>
    </div>
  );
}

const HOME = "http://rohan.test/";
const SEARCH = "http://search.test/";
const DOWNLOAD = "http://downloads.test/ram";
function normalize(address: string) {
  let a = address.trim();
  if (!/^https?:\/\//i.test(a)) a = "http://" + a;
  try {
    const u = new URL(a);
    return `http://${u.hostname}${u.pathname}${u.search}`;
  } catch {
    return a;
  }
}
function RetroBrowser() {
  const { openFile, openApp, state, dispatch } = useOS();
  const [trail, setTrail] = useState([HOME]);
  const [index, setIndex] = useState(0);
  const [address, setAddress] = useState(HOME);
  const [history, setHistory] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string | null>(null);
  const current = trail[index];
  const route = current.split("?")[0];
  function navigate(url: string) {
    const next = normalize(url);
    setTrail((t) => [...t.slice(0, index + 1), next]);
    setIndex(index + 1);
    setAddress(next);
    setResults(null);
    dispatch({ type: "discover", id: "browser" });
  }
  function step(to: number) {
    setIndex(to);
    setAddress(trail[to]);
    setResults(null);
  }
  function localSearch(value: string) {
    setQuery(value);
    setResults(value);
    if (route !== SEARCH) {
      const next = SEARCH + "?q=" + encodeURIComponent(value);
      setTrail((t) => [...t.slice(0, index + 1), next]);
      setIndex(index + 1);
      setAddress(next);
    }
    dispatch({ type: "discover", id: "browser" });
  }
  function download() {
    dispatch({ type: "file", file: { ...ramFile } });
    dispatch({ type: "discover", id: "download" });
    openApp("explorer", { folderId: "downloads" });
  }
  const Link = ({
    to,
    children,
  }: {
    to: string;
    children: React.ReactNode;
  }) => (
    <button className="web-link" onClick={() => navigate(to)}>
      {children}
    </button>
  );
  return (
    <div className="application retro-browser">
      <MenuBar>
        <button onClick={() => navigate(HOME)}>Favorites</button>
        <button onClick={() => setHistory(!history)} aria-pressed={history}>
          History
        </button>
        <span className="local-network-label">Local, simulated Internet</span>
      </MenuBar>
      <div className="toolbar browser-toolbar">
        <button onClick={() => step(index - 1)} disabled={index === 0}>
          <span className="tool-arrow">←</span> Back
        </button>
        <button
          aria-label="Forward"
          onClick={() => step(index + 1)}
          disabled={index >= trail.length - 1}
        >
          <span className="tool-arrow">→</span>
        </button>
        <span className="toolbar-divider" />
        <button onClick={() => navigate(HOME)}>
          <Icon name="computer" size={20} /> Home
        </button>
        <button onClick={() => navigate(SEARCH)}>
          <Icon name="browser" size={20} /> Search
        </button>
        <button onClick={() => setHistory(!history)} aria-pressed={history}>
          <Icon name="folder" size={20} /> History
        </button>
        <div className="ie-toolbar-logo">
          <Icon name="windows" size={27} />
        </div>
      </div>
      <form
        className="address-row"
        onSubmit={(e) => {
          e.preventDefault();
          navigate(address);
        }}
      >
        <label htmlFor="browser-address">Address</label>
        <input
          id="browser-address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          spellCheck={false}
        />
        <button type="submit">
          Go <span aria-hidden="true">→</span>
        </button>
      </form>
      <div className="browser-body inset">
        {history && (
          <aside className="history-panel">
            <div className="history-heading">
              <strong>History</strong>
              <button
                aria-label="Close history"
                onClick={() => setHistory(false)}
              >
                ×
              </button>
            </div>
            <p>Thursday, 31 October 2002</p>
            {[
              "how to finish semester project in one night",
              "can folders count as software architecture",
              "download more RAM",
            ].map((q, i) => (
              <button
                className="history-entry"
                key={q}
                onClick={() => {
                  if (i === 2) navigate(DOWNLOAD);
                  else localSearch(q);
                }}
              >
                <Icon name="browser" size={16} />
                {q}
              </button>
            ))}
            <hr />
            <strong>Pages visited</strong>
            {[...new Set(trail)].map((p) => (
              <button
                className="history-entry"
                key={p}
                onClick={() => navigate(p)}
              >
                {p}
              </button>
            ))}
          </aside>
        )}
        <div className="web-viewport">
          {route === HOME ? (
            <article className="cyber-page">
              <div className="homepage-topline">
                ★ WELCOME TO MY LITTLE CORNER OF THE WORLD WIDE WEB ★
              </div>
              <header>
                <span className="ascii-spark">✧</span>
                <div>
                  <h1>ROHAN’S CYBER DEN</h1>
                  <p>Future software legend. Current semester: complicated.</p>
                </div>
                <span className="ascii-spark">✧</span>
              </header>
              <div className="homepage-layout">
                <aside>
                  <strong>EXPLORE</strong>
                  <hr />
                  <button
                    className="web-link"
                    onClick={() => {
                      openFile("project3");
                      dispatch({ type: "discover", id: "project" });
                    }}
                  >
                    My Project
                  </button>
                  <Link to={DOWNLOAD}>Download More RAM</Link>
                  <Link to={SEARCH}>Back to Search</Link>
                  <div className="construction">
                    <span aria-hidden="true">▰ ▰ ▰</span>
                    <strong>
                      UNDER
                      <br />
                      CONSTRUCTION
                    </strong>
                    <small>since July 1999</small>
                  </div>
                  <p className="webring">
                    [ Room 404 Webring ]<br />
                    You are already at
                    <br />
                    the best site.
                  </p>
                </aside>
                <main>
                  <h2>Hello, fellow netizen!</h2>
                  <p>
                    I’m Rohan. Second-year student. First-rate dreamer. Proud
                    owner of a computer with <strong>32 MB of RAM</strong> and
                    absolutely unlimited potential.
                  </p>
                  <img
                    className="hostel-picture"
                    src="./art/hostel.svg"
                    alt="Rohan’s pixel illustration of the hostel at dusk, with Room 404 still lit"
                  />
                  <p className="photo-caption">
                    The hostel, after everyone with a sensible sleep schedule
                    has gone to bed.
                    <br />
                    An illustration by me. Please ask before using.
                  </p>
                  <h3>What I’m working on</h3>
                  <p>
                    A revolutionary distributed system. Details are confidential
                    until the project review. Or until there are details.
                  </p>
                  <div className="homepage-note">
                    <strong>31 October 2002</strong>
                    <br />
                    Going offline for a bit. Left everything on the desktop.
                    <br />
                    If you’re looking for the real project… check what I threw
                    away.
                  </div>
                </main>
              </div>
              <footer>
                <span>
                  Visitors: <b className="visitor-counter">000404</b>
                </span>
                <span>Best viewed with an optimistic attitude.</span>
              </footer>
            </article>
          ) : route === SEARCH ? (
            <article className="search-page">
              <div className="search-brand">
                Seek<span>!</span>
              </div>
              <p>Your gateway to a very small World Wide Web.</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  localSearch(query);
                }}
              >
                <input
                  aria-label="Search the local web"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <div>
                  <button type="submit">Search the Web</button>
                  <button type="button" onClick={() => navigate(HOME)}>
                    I’m Feeling Hopeful
                  </button>
                </div>
              </form>
              {results !== null || current.includes("?q=") ? (
                <section className="search-results">
                  <p>
                    Local results for{" "}
                    <strong>
                      {results ??
                        new URL(current).searchParams.get("q") ?? ""}
                    </strong>
                  </p>
                  <h3>
                    <Link to={HOME}>
                      Rohan’s Cyber Den — A future software legend
                    </Link>
                  </h3>
                  <p>
                    Semester projects, unlimited potential, and one very
                    elaborate folder structure.
                  </p>
                  <h3>
                    <Link to={DOWNLOAD}>
                      Download More RAM — Instant confidence upgrade
                    </Link>
                  </h3>
                  <p>Why buy hardware when you can click a button?</p>
                </section>
              ) : (
                <div className="search-directory">
                  <Link to={HOME}>Student homepages</Link> |{" "}
                  <Link to={DOWNLOAD}>Computer upgrades</Link>
                </div>
              )}
              <footer>
                This is a tiny offline web. Results are local and fictional.
                <br />© 2002 Seek! (probably)
              </footer>
            </article>
          ) : route === DOWNLOAD ? (
            <article className="download-page">
              <div className="download-banner">
                THE INTERNET’S #1 QUESTIONABLE UPGRADE
              </div>
              <h1>
                Download More <span>RAM!</span>
              </h1>
              <p className="ram-tagline">
                Your computer is slow.
                <br />
                Your belief in the Internet doesn’t have to be.
              </p>
              <div className="ram-chip" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>
              <table>
                <tbody>
                  <tr>
                    <td>Current memory</td>
                    <td>32 MB</td>
                  </tr>
                  <tr>
                    <td>Recommended memory</td>
                    <td>More</td>
                  </tr>
                  <tr>
                    <td>Required hardware</td>
                    <td>Enthusiasm</td>
                  </tr>
                </tbody>
              </table>
              <button className="ram-download" onClick={download}>
                Download 128 MB of RAM
              </button>
              <small>
                DownloadMoreRAM.exe · 404 KB · Windows 98 compatible*
              </small>
              <p className="download-fineprint">
                *Compatibility with reality may vary.
                <br />A fictional download inside Rohan’s computer. No real
                executable is downloaded.
              </p>
              <Link to={HOME}>← Back to Rohan’s homepage</Link>
            </article>
          ) : (
            <article className="error-page">
              <Icon name="browser" size={48} />
              <h1>The page cannot be displayed</h1>
              <p>
                The address <strong>{current}</strong> is outside this little
                computer’s local web.
              </p>
              <hr />
              <p>Try one of the following:</p>
              <p>
                <button className="web-link" onClick={() => navigate(HOME)}>
                  Return to Rohan’s homepage
                </button>
              </p>
              <p>
                <button
                  className="web-link"
                  disabled={index === 0}
                  onClick={() => step(index - 1)}
                >
                  Go back to the previous page
                </button>
              </p>
              <small>ROOM 404 — Local page not found</small>
            </article>
          )}
        </div>
      </div>
      <div className="status-bar">
        <p className="status-bar-field">
          {state.discoveries.includes("download")
            ? "Done. A questionable decision has been made."
            : "Done"}
        </p>
        <p className="status-bar-field">
          <Icon name="computer" size={14} /> Local intranet
        </p>
      </div>
    </div>
  );
}

function RecycleBin() {
  const { state, dispatch, openFile } = useOS();
  const [selected, setSelected] = useState("confession");
  const [restored, setRestored] = useState(false);
  const files = state.files.filter((f) => f.deleted);
  function restore() {
    const f = files.find((f) => f.id === selected);
    if (!f) return;
    dispatch({
      type: "file",
      file: { ...f, deleted: false, parentId: f.originalParent || "docs" },
    });
    dispatch({ type: "discover", id: "restored" });
    setRestored(true);
  }
  return (
    <div className="application recycle-bin">
      <MenuBar>
        <button
          disabled={!files.some((f) => f.id === selected)}
          onClick={restore}
        >
          Restore selected item
        </button>
      </MenuBar>
      <div className="bin-notice">
        <Icon name="bin" />
        <div>
          <strong>One person’s trash. One person’s secrets.</strong>
          <p>Deleted files can be restored to their original location.</p>
        </div>
      </div>
      <div className="bin-table inset">
        <div className="bin-table-heading">
          <span>Name</span>
          <span>Original location</span>
          <span>Date deleted</span>
        </div>
        {files.map((f) => (
          <button
            key={f.id}
            className={`bin-file ${selected === f.id ? "selected" : ""}`}
            onClick={() => setSelected(f.id)}
            onDoubleClick={() => setSelected(f.id)}
          >
            <span>
              <Icon name="text" size={20} />
              {f.name}
            </span>
            <span>C:\My Documents</span>
            <span>31/10/2002</span>
          </button>
        ))}
        {!files.length && (
          <div className="restored-notice">
            <Icon name="folder" />
            <h3>{restored ? "File restored." : "The Recycle Bin is empty."}</h3>
            {!state.files.find((f) => f.id === "confession")?.deleted && (
              <>
                <p>confession.txt is back in My Documents.</p>
                <button onClick={() => openFile("confession")}>
                  Open restored file
                </button>
              </>
            )}
          </div>
        )}
      </div>
      <div className="bin-actions">
        <span>
          {files.length
            ? "Last deleted at 11:58 PM. Make of that what you will."
            : "Some things are worth recovering."}
        </span>
        {!!files.length && (
          <button onClick={restore} disabled={!selected}>
            Restore
          </button>
        )}
      </div>
      <div className="status-bar">
        <p className="status-bar-field">
          {files.length} object{files.length === 1 ? "" : "s"}
        </p>
      </div>
    </div>
  );
}
function ImageViewer({ win }: { win: Win }) {
  const { state } = useOS();
  const [fit, setFit] = useState(true);
  const file = state.files.find((f) => f.id === win.fileId);
  return (
    <div className="application image-viewer">
      <div className="toolbar">
        <button aria-pressed={fit} onClick={() => setFit(true)}>
          Fit to window
        </button>
        <button aria-pressed={!fit} onClick={() => setFit(false)}>
          Actual size
        </button>
        <span className="toolbar-note">{file?.name}</span>
      </div>
      <div className={`image-canvas inset ${fit ? "fit" : ""}`}>
        <img src={file?.asset} alt={file?.content} />
      </div>
      <div className="status-bar">
        <p className="status-bar-field">
          {file?.id === "architecture"
            ? "760 × 490 pixels · original schematic"
            : "640 × 400 pixels · original illustration"}
        </p>
        <p className="status-bar-field">{fit ? "Fit" : "100%"}</p>
      </div>
    </div>
  );
}
function RamInstaller() {
  const { state, dispatch, openFile, beep } = useOS();
  const [stage, setStage] = useState<"ready" | "running" | "done">("ready");
  const [progress, setProgress] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    [],
  );
  function install() {
    setStage("running");
    setProgress(0);
    const start = Date.now();
    timer.current = setInterval(() => {
      const p = Math.min(100, Math.round((Date.now() - start) / 21));
      setProgress(p);
      if (p === 100) {
        if (timer.current) clearInterval(timer.current);
        setStage("done");
        dispatch({ type: "discover", id: "ram" });
        beep("done");
      }
    }, 70);
  }
  function cancel() {
    if (timer.current) clearInterval(timer.current);
    setStage("ready");
    setProgress(0);
  }
  function viewReceipt() {
    if (!state.files.some((f) => f.id === receipt.id))
      dispatch({ type: "file", file: { ...receipt } });
    /* Open on the next render, after the shared filesystem updates. */ setReceiptRequested(
      true,
    );
  }
  const [receiptRequested, setReceiptRequested] = useState(false);
  useEffect(() => {
    if (receiptRequested && state.files.some((f) => f.id === receipt.id)) {
      openFile(receipt.id);
      setReceiptRequested(false);
    }
  }, [receiptRequested, state.files, openFile]);
  return (
    <div className="application installer">
      <div className="installer-main">
        <aside>
          <Icon name="installer" size={54} />
          <div>
            MEMORY
            <br />
            UPGRADE
            <br />
            <b>128 MB</b>
          </div>
          <small>More is more.*</small>
        </aside>
        <main>
          {stage === "ready" ? (
            <>
              <h2>Welcome to the future of memory.</h2>
              <p>This wizard will improve your computer’s self-esteem.</p>
              <p>Close all doubts before continuing.</p>
              <small>
                This setup runs entirely inside the fictional computer.
              </small>
            </>
          ) : stage === "running" ? (
            <>
              <h2>Upgrading your possibilities…</h2>
              <p aria-live="polite">
                {progress < 34
                  ? "Inspecting empty memory slots…"
                  : progress < 67
                    ? "Downloading confidence…"
                    : "Polishing existing RAM…"}
              </p>
              <div
                className="progress-indicator"
                role="progressbar"
                aria-label="RAM installation"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
              >
                <span style={{ width: progress + "%" }} />
              </div>
              <p>{progress}% complete</p>
            </>
          ) : (
            <>
              <h2>Installation complete.</h2>
              <div className="ram-result">
                <span>RAM added</span>
                <strong>0 MB</strong>
                <span>Confidence added</span>
                <strong>128 MB</strong>
              </div>
              <p>
                Your hardware is exactly the same.
                <br />
                Your possibilities are endless.
              </p>
            </>
          )}
        </main>
      </div>
      <div className="installer-actions">
        {stage === "ready" ? (
          <>
            <button
              onClick={() => dispatch({ type: "close", id: "installer" })}
            >
              Cancel
            </button>
            <button className="default" onClick={install}>
              Install &gt;
            </button>
          </>
        ) : stage === "running" ? (
          <button onClick={cancel}>Cancel</button>
        ) : (
          <>
            <button onClick={viewReceipt}>View receipt</button>
            <button
              onClick={() => {
                setStage("ready");
                setProgress(0);
              }}
            >
              Install again
            </button>
            <button
              className="default"
              onClick={() => dispatch({ type: "close", id: "installer" })}
            >
              OK
            </button>
          </>
        )}
      </div>
    </div>
  );
}
function Welcome({ win }: { win: Win }) {
  const { openFile, dispatch } = useOS();
  return (
    <div className="welcome-body">
      <div className="welcome-heading">
        <Icon name="computer" size={48} />
        <div>
          <small>LAST SESSION: 31 OCTOBER 2002</small>
          <h1>Someone left in a hurry.</h1>
        </div>
      </div>
      <p>
        This was Rohan’s computer. A college student, an aspiring software
        legend, and the owner of one very unfinished semester project.
      </p>
      <p>
        Everything is just as he left it.
        <br />
        His files might explain the rest.
      </p>
      <div className="welcome-tip">
        <Icon name="text" size={24} />
        <span>
          Start with <strong>README_FIRST.txt</strong>.<br />
          Double-click icons to explore. On touch, tap once.
        </span>
      </div>
      <div className="dialog-footer">
        <span>Room 404 · Personal computer</span>
        <button
          className="default"
          onClick={() => {
            dispatch({ type: "close", id: win.id });
            openFile("readme");
          }}
        >
          Read his note
        </button>
      </div>
    </div>
  );
}
function Hints() {
  const { state, openFile, openApp } = useOS();
  const d = state.discoveries;
  const hint: [string, string, IconName, () => void] = !d.includes("readme")
    ? [
        "A note on the desktop",
        "README_FIRST.txt seems like a sensible place to start. Rohan left a request.",
        "text",
        () => openFile("readme"),
      ]
    : !d.includes("ram")
      ? [
          "Follow the browser history",
          "Open Internet Explorer. Rohan bookmarked his homepage. His RAM upgrade deserves a closer look.",
          "browser",
          () => openApp("browser"),
        ]
      : !d.includes("restored")
        ? [
            "The bin is apparently “PRIVATE”",
            "An unusual thing to write in a welcome note. Open the Recycle Bin and restore what he deleted.",
            "bin",
            () => openApp("bin"),
          ]
        : !d.includes("architecture")
          ? [
              "The real project",
              "Read the restored confession, then look in My Documents → Pictures → architecture.bmp.",
              "image",
              () => openFile("confession"),
            ]
          : [
              "You found his masterpiece",
              "Read a few personal files, leave Rohan a note, or shut down from the Start menu for one last goodbye.",
              "folder",
              () => openApp("explorer", { folderId: "docs" }),
            ];
  return (
    <div className="hint-body">
      <Icon name={hint[2]} size={40} />
      <h2>{hint[0]}</h2>
      <p>{hint[1]}</p>
      <button onClick={hint[3]}>Take me there</button>
      <hr />
      <small>Follow your curiosity. There’s no timer and no wrong order.</small>
    </div>
  );
}
