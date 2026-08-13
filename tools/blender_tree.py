"""Headless Blender: orthographic tree billboard with transparent background."""

import sys
from math import radians

import bpy

out = "tree.png"
if "--" in sys.argv:
    out = sys.argv[sys.argv.index("--") + 1]

bpy.ops.wm.read_factory_settings(use_empty=True)

bpy.ops.mesh.primitive_cylinder_add(radius=0.12, depth=0.7, location=(0, 0, 0.35))
trunk = bpy.context.object
trunk.name = "trunk"
mat_t = bpy.data.materials.new("trunk")
mat_t.use_nodes = True
mat_t.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.28, 0.16, 0.1, 1)
mat_t.node_tree.nodes["Principled BSDF"].inputs["Roughness"].default_value = 0.85
trunk.data.materials.append(mat_t)

bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.52, location=(0, 0, 0.95))
canopy = bpy.context.object
canopy.name = "canopy"
canopy.scale = (1.05, 1.05, 0.9)
mat_c = bpy.data.materials.new("canopy")
mat_c.use_nodes = True
bsdf = mat_c.node_tree.nodes["Principled BSDF"]
bsdf.inputs["Base Color"].default_value = (0.18, 0.45, 0.2, 1)
bsdf.inputs["Roughness"].default_value = 0.7
canopy.data.materials.append(mat_c)

bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.32, location=(-0.22, 0.1, 1.12))
leaf = bpy.context.object
leaf.data.materials.append(mat_c)

cam_data = bpy.data.cameras.new("cam")
cam_data.type = "ORTHO"
cam_data.ortho_scale = 2.15
cam = bpy.data.objects.new("cam", cam_data)
cam.location = (1.8, -1.9, 1.55)
cam.rotation_euler = (radians(62), 0, radians(43))
bpy.context.scene.collection.objects.link(cam)
bpy.context.scene.camera = cam

light_data = bpy.data.lights.new("sun", "SUN")
light_data.energy = 3.2
light_data.angle = 0.12
sun = bpy.data.objects.new("sun", light_data)
sun.rotation_euler = (radians(40), radians(10), radians(30))
bpy.context.scene.collection.objects.link(sun)

fill_data = bpy.data.lights.new("fill", "AREA")
fill_data.energy = 40
fill = bpy.data.objects.new("fill", fill_data)
fill.location = (-1.4, 1.2, 2.0)
bpy.context.scene.collection.objects.link(fill)

scene = bpy.context.scene
scene.render.resolution_x = 160
scene.render.resolution_y = 192
scene.render.film_transparent = True
scene.render.filepath = out
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGBA"

engine = "BLENDER_EEVEE_NEXT"
if engine not in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items.keys():
    engine = "BLENDER_EEVEE"
scene.render.engine = engine

bpy.ops.render.render(write_still=True)
print(f"wrote {out}")
