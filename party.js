/* Jovi Birthday — panggung perayaan 3D: pembawa kue, lilin angka, tiup lilin, kado tarik benang, foto & video */
(function () {
  'use strict';
  const FONT_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json';
  const $ = id => document.getElementById(id);
  const party = $('party'), stage = $('stage'), g2 = stage.getContext('2d');
  const CONFETTI = ['#ff5d73', '#ffd166', '#06d6a0', '#4cc9f0', '#f78c6b', '#c77dff', '#ffffff'];
  const COUPONS = ['1x traktir bakso', 'bebas cuci piring sehari', '1x dipijat', '1x dimasakin menu favorit', 'peluk sepuasnya', '1x antar-jemput', '1x nonton bareng', 'jajan martabak'];

  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const easeInOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const easeBack = t => { const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
  const rand = (a, b) => a + Math.random() * (b - a);
  const loadImg = src => new Promise(res => { if (!src) return res(null); const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
  const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

  let T, three = null, st = null, actx = null;
  const getCtx = () => (actx = actx || new (window.AudioContext || window.webkitAudioContext)());

  /* ================= 3D: setup sekali ================= */
  async function loadThree() {
    if (three) return three;
    T = await import('three');
    const [{ TextGeometry }, { FontLoader }] = await Promise.all([
      import('three/addons/geometries/TextGeometry.js'), import('three/addons/loaders/FontLoader.js')]);
    let font = null;
    try { font = await new Promise((res, rej) => new FontLoader().load(FONT_URL, res, undefined, rej)); } catch (e) { font = null; }
    let post = null;
    try {
      const [{ EffectComposer }, { RenderPass }, { UnrealBloomPass }, { OutputPass }] = await Promise.all([
        import('three/addons/postprocessing/EffectComposer.js'), import('three/addons/postprocessing/RenderPass.js'),
        import('three/addons/postprocessing/UnrealBloomPass.js'), import('three/addons/postprocessing/OutputPass.js')]);
      post = { EffectComposer, RenderPass, UnrealBloomPass, OutputPass };
    } catch (e) { post = null; }
    three = { TextGeometry, font, post };
    if (window.Avatar) await window.Avatar.load();
    buildWorld();
    return three;
  }

  function tex(c, repeat) {
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4;
    if (repeat) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
    return t;
  }
  function knitCanvas(base, stitch, size = 128) {
    const c = canvas(size, size), x = c.getContext('2d');
    x.fillStyle = base; x.fillRect(0, 0, size, size);
    const cw = size / 8, ch = size / 6;
    for (let r = 0; r < 7; r++) for (let k = 0; k < 8; k++) {
      const ox = k * cw, oy = r * ch - ch * .3;
      x.strokeStyle = stitch; x.lineWidth = cw * .32; x.lineCap = 'round';
      x.beginPath(); x.moveTo(ox + cw * .15, oy); x.quadraticCurveTo(ox + cw * .28, oy + ch * .7, ox + cw * .5, oy + ch * 1.05); x.stroke();
      x.beginPath(); x.moveTo(ox + cw * .85, oy); x.quadraticCurveTo(ox + cw * .72, oy + ch * .7, ox + cw * .5, oy + ch * 1.05); x.stroke();
      x.strokeStyle = 'rgba(0,0,0,.18)'; x.lineWidth = 1;
      x.beginPath(); x.moveTo(ox + cw * .5, oy + ch * .2); x.lineTo(ox + cw * .5, oy + ch * 1.05); x.stroke();
    }
    return c;
  }
  function patchCanvas() {
    // lantai kain rajut tambal-sulam warna pastel
    const c = canvas(512, 512), x = c.getContext('2d');
    const cols = ['#f3c9a8', '#f7e0b5', '#e9b7a7', '#f1d3c2', '#efc39a', '#f6e6c9', '#e7c0b4', '#f4d6a6'];
    for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) {
      const col = cols[(r * 3 + k * 5) % cols.length];
      x.drawImage(knitCanvas(col, new T.Color(col).offsetHSL(0, 0, .06).getStyle(), 128), k * 128, r * 128);
      x.strokeStyle = 'rgba(120,70,50,.25)'; x.lineWidth = 3; x.setLineDash([6, 5]); x.strokeRect(k * 128 + 4, r * 128 + 4, 120, 120); x.setLineDash([]);
    }
    return c;
  }
  function woodCanvas() {
    const c = canvas(512, 512), x = c.getContext('2d');
    for (let i = 0; i < 8; i++) {
      const y = i * 64, l = 40 + Math.random() * 8;
      x.fillStyle = `hsl(25,${38 + Math.random() * 8}%,${l * .62}%)`; x.fillRect(0, y, 512, 64);
      x.strokeStyle = 'rgba(0,0,0,.35)'; x.lineWidth = 2; x.beginPath(); x.moveTo(0, y); x.lineTo(512, y); x.stroke();
      for (let k = 0; k < 14; k++) { x.strokeStyle = `rgba(0,0,0,${Math.random() * .08})`; x.lineWidth = 1; x.beginPath(); const yy = y + Math.random() * 64; x.moveTo(0, yy); x.bezierCurveTo(170, yy + rand(-6, 6), 340, yy + rand(-6, 6), 512, yy); x.stroke(); }
      const cut = Math.random() * 512; x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(cut, y, 2, 64);
    }
    return c;
  }
  function glowCanvas(stops) {
    const c = canvas(128, 128), x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    stops.forEach(([o, col]) => g.addColorStop(o, col)); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return c;
  }
  function flameCanvas() {
    const c = canvas(64, 128), x = c.getContext('2d');
    const g = x.createRadialGradient(32, 92, 2, 32, 80, 60);
    g.addColorStop(0, 'rgba(255,255,240,1)'); g.addColorStop(.25, 'rgba(255,226,140,1)'); g.addColorStop(.55, 'rgba(255,140,40,.85)'); g.addColorStop(1, 'rgba(255,80,0,0)');
    x.fillStyle = g; x.beginPath(); x.moveTo(32, 4); x.bezierCurveTo(56, 50, 60, 92, 32, 124); x.bezierCurveTo(4, 92, 8, 50, 32, 4); x.fill();
    return c;
  }

  function catenary(x0, x1, y, sag, n) {
    const pts = [];
    for (let i = 0; i <= n; i++) { const t = i / n, x = lerp(x0, x1, t); pts.push(new T.Vector3(x, y - sag * 4 * t * (1 - t), 0)); }
    return pts;
  }

  function buildWorld() {
    const W = {};
    const renderer = new T.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.localClippingEnabled = true;
    const scene = new T.Scene(); scene.background = new T.Color('#140e1d'); scene.fog = new T.Fog('#140e1d', 9, 22);
    const camera = new T.PerspectiveCamera(40, 1, .1, 60);
    Object.assign(W, { renderer, scene, camera });

    // cahaya
    W.hemi = new T.HemisphereLight('#ffe9d2', '#2a1a2a', .25); scene.add(W.hemi);
    W.key = new T.DirectionalLight('#fff1dc', .25); W.key.position.set(2.5, 5, 4); W.key.castShadow = true;
    W.key.shadow.mapSize.set(1024, 1024); Object.assign(W.key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -2, near: .5, far: 15 }); W.key.shadow.bias = -.0015;
    scene.add(W.key);
    W.candleLight = new T.PointLight('#ffb35c', 0, 7, 2); W.candleLight.position.set(0, 1.9, .2);     scene.add(W.candleLight);
    W.frameLight = new T.SpotLight('#ffd9a8', 0, 6, .5, .6, 1.5); W.frameLight.position.set(1.6, 4.2, -.4); W.frameLight.target.position.set(2.0, 2.25, -2.45); scene.add(W.frameLight, W.frameLight.target);

    // lantai & dinding rajut
    const floorTex = tex(patchCanvas(), [5, 5]);
    const floor = new T.Mesh(new T.PlaneGeometry(30, 30), new T.MeshStandardMaterial({ map: floorTex, roughness: .8 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    const wallTex = tex(knitCanvas('#6b2b36', '#86404b'), [26, 12]);
    const wall = new T.Mesh(new T.PlaneGeometry(30, 12), new T.MeshStandardMaterial({ map: wallTex, roughness: 1 }));
    wall.position.set(0, 6, -2.5); wall.receiveShadow = true; scene.add(wall);
    const skirt = new T.Mesh(new T.BoxGeometry(30, .18, .06), new T.MeshStandardMaterial({ color: '#efe3cf', roughness: .6 }));
    skirt.position.set(0, .09, -2.47); scene.add(skirt);

    // meja bertaplak
    const table = new T.Group();
    const clothTex = tex(knitCanvas('#f4ecdf', '#fffaf2', 128), [10, 2]);
    const clothMat = new T.MeshStandardMaterial({ map: clothTex, roughness: .9, side: T.DoubleSide });
    const top = new T.Mesh(new T.CylinderGeometry(1.08, 1.08, .04, 64), clothMat); top.position.y = .9; top.receiveShadow = true; top.castShadow = true;
    const drape = new T.Mesh(new T.CylinderGeometry(1.08, 1.16, .34, 64, 1, true), clothMat); drape.position.y = .72; drape.castShadow = true;
    const scallop = new T.Mesh(new T.TorusGeometry(1.16, .025, 8, 80), new T.MeshStandardMaterial({ color: '#c0392b', roughness: .7 }));
    scallop.rotation.x = Math.PI / 2; scallop.position.y = .555;
    const leg = new T.Mesh(new T.CylinderGeometry(.08, .16, .56, 20), new T.MeshStandardMaterial({ color: '#4a3020', roughness: .6 })); leg.position.y = .28; leg.castShadow = true;
    const foot = new T.Mesh(new T.CylinderGeometry(.42, .46, .05, 32), leg.material); foot.position.y = .025;
    table.add(top, drape, scallop, leg, foot); scene.add(table);

    // bingkai foto di dinding
    W.frame = new T.Group(); W.frame.position.set(2.0, 2.25, -2.42);
    const fw = 1.12, fh = 1.4;
    const border = new T.Mesh(new T.BoxGeometry(fw + .16, fh + .16, .06), new T.MeshStandardMaterial({ color: '#d7b27a', roughness: .45, metalness: .25 }));
    border.castShadow = true;
    W.photoMat = new T.MeshStandardMaterial({ color: '#ffffff', roughness: .55, emissive: '#ffffff', emissiveIntensity: .18 });
    const pic = new T.Mesh(new T.PlaneGeometry(fw, fh), W.photoMat); pic.position.z = .035;
    W.frame.add(border, pic); scene.add(W.frame);
    const nail = new T.Vector3(2.0, 3.35, -2.44);
    const yarnMat = new T.LineBasicMaterial({ color: '#d84a3c' });
    W.frame.updateMatrixWorld();
    W.frameString = new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(1.55, 2.98, -2.4), nail, new T.Vector3(2.45, 2.98, -2.4)]), yarnMat);
    scene.add(W.frameString);
    // karakter yang ulang tahun sudah hadir di panggung, bingkai disembunyikan
    W.frame.visible = W.frameString.visible = false;

    // bendera rajut (bunting)
    const bunt = catenary(-4.2, 4.2, 4.05, .55, 18);
    const bColors = ['#e0a33a', '#b8372f', '#7d9a78', '#6f8fb4', '#e6d3b3'];
    scene.add(new T.Line(new T.BufferGeometry().setFromPoints(bunt.map(p => p.clone().setZ(-2.3))), yarnMat));
    const triShape = new T.Shape(); triShape.moveTo(-.17, 0); triShape.lineTo(.17, 0); triShape.lineTo(0, -.36); triShape.closePath();
    const triGeo = new T.ShapeGeometry(triShape);
    const bMats = bColors.map(c => new T.MeshStandardMaterial({ map: tex(knitCanvas(c, new T.Color(c).offsetHSL(0, 0, .08).getStyle(), 64), [2, 2]), side: T.DoubleSide, roughness: 1 }));
    W.flags = [];
    for (let i = 1; i < bunt.length - 1; i++) {
      const m = new T.Mesh(triGeo, bMats[i % bMats.length]); m.position.copy(bunt[i]).setZ(-2.28);
      const d = bunt[i + 1].clone().sub(bunt[i - 1]); m.rotation.z = Math.atan2(d.y, d.x);
      m.castShadow = true; scene.add(m); W.flags.push(m);
    }

    // lampu tumbler
    const fl = catenary(-4.6, 4.6, 3.65, .9, 34);
    scene.add(new T.Line(new T.BufferGeometry().setFromPoints(fl.map(p => p.clone().setZ(-2.2))), new T.LineBasicMaterial({ color: '#3b2a24' })));
    const glowTex = tex(glowCanvas([[0, 'rgba(255,240,200,1)'], [.25, 'rgba(255,200,120,.55)'], [1, 'rgba(255,160,60,0)']]));
    W.bulbs = [];
    const bulbCols = ['#ffd38a', '#ff9f7a', '#fff2c4', '#a8e0ff', '#ffc2e0'];
    fl.forEach((p, i) => {
      if (i === 0 || i === fl.length - 1) return;
      const col = new T.Color(bulbCols[i % bulbCols.length]);
      const b = new T.Mesh(new T.SphereGeometry(.035, 10, 8), new T.MeshBasicMaterial({ color: col }));
      b.position.copy(p).setZ(-2.18); b.position.y -= .05; scene.add(b);
      const s = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: col, blending: T.AdditiveBlending, depthWrite: false, transparent: true, opacity: .8 }));
      s.scale.setScalar(.32); s.position.copy(b.position); scene.add(s);
      W.bulbs.push({ b, s, col, ph: Math.random() * 6.28 });
    });

    // balon dengan tali benang
    W.balloons = [];
    const bCols = ['#e84a5f', '#ffd166', '#4cc9f0', '#ff8fab', '#7bd389', '#c77dff'];
    [[-3.1, 2.6, -1.4], [-2.55, 2.25, -1.8], [-3.6, 2.15, -.9], [3.55, 2.65, -1.6], [3.15, 2.0, -.7], [3.95, 2.1, -1.9]].forEach((p, i) => {
      const grp = new T.Group();
      const mat = new T.MeshPhysicalMaterial({ color: bCols[i], roughness: .22, clearcoat: .6, clearcoatRoughness: .2 });
      const ball = new T.Mesh(new T.SphereGeometry(.3, 32, 24), mat); ball.scale.set(1, 1.18, 1); ball.castShadow = true;
      const knot = new T.Mesh(new T.ConeGeometry(.045, .07, 12), mat); knot.position.y = -.37; knot.rotation.x = Math.PI;
      const pts = []; for (let k = 0; k <= 16; k++) pts.push(new T.Vector3(Math.sin(k * .7) * .03, -.4 - k * .1, 0));
      const str = new T.Line(new T.BufferGeometry().setFromPoints(pts), new T.LineBasicMaterial({ color: '#efe3cf' }));
      grp.add(ball, knot, str); grp.position.set(...p); scene.add(grp);
      W.balloons.push({ grp, base: p[1], ph: Math.random() * 6.28 });
    });

    // tekstur api & asap
    W.flameTex = tex(flameCanvas());
    W.glowTex = glowTex;
    W.smokeTex = tex(glowCanvas([[0, 'rgba(210,210,220,.55)'], [.6, 'rgba(180,180,190,.18)'], [1, 'rgba(160,160,170,0)']]));
    W.smoke = [];

    // kue rajut
    W.clip = new T.Plane(new T.Vector3(0, -1, 0), 99);
    W.cake = buildCake(W.clip); scene.add(W.cake);
    W.cakeTop = W.cake.userData.top;



    // bloom
    if (three.post) {
      const { EffectComposer, RenderPass, UnrealBloomPass, OutputPass } = three.post;
      const comp = new EffectComposer(renderer);
      comp.addPass(new RenderPass(scene, camera));
      W.bloom = new UnrealBloomPass(new T.Vector2(512, 512), .45, .45, .9);
      comp.addPass(W.bloom); comp.addPass(new OutputPass());
      W.composer = comp;
    }
    three.W = W;
  }

  function buildCake(clip) {
    const g = new T.Group(), parts = { tiers: [] };
    const knit = (c, rep = [8, 2]) => { const m = window.Avatar.knitMat(c, rep); m.clippingPlanes = [clip]; return m; };
    const plain = (c, r = .6) => new T.MeshStandardMaterial({ color: c, roughness: r, clippingPlanes: [clip] });
    const plate = new T.Mesh(new T.CylinderGeometry(.6, .54, .035, 48), new T.MeshPhysicalMaterial({ color: '#ffffff', roughness: .15, clearcoat: 1, clippingPlanes: [clip] }));
    plate.position.y = .018; plate.receiveShadow = true; plate.castShadow = true; g.add(plate);
    let y = .035;
    const tiers = [
      { r: .47, h: .34, body: '#f4d7c4', cap: '#6b3a26', drip: '#6b3a26' },
      { r: .31, h: .27, body: '#fff1e2', cap: '#ff9fb8', drip: '#ff9fb8' },
    ];
    tiers.forEach((tr, ti) => {
      const body = new T.Mesh(new T.CylinderGeometry(tr.r, tr.r, tr.h, 56), knit(tr.body, ti ? [7, 2] : [10, 2])); body.position.y = y + tr.h / 2; body.castShadow = true; body.receiveShadow = true; g.add(body);
      const tierRec = { body, r: tr.r, h: tr.h, y0: y, cap: tr.cap, bodyCol: tr.body }; parts.tiers.push(tierRec);
      const cap = new T.Mesh(new T.CylinderGeometry(tr.r + .014, tr.r + .014, .05, 56), knit(tr.cap, [10, 1])); cap.position.y = y + tr.h - .01; g.add(cap); tierRec.capMesh = cap;
      const rim = new T.Mesh(new T.TorusGeometry(tr.r + .006, .026, 10, 56), knit(tr.cap, [12, 1])); rim.rotation.x = Math.PI / 2; rim.position.y = y + tr.h + .012; g.add(rim); tierRec.rim = rim;
      const n = ti === 0 ? 20 : 14;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + rand(-.08, .08), len = rand(.04, ti === 0 ? .16 : .11);
        const d = new T.Mesh(new T.CapsuleGeometry(.028, len, 4, 8), knit(tr.drip, [1, 1]));
        d.position.set(Math.cos(a) * (tr.r + .008), y + tr.h - len / 2 - .02, Math.sin(a) * (tr.r + .008)); g.add(d);
      }
      const beads = ti === 0 ? 26 : 20;
      for (let i = 0; i < beads; i++) {
        const a = (i / beads) * Math.PI * 2;
        const bd = new T.Mesh(new T.SphereGeometry(ti === 0 ? .04 : .032, 12, 10), knit('#fffaf0', [1, 1]));
        bd.position.set(Math.cos(a) * tr.r, y + .022, Math.sin(a) * tr.r); g.add(bd);
      }
      y += tr.h + .02;
      if (ti === 0) {
        for (let i = 0; i < 10; i++) {
          const a = (i / 10) * Math.PI * 2 + .2;
          const sb = new T.Mesh(new T.SphereGeometry(.055, 16, 12), knit('#d7263d', [1, 1]));
          sb.scale.set(1, 1.2, 1); sb.position.set(Math.cos(a) * .39, y + .025, Math.sin(a) * .39); sb.castShadow = true; g.add(sb);
          const leaf = new T.Mesh(new T.ConeGeometry(.035, .035, 5), knit('#3f8f3a', [1, 1])); leaf.position.copy(sb.position).add(new T.Vector3(0, .07, 0)); g.add(leaf);
        }
      }
    });
    // taburan: manik-manik kecil
    const sprinkleCols = ['#ffd166', '#06d6a0', '#4cc9f0', '#ffffff', '#c77dff'];
    const spGeo = new T.SphereGeometry(.011, 6, 5);
    for (let i = 0; i < 60; i++) {
      const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * .27;
      const sp = new T.Mesh(spGeo, plain(sprinkleCols[i % 5], .35));
      sp.position.set(Math.cos(a) * r, y + .006, Math.sin(a) * r); g.add(sp);
    }
    g.userData.top = y;
    // semua hiasan dicatat sudutnya (dari +z) supaya bisa disembunyikan di bagian yang dipotong
    g.children.forEach(m => { if (!parts.tiers.some(tr => tr.body === m || tr.capMesh === m || tr.rim === m) && m !== plate) { m.userData.ang = Math.atan2(m.position.x, m.position.z); m.userData.cutable = true; } });
    g.userData.parts = parts;
    return g;
  }

  /* ---------- memotong kue ---------- */
  const CUT = T_ => ({ a0: -.36, a1: .36 });   // irisan menghadap kamera (sudut dari +z)
  function spongeTex(capCol) {
    const c = canvas(128, 128), x = c.getContext('2d');
    x.fillStyle = '#f0cf96'; x.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 140; i++) { x.fillStyle = `rgba(160,110,50,${rand(.08, .25)})`; x.beginPath(); x.arc(rand(0, 128), rand(0, 128), rand(.8, 2.6), 0, 7); x.fill(); }
    x.fillStyle = '#fff6ea'; x.fillRect(0, 58, 128, 12);
    x.fillStyle = '#e8546a'; x.fillRect(0, 63, 128, 3);
    x.fillStyle = capCol; x.fillRect(0, 0, 128, 12);
    return tex(c);
  }
  function cutFace(tr, ang, mat, h) {
    const m = new T.Mesh(new T.PlaneGeometry(tr.r, h), mat);
    m.position.set(Math.sin(ang) * tr.r / 2, tr.y0 + h / 2, Math.cos(ang) * tr.r / 2);
    m.rotation.y = ang - Math.PI / 2; m.material.side = T.DoubleSide; return m;
  }
  function cutCake() {
    const W = three.W, P = W.cake.userData.parts, { a0, a1 } = CUT();
    W.cutBits = [];
    P.tiers.forEach(tr => {
      tr.orig = tr.orig || { body: tr.body.geometry, cap: tr.capMesh.geometry, rim: tr.rim.geometry };
      tr.body.geometry = new T.CylinderGeometry(tr.r, tr.r, tr.h, 56, 1, false, a1, Math.PI * 2 - (a1 - a0));
      tr.capMesh.geometry = new T.CylinderGeometry(tr.r + .014, tr.r + .014, .05, 56, 1, false, a1, Math.PI * 2 - (a1 - a0));
      const rg = new T.TorusGeometry(tr.r + .006, .026, 10, 56, Math.PI * 2 - (a1 - a0)); rg.rotateZ(Math.PI / 2 + a1); tr.rim.geometry = rg;
      const fm = new T.MeshStandardMaterial({ map: spongeTex(tr.cap), roughness: .95 });
      [a0, a1].forEach(a => { const f = cutFace(tr, a, fm, tr.h); W.cake.add(f); W.cutBits.push(f); });
    });
    W.cake.children.forEach(m => { if (m.userData.cutable && m.userData.ang > a0 - .08 && m.userData.ang < a1 + .08 && m !== W.candles) { m.userData.hiddenByCut = true; m.visible = false; } });
    // potongan kue (irisan) dengan bagian dalam yang terlihat
    const sl = new T.Group(), inner = new T.Group(); sl.add(inner);
    P.tiers.forEach((tr, i) => {
      const bodyM = tr.body.material, capM = tr.capMesh.material;
      inner.add(Object.assign(new T.Mesh(new T.CylinderGeometry(tr.r, tr.r, tr.h, 12, 1, false, a0, a1 - a0), bodyM), { castShadow: true }));
      inner.children[inner.children.length - 1].position.y = tr.y0 + tr.h / 2;
      const cp = new T.Mesh(new T.CylinderGeometry(tr.r + .014, tr.r + .014, .05, 12, 1, false, a0, a1 - a0), capM); cp.position.y = tr.y0 + tr.h - .01; inner.add(cp);
      const fm = new T.MeshStandardMaterial({ map: spongeTex(tr.cap), roughness: .95, side: T.DoubleSide });
      [a0, a1].forEach(a => inner.add(cutFace(tr, a, fm, tr.h)));
    });
    const berry = new T.Mesh(new T.SphereGeometry(.055, 16, 12), window.Avatar.knitMat('#d7263d', [1, 1])); berry.scale.set(1, 1.2, 1);
    const t1 = P.tiers[0]; berry.position.set(0, t1.y0 + t1.h + .045, t1.r * .82); inner.add(berry);
    inner.position.z = -.22;                 // pusatkan irisan di atas piring
    sl.position.set(0, 0, .22);
    W.cake.add(sl); W.slice = sl;
    // piring kecil
    const plate = new T.Group();
    const pm = new T.Mesh(new T.CylinderGeometry(.24, .2, .025, 36), new T.MeshPhysicalMaterial({ color: '#ffffff', roughness: .15, clearcoat: 1 }));
    pm.castShadow = true; plate.add(pm);
    const rimP = new T.Mesh(new T.TorusGeometry(.235, .01, 6, 36), new T.MeshStandardMaterial({ color: '#e0a33a', roughness: .3, metalness: .5 })); rimP.rotation.x = Math.PI / 2; rimP.position.y = .012; plate.add(rimP);
    plate.position.set(0, .935, .8); plate.scale.setScalar(.001); W.scene.add(plate); W.plate = plate;
  }
  function uncutCake() {
    const W = three.W, P = W.cake.userData.parts;
    P.tiers.forEach(tr => { if (tr.orig) { tr.body.geometry = tr.orig.body; tr.capMesh.geometry = tr.orig.cap; tr.rim.geometry = tr.orig.rim; } });
    (W.cutBits || []).forEach(m => W.cake.remove(m)); W.cutBits = [];
    W.cake.children.forEach(m => { if (m.userData.hiddenByCut) { m.visible = true; m.userData.hiddenByCut = false; } });
    if (W.slice) { W.slice.parent && W.slice.parent.remove(W.slice); W.slice = null; }
    if (W.plate) { W.scene.remove(W.plate); W.plate = null; }
    if (W.knife) W.knife.visible = false;
    if (W.candles) { W.candles.visible = true; W.candles.position.y = 0; }
    if (W.guest) { W.scene.remove(W.guest); window.Avatar.dispose(W.guest); W.guest = null; }
  }
  function makeKnife() {
    const W = three.W, k = new T.Group();
    const blade = new T.Mesh(new T.BoxGeometry(.012, .09, .46), new T.MeshStandardMaterial({ color: '#dfe3ea', metalness: .9, roughness: .2 }));
    blade.position.z = -.06; k.add(blade);
    const handle = new T.Mesh(new T.BoxGeometry(.03, .06, .18), window.Avatar.knitMat('#6b3f22', [1, 1])); handle.position.z = .25; k.add(handle);
    k.traverse(m => m.castShadow = true); k.visible = false; W.scene.add(k); W.knife = k;
  }

  /* ================= bagian personal (per perayaan) ================= */
  function frameCanvas(img, initial) {
    const c = canvas(560, 700), x = c.getContext('2d');
    x.fillStyle = '#f6efe4'; x.fillRect(0, 0, 560, 700);
    if (img) {
      const ar = 520 / 600, ir = img.width / img.height;
      let sw = img.width, sh = img.height, sx = 0, sy = 0;
      if (ir > ar) { sw = img.height * ar; sx = (img.width - sw) / 2; } else { sh = img.width / ar; sy = (img.height - sh) * .25; }
      x.drawImage(img, sx, sy, sw, sh, 20, 20, 520, 600);
    } else {
      x.fillStyle = '#e0a33a'; x.fillRect(20, 20, 520, 600); x.fillStyle = '#fff'; x.font = '900 260px Fraunces, serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(initial, 280, 330);
    }
    x.fillStyle = '#2e2420'; x.font = '700 50px Caveat, cursive'; x.textAlign = 'center'; x.fillText('♥', 280, 672);
    return c;
  }

  function disposeTree(o) {
    o.traverse(n => { if (n.geometry) n.geometry.dispose(); if (n.material) { [].concat(n.material).forEach(m => { if (m.map) m.map.dispose(); m.dispose(); }); } });
  }

  async function buildPersonal(o) {
    const W = three.W, A = window.Avatar;
    const bustImg = await loadImg(A.portrait(o.look, { framing: 'bust', w: 520, h: 600, pose: 'wave', turn: .2, hat: true, bg: '#f3e6d3' }));
    const initial = (o.nick || '?')[0].toUpperCase();
    if (W.photoMat.map) W.photoMat.map.dispose();
    W.photoMat.map = W.photoMat.emissiveMap = tex(frameCanvas(bustImg, initial)); W.photoMat.needsUpdate = true;

    // pembawa kue & yang ulang tahun (karakter 3D)
    [W.carrier, W.hero].forEach(c => { if (c) { W.scene.remove(c); A.dispose(c); } });
    W.carrier = A.build(o.carrier.look); W.carrier.scale.setScalar(1.3); W.carrier.userData.rig.hat.visible = true;
    W.hero = A.build(o.look); W.hero.scale.setScalar(1.3); W.hero.userData.rig.hat.visible = true;
    W.scene.add(W.carrier, W.hero);

    // lilin angka
    if (W.candles) { W.cake.remove(W.candles); disposeTree(W.candles); }
    W.candles = new T.Group(); W.flames = [];
    const digits = String(Math.max(0, o.age | 0));
    const top = W.cakeTop;
    const cols = ['#ff8fab', '#7ec4ff', '#ffd166', '#9be7b0'];
    if (three.font) {
      const metas = [];
      let total = 0;
      [...digits].forEach((ch, i) => {
        const geo = new three.TextGeometry(ch, { font: three.font, size: .2, height: .05, depth: .05, curveSegments: 8, bevelEnabled: true, bevelThickness: .012, bevelSize: .008, bevelSegments: 3 });
        geo.computeBoundingBox(); const bb = geo.boundingBox;
        geo.translate(-(bb.min.x + bb.max.x) / 2, -bb.min.y, -(bb.min.z + bb.max.z) / 2);
        const w = bb.max.x - bb.min.x, h = bb.max.y - bb.min.y;
        metas.push({ geo, w, h, col: cols[i % cols.length] }); total += w;
      });
      const gap = .035; total += gap * (metas.length - 1);
      let x0 = -total / 2;
      metas.forEach(m => {
        const mesh = new T.Mesh(m.geo, new T.MeshPhysicalMaterial({ color: m.col, roughness: .35, clearcoat: .6, clippingPlanes: [W.clip] }));
        mesh.position.set(x0 + m.w / 2, top + .01, .05); mesh.castShadow = true; W.candles.add(mesh);
        addWickFlame(new T.Vector3(x0 + m.w / 2, top + .01 + m.h, .05));
        x0 += m.w + gap;
      });
    } else {
      const n = Math.min(digits.length + 1, 4);
      for (let i = 0; i < n; i++) {
        const x = (i - (n - 1) / 2) * .12;
        const c = new T.Mesh(new T.CylinderGeometry(.018, .018, .2, 12), new T.MeshStandardMaterial({ color: cols[i % 4], clippingPlanes: [W.clip] }));
        c.position.set(x, top + .1, 0); W.candles.add(c);
        addWickFlame(new T.Vector3(x, top + .2, 0));
      }
    }
    W.cake.add(W.candles);

    st.photoImg = bustImg;
  }
  function addWickFlame(p) {
    const W = three.W;
    const wick = new T.Mesh(new T.CylinderGeometry(.005, .005, .035, 6), new T.MeshBasicMaterial({ color: '#222', clippingPlanes: [W.clip] }));
    wick.position.copy(p).add(new T.Vector3(0, .015, 0)); W.candles.add(wick);
    const flame = new T.Sprite(new T.SpriteMaterial({ map: W.flameTex, blending: T.AdditiveBlending, depthWrite: false, transparent: true }));
    const glow = new T.Sprite(new T.SpriteMaterial({ map: W.glowTex, color: '#ffb060', blending: T.AdditiveBlending, depthWrite: false, transparent: true, opacity: .7 }));
    const base = p.clone().add(new T.Vector3(0, .07, 0));
    flame.position.copy(base); glow.position.copy(base);
    W.candles.add(flame, glow);
    W.flames.push({ flame, glow, base, lit: true, k: 1, ph: Math.random() * 10 });
  }

  /* ================= kontrol perayaan ================= */
  function setPose(p) { st.carrierPose = p; }
  function resetScene(mode) {
    const W = three.W;
    W.flames.forEach(f => { f.lit = true; f.k = 1; });
    W.smoke.forEach(sm => { W.scene.remove(sm.sp); sm.sp.material.dispose(); }); W.smoke = [];
    st.lights = 0; st.confetti = []; st.fw = []; st.rockets = 0;
    st.gift = { show: 0, p: 0, pv: 0, drag: false, hx: 0, hy: 0, open: 0, auto: 0, lidY: 0, lidR: 0, lidV: 0 };
    st.blownAt = 0; st.blowAcc = 0; st.lastExt = 0; st.blowT = 0; st.recBlown = false;
    W.hero.position.set(1.6, 0, .15); W.hero.rotation.y = -.55;
    uncutCake(); st.heroCtl = false; st.cutPose = null;
    if (!W.knife) makeKnife();
    if (mode === 'walk') {
      W.carrier.add(W.cake);
      W.cake.position.set(0, .74, .44); W.cake.scale.setScalar(1 / 1.3);
      W.carrier.position.set(-5.4, 0, .45); W.carrier.rotation.y = Math.PI / 2; setPose('hold');
      setPhase('walk');
    } else {
      placeCakeNow();
      W.carrier.position.set(-1.6, 0, .45); W.carrier.rotation.y = .5; setPose('stand');
      setPhase('wait');
    }
  }
  function toScreen(v) { const W = three.W, p = v.clone().project(W.camera); return { x: (p.x + 1) / 2 * stage.width, y: (1 - p.y) / 2 * stage.height }; }
  function placeCakeNow() {
    const W = three.W;
    W.scene.add(W.cake); W.cake.scale.setScalar(1); W.cake.position.set(0, .92, 0); W.cake.rotation.set(0, 0, 0);
  }
  function setPhase(p) {
    st.phase = p; st.phaseT = 0;
    $('rowBlow').hidden = p !== 'wait';
    $('rowAfter').hidden = !(p === 'opened' || p === 'given');
    $('btnCut').hidden = p !== 'opened';
    $('rowChoose').hidden = p !== 'choose';
    if (p === 'choose') buildChoices();
    $('blowMeter').hidden = !(p === 'wait' && st.mic);
    if (p === 'party' && !st.recording) window.BGM && window.BGM.play('main');
  }

  function extinguish(i) {
    const W = three.W, f = W.flames[i]; if (!f || !f.lit) return;
    f.lit = false; st.blowT = Math.max(st.blowT, .9);
    breath(f);
    for (let k = 0; k < 14; k++) {
      const sp = new T.Sprite(new T.SpriteMaterial({ map: W.smokeTex, transparent: true, depthWrite: false, opacity: 0 }));
      W.cake.updateMatrixWorld(); const wp = f.base.clone(); W.candles.localToWorld(wp);
      sp.position.copy(wp); sp.scale.setScalar(.05); W.scene.add(sp);
      W.smoke.push({ sp, t: -k * .07, vx: rand(-.08, .08), vz: rand(-.05, .05) });
    }
  }
  function breath(f) {
    const W = three.W, hp = new T.Vector3(); W.hero.userData.rig.head.getWorldPosition(hp); hp.y -= .1;
    const fp = f.base.clone(); W.candles.localToWorld(fp);
    for (let k = 0; k < 6; k++) {
      const sp = new T.Sprite(new T.SpriteMaterial({ map: W.smokeTex, transparent: true, depthWrite: false, opacity: 0, color: '#dff3ff' }));
      sp.position.copy(hp); sp.scale.setScalar(.06); W.scene.add(sp);
      const v = fp.clone().sub(hp).multiplyScalar(1 / .45);
      W.smoke.push({ sp, t: -k * .03, br: true, v: v.add(new T.Vector3(rand(-.2, .2), rand(-.2, .2), rand(-.2, .2))) });
    }
  }
  function blowAll() {
    const W = three.W;
    const lit = W.flames.map((f, i) => f.lit ? i : -1).filter(i => i >= 0).sort(() => Math.random() - .5);
    lit.forEach((i, k) => setTimeout(() => extinguish(i), k * 140));
  }

  /* ---------- mikrofon ---------- */
  async function startMic() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: false } });
      const c = getCtx(); await c.resume();
      const src = c.createMediaStreamSource(stream), an = c.createAnalyser(); an.fftSize = 1024; src.connect(an);
      st.mic = { stream, an, buf: new Float32Array(an.fftSize), floor: .01, t: 0 };
      $('blowMeter').hidden = st.phase !== 'wait';
      $('btnMic').textContent = '🎤 Mic aktif, tiup sekarang!'; $('btnMic').disabled = true;
    } catch (e) {
      window.toast && window.toast('Mikrofon tidak bisa dipakai. Ketuk tombol tiup saja ya.');
    }
  }
  function stopMic() {
    if (st && st.mic) { st.mic.stream.getTracks().forEach(t => t.stop()); st.mic = null; }
    const b = $('btnMic'); b.disabled = false; b.textContent = '🎤 Tiup pakai mic';
    $('blowMeter').hidden = true;
  }
  function micLevel(dt) {
    const m = st.mic; if (!m) return 0;
    m.an.getFloatTimeDomainData(m.buf);
    let s = 0; for (let i = 0; i < m.buf.length; i++) s += m.buf[i] * m.buf[i];
    const rms = Math.sqrt(s / m.buf.length);
    m.t += dt;
    if (m.t < .6 || rms < m.floor * 2) m.floor = lerp(m.floor, rms, .05);
    const thr = Math.max(.06, m.floor * 4);
    $('blowFill').style.width = `${clamp(rms / (thr * 1.6)) * 100}%`;
    return rms > thr ? 1 : 0;
  }

  /* ================= loop ================= */
  function sizeStage() {
    const W = three && three.W; if (!W) return;
    if (st && st.recording) return;
    const cw = innerWidth, ch = innerHeight;
    let dpr = Math.min(devicePixelRatio || 1, 2);
    const maxSide = 1600; if (Math.max(cw, ch) * dpr > maxSide) dpr = maxSide / Math.max(cw, ch);
    const w = Math.round(cw * dpr), h = Math.round(ch * dpr);
    stage.width = w; stage.height = h; st.dpr = dpr;
    W.renderer.setPixelRatio(1); W.renderer.setSize(w, h, false);
    if (W.composer) { W.composer.setSize(w, h); }
    const a = w / h; W.camera.aspect = a;
    const D = Math.max(5.6, 2.75 / (Math.tan(T.MathUtils.degToRad(20)) * a));
    st.camD = D; W.camera.updateProjectionMatrix();
  }

  /* ---------- potong kue & antar potongan pertama ---------- */
  const CUTPH = ['cut', 'serve', 'choose', 'deliver', 'given'];
  const handPos = (doll, out) => doll.localToWorld(out.set(0, .74, .42));
  function walkTo(obj, from, to, k, rig, t) {
    const e = easeInOut(clamp(k));
    obj.position.lerpVectors(from, to, e);
    const moving = k > 0 && k < 1;
    if (moving) { obj.rotation.y = Math.atan2(to.x - from.x, to.z - from.z); const sw = Math.sin(t * 9) * .5; rig.hipL.rotation.x = sw; rig.hipR.rotation.x = -sw; obj.position.y = Math.abs(Math.sin(t * 9)) * .04; }
    return moving;
  }
  function turnTo(obj, ang, dt) { let d = ang - obj.rotation.y; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; obj.rotation.y += d * Math.min(1, dt * 6); }
  function startCut() {
    if (st.phase !== 'opened') return;
    cutCake(); st.heroCtl = false; setPhase('cut');
  }
  function buildChoices() {
    const row = $('rowChoose'), o = st.opts;
    row.innerHTML = '<p class="choose-title">Potongan pertama untuk siapa?</p>';
    const guests = (o.guests || []).slice().sort((a, b) => (b.nick === o.carrier.nick) - (a.nick === o.carrier.nick));
    guests.forEach(gst => {
      const b = document.createElement('button'); b.className = 'btn light choose'; b.style.setProperty('--c', gst.color || '#e0a33a');
      b.innerHTML = `${gst.head ? `<img alt="" src="${gst.head}">` : ''}<span>${gst.nick}</span>`;
      b.onclick = () => chooseRecipient(gst);
      row.appendChild(b);
    });
  }
  function chooseRecipient(gst) {
    const W = three.W, o = st.opts;
    const isCarrier = gst.nick === o.carrier.nick;
    let doll = W.carrier;
    if (!isCarrier) {
      doll = window.Avatar.build(gst.look); doll.scale.setScalar(1.3); doll.userData.rig.hat.visible = true;
      doll.position.set(-5, 0, 1.36); W.scene.add(doll); W.guest = doll;
    }
    st.deliver = { gst, doll, isCarrier, rFrom: doll.position.clone(), rTo: new T.Vector3(-.72, 0, 1.36), rDur: isCarrier ? 1.4 : 2.6,
      h0: W.hero.position.clone().setY(0), h1: new T.Vector3(1.05, 0, 1.0), h2: new T.Vector3(.26, 0, 1.38), holder: null };
    st.heroCtl = true;
    setPhase('deliver');
  }
  function updateCut(dt, t) {
    const W = three.W, ph = st.phase, T0 = st.phaseT, top = .92 + W.cakeTop;
    const hero = W.hero, car = W.carrier;
    st.carMoving = false;
    if (ph === 'cut') {
      // lilin diangkat, pisau memotong dua kali
      if (W.candles) { W.candles.position.y = Math.min(.6, T0 * .8); W.candles.visible = T0 < .7; }
      const k = W.knife, { a0, a1 } = CUT();
      k.visible = T0 > .5 && T0 < 3.6;
      const seg = (x0, x1) => clamp((T0 - x0) / (x1 - x0));
      const ang = T0 < 2.1 ? a0 : lerp(a0, a1, easeInOut(seg(2.1, 2.4)));
      const down = T0 < 2.1 ? Math.sin(Math.PI * seg(.8, 2.0)) : Math.sin(Math.PI * seg(2.4, 3.5));
      const yTop = top + .3, yBot = .97;
      k.position.set(Math.sin(ang) * .25, lerp(yTop, yBot, down), Math.cos(ang) * .25);
      k.rotation.set(0, ang, 0);
      st.cutPose = { hero: 'clap', car: 'clap' };
      if (T0 > 3.7) setPhase('serve');
    } else if (ph === 'serve') {
      // irisan ditarik keluar ke piring
      const e = easeInOut(clamp(T0 / 1.2));
      W.plate.scale.setScalar(Math.min(1, T0 * 3) || .001);
      if (W.slice.parent === W.cake) { W.slice.position.z = lerp(.22, .22 + .8, e); W.slice.position.y = lerp(0, .02, e) + Math.sin(Math.PI * e) * .12; W.slice.scale.setScalar(lerp(1, .78, e)); }
      if (T0 > 1.25) { W.plate.add(W.slice); W.slice.position.set(0, .012 - .035 * .78, -.02 * .78); W.slice.scale.setScalar(.78); setPhase('choose'); }
      st.cutPose = { hero: 'cheer', car: 'clap' };
    } else if (ph === 'choose') {
      st.cutPose = { hero: 'stand', car: 'stand' };
    } else if (ph === 'deliver') {
      const D = st.deliver, rig = D.doll.userData.rig, hr = hero.userData.rig;
      // penerima berjalan ke depan meja
      const rm = walkTo(D.doll, D.rFrom, D.rTo, T0 / D.rDur, rig, t);
      if (!rm && T0 >= D.rDur) turnTo(D.doll, Math.PI / 2, dt);
      if (D.isCarrier) st.carMoving = rm;
      // yang ulang tahun: jalan memutar meja ke piring
      let hm = false;
      if (T0 < 1.0) hm = walkTo(hero, D.h0, D.h1, T0 / 1.0, hr, t);
      else if (T0 < 1.8) hm = walkTo(hero, D.h1, D.h2, (T0 - 1.0) / .8, hr, t);
      else { hero.position.y = 0; turnTo(hero, T0 < 2.6 ? Math.PI : -Math.PI / 2, dt); }
      if (!hm) { hr.hipL.rotation.x *= .85; hr.hipR.rotation.x *= .85; }
      if (!rm) { rig.hipL.rotation.x *= .85; rig.hipR.rotation.x *= .85; D.doll.position.y = 0; }
      const hp = new T.Vector3(), rp = new T.Vector3();
      // ambil piring
      if (T0 > 1.9 && T0 < 2.5) { handPos(hero, hp); W.plate.position.lerp(hp, Math.min(1, dt * 8)); }
      const g0 = Math.max(3.0, D.rDur + .3);
      if (T0 >= 2.5 && T0 < g0) { handPos(hero, hp); W.plate.position.copy(hp); W.plate.rotation.y = hero.rotation.y; }
      // serahkan
      if (T0 >= g0) {
        handPos(hero, hp); handPos(D.doll, rp);
        const e = easeInOut(clamp((T0 - g0) / .8));
        W.plate.position.lerpVectors(hp, rp, e); W.plate.position.y += Math.sin(Math.PI * e) * .08;
        W.plate.rotation.y = lerp(hero.rotation.y, D.doll.rotation.y, e);
      }
      const holdHero = T0 > 1.9 && T0 < g0 + .5, holdR = T0 > g0 + .3;
      st.cutPose = { hero: holdHero ? 'hold' : 'wave', car: D.isCarrier ? (holdR ? 'hold' : 'wave') : 'clap', guest: holdR ? 'hold' : 'wave' };
      if (T0 > g0 + .9) {
        const c = toScreen(D.doll.position.clone().setY(1.6)); hearts(c.x, c.y);
        setPhase('given');
      }
    } else if (ph === 'given') {
      const D = st.deliver, rp = new T.Vector3();
      handPos(D.doll, rp); W.plate.position.copy(rp); W.plate.rotation.y = D.doll.rotation.y;
      D.doll.position.y = Math.abs(Math.sin(T0 * 6)) * .08 * clamp(1 - T0 / 2.5);
      turnTo(hero, -.3, dt * .5);
      st.cutPose = { hero: T0 < 2.5 ? 'cheer' : 'wave', car: D.isCarrier ? 'hold' : 'clap', guest: 'hold' };
      if (Math.random() < dt * 2.5) { const c = toScreen(D.doll.position.clone().setY(1.9)); hearts(c.x, c.y, 4); }
    }
  }
  function hearts(x, y, n = 26) {
    const d = st.dpr || 1;
    for (let i = 0; i < n; i++) st.confetti.push({ x: x + rand(-30, 30) * d, y, vx: rand(-160, 160) * d, vy: rand(-520, -180) * d, rot: 0, vr: 0, w: rand(14, 24) * d, h: 0, c: ['#ff5d73', '#ff8fab', '#e04f42'][i % 3], life: rand(1.6, 2.6), t: 0, ph: rand(0, 6), heart: true });
  }

  function update(dt) {
    const W = three.W, t = st.time += dt; st.phaseT += dt;
    const car = W.carrier, u = car.userData.rig, hero = W.hero, A = window.Avatar;
    // kamera
    const lookY = a => a < .8 ? 1.45 : 1.7;
    const intro = easeOut(clamp(st.time / 4));
    const D = st.camD * lerp(1.25, 1, intro);
    W.camera.position.set(Math.sin(t * .23) * .25, lerp(2.6, 2.05, intro) + Math.sin(t * .17) * .04, D);
    W.camera.lookAt(0, lookY(W.camera.aspect), 0);

    if (st.phase === 'walk') {
      const p = clamp(st.phaseT / 3.8), e = easeInOut(p);
      car.position.x = lerp(-5.4, -1.6, e);
      const sw = Math.sin(t * 9) * .6 * (1 - Math.pow(p, 6));
      u.hipL.rotation.x = sw; u.hipR.rotation.x = -sw;
      car.position.y = Math.abs(Math.sin(t * 9)) * .05 * (1 - p);
      car.rotation.y = Math.PI / 2;
      if (p >= 1) {
        st.placeFrom = null; setPhase('place');
      }
    } else if (st.phase === 'place') {
      // melangkah sedikit, membungkuk, lalu menaruh kue pelan-pelan di tengah meja
      const p = clamp(st.phaseT / 2.2);
      if (p < .3) { const e = easeInOut(p / .3); car.position.x = lerp(-1.6, -1.32, e); const sw = Math.sin(t * 9) * .4; u.hipL.rotation.x = sw; u.hipR.rotation.x = -sw; }
      if (p >= .3 && !st.placeFrom) {
        const wp = new T.Vector3(); W.cake.getWorldPosition(wp);
        W.scene.add(W.cake); W.cake.scale.setScalar(1); W.cake.position.copy(wp); st.placeFrom = wp.clone();
      }
      if (st.placeFrom) {
        const e = easeInOut(clamp((p - .3) / .5)), f = st.placeFrom;
        W.cake.position.set(lerp(f.x, 0, e), lerp(f.y, .92, easeInOut(clamp((p - .45) / .35))), lerp(f.z, 0, e));
      }
      u.body.rotation.x = lerp(u.body.rotation.x, p > .3 && p < .82 ? .28 : 0, Math.min(1, dt * 6));
      car.rotation.y = p < .85 ? Math.PI / 2 : lerp(Math.PI / 2, .5, easeInOut((p - .85) / .15));
      setPose(p < .82 ? 'hold' : 'stand');
      if (p >= 1) { st.placeFrom = null; setPhase('wait'); }
    } else if (st.phase === 'wait') {
      car.position.y = 0;
      if (st.mic && micLevel(dt)) {
        st.blowAcc += dt; st.blowT = Math.max(st.blowT, .3);
        if (st.blowAcc > .18 && t - st.lastExt > .12) {
          const lit = W.flames.findIndex(f => f.lit); if (lit >= 0) { extinguish(lit); st.lastExt = t; }
        }
      } else st.blowAcc = Math.max(0, st.blowAcc - dt);
      if (st.recording && st.phaseT > 1.3 && W.flames.some(f => f.lit) && !st.recBlown) { st.recBlown = true; blowAll(); }
      if (W.flames.every(f => !f.lit)) { if (!st.blownAt) st.blownAt = t; if (t - st.blownAt > .55) { setPhase('party'); burst(stage.width / 2, stage.height * .55, 160); } }
    } else if (st.phase === 'party') {
      setPose('cheer');
      car.position.y = Math.abs(Math.sin(st.phaseT * 7)) * .2 * clamp(1 - st.phaseT / 3);
      hero.position.y = Math.abs(Math.sin(st.phaseT * 7 + 1.2)) * .2 * clamp(1 - st.phaseT / 3);
      if (st.phaseT > 2.6) setPhase('gift');
    } else if (st.phase === 'gift' || st.phase === 'opened') {
      car.position.y *= .9; hero.position.y *= .9;
    } else if (CUTPH.includes(st.phase)) {
      updateCut(dt, t);
    }
    if (['wait', 'party', 'gift', 'opened'].includes(st.phase) && car.position.x > -1.6 + .01) {
      car.position.x = Math.max(-1.6, car.position.x - dt * .5); const sw = Math.sin(t * 9) * .35; u.hipL.rotation.x = sw; u.hipR.rotation.x = -sw;
    }
    // setelah kue di meja, pembawa kue melangkah mendekat (tanpa menabrak meja)
    const stepping = st.phase === 'walk';
    if (!stepping && !(st.phase === 'place' && st.phaseT < .66) && !st.carMoving) { u.hipL.rotation.x *= .85; u.hipR.rotation.x *= .85; }
    // napas pelan
    [car, hero].forEach((c, i) => { const b = c.userData.rig.body; b.scale.y = 1 + Math.sin(t * 2.2 + i) * .012; });
    // pose karakter
    st.blowT = Math.max(0, st.blowT - dt);
    const ph = st.phase, opened = ph === 'opened' ? st.phaseT : 0;
    let cp = ph === 'walk' ? 'hold' : ph === 'place' ? st.carrierPose : ph === 'wait' ? 'clap' : ph === 'party' ? 'cheer' : ph === 'gift' ? 'stand' : (opened < 2.5 ? 'cheer' : 'wave');
    let hp = st.blowT > 0 ? 'blow' : ph === 'walk' || ph === 'place' ? 'wave' : ph === 'wait' ? 'stand' : ph === 'party' ? 'cheer' : ph === 'gift' ? 'clap' : 'cheer';
    if (st.cutPose) { if (st.cutPose.car) cp = st.cutPose.car; if (st.cutPose.hero) hp = st.cutPose.hero; }
    A.pose(car, cp, Math.min(1, dt * 9), t); A.pose(hero, hp, Math.min(1, dt * 9), t);
    if (W.guest) { A.pose(W.guest, (st.cutPose && st.cutPose.guest) || 'wave', Math.min(1, dt * 9), t); A.blink(W.guest, dt); }
    if (!st.heroCtl) hero.rotation.y = lerp(hero.rotation.y, st.blowT > 0 ? -1.05 : -.55, Math.min(1, dt * 6));
    hero.userData.rig.body.rotation.x = lerp(hero.userData.rig.body.rotation.x, st.blowT > 0 ? .22 : 0, Math.min(1, dt * 8));
    hero.userData.rig.head.rotation.y = st.blowT > 0 ? .25 : Math.sin(t * .7) * .12;
    u.head.rotation.y = stepping ? -.6 * (1 - clamp(st.phaseT / 3.8)) : Math.sin(t * .6 + 2) * .1;
    A.blink(car, dt); A.blink(hero, dt);
    A.faceCam(car, W.camera); A.faceCam(hero, W.camera);

    // cahaya ruangan
    const target = ['walk', 'place', 'wait'].includes(st.phase) ? 0 : 1;
    st.lights = lerp(st.lights, target, dt * 1.6);
    W.hemi.intensity = lerp(.5, 1.15, st.lights);
    W.key.intensity = lerp(.4, 1.8, st.lights);
    W.frameLight.intensity = lerp(4, 9, st.lights);
    W.scene.background.setRGB(lerp(.078, .2, st.lights), lerp(.055, .12, st.lights), lerp(.11, .14, st.lights));
    if (W.bloom) W.bloom.strength = lerp(.5, .3, st.lights);

    // api lilin
    let litK = 0;
    W.flames.forEach(f => {
      f.k = lerp(f.k, f.lit ? 1 : 0, f.lit ? dt * 4 : dt * 14);
      const n = Math.sin(t * 13 + f.ph) * .5 + Math.sin(t * 23.7 + f.ph * 2) * .3 + Math.sin(t * 5.1 + f.ph) * .2;
      const k = f.k;
      f.flame.scale.set(.075 * k * (1 + n * .06), .16 * k * (1 + n * .12), 1);
      f.flame.position.set(f.base.x + n * .004, f.base.y + .02 * k, f.base.z);
      f.glow.scale.setScalar(.42 * k * (1 + n * .1)); f.glow.material.opacity = .65 * k;
      f.flame.visible = f.glow.visible = k > .02;
      litK += k;
    });
    const flick = 1 + Math.sin(t * 17) * .08 + Math.sin(t * 7.3) * .06;
    W.candleLight.intensity = (litK / Math.max(1, W.flames.length)) * 3.2 * flick;
    W.candleLight.position.set(W.cake.position.x, W.cake.position.y + W.cakeTop + .5, W.cake.position.z + .25);
    if (W.cake.parent === W.carrier) { const wp = new T.Vector3(); W.cake.getWorldPosition(wp); W.candleLight.position.set(wp.x, wp.y + W.cakeTop * .9 + .5, wp.z + .25); }

    // asap
    W.smoke = W.smoke.filter(s => {
      s.t += dt; if (s.t < 0) return true;
      if (s.br) {
        const p = s.t / .5; s.sp.position.addScaledVector(s.v, dt); s.sp.scale.setScalar(.06 + p * .2); s.sp.material.opacity = Math.sin(Math.PI * clamp(p)) * .5;
        if (p >= 1) { W.scene.remove(s.sp); s.sp.material.dispose(); return false; } return true;
      }
      const life = 2.6, p = s.t / life;
      s.sp.position.y += dt * .32; s.sp.position.x += s.vx * dt + Math.sin(s.t * 3) * .002; s.sp.position.z += s.vz * dt;
      s.sp.scale.setScalar(.05 + p * .5); s.sp.material.opacity = (p < .15 ? p / .15 : 1 - (p - .15) / .85) * .55;
      if (p >= 1) { W.scene.remove(s.sp); s.sp.material.dispose(); return false; }
      return true;
    });
    // lampu & balon
    W.bulbs.forEach(b => { const v = .6 + .4 * Math.sin(t * 2.2 + b.ph); b.s.material.opacity = .35 + .55 * v; b.s.scale.setScalar(.26 + .1 * v); });
    W.balloons.forEach(b => { b.grp.position.y = b.base + Math.sin(t * .9 + b.ph) * .06; b.grp.rotation.z = Math.sin(t * .7 + b.ph) * .06; });
    W.flags.forEach((f, i) => { f.rotation.x = Math.sin(t * 1.3 + i) * .12; });
  }

  /* ================= 2D overlay ================= */
  function burst(x, y, n, spread = 1) {
    const s = st.dpr || 1;
    for (let i = 0; i < n; i++) {
      const a = rand(-Math.PI, 0) * spread - (spread < 1 ? Math.PI / 2 * (1 - spread) : 0), v = rand(380, 1050) * s;
      st.confetti.push({ x, y, vx: Math.cos(a) * v * rand(.4, 1), vy: Math.sin(a) * v, rot: rand(0, 6), vr: rand(-12, 12), w: rand(7, 13) * s, h: rand(4, 8) * s, c: CONFETTI[i % CONFETTI.length], life: rand(3.5, 6), t: 0, ph: rand(0, 6) });
    }
  }
  function firework() {
    const W = stage.width, H = stage.height, s = st.dpr || 1;
    const x = rand(W * .12, W * .88), y = rand(H * .12, H * .38), col = CONFETTI[Math.floor(rand(0, 6))];
    const n = 54;
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, v = rand(140, 260) * s; st.fw.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, life: rand(1, 1.6), c: col }); }
  }
  function drawText(txt, x, y, font, fill, opts = {}) {
    g2.font = font; g2.textAlign = opts.align || 'center'; g2.textBaseline = opts.base || 'alphabetic';
    g2.save(); g2.shadowColor = 'rgba(0,0,0,.55)'; g2.shadowBlur = 18 * (st.dpr || 1); g2.shadowOffsetY = 2 * (st.dpr || 1);
    g2.fillStyle = fill; g2.globalAlpha = opts.alpha == null ? 1 : opts.alpha; g2.fillText(txt, x, y); g2.restore();
  }
  function wrap(txt, maxW) {
    const words = txt.split(' '), lines = []; let cur = '';
    words.forEach(w => { const test = cur ? cur + ' ' + w : w; if (g2.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; } else cur = test; });
    if (cur) lines.push(cur); return lines;
  }
  function fitFont(txt, weight, family, maxPx, maxW) {
    let px = maxPx; g2.font = `${weight} ${px}px ${family}`;
    while (g2.measureText(txt).width > maxW && px > 12) { px -= 2; g2.font = `${weight} ${px}px ${family}`; }
    return `${weight} ${px}px ${family}`;
  }

  function yarnStroke(path, w) {
    g2.save(); g2.lineCap = 'round'; g2.lineJoin = 'round';
    g2.strokeStyle = '#8e241f'; g2.lineWidth = w * 1.25; path(); g2.stroke();
    g2.strokeStyle = '#c63d33'; g2.lineWidth = w; path(); g2.stroke();
    g2.strokeStyle = '#ee7a6c'; g2.lineWidth = w * .38; g2.setLineDash([w * .7, w * .9]); path(); g2.stroke();
    g2.restore();
  }

  function giftGeom() {
    const W = stage.width, H = stage.height;
    const S = Math.min(W * .4, H * .25);
    return { S, cx: W / 2, cy: H * .55 };
  }
  function drawGift(dt) {
    const gf = st.gift, W = stage.width, H = stage.height, d = st.dpr || 1;
    gf.show = Math.min(1, gf.show + dt / .8);
    const { S, cx } = giftGeom();
    let cy = giftGeom().cy + (1 - easeBack(gf.show)) * H * .6;
    const p = gf.p;
    const knot = { x: cx, y: cy - S * .55 };
    const restH = { x: cx + S * .82, y: cy + S * .3 };
    if (!gf.drag) { gf.hx = lerp(gf.hx || restH.x, restH.x, gf.open ? 0 : .18); gf.hy = lerp(gf.hy || restH.y, restH.y, gf.open ? 0 : .18); }
    if (gf.auto > 0 && !gf.open) {
      gf.auto -= dt; const tt = st.phaseT;
      gf.hx = restH.x + Math.sin(tt * 3.2) * S * .1 + S * .5 * clamp((2.5 - gf.auto) / 2.5);
      gf.hy = restH.y + S * 1.2 * clamp((2.5 - gf.auto) / 2.5);
      gf.p = Math.max(gf.p, clamp((2.5 - gf.auto) / 2.5));
      if (gf.auto <= 0) gf.p = 1;
    }
    st.giftHandle = { x: gf.hx, y: gf.hy, r: S * .14, knot, restH, S };

    const boxFade = gf.open ? clamp(1 - (gf.open - .9) / .5) : 1;
    g2.save(); g2.globalAlpha = boxFade;
    // sinar saat terbuka
    if (gf.open) {
      const a = clamp(gf.open / .4) * clamp(1 - (gf.open - 1.2) / 1);
      g2.save(); g2.translate(cx, cy - S * .3); g2.rotate(st.time * .4); g2.globalAlpha = a * .8;
      for (let i = 0; i < 14; i++) { g2.rotate(Math.PI * 2 / 14); const gr = g2.createLinearGradient(0, 0, 0, -S * 2.6); gr.addColorStop(0, 'rgba(255,236,170,.9)'); gr.addColorStop(1, 'rgba(255,236,170,0)'); g2.fillStyle = gr; g2.beginPath(); g2.moveTo(0, 0); g2.lineTo(-S * .16, -S * 2.6); g2.lineTo(S * .16, -S * 2.6); g2.closePath(); g2.fill(); }
      g2.restore();
    }
    // bayangan
    g2.fillStyle = 'rgba(0,0,0,.35)'; g2.beginPath(); g2.ellipse(cx, cy + S * .42, S * .62, S * .08, 0, 0, 7); g2.fill();
    // badan kotak
    const bx = cx - S / 2, by = cy - S * .33, bw = S, bh = S * .75;
    const gr = g2.createLinearGradient(bx, 0, bx + bw, 0); gr.addColorStop(0, '#2d5f86'); gr.addColorStop(.5, '#3a77a5'); gr.addColorStop(1, '#2a587c');
    g2.fillStyle = gr; g2.beginPath(); g2.roundRect(bx, by, bw, bh, S * .04); g2.fill();
    g2.save(); g2.beginPath(); g2.roundRect(bx, by, bw, bh, S * .04); g2.clip();
    g2.fillStyle = 'rgba(255,209,102,.9)';
    for (let yy = 0; yy < 6; yy++) for (let xx = 0; xx < 7; xx++) { g2.beginPath(); g2.arc(bx + (xx + (yy % 2) * .5) * S / 6, by + yy * S / 7 + S * .06, S * .022, 0, 7); g2.fill(); }
    g2.fillStyle = 'rgba(0,0,0,.18)'; g2.fillRect(bx, by, bw, S * .05);
    g2.restore();
    // pita benang (terurai sesuai p)
    const rem = 1 - p, bandW = S * .06;
    if (rem > .001) {
      const vTop = by - S * .18, vLen = (by + bh - vTop) * rem;
      yarnStroke(() => { g2.beginPath(); g2.moveTo(cx, vTop); g2.lineTo(cx, vTop + vLen); }, bandW);
      const hy = by + bh * .5, hl = bw / 2 * rem;
      yarnStroke(() => { g2.beginPath(); g2.moveTo(cx - hl, hy); g2.lineTo(cx + hl, hy); }, bandW);
    }
    // tutup
    if (gf.open) { gf.lidV += 2600 * d * dt; gf.lidY -= (1500 * d - gf.lidV) * dt; gf.lidR += dt * 4; }
    g2.save(); g2.translate(cx, by - S * .09 + (gf.lidY || 0)); g2.rotate(gf.lidR || 0);
    const lg = g2.createLinearGradient(0, -S * .12, 0, S * .1); lg.addColorStop(0, '#4a8cc0'); lg.addColorStop(1, '#2b5b82');
    g2.fillStyle = lg; g2.beginPath(); g2.roundRect(-S * .56, -S * .11, S * 1.12, S * .22, S * .04); g2.fill();
    if (rem > .001) yarnStroke(() => { g2.beginPath(); g2.moveTo(0, -S * .11); g2.lineTo(0, S * .11); }, bandW);
    g2.restore();
    // pita (bow)
    if (!gf.open) {
      const b = Math.pow(rem, .7);
      if (b > .02) {
        const lx = knot.x, ly = knot.y + S * .07;
        yarnStroke(() => { g2.beginPath(); g2.moveTo(lx, ly); g2.bezierCurveTo(lx - S * .55 * b, ly - S * .45 * b, lx - S * .6 * b, ly + S * .12 * b, lx, ly); }, bandW * .9);
        yarnStroke(() => { g2.beginPath(); g2.moveTo(lx, ly); g2.bezierCurveTo(lx + S * .55 * b, ly - S * .45 * b, lx + S * .6 * b, ly + S * .12 * b, lx, ly); }, bandW * .9);
        yarnStroke(() => { g2.beginPath(); g2.moveTo(lx, ly); g2.quadraticCurveTo(lx - S * .2 * b, ly + S * .2, lx - S * .26 * b, ly + S * .34 * b); }, bandW * .8);
      }
      // benang yang ditarik
      const kx = knot.x, ky = knot.y + S * .07;
      const dx = gf.hx - kx, dy = gf.hy - ky, dist = Math.hypot(dx, dy);
      const slack = Math.max(0, S * 1.05 - dist) * .5;
      yarnStroke(() => { g2.beginPath(); g2.moveTo(kx, ky); g2.quadraticCurveTo(kx + dx * .5 + S * .1, ky + dy * .5 + slack + S * .08, gf.hx, gf.hy); }, bandW * .75);
      g2.fillStyle = '#c63d33'; g2.beginPath(); g2.arc(kx, ky, S * .055, 0, 7); g2.fill();
      // pompom pegangan
      const pr = S * .11 * (gf.drag ? 1.12 : 1);
      g2.fillStyle = '#e04f42'; g2.beginPath(); g2.arc(gf.hx, gf.hy, pr, 0, 7); g2.fill();
      g2.strokeStyle = '#ff9a8c'; g2.lineWidth = 2 * d;
      for (let i = 0; i < 14; i++) { const a = i / 14 * 6.28 + st.time * .3; g2.beginPath(); g2.moveTo(gf.hx + Math.cos(a) * pr * .2, gf.hy + Math.sin(a) * pr * .2); g2.lineTo(gf.hx + Math.cos(a) * pr * 1.05, gf.hy + Math.sin(a) * pr * 1.05); g2.stroke(); }
      // petunjuk
      if (p < .05 && !gf.drag && gf.show >= 1 && !st.recording) {
        const bob = Math.sin(st.time * 5) * S * .05;
        g2.save(); g2.globalAlpha = .9; g2.strokeStyle = '#fff'; g2.lineWidth = 4 * d; g2.lineCap = 'round';
        const ax = gf.hx + S * .18, ay = gf.hy + S * .2 + bob;
        g2.beginPath(); g2.moveTo(ax, ay); g2.lineTo(ax + S * .22, ay + S * .32); g2.moveTo(ax + S * .22, ay + S * .32); g2.lineTo(ax + S * .06, ay + S * .3); g2.moveTo(ax + S * .22, ay + S * .32); g2.lineTo(ax + S * .24, ay + S * .15); g2.stroke();
        g2.restore();
        drawText('Tarik benangnya!', cx, cy + S * .78, `700 ${Math.round(S * .2)}px Caveat, cursive`, '#fff');
      } else if (!gf.open && p < 1 && !st.recording) {
        drawText(`${Math.round(p * 100)}% terurai…`, cx, cy + S * .78, `700 ${Math.round(S * .17)}px Caveat, cursive`, '#ffe3b0');
      }
    }
    g2.restore();

    if (gf.p >= 1 && !gf.open) {
      gf.open = .0001; burst(cx, by, 140, .9); for (let i = 0; i < 3; i++) setTimeout(firework, i * 250);
      setPhase('opened'); st.cardT = 0;
    }
    if (gf.open) gf.open += dt;
  }

  function drawCard(dt) {
    st.cardT += dt;
    const W = stage.width, H = stage.height, d = st.dpr || 1, o = st.opts;
    const k = easeBack(clamp(st.cardT / 1.1));
    const barSpace = 120 * d, topSpace = H * .2;
    const availH = H - barSpace - topSpace;
    let cw = Math.min(W * .86, availH * .82, 560 * d);
    const pad = cw * .07;
    g2.font = `600 ${Math.round(cw * .042)}px Nunito, sans-serif`;
    const lines = wrap(o.wish, cw - pad * 2);
    g2.font = `italic 500 ${Math.round(cw * .038)}px Fraunces, serif`;
    const vlines = o.verse ? wrap(`“${o.verse.t}”`, cw - pad * 2.4) : [];
    const lh = cw * .058;
    const photoH = (cw - pad * 2) * .5;
    let ch = pad + photoH + cw * .12 + lines.length * lh + (vlines.length ? (vlines.length + 1) * lh * .92 + cw * .05 : 0) + cw * .2 + pad * .6;
    if (ch > availH) { const s = availH / ch; cw *= s; return drawCardScaled(cw, availH, topSpace, barSpace, k); }
    return drawCardScaled(cw, ch, topSpace, barSpace, k);
  }
  function drawCardScaled(cw, ch, topSpace, barSpace, k) {
    const W = stage.width, H = stage.height, d = st.dpr || 1, o = st.opts;
    const pad = cw * .07, lh = cw * .058;
    const cx = W / 2, cyTarget = topSpace + (H - barSpace - topSpace) / 2;
    const { cy: gy } = giftGeom();
    const cy = lerp(gy, cyTarget, k);
    g2.save(); g2.translate(cx, cy); g2.scale(lerp(.2, 1, k), lerp(.2, 1, k)); g2.rotate((1 - k) * -.3 + Math.sin(st.time * .8) * .012);
    const x = -cw / 2, y = -ch / 2;
    g2.shadowColor = 'rgba(0,0,0,.5)'; g2.shadowBlur = 40 * d; g2.shadowOffsetY = 14 * d;
    g2.fillStyle = '#fffaf2'; g2.beginPath(); g2.roundRect(x, y, cw, ch, cw * .04); g2.fill();
    g2.shadowColor = 'transparent';
    g2.strokeStyle = 'rgba(184,55,47,.6)'; g2.lineWidth = 2.5 * d; g2.setLineDash([8 * d, 6 * d]);
    g2.beginPath(); g2.roundRect(x + pad * .35, y + pad * .35, cw - pad * .7, ch - pad * .7, cw * .03); g2.stroke(); g2.setLineDash([]);
    // foto
    const pw = cw - pad * 2, ph = pw * .5, px = x + pad, py = y + pad;
    const img = st.photoImg;
    g2.save(); g2.beginPath(); g2.roundRect(px, py, pw, ph, cw * .02); g2.clip();
    if (img) {
      const ar = pw / ph, ir = img.width / img.height; let sw = img.width, sh = img.height, sx = 0, sy = 0;
      if (ir > ar) { sw = img.height * ar; sx = (img.width - sw) / 2; } else { sh = img.width / ar; sy = (img.height - sh) * .2; }
      g2.drawImage(img, sx, sy, sw, sh, px, py, pw, ph);
    } else { g2.fillStyle = '#e0a33a'; g2.fillRect(px, py, pw, ph); }
    g2.restore();
    // pita kecil di foto
    g2.save(); g2.translate(px + pw - cw * .08, py + cw * .02); g2.rotate(.5); g2.fillStyle = 'rgba(224,163,58,.85)'; g2.fillRect(-cw * .09, -cw * .025, cw * .18, cw * .05); g2.restore();
    let ty = py + ph + cw * .1;
    g2.fillStyle = '#b8372f'; g2.font = `700 ${Math.round(cw * .085)}px Caveat, cursive`; g2.textAlign = 'center'; g2.textBaseline = 'alphabetic';
    g2.fillText(`Untuk ${o.nick}, ke-${o.age} 💝`, 0, ty);
    ty += cw * .055;
    g2.fillStyle = '#2e2420'; g2.font = `600 ${Math.round(cw * .042)}px Nunito, sans-serif`;
    wrap(o.wish, cw - pad * 2).forEach(l => { ty += lh; g2.fillText(l, 0, ty); });
    if (o.verse) {
      ty += cw * .05;
      g2.fillStyle = '#6b5a50'; g2.font = `italic 500 ${Math.round(cw * .038)}px Fraunces, serif`;
      wrap(`“${o.verse.t}”`, cw - pad * 2.4).forEach(l => { ty += lh * .92; g2.fillText(l, 0, ty); });
      ty += lh * .92; g2.fillStyle = '#b8372f'; g2.font = `800 ${Math.round(cw * .032)}px Nunito, sans-serif`;
      g2.fillText(`— ${o.verse.r} ✝`, 0, ty);
    }
    // kupon
    ty += cw * .07;
    const chips = st.coupons;
    g2.font = `800 ${Math.round(cw * .031)}px Nunito, sans-serif`;
    const widths = chips.map(c => g2.measureText(c).width + cw * .05);
    const total = widths.reduce((a, b) => a + b, 0) + cw * .02 * (chips.length - 1);
    let cxp = -Math.min(total, cw - pad) / 2;
    const sc = Math.min(1, (cw - pad) / total);
    g2.save(); g2.scale(sc, sc); cxp /= sc;
    chips.forEach((c, i) => {
      const w = widths[i], hh = cw * .065;
      g2.fillStyle = ['#ffe2a8', '#d6ecd2', '#d7e4f3'][i % 3]; g2.beginPath(); g2.roundRect(cxp, ty / sc - hh * .72, w, hh, hh / 2); g2.fill();
      g2.fillStyle = '#2e2420'; g2.textAlign = 'center'; g2.fillText(c, cxp + w / 2, ty / sc); cxp += w + cw * .02;
    });
    g2.restore();
    g2.restore();
  }

  function drawOverlay(dt) {
    const W = stage.width, H = stage.height, d = st.dpr || 1, o = st.opts;
    g2.drawImage(three.W.renderer.domElement, 0, 0, W, H);
    // vignette
    const vg = g2.createRadialGradient(W / 2, H * .55, Math.min(W, H) * .3, W / 2, H * .55, Math.max(W, H) * .8);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(8,4,14,${lerp(.6, .3, st.lights)})`); g2.fillStyle = vg; g2.fillRect(0, 0, W, H);

    const U = Math.min(W, H * .7) / 100;
    const ty = Math.max(H * .085, 60 * d);
    const ph = st.phase;
    if (ph === 'walk' || ph === 'place') {
      const a = clamp(st.time / .8);
      drawText(`${o.carrier.nick} datang bawa kue…`, W / 2, ty, `700 ${Math.round(U * 7.5)}px Caveat, cursive`, '#ffe9c4', { alpha: a });
      if (o.daysAfter) drawText(`(telat ${o.daysAfter} hari, tapi tetap dirayakan!)`, W / 2, ty + U * 6, `600 ${Math.round(U * 3.6)}px Nunito, sans-serif`, '#e8d5bd', { alpha: a });
    } else if (ph === 'wait') {
      const a = clamp(st.phaseT / .8);
      drawText(`Selamat Ulang Tahun ke-${o.age}`, W / 2, ty, fitFont(`Selamat Ulang Tahun ke-${o.age}`, 900, 'Fraunces, serif', Math.round(U * 7.2), W * .9), '#fff4e0', { alpha: a });
      drawText(o.name, W / 2, ty + U * 8, fitFont(o.name, 700, 'Caveat, cursive', Math.round(U * 8), W * .9), '#ffc37a', { alpha: a });
      const pulse = .7 + .3 * Math.sin(st.time * 4);
      drawText(st.recording ? '🎂' : (o.preview ? 'Latihan dulu ya! Tiup lilinnya 🌬️' : 'Make a wish, lalu tiup lilinnya 🌬️'), W / 2, ty + U * 14, `600 ${Math.round(U * 3.8)}px Nunito, sans-serif`, '#fff', { alpha: a * pulse });
    } else if (CUTPH.includes(ph)) {
      const D = st.deliver;
      const t1 = ph === 'cut' ? 'Potong kuenya… 🔪' : ph === 'serve' ? 'Potongan pertama…' : ph === 'choose' ? `${o.nick}, kasih ke siapa? 🍰` : ph === 'deliver' ? `${o.nick} mengantar potongan pertama…` : `Potongan pertama untuk ${D ? D.gst.nick : ''} 💝`;
      drawText(t1, W / 2, ty, fitFont(t1, 700, 'Caveat, cursive', Math.round(U * 8), W * .9), '#fff4e0');
      if (ph === 'given') drawText('Berbagi sukacita itu indah. Tuhan memberkati 🙏', W / 2, ty + U * 7, `600 ${Math.round(U * 3.6)}px Nunito, sans-serif`, '#ffe3b0');
    } else {
      const a = clamp(st.phaseT / .6 + (ph !== 'party' ? 1 : 0));
      const t1 = `Selamat Ulang Tahun, ${o.nick}!`;
      drawText(t1, W / 2, ty, fitFont(t1, 900, 'Fraunces, serif', Math.round(U * 7.4), W * .92), '#fff4e0', { alpha: a });
      drawText(`ke-${o.age} · Tuhan memberkati 🙏`, W / 2, ty + U * 7.5, `700 ${Math.round(U * 6)}px Caveat, cursive`, '#ffc37a', { alpha: a });
    }
    // kembang api
    if ((ph === 'party' || ph === 'gift') && st.phaseT < 30) {
      st.fwT = (st.fwT || 0) - dt; if (st.fwT <= 0 && st.rockets < 14) { firework(); st.rockets++; st.fwT = rand(.35, .9); }
    }
    g2.save(); g2.globalCompositeOperation = 'lighter';
    st.fw = st.fw.filter(p => {
      p.t += dt; p.vy += 140 * d * dt; p.vx *= .985; p.vy *= .985; p.x += p.vx * dt; p.y += p.vy * dt;
      const a = clamp(1 - p.t / p.life); g2.fillStyle = p.c; g2.globalAlpha = a;
      g2.beginPath(); g2.arc(p.x, p.y, 2.6 * d, 0, 7); g2.fill();
      g2.globalAlpha = a * .35; g2.beginPath(); g2.arc(p.x - p.vx * .04, p.y - p.vy * .04, 2 * d, 0, 7); g2.fill();
      return p.t < p.life;
    });
    g2.restore();

    if (ph === 'gift' || ph === 'opened') drawGift(dt);
    if (ph === 'opened') drawCard(dt);

    // konfeti
    st.confetti = st.confetti.filter(c => {
      c.t += dt; c.vy += (c.heart ? 380 : 900) * d * dt; c.vx *= Math.pow(.25, dt); c.vy = Math.min(c.vy, 260 * d);
      c.x += (c.vx + Math.sin(c.t * 3 + c.ph) * 60 * d) * dt; c.y += c.vy * dt; c.rot += c.vr * dt;
      g2.save(); g2.translate(c.x, c.y); g2.rotate(c.rot); g2.scale(1, Math.cos(c.t * 8 + c.ph));
      g2.globalAlpha = clamp((c.life - c.t) / .6); g2.fillStyle = c.c;
      if (c.heart) { g2.rotate(-c.rot); g2.scale(1, 1 / (Math.cos(c.t * 8 + c.ph) || 1)); g2.font = `${Math.round(c.w)}px serif`; g2.textAlign = 'center'; g2.fillText('❤', 0, 0); }
      else g2.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
      g2.restore();
      return c.t < c.life && c.y < H + 40;
    });
    if (!['walk', 'place', 'wait'].includes(ph) && Math.random() < dt * 6) st.confetti.push({ x: rand(0, W), y: -20, vx: 0, vy: rand(60, 160) * d, rot: rand(0, 6), vr: rand(-6, 6), w: rand(7, 12) * d, h: rand(4, 7) * d, c: CONFETTI[Math.floor(rand(0, 7))], life: 9, t: 0, ph: rand(0, 6) });

    // tanda air
    g2.save(); g2.globalAlpha = .75; g2.fillStyle = '#f3e3cb'; g2.font = `700 ${Math.round(Math.max(13 * d, U * 2.6))}px Caveat, cursive`; g2.textAlign = 'left';
    g2.fillText(`Jovi Birthday · ${st.dateLabel}`, 16 * d, H - (st.recording ? 18 : 100) * d); g2.restore();
  }

  function frame(now) {
    if (!st || !st.running) return;
    const dt = Math.min(.05, (now - (st.last || now)) / 1000); st.last = now;
    if (st.recording) { st.recT += dt; $('recTime').textContent = Math.floor(st.recT); if (st.recT > st.recDur) finishRecording(); }
    update(dt);
    const W = three.W;
    if (W.composer) W.composer.render(); else W.renderer.render(W.scene, W.camera);
    drawOverlay(dt);
    requestAnimationFrame(frame);
  }

  /* ================= interaksi kado ================= */
  function toCanvas(e) { const r = stage.getBoundingClientRect(); return { x: (e.clientX - r.left) * stage.width / r.width, y: (e.clientY - r.top) * stage.height / r.height }; }
  stage.addEventListener('pointerdown', e => {
    if (!st) return;
    if (st.phase === 'walk' && st.phaseT > .4) { st.phaseT = Math.max(st.phaseT, 3.5); return; }
    if (st.phase !== 'gift' || st.gift.open) return;
    const p = toCanvas(e), h = st.giftHandle; if (!h) return;
    const near = Math.hypot(p.x - h.x, p.y - h.y) < h.r * 2.4;
    const onBox = Math.abs(p.x - h.knot.x) < h.S * .7 && p.y > h.knot.y - h.S * .4 && p.y < h.knot.y + h.S * 1.2;
    if (near) { st.gift.drag = true; st.gift.downAt = p; stage.setPointerCapture(e.pointerId); }
    else if (onBox) { st.gift.auto = Math.max(st.gift.auto, 0); st.gift.p = Math.min(1, st.gift.p + .22); }
  });
  stage.addEventListener('pointermove', e => {
    if (!st || !st.gift || !st.gift.drag) return;
    const p = toCanvas(e), h = st.giftHandle;
    st.gift.hx = p.x; st.gift.hy = p.y;
    const dist = Math.hypot(p.x - h.knot.x, p.y - h.knot.y), rest = Math.hypot(h.restH.x - h.knot.x, h.restH.y - h.knot.y);
    st.gift.p = Math.max(st.gift.p, clamp((dist - rest) / (h.S * 1.5)));
  });
  const endDrag = () => { if (st && st.gift) st.gift.drag = false; };
  stage.addEventListener('pointerup', endDrag); stage.addEventListener('pointercancel', endDrag);

  /* ================= foto, video, bagikan ================= */
  const slug = () => (st.opts.nick || 'ultah').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  function showSheet(blob, kind, filename) {
    const media = $('sheetMedia'), url = URL.createObjectURL(blob);
    media.innerHTML = '';
    const el = document.createElement(kind === 'video' ? 'video' : 'img');
    el.src = url; if (kind === 'video') { el.controls = true; el.playsInline = true; el.autoplay = true; } else el.alt = 'Foto perayaan';
    media.appendChild(el);
    const dl = $('sheetDl'); dl.href = url; dl.download = filename;
    const file = new File([blob], filename, { type: blob.type });
    const canShare = navigator.canShare && navigator.canShare({ files: [file] });
    $('sheetShare').hidden = !canShare;
    $('sheetNote').textContent = canShare ? 'Bagikan langsung ke WhatsApp, Instagram, dan lainnya.' : 'Unduh dulu, lalu kirim lewat WhatsApp atau Instagram.';
    $('sheetShare').onclick = async () => {
      try { await navigator.share({ files: [file], title: `Ulang tahun ${st.opts.nick}`, text: `Selamat ulang tahun ke-${st.opts.age}, ${st.opts.nick}! 🎂` }); } catch (e) { }
    };
    $('sheet').hidden = false;
    $('sheetClose').onclick = () => { $('sheet').hidden = true; media.innerHTML = ''; setTimeout(() => URL.revokeObjectURL(url), 60000); };
  }
  function takePhoto() {
    const flash = document.createElement('div');
    flash.style.cssText = 'position:fixed;inset:0;background:#fff;z-index:150;pointer-events:none;transition:opacity .5s';
    document.body.appendChild(flash); requestAnimationFrame(() => { flash.style.opacity = 0; setTimeout(() => flash.remove(), 600); });
    stage.toBlob(b => b && showSheet(b, 'image', `ultah-${slug()}-${st.opts.age}.jpg`), 'image/jpeg', .92);
  }
  function pickMime() {
    if (!window.MediaRecorder) return '';
    return ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4;codecs=avc1,mp4a', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
      .find(t => MediaRecorder.isTypeSupported(t)) || '';
  }
  function b64ToBuf(dataUri) {
    const b = atob(dataUri.split(',')[1]), u = new Uint8Array(b.length);
    for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u.buffer;
  }
  async function startRecording() {
    if (st.recording) return;
    const mime = pickMime();
    if (!mime || !stage.captureStream) { window.toast('Browser ini belum bisa merekam. Coba pakai Chrome terbaru.'); return; }
    const c = getCtx(); await c.resume();
    try { if (!st.clipBuf && window.MEDIA && MEDIA.clip) st.clipBuf = await c.decodeAudioData(b64ToBuf(MEDIA.clip)); } catch (e) { st.clipBuf = null; }
    await window.BGM.stop();
    const dest = c.createMediaStreamDestination(), gain = c.createGain(); gain.gain.value = .9;
    gain.connect(dest); gain.connect(c.destination);
    let src = null;
    if (st.clipBuf) { src = c.createBufferSource(); src.buffer = st.clipBuf; src.connect(gain); }
    const vs = stage.captureStream(30);
    const stream = new MediaStream([...vs.getVideoTracks(), ...dest.stream.getAudioTracks()]);
    const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 6e6, audioBitsPerSecond: 128e3 });
    const chunks = [];
    rec.ondataavailable = e => e.data && e.data.size && chunks.push(e.data);
    rec.onstop = () => {
      stream.getTracks().forEach(t => t.stop());
      const type = mime.split(';')[0], ext = type.includes('mp4') ? 'mp4' : 'webm';
      const blob = new Blob(chunks, { type });
      $('recBadge').hidden = true; $('partyBar').classList.remove('hide');
      st.recording = false;
      showSheet(blob, 'video', `ultah-${slug()}-${st.opts.age}.${ext}`);
      window.BGM.play('main');
    };
    resetScene('walk');
    st.recording = true; st.recT = 0; st.recDur = 19.5; st.recBlown = false; st.rec = { rec, gain, src };
    $('recBadge').hidden = false; $('partyBar').classList.add('hide');
    rec.start(250); if (src) src.start();
  }
  function finishRecording() {
    const r = st.rec; if (!r || r.stopping) return; r.stopping = true;
    const c = getCtx(); r.gain.gain.setTargetAtTime(0, c.currentTime, .15);
    setTimeout(() => { try { r.src && r.src.stop(); } catch (e) { } r.rec.state !== 'inactive' && r.rec.stop(); }, 500);
  }

  /* ================= buka / tutup ================= */
  async function open(opts) {
    party.hidden = false; document.body.style.overflow = 'hidden';
    $('partyLoading').classList.remove('done'); $('partyLoading').textContent = 'Menyalakan lilin…';
    $('rowBlow').hidden = true; $('rowAfter').hidden = true;
    window.BGM && window.BGM.play('song');
    st = st || {};
    opts = Object.assign({}, opts, { wish: `${opts.wish} — dari ${opts.from ? opts.from + ' & ' : ''}keluarga ♥` });
    Object.assign(st, { opts, running: false, time: 0, phaseT: 0, last: 0, recording: false, confetti: [], fw: [], gift: null });
    const d = new Date(); st.dateLabel = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    const pool = (opts.others && opts.others.length ? opts.others : ['Joshua', 'Mama', 'Bapak', 'Muel', 'Putri']).slice().sort(() => Math.random() - .5);
    const cps = COUPONS.slice().sort(() => Math.random() - .5);
    st.coupons = pool.slice(0, 3).map((n, i) => `🎟️ ${cps[i]} (${n})`);
    try {
      await loadThree();
      if (document.fonts) await Promise.all(['900 40px Fraunces', '700 40px Caveat', '600 20px Nunito', '800 20px Nunito'].map(f => document.fonts.load(f).catch(() => { })));
      await buildPersonal(opts);
    } catch (e) {
      console.error(e);
      $('partyLoading').textContent = 'Butuh koneksi internet untuk memuat kue 3D 😢';
      return;
    }
    sizeStage();
    resetScene('walk');
    $('partyLoading').classList.add('done');
    st.running = true; requestAnimationFrame(frame);
  }
  function close() {
    if (!st) return;
    if (st.recording) { st.recording = false; try { st.rec.rec.stop(); } catch (e) { } }
    st.running = false; stopMic();
    party.hidden = true; document.body.style.overflow = '';
    $('recBadge').hidden = true; $('partyBar').classList.remove('hide');
    window.BGM && window.BGM.stop();
  }

  $('partyClose').onclick = close;
  $('btnMic').onclick = startMic;
  $('btnTap').onclick = () => blowAll();
  $('btnPhoto').onclick = takePhoto;
  $('btnVideo').onclick = startRecording;
  $('btnAgain').onclick = () => { window.BGM.play('song'); resetScene('wait'); };
  $('btnCut').onclick = startCut;
  addEventListener('resize', () => { if (st && st.running) sizeStage(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !party.hidden && $('sheet').hidden) close(); });

  // perpanjang hook update untuk kado otomatis saat merekam
  const _setPhase = setPhase;
  setPhase = function (p) { _setPhase(p); if (p === 'gift' && st.recording) st.gift.auto = 2.5 + .8; };

  // alat uji: majukan animasi N detik (berguna saat tab tidak terlihat)
  function advance(sec) {
    if (!st || !st.running) return;
    for (let k = 0; k < Math.round(sec * 30); k++) { const dt = 1 / 30; if (st.recording) st.recT += dt; update(dt); if (k % 3 === 0 || k === Math.round(sec * 30) - 1) { const W = three.W; W.composer ? W.composer.render() : W.renderer.render(W.scene, W.camera); drawOverlay(dt); } }
    return st.phase;
  }
  window.Party = { open, close, advance, state: () => st };
})();
