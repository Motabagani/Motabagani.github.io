"""
bake_grid.py — bake a delta robot's pose over a grid of its 3 actuator inputs so
the website can let visitors DRIVE the 3 arms live (no physics engine in the
browser — the viewer trilinearly interpolates between the baked poses).

For each (c1, c2, c3) on an N x N x N grid across the actuator range, we reset the
model, ramp the controls to that target, let it settle, and record every geom's
world transform. The Three.js viewer (MujocoControl.jsx) reconstructs the geoms
once and moves them to the interpolated pose as the sliders change.

    python bake_grid.py RigidModelFinal.xml cmu-rigid-grid.json

Skips the ground plane and any geom named "box test" so only the robot is baked.
"""
import sys
import json
import numpy as np
import mujoco

XML = sys.argv[1] if len(sys.argv) > 1 else "RigidModelFinal.xml"
OUT = sys.argv[2] if len(sys.argv) > 2 else "grid.json"

N = 9             # samples per actuator axis  -> N**3 poses (higher = smoother interpolation)
CMIN, CMAX = -0.7, 0.7   # actuator range to sweep (stay inside ctrlrange)
RAMP_STEPS = 3000        # steps to ramp control from neutral to target
HOLD_STEPS = 3000        # steps to settle before recording

GEOM_TYPES = {
    int(mujoco.mjtGeom.mjGEOM_PLANE): "plane",
    int(mujoco.mjtGeom.mjGEOM_SPHERE): "sphere",
    int(mujoco.mjtGeom.mjGEOM_CAPSULE): "capsule",
    int(mujoco.mjtGeom.mjGEOM_CYLINDER): "cylinder",
    int(mujoco.mjtGeom.mjGEOM_BOX): "box",
    int(mujoco.mjtGeom.mjGEOM_ELLIPSOID): "ellipsoid",
    int(mujoco.mjtGeom.mjGEOM_MESH): "mesh",
}


def geom_name(model, i):
    try:
        return mujoco.mj_id2name(model, mujoco.mjtObj.mjOBJ_GEOM, i) or ""
    except Exception:
        return ""


def main():
    model = mujoco.MjModel.from_xml_path(XML)
    data = mujoco.MjData(model)
    nu = model.nu
    assert nu >= 3, f"expected >=3 actuators, got {nu}"

    # --- which geoms to keep (skip ground plane + the red "box test") ---
    keep = []
    geoms = []
    for i in range(model.ngeom):
        gtype = GEOM_TYPES.get(int(model.geom_type[i]), "unknown")
        name = geom_name(model, i)
        # Keep the "box test" cube so the arms' interaction with it is visible.
        # Only drop the ground plane.
        if gtype == "plane":
            geoms.append(None)
            keep.append(False)
            continue
        entry = {
            "type": gtype,
            "size": [round(float(x), 5) for x in model.geom_size[i]],
            "rgba": [round(float(x), 4) for x in model.geom_rgba[i]],
        }
        if gtype == "mesh":
            entry["mesh"] = int(model.geom_dataid[i])
        geoms.append(entry)
        keep.append(True)

    # --- meshes (embed vertices + faces) ---
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

    axis = np.linspace(CMIN, CMAX, N)
    quat = np.zeros(4)

    def record_pose():
        pose = []
        for i in range(model.ngeom):
            if not keep[i]:
                continue
            p = data.geom_xpos[i]
            mujoco.mju_mat2Quat(quat, np.array(data.geom_xmat[i]).flatten())
            pose.append([round(float(p[0]), 4), round(float(p[1]), 4), round(float(p[2]), 4),
                         round(float(quat[0]), 5), round(float(quat[1]), 5),
                         round(float(quat[2]), 5), round(float(quat[3]), 5)])
        return pose

    states = []
    total = N ** 3
    for idx in range(total):
        i = idx // (N * N)
        j = (idx // N) % N
        k = idx % N
        target = np.array([axis[i], axis[j], axis[k]] + [0.0] * (nu - 3))
        mujoco.mj_resetData(model, data)
        for s in range(RAMP_STEPS):
            a = (s + 1) / RAMP_STEPS
            data.ctrl[:] = a * target
            mujoco.mj_step(model, data)
        data.ctrl[:] = target
        for _ in range(HOLD_STEPS):
            mujoco.mj_step(model, data)
        states.append(record_pose())
        if idx % 10 == 0:
            print(f"  {idx+1}/{total}", flush=True)

    out = {
        "grid": {"n": N, "min": CMIN, "max": CMAX, "axes": 3},
        "geoms": geoms,
        "meshes": meshes,
        "states": states,   # flat index = i*N*N + j*N + k
    }
    with open(OUT, "w") as fh:
        json.dump(out, fh)
    kept = len([g for g in geoms if g])
    print(f"wrote {OUT}: {total} poses, {kept} geoms per pose")


if __name__ == "__main__":
    main()
