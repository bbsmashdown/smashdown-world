// build.js — Smashdown World
// Pure markdown files with optional special code fences for widgets.
// Special fences: ```listening, ```reading
// Everything else is standard markdown rendered by marked.
// Run: node build.js

const fs     = require('fs');
const path   = require('path');
const { marked, Renderer } = require('marked');

if (!fs.existsSync('./dist')) fs.mkdirSync('./dist');

// ── Custom marked renderer ────────────────────────────────────────────────────
const renderer = new Renderer();

// External links open in new tab
renderer.link = function({ href, title, tokens }) {
  const text     = this.parser.parseInline(tokens);
  const isExt    = href && (href.startsWith('http://') || href.startsWith('https://'));
  const titleStr = title ? ` title="${title}"` : '';
  const target   = isExt ? ' target="_blank" rel="noopener"' : '';
  return `<a href="${href}"${titleStr}${target}>${text}</a>`;
};

marked.setOptions({ renderer, breaks: true, gfm: true });

// ── Parse frontmatter ─────────────────────────────────────────────────────────
function parseFrontmatter(raw) {
  const data  = {};
  const lines = raw.split('\n');
  let i       = 0;
  let body    = raw;

  if (lines[0].trim() === '---') {
    i = 1;
    while (i < lines.length && lines[i].trim() !== '---') {
      const [key, ...rest] = lines[i].split(':');
      if (key && rest.length) data[key.trim()] = rest.join(':').trim();
      i++;
    }
    body = lines.slice(i + 1).join('\n').trim();
  }
  return { data, body };
}

// ── Render listening widget ───────────────────────────────────────────────────
function renderListening(raw) {
  let artist = '', track = '', album = '', youtube = '#';
  for (const line of raw.split('\n')) {
    const [k, ...v] = line.split(':');
    if (!k || !v.length) continue;
    const key = k.trim().toLowerCase(), val = v.join(':').trim();
    if (key === 'artist')  artist  = val;
    if (key === 'track')   track   = val;
    if (key === 'album')   album   = val;
    if (key === 'youtube') youtube = val;
  }
  return `<div class="song-card">
    <div class="song-top">
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
        <p class="song-artist">${artist}</p>
        <p class="song-title">${track}</p>
        ${album ? `<p class="song-album">${album}</p>` : ''}
      </div>
    </div>
    <div class="song-hint-row">
      <p class="song-hint">↑ click to watch on youtube</p>
    </div>
  </div>`;
}

