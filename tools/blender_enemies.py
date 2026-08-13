"""Headless Blender: sprite billboards from CC0 Quaternius glTF/FBX models.

Clay primitives could not carry faces or weapons. These are finished low-poly
meshes, lit the same way as the tree, written as transparent PNGs.
"""

from __future__ import annotations

import os
import sys
from math import radians

import bpy
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CACHE = os.path.join(ROOT, "tools", "cache", "quaternius")
OUT_DIR = os.path.join(ROOT, "public", "sprites", "enemies")
if "--" in sys.argv:
    OUT_DIR = sys.argv[sys.argv.index("--") + 1]

# Slot → finished model. Names in the gallery stay the picks; these are the meshes.
ROSTER = [
    ("goblin", "Big/glTF/Tribal.gltf"),
    ("raider", "Big/glTF/Orc.gltf"),
    ("imp", "Big/glTF/Demon.gltf"),
    ("warg", "animals/glTF/Wolf.gltf"),
    ("troll", "Big/glTF/Yeti.gltf"),
    ("ogre", "Big/glTF/BlueDemon.gltf"),
    ("warlord", "Big/glTF/Orc_Skull.gltf"),
    ("hellbat", "Flying/glTF/Demon.gltf"),
    ("wyvern", "Flying/glTF/Dragon.gltf"),
    ("drake", "Flying/glTF/Dragon_Evolved.gltf"),
]


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def import_model(path: str):
    ext = os.path.splitext(path)[1].lower()
    if ext in {".gltf", ".glb"}:
        bpy.ops.import_scene.gltf(filepath=path)
    elif ext == ".fbx":
        bpy.ops.import_scene.fbx(filepath=path)
    elif ext == ".blend":
        bpy.ops.wm.append(
            filepath=os.path.join(path, "Object", "Bat"),
            directory=os.path.join(path, "Object") + os.sep,
            filename="Bat",
        )
    else:
        raise SystemExit(f"unsupported model: {path}")


def pick_idle_action():
    prefer = ("flying_idle", "bat_flying", "idle_2", "idle", "flying")
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


def drop_stray_meshes():
    """Factory / importer leftovers inflate the camera frame."""
    for ob in list(bpy.context.scene.objects):
        if ob.type == "MESH" and ob.name.startswith("Icosphere") and ob.parent is None:
            bpy.data.objects.remove(ob, do_unlink=True)


def lift_dark_materials():
    """Near-black CC0 mats vanish on a transparent sprite. Lift just enough to read."""
    for mat in bpy.data.materials:
        if not mat.use_nodes:
            continue
        bsdf = next((n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED"), None)
        if bsdf is None:
            continue
        sock = bsdf.inputs.get("Base Color")
        if sock is None or sock.is_linked:
            continue
        col = list(sock.default_value)
        lum = 0.2126 * col[0] + 0.7152 * col[1] + 0.0722 * col[2]
        if lum >= 0.08:
            continue
        for i in range(3):
            col[i] = min(1.0, col[i] * 5.0 + 0.06)
        sock.default_value = col


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


def setup_camera_and_lights():
    mn, mx = mesh_bounds()
    center = (mn + mx) * 0.5
    size = max((mx - mn).x, (mx - mn).y, (mx - mn).z, 0.01)
    dist = size * 2.2

    cam_data = bpy.data.cameras.new("cam")
    cam_data.type = "ORTHO"
    cam_data.ortho_scale = size * 1.72
    cam = bpy.data.objects.new("cam", cam_data)
    cam.location = center + Vector((dist * 0.72, -dist * 0.88, dist * 0.62))
    bpy.context.scene.collection.objects.link(cam)
    bpy.context.scene.camera = cam

    track = cam.constraints.new("TRACK_TO")
    empty = bpy.data.objects.new("look", None)
    empty.location = center + Vector((0, 0, size * 0.05))
    bpy.context.scene.collection.objects.link(empty)
    track.target = empty
    track.track_axis = "TRACK_NEGATIVE_Z"
    track.up_axis = "UP_Y"

    sun_data = bpy.data.lights.new("sun", "SUN")
    sun_data.energy = 4.2
    sun_data.angle = 0.18
    sun = bpy.data.objects.new("sun", sun_data)
    sun.rotation_euler = (radians(42), radians(8), radians(28))
    bpy.context.scene.collection.objects.link(sun)

    fill_data = bpy.data.lights.new("fill", "AREA")
    fill_data.energy = 90
    fill_data.size = size * 2.5
    fill = bpy.data.objects.new("fill", fill_data)
    fill.location = center + Vector((-dist * 0.8, dist * 0.5, dist * 0.7))
    bpy.context.scene.collection.objects.link(fill)

    rim_data = bpy.data.lights.new("rim", "AREA")
    rim_data.energy = 55
    rim_data.size = size * 2.0
    rim_data.color = (1.0, 0.92, 0.82)
    rim = bpy.data.objects.new("rim", rim_data)
    rim.location = center + Vector((dist * 0.4, dist * 0.9, dist * 0.3))
    bpy.context.scene.collection.objects.link(rim)


def setup_render(out_path: str):
    scene = bpy.context.scene
    scene.render.resolution_x = 512
    scene.render.resolution_y = 640
    scene.render.film_transparent = True
    scene.render.filepath = out_path
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    engine = "BLENDER_EEVEE_NEXT"
    if engine not in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items.keys():
        engine = "BLENDER_EEVEE"
    scene.render.engine = engine
    world = bpy.data.worlds.new("world")
    scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs[0].default_value = (0.08, 0.09, 0.11, 1)
    bg.inputs[1].default_value = 0.35


def bake_one(slot: str, rel: str):
    path = os.path.join(CACHE, rel)
    if not os.path.isfile(path):
        raise FileNotFoundError(path)
    reset_scene()
    import_model(path)
    drop_stray_meshes()
    apply_idle_pose()
    lift_dark_materials()
    setup_camera_and_lights()
    out = os.path.join(OUT_DIR, f"{slot}.png")
    setup_render(out)
    bpy.ops.render.render(write_still=True)
    print(f"wrote {out}")


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    for slot, rel in ROSTER:
        print(f"== {slot} ← {rel} ==")
        bake_one(slot, rel)


if __name__ == "__main__":
    main()
