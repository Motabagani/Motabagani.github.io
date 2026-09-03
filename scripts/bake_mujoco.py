"""
bake_mujoco.py — record a MuJoCo model's motion into a compact JSON that the
website's Three.js viewer plays back (no physics in the browser).

Run this LOCALLY in your MuJoCo env, in the folder with your model + meshes/:

    pip install mujoco numpy
    python bake_mujoco.py RigidModelFinal.xml rigid.json
    python bake_mujoco.py softmodelfinal.xml  soft.json

Then send me rigid.json / soft.json — I drop them into the site and the viewer
plays them. The geometry (shapes, sizes, colors), the referenced STL mesh, and
any soft-body (flex) surface are all embedded, so no extra files are needed.

Notes:
  * DURATION / FPS below control how much you record and how smooth it is.
  * CONTROL is a simple actuator sweep so the delta robot moves; tweak it to
    reproduce whatever motion you want to show off.
  * flex/soft-body export uses newer-MuJoCo APIs; if your version errors on the
    flex section, send me the traceback and I'll adjust it.
"""
import sys
import json
import numpy as np
import mujoco

XML = sys.argv[1] if len(sys.argv) > 1 else "softmodelfinal.xml"
OUT = sys.argv[2] if len(sys.argv) > 2 else "trajectory.json"

DURATION = 6.0   # seconds of motion to record
FPS = 30         # playback frames per second


def control(data, model, t):
    """Simple sweep of the position actuators — edit to taste."""
    for a in range(model.nu):
        data.ctrl[a] = 0.7 * np.sin(2 * np.pi * 0.25 * t + a * (2 * np.pi / 3.0))


GEOM_TYPES = {
    int(mujoco.mjtGeom.mjGEOM_PLANE): "plane",
    int(mujoco.mjtGeom.mjGEOM_SPHERE): "sphere",
    int(mujoco.mjtGeom.mjGEOM_CAPSULE): "capsule",
    int(mujoco.mjtGeom.mjGEOM_CYLINDER): "cylinder",
    int(mujoco.mjtGeom.mjGEOM_BOX): "box",
    int(mujoco.mjtGeom.mjGEOM_ELLIPSOID): "ellipsoid",
    int(mujoco.mjtGeom.mjGEOM_MESH): "mesh",
}


def main():
    model = mujoco.MjModel.from_xml_path(XML)
    data = mujoco.MjData(model)

    # --- static geometry (skip the ground plane so it doesn't fill the view) ---
    geoms = []
    for i in range(model.ngeom):
        gtype = GEOM_TYPES.get(int(model.geom_type[i]), "unknown")
        if gtype == "plane":
            geoms.append(None)  # keep index alignment; viewer ignores nulls
            continue
        entry = {
            "type": gtype,
            "size": [float(x) for x in model.geom_size[i]],
            "rgba": [float(x) for x in model.geom_rgba[i]],
        }
        if gtype == "mesh":
            entry["mesh"] = int(model.geom_dataid[i])
        geoms.append(entry)

    # --- meshes: embed vertices + triangle faces ---
    meshes = []
    for m in range(model.nmesh):
        va, vn = int(model.mesh_vertadr[m]), int(model.mesh_vertnum[m])
        fa, fn = int(model.mesh_faceadr[m]), int(model.mesh_facenum[m])
        verts = np.array(model.mesh_vert[va:va + vn]).reshape(-1, 3)
        faces = np.array(model.mesh_face[fa:fa + fn]).reshape(-1, 3)
        meshes.append({
            "vertices": [round(float(x), 5) for x in verts.flatten()],
            "faces": [int(x) for x in faces.flatten()],
        })

    # --- flex (soft bodies): surface faces (static) + vertices per frame ---
    flexes = []
    have_flex = getattr(model, "nflex", 0) > 0
    for f in range(getattr(model, "nflex", 0)):
        try:
            ea, en = int(model.flex_elemadr[f]), int(model.flex_elemnum[f])
            dim = int(model.flex_dim[f])
            elems = np.array(model.flex_elem[ea * (dim + 1): (ea + en) * (dim + 1)]).reshape(-1, dim + 1)
            # tris for the surface: dim==2 -> triangles directly; dim==3 -> tetra faces
            if dim == 2:
                tris = elems[:, :3]
            elif dim == 3:
                tris = np.vstack([elems[:, [0, 1, 2]], elems[:, [0, 1, 3]],
                                  elems[:, [0, 2, 3]], elems[:, [1, 2, 3]]])
            else:
                tris = np.zeros((0, 3), dtype=int)
            rgba = [float(x) for x in model.flex_rgba[f]] if hasattr(model, "flex_rgba") else [0.2, 0.7, 0.2, 1]
            flexes.append({"faces": [int(x) for x in tris.flatten()], "rgba": rgba,
                           "vertadr": int(model.flex_vertadr[f]), "vertnum": int(model.flex_vertnum[f])})
        except Exception as e:  # noqa
            print("flex", f, "skipped:", e)

    # --- run + record ---
    frames = []
    flex_frames = [[] for _ in flexes]
    steps_per_frame = max(1, int(round((1.0 / FPS) / model.opt.timestep)))
    nframes = int(DURATION * FPS)
    quat = np.zeros(4)
    for fi in range(nframes):
        t = fi / FPS
        control(data, model, t)
        for _ in range(steps_per_frame):
            mujoco.mj_step(model, data)
        frame = []
        for i in range(model.ngeom):
            if geoms[i] is None:
                frame.append(None)
                continue
            p = data.geom_xpos[i]
            mujoco.mju_mat2Quat(quat, np.array(data.geom_xmat[i]).flatten())
            frame.append([round(float(p[0]), 4), round(float(p[1]), 4), round(float(p[2]), 4),
                          round(float(quat[0]), 5), round(float(quat[1]), 5),
                          round(float(quat[2]), 5), round(float(quat[3]), 5)])
        frames.append(frame)
        for j, fx in enumerate(flexes):
            vp = np.array(data.flexvert_xpos[fx["vertadr"]:fx["vertadr"] + fx["vertnum"]]).reshape(-1, 3)
            flex_frames[j].append([round(float(x), 4) for x in vp.flatten()])

    out = {
        "fps": FPS,
        "geoms": geoms,
        "meshes": meshes,
        "flexes": [{"faces": fx["faces"], "rgba": fx["rgba"]} for fx in flexes],
        "frames": frames,
        "flexFrames": flex_frames,
    }
    with open(OUT, "w") as fh:
        json.dump(out, fh)
    print(f"wrote {OUT}: {len(frames)} frames, {len([g for g in geoms if g])} geoms, "
          f"{len(flexes)} flex, {'has' if have_flex else 'no'} soft-body")


if __name__ == "__main__":
    main()
