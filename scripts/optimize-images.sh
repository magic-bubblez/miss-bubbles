#!/bin/bash
#
# optimize-images.sh
# Converts PNG/JPG images to WebP format for smaller file sizes.
# Keeps originals so you can re-run safely (skips already-converted files).
#
# Usage:
#   npm run optimize-images
#   # or directly:
#   bash scripts/optimize-images.sh
#
# Prerequisites:
#   brew install webp   (you already have this)

set -euo pipefail

QUALITY=82          # WebP quality (80-85 is the sweet spot for screenshots)
CONTENT_IMAGES="content/images"
POEM_ASSETS="poem-assets"
ROOT_IMAGES="images"

converted=0
skipped=0
saved_bytes=0

convert_to_webp() {
  local src="$1"
  local dir
  dir=$(dirname "$src")
  local base
  base=$(basename "$src")
  local name="${base%.*}"
  local dest="${dir}/${name}.webp"

  # Skip if WebP already exists and is newer than source
  if [[ -f "$dest" && "$dest" -nt "$src" ]]; then
    ((skipped++))
    return
  fi

  local src_size
  src_size=$(stat -f%z "$src" 2>/dev/null || stat -c%s "$src" 2>/dev/null)

  local ext="${src##*.}"
  # Convert based on extension (case-insensitive via shopt or just matching common cases)
  case "$(printf '%s' "$ext" | tr '[:upper:]' '[:lower:]')" in
    png|jpg|jpeg)
      cwebp -q "$QUALITY" -quiet "$src" -o "$dest"
      ;;
    *)
      return
      ;;
  esac

  if [[ -f "$dest" ]]; then
    local dest_size
    dest_size=$(stat -f%z "$dest" 2>/dev/null || stat -c%s "$dest" 2>/dev/null)
    local saved=$((src_size - dest_size))
    local pct=$((saved * 100 / src_size))
    saved_bytes=$((saved_bytes + saved))
    ((converted++))
    printf "  ✓ %-60s %s → %s  (-%d%%)\n" \
      "$src" \
      "$(numfmt_kb "$src_size")" \
      "$(numfmt_kb "$dest_size")" \
      "$pct"
  fi
}

numfmt_kb() {
  local bytes=$1
  if ((bytes >= 1048576)); then
    printf "%.1fM" "$(echo "scale=1; $bytes/1048576" | bc)"
  else
    printf "%dK" "$((bytes / 1024))"
  fi
}

echo ""
echo "⚡ optimizing images → WebP (quality: ${QUALITY})"
echo "─────────────────────────────────────────────────"

# Find all PNG and JPG files in image directories
while IFS= read -r -d '' file; do
  convert_to_webp "$file"
done < <(find "$CONTENT_IMAGES" "$POEM_ASSETS" "$ROOT_IMAGES" \
  -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' \) \
  -not -name '*.webp' \
  -print0 2>/dev/null)

echo ""
echo "─────────────────────────────────────────────────"
echo "  converted: ${converted}  skipped: ${skipped}  saved: $(numfmt_kb $saved_bytes)"
echo ""

if ((converted > 0)); then
  echo "✦ done. now update your markdown to use .webp extensions."
  echo "  then commit and push — jsDelivr will serve them globally."
fi
