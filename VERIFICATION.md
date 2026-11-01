# Verification record

Updated on 1 November 2026 after the requested application, image-folder, game, and sound expansion.

| Check                                                                  | Actual result                                                                                                                 |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| TypeScript and Vite production build                                   | PASS, `npm run build`                                                                                                         |
| Component, game-rule, sound-engine, and asset suite                    | PASS, 17 tests / 0 failures, `npm test`                                                                                       |
| Production static assets                                               | HTTP 200 for all 35 files, including JPEGs, WAVs, PDF/preview, original artwork, scripts, and fonts                           |
| Existing local dev server                                              | HTTP 200 at `http://127.0.0.1:5173/`                                                                                          |
| Original mystery, boot/skip, notes, RAM installer, restoration, reveal | PASS in component tests                                                                                                       |
| Window focus/minimize/taskbar/maximize and Notepad save/dirty guards   | PASS in component tests                                                                                                       |
| Browser history/search/address errors and Back/Forward                 | PASS in component tests                                                                                                       |
| Exact `1998` folder image names and image-viewer asset mapping         | PASS in component tests and filesystem-byte checks                                                                            |
| Family photograph opens in My Pictures                                 | PASS in component tests; the supplied photograph was visually inspected after extraction                                      |
| Word edit/format/save/reopen and new document persistence              | PASS in component tests                                                                                                       |
| Calculator arithmetic and divide-by-zero recovery                      | PASS in component tests                                                                                                       |
| Outlook inbox, compose, local send, Sent Items persistence             | PASS in component tests                                                                                                       |
| Sound event panel, volume, explicit mute persistence                   | PASS in component tests                                                                                                       |
| Startup audio decode/play scheduling and stop-on-mute                  | PASS with a mocked AudioContext; same-origin WAV request verified                                                             |
| Startup asset                                                          | Real non-silent mono PCM WAV, 22,050 Hz, 3.6 seconds                                                                          |
| Games launch / Solitaire draw and Undo / Pinball launch-pause state    | PASS in component tests                                                                                                       |
| Solitaire legal moves, foundation rules, 52-card conservation          | PASS in pure rule tests                                                                                                       |
| Minesweeper first-click safety and flood reveal                        | PASS in pure rule tests and component test                                                                                    |
| Historical PDF                                                         | Generated and rendered locally; full page visually inspected for layout                                                       |
| Real-browser visual, touch, audio-hardware, and pointer verification   | Not completed. Earlier Computer Use inspection was blocked because its browser host/current Chrome URL could not be verified. |

The React tests use jsdom, which does not implement rendered browser layout, canvas painting, or real audio hardware. Actual Paint strokes, Pinball physics feel, drag/resize pointer geometry, clipping, mobile touch behavior, and audible speaker playback still need a manual browser pass. Sound scheduling, bundled waveform bytes, game rules, and application state were checked separately; they are not represented as a real-browser audition or screenshot review.

The application remains local at the user's request. No public GitHub repository or hosted app deployment was made. The earlier Sites source/build upload was rejected by automatic approval review; the user subsequently chose **“Keep the result local.”** No further cloud upload was attempted. The input PDF and pasted attachment remain outside the application repository; extracted reference images are included locally at the user's explicit request.

Local delivery archives in the parent directory are refreshed after the final source commit: `room404-source.zip`, `room404-production.zip`, and `room404-history.bundle`. Git history is preserved. The production preview used for asset checks is temporary; the user's dev server at port 5173 remains running.

To check startup on an already resumed desktop, open **Sounds → Windows startup → Play sound**. A fresh **Power on** unlocks browser audio and plays the startup WAV after boot. Sound defaults on; explicit mute choices persist. The generated sounds are original retro compositions, not Microsoft recordings.
