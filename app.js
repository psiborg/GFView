/* ============================================================
   GFView — app.js
   Font list, categories, and default sample text live in
   config.js — edit that file to customise the app content.
   ============================================================ */

'use strict';

// FONTS is derived from FONT_DATA (defined in config.js) at runtime.
const FONTS = [...FONT_DATA].sort((a, b) => a.name.localeCompare(b.name)).map(f => f.name);

function getFontsForCategory(catId) {
  if (catId === 'all') return FONTS;
  return FONT_DATA
    .filter(f => f.cat === catId)
    .map(f => f.name)
    .sort((a, b) => a.localeCompare(b));
}

// -- Lightweight Markdown → HTML parser ----------------------
function parseMarkdown(md) {
  if (!md || !md.trim()) return '';

  // Escape HTML entities first (basic safety, not a sanitiser)
  const esc = s => s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const lines = md.split('\n');
  const out = [];
  let i = 0;

  // Inline formatting applied to a text string
  function inlineFormat(text) {
    return text
      // Code spans (before bold/italic to protect content)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Bold+italic
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Bold (underscore)
      .replace(/__(.+?)__/g, '<strong>$1</strong>')
      // Italic (underscore)
      .replace(/_(.+?)_/g, '<em>$1</em>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  }

  while (i < lines.length) {
    const line = lines[i];

    // Blank line
    if (line.trim() === '') { i++; continue; }

    // Headings
    const h3 = line.match(/^### (.+)/);
    const h2 = line.match(/^## (.+)/);
    const h1 = line.match(/^# (.+)/);
    if (h1) { out.push(`<h2>${inlineFormat(esc(h1[1]))}</h2>`); i++; continue; }
    if (h2) { out.push(`<h2>${inlineFormat(esc(h2[1]))}</h2>`); i++; continue; }
    if (h3) { out.push(`<h3>${inlineFormat(esc(h3[1]))}</h3>`); i++; continue; }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) { out.push('<hr>'); i++; continue; }

    // Blockquote — collect consecutive > lines
    if (line.startsWith('>')) {
      const bqLines = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        bqLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      out.push(`<blockquote>${inlineFormat(esc(bqLines.join(' ')))}</blockquote>`);
      continue;
    }

    // Fenced code block
    if (line.startsWith('```')) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(esc(lines[i]));
        i++;
      }
      i++; // skip closing ```
      out.push(`<pre><code>${codeLines.join('\n')}</code></pre>`);
      continue;
    }

    // Unordered list — collect consecutive list items
    if (/^[-*+] /.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*+] /.test(lines[i])) {
        items.push(`<li>${inlineFormat(esc(lines[i].replace(/^[-*+] /, '')))}</li>`);
        i++;
      }
      out.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    // Ordered list
    if (/^\d+\. /.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(`<li>${inlineFormat(esc(lines[i].replace(/^\d+\. /, '')))}</li>`);
        i++;
      }
      out.push(`<ol>${items.join('')}</ol>`);
      continue;
    }

    // Paragraph — collect until blank line or block element
    const paraLines = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^(#{1,6} |>|```|[-*+] |\d+\. |---)/.test(lines[i])
    ) {
      paraLines.push(inlineFormat(esc(lines[i])));
      i++;
    }
    if (paraLines.length) out.push(`<p>${paraLines.join(' ')}</p>`);
  }

  return out.join('\n');
}

// -- Google Fonts URL helper ----------------------------------
function toGoogleFontFamily(name) {
  return name.replace(/ /g, '+');
}

// -- Unit conversion -----------------------------------------
// 1pt = 1.333...px (96dpi screen standard: 96/72)
const PT_TO_PX = 96 / 72;
const PX_TO_PT = 72 / 96;

function pxToDisplay(px, unit) {
  if (unit === 'pt') return Math.round(px * PX_TO_PT);
  return Math.round(px);
}
function displayToPx(val, unit) {
  if (unit === 'pt') return Math.round(val * PT_TO_PX);
  return Math.round(val);
}
function formatSize(px, unit) {
  return unit === 'pt' ? `${pxToDisplay(px, 'pt')}pt` : `${Math.round(px)}px`;
}

