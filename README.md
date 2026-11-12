# Quest

Source for the Quest trip-planning PWA, pulled byte-exact from the live production
deployment on 2026-11-12 so deploys can move from manual Vercel API pushes to
git-based deploys.

All app code lives in `src/` (vanilla JS, layered `v*.js`/`v*.css` files loaded
in sequence from `index.html`).

**Known gap:** 12 decorative binary assets (`apple-touch-icon.png`,
`art/*.webp`, `mascot/*.png`) are not yet committed — they're larger than the
fetch tooling used to pull this repo could reliably retrieve byte-exact. None
affect app functionality; they can be added by uploading them directly through
the GitHub web UI into the matching `src/` subfolders.
