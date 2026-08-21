#!/usr/bin/env python3
"""Knock leftover magenta chroma off walk-frame silhouettes."""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path("/Users/participant/Desktop/possible-tower-defense/public/sprites/enemies/walk")
# Thin purple wings: only eat obvious key + low-alpha halo, not the membrane.
GENTLE = {"imp", "hellbat", "wyvern", "frostwisp", "shade"}


def neighbors_transparent(trans: np.ndarray) -> np.ndarray:
    pad = np.pad(trans, 1, constant_values=True)
    return (
        pad[:-2, 1:-1]
        | pad[2:, 1:-1]
        | pad[1:-1, :-2]
        | pad[1:-1, 2:]
        | pad[:-2, :-2]
        | pad[:-2, 2:]
        | pad[2:, :-2]
        | pad[2:, 2:]
    )


def defringe(path: Path, aggressive: bool) -> bool:
    im = Image.open(path).convert("RGBA")
    a = np.asarray(im).copy()
    r = a[:, :, 0].astype(np.int16)
    g = a[:, :, 1].astype(np.int16)
    b = a[:, :, 2].astype(np.int16)
    alpha = a[:, :, 3].astype(np.int16)
    mag = np.minimum(r, b) - g
    before = alpha.copy()

    key = (r >= 230) & (b >= 230) & (g <= 40)
    alpha[key] = 0

    halo_cut = 100 if aggressive else 70
    halo = (alpha > 0) & (alpha < halo_cut) & (mag >= 30) & (g < 100)
    alpha[halo] = 0

    trans = alpha == 0
    near_t = neighbors_transparent(trans)
    vis = alpha > 0
    edge_cut = 40 if aggressive else 65
    fringe = vis & near_t & (mag >= edge_cut) & (g < 110)
    alpha[fringe] = 0

    near_t = neighbors_transparent(alpha == 0)
    spill = (alpha > 0) & near_t & (mag > 18) & (g < 120)
    if spill.any():
        excess = np.clip(mag[spill], 0, 255).astype(np.float32)
        factor = 0.9 if aggressive else 0.6
        r[spill] = np.clip(r[spill] - (excess * factor).astype(np.int16), 0, 255)
        b[spill] = np.clip(b[spill] - (excess * factor).astype(np.int16), 0, 255)

    if np.array_equal(before, alpha) and not spill.any():
        return False
    a[:, :, 0] = r.astype(np.uint8)
    a[:, :, 1] = g.astype(np.uint8)
    a[:, :, 2] = b.astype(np.uint8)
    a[:, :, 3] = np.clip(alpha, 0, 255).astype(np.uint8)
    Image.fromarray(np.ascontiguousarray(a)).save(path)
    return True


def main() -> None:
    n = 0
    for path in sorted(ROOT.glob("*-*-*.png")):
        name = path.name.split("-")[0]
        if defringe(path, aggressive=name not in GENTLE):
            n += 1
            print(path.name)
    print(f"updated {n}")


if __name__ == "__main__":
    main()
