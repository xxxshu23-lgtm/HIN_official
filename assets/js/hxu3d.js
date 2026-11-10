/* WORK, UNFOLDED — real 3D stage: HIN unfolded model (glb) + laptop built in code, camera turns to face the display, then dives into it */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/+esm';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js/+esm';
import { RoomEnvironment } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/environments/RoomEnvironment.js/+esm';
import { RoundedBoxGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/geometries/RoundedBoxGeometry.js/+esm';

const sec = document.getElementById('hxUnfold');
const stage = sec && sec.querySelector('.hxu-sticky');
if (stage && !window.__hxuGL) {
  const cv = document.createElement('canvas'); cv.className = 'hxu-gl'; cv.setAttribute('aria-hidden', 'true');
  stage.insertBefore(cv, stage.querySelector('.hxu-va'));
  const R = new THREE.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: 'high-performance' });
  R.setClearColor(0x000000, 1); R.outputColorSpace = THREE.SRGBColorSpace;
  R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(R); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(-0.7, 1.3, 0.9); scene.add(key);
  const rim = new THREE.DirectionalLight(0xcfdcff, 0.9); rim.position.set(0.9, 0.6, -1.1); scene.add(rim);
  const cam = new THREE.PerspectiveCamera(26, 1, 0.005, 20);

  /* ---------- laptop (14-inch proportions, metres) ---------- */
  const LW = 0.3126, LD = 0.2212, BH = 0.0102, LT = 0.0050, OPEN = THREE.MathUtils.degToRad(112);
  const DW = 0.3024, DH = 0.1964, DB = 0.0176;            // display area + bottom bezel (hinge side)
  const alu = new THREE.MeshPhysicalMaterial({ color: 0x6b6c70, metalness: 0.92, roughness: 0.34, clearcoat: 0.2, clearcoatRoughness: 0.5 });
  const black = new THREE.MeshPhysicalMaterial({ color: 0x050505, metalness: 0.1, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08 });
  const rr = (ctx, x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };

  // deck (keyboard + trackpad) texture
  const deckTex = (() => {
    const W = 2048, H = Math.round(W * LD / LW), c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#6f7074'); g.addColorStop(1, '#5d5e62'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    const kx = W * 0.085, ky = H * 0.055, kw = W * 0.83, kh = H * 0.47; x.fillStyle = '#1b1b1d'; rr(x, kx, ky, kw, kh, 18); x.fill();
    const rows = [14, 14, 14, 13, 12, 9]; const gap = W * 0.0042, rh = (kh - gap * 7) / 6.6;
    rows.forEach((n, i) => { const hh = i === 0 ? rh * 0.62 : rh; const y = ky + gap + (i === 0 ? 0 : rh * 0.62 + gap + (i - 1) * (rh + gap)); const kwid = (kw - gap * (n + 1)) / n;
      for (let k = 0; k < n; k++) { let w = kwid, xx = kx + gap + k * (kwid + gap);
        if (i === 5) { const unit = (kw - gap * 10) / 13.5; const sizes = [1, 1, 1, 1.2, 4.6, 1.2, 1, 1.2, 1.3]; xx = kx + gap + sizes.slice(0, k).reduce((a, b) => a + b * unit + gap, 0); w = sizes[k] * unit; }
        x.fillStyle = '#0b0b0c'; rr(x, xx, y, w, hh, 9); x.fill(); x.fillStyle = 'rgba(255,255,255,.05)'; rr(x, xx + 2, y + 2, w - 4, hh * 0.45, 7); x.fill(); } });
    x.fillStyle = 'rgba(0,0,0,.35)'; for (const sx of [W * 0.03, W * 0.94]) for (let yy = ky; yy < ky + kh; yy += 9) for (let xx2 = sx; xx2 < sx + W * 0.03; xx2 += 9) { x.beginPath(); x.arc(xx2, yy, 2.2, 0, 7); x.fill(); }
    const tw = W * 0.47, th = H * 0.36; const tg = x.createLinearGradient(0, H - th, 0, H); tg.addColorStop(0, '#77787c'); tg.addColorStop(1, '#6a6b6f');
    x.fillStyle = tg; rr(x, (W - tw) / 2, H * 0.585, tw, th, 22); x.fill(); x.strokeStyle = 'rgba(0,0,0,.25)'; x.lineWidth = 3; x.stroke();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = R.capabilities.getMaxAnisotropy(); return t;
  })();

  // display graphic — drawn in code (vector), so it stays sharp at full screen
  const scrCanvas = document.createElement('canvas'); scrCanvas.width = 4096; scrCanvas.height = Math.round(4096 * DH / DW);
  (function drawScreen(c) {
    const x = c.getContext('2d'), W = c.width, H = c.height; x.fillStyle = '#000'; x.fillRect(0, 0, W, H);
    const bands = ['#3b1fd6', '#ff3d9a', '#ffd66b', '#c9b5ff', '#62c8ff', '#eafaff'];
    const ribbon = (pts, w) => { const P = new Path2D(); P.moveTo(pts[0][0] * W, pts[0][1] * H);
      for (let i = 1; i < pts.length; i += 3) P.bezierCurveTo(pts[i][0] * W, pts[i][1] * H, pts[i + 1][0] * W, pts[i + 1][1] * H, pts[i + 2][0] * W, pts[i + 2][1] * H);
      x.lineCap = 'round'; x.lineJoin = 'round'; x.shadowBlur = 0; x.strokeStyle = '#000'; x.lineWidth = w * 1.35; x.stroke(P);
      bands.forEach((col, i) => { const k = 1 - i / bands.length; x.lineWidth = w * k; x.strokeStyle = col; x.shadowColor = col; x.shadowBlur = i === 0 ? w * 0.6 : w * 0.12; x.stroke(P);
        if (i < bands.length - 1) { x.shadowBlur = 0; x.lineWidth = w * (k - 0.5 / bands.length); x.strokeStyle = 'rgba(0,0,0,.55)'; x.stroke(P); } });
      x.shadowBlur = 0; x.lineWidth = w * 0.035; x.strokeStyle = '#fff'; x.stroke(P); };
    const U = W * 0.05;
    ribbon([[-.08, .05], [.12, .1], [.2, .55], [.32, 1.12]], U * 1.1);
    ribbon([[.06, -.1], [.2, .3], [.05, .7], [.22, 1.12]], U * .8);
    ribbon([[.4, -.1], [.36, .35], [.5, .45], [.46, 1.1]], U * .9);
    ribbon([[.52, -.12], [.64, .2], [.42, .62], [.58, 1.1]], U * .7);
    ribbon([[.47, .05], [.58, .35], [.66, .52], [.6, .95], [.56, 1.2], [.7, 1.15], [.74, 1.1]], U * .6);
    ribbon([[1.1, .12], [.82, .2], [.74, .6], [.84, 1.12]], U * 1.0);
    ribbon([[1.12, .4], [.94, .45], [.9, .8], [.98, 1.12]], U * .75);
  })(scrCanvas);
  const scrTex = new THREE.CanvasTexture(scrCanvas); scrTex.colorSpace = THREE.SRGBColorSpace; scrTex.anisotropy = R.capabilities.getMaxAnisotropy();
  scrTex.generateMipmaps = true; scrTex.minFilter = THREE.LinearMipmapLinearFilter;

  const lap = new THREE.Group();
  const base = new THREE.Mesh(new RoundedBoxGeometry(LW, BH, LD, 4, 0.0045), alu); base.position.set(0, BH / 2, LD / 2); lap.add(base);
  const deck = new THREE.Mesh(new THREE.PlaneGeometry(LW - 0.006, LD - 0.006), new THREE.MeshPhysicalMaterial({ map: deckTex, metalness: 0.75, roughness: 0.42 }));
  deck.rotation.x = -Math.PI / 2; deck.position.set(0, BH + 0.0002, LD / 2); lap.add(deck);
  const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.0042, 0.0042, LW - 0.07, 24), black); hinge.rotation.z = Math.PI / 2; hinge.position.set(0, BH, 0.003); lap.add(hinge);
  const lid = new THREE.Group(); lid.position.set(0, BH, 0.002); lap.add(lid);
  const lidBox = new THREE.Mesh(new RoundedBoxGeometry(LW, LT, LD, 4, 0.0022), alu); lidBox.position.set(0, LT / 2, LD / 2); lid.add(lidBox);
  const bezel = new THREE.Mesh(new THREE.PlaneGeometry(LW - 0.003, LD - 0.003), black); bezel.rotation.x = Math.PI / 2; bezel.position.set(0, -0.0002, LD / 2); lid.add(bezel);
  const disp = new THREE.Mesh(new THREE.PlaneGeometry(DW, DH), new THREE.MeshBasicMaterial({ map: scrTex, toneMapped: false }));
  disp.rotation.x = Math.PI / 2; disp.position.set(0, -0.0004, DB + DH / 2); lid.add(disp);
  lid.rotation.x = -OPEN;

  /* ---------- stand + placement ---------- */
  const N = new THREE.Vector3(0, 0.8924, 0.4512).normalize(), SLOPE = Math.atan2(N.z, N.y);
  const ready = new GLTFLoader().loadAsync(new URL('assets/3d/hin-unfold.glb', document.baseURI).href).then(g => {
    const stand = g.scene; stand.scale.x = -1;               // mirrored so the light-bar module sits on the left, as in the render
    stand.traverse(o => { if (!o.isMesh) return; const m = o.material; if (!m || !m.color) return;
      const l = m.color.r + m.color.g + m.color.b;
      if (l < 0.05 && !(m.transmission > 0)) o.material = new THREE.MeshPhysicalMaterial({ color: 0x8c8d90, metalness: 0.85, roughness: 0.36, clearcoat: 0.3, clearcoatRoughness: 0.4 });
      else if (m.isMeshStandardMaterial) { m.envMapIntensity = 1; } });
    scene.add(stand);
    // laptop sits on the inclined top plate, its back edge just in front of the light-bar module
    const d = 0.0634, zBack = -0.045, yBack = (d - N.z * zBack) / N.y;
    lap.position.set(0.0015, yBack + 0.0006, zBack); lap.rotation.x = SLOPE; scene.add(lap);
    scene.updateMatrixWorld(true);
  });

  /* ---------- camera rig ---------- */
  const v3 = () => new THREE.Vector3();
  const box = new THREE.Box3(), Cb = v3(), Cs = v3(), Ns = v3(), up = v3(), tmp = v3(), dir = v3(), tgt = v3();
  let geomReady = false, last = '';
  const measure = () => { box.setFromObject(scene); box.getCenter(Cb); disp.getWorldPosition(Cs);
    Ns.set(0, 0, 1).applyQuaternion(disp.getWorldQuaternion(new THREE.Quaternion())).normalize();
    up.set(0, 1, 0).applyQuaternion(disp.getWorldQuaternion(new THREE.Quaternion())).normalize(); geomReady = true; };
  const sph = (az, el) => new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
  const P = { az: -0.62, el: 0.42, fit: 1.0, tx: 0, ty: 0 };   // start pose ≈ the angled KeyShot render
  const api = {
    P, cam, scene, R,
    draw(L) {   // L: {vw,vh,ax,ay,aw,ah,t1,t2,zs}
      if (!geomReady) return;
      const key = [L.vw, L.vh, L.ax, L.ay, L.aw, L.ah, L.t1.toFixed(4), L.t2.toFixed(4), L.zs.toFixed(4), P.az, P.el, P.fit].join(); if (key === last) return; last = key;
      const dpr = Math.min(devicePixelRatio || 1, 2); if (cv.width !== Math.round(L.vw * dpr) || cv.height !== Math.round(L.vh * dpr)) { R.setPixelRatio(dpr); R.setSize(L.vw, L.vh, false); }
      cam.aspect = L.vw / L.vh; const th = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
      // start: whole product framed inside the image area under the copy
      const rad = box.getSize(tmp).length() / 2, d0 = rad * P.fit / th * (L.vh / L.ah) * 0.62;
      const dir0 = sph(P.az, P.el), dirF = Ns.clone();
      const dF = (LW / 0.56) / (2 * th * cam.aspect), dFill = Math.min(DH / (2 * th), DW / (2 * th * cam.aspect)) * 0.965;
      const t1 = L.t1, t2 = L.t2;
      dir.copy(dir0).lerp(dirF, t1).normalize();
      tgt.copy(Cb).lerp(Cs, t1);
      const dist = (d0 + (dF - d0) * t1) * Math.pow(dFill / dF, t2);
      cam.position.copy(tgt).addScaledVector(dir, dist);
      cam.up.set(0, 1, 0).lerp(up, t1).normalize(); cam.lookAt(tgt);
      const oy = (L.vh / 2 - (L.ay + L.ah / 2)) * (1 - t1);   // shift the start framing into the image area
      cam.setViewOffset(L.vw, L.vh, 0, oy, L.vw, L.vh); cam.updateProjectionMatrix();
      const z = 1 / L.zs; scrTex.repeat.set(z, z); scrTex.offset.set((1 - z) / 2, (1 - z) * 0.5);
      R.render(scene, cam);
    }
  };
  ready.then(() => { measure(); window.__hxuGL = api; dispatchEvent(new Event('hxu-gl-ready')); })
       .catch(e => { console.warn('[hxu3d]', e); cv.remove(); });
}
