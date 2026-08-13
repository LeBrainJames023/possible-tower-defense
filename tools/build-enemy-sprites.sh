#!/usr/bin/env bash
# Bake the ten enemy slots from cached Quaternius glTF via headless Blender.
# You do not need to open Blender. Requires: blender, magick, tools/cache/quaternius.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/sprites/enemies"
BLENDER="${BLENDER:-/opt/homebrew/bin/blender}"

mkdir -p "$OUT"

echo "== Blender: ten enemy billboards =="
"$BLENDER" --background --python "$ROOT/tools/blender_enemies.py" -- "$OUT"

echo "== ImageMagick: trim + unsharp =="
for f in "$OUT"/*.png; do
  magick "$f" -trim +repage -bordercolor none -border 20 "$f"
done

echo "Done. Sprites in $OUT"
