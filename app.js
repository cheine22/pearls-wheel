(() => {
  'use strict';

  const NAMES = ['Aria', 'Bella', 'Cole', 'Dani', 'Emma', 'Harrison', 'Henry', 'Michael', 'Renee', 'Rob'];
  const PALETTE = ['#00338D', '#FFC72C', '#0B1B4D', '#FFFFFF', '#2F80ED', '#FF9E1B'];
  const TEXT_ON = {
    '#00338D': '#FFC72C', '#FFC72C': '#0B1B4D', '#0B1B4D': '#FFFFFF',
    '#FFFFFF': '#00338D', '#2F80ED': '#FFFFFF', '#FF9E1B': '#0B1B4D',
  };
  const HYPE = ['THE WHEEL HAS SPOKEN!', 'COME ON DOWN!', 'NO TAKE-BACKSIES!', 'DESTINY HAS CHOSEN!', 'STEP RIGHT UP!', 'THE PROPHECY IS FULFILLED!'];
  const CLOSE_HYPE = ['BY A WHISKER!', 'PHOTO FINISH!', 'BY THE SKIN OF THEIR TEETH!', 'THE JUDGES HAVE REVIEWED THE TAPE!'];
  const SUBS = [
    'Your PEARLS await. The crowd goes WILD! 🎉',
    'Clear your throat. Fix your hair. It is TIME. 🎤',
    'A standing ovation before you even start! 👏',
    'The people demand your learning objectives! 📚',
    'Legends are made in moments like this. 🦁',
  ];
  const FINALE_LINES = [
    ['🥁 THE FINAL SPIN! 🥁', 'One name. Infinite drama.'],
    ['WHO COULD IT POSSIBLY BE?!', 'Honestly, no idea.'],
    ['THE SUSPENSE IS UNBEARABLE!', 'Calculating odds…'],
    ["IT'S ANYONE'S GAME!", '(it is not anyone\'s game)'],
    ['HERE IT COMES…', 'Odds: 100.000%'],
  ];
  const RAIN = ['👏', '🎉', '🩺', '⭐', '🎊', '🙌', '🧠', '🦁', '💛', '💙'];
  const TAU = Math.PI * 2;
  const $ = (id) => document.getElementById(id);
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const body = document.body;

  // ---------- state ----------
  const off = new Set();   // unchecked names
  const done = new Set();  // already presented
  // Nothing is stored: reloading the page puts everyone back on the wheel.
  const save = () => {};
  const active = () => NAMES.filter((n) => !off.has(n));

  // ---------- title letters ----------
  const title = $('title');
  title.innerHTML = [...title.textContent].map((ch, i) =>
    ch === ' ' ? '<span class="sp"></span>' : `<span style="animation-delay:${-i * 0.09}s">${ch}</span>`).join('');

  // ---------- checklist ----------
  const list = $('list');
  function renderList() {
    list.innerHTML = '';
    NAMES.forEach((name) => {
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
  let ac = null, master = null, noiseBuf = null, applauseBus = null;
  function audio() {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ac = new AC();
      master = ac.createGain();
      const comp = ac.createDynamicsCompressor();
      master.connect(comp); comp.connect(ac.destination);
      noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }

  function tick(freq = 1100) {
    const a = audio(); if (!a) return;
    const t = a.currentTime;
    const o = a.createOscillator(), g = a.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(freq * 0.4, t + 0.04);
    g.gain.setValueAtTime(0.22, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + 0.07);
  }

  // one burst of filtered noise: a clap, a snare hit, a cymbal...
  function noiseHit(bus, when, type, freq, q, peak, decay) {
    const src = ac.createBufferSource();
    src.buffer = noiseBuf;
    const f = ac.createBiquadFilter();
    f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(peak, when + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, when + decay);
    src.connect(f); f.connect(g);
    if (ac.createStereoPanner) {
      const p = ac.createStereoPanner();
      p.pan.value = rand(-0.9, 0.9);
      g.connect(p); p.connect(bus);
    } else g.connect(bus);
    src.start(when, rand(0, 1.5), decay + 0.05);
  }
  const clap = (bus, when) => noiseHit(bus, when, 'bandpass', rand(800, 2600), rand(0.6, 2.5), rand(0.12, 0.4), rand(0.07, 0.16));

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

  // accelerating heartbeat + rising whine for the photo finish
  function heartbeat(dur) {
    const a = audio(); if (!a) return;
    const t0 = a.currentTime + 0.02;
    let t = 0, gap = 0.62;
    while (t < dur - 0.2) {
      [[0, 0.55], [0.14, 0.35]].forEach(([dt, vol]) => {
        tone(master, 'sine', 75, t0 + t + dt, 0.16, vol, 42);
        tone(master, 'triangle', 150, t0 + t + dt, 0.12, vol * 0.5, 80);
      });
      t += gap; gap = Math.max(0.27, gap * 0.87);
    }
    tone(master, 'sine', 220, t0, dur, 0.05, 880);
    tone(master, 'sine', 223, t0, dur, 0.05, 900);
  }

  // drumroll, slide whistles and a cymbal crash for the final spin
  function finaleSounds(dur) {
    const a = audio(); if (!a) return;
    const t0 = a.currentTime + 0.02;
    for (let t = 0; t < dur; t += 0.04) {
      noiseHit(master, t0 + t + rand(0, 0.008), 'highpass', 900, 0.7, 0.07 + 0.2 * (t / dur), 0.05);
    }
    noiseHit(master, t0 + dur, 'highpass', 5000, 0.5, 0.5, 1.4);
    [[0.3, 500, 1500, 0.8], [2.0, 1500, 380, 0.9], [3.6, 420, 1700, 0.7], [5.0, 1700, 350, 0.9], [6.5, 350, 2000, 1.0]]
      .forEach(([at, f1, f2, len]) => tone(master, 'sine', f1, t0 + at, len, 0.14, f2));
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
  let spin = null;        // the spin in progress, if any
  let lastIdx = null;
  let kick = 0;           // pointer deflection in degrees
  let modalOpen = false;
  let bannerTimer = null;

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

  // ---------- suspense banner ----------
  function showBanner(big, small) {
    $('bannerBig').textContent = big;
    $('bannerVs').textContent = small;
    $('banner').hidden = false;
  }
  function hideBanner() {
    clearInterval(bannerTimer); bannerTimer = null;
    $('banner').hidden = true;
  }

  // ---------- spinning ----------
  const CLOSE_CALL_ODDS = 2 / 3;
  const TEASE_HOLD = 900, TEASE_WOBBLE = 3300;

  function startSpin() {
    if (spin || modalOpen) return;
    const names = active();
    const n = names.length;
    if (!n) { $('count').animate([{ transform: 'scale(1.3) rotate(-4deg)' }, { transform: 'none' }], 400); return; }
    audio();
    lastIdx = null;
    list.disabled = true;
    const t0 = performance.now();

    if (n === 1) {
      // The grand finale: maximum suspense for a 100% certain outcome.
      rot = ((rot % TAU) + TAU) % TAU;
      spin = { phase: 'spin', finale: true, t0, dur: 7600, from: rot, to: Math.PI + TAU, names, winner: 0 };
      body.classList.add('finale');
      let i = 0;
      showBanner(...FINALE_LINES[0]);
      bannerTimer = setInterval(() => { i = Math.min(i + 1, FINALE_LINES.length - 1); showBanner(...FINALE_LINES[i]); }, 1500);
      finaleSounds(7.5);
      return;
    }

    const seg = TAU / n;
    const winner = Math.floor(Math.random() * n);
    // The pointer sits at angle 0 (right side). As the wheel turns, the pointer's
    // position inside a slice runs from 1 (just entered) down to 0 (about to leave).
    let final, tease = null;
    if (Math.random() < CLOSE_CALL_ODDS) {
      const d = Math.min(rand(0.03, 0.06) * seg, rand(0.025, 0.045)); // gap to the dividing line
      const leaving = Math.random() < 0.5;
      final = -(winner + (leaving ? d / seg : 1 - d / seg)) * seg;
      // The wheel first stops a hair off, then teeters back and forth over the line.
      const A = (leaving ? 1 : -1) * d * 3.2 * (Math.random() < 0.5 ? 1 : -1);
      tease = { A, rival: names[(winner + (leaving ? -1 : 1) + n) % n] };
    } else {
      final = -(winner + rand(0.15, 0.85)) * seg;
    }
    const target = final + (tease ? tease.A : 0);
    const shift = TAU * Math.ceil((rot - target) / TAU) + TAU * (6 + Math.floor(Math.random() * 4));
    spin = { phase: 'spin', t0, dur: rand(6500, 8500), from: rot, to: target + shift, final: final + shift, names, winner, tease };
    body.classList.add('spinning');
  }

  function beginTease() {
    spin.phase = 'tease';
    spin.t1 = performance.now();
    body.classList.remove('spinning');
    body.classList.add('closecall');
    const pair = [spin.names[spin.winner], spin.tease.rival];
    if (Math.random() < 0.5) pair.reverse();
    showBanner('📸 TOO CLOSE TO CALL! 📸', `${pair[0]}  vs  ${pair[1]}`);
    heartbeat((TEASE_HOLD + TEASE_WOBBLE) / 1000);
  }

  function finishSpin() {
    const s = spin;
    spin = null;
    list.disabled = false;
    body.classList.remove('spinning', 'closecall', 'finale');
    hideBanner();
    const name = s.names[s.winner];
    if (s.finale) showWinner(name, 'WHAT ARE THE ODDS?!', 'They were 100%. Last but NOT least! 🏆', true);
    else if (s.tease) showWinner(name, pick(CLOSE_HYPE), `${s.tease.rival} escapes by a hair! 😅`);
    else showWinner(name, pick(HYPE), pick(SUBS));
  }

  // ---------- winner modal ----------
  const modal = $('modal');
  let currentWinner = null, partyTimer = null, rainTimer = null, shownAt = 0;
  function showWinner(name, hype, sub, extra) {
    currentWinner = name;
    modalOpen = true;
    shownAt = performance.now();
    $('winnerName').textContent = name + '!';
    // long names shrink to stay on one line
    const len = name.length + 1;
    $('winnerName').style.fontSize = `min(7rem, ${(62 / len).toFixed(1)}vw, ${Math.round(520 / len)}px)`;
    $('hype').textContent = hype;
    $('sub').textContent = sub;
    modal.hidden = false;
    body.classList.add('party');
    // Nothing is focused, so a stray Space/Enter can't dismiss the pop-up.
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    applause(extra ? 12 : 9, true);
    cannon();
    partyTimer = setInterval(cannon, extra ? 450 : 900);
    rainTimer = setInterval(drop, extra ? 45 : 90);
  }
  function closeWinner(remove) {
    // Only a deliberate click on a pop-up button gets here; ignore accidental double-clicks.
    if (!modalOpen || performance.now() - shownAt < 700) return;
    if (remove && currentWinner) { off.add(currentWinner); done.add(currentWinner); save(); }
    modalOpen = false; currentWinner = null;
    modal.hidden = true;
    body.classList.remove('party');
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
      const now = performance.now();
      let finished = false;
      if (spin.phase === 'spin') {
        const p = Math.min(1, (now - spin.t0) / spin.dur);
        if (spin.finale) {
          // forwards, backwards, forwards again... for no reason at all
          rot = spin.from + (spin.to - spin.from) * p + TAU * 4 * Math.sin(p * Math.PI * 3) * (1 - p);
        } else {
          rot = spin.from + (spin.to - spin.from) * (1 - Math.pow(1 - p, 4));
        }
        if (p >= 1) { if (spin.tease) beginTease(); else finished = true; }
      } else {
        const u = now - spin.t1;
        if (u < TEASE_HOLD) rot = spin.to;
        else {
          const v = Math.min(1, (u - TEASE_HOLD) / TEASE_WOBBLE);
          rot = spin.final + spin.tease.A * Math.pow(1 - v, 2) * Math.cos(TAU * 2.5 * v);
          if (v >= 1) finished = true;
        }
      }
      const idx = spin.finale
        ? Math.floor(rot / (TAU / 12))
        : Math.floor((((-rot) % TAU) + TAU) % TAU / (TAU / spin.names.length));
      if (idx !== lastIdx) {
        if (lastIdx !== null) { tick(spin.phase === 'tease' ? 1700 : 1100); kick = 28; }
        lastIdx = idx;
      }
      if (finished) finishSpin();
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
  $('clapBtn').addEventListener('click', () => { applause(5, false); cannon(); });
  const onKey = (e) => {
    if (modalOpen) {
      // The pop-up only goes away when one of its buttons is clicked.
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') e.preventDefault();
      return;
    }
    if (e.type !== 'keydown') return;
    const tag = e.target.tagName;
    if ((e.key === ' ' && tag !== 'INPUT' && tag !== 'BUTTON') || (e.key === 'Enter' && (e.ctrlKey || e.metaKey))) {
      e.preventDefault(); startSpin();
    }
  };
  document.addEventListener('keydown', onKey);
  document.addEventListener('keyup', onKey);

  renderList();
  requestAnimationFrame(frame);
})();
