(() => {
  'use strict';

  const NAMES = ['Cole', 'Harrison', 'Dani', 'Renee', 'Michael', 'Bella', 'Emma', 'Rob', 'Henry', 'Aria'];
  const PALETTE = ['#00338D', '#FFC72C', '#0B1B4D', '#FFFFFF', '#2F80ED', '#FF9E1B'];
  const TEXT_ON = {
    '#00338D': '#FFC72C', '#FFC72C': '#0B1B4D', '#0B1B4D': '#FFFFFF',
    '#FFFFFF': '#00338D', '#2F80ED': '#FFFFFF', '#FF9E1B': '#0B1B4D',
  };
  const HYPE = ['THE WHEEL HAS SPOKEN!', 'COME ON DOWN!', 'NO TAKE-BACKSIES!', 'DESTINY HAS CHOSEN!', 'STEP RIGHT UP!', 'THE PROPHECY IS FULFILLED!'];
  const SUBS = [
    'Your PEARLS await. The crowd goes WILD! 🎉',
    'Clear your throat. Fix your hair. It is TIME. 🎤',
    'A standing ovation before you even start! 👏',
    'The people demand your learning objectives! 📚',
    'Legends are made in moments like this. 🦁',
  ];
  const RAIN = ['👏', '🎉', '🩺', '⭐', '🎊', '🙌', '🧠', '🦁', '💛', '💙'];
  const KEY = 'pearls-wheel-v1';
  const TAU = Math.PI * 2;
  const $ = (id) => document.getElementById(id);
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // ---------- state ----------
  let order = [...NAMES];
  const off = new Set();   // unchecked names
  const done = new Set();  // already presented
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || '{}');
    (s.off || []).forEach((n) => NAMES.includes(n) && off.add(n));
    (s.done || []).forEach((n) => NAMES.includes(n) && done.add(n));
  } catch (e) { /* storage unavailable: start fresh */ }
  const save = () => {
    try { localStorage.setItem(KEY, JSON.stringify({ off: [...off], done: [...done] })); } catch (e) { /* ignore */ }
  };
  const active = () => order.filter((n) => !off.has(n));

  // ---------- title letters ----------
  const title = $('title');
  title.innerHTML = [...title.textContent].map((ch, i) =>
    ch === ' ' ? '<span class="sp"></span>' : `<span style="animation-delay:${-i * 0.09}s">${ch}</span>`).join('');

  // ---------- checklist ----------
  const list = $('list');
  function renderList() {
    list.innerHTML = '';
    order.forEach((name) => {
      const row = document.createElement('label');
      row.className = 'row' + (done.has(name) ? ' done' : '');
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = !off.has(name);
      cb.addEventListener('change', () => {
        if (cb.checked) { off.delete(name); done.delete(name); } else off.add(name);
        save(); renderList();
      });
      const span = document.createElement('span');
      span.className = 'name';
      span.textContent = name;
      row.append(cb, span);
      if (done.has(name)) {
        const b = document.createElement('span');
        b.className = 'badge';
        b.textContent = 'presented 🎤';
        row.append(b);
      }
      list.append(row);
    });
    const n = active().length;
    $('count').textContent = n === 0 ? 'Nobody left! Everyone survived! 🥳'
      : n === 1 ? '1 doomed soul remaining 😬' : `${n} brave souls on the wheel`;
  }

  // ---------- audio (all synthesized, no files) ----------
  let ac = null, master = null, noiseBuf = null, muted = false, applauseBus = null;
  function audio() {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ac = new AC();
      master = ac.createGain();
      master.gain.value = muted ? 0 : 1;
      const comp = ac.createDynamicsCompressor();
      master.connect(comp); comp.connect(ac.destination);
      noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }

  function tick() {
    const a = audio(); if (!a) return;
    const t = a.currentTime;
    const o = a.createOscillator(), g = a.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(1100, t);
    o.frequency.exponentialRampToValueAtTime(420, t + 0.04);
    g.gain.setValueAtTime(0.22, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + 0.07);
  }

  function clap(bus, when) {
    const src = ac.createBufferSource();
    src.buffer = noiseBuf;
    const bp = ac.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = rand(800, 2600);
    bp.Q.value = rand(0.6, 2.5);
    const g = ac.createGain();
    const peak = rand(0.12, 0.4);
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(peak, when + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, when + rand(0.07, 0.16));
    src.connect(bp); bp.connect(g);
    if (ac.createStereoPanner) {
      const p = ac.createStereoPanner();
      p.pan.value = rand(-0.9, 0.9);
      g.connect(p); p.connect(bus);
    } else g.connect(bus);
    src.start(when, rand(0, 1.7), 0.2);
  }

  function tone(bus, type, freq, when, len, vol, endFreq) {
    const o = ac.createOscillator(), g = ac.createGain(), lp = ac.createBiquadFilter();
    o.type = type;
    o.frequency.setValueAtTime(freq, when);
    if (endFreq) o.frequency.exponentialRampToValueAtTime(endFreq, when + len);
    lp.type = 'lowpass'; lp.frequency.value = 2600;
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(vol, when + 0.02);
    g.gain.setValueAtTime(vol, when + len * 0.75);
    g.gain.exponentialRampToValueAtTime(0.0001, when + len);
    o.connect(lp); lp.connect(g); g.connect(bus);
    o.start(when); o.stop(when + len + 0.05);
  }

  function applause(dur = 8, fanfare = true) {
    const a = audio(); if (!a) return;
    stopApplause();
    const t0 = a.currentTime + 0.05;
    const bus = a.createGain();
    bus.connect(master);
    applauseBus = bus;

    // a stadium's worth of individual claps
    const env = (t) => (t < 0.5 ? 0.15 + t * 1.7 : t > dur - 3 ? Math.max(0, (dur - t) / 3) : 1);
    let t = 0;
    while (t < dur) {
      t += -Math.log(1 - Math.random()) / (75 * env(t) + 3);
      clap(bus, t0 + t);
    }

    // crowd roar underneath
    const roar = a.createBufferSource();
    roar.buffer = noiseBuf; roar.loop = true;
    const rf = a.createBiquadFilter();
    rf.type = 'bandpass'; rf.frequency.value = 700; rf.Q.value = 0.4;
    const rg = a.createGain();
    rg.gain.setValueAtTime(0.0001, t0);
    rg.gain.exponentialRampToValueAtTime(0.3, t0 + 0.6);
    rg.gain.setValueAtTime(0.3, t0 + dur - 3);
    rg.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    roar.connect(rf); rf.connect(rg); rg.connect(bus);
    roar.start(t0); roar.stop(t0 + dur + 0.1);

    // "WOOOO!" whoops
    for (let i = 0; i < 9; i++) {
      const w = t0 + rand(0.2, dur - 2.5);
      const f = rand(480, 820);
      const o = a.createOscillator(), g = a.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(f, w);
      o.frequency.exponentialRampToValueAtTime(f * 1.9, w + 0.22);
      o.frequency.exponentialRampToValueAtTime(f * 1.25, w + 0.7);
      g.gain.setValueAtTime(0.0001, w);
      g.gain.exponentialRampToValueAtTime(0.07, w + 0.1);
      g.gain.exponentialRampToValueAtTime(0.0001, w + 0.7);
      o.connect(g); g.connect(bus);
      o.start(w); o.stop(w + 0.75);
    }

    if (fanfare) {
      // ta-da-da-DAAAA
      [[523, 0, 0.14], [659, 0.15, 0.14], [784, 0.3, 0.14], [1047, 0.45, 0.8]].forEach(([f, at, len]) => {
        tone(bus, 'sawtooth', f, t0 + at, len, 0.13);
        tone(bus, 'square', f / 2, t0 + at, len, 0.06);
      });
      tone(bus, 'sawtooth', 659, t0 + 0.45, 0.8, 0.08);
      tone(bus, 'sawtooth', 784, t0 + 0.45, 0.8, 0.08);
      // obligatory air horn
      [[1.45, 0.16], [1.68, 0.16], [1.91, 0.75]].forEach(([at, len]) => {
        tone(bus, 'sawtooth', 466, t0 + at, len, 0.1, 440);
        tone(bus, 'sawtooth', 473, t0 + at, len, 0.1, 446);
        tone(bus, 'square', 932, t0 + at, len, 0.04, 880);
      });
    }
  }

  function stopApplause() {
    if (!applauseBus || !ac) return;
    const g = applauseBus.gain, t = ac.currentTime;
    g.cancelScheduledValues(t);
    g.setValueAtTime(g.value, t);
    g.linearRampToValueAtTime(0, t + 0.5);
    applauseBus = null;
  }

  // ---------- wheel ----------
  const canvas = $('wheel'), ctx = canvas.getContext('2d');
  const wrap = $('wheelWrap'), pointer = $('pointer');
  let size = 600, dpr = 1;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    size = wrap.clientWidth || 600;
    canvas.width = canvas.height = Math.round(size * dpr);
  }
  if (window.ResizeObserver) new ResizeObserver(resize).observe(wrap);
  window.addEventListener('resize', resize);
  resize();

  let rot = Math.random() * TAU;
  let spin = null;        // {t0, dur, from, to, names, winner}
  let lastIdx = -1;
  let kick = 0;           // pointer deflection in degrees
  let modalOpen = false;

  const segColor = (i, n) => (n > 1 && i === n - 1 && i % PALETTE.length === 0 ? PALETTE[2] : PALETTE[i % PALETTE.length]);

  function drawWheel(ts) {
    const names = spin ? spin.names : active();
    const n = names.length;
    const c = size / 2, rim = size * 0.045, R = c - rim;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(c, c);

    // rim
    ctx.beginPath(); ctx.arc(0, 0, c - 1, 0, TAU);
    ctx.fillStyle = '#0B1B4D'; ctx.fill();

    ctx.save();
    ctx.rotate(rot);
    if (n === 0) {
      ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU);
      ctx.fillStyle = '#00338D'; ctx.fill();
    } else {
      const seg = TAU / n;
      const fs = Math.min(R * 0.15, R * seg * 0.42);
      ctx.font = `700 ${fs}px Fredoka, system-ui, sans-serif`;
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      for (let i = 0; i < n; i++) {
        const col = segColor(i, n);
        ctx.beginPath(); ctx.moveTo(0, 0);
        ctx.arc(0, 0, R, i * seg, (i + 1) * seg);
        ctx.closePath();
        ctx.fillStyle = col; ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = '#0B1B4D'; ctx.stroke();
        ctx.save();
        ctx.rotate(i * seg + seg / 2);
        ctx.fillStyle = TEXT_ON[col];
        ctx.fillText(names[i], R - size * 0.045, 0);
        ctx.restore();
      }
    }
    ctx.restore();

    if (n === 0) {
      ctx.fillStyle = '#FFC72C';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = `700 ${size * 0.055}px Fredoka, system-ui, sans-serif`;
      ctx.fillText('Everyone presented! 🎉', 0, -R * 0.55);
      ctx.fillText('Check names to reload', 0, R * 0.55);
    }

    // chasing marquee bulbs on the rim
    const bulbs = 28, phase = Math.floor(ts / (spin ? 70 : 260));
    for (let i = 0; i < bulbs; i++) {
      const a = (i / bulbs) * TAU, on = (i + phase) % 2 === 0;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * (c - rim / 2), Math.sin(a) * (c - rim / 2), rim * 0.28, 0, TAU);
      ctx.fillStyle = on ? '#FFE27A' : '#7a5c00';
      ctx.shadowColor = '#FFC72C'; ctx.shadowBlur = on ? rim * 0.6 : 0;
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  function startSpin() {
    if (spin || modalOpen) return;
    const names = active();
    if (!names.length) { $('count').animate([{ transform: 'scale(1.3) rotate(-4deg)' }, { transform: 'none' }], 400); return; }
    audio();
    const n = names.length, seg = TAU / n;
    const winner = Math.floor(Math.random() * n);
    // pointer sits at angle 0 (right side); land somewhere inside the winner's slice
    const base = -(winner + rand(0.1, 0.9)) * seg;
    const to = base + TAU * Math.ceil((rot - base) / TAU) + TAU * (6 + Math.floor(Math.random() * 4));
    spin = { t0: performance.now(), dur: rand(6500, 8500), from: rot, to, names, winner };
    lastIdx = -1;
    list.disabled = true;
    document.body.classList.add('spinning');
  }

  function finishSpin() {
    const name = spin.names[spin.winner];
    spin = null;
    list.disabled = false;
    document.body.classList.remove('spinning');
    showWinner(name);
  }

  // ---------- winner modal ----------
  const modal = $('modal');
  let currentWinner = null, partyTimer = null;
  function showWinner(name) {
    currentWinner = name;
    modalOpen = true;
    $('winnerName').textContent = name + '!';
    $('hype').textContent = pick(HYPE);
    $('sub').textContent = pick(SUBS);
    modal.hidden = false;
    document.body.classList.add('party');
    $('remove').focus();
    applause(9, true);
    cannon();
    partyTimer = setInterval(() => { cannon(); }, 900);
    rainTimer = setInterval(drop, 90);
  }
  function closeWinner(remove) {
    if (!modalOpen) return;
    if (remove && currentWinner) { off.add(currentWinner); done.add(currentWinner); save(); }
    modalOpen = false; currentWinner = null;
    modal.hidden = true;
    document.body.classList.remove('party');
    clearInterval(partyTimer); clearInterval(rainTimer);
    stopApplause();
    renderList();
  }

  // ---------- confetti ----------
  const cc = $('confetti'), cx = cc.getContext('2d');
  let parts = [];
  function sizeConfetti() { cc.width = innerWidth; cc.height = innerHeight; }
  window.addEventListener('resize', sizeConfetti); sizeConfetti();
  const CONF = ['#FFC72C', '#00338D', '#2F80ED', '#FFFFFF', '#FF9E1B'];
  function burst(x, y, n, dir, spread, power) {
    for (let i = 0; i < n; i++) {
      const a = dir + rand(-spread, spread), v = rand(0.4, 1) * power;
      parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, w: rand(6, 14), h: rand(4, 9), r: rand(0, TAU), vr: rand(-0.3, 0.3), c: pick(CONF), life: rand(140, 240) });
    }
    if (parts.length > 1400) parts.splice(0, parts.length - 1400);
  }
  function cannon() {
    const w = innerWidth, h = innerHeight;
    burst(0, h, 70, -Math.PI / 3, 0.35, 26);
    burst(w, h, 70, -2 * Math.PI / 3, 0.35, 26);
    burst(rand(w * 0.2, w * 0.8), rand(h * 0.15, h * 0.5), 50, 0, Math.PI, 11);
  }
  function drawConfetti() {
    if (!parts.length) { if (cc.dataset.dirty) { cx.clearRect(0, 0, cc.width, cc.height); cc.dataset.dirty = ''; } return; }
    cc.dataset.dirty = '1';
    cx.clearRect(0, 0, cc.width, cc.height);
    parts = parts.filter((p) => p.life > 0 && p.y < cc.height + 40);
    for (const p of parts) {
      p.vy += 0.35; p.vx *= 0.985; p.vy *= 0.985;
      p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life--;
      cx.save();
      cx.translate(p.x, p.y); cx.rotate(p.r);
      cx.globalAlpha = Math.min(1, p.life / 30);
      cx.fillStyle = p.c;
      cx.fillRect(-p.w / 2, -p.h / 2 * Math.cos(p.life / 6), p.w, p.h * Math.cos(p.life / 6));
      cx.restore();
    }
  }

  // ---------- emoji rain ----------
  const rain = $('rain');
  let rainTimer = null;
  function drop() {
    const s = document.createElement('span');
    s.textContent = pick(RAIN);
    s.style.left = rand(0, 96) + 'vw';
    s.style.fontSize = rand(1.4, 3.6) + 'rem';
    s.style.animationDuration = rand(1.8, 4) + 's';
    s.addEventListener('animationend', () => s.remove());
    rain.append(s);
  }

  // ---------- main loop ----------
  function frame(ts) {
    if (spin) {
      const p = Math.min(1, (performance.now() - spin.t0) / spin.dur);
      rot = spin.from + (spin.to - spin.from) * (1 - Math.pow(1 - p, 4));
      const seg = TAU / spin.names.length;
      const idx = Math.floor((((-rot) % TAU) + TAU) % TAU / seg);
      if (idx !== lastIdx) {
        if (lastIdx !== -1) { tick(); kick = 28; }
        lastIdx = idx;
      }
      if (p >= 1) finishSpin();
    } else if (!modalOpen) {
      rot += 0.0025;
    }
    kick *= 0.82;
    pointer.style.transform = `rotate(${kick.toFixed(1)}deg)`;
    drawWheel(ts);
    drawConfetti();
    requestAnimationFrame(frame);
  }

  // ---------- controls ----------
  canvas.addEventListener('click', startSpin);
  $('spin').addEventListener('click', startSpin);
  $('remove').addEventListener('click', () => closeWinner(true));
  $('keep').addEventListener('click', () => closeWinner(false));
  $('all').addEventListener('click', () => { if (spin) return; off.clear(); done.clear(); save(); renderList(); });
  $('shuffle').addEventListener('click', () => {
    if (spin) return;
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    renderList();
  });
  $('clapBtn').addEventListener('click', () => { applause(5, false); cannon(); });
  $('mute').addEventListener('click', (e) => {
    muted = !muted;
    if (master) master.gain.value = muted ? 0 : 1;
    e.currentTarget.textContent = muted ? '🔇 Sound: OFF' : '🔊 Sound: ON';
    e.currentTarget.setAttribute('aria-pressed', String(muted));
  });
  document.addEventListener('keydown', (e) => {
    if (modalOpen) { if (e.key === 'Escape') closeWinner(false); return; }
    const tag = e.target.tagName;
    if ((e.key === ' ' && tag !== 'INPUT' && tag !== 'BUTTON') || (e.key === 'Enter' && (e.ctrlKey || e.metaKey))) {
      e.preventDefault(); startSpin();
    }
  });

  renderList();
  requestAnimationFrame(frame);
})();
