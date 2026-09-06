# Kelsi Kee — site notes

Static site: plain HTML/CSS/JS, no build step, no framework. Open `index.html`
through a web server (not `file://` — the paths are absolute, e.g. `/scripts/`).

```bash
python3 -m http.server 8765     # then http://localhost:8765
```

There is no password prompt — the site is open. It previously asked for one on
load (`rareroom`, hardcoded in the script), which was never real protection since
anyone could read it in the source or just skip it. Removed; see git history if
it is ever wanted back.

Visitors who passed the old gate still have an `allowed` key in `localStorage`.
Nothing reads it any more and it can be ignored.

---

## Temporarily hidden sections — how to bring them back

Three pieces of the site are switched off. All three are controlled by one block
at the top of [`scripts/index.js`](scripts/index.js):

```js
const FEATURES = {
  music: false,       // "Music" link in the top-right nav
  video: false,       // "Video" link in the top-right nav
  albumTitle: false,  // "The Line" title + "listen here", bottom left
};
```

**To re-enable: change the flag to `true`. That is the whole change.** Nothing
else needs editing — the markup, CSS and link-wiring for all three are still in
the repo, untouched and working. `applyFeatureFlags()` deletes the elements from
the page on load when a flag is `false`.

### Check these when you turn one back on

- **The URLs come from the bucket, not from this repo.** `music` and `video` are
  read at runtime from
  `https://rareroom-bucket.s3.us-east-2.amazonaws.com/kelsi-kee/data.json`. If
  that file has `"music": ""`, the Music link will render with no destination.
  Set the URL there, not in the markup.
- **`albumTitle` also controls "listen here"**, which points at the *music* URL.
  It is wired from `data.music` directly rather than from the Music nav link, so
  turning on `albumTitle` alone gives a working link — you do not also need
  `music: true`.
- **The album art is `/images/album-title-cropped.png`** and currently reads
  "THE LINE". If the record is renamed, swap that file.

### Why the elements are deleted rather than hidden with CSS

The nav spaces and separates itself with `#main-nav a + a` rules. A `display:
none` element still counts as a sibling for `+`, which left a stray divider line
above the fan club button in the mobile menu. Removing the nodes avoids that.

Related: the fan club button carries its own `display: inline-block` in
[`styles/index.css`](styles/index.css). It used to inherit that from
`#main-nav a + a` purely because it was the *third* link; with Music and Video
off it became the first, the rule stopped matching, and its hover underline
collapsed to the text baseline — drawing a line through the middle of the
artwork. Do not remove that declaration.

---

## Can the hidden links be kept out of view of someone inspecting the page?

**No — not on a static site, and it is worth being clear about why.**

Everything the browser needs, the browser is given: `index.html`, `index.js` and
`index.css` are served verbatim to anyone who asks. The feature flags remove the
elements from the *live DOM*, so the browser's Inspector shows a clean page — but
"View Source" still shows the `Music` / `Video` / `#home-content` markup, and
`index.js` still shows the `FEATURES` block naming them.

Moving that markup into JavaScript templates would take it out of the HTML, but
it would then simply be visible in the JS instead. That buys the *appearance* of
secrecy without the substance, which is worse than the current arrangement,
because it invites you to treat something exposed as if it were hidden. Genuine
hiding requires the content not to be sent at all — a build step that strips it
before deploy, or a server that decides per-request. This project has neither.

### What is actually exposed right now

This matters more than the markup, and the flags do not affect it:

- **`data.json` in the S3 bucket is public and unauthenticated.** Anyone can
  fetch it — the URL is in `index.js` — and it currently returns live
  `music` and `video` links, including a `s.disco.ac` private-listening URL,
  *while both features are switched off on the site.*
- `/images/album-title-cropped.png` ("THE LINE") is a public file and served
  whether or not the section that displays it is rendered.

**If the goal is that nobody learns of the unreleased material early, the
effective control is to blank those two values in the bucket's `data.json` while
the features are off**, and restore them when the flags flip. That genuinely
removes the information; the flags only stop it being displayed. (Bucket
*listing* is denied, so the file cannot be found by browsing — but the URL is in
the source, so that is not a meaningful barrier.)

---

## Other things worth knowing

- **Country dropdown** is a hardcoded ISO 3166-1 list (`COUNTRIES` in
  `scripts/index.js`). It used to be fetched from `restcountries.com`; that API
  is now deprecated *and* 301s to a host whose redirect carries no CORS header,
  so the request was blocked and the dropdown silently fell back to the three
  countries in the markup. Those three are still in `index.html` as a fallback
  and are removed at runtime to avoid duplicates.
- **Social icons** ship `hidden` in `index.html`. `setSocials()` reveals only the
  ones the bucket gives a link to, in the bucket file's key order — so that file
  controls both which icons appear and what order they sit in. They are `hidden`
  rather than visible-then-removed because otherwise every icon painted for a
  moment before the unused ones blinked out.
- **Signup popup type** is scaled by one value: `font-size` on `.signup-pop` in
  [`styles/signup-popup.css`](styles/signup-popup.css). Every size inside is in
  `em`, so that one number scales the panel. `1rem` is the original size, `0.7rem`
  is 30% smaller (current).
- **Background image** is set in `#background` in `styles/index.css`. Both fisheye
  options are kept: `background-image-fisheye.jpg` (option 1, current) and
  `background-image-fisheye-2.jpg` (option 2). Older art is also still there.

### Known pre-existing issues, not fixed

- `#overlay` points at `/images/overlay-desktop.jpg` and `/images/overlay-mobile.jpg`,
  neither of which exists in `images/`. Both 404 on every load. The overlay is
  driven by a fade whose end date (9 May 2025) has passed, so it sits at full
  opacity over a missing image and renders nothing. Harmless, but dead.