// Slider ranges — pt is the canonical definition; px values are rounded conversions.
// Headline: default 28pt (37px), range 16–60pt (21–80px)
// Body:     default 12pt (16px), range  6–24pt  (8–32px)
// Step is always 1 in both units.
const SLIDER_RANGES = {
  headline: {
    pt: { min: 16, max: 60, step: 1, default: 28 },
    px: { min: Math.round(16 * PT_TO_PX), max: Math.round(60 * PT_TO_PX), step: 1, default: Math.round(28 * PT_TO_PX) },
  },
  body: {
    pt: { min:  6, max: 24, step: 1, default: 12 },
    px: { min: Math.round( 6 * PT_TO_PX), max: Math.round(24 * PT_TO_PX), step: 1, default: Math.round(12 * PT_TO_PX) },
  },
};

// -- State ---------------------------------------------------
const state = {
  theme: 'dark',
  headlineFont: 'Roboto Slab',
  bodyFont: 'Source Sans 3',
  headlineSize: SLIDER_RANGES.headline.px.default, // stored in px; matches 28pt
  bodySize:     SLIDER_RANGES.body.px.default,     // stored in px; matches 12pt
  sizeUnit: 'px',     // 'px' | 'pt'
  loadedFonts: new Set(),
  headlineCat: 'all',
  bodyCat: 'all',
  headlineText: DEFAULT_HEADLINE,
  bodyText: DEFAULT_BODY,
};

// -- DOM Refs ------------------------------------------------
const $ = id => document.getElementById(id);
const menuBtn          = $('menu-btn');
const dropdown         = $('dropdown');
const themeToggleBtn   = $('theme-toggle');
const aboutBtn         = $('about-btn');
const aboutOverlay     = $('about-overlay');
const aboutClose       = $('about-close');
const aboutCloseBtn    = $('about-close-btn');
const settingsBtn      = $('settings-btn');
const settingsOverlay  = $('settings-overlay');
const settingsClose    = $('settings-close');
const settingsCancel   = $('settings-cancel');
const settingsApply    = $('settings-apply');
const settingsReset    = $('settings-reset');
const settingsHeadline = $('settings-headline');
const settingsBody     = $('settings-body');
const unitPxBtn        = $('unit-px');
const unitPtBtn        = $('unit-pt');
const unitDesc         = $('unit-desc');
const headlineSelect   = $('headline-select');
const bodySelect       = $('body-select');
const headlineBadge    = $('headline-badge');
const bodyBadge        = $('body-badge');
const headlineEl       = $('sample-headline');
const bodyEl           = $('sample-body');
const hlSizeRange      = $('hl-size');
const bdSizeRange      = $('bd-size');
const hlSizeDisplay    = $('hl-size-display');
const bdSizeDisplay    = $('bd-size-display');
const sidebarToggle    = $('sidebar-toggle');
const sidebar          = $('sidebar');
const sidebarOverlay   = $('sidebar-overlay');
const specimenOverlay  = $('specimen-overlay');
const specimenClose    = $('specimen-close');
const specimenTitle    = $('specimen-title');
const specimenOpenLink = $('specimen-open-link');
const specimenLoading  = $('specimen-loading');
const specimenCard     = $('specimen-card');
const specimenMeta     = $('specimen-meta');
const specimenPangrams = $('specimen-pangrams');
const specimenGlyphs   = $('specimen-glyphs');
const specimenStyles   = $('specimen-styles');
const specimenDownload = $('specimen-download');
const specimenPageLink = $('specimen-page-link');

// -- Font Loading --------------------------------------------
function loadFont(name) {
  if (state.loadedFonts.has(name)) return Promise.resolve();
  return new Promise(resolve => {
    const url = `https://fonts.googleapis.com/css2?family=${toGoogleFontFamily(name)}:wght@400;700&display=swap`;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.onload = () => { state.loadedFonts.add(name); resolve(); };
    link.onerror = () => resolve();
    document.head.appendChild(link);
  });
}

async function preloadInitialFonts() {
  await Promise.all(['Roboto Slab', 'Source Sans 3', 'Orbitron', 'Caveat'].map(loadFont));
}