// ── Render reading list ───────────────────────────────────────────────────────
function renderReading(raw) {
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

// ── Transform accordion list items ───────────────────────────────────────────
// Any <li> whose first element is <strong>Label</strong> — detail text gets
// converted to a click-to-expand accordion item. Works on all ul/ol lists.
// Nested <ul>/<ol> inside the <li> are preserved inside the detail panel.
function applyAccordion(html) {
  // Match <li> items that start with <strong>...</strong> followed by optional em-dash detail
  return html.replace(
    /<li>([\s\S]*?)<\/li>/g,
    (match, inner) => {
      // Must start with <strong>
      const boldMatch = inner.match(/^<strong>([^<]+)<\/strong>([\s\S]*)$/);
      if (!boldMatch) return match;

      const label  = boldMatch[1].trim();
      const rest   = boldMatch[2];

      // Strip leading em-dash separator (— or &mdash; or " - " or " — ")
      const detail = rest.replace(/^\s*(?:—|&mdash;|–|&ndash;|\s-\s)\s*/, '').trim();

      if (!detail) return match; // label only, no detail — leave as-is

      return `<li class="accordion-item">
  <button class="accordion-trigger" aria-expanded="false">
    <span class="accordion-chevron">›</span><span class="accordion-label">${label}</span>
  </button>
  <div class="accordion-detail" hidden>${detail}</div>
</li>`;
    }
  );
}

// ── Process body — replace special fences then pass to marked ────────────────
// We extract ```listening and ```reading blocks, replace with placeholders,
// run marked on everything else, then swap placeholders back in.
function processBody(body) {
  const FENCE = /^```(listening|reading)\n([\s\S]*?)^```/gm;
  const chunks = [];
  let i = 0;

  // Replace special fences with unique placeholders
  const withPlaceholders = body.replace(FENCE, (match, type, content) => {
    const key = `%%WIDGET_${i}%%`;
    if (type === 'listening') chunks[i] = renderListening(content.trim());
    if (type === 'reading')   chunks[i] = renderReading(content.trim());
    i++;
    return key;
  });

  // Run marked on the rest
  let html = marked.parse(withPlaceholders);

  // Swap placeholders back in — marked wraps them in <p> tags, strip those
  chunks.forEach((widget, idx) => {
    html = html.replace(
      new RegExp(`<p>%%WIDGET_${idx}%%<\\/p>`, 'g'),
      widget
    ).replace(
      new RegExp(`%%WIDGET_${idx}%%`, 'g'),
      widget
    );
  });

  // Transform bold-label list items into accordions
  html = applyAccordion(html);

  return html;
}

// ── Build nav dropdown ────────────────────────────────────────────────────────
function buildNav(files, currentPage) {
  const pages = files
    .map(f => {
      const raw  = fs.readFileSync(`./content/${f}`, 'utf8');
      const { data } = parseFrontmatter(raw);
      const name = path.basename(f, '.md');
      return { name, title: data.title || name, hidden: data.hidden === 'true' };
    })
    .filter(p => p.name !== 'index' && !p.hidden)
    .sort((a, b) => {
      if (a.name === 'now') return -1;
      if (b.name === 'now') return 1;
      return a.name.localeCompare(b.name);
    });

  const dropdownItems = pages
    .filter(p => p.name !== 'now')
    .map(p => `<a href="/${p.name}.html" class="dropdown-item${currentPage === p.name ? ' active' : ''}">${p.title.toLowerCase()}</a>`)
    .join('\n          ');

  const nowActive = currentPage === 'now' ? ' active' : '';

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
  const { data, body } = parseFrontmatter(raw);
  const pageName = path.basename(filename, '.md');

  const template = fs.readFileSync('./templates/page.html', 'utf8');
  const content  = processBody(body);

  // Breadcrumb: with parent shows "Parent Title / page", without shows "Smashdown World / page"
  let parentCrumb = '';
  if (data.parent) {
    // Read parent file's title from its frontmatter
    let parentTitle = data.parent;
    try {
      const parentRaw  = fs.readFileSync(`./content/${data.parent}.md`, 'utf8');
      const parentData = parseFrontmatter(parentRaw).data;
      if (parentData.title) parentTitle = parentData.title;
    } catch(e) {}
    parentCrumb = `<a class="bc-home" href="/${data.parent}.html">${parentTitle}</a>`;
  } else {
    parentCrumb = `<a class="bc-home" href="/">Smashdown World</a>`;
  }

  let html = template;
  html = html.replaceAll('{{title}}',        data.title   || pageName);
  html = html.replaceAll('{{page}}',         data.title   || pageName);
  html = html.replaceAll('{{updated}}',      data.updated || '');
  html = html.replace('{{content}}',        content);
  html = html.replace('{{nav}}',            buildNav(allFiles, pageName));
  html = html.replace('{{parent_crumb}}',   parentCrumb);

  const outName = `${pageName}.html`;
  fs.writeFileSync(`./dist/${outName}`, html);
  console.log(`✓ built ${outName}`);
}

// ── Build all content pages ───────────────────────────────────────────────────
const files = fs.readdirSync('./content').filter(f => f.endsWith('.md'));
files.forEach(f => buildPage(f, files));
console.log(`\n✓ done — ${files.length} page(s) built into /dist`);

// ── Build index.html ──────────────────────────────────────────────────────────
function buildIndex(allFiles) {
  const tmpl    = fs.readFileSync('./templates/index.html', 'utf8');
  const updated = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const pages = allFiles
    .map(f => {
      const raw  = fs.readFileSync(`./content/${f}`, 'utf8');
      const { data } = parseFrontmatter(raw);
      const name = path.basename(f, '.md');
      return { name, title: data.title || name, hidden: data.hidden === 'true' };
    })
    .filter(p => p.name !== 'index' && !p.hidden)
    .sort((a, b) => {
      if (a.name === 'now') return -1;
      if (b.name === 'now') return 1;
      return a.name.localeCompare(b.name);
    });

  const dropdownItems = pages
    .filter(p => p.name !== 'now')
    .map(p => `<a href="/${p.name}.html" class="dropdown-item">${p.title.toLowerCase()}</a>`)
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

// ── Copy attachments/ folder into dist/ ───────────────────────────────────────────
// Any file in /attachments gets served at the root URL, e.g. /attachments/report.pdf → /report.pdf
function copyAttachments() {
  const attachmentsDir = './attachments';
  if (!fs.existsSync(attachmentsDir)) return;
  function copyDir(src, dest) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
      const srcPath  = `${src}/${entry.name}`;
      const destPath = `${dest}/${entry.name}`;
      if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
        console.log(`✓ copied ${srcPath} → ${destPath}`);
      }
    }
  }
  copyDir(attachmentsDir, './dist');
}
copyAttachments();
