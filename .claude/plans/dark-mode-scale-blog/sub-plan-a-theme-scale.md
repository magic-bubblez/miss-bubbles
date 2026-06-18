# Sub-plan A: Dark Mode + Scale Bump (4 pages)

## Files to modify
- `/Users/bubbles/Desktop/bubbles-portfolio/index.html`
- `/Users/bubbles/Desktop/bubbles-portfolio/pages/work.html`
- `/Users/bubbles/Desktop/bubbles-portfolio/pages/projects.html`
- `/Users/bubbles/Desktop/bubbles-portfolio/pages/collections.html` (scale only, NO dark mode)

## 1. Dark Mode — CSS Custom Properties

Add `data-theme="light"` attribute to `<html>` tag on index.html, work.html, projects.html.

For each warm-palette page (index, work, projects), add this block AFTER the existing `:root` declaration:

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
  --shadow-lg: 3px 3px 0 rgba(0, 0, 0, 0.35);
}
```

Note: index.html `:root` doesn't have `--card`, `--border-soft`, `--shadow`, `--shadow-lg`. Only add dark overrides for variables that already exist in that file's `:root`. For index.html the dark block is:

```css
[data-theme="dark"] {
  --bg: #1a1816;
  --border: #3d3530;
  --ink: #e8e0d4;
  --ink-soft: #c8bca8;
  --muted: #8a8078;
  --rose: #e8a0ae;
  --rose-deep: #d17d93;
  --rose-dark: rgb(200, 110, 128);
}
```

For projects.html, also add dark variants for the accent colors:
```css
[data-theme="dark"] {
  /* ...base dark vars... */
  --peach: #e8a67a;
  --gold: #c9a04a;
  --sage: #8ba974;
  --sky: #7eaecf;
  --lilac: #b59ad4;
  --forest-green: #7ec47a;
}
```

### Dark mode specific CSS rules

On work.html, add:
```css
[data-theme="dark"] code {
  background: rgba(200, 110, 128, 0.15);
}
```

On index.html and work.html and projects.html, add:
```css
[data-theme="dark"] .socials img {
  filter: invert(0.85);
}
```

## 2. Dark Mode — Toggle Button

Add to `.nav-links` div, AFTER the last `<a>` link, on index.html, work.html, projects.html:

```html
<button class="theme-toggle" aria-label="Toggle dark mode">
  <span class="toggle-icon"></span>
</button>
```

Add this CSS (inside the `<style>` block):
```css
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
  content: '\263E';
}

[data-theme="dark"] .toggle-icon::before {
  content: '\2600';
}
```

## 3. Dark Mode — JavaScript

Add in `<head>`, BEFORE the `<style>` tag:
```html
<script>(function(){var t=localStorage.getItem('bubbles-theme');if(t)document.documentElement.setAttribute('data-theme',t)})()</script>
```

Add at bottom of `<body>`, before `</body>`:
```html
<script>
(function() {
  var btn = document.querySelector('.theme-toggle');
  if (btn) {
    btn.addEventListener('click', function() {
      var root = document.documentElement;
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('bubbles-theme', next);
    });
  }
})();
</script>
```

Also set `<html lang="en" data-theme="light">` on each warm-palette page.

## 4. Scale Bump

### index.html
| Selector | Property | Old | New |
|---|---|---|---|
| `body` | `font-size` | `15.5px` | `17px` |
| `body` | `line-height` | `1.65` | `1.7` |
| `.wrap` | `max-width` | `720px` | `760px` |
| `.wrap` | `padding` | `30px 26px 80px` | `36px 30px 90px` |
| `.nav-logo a` | `font-size` | `26px` | `28px` |
| `.nav-links` | `font-size` | `16px` | `17px` |
| `.about-intro` | `font-size` | `16px` | `17.5px` |
| `.read-more` | `font-size` | `17px` | `18.5px` |
| `.copy` | `font-size` | `11px` | `12px` |
| `@media .about-intro` | `font-size` | `15px` | `16px` |

### work.html
| Selector | Property | Old | New |
|---|---|---|---|
| `body` | `font-size` | `15.5px` | `17px` |
| `body` | `line-height` | `1.65` | `1.7` |
| `.wrap` | `max-width` | `720px` | `760px` |
| `.wrap` | `padding` | `30px 26px 80px` | `36px 30px 90px` |
| `.nav-logo a` | `font-size` | `26px` | `28px` |
| `.nav-links` | `font-size` | `16px` | `17px` |
| `.page-title` | `font-size` | `42px` | `48px` |
| `.intro` | `font-size` | `15.5px` | `17px` |
| `.role-title` | `font-size` | `16px` | `17.5px` |
| `.role-desc` | `font-size` | `14.5px` | `15.5px` |
| `.role-bullets li` | `font-size` | `14.5px` | `15.5px` |
| `.copy` | `font-size` | `11px` | `12px` |
| `@media .page-title` | `font-size` | `34px` | `38px` |

### projects.html
| Selector | Property | Old | New |
|---|---|---|---|
| `body` | `font-size` | `15.5px` | `17px` |
| `body` | `line-height` | `1.65` | `1.7` |
| `.wrap` | `max-width` | `720px` | `760px` |
| `.wrap` | `padding` | `30px 26px 80px` | `36px 30px 90px` |
| `.nav-logo a` | `font-size` | `26px` | `28px` |
| `.nav-links` | `font-size` | `16px` | `17px` |
| `.page-title` | `font-size` | `46px` | `50px` |
| `.intro` | `font-size` | `15px` | `16px` |
| `.pin-name` | `font-size` | `22px` | `24px` |
| `.pin-desc` | `font-size` | `13px` | `14px` |
| `.copy` | `font-size` | `11px` | `12px` |
| `@media .page-title` | `font-size` | `36px` | `40px` |

### collections.html (scale only, NO dark mode, NO toggle)
| Selector | Property | Old | New |
|---|---|---|---|
| `body` | `font-size` | `17px` | `18px` |
| `.bucket-title` | `font-size` | `54px` | `58px` |
| `.lede-block` | `font-size` | `17px` | `18px` |
| `.anime-list li` | `font-size` | `15.5px` | `16.5px` |
| `.holes li` | `font-size` | `16.5px` | `17.5px` |
| `.books .title` | `font-size` | `17px` | `18px` |
| `.book-col .books .title` | `font-size` | `15.5px` | `16.5px` |
| `.room` | `padding` | `32px 52px 80px 30px` | `36px 56px 90px 34px` |
| `@media .bucket-title` | `font-size` | `42px` | `46px` |

## 5. Collections page — NO dark mode changes

collections.html gets ONLY the scale changes listed above. Do NOT add:
- No `data-theme` attribute
- No theme toggle button
- No theme JS
- No `[data-theme="dark"]` CSS rules
