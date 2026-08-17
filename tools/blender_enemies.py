"""Headless Blender: Quaternius billboards with a grit pass.

Bump, dirtier palettes, tusks, wolf fur, harder light. The meshes stay
low-poly — this is surface, not a new sculpt.
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

# hsv: HueSat (0.5 hue = no shift). multiply: grime overlay. tusks: relative size. fur: hair length or 0.
LOOKS = {
    "goblin": {"hsv": (0.52, 0.72, 0.70), "mul": (0.42, 0.48, 0.28), "fac": 0.42, "bump": 0.45, "tusks": 0.85, "fur": 0.0, "air": False},
    "raider": {"hsv": (0.48, 0.68, 0.64), "mul": (0.32, 0.40, 0.18), "fac": 0.48, "bump": 0.42, "tusks": 1.15, "fur": 0.0, "air": False},
    "imp": {"hsv": (0.50, 0.78, 0.62), "mul": (0.38, 0.10, 0.08), "fac": 0.40, "bump": 0.50, "tusks": 0.70, "fur": 0.0, "air": False},
    "warg": {"hsv": (0.50, 0.55, 0.52), "mul": (0.18, 0.12, 0.08), "fac": 0.55, "bump": 0.22, "tusks": 1.05, "fur": 0.0, "air": False},
    "troll": {"hsv": (0.58, 0.55, 0.72), "mul": (0.40, 0.42, 0.28), "fac": 0.50, "bump": 0.55, "tusks": 1.35, "fur": 0.0, "air": False},
    "ogre": {"hsv": (0.62, 0.55, 0.60), "mul": (0.22, 0.28, 0.32), "fac": 0.45, "bump": 0.48, "tusks": 1.20, "fur": 0.0, "air": False},
    "warlord": {"hsv": (0.47, 0.62, 0.58), "mul": (0.30, 0.34, 0.16), "fac": 0.50, "bump": 0.40, "tusks": 1.25, "fur": 0.0, "air": False},
    "hellbat": {"hsv": (0.50, 0.70, 0.55), "mul": (0.28, 0.06, 0.06), "fac": 0.46, "bump": 0.38, "tusks": 0.80, "fur": 0.0, "air": True},
    "wyvern": {"hsv": (0.38, 0.75, 0.62), "mul": (0.22, 0.40, 0.16), "fac": 0.52, "bump": 0.55, "tusks": 1.10, "fur": 0.0, "air": True},
    "drake": {"hsv": (0.72, 0.70, 0.58), "mul": (0.32, 0.16, 0.42), "fac": 0.50, "bump": 0.52, "tusks": 1.20, "fur": 0.0, "air": True},
}

WOLF_COLORS = {
    "Main": (0.14, 0.10, 0.07, 1.0),
    "Main_Light": (0.32, 0.24, 0.14, 1.0),
    "Nose": (0.04, 0.03, 0.02, 1.0),
    "Eyes_Black": (0.02, 0.02, 0.02, 1.0),
}


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def import_model(path: str):
    ext = os.path.splitext(path)[1].lower()
    if ext in {".gltf", ".glb"}:
        bpy.ops.import_scene.gltf(filepath=path)
    elif ext == ".fbx":
        bpy.ops.import_scene.fbx(filepath=path)
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
    for ob in list(bpy.context.scene.objects):
        if ob.type == "MESH" and ob.name.startswith("Icosphere") and ob.parent is None:
            bpy.data.objects.remove(ob, do_unlink=True)


def _new_mix(nt):
    try:
        n = nt.nodes.new("ShaderNodeMixRGB")
        n.blend_type = "MULTIPLY"
        return n, "Fac", "Color1", "Color2", "Color"
    except RuntimeError:
        n = nt.nodes.new("ShaderNodeMix")
        n.data_type = "RGBA"
        n.blend_type = "MULTIPLY"
        return n, "Factor", "A", "B", "Result"


def dress_material(mat, look, slot: str):
    if not mat.use_nodes:
        return
    nt = mat.node_tree
    bsdf = next((n for n in nt.nodes if n.type == "BSDF_PRINCIPLED"), None)
    if bsdf is None:
        return

    if slot == "warg" and mat.name in WOLF_COLORS:
        bsdf.inputs["Base Color"].default_value = WOLF_COLORS[mat.name]
        if "Eye" in mat.name:
            if "Emission Color" in bsdf.inputs:
                bsdf.inputs["Emission Color"].default_value = (0.95, 0.55, 0.08, 1)
            if "Emission Strength" in bsdf.inputs:
                bsdf.inputs["Emission Strength"].default_value = 4.0

    color_sock = bsdf.inputs.get("Base Color")
    if color_sock is None:
        return

    hsv = nt.nodes.new("ShaderNodeHueSaturation")
    hsv.inputs["Hue"].default_value = look["hsv"][0]
    hsv.inputs["Saturation"].default_value = look["hsv"][1]
    hsv.inputs["Value"].default_value = look["hsv"][2]
    hsv.location = (-360, 200)

    mix, f_in, a_in, b_in, out_n = _new_mix(nt)
    mix.inputs[f_in].default_value = look["fac"]
    mix.inputs[b_in].default_value = (*look["mul"], 1.0)
    mix.location = (-180, 200)

    if color_sock.is_linked:
        src = color_sock.links[0].from_socket
        nt.links.remove(color_sock.links[0])
        nt.links.new(src, hsv.inputs["Color"])
    else:
        rgb = nt.nodes.new("ShaderNodeRGB")
        rgb.outputs[0].default_value = list(color_sock.default_value)
        nt.links.new(rgb.outputs[0], hsv.inputs["Color"])
    nt.links.new(hsv.outputs["Color"], mix.inputs[a_in])
    nt.links.new(mix.outputs[out_n], color_sock)

    tex = nt.nodes.new("ShaderNodeTexNoise")
    tex.inputs["Scale"].default_value = 18.0
    tex.inputs["Detail"].default_value = 6.0
    tex.location = (-560, -40)
    vor = nt.nodes.new("ShaderNodeTexVoronoi")
    vor.feature = "F1"
    vor.inputs["Scale"].default_value = 9.0
    vor.location = (-560, -220)
    add = nt.nodes.new("ShaderNodeMath")
    add.operation = "MULTIPLY"
    add.inputs[1].default_value = 0.55
    add.location = (-340, -80)
    nt.links.new(tex.outputs["Fac"], add.inputs[0])
    dist = vor.outputs.get("Distance") or vor.outputs[0]
    nt.links.new(dist, add.inputs[1])
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = look["bump"]
    bump.inputs["Distance"].default_value = 0.12
    bump.location = (-180, -80)
    nt.links.new(add.outputs["Value"], bump.inputs["Height"])
    nrm = bsdf.inputs.get("Normal")
    if nrm:
        nt.links.new(bump.outputs["Normal"], nrm)

    if "Roughness" in bsdf.inputs and not bsdf.inputs["Roughness"].is_linked:
        bsdf.inputs["Roughness"].default_value = 0.78
    if "Specular IOR Level" in bsdf.inputs:
        bsdf.inputs["Specular IOR Level"].default_value = 0.22


def dress_all(slot: str):
    look = LOOKS[slot]
    for mat in bpy.data.materials:
        dress_material(mat, look, slot)


def body_size():
    mn, mx = mesh_bounds()
    return (mn + mx) * 0.5, max((mx - mn).x, (mx - mn).y, (mx - mn).z, 0.01)


def ivory():
    m = bpy.data.materials.new("ivory")
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (0.84, 0.76, 0.58, 1)
    if "Roughness" in b.inputs:
        b.inputs["Roughness"].default_value = 0.38
    return m


def add_tusks(scale: float):
    if scale <= 0:
        return
    arm = next((o for o in bpy.context.scene.objects if o.type == "ARMATURE"), None)
    if arm is None:
        return
    bone = arm.pose.bones.get("Head")
    if bone is None:
        return
    bpy.context.view_layer.update()
    head = (arm.matrix_world @ bone.matrix).translation
    _, size = body_size()
    length = size * 0.11 * scale
    rad = length * 0.22
    mat = ivory()
    for side in (-1.0, 1.0):
        bpy.ops.mesh.primitive_cone_add(
            vertices=8,
            radius1=rad,
            radius2=rad * 0.08,
            depth=length,
            location=head + Vector((side * size * 0.055, -size * 0.11, -size * 0.05)),
        )
        tusk = bpy.context.object
        tusk.rotation_euler = (radians(108), 0, side * radians(22))
        tusk.data.materials.append(mat)
        tusk.name = "tusk"


def add_fur(length: float):
    if length <= 0:
        return
    body = next(
        (o for o in bpy.context.scene.objects if o.type == "MESH" and "Wolf" in o.name),
        None,
    )
    if body is None:
        return
    fur = bpy.data.materials.new("fur")
    fur.use_nodes = True
    b = fur.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (0.16, 0.11, 0.07, 1)
    if "Roughness" in b.inputs:
        b.inputs["Roughness"].default_value = 0.92
    if "Sheen Weight" in b.inputs:
        b.inputs["Sheen Weight"].default_value = 0.6
    body.data.materials.append(fur)

    bpy.ops.object.select_all(action="DESELECT")
    body.select_set(True)
    bpy.context.view_layer.objects.active = body
    bpy.ops.object.particle_system_add()
    ps = body.particle_systems[-1]
    s = ps.settings
    s.type = "HAIR"
    s.count = 420
    s.hair_length = length
    s.child_type = "SIMPLE"
    s.child_percent = 40
    s.rendered_child_count = 3
    s.use_modifier_stack = True
    s.factor_random = 0.35
    s.clump_factor = 0.55
    s.roughness_1 = 0.18
    s.material = len(body.material_slots)


def mesh_bounds():
    deps = bpy.context.evaluated_depsgraph_get()
    inf = 1e9
    mn = Vector((inf, inf, inf))
    mx = Vector((-inf, -inf, -inf))
    found = False
    for ob in bpy.context.scene.objects:
        if ob.type != "MESH" or ob.hide_render:
            continue
        if ob.name.startswith("tusk"):
            continue
        if ob.particle_systems:
            found = True
            for corner in ob.bound_box:
                w = ob.matrix_world @ Vector(corner)
                mn.x, mn.y, mn.z = min(mn.x, w.x), min(mn.y, w.y), min(mn.z, w.z)
                mx.x, mx.y, mx.z = max(mx.x, w.x), max(mx.y, w.y), max(mx.z, w.z)
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


# live = in-game billboard. punch/hero = quality-ladder rebakes (same mesh).
RUNGS = {
    "live": {
        "ortho_g": 1.78,
        "ortho_a": 2.05,
        "res": (640, 800),
        "sun": 5.4,
        "fill": 36,
        "rim": 70,
        "cam_g": (0.72, -0.88, 0.62),
        "cam_a": (0.95, -1.2, 0.28),
        "look_z": 0.04,
        "samples": 16,
    },
    "punch": {
        "ortho_g": 1.38,
        "ortho_a": 1.58,
        "res": (768, 960),
        "sun": 7.4,
        "fill": 24,
        "rim": 125,
        "cam_g": (0.55, -0.74, 0.46),
        "cam_a": (0.72, -0.98, 0.20),
        "look_z": 0.08,
        "samples": 32,
    },
    "hero": {
        "ortho_g": 1.08,
        "ortho_a": 1.22,
        "res": (960, 1200),
        "sun": 8.8,
        "fill": 18,
        "rim": 170,
        "cam_g": (0.42, -0.58, 0.34),
        "cam_a": (0.55, -0.78, 0.14),
        "look_z": 0.14,
        "samples": 48,
    },
}


def parse_cli():
    args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    out = OUT_DIR
    rung = "live"
    i = 0
    while i < len(args):
        if args[i] == "--rung" and i + 1 < len(args):
            rung = args[i + 1]
            i += 2
            continue
        if args[i] == "--out" and i + 1 < len(args):
            out = args[i + 1]
            i += 2
            continue
        if not args[i].startswith("-"):
            out = args[i]
        i += 1
    if rung not in RUNGS:
        raise SystemExit(f"unknown rung {rung}; use {', '.join(RUNGS)}")
    return rung, out


def setup_camera_and_lights(air: bool = False, rung: str = "live"):
    prof = RUNGS[rung]
    mn, mx = mesh_bounds()
    center = (mn + mx) * 0.5
    size = max((mx - mn).x, (mx - mn).y, (mx - mn).z, 0.01)
    dist = size * 2.2
    cam_mul = prof["cam_a"] if air else prof["cam_g"]

    cam_data = bpy.data.cameras.new("cam")
    cam_data.type = "ORTHO"
    cam_data.ortho_scale = size * (prof["ortho_a"] if air else prof["ortho_g"])
    cam = bpy.data.objects.new("cam", cam_data)
    cam.location = center + Vector((dist * cam_mul[0], dist * cam_mul[1], dist * cam_mul[2]))
    bpy.context.scene.collection.objects.link(cam)
    bpy.context.scene.camera = cam

    track = cam.constraints.new("TRACK_TO")
    empty = bpy.data.objects.new("look", None)
    empty.location = center + Vector((0, 0, size * prof["look_z"]))
    bpy.context.scene.collection.objects.link(empty)
    track.target = empty
    track.track_axis = "TRACK_NEGATIVE_Z"
    track.up_axis = "UP_Y"

    sun_data = bpy.data.lights.new("sun", "SUN")
    sun_data.energy = prof["sun"]
    sun_data.angle = 0.06 if rung != "live" else 0.08
    sun = bpy.data.objects.new("sun", sun_data)
    sun.rotation_euler = (radians(52 if rung == "hero" else 48), radians(6), radians(28))
    bpy.context.scene.collection.objects.link(sun)

    fill_data = bpy.data.lights.new("fill", "AREA")
    fill_data.energy = prof["fill"]
    fill_data.size = size * 2.2
    fill_data.color = (0.55, 0.68, 0.95) if rung == "hero" else (1, 1, 1)
    fill = bpy.data.objects.new("fill", fill_data)
    fill.location = center + Vector((-dist * 0.85, dist * 0.4, dist * 0.55))
    bpy.context.scene.collection.objects.link(fill)

    rim_data = bpy.data.lights.new("rim", "AREA")
    rim_data.energy = prof["rim"]
    rim_data.size = size * 1.8
    rim_data.color = (1.0, 0.78, 0.55)
    rim = bpy.data.objects.new("rim", rim_data)
    rim.location = center + Vector((dist * 0.35, dist * 0.95, dist * 0.25))
    bpy.context.scene.collection.objects.link(rim)

    if hasattr(bpy.context.scene.eevee, "use_shadows"):
        bpy.context.scene.eevee.use_shadows = True


def setup_render(out_path: str, rung: str = "live"):
    prof = RUNGS[rung]
    scene = bpy.context.scene
    scene.render.resolution_x = prof["res"][0]
    scene.render.resolution_y = prof["res"][1]
    scene.render.film_transparent = True
    scene.render.filepath = out_path
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    engine = "BLENDER_EEVEE_NEXT"
    if engine not in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items.keys():
        engine = "BLENDER_EEVEE"
    scene.render.engine = engine
    if hasattr(scene.eevee, "taa_render_samples"):
        scene.eevee.taa_render_samples = prof["samples"]
    world = bpy.data.worlds.new("world")
    scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs[0].default_value = (0.05, 0.05, 0.06, 1)
    bg.inputs[1].default_value = 0.18


def bake_one(slot: str, rel: str, rung: str = "live", out_dir: str | None = None):
    path = os.path.join(CACHE, rel)
    if not os.path.isfile(path):
        raise FileNotFoundError(path)
    look = LOOKS[slot]
    dest = out_dir or OUT_DIR
    reset_scene()
    import_model(path)
    drop_stray_meshes()
    apply_idle_pose()
    dress_all(slot)
    add_tusks(look["tusks"])
    add_fur(look["fur"])
    setup_camera_and_lights(bool(look.get("air")), rung)
    out = os.path.join(dest, f"{slot}.png")
    setup_render(out, rung)
    bpy.ops.render.render(write_still=True)
    print(f"wrote {out}")


def main():
    rung, dest = parse_cli()
    os.makedirs(dest, exist_ok=True)
    for slot, rel in ROSTER:
        print(f"== {slot} ← {rel} [{rung}] ==")
        bake_one(slot, rel, rung, dest)


if __name__ == "__main__":
    main()
