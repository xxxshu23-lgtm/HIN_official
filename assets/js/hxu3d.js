/* WORK, UNFOLDED — real 3D stage: HIN unfolded model (glb) + laptop built in code, camera turns to face the display, then dives into it */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/+esm';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js/+esm';
import { RoomEnvironment } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/environments/RoomEnvironment.js/+esm';
const loadGLB = async (path) => {   // fetch the gzip copy (much smaller), unpack in the browser; plain .glb as a fallback
  const u = new URL(path, document.baseURI).href, base = u.replace(/[^/]*$/, '');
  if ('DecompressionStream' in window) { try { const r = await fetch(u + '.gz'); if (r.ok) { let buf = new Uint8Array(await r.arrayBuffer());
    if (!(buf[0] === 0x67 && buf[1] === 0x6c && buf[2] === 0x54 && buf[3] === 0x46)) buf = new Uint8Array(await new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());
    return await new GLTFLoader().parseAsync(buf.buffer, base); } } catch (_) {} }
  return new GLTFLoader().loadAsync(u); };
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
  const alu = new THREE.MeshPhysicalMaterial({ color: 0x5f6064, metalness: 0.9, roughness: 0.38, clearcoat: 0.15, clearcoatRoughness: 0.5 });   // space grey
  const black = new THREE.MeshPhysicalMaterial({ color: 0x050505, metalness: 0.1, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08 });
  const rr = (ctx, x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };

  // deck (keyboard + trackpad) texture — MacBook Pro look: space-grey deck, black keyboard with white legends, speaker grilles, large trackpad
  const deckTex = (() => {
    const W = 3072, H = Math.round(W * LD / LW), c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#5a5b5e'); g.addColorStop(1, '#4c4d50'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    // keyboard well
    const kx = W * 0.145, ky = H * 0.045, kw = W * 0.71, kh = H * 0.46; x.fillStyle = '#060607'; rr(x, kx - 10, ky - 10, kw + 20, kh + 20, 22); x.fill();
    const rows = [
      [['esc',1.5],...['','','','','','','','','','','',''].map(t=>[t,1]),['',1]],
      [['~',1],['1',1],['2',1],['3',1],['4',1],['5',1],['6',1],['7',1],['8',1],['9',1],['0',1],['-',1],['=',1],['delete',1.5]],
      [['tab',1.5],['Q',1],['W',1],['E',1],['R',1],['T',1],['Y',1],['U',1],['I',1],['O',1],['P',1],['[',1],[']',1],['\\',1]],
      [['caps lock',1.8],['A',1],['S',1],['D',1],['F',1],['G',1],['H',1],['J',1],['K',1],['L',1],[';',1],["'",1],['return',1.7]],
      [['shift',2.3],['Z',1],['X',1],['C',1],['V',1],['B',1],['N',1],['M',1],['<',1],['>',1],['?',1],['shift',2.2]],
      [['fn',1],['control',1],['option',1],['command',1.25],['',5.0],['command',1.25],['option',1],['◀',1],['▲▼',1],['▶',1]]];
    const gap = W * 0.0042, fnH = (kh - gap * 7) / 5.6 * 0.6, rh = (kh - gap * 7 - fnH) / 5;
    let y = ky + gap;
    rows.forEach((row, i) => { const hh = i === 0 ? fnH : rh, tot = row.reduce((a, k) => a + k[1], 0), unit = (kw - gap * (row.length + 1)) / tot; let xx = kx + gap;
      row.forEach(([t, u]) => { const w = u * unit;
        if (t === '▲▼') { const h2 = (hh - gap) / 2; x.fillStyle = '#141415'; rr(x, xx, y, w, h2, 8); x.fill(); rr(x, xx, y + h2 + gap, w, h2, 8); x.fill(); }
        else { x.fillStyle = '#141415'; rr(x, xx, y + (t === '◀' || t === '▶' ? hh / 2 : 0), w, t === '◀' || t === '▶' ? hh / 2 : hh, 10); x.fill();
          x.fillStyle = 'rgba(255,255,255,.04)'; rr(x, xx + 3, y + 3, w - 6, hh * 0.4, 8); x.fill(); }
        if (t && t !== '▲▼') { x.fillStyle = 'rgba(235,235,240,.88)'; const big = t.length === 1;
          x.font = `${big ? 500 : 400} ${Math.round((big ? rh * 0.3 : rh * 0.17))}px -apple-system, "Helvetica Neue", Arial, sans-serif`;
          if (big || t === '◀' || t === '▶') { x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(t, xx + w / 2, y + (t === '◀' || t === '▶' ? hh * 0.75 : hh / 2)); }
          else { x.textAlign = i === 5 && ['command','option','control','fn'].includes(t) ? 'center' : 'left'; x.textBaseline = 'bottom'; x.fillText(t, x.textAlign === 'center' ? xx + w / 2 : xx + w * 0.12, y + hh * 0.86); } }
        if (i === 0 && u === 1 && xx > kx + kw - unit * 1.5) { x.strokeStyle = 'rgba(255,255,255,.12)'; x.lineWidth = 3; x.beginPath(); x.arc(xx + w / 2, y + hh / 2, hh * 0.3, 0, 7); x.stroke(); }   // Touch ID
        xx += w + gap; });
      y += hh + gap; });
    // speaker grilles either side of the keyboard
    x.fillStyle = 'rgba(0,0,0,.42)';
    for (const sx of [W * 0.035, W * 0.885]) for (let yy = ky + 6; yy < ky + kh; yy += 13) for (let xx2 = sx; xx2 < sx + W * 0.08; xx2 += 13) { x.beginPath(); x.arc(xx2, yy, 3.2, 0, 7); x.fill(); }
    // trackpad
    const tw = W * 0.52, th = H * 0.40, tx = (W - tw) / 2, ty = H * 0.555; const tg = x.createLinearGradient(0, ty, 0, ty + th); tg.addColorStop(0, '#55565a'); tg.addColorStop(1, '#4e4f52');
    x.fillStyle = tg; rr(x, tx, ty, tw, th, 28); x.fill(); x.strokeStyle = 'rgba(0,0,0,.35)'; x.lineWidth = 4; x.stroke(); x.strokeStyle = 'rgba(255,255,255,.06)'; x.lineWidth = 2; rr(x, tx + 4, ty + 4, tw - 8, th - 8, 25); x.stroke();
    // front thumb notch
    x.fillStyle = 'rgba(0,0,0,.25)'; rr(x, W / 2 - W * 0.05, H - 14, W * 0.1, 14, 7); x.fill();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = R.capabilities.getMaxAnisotropy(); return t;
  })();

  // display graphic — drawn in code (vector), so it stays sharp at full screen
  const scrCanvas = document.createElement('canvas'); scrCanvas.width = 4096; scrCanvas.height = Math.round(4096 * DH / DW);
  (function drawScreen(c) {   // iridescent ribbons, drawn at 4096px
    const x = c.getContext('2d'), W = c.width, H = c.height; x.fillStyle = '#000'; x.fillRect(0, 0, W, H);
    const bands = [['#4a2bff', 1], ['#ff4fa3', .86], ['#ffd36b', .72], ['#c7b2ff', .58], ['#ff7fbf', .46], ['#7fd4ff', .34], ['#e8fbff', .2], ['#ffffff', .07]];
    const ribbon = (pts, w) => { const P = new Path2D(); P.moveTo(pts[0][0] * W, pts[0][1] * H);
      for (let i = 1; i < pts.length; i += 3) P.bezierCurveTo(pts[i][0] * W, pts[i][1] * H, pts[i + 1][0] * W, pts[i + 1][1] * H, pts[i + 2][0] * W, pts[i + 2][1] * H);
      x.lineCap = 'round'; x.lineJoin = 'round'; const s = w * .016;
      x.shadowBlur = 0; x.strokeStyle = '#000'; x.lineWidth = w * 1.45; x.stroke(P);
      bands.forEach(([col, k], i) => { x.lineWidth = w * k; x.strokeStyle = col; x.shadowColor = col; x.shadowBlur = i === 0 ? w * .4 : 0; x.stroke(P); x.shadowBlur = 0;
        const nx = bands[i + 1]; if (nx) { x.lineWidth = w * nx[1] + 2 * s; x.strokeStyle = '#050208'; x.stroke(P); } }); };
    const U = W * .1;
    ribbon([[-.12, -.02], [.12, .1], [.16, .55], [.3, 1.2]], U * 1.15);
    ribbon([[.42, -.12], [.32, .36], [.54, .46], [.46, 1.15]], U * .95);
    ribbon([[.6, -.18], [.72, .22], [.42, .62], [.62, 1.15]], U * .7);
    ribbon([[1.15, .08], [.82, .2], [.74, .62], [.88, 1.18]], U * 1.05);
    ribbon([[-.1, .55], [.05, .62], [.1, .9], [.08, 1.2]], U * .6);
  })(scrCanvas);
  // the screen plays the page's video (same <video> as the flat fallback); the drawn ribbons stay as a fallback
  const vid = sec.querySelector('.hxu-scr video');
  let scrTex, VA = DW / DH;
  if (vid) { scrTex = new THREE.VideoTexture(vid); scrTex.colorSpace = THREE.SRGBColorSpace; scrTex.minFilter = THREE.LinearFilter; scrTex.generateMipmaps = false;
    const setA = () => { if (vid.videoWidth) VA = vid.videoWidth / vid.videoHeight; }; vid.addEventListener('loadedmetadata', setA); setA(); }
  else { scrTex = new THREE.CanvasTexture(scrCanvas); scrTex.colorSpace = THREE.SRGBColorSpace; scrTex.anisotropy = R.capabilities.getMaxAnisotropy();
    scrTex.generateMipmaps = true; scrTex.minFilter = THREE.LinearMipmapLinearFilter; }

  const lap = new THREE.Group();
  const base = new THREE.Mesh(new RoundedBoxGeometry(LW, BH, LD, 4, 0.0045), alu); base.position.set(0, BH / 2, LD / 2); lap.add(base);
  const deck = new THREE.Mesh(new THREE.PlaneGeometry(LW - 0.006, LD - 0.006), new THREE.MeshPhysicalMaterial({ map: deckTex, metalness: 0.6, roughness: 0.5 }));
  deck.rotation.x = -Math.PI / 2; deck.position.set(0, BH + 0.0002, LD / 2); lap.add(deck);
  const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.0042, 0.0042, LW - 0.07, 24), black); hinge.rotation.z = Math.PI / 2; hinge.position.set(0, BH, 0.003); lap.add(hinge);
  const lid = new THREE.Group(); lid.position.set(0, BH, 0.002); lap.add(lid);
  const lidBox = new THREE.Mesh(new RoundedBoxGeometry(LW, LT, LD, 4, 0.0022), alu); lidBox.position.set(0, LT / 2, LD / 2); lid.add(lidBox);
  const bezel = new THREE.Mesh(new THREE.PlaneGeometry(LW - 0.003, LD - 0.003), black); bezel.rotation.x = Math.PI / 2; bezel.position.set(0, -0.0002, LD / 2); lid.add(bezel);
  const disp = new THREE.Mesh(new THREE.PlaneGeometry(DW, DH), new THREE.MeshBasicMaterial({ map: scrTex, toneMapped: false }));
  disp.rotation.x = Math.PI / 2; disp.position.set(0, -0.0004, DB + DH / 2); lid.add(disp);
  const nW = 0.0190, nH = 0.0050, nR = 0.0016, ns = new THREE.Shape();   // camera notch with rounded lower corners, as on a MacBook Pro
  ns.moveTo(-nW / 2, 0); ns.lineTo(nW / 2, 0); ns.lineTo(nW / 2, -nH + nR); ns.quadraticCurveTo(nW / 2, -nH, nW / 2 - nR, -nH); ns.lineTo(-nW / 2 + nR, -nH); ns.quadraticCurveTo(-nW / 2, -nH, -nW / 2, -nH + nR); ns.lineTo(-nW / 2, 0);
  const notch = new THREE.Mesh(new THREE.ShapeGeometry(ns, 8), new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide }));
  notch.rotation.x = Math.PI / 2; notch.position.set(0, -0.0006, DB + DH + 0.0003); lid.add(notch);
  lid.rotation.x = -OPEN;

  /* ---------- stand + placement ---------- */
  const N = new THREE.Vector3(0, 0.8924, 0.4512).normalize(), SLOPE = Math.atan2(N.z, N.y);
  const ready = loadGLB('assets/3d/hin-unfold.glb').then(g => {
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
  let geomReady = false, last = '', fitKey = ''; const fit0 = { d: 1, ox: 0, oy: 0 };
  const measure = () => { box.setFromObject(scene); box.getCenter(Cb); disp.getWorldPosition(Cs);
    Ns.set(0, 0, 1).applyQuaternion(disp.getWorldQuaternion(new THREE.Quaternion())).normalize();
    up.set(0, 1, 0).applyQuaternion(disp.getWorldQuaternion(new THREE.Quaternion())).normalize(); geomReady = true; };
  const sph = (az, el) => new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
  const P = { az: -0.8, el: 0.36, fit: 1.14 };   // start pose ≈ the angled KeyShot render
  const api = {
    P, cam, scene, R,
    draw(L) {   // L: {vw,vh,ax,ay,aw,ah,t1,t2,zs}
      if (!geomReady) return;
      const key = [L.vw, L.vh, L.ax, L.ay, L.aw, L.ah, L.t1.toFixed(4), L.t2.toFixed(4), L.zs.toFixed(4), (L.vf ?? 1).toFixed(3), L.tick || 0, VA.toFixed(3), P.az, P.el, P.fit].join(); if (key === last) return; last = key;
      const dpr = Math.min(devicePixelRatio || 1, 2); if (cv.width !== Math.round(L.vw * dpr) || cv.height !== Math.round(L.vh * dpr)) { R.setPixelRatio(dpr); R.setSize(L.vw, L.vh, false); }
      cam.aspect = L.vw / L.vh; const th = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
      // start: fit the whole product (projected bbox) inside the image area under the copy, centred
      const dir0 = sph(P.az, P.el), dirF = Ns.clone();
      const fk = [L.vw, L.vh, L.ay, L.ah, P.az, P.el, P.fit].join();
      if (fk !== fitKey) { fitKey = fk; let d = 1; cam.clearViewOffset(); cam.up.set(0, 1, 0);
        for (let it = 0; it < 4; it++) { cam.position.copy(Cb).addScaledVector(dir0, d); cam.lookAt(Cb); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
          let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
          for (let i = 0; i < 8; i++) { tmp.set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z).project(cam);
            x0 = Math.min(x0, tmp.x); x1 = Math.max(x1, tmp.x); y0 = Math.min(y0, tmp.y); y1 = Math.max(y1, tmp.y); }
          const wpx = (x1 - x0) / 2 * L.vw, hpx = (y1 - y0) / 2 * L.vh;
          if (it < 3) d *= Math.max(hpx / (L.ah * 0.9 * P.fit), wpx / (L.vw * 0.86 * P.fit));
          else { fit0.d = d; fit0.ox = ((x0 + x1) / 2 + 1) / 2 * L.vw - L.vw / 2; fit0.oy = (1 - (y0 + y1) / 2) / 2 * L.vh - (L.ay + L.ah / 2); } } }
      const d0 = fit0.d;
      const dF = (LW / 0.56) / (2 * th * cam.aspect), dFill = Math.min(DH / (2 * th), DW / (2 * th * cam.aspect)) * 0.965;
      const t1 = L.t1, t2 = L.t2;
      dir.copy(dir0).lerp(dirF, t1).normalize();
      tgt.copy(Cb).lerp(Cs, t1);
      const dist = (d0 + (dF - d0) * t1) * Math.pow(dFill / dF, t2);
      cam.position.copy(tgt).addScaledVector(dir, dist);
      cam.up.set(0, 1, 0).lerp(up, t1).normalize(); cam.lookAt(tgt);
      cam.setViewOffset(L.vw, L.vh, fit0.ox * (1 - t1), fit0.oy * (1 - t1), L.vw, L.vh); cam.updateProjectionMatrix();
      const z = 1 / L.zs, da = DW / DH, kx = VA > da ? da / VA : 1, ky = VA > da ? 1 : VA / da;   // cover-fit the video on the display
      scrTex.repeat.set(z * kx, z * ky); scrTex.offset.set((1 - z * kx) / 2, (1 - z * ky) * 0.5);
      disp.material.color.setScalar(L.vf ?? 1);
      notch.visible = t2 < 0.35;   // gone once the screen fills the view   // fades to black as the camera dives into the screen
      R.render(scene, cam);
    }
  };
  ready.then(() => { measure(); window.__hxuGL = api; dispatchEvent(new Event('hxu-gl-ready')); })
       .catch(e => { console.warn('[hxu3d]', e); cv.remove(); });
}
