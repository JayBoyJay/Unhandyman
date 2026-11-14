// Un-Handy Man · Chapter 0 prototype (TV / host side).
(function () {
  let W = 320, H = 180; // native view size; the canvas is scaled up with crisp pixels
  const cv = document.getElementById('game');
  let g = cv.getContext('2d');
  g.imageSmoothingEnabled = false;
  const $ = (id) => document.getElementById(id);

  // ---------- world (isometric tiles: 32x16 top faces) ----------
  // World units are tiles. x runs down-right on screen, y runs down-left.
  // Each map lists its ground, buildings, props and exits; MAP is the one being played.
  const iso = (x, y) => ({ x: (x - y) * 16, y: (x + y) * 8 });
  const TILE_FLIP = { u: true };
  const TILE = { u: 'railway_track', g: 'grass', p: 'grass_petals', d: 'dirt', s: 'soil', v: 'veg_patch', r: 'street', P: 'paving', w: 'water', k: 'dock_planks', f: 'forest_floor', R: 'rice_paddy', T: 'tea_field', b: 'bamboo_grove_floor', t: 'railway_track', S: 'stone_steps' };

  // Home and backyard (Chapter 0)
  const SPOTS = {
    landlord: { x: 13.6, y: 7.4 },
    fenceHole: { x: 19.2, y: 13.1 },
    houseDoor: { x: 6.6, y: 6.6 },
    gate: { x: 11.6, y: 13.9 }
  };
  const ITEM_HOME = {
    bucket: { x: 17.6, y: 10.6 },
    key: { x: 9.2, y: 8.6 },
    persimmon: { x: 15.9, y: 8.4 },
    ball: { x: 11.4, y: 11.6 },
    shoe: { x: 3.6, y: 8.2 }
  };
  const HOME = {
    id: 'home', name: '家と裏庭',
    ground: [
      'ppgggggggggggggggggggp',
      'pgggggggggggggggggggpp',
      'gggggggggggggggggggggp',
      'gggggggggggggggggggggg',
      'gggggggggggggggggggggg',
      'gggggggggggggggggggggg',
      'ggggggdddggggddggggggg',
      'gggggggdddgggddggggggg',
      'gggggggggddddddggggggg',
      'gggggggggggddsvvsggggg',
      'ggpggggggggddsvvsggggg',
      'gpppgggggggddssssggggp',
      'ggpgggggggggddgggggggp',
      'gggggggggggddggggggggg',
      'rrrrrrrrrrrrrrrrrrrrrr',
      'rrrrrrrrrrrrrrrrrrrrrr',
      'gggpggggggggggggggpggg'
    ],
    buildings: [
      { sprite: 'workshop', x: 8, y: 6 },
      { sprite: 'landlord_house', x: 16, y: 6 },
      { sprite: 'tool_shed', x: 20, y: 10 }
    ],
    props: [
      { sprite: 'cherry', x: 2.5, y: 3.5 }, { sprite: 'cherry', x: 11, y: 2.6 }, { sprite: 'cherry', x: 20.5, y: 3.8 },
      { sprite: 'cherry', x: 2.8, y: 11.4 }, { sprite: 'cherry', x: 19.4, y: 16.4 }, { sprite: 'cherry', x: 4.5, y: 16.3 },
      { sprite: 'cherry_young', x: 16.4, y: 8.1 },
      { sprite: 'bush', x: 9.6, y: 5.6 }, { sprite: 'bush', x: 17.2, y: 6.6 }, { sprite: 'bush', x: 1.6, y: 7.6 },
      { sprite: 'bush', x: 7.4, y: 12.8 }, { sprite: 'bush', x: 21.2, y: 12.6 },
      { sprite: 'washing_line', x: 18.9, y: 8.6, solid: true },
      { sprite: 'veg_crate', x: 13.2, y: 11.9 },
      { sprite: 'dog_bed', x: 8.6, y: 7.2 },
      { sprite: 'lamp', x: 13.1, y: 13.4 }
    ],
    fence: { y: 13.55, gap: [10.6, 12.6] },
    npcs: [{ id: 'hana', sprite: 'landlord', x: SPOTS.landlord.x, y: SPOTS.landlord.y }],
    // walking off the west end of the street leads to the back lane once Chapter 0 is done
    exits: [{ side: 'w', y0: 13.6, y1: 16.4, to: 'lane', at: { x: 28.6, y: 4.9 }, need: 'ch0done', locked: 'まだ 行けない… (finish Chapter 0 first)' }],
    start: { x: 7.6, y: 8.4 }
  };

  // 裏道 Back lane: home -> town square
  const LANE_HOUSES = [
    { n: 1, name: 'tanaka', sprite: 'landlord_house', x: 9, y: 3.4 },
    { n: 2, name: 'suzuki', sprite: 'workshop', x: 15, y: 3.4 },
    { n: 3, name: 'sato', sprite: 'landlord_house', x: 21, y: 3.4 },
    { n: 4, name: 'yamamoto', sprite: 'workshop', x: 27, y: 3.4 },
    { n: 5, name: 'ito', sprite: 'workshop', x: 12, y: 10.4 },
    { n: 6, name: 'kimura', sprite: 'landlord_house', x: 23, y: 10.4 }
  ];
  // where the dog drops the post: on the road side of each house
  LANE_HOUSES.forEach((h) => { h.door = h.y < 5 ? { x: h.x - 1.6, y: 4.05 } : { x: h.x - 1.6, y: 6.2 }; });
  const LANE = {
    id: 'lane', name: '裏道',
    ground: [
      'PPPggpgggggggggggggggggggggpgg',
      'PPPgggggggggggggggggggggggggpg',
      'PPPggssssgggggggggggggggggggpp',
      'PPPggssssggggggggggggggggggggg',
      'PPPrrrrrrrrrrrrrrrrrrrrrrrrrrr',
      'PPPrrrrrrrrrrrrrrrrrrrrrrrrrrr',
      'PPPggggggggggggggggggggggggggg',
      'PPPgggggvvvvggggggggggggggggpg',
      'PPPgggggvvvvgggggggggggggggggg',
      'PPPggggggggggggggggggggggggggg',
      'PPPgggpggggggggggggggggggggpgg'
    ],
    buildings: LANE_HOUSES.map((h) => ({ sprite: h.sprite, x: h.x, y: h.y, plate: h.n })),
    props: [
      { sprite: 'honesty_stall', x: 5.2, y: 3.75 },
      { sprite: 'postbox', x: 11.2, y: 6.3 },
      { sprite: 'bus_stop', x: 17.4, y: 6.4 },
      { sprite: 'power_pole', x: 8, y: 6.5 }, { sprite: 'power_pole', x: 20, y: 6.5 }, { sprite: 'power_pole', x: 13, y: 3.7 },
      { sprite: 'mini_truck', x: 25.5, y: 6.7 },
      { sprite: 'scarecrow', x: 10, y: 8.2 },
      { sprite: 'straw', x: 13.2, y: 8.6 }, { sprite: 'straw', x: 14, y: 9 },
      { sprite: 'crow', x: 9.4, y: 8.9 },
      { sprite: 'tanuki', x: 3.6, y: 3.3 },
      { sprite: 'cherry', x: 4.5, y: 1.2 }, { sprite: 'cherry', x: 18, y: 9.8 }, { sprite: 'cherry', x: 28.8, y: 1.6 },
      { sprite: 'bush', x: 16.5, y: 1.2 }, { sprite: 'bush', x: 26, y: 9.4 }, { sprite: 'bush', x: 6.5, y: 10 },
      { sprite: 'lamp', x: 2.6, y: 6.3 }
    ],
    npcs: [{ id: 'yamada', sprite: 'yamada', x: 18.3, y: 6.5 }],
    exits: [
      { side: 'e', y0: 3.6, y1: 6.4, to: 'home', at: { x: 0.9, y: 14.8 } },
      { side: 'w', y0: 3.6, y1: 6.4, to: 'square', at: { x: 22.6, y: 8.9 }, need: 'ch0done' }
    ],
    start: { x: 28.4, y: 4.9 }
  };
  const MAPS = Object.assign({ home: HOME, lane: LANE }, window.MAP_DEFS || {});

  let MAP, MW, MH, BLOCK;
  function footprint(b) { const m = ATLAS[b.sprite]; return { x0: b.x - m[6], y0: b.y - m[7], x1: b.x, y1: b.y }; }
  function buildBlock(map) {
    const set = new Set();
    const rect = (x0, y0, x1, y1) => { for (let x = Math.floor(x0); x < Math.ceil(x1); x++) for (let y = Math.floor(y0); y < Math.ceil(y1); y++) set.add(x + ',' + y); };
    map.buildings.forEach((b) => { const f = footprint(b); rect(f.x0 + 0.1, f.y0 + 0.1, f.x1 - 0.1, f.y1 - 0.1); });
    const SOLID = /cherry|stall|truck|bus_stop|postbox|fountain|cedar|willow|bamboo|well|lantern|stage|board|train|statue|rocks|vending|table|wall|shrine|bench|cliff|gate|log|pole|scarecrow|washing/;
    map.props.filter((p) => p.solid === true || (p.solid !== false && SOLID.test(p.sprite))).forEach((p) => {
      const r = p.r || 0;
      rect(p.x - 0.3 - r, p.y - 0.3 - r, p.x - 0.3 + r + 0.01, p.y - 0.3 + r + 0.01);
    });
    // NPCs stand still, so they block too
    (map.npcs || []).forEach((n) => set.add(Math.floor(n.x - 0.2) + ',' + Math.floor(n.y - 0.2)));
    return set;
  }
  function useMap(id) {
    MAP = MAPS[id]; MW = MAP.ground[0].length; MH = MAP.ground.length; BLOCK = MAP.block || (MAP.block = buildBlock(MAP));
    // fence segments (the sprite runs along +x, 2 tiles long)
    if (MAP.fence && !MAP.fences) {
      MAP.fences = [];
      for (let x = 0; x < MW; x += 2) if (x + 2 <= MAP.fence.gap[0] + 0.2 || x >= MAP.fence.gap[1] - 0.2) MAP.fences.push({ x: x + 2, y: MAP.fence.y });
    }
  }
  useMap('home');
  function walkable(x, y) {
    if (x < 0.3 || y < 0.3 || x > MW - 0.3 || y > MH - 0.3) return false;
    if (BLOCK.has(Math.floor(x) + ',' + Math.floor(y))) return false;
    const row = MAP.ground[Math.floor(y)];
    if (row && row[Math.floor(x)] === 'w') return false;
    const f = MAP.fence;
    if (f && Math.abs(y - f.y) < 0.25 && !(x > f.gap[0] && x < f.gap[1])) return false;
    return true;
  }
  // Walking off an edge: returns the exit used, if any.
  function exitAt(x, y) {
    const side = x < 0.3 ? 'w' : x > MW - 0.3 ? 'e' : y < 0.3 ? 'n' : y > MH - 0.3 ? 's' : null;
    if (!side) return null;
    return (MAP.exits || []).find((e) => e.side === side && (side === 'n' || side === 's' ? x >= e.x0 && x <= e.x1 : y >= e.y0 && y <= e.y1)) || null;
  }

  const S = {
    phase: 'title', t: 0, night: 0, nightTarget: 0,
    hero: { x: 7.6, y: 8.4, dir: 'down', walk: 0, moving: false },
    dog: { x: 8.4, y: 9.0, face: 1, state: 'follow', tx: 0, ty: 0, carry: null, then: null, timer: 0, anim: 0, mood: null, moodT: 0 },
    items: Object.keys(ITEM_HOME).map((id) => ({ id, x: ITEM_HOME[id].x, y: ITEM_HOME[id].y, held: false, glow: false })),
    zombies: [], wave: 0, barricade: 3,
    misses: 0, hole: 0, cur: null, harvest: null, laundry: null, ready: false,
    timers: [], input: { x: 0, y: 0 }, keys: {},
    cam: { x: 0, y: 0 },
    lastLine: null, chatLog: []
  };

  const WAVES = [
    [{ hat: { color: 'red' } }, { glasses: {} }],
    [{ hat: { color: 'red' } }, { hat: { color: 'blue' } }, { umbrella: { color: 'yellow' } }],
    [{ hat: { color: 'red' }, glasses: {} }, { hat: { color: 'red' } }, { hat: { color: 'blue' }, size: 'big' }]
  ];
  const WAVE_HINTS = ['めがねの！ / あかい ぼうしの！', 'あおい ぼうしの！ / きいろい かさの！', 'あかい ぼうしの めがねの！ / おおきいの！'];

  function after(sec, fn) { S.timers.push({ at: S.t + sec, fn }); }

  // ---------- speech out ----------
  let jaVoice = null;
  function pickVoice() {
    try { jaVoice = speechSynthesis.getVoices().find((v) => /^ja/i.test(v.lang)) || null; } catch (_) {}
  }
  if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  function speak(text, rate) {
    if (!('speechSynthesis' in window)) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ja-JP'; if (jaVoice) u.voice = jaVoice; u.rate = rate || 1;
      speechSynthesis.speak(u);
    } catch (_) {}
  }

  const NAMES = { landlord: 'ハナさん', radio: 'ラジオ', dog: 'いぬ', you: 'あなた', phone: 'ハナさん · 電話', yamada: '山田さん', crow: 'カラス', house: 'いえの 人' };
  function say(who, text, opts) {
    opts = opts || {};
    $('who').textContent = NAMES[who] || who;
    $('line').textContent = text;
    $('caption').classList.toggle('radio', who === 'radio');
    if (!opts.quiet) speak(text, who === 'radio' ? 1.1 : 1);
    if (!opts.noRepeat) S.lastLine = { who, text };
    if (!opts.quiet && who !== 'you') Words.wordsIn(text).forEach((w) => Save.word(w, 'heard'));
    const name = NAMES[who] || who, th = who === 'phone' ? NAMES.landlord : name;
    logLine({ th, who: name, text, day: SV().day });
    if (who !== 'dog' && who !== 'you') S.lastTh = { th, t: S.t };
    net.broadcast({ t: 'line', who: name, th, text, day: SV().day });
  }
  function replay(slow) {
    if (!S.lastLine) return;
    $('who').textContent = NAMES[S.lastLine.who] || S.lastLine.who;
    $('line').textContent = S.lastLine.text;
    speak(S.lastLine.text, slow ? 0.65 : 1);
  }
  function hint(text) { $('hint').textContent = text || ''; $('hint').hidden = !text; }
  function miss(hintText) {
    S.misses++;
    if (S.misses >= 2 && hintText) hint(hintText);
  }
  function success() { S.misses = 0; hint(''); }

  const TO_DOG = { fetch: 1, dig: 1, sit: 1, wait: 1, come: 1, dogname: 1, item: 1, describe: 1 };
  function heard(text, label, ok, type) {
    $('heard').textContent = text ? '「' + text + '」' : '';
    $('heard').className = ok ? 'ok' : 'no';
    net.broadcast({ t: 'heard', text, label, ok });
    // understood lines go into the message thread of whoever spoke last (or the dog's)
    if (ok && text) {
      const th = !TO_DOG[type] && S.lastTh && S.t - S.lastTh.t < 20 ? S.lastTh.th : NAMES.dog;
      const m = { th, who: NAMES.you, me: true, text, day: SV().day };
      logLine(m); net.broadcast(Object.assign({ t: 'said' }, m));
    }
  }
  // Message history for the phone's メッセージ app (kept for this session).
  S.log = [];
  function logLine(m) {
    const l = S.log[S.log.length - 1];
    if (l && l.th === m.th && l.text === m.text) return;
    S.log.push(m); if (S.log.length > 200) S.log.shift();
  }

  // ---------- dog ----------
  const dog = S.dog;
  function dogMood(m, sec) { dog.mood = m; dog.moodT = sec || 1.4; }
  function dogGo(x, y, then) { dog.state = 'go'; dog.tx = x; dog.ty = y; dog.then = then; }
  function dogBusy() { return dog.state === 'go' || dog.state === 'dig' || dog.state === 'harvest'; }
  function sendDogStatus() { net.broadcast({ t: 'dog', busy: dogBusy(), carry: dog.carry }); }

  function dogFetch(itemId, deliverTo) {
    const it = S.items.find((i) => i.id === itemId);
    if (!it || it.held) { dogMood('?'); return; }
    dogGo(it.x, it.y + 0.3, () => {
      it.held = true; dog.carry = itemId;
      const to = deliverTo();
      dogGo(to.x, to.y, () => {
        const id = dog.carry; dog.carry = null; it.held = false;
        it.x = to.x + 0.3; it.y = to.y + 0.3;
        dog.state = 'follow'; sendDogStatus();
        onDelivered(id, it);
      });
    });
    sendDogStatus();
  }

  // ---------- jobs ----------
  const SV = () => Save.data;
  const board = () => SV().board;
  const VEG_SPOT = { x: 14.3, y: 10.7 }, BASKET = { x: 17.6, y: 9.8 }, LINE = { x: 18.9, y: 8.6 };
  const VEGS = ['tomato', 'carrot', 'daikon'], CLOTH = ['shirt', 'towel', 'sock'];
  const JP = Jobs.JP, COUNTER = Jobs.COUNTER;

  function hintFor(j) {
    if (!j) return '';
    if (j.kind === 'fetch') return 'いぬ、' + JP[j.params.item] + 'を もってきて';
    if (j.kind === 'harvest') return S.harvest && S.harvest.digging ? 'まって！' : JP[j.params.veg] + 'を ' + COUNTER[j.params.n] + ' ほって';
    if (j.kind === 'laundry') { const p = S.laundry && S.laundry.pieces.find((x) => x.state === 'fly'); return p ? JP[p.color] + ' ' + JP[p.type] + '、もってきて' : ''; }
    return '';
  }

  function syncBoard() { renderBoard(); broadcastBoard(); updateHud(); Save.save(); }

  function takeJob(id) {
    if (S.phase !== 'day') { toast('Jobs open in the daytime'); return; }
    const why = Jobs.take(board(), id);
    if (why === 'full') toast('You can take up to 3 jobs at once');
    syncBoard();
    if (!S.cur) after(0.4, startNextJob);
  }
  function dropJob(id) {
    if (S.cur && S.cur.id === id) clearCurrent();
    Jobs.drop(board(), id); syncBoard();
    if (!S.cur) after(0.4, startNextJob);
  }
  function startNextJob() {
    if (S.cur || S.phase !== 'day') return;
    const next = Jobs.taken(board())[0];
    if (!next) { updateHud(); return; }
    S.cur = next; next.misses = 0; S.misses = 0; hint('');
    if ((next.map || 'home') !== MAP.id) {
      next.waiting = true;
      toast(next.en + ': go to ' + Jobs.MAP_NAME[next.map] + (next.map === 'lane' ? ' (west along the street)' : ''));
      syncBoard(); return;
    }
    beginJob(next);
  }
  function beginJob(next) {
    next.waiting = false;
    if (next.speaker === 'phone') { net.broadcast({ t: 'buzz' }); toast('でんわ · ハナさん'); }
    say(next.speaker || 'landlord', next.brief);
    if (next.kind === 'post') startPost(next);
    if (next.kind === 'stall') startStall(next);
    if (next.kind === 'bus') startBus(next);
    if (next.kind === 'fetch') S.items.forEach((i) => (i.glow = i.id === next.params.item));
    if (next.kind === 'harvest') S.harvest = { count: 0, digging: false, target: null, wrongVeg: null, pile: [], next: 0 };
    if (next.kind === 'laundry') startLaundry(next);
    syncBoard();
  }
  function clearCurrent() {
    S.items.forEach((i) => (i.glow = false));
    S.harvest = null; S.laundry = null; S.post = null; S.stall = null; S.bus = null; S.cur = null; hideCard();
    if (dog.state === 'harvest' || dog.chase) { dog.state = 'follow'; dog.chase = null; }
  }
  function finishJob(stars, line) {
    const j = S.cur; if (!j) return;
    stars = Math.max(1, Math.min(3, stars));
    j.state = 'done'; j.stars = stars;
    const pay = Jobs.payout(j, stars);
    SV().yen += pay.yen; SV().treats += pay.treats;
    SV().stats.jobsDone++; SV().stats.starsEarned += stars;
    const up = Save.friend(j.client, stars * 2);
    Save.skill('job:' + j.kind);
    say('landlord', line);
    toast(j.en + '  ' + '★'.repeat(stars) + '☆'.repeat(3 - stars) + '  +¥' + pay.yen + (pay.treats ? '  +おやつ ' + pay.treats : ''));
    if (up) after(2.6, () => toast(Jobs.NPC[j.client] + 'と なかよし ★' + up));
    clearCurrent(); syncBoard();
    after(3, afterJob);
  }
  function afterJob() {
    if (S.phase !== 'day' || S.cur) return;
    const done = Jobs.doneCount(board());
    if (!SV().story.night0 && done >= 3) return dusk();
    if (done >= 3 || !board().jobs.some((j) => j.state !== 'done')) return evening();
    if (Jobs.taken(board()).length) return startNextJob();
    say('landlord', 'ほかの しごとも ある よ。');
    hint('Take a job on your phone (しごと) or press J');
  }
  function evening() {
    S.phase = 'evening'; S.nightTarget = 0.45;
    say('landlord', 'おつかれさま！ きょうは おしまい。おやすみ！');
    after(5, () => { if (S.phase === 'evening') hint('おやすみ'); });
    syncBoard();
  }
  function nextDay() {
    S.phase = 'sleeping'; hint(''); $('end').hidden = true;
    S.nightTarget = 1;
    SV().day++; SV().freeTreats = 3; SV().board = Jobs.makeBoard(SV().day, { lane: SV().story.ch0done });
    S.items.forEach((i) => { i.hidden = false; i.held = false; i.x = ITEM_HOME[i.id].x; i.y = ITEM_HOME[i.id].y; });
    S.hole = 0; S.barricade = 3;
    Save.save(true);
    after(2.2, () => {
      S.nightTarget = 0; S.phase = 'day';
      say('landlord', 'おはよう！ きょうの しごと だよ。');
      syncBoard(); showBoard(true);
    });
  }

  // fetch jobs
  function onDelivered(id, it) {
    const putBack = () => after(1.5, () => { it.x = ITEM_HOME[id].x; it.y = ITEM_HOME[id].y; });
    const j = S.cur;
    if (S.phase !== 'day' || !j || j.kind !== 'fetch') { putBack(); return; }
    const want = j.params.item;
    if (id === want) {
      success(); dogMood('♪', 1.8); it.hidden = true;
      after(4, () => { it.hidden = false; it.x = ITEM_HOME[id].x; it.y = ITEM_HOME[id].y; });
      finishJob(3 - j.misses, 'ありがとう！');
    } else if (id === 'persimmon' && want === 'key') {
      say('landlord', 'それは かき！ かぎ だよ。');
      j.misses++; miss(hintFor(j)); putBack();
    } else {
      say('landlord', 'ちがう よ。' + JP[want] + '！');
      j.misses++; miss(hintFor(j)); putBack();
    }
  }

  // harvest jobs: the dog digs one at a time; say まって at the right number, or say the number first
  function harvestDig(r) {
    const H = S.harvest; if (!H || H.digging) { dogMood('…'); return; }
    H.wrongVeg = r.item && VEGS.includes(r.item) && r.item !== S.cur.params.veg ? r.item : null;
    H.target = r.num || null; H.count = 0; H.pile = []; H.digging = true;
    dogGo(VEG_SPOT.x - 0.5, VEG_SPOT.y + 0.4, () => { dog.state = 'harvest'; H.next = 0.5; });
  }
  function stopHarvest() {
    const H = S.harvest; if (!H || !H.digging) return;
    H.digging = false; dog.state = 'follow';
    after(1, judgeHarvest);
  }
  function judgeHarvest() {
    const j = S.cur, H = S.harvest; if (!j || !H) return;
    if (H.wrongVeg) {
      say('landlord', 'それは ' + JP[H.wrongVeg] + '！ ' + JP[j.params.veg] + ' だよ。');
      j.misses++; miss(hintFor(j)); H.pile = []; H.wrongVeg = null; return;
    }
    const n = j.params.n, diff = Math.abs(H.count - n);
    if (H.count === 0) { say('landlord', 'ほって！'); return; }
    const line = diff === 0 ? 'ぴったり ' + COUNTER[n] + '！ ありがとう！' : H.count > n ? 'おおい ね… でも ありがとう。' : 'すこし たりない… でも ありがとう。';
    if (diff === 0) dogMood('♪', 1.8);
    finishJob((diff === 0 ? 3 : diff === 1 ? 2 : 1) - (j.misses ? 1 : 0), line);
  }

  // laundry jobs: washing blows off the line towards the street; name each piece so the dog catches it
  function startLaundry(j) {
    S.laundry = {
      pieces: j.params.pieces.map((p, i) => ({
        ...p, x: LINE.x - 0.4 + i * 0.25, y: LINE.y + 0.1, state: 'wait', at: S.t + 2 + i * 3.4,
        tx: 4 + Math.random() * 13, sway: Math.random() * 6
      }))
    };
  }
  function laundryFetch(r) {
    const L = S.laundry; if (!L) return false;
    if (!(r.item && CLOTH.includes(r.item)) && !r.colors.length) return false;
    if (dogBusy()) { dogMood('…'); return true; }
    let c = L.pieces.filter((p) => p.state === 'fly' || p.state === 'wait');
    if (r.item && CLOTH.includes(r.item)) c = c.filter((p) => p.type === r.item);
    if (r.colors.length) c = c.filter((p) => r.colors.includes(p.color));
    const flying = c.filter((p) => p.state === 'fly');
    if (flying.length === 1) {
      const p = flying[0];
      dog.chase = p; dog.state = 'go'; dog.tx = p.x; dog.ty = p.y;
      dog.then = () => {
        p.state = 'carried';
        dogGo(BASKET.x - 0.4, BASKET.y + 0.4, () => { p.state = 'saved'; dog.state = 'follow'; dogMood('♪', 1); checkLaundry(); });
      };
      success();
      return true;
    }
    dogMood('?', 1.4);
    if (flying.length > 1) say('landlord', 'どれ？ なにいろ？', { noRepeat: true });
    S.cur.misses++; miss(hintFor(S.cur));
    return false;
  }
  function checkLaundry() {
    const L = S.laundry; if (!L) return;
    if (L.pieces.some((p) => p.state !== 'saved' && p.state !== 'lost')) return;
    const lost = L.pieces.filter((p) => p.state === 'lost').length;
    finishJob(lost === 0 ? 3 : lost === 1 ? 2 : 1, lost === 0 ? 'ぜんぶ ある！ ありがとう！' : 'ありがとう。 ' + lost + 'まい なくなった けど…');
  }
  function updateLaundry(dt) {
    const L = S.laundry; if (!L) return;
    for (const p of L.pieces) {
      p.sway += dt * 3;
      if (p.state === 'wait' && S.t >= p.at) p.state = 'fly';
      if (p.state === 'fly') {
        const dx = p.tx - p.x, dy = 15 - p.y, d = Math.hypot(dx, dy) || 1;
        p.x += (dx / d) * 0.42 * dt + Math.sin(p.sway) * 0.25 * dt; p.y += (dy / d) * 0.42 * dt;
        if (p.y >= 14.4) { p.state = 'lost'; say('landlord', 'あー！ とんで いった…', { noRepeat: true }); if (dog.chase === p) { dog.chase = null; dog.state = 'follow'; } checkLaundry(); }
      }
      if (p.state === 'carried') { p.x = dog.x; p.y = dog.y; }
    }
  }

  // ---------- moving between maps ----------
  let lockedT = 0;
  function tryExit(ex) {
    const open = ex.to && (!ex.need || SV().story[ex.need] || SV().explore);
    if (!open) { if (S.t > lockedT) { toast(ex.locked || 'まだ 行けない'); lockedT = S.t + 3; } return; }
    if (dogBusy()) { if (S.t > lockedT) { toast('いぬを まって · the dog is busy'); lockedT = S.t + 2; } return; }
    changeMap(ex.to, ex.at);
  }
  function changeMap(id, at) {
    useMap(id);
    S.hero.x = at.x; S.hero.y = at.y;
    dog.x = at.x + 0.5; dog.y = at.y + 0.5; dog.state = 'follow'; dog.then = null; dog.chase = null;
    S.fade = 1; updateCamera(0, true);
    toast(MAP.name);
    if (S.cur && S.cur.waiting && (S.cur.map || 'home') === MAP.id) after(0.9, () => S.cur && beginJob(S.cur));
  }

  // Saying hello near someone gets a hello back (each NPC has one line for now).
  function talkToNearby() {
    let best = null, bd = 2.6;
    for (const n of MAP.npcs || []) {
      if (!n.hello) continue;
      const d = Math.hypot(n.x - S.hero.x, n.y - S.hero.y);
      if (d < bd) { bd = d; best = n; }
    }
    if (!best) return false;
    say(best.name, best.hello);
    best.bubble = '♪'; best.bubbleT = S.t + 1.5;
    if (best.id) Save.friend(best.id, 1);
    return true;
  }

  // ---------- task card (the letter, the price sign, the timetable) ----------
  function showCard(html) { $('taskcard').innerHTML = html; $('taskcard').hidden = false; }
  function hideCard() { $('taskcard').hidden = true; }
  const houseByN = (n) => LANE_HOUSES.find((h) => h.n === n);
  const houseByName = (nm) => LANE_HOUSES.find((h) => h.name === nm);

  // Post round: read each letter out (name and/or house number); the dog delivers it.
  function startPost(j) { S.post = { i: 0, busy: false }; postCard(); }
  function postCard() {
    const P = S.post, L = S.cur.params.letters[P.i];
    showCard('<div class="cardlabel">てがみ ' + (P.i + 1) + '/' + S.cur.params.letters.length + '</div><div class="letter"><ruby>' + L.jp + '<rt>' + L.kana + '</rt></ruby> さま<br><span class="big">' + L.n + 'ばん</span></div>');
  }
  function postDeliver(r) {
    const P = S.post; if (!P) return false;
    if (P.busy || dogBusy()) { dogMood('…'); return true; }
    const L = S.cur.params.letters[P.i];
    const byN = r.num ? houseByN(r.num) : null, byName = r.name ? houseByName(r.name) : null;
    if (!byN && !byName) return false;
    if (byN && byName && byN !== byName) { dogMood('?', 1.4); return true; }
    const target = byN || byName;
    P.busy = true; dog.carry = 'letter';
    dogGo(target.door.x, target.door.y, () => {
      const right = target.n === L.n;
      const resident = { x: target.door.x, y: target.door.y, bubble: right ? 'ありがとう！' : 'ちがうよ！', bubbleT: S.t + 2.4 };
      S.laneBubbles = (S.laneBubbles || []).concat(resident);
      say('house', right ? 'あ、てがみ！ ありがとう。' : 'うちは ' + target.n + 'ばん だよ。 ' + (houseByName(L.name).n) + 'ばん じゃない？', { noRepeat: !right });
      if (right) { dog.carry = null; dogMood('♪', 1.4); }
      else { S.cur.misses++; miss('…' + L.n + 'ばん！'); }
      dogGo(S.hero.x + 0.5, S.hero.y + 0.5, () => {
        dog.state = 'follow'; dog.carry = null; P.busy = false;
        if (!right) return;
        P.i++;
        if (P.i >= S.cur.params.letters.length) finishJob(3 - S.cur.misses, 'てがみ、ぜんぶ とどいた！');
        else postCard();
      });
    });
    success();
    return true;
  }

  // Honesty stall: say the exact price; the dog pays and brings the vegetable.
  const STALL = { x: 5.4, y: 4.4 };
  function startStall(j) {
    S.stall = { busy: false };
    const p = j.params;
    showCard('<div class="cardlabel">無人販売 · honesty stall</div><div class="sign">' + Jobs.JP[p.veg] + '<br><span class="big">' + p.price + 'えん</span></div><div class="cardnote">おかねは はこへ · say how much you pay</div>');
  }
  function stallPay(r) {
    const T = S.stall; if (!T) return false;
    if (T.busy || dogBusy()) { dogMood('…'); return true; }
    if (r.yen === null || r.yen === undefined) return false;
    const want = S.cur.params.price;
    T.busy = true; dog.carry = 'coins';
    dogGo(STALL.x, STALL.y + 0.4, () => {
      dog.carry = null;
      if (r.yen === want) {
        say('crow', 'カー！ ぴったり！'); dog.carry = 'veg:' + S.cur.params.veg;
        dogGo(S.hero.x + 0.5, S.hero.y + 0.5, () => { dog.state = 'follow'; dog.carry = null; T.busy = false; finishJob(3 - S.cur.misses, 'ハナさん: ありがとう！ ' + Jobs.JP[S.cur.params.veg] + '、まってる ね。'); });
      } else {
        say('crow', r.yen < want ? 'カー！ たりない！' : 'カー！ おおすぎ！');
        S.cur.misses++; miss(want + 'えん');
        dogGo(S.hero.x + 0.5, S.hero.y + 0.5, () => { dog.state = 'follow'; T.busy = false; });
      }
    });
    return true;
  }

  // Bus times: 山田さん asks when the next bus is; answer from the timetable.
  function startBus(j) { S.bus = { q: 0 }; busCard(); }
  function busCard() {
    const p = S.cur.params;
    showCard('<div class="cardlabel">バスの時間 · timetable</div><div class="clock">いま ' + Jobs.hhmm(p.now) + '</div><div class="times">' + p.times.map((t) => '<span>' + Jobs.hhmm(t) + '</span>').join('') + '</div>');
  }
  function busAnswer(r) {
    const B = S.bus; if (!B || !r.time) return false;
    const p = S.cur.params, nowM = p.now.h * 60 + p.now.m;
    const upcoming = p.times.filter((t) => t.h * 60 + t.m > nowM);
    const want = upcoming[B.q];
    const h = r.time.h % 12, wh = want.h % 12;
    if (h === wh && r.time.m === want.m) {
      if (B.q === 0) { B.q = 1; success(); say('yamada', 'ありがとう！ …その つぎは？'); }
      else finishJob(3 - S.cur.misses, 'なるほど。 ありがとう！ たすかった。');
    } else {
      S.cur.misses++;
      const said = r.time.h * 60 + r.time.m;
      say('yamada', said <= nowM ? 'え？ それは もう いったよ。' : 'え？ ほんと？ もう一回 みて。', { noRepeat: true });
      miss(Jobs.hhmm(want).replace(':', 'じ') + 'ふん');
    }
    return true;
  }

  function laneDraw(list) {
    if (MAP.id !== 'lane') return;
    (S.laneBubbles || []).forEach((b) => { if (b.bubbleT > S.t) list.push({ k: b.x + b.y + 2, d: () => { const p = scr(b.x, b.y); bubble(p.x, p.y - 14, b.bubble); } }); });
    S.laneBubbles = (S.laneBubbles || []).filter((b) => b.bubbleT > S.t);
  }

  // ---------- phases ----------
  function startGame() {
    if (S.phase !== 'title' || !S.ready) return;
    $('title').hidden = true;
    const st = SV().story;
    if (!st.met) {
      S.phase = 'greet';
      after(0.8, () => say('landlord', 'おはよう！'));
      after(5, () => { if (S.phase === 'greet' && S.misses === 0) hint('おはよう / おはようございます'); });
    } else if (st.night0 && !st.ch0done) {
      after(0.6, morning);
    } else if (Jobs.doneCount(board()) >= 3) {
      S.phase = 'day';
      after(0.6, st.night0 ? evening : dusk);
    } else {
      S.phase = 'day';
      after(0.8, () => { say('landlord', 'おかえり！'); after(2, () => (Jobs.taken(board()).length ? startNextJob() : showBoard(true))); });
    }
    syncBoard();
  }

  function dusk() {
    S.phase = 'dusk'; S.items.forEach((i) => (i.glow = false)); showBoard(false);
    say('landlord', 'よるに なると… ゾンビが くるよ。');
    S.nightTarget = 1;
    after(4.5, () => { S.phase = 'night'; S.wave = 0; startWave(); });
  }

  function startWave() {
    const defs = WAVES[S.wave];
    say('radio', 'ゾンビが きた！');
    hint('');
    S.misses = 0;
    defs.forEach((d, i) => {
      const fromRight = i % 2 === 0;
      const sx = fromRight ? MW + 1 + i * 1.6 : -1 - i * 1.6, sy = 14.4 + (i % 2) * 0.9;
      S.zombies.push({
        x: sx, y: sy, home: { x: sx, y: sy }, speed: 0.7 + Math.random() * 0.25,
        path: [{ x: SPOTS.gate.x, y: sy }, { x: SPOTS.gate.x, y: 12.6 }, { x: 9.2, y: 9 }, { x: SPOTS.houseDoor.x, y: SPOTS.houseDoor.y + 0.4 }],
        hat: d.hat || (d.glasses ? { color: 'purple' } : null), glasses: d.glasses || null, umbrella: d.umbrella || null,
        look: d.glasses ? 'z_glasses' : d.hat ? 'z_hat' : 'z_flower',
        shirt: { color: d.glasses ? 'yellow' : d.hat ? 'blue' : 'pink' }, size: d.size || 'small',
        state: 'walk', bob: Math.random() * 6, face: fromRight ? -1 : 1, onMap: false
      });
    });
    after(14, () => { if (S.phase === 'night' && S.zombies.some((z) => z.state === 'walk')) hint(WAVE_HINTS[S.wave]); });
  }

  function waveCleared() {
    S.wave++;
    if (S.wave < WAVES.length) after(2, startWave);
    else after(2, morning);
  }

  function morning() {
    S.phase = 'morning'; S.nightTarget = 0; hint('');
    SV().story.night0 = true; Save.save(true);
    say('landlord', 'おはよう！ フェンスの 下… 掘って みて！');
    S.misses = 0;
  }

  function finish() {
    S.phase = 'done';
    SV().story.ch0done = true; Save.save(true);
    say('landlord', 'すごい！ 広場に 行ける ね。');
    after(3, () => { $('end').hidden = false; });
  }

  // ---------- understanding what was said ----------
  const LABEL = {
    fetch: 'fetch', dig: 'dig', sit: 'sit', wait: 'wait', come: 'come', greet: 'greeting', thanks: 'thanks',
    repeat: 'say it again', slow: 'slowly', dunno: "I don't understand", describe: 'zombie', item: 'item',
    yes: 'yes', no: 'no', dogname: 'dog', number: 'number', sleep: 'good night', name: 'name', yen: 'price', time: 'time', unknown: '?', none: ''
  };

  async function handleSpeech(alts) {
    const r = Words.parse(alts);
    const text = r.text || (alts && alts[0]) || '';
    let ok = r.type !== 'unknown' && r.type !== 'none';
    if (r.type === 'none') return;
    const J = S.cur;

    switch (r.type) {
      case 'repeat': replay(false); break;
      case 'slow': replay(true); break;
      case 'dunno': replay(true); if (J) hint(hintFor(J)); break;
      case 'sit': if (!dogBusy()) { dog.state = 'sit'; dogMood('…', 1); } break;
      case 'wait':
        if (S.harvest && S.harvest.digging) { stopHarvest(); break; }
        if ((S.post && S.post.busy) || (S.stall && S.stall.busy)) { dogMood('…'); break; }
        dog.state = 'sit'; dog.then = null; dog.chase = null; dog.carry && dropCarry(); break;
      case 'name': if (!postDeliver(r)) { dogMood('?'); ok = false; } break;
      case 'yen': if (!stallPay(r)) { dogMood('?'); ok = false; } break;
      case 'time': if (!busAnswer(r)) { dogMood('?'); ok = false; } break;
      case 'number':
        if (S.post) { postDeliver(r); break; }
        if (J && J.kind === 'harvest' && !S.harvest.digging) harvestDig(r);
        else { dogMood('?'); ok = false; }
        break;
      case 'sleep':
        if (S.phase === 'evening') nextDay();
        else say('landlord', S.phase === 'day' ? 'まだ ひる だよ！' : 'ん？', { noRepeat: true });
        break;
      case 'come': dog.state = 'follow'; dogMood('!', 0.8); break;
      case 'dogname': dogMood('!', 1); break;
      case 'greet':
        if (S.phase !== 'greet' && talkToNearby()) break;
        if (S.phase === 'greet') {
          success(); say('landlord', 'はじめまして。 よろしく ね。');
          SV().story.met = true; S.phase = 'day'; Save.save(true);
          after(2.8, () => { say('landlord', 'しごと、ある よ。 ボードを 見て！'); showBoard(true); hint('Take a job on your phone (しごと) or press J'); });
        } else say('landlord', S.night > 0.5 ? 'こんばんは。' : 'こんにちは！');
        break;
      case 'thanks': say('landlord', 'どういたしまして。'); break;
      case 'fetch':
        if (S.laundry && laundryFetch(r)) break;
        if (S.post && (r.num || r.name) && postDeliver(r)) break;
        if (!r.item || !S.items.some((i) => i.id === r.item)) { ok = false; dogMood('?'); miss(hintFor(J)); break; }
        if (dogBusy()) { dogMood('…'); break; }
        if (S.phase === 'night') { dogMood('?'); break; }
        dogFetch(r.item, () => (J && J.kind === 'fetch' ? { x: SPOTS.landlord.x + 0.2, y: SPOTS.landlord.y + 0.9 } : { x: S.hero.x + 0.5, y: S.hero.y + 0.4 }));
        break;
      case 'item': {
        if (S.laundry && laundryFetch(r)) break;
        if (J && J.kind === 'harvest' && VEGS.includes(r.item)) { dogMood('?'); miss(hintFor(J)); break; }
        const it = S.items.find((i) => i.id === r.item);
        if (it && !dogBusy()) { dogGo(it.x, it.y + 0.3, () => { dog.state = 'follow'; dogMood('?'); }); }
        miss(hintFor(J));
        break;
      }
      case 'describe':
        if (S.laundry && laundryFetch(r)) break;
        ok = attackDescribed(r.desc); break;
      case 'dig':
        if (J && J.kind === 'harvest' && S.phase === 'day') { harvestDig(r); break; }
        if (S.phase === 'morning') {
          success(); dogGo(SPOTS.fenceHole.x - 0.4, SPOTS.fenceHole.y - 0.2, () => { dog.state = 'dig'; dog.timer = 2.4; });
        } else { dogGo(dog.x + 0.2, dog.y, () => { dog.state = 'dig'; dog.timer = 1.2; }); }
        break;
      default: ok = await unknownLine(text);
    }
    heard(text, LABEL[r.type] || '', ok, r.type);
    if (ok) { Words.wordsIn(text).forEach((w) => Save.word(w, 'said')); Save.skill('say:' + r.type); }
    sendDogStatus();
  }

  function dropCarry() {
    const it = S.items.find((i) => i.id === dog.carry);
    if (it) { it.held = false; it.x = dog.x; it.y = dog.y + 0.2; }
    dog.carry = null;
  }

  function attackDescribed(desc) {
    if (S.phase !== 'night') { dogMood('?'); return false; }
    const live = S.zombies.filter((z) => z.state === 'walk' && z.onMap);
    const hits = live.filter((z) => Words.zombieMatches(z, desc));
    if (dogBusy()) { dogMood('…'); return true; }
    if (hits.length === 1) {
      const z = hits[0];
      z.targeted = true;
      dogGo(z.x - 0.3, z.y + 0.3, () => { scare(z); dog.state = 'follow'; dogMood('♪', 1); });
      success();
      return true;
    }
    if (hits.length > 1) {
      dogMood('?', 1.6);
      say('radio', 'どの ゾンビ？', { noRepeat: true });
      miss(WAVE_HINTS[S.wave]);
      return false;
    }
    dogMood('?'); miss(WAVE_HINTS[S.wave]);
    return false;
  }

  function scare(z) {
    if (z.state !== 'walk') return;
    z.state = 'flee'; z.speed = 3.2; z.yelp = 0.9;
  }

  // Off-script lines: ask the AI landlord when it is on, otherwise a puzzled look.
  async function unknownLine(text) {
    const cfg = AI.load();
    if (!cfg.enabled || S.phase === 'night' || S.phase === 'title') {
      dogMood('?'); say('landlord', 'ん？', { noRepeat: true, quiet: true });
      return false;
    }
    say('landlord', 'うーん…', { noRepeat: true });
    S.chatLog.push({ role: 'user', content: text });
    S.chatLog = S.chatLog.slice(-8);
    try {
      const reply = await AI.chat(cfg, LANDLORD_PROMPT, S.chatLog);
      const clean = String(reply || '').replace(/\s*\n\s*/g, ' ').trim().slice(0, 60);
      if (!clean) throw new Error('empty');
      S.chatLog.push({ role: 'assistant', content: clean });
      say('landlord', clean);
      return true;
    } catch (e) {
      console.warn('AI failed', e);
      say('landlord', 'ん？ もう一回？', { noRepeat: true });
      return false;
    }
  }

  const LANDLORD_PROMPT = [
    'You are 大家さん, a kind elderly landlady in a small Japanese town, chatting over the fence with a complete beginner learner of Japanese.',
    'Reply ONLY in very simple casual Japanese: one short sentence, under 20 characters, mostly hiragana. Never use English or romaji.',
    'Use only beginner words: greetings, はい, いいえ, いぬ, バケツ, かぎ, かき, ボール, くつ, colours, 大きい, 小さい, 好き, いい, ね, よ.',
    'If the learner seems confused, rephrase even more simply. Be warm and encouraging.'
  ].join(' ');

  // ---------- update ----------
  function update(dt) {
    S.t += dt;
    const due = S.timers.filter((x) => x.at <= S.t);
    S.timers = S.timers.filter((x) => x.at > S.t);
    due.forEach((x) => x.fn());

    S.night += (S.nightTarget - S.night) * Math.min(1, dt * 0.8);

    // hero: the stick and arrow keys push in screen directions; convert to tile space
    const kx = (S.keys.ArrowRight || S.keys.d ? 1 : 0) - (S.keys.ArrowLeft || S.keys.a ? 1 : 0);
    const ky = (S.keys.ArrowDown || S.keys.s ? 1 : 0) - (S.keys.ArrowUp || S.keys.w ? 1 : 0);
    let ix = kx || S.input.x, iy = ky || S.input.y;
    const h = S.hero, mag = Math.hypot(ix, iy);
    h.moving = mag > 0.15;
    if (h.moving) {
      if (mag > 1) { ix /= mag; iy /= mag; }
      // screen (ix, iy) -> world: dx-dy = ix*2, dx+dy = iy*4 (keeps on-screen speed even)
      let wx = ix / 2 + iy, wy = iy - ix / 2;
      const wl = Math.hypot(wx, wy) || 1, sp = 3.1 * Math.min(1, mag);
      wx = (wx / wl) * sp * dt; wy = (wy / wl) * sp * dt;
      const ex = exitAt(h.x + wx, h.y + wy);
      if (ex) tryExit(ex);
      if (walkable(h.x + wx, h.y)) h.x += wx;
      if (walkable(h.x, h.y + wy)) h.y += wy;
      h.dir = Math.abs(ix) > Math.abs(iy) * 0.8 ? (ix > 0 ? 'right' : 'left') : (iy > 0 ? 'down' : 'up');
      h.walk += dt * 9;
    }

    // dog
    if (dog.moodT > 0) dog.moodT -= dt; else dog.mood = null;
    dog.anim += dt * 10;
    if (dog.state === 'idle') dog.state = 'follow';
    if (dog.state === 'follow') moveToward(dog, h.x + 0.7, h.y + 0.7, 3.4, dt, 0.5);
    else if (dog.state === 'go') {
      if (dog.chase) { dog.tx = dog.chase.x; dog.ty = dog.chase.y; }
      if (moveToward(dog, dog.tx, dog.ty, 5, dt, dog.chase ? 0.25 : 0.08)) { const fn = dog.then; dog.then = null; dog.chase = null; dog.state = 'idle'; fn && fn(); }
    } else if (dog.state === 'harvest') {
      const H = S.harvest;
      if (!H) dog.state = 'follow';
      else if ((H.next -= dt) <= 0) {
        H.count++; H.pile.push(H.wrongVeg || S.cur.params.veg);
        speak(COUNTER[H.count] || String(H.count), 1.1);
        dogMood(String(H.count), 1.1); H.next = 1.35;
        if ((H.target && H.count >= H.target) || H.count >= 10) stopHarvest();
      }
    } else if (dog.state === 'dig') {
      dog.timer -= dt;
      if (dog.timer <= 0) {
        dog.state = 'follow';
        if (S.phase === 'morning') { S.hole = 1; finish(); }
      }
    }

    updateLaundry(dt);

    // zombies: walk the street to the gate, then up the path to the door
    for (const z of S.zombies) {
      z.bob += dt * 5;
      if (z.state === 'walk') {
        const wp = z.path[0];
        if (moveToward(z, wp.x, wp.y, z.speed, dt, 0.05)) z.path.shift();
        if (!z.path.length) {
          z.state = 'flee'; z.speed = 2.2; S.barricade = Math.max(0, S.barricade - 1);
          say('radio', 'いえに きた！', { noRepeat: true });
        }
      } else {
        moveToward(z, z.home.x, z.home.y, z.speed, dt, 0.05);
        if (z.yelp) z.yelp -= dt;
      }
      z.onMap = z.x > -0.2 && z.x < MW + 0.2;
    }
    const before = S.zombies.length;
    S.zombies = S.zombies.filter((z) => !(z.state === 'flee' && Math.hypot(z.x - z.home.x, z.y - z.home.y) < 0.2));
    if (S.phase === 'night' && before > 0 && S.zombies.length === 0) waveCleared();
  }

  function moveToward(o, x, y, speed, dt, stopDist) {
    const dx = x - o.x, dy = y - o.y, d = Math.hypot(dx, dy);
    if (d <= stopDist) return true;
    const step = Math.min(d, speed * dt);
    o.x += (dx / d) * step; o.y += (dy / d) * step;
    const sdx = dx - dy; if (Math.abs(sdx) > 0.05) o.face = sdx > 0 ? 1 : -1;
    return d - step <= stopDist;
  }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // ---------- drawing (sprites from assets/atlas.png) ----------
  const atlas = new Image();
  let atlasReady = false;
  atlas.onload = () => { atlasReady = true; try { buildTints(); } catch (e) { console.warn('hat colours need the page served over http', e); } };
  atlas.src = 'assets/atlas.png';
  const C = {
    ink: '#2b1f33', red: '#d9533c', blue: '#3f7fd1', yellow: '#efc23a', white: '#f6f3ea', black: '#3b3a36',
    green: '#4f9a3e', orange: '#ef8a2b', purple: '#8a6bbf', pink: '#e98fb0', wood: '#a36a3b', woodD: '#6c4329', sky: '#cfe3ea'
  };
  const PAL = { red: [214, 72, 60], blue: [63, 127, 209], yellow: [239, 194, 58], purple: [120, 84, 170], white: [240, 236, 226], black: [60, 58, 66], green: [79, 154, 62], pink: [233, 143, 176] };

  // Zombie hats are recoloured from the sprite so any colour the waves ask for can be shown.
  const tinted = {};
  function buildTints() {
    for (const base of ['z_hat', 'z_glasses']) {
      const [sx, sy, w, h] = ATLAS[base];
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const x = c.getContext('2d'); x.drawImage(atlas, sx, sy, w, h, 0, 0, w, h);
      const src = x.getImageData(0, 0, w, h);
      // hat pixels = saturated pixels in the top third
      const isHat = (r, g, b) => base === 'z_hat' ? (r > 150 && g < 120 && b < 110) : (b > r * 0.9 && r > g + 15 && b > g + 15);
      for (const [name, rgb] of Object.entries(PAL)) {
        const d = new ImageData(new Uint8ClampedArray(src.data), w, h);
        for (let i = 0; i < w * Math.floor(h * 0.36); i++) {
          const p = i * 4, r = d.data[p], gg = d.data[p + 1], b = d.data[p + 2];
          if (!d.data[p + 3] || !isHat(r, gg, b)) continue;
          const k = (0.3 * r + 0.59 * gg + 0.11 * b) / 150;
          d.data[p] = Math.min(255, rgb[0] * k); d.data[p + 1] = Math.min(255, rgb[1] * k); d.data[p + 2] = Math.min(255, rgb[2] * k);
        }
        const o = document.createElement('canvas'); o.width = w; o.height = h; o.getContext('2d').putImageData(d, 0, 0);
        tinted[base + ':' + name] = o;
      }
    }
  }

  function R(x, y, w, h, c) { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); }
  // screen position of a world point, after the camera
  function scr(x, y) { const p = iso(x, y); return { x: Math.round(p.x - S.cam.x), y: Math.round(p.y - S.cam.y) }; }
  function spr(name, wx, wy, opts) {
    const m = ATLAS[name]; if (!m) return;
    opts = opts || {};
    const p = scr(wx, wy), sc = opts.scale || 1, lift = opts.lift || 0;
    const dw = Math.round(m[2] * sc), dh = Math.round(m[3] * sc);
    const ax = opts.flip ? m[2] - 1 - m[4] : m[4];
    const dx = p.x - Math.round(ax * sc), dy = p.y - Math.round(m[5] * sc) - lift;
    if (dx > W || dy > H || dx + dw < 0 || dy + dh < 0) return;
    const src = opts.canvas;
    if (opts.flip) {
      g.save(); g.translate(dx + dw, dy); g.scale(-1, 1);
      src ? g.drawImage(src, 0, 0, dw, dh) : g.drawImage(atlas, m[0], m[1], m[2], m[3], 0, 0, dw, dh);
      g.restore();
    } else src ? g.drawImage(src, dx, dy, dw, dh) : g.drawImage(atlas, m[0], m[1], m[2], m[3], dx, dy, dw, dh);
  }

  function jobFocus() {
    if (dog.state === 'go' || dog.state === 'harvest') return dog;
    if (S.harvest) return VEG_SPOT;
    if (S.stall && MAP.id === 'lane') return STALL;
    if (S.laundry) {
      const fl = S.laundry.pieces.filter((p) => p.state === 'fly');
      if (!fl.length) return LINE;
      return { x: fl.reduce((s, p) => s + p.x, 0) / fl.length, y: fl.reduce((s, p) => s + p.y, 0) / fl.length };
    }
    return null;
  }
  function updateCamera(dt, snap) {
    let p = iso(S.hero.x, S.hero.y);
    // during a job, frame both the hero and where the job is happening
    const f = jobFocus();
    if (f) { const q = iso(f.x, f.y); p = { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 }; }
    // keep the hero a little above centre so the caption box never covers them
    let tx = p.x - W / 2, ty = p.y - H * 0.42;
    const minX = iso(0, MH).x - 8, maxX = iso(MW, 0).x - W + 8;
    const minY = -40, maxY = iso(MW, MH).y + 26 - H;
    tx = clamp(tx, minX, maxX); ty = clamp(ty, minY, maxY);
    const k = snap ? 1 : Math.min(1, dt * 6);
    S.cam.x += (tx - S.cam.x) * k; S.cam.y += (ty - S.cam.y) * k;
  }

  function drawGround() {
    g.fillStyle = C.sky; g.fillRect(0, 0, W, H);
    // back to front so each tile's side (map edge only) is covered by the row in front
    for (let s = 0; s < MW + MH - 1; s++) {
      for (let y = Math.max(0, s - MW + 1); y <= Math.min(MH - 1, s); y++) {
        const x = s - y, key = TILE[MAP.ground[y][x]];
        const m = ATLAS['t_' + key], p = scr(x, y);
        if (p.x - 16 > W || p.y > H || p.x + 16 < 0 || p.y + 26 < 0) continue;
        if (TILE_FLIP[MAP.ground[y][x]]) { g.save(); g.translate(p.x + 16, p.y); g.scale(-1, 1); g.drawImage(atlas, m[0], m[1], m[2], m[3], 0, 0, m[2], m[3]); g.restore(); }
        else g.drawImage(atlas, m[0], m[1], m[2], m[3], p.x - 16, p.y, m[2], m[3]);
        // the island's base: one continuous band along the two front edges, no seams between tiles
        const e = ATLAS['t_' + key + '_edge'] || ATLAS.t_grass_edge;
        if (y === MH - 1) sideBand(scr(x, y + 1), scr(x + 1, y + 1), e[6]);
        if (x === MW - 1) sideBand(scr(x + 1, y + 1), scr(x + 1, y), e[7]);
      }
    }
    // dig spot / hole by the fence
    if (MAP.id !== 'home') return;
    if (S.hole) spr('dig_spot', SPOTS.fenceHole.x, SPOTS.fenceHole.y + 0.2);
    else if (S.phase === 'morning') { const p = scr(SPOTS.fenceHole.x, SPOTS.fenceHole.y); R(p.x - 5, p.y - 2, 10, 3, '#8a6a45'); }
  }

  const DEPTH = 10;
  function sideBand(a, b, col) {
    const n = b.x - a.x;
    for (let i = 0; i < n; i++) {
      const top = Math.round(a.y + ((b.y - a.y) * i) / n);
      g.fillStyle = col; g.fillRect(a.x + i, top, 1, DEPTH);
      g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(a.x + i, top + 6, 1, DEPTH - 6);
      g.fillStyle = C.ink; g.fillRect(a.x + i, top + DEPTH, 1, 1);
    }
  }

  function heroSprite(h) {
    if (h.dir === 'up') return { name: 'hero_back' };
    if (h.dir === 'down') return { name: 'hero_front' };
    return { name: 'hero_side', flip: h.dir === 'right' };
  }
  function drawHero(h) {
    const s = heroSprite(h), bob = h.moving && Math.sin(h.walk) > 0 ? 1 : 0;
    shadow(h.x, h.y, 6);
    spr(s.name, h.x, h.y, { flip: s.flip, lift: bob });
  }
  function shadow(x, y, r) { const p = scr(x, y); g.fillStyle = 'rgba(40,30,50,0.22)'; g.fillRect(p.x - r, p.y - 1, r * 2, 2); g.fillRect(p.x - r + 2, p.y - 2, r * 2 - 4, 4); }

  function drawDog(d) {
    const moving = d.state === 'go' || d.state === 'follow';
    const hop = moving && Math.sin(d.anim) > 0.3 ? 1 : 0;
    shadow(d.x, d.y, 6);
    spr('dog', d.x, d.y, { flip: d.face > 0, lift: d.state === 'dig' || d.state === 'harvest' ? 0 : hop });
    const p = scr(d.x, d.y);
    if (d.state === 'dig' || d.state === 'harvest') for (let i = 0; i < 3; i++) R(p.x - 10 - i * 3, p.y - 4 - ((S.t * 20 + i * 5) % 8), 2, 2, '#8a6a45');
    const cx = p.x + (d.face > 0 ? 9 : -9), cy = p.y - 7;
    if (d.carry === 'letter') { R(cx - 4, cy - 4, 8, 6, C.ink); R(cx - 3, cy - 3, 6, 4, '#f6f3ea'); R(cx - 3, cy - 3, 6, 1, '#d9533c'); }
    else if (d.carry === 'coins') { R(cx - 3, cy - 3, 6, 4, C.ink); R(cx - 2, cy - 2, 4, 2, '#e8c35a'); }
    else if (d.carry && d.carry.startsWith('veg:')) drawVeg(d.carry.slice(4), cx, cy + 2);
    else if (d.carry) drawItemAt(d.carry, cx, cy, true);
    if (d.mood) bubble(p.x, p.y - 20, d.mood);
  }
  function bubble(x, y, text) {
    g.font = '8px DotGothic16, monospace';
    const w = Math.max(9, Math.ceil(g.measureText(text).width) + 5);
    R(x - w / 2, y - 7, w, 10, '#fff8e7'); g.strokeStyle = C.ink; g.lineWidth = 1; g.strokeRect(Math.round(x - w / 2) + 0.5, y - 6.5, w - 1, 9);
    g.fillStyle = C.ink; g.fillText(text, Math.round(x - w / 2) + 3, y + 1);
  }

  function drawNpc(n) { shadow(n.x, n.y, 6); spr(n.sprite, n.x, n.y); if (n.bubble && n.bubbleT > S.t) { const p = scr(n.x, n.y); bubble(p.x, p.y - 30, n.bubble); } }
  // house number plates on the back lane
  function drawPlate(b) {
    const p = scr(b.x - 0.25, b.y + 0.05);
    R(p.x - 5, p.y - 14, 10, 9, C.ink); R(p.x - 4, p.y - 13, 8, 7, '#f6f3ea');
    g.fillStyle = C.ink; g.font = '8px DotGothic16, monospace'; g.fillText(String(b.plate), p.x - 2, p.y - 6);
  }

  const ITEM_SPRITE = { bucket: 'bucket', key: 'key', persimmon: 'persimmon' };
  function drawItemAt(id, x, y, small) {
    const name = ITEM_SPRITE[id];
    if (name) {
      const m = ATLAS[name], sc = small ? 0.75 : 1;
      g.drawImage(atlas, m[0], m[1], m[2], m[3], Math.round(x - m[2] * sc / 2), Math.round(y - m[3] * sc + 2), Math.round(m[2] * sc), Math.round(m[3] * sc));
      return;
    }
    if (id === 'ball') { R(x - 3, y - 8, 6, 8, C.ink); R(x - 4, y - 7, 8, 6, C.ink); R(x - 3, y - 7, 6, 6, C.red); R(x - 2, y - 8, 4, 8, C.red); R(x - 3, y - 4, 6, 1, C.white); R(x - 1, y - 7, 2, 1, '#ffb3a3'); R(x - 2, y - 8, 4, 1, C.ink); R(x - 2, y, 4, 1, C.ink); }
    if (id === 'shoe') { R(x - 5, y - 4, 10, 4, C.ink); R(x - 4, y - 3, 8, 2, '#8a5a3a'); R(x - 4, y - 6, 4, 3, C.ink); R(x - 3, y - 5, 2, 2, '#8a5a3a'); }
  }
  function drawItem(it) {
    if (it.hidden || it.held) return;
    const p = scr(it.x, it.y);
    drawItemAt(it.id, p.x, p.y);
    if (it.glow) {
      const t = (S.t * 3) % 1, ty = p.y - 16 - Math.round(t * 3);
      R(p.x - 1, ty - 3, 2, 6, '#fff3a0'); R(p.x - 3, ty - 1, 6, 2, '#fff3a0'); R(p.x, ty - 1, 1, 1, '#ffffff');
    }
  }

  function drawZombie(z) {
    const big = z.size === 'big', base = z.look;
    const tint = z.hat && tinted[base + ':' + z.hat.color];
    const sway = Math.sin(z.bob) > 0 ? 1 : 0;
    shadow(z.x, z.y, big ? 9 : 6);
    spr(base, z.x, z.y, { flip: z.face > 0, scale: big ? 1.5 : 1, lift: sway, canvas: base !== 'z_flower' ? tint : null });
    const p = scr(z.x, z.y), top = p.y - (big ? 33 : 22);
    if (z.umbrella) {
      const c = C[z.umbrella.color] || C.yellow, ux = p.x + (z.face > 0 ? 5 : -5);
      R(ux, top - 6, 1, 14, C.ink);
      R(ux - 9, top - 9, 19, 4, C.ink); R(ux - 8, top - 9, 17, 3, c); R(ux - 5, top - 11, 11, 2, C.ink); R(ux - 4, top - 11, 9, 2, c);
    }
    if (z.state === 'flee' && z.yelp > 0) bubble(p.x, top - 6, 'ひゃー！');
  }

  // vegetables and washing are tiny, so they are drawn in code
  const VEG_COL = { tomato: ['#d9533c', '#4f9a3e'], carrot: ['#ef8a2b', '#4f9a3e'], daikon: ['#f6f3ea', '#6fb05a'] };
  function drawVeg(kind, x, y) {
    const [body, leaf] = VEG_COL[kind];
    if (kind === 'tomato') { R(x - 3, y - 5, 6, 5, C.ink); R(x - 2, y - 4, 4, 3, body); R(x - 1, y - 6, 2, 1, leaf); }
    else if (kind === 'carrot') { R(x - 2, y - 6, 4, 6, C.ink); R(x - 1, y - 5, 2, 4, body); R(x - 1, y - 8, 2, 2, leaf); }
    else { R(x - 2, y - 8, 5, 8, C.ink); R(x - 1, y - 7, 3, 6, body); R(x - 1, y - 10, 3, 2, leaf); }
  }
  function drawHarvest() {
    const H = S.harvest; if (!H || !H.pile.length) return;
    const p = scr(VEG_SPOT.x + 0.6, VEG_SPOT.y + 0.6);
    H.pile.forEach((k, i) => drawVeg(k, p.x - 9 + (i % 5) * 5, p.y - Math.floor(i / 5) * 5));
    bubble(p.x, p.y - 16, String(H.pile.length));
  }
  const CLOTH_COL = { red: '#d9533c', blue: '#3f7fd1', yellow: '#efc23a', white: '#f6f3ea', green: '#4f9a3e', pink: '#e98fb0' };
  function drawCloth(p, x, y) {
    const c = CLOTH_COL[p.color];
    if (p.type === 'shirt') { R(x - 5, y - 6, 10, 4, C.ink); R(x - 3, y - 6, 6, 8, C.ink); R(x - 4, y - 5, 8, 2, c); R(x - 2, y - 5, 4, 6, c); }
    else if (p.type === 'towel') { R(x - 5, y - 5, 10, 6, C.ink); R(x - 4, y - 4, 8, 4, c); R(x - 4, y - 2, 8, 1, 'rgba(255,255,255,0.45)'); }
    else { R(x - 2, y - 7, 4, 6, C.ink); R(x - 2, y - 3, 6, 4, C.ink); R(x - 1, y - 6, 2, 4, c); R(x - 1, y - 2, 4, 2, c); }
  }
  function drawLaundry() {
    const L = S.laundry;
    // basket
    const b = scr(BASKET.x, BASKET.y);
    R(b.x - 8, b.y - 7, 16, 8, C.ink); R(b.x - 7, b.y - 6, 14, 6, '#c8935a'); R(b.x - 7, b.y - 4, 14, 1, '#a36a3b');
    if (!L) return;
    let k = 0;
    for (const p of L.pieces) {
      if (p.state === 'lost') continue;
      if (p.state === 'saved') { drawCloth(p, b.x - 4 + (k++ % 3) * 4, b.y - 5); continue; }
      const q = scr(p.x, p.y);
      if (p.state === 'carried') { drawCloth(p, q.x + (dog.face > 0 ? 9 : -9), q.y - 6); continue; }
      const lift = p.state === 'wait' ? 14 : 10 + Math.round(Math.sin(p.sway) * 3);
      if (p.state === 'fly') { g.fillStyle = 'rgba(40,30,50,0.18)'; g.fillRect(q.x - 4, q.y - 1, 8, 2); }
      drawCloth(p, q.x, q.y - lift);
    }
  }

  function drawBarricade() {
    if (S.night < 0.1 && S.phase !== 'night') return;
    const d = SPOTS.houseDoor;
    for (let i = 0; i < S.barricade; i++) {
      const p = scr(d.x + 0.15 - i * 0.12, d.y + 0.2);
      R(p.x - 7, p.y - 5 - i * 4, 14, 3, C.ink); R(p.x - 6, p.y - 5 - i * 4, 12, 2, C.wood);
    }
  }

  function draw() {
    if (!atlasReady) { g.fillStyle = C.sky; g.fillRect(0, 0, W, H); return; }
    drawGround();
    // everything that stands up is sorted by how far forward its ground point is
    const list = [];
    MAP.buildings.forEach((b) => list.push({ k: b.x + b.y - 0.6, d: () => { spr(b.sprite, b.x, b.y); if (b.plate) drawPlate(b); } }));
    MAP.props.forEach((p) => list.push({ k: p.x + p.y, d: () => spr(p.sprite, p.x, p.y, { flip: p.flip }) }));
    (MAP.fences || []).forEach((f) => list.push({ k: f.x + f.y - 1, d: () => spr('fence', f.x, f.y) }));
    MAP.npcs.forEach((n) => list.push({ k: n.x + n.y, d: () => drawNpc(n) }));
    if (MAP.id === 'home') {
      S.items.forEach((it) => list.push({ k: it.x + it.y, d: () => drawItem(it) }));
      list.push({ k: SPOTS.houseDoor.x + SPOTS.houseDoor.y + 0.1, d: drawBarricade });
      list.push({ k: VEG_SPOT.x + VEG_SPOT.y + 1.3, d: drawHarvest });
      list.push({ k: BASKET.x + BASKET.y, d: drawLaundry });
      S.zombies.forEach((z) => list.push({ k: z.x + z.y, d: () => drawZombie(z) }));
    }
    laneDraw(list);
    list.push({ k: S.hero.x + S.hero.y, d: () => drawHero(S.hero) });
    list.push({ k: dog.x + dog.y, d: () => drawDog(dog) });
    list.sort((a, b) => a.k - b.k).forEach((e) => e.d());
    if (S.fade > 0) { g.fillStyle = 'rgba(29,28,26,' + S.fade.toFixed(3) + ')'; g.fillRect(0, 0, W, H); S.fade = Math.max(0, S.fade - 0.06); }
    if (S.night > 0.02) {
      g.fillStyle = 'rgba(24,26,72,' + (0.55 * S.night).toFixed(3) + ')'; g.fillRect(0, 0, W, H);
      // lamp and window glow
      const lp = MAP.id === 'home' ? scr(13.1, 13.4) : scr(2.6, 6.3);
      g.fillStyle = 'rgba(255,220,140,' + (0.22 * S.night).toFixed(3) + ')';
      g.beginPath(); g.ellipse(lp.x, lp.y - 2, 26, 13, 0, 0, Math.PI * 2); g.fill();
      const wp = scr(SPOTS.houseDoor.x - 1.4, SPOTS.houseDoor.y - 0.4);
      g.fillStyle = 'rgba(255,220,140,' + (0.18 * S.night).toFixed(3) + ')';
      g.beginPath(); g.ellipse(wp.x, wp.y + 4, 22, 9, 0, 0, Math.PI * 2); g.fill();
    }
  }

  // ---------- loop ----------
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    update(dt); updateCamera(dt); draw();
    if ((S.hudT = (S.hudT || 0) + dt) > 0.25) { S.hudT = 0; updateHud(); }
    if ((S.stT = (S.stT || 0) + dt) > 1) { S.stT = 0; pushState(); }
    requestAnimationFrame(frame);
  }

  // ---------- HUD, toasts and the job board ----------
  let toastT = null;
  function toast(text) {
    $('toast').textContent = text; $('toast').hidden = false;
    clearTimeout(toastT); toastT = setTimeout(() => ($('toast').hidden = true), 3200);
  }
  function stars(n) { return '★'.repeat(n) + '☆'.repeat(3 - n); }
  function updateHud() {
    if (!S.ready) return;
    const d = SV();
    $('hud').hidden = S.phase === 'title';
    $('hud-day').textContent = d.day + '日目 · ¥' + d.yen + ' · おやつ ' + Save.treatsLeft() + ' · ' + MAP.name.split(' · ')[0];
    const j = S.cur;
    let now = '';
    if (j) {
      now = 'いま: ' + j.goal;
      if (j.kind === 'harvest' && S.harvest && S.harvest.digging) now += ' (' + S.harvest.count + ')';
      if (j.kind === 'laundry' && S.laundry) now += ' (' + S.laundry.pieces.filter((p) => p.state === 'saved').length + ')';
    } else if (S.phase === 'day') now = Jobs.taken(board()).length ? '' : 'しごとを えらんで';
    else if (S.phase === 'evening') now = 'おやすみ？';
    $('hud-now').textContent = now;
  }
  function jobRow(j, i) {
    const reward = '¥' + j.reward.yen + (j.reward.treats ? ' · おやつ ' + j.reward.treats : '');
    const btn = j.state === 'open' ? '<button class="btn" data-take="' + j.id + '">受ける · Take</button>'
      : j.state === 'taken' ? '<button class="btn" data-drop="' + j.id + '">やめる · Drop</button>'
      : '<span class="stars">' + stars(j.stars) + '</span>';
    const cur = S.cur && S.cur.id === j.id ? ' · いま' : '';
    return '<div class="job ' + j.state + '"><div class="num">' + (i + 1) + '</div><div><div class="t">' + j.title + ' <span class="meta">' + j.en + cur + '</span></div>' +
      '<div class="meta">' + j.clientName + ' · ' + j.goal + ' · ' + reward + '</div></div><div>' + btn + '</div></div>';
  }
  function renderBoard() {
    if (!board()) return;
    const b = board();
    $('board-sub').textContent = b.day + '日目 · ' + Jobs.taken(b).length + '/3 taken · ' + Jobs.doneCount(b) + ' done';
    $('board-list').innerHTML = b.jobs.map(jobRow).join('');
  }
  function showBoard(on) { $('board').hidden = !on; if (on) renderBoard(); }
  $('board').addEventListener('click', (e) => {
    const t = e.target.closest('button'); if (!t) return;
    if (t.dataset.take) takeJob(t.dataset.take);
    if (t.dataset.drop) dropJob(t.dataset.drop);
  });
  $('jobsBtn').addEventListener('click', () => showBoard($('board').hidden));
  $('nextday').addEventListener('click', nextDay);
  function boardMsg() {
    const b = board(); if (!b) return null;
    return {
      t: 'board', day: b.day, yen: SV().yen, treats: Save.treatsLeft(), phase: S.phase, cur: S.cur ? S.cur.id : null,
      jobs: b.jobs.map((j) => ({ id: j.id, title: j.title, en: j.en, client: j.clientName, goal: j.goal, reward: j.reward, state: j.state, stars: j.stars }))
    };
  }
  function broadcastBoard() { const m = boardMsg(); if (m) net.broadcast(m); }

  // Everything the phone's home screen and apps show, sent whenever it changes.
  const PHASE_JP = { title: '朝', greet: '朝', day: '昼', dusk: '夕方', night: '夜', morning: '朝', evening: '夜', sleeping: '夜', done: '朝' };
  function npcNames() {
    const n = { hana: NAMES.landlord, yamada: NAMES.yamada };
    for (const m of Object.values(MAPS)) for (const p of m.npcs || []) if (p.id) n[p.id] = p.name;
    return n;
  }
  function mapList() {
    const open = (ex) => ex.to && (!ex.need || SV().story[ex.need] || SV().explore);
    const seen = { home: true }, order = ['home'];
    for (let i = 0; i < order.length; i++) for (const ex of MAPS[order[i]].exits || []) if (open(ex) && MAPS[ex.to] && !seen[ex.to]) { seen[ex.to] = true; order.push(ex.to); }
    const all = order.concat(Object.keys(MAPS).filter((id) => !seen[id]));
    const fr = SV().friends || {};
    return all.map((id) => {
      const m = MAPS[id], nm = m.name.split(' · ');
      return { id, jp: nm[0], en: nm[1] || '', here: id === MAP.id, open: !!seen[id],
        npcs: (m.npcs || []).filter((p) => p.id).map((p) => ({ name: p.name, stars: (fr[p.id] || {}).stars || 0 })) };
    });
  }
  function phoneState() {
    const d = SV(), names = npcNames(), nm = MAP.name.split(' · ');
    return {
      t: 'state', day: d.day, phase: S.phase, phaseJp: PHASE_JP[S.phase] || '昼', yen: d.yen, treats: Save.treatsLeft(),
      map: { id: MAP.id, jp: nm[0], en: nm[1] || '' }, maps: mapList(),
      job: S.cur ? { title: S.cur.title, goal: S.cur.goal } : null,
      dog: { busy: dogBusy(), carry: dog.carry || null },
      words: Object.entries(d.words || {}).map(([id, w]) => Object.assign(Words.gloss(id), { heard: w.heard, said: w.said, strength: Math.round(Save.fade(id)) })),
      friends: Object.entries(d.friends || {}).map(([id, f]) => ({ id, name: names[id] || id, stars: f.stars, points: f.points })),
      scraps: d.scraps || [], diary: (d.diary || []).slice(-10)
    };
  }
  let lastState = '';
  function pushState(force) {
    if (!S.ready || !net.count()) return;
    const m = phoneState(), j = JSON.stringify(m);
    if (!force && j === lastState) return;
    lastState = j; net.broadcast(m);
  }

  // ---------- phones ----------
  const net = Net.host({
    onReady(code) {
      const url = new URL('phone.html?room=' + code, location.href).href;
      $('code').textContent = code;
      $('joinurl').textContent = url;
      try { $('qr').innerHTML = ''; new QRCode($('qr'), { text: url, width: 132, height: 132 }); } catch (_) { $('qr').textContent = 'QR unavailable'; }
    },
    onJoin(c) {
      $('phones').textContent = net.count() + ' phone connected';
      $('join').classList.add('small');
      c.send({ t: 'hello', ack: true, grammar: Words.grammarWords() });
      if (S.lastLine) c.send({ t: 'line', who: NAMES[S.lastLine.who], text: S.lastLine.text });
      const bm = boardMsg(); if (bm) c.send(bm);
      c.send({ t: 'log', lines: S.log.slice(-120) });
      if (S.ready) { c.send(phoneState()); lastState = ''; }
      if (S.phase === 'title') startGame();
    },
    onLeave() { $('phones').textContent = net.count() + ' phone connected'; },
    onMsg(d, c) {
      if (!d || typeof d !== 'object') return;
      if (d.t === 'move') { S.input.x = clamp(+d.x || 0, -1, 1); S.input.y = clamp(+d.y || 0, -1, 1); }
      else if (d.t === 'speech') {
        if (d.id && c) { try { c.send({ t: 'ack', id: d.id }); } catch (_) {} }
        handleSpeech(Array.isArray(d.alts) ? d.alts.slice(0, 6).map(String) : [String(d.text || '')]);
      }
      else if (d.t === 'replay') replay(!!d.slow);
      else if (d.t === 'job' && typeof d.id === 'string') { if (d.act === 'take') takeJob(d.id); else if (d.act === 'drop') dropJob(d.id); }
    },
    onError(e) { $('phones').textContent = 'Phone link: ' + e; },
    onSignal(st) {
      const n = net.count() + ' phone connected';
      $('phones').textContent = st === 'ok' ? n : n + ' · reconnecting to the server…';
    }
  });

  // ---------- keyboard and test box ----------
  addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    S.keys[e.key.length === 1 ? e.key.toLowerCase() : e.key] = true;
    if (e.key.startsWith('Arrow')) e.preventDefault();
    if (e.key === 'Enter') startGame();
    if (e.key === 'j' || e.key === 'J') showBoard($('board').hidden);
    if (!$('board').hidden && /^[1-5]$/.test(e.key) && board()) {
      const j = board().jobs[+e.key - 1];
      if (j && j.state === 'open') takeJob(j.id); else if (j && j.state === 'taken') dropJob(j.id);
    }
  });
  addEventListener('keyup', (e) => { S.keys[e.key.length === 1 ? e.key.toLowerCase() : e.key] = false; });
  $('start').addEventListener('click', startGame);
  $('testform').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = $('testinput').value.trim();
    if (!v) return;
    startGame(); handleSpeech([v]); $('testinput').value = '';
  });

  // ---------- AI settings ----------
  function fillSettings() {
    const c = AI.load();
    $('ai-enabled').checked = c.enabled;
    $('ai-provider').value = c.provider;
    $('ai-url').value = c.ollamaUrl;
    $('ai-model').value = c.model;
    $('ai-key').value = c.provider === 'ollama' ? '' : (c.keys[c.provider] || '');
    $('ai-url-row').hidden = c.provider !== 'ollama';
    $('ai-key-row').hidden = c.provider === 'ollama';
    $('ai-model').placeholder = AI.MODEL_HINT[c.provider] || 'model name';
  }
  function readSettings() {
    const c = AI.load();
    c.enabled = $('ai-enabled').checked;
    const prev = c.provider;
    c.provider = $('ai-provider').value;
    c.ollamaUrl = $('ai-url').value.trim() || 'http://localhost:11434';
    c.model = $('ai-model').value.trim();
    if (prev !== 'ollama' && prev === c.provider) c.keys[c.provider] = $('ai-key').value.trim();
    return c;
  }
  $('gear').addEventListener('click', () => { fillSettings(); $('settings').hidden = false; });
  $('ai-close').addEventListener('click', () => { AI.save(readSettings()); $('settings').hidden = true; });
  $('ai-provider').addEventListener('change', () => {
    const c = AI.load(); const prov = $('ai-provider').value;
    AI.save({ ...readSettings(), provider: prov, model: prov === c.provider ? c.model : '' });
    fillSettings();
  });
  $('ai-key').addEventListener('change', () => { const c = readSettings(); if (c.provider !== 'ollama') c.keys[c.provider] = $('ai-key').value.trim(); AI.save(c); });
  $('ai-list').addEventListener('click', async () => {
    $('ai-status').textContent = 'Looking for Ollama models…';
    try {
      const names = await AI.ollamaModels($('ai-url').value.trim() || 'http://localhost:11434');
      $('ai-models').innerHTML = names.map((n) => '<option value="' + n.replace(/"/g, '') + '"></option>').join('');
      $('ai-status').textContent = names.length ? names.length + ' models found. Pick one with good Japanese.' : 'Ollama is running but has no models yet.';
    } catch (e) {
      $('ai-status').textContent = "Couldn't reach Ollama. Is it running, and is OLLAMA_ORIGINS set to allow this site?";
    }
  });
  $('ai-test').addEventListener('click', async () => {
    const c = readSettings(); AI.save(c);
    $('ai-status').textContent = 'Testing…';
    try {
      const r = await AI.chat(c, LANDLORD_PROMPT, [{ role: 'user', content: 'こんにちは' }]);
      $('ai-status').textContent = 'It works: ' + r;
    } catch (e) { $('ai-status').textContent = 'Failed: ' + e.message; }
  });

  // ---------- saving ----------
  Save.onSaved = () => { $('save-status').textContent = 'Saved in this browser · day ' + SV().day; };
  $('save-download').addEventListener('click', () => { Save.download(); $('save-status').textContent = 'Downloaded. Keep the file to restore this save anywhere.'; });
  $('save-load').addEventListener('click', () => $('save-file').click());
  $('save-file').addEventListener('change', async () => {
    const f = $('save-file').files[0]; if (!f) return;
    try { await Save.loadFile(f); $('save-status').textContent = 'Loaded. Restarting…'; setTimeout(() => location.reload(), 600); }
    catch (e) { $('save-status').textContent = e.message; }
    $('save-file').value = '';
  });
  $('explore').addEventListener('change', () => { SV().explore = $('explore').checked; Save.save(); });
  let newArmed = false;
  $('save-new').addEventListener('click', async () => {
    if (!newArmed) { newArmed = true; $('save-new').textContent = 'Sure? Click again'; setTimeout(() => { newArmed = false; $('save-new').textContent = 'New game'; }, 4000); return; }
    await Save.reset(); location.reload();
  });

  Save.load().then((d) => {
    if (!d.board || d.board.day !== d.day) d.board = Jobs.makeBoard(d.day, { lane: d.story.ch0done });
    S.ready = true; renderBoard(); updateHud();
    $('explore').checked = !!d.explore;
    if (d.story.met) $('start').textContent = 'Continue · day ' + d.day;
  });

  updateCamera(0, true);
  draw();
  requestAnimationFrame(frame);
  // Handy for testing from the browser console: __game.skip('night') or __game.skip('morning')
  window.__game = {
    S, handleSpeech, startGame, takeJob, dropJob, nextDay, Save, Jobs, changeMap, MAPS, phoneState, boardMsg,
    goto(id) { const m = MAPS[id]; if (m) changeMap(id, m.start); },
    // Draws a whole map to an image (for checking map layouts); returns a data URL.
    overview(id) {
      const keep = { g, W, H, cam: { ...S.cam }, map: MAP.id, hero: { ...S.hero }, dog: { x: dog.x, y: dog.y }, night: S.night, fade: S.fade };
      useMap(id);
      const w = (MW + MH) * 16 + 40, h = (MW + MH) * 8 + 140;
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      g = c.getContext('2d'); g.imageSmoothingEnabled = false; W = w; H = h;
      S.cam.x = -MH * 16 - 20; S.cam.y = -110; S.night = 0; S.fade = 0;
      S.hero.x = MAP.start.x; S.hero.y = MAP.start.y; dog.x = S.hero.x + 0.6; dog.y = S.hero.y + 0.6;
      draw();
      const url = c.toDataURL();
      g = keep.g; W = keep.W; H = keep.H; S.cam = keep.cam; useMap(keep.map); Object.assign(S.hero, keep.hero); dog.x = keep.dog.x; dog.y = keep.dog.y; S.night = keep.night; S.fade = keep.fade;
      return url;
    }, get map() { return MAP.id; },
    skip(to) {
      startGame(); S.timers = [];
      if (to === 'night') { SV().story.met = true; S.phase = 'day'; dusk(); }
      if (to === 'morning') { S.zombies = []; S.wave = WAVES.length; morning(); }
    }
  };
})();
