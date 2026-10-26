// Hero 3D tin: lathe-built round tins in Gateway's real catalogue sizes,
// with live red dimension lines drawn over the model.
import * as THREE from 'three';

const stage = document.querySelector('[data-tin-stage]');
if (stage) init();

function init() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) {
    stage.classList.add('no-gl');
    window.__tinReady = true;
    return;
  }
  window.__tinReady = true;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const products = (window.GMI_PRODUCTS || []).filter(p => p.shape === 'round');
  const byId = Object.fromEntries(products.map(p => [p.id, p]));

  // Finishes seen on Gateway's own tins
  const FINISHES = {
    tin:    { name: 'Plain tinplate', paint: { color: 0xd3d8dc, metalness: 1, roughness: 0.16 }, ink: 0xb3121b },
    gold:   { name: 'Gold lacquer',   paint: { color: 0xd8b469, metalness: 1, roughness: 0.24 }, ink: 0xb3121b, metalAlso: true },
    red:    { name: 'Red lacquer',    paint: { color: 0x9c1018, metalness: 0.55, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.12 }, ink: 0xe9ecee },
    green:  { name: 'Green lacquer',  paint: { color: 0x1d4a2b, metalness: 0.55, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.12 }, ink: 0xe9ecee },
    purple: { name: 'Purple lacquer', paint: { color: 0x372150, metalness: 0.55, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.12 }, ink: 0xd9b45e }
  };

  // ── Renderer, scene, camera ──
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  stage.prepend(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden', 'true');

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = studio();

  // A bright photo studio for the metal to reflect: grey sweep plus softboxes
  function studio() {
    const s = new THREE.Scene();
    s.add(new THREE.Mesh(new THREE.SphereGeometry(30, 32, 16), new THREE.MeshBasicMaterial({ color: 0x8e959b, side: THREE.BackSide })));
    const floor = new THREE.Mesh(new THREE.CircleGeometry(30, 32), new THREE.MeshBasicMaterial({ color: 0x5d6368 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -6; s.add(floor);
    const box = (w, h, x, y, z, k) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(k, k, k), side: THREE.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m);
    };
    box(16, 7, 0, 14, 2, 4);     // overhead
    box(5, 14, -13, 3, 5, 3.2);  // key, left
    box(4, 12, 13, 2, -2, 1.8);  // rim, right
    box(12, 3, 0, 1, 15, 1.4);   // front fill
    box(2, 14, 7, 2, 12, 0.08);  // black flag: gives the cylinder a dark edge line
    return pmrem.fromScene(s, 0.02).texture;
  }

  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(-4, 8, 6);
  scene.add(key);

  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);
  camera.position.set(0, 3.6, 15.5);
  camera.lookAt(0, -0.15, 0);

  const holder = new THREE.Group();   // positioned + scaled, never rotated (dimension lines read from this)
  const spinner = new THREE.Group();  // rotates
  const lidPivot = new THREE.Group(); // hinge, fixed to the right-hand edge
  const lidSpin = new THREE.Group();  // lid parts, turn with the body
  holder.add(spinner);
  holder.add(lidPivot);
  lidPivot.add(lidSpin);
  scene.add(holder);

  // Contact shadow
  const shadowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(128, 128, 10, 128, 128, 128);
    grd.addColorStop(0, 'rgba(20,22,25,0.55)');
    grd.addColorStop(0.45, 'rgba(20,22,25,0.22)');
    grd.addColorStop(1, 'rgba(20,22,25,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  })();
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  holder.add(shadow);

  // GMI mark for the lid (paths from img/gmi.svg)
  const logoTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 1024;
    const g = c.getContext('2d');
    const paths = [
      'M127 492 215 403H515L448 490H253L213 530V672L253 713H418V645H290L350 569H510V798H215L127 712Z',
      'M550 403H653L784 584 913 403H1005V798H915V548L780 733 640 545V798H550Z',
      'M1045 403H1133L1045 495Z',
      'M1045 525 1137 430V798H1045Z'
    ];
    const s = 560 / 1022;
    g.translate(512 - 511 * s, 512 - 202 * s);
    g.scale(s, s);
    g.translate(-120, -398);
    g.fillStyle = '#fff';
    paths.forEach(d => g.fill(new Path2D(d)));
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  })();

  // ── Materials ──
  const mats = {
    paint: new THREE.MeshPhysicalMaterial({ side: THREE.DoubleSide }),
    metal: new THREE.MeshPhysicalMaterial({ side: THREE.DoubleSide, color: 0xd3d8dc, metalness: 1, roughness: 0.18 }),
    seam:  new THREE.MeshPhysicalMaterial({ color: 0xa9b0b6, metalness: 1, roughness: 0.35 }),
    logo:  new THREE.MeshPhysicalMaterial({ alphaMap: logoTex, transparent: true, metalness: 0.2, roughness: 0.45, polygonOffset: true, polygonOffsetFactor: -2 })
  };
  function applyFinish(key) {
    const f = FINISHES[key];
    mats.paint.setValues(Object.assign({ clearcoat: 0, clearcoatRoughness: 0 }, f.paint));
    if (f.metalAlso) mats.metal.setValues({ color: f.paint.color, roughness: f.paint.roughness });
    else mats.metal.setValues({ color: 0xd3d8dc, roughness: 0.18 });
    mats.logo.color.setHex(f.ink);
    mats.logo.metalness = key === 'tin' || key === 'gold' ? 0.1 : 0.6;
    mats.paint.needsUpdate = mats.metal.needsUpdate = true;
  }

  // ── Geometry: lathe profiles in centimetres ──
  const V = (r, y) => new THREE.Vector2(Math.max(r, 0), y);
  const SEG = 144;

  function profiles(type, D, H) {
    const R = D / 2;
    const bottom = [V(0, 0.07), V(R - 0.2, 0.07), V(R - 0.12, 0.025), V(R - 0.03, 0), V(R + 0.035, 0.04), V(R + 0.05, 0.13), V(R + 0.03, 0.21), V(R, 0.25)];
    if (type === 'slip') {
      const s = THREE.MathUtils.clamp(H * 0.27, 0.45, 1.8);
      const ring = Math.min(0.45, R * 0.12);
      return {
        R, H, outer: R + 0.11, lidY: H - s,
        wall: [V(R, 0.25), V(R, H - s + 0.04), V(R - 0.06, H - s + 0.12), V(R - 0.06, H - 0.12)],
        bottom,
        lid: [V(R + 0.07, H - s), V(R + 0.11, H - s + 0.04), V(R + 0.11, H - s + 0.12), V(R + 0.075, H - s + 0.16),
              V(R + 0.075, H - 0.1), V(R + 0.05, H - 0.03), V(R - 0.02, H), V(R - ring * 0.5, H - 0.005),
              V(R - ring * 0.75, H - 0.06), V(R - ring * 1.1, H - 0.06), V(R - ring * 1.35, H - 0.018), V(0, H - 0.018)],
        logo: { y: H - 0.012, r: R - ring * 1.5 },
        hingeR: R + 0.11,
        plug: null
      };
    }
    // lever-lid paint tin
    const rp = R * 0.76;
    return {
      R, H, outer: R + 0.05, lidY: H - 0.3,
      wall: [V(R, 0.25), V(R, H - 0.27)],
      bottom,
      lid: null,
      top: [V(R, H - 0.27), V(R + 0.03, H - 0.22), V(R + 0.05, H - 0.12), V(R + 0.045, H - 0.035), V(R - 0.01, H), V(R - 0.07, H - 0.02),
            V(R - 0.1, H - 0.07), V(rp + 0.1, H - 0.07), V(rp + 0.07, H - 0.3), V(rp + 0.02, H - 0.32)],
      plug: [V(rp + 0.02, H - 0.32), V(rp, H - 0.12), V(rp - 0.03, H - 0.035), V(rp - 0.08, H - 0.03), V(rp - 0.12, H - 0.09), V(rp - 0.14, H - 0.17), V(0, H - 0.17)],
      logo: { y: H - 0.165, r: rp - 0.17 },
      hingeR: rp
    };
  }

  let parts = [];
  function clearParts() {
    parts.forEach(m => { m.parent.remove(m); m.geometry.dispose(); });
    parts = [];
  }
  function addPart(geo, mat, parent) {
    const m = new THREE.Mesh(geo, mat);
    parent.add(m); parts.push(m);
    return m;
  }

  let current = null; // profile in use
  function build(type, D, H) {
    clearParts();
    const p = profiles(type, D, H);
    addPart(new THREE.LatheGeometry(p.bottom, SEG), mats.metal, spinner);
    addPart(new THREE.LatheGeometry(p.wall, SEG), mats.paint, spinner);
    // welded side seam: a thin raised strip up the body
    const seamH = (type === 'slip' ? p.lidY : H - 0.27) - 0.25;
    const seam = addPart(new THREE.BoxGeometry(0.05, seamH, 0.02), mats.seam, spinner);
    seam.position.set(0, 0.25 + seamH / 2, p.R + 0.006);
    if (type === 'slip') {
      addPart(new THREE.LatheGeometry(p.lid, SEG), mats.paint, lidSpin);
    } else {
      addPart(new THREE.LatheGeometry(p.top, SEG), mats.metal, spinner);
      addPart(new THREE.LatheGeometry(p.plug, SEG), mats.paint, lidSpin);
    }
    const logo = addPart(new THREE.CircleGeometry(Math.max(p.logo.r, 0.1), 64), mats.logo, lidSpin);
    logo.rotation.x = -Math.PI / 2;
    logo.rotation.z = Math.PI / 2;
    logo.position.y = p.logo.y + 0.002;

    // Lid hinges on the right-hand edge so it tips up towards the viewer and stays in frame
    lidPivot.userData.hinge = new THREE.Vector3(p.hingeR, p.lidY, 0);
    // tip wide lids less so they stay inside the frame
    lidPivot.userData.maxTilt = Math.min(0.62, Math.asin(Math.min(1, (H * 0.9) / (2 * p.hingeR))));

    // Size on screen: bigger tins look bigger, small ones stay readable
    const size = Math.max(D, H);
    const world = 3.8 * Math.pow(size / 10, 0.42);
    const s = world / size;
    holder.scale.setScalar(s);
    holder.position.y = -H * s / 2 + 0.45;
    shadow.scale.setScalar(D * 1.9);
    shadow.position.y = 0.002;
    current = p;
  }

  // ── State ──
  const state = { id: 'gmi-02', finish: 'gold', lidOpen: false, lid: 0 };
  let morph = null; // {from:{type,D,H}, to:{...}, t0}
  let shape = { type: typeOf(byId[state.id]), D: byId[state.id].dims[0], H: byId[state.id].dims[1] };
  function typeOf(p) { return p.use === 'paint' ? 'lever' : 'slip'; }

  applyFinish(state.finish);
  build(shape.type, shape.D, shape.H);

  // ── UI bindings ──
  const tb = k => stage.querySelector(`[data-tb="${k}"]`);
  const finishLabel = k => FINISHES[k].name;
  function paintTitleBlock() {
    const p = byId[state.id];
    tb('name').textContent = p.name;
    tb('code').textContent = p.id.toUpperCase();
    tb('dims').textContent = `Ø ${p.dims[0]} × ${p.dims[1]} cm`;
    tb('finish').textContent = finishLabel(state.finish);
  }
  paintTitleBlock();

  const sizeBtns = document.querySelectorAll('[data-size]');
  const finishBtns = document.querySelectorAll('[data-finish]');
  const lidBtn = document.querySelector('[data-lid]');

  function selectSize(id, fromUser) {
    if (!byId[id] || id === state.id) return;
    if (fromUser) stopAuto();
    const p = byId[id];
    const to = { type: typeOf(p), D: p.dims[0], H: p.dims[1] };
    if (reduce) { shape = to; build(to.type, to.D, to.H); }
    else morph = { from: Object.assign({}, shape), to, t0: performance.now() };
    state.id = id;
    sizeBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.size === id)));
    paintTitleBlock();
  }
  sizeBtns.forEach(b => b.addEventListener('click', () => selectSize(b.dataset.size, true)));
  finishBtns.forEach(b => b.addEventListener('click', () => {
    stopAuto();
    state.finish = b.dataset.finish;
    applyFinish(state.finish);
    finishBtns.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    paintTitleBlock();
  }));
  if (lidBtn) lidBtn.addEventListener('click', () => {
    stopAuto();
    state.lidOpen = !state.lidOpen;
    lidBtn.setAttribute('aria-pressed', String(state.lidOpen));
    lidBtn.textContent = state.lidOpen ? 'Close lid' : 'Open lid';
  });

  // Gentle tour of the range until someone touches the controls
  const tour = ['gmi-02', 'gmi-17', 'gmi-04', 'gmi-16', 'gmi-13', 'gmi-01'];
  let autoTimer = null;
  function startAuto() {
    if (reduce) return;
    let i = 0;
    autoTimer = setInterval(() => { i = (i + 1) % tour.length; selectSize(tour[i], false); }, 3800);
  }
  function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }

  // ── Drag to turn ──
  let rotY = -0.5, vel = reduce ? 0 : 0.35, dragging = false, lastX = 0, lastT = 0;
  stage.addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return;
    dragging = true; lastX = e.clientX; lastT = performance.now();
    stage.setPointerCapture(e.pointerId);
    stopAuto();
  });
  stage.addEventListener('pointermove', e => {
    if (!dragging) return;
    const now = performance.now(), dx = e.clientX - lastX;
    rotY += dx * 0.012;
    vel = (dx * 0.012) / Math.max((now - lastT) / 1000, 0.008);
    lastX = e.clientX; lastT = now;
  });
  const endDrag = () => { dragging = false; };
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);

  // ── Dimension overlay ──
  const svg = stage.querySelector('svg.dims');
  const el = sel => svg.querySelector(sel);
  const v3 = new THREE.Vector3();
  let W = 1, Hh = 1;
  function toScreen(x, y, z) {
    v3.set(x, y, z);
    holder.localToWorld(v3);
    v3.project(camera);
    return [(v3.x * 0.5 + 0.5) * W, (-v3.y * 0.5 + 0.5) * Hh];
  }
  const arrow = (x, y, dir) => {
    // dir: 'l','r','u','d' – arrow tip at (x,y)
    const a = 7, b = 3;
    if (dir === 'l') return `M${x},${y} l${a},${-b} v${2 * b}z`;
    if (dir === 'r') return `M${x},${y} l${-a},${-b} v${2 * b}z`;
    if (dir === 'u') return `M${x},${y} l${-b},${a} h${2 * b}z`;
    return `M${x},${y} l${-b},${-a} h${2 * b}z`;
  };
  function drawDims() {
    if (!current) return;
    const p = byId[state.id];
    const R = current.outer, Ht = current.H;
    const [lx, ly] = toScreen(-R, 0, 0);
    const [rx, ry] = toScreen(R, 0, 0);
    const [, fy] = toScreen(0, 0, R);
    const [tx, ty] = toScreen(R, Ht, 0);
    const dy = fy + 26;
    const hx = Math.max(rx, tx) + 26;
    const set = (q, attrs) => { const n = el(q); for (const k in attrs) n.setAttribute(k, attrs[k]); };
    set('.d-ext1', { x1: lx, y1: ly + 6, x2: lx, y2: dy + 6 });
    set('.d-ext2', { x1: rx, y1: ry + 6, x2: rx, y2: dy + 6 });
    set('.d-line', { x1: lx, y1: dy, x2: rx, y2: dy });
    set('.d-arrows', { d: arrow(lx, dy, 'l') + arrow(rx, dy, 'r') });
    set('.d-text', { x: (lx + rx) / 2, y: dy + 20 });
    set('.h-ext1', { x1: rx + 6, y1: ry, x2: hx + 6, y2: ry });
    set('.h-ext2', { x1: tx + 6, y1: ty, x2: hx + 6, y2: ty });
    set('.h-line', { x1: hx, y1: ty, x2: hx, y2: ry });
    set('.h-arrows', { d: arrow(hx, ty, 'u') + arrow(hx, ry, 'd') });
    const midY = (ty + ry) / 2;
    set('.h-text', { x: hx + 16, y: midY, transform: `rotate(-90 ${hx + 16} ${midY})` });
    el('.d-text').textContent = `Ø ${p.dims[0]} cm`;
    el('.h-text').textContent = `H ${p.dims[1]} cm`;
  }

  // ── Resize ──
  function resize() {
    const r = stage.getBoundingClientRect();
    W = r.width; Hh = r.height;
    renderer.setSize(W, Hh, false);
    camera.aspect = W / Hh;
    // keep the tin framed on narrow stages
    // on tall phone stages, pull back and sit the tin higher so the title block clears the dimensions
    const tall = W / Hh < 0.95;
    camera.position.z = tall ? 18.5 : 15.5;
    camera.lookAt(0, tall ? -1.1 : -0.15, 0);
    camera.updateProjectionMatrix();
    svg.setAttribute('viewBox', `0 0 ${W} ${Hh}`);
  }
  new ResizeObserver(resize).observe(stage);
  resize();

  // ── Loop (only while on screen) ──
  let visible = true, raf = 0, last = performance.now();
  const Z_AXIS = new THREE.Vector3(0, 0, 1);
  const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  function frame(now) {
    raf = 0;
    const dt = Math.min((now - last) / 1000, 0.05); last = now;

    if (morph) {
      const t = Math.min((now - morph.t0) / 800, 1), k = ease(t);
      const D = THREE.MathUtils.lerp(morph.from.D, morph.to.D, k);
      const H = THREE.MathUtils.lerp(morph.from.H, morph.to.H, k);
      const type = k < 0.5 ? morph.from.type : morph.to.type;
      build(type, D, H);
      shape = { type, D, H };
      if (t >= 1) { shape = Object.assign({}, morph.to); morph = null; }
    }

    if (!dragging) {
      const idle = reduce ? 0 : 0.35;
      vel += (idle - vel) * Math.min(dt * 1.6, 1);
      rotY += vel * dt;
    }
    spinner.rotation.y = rotY;

    // lid: lift and tip open around the right-hand hinge
    lidSpin.rotation.y = rotY;
    const target = state.lidOpen ? 1 : 0;
    state.lid += (target - state.lid) * Math.min(dt * (reduce ? 60 : 7), 1);
    const h = lidPivot.userData.hinge;
    if (h) {
      const a = -(lidPivot.userData.maxTilt || 0.62) * state.lid;
      const lift = state.lid * Math.min(Math.max(current.H * 0.12, 0.3), 1);
      const back = h.clone().negate().applyAxisAngle(Z_AXIS, a);
      lidPivot.rotation.set(0, 0, a);
      lidPivot.position.copy(h).add(back);
      lidPivot.position.y += lift;
    }

    renderer.render(scene, camera);
    drawDims();
    if (visible && !document.hidden) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf && visible && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } }
  new IntersectionObserver(es => { visible = es[0].isIntersecting; kick(); }).observe(stage);
  document.addEventListener('visibilitychange', kick);
  kick();
  stage.classList.add('ready');
  startAuto();
}
