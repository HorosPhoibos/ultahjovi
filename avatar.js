/* Jovi Birthday — boneka rajut (amigurumi) 3D. Tanpa foto: ciri tiap orang (rambut, kacamata, kumis, seragam) dirajut & disulam. */
(function () {
  'use strict';
  let T = null, loading = null;
  const FACES = {};
  const load = () => loading || (loading = import('three').then(m => { T = m; }));
  function loadFaces(map) {
    return Promise.all(Object.entries(map || {}).map(([k, src]) => new Promise(res => {
      const i = new Image(); i.onload = () => { FACES[k] = i; res(); }; i.onerror = res; i.src = src;
    })));
  }

  const DEF = { skin: '#e2ae88', hairColor: '#1d1716', shirt: '#6d8fb3', pants: '#2f3442', shoes: '#3a2f2a', build: 1, hair: 'short', hat: '#ffd166' };

  /* ---------- tekstur rajut (dibuat di kode) ---------- */
  const shade = (hex, k) => { const c = new T.Color(hex); c.offsetHSL(0, 0, k); return '#' + c.getHexString(); };
  function stitch(x, cx, cy, cw, ch, col) {
    // satu jahitan "V": dua kaki benang miring
    x.fillStyle = shade(col, -.16); x.fillRect(cx, cy, cw, ch);
    for (const s of [-1, 1]) {
      x.save(); x.translate(cx + cw / 2 + s * cw * .21, cy + ch * .5); x.rotate(s * -.55);
      const g = x.createLinearGradient(0, -ch * .55, 0, ch * .55);
      g.addColorStop(0, shade(col, .1)); g.addColorStop(.45, col); g.addColorStop(1, shade(col, -.1));
      x.fillStyle = g; x.beginPath(); x.ellipse(0, 0, cw * .26, ch * .6, 0, 0, Math.PI * 2); x.fill();
      x.strokeStyle = shade(col, -.22); x.lineWidth = Math.max(.6, cw * .05); x.stroke();
      x.strokeStyle = 'rgba(255,255,255,.18)'; x.lineWidth = Math.max(.5, cw * .04);
      x.beginPath(); x.moveTo(-cw * .05, -ch * .35); x.lineTo(-cw * .05, ch * .1); x.stroke();
      x.restore();
    }
  }
  const KT = {};
  function knitTex(col) {
    if (KT[col]) return KT[col];
    const n = 8, cs = 16, c = document.createElement('canvas'); c.width = c.height = n * cs;
    const x = c.getContext('2d');
    for (let r = -1; r <= n; r++) for (let k = 0; k < n; k++) stitch(x, k * cs, r * cs, cs, cs, col);
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = 4;
    return (KT[col] = t);
  }
  function knitMat(col, rep = [3, 3]) {
    const base = knitTex(col), map = base.clone(); map.needsUpdate = true; map.repeat.set(rep[0], rep[1]);
    return new T.MeshPhysicalMaterial({ map, bumpMap: map, bumpScale: 1.6, roughness: .95, sheen: 1, sheenRoughness: .6, sheenColor: new T.Color(shade(col, .25)) });
  }

  /* ---------- kepala rajut dengan wajah ---------- */
  function build(look) {
    const L = Object.assign({}, DEF, look || {});
    const w = L.build;
    const KM = {};
    const km = (col, rep) => { const k = col + (rep ? rep.join('x') : ''); return KM[k] || (KM[k] = knitMat(col, rep)); };
    const std = (c, r = .6, extra) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: r }, extra || {}));
    const mesh = (g, m, x = 0, y = 0, z = 0) => { const o = new T.Mesh(g, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; return o; };
    const sph = (r, ws = 24, hs = 18) => new T.SphereGeometry(r, ws, hs);
    const root = new T.Group();
    const fz = .22 * w * .86; // depan badan

    // kaki pendek
    const leg = side => {
      const hip = new T.Group(); hip.position.set(side * .1 * w, .34, 0);
      hip.add(mesh(new T.CapsuleGeometry(.088 * w, .12, 6, 14), km(L.pants, [2, 1]), 0, -.13, 0));
      const s = mesh(sph(.1), km(L.shoes, [2, 1]), 0, -.27, .03); s.scale.set(1, .62, 1.35); hip.add(s);
      return hip;
    };
    const hipL = leg(-1), hipR = leg(1);
    root.add(hipL, hipR);

    // badan
    const body = new T.Group(); root.add(body);
    const torso = mesh(new T.CapsuleGeometry(.22 * w, .16, 10, 24), km(L.shirt, [4, 2]), 0, .6, 0); torso.scale.set(1, 1, .86); body.add(torso);
    if (L.dress) body.add(mesh(new T.CylinderGeometry(.21 * w, .31 * w, .3, 32), km(L.shirt, [5, 1]), 0, .33, 0));
    else if (L.coat) { const c = mesh(new T.CylinderGeometry(.225 * w, .28 * w, .26, 32, 1, true), km(L.shirt, [5, 1]), 0, .36, 0); c.material.side = T.DoubleSide; c.scale.z = .9; body.add(c); }
    else { const b = mesh(new T.CylinderGeometry(.215 * w, .22 * w, .06, 28), km(L.pants, [4, 1]), 0, .42, 0); b.scale.z = .86; body.add(b); }
    if (L.inner) { const v = mesh(new T.ConeGeometry(.09, .25, 3), km(L.inner, [1, 1]), 0, .72, fz - .01); v.rotation.x = Math.PI; v.scale.z = .25; body.add(v); }
    if (L.collar) [-1, 1].forEach(s => { const k = mesh(new T.BoxGeometry(.12, .03, .08), km(L.collar, [1, 1]), s * .06, .84, fz - .05); k.rotation.set(.5, 0, s * -.5); body.add(k); });
    if (L.tie) { const t = mesh(new T.BoxGeometry(.045, .22, .02), km(L.tie, [1, 2]), 0, .68, fz + .005); t.rotation.x = -.18; body.add(t); body.add(mesh(new T.BoxGeometry(.055, .045, .025), km(L.tie, [1, 1]), 0, .8, fz - .01)); }
    if (L.bef) [-1, 1].forEach(s => { const b = mesh(new T.BoxGeometry(.04, .12, .015), km('#ffffff', [1, 1]), s * .026, .76, fz + .002); b.rotation.x = -.15; body.add(b); });
    if (L.lanyard) {
      const ly = mesh(new T.TorusGeometry(.15, .01, 6, 24, Math.PI), std('#1f3c88', .7), 0, .76, fz - .07); ly.rotation.set(-.4, 0, Math.PI); body.add(ly);
      const card = mesh(new T.BoxGeometry(.08, .1, .012), std('#ffffff', .3), .0, .6, fz + .01); card.rotation.x = -.12; body.add(card);
      body.add(mesh(new T.BoxGeometry(.06, .02, .014), std('#1f3c88', .5), 0, .63, fz + .02));
    }
    if (L.stetho) {
      const st = mesh(new T.TorusGeometry(.15, .013, 8, 28, Math.PI * 1.1), std('#3a3a44', .4), 0, .74, fz - .08); st.rotation.set(-.4, 0, Math.PI * 1.05); body.add(st);
      const disc = mesh(new T.CylinderGeometry(.035, .035, .018, 18), std('#c9ccd3', .2, { metalness: .8 }), .08, .58, fz + .01); disc.rotation.x = Math.PI / 2; body.add(disc);
    }
    if (L.mask) { const mk = mesh(new T.BoxGeometry(.2, .07, .04), km('#9fd3e6', [1, 1]), 0, .83, fz - .06); mk.rotation.x = -.35; body.add(mk); }
    if (L.polo) { const r = mesh(new T.TorusGeometry(.13, .02, 8, 28), km(L.polo, [2, 1]), 0, .86, 0); r.rotation.x = Math.PI / 2 - .2; r.scale.y = .86; body.add(r); }
    if (L.buttons) for (let i = 0; i < 3; i++) body.add(mesh(sph(.016, 8, 6), std(L.buttons, .4), 0, .7 - i * .09, fz + .01));

    // lengan + tangan bulat
    const arm = side => {
      const sh = new T.Group(); sh.position.set(side * (.22 * w + .035), .78, 0);
      sh.add(mesh(new T.CapsuleGeometry(.068, .18, 6, 14), km(L.shirt, [2, 1]), 0, -.13, 0));
      sh.add(mesh(sph(.072), km(L.skin, [1, 1]), 0, -.29, 0));
      return sh;
    };
    const shL = arm(-1), shR = arm(1);
    body.add(shL, shR);

    // properti pekerjaan (tangan kiri)
    let prop = null;
    if (L.prop) {
      prop = new T.Group(); prop.position.set(0, -.32, .06); shL.add(prop);
      if (L.prop === 'clipboard') {
        const b = mesh(new T.BoxGeometry(.18, .24, .016), km('#a0703f', [1, 1]), 0, -.02, .04); b.rotation.x = -.2; prop.add(b);
        const pa = mesh(new T.BoxGeometry(.15, .18, .005), std('#ffffff', .8), 0, -.035, .052); pa.rotation.x = -.2; prop.add(pa);
        for (let i = 0; i < 4; i++) { const l = mesh(new T.BoxGeometry(.1, .008, .002), std('#7d9cc0', .8), 0, .02 - i * .035, .056 - i * .007); l.rotation.x = -.2; prop.add(l); }
        prop.add(mesh(new T.BoxGeometry(.06, .025, .02), std('#c0c4cc', .2, { metalness: .8 }), 0, .095, .03));
      } else if (L.prop === 'laptop') {
        prop.add(mesh(new T.BoxGeometry(.03, .2, .27), std('#b9bec7', .25, { metalness: .7 }), -.05, -.02, 0));
        const logo = mesh(new T.CircleGeometry(.022, 16), std('#ffffff', .2), -.066, -.02, 0); logo.rotation.y = -Math.PI / 2; prop.add(logo);
      } else if (L.prop === 'briefcase') {
        prop.add(mesh(new T.BoxGeometry(.23, .17, .075), km('#6b3f22', [2, 1]), 0, -.12, 0));
        prop.add(mesh(new T.TorusGeometry(.035, .011, 6, 16, Math.PI), std('#3b2414', .5), 0, -.035, 0));
        prop.add(mesh(new T.BoxGeometry(.04, .02, .08), std('#d9b25a', .3, { metalness: .8 }), 0, -.06, 0));
      } else if (L.prop === 'tooth') {
        const tm = km('#ffffff', [1, 1]);
        const cr = mesh(sph(.08), tm, 0, .02, .02); cr.scale.set(1.15, .85, .9); prop.add(cr);
        [-1, 1].forEach(sd => { const r = mesh(new T.ConeGeometry(.037, .11, 12), tm, sd * .037, -.065, .02); r.rotation.x = Math.PI; r.rotation.z = sd * -.2; prop.add(r); });
        [-1, 1].forEach(sd => prop.add(mesh(sph(.012, 8, 6), std('#2a1f1f', .3), sd * .026, .03, .09)));
        const sm = mesh(new T.TorusGeometry(.02, .005, 6, 12, Math.PI), std('#2a1f1f', .3), 0, .005, .092); sm.rotation.z = Math.PI; prop.add(sm);
      }
    }

    // kepala bola rajut (wajah disulam, tanpa foto)
    const R = .34, fwid = L.faceW || 1;
    const head = new T.Group(); head.position.y = .9 + R * .78; body.add(head);
    const skull = mesh(new T.SphereGeometry(R, 48, 32), km(L.skin, [7, 3])); skull.scale.set(fwid, .96, .95); head.add(skull);
    // titik di permukaan wajah + arah hadap keluar
    const P = (x, y, lift = 0) => {
      const nx = x / (R * fwid), ny = y / (R * .96), nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
      const n = new T.Vector3(nx / fwid, ny / .96, nz / .95).normalize();
      return { p: new T.Vector3(x, y, nz * R * .95).addScaledVector(n, lift), n };
    };
    const place = (o, x, y, lift = 0) => { const q = P(x, y, lift); o.position.copy(q.p); o.lookAt(q.p.clone().add(q.n)); head.add(o); return o; };
    const felt = c => std(c, 1);
    // telinga
    [-1, 1].forEach(sd => { const e = mesh(sph(.06, 14, 10), km(L.skin, [1, 1]), sd * R * fwid * .96, -.01, 0); e.scale.set(.6, 1, .9); head.add(e); });
    // mata kancing
    const eyes = [];
    const ey = L.eyeY == null ? .0 : L.eyeY, ex = (L.eyeX || .115) * fwid;
    [-1, 1].forEach(sd => {
      const g = new T.Group();
      const ball = mesh(new T.SphereGeometry(.042, 20, 14), std('#121014', .12)); ball.scale.z = .55; g.add(ball);
      const hl = mesh(sph(.011, 8, 6), std('#ffffff', .2, { emissive: '#ffffff', emissiveIntensity: .6 }), .012, .014, .02); g.add(hl);
      if (L.smileEyes) { ball.scale.set(1, .35, .55); ball.position.y = .006; hl.visible = false; const lid = mesh(new T.TorusGeometry(.036, .01, 6, 14, Math.PI), std('#2a1d1a', .8), 0, -.004, .008); g.add(lid); }
      place(g, sd * ex, ey, .004); eyes.push(g);
      if (L.lash) { const l = mesh(new T.CapsuleGeometry(.007, .03, 3, 4), std('#121014', .6)); l.rotation.z = sd * -1.0; const q = P(sd * (ex + .04), ey + .035, .006); l.position.copy(q.p); head.add(l); }
      // alis benang
      const bw = L.brow || .012;
      const br = mesh(new T.CapsuleGeometry(bw, .075, 4, 8), km(L.hairColor, [1, 1]));
      br.rotation.z = Math.PI / 2 + sd * (L.browTilt || .08);
      const bq = P(sd * ex, ey + .085, .008); br.position.copy(bq.p); head.add(br);
      // pipi merona (flanel)
      const ch = mesh(new T.CircleGeometry(.05, 20), new T.MeshStandardMaterial({ color: '#f39a9a', roughness: 1, transparent: true, opacity: .75 }));
      place(ch, sd * (ex + .07), ey - .08, .004);
      if (L.lines) { const ln = mesh(new T.TorusGeometry(.03, .006, 4, 10, Math.PI * .6), std(shade(L.skin, -.25), .9)); ln.rotation.z = sd > 0 ? -.3 : Math.PI + .3; place(ln, sd * .085, -.11, .006); ln.rotation.z += sd > 0 ? -.4 : .4; }
    });
    // hidung kecil
    const nose = mesh(sph(.032, 14, 10), km(shade(L.skin, -.05), [1, 1])); place(nose, 0, ey - .055, -.012);
    // mulut sulaman
    const smile = new T.Group();
    const mw = L.mouthW || .05;
    const sm = mesh(new T.TorusGeometry(mw, .011, 8, 20, Math.PI * .9), std(L.lip || '#7a2b2b', .8)); sm.rotation.z = Math.PI * 1.05; smile.add(sm);
    if (L.lip) { const low = mesh(new T.TorusGeometry(mw * .8, .014, 8, 16, Math.PI * .8), std(L.lip, .7)); low.rotation.z = Math.PI * 1.1; low.position.y = -.008; smile.add(low); }
    place(smile, 0, ey - .115, .005);
    const oMouth = mesh(new T.TorusGeometry(.024, .01, 8, 14), std('#7a2b2b', .8)); place(oMouth, 0, ey - .125, .005); oMouth.visible = false;
    if (L.mustache) { const mu = mesh(new T.CapsuleGeometry(.011, .07, 4, 8), km(L.hairColor, [1, 1])); mu.rotation.z = Math.PI / 2; const q = P(0, ey - .088, .01); mu.position.copy(q.p); head.add(mu); }
    if (L.earrings) [-1, 1].forEach(sd => head.add(mesh(sph(.022, 10, 8), std('#e8c15a', .25, { metalness: .8 }), sd * R * fwid * .97, -.08, .03)));
    // kacamata
    if (L.glasses) {
      const gm = std('#141414', .3);
      const pts = [-1, 1].map(sd => P(sd * ex, ey, .03));
      pts.forEach((q, i) => {
        const ring = new T.Mesh(new T.TorusGeometry(.07, .011, 8, 4), gm); ring.rotation.z = Math.PI / 4;
        const g = new T.Group(); g.add(ring); ring.scale.set(1.25, .9, 1);
        g.position.copy(q.p); g.lookAt(q.p.clone().add(q.n)); head.add(g);
        const sd = i ? 1 : -1, end = new T.Vector3(sd * R * fwid * .93, ey + .01, R * .18);
        const len = q.p.distanceTo(end) - .07;
        const tm = mesh(new T.CylinderGeometry(.008, .008, len, 6), gm);
        tm.position.copy(q.p.clone().lerp(end, .55)); tm.lookAt(end); tm.rotateX(Math.PI / 2); head.add(tm);
      });
      const br = mesh(new T.CylinderGeometry(.008, .008, ex * 2 - .14, 6), gm); br.rotation.z = Math.PI / 2;
      const bq = P(0, ey + .012, .035); br.position.copy(bq.p); head.add(br);
    }
    // rambut rajut
    const hm = km(L.hairColor, [5, 2]);
    const hb = (x, y, z, sx, sy, sz, rx = 0, rz = 0, rr = R * .7) => { const o = mesh(sph(rr, 20, 14), hm, x, y, z); o.scale.set(sx, sy, sz); o.rotation.set(rx, 0, rz); head.add(o); return o; };
    const capTilt = L.hair === 'comb' ? -.42 : -.3;
    const cap = mesh(new T.SphereGeometry(R * 1.06, 40, 20, 0, Math.PI * 2, 0, Math.PI * .52), hm); cap.scale.set(fwid, 1, 1); cap.rotation.x = capTilt; head.add(cap);
    const back = mesh(sph(R * 1.02, 28, 18), hm, 0, -.01, -.06); back.scale.set(fwid * .99, .9, .88); head.add(back);
    if (L.hair === 'side') { hb(R * .12, R * .8, R * .3, 1.3, .3, .62, -.42, -.22); hb(-R * .35, R * .86, R * .1, .8, .28, .7, -.3, .15); }
    if (L.hair === 'comb') { hb(0, R * .86, R * .1, 1.35, .42, .9, -.5, 0); for (let i = -2; i <= 2; i++) { const g = mesh(new T.CapsuleGeometry(.008, .2, 3, 6), km(L.grey || '#9a9590', [1, 1])); g.position.set(i * .06, R * .95, -R * .05); g.rotation.x = Math.PI / 2 - .4; head.add(g); } }
    if (L.hair === 'messy') {
      hb(0, R * .74, R * .38, 1.35, .4, .62, -.35, .05);
      for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; hb(Math.cos(a) * R * .5, R * .95 + Math.sin(i * 1.7) * .02, Math.sin(a) * R * .45 - .02, .32, .3, .32, 0, 0); }
    }
    if (L.hair === 'long' || L.hair === 'bob') {
      const len = L.hair === 'long' ? .36 : .2;
      const cur = mesh(new T.CapsuleGeometry(R * .95, len, 8, 20), hm, 0, -len * .5 - .02, -R * .32); cur.scale.set(1.12 * fwid, 1, .62); head.add(cur);
      [-1, 1].forEach(sd => { const lk = mesh(new T.CapsuleGeometry(.08, len * .85, 6, 12), hm, sd * R * fwid * .9, -len * .42 - .02, R * .2); lk.rotation.z = sd * .06; head.add(lk); });
      if (L.hair === 'long') { hb(-R * .3, R * .66, R * .5, 1.05, .34, .5, -.25, .5); hb(R * .38, R * .72, R * .42, .85, .3, .5, -.3, -.55); }
      else { [-1, 1].forEach(sd => hb(sd * R * .32, R * .66, R * .5, .75, .32, .48, -.25, sd * -.45)); }
    }
    // topi pesta rajut
    const hat = new T.Group(); hat.position.set(R * .32, R * .88, 0); hat.rotation.z = -.35; head.add(hat);
    hat.add(mesh(new T.ConeGeometry(.12, .3, 24), km(L.hat, [3, 2]), 0, .12, 0));
    hat.add(mesh(sph(.045, 12, 10), km('#ffffff', [1, 1]), 0, .28, 0));
    hat.visible = false;
    // topi perawat
    let jobHat = null;
    if (L.nurseCap) {
      jobHat = new T.Group(); jobHat.position.set(0, R * 1.02, R * .42); jobHat.rotation.x = -.55; head.add(jobHat);
      jobHat.add(mesh(new T.BoxGeometry(.28, .11, .05), km('#ffffff', [2, 1])));
      const cr = std('#d7263d', .6);
      jobHat.add(mesh(new T.BoxGeometry(.07, .022, .01), cr, 0, 0, .03), mesh(new T.BoxGeometry(.022, .07, .01), cr, 0, 0, .03));
    }
    root.userData.rig = { hipL, hipR, shL, shR, head, body, eyes, smile, oMouth, hat, prop, jobHat, skull, blink: Math.random() * 3, fwid };
    return root;
  }

  const POSES = {
    stand: { lx: 0, lz: -.15, rx: 0, rz: .15, hx: 0 },
    wave:  { lx: 0, lz: -.15, rx: 0, rz: 2.5, hx: 0 },
    hold:  { lx: -1.3, lz: .2, rx: -1.3, rz: -.2, hx: .05 },
    cheer: { lx: 0, lz: -2.6, rx: 0, rz: 2.6, hx: -.12 },
    clap:  { lx: -1.15, lz: .5, rx: -1.15, rz: -.5, hx: 0 },
    blow:  { lx: -.2, lz: -.2, rx: -.2, rz: .2, hx: .3 },
  };
  function pose(root, name, k = 1, t = 0) {
    const r = root.userData.rig, p = POSES[name] || POSES.stand;
    const L = (o, key, v) => { o.rotation[key] += (v - o.rotation[key]) * k; };
    let rz = p.rz, lz = p.lz;
    if (name === 'wave') rz += Math.sin(t * 9) * .3;
    if (name === 'cheer') { rz += Math.sin(t * 10) * .15; lz -= Math.sin(t * 10) * .15; }
    if (name === 'clap') { const c = Math.abs(Math.sin(t * 9)) * .35; lz += c; rz -= c; }
    L(r.shL, 'x', p.lx); L(r.shL, 'z', lz); L(r.shR, 'x', p.rx); L(r.shR, 'z', rz); L(r.head, 'x', p.hx);
    if (r.prop) r.prop.visible = name === 'stand' || name === 'wave';
    if (r.jobHat) r.jobHat.visible = !r.hat.visible;
    const puff = name === 'blow' ? 1 + Math.abs(Math.sin(t * 14)) * .05 : 1;
    r.skull.scale.set(r.fwid * puff, .96, .95);
    r.oMouth.visible = name === 'blow'; r.smile.visible = name !== 'blow';
    r.smile.scale.setScalar(name === 'cheer' ? 1.35 : 1);
  }
  function blink(root, dt) {
    const r = root.userData.rig; r.blink -= dt;
    const closed = r.blink < .12; r.eyes.forEach(e => e.scale.y = closed ? .15 : 1);
    if (r.blink < 0) r.blink = 2 + Math.random() * 3;
  }
  function faceCam() { }
  function dispose(o) {
    o.traverse(n => {
      if (n.geometry) n.geometry.dispose();
      if (n.material) [].concat(n.material).forEach(m => { if (m.map && !Object.values(KT).includes(m.map)) m.map.dispose(); m.dispose(); });
    });
  }

  /* ---------- potret (untuk kartu, cincin, kartu ucapan) ---------- */
  let PR = null;
  function rig() {
    if (PR) return PR;
    const r = new T.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    r.outputColorSpace = T.SRGBColorSpace; r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 1.1;
    const sc = new T.Scene();
    sc.add(new T.HemisphereLight('#fff6ea', '#8a6a60', 1.5));
    const k = new T.DirectionalLight('#ffffff', 2.2); k.position.set(1.5, 2.5, 3); sc.add(k);
    const rim = new T.DirectionalLight('#ffd7b0', 1.6); rim.position.set(-2, 1.5, -2); sc.add(rim);
    const cam = new T.PerspectiveCamera(26, 1, .1, 30);
    PR = { r, sc, cam }; return PR;
  }
  function portrait(look, o = {}) {
    const { r, sc, cam } = rig();
    const w = o.w || 400, h = o.h || 500;
    r.setSize(w, h, false); cam.aspect = w / h;
    const a = build(look); sc.add(a);
    if (o.hat) a.userData.rig.hat.visible = true;
    pose(a, o.pose || 'stand', 1, o.t || .3);
    a.rotation.y = o.turn == null ? .25 : o.turn;
    const hy = .9 + .34 * .78;
    if (o.framing === 'head') { cam.fov = 24; cam.position.set(0, hy + .02, 1.95); cam.lookAt(0, hy, 0); }
    else if (o.framing === 'bust') { cam.fov = 26; cam.position.set(0, hy, 2.9); cam.lookAt(0, hy - .2, 0); }
    else { cam.fov = 26; cam.position.set(0, .85, 4.3); cam.lookAt(0, .75, 0); }
    cam.updateProjectionMatrix();
    if (o.bg) r.setClearColor(o.bg, 1); else r.setClearColor(0x000000, 0);
    r.render(sc, cam);
    const url = r.domElement.toDataURL('image/png');
    sc.remove(a); dispose(a);
    return url;
  }

  window.Avatar = { load, build, pose, blink, portrait, dispose, loadFaces, faceCam, knitMat, get T() { return T; } };
})();
