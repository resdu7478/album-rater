# Changelog

All notable changes to My Album Rating Mode are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

The version in `index.html` (`APP_VERSION`) is the single source of truth and is
mirrored by the `CHANGELOG` array in that file (which drives the in-app
"What's New" popup) and by `CACHE_VERSION` in `sw.js`.

## [1.2] - 2026-08-30

### Added
- "What's New" popup on launch that lists everything new since the version you
  last opened, reading directly from the changelog data (first launch records
  the version silently, no popup).
- Self-updating via a service worker: when a new version is deployed the app
  shows a non-blocking "Update available — reload" prompt, and re-checks for
  updates whenever the app returns to the foreground (fixes stale iOS
  home-screen PWAs).

## [1.1] - 2026-08-30

### Changed
- Rating mode now follows whichever Spotify device is currently active, so you
  can move playback between your phone, PC and speakers mid-session.

## [1.0] - 2026-08-30

### Added
- Initial release — rate every song in your saved albums 1–5, one unrated song
  at a time. Ratings are stored as five Spotify playlists (★1–★5) so they sync
  everywhere and can't be lost.