// -- Sample Content -------------------------------------------
function renderHeadline(md) {
  // For the headline we just strip block-level markdown and render inline only
  const stripped = md
    .replace(/^#+\s+/gm, '')   // remove heading markers
    .replace(/\n+/g, ' ')       // collapse newlines
    .trim();
  // Apply inline formatting using a minimal pass
  headlineEl.innerHTML = stripped
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

function renderBody(md) {
  bodyEl.innerHTML = parseMarkdown(md);
}

// -- Settings Dialog ------------------------------------------
function openSettings() {
  closeMenu();
  settingsHeadline.value = state.headlineText;
  settingsBody.value = state.bodyText;
  // Sync unit toggle to current state
  setUnit(state.sizeUnit);
  settingsOverlay.classList.add('open');
  setTimeout(() => settingsHeadline.focus(), 80);
}

function closeSettings() {
  settingsOverlay.classList.remove('open');
}

function applySettings() {
  // Apply unit first so size controls update correctly
  const selectedUnit = document.querySelector('.unit-btn.active')?.dataset.unit || 'px';
  if (selectedUnit !== state.sizeUnit) setUnit(selectedUnit);

  state.headlineText = settingsHeadline.value.trim() || DEFAULT_HEADLINE;
  state.bodyText = settingsBody.value.trim() || DEFAULT_BODY;
  renderHeadline(state.headlineText);
  renderBody(state.bodyText);
  headlineEl.style.fontFamily = `'${state.headlineFont}', serif`;
  bodyEl.style.fontFamily = `'${state.bodyFont}', sans-serif`;
  persistSettings();
  closeSettings();
}

function resetSettings() {
  settingsHeadline.value = DEFAULT_HEADLINE;
  settingsBody.value = DEFAULT_BODY;
  setUnit('px');
  // Reset sizes to defaults for px unit
  state.headlineSize = SLIDER_RANGES.headline.px.default;
  state.bodySize     = SLIDER_RANGES.body.px.default;
  updateSizeControls();
  document.documentElement.style.setProperty('--headline-size', `${state.headlineSize}px`);
  document.documentElement.style.setProperty('--body-size', `${state.bodySize}px`);
}

// -- Filter Pills ---------------------------------------------
function buildFilterPills(containerId, which) {
  const container = $(containerId);
  if (!container) return;
  container.innerHTML = '';
  CATEGORIES.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-pill' + (cat.id === 'all' ? ' active' : '');
    btn.dataset.cat = cat.id;
    btn.textContent = cat.label;
    btn.setAttribute('aria-pressed', cat.id === 'all' ? 'true' : 'false');
    btn.addEventListener('click', () => applyFilter(which, cat.id, containerId));
    container.appendChild(btn);
  });
}

function applyFilter(which, catId, containerId) {
  $(containerId).querySelectorAll('.filter-pill').forEach(btn => {
    const active = btn.dataset.cat === catId;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
  const fonts = getFontsForCategory(catId);
  if (which === 'headline') {
    state.headlineCat = catId;
    repopulateSelect(headlineSelect, fonts, state.headlineFont);
    applyHeadlineFont(headlineSelect.value);
  } else {
    state.bodyCat = catId;
    repopulateSelect(bodySelect, fonts, state.bodyFont);
    applyBodyFont(bodySelect.value);
  }
}

// -- Populate Selects ----------------------------------------
function repopulateSelect(select, fonts, currentFont) {
  select.innerHTML = '';
  let matched = false;
  fonts.forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    if (name === currentFont) { opt.selected = true; matched = true; }
    select.appendChild(opt);
  });
  if (!matched && fonts.length > 0) select.selectedIndex = 0;
}

function populateSelects() {
  repopulateSelect(headlineSelect, FONTS, state.headlineFont);
  repopulateSelect(bodySelect, FONTS, state.bodyFont);
}

// -- Badge update helper --------------------------------------
function updateBadge(badgeEl, name) {
  const nameSpan = badgeEl.querySelector('.badge-name');
  if (nameSpan) nameSpan.textContent = name;
  badgeEl.style.fontFamily = `'${name}', serif`;
  badgeEl.setAttribute('aria-label', `Open ${name} on Google Fonts`);
}

// -- Apply Font ----------------------------------------------
async function applyHeadlineFont(name) {
  if (!name) return;
  state.headlineFont = name;
  updateBadge(headlineBadge, name);
  await loadFont(name);
  headlineEl.style.fontFamily = `'${name}', serif`;
}

