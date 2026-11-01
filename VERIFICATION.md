# Verification record

Verified on 1 November 2026.

| Check                                                                | Actual result                                                                                                                    |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript and Vite production build                                 | PASS, `npm run build`                                                                                                            |
| React component integration smoke suite                              | PASS, 7 tests / 0 failures, `npm test`                                                                                           |
| Production static preview                                            | HTTP 200 for all 10 generated files, including local illustrations and fonts                                                     |
| Power-on, skip, welcome/readme                                       | PASS in component tests                                                                                                          |
| Multiple windows, focus, minimize, taskbar restore, maximize/restore | PASS in component tests                                                                                                          |
| Notepad edit/save/close/reopen and persisted remount                 | PASS in component tests                                                                                                          |
| Unsaved document Cancel/Discard and explicit Save                    | PASS in component tests                                                                                                          |
| Local browser history, navigation, address error, Back/Forward       | PASS in component tests                                                                                                          |
| Fake RAM download, installer cancellation/completion, receipt        | PASS in component tests                                                                                                          |
| Restore confession to shared filesystem, open drawing, final reveal  | PASS in component tests                                                                                                          |
| Shutdown/restart, reset, unrelated localStorage preservation         | PASS in component tests                                                                                                          |
| Malformed storage, narrow viewport frame dimensions, muted defaults  | PASS in component tests                                                                                                          |
| Real-browser visual and pointer verification                         | BLOCKED: browser access host unavailable; native Chrome inspection stopped because Computer Use could not verify its current URL |

The component tests run React and the real application components against jsdom. They verify interaction state and content; jsdom does not implement browser layout. They do **not** prove drag/resize pointer geometry, clipping, rendered typography, mobile touch behavior, audio playback, or browser-native focus behavior. Those remain manual checks.

No public GitHub repository has been created by this task. Local Git history is intact. A Pages deployment workflow and publication instructions are included in README.md. A localhost URL is a development convenience, not a valid hackathon live submission.

Hosting was prepared in Sites, but **no deployment was completed**. Automatic approval review rejected the source/build upload because explicit authorization for that payload and destination had not been provided. The user then selected **“Keep the result local.”** The created Site has no published version; no further upload or publishing will be attempted under this request. The input PDF and pasted attachment are outside the application repository.

Local delivery includes `room404-source.zip`, `room404-production.zip`, and `room404-history.bundle` in the parent directory. The Git bundle was verified to contain the complete history. Both temporary Vite servers were stopped at handoff; run `npm run dev` to start the application again.
