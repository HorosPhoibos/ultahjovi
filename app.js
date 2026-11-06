/* Jovi Birthday — logika halaman utama */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);

  // look = baju santai (awal), job = seragam saat "Mode profesi" dinyalakan
  const FAMILY = [
    { id: 'joshua', name: 'Joshua Joviando', nick: 'Joshua', role: 'Auditor', d: 17, m: 10, y: 1998, color: '#6f8fb4',
      look: { skin: '#d9a47f', hairColor: '#1b1615', hair: 'side', faceW: 1.07, brow: .015, shirt: '#6d8fb3', collar: '#6d8fb3', pants: '#2f3442', build: 1.08, hat: '#4cc9f0' },
      job: { shirt: '#cfe0f2', collar: '#cfe0f2', tie: '#1f3c88', lanyard: true, prop: 'clipboard' } },
    { id: 'mama', name: 'Irawaty Devy Rosa', nick: 'Mama', role: 'Perawat (dulu)', d: 22, m: 7, y: 1970, color: '#d4577a',
      look: { skin: '#d29a74', hairColor: '#161111', hair: 'long', lash: true, lip: '#c2456a', earrings: true, shirt: '#b8302f', pants: '#3a2c3a', build: 1.05, hat: '#ff8fab' },
      job: { shirt: '#f7f5f0', pants: '#f1eee8', shoes: '#efece6', dress: true, stetho: true, nurseCap: true } },
    { id: 'bapak', name: 'Jhon Hardman Sinaga', nick: 'Bapak', role: 'Pengusaha sewa IT', d: 13, m: 5, y: 1968, color: '#6f9a6b',
      look: { skin: '#d8a27e', hairColor: '#2e2a28', grey: '#8d8884', hair: 'comb', mustache: true, lines: true, brow: .016, shirt: '#7b776d', polo: '#b8372f', pants: '#2c3340', build: 1.04, hat: '#7bd389' },
      job: { shirt: '#2c3446', pants: '#2c3446', polo: null, inner: '#ffffff', tie: '#b8372f', prop: 'laptop' } },
    { id: 'samuel', name: 'Samuel Joviandre', nick: 'Muel', role: 'Lawyer', d: 6, m: 11, y: 2002, color: '#e0a33a',
      look: { skin: '#cf976f', hairColor: '#151010', hair: 'messy', glasses: true, mustache: true, faceW: 1.1, brow: .017, shirt: '#f1efe9', collar: '#ffffff', pants: '#25262b', build: 1.16, hat: '#ffd166' },
      job: { shirt: '#17171b', pants: '#17171b', collar: null, dress: true, inner: '#ffffff', bef: true, prop: 'briefcase' } },
    { id: 'ruth', name: 'Ruth Putri Jovinka', nick: 'Putri', role: 'Dokter gigi', d: 8, m: 7, y: 2006, color: '#8c6bb1',
      look: { skin: '#ddb08b', hairColor: '#181212', hair: 'bob', lash: true, lip: '#c75a6e', faceW: .95, shirt: '#a9c4e6', pants: '#3b3f5c', build: .92, hat: '#c77dff' },
      job: { shirt: '#ffffff', coat: true, inner: '#a9c4e6', mask: true, prop: 'tooth' } },
  ];
  let jobMode = false;
  const lookOf = p => jobMode ? Object.assign({}, p.look, p.job) : p.look;
  // ucapan berganti tiap tahun (dipilih dari tahun ulang tahun), tidak pernah sama dua tahun berturut-turut
  const WISHES = {
    joshua: [
      'Selamat ulang tahun, Joshua! Terima kasih sudah jadi abang yang bisa diandalkan. Semoga setiap audit lancar dan kariermu terus naik.',
      'Happy birthday, Joshua! Tahun baru, angka baru, tapi hatimu yang hangat buat keluarga tetap sama. Sehat dan bahagia selalu.',
      'Joshua, semoga tahun ini penuh berkat: kerja yang menyenangkan, istirahat yang cukup, dan banyak tawa bareng keluarga.',
      'Selamat bertambah usia, Joshua! Teliti di pekerjaan, lembut di rumah. Semoga semua yang kamu doakan dijawab indah oleh Tuhan.',
    ],
    mama: [
      'Selamat ulang tahun, Mama tersayang! Dulu merawat banyak pasien, sampai sekarang tetap merawat kami semua. Terima kasih untuk doa dan kasihmu.',
      'Mama, terima kasih untuk setiap masakan, pelukan, dan doa diam-diam tiap malam. Sehat selalu dan bahagia terus ya, Ma.',
      'Selamat ulang tahun, Ma! Semoga tahun ini Mama lebih banyak istirahat, lebih banyak senyum, dan selalu dikuatkan Tuhan.',
      'Untuk perawat terbaik di rumah kami: panjang umur, sehat, dan penuh sukacita. Kami sayang Mama.',
    ],
    bapak: [
      'Selamat ulang tahun, Bapak! Terima kasih sudah jadi tiang yang kuat buat rumah ini. Semoga usaha penyewaan IT-nya makin maju.',
      'Pak, terima kasih untuk kerja keras dan teladan Bapak. Sehat selalu, panjang umur, dan makin banyak waktu santai bareng keluarga.',
      'Selamat bertambah usia, Bapak! Semoga setiap rencana usaha diberkati dan Bapak selalu dalam lindungan Tuhan.',
      'Untuk Bapak yang sukses dan tetap sederhana: panjang umur, sehat, dan bahagia. Kami bangga sama Bapak.',
    ],
    samuel: [
      'Selamat ulang tahun, Muel! Semoga makin tajam di ruang sidang, adil dalam setiap perkara, dan selalu punya alasan buat senyum.',
      'Happy birthday, Muel! Tahun ini semoga kasus-kasusnya lancar, ilmunya bertambah, dan hatinya tetap rendah hati.',
      'Muel, selamat bertambah usia! Semoga langkahmu makin mantap dan mimpimu satu per satu jadi nyata.',
      'Selamat ulang tahun, Pak Lawyer! Bela kebenaran, jaga kesehatan, dan jangan lupa pulang makan masakan Mama.',
    ],
    ruth: [
      'Selamat ulang tahun, Putri! Semoga praktik dokter giginya makin dipercaya dan senyummu menular ke semua pasien.',
      'Happy birthday, Putri! Si bungsu yang makin dewasa, semoga makin sabar, makin pintar, dan selalu bahagia.',
      'Putri, selamat bertambah usia! Semoga tahun ini penuh pengalaman baru yang seru dan sahabat-sahabat yang baik.',
      'Untuk dokter gigi favorit keluarga: semoga semua cita-citamu tercapai dan kamu selalu dijaga Tuhan.',
    ],
  };
  const VERSES = [
    ['TUHAN memberkati engkau dan melindungi engkau; TUHAN menyinari engkau dengan wajah-Nya dan memberi engkau kasih karunia.', 'Bilangan 6:24-25'],
    ['Sebab Aku ini mengetahui rancangan-rancangan apa yang ada pada-Ku mengenai kamu, yaitu rancangan damai sejahtera dan bukan rancangan kecelakaan, untuk memberikan kepadamu hari depan yang penuh harapan.', 'Yeremia 29:11'],
    ['Ajarlah kami menghitung hari-hari kami sedemikian, hingga kami beroleh hati yang bijaksana.', 'Mazmur 90:12'],
    ['Inilah hari yang dijadikan TUHAN, mari kita bersorak-sorak dan bersukacita karenanya!', 'Mazmur 118:24'],
    ['Percayalah kepada TUHAN dengan segenap hatimu, dan janganlah bersandar kepada pengertianmu sendiri.', 'Amsal 3:5'],
    ['Bergembiralah karena TUHAN; maka Ia akan memberikan kepadamu apa yang diinginkan hatimu.', 'Mazmur 37:4'],
    ['Tak berkesudahan kasih setia TUHAN, tak habis-habisnya rahmat-Nya, selalu baru tiap pagi; besar kesetiaan-Mu!', 'Ratapan 3:22-23'],
    ['Kiranya diberikan-Nya kepadamu apa yang kaukehendaki dan dijadikan-Nya berhasil apa yang kaurancangkan.', 'Mazmur 20:5'],
    ['Serahkanlah perbuatanmu kepada TUHAN, maka terlaksanalah segala rencanamu.', 'Amsal 16:3'],
    ['Kebajikan dan kemurahan belaka akan mengikuti aku, seumur hidupku.', 'Mazmur 23:6'],
    ['Aku berdoa, semoga engkau baik-baik dan sehat-sehat saja dalam segala sesuatu, sama seperti jiwamu baik-baik saja.', '3 Yohanes 1:2'],
    ['Ia, yang memulai pekerjaan yang baik di antara kamu, akan meneruskannya sampai pada akhirnya.', 'Filipi 1:6'],
    ['Sampai masa tuamu Aku tetap Dia dan sampai masa putihmu Aku menggendong kamu.', 'Yesaya 46:4'],
    ['Dengan panjang umur akan Kukenyangkan dia, dan akan Kuperlihatkan kepadanya keselamatan dari pada-Ku.', 'Mazmur 91:16'],
  ];
  const seedOf = id => [...id].reduce((a, c) => a + c.charCodeAt(0), 0);
  function blessingFor(p, year) {
    const k = seedOf(p.id), pool = WISHES[p.id] || [];
    const wish = pool.length ? pool[(year + k) % pool.length] : `Selamat ulang tahun, ${p.nick}! Sehat, bahagia, dan selalu diberkati Tuhan.`;
    const v = VERSES[(year * 5 + k) % VERSES.length];
    return { wish, verse: { t: v[0], r: v[1] } };
  }
  const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const MON_KEYS = [['jan'], ['feb', 'peb'], ['mar'], ['apr'], ['mei', 'may'], ['jun'], ['jul'], ['agu', 'agt', 'aug'], ['sep'], ['okt', 'oct'], ['nov', 'nop'], ['des', 'dec']];
  const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const ZODIAC = [[1, 20, 'Capricorn'], [2, 19, 'Aquarius'], [3, 21, 'Pisces'], [4, 20, 'Aries'], [5, 21, 'Taurus'], [6, 21, 'Gemini'], [7, 23, 'Cancer'], [8, 23, 'Leo'], [9, 23, 'Virgo'], [10, 23, 'Libra'], [11, 22, 'Scorpio'], [12, 22, 'Sagitarius'], [12, 32, 'Capricorn']];
  const DAY = 864e5;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) { } },
  };

  // ?hari=2026-10-17 untuk mensimulasikan tanggal lain
  const sim = new URLSearchParams(location.search).get('hari');
  const simOffset = (() => {
    const mm = sim && sim.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!mm) return 0;
    const n = new Date();
    return new Date(+mm[1], +mm[2] - 1, +mm[3], n.getHours(), n.getMinutes(), n.getSeconds()) - Date.now();
  })();
  const now = () => new Date(Date.now() + simOffset);

  const midnight = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const leap = y => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  const bdayIn = (m, d, Y) => (m === 2 && d === 29 && !leap(Y)) ? new Date(Y, 1, 28) : new Date(Y, m - 1, d);
  const diffDays = (a, b) => Math.round((midnight(a) - midnight(b)) / DAY);
  const fmtDate = d => `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  const fmtShort = d => `${d.getDate()} ${MONTHS[d.getMonth()]}`;
  const nf = new Intl.NumberFormat('id-ID');
  const zodiac = (m, d) => { for (const [zm, zd, n] of ZODIAC) if (m < zm || (m === zm && d < zd)) return n; return 'Capricorn'; };

  function info(p, t = now()) {
    const today = midnight(t);
    let celebrate = null;
    for (const Y of [today.getFullYear(), today.getFullYear() - 1]) {
      const b = bdayIn(p.m, p.d, Y), diff = diffDays(today, b);
      if (diff >= 0 && diff <= 3) { celebrate = { date: b, daysAfter: diff, age: Y - p.y }; break; }
    }
    let next = bdayIn(p.m, p.d, today.getFullYear());
    if (next < today) next = bdayIn(p.m, p.d, today.getFullYear() + 1);
    const born = new Date(p.y, p.m - 1, p.d);
    let ageNow = today.getFullYear() - p.y;
    if (bdayIn(p.m, p.d, today.getFullYear()) > today) ageNow--;
    return { celebrate, next, daysUntil: diffDays(next, today), nextAge: next.getFullYear() - p.y, born, ageNow, daysLived: diffDays(today, born) };
  }

  function parseDate(raw) {
    const s = String(raw || '').toLowerCase().trim().replace(/\s+/g, ' ');
    if (!s) return { empty: true };
    let m = s.match(/(\d{1,2})\s*[-\/.,\s]\s*(\d{1,2})\s*[-\/.,\s]\s*(\d{4})/), d, mo, y;
    if (m) { d = +m[1]; mo = +m[2]; y = +m[3]; }
    else if ((m = s.match(/^(\d{2})(\d{2})(\d{4})$/))) { d = +m[1]; mo = +m[2]; y = +m[3]; }
    else if ((m = s.match(/(\d{1,2})\s*[-\/.\s]?\s*([a-z]{3,})\s*[-\/.\s]?\s*(\d{4})/))) {
      const idx = MON_KEYS.findIndex(keys => keys.some(k => m[2].startsWith(k)));
      if (idx < 0) return { error: `Bulan "${m[2]}" belum aku kenal. Pakai angka saja, mis. 17-10-1998.` };
      d = +m[1]; mo = idx + 1; y = +m[3];
    } else return { error: 'Formatnya DD-MM-YYYY ya, mis. 17-10-1998.' };
    if (mo < 1 || mo > 12) return { error: `Bulan ${mo} tidak ada. Bulan itu 1 sampai 12.` };
    const dim = new Date(y, mo, 0).getDate();
    if (d < 1 || d > dim) return { error: `${MONTHS[mo - 1]} ${y} cuma sampai tanggal ${dim}.` };
    if (y < 1900) return { error: 'Tahunnya kejauhan. Coba cek lagi.' };
    if (new Date(y, mo - 1, d) > now()) return { error: 'Tanggal itu belum terjadi. Lahir dari masa depan?' };
    return { d, m: mo, y };
  }

  /* ---------- potret karakter ---------- */
  const P = {};
  const placeholder = p => 'data:image/svg+xml,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="${p.color}"/><text x="50" y="52" font-family="Georgia" font-size="46" font-weight="700" fill="#fff" text-anchor="middle" dominant-baseline="middle">${p.nick[0]}</text></svg>`);
  const head = p => (P[p.id] && P[p.id].head) || placeholder(p);
  const card = p => (P[p.id] && P[p.id].card) || '';
  function makePortraits() {
    return window.Avatar.load().then(() => {
      FAMILY.forEach(p => {
        P[p.id] = {
          head: window.Avatar.portrait(lookOf(p), { framing: 'head', w: 240, h: 240, turn: .12 }),
          card: window.Avatar.portrait(lookOf(p), { framing: 'full', w: 400, h: 500, pose: 'wave', turn: .3 }),
          bust: window.Avatar.portrait(lookOf(p), { framing: 'bust', w: 420, h: 420, pose: 'stand', turn: .2 }),
        };
      });
    });
  }

  /* ---------- musik ---------- */
  const bgmMain = $('#bgmMain'), bgmSong = $('#bgmSong'), musicBtn = $('#musicBtn');
  function fade(audio, to, ms = 600) {
    const from = audio.volume, t0 = performance.now();
    return new Promise(res => {
      (function step(t) {
        const k = Math.min(1, (t - t0) / ms);
        audio.volume = Math.max(0, Math.min(1, from + (to - from) * k));
        k < 1 ? requestAnimationFrame(step) : res();
      })(t0);
    });
  }
  const BGM = {
    async play(which) {
      const a = which === 'song' ? bgmSong : bgmMain, b = which === 'song' ? bgmMain : bgmSong;
      if (!b.paused) { await fade(b, 0, 500); b.pause(); }
      if (which === 'song') a.currentTime = 0;
      a.volume = 0;
      try { await a.play(); } catch (e) { return; }
      fade(a, which === 'song' ? 0.9 : 0.7, 900);
    },
    async stop() { for (const a of [bgmMain, bgmSong]) if (!a.paused) { await fade(a, 0, 350); a.pause(); } },
    playing: () => !bgmMain.paused || !bgmSong.paused,
  };
  window.BGM = BGM;
  const syncBtn = () => { const on = BGM.playing(); musicBtn.setAttribute('aria-pressed', on); $('#musicLabel').textContent = on ? 'Jeda lagu' : 'Putar lagu'; };
  ['play', 'pause'].forEach(ev => { bgmMain.addEventListener(ev, syncBtn); bgmSong.addEventListener(ev, syncBtn); });
  bgmSong.addEventListener('ended', () => { if (!$('#party').hidden) BGM.play('main'); });
  musicBtn.addEventListener('click', () => BGM.playing() ? BGM.stop() : BGM.play('main'));

  function toast(msg, ms = 2600) {
    const el = document.createElement('div'); el.className = 'toast'; el.textContent = msg;
    document.body.appendChild(el); setTimeout(() => el.remove(), ms);
  }
  window.toast = toast;

  /* ---------- pengguna (login tanggal lahir) ---------- */
  let user = null; // anggota keluarga atau {guest:true}
  const findByDate = dt => FAMILY.find(p => p.d === dt.d && p.m === dt.m && p.y === dt.y);

  /* ---------- perayaan ---------- */
  function pickCarrier(p) {
    if (user && user.id && user.id !== p.id) return user;
    const pref = { joshua: 'mama', mama: 'joshua', bapak: 'ruth', samuel: 'mama', ruth: 'bapak' };
    return FAMILY.find(x => x.id === pref[p.id]) || FAMILY.find(x => x.id !== p.id);
  }
  function celebrate(p, age, extra = {}) {
    const c = pickCarrier(p);
    const from = user && user.id && user.id !== p.id ? user.nick : null;
    window.Party && window.Party.open({
      id: p.id, name: p.name, nick: p.nick, age, look: lookOf(p), jobMode, color: p.color,
      ...blessingFor(p, p.y + age), from,
      carrier: { nick: c.nick, look: lookOf(c) },
      others: FAMILY.filter(x => x.id !== p.id).map(x => x.nick),
      guests: FAMILY.filter(x => x.id !== p.id).map(x => ({ nick: x.nick, look: lookOf(x), head: head(x), color: x.color })),
      daysAfter: extra.daysAfter || 0, preview: !!extra.preview,
    });
  }

  /* ---------- HERO ---------- */
  let heroTarget = null;
  function renderHero() {
    const t = now();
    $('#todayLabel').textContent = `Hari ini ${fmtDate(t)}`;
    const list = FAMILY.map(p => ({ p, i: info(p, t) }));
    const cel = list.filter(x => x.i.celebrate).sort((a, b) => a.i.celebrate.daysAfter - b.i.celebrate.daysAfter);
    const upcoming = list.filter(x => !x.i.celebrate).sort((a, b) => a.i.daysUntil - b.i.daysUntil);
    const cta = $('#heroCta'); cta.innerHTML = '';
    const cd = $('#countdown');
    const mine = user && user.id && cel.find(x => x.p.id === user.id);
    if (cel.length) {
      const first = mine || cel[0], c = first.i.celebrate;
      if (mine) {
        $('#heroTitle').innerHTML = c.daysAfter === 0 ? `Selamat ulang tahun,<br><em>${first.p.nick}!</em>` : `<em>${first.p.nick}</em>, selamat<br>ulang tahun ke-${c.age}!`;
        $('#heroSub').textContent = c.daysAfter === 0 ? `Genap ${c.age} tahun hari ini. Kuenya sudah siap, tinggal tiup lilinnya.` : `Telat ${c.daysAfter} hari pun tetap dirayakan. Kuenya masih hangat!`;
      } else {
        $('#heroTitle').innerHTML = c.daysAfter === 0 ? `Hari ini <em>${first.p.nick}</em><br>ulang tahun ke-${c.age}!` : `<em>${first.p.nick}</em> baru saja<br>ulang tahun ke-${c.age}`;
        $('#heroSub').textContent = c.daysAfter === 0 ? 'Ayo ikut rayakan. Kamu yang bawa kuenya!' : `Baru lewat ${c.daysAfter} hari, ucapannya masih berlaku sampai hari ke-3.`;
      }
      cel.forEach(({ p, i }) => {
        const b = document.createElement('button');
        b.className = 'btn primary big celebrant';
        b.innerHTML = `<img alt="" src="${head(p)}"><span>🎂 ${user && p.id === user.id ? 'Tiup lilinku' : `Rayakan ${p.nick}`}<small>${i.celebrate.daysAfter === 0 ? 'hari ini' : `${i.celebrate.daysAfter} hari lalu`} · ke-${i.celebrate.age}</small></span>`;
        b.onclick = () => celebrate(p, i.celebrate.age, { daysAfter: i.celebrate.daysAfter });
        cta.appendChild(b);
      });
      cd.classList.add('is-hidden'); heroTarget = null;
    } else {
      const { p, i } = upcoming[0];
      $('#heroTitle').innerHTML = `Berikutnya <em>${p.nick}</em>,<br>${fmtShort(i.next)}`;
      $('#heroSub').textContent = `${p.name} genap ${i.nextAge} tahun hari ${DAYS[i.next.getDay()]}. Siapkan kadonya dari sekarang.`;
      cd.classList.remove('is-hidden'); heroTarget = i.next;
      const ban = document.createElement('div'); ban.className = 'today-banner';
      ban.innerHTML = `<img alt="" src="${head(p)}"><div><b>${p.name}</b><small>${i.daysUntil} hari lagi · ke-${i.nextAge}</small></div>`;
      cta.appendChild(ban);
    }
  }
  function tick() {
    if (!heroTarget) return;
    let ms = Math.max(0, heroTarget - now());
    if (ms === 0) { renderAll(); return; }
    const d = Math.floor(ms / DAY); ms -= d * DAY;
    const h = Math.floor(ms / 36e5); ms -= h * 36e5;
    const m = Math.floor(ms / 6e4); ms -= m * 6e4;
    $('#cdD').textContent = d; $('#cdH').textContent = String(h).padStart(2, '0');
    $('#cdM').textContent = String(m).padStart(2, '0'); $('#cdS').textContent = String(Math.floor(ms / 1e3)).padStart(2, '0');
  }

  /* ---------- KAMU ---------- */
  // foto asli hanya dipakai di kartu pribadi: [file, lebar, tinggi, pusat wajah x, y (0-1), setengah lebar wajah (relatif lebar foto)]
  const PHOTO = {
    joshua: ['aset/joshua.jpeg', 720, 1280, .5, .525, .06],
    mama: ['aset/mama1.JPG', 401, 226, .61, .33, .07],
    bapak: ['aset/bapa2.JPG', 185, 247, .5, .24, .07],
    samuel: ['aset/muel1.jpg', 659, 878, .36, .13, .08],
    ruth: ['aset/uti1.jpg', 298, 224, .3, .48, .1],
  };
  // foto Bapak yang lebih jelas: dipakai otomatis kalau aset/bapak.JPG ada
  (function () {
    const i = new Image();
    i.onload = () => { PHOTO.bapak = ['aset/bapak.JPG', i.naturalWidth, i.naturalHeight, .51, .44, .23]; if (user && user.id === 'bapak') renderMe(); };
    i.src = 'aset/bapak.JPG';
  })();
  function photoStyle(id) {
    const c = PHOTO[id]; if (!c) return '';
    const [f, w, h, cx, cy, hs] = c, S = 100;           // persen dari kotak
    const k = (S * .3) / (hs * w);                       // wajah ~60% lebar lingkaran
    const bw = w * k, bh = h * k;
    const x = S / 2 - cx * bw, y = S * .48 - cy * bh;
    return `background-image:url('${f}');background-size:${bw}% auto;background-position:${(x / (S - bw)) * 100 || 0}% ${(y / (S - bh)) * 100 || 0}%`;
  }

  function renderMe() {
    const sec = $('#me');
    if (!user || !user.id) { sec.hidden = true; return; }
    sec.hidden = false;
    const p = user, i = info(p);
    const c = i.celebrate;
    const bust = (P[p.id] && P[p.id].bust) || head(p);
    $('#meBody').innerHTML = `
      <div class="me-pic" style="--c:${p.color}">
        <div class="me-photo" role="img" aria-label="Foto ${p.nick}" style="${photoStyle(p.id)}"></div>
        <img class="me-doll" alt="Boneka rajut ${p.nick}" src="${bust}">
      </div>
      <div class="me-text">
        <p class="eyebrow">Kartu ulang tahunmu</p>
        <h2>${c ? `Kamu sedang ulang tahun ke-${c.age}! 🎉` : `${nf.format(i.daysUntil)} hari lagi, ${p.nick}`}</h2>
        <p class="muted">${c ? 'Selamat ya! Tiup lilinnya dan bagikan videonya ke keluarga.' : `Ulang tahunmu berikutnya <b>${fmtDate(i.next)}</b>, genap <b>${i.nextAge} tahun</b>.`}</p>
        <dl class="stats">
          <div><dt>Lahir hari</dt><dd>${DAYS[i.born.getDay()]}</dd></div>
          <div><dt>Usia</dt><dd>${i.ageNow} th</dd></div>
          <div><dt>Sudah hidup</dt><dd>${nf.format(i.daysLived)} hari</dd></div>
          <div><dt>Zodiak</dt><dd>${zodiac(p.m, p.d)}</dd></div>
        </dl>
        ${c ? `<button class="btn primary" id="meParty">🎂 Tiup lilinku</button>` : `<button class="btn light" id="meParty">Intip kuemu</button>`}
      </div>`;
    $('#meParty').onclick = () => c ? celebrate(p, c.age, { daysAfter: c.daysAfter }) : celebrate(p, i.nextAge, { preview: true });
  }

  /* ---------- TALI FOTO ---------- */
  function renderLine() {
    const line = $('#line');
    line.querySelectorAll('.card').forEach(c => c.remove());
    const t = now();
    const key = x => x.i.celebrate ? -10 + x.i.celebrate.daysAfter : x.i.daysUntil;
    const list = FAMILY.map(p => ({ p, i: info(p, t) })).sort((a, b) => key(a) - key(b));
    list.forEach(({ p, i }, k) => {
      const el = document.createElement('article');
      el.className = 'card' + (i.celebrate ? ' is-today' : '') + (user && user.id === p.id ? ' is-me' : '');
      el.tabIndex = 0;
      el.style.setProperty('--d', `${-k * 0.9}s`);
      el.style.setProperty('--r0', `${-1.5 - (k % 2)}deg`);
      el.style.setProperty('--r1', `${1.5 + (k % 3) * .5}deg`);
      el.style.setProperty('--c', p.color);
      const c = i.celebrate;
      const tag = c ? `<span class="tag">${c.daysAfter === 0 ? 'HARI INI!' : 'baru lewat'}</span>`
        : i.daysUntil <= 30 ? `<span class="tag soon">sebentar lagi</span>` : '';
      const img = card(p);
      el.innerHTML = `
        <span class="peg" aria-hidden="true"></span>${tag}
        <div class="flip">
          <div class="face">
            <div class="pic">${img ? `<img alt="Karakter ${p.nick}" src="${img}">` : `<span class="pic-ph">${p.nick[0]}</span>`}</div>
            <div class="name">${p.nick}${user && user.id === p.id ? ' <small>(kamu)</small>' : ''}</div>
            <div class="date">${p.d} ${MONTHS[p.m - 1]} ${p.y}</div>
            <div class="when"><b>${c ? '🎂' : nf.format(i.daysUntil)}</b><small>${c ? `ke-${c.age}` : `hari lagi · ke-${i.nextAge}`}</small></div>
          </div>
          <div class="back">
            <h3>${p.name}</h3>
            <dl>
              <dt>Peran</dt><dd>${p.role}</dd>
              <dt>Lahir hari</dt><dd>${DAYS[i.born.getDay()]}</dd>
              <dt>Usia</dt><dd>${i.ageNow} th</dd>
              <dt>Zodiak</dt><dd>${zodiac(p.m, p.d)}</dd>
              <dt>Sudah hidup</dt><dd>${nf.format(i.daysLived)} hari</dd>
              <dt>Ultah berikut</dt><dd>${DAYS[i.next.getDay()]}</dd>
            </dl>
            <button class="btn ${c ? 'primary' : 'light'}" data-act="party">${c ? '🎂 Rayakan' : 'Intip kuenya'}</button>
          </div>
        </div>`;
      el.addEventListener('click', e => {
        if (e.target.closest('[data-act="party"]')) {
          e.stopPropagation();
          c ? celebrate(p, c.age, { daysAfter: c.daysAfter }) : celebrate(p, i.nextAge, { preview: true });
          return;
        }
        el.classList.toggle('flipped');
      });
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.classList.toggle('flipped'); } });
      line.appendChild(el);
    });
    requestAnimationFrame(layoutYarn);
  }
  function layoutYarn() {
    const line = $('#line'), svg = $('#yarnSvg');
    const W = line.scrollWidth, y0 = 40, sag = Math.min(70, W * 0.05);
    line.querySelectorAll('.card').forEach(c => {
      const t = (c.offsetLeft + c.offsetWidth / 2) / W;
      c.style.marginTop = `${4 * sag * t * (1 - t)}px`;
    });
    svg.setAttribute('viewBox', `0 0 ${W} 150`);
    const d = `M -20 ${y0 - 6} Q ${W / 2} ${y0 + 2 * sag} ${W + 20} ${y0 - 6}`;
    svg.innerHTML = `
      <path d="${d}" fill="none" stroke="rgba(0,0,0,.12)" stroke-width="6" transform="translate(0,5)"/>
      <path d="${d}" fill="none" stroke="#b8372f" stroke-width="5" stroke-linecap="round"/>
      <path d="${d}" fill="none" stroke="#e46a5e" stroke-width="2.4" stroke-dasharray="5 6" stroke-linecap="round"/>
      <path d="${d}" fill="none" stroke="#7d1f1a" stroke-width="1.2" stroke-dasharray="2 9" stroke-dashoffset="4"/>`;
  }
  addEventListener('resize', () => requestAnimationFrame(layoutYarn));

  /* ---------- CINCIN ---------- */
  function renderRing() {
    const svg = $('#ring'), t = now(), Y = t.getFullYear();
    const yearDays = leap(Y) ? 366 : 365;
    const ang = (m, d) => ((diffDays(bdayIn(m, d, Y), new Date(Y, 0, 1)) + 0.5) / yearDays) * Math.PI * 2 - Math.PI / 2;
    const Pt = (a, r) => [200 + Math.cos(a) * r, 200 + Math.sin(a) * r];
    let s = `<defs><pattern id="knitp" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M1 0 Q3 6 5 10 M9 0 Q7 6 5 10" stroke="rgba(0,0,0,.1)" stroke-width="2" fill="none"/></pattern></defs>`;
    s += `<circle cx="200" cy="200" r="150" fill="none" stroke="#e8dccb" stroke-width="34"/><circle cx="200" cy="200" r="150" fill="none" stroke="url(#knitp)" stroke-width="34"/>`;
    const a0 = -Math.PI / 2, a1 = ang(t.getMonth() + 1, t.getDate());
    const [sx, sy] = Pt(a0, 150), [ex, ey] = Pt(a1, 150), large = a1 - a0 > Math.PI ? 1 : 0;
    s += `<path d="M ${sx} ${sy} A 150 150 0 ${large} 1 ${ex} ${ey}" fill="none" stroke="#b8372f" stroke-width="6" stroke-linecap="round"/>`;
    s += `<path d="M ${sx} ${sy} A 150 150 0 ${large} 1 ${ex} ${ey}" fill="none" stroke="#e46a5e" stroke-width="2" stroke-dasharray="4 5"/>`;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2, a2 = ((i + .5) / 12) * Math.PI * 2 - Math.PI / 2;
      const [x1, y1] = Pt(a, 126), [x2, y2] = Pt(a, 174), [lx, ly] = Pt(a2, 192);
      s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(46,36,32,.25)" stroke-width="1.5" stroke-dasharray="2 3"/>`;
      s += `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" font-family="Nunito" font-weight="800" font-size="11" fill="#6b5a50">${MONTHS[i].slice(0, 3).toUpperCase()}</text>`;
    }
    const [nx, ny] = Pt(a1, 118);
    s += `<line x1="200" y1="200" x2="${nx}" y2="${ny}" stroke="#b8372f" stroke-width="3" stroke-linecap="round"/><circle cx="200" cy="200" r="7" fill="#b8372f"/>`;
    s += `<text x="200" y="232" text-anchor="middle" font-family="Caveat" font-size="22" font-weight="700" fill="#2e2420">${Y}</text>`;
    FAMILY.forEach((p, k) => {
      const [x, y] = Pt(ang(p.m, p.d), 150), r = 22;
      s += `<clipPath id="cp${k}"><circle cx="${x}" cy="${y}" r="${r - 3}"/></clipPath>`;
      s += `<circle cx="${x}" cy="${y + 2}" r="${r + 1}" fill="rgba(0,0,0,.18)"/><circle cx="${x}" cy="${y}" r="${r}" fill="${p.color}"/>`;
      s += `<image href="${head(p)}" x="${x - r}" y="${y - r}" width="${r * 2}" height="${r * 2}" clip-path="url(#cp${k})" preserveAspectRatio="xMidYMid slice"/>`;
      s += `<circle cx="${x}" cy="${y}" r="${r - 1.5}" fill="none" stroke="${p.color}" stroke-width="3" stroke-dasharray="3 2"/>`;
    });
    svg.innerHTML = s;
    $('#ringList').innerHTML = FAMILY.map(p => ({ p, i: info(p, t) }))
      .sort((a, b) => (a.p.m * 40 + a.p.d) - (b.p.m * 40 + b.p.d))
      .map(({ p, i }) => `<li style="--c:${p.color}"><img alt="" src="${head(p)}"><span class="dot" style="background:${p.color}"></span><div><b>${p.nick}</b><br><small>${p.d} ${MONTHS[p.m - 1]}</small></div><span>${i.celebrate ? '🎂 sekarang' : nf.format(i.daysUntil) + ' hari lagi'}</span></li>`).join('');
  }

  /* ---------- GERBANG MASUK ---------- */
  const gate = $('#gate'), gIn = $('#gateDate'), gOut = $('#gateParse');
  function showGate() {
    gate.hidden = false; gate.classList.remove('leaving'); document.body.classList.add('gated');
    gIn.value = ''; gOut.textContent = ''; $('#gateGuest').hidden = true;
    setTimeout(() => gIn.focus(), 300);
  }
  gIn.addEventListener('input', e => {
    // sisipkan tanda "-" otomatis kalau yang diketik cuma angka
    if (/^[\d-]*$/.test(gIn.value) && !(e.inputType || '').startsWith('delete')) {
      const digits = gIn.value.replace(/\D/g, '').slice(0, 8);
      let v = digits.slice(0, 2);
      if (digits.length >= 2) v += '-' + digits.slice(2, 4);
      if (digits.length >= 4) v += '-' + digits.slice(4, 8);
      if (gIn.value !== v) gIn.value = v;
    }
    const r = parseDate(gIn.value);
    gOut.classList.toggle('bad', !!r.error);
    if (r.empty) gOut.textContent = '';
    else if (r.error) gOut.textContent = gIn.value.replace(/\D/g, '').length >= 8 ? r.error : '';
    else gOut.textContent = `→ tanggal ${r.d}, bulan ${r.m} (${MONTHS[r.m - 1]}), tahun ${r.y}`;
  });
  $('#gateForm').addEventListener('submit', e => {
    e.preventDefault();
    const r = parseDate(gIn.value);
    if (r.empty || r.error) { gOut.classList.add('bad'); gOut.textContent = r.error || 'Isi tanggal lahirmu dulu ya.'; gIn.focus(); shake(); return; }
    const p = findByDate(r);
    if (!p) {
      gOut.classList.add('bad'); gOut.textContent = 'Tanggal ini belum terdaftar di keluarga. Cek lagi angkanya ya.';
      $('#gateGuest').hidden = false; shake(); return;
    }
    login(p, true);
  });
  $('#gateGuest').addEventListener('click', () => login({ guest: true }, true));
  function shake() { const c = $('.gate-card'); c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake'); }
  function login(p, fresh) {
    user = p; store.set('bm_user', p.id || 'guest');
    $('#who').hidden = false;
    $('#whoName').textContent = p.id ? p.nick : 'Tamu';
    $('#whoImg').src = p.id ? head(p) : 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="5" fill="#e0a33a"/></svg>');
    renderAll();
    if (fresh) {
      gate.classList.add('leaving');
      setTimeout(() => { gate.hidden = true; document.body.classList.remove('gated'); }, 900);
      BGM.play('main');
      toast(p.id ? `Halo, ${p.nick}! 👋` : 'Selamat datang!');
    } else { gate.hidden = true; document.body.classList.remove('gated'); }
    // kalau yang masuk sedang ulang tahun, langsung antar kuenya (sekali sehari)
    if (p.id) {
      const c = info(p).celebrate, k = `bm_auto_${p.id}_${midnight(now()).getTime()}`;
      if (c && !store.get(k)) { store.set(k, '1'); setTimeout(() => celebrate(p, c.age, { daysAfter: c.daysAfter }), fresh ? 1300 : 600); }
    }
  }
  $('#whoSwitch').addEventListener('click', () => { store.set('bm_user', null); user = null; $('#who').hidden = true; showGate(); });

  /* ---------- ICS ---------- */
  $('#icsBtn').addEventListener('click', () => {
    const pad = n => String(n).padStart(2, '0'), t = now();
    const ev = FAMILY.map(p => {
      const nx = info(p, t).next, nx2 = new Date(nx.getTime() + DAY);
      return ['BEGIN:VEVENT', `UID:${p.id}-ultah@jovibirthday`, `DTSTAMP:${t.getFullYear()}${pad(t.getMonth() + 1)}${pad(t.getDate())}T000000Z`,
        `DTSTART;VALUE=DATE:${nx.getFullYear()}${pad(p.m)}${pad(p.d)}`, `DTEND;VALUE=DATE:${nx2.getFullYear()}${pad(nx2.getMonth() + 1)}${pad(nx2.getDate())}`,
        'RRULE:FREQ=YEARLY', `SUMMARY:🎂 Ulang tahun ${p.nick} (${p.name})`, `DESCRIPTION:Lahir ${p.d}-${pad(p.m)}-${p.y}`,
        'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', `DESCRIPTION:Besok ${p.nick} ulang tahun!`, 'END:VALARM', 'END:VEVENT'].join('\r\n');
    });
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Jovi Birthday//ID', 'CALSCALE:GREGORIAN', ...ev, 'END:VCALENDAR'].join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); a.download = 'ulang-tahun-keluarga.ics'; a.click();
    toast('File kalender diunduh. Buka untuk menambahkan ke kalender.');
  });

  function renderAll() { renderHero(); renderMe(); renderLine(); renderRing(); tick(); }
  $('#year').textContent = now().getFullYear();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => requestAnimationFrame(layoutYarn));

  // mode profesi
  jobMode = store.get('bm_job') === '1';
  const jobT = $('#jobToggle');
  jobT.checked = jobMode;
  jobT.addEventListener('change', () => {
    jobMode = jobT.checked; store.set('bm_job', jobMode ? '1' : null);
    toast(jobMode ? 'Mode profesi: semua pakai seragam kerja 👔' : 'Kembali ke baju santai 👕');
    makePortraits().then(() => { renderAll(); if (user && user.id) $('#whoImg').src = head(user); $('#gateFaces').innerHTML = FAMILY.map(p => `<img alt="" src="${head(p)}" style="--c:${p.color}">`).join(''); });
  });

  // mulai
  const saved = store.get('bm_user');
  const savedUser = saved === 'guest' ? { guest: true } : FAMILY.find(p => p.id === saved);
  if (savedUser) login(savedUser, false); else { renderAll(); showGate(); }
  makePortraits().then(() => {
    renderAll();
    if (user && user.id) $('#whoImg').src = head(user);
    $('#gateFaces').innerHTML = FAMILY.map(p => `<img alt="" src="${head(p)}" style="--c:${p.color}">`).join('');
  }).catch(e => console.warn('Avatar gagal dimuat', e));
  setInterval(tick, 1000);
  let lastDay = midnight(now()).getTime();
  setInterval(() => { const d = midnight(now()).getTime(); if (d !== lastDay) { lastDay = d; renderAll(); } }, 30000);

  window.FAMILY_API = { FAMILY, info, parseDate, portraits: P };
})();
