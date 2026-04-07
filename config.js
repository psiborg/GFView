/* ============================================================
   GFView — config.js
   Edit font categories, the font list, and default sample
   text here. No changes to app.js are needed.
   ============================================================ */

// -- Font Categories ------------------------------------------
// Each entry appears as a filter pill above the font selectors.
// The 'all' entry is required; add new categories here and tag
// fonts in FONT_DATA with the matching id.
const CATEGORIES = [
  { id: 'all',    label: 'All' },
  { id: 'serif',  label: 'Serif' },
  { id: 'sans',   label: 'Sans Serif' },
  { id: 'script', label: 'Calligraphy / Script' },
  { id: 'tech',   label: 'Technology' },
];

// -- Font List ------------------------------------------------
// Add or remove fonts here. Each entry must have:
//   name  — exact Google Fonts family name (used in the API URL)
//   cat   — one of the category ids defined in CATEGORIES above
const FONT_DATA = [
  // -- Calligraphy / Script -----------------------------------
  { name: 'Allura',                  cat: 'script' },
  { name: 'Birthstone',              cat: 'script' },
  { name: 'Birthstone Bounce',       cat: 'script' },
  { name: 'Carattere',               cat: 'script' },
  { name: 'Caveat',                  cat: 'script' },
  { name: 'Corinthia',               cat: 'script' },
  { name: 'Grape Nuts',              cat: 'script' },
  { name: 'Grey Qo',                 cat: 'script' },
  { name: 'Jim Nightshade',          cat: 'script' },
  { name: 'Kaushan Script',          cat: 'script' },
  { name: 'Licorice',                cat: 'script' },
  { name: 'Qwitcher Grypen',         cat: 'script' },
  { name: 'Rouge Script',            cat: 'script' },
  { name: 'Ruthie',                  cat: 'script' },
  { name: 'Splash',                  cat: 'script' },
  { name: 'Sriracha',                cat: 'script' },
  { name: 'Vujahday Script',         cat: 'script' },
  { name: 'Waterfall',               cat: 'script' },
  { name: 'Water Brush',             cat: 'script' },
  // -- Serif --------------------------------------------------
  { name: 'IBM Plex Serif',          cat: 'serif' },
  { name: 'Kelly Slab',              cat: 'serif' },
  { name: 'Noto Serif',              cat: 'serif' },
  { name: 'Roboto Slab',             cat: 'serif' },
  // -- Sans Serif ---------------------------------------------
  { name: 'Exo',                     cat: 'sans' },
  { name: 'Exo 2',                   cat: 'sans' },
  { name: 'Google Sans',             cat: 'sans' },
  { name: 'IBM Plex Sans',           cat: 'sans' },
  { name: 'IBM Plex Sans Condensed', cat: 'sans' },
  { name: 'Noto Sans',               cat: 'sans' },
  { name: 'Noto Sans HK',            cat: 'sans' },
  { name: 'Noto Sans JP',            cat: 'sans' },
  { name: 'Noto Sans SC',            cat: 'sans' },
  { name: 'Noto Sans TC',            cat: 'sans' },
  { name: 'Open Sans',               cat: 'sans' },
  { name: 'Passero One',             cat: 'sans' },
  { name: 'Rajdhani',                cat: 'sans' },
  { name: 'Roboto',                  cat: 'sans' },
  { name: 'Roboto Condensed',        cat: 'sans' },
  { name: 'Saira',                   cat: 'sans' },
  { name: 'Source Sans 3',           cat: 'sans' },
  // -- Technology ---------------------------------------------
  { name: 'Anonymous Pro',           cat: 'tech' },
  { name: 'Black Ops One',           cat: 'tech' },
  { name: 'Bruno Ace',               cat: 'tech' },
  { name: 'Bungee',                  cat: 'tech' },
  { name: 'Bungee Outline',          cat: 'tech' },
  { name: 'Contrail One',            cat: 'tech' },
  { name: 'DM Mono',                 cat: 'tech' },
  { name: 'Fira Code',               cat: 'tech' },
  { name: 'Fira Mono',               cat: 'tech' },
  { name: 'IBM Plex Mono',           cat: 'tech' },
  { name: 'JetBrains Mono',          cat: 'tech' },
  { name: 'Keania One',              cat: 'tech' },
  { name: 'Nanum Gothic Coding',     cat: 'tech' },
  { name: 'Noto Sans Mono',          cat: 'tech' },
  { name: 'Orbitron',                cat: 'tech' },
  { name: 'Overpass Mono',           cat: 'tech' },
  { name: 'Roboto Mono',             cat: 'tech' },
  { name: 'Saira Stencil One',       cat: 'tech' },
  { name: 'Share',                   cat: 'tech' },
  { name: 'Share Tech Mono',         cat: 'tech' },
  { name: 'Source Code Pro',         cat: 'tech' },
  { name: 'Tourney',                 cat: 'tech' },
  { name: 'Ubuntu Mono',             cat: 'tech' },
];

// -- Default Sample Content -----------------------------------
// Supports Markdown: ## headings, **bold**, *italic*, > blockquote,
// - lists, `code`, [links](url), --- horizontal rule.

const DEFAULT_HEADLINE = 'The Quick Brown Fox Jumps Over the Lazy Dog';

const DEFAULT_BODY = `Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed. The arrangement of type involves selecting typefaces, point sizes, line lengths, line spacing, letter spacing, and adjusting the space between pairs of letters.

The term typography is also applied to the style, arrangement, and appearance of the letters, numbers, and symbols created by the process. Type design is a closely related craft, sometimes considered part of typography; most typographers do not design typefaces, and some type designers do not consider themselves typographers.

> "Good typography is invisible. Bad typography is everywhere."

## Choosing the Right Typeface

A well-chosen typeface sets the tone and personality of your content. Serif fonts convey **tradition and authority**, while sans-serif typefaces feel *modern and approachable*. Script and display fonts inject personality and emotion — but are best reserved for headlines and short bursts of text where they can truly shine.

Pairing fonts is both a science and an art. The key is contrast: pair a decorative headline face with a neutral, highly-readable body font. Avoid pairing two typefaces that are too similar — they'll compete rather than complement.

## Readability at Every Scale

A font that looks stunning at 72pt may become illegible at 12pt. Optical sizing, x-height, letter spacing, and stroke contrast all affect readability. Monospaced fonts — designed for code — bring a technical, precise character to body text when used intentionally.

Handwritten and calligraphic faces evoke warmth and humanity. They whisper rather than shout, and excel in contexts where a personal, artisanal quality is desired. Meanwhile, geometric sans-serif fonts feel futuristic and confident — perfect for technology, architecture, and forward-looking brands.

Experiment freely. The best typographic choices come from **curiosity, iteration**, and a willingness to break the rules thoughtfully.`;
