(() => {
  'use strict';

  const NAMES = ['Aria', 'Bella', 'Cole', 'Dani', 'Emma', 'Harrison', 'Henry', 'Michael', 'Renee', 'Rob'];
  // ZSOM blue + gold first, then loud friends for contrast
  const PALETTE = ['#00338D', '#FFC72C', '#E6007E', '#00D1C1', '#0B1B4D', '#B6F000', '#7B2FF7', '#FF9E1B', '#FFFFFF', '#2F80ED'];
  const TEXT_ON = {
    '#00338D': '#FFC72C', '#FFC72C': '#0B1B4D', '#E6007E': '#FFFFFF', '#00D1C1': '#0B1B4D', '#0B1B4D': '#7CFFE9',
    '#B6F000': '#0B1B4D', '#7B2FF7': '#FFC72C', '#FF9E1B': '#0B1B4D', '#FFFFFF': '#E6007E', '#2F80ED': '#FFFFFF',
  };
  const BULBS = ['#FFE27A', '#FF5CB8', '#7CFFE9', '#D8FF5C', '#FFFFFF'];
  const CONF = ['#FFC72C', '#00338D', '#2F80ED', '#FFFFFF', '#FF9E1B', '#E6007E', '#00D1C1', '#B6F000', '#7B2FF7'];
  const HYPE = ['THE WHEEL HAS SPOKEN!', 'COME ON DOWN!', 'NO TAKE-BACKSIES!', 'DESTINY HAS CHOSEN!', 'STEP RIGHT UP!', 'THE PROPHECY IS FULFILLED!'];
  const CLOSE_HYPE = ['BY A WHISKER!', 'BY ONE MEASLY PEG!', 'BY THE SKIN OF THEIR TEETH!', 'THAT WAS RIDICULOUSLY CLOSE!'];
  const SUBS = [
    'Your PEARLS await. The crowd goes WILD! 🎉',
    'Clear your throat. Fix your hair. It is TIME. 🎤',
    'A standing ovation before you even start! 👏',
    'The people demand your learning objectives! 📚',
    'Legends are made in moments like this. 🦁',
  ];
  const CLOSE_SUBS = [(r) => `${r} was THIS close. 🤏`, (r) => `${r} escapes by a hair! 😅`, (r) => `${r} may now exhale. 😮‍💨`];
  const SUS_LINES = [
    ['OOOOOOOH…', "it's slowing down"],
    ['NOBODY BREATHE', ''],
    ['WILL IT MAKE IT?!', 'one more peg…?'],
    ['HOLD… HOLD…', 'the wheel is thinking'],
    ['SO. MUCH. SUSPENSE.', '🫣'],
    ['CREEEEEEAK…', ''],
    ['UH OH…', 'this is going to be close'],
  ];
  const RAIN = ['👏', '🎉', '🩺', '⭐', '🎊', '🙌', '🧠', '🦁', '💛', '💙', '💖', '🦠'];
  const TAU = Math.PI * 2;
  const $ = (id) => document.getElementById(id);
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const body = document.body;
  const PUNS = [
    'Triggers are obligate, not facultative 🎤',
    'Stay golden, like <i>Staph aureus</i> 💛',
    "Don't be so Gram-negative 🧫",
    'Catalase positive: we bubble under pressure 🫧',
    '<i>Strep</i> in line and wait your turn ⛓️',
    '<i>C. diff</i>-icult to predict who\'s next 🎡',
    '<i>E. coli</i> me maybe 📞',
    "Take a deep breath — don't be an obligate anaerobe 😮‍💨",
    'Feeling tense? Blame <i>C. tetani</i> 😬',
    'Something smells grape… must be <i>Pseudomonas</i> 🍇',
    'May the spores be ever in your favor 🦠',
    '<i>Listeria</i> up, class! 📣',
    'Spirochete happens 🌀',
    'Be a fun-gi about it 🍄',
    '<i>Rickettsia</i> or not, here it comes 🎯',
    'Urease-y does it 🧪',
    'This wheel is beta-hemolytic: complete destruction of your free time 🩸',
    '<i>Mycoplasma</i>: no wall can hold you back 🧱',
    '<i>Treponema</i>-dous job, everyone 👏',
    'Too <i>Legionella</i> to quit 💪',
    "Even <i>Klebsiella</i> can't encapsulate itself from the wheel 🛡️",
    '<i>Giardia</i> your loins 🎒',
  ];

  // ----- /dev review page: every behaviour in order, or pick the next one -----
  const DEV = document.documentElement.hasAttribute('data-dev');
  const devPick = {}, devSeq = {}, devLog = {};
  const DEV_LABELS = {
    kind: ['Normal spin', 'Suspense: long glide', 'Suspense: peg-by-peg lurch', 'Suspense: stop, then second wind',
      'Final spin: flying flips', 'Final spin: wheel escapes', 'Final spin: movie trailer', 'Final spin: system overload'],
    tips: ['Stops just short of the peg', 'Just tips over the peg'],
    music: ['Heartbeat', 'Circling low notes', 'Trembling strings', 'Tick-tock + theremin'],
    look: ['Zoom on pointer', 'Lights out', 'Shake + colour shift'],
    entrance: ['Spin-pop', 'Drop in', 'Slam', 'Flip'],
    fanfare: ['Ta-da + air horn', 'Charge! bugle', 'Harp sparkle', 'Brass stabs'],
    party: ['Corner cannons', 'Fireworks', 'Shower'],
  };
  const DEV_TITLES = { kind: 'Next spin', tips: 'Suspense ending', music: 'Suspense music', look: 'Suspense look', entrance: 'Pop-up entrance', fanfare: 'Fanfare', party: 'Confetti' };

  // Deal variants from a shuffled deck (remembered between visits) so nothing
  // repeats until every version has had a turn.
  const decks = {};
  function dealFrom(key, n) {
    if (DEV) { // in order, unless a specific one was picked
      const v = devPick[key] >= 0 && devPick[key] < n ? devPick[key] : (devSeq[key] = ((devSeq[key] === undefined ? -1 : devSeq[key]) + 1) % n);
      devLog[key] = v;
      return v;
    }
    let d = decks[key];
    if (!d) {
      try { d = JSON.parse(localStorage.getItem('pw-deck-' + key)); } catch (e) { /* no storage */ }
      if (!d || !Array.isArray(d.left)) d = { left: [], last: -1 };
    }
    d.left = d.left.filter((i) => Number.isInteger(i) && i >= 0 && i < n);
    if (!d.left.length) {
      d.left = [...Array(n).keys()];
      for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [d.left[i], d.left[j]] = [d.left[j], d.left[i]]; }
      if (n > 1 && d.left[n - 1] === d.last) [d.left[0], d.left[n - 1]] = [d.left[n - 1], d.left[0]];
    }
    d.last = d.left.pop();
    decks[key] = d;
    try { localStorage.setItem('pw-deck-' + key, JSON.stringify(d)); } catch (e) { /* ignore */ }
    return d.last;
  }

  // ---------- state ----------
  const off = new Set(DEV ? [] : NAMES);  // unchecked names: nobody is on the wheel until ticked
  const done = new Set();      // already presented
  const active = () => NAMES.filter((n) => !off.has(n));

  // ---------- title letters ----------
  const title = $('title');
  title.innerHTML = [...title.textContent].map((ch, i) =>
    ch === ' ' ? '<span class="sp"></span>' : `<span style="animation-delay:${-i * 0.09}s">${ch}</span>`).join('');

  // ---------- ticker tape ----------
  const ticker = document.querySelector('.marquee-inner');
  const tape = PUNS.join(' &nbsp;✦&nbsp; ') + ' &nbsp;✦&nbsp; ';
  ticker.innerHTML = `<span>${tape}</span><span>${tape}</span>`;
  const paceTicker = () => { ticker.style.animationDuration = Math.max(20, ticker.scrollWidth / 2 / 85) + 's'; }; // ~85px per second
  paceTicker();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(paceTicker);

  // ---------- checklist + panel ----------
  const list = $('list'), panel = $('panel');
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
        renderList();
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
  }
  const setPanelHidden = (hidden) => body.classList.toggle('panel-hidden', hidden);
  $('hidePanel').addEventListener('click', () => setPanelHidden(true));
  $('showPanel').addEventListener('click', () => setPanelHidden(false));

  // ---------- audio (all synthesized, no files) ----------
  let ac = null, master = null, noiseBuf = null, applauseBus = null, moodBus = null;
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
  function newBus() { const b = ac.createGain(); b.connect(master); return b; }
  function fadeBus(bus, secs) {
    if (!bus || !ac) return;
    const t = ac.currentTime;
    bus.gain.cancelScheduledValues(t);
    bus.gain.setValueAtTime(bus.gain.value, t);
    bus.gain.linearRampToValueAtTime(0, t + secs);
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
  const crash = (bus, when) => noiseHit(bus, when, 'highpass', 5000, 0.5, 0.5, 1.4);

  // one synth note, with optional pitch slide, swell, vibrato and tremolo
  function voice(bus, o) {
    const { type = 'sine', f, f2, when, len, vol, vol2, lp = 2600, vib = 0, vibDepth = 0, trem = 0, tremDepth = 0 } = o;
    const osc = ac.createOscillator(), g = ac.createGain(), fl = ac.createBiquadFilter();
    osc.type = type;
    osc.frequency.setValueAtTime(f, when);
    if (f2) osc.frequency.exponentialRampToValueAtTime(f2, when + len);
    fl.type = 'lowpass'; fl.frequency.value = lp;
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(vol, when + Math.min(0.02, len / 4));
    if (vol2) g.gain.exponentialRampToValueAtTime(vol2, when + len * 0.85);
    else g.gain.setValueAtTime(vol, when + len * 0.75);
    g.gain.exponentialRampToValueAtTime(0.0001, when + len);
    osc.connect(fl); fl.connect(g);
    let out = g;
    if (trem) {
      const tg = ac.createGain(), l = ac.createOscillator(), ld = ac.createGain();
      l.frequency.value = trem; ld.gain.value = tremDepth;
      l.connect(ld); ld.connect(tg.gain);
      l.start(when); l.stop(when + len + 0.05);
      g.connect(tg); out = tg;
    }
    if (vib) {
      const l = ac.createOscillator(), ld = ac.createGain();
      l.frequency.value = vib; ld.gain.value = vibDepth;
      l.connect(ld); ld.connect(osc.frequency);
      l.start(when); l.stop(when + len + 0.05);
    }
    out.connect(bus);
    osc.start(when); osc.stop(when + len + 0.05);
  }
  const tone = (bus, type, f, when, len, vol, f2) => voice(bus, { type, f, f2, when, len, vol });
  function timp(bus, when, vol) {
    voice(bus, { f: 95, f2: 48, when, len: 0.55, vol });
    voice(bus, { type: 'triangle', f: 190, f2: 96, when, len: 0.3, vol: vol * 0.5 });
    noiseHit(bus, when, 'lowpass', 220, 0.7, vol, 0.25);
  }

  // ----- four fanfares -----
  const FANFARES = [
    (bus, t0) => { // ta-da-da-DAAAA + air horn
      [[523, 0, 0.14], [659, 0.15, 0.14], [784, 0.3, 0.14], [1047, 0.45, 0.8]].forEach(([f, at, len]) => {
        tone(bus, 'sawtooth', f, t0 + at, len, 0.13);
        tone(bus, 'square', f / 2, t0 + at, len, 0.06);
      });
      tone(bus, 'sawtooth', 659, t0 + 0.45, 0.8, 0.08);
      tone(bus, 'sawtooth', 784, t0 + 0.45, 0.8, 0.08);
      [[1.45, 0.16], [1.68, 0.16], [1.91, 0.75]].forEach(([at, len]) => {
        tone(bus, 'sawtooth', 466, t0 + at, len, 0.1, 440);
        tone(bus, 'sawtooth', 473, t0 + at, len, 0.1, 446);
        tone(bus, 'square', 932, t0 + at, len, 0.04, 880);
      });
    },
    (bus, t0) => { // stadium "charge!" bugle call
      [[392, 0, 0.12], [523, 0.13, 0.12], [659, 0.26, 0.12], [784, 0.39, 0.2], [659, 0.62, 0.12], [784, 0.75, 0.9]].forEach(([f, at, len]) => {
        tone(bus, 'sawtooth', f, t0 + at, len, 0.14);
        tone(bus, 'square', f, t0 + at, len, 0.05);
      });
      timp(bus, t0 + 0.75, 0.4);
    },
    (bus, t0) => { // sparkly harp run into a big chord
      [523, 659, 784, 1047, 1319, 1568, 2093].forEach((f, i) => tone(bus, 'triangle', f, t0 + i * 0.07, 0.25, 0.14));
      [523, 659, 784, 1047].forEach((f) => tone(bus, 'sawtooth', f, t0 + 0.5, 1.1, 0.07));
      for (let i = 0; i < 26; i++) tone(bus, 'sine', rand(2000, 4200), t0 + 0.4 + rand(0, 1.6), 0.12, 0.05);
    },
    (bus, t0) => { // three big brass stabs
      [[[233, 294, 349], 0, 0.2], [[262, 330, 392], 0.26, 0.2], [[294, 370, 440, 587], 0.52, 1.1]].forEach(([chord, at, len]) => {
        chord.forEach((f) => { tone(bus, 'sawtooth', f, t0 + at, len, 0.09); tone(bus, 'square', f * 2, t0 + at, len, 0.03); });
        timp(bus, t0 + at, 0.35);
      });
      crash(bus, t0 + 0.52);
    },
  ];

  function applause(dur = 8, fanfare = -1) {
    const a = audio(); if (!a) return;
    stopApplause();
    const t0 = a.currentTime + 0.05;
    const bus = newBus();
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
      const w = t0 + rand(0.2, dur - 2.5), f = rand(480, 820);
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
    if (fanfare >= 0) FANFARES[fanfare](bus, t0);
  }
  function stopApplause() { fadeBus(applauseBus, 0.5); applauseBus = null; }

  // ----- four pieces of suspense music (each lasts T seconds) -----
  const SUS_MUSIC = [
    (bus, t0, T) => { // racing heartbeat + rising whine
      let t = 0, gap = 0.7;
      while (t < T - 0.2) {
        [[0, 0.55], [0.14, 0.35]].forEach(([dt, vol]) => {
          tone(bus, 'sine', 75, t0 + t + dt, 0.16, vol, 42);
          tone(bus, 'triangle', 150, t0 + t + dt, 0.12, vol * 0.5, 80);
        });
        t += gap; gap = Math.max(0.27, gap * 0.9);
      }
      voice(bus, { f: 220, f2: 880, when: t0, len: T, vol: 0.03, vol2: 0.08 });
      voice(bus, { f: 223, f2: 900, when: t0, len: T, vol: 0.03, vol2: 0.08 });
    },
    (bus, t0, T) => { // something is circling: two low notes, faster and faster
      let t = 0, gap = 0.8, i = 0;
      while (t < T - 0.1) {
        const f = i % 2 ? 87.3 : 82.4, len = Math.min(gap * 0.8, 0.35);
        voice(bus, { type: 'sawtooth', f, when: t0 + t, len, vol: 0.3, lp: 700 });
        voice(bus, { type: 'sawtooth', f: f * 2, when: t0 + t, len, vol: 0.14, lp: 1200 });
        t += gap; gap = Math.max(0.12, gap * 0.9); i++;
      }
    },
    (bus, t0, T) => { // trembling strings creeping upward over a timpani roll
      [220, 233.1, 311.1, 329.6].forEach((f) =>
        voice(bus, { type: 'sawtooth', f, f2: f * 1.19, when: t0, len: T, vol: 0.035, vol2: 0.1, lp: 1800, trem: 11, tremDepth: 0.6 }));
      let t = 0, gap = 0.5;
      while (t < T) { timp(bus, t0 + t, 0.12 + 0.3 * (t / T)); t += gap; gap = Math.max(0.09, gap * 0.9); }
    },
    (bus, t0, T) => { // tick-tock over a drone, with a wobbly theremin
      let t = 0, gap = 0.55, i = 0;
      while (t < T) {
        tone(bus, 'square', i % 2 ? 900 : 650, t0 + t, 0.035, 0.16);
        t += gap; gap = Math.max(0.1, gap * 0.93); i++;
      }
      voice(bus, { f: 55, when: t0, len: T, vol: 0.2 });
      voice(bus, { type: 'sawtooth', f: 110, when: t0, len: T, vol: 0.06, lp: 500 });
      voice(bus, { f: 420, f2: 760, when: t0, len: T, vol: 0.05, vol2: 0.09, vib: 6, vibDepth: 14 });
    },
  ];

  // ----- sounds for the four final-spin versions -----
  function drumroll(bus, t0, dur) {
    for (let t = 0; t < dur; t += 0.04) noiseHit(bus, t0 + t + rand(0, 0.008), 'highpass', 900, 0.7, 0.07 + 0.2 * (t / dur), 0.05);
  }
  function sndLoopy(bus, t0, dur) {
    drumroll(bus, t0, dur);
    [[0.04, 500, 1500, 0.8], [0.27, 1500, 380, 0.9], [0.48, 420, 1700, 0.7], [0.66, 1700, 350, 0.9], [0.86, 350, 2000, 1.0]]
      .forEach(([at, f1, f2, len]) => tone(bus, 'sine', f1, t0 + at * dur, len, 0.14, f2));
  }
  function sndRogue(bus, t0, dur) {
    [0.08, 0.22, 0.36, 0.5, 0.64, 0.78].forEach((p) => { // a boing for every wall it hits
      const w = t0 + p * dur;
      tone(bus, 'sine', 280, w, 0.12, 0.25, 900);
      voice(bus, { type: 'triangle', f: 900, f2: 220, when: w + 0.1, len: 0.45, vol: 0.2, vib: 22, vibDepth: 70 });
    });
    const run = [262, 330, 392, 523, 392, 330];
    for (let t = 0, i = 0; t < dur * 0.9; t += 0.13, i++) tone(bus, 'square', run[i % run.length] * (i % 12 < 6 ? 1 : 1.122), t0 + t, 0.1, 0.045);
    tone(bus, 'sine', 300, t0 + dur * 0.9, dur * 0.1, 0.15, 1800);
  }
  function sndEpic(bus, t0, dur) {
    voice(bus, { f: 55, when: t0, len: dur, vol: 0.22 });
    voice(bus, { type: 'sawtooth', f: 82.4, when: t0, len: dur, vol: 0.08, lp: 400 });
    [146.8, 174.6, 220, 293.7, 440].forEach((f) =>
      voice(bus, { type: 'sawtooth', f, when: t0, len: dur, vol: 0.015, vol2: 0.09, lp: 1100, trem: 5, tremDepth: 0.25 }));
    for (let t = 0; t < dur - 0.5; t += 1.15) timp(bus, t0 + t, 0.2 + 0.35 * (t / dur));
    voice(bus, { type: 'sawtooth', f: 293.7, f2: 587.3, when: t0 + dur - 1.6, len: 1.6, vol: 0.05, vol2: 0.16 });
    timp(bus, t0 + dur, 0.6);
  }
  function sndOverload(bus, t0, dur) {
    for (let t = 0; t < dur; t += 0.5) {
      tone(bus, 'sine', 600, t0 + t, 0.25, 0.09, 1000);
      tone(bus, 'sine', 1000, t0 + t + 0.25, 0.25, 0.09, 600);
    }
    for (let t = 0; t < dur; t += 0.25) tone(bus, 'square', 1400, t0 + t, 0.08, 0.05);
    voice(bus, { type: 'sawtooth', f: 100, f2: 1400, when: t0, len: dur, vol: 0.03, vol2: 0.08 });
    for (let i = 0; i < 30; i++) noiseHit(bus, t0 + rand(0, dur), 'bandpass', rand(500, 5000), 3, 0.2, 0.08);
  }

  const FINALES = [
    { cls: 'finale-loopy', dur: 7600, sound: sndLoopy,
      path: (p, a, b) => a + (b - a) * p + TAU * 4 * Math.sin(p * Math.PI * 3) * (1 - p),
      lines: [['🥁 THE FINAL SPIN! 🥁', 'One name. Infinite drama.'], ['WHO COULD IT POSSIBLY BE?!', 'Honestly, no idea.'], ['THE SUSPENSE IS UNBEARABLE!', 'Calculating odds…'], ["IT'S ANYONE'S GAME!", "(it is not anyone's game)"], ['HERE IT COMES…', 'Odds: 100.000%']] },
    { cls: 'finale-rogue', dur: 8400, sound: sndRogue,
      path: (p, a, b) => a + (b + TAU * 12 - a) * (1 - Math.pow(1 - p, 3)),
      lines: [["IT'S GONE ROGUE!", 'somebody catch it'], ['THE WHEEL IS LOOSE!', 'do not make eye contact'], ['SECURITY!!', "there's a wheel on the loose"], ["OK, IT'S COMING BACK", 'phew']] },
    { cls: 'finale-epic', dur: 9500, sound: sndEpic,
      path: (p, a, b) => a + (b - a) * (p * p * (3 - 2 * p)),
      lines: [['IN A WORLD…', '…with only one name left'], ['ONE WHEEL.', 'one slice.'], ['ONE DESTINY.', '(literally just the one)'], ['THIS SEMESTER…', 'the odds are 100%'], ['COMING SOON', 'right now, actually']] },
    { cls: 'finale-overload', dur: 7800, sound: sndOverload,
      path: (p, a, b) => a + (b - a) * p - TAU * 9 * Math.sin(Math.PI * p) * (1 - p),
      lines: [['⚠️ SYSTEM OVERLOAD ⚠️', 'too much suspense detected'], ['WHEEL.EXE HAS STOPPED CARING', 'rebooting destiny…'], ['DIVIDING BY ONE…', 'result: 1'], ['ERROR 100%', 'certainty levels critical']] },
  ];
  const FINALE_REVEALS = [
    ['WHAT ARE THE ODDS?!', 'They were 100%. Last but NOT least! 🏆'],
    ['NOBODY SAW THAT COMING!', 'Everybody saw that coming. 🏆'],
    ['SAVED THE BEST FOR LAST!', 'The wheel had no other choice. 🏆'],
    ['A STUNNING UPSET!', 'Against zero opponents. 🏆'],
  ];

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
  let restorePanel = false;

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
      // empty wheel: faint pinwheel so it still looks alive
      for (let i = 0; i < 10; i++) {
        ctx.beginPath(); ctx.moveTo(0, 0);
        ctx.arc(0, 0, R, i * TAU / 10, (i + 1) * TAU / 10);
        ctx.closePath();
        ctx.fillStyle = i % 2 ? '#00338D' : '#0a44b0'; ctx.fill();
      }
    } else {
      const seg = TAU / n;
      const fs = Math.min(R * 0.15, R * seg * 0.42);
      ctx.font = `700 ${fs}px Fredoka, system-ui, sans-serif`;
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      for (let i = 0; i < n; i++) {
        const col = PALETTE[i % PALETTE.length];
        ctx.beginPath(); ctx.moveTo(0, 0);
        ctx.arc(0, 0, R, i * seg, (i + 1) * seg);
        ctx.closePath();
        ctx.fillStyle = col; ctx.fill();
        if (n > 1) { ctx.lineWidth = 2; ctx.strokeStyle = '#0B1B4D'; ctx.stroke(); }
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
      ctx.fillText(done.size ? 'Everyone presented! 🎉' : 'Who is presenting today?', 0, -R * 0.55);
      ctx.fillText('Tick some names to load me', 0, R * 0.55);
    }

    // chasing marquee bulbs on the rim
    const bulbs = 30, phase = Math.floor(ts / (spin ? 70 : 260));
    for (let i = 0; i < bulbs; i++) {
      const a = (i / bulbs) * TAU, on = (i + phase) % 2 === 0;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * (c - rim / 2), Math.sin(a) * (c - rim / 2), rim * 0.28, 0, TAU);
      ctx.fillStyle = on ? BULBS[(i + phase) % BULBS.length] : '#4a3a6a';
      ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = on ? rim * 0.6 : 0;
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // ---------- suspense banner ----------
  function showBanner(big, small) {
    $('bannerBig').textContent = big;
    $('bannerVs').textContent = small || '';
    $('banner').hidden = false;
  }
  function hideBanner() {
    clearInterval(bannerTimer); bannerTimer = null;
    $('banner').hidden = true;
  }

  // ---------- spinning ----------
  const SUSPENSE_ODDS = 1 / 3;
  const smooth = (x) => x * x * (3 - 2 * x);
  // How the wheel covers its last stretch. q and the result both run 0..1;
  // s0 is the slope at q=0, used to hand over from the main spin without a jolt.
  const CRAWLS = [
    { s0: 2, f: (q) => 1 - (1 - q) * (1 - q) },                                              // one long agonising glide
    { s0: 2, f: (q) => 1 - (1 - q) * (1 - q) + 0.06 * Math.sin(TAU * 4 * q) * q * (1 - q) }, // lurching, peg by peg
    { s0: 1.64 / 0.55, f: (q) => (q < 0.55 ? 0.82 * (1 - Math.pow(1 - q / 0.55, 2)) : q < 0.72 ? 0.82 : 0.82 + 0.18 * smooth((q - 0.72) / 0.28)) }, // stops... then finds a second wind
  ];
  const SUS_LOOKS = ['sus-zoom', 'sus-spot', 'sus-shake'];

  function startSpin() {
    if (spin || modalOpen) return;
    let names = active();
    if (!names.length) {
      setPanelHidden(false);
      panel.classList.remove('nudge'); void panel.offsetWidth; panel.classList.add('nudge');
      return;
    }
    // Dev page: the queued behaviour decides the kind of spin (0 normal, 1-3 suspense, 4-7 final spin).
    const kind = DEV ? devTakeKind() : -1;
    if (kind >= 4) names = [pick(names)]; // preview a final spin without emptying the wheel
    const n = names.length;
    audio();
    lastIdx = null;
    list.disabled = true;
    const t0 = performance.now();

    if (DEV ? kind >= 4 : n === 1) {
      // The grand finale: maximum suspense for a 100% certain outcome.
      const fin = FINALES[DEV ? kind - 4 : dealFrom('finale', FINALES.length)];
      rot = ((rot % TAU) + TAU) % TAU;
      spin = { phase: 'spin', finale: fin, t0, dur: fin.dur, from: rot, to: Math.PI + TAU, names, winner: 0 };
      restorePanel = !body.classList.contains('panel-hidden');
      setPanelHidden(true);
      wrap.style.setProperty('--fdur', fin.dur + 'ms');
      body.classList.add('finale', fin.cls);
      let i = 0;
      showBanner(...fin.lines[0]);
      bannerTimer = setInterval(() => { i = Math.min(i + 1, fin.lines.length - 1); showBanner(...fin.lines[i]); }, fin.dur / fin.lines.length);
      if (ac) { moodBus = newBus(); fin.sound(moodBus, ac.currentTime + 0.02, fin.dur / 1000); crash(moodBus, ac.currentTime + fin.dur / 1000); }
      devShow();
      return;
    }

    const seg = TAU / n;
    const winner = Math.floor(Math.random() * n);
    const turns = TAU * (6 + Math.floor(Math.random() * 4));
    // The pointer sits at angle 0 (right side). As the wheel turns, the pointer's
    // position inside a slice runs from 1 (just entered) down to 0 (about to leave).
    if (DEV ? kind >= 1 : Math.random() < SUSPENSE_ODDS) {
      // Suspense spin: the wheel crawls up to a peg and either just tips over it or just doesn't.
      const d = Math.min(rand(0.03, 0.07) * seg, rand(0.02, 0.04));  // how far from the peg it stops
      const tipsOver = DEV ? dealFrom('tips', 2) === 1 : Math.random() < 0.5;
      const base = -(winner + (tipsOver ? 1 - d / seg : d / seg)) * seg;
      const final = base + TAU * Math.ceil((rot - base) / TAU) + turns;
      const crawl = CRAWLS[DEV ? kind - 1 : dealFrom('crawl', CRAWLS.length)];
      const D = Math.max(0.35, Math.min(0.9, seg * rand(0.9, 1.4))); // length of the crawl, in radians
      const T = rand(6000, 8000);                                     // and how long it takes
      const dur = rand(5000, 6500);
      const L = final - D - rot;
      spin = {
        phase: 'spin', t0, dur, from: rot, L, k: (crawl.s0 * D / T) * dur / L,
        sus: { crawl, D, T, start: final - D, rival: names[(winner + (tipsOver ? 1 : -1) + n) % n] },
        final, names, winner,
      };
    } else {
      const base = -(winner + rand(0.15, 0.85)) * seg;
      const final = base + TAU * Math.ceil((rot - base) / TAU) + turns;
      spin = { phase: 'spin', t0, dur: rand(6500, 8500), from: rot, L: final - rot, k: 0, final, names, winner };
    }
    body.classList.add('spinning');
    devShow();
  }

  function beginCrawl() {
    spin.phase = 'crawl';
    spin.t1 = performance.now();
    body.classList.remove('spinning');
    body.classList.add('sus', SUS_LOOKS[dealFrom('look', SUS_LOOKS.length)]);
    showBanner(...SUS_LINES[dealFrom('susline', SUS_LINES.length)]);
    if (ac) { moodBus = newBus(); SUS_MUSIC[dealFrom('music', SUS_MUSIC.length)](moodBus, ac.currentTime + 0.02, spin.sus.T / 1000); }
    else dealFrom('music', SUS_MUSIC.length);
    devShow();
  }

  function finishSpin() {
    const s = spin;
    spin = null;
    rot = s.finale ? s.to : s.final;
    list.disabled = false;
    body.classList.remove('spinning', 'sus', 'finale', ...SUS_LOOKS, ...FINALES.map((f) => f.cls));
    hideBanner();
    fadeBus(moodBus, 0.25); moodBus = null;
    const name = s.names[s.winner];
    if (s.finale) showWinner(name, ...FINALE_REVEALS[dealFrom('finalereveal', FINALE_REVEALS.length)], true);
    else if (s.sus) showWinner(name, pick(CLOSE_HYPE), pick(CLOSE_SUBS)(s.sus.rival));
    else showWinner(name, pick(HYPE), pick(SUBS));
  }

  // ---------- winner modal ----------
  const modal = $('modal'), card = $('card');
  const ENTRANCES = ['', 'in-drop', 'in-slam', 'in-flip'];
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
    card.className = 'card ' + ENTRANCES[dealFrom('entrance', ENTRANCES.length)];
    modal.hidden = false;
    body.classList.add('party');
    // Nothing is focused, so a stray Space/Enter can't dismiss the pop-up.
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    applause(extra ? 12 : 9, dealFrom('fanfare', FANFARES.length));
    const party = PARTIES[dealFrom('party', PARTIES.length)];
    cannon(); party();
    partyTimer = setInterval(party, extra ? 450 : 900);
    rainTimer = setInterval(drop, extra ? 45 : 90);
    devShow();
  }
  function closeWinner(remove) {
    // Only a deliberate click on a pop-up button gets here; ignore accidental double-clicks.
    if (!modalOpen || performance.now() - shownAt < 700) return;
    if (remove && currentWinner) { off.add(currentWinner); done.add(currentWinner); }
    modalOpen = false; currentWinner = null;
    modal.hidden = true;
    body.classList.remove('party');
    clearInterval(partyTimer); clearInterval(rainTimer);
    stopApplause();
    if (restorePanel) { setPanelHidden(false); restorePanel = false; }
    renderList();
  }

  // ---------- confetti ----------
  const cc = $('confetti'), cx = cc.getContext('2d');
  let parts = [];
  function sizeConfetti() { cc.width = innerWidth; cc.height = innerHeight; }
  window.addEventListener('resize', sizeConfetti); sizeConfetti();
  function burst(x, y, n, dir, spread, power, color) {
    for (let i = 0; i < n; i++) {
      const a = dir + rand(-spread, spread), v = rand(0.4, 1) * power;
      parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, w: rand(6, 14), h: rand(4, 9), r: rand(0, TAU), vr: rand(-0.3, 0.3), c: color || pick(CONF), life: rand(140, 240) });
    }
    if (parts.length > 1600) parts.splice(0, parts.length - 1600);
  }
  function cannon() {
    const w = innerWidth, h = innerHeight;
    burst(0, h, 70, -Math.PI / 3, 0.35, 26);
    burst(w, h, 70, -2 * Math.PI / 3, 0.35, 26);
    burst(rand(w * 0.2, w * 0.8), rand(h * 0.15, h * 0.5), 50, 0, Math.PI, 11);
  }
  function fireworks() {
    for (let i = 0; i < 3; i++) burst(rand(innerWidth * 0.1, innerWidth * 0.9), rand(innerHeight * 0.1, innerHeight * 0.55), 60, 0, Math.PI, 13, pick(CONF));
  }
  function shower() {
    for (let i = 0; i < 12; i++) burst(rand(0, innerWidth), -10, 10, Math.PI / 2, 0.5, 6);
  }
  const PARTIES = [cannon, fireworks, shower];
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
          rot = spin.finale.path(p, spin.from, spin.to);
          finished = p >= 1;
        } else {
          // ease out; a suspense spin keeps a little speed (k) to carry into the crawl
          rot = spin.from + spin.L * ((1 - spin.k) * (1 - Math.pow(1 - p, 4)) + spin.k * p);
          if (p >= 1) { if (spin.sus) beginCrawl(); else finished = true; }
        }
      } else {
        const q = Math.min(1, (now - spin.t1) / spin.sus.T);
        rot = Math.max(rot, spin.sus.start + spin.sus.D * spin.sus.crawl.f(q)); // never roll backwards
        finished = q >= 1;
      }
      const idx = spin.finale
        ? Math.floor(rot / (TAU / 12))
        : Math.floor((((-rot) % TAU) + TAU) % TAU / (TAU / spin.names.length));
      if (idx !== lastIdx) {
        if (lastIdx !== null) { tick(spin.phase === 'crawl' ? 760 : 1100); kick = 28; }
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
  $('clapBtn').addEventListener('click', () => { applause(5); PARTIES[dealFrom('party', PARTIES.length)](); });
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

  // ---------- dev review panel ----------
  let devKindSel = null, devNow = null;
  function devTakeKind() {
    for (const k in devLog) delete devLog[k];
    const v = +devKindSel.value;
    devLog.kind = v;
    devKindSel.value = (v + 1) % DEV_LABELS.kind.length; // queue the next behaviour in line
    return v;
  }
  function devShow() {
    if (!DEV) return;
    devNow.textContent = 'Now playing → ' + Object.keys(DEV_LABELS).filter((k) => k in devLog)
      .map((k) => (k === 'kind' ? '' : DEV_TITLES[k] + ': ') + DEV_LABELS[k][devLog[k]]).join('  ·  ');
  }
  if (DEV) {
    const box = document.createElement('div');
    box.id = 'dev';
    box.innerHTML = '<strong>🛠 DEV REVIEW</strong>';
    Object.keys(DEV_LABELS).forEach((key) => {
      const label = document.createElement('label');
      label.textContent = DEV_TITLES[key];
      const sel = document.createElement('select');
      if (key !== 'kind') sel.add(new Option('Auto (next in order)', -1));
      DEV_LABELS[key].forEach((text, i) => sel.add(new Option(text, i)));
      if (key === 'kind') devKindSel = sel;
      else sel.addEventListener('change', () => { devPick[key] = +sel.value; });
      label.append(sel);
      box.append(label);
    });
    devNow = document.createElement('p');
    devNow.textContent = 'Each spin plays the next behaviour in line. Pick one above to jump to it.';
    box.append(devNow);
    body.append(box);
  }

  renderList();
  requestAnimationFrame(frame);
})();