async function applyBodyFont(name) {
  if (!name) return;
  state.bodyFont = name;
  updateBadge(bodyBadge, name);
  await loadFont(name);
  bodyEl.style.fontFamily = `'${name}', sans-serif`;
}

// -- Specimen Dialog ------------------------------------------

// Category label lookup
const CAT_LABELS = {
  serif:  'Serif',
  sans:   'Sans Serif',
  script: 'Calligraphy / Script',
  tech:   'Technology',
};

// Weights we'll attempt to show (label → CSS font-weight value)
const STYLE_WEIGHTS = [
  { label: 'Thin',        weight: 100 },
  { label: 'Light',       weight: 300 },
  { label: 'Regular',     weight: 400 },
  { label: 'Medium',      weight: 500 },
  { label: 'SemiBold',    weight: 600 },
  { label: 'Bold',        weight: 700 },
  { label: 'ExtraBold',   weight: 800 },
  { label: 'Black',       weight: 900 },
];

const PANGRAM = 'The quick brown fox jumps over the lazy dog';

// Google Fonts API: load a font with a broad weight axis and detect which weights rendered
async function loadFontAllWeights(name) {
  const family = name.replace(/ /g, '+');
  // Request full variable weight range; falls back gracefully for non-variable fonts
  const url = `https://fonts.googleapis.com/css2?family=${family}:wght@100;200;300;400;500;600;700;800;900&display=swap`;
  return new Promise(resolve => {
    const existing = document.querySelector(`link[data-specimen="${name}"]`);
    if (existing) { resolve(); return; }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.dataset.specimen = name;
    link.onload = resolve;
    link.onerror = resolve;
    document.head.appendChild(link);
  });
}

// Detect which weights actually differ from regular (cheap visual diff via Canvas)
function detectAvailableWeights(name) {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200; canvas.height = 30;
    const ctx = canvas.getContext('2d');
    const test = 'Hamburgefonstiv';

    ctx.font = `400 16px '${name}', serif`;
    const ref = canvas.toDataURL();

    return STYLE_WEIGHTS.filter(({ weight }) => {
      if (weight === 400) return true;
      ctx.clearRect(0, 0, 200, 30);
      ctx.font = `${weight} 16px '${name}', serif`;
      ctx.fillText(test, 0, 20);
      const candidate = canvas.toDataURL();
      // If canvas output differs, the weight exists
      return candidate !== ref;
    });
  } catch {
    // Canvas blocked (unlikely) — just return regular + bold
    return STYLE_WEIGHTS.filter(w => w.weight === 400 || w.weight === 700);
  }
}

async function openSpecimen(name) {
  const fontData = FONT_DATA.find(f => f.name === name);
  const cat = fontData ? fontData.cat : 'sans';
  const specimenUrl = `https://fonts.google.com/specimen/${name.replace(/ /g, '+')}`;
  const downloadUrl = `https://fonts.google.com/download?family=${encodeURIComponent(name)}`;

  // Update header
  specimenTitle.textContent = name;
  specimenOpenLink.href = specimenUrl;
  specimenPageLink.href = specimenUrl;
  specimenDownload.href = downloadUrl;

  // Show loading, hide card
  specimenLoading.style.display = 'flex';
  specimenCard.hidden = true;
  specimenOverlay.classList.add('open');

  // Load all weights
  await loadFontAllWeights(name);
  // Small settle delay for font metrics to stabilise
  await new Promise(r => setTimeout(r, 120));

  const availableWeights = detectAvailableWeights(name);

  // -- Meta chip ----------------------------------------------
  specimenMeta.innerHTML = `
    <span class="specimen-cat-chip">${CAT_LABELS[cat] || 'Display'}</span>
    <span class="specimen-weight-count">${availableWeights.length} style${availableWeights.length !== 1 ? 's' : ''} available</span>
  `;

  // -- Pangrams at 3 sizes ------------------------------------
  const pangramSizes = [
    { size: '2.2rem',  label: 'Display' },
    { size: '1.25rem', label: 'Subheading' },
    { size: '0.95rem', label: 'Body' },
  ];
  specimenPangrams.innerHTML = pangramSizes.map(({ size, label }) => `
    <div class="specimen-pangram-row">
      <span class="specimen-pangram-label">${label}</span>
      <span class="specimen-pangram-text" style="font-family:'${name}',serif;font-size:${size}">${PANGRAM}</span>
    </div>
  `).join('');

  // -- Glyphs in this font ------------------------------------
  specimenGlyphs.style.fontFamily = `'${name}', serif`;

  // -- Styles grid --------------------------------------------
  specimenStyles.innerHTML = availableWeights.map(({ label, weight }) => `
    <div class="specimen-style-item">
      <span class="specimen-style-name">${label} ${weight}</span>
      <span class="specimen-style-preview" style="font-family:'${name}',serif;font-weight:${weight}">Aa</span>
    </div>
  `).join('');

  // Reveal card
  specimenLoading.style.display = 'none';
  specimenCard.hidden = false;
}

