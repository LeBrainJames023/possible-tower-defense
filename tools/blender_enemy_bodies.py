"""Bake three NEW bodies per enemy slot. Not rebakes of the live toys."""

from __future__ import annotations

import os
import sys
from math import radians

import bpy
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CACHE = os.path.join(ROOT, "tools", "cache", "quaternius")
OUT_DIR = os.path.join(ROOT, "public", "sprites", "enemy-bodies")

# slot -> three unused meshes. None of these are the live in-game billboards.
BODIES = {
    "goblin": [
        ("ninja", "Big/glTF/Ninja.gltf", False),
        ("rat", "easyenemy/OBJ/Rat.obj", False),
        ("alien", "Big/glTF/Alien.gltf", False),
    ],
    "raider": [
        ("skeleton", "animatedmonster/OBJ/Skeleton.obj", False),
        ("snake", "easyenemy/OBJ/Snake_angry.obj", False),
        ("monkroose", "Big/glTF/Monkroose.gltf", False),
    ],
    "imp": [
        ("wasp", "easyenemy/OBJ/Wasp.obj", True),
        ("bat", "animatedmonster/OBJ/Bat.obj", True),
        ("slime", "animatedmonster/OBJ/Slime.obj", False),
    ],
    "warg": [
        ("spider", "easyenemy/OBJ/Spider.obj", False),
        ("rat", "easyenemy/OBJ/Rat.obj", False),
        ("snake", "easyenemy/OBJ/Snake.obj", False),
    ],
    "troll": [
        ("dino", "Big/glTF/Dino.gltf", False),
        ("mushroom", "Big/glTF/MushroomKing.gltf", False),
        ("cactoro", "Big/glTF/Cactoro.gltf", False),
    ],
    "ogre": [
        ("dino", "Big/glTF/Dino.gltf", False),
        ("alien", "Big/glTF/Alien.gltf", False),
        ("monkroose", "Big/glTF/Monkroose.gltf", False),
    ],
    "warlord": [
        ("skeleton", "animatedmonster/OBJ/Skeleton.obj", False),
        ("ninja", "Big/glTF/Ninja.gltf", False),
        ("mushroom", "Big/glTF/MushroomKing.gltf", False),
    ],
    "hellbat": [
        ("bat", "animatedmonster/OBJ/Bat.obj", True),
        ("wasp", "easyenemy/OBJ/Wasp.obj", True),
        ("birb", "Big/glTF/Birb.gltf", True),
    ],
    "wyvern": [
        ("dragon", "animatedmonster/OBJ/Dragon.obj", True),
        ("wasp", "easyenemy/OBJ/Wasp.obj", True),
        ("bat", "animatedmonster/OBJ/Bat.obj", True),
    ],
    "drake": [
        ("dragon", "animatedmonster/OBJ/Dragon.obj", True),
        ("alien", "Big/glTF/Alien.gltf", False),
        ("mushroom", "Big/glTF/MushroomKing.gltf", False),
    ],
}


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def import_model(path: str):
    ext = os.path.splitext(path)[1].lower()
    if ext in {".gltf", ".glb"}:
        bpy.ops.import_scene.gltf(filepath=path)
    elif ext == ".fbx":
        bpy.ops.import_scene.fbx(filepath=path)
    elif ext == ".obj":
        if hasattr(bpy.ops.wm, "obj_import"):
            bpy.ops.wm.obj_import(filepath=path)
        else:
            bpy.ops.import_scene.obj(filepath=path)
    else:
        raise SystemExit(f"unsupported model: {path}")


def pick_idle_action():
    prefer = ("flying_idle", "idle_2", "idle", "flying", "walk")
    skip = ("jump", "hit", "react", "death", "attack")
    actions = list(bpy.data.actions)
    if not actions:
        return None
    lower = [(a, a.name.lower()) for a in actions]
    for key in prefer:
        for a, n in lower:
            if key in n and not any(s in n for s in skip):
                return a
    return actions[0]


def apply_idle_pose():
    action = pick_idle_action()
    if action is None:
        return
    scene = bpy.context.scene
    scene.frame_start = int(action.frame_range[0])
    scene.frame_end = int(action.frame_range[1])
    mid = int((scene.frame_start + scene.frame_end) / 2)
    for ob in scene.objects:
        if ob.type != "ARMATURE":
            continue
        if ob.animation_data is None:
            ob.animation_data_create()
        ob.animation_data.action = action
        ob.hide_render = True
    scene.frame_set(mid)
    bpy.context.view_layer.update()


