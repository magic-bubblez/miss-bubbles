// Reads all .md files from content/, parses frontmatter with gray-matter,
// converts body to HTML with marked, generates standalone pages in pages/blog/,
// then rewrites pages/writing.html between the AUTOMATED_BLOGS markers
// and updates sidebar category counts.
//
// Usage:
//   npm install
//   npm run build

'use strict';

const fs   = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');
marked.use({ breaks: true, gfm: true });

// ──── PATHS ─────────────────────────────────────────────────────────────────
const ROOT        = path.join(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content');
const BLOG_DIR    = path.join(ROOT, 'pages', 'blog');
const WRITING_HTML = path.join(ROOT, 'pages', 'writing.html');
const THEME_JS_SRC = path.join(ROOT, 'theme.js');
const CONTENT_IMAGES = path.join(CONTENT_DIR, 'images');
const BLOG_IMAGES    = path.join(BLOG_DIR, 'images');

// ──── CONSTANTS ──────────────────────────────────────────────────────────────
const VALID_CATEGORIES = new Set(['technical', 'essays', 'personal']);
const DEFAULT_CATEGORY = 'technical';

const BLOGS_START_MARKER = '<!-- AUTOMATED_BLOGS_START -->';
const BLOGS_END_MARKER   = '<!-- AUTOMATED_BLOGS_END -->';

// ──── TEMPLATE ───────────────────────────────────────────────────────────────
function postPageHtml({ title, date, category, bodyHtml }) {
  const dateStr = date instanceof Date
    ? date.toISOString().split('T')[0]
    : String(date);

  return `<!DOCTYPE html>
<html lang="en" data-theme="light">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)} · ms. bubbles</title>
  <script src="theme.js"></script>
  <link
    href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
    rel="stylesheet" />
  <style>
    :root {
      --bg: #fff4e0;
      --card: #fff0d8;
      --border: #e8cfa8;
      --border-soft: #f0dfc0;
      --ink: #5a3a1e;
      --ink-soft: #7a5432;
      --muted: #8a704f;
      --rose: #e8a0ae;
      --rose-deep: #d17d93;
      --rose-dark: rgb(186, 91, 107);
      --shadow: 2px 2px 0 rgba(90, 58, 30, 0.10);
    }

    [data-theme="dark"] {
      --bg: #1a1816;
      --card: #231f1c;
      --border: #3d3530;
      --border-soft: #332c27;
      --ink: #e8e0d4;
      --ink-soft: #c8bca8;
      --muted: #8a8078;
      --rose: #e8a0ae;
      --rose-deep: #d17d93;
      --rose-dark: rgb(200, 110, 128);
      --shadow: 2px 2px 0 rgba(0, 0, 0, 0.3);
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      background: var(--bg);
      color: var(--ink);
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 17px;
      line-height: 1.7;
      -webkit-font-smoothing: antialiased;
    }

    a {
      color: var(--rose-dark);
      text-decoration: none;
    }

    a:hover {
      color: var(--ink);
    }

    .wrap {
      max-width: 760px;
      margin: 0 auto;
      padding: 36px 30px 90px;
    }

    /* nav */
    .nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 18px;
      border-bottom: 0px solid var(--border);
      margin-bottom: 48px;
      flex-wrap: wrap;
      gap: 12px;
    }

    .nav-logo {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .nav-logo a {
      font-family: 'Instrument Serif', serif;
      font-style: italic;
      font-size: 28px;
      color: var(--rose-dark);
      letter-spacing: 0.005em;
    }

    .nav-logo a::after {
      content: ' ♡';
      color: var(--rose);
      font-family: system-ui, sans-serif;
      font-style: normal;
      font-size: 15px;
      vertical-align: 3px;
      margin-left: 2px;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 18px;
      font-size: 17px;
    }

    .nav-links a {
      color: var(--muted);
      font-family: 'JetBrains Mono', monospace;
    }

    .nav-links a:hover { color: var(--ink); }
    .nav-links a.on    { color: var(--ink); }

    /* theme toggle */
    .theme-toggle {
      background: none;
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 4px 10px;
      cursor: pointer;
      font-size: 16px;
      color: var(--muted);
      transition: color 0.15s, border-color 0.15s;
      line-height: 1;
    }

    .theme-toggle:hover {
      color: var(--ink);
      border-color: var(--ink-soft);
    }

    .toggle-icon::before {
      content: '\\263E';
    }

    [data-theme="dark"] .toggle-icon::before {
      content: '\\2600';
    }

    /* post */
    .post {
      max-width: 680px;
    }

    .post-meta {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12.5px;
      color: var(--muted);
      margin: 0 0 10px;
    }

    .post-meta .cat {
      color: var(--rose-deep);
    }

    .post-title {
      font-family: 'Instrument Serif', serif;
      font-style: italic;
      font-weight: 400;
      font-size: 48px;
      line-height: 1.1;
      color: var(--ink);
      margin: 0 0 32px;
    }

    /* prose */
    .post-body {
      color: var(--ink-soft);
    }

    .post-body p {
      margin: 0 0 1.3em;
      line-height: 1.8;
    }

    .post-body h2 {
      font-family: 'Instrument Serif', serif;
      font-style: italic;
      font-weight: 400;
      font-size: 28px;
      color: var(--ink);
      margin: 2em 0 0.6em;
    }

    .post-body h3 {
      font-family: 'Instrument Serif', serif;
      font-style: italic;
      font-weight: 400;
      font-size: 22px;
      color: var(--ink);
      margin: 1.6em 0 0.5em;
    }

    .post-body code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      background: var(--card);
      border: 1px solid var(--border-soft);
      border-radius: 4px;
      padding: 1px 5px;
    }

    .post-body pre {
      background: var(--card);
      border: 1px solid var(--border-soft);
      border-radius: 6px;
      padding: 16px 20px;
      overflow-x: auto;
      margin: 0 0 1.3em;
    }

    .post-body pre code {
      background: none;
      border: none;
      padding: 0;
      font-size: 14px;
    }

    .post-body blockquote {
      border-left: 3px solid var(--rose);
      margin: 0 0 1.3em;
      padding: 0 0 0 18px;
      color: var(--muted);
      font-style: italic;
    }

    .post-body ul,
    .post-body ol {
      padding-left: 1.4em;
      margin: 0 0 1.3em;
    }

    .post-body li { margin-bottom: 0.3em; }

    .post-body a {
      color: var(--rose-dark);
      text-decoration: underline;
      text-decoration-color: var(--rose);
    }

    .post-body a:hover { color: var(--ink); }

    .post-body img {
      max-width: 100%;
      border-radius: 6px;
      margin: 1em 0 0.3em;
      display: block;
    }

    .post-body img + em,
    .post-body p:has(img) + p em:only-child {
      display: block;
      font-size: 13.5px;
      color: var(--muted);
      margin: 0 0 1.3em;
      font-style: italic;
    }

    .post-body strong { color: var(--ink); font-weight: 600; }
    .post-body em     { color: var(--ink-soft); }

    /* footer */
    .foot {
      margin-top: 72px;
      padding-top: 22px;
      border-top: 1px solid var(--border);
      text-align: center;
    }

    .socials {
      display: flex;
      justify-content: center;
      gap: 18px;
      margin-bottom: 12px;
    }

    .socials img {
      width: 20px;
      height: 20px;
      opacity: 0.6;
    }

    .socials a:hover img { opacity: 1; }

    [data-theme="dark"] .socials img {
      filter: invert(1) brightness(1.2);
    }

    .copy {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: var(--muted);
    }
  </style>
</head>

<body>
  <div class="wrap">

    <nav class="nav">
      <div class="nav-logo">
        <a href="../../index.html">ms. bubbles</a>
      </div>
      <div class="nav-links">
        <a href="../../index.html">about</a>
        <a href="../work.html">work</a>
        <a href="../projects.html">projects</a>
        <a href="../writing.html" class="on">writing</a>
        <a href="../collections.html">collections</a>
        <button class="theme-toggle" aria-label="Toggle dark mode">
          <span class="toggle-icon"></span>
        </button>
      </div>
    </nav>

    <article class="post">
      <p class="post-meta">
        <span class="date">${dateStr}</span> &middot; <span class="cat">${esc(category)}</span>
      </p>
      <h1 class="post-title">${esc(title)}</h1>
      <div class="post-body">
        ${bodyHtml}
      </div>
    </article>

    <footer class="foot">
      <div class="socials">
        <a href="mailto:ritvika780@gmail.com"><img src="../../images/email.webp" alt="email" /></a>
        <a href="https://github.com/magic-bubblez"><img src="../../images/github.webp" alt="github" /></a>
        <a href="https://www.linkedin.com/in/miss-bubbles/"><img src="../../images/linkedin.webp" alt="linkedin" /></a>
      </div>
      <div class="copy">&copy; ms. bubbles</div>
    </footer>

  </div>
</body>

</html>`;
}

// ──── HELPERS ────────────────────────────────────────────────────────────────
function copyDirRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function slugify(filename) {
  return path.basename(filename, '.md');
}

function formatDate(raw) {
  if (!raw) return '';
  if (raw instanceof Date) return raw.toISOString().split('T')[0];
  return String(raw).trim();
}

function resolveCategory(cat) {
  const c = String(cat || '').trim().toLowerCase();
  return VALID_CATEGORIES.has(c) ? c : DEFAULT_CATEGORY;
}

function updateBetweenMarkers(filePath, startMarker, endMarker, newInner) {
  const content = fs.readFileSync(filePath, 'utf8');
  const escaped = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`${escaped(startMarker)}[\\s\\S]*?${escaped(endMarker)}`);
  if (!re.test(content)) {
    console.warn(`  markers not found in ${path.basename(filePath)}`);
    return;
  }
  const next = content.replace(re, `${startMarker}\n${newInner}\n        ${endMarker}`);
  fs.writeFileSync(filePath, next, 'utf8');
}

