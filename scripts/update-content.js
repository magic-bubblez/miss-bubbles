// Fetches blog posts from Medium + BearBlog and rewrites writing.html
// between the AUTOMATED_BLOGS markers.
//
// Usage:
//   npm install
//   npm run update

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const Parser = require('rss-parser');

const parser = new Parser();

// ──── CONFIG ────────────────────────────────────────────────────────────
const MEDIUM_USERNAME = 'ritvika780';
const BEAR_BLOG_RSS   = 'https://magic-bubblez.bearblog.dev/feed/';

const ROOT         = path.join(__dirname, '..');
const WRITING_HTML = path.join(ROOT, 'pages', 'writing.html');

// Category classifier — very light heuristics over title + snippet.
// Fall-through default is "technical".
function classifyPost({ title = '', snippet = '' }) {
  const t = (title + ' ' + snippet).toLowerCase();
  if (/\b(money|finance|financial|life|love|sweet|feelings?|little things|memoir|personal)\b/.test(t)) {
    return 'personal';
  }
  if (/\b(philosoph|thinking|thought|why|reflection|musing|essay|should|meaning)\b/.test(t)) {
    return 'essays';
  }
  return 'technical';
}

// ──── HELPERS ───────────────────────────────────────────────────────────
async function getRSSFeed(url) {
  if (!url) return [];
  try {
    const feed = await parser.parseURL(url);
    return feed.items.map(item => ({
      title: (item.title || '').trim(),
      link:  item.link,
      date:  new Date(item.pubDate || item.isoDate || Date.now())
               .toISOString().split('T')[0],
      snippet: (item.contentSnippet || item.content || '').slice(0, 240)
    }));
  } catch (err) {
    console.error(`× RSS fetch failed (${url}):`, err.message);
    return [];
  }
}

function esc(s = '') {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function updateBetweenMarkers(filePath, startMarker, endMarker, newInner) {
  const content = fs.readFileSync(filePath, 'utf8');
  const re = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`, 'g');
  if (!re.test(content)) {
    console.warn(`  markers not found in ${path.basename(filePath)}`);
    return;
  }
  const next = content.replace(re, `${startMarker}\n${newInner}\n        ${endMarker}`);
  fs.writeFileSync(filePath, next);
  console.log(`  ✓ rewrote ${path.basename(filePath)}`);
}

// ──── RENDERERS ─────────────────────────────────────────────────────────
function renderBlogPosts(posts) {
  return posts.map(p => {
    const cat = classifyPost(p);
    return `        <li data-cat="${cat}">
          <span class="date">${p.date}</span>
          <span class="title"><a href="${p.link}" target="_blank" rel="noopener">${esc(p.title)}</a></span>
        </li>`;
  }).join('\n');
}

// ──── MAIN ──────────────────────────────────────────────────────────────
async function main() {
  console.log('\n▸ fetching writing (medium + bearblog)…');
  const mediumUrl = `https://medium.com/feed/@${MEDIUM_USERNAME}`;
  const [mediumPosts, bearPosts] = await Promise.all([
    getRSSFeed(mediumUrl),
    getRSSFeed(BEAR_BLOG_RSS),
  ]);
  const allPosts = [...mediumPosts, ...bearPosts]
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  console.log(`  found ${allPosts.length} post(s)`);

  if (allPosts.length) {
    updateBetweenMarkers(
      WRITING_HTML,
      '<!-- AUTOMATED_BLOGS_START -->',
      '<!-- AUTOMATED_BLOGS_END -->',
      renderBlogPosts(allPosts)
    );
  }

  console.log('\n✦ done.\n');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
