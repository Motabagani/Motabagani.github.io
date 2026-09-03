"""
bake_grid_soft.py — like bake_grid.py, but for the SOFT DeltaZ model. In addition
to each geom's world transform, it records every flex (soft-body) vertex position
at each grid point, so the browser viewer (MujocoControl) can drive the 3 arms and
interpolate the deformable-hand shape live.

    python bake_grid_soft.py "finalmodel (copy).xml" cmu-soft-grid.json

Skips the ground plane and any "box test" geom.
"""
import sys
import json
import numpy as np
import mujoco

XML = sys.argv[1] if len(sys.argv) > 1 else "finalmodel (copy).xml"
OUT = sys.argv[2] if len(sys.argv) > 2 else "grid.json"

N = 9
CMIN, CMAX = -0.7, 0.7
RAMP_STEPS = 4000
HOLD_STEPS = 4000

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

    keep = []
    geoms = []
    for i in range(model.ngeom):
        gtype = GEOM_TYPES.get(int(model.geom_type[i]), "unknown")
        name = geom_name(model, i)
        # Keep the "box test" cube — the soft hand presses on it, which is the
        # interaction we want to show. Only drop the ground plane.
        if gtype == "plane":
            geoms.append(None); keep.append(False); continue
        entry = {"type": gtype,
                 "size": [round(float(x), 5) for x in model.geom_size[i]],
                 "rgba": [round(float(x), 4) for x in model.geom_rgba[i]]}
        if gtype == "mesh":
            entry["mesh"] = int(model.geom_dataid[i])
        geoms.append(entry); keep.append(True)

    meshes = []
    for m in range(model.nmesh):
        va, vn = int(model.mesh_vertadr[m]), int(model.mesh_vertnum[m])
        fa, fn = int(model.mesh_faceadr[m]), int(model.mesh_facenum[m])
        verts = np.array(model.mesh_vert[va:va + vn]).reshape(-1, 3)
        faces = np.array(model.mesh_face[fa:fa + fn]).reshape(-1, 3)
        meshes.append({"vertices": [round(float(x), 5) for x in verts.flatten()],
                       "faces": [int(x) for x in faces.flatten()]})

    # flex (soft bodies): static surface faces + per-state vertex positions
    flexes = []
    for f in range(int(getattr(model, "nflex", 0))):
        ea, en = int(model.flex_elemadr[f]), int(model.flex_elemnum[f])
        dim = int(model.flex_dim[f])
        elems = np.array(model.flex_elem[ea * (dim + 1): (ea + en) * (dim + 1)]).reshape(-1, dim + 1)
        if dim == 2:
            tris = elems[:, :3]
        elif dim == 3:
            tris = np.vstack([elems[:, [0, 1, 2]], elems[:, [0, 1, 3]],
                              elems[:, [0, 2, 3]], elems[:, [1, 2, 3]]])
        else:
            tris = np.zeros((0, 3), dtype=int)
        rgba = [float(x) for x in model.flex_rgba[f]] if hasattr(model, "flex_rgba") else [0.2, 0.7, 0.7, 1]
        flexes.append({"faces": [int(x) for x in tris.flatten()], "rgba": [round(x, 4) for x in rgba],
                       "vertadr": int(model.flex_vertadr[f]), "vertnum": int(model.flex_vertnum[f])})

    axis = np.linspace(CMIN, CMAX, N)
    quat = np.zeros(4)

    def record_geoms():
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

    def record_flex():
        out = []
        for fx in flexes:
            vp = np.array(data.flexvert_xpos[fx["vertadr"]:fx["vertadr"] + fx["vertnum"]]).reshape(-1, 3)
            out.append([round(float(x), 4) for x in vp.flatten()])
        return out

    states, flex_states = [], []
    total = N ** 3
    for idx in range(total):
        i, j, k = idx // (N * N), (idx // N) % N, idx % N
        target = np.array([axis[i], axis[j], axis[k]] + [0.0] * (nu - 3))
        mujoco.mj_resetData(model, data)
        for s in range(RAMP_STEPS):
            data.ctrl[:] = ((s + 1) / RAMP_STEPS) * target
            mujoco.mj_step(model, data)
        data.ctrl[:] = target
        for _ in range(HOLD_STEPS):
            mujoco.mj_step(model, data)
        states.append(record_geoms())
        flex_states.append(record_flex())
        if idx % 10 == 0:
            print(f"  {idx+1}/{total}", flush=True)

    out = {
        "grid": {"n": N, "min": CMIN, "max": CMAX, "axes": 3},
        "geoms": geoms,
        "meshes": meshes,
        "flexes": [{"faces": fx["faces"], "rgba": fx["rgba"]} for fx in flexes],
        "states": states,        # geom poses, flat index i*N*N + j*N + k
        "flexStates": flex_states,  # [state][flex] -> flat xyz vertices
    }
    with open(OUT, "w") as fh:
        json.dump(out, fh)
    print(f"wrote {OUT}: {total} poses, {len([g for g in geoms if g])} geoms, {len(flexes)} flex")


if __name__ == "__main__":
    main()
