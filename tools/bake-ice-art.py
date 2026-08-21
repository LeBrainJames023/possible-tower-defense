#!/usr/bin/env python3
"""Slice Ice tiles and run Sprite Forge on Ice props, portals, and walks."""
from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

from PIL import Image

ROOT = Path("/Users/participant/Desktop/possible-tower-defense")
ASSETS = Path("/Users/participant/.cursor/projects/Users-participant-Desktop-possible-tower-defense/assets")
FORGE = Path("/Users/participant/.cursor/skills/generate2dsprite/scripts/generate2dsprite.py")
PREVIEW = ROOT / "public/preview/sprite-forge"


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
    print(" ", " ".join(cmd[-14:]))
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
            if d == "s":
                shutil.copy2(fr, walk / f"{name}-{i}.png")


def main() -> None:
    terrain = ROOT / "public/sprites/terrain"
    terrain.mkdir(parents=True, exist_ok=True)
    snow = Image.open(ASSETS / "ice-snow-tiles-2x2.png").convert("RGB")
    path = Image.open(ASSETS / "ice-path-tiles-2x2.png").convert("RGB")
    for i, cell in enumerate(split_grid(snow, 2, 2), start=1):
        cell.save(terrain / f"ice-{i}.png")
        print("wrote", f"ice-{i}.png")
    for i, cell in enumerate(split_grid(path, 2, 2), start=1):
        cell.save(terrain / f"ice-path-{i}.png")
        print("wrote", f"ice-path-{i}.png")

    props_dir = PREVIEW / "ice-props"
    props_dir.mkdir(parents=True, exist_ok=True)
    raw_props = props_dir / "raw-sheet.png"
    shutil.copy2(ASSETS / "ice-props-2x2.png", raw_props)
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
    live_props = ROOT / "public/sprites/ice"
    live_props.mkdir(parents=True, exist_ok=True)
    names = ["crystal", "pine", "boulder", "shrub"]
    for i, name in enumerate(names, start=1):
        src = props_dir / f"prop-{i}.png"
        if not src.exists():
            src = props_dir / f"idle-{i}.png"
        shutil.copy2(src, live_props / f"{name}.png")
        print("wrote", name)

    landmarks = ROOT / "public/sprites/landmarks"
    landmarks.mkdir(parents=True, exist_ok=True)
    for kind, src_name in (("portal-ice-in", "ice-portal-in.png"), ("portal-ice-out", "ice-portal-out.png")):
        pdir = PREVIEW / kind
        pdir.mkdir(parents=True, exist_ok=True)
        raw = pdir / "raw-sheet.png"
        shutil.copy2(ASSETS / src_name, raw)
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

    creatures = {
        "frostwisp": ("ice-frostwisp-walk4.png", "center"),
        "icewolf": ("ice-icewolf-walk4.png", "feet"),
        "packlord": ("ice-packlord-walk4.png", "feet"),
        "frostjarl": ("ice-frostjarl-walk4.png", "feet"),
    }
    for name, (src_name, align) in creatures.items():
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
                align,
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
