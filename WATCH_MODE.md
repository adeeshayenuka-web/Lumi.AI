# Lumi Watch Companion

## What it adds
- Browser screen sharing via `getDisplayMedia()` for a tab, window, or screen.
- Local preview of the shared stream.
- Optional AI scene reactions using occasional JPEG frames sent to `/api/watch-react`.
- Quiet/normal/rare reaction cadence so Lumi does not constantly talk.
- A manual “React now” button.
- Short, selective, age-appropriate reactions with mood changes and optional speech.

## Privacy
Screen sharing is browser-permission based. Nothing is captured until the user presses Start screen share and grants permission. When AI reactions are enabled, selected frames are sent to the configured AI backend for analysis. Turn AI reactions off to keep the stream local to the browser.

## Media limits
This does not bypass DRM, subscriptions, paywalls, platform restrictions, or age gates. It is intended for content the user is allowed to view.
