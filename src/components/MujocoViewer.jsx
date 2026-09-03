import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* MujocoViewer — plays a motion "baked" from MuJoCo (scripts/bake_mujoco.py):
   rebuilds each geom as a Three.js mesh and replays the recorded per-frame
   world transforms (and soft-body / flex vertices). No physics in the browser.
   Props: src (path to the trajectory JSON), height. */

export function geomToMesh(g, meshes) {
  const s = g.size;
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(g.rgba[0], g.rgba[1], g.rgba[2]),
    transparent: g.rgba[3] < 1, opacity: g.rgba[3],
    metalness: 0.15, roughness: 0.55,
  });
  let geo;
  switch (g.type) {
    case 'box': geo = new THREE.BoxGeometry(2 * s[0], 2 * s[1], 2 * s[2]); break;
    case 'sphere': geo = new THREE.SphereGeometry(s[0], 24, 16); break;
    case 'ellipsoid': geo = new THREE.SphereGeometry(1, 24, 16); geo.scale(s[0], s[1], s[2]); break;
    case 'cylinder': geo = new THREE.CylinderGeometry(s[0], s[0], 2 * s[1], 24); geo.rotateX(Math.PI / 2); break;
    case 'capsule': geo = new THREE.CapsuleGeometry(s[0], 2 * s[1], 8, 16); geo.rotateX(Math.PI / 2); break;
    case 'mesh': {
      const md = meshes[g.mesh];
      geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(md.vertices, 3));
      geo.setIndex(md.faces);
      geo.computeVertexNormals();
      break;
    }
    default: geo = new THREE.SphereGeometry(0.15);
  }
  return new THREE.Mesh(geo, mat);
}

export default function MujocoViewer({ src, height = 460 }) {
  const wrapRef = useRef(null);
  const [playing, setPlaying] = useState(true);
  const [status, setStatus] = useState('loading');
  const playRef = useRef(true);
  useEffect(() => { playRef.current = playing; }, [playing]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return undefined;
    let raf, controls, renderer, disposed = false;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 5000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    wrap.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x334455, 0.9));
    const key = new THREE.DirectionalLight(0xffffff, 1.1); key.position.set(1, 2, 3); scene.add(key);

    const resize = () => {
      const w = wrap.clientWidth, h = wrap.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h; camera.updateProjectionMatrix();
    };

    fetch(src).then((r) => r.json()).then((traj) => {
      if (disposed) return;
      const meshes = traj.meshes || [];
      const nodes = (traj.geoms || []).map((g) => {
        if (!g) return null;
        const m = geomToMesh(g, meshes);
        scene.add(m);
        return m;
      });

      // soft-body / flex surfaces (dynamic vertices)
      const flexNodes = (traj.flexes || []).map((fx) => {
        const geo = new THREE.BufferGeometry();
        const nVerts = (traj.flexFrames?.[0]?.[0] ? traj.flexFrames[0].length : (fx.faces.length ? Math.max(...fx.faces) + 1 : 0));
        geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(nVerts * 3), 3));
        geo.setIndex(fx.faces);
        const mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(fx.rgba[0], fx.rgba[1], fx.rgba[2]),
          transparent: fx.rgba[3] < 1, opacity: fx.rgba[3], side: THREE.DoubleSide, metalness: 0.1, roughness: 0.6,
        });
        const mesh = new THREE.Mesh(geo, mat);
        scene.add(mesh);
        return mesh;
      });

      const fps = traj.fps || 30;
      const nFrames = traj.frames.length;
      let t0 = performance.now();
      const q = new THREE.Quaternion();

      const applyFrame = (fi) => {
        const frame = traj.frames[fi];
        nodes.forEach((n, i) => {
          if (!n) return;
          const tr = frame[i]; if (!tr) return;
          n.position.set(tr[0], tr[1], tr[2]);
          q.set(tr[4], tr[5], tr[6], tr[3]); // MuJoCo quat (w,x,y,z) -> three (x,y,z,w)
          n.quaternion.copy(q);
        });
        flexNodes.forEach((mesh, j) => {
          const verts = traj.flexFrames?.[j]?.[fi]; if (!verts) return;
          const pos = mesh.geometry.getAttribute('position');
          pos.array.set(verts); pos.needsUpdate = true;
          mesh.geometry.computeVertexNormals();
        });
      };
      applyFrame(0);

      // MuJoCo is Z-up; frame the camera to the real model bounds (incl. sizes).
      camera.up.set(0, 0, 1);
      const box = new THREE.Box3();
      nodes.forEach((n) => { if (n) box.expandByObject(n); });
      flexNodes.forEach((n) => box.expandByObject(n));
      const sphere = box.getBoundingSphere(new THREE.Sphere());
      const center = sphere.center;
      const fov = (camera.fov * Math.PI) / 180;
      const dist = (sphere.radius / Math.sin(fov / 2)) * 1.15;
      camera.near = Math.max(dist / 1000, 0.01); camera.far = dist * 100; camera.updateProjectionMatrix();
      const dir = new THREE.Vector3(0.75, -0.85, 0.5).normalize();
      camera.position.copy(center).addScaledVector(dir, dist);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.target.copy(center);
      controls.enableDamping = true;
      controls.update();

      resize();
      window.addEventListener('resize', resize);
      setStatus('ok');

      const loop = () => {
        raf = requestAnimationFrame(loop);
        if (playRef.current && nFrames > 1) {
          const elapsed = (performance.now() - t0) / 1000;
          applyFrame(Math.floor(elapsed * fps) % nFrames);
        }
        controls.update();
        renderer.render(scene, camera);
      };
      loop();
    }).catch(() => { if (!disposed) setStatus('error'); });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      if (controls) controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, [src]);

  return (
    <div className="mjv">
      <style>{`
        .mjv { position: relative; width: 100%; border-radius: 16px; overflow: hidden; border: 1px solid var(--divider); background: radial-gradient(120% 120% at 50% 0%, #241247 0%, #160a2e 70%); }
        .mjv__canvas { width: 100%; height: ${height}px; display: block; touch-action: none; cursor: grab; }
        .mjv__canvas:active { cursor: grabbing; }
        .mjv__bar { position: absolute; left: 12px; bottom: 12px; display: flex; gap: 8px; align-items: center; }
        .mjv__btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 999px; background: rgba(10,6,20,0.6); border: 1px solid rgba(255,255,255,0.18); color: #fff; font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; -webkit-backdrop-filter: blur(3px); backdrop-filter: blur(3px); }
        .mjv__btn:hover { background: rgba(10,6,20,0.85); }
        .mjv__hint { position: absolute; right: 12px; bottom: 14px; font-size: 12px; color: rgba(255,255,255,0.55); }
        .mjv__msg { position: absolute; inset: 0; display: grid; place-items: center; color: var(--muted); font-size: 14px; }
      `}</style>
      <div className="mjv__canvas" ref={wrapRef} />
      {status === 'ok' && (
        <>
          <div className="mjv__bar">
            <button type="button" className="mjv__btn" onClick={() => setPlaying((p) => !p)}>
              {playing ? '❚❚ Pause' : '▶ Play'}
            </button>
          </div>
          <span className="mjv__hint">drag to orbit · scroll to zoom</span>
        </>
      )}
      {status === 'loading' && <div className="mjv__msg">Loading simulation…</div>}
      {status === 'error' && <div className="mjv__msg">Couldn’t load the simulation data.</div>}
    </div>
  );
}
