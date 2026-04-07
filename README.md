# GFView — Google Fonts Viewer

A progressive web app for previewing Google Fonts on real sample content, in real-time, with no build tools or dependencies.

![GFView](https://fonts.gstatic.com/s/i/short-logo/googlefonts/v1/24px.svg)

---

## Features

### Font Selection
- Browse **63 curated Google Fonts** across four categories
- **Category filter pills** — All · Serif · Sans Serif · Calligraphy / Script · Technology — narrow the list instantly
- Separate selectors for **Headline** and **Body** fonts
- Each listbox shows **5 visible options**; navigate with ↑ ↓ arrow keys and fonts update in real-time as you move through the list

### Font Size Controls
- Independent size sliders for headline and body text
- Switch between **px** and **pt** units in Settings — the slider ranges, steps, and displayed values all update while your chosen sizes are preserved

### Font Specimen Dialog
- Click the **font preview badge** below either selector to open the specimen dialog
- Shows the font rendered at Display, Subheading, and Body sizes, full glyph set, and a **Styles grid** of all available weights (detected via Canvas)
- **Download Family** — opens Google's direct font ZIP download in a new tab
- **Full Specimen Page** — links to `fonts.google.com/specimen/…` in a new tab

### Settings
Opened from the ⋮ menu → **Settings**:

| Setting | Description |
|---|---|
| Font Size Unit | Toggle between `px` (screen) and `pt` (print) |
| Headline Text | Custom headline — Markdown inline formatting supported |
| Body Text | Custom body copy — full Markdown supported (headings, bold, italic, blockquotes, lists, code, links) |

**Markdown cheat sheet for body text:**

```
## Heading
**bold**   *italic*   `code`
> blockquote
- unordered list item
1. ordered list item
[link text](https://example.com)
---
```

### Theme
Toggle **Light / Dark** mode from the ⋮ menu. The preference applies immediately across all UI and sample content.

### Installable PWA
- Add to Home Screen on iOS and Android for a standalone, full-screen experience
- Service worker caches the app shell for **offline use**
- Google Fonts CSS and woff2 files are cached on first load and served offline thereafter

---

## Font Library

| Category | Count | Examples |
|---|---|---|
| Serif | 4 | Roboto Slab, IBM Plex Serif, Noto Serif, Kelly Slab |
| Sans Serif | 17 | Roboto, Open Sans, IBM Plex Sans, Noto Sans family, Rajdhani |
| Calligraphy / Script | 19 | Allura, Caveat, Kaushan Script, Waterfall, Rouge Script |
| Technology | 23 | Orbitron, Fira Code, JetBrains Mono, Bungee, Tourney |

---

## File Structure

```
GFView/
├── index.html      Main app shell and all dialog markup
├── app.css         All styles — layout, sidebar, dialogs, dark/light themes
├── app.js          Font data, Markdown parser, all application logic
├── manifest.json   PWA manifest (name, icons, display mode)
├── sw.js           Service worker — cache-first for shell, network-first for fonts
└── README.md       This file
```

### No build step required
GFView is plain HTML, CSS, and vanilla JavaScript. There are no npm packages, bundlers, or frameworks.

---

## Deployment

Any static file host that serves over **HTTPS** works. HTTPS is required for service workers and the PWA install prompt.

**GitHub Pages**

```bash
# From the GFView directory
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/gfview.git
git push -u origin main
# Enable Pages in repo Settings → Pages → Deploy from branch → main
```

**Netlify** (drag and drop)

1. Go to [app.netlify.com](https://app.netlify.com)
2. Drag the `GFView/` folder onto the deploy area
3. Done — HTTPS is automatic

**Vercel**

```bash
npm i -g vercel
cd GFView
vercel
```

**Local development**

A local HTTPS server is needed to test the service worker. The quickest option:

```bash
# Python 3
python3 -m http.server 8080
# Then open http://localhost:8080
# (SW won't register on plain http except on localhost, which browsers exempt)
```

Or with Node:

```bash
npx serve .
```

---

## How Fonts Are Loaded

1. On first selection, a `<link>` element is injected into `<head>` pointing to the Google Fonts CSS API (`fonts.googleapis.com/css2?family=…`)
2. The browser fetches the CSS, which in turn fetches the `woff2` font file from `fonts.gstatic.com`
3. Both the CSS and the woff2 are cached by the service worker for subsequent visits
4. A small set of fonts (Roboto Slab, Source Sans 3, Orbitron, Caveat) are preloaded at startup for an instant first impression

For the specimen dialog, a separate API request loads all 9 CSS weight variants (`100` through `900`) of the selected font. Available weights are then detected using a lightweight Canvas pixel-diff to determine which weights render distinctly.

---

## Browser Support

| Browser | Support |
|---|---|
| Chrome / Edge 90+ | ✅ Full |
| Safari 15.4+ (iOS & macOS) | ✅ Full |
| Firefox 90+ | ✅ Full |
| Samsung Internet 14+ | ✅ Full |

The app uses `dvh` units, `backdrop-filter`, and CSS custom properties — all broadly supported in modern browsers. Canvas-based weight detection requires no special permissions.

---

## License

MIT — use freely for personal or commercial projects. Fonts are served from Google Fonts and subject to their respective licenses (mostly SIL Open Font License).
