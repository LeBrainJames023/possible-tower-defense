#!/usr/bin/env python3
"""Slice Desert tiles and run Sprite Forge on Desert props, portals, and walks."""
from __future__ import annotations

import shutil
import subprocess
import sys
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path("/Users/participant/Desktop/possible-tower-defense")
ASSETS = Path("/Users/participant/.cursor/projects/Users-participant-Desktop-possible-tower-defense/assets")
FORGE = Path("/Users/participant/.cursor/skills/generate2dsprite/scripts/generate2dsprite.py")
PREVIEW = ROOT / "public/preview/sprite-forge"


def flood_black_to_magenta(im: Image.Image, thresh: int = 32) -> Image.Image:
    arr = np.array(im.convert("RGB"))
    h, w = arr.shape[:2]
    dark = (arr[:, :, 0] <= thresh) & (arr[:, :, 1] <= thresh) & (arr[:, :, 2] <= thresh)
    vis = np.zeros((h, w), dtype=bool)
    q: deque[tuple[int, int]] = deque()

    def seed(y: int, x: int) -> None:
        if dark[y, x] and not vis[y, x]:
            vis[y, x] = True
            q.append((y, x))

    for x in range(w):
        seed(0, x)
        seed(h - 1, x)
    for y in range(h):
        seed(y, 0)
        seed(y, w - 1)
    while q:
        y, x = q.popleft()
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < h and 0 <= nx < w and dark[ny, nx] and not vis[ny, nx]:
                vis[ny, nx] = True
                q.append((ny, nx))
    arr[vis] = (255, 0, 255)
    return Image.fromarray(arr)


def split_grid(im: Image.Image, rows: int, cols: int, inset: int = 6) -> list[Image.Image]:
    w, h = im.size
    cw, ch = w // cols, h // rows
    out: list[Image.Image] = []
    for r in range(rows):
        for c in range(cols):
            box = (c * cw + inset, r * ch + inset, (c + 1) * cw - inset, (r + 1) * ch - inset)
            cell = im.crop(box).resize((256, 256), Image.Resampling.LANCZOS)
            out.append(cell)
    return out


def run_forge(args: list[str]) -> None:
    cmd = [sys.executable, str(FORGE), "process", *args]
    print(" ", " ".join(cmd[-12:]))
    subprocess.check_call(cmd)


def copy_walks(name: str, src: Path) -> None:
    live = ROOT / "public/sprites/enemies"
    walk = live / "walk"
    face = live / "face"
    walk.mkdir(parents=True, exist_ok=True)
    face.mkdir(parents=True, exist_ok=True)
    still = src / "walk-1.png"
    if still.exists():
        shutil.copy2(still, live / f"{name}.png")
    # Prompted row order: S, W, E, N. East filename faces right.
    mapping = {
        "s": [1, 2, 3, 4],
        "w": [5, 6, 7, 8],
        "e": [9, 10, 11, 12],
        "n": [13, 14, 15, 16],
    }
    for d, frames in mapping.items():
        for i, src_i in enumerate(frames, start=1):
            fr = src / f"walk-{src_i}.png"
            dest = walk / f"{name}-{d}-{i}.png"
            shutil.copy2(fr, dest)
            if i == 1:
                shutil.copy2(fr, face / f"{name}-{d}.png")
            shutil.copy2(fr, walk / f"{name}-{i}.png") if d == "s" else None


def main() -> None:
    # --- tiles: full-bleed, no chroma ---
    sand_dir = ROOT / "public/sprites/terrain"
    sand_dir.mkdir(parents=True, exist_ok=True)
    sand = Image.open(ASSETS / "desert-sand-tiles-2x2.png").convert("RGB")
    path = Image.open(ASSETS / "desert-path-tiles-2x2.png").convert("RGB")
    for i, cell in enumerate(split_grid(sand, 2, 2), start=1):
        cell.save(sand_dir / f"sand-{i}.png")
        print("wrote", f"sand-{i}.png")
    for i, cell in enumerate(split_grid(path, 2, 2), start=1):
        cell.save(sand_dir / f"sand-path-{i}.png")
        print("wrote", f"sand-path-{i}.png")

    # --- props ---
    props_raw = flood_black_to_magenta(Image.open(ASSETS / "desert-props-2x2.png"))
    props_dir = PREVIEW / "desert-props"
    props_dir.mkdir(parents=True, exist_ok=True)
    raw_props = props_dir / "raw-sheet.png"
    props_raw.save(raw_props)
    run_forge(
        [
            "--input",
            str(raw_props),
            "--target",
            "asset",
            "--mode",
            "idle",
            "--rows",
            "2",
            "--cols",
            "2",
            "--output-dir",
            str(props_dir),
            "--cell-size",
            "256",
            "--fit-scale",
            "0.88",
            "--align",
            "feet",
            "--shared-scale",
            "--component-mode",
            "largest",
            "--label-prefix",
            "prop",
        ]
    )
    live_props = ROOT / "public/sprites/desert"
    live_props.mkdir(parents=True, exist_ok=True)
    names = ["cactus", "dead-tree", "boulder", "agave"]
    for i, name in enumerate(names, start=1):
        src = props_dir / f"prop-{i}.png"
        if not src.exists():
            src = props_dir / f"idle-{i}.png"
        shutil.copy2(src, live_props / f"{name}.png")
        print("wrote", name)

    # --- portals ---
    landmarks = ROOT / "public/sprites/landmarks"
    landmarks.mkdir(parents=True, exist_ok=True)
    for kind, src_name in (("portal-desert-in", "desert-portal-in.png"), ("portal-desert-out", "desert-portal-out.png")):
        pdir = PREVIEW / kind
        pdir.mkdir(parents=True, exist_ok=True)
        keyed = flood_black_to_magenta(Image.open(ASSETS / src_name))
        raw = pdir / "raw-sheet.png"
        keyed.save(raw)
        run_forge(
            [
                "--input",
                str(raw),
                "--target",
                "asset",
                "--mode",
                "single",
                "--output-dir",
                str(pdir),
                "--single-size",
                "256",
                "--fit-scale",
                "0.92",
                "--align",
                "center",
                "--component-mode",
                "largest",
            ]
        )
        candidates = [pdir / "clean.png", pdir / "sheet-transparent.png"]
        best = next((p for p in candidates if p.exists()), None)
        if not best:
            raise SystemExit(f"no keyed portal output in {pdir}")
        shutil.copy2(best, landmarks / f"{kind}.png")
        print("wrote", kind, "from", best.name)

    # --- creature walks ---
    creatures = {
        "scorpion": "desert-scorpion-walk4.png",
        "dunerunner": "desert-dunerunner-walk4.png",
        "dunetyrant": "desert-dunetyrant-walk4.png",
        "sandkhan": "desert-sandkhan-walk4.png",
    }
    for name, src_name in creatures.items():
        out = PREVIEW / "walk4" / name
        out.mkdir(parents=True, exist_ok=True)
        raw = out / "raw-sheet.png"
        shutil.copy2(ASSETS / src_name, raw)
        (out / "prompt-used.txt").write_text(f"4x4 {name} directional walk\n")
        run_forge(
            [
                "--input",
                str(raw),
                "--target",
                "creature",
                "--mode",
                "walk",
                "--rows",
                "4",
                "--cols",
                "4",
                "--output-dir",
                str(out),
                "--cell-size",
                "256",
                "--fit-scale",
                "0.82",
                "--align",
                "feet",
                "--shared-scale",
                "--component-mode",
                "largest",
                "--duration",
                "200",
            ]
        )
        copy_walks(name, out)
        print("wired walks", name)


if __name__ == "__main__":
    main()