function closeSpecimen() {
  specimenOverlay.classList.remove('open');
}

// -- Size Controls -------------------------------------------
// Update the slider attributes and display label for current unit
function updateSizeControls() {
  const unit = state.sizeUnit;

  const hlRange = SLIDER_RANGES.headline[unit];
  hlSizeRange.min   = hlRange.min;
  hlSizeRange.max   = hlRange.max;
  hlSizeRange.step  = hlRange.step;
  hlSizeRange.value = pxToDisplay(state.headlineSize, unit);
  hlSizeDisplay.textContent = formatSize(state.headlineSize, unit);

  const bdRange = SLIDER_RANGES.body[unit];
  bdSizeRange.min   = bdRange.min;
  bdSizeRange.max   = bdRange.max;
  bdSizeRange.step  = bdRange.step;
  bdSizeRange.value = pxToDisplay(state.bodySize, unit);
  bdSizeDisplay.textContent = formatSize(state.bodySize, unit);
}

function applyHeadlineSize(displayVal) {
  const px = displayToPx(parseFloat(displayVal), state.sizeUnit);
  state.headlineSize = px;
  hlSizeDisplay.textContent = formatSize(px, state.sizeUnit);
  document.documentElement.style.setProperty('--headline-size', `${px}px`);
}

function applyBodySize(displayVal) {
  const px = displayToPx(parseFloat(displayVal), state.sizeUnit);
  state.bodySize = px;
  bdSizeDisplay.textContent = formatSize(px, state.sizeUnit);
  document.documentElement.style.setProperty('--body-size', `${px}px`);
}

// -- Unit toggle ---------------------------------------------
const UNIT_DESCRIPTIONS = {
  px: 'Sizes displayed in <strong>pixels (px)</strong> — standard screen unit.',
  pt: 'Sizes displayed in <strong>points (pt)</strong> — traditional print unit. 1pt ≈ 1.33px.',
};

function setUnit(unit) {
  state.sizeUnit = unit;

  // Update toggle button states
  [unitPxBtn, unitPtBtn].forEach(btn => {
    const active = btn.dataset.unit === unit;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });

  // Update description
  if (unitDesc) unitDesc.innerHTML = UNIT_DESCRIPTIONS[unit];

  // Refresh slider ranges and displayed values without changing actual px sizes
  updateSizeControls();
}

// -- Persistence (localStorage) -------------------------------
const STORAGE_KEY = 'gfview_settings';

function persistSettings() {
  try {
    const data = {
      fontsize_unit: state.sizeUnit,
      headline: state.headlineText,
      body: state.bodyText,
      ui: {
        theme: state.theme,
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Private browsing or storage quota — fail silently
  }
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);

    if (data.fontsize_unit === 'px' || data.fontsize_unit === 'pt') {
      state.sizeUnit = data.fontsize_unit;
    }
    if (typeof data.headline === 'string' && data.headline.trim()) {
      state.headlineText = data.headline;
    }
    if (typeof data.body === 'string' && data.body.trim()) {
      state.bodyText = data.body;
    }
    if (data.ui?.theme === 'light' || data.ui?.theme === 'dark') {
      state.theme = data.ui.theme;
    }
  } catch {
    // Corrupted JSON or access denied — ignore and use defaults
  }
}

// -- Theme ---------------------------------------------------
function setTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme === 'light' ? 'light' : '');
  const icon = themeToggleBtn.querySelector('.theme-icon');
  if (icon) {
    icon.innerHTML = theme === 'light'
      ? `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`
      : `<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>`;
  }
  const label = $('theme-label');
  if (label) label.textContent = theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode';
}

