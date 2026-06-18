# Sub-plan B: Blog System + Writing Page Rewrite

## Files to create
- `/Users/bubbles/Desktop/bubbles-portfolio/content/hello-world.md` (sample post)
- `/Users/bubbles/Desktop/bubbles-portfolio/scripts/build-blog.js`
- `/Users/bubbles/Desktop/bubbles-portfolio/pages/blog/` (directory, populated by build)

## Files to modify
- `/Users/bubbles/Desktop/bubbles-portfolio/package.json`
- `/Users/bubbles/Desktop/bubbles-portfolio/pages/writing.html` (full rewrite with theme + scale + blog index)

## Files to delete
- `/Users/bubbles/Desktop/bubbles-portfolio/scripts/update-content.js`

---

## 1. Sample Blog Post

Create `content/hello-world.md`:
```markdown
---
title: "hello world"
date: 2026-06-15
category: personal
description: "a first post, just to make sure everything works."
---

This is the first post on the new blog. If you're reading this, the build script worked.

## why a blog?

I wanted a place to write that lives inside my own site — not on Medium, not on BearBlog, just here. A corner of the internet that's truly mine.

## what to expect

Tech stuff, non-tech stuff, personal brain dumps. The usual.
```

## 2. Build Script — `scripts/build-blog.js`

Replaces `scripts/update-content.js`. This script:

1. Reads all `.md` files from `content/`
2. Parses YAML frontmatter with `gray-matter`
3. Converts markdown body to HTML with `marked`
4. Generates standalone HTML pages in `pages/blog/` using an embedded template
5. Rewrites `pages/writing.html` between `<!-- AUTOMATED_BLOGS_START -->` and `<!-- AUTOMATED_BLOGS_END -->` markers
6. Updates the sidebar category counts

### Dependencies
- `gray-matter` (frontmatter parsing)
- `marked` (markdown to HTML)

### Post page template requirements

Each generated blog post page (`pages/blog/{slug}.html`) must include:
- Full HTML document with `<html lang="en" data-theme="light">`
- Same Google Fonts link as other pages (Inter, Instrument Serif, JetBrains Mono)
- Theme-read script in `<head>` (same as sub-plan A)
- `:root` CSS variables (warm light palette)
- `[data-theme="dark"]` CSS variables (dark palette from sub-plan A)
- Standard nav with "writing" link marked `.on`
- Nav paths relative from `pages/blog/`: `../../index.html`, `../work.html`, etc.
- Theme toggle button in nav
- Toggle JS at bottom of body
- Post content wrapped in `<article class="post">`
- Post meta (date + category), title, body
- Standard footer with socials
- Prose styles for rendered markdown: h2, h3, p, code, pre, blockquote, ul, ol, a, img, strong, em
- Dark mode social icon inversion
- Scale-bumped sizes (17px body, 760px max-width, etc.)

### Post template dark palette values (must match sub-plan A):
```css
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
```

### Index entry format (writing.html)
Each post renders as:
```html
<li data-cat="{category}">
  <span class="date">{YYYY-MM-DD}</span>
  <span class="title"><a href="blog/{slug}.html">{title}</a></span>
</li>
```

Note: NO `target="_blank"` or `rel="noopener"` — these are local pages.

### Category classification
Use the frontmatter `category` field directly. Valid values: `technical`, `essays`, `personal`. Default to `technical` if missing.

### Sidebar count update
After generating all posts, count posts per category and update the `<span class="side-count">` values in writing.html. The counts appear like:
```html
<li><label for="f-all">all <span class="side-count">3</span></label></li>
<li><label for="f-technical">technical <span class="side-count">1</span></label></li>
```
Use regex replacement between the markers to update the count values.

## 3. Writing Page Rewrite

`pages/writing.html` needs the same treatment as the other warm pages:
- `<html lang="en" data-theme="light">`
- Theme-read script in `<head>`
- Dark mode CSS variables block
- Theme toggle button in nav
- Toggle JS at bottom
- Dark mode social icon inversion
- Scale bump applied:

| Selector | Property | Old | New |
|---|---|---|---|
| `body` | `font-size` | `15.5px` | `17px` |
| `.wrap` | `max-width` | `720px` | `760px` |
| `.wrap` | `padding` | `30px 26px 80px` | `36px 30px 90px` |
| `.nav-logo a` | `font-size` | `26px` | `28px` |
| `.nav-links` | `font-size` | `16px` | `17px` |
| `.page-title` | `font-size` | `44px` | `48px` |
| `.intro` | `font-size` | `15px` | `16px` |
| `.posts .date` | `font-size` | `11.5px` | `12.5px` |
| `.posts .title` | `font-size` | `15px` | `16.5px` |
| `.copy` | `font-size` | `11px` | `12px` |
| `@media .page-title` | `font-size` | `36px` | `40px` |

Also update the existing blog post entries between the markers — remove all old external links. The build script will populate fresh entries from local markdown files.

Clear out the old content between the markers so the build script has a clean slate:
```html
<!-- AUTOMATED_BLOGS_START -->
<!-- AUTOMATED_BLOGS_END -->
```

Set all sidebar counts to `0` — the build script will update them.

## 4. Package.json Changes

```json
{
  "name": "bubbles-portfolio",
  "version": "1.0.0",
  "private": true,
  "description": "ms. bubbles portfolio + auto content pipeline",
  "type": "commonjs",
  "scripts": {
    "build": "node scripts/build-blog.js"
  },
  "dependencies": {
    "gray-matter": "^4.0.3",
    "marked": "^15.0.0"
  }
}
```

Remove `rss-parser` and `dotenv`. Rename `update` script to `build`.

## 5. Run the build

After creating the build script and sample post, run `npm install && npm run build` to:
- Generate `pages/blog/hello-world.html`
- Update `pages/writing.html` with the post listing and counts
