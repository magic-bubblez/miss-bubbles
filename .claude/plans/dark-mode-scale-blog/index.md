# Portfolio Enhancement: Dark Mode + Scale Bump + Blog System

## Overview

Three changes to the bubbles-portfolio static site:
1. **Dark mode** toggle on 4 warm-palette pages (collections stays always-dark)
2. **Scale bump** — increase base font sizes and spacing across all 5 pages
3. **Blog system** — markdown-based static blog replacing external RSS links

## Sub-plans

- [sub-plan-a-theme-scale.md](sub-plan-a-theme-scale.md) — Dark mode + scale on index.html, work.html, projects.html, collections.html
- [sub-plan-b-blog.md](sub-plan-b-blog.md) — Blog build script, writing.html rewrite, content directory, package.json

## Execution Dependency Graph

```
[Sub-plan A] ──┐
               ├── (independent, run concurrently)
[Sub-plan B] ──┘
```

No file overlap between A and B. Sub-plan A touches index.html, work.html, projects.html, collections.html. Sub-plan B touches writing.html, package.json, scripts/, content/.
