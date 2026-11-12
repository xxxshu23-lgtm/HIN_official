/* 03 — HIN worker ID card (glb) in the white panel; turns with the mouse / finger, keeps a little spin after you let go */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/+esm';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js/+esm';
import { RoomEnvironment } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/environments/RoomEnvironment.js/+esm';

const box = document.querySelector('#hx15 .hx15-3d');
if (box && !box.dataset.on) {
  box.dataset.on = '1';
  const cv = document.createElement('canvas'); box.appendChild(cv);
  const R = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
  R.setClearColor(0x000000, 0); R.outputColorSpace = THREE.SRGBColorSpace;
  R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.1;
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(R); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  const key = new THREE.DirectionalLight(0xffffff, 1.2); key.position.set(-0.6, 1.0, 1.2); scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 0.5); fill.position.set(0.8, -0.4, 0.9); scene.add(fill);
  const cam = new THREE.PerspectiveCamera(28, 1, 0.01, 10);
  const pivot = new THREE.Group(); scene.add(pivot);
  const CW = 0.0856, CH = 0.054;

  let rx = -0.18, ry = 0.5, vx = 0, vy = 0, drag = false, lx = 0, ly = 0, t0 = performance.now(), touched = false, vis = false, raf = 0;
  const fit = () => {
    const w = box.clientWidth, h = box.clientHeight; if (!w || !h) return;
    const dpr = Math.min(devicePixelRatio || 1, 2); R.setPixelRatio(dpr); R.setSize(w, h, false);
    cam.aspect = w / h;
    const want = .70;                                  // card ≈ 78% of the panel width
    const dist = (CW / want) / (2 * Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2) * cam.aspect);
    cam.position.set(0, 0, Math.max(dist, (CH / .6) / (2 * Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2))));
    cam.lookAt(0, 0, 0); cam.updateProjectionMatrix(); kick();
  };
  const frame = () => {
    raf = 0; if (!vis) return;
    if (!drag) {
      ry += vy; rx += vx; vy *= .95; vx *= .9;
      if (!touched) ry = .5 + Math.sin((performance.now() - t0) / 1000 * .6) * .45;   // gentle sway until someone grabs it
      rx += (-.18 - rx) * .04;                                                           // tilt settles back
    }
    pivot.rotation.set(rx, ry, 0);
    R.render(scene, cam); kick();
  };
  const kick = () => { if (!raf && vis) raf = requestAnimationFrame(frame); };

  new GLTFLoader().loadAsync(new URL('assets/3d/hin-id-card.glb', document.baseURI).href).then(g => {
    const m = g.scene; const bb = new THREE.Box3().setFromObject(m); const c = bb.getCenter(new THREE.Vector3()); m.position.sub(c);
    m.traverse(o => { if (o.isMesh && o.material) { o.material.envMapIntensity = 1.1; } });
    pivot.add(m); box.classList.add('ready'); fit();
  }).catch(() => box.classList.add('fail'));

  box.addEventListener('pointerdown', e => { if (e.button > 0) return; drag = true; touched = true; lx = e.clientX; ly = e.clientY; vx = vy = 0; box.classList.add('grab'); try { box.setPointerCapture(e.pointerId); } catch (_) {} });
  box.addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY;
    vy = dx * .012; vx = dy * .008; ry += vy; rx = Math.max(-1.1, Math.min(1.1, rx + vx)); kick(); });
  const up = () => { drag = false; box.classList.remove('grab'); };
  box.addEventListener('pointerup', up); box.addEventListener('pointercancel', up); box.addEventListener('lostpointercapture', up);
  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(box); addEventListener('resize', fit);
  new IntersectionObserver(es => { vis = es.some(x => x.isIntersecting); kick(); }, { rootMargin: '20% 0px' }).observe(box);
  fit();
}