function toggleTheme() {
  setTheme(state.theme === 'dark' ? 'light' : 'dark');
  persistSettings();
  closeMenu();
}

// -- Menu ----------------------------------------------------
function closeMenu() { dropdown.classList.remove('open'); }
function toggleMenu() { dropdown.classList.toggle('open'); }

// -- Sidebar (mobile) ----------------------------------------
function openSidebar() { sidebar.classList.add('open'); sidebarOverlay.classList.add('open'); }
function closeSidebar() { sidebar.classList.remove('open'); sidebarOverlay.classList.remove('open'); }

// -- Event Listeners -----------------------------------------
function bindEvents() {
  // Specimen dialog — badge buttons
  headlineBadge.addEventListener('click', () => openSpecimen(state.headlineFont));
  bodyBadge.addEventListener('click',     () => openSpecimen(state.bodyFont));
  specimenClose.addEventListener('click', closeSpecimen);
  specimenOverlay.addEventListener('click', e => {
    if (e.target === specimenOverlay) closeSpecimen();
  });

  menuBtn.addEventListener('click', e => { e.stopPropagation(); toggleMenu(); });
  document.addEventListener('click', e => {
    if (!dropdown.contains(e.target) && e.target !== menuBtn) closeMenu();
  });

  // Unit toggle (live preview in Settings)
  unitPxBtn.addEventListener('click', () => setUnit('px'));
  unitPtBtn.addEventListener('click', () => setUnit('pt'));

  themeToggleBtn.addEventListener('click', toggleTheme);

  // Settings
  settingsBtn.addEventListener('click', openSettings);
  settingsClose.addEventListener('click', closeSettings);
  settingsCancel.addEventListener('click', closeSettings);
  settingsApply.addEventListener('click', applySettings);
  settingsReset.addEventListener('click', resetSettings);
  settingsOverlay.addEventListener('click', e => {
    if (e.target === settingsOverlay) closeSettings();
  });

  // About
  aboutBtn.addEventListener('click', () => { closeMenu(); aboutOverlay.classList.add('open'); });
  aboutClose.addEventListener('click', () => aboutOverlay.classList.remove('open'));
  aboutCloseBtn.addEventListener('click', () => aboutOverlay.classList.remove('open'));
  aboutOverlay.addEventListener('click', e => {
    if (e.target === aboutOverlay) aboutOverlay.classList.remove('open');
  });

  headlineSelect.addEventListener('change', () => applyHeadlineFont(headlineSelect.value));
  bodySelect.addEventListener('change',     () => applyBodyFont(bodySelect.value));
  headlineSelect.addEventListener('keyup',  () => applyHeadlineFont(headlineSelect.value));
  bodySelect.addEventListener('keyup',      () => applyBodyFont(bodySelect.value));

  hlSizeRange.addEventListener('input', () => applyHeadlineSize(hlSizeRange.value));
  bdSizeRange.addEventListener('input', () => applyBodySize(bdSizeRange.value));

  sidebarToggle.addEventListener('click', openSidebar);
  sidebarOverlay.addEventListener('click', closeSidebar);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeMenu();
      closeSidebar();
      aboutOverlay.classList.remove('open');
      closeSpecimen();
      if (document.activeElement !== settingsHeadline && document.activeElement !== settingsBody) {
        closeSettings();
      }
    }
  });
}

// -- Service Worker ------------------------------------------
function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

// -- Init ----------------------------------------------------
async function init() {
  // Restore persisted settings into state before any rendering
  loadSettings();

  populateSelects();
  buildFilterPills('hl-filter-pills', 'headline');
  buildFilterPills('bd-filter-pills', 'body');
  bindEvents();

  // Apply restored theme immediately (avoids flash of wrong theme)
  setTheme(state.theme);

  // Initialise size controls with restored unit
  setUnit(state.sizeUnit);
  document.documentElement.style.setProperty('--headline-size', `${state.headlineSize}px`);
  document.documentElement.style.setProperty('--body-size', `${state.bodySize}px`);

  // Render content (may be custom text from persisted settings)
  renderHeadline(state.headlineText);
  renderBody(state.bodyText);

  await preloadInitialFonts();
  await applyHeadlineFont('Roboto Slab');
  await applyBodyFont('Source Sans 3');

  registerSW();
}

document.addEventListener('DOMContentLoaded', init);