def mesh_bounds():
    deps = bpy.context.evaluated_depsgraph_get()
    inf = 1e9
    mn = Vector((inf, inf, inf))
    mx = Vector((-inf, -inf, -inf))
    found = False
    for ob in bpy.context.scene.objects:
        if ob.type != "MESH" or ob.hide_render:
            continue
        ev = ob.evaluated_get(deps)
        me = ev.to_mesh()
        try:
            if not me.vertices:
                continue
            found = True
            for v in me.vertices:
                w = ev.matrix_world @ v.co
                mn.x, mn.y, mn.z = min(mn.x, w.x), min(mn.y, w.y), min(mn.z, w.z)
                mx.x, mx.y, mx.z = max(mx.x, w.x), max(mx.y, w.y), max(mx.z, w.z)
        finally:
            ev.to_mesh_clear()
    if not found:
        raise RuntimeError("no mesh after import")
    return mn, mx


def setup_camera_and_lights(air: bool):
    mn, mx = mesh_bounds()
    center = (mn + mx) * 0.5
    size = max((mx - mn).x, (mx - mn).y, (mx - mn).z, 0.01)
    dist = size * 2.2
    cam_mul = (0.72, -0.98, 0.20) if air else (0.55, -0.74, 0.46)

    cam_data = bpy.data.cameras.new("cam")
    cam_data.type = "ORTHO"
    cam_data.ortho_scale = size * (1.58 if air else 1.38)
    cam = bpy.data.objects.new("cam", cam_data)
    cam.location = center + Vector((dist * cam_mul[0], dist * cam_mul[1], dist * cam_mul[2]))
    bpy.context.scene.collection.objects.link(cam)
    bpy.context.scene.camera = cam

    track = cam.constraints.new("TRACK_TO")
    empty = bpy.data.objects.new("look", None)
    empty.location = center + Vector((0, 0, size * 0.08))
    bpy.context.scene.collection.objects.link(empty)
    track.target = empty
    track.track_axis = "TRACK_NEGATIVE_Z"
    track.up_axis = "UP_Y"

    sun_data = bpy.data.lights.new("sun", "SUN")
    sun_data.energy = 7.4
    sun_data.angle = 0.06
    sun = bpy.data.objects.new("sun", sun_data)
    sun.rotation_euler = (radians(48), radians(6), radians(28))
    bpy.context.scene.collection.objects.link(sun)

    fill_data = bpy.data.lights.new("fill", "AREA")
    fill_data.energy = 24
    fill_data.size = size * 2.2
    fill = bpy.data.objects.new("fill", fill_data)
    fill.location = center + Vector((-dist * 0.85, dist * 0.4, dist * 0.55))
    bpy.context.scene.collection.objects.link(fill)

    rim_data = bpy.data.lights.new("rim", "AREA")
    rim_data.energy = 125
    rim_data.size = size * 1.8
    rim_data.color = (1.0, 0.78, 0.55)
    rim = bpy.data.objects.new("rim", rim_data)
    rim.location = center + Vector((dist * 0.35, dist * 0.95, dist * 0.25))
    bpy.context.scene.collection.objects.link(rim)

    if hasattr(bpy.context.scene.eevee, "use_shadows"):
        bpy.context.scene.eevee.use_shadows = True


def setup_render(out_path: str):
    scene = bpy.context.scene
    scene.render.resolution_x = 768
    scene.render.resolution_y = 960
    scene.render.film_transparent = True
    scene.render.filepath = out_path
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    engine = "BLENDER_EEVEE_NEXT"
    if engine not in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items.keys():
        engine = "BLENDER_EEVEE"
    scene.render.engine = engine
    if hasattr(scene.eevee, "taa_render_samples"):
        scene.eevee.taa_render_samples = 32
    world = bpy.data.worlds.new("world")
    scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs[0].default_value = (0.05, 0.05, 0.06, 1)
    bg.inputs[1].default_value = 0.18


def bake_one(rel: str, air: bool, dest: str):
    path = os.path.join(CACHE, rel)
    if not os.path.isfile(path):
        raise FileNotFoundError(path)
    reset_scene()
    import_model(path)
    apply_idle_pose()
    setup_camera_and_lights(air)
    setup_render(dest)
    bpy.ops.render.render(write_still=True)
    print(f"wrote {dest}")


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    for slot, opts in BODIES.items():
        slot_dir = os.path.join(OUT_DIR, slot)
        os.makedirs(slot_dir, exist_ok=True)
        for name, rel, air in opts:
            dest = os.path.join(slot_dir, f"{name}.png")
            print(f"== {slot}/{name} ← {rel} ==")
            bake_one(rel, air, dest)


if __name__ == "__main__":
    main()
