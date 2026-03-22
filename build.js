// build.js — Smashdown World
// Reads .md files from /content, builds into /dist using /templates/page.html
// Run locally: node build.js

const fs   = require('fs');
const path = require('path');

if (!fs.existsSync('./dist')) fs.mkdirSync('./dist');

const template = fs.readFileSync('./templates/page.html', 'utf8');

// ── Parse frontmatter + named sections ───────────────────────────────────────
function parseFile(raw) {
  const data  = {};
  const lines = raw.split('\n');
  let i       = 0;

  if (lines[0].trim() === '---') {
    i = 1;
    while (i < lines.length && lines[i].trim() !== '---') {
      const [key, ...rest] = lines[i].split(':');
      if (key && rest.length) data[key.trim()] = rest.join(':').trim();
      i++;
    }
    i++;
  }

  let section = null;
  const sections = {};
  for (; i < lines.length; i++) {
    const m = lines[i].match(/^##\s+(.+)/);
    if (m) {
      section = m[1].trim().toLowerCase();
      sections[section] = [];
    } else if (section !== null) {
      sections[section].push(lines[i]);
    }
  }

  for (const [k, v] of Object.entries(sections)) {
    data[k] = v.join('\n').trim();
  }
  return data;
}

// ── Render blockquote section ─────────────────────────────────────────────────
function renderQuote(raw) {
  if (!raw) return '';
  const lines      = raw.split('\n');
  const quoteLines = lines
    .filter(l => l.startsWith('>'))
    .map(l => l.replace(/^>\s?/, '').trim())
    .filter(l => l && !l.match(/^[—–-]/));
  const attrLine = lines
    .map(l => l.replace(/^>\s?/, '').trim())
    .find(l => l.match(/^[—–-]/));
  return `<blockquote>${quoteLines.join('<br>')}</blockquote>
      ${attrLine ? `<p class="attr">${attrLine}</p>` : ''}`;
}

// ── Render plain paragraph(s) ─────────────────────────────────────────────────
function renderParagraph(raw) {
  if (!raw) return '';
  return raw
    .split(/\n\n+/)
    .map(p => `<p>${p.replace(/\n/g, ' ').trim()}</p>`)
    .join('\n      ');
}

// ── Render listening section → record player widget ───────────────────────────
function renderListening(raw) {
  if (!raw) return '';
  let artist = '', track = '', youtube = '#';
  for (const line of raw.split('\n')) {
    const [k, ...v] = line.split(':');
    if (!k || !v.length) continue;
    const key = k.trim().toLowerCase(), val = v.join(':').trim();
    if (key === 'artist')  artist  = val;
    if (key === 'track')   track   = val;
    if (key === 'youtube') youtube = val;
  }
  return `<div class="song-card">
        <a class="turntable" href="${youtube}" target="_blank" rel="noopener" title="Watch on YouTube">
          <div class="tt-deck">
            <svg width="86" height="60" viewBox="0 0 86 60" style="display:block;overflow:visible">
              <circle cx="33" cy="30" r="26" fill="#111010" stroke="#222120" stroke-width="0.4"/>
              <circle cx="33" cy="30" r="25" fill="#1a1918"/>
              <circle cx="33" cy="30" r="21" fill="#1e1d1c"/>
              <circle cx="33" cy="30" r="24" fill="none" stroke="#252321" stroke-width="0.5"/>
              <circle cx="33" cy="30" r="20" fill="none" stroke="#252321" stroke-width="0.4"/>
              <circle cx="33" cy="30" r="16" fill="none" stroke="#252321" stroke-width="0.35"/>
              <circle cx="33" cy="30" r="12" fill="none" stroke="#252321" stroke-width="0.3"/>
              <circle cx="33" cy="30" r="7" fill="#D14D41" opacity="0.88"/>
              <circle cx="33" cy="30" r="1.4" fill="#100F0F"/>
              <g class="tt-arm">
                <circle cx="78" cy="8" r="3.2" fill="#1e1d1c" stroke="#343331" stroke-width="0.6"/>
                <circle cx="78" cy="8" r="1.2" fill="#403E3C"/>
                <line x1="78" y1="8" x2="60" y2="39" stroke="#282726" stroke-width="1.1" stroke-linecap="round"/>
                <line x1="60" y1="39" x2="57" y2="45" stroke="#343331" stroke-width="2.0" stroke-linecap="round"/>
                <line x1="57" y1="45" x2="56.5" y2="48" stroke="#1e1d1c" stroke-width="0.9" stroke-linecap="round"/>
              </g>
            </svg>
          </div>
          <div class="tt-console">
            <div class="tt-knob"></div>
            <div class="tt-knob k2"></div>
            <div style="flex:1"></div>
            <div class="tt-slider"><div class="tt-thumb"></div></div>
            <div style="flex:1"></div>
            <div class="tt-led"></div>
          </div>
        </a>
        <div class="song-meta">
          <p class="song-label">Currently spinning</p>
          <p class="song-title">${track}</p>
          <p class="song-artist">${artist}</p>
          <p class="song-hint">↑ click to watch on youtube</p>
        </div>
      </div>`;
}

// ── Render reading section → book list ────────────────────────────────────────
function renderReading(raw) {
  if (!raw) return '';
  const lines = raw.split('\n');
  const books = [];
  let current = null;

  for (const line of lines) {
    const titleMatch = line.match(/^###\s+(.+)/);
    if (titleMatch) {
      if (current) books.push(current);
      current = { title: titleMatch[1].trim(), author: '', note: '' };
    } else if (current) {
      const kvMatch = line.match(/^(\w[\w\s]*):\s*(.+)/);
      if (kvMatch && kvMatch[1].trim().toLowerCase() === 'author') {
        current.author = kvMatch[2].trim();
      } else if (line.trim().startsWith('- ')) {
        current.note = line.trim().slice(2).trim();
      }
    }
  }
  if (current) books.push(current);
  if (!books.length) return '';

  return `<div class="book-list">${books.map(b => `
        <div class="book-card">
          <span class="book-title">${b.title}</span>${b.author ? `<span class="book-author">— ${b.author}</span>` : ''}
          ${b.note ? `<p class="book-note">${b.note}</p>` : ''}
        </div>`).join('\n')
  }</div>`;
}

// ── Smart section renderers ───────────────────────────────────────────────────
const SMART = {
  'quote':     renderQuote,
  'listening': renderListening,
  'reading':   renderReading,
};

// ── Build nav dropdown HTML from page list ────────────────────────────────────
// 'now' is the trigger — clicking goes to now.html, hovering reveals all pages.
// Pages are sorted: now first, then alphabetical, excluding index.
function buildNav(files, currentPage) {
  const pages = files
    .map(f => {
      const raw  = fs.readFileSync(`./content/${f}`, 'utf8');
      const data = parseFile(raw);
      return { name: path.basename(f, '.md'), hidden: data.hidden === 'true' };
    })
    .filter(p => p.name !== 'index' && !p.hidden)
    .map(p => p.name);

  // Sort: now first, then alphabetical
  pages.sort((a, b) => {
    if (a === 'now') return -1;
    if (b === 'now') return 1;
    return a.localeCompare(b);
  });

  // Dropdown items — all pages except 'now' (now is the trigger link itself)
  const dropdownItems = pages
    .filter(p => p !== 'now')
    .map(p => `<a href="/${p}.html" class="dropdown-item${currentPage === p ? ' active' : ''}">${p}</a>`)
    .join('\n          ');

  const nowActive = currentPage === 'now' ? ' active' : '';

  // If only one page (now), no dropdown needed
  if (pages.length <= 1 || dropdownItems === '') {
    return `<a href="/now.html" class="nav-link${nowActive}">now</a>`;
  }

  return `<div class="nav-dropdown">
        <a href="/now.html" class="nav-link${nowActive}">now</a><button class="nav-chevron-btn" aria-label="more pages"><span class="nav-chevron">›</span></button>
        <div class="dropdown-menu">
          ${dropdownItems}
        </div>
      </div>`;
}

// ── Build a single content page ───────────────────────────────────────────────
function buildPage(filename, allFiles) {
  const raw      = fs.readFileSync(`./content/${filename}`, 'utf8');
  const data     = parseFile(raw);
  const pageName = path.basename(filename, '.md');

  // Collect sections in document order
  const lines   = raw.split('\n');
  const ordered = [];
  let inFront   = false;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '---') { inFront = !inFront; continue; }
    if (inFront) continue;
    const m = lines[i].match(/^##\s+(.+)/);
    if (m) ordered.push(m[1].trim().toLowerCase());
  }

  // Build section HTML
  let sectionsHtml = '';
  for (const key of ordered) {
    const raw = data[key];
    if (!raw) continue;
    const renderer = SMART[key] || renderParagraph;
    const content  = renderer(raw);
    if (!content) continue;
    if (sectionsHtml) sectionsHtml += '\n    <hr>\n';
    sectionsHtml += `
    <section>
      <h2>${key}</h2>
      ${content}
    </section>`;
  }

  let html = template;
  html = html.replaceAll('{{title}}',    data.title   || pageName);
  html = html.replaceAll('{{page}}',     pageName);
  html = html.replaceAll('{{updated}}',  data.updated || '');
  html = html.replace('{{sections}}',   sectionsHtml);
  html = html.replace('{{nav}}',        buildNav(allFiles, pageName));

  const outName = `${pageName}.html`;
  fs.writeFileSync(`./dist/${outName}`, html);
  console.log(`✓ built ${outName}`);
}

// ── Build all pages ───────────────────────────────────────────────────────────
const files = fs.readdirSync('./content').filter(f => f.endsWith('.md'));
files.forEach(f => buildPage(f, files));
console.log(`\n✓ done — ${files.length} page(s) built into /dist`);

// ── Build index.html ──────────────────────────────────────────────────────────
function buildIndex(allFiles) {
  const tmpl    = fs.readFileSync('./templates/index.html', 'utf8');
  const updated = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Build nav links for index (no active state)
  const pages = allFiles
    .map(f => {
      const raw  = fs.readFileSync(`./content/${f}`, 'utf8');
      const data = parseFile(raw);
      return { name: path.basename(f, '.md'), hidden: data.hidden === 'true' };
    })
    .filter(p => p.name !== 'index' && !p.hidden)
    .map(p => p.name)
    .sort((a, b) => {
      if (a === 'now') return -1;
      if (b === 'now') return 1;
      return a.localeCompare(b);
    });

  const dropdownItems = pages
    .filter(p => p !== 'now')
    .map(p => `<a href="/${p}.html" class="dropdown-item">${p}</a>`)
    .join('\n          ');

  let navHtml;
  if (pages.length <= 1 || dropdownItems === '') {
    navHtml = `<a class="nav-link" href="/now.html">now</a>`;
  } else {
    navHtml = `<div class="nav-dropdown">
        <a href="/now.html" class="nav-link">now</a><button class="nav-chevron-btn" aria-label="more pages"><span class="nav-chevron">›</span></button>
        <div class="dropdown-menu">
          ${dropdownItems}
        </div>
      </div>`;
  }

  let html = tmpl
    .replaceAll('{{updated}}', updated)
    .replace('{{nav}}', navHtml);

  fs.writeFileSync('./dist/index.html', html);
  console.log('✓ built index.html');
}

buildIndex(files);
