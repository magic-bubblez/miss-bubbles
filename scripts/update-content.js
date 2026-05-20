// Fetches blog posts from Medium + BearBlog and rewrites writing.html
// between the AUTOMATED_BLOGS markers.
// Also fetches GitHub repos and rewrites projects.html
// between the AUTOMATED_PROJECTS markers.
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
const GITHUB_USERNAME = 'magic-bubblez';

const ROOT          = path.join(__dirname, '..');
const WRITING_HTML  = path.join(ROOT, 'pages', 'writing.html');
const PROJECTS_HTML = path.join(ROOT, 'pages', 'projects.html');

// Repos to skip (forks, profile READMEs, the portfolio itself, etc.)
const SKIP_REPOS = new Set([
  `${GITHUB_USERNAME}`,            // profile README repo
  'miss-bubbles',                   // this portfolio
  'bubbles-portfolio',
]);

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

async function getGitHubRepos(username) {
  try {
    // Fetch all public repos, sorted by most recently pushed
    const url = `https://api.github.com/users/${username}/repos?per_page=100&sort=pushed&direction=desc&type=owner`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'bubbles-portfolio-updater',
      },
    });
    if (!res.ok) {
      throw new Error(`GitHub API responded ${res.status}: ${res.statusText}`);
    }
    const repos = await res.json();
    return repos
      .filter(r => !r.fork && !r.archived && !SKIP_REPOS.has(r.name))
      .map(r => ({
        name:        r.name,
        description: r.description || '',
        language:    r.language || '',
        url:         r.html_url,
        homepage:    r.homepage || '',
        stars:       r.stargazers_count,
        pushed:      r.pushed_at,
      }));
  } catch (err) {
    console.error(`× GitHub fetch failed:`, err.message);
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

function renderProjectPins(repos) {
  return repos.map(r => {
    const id = r.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const lang = r.language ? r.language.toLowerCase() : '';

    // Build the stack label from language
    const stack = lang || 'misc';

    // Build links
    const links = [];
    if (r.homepage) {
      links.push(`<a href="${r.homepage}" target="_blank" rel="noopener">demo</a>`);
    }
    links.push(`<a href="${r.url}" target="_blank" rel="noopener">repo</a>`);

    const desc = esc(r.description) || 'no description yet.';

    return `      <article class="pin" id="${id}">
        <div class="pin-name">${esc(r.name)}</div>
        <p class="pin-desc">${desc}</p>
        <div class="pin-foot">
          <div class="pin-stack">${esc(stack)}</div>
          <div class="pin-links">${links.join('')}</div>
        </div>
      </article>`;
  }).join('\n\n');
}

// ──── MAIN ──────────────────────────────────────────────────────────────
async function main() {
  // ── 1. Writing (blogs) ───────────────────────────────
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

  // ── 2. Projects (GitHub repos) ───────────────────────
  console.log('\n▸ fetching github repos…');
  const repos = await getGitHubRepos(GITHUB_USERNAME);
  console.log(`  found ${repos.length} repo(s)`);

  if (repos.length) {
    updateBetweenMarkers(
      PROJECTS_HTML,
      '<!-- AUTOMATED_PROJECTS_START -->',
      '<!-- AUTOMATED_PROJECTS_END -->',
      renderProjectPins(repos)
    );
  }

  console.log('\n✦ done.\n');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
