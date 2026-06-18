#!/usr/bin/env python3
"""
Fetches images from Medium/BearBlog posts and saves them locally.
Updates markdown files to reference local paths.
"""

import re
import os
import sys
import urllib.request
import urllib.error
from urllib.parse import urlparse, urljoin

CONTENT_DIR = os.path.join(os.path.dirname(__file__), '..', 'content')
IMAGES_DIR = os.path.join(CONTENT_DIR, 'images')

MEDIUM_POSTS = {
    'what-it-takes-to-build-a-programming-language': 'https://medium.com/@ritvika780/what-it-takes-to-build-a-programming-language-60ebe8d84078',
    'how-to-build-a-hot-or-not-for-github': 'https://medium.com/@ritvika780/how-to-build-a-hot-or-not-for-github-48f22e562ab4',
    'sweet-little-things': 'https://medium.com/@ritvika780/sweet-little-things-118cadc06cab',
    'learning-money-the-right-way': 'https://medium.com/@ritvika780/learning-money-the-right-way-rethinking-financial-education-3f762bf80e7c',
    'basic-architecture-of-linux': 'https://medium.com/@ritvika780/a-brief-introduction-to-basic-architecture-of-linux-ef8c28bbc652',
    'external-context-layer-for-ai-agents': 'https://medium.com/@ritvika780/i-built-an-external-context-layer-for-ai-agents-most-of-it-already-exists-heres-what-doesn-t-9cb2827f75cb',
    'the-shape-of-a-voice-controlled-agent': 'https://medium.com/@ritvika780/the-shape-of-a-voice-controlled-agent-7b32723a8639',
}

BEARBLOG_POSTS = {
    'the-shape-of-a-voice-controlled-agent': 'https://magic-bubblez.bearblog.dev/the-shape-of-a-voice-controlled-agent/',
    'external-context-layer-for-ai-agents': 'https://magic-bubblez.bearblog.dev/i-built-an-external-context-layer-for-ai-agents-most-of-it-already-exists-heres-what-doesnt/',
    'about-miss-bubbles': 'https://magic-bubblez.bearblog.dev/about-miss-bubbles/',
    'on-belief-in-god': 'https://magic-bubblez.bearblog.dev/on-belief-in-god/',
    'why-use-an-artifact-manager': 'https://magic-bubblez.bearblog.dev/why-use-an-artifact-manager/',
}

HEADERS = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'}

def fetch_url(url):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            return resp.read().decode('utf-8', errors='replace')
    except Exception as e:
        print(f'    WARN: failed to fetch {url}: {e}')
        return None

def fetch_via_wayback(url):
    wb_url = f'https://web.archive.org/web/2026/{url}'
    return fetch_url(wb_url)

def extract_image_urls(html, base_url=''):
    imgs = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', html, re.IGNORECASE)
    filtered = []
    for src in imgs:
        if src.startswith('//'):
            src = 'https:' + src
        elif src.startswith('/') and base_url:
            src = urljoin(base_url, src)
        if any(skip in src for skip in ['1x1', 'pixel', 'tracking', 'stat', 'avatar', 'profile',
                                         'favicon', 'icon', 'logo', 'miro.medium.com/v2/da:',
                                         'data:image', 'gravatar', 'cdn-cgi']):
            continue
        if 'miro.medium.com' in src or 'i.ibb.co' in src or 'bearblog' in src:
            filtered.append(src)
        elif src.startswith('http') and any(ext in src.lower() for ext in ['.png', '.jpg', '.jpeg', '.gif', '.webp']):
            filtered.append(src)
    return list(dict.fromkeys(filtered))

def download_image(url, dest_path):
    if os.path.exists(dest_path):
        print(f'    skip (exists): {os.path.basename(dest_path)}')
        return True
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = resp.read()
            content_type = resp.headers.get('Content-Type', '')
        ext = guess_ext(url, content_type)
        if not dest_path.endswith(ext):
            dest_path = dest_path.rsplit('.', 1)[0] + ext if '.' in os.path.basename(dest_path) else dest_path + ext
        with open(dest_path, 'wb') as f:
            f.write(data)
        print(f'    saved: {os.path.basename(dest_path)} ({len(data)} bytes)')
        return True
    except Exception as e:
        print(f'    FAIL: {url} -- {e}')
        return False

def guess_ext(url, content_type=''):
    if 'png' in content_type or '.png' in url.lower():
        return '.png'
    if 'gif' in content_type or '.gif' in url.lower():
        return '.gif'
    if 'webp' in content_type or '.webp' in url.lower():
        return '.webp'
    return '.jpg'

def sanitize_filename(url, index):
    parsed = urlparse(url)
    basename = os.path.basename(parsed.path).split('?')[0]
    if basename and len(basename) > 5 and '.' in basename:
        name = re.sub(r'[^a-zA-Z0-9._-]', '', basename)
        if len(name) > 60:
            name = name[:60]
        return name
    return f'image-{index:02d}'

def process_post(slug, html, source_name):
    if not html:
        return []

    urls = extract_image_urls(html)
    if not urls:
        print(f'  no images found in {source_name}')
        return []

    print(f'  found {len(urls)} image(s) in {source_name}')
    post_img_dir = os.path.join(IMAGES_DIR, slug)
    os.makedirs(post_img_dir, exist_ok=True)

    downloaded = []
    for i, url in enumerate(urls):
        fname = sanitize_filename(url, i)
        dest = os.path.join(post_img_dir, fname)
        if download_image(url, dest):
            actual_fname = fname
            for f in os.listdir(post_img_dir):
                if f.startswith(fname.rsplit('.', 1)[0]):
                    actual_fname = f
                    break
            downloaded.append((url, f'images/{slug}/{actual_fname}'))

    return downloaded

def update_markdown(slug, replacements):
    md_path = os.path.join(CONTENT_DIR, f'{slug}.md')
    if not os.path.exists(md_path):
        return
    with open(md_path, 'r') as f:
        content = f.read()

    changed = False
    for ext_url, local_path in replacements:
        if ext_url in content:
            content = content.replace(ext_url, local_path)
            changed = True
            print(f'    replaced: {ext_url[:60]}... -> {local_path}')

    if changed:
        with open(md_path, 'w') as f:
            f.write(content)

def main():
    os.makedirs(IMAGES_DIR, exist_ok=True)

    all_slugs = set(list(MEDIUM_POSTS.keys()) + list(BEARBLOG_POSTS.keys()))

    for slug in sorted(all_slugs):
        print(f'\n=== {slug} ===')
        all_replacements = []

        if slug in BEARBLOG_POSTS:
            print(f'  fetching from BearBlog...')
            html = fetch_url(BEARBLOG_POSTS[slug])
            if html and 'Forbidden' not in html[:20]:
                replacements = process_post(slug, html, 'bearblog')
                all_replacements.extend(replacements)

        if slug in MEDIUM_POSTS:
            print(f'  fetching from Medium (via Wayback)...')
            html = fetch_via_wayback(MEDIUM_POSTS[slug])
            if html:
                replacements = process_post(slug, html, 'medium')
                for r in replacements:
                    if r[0] not in [x[0] for x in all_replacements]:
                        all_replacements.append(r)

        if all_replacements:
            update_markdown(slug, all_replacements)
        else:
            print(f'  no images downloaded')

    print('\n--- done ---')
    print('Run `npm run build` to regenerate blog pages with local images.')

if __name__ == '__main__':
    main()
