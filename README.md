# ROOM 404 — The Computer That Never Graduated

An abandoned Windows 98 computer. One unfinished semester project. An extraordinary amount of confidence.

Explore Rohan's desktop, personal documents, local web, and deleted files in a short, affectionate comedy mystery. The computer's last session was 31 October 2002. Everything runs in the browser.

## Run

Use Node.js 22.12+ and npm. From this directory:

```sh
npm ci
npm run dev
```

Open the local address printed by Vite. For the production bundle:

```sh
npm test
npm run build
npm run preview
```

`dist/` is the complete static website. No environment variables, API keys, server, database, authentication, or remote story services are required. The simulated `.test` addresses never leave the application. Saved documents and settings live only in this browser's `room404.experience.v1` storage entry.

## What works

- Power-on, skippable boot, welcome note, shutdown, and restart.
- Teal desktop, original pixel-style icons, Start menu, progressive hints, optional sound and CRT overlay, taskbar, and a fictional session clock.
- Shared draggable/resizable windows; focus, minimize, taskbar switching, maximize/restore, and close. Windows maximize below 650px and remain switchable through the taskbar.
- Explorer with shared folders, Back/Up navigation, folder tree, address, and file counts.
- Editable Notepad, Save, Ctrl+S, unsaved-change marker, Save/Discard/Cancel protection, and saved content after reopening or refreshing.
- Local Internet Explorer: homepage, search, history, Back/Forward, editable address, local errors, and fictional downloads.
- Cancellable RAM installer, repeatable installation, one stable editable receipt.
- Recycle Bin restore into My Documents, confession, image viewer with Fit/Actual Size, and the final project reveal.
- Versioned persistence, malformed-storage recovery, storage-unavailable notice, and a confirmed reset limited to this application.

Desktop icons and Explorer items open with a double-click, Enter, or a single touch tap. All illustrations are original SVGs bundled in `public/art/`. `architecture.bmp` is intentionally a fictional file backed by an SVG illustration.

## 2–3 minute judge demonstration

Before presenting: use **Start → Reset Experience** and confirm, then leave the power screen ready. Sound and CRT are optional and start off.

| Time      | Action                                                                                                                                                     | Presentation cue                                                              |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 0:00–0:20 | Power on; let boot finish or skip.                                                                                                                         | “We found a student's abandoned computer. His project review was tomorrow.”   |
| 0:20–0:40 | Read his note.                                                                                                                                             | “His first request is that we delete the browser history. So naturally…”      |
| 0:40–1:15 | Open Internet Explorer. Show History, close its panel, follow Download More RAM. Download, double-click the file in Downloads, Install, then View receipt. | Pause on **RAM: 0 MB / Confidence: 128 MB**.                                  |
| 1:15–1:55 | Open Recycle Bin, Restore, Open restored file. Open My Documents → Pictures → architecture.bmp. Choose Submit anyway.                                      | Pause on **USER → MAGIC → MARKS** and the final note.                         |
| 1:55–2:20 | Close the final note. Show the drawing; save/reopen a short note, minimize it, and restore from the taskbar.                                               | “The operating system works. His project remains a matter of interpretation.” |
| 2:20–2:40 | Start → Shut Down → OK.                                                                                                                                    | Let the shutdown screen deliver the final joke.                               |

For independent exploration, point judges to **Start → Help**. The story can be opened out of order. Rohan's restored note also explains where he went: the night bus home to his mother's cooking.

## Verification

`npm test` runs component integration tests with React Testing Library and jsdom. They exercise power/skip, saving/reopening/persistence, dirty-document protection, multiple windows and taskbar/maximize state, browser navigation and errors, RAM cancellation/completion/receipt, restoration and the final reveal, shutdown/restart/reset, unrelated-storage preservation, malformed storage, muted defaults, and narrow viewport window sizing.

These are **component tests, not real-browser layout tests**. Computer Use could not inspect Chrome because it could not verify the current browser URL. Drag/resize pointer geometry, rendered visual quality, mobile touch behavior, actual audio playback, and real-browser focus behavior still need a manual pass. The production preview was separately checked for HTTP 200. See `VERIFICATION.md` for the final recorded results.

## Hackathon brief and scope

The seven-page Gandhi Hackathon PDF is the source for organizer requirements. It prioritizes entertaining discoveries, creativity, functionality, visual authenticity, and cleanliness. Its application/game examples are optional. The attached implementation brief supplies the original Room 404 narrative and the narrower frontend scope; its 90-minute budget is a build constraint, not an organizer deadline. No backend, AI, authentication, mandatory technology, or numerical judging weights were inferred from the PDF.

## Public submission

The organizer requires **both a public GitHub repository with full commit history and a working live URL judges can open**. Localhost and an owner-private hosted site do not satisfy those requirements.

This folder is a Git repository with real implementation commits. Preserve that history when publishing. A GitHub Pages workflow is included. To complete public submission:

1. Create an empty **public** GitHub repository in your own account.
2. Add it as a remote and push this project's `main` branch with its existing history. Do not use a force push or upload only the latest source snapshot.
3. Under repository **Settings → Pages → Source**, select **GitHub Actions**.
4. Run the included **Deploy Room 404** workflow (or push to `main`). It tests, builds, and deploys `dist/`.
5. Open the resulting Pages URL in a signed-out browser and rehearse the route above. Submit the real repository and deployed URL together.

The build uses relative asset paths so it can run from a repository subpath. Other static hosts can publish `dist/` with build command `npm run build`. Deployment guidance follows [Vite's official static deployment documentation](https://vite.dev/guide/static-deploy).

## Source map and credits

- `src/store.tsx`: shared reducer, central file dispatcher, persistence, dialogs, and optional synthesized audio.
- `src/App.tsx`: boot/shutdown, desktop, shared window frame, Start menu, taskbar, focus-managed system dialog.
- `src/apps.tsx`: Explorer, Notepad, browser/local pages, Recycle Bin, image viewer, installer, welcome, and hints.
- `src/files.ts`: stable virtual file IDs and original fictional content.
- `src/icons.tsx`, `public/art/`: original vector pixel-style icons, hostel illustration, and project schematic.
- `src/style.css`: layout, original period-inspired treatments, responsive rules, and optional CRT overlay.
- [React](https://react.dev/) and [Vite](https://vite.dev/) supply the frontend runtime and build tooling.
- [98.css](https://github.com/jdan/98.css), MIT: base period controls and bundled MS Sans Serif recreation; see its package for license and font credits.
- [react-rnd](https://github.com/bokuweb/react-rnd), MIT: drag/resize primitive, including its dependency tree.
- [98.js](https://98.js.org/) and [Windows93](https://www.windows93.net/) informed the behavioral consistency and curiosity-driven approach. Their source, artwork, and jokes were not copied.
- Testing: React Testing Library, jsdom, tsx, and Node's test runner. Prettier formats source.

Windows and Internet Explorer names refer to the period being recreated. This is a fictional student computer, not an official operating system or a real browser inside a browser.
