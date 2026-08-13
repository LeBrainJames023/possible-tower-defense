#!/usr/bin/env bash
# Rebuild environment textures, SFX, tower icons, and the tree billboard.
# Safe to re-run. Requires: curl, magick, sox, ffmpeg, inkscape, blender.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CACHE="$ROOT/tools/cache"
OUT_TEX="$ROOT/public/textures"
OUT_SFX="$ROOT/public/sfx"
OUT_ICONS="$ROOT/public/icons"
OUT_SPR="$ROOT/public/sprites"
UA="PossibleTowerDefense/0.1 (local asset bake)"

INKSCAPE="${INKSCAPE:-/Applications/Inkscape.app/Contents/MacOS/inkscape}"
BLENDER="${BLENDER:-/opt/homebrew/bin/blender}"

mkdir -p "$CACHE" "$OUT_TEX" "$OUT_SFX" "$OUT_ICONS" "$OUT_SPR"

echo "== Poly Haven: download 1k CC0 albedos =="
curl -fsSL -A "$UA" -o "$CACHE/grass_src.jpg" \
  "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/aerial_grass_rock/aerial_grass_rock_diff_1k.jpg"
curl -fsSL -A "$UA" -o "$CACHE/dirt_src.jpg" \
  "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/dirt/dirt_diff_1k.jpg"

echo "== ImageMagick: game-size tiles + water caustic =="
magick "$CACHE/grass_src.jpg" -resize 256x256 -modulate 92,78,100 -contrast-stretch 1%x4% \
  -quality 82 "$OUT_TEX/grass.jpg"
magick "$CACHE/dirt_src.jpg" -resize 256x256 -modulate 88,70,100 -contrast-stretch 2%x3% \
  -quality 82 "$OUT_TEX/dirt.jpg"
# Synthetic water caustic — tileable, cheap, reads as wet light on the path.
magick -size 256x256 plasma:fractal -channel G -separate \
  -blur 0x1.2 -swirl 70 -spread 3 -auto-level \
  -fill '#2ec4b6' -colorize 65 -modulate 105,70,100 \
  -quality 82 "$OUT_TEX/water.jpg"

echo "== sox: wind + water beds =="
sox -n -r 44100 -c 1 "$CACHE/wind_raw.wav" synth 10 brownnoise vol 0.22
sox "$CACHE/wind_raw.wav" "$CACHE/wind.wav" highpass 120 lowpass 900 reverb 18 remix 1
sox -n -r 44100 -c 1 "$CACHE/w1.wav" synth 10 sine 180 vol 0.05
sox -n -r 44100 -c 1 "$CACHE/w2.wav" synth 10 sine 186 vol 0.05
sox -n -r 44100 -c 1 "$CACHE/wn.wav" synth 10 pinknoise vol 0.07 lowpass 650
sox -m "$CACHE/w1.wav" "$CACHE/w2.wav" "$CACHE/wn.wav" "$CACHE/water_mix.wav"
sox "$CACHE/water_mix.wav" "$CACHE/water.wav" reverb 28 remix 1 vol 0.85

echo "== ffmpeg: compact looping mp3 =="
ffmpeg -y -hide_banner -loglevel error -i "$CACHE/wind.wav" -c:a libmp3lame -q:a 6 "$OUT_SFX/wind.mp3"
ffmpeg -y -hide_banner -loglevel error -i "$CACHE/water.wav" -c:a libmp3lame -q:a 6 "$OUT_SFX/water.mp3"

echo "== Inkscape: rasterize tower dock icons =="
for kind in arrow cannon ice lightning fire poison; do
  "$INKSCAPE" --export-type=png --export-filename="$OUT_ICONS/${kind}.png" \
    --export-width=256 --export-height=96 \
    "$ROOT/tools/icons/${kind}.svg"
done

echo "== Blender: tree billboard =="
"$BLENDER" --background --python "$ROOT/tools/blender_tree.py" -- "$OUT_SPR/tree.png"

echo "Done. Outputs in public/textures, public/sfx, public/icons, public/sprites"
