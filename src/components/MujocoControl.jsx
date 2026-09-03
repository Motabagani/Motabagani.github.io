import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { geomToMesh } from './MujocoViewer';

/* MujocoControl — lets the visitor DRIVE the delta robot's 3 arms with sliders.
   The pose over the 3 actuators is pre-baked on an N×N×N grid (scripts/bake_grid.py);
   here we trilinearly interpolate between the 8 surrounding baked poses (linear
   for positions, slerp for orientations) so the arms move smoothly and live —
   no physics engine in the browser.  Props: src (grid JSON), height. */

export default function MujocoControl({ src, height = 480, labels }) {
  const wrapRef = useRef(null);
  const [status, setStatus] = useState('loading');
  const [ctrl, setCtrl] = useState([0.5, 0.5, 0.5]); // normalized 0..1 per arm
  const applyRef = useRef(null); // set once loaded: (c0,c1,c2) => void

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return undefined;
    let raf, controls, renderer, disposed = false;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 5000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    wrap.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x334455, 0.95));
    const key = new THREE.DirectionalLight(0xffffff, 1.15); key.position.set(1, 2, 3); scene.add(key);

    const resize = () => {
      const w = wrap.clientWidth, h = wrap.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h; camera.updateProjectionMatrix();
    };

    fetch(src).then((r) => r.json()).then((data) => {
      if (disposed) return;
      const meshes = data.meshes || [];
      // Build one mesh per non-null geom; pose arrays are stored in this order.
      const nodes = (data.geoms || []).filter(Boolean).map((g) => {
        const m = geomToMesh(g, meshes);
        scene.add(m);
        return m;
      });

      // Soft-body (flex) surfaces — dynamic vertices interpolated per slider move.
      const flexData = data.flexStates || null;
      const flexNodes = (data.flexes || []).map((fx, fi) => {
        const nVerts = flexData && flexData[0] && flexData[0][fi] ? flexData[0][fi].length / 3
          : (fx.faces.length ? Math.max(...fx.faces) + 1 : 0);
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(nVerts * 3), 3));
        geo.setIndex(fx.faces);
        const mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(fx.rgba[0], fx.rgba[1], fx.rgba[2]),
          transparent: fx.rgba[3] < 1, opacity: fx.rgba[3], side: THREE.DoubleSide,
          metalness: 0.1, roughness: 0.6,
        });
        const mesh = new THREE.Mesh(geo, mat);
        scene.add(mesh);
        return mesh;
      });

      const N = data.grid.n;
      const states = data.states; // flat index i*N*N + j*N + k, each = [ [x,y,z,qw,qx,qy,qz], ... ]
      const at = (i, j, k) => states[(i * N + j) * N + k];

      // scratch quats reused every frame
      const qa = new THREE.Quaternion(), qb = new THREE.Quaternion();
      const qc = new THREE.Quaternion(), qd = new THREE.Quaternion();
      const qe = new THREE.Quaternion(), qf = new THREE.Quaternion(), qg = new THREE.Quaternion();
      const setQ = (q, t) => q.set(t[4], t[5], t[6], t[3]); // (w,x,y,z) -> three (x,y,z,w)

      // Trilinear interpolation of the pose across the 3 actuator axes.
      // c = normalized 0..1 per axis.
      const apply = (c0, c1, c2) => {
        const g0 = c0 * (N - 1), g1 = c1 * (N - 1), g2 = c2 * (N - 1);
        const i = Math.min(N - 2, Math.floor(g0)), fi = g0 - i;
        const j = Math.min(N - 2, Math.floor(g1)), fj = g1 - j;
        const k = Math.min(N - 2, Math.floor(g2)), fk = g2 - k;
        const s000 = at(i, j, k), s001 = at(i, j, k + 1);
        const s010 = at(i, j + 1, k), s011 = at(i, j + 1, k + 1);
        const s100 = at(i + 1, j, k), s101 = at(i + 1, j, k + 1);
        const s110 = at(i + 1, j + 1, k), s111 = at(i + 1, j + 1, k + 1);
        for (let n = 0; n < nodes.length; n++) {
          const t000 = s000[n], t001 = s001[n], t010 = s010[n], t011 = s011[n];
          const t100 = s100[n], t101 = s101[n], t110 = s110[n], t111 = s111[n];
          // position: trilinear lerp
          const lx = (a, b) => a + (b - a) * fk;
          const x00 = lx(t000[0], t001[0]), x01 = lx(t010[0], t011[0]);
          const x10 = lx(t100[0], t101[0]), x11 = lx(t110[0], t111[0]);
          const y00 = lx(t000[1], t001[1]), y01 = lx(t010[1], t011[1]);
          const y10 = lx(t100[1], t101[1]), y11 = lx(t110[1], t111[1]);
          const z00 = lx(t000[2], t001[2]), z01 = lx(t010[2], t011[2]);
          const z10 = lx(t100[2], t101[2]), z11 = lx(t110[2], t111[2]);
          const jx = (a, b) => a + (b - a) * fj;
          const px = jx(x00, x01), py = jx(y00, y01), pz = jx(z00, z01);
          const qx2 = jx(x10, x11), qy2 = jx(y10, y11), qz2 = jx(z10, z11);
          nodes[n].position.set(px + (qx2 - px) * fi, py + (qy2 - py) * fi, pz + (qz2 - pz) * fi);
          // orientation: nested slerp (k -> j -> i)
          setQ(qa, t000); setQ(qb, t001); qa.slerp(qb, fk);
          setQ(qc, t010); setQ(qd, t011); qc.slerp(qd, fk);
          setQ(qe, t100); setQ(qf, t101); qe.slerp(qf, fk);
          setQ(qg, t110); qb.set(t111[4], t111[5], t111[6], t111[3]); qg.slerp(qb, fk);
          qa.slerp(qc, fj); qe.slerp(qg, fj);
          qa.slerp(qe, fi);
          nodes[n].quaternion.copy(qa);
        }
        // flex vertices: trilinear lerp of the 8 corner states, component-wise
        if (flexData && flexNodes.length) {
          const ff = (a, b, c) => flexData[(a * N + b) * N + c];
          const g000 = ff(i, j, k), g001 = ff(i, j, k + 1), g010 = ff(i, j + 1, k), g011 = ff(i, j + 1, k + 1);
          const g100 = ff(i + 1, j, k), g101 = ff(i + 1, j, k + 1), g110 = ff(i + 1, j + 1, k), g111 = ff(i + 1, j + 1, k + 1);
          for (let fx = 0; fx < flexNodes.length; fx++) {
            const a000 = g000[fx], a001 = g001[fx], a010 = g010[fx], a011 = g011[fx];
            const a100 = g100[fx], a101 = g101[fx], a110 = g110[fx], a111 = g111[fx];
            const posAttr = flexNodes[fx].geometry.getAttribute('position');
            const arr = posAttr.array;
            for (let v = 0; v < arr.length; v++) {
              const x00 = a000[v] + (a001[v] - a000[v]) * fk;
              const x01 = a010[v] + (a011[v] - a010[v]) * fk;
              const x10 = a100[v] + (a101[v] - a100[v]) * fk;
              const x11 = a110[v] + (a111[v] - a110[v]) * fk;
              const y0 = x00 + (x01 - x00) * fj;
              const y1 = x10 + (x11 - x10) * fj;
              arr[v] = y0 + (y1 - y0) * fi;
            }
            posAttr.needsUpdate = true;
            flexNodes[fx].geometry.computeVertexNormals();
          }
        }
      };
      applyRef.current = apply;
      apply(0.5, 0.5, 0.5);

      // MuJoCo is Z-up; frame the whole robot with a bounding-sphere fit.
      camera.up.set(0, 0, 1);
      const box = new THREE.Box3();
      nodes.forEach((n) => box.expandByObject(n));
      flexNodes.forEach((n) => box.expandByObject(n));
      const sphere = box.getBoundingSphere(new THREE.Sphere());
      const center = sphere.center;
      const fov = (camera.fov * Math.PI) / 180;
      const dist = (sphere.radius / Math.sin(fov / 2)) * 1.18;
      camera.near = Math.max(dist / 1000, 0.01); camera.far = dist * 100; camera.updateProjectionMatrix();
      camera.position.copy(center).addScaledVector(new THREE.Vector3(0.7, -0.9, 0.45).normalize(), dist);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.target.copy(center);
      controls.enableDamping = true;
      controls.update();

      resize();
      window.addEventListener('resize', resize);
      setStatus('ok');

      const loop = () => {
        raf = requestAnimationFrame(loop);
        controls.update();
        renderer.render(scene, camera);
      };
      loop();
    }).catch(() => { if (!disposed) setStatus('error'); });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      applyRef.current = null;
      if (controls) controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, [src]);

  // Push slider changes into the scene (imperatively — no React re-render needed).
  useEffect(() => { if (applyRef.current) applyRef.current(ctrl[0], ctrl[1], ctrl[2]); }, [ctrl]);

  const armLabel = labels?.arm || 'Arm';
  const setArm = (n, v) => setCtrl((c) => { const nx = c.slice(); nx[n] = v; return nx; });

  return (
    <div className="mjc">
      <style>{`
        .mjc { position: relative; width: 100%; border-radius: 16px; overflow: hidden; border: 1px solid var(--divider); background: radial-gradient(120% 120% at 50% 0%, #241247 0%, #160a2e 70%); }
        .mjc__canvas { width: 100%; height: ${height}px; display: block; touch-action: none; cursor: grab; }
        .mjc__canvas:active { cursor: grabbing; }
        .mjc__panel { position: absolute; inset-inline-start: 14px; top: 14px; display: flex; flex-direction: column; gap: 10px; padding: 14px 16px; border-radius: 14px; background: rgba(10,6,20,0.55); border: 1px solid rgba(255,255,255,0.14); -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); width: min(230px, 60%); }
        .mjc__row { display: flex; flex-direction: column; gap: 5px; }
        .mjc__row label { font-size: 12.5px; font-weight: 700; color: #fff; letter-spacing: .01em; display: flex; align-items: center; gap: 7px; }
        .mjc__dot { width: 10px; height: 10px; border-radius: 50%; flex: none; box-shadow: 0 0 8px 1px currentColor; }
        .mjc__row input[type=range] { -webkit-appearance: none; appearance: none; width: 100%; height: 5px; border-radius: 999px; background: rgba(255,255,255,0.22); outline: none; }
        .mjc__row input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 17px; height: 17px; border-radius: 50%; background: #fff; cursor: pointer; border: 2px solid var(--accent); box-shadow: 0 1px 4px rgba(0,0,0,0.4); }
        .mjc__row input[type=range]::-moz-range-thumb { width: 15px; height: 15px; border-radius: 50%; background: #fff; cursor: pointer; border: 2px solid var(--accent); }
        .mjc__reset { align-self: flex-start; margin-top: 2px; padding: 6px 13px; border-radius: 999px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
        .mjc__reset:hover { background: rgba(255,255,255,0.2); }
        .mjc__hint { position: absolute; inset-inline-end: 12px; bottom: 12px; font-size: 12px; color: rgba(255,255,255,0.55); }
        .mjc__msg { position: absolute; inset: 0; display: grid; place-items: center; color: var(--muted); font-size: 14px; }
      `}</style>
      <div className="mjc__canvas" ref={wrapRef} />
      {status === 'ok' && (
        <>
          <div className="mjc__panel">
            {[0, 1, 2].map((n) => (
              <div className="mjc__row" key={n}>
                <label>
                  <span className="mjc__dot" style={{ color: ['#4fc7a8', '#f5b74e', '#5fa8f0'][n] }} />
                  {armLabel} {n + 1}
                </label>
                <input
                  type="range" min="0" max="1" step="0.01" value={ctrl[n]}
                  onChange={(e) => setArm(n, parseFloat(e.target.value))}
                  aria-label={`${armLabel} ${n + 1}`}
                />
              </div>
            ))}
            <button type="button" className="mjc__reset" onClick={() => setCtrl([0.5, 0.5, 0.5])}>
              {labels?.reset || 'Reset'}
            </button>
          </div>
          <span className="mjc__hint">{labels?.hint || 'drag to orbit · scroll to zoom'}</span>
        </>
      )}
      {status === 'loading' && <div className="mjc__msg">{labels?.loading || 'Loading…'}</div>}
      {status === 'error' && <div className="mjc__msg">{labels?.errorMsg || 'Couldn’t load the model.'}</div>}
    </div>
  );
}
