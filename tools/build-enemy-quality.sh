#!/usr/bin/env bash
# Bake quality-ladder rungs (same Quaternius meshes, closer camera / harder light).
# Does not overwrite in-game sprites.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BLENDER="${BLENDER:-/opt/homebrew/bin/blender}"
PREVIEW="$ROOT/public/preview/enemy-quality"

mkdir -p "$PREVIEW/punch" "$PREVIEW/hero"

echo "== Blender: punch rung =="
"$BLENDER" --background --python "$ROOT/tools/blender_enemies.py" -- --rung punch --out "$PREVIEW/punch"

echo "== Blender: hero rung =="
"$BLENDER" --background --python "$ROOT/tools/blender_enemies.py" -- --rung hero --out "$PREVIEW/hero"

echo "== ImageMagick: trim =="
for f in "$PREVIEW"/punch/*.png "$PREVIEW"/hero/*.png; do
  magick "$f" -trim +repage -bordercolor none -border 24 "$f"
done

echo "Done. Preview PNGs in $PREVIEW"