function updateSidebarCount(html, categoryId, count) {
  // Matches: <label for="f-{cat}">... <span class="side-count">{N}</span>
  const re = new RegExp(
    `(<label\\s+for="${categoryId}">[^<]*<span\\s+class="side-count">)\\d+(</span>)`,
    'g'
  );
  return html.replace(re, `$1${count}$2`);
}

// ──── MAIN ───────────────────────────────────────────────────────────────────
function main() {
  fs.mkdirSync(BLOG_DIR, { recursive: true });

  fs.copyFileSync(THEME_JS_SRC, path.join(BLOG_DIR, 'theme.js'));
  console.log('  copied theme.js → pages/blog/theme.js');

  if (fs.existsSync(CONTENT_IMAGES)) {
    copyDirRecursive(CONTENT_IMAGES, BLOG_IMAGES);
    console.log('  copied content/images/ → pages/blog/images/');
  }

  const mdFiles = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
  if (mdFiles.length === 0) {
    console.log('No .md files found in content/. Nothing to do.');
    return;
  }

  const posts = [];

  for (const filename of mdFiles) {
    const filepath = path.join(CONTENT_DIR, filename);
    const raw = fs.readFileSync(filepath, 'utf8');
    const { data, content } = matter(raw);

    const slug     = slugify(filename);
    const title    = data.title    || slug;
    const date     = formatDate(data.date);
    const category = resolveCategory(data.category);
    const bodyHtml = marked(content);

    // Write individual post page
    const outPath = path.join(BLOG_DIR, `${slug}.html`);
    fs.writeFileSync(outPath, postPageHtml({ title, date, category, bodyHtml }), 'utf8');
    console.log(`  generated pages/blog/${slug}.html`);

    posts.push({ slug, title, date, category });
  }

  // Sort descending by date
  posts.sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));

  // Build index entries for writing.html
  const listItems = posts.map(({ slug, title, date, category }) =>
    `        <li data-cat="${category}">\n` +
    `          <span class="date">${date}</span>\n` +
    `          <span class="title"><a href="blog/${slug}.html">${esc(title)}</a></span>\n` +
    `        </li>`
  ).join('\n');

  updateBetweenMarkers(WRITING_HTML, BLOGS_START_MARKER, BLOGS_END_MARKER, listItems);
  console.log('  updated pages/writing.html blog list');

  // Update sidebar counts
  const counts = { technical: 0, essays: 0, personal: 0 };
  for (const { category } of posts) {
    if (category in counts) counts[category]++;
  }
  const total = posts.length;

  let writingHtml = fs.readFileSync(WRITING_HTML, 'utf8');
  writingHtml = updateSidebarCount(writingHtml, 'f-all', total);
  writingHtml = updateSidebarCount(writingHtml, 'f-technical', counts.technical);
  writingHtml = updateSidebarCount(writingHtml, 'f-essays', counts.essays);
  writingHtml = updateSidebarCount(writingHtml, 'f-personal', counts.personal);
  fs.writeFileSync(WRITING_HTML, writingHtml, 'utf8');
  console.log('  updated sidebar counts');

  console.log(`\n✦ done. ${posts.length} post(s) built.\n`);
}

main();
