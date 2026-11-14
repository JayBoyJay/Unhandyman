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
      { sprite: 'workshop', x: 8, y: 6, room: 'room', door: 0.3 },
      { sprite: 'landlord_house', x: 16, y: 6, room: 'hana_house', door: 0.36 },
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
  const MAPS = Object.assign({ home: HOME, lane: LANE }, window.MAP_DEFS || {}, window.ROOM_DEFS || {});
  // Link each building door to its room: the door sits on the building's front-left wall.
  // Inside, the way out is the middle of the room's front edge, back to just outside the door.
  for (const map of Object.values(MAPS)) for (const b of map.buildings || []) {
    const room = b.room && MAPS[b.room]; if (!room) continue;
    const m = ATLAS[b.sprite]; b.doorX = b.x - m[6] * (b.door || 0.4);
    const rw = room.ground[0].length, rh = room.ground.length;
    room.parent = map.id;
    room.exits = [{ side: 's', x0: rw / 2 - 1.1, x1: rw / 2 + 1.1, to: map.id, at: { x: b.doorX, y: b.y + 0.8 } }];
    room.start = { x: rw / 2, y: rh - 0.8 };
  }

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
    phase: 'title', t: 0, night: 0, nightTarget: 0, clock: 7 * 60, dayOver: false,
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
  // lines go through js/voice.js: a voice file if there is one, else VOICEVOX live, else the browser
  function speak(text, rate, who) {
    if (window.Voice) { Voice.speak(who || 'default', text, { slow: rate && rate < 1, rate }); return; }
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
    S.lastSayT = S.t;
    $('who').textContent = NAMES[who] || who;
    $('line').textContent = text;
    $('caption').classList.toggle('radio', who === 'radio');
    if (!opts.quiet) speak(text, who === 'radio' ? 1.1 : 1, who);
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
    speak(S.lastLine.text, slow ? 0.65 : 1, S.lastLine.who);
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
    if (S.aiSaid === text) { S.aiSaid = null; return; }   // already logged before the AI's reply
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
    gainFriend(j.client, stars * 2);
    Save.skill('job:' + j.kind);
    say('landlord', line);
    toast(j.en + '  ' + '★'.repeat(stars) + '☆'.repeat(3 - stars) + '  +¥' + pay.yen + (pay.treats ? '  +おやつ ' + pay.treats : ''));
    clearCurrent(); syncBoard();
    after(3, afterJob);
  }
  function afterJob() {
    if (S.phase !== 'day' || S.cur) return;
    if (S.dayOver) return endOfDay();
    const done = Jobs.doneCount(board());
    if (!SV().story.night0 && done >= 3) return dusk();
    if (done >= 3 || !board().jobs.some((j) => j.state !== 'done')) return evening();
    if (Jobs.taken(board()).length) return startNextJob();
    say('landlord', 'ほかの しごとも ある よ。');
    hint('Take a job on your phone (しごと) or press J');
  }
  function evening() {
    S.phase = 'evening'; S.nightTarget = 0.45; setClock(Math.max(S.clock, 18 * 60 + 30));
    say('landlord', 'おつかれさま！ きょうは おしまい。おやすみ！');
    after(5, () => { if (S.phase === 'evening') hint('おやすみ'); });
    syncBoard();
  }
  function nextDay() {
    S.phase = 'sleeping'; hint(''); $('end').hidden = true;
    S.nightTarget = 1; setClock(23 * 60);
    SV().day++; SV().freeTreats = 3; SV().board = Jobs.makeBoard(SV().day, { lane: SV().story.ch0done });
    S.items.forEach((i) => { i.hidden = false; i.held = false; i.x = ITEM_HOME[i.id].x; i.y = ITEM_HOME[i.id].y; });
    S.hole = 0; S.barricade = 3;
    Save.save(true);
    after(2.2, () => {
      S.nightTarget = 0; S.phase = 'day'; S.dayOver = false; setClock(DAY_START); Save.save();
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
    if (S.chat) endChat(false);
    useMap(id);
    markVisited();
    S.hero.x = at.x; S.hero.y = at.y;
    dog.x = at.x + 0.5; dog.y = at.y + 0.5; dog.state = 'follow'; dog.then = null; dog.chase = null;
    S.fade = 1; updateCamera(0, true);
    toast(MAP.name);
    if (S.cur && S.cur.waiting && (S.cur.map || 'home') === MAP.id) after(0.9, () => S.cur && beginJob(S.cur));
  }

  // ---------- the clock ----------
  // Game time in minutes after midnight. It only runs in the daytime: 7:00 to 18:00 is about
  // 11 minutes at normal speed. At 16:00 Hana warns you; at 18:00 the day ends (a job in
  // progress may finish first). Evening, night and morning set the clock themselves.
  const DAY_START = 7 * 60, WARN_AT = 16 * 60, DAY_END = 18 * 60;
  let clockRate = 1;
  try { const v = localStorage.getItem('unhandyman.clockRate'); if (v !== null) clockRate = +v; } catch (_) {}
  function setClock(min) { S.clock = min; SV().clock = Math.round(min); }
  function tickClock(dt) {
    if (S.phase !== 'day' || !S.ready) return;
    const before = S.clock;
    S.clock = Math.min(DAY_END + 30, S.clock + dt * clockRate);
    if ((S.saveClockT = (S.saveClockT || 0) + dt) > 5) { S.saveClockT = 0; SV().clock = Math.round(S.clock); Save.save(); }
    if (before < WARN_AT && S.clock >= WARN_AT && board().jobs.some((j) => j.state === 'taken')) say('landlord', 'もう 四時 だよ！ いそいで！');
    // late afternoon light comes in gradually
    S.nightTarget = S.clock < 17 * 60 ? 0 : Math.min(0.4, ((S.clock - 17 * 60) / 60) * 0.4);
    if (S.clock >= DAY_END && !S.dayOver) {
      S.dayOver = true;
      if (S.cur && !S.cur.waiting) { toast('六時 · 6 pm: finish this job, then the day is over'); return; }
      endOfDay();
    }
  }
  function endOfDay() {
    if (S.cur) clearCurrent();
    const missed = board().jobs.filter((j) => j.state === 'taken' || j.state === 'open').length;
    if (missed) toast('六時 · the day is over' + (missed ? ' · ' + missed + ' job' + (missed > 1 ? 's' : '') + ' missed' : ''));
    if (MAP.id !== 'home') changeMap('home', { x: 9.6, y: 9.4 });
    if (!SV().story.night0) dusk(); else evening();
  }
  function clockText(min) {
    const h = Math.floor(min / 60) % 24, m = Math.floor(min % 60);
    return (h < 12 ? '午前' : '午後') + ' ' + ((h % 12) || 12) + ':' + String(m).padStart(2, '0');
  }
  function partOfDay(min) {
    const h = min / 60;
    return h < 5 ? 'よる' : h < 10 ? 'あさ' : h < 16 ? 'ひる' : h < 19 ? 'ゆうがた' : 'よる';
  }
  // sky colour seen through windows, and a colour wash over the whole scene
  function mix(a, b, k) { return a.map((v, i) => Math.round(v + (b[i] - v) * k)); }
  const SKY = [[0, [32, 36, 78]], [300, [40, 46, 96]], [360, [240, 170, 160]], [480, [190, 225, 240]], [900, [190, 225, 240]], [1020, [248, 196, 120]], [1110, [196, 120, 150]], [1170, [70, 64, 120]], [1260, [32, 36, 78]], [1440, [32, 36, 78]]];
  function skyColor(min) {
    min = ((min % 1440) + 1440) % 1440;
    for (let i = 1; i < SKY.length; i++) if (min <= SKY[i][0]) {
      const [t0, c0] = SKY[i - 1], [t1, c1] = SKY[i], c = mix(c0, c1, (min - t0) / (t1 - t0));
      return 'rgb(' + c.join(',') + ')';
    }
    return 'rgb(32,36,78)';
  }
  function dayTint(min) {
    const h = min / 60;
    if (h >= 5.5 && h < 8) return 'rgba(255,170,150,' + (0.14 * (1 - (h - 5.5) / 2.5)).toFixed(3) + ')';
    if (h >= 15 && h < 17.5) return 'rgba(255,190,90,' + (0.16 * ((h - 15) / 2.5)).toFixed(3) + ')';
    if (h >= 17.5 && h < 19.5) return 'rgba(200,110,150,' + (0.16 + 0.04 * ((h - 17.5) / 2)).toFixed(3) + ')';
    return null;
  }

  // ---------- rooms ----------
  function doorAt(x, y) {
    return (MAP.buildings || []).find((b) => b.room && MAPS[b.room] && Math.abs(x - b.doorX) < 0.85 && y - b.y > -0.2 && y - b.y < 1.2) || null;
  }
  function enterRoom(b) {
    if (S.t < lockedT) return;
    const no = (msg, wait) => { toast(msg); lockedT = S.t + (wait || 2.5); };
    if (S.phase === 'dusk' || S.phase === 'night') return no('いまは だめ！ ゾンビが くる · not now, zombies are coming');
    if (S.phase === 'title' || S.phase === 'greet') return;
    if (S.cur && !S.cur.waiting) return no('しごと ちゅう · finish the job first');
    if (dogBusy()) return no('いぬを まって · the dog is busy');
    const room = MAPS[b.room];
    changeMap(room.id, room.start);
  }

  // Saying hello near someone gets a hello back (each NPC has one line for now).
  // Saying hello to someone nearby starts today's chat with them (see js/characters.js):
  // a short exchange where they say something and you answer (はい / いいえ / a number / …).
  // One chat per person per day; finishing it raises your friendship.
  const CH = window.CHARACTERS || {};
  function talkToNearby() {
    let best = null, bd = 2.6;
    for (const n of MAP.npcs || []) {
      if (!n.hello && !CH[n.id]) continue;
      const d = Math.hypot(n.x - S.hero.x, n.y - S.hero.y);
      if (d < bd) { bd = d; best = n; }
    }
    if (!best) return false;
    best.bubble = '♪'; best.bubbleT = S.t + 1.5;
    const c = CH[best.id];
    if (best.id && !SV().friends[best.id]) { Save.friend(best.id, 0); }   // you've met them now
    if (questTalk(best)) return true;
    if (!c) { say(best.name, best.hello); if (best.id) gainFriend(best.id, 1); return true; }
    const who = best.id === 'hana' ? 'landlord' : c.name, d = SV(), st = (d.friends[best.id] || {}).stars || 0;
    // a core friend at three stars asks for their wish, or receives it
    if (c.wish && st >= 3 && !d.wishes[best.id]) {
      if (hasItem(c.wish.item)) return deliverWish(best.id, who), true;
      if (d.chatDay[best.id] === d.day) { say(who, c.wish.ask, { noRepeat: false }); return true; }
    }
    if (d.chatDay[best.id] === d.day) { say(who, pick(c.again)); return true; }
    const stage = st >= 3 ? d.day % 3 : Math.min(st, 2), turns = c.chats[stage] || c.chats[0];
    S.chat = { id: best.id, npc: best, who, turns, i: 0, wait: false, until: S.t + 40 };
    if (best.hello) { say(who, best.hello); after(2.6, () => chatTurn()); } else chatTurn();
    return true;
  }
  function chatTurn() {
    const ch = S.chat; if (!ch) return;
    const t = ch.turns[ch.i];
    if (!t) return endChat(true);
    say(ch.who, t.say); ch.npc.bubble = '？'; ch.npc.bubbleT = S.t + 2;
    ch.wait = !!t.want; ch.until = S.t + 30; ch.tries = 0;
    if (!t.want) after(2.6, () => { if (S.chat === ch) { ch.i++; chatTurn(); } });
  }
  // what you said, as a chat answer; returns false to let the dog hear it instead
  const CHAT_TYPES = { unknown: 1, none: 1, greet: 1, thanks: 1, yes: 1, no: 1, dunno: 1, number: 1, time: 1, name: 1, describe: 1, item: 1, dogname: 1 };
  function chatAnswer(r) {
    const ch = S.chat, t = ch && ch.turns[ch.i];
    if (!t || !ch.wait) return false;
    if (ch.boss) return bossAnswer(r);
    if (Math.hypot(ch.npc.x - S.hero.x, ch.npc.y - S.hero.y) > 4.5 || S.t > ch.until) { endChat(false); return false; }
    const w = t.want, reply = w[r.type] !== undefined ? w[r.type] : CHAT_TYPES[r.type] ? w.any : undefined;
    if (reply === undefined) {
      if (!CHAT_TYPES[r.type]) return false;   // a command for the dog
      if (++ch.tries >= 2) hint(Object.keys(w).filter((k) => k !== 'any').map((k) => ({ yes: 'はい', no: 'いいえ', greet: 'こんにちは', thanks: 'ありがとう', dunno: 'わからない', number: 'a number', time: 'a time' }[k] || k)).join(' / '));
      say(ch.who, '…ん？', { noRepeat: true });
      return true;
    }
    ch.wait = false; success();
    say(ch.who, reply);
    after(2.8, () => { if (S.chat === ch) { ch.i++; chatTurn(); } });
    return true;
  }
  function endChat(done) {
    const ch = S.chat; S.chat = null; if (!ch) return;
    if (ch.boss) hint('');
    if (!done) return;
    if (ch.boss) return bossEnd(ch);
    if (ch.quest) { gainFriend(ch.id, 1); questStepDone(); return; }
    SV().chatDay[ch.id] = SV().day;
    ch.npc.bubble = '♥'; ch.npc.bubbleT = S.t + 2;
    gainFriend(ch.id, 3);
    Save.save();
  }

  // people you've spoken with (friendship entries start the first time you talk; Hana from the first morning)
  function hasMet(id) { const d = SV(); return !!d.friends[id] || (id === 'hana' && d.story.met); }

  // ---------- the tablet: a bigger, more detailed copy of the phone app you have open ----------
  // The phone tells the TV which app is open and what's selected ({t:'view'}); the TV draws a
  // tablet-sized page with everything it knows about it. The controller and camera show none.
  const TABLET_APPS = { scrHome: 'スマホ · Overview', scrMsgs: 'メッセージ · Messages', scrMap: '地図 · Map', scrDiary: '日記 · Diary', scrJobs: '依頼 · Story and jobs', scrCall: '電話 · People', scrHouse: 'おうち · Home', scrSoon: '' };
  function tabletOpen() { return !!(S.view && TABLET_APPS[S.view.screen] && S.ready); }
  const tesc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const truby = (jp, kana) => (kana && kana !== jp ? '<ruby>' + tesc(jp) + '<rt>' + tesc(kana) + '</rt></ruby>' : tesc(jp));
  const tstars = (n) => '<span style="color:#b8860b">' + '★'.repeat(n || 0) + '☆'.repeat(3 - (n || 0)) + '</span>';
  const tbar = (pct, col) => '<div class="tbar"><i style="width:' + Math.max(0, Math.min(100, pct)) + '%' + (col ? ';background:' + col : '') + '"></i></div>';
  const spriteURL = {};
  function tsprite(name, h) {
    if (!name || !ATLAS[name] || !atlasReady) return '';
    if (!spriteURL[name]) { const m = ATLAS[name], c = document.createElement('canvas'); c.width = m[2]; c.height = m[3]; c.getContext('2d').drawImage(atlas, m[0], m[1], m[2], m[3], 0, 0, m[2], m[3]); spriteURL[name] = c.toDataURL(); }
    return '<img class="px" alt="" src="' + spriteURL[name] + '" style="height:' + (h || 3) + 'em">';
  }
  const mapShot = {};
  function tmapImage(id) {
    if (!mapShot[id]) { try { mapShot[id] = window.__game.overview(id); } catch (_) { mapShot[id] = ''; } }
    return mapShot[id] ? '<img class="px" alt="" src="' + mapShot[id] + '" style="width:100%;border:.12em solid #2b2a27;border-radius:.6em;background:#cfe3ea">' : '';
  }
  const fmtDate = (ms) => (ms ? new Date(ms).toLocaleDateString() : '—');
  function renderTablet() {
    const el = $('tablet');
    if (!tabletOpen()) { el.hidden = true; return; }
    el.hidden = false;
    const v = S.view, sel = v.sel || {};
    $('tablet-app').textContent = TABLET_APPS[v.screen] || '';
    let html = '';
    try {
      html = ({ scrHome: tHome, scrMsgs: tMsgs, scrMap: tMap, scrDiary: tDiary, scrJobs: tJobs, scrCall: tPeople, scrHouse: tHouse }[v.screen] || (() => '<p>…</p>'))(sel);
    } catch (e) { html = '<p>…</p>'; console.warn('tablet', e); }
    if ($('tablet-body').dataset.html !== html) {
      $('tablet-body').innerHTML = html; $('tablet-body').dataset.html = html;
      fitTablet();
      $('tablet-body').querySelectorAll('img').forEach((im) => { if (!im.complete) im.addEventListener('load', fitTablet, { once: true }); });
      setTimeout(fitTablet, 250);
    } else if (tabletOverflows()) fitTablet();
  }
  // Make the page fit with no scrolling: widen the tablet and use columns first, and only then
  // make the text a little smaller.
  // narrowest first; at each width try one column (good for grids of cards) before splitting into columns
  const TAB_SIZES = [{ w: 38, cols: 1 }, { w: 50, cols: 1 }, { w: 50, cols: 2 }, { w: 64, cols: 1 }, { w: 64, cols: 2 }, { w: 76, cols: 1 }, { w: 76, cols: 3 }, { w: 94, cols: 1 }, { w: 94, cols: 3 }];
  try { document.fonts && document.fonts.ready.then(() => fitTablet()); } catch (_) {}
  function tabletOverflows() { const b = $('tablet-body'); return b.scrollHeight > b.clientHeight + 1 || b.scrollWidth > b.clientWidth + 1; }
  function fitTablet() {
    const el = $('tablet'), body = $('tablet-body');
    if (el.hidden) return;
    const fits = () => body.scrollHeight <= body.clientHeight + 1 && body.scrollWidth <= body.clientWidth + 1;
    for (const scale of [1, 0.92, 0.85, 0.78, 0.72]) {
      for (const sz of TAB_SIZES) {
        el.style.width = sz.w + '%'; el.style.fontSize = (0.95 * scale) + 'em';
        body.classList.toggle('cols', sz.cols > 1); body.style.columnCount = sz.cols > 1 ? sz.cols : '';
        if (fits()) return;
      }
    }
  }
  // the job board and settings shrink their text a little if they ever get too tall
  function fitBox(el, base) {
    if (!el || el.hidden) return;
    for (const scale of [1, 0.92, 0.85, 0.78, 0.7]) {
      el.style.fontSize = (base * scale) + 'em';
      if (el.scrollHeight <= el.clientHeight + 1) return;
    }
  }
  // --- overview and stats ---
  function tHome() {
    const d = SV(), words = Object.entries(d.words || {}), strong = words.filter(([id]) => Save.fade(id) >= 60).length;
    const fr = Object.values(d.friends || {}), qi = questInfo();
    const perDay = {}; words.forEach(([, w]) => { if (w.firstDay) perDay[w.firstDay] = (perDay[w.firstDay] || 0) + 1; });
    const days = Object.keys(perDay).map(Number).sort((a, b) => a - b).slice(-7), maxN = Math.max(1, ...days.map((k) => perDay[k]));
    const st = (label, val, sub) => '<div class="tstat"><span class="tsub">' + label + '</span><b>' + val + '</b>' + (sub ? '<span class="tsub">' + sub + '</span>' : '') + '</div>';
    return '<div><h3>' + d.day + '日目 · ' + clockText(S.clock) + ' · ' + tesc(MAP.name) + '</h3><p class="tsub">' + partOfDay(S.clock) + '</p></div>' +
      (qi ? '<div class="tcard"><p class="tsub">第' + qi.chapter + '章 ' + tesc(qi.chapterName) + '</p><b>' + tesc(qi.jp) + '</b> · ' + tesc(qi.en) + '<p>' + tesc((qi.steps.find((x) => x.cur) || {}).jp || '') + '</p></div>' : '') +
      '<div class="tgrid">' + st('ことば · words', words.length, strong + ' strong') + st('しごと · jobs done', d.stats.jobsDone, d.stats.starsEarned + ' ★ earned') +
      st('なかま · friends', fr.filter((f) => f.stars >= 1).length, fr.filter((f) => f.stars >= 3).length + ' at ★★★') + st('お金 · yen', '¥' + d.yen, 'おやつ ' + Save.treatsLeft() + ' today') +
      st('クエスト · quests', qs().done.length + '/' + QUESTS.length, '') + st('しゃしん · photos', (d.photos || []).length, '') + st('かけら · scraps', d.scraps.length, (d.tricks || []).length + ' tricks') + st('おうち · furniture', d.house.furniture.length, '') + '</div>' +
      '<div class="tcard"><b>あたらしい ことば · New words per day</b>' + (days.length ? '<div style="display:flex;gap:.4em;align-items:flex-end;height:5em;margin-top:.5em">' +
        days.map((k) => '<div style="flex:1;text-align:center"><div style="background:#1d9e75;border:.1em solid #2b2a27;height:' + (perDay[k] / maxN) * 4 + 'em"></div><span class="tsub">' + k + '日 · ' + perDay[k] + '</span></div>').join('') + '</div>' : '<p class="tsub">No words yet.</p>') + '</div>' +
      '<div class="tcard"><b>さいきん · Recently heard</b>' + S.log.slice(-5).reverse().map((m) => '<div class="line' + (m.me ? ' me' : '') + '"><span class="who">' + tesc(m.who) + '</span><br>' + tesc(m.text) + '</div>').join('') + '</div>';
  }
  // --- messages: each line with the words it uses ---
  function lineWords(text) {
    return Words.wordsIn(text).map((id) => Words.gloss(id)).filter((w) => w.jp).map((w) => '<span class="chip2">' + truby(w.jp, w.kana) + ' ' + tesc(w.en) + '</span>').join('');
  }
  function tMsgs(sel) {
    const threads = []; S.log.forEach((m) => { if (!threads.includes(m.th)) threads.push(m.th); });
    if (!sel.thread) return '<h3>会話 · Conversations</h3>' + (threads.length ? threads.map((th) => {
      const ls = S.log.filter((m) => m.th === th), id = Object.keys(CH).find((k) => CH[k].name === th);
      return '<div class="tcard"><b>' + tesc(th) + '</b> <span class="tsub">' + ls.length + ' lines' + (id && CH[id].role ? ' · ' + tesc(CH[id].role) : '') + '</span><p>' + tesc(ls[ls.length - 1].text) + '</p></div>';
    }).join('') : '<p class="tsub">No messages yet.</p>');
    const ls = S.log.filter((m) => m.th === sel.thread), id = Object.keys(CH).find((k) => CH[k].name === sel.thread || (k === 'hana' && sel.thread === NAMES.landlord));
    return '<h3>' + tesc(sel.thread) + '</h3>' + (id ? '<p class="tsub">' + tesc(CH[id].role) + ' · ' + tesc(CH[id].personality || '') + '</p>' : '') +
      ls.map((m) => '<div class="line' + (m.me ? ' me' : '') + '"><span class="who">' + tesc(m.who) + ' · ' + (m.day || '') + '日目</span><br><span style="font-size:1.15em">' + tesc(m.text) + '</span>' +
        (m.me ? '' : '<div class="chips" style="margin-top:.2em">' + lineWords(m.text) + '</div>') + '</div>').join('');
  }
  // --- map: the whole area, who's there, and where the exits lead ---
  function tMap(sel) {
    const been = visited(), id = sel.area && MAPS[sel.area] && been[sel.area] ? sel.area : (MAP.parent || MAP.id), m = MAPS[id], fr = SV().friends, d = SV();
    const nm = m.name.split(' · ');
    const unmetHere = (m.npcs || []).filter((n) => n.id && !hasMet(n.id)).length;
    const people = (m.npcs || []).filter((n) => n.id && hasMet(n.id)).map((n) => { const f = fr[n.id] || {}, c = CH[n.id] || {}; return '<tr><td>' + tsprite(n.sprite, 2) + '</td><td><b>' + tesc(n.name || c.name) + '</b><br><span class="tsub">' + tesc(c.role || '') + '</span></td><td>' + tstars(f.stars) + (d.chatDay[n.id] === d.day ? '<br><span class="tsub">talked today ✓</span>' : '') + '</td></tr>'; }).join('');
    const rooms = (m.buildings || []).filter((b) => b.room && MAPS[b.room]).map((b) => '<span class="chip2">' + tesc(MAPS[b.room].name) + '</span>').join('');
    // roads to places you haven't been yet stay a mystery
    const exits = (m.exits || []).filter((e) => MAPS[e.to]).map((e) => {
      const open = !e.need || d.story[e.need] || d.explore, name = been[e.to] ? tesc(MAPS[e.to].name) : '？？？ <span class="tsub">not explored yet</span>';
      return '<li>' + (open ? '→ ' : '🔒 ') + name + (open || been[e.to] ? '' : ' <span class="tsub">(opens later in the story)</span>') + '</li>';
    }).join('');
    return '<h3>' + tesc(nm[0]) + ' <span class="tsub">' + tesc(nm[1] || '') + '</span></h3>' + (id === (MAP.parent || MAP.id) ? '<p class="tsub">📍 You are here' + (MAP.parent ? ' (inside ' + tesc(MAP.name) + ')' : '') + '</p>' : '') +
      tmapImage(id) + (people || unmetHere ? '<div class="tcard"><b>ひと · People</b>' + (people ? '<table>' + people + '</table>' : '') + (unmetHere ? '<p class="tsub">？？？ ' + unmetHere + ' ' + (unmetHere > 1 ? 'people' : 'person') + ' you haven\'t met yet</p>' : '') + '</div>' : '') +
      (rooms ? '<div class="tcard"><b>なか · Inside</b><div class="chips" style="margin-top:.3em">' + rooms + '</div></div>' : '') +
      (exits ? '<div class="tcard"><b>みち · Roads</b><ul style="margin:.3em 0 0;padding-left:1.1em">' + exits + '</ul></div>' : '');
  }
  // --- diary: word pages with examples, and scraps ---
  function examplesFor(w) {
    const keys = [w.jp, w.kana].filter((k) => k && k.length >= 2), out = [], seen = new Set();
    const addEx = (who, text) => { if (out.length >= 4 || seen.has(text) || !keys.some((k) => text.includes(k))) return; seen.add(text); out.push({ who, text }); };
    S.log.slice().reverse().forEach((m) => !m.me && addEx(m.who, m.text));
    for (const c of Object.values(CH)) {
      const all = [].concat(...(c.chats || []).map((ch) => ch.map((t) => t.say)), ...Object.values(c.idle || {}), c.dog || []);
      all.forEach((t) => addEx(c.name, t));
    }
    return out;
  }
  function tDiary(sel) {
    const d = SV();
    if (sel.seg === 'scraps' || sel.scrap !== undefined) {
      const list = d.scraps || [], i = sel.scrap !== undefined ? +sel.scrap : list.length - 1, x = list[i];
      return '<h3>かけら · Scraps (' + list.length + ')</h3>' + (x ? '<div class="tcard"><p class="tsub">Scrap #' + (i + 1) + ' · from ' + tesc(x.from) + ' · day ' + (x.day || '') + '</p><p class="big">' + (x.html || tesc(x.jp)) + '</p><p><b>' + tesc(x.en) + '</b></p><p>' + tesc(x.note || '') + '</p>' + (x.trick ? '<p>🐕 Say it to the dog and it ' + tesc(x.trick) + '.</p>' : '') + '<div class="chips">' + lineWords(x.jp) + '</div></div>' : '<p class="tsub">No scraps yet. Deliver a friend\'s wish to get one.</p>') +
        list.map((s, k) => '<div class="tcard' + (k === i ? ' sel' : '') + '">' + (s.html || tesc(s.jp)) + ' <span class="tsub">' + tesc(s.en) + '</span></div>').join('');
    }
    if (sel.word && d.words[sel.word]) {
      const w = Object.assign(Words.gloss(sel.word), d.words[sel.word]), str = Math.round(Save.fade(sel.word)), ex = examplesFor(w);
      const kanji = [...(w.jp || '')].filter((c) => /[一-鿿]/.test(c));
      return '<div class="row2"><div style="flex:1"><p class="big">' + truby(w.jp, w.kana) + '</p><p><b>' + tesc(w.en) + '</b> · <span class="tsub">' + tesc(w.cat) + '</span></p></div>' + (w.sprite ? tsprite(w.sprite, 5) : '') + '</div>' +
        '<div class="tgrid"><div class="tstat"><span class="tsub">聞いた · heard</span><b>' + w.heard + '</b></div><div class="tstat"><span class="tsub">言った · said</span><b>' + w.said + '</b></div>' +
        '<div class="tstat"><span class="tsub">はじめて · first met</span><b>' + (w.firstDay ? w.firstDay + '日目' : '—') + '</b></div><div class="tstat"><span class="tsub">さいご · last used</span><b style="font-size:1em">' + fmtDate(w.last) + '</b></div></div>' +
        '<div class="tcard"><b>つよさ · Strength ' + str + '%</b>' + tbar(str) + '<p class="tsub">Saying a word adds 8, hearing it adds 2; it fades about 10 a day unused.' + (w.said ? '' : ' Try saying this one!') + '</p></div>' +
        (kanji.length ? '<div class="tcard"><b>かんじ · Written with</b><div class="chips" style="margin-top:.3em">' + kanji.map((k) => '<span class="chip2" style="font-size:1.4em">' + k + '</span>').join('') + '</div><p class="tsub">Read together as ' + tesc(w.kana || w.jp) + '.</p></div>' : '') +
        '<div class="tcard"><b>れいぶん · Heard in</b>' + (ex.length ? ex.map((e) => '<div class="line"><span class="who">' + tesc(e.who) + '</span><br>' + tesc(e.text) + '</div>').join('') : '<p class="tsub">No example yet.</p>') + '</div>';
    }
    const words = Object.entries(d.words || {}).map(([id, w]) => Object.assign(Words.gloss(id), w, { str: Math.round(Save.fade(id)) }));
    const cats = {}; words.forEach((w) => (cats[w.cat] = (cats[w.cat] || 0) + 1));
    const fading = words.filter((w) => w.str < 30).sort((a, b) => a.str - b.str).slice(0, 8), strong = words.sort((a, b) => b.str - a.str).slice(0, 8);
    const list = (ws) => ws.map((w) => '<span class="chip2">' + truby(w.jp, w.kana) + ' · ' + w.str + '%</span>').join('');
    return '<h3>ことば · Words (' + words.length + ')</h3><div class="chips">' + Object.entries(cats).map(([c, n]) => '<span class="chip2">' + tesc(c) + ' ' + n + '</span>').join('') + '</div>' +
      '<div class="tcard"><b>つよい · Strongest</b><div class="chips" style="margin-top:.3em">' + (list(strong) || '<span class="tsub">—</span>') + '</div></div>' +
      '<div class="tcard"><b>わすれそう · Fading: practise these</b><div class="chips" style="margin-top:.3em">' + (list(fading) || '<span class="tsub">Nothing fading.</span>') + '</div></div>' +
      '<p class="tsub">Tap a word on your phone to see its page here.</p>';
  }
  // --- story and jobs ---
  function tJobs(sel) {
    const s = qs(), jobs = board().jobs || [];
    if (sel.job) {
      const j = jobs.find((x) => x.id === sel.job);
      if (j) return '<h3>' + tesc(j.title) + ' <span class="tsub">' + tesc(j.en) + '</span></h3><div class="tcard"><p>依頼人 · From <b>' + tesc(j.client === 'hana' ? NAMES.landlord : npcName(j.client)) + '</b></p><p class="big" style="font-size:1.6em">' + tesc(j.brief || j.title) + '</p><p>' + tesc(j.goal) + '</p>' +
        '<p>Reward ¥' + j.reward.yen + (j.reward.treats ? ' + おやつ ' + j.reward.treats : '') + ' · ' + tesc(j.state) + (j.stars ? ' · ' + tstars(j.stars) : '') + '</p><div class="chips">' + lineWords(j.brief || j.title) + '</div></div>' +
        '<p class="tsub">Stars: three for no mistakes, fewer for each miss. Friendship with the client grows by two per star.</p>';
    }
    let html = '<h3>メインストーリー · Main story</h3><p class="tsub">' + s.done.length + ' of ' + QUESTS.length + ' quests done</p>';
    for (let c = 0; c <= 5; c++) {
      const qsIn = QUESTS.map((q, i) => ({ q, i })).filter((x) => x.q.chapter === c); if (!qsIn.length) continue;
      const started = qsIn.some((x) => x.i <= s.i);
      if (!started) { html += '<div class="tcard done"><b>第' + c + '章 ' + tesc(CHAPTERS[c]) + '</b> <span class="tsub">· ' + qsIn.length + ' quests ???</span></div>'; continue; }
      html += '<div class="tcard"><b>第' + c + '章 ' + tesc(CHAPTERS[c]) + '</b>' + qsIn.map(({ q, i }) => {
        const st = i < s.i ? 'done' : i === s.i ? 'cur' : '';
        return '<div class="line ' + st + '">' + (i < s.i ? '✓ ' : i === s.i ? '▶ ' : '· ') + (i <= s.i ? tesc(q.jp) + ' <span class="tsub">' + tesc(q.en) + '</span>' : '<span class="tsub">???</span>') +
          (i === s.i ? '<ol style="margin:.3em 0 0">' + q.steps.map((stp, k) => '<li class="' + (k < s.step ? 'done' : k === s.step ? 'cur' : '') + '">' + tesc(stp.jp) + ' <span class="tsub">' + tesc(stp.en) + '</span></li>').join('') + '</ol>' : '') + '</div>';
      }).join('') + '</div>';
    }
    html += '<h3>きょうの しごと · Today\'s jobs</h3>' + jobs.map((j) => '<div class="tcard"><b>' + tesc(j.title) + '</b> <span class="tsub">' + tesc(j.en) + ' · ' + tesc(j.state) + '</span><br>' + tesc(j.goal) + '</div>').join('');
    return html;
  }
  // --- people: full profiles ---
  const NEXT = [5, 15, 30];
  function tPeople(sel) {
    const d = SV(), ids = Object.keys(CH);
    if (sel.person && CH[sel.person] && hasMet(sel.person)) {
      const id = sel.person, c = CH[id], f = d.friends[id] || { points: 0, stars: 0 }, nx = NEXT[f.stars], prev = f.stars ? NEXT[f.stars - 1] : 0;
      const where = Object.values(MAPS).find((m) => (m.npcs || []).some((n) => n.id === id)), npc = where && where.npcs.find((n) => n.id === id);
      const gift = c.gift, wish = c.wish, giftFor = gift && gift.extra ? ' + ' + gift.extra.en + ' (for ' + npcName(gift.extra.for) + ')' : '';
      const heard = S.log.filter((m) => m.th === c.name && !m.me).slice(-4);
      return '<div class="row2">' + (npc ? tsprite(npc.sprite, 5) : '') + '<div style="flex:1"><h3 style="font-size:1.5em">' + tesc(c.name) + '</h3><p class="tsub">' + tesc(c.role) + (where ? ' · 📍 ' + tesc(where.name) : '') + '</p><p>' + tstars(f.stars) + ' · ' + f.points + ' points</p></div></div>' +
        '<div class="tcard"><b>せいかく · Personality</b><p>' + tesc(c.personality || '') + '</p>' + (f.stars >= 1 ? '<p class="tsub">Quirk: ' + tesc(c.quirk || '') + '</p>' : '<p class="tsub">Quirk: reach ★ to find out</p>') + '</div>' +
        '<div class="tcard"><b>なかよし · Friendship</b>' + (nx ? tbar(((f.points - prev) / (nx - prev)) * 100, '#d9a400') + '<p class="tsub">' + (nx - f.points) + ' points to ★' + (f.stars + 1) + '. Daily chat +3, jobs +2 per star.</p>' : '<p>Best friends ★★★</p>') +
        '<p class="tsub">' + (d.chatDay[id] === d.day ? 'Talked today ✓' : 'Say こんにちは to them today') + '</p></div>' +
        '<div class="tcard"><b>プレゼント · Their ★★★ gift</b><div class="row2">' + (f.stars >= 3 ? tsprite(gift.sprite, 3) + '<p>' + tesc(gift.en) + tesc(giftFor) + '</p>' : '<p class="tsub">??? (at ★★★)</p>') + '</div></div>' +
        (wish ? '<div class="tcard"><b>ねがい · Their wish</b><p>' + (d.wishes[id] ? '✓ ' + tesc(wish.item_en) + ' delivered · 「' + tesc(wish.scrap.jp) + '」' : f.stars >= 3 ? tesc(wish.item_en) + ' · ' + (hasItem(wish.item) ? 'you have it: say hello to give it!' : 'one of the townsfolk gives it at ★★★') : '<span class="tsub">??? (they\'ll tell you at ★★★)</span>') + '</p></div>' : '') +
        '<div class="tcard"><b>さいきん · Recently said</b>' + (heard.length ? heard.map((m) => '<div class="line">' + tesc(m.text) + '</div>').join('') : '<p class="tsub">Nothing yet this session.</p>') + '</div>';
    }
    const met = ids.filter(hasMet), unmet = ids.length - met.length;
    return '<h3>まちの ひと · Townsfolk <span class="tsub">' + met.length + ' met</span></h3><div class="tgrid">' + met.map((id) => {
      const c = CH[id], f = d.friends[id] || { stars: 0 }, where = Object.values(MAPS).find((m) => (m.npcs || []).some((n) => n.id === id)), npc = where && where.npcs.find((n) => n.id === id);
      return '<div class="tstat" style="text-align:center">' + (npc ? tsprite(npc.sprite, 3) : '') + '<br><b style="font-size:1em">' + tesc(c.name) + '</b>' + tstars(f.stars) + '<br><span class="tsub">' + tesc(c.role) + '</span></div>';
    }).join('') + (unmet ? '<div class="tstat" style="text-align:center;opacity:.6"><b>？？？</b><span class="tsub">' + unmet + ' more people to meet</span></div>' : '') + '</div>' +
      (met.length ? '<p class="tsub">Tap someone on your phone to see their page here.</p>' : '<p class="tsub">Say こんにちは to people around town to meet them.</p>');
  }
  // --- home: furniture and tricks ---
  function tHouse(sel) {
    const d = SV(), f = d.house.furniture || [], i = sel.furniture !== undefined ? +sel.furniture : -1, x = f[i];
    const tricks = (d.tricks || []).map((id) => Object.values(CH).find((c) => c.wish && c.wish.trick.id === id)).filter(Boolean);
    return (x ? '<div class="tcard"><div class="row2">' + tsprite(x.sprite, 6) + '<div><h3>' + tesc(x.en) + '</h3><p>From ' + tesc(npcName(x.from)) + ' · day ' + (x.day || '') + '</p>' + (x.for ? '<p>' + (x.given ? '✓ Given to ' : 'For ') + tesc(npcName(x.for)) + '</p>' : '') + '</div></div></div>' : '') +
      '<h3>かぐ · Furniture (' + f.length + ')</h3><div class="tgrid">' + (f.length ? f.map((y, k) => '<div class="tstat' + (k === i ? ' sel' : '') + (y.given ? ' done' : '') + '" style="text-align:center">' + tsprite(y.sprite, 3) + '<br>' + tesc(y.en) + '<br><span class="tsub">from ' + tesc(npcName(y.from)) + '</span></div>').join('') : '<p class="tsub">Nothing yet. Friends give furniture at ★★★.</p>') + '</div>' +
      '<h3>いぬの とくぎ · Dog tricks (' + tricks.length + ')</h3>' + (tricks.length ? tricks.map((c) => '<div class="tcard"><p class="big" style="font-size:1.5em">' + (c.wish.scrap.html || tesc(c.wish.scrap.jp)) + '</p><p>' + tesc(c.wish.scrap.en) + ' · <span class="tsub">' + tesc(c.wish.scrap.note) + '</span></p><p>🐕 The dog ' + tesc(c.wish.trick.en) + '.</p></div>').join('') : '<p class="tsub">Deliver a friend\'s wish to learn a trick.</p>');
  }

  // ---------- camera ----------
  // The phone's カメラ app shows a viewfinder cone in front of the hero. Taking a picture finds
  // what's inside the cone (things, people, animals, the ground), tags them with numbers, and sends
  // the photo and their Japanese names to the phone. New words go into the dictionary.
  const CAM_RANGE = 4.6, CAM_HALF = 36 * Math.PI / 180;
  function facing() {
    const h = S.hero; let fx = h.fx, fy = h.fy;
    if (fx === undefined) { const v = { up: [-1, -1], down: [1, 1], left: [-1, 1], right: [1, -1] }[h.dir] || [1, 1]; fx = v[0]; fy = v[1]; }
    const l = Math.hypot(fx, fy) || 1; return { x: fx / l, y: fy / l };
  }
  function turnHero(d) {
    const f = facing(), a = Math.atan2(f.y, f.x) + d * Math.PI / 4;
    S.hero.fx = Math.cos(a); S.hero.fy = Math.sin(a);
    // pick the sprite direction closest on screen: screen x ~ fx - fy, screen y ~ fx + fy
    const sx = S.hero.fx - S.hero.fy, sy = S.hero.fx + S.hero.fy;
    S.hero.dir = Math.abs(sx) > Math.abs(sy) ? (sx > 0 ? 'right' : 'left') : (sy > 0 ? 'down' : 'up');
  }
  function inCone(x, y) {
    const f = facing(), dx = x - S.hero.x, dy = y - S.hero.y, d = Math.hypot(dx, dy);
    if (d < 0.6) return d;
    if (d > CAM_RANGE) return -1;
    const cos = (dx * f.x + dy * f.y) / d;
    return cos >= Math.cos(CAM_HALF) ? d : -1;
  }
  function drawCameraCone() {
    if (!S.camera) return;
    const f = facing(), a0 = Math.atan2(f.y, f.x), pts = [scr(S.hero.x, S.hero.y)];
    for (let i = 0; i <= 8; i++) { const a = a0 - CAM_HALF + (2 * CAM_HALF * i) / 8; pts.push(scr(S.hero.x + Math.cos(a) * CAM_RANGE, S.hero.y + Math.sin(a) * CAM_RANGE)); }
    g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y))); g.closePath();
    g.fillStyle = 'rgba(255,255,255,0.16)'; g.fill();
    g.setLineDash([3, 2]); g.strokeStyle = 'rgba(43,31,51,0.7)'; g.lineWidth = 1; g.stroke(); g.setLineDash([]);
    const p = scr(S.hero.x, S.hero.y); bubble(p.x, p.y - 32, '📷');
  }
  function shoot() {
    if (S.shot || !S.ready) return;
    const seen = [], add = (key, x, y, extra) => {
      const d = inCone(x, y); if (d < 0) return;
      const w = Words.photoWord(key); if (!w) return;
      seen.push(Object.assign({ d, x, y }, w, extra || {}));
    };
    for (const p of MAP.props || []) add(p.sprite, p.x, p.y);
    for (const b of MAP.buildings || []) { const m = ATLAS[b.sprite]; if (m) add(b.sprite, b.x - (m[6] || 2) / 2, b.y - (m[7] || 2) / 2); }
    for (const n of MAP.npcs || []) add(n.sprite, n.x, n.y, { who: n.name || (CH[n.id] && CH[n.id].name) || '' });
    if (MAP.id === 'home') for (const it of S.items) if (!it.hidden && !it.held) add(it.id, it.x, it.y);
    add('dog', dog.x, dog.y);
    // nearest first, one of each word, at most six
    seen.sort((a, b) => a.d - b.d);
    const items = [], ids = new Set();
    for (const s of seen) { if (ids.has(s.id) || items.length >= 6) continue; ids.add(s.id); items.push(s); }
    // and the ground most of the picture shows
    const counts = {}, f = facing(), a0 = Math.atan2(f.y, f.x);
    for (let r = 1; r <= CAM_RANGE; r += 0.8) for (let k = -2; k <= 2; k++) {
      const a = a0 + (k * CAM_HALF) / 2, x = Math.floor(S.hero.x + Math.cos(a) * r), y = Math.floor(S.hero.y + Math.sin(a) * r);
      const ch = MAP.ground[y] && MAP.ground[y][x]; if (ch) counts[ch] = (counts[ch] || 0) + 1;
    }
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    const ground = top && Words.photoWord('t:' + top[0]);
    if (ground && !ids.has(ground.id)) items.push(Object.assign({ d: 99, ground: true }, ground));
    items.forEach((it, i) => { it.n = i + 1; it.isNew = !SV().words[it.id]; });
    S.shot = { items, at: S.t };
  }
  // draw the numbered tags on this frame, keep the picture, then flash
  function capturePhoto() {
    const shot = S.shot; S.shot = null;
    g.font = '8px DotGothic16, monospace';
    for (const it of shot.items) {
      if (it.ground) continue;
      const p = scr(it.x, it.y), y = p.y - 26;
      g.fillStyle = '#d9533c'; g.beginPath(); g.arc(p.x, y, 5, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#fff8e7'; g.lineWidth = 1; g.stroke();
      g.fillStyle = '#fff8e7'; g.fillText(String(it.n), p.x - 2, y + 3);
    }
    let img = '', thumb = '';
    try {
      img = cv.toDataURL('image/jpeg', 0.8);
      const t = document.createElement('canvas'); t.width = 160; t.height = 90;
      t.getContext('2d').drawImage(cv, 0, 0, 160, 90); thumb = t.toDataURL('image/jpeg', 0.6);
    } catch (_) {}
    S.flash = 1;
    const items = shot.items.map((it) => ({ id: it.id, jp: it.jp, kana: it.kana, en: it.en, cat: it.cat, sprite: it.sprite, who: it.who || '', n: it.n, isNew: it.isNew, ground: !!it.ground }));
    items.forEach((it) => Save.word(it.id, 'heard'));
    Save.skill('camera');
    const d = SV(); d.photos = d.photos || [];
    d.photos.push({ day: d.day, clock: Math.floor(S.clock), map: MAP.name.split(' · ')[0], thumb, items });
    if (d.photos.length > 24) d.photos.shift();
    Save.save();
    const fresh = items.filter((it) => it.isNew);
    toast('📷 ' + (items.length ? items.map((it) => it.jp).join('、') : 'なにも ない… nothing in the picture') + (fresh.length ? '  · new: ' + fresh.length : ''));
    const msg = { t: 'photo', img, items, map: MAP.name.split(' · ')[0], day: d.day, clock: clockText(S.clock) };
    net.broadcast(msg); window.__lastPhoto = msg;
    lastState = '';
  }
  function drawCameraFlash() {
    if (!S.flash) return;
    g.fillStyle = 'rgba(255,255,255,' + S.flash.toFixed(2) + ')'; g.fillRect(0, 0, W, H);
    S.flash = Math.max(0, S.flash - 0.08);
  }

  // ---------- the main story (js/quests.js) ----------
  // One quest at a time, one step at a time. Steps finish by themselves (a flag, reaching a map,
  // jobs or friendships) or through a scene: talking to someone, telling the dog a new word, or a
  // conversation boss. Finishing a quest pays a reward and starts the next.
  const QUESTS = window.QUESTS || [];
  const CHAPTERS = ['到着 · Arrival', '新生活 · Settling in', '友だち · Making friends', 'なぞ · The mystery begins', 'まちの 一員 · Part of the town', '地元 · Local'];
  function qs() { const d = SV(); if (!d.quest || typeof d.quest !== 'object') d.quest = { i: 0, step: 0, base: {}, done: [], stepDone: false, bossLost: {} }; d.quest.bossLost = d.quest.bossLost || {}; return d.quest; }
  function curQuest() { return QUESTS[qs().i] || null; }
  function curStep() { const q = curQuest(); return q ? q.steps[qs().step] || null : null; }
  function stepIsDone(st) {
    const d = SV(), b = qs().base || {};
    switch (st.type) {
      case 'flag': return !!d.story[st.flag];
      case 'go': return MAP.id === st.map || MAP.parent === st.map;
      case 'jobs': return d.stats.jobsDone - (b.jobs || 0) >= st.n;
      case 'friends': return Object.values(d.friends).filter((f) => f.stars >= st.stars).length >= st.n;
      default: return !!qs().stepDone;
    }
  }
  function questCheck() {
    if (!S.ready || !QUESTS.length) return;
    for (let guard = 0; guard < 40; guard++) {
      const st = curStep(); if (!st || !stepIsDone(st)) break;
      const q = curQuest(), s = qs();
      s.stepDone = false; s.step++; s.base = { jobs: SV().stats.jobsDone, day: SV().day };
      if (s.step >= q.steps.length) {
        s.done.push(q.id); s.i++; s.step = 0;
        const rw = q.reward || {};
        SV().yen += rw.yen || 0; SV().treats += rw.treats || 0;
        toast('✔ ' + q.jp + (rw.yen ? '  +¥' + rw.yen : '') + (rw.treats ? '  +おやつ ' + rw.treats : '') + (q.done ? '  ' + q.done : ''));
        const nq = curQuest();
        if (nq) after(3.6, () => toast((nq.chapter !== q.chapter ? '第' + nq.chapter + '章 ' + CHAPTERS[nq.chapter] + ' · ' : '新しい クエスト: ') + nq.jp + ' · ' + nq.en));
      }
      Save.save(); syncBoard();
    }
  }
  function questStepDone() { qs().stepDone = true; questCheck(); }
  // saying hello to the person the current step is about plays their scene instead of a daily chat
  function questTalk(n) {
    const st = curStep(); if (!st || st.npc !== n.id || (st.type !== 'talk' && st.type !== 'boss')) return false;
    const c = CH[n.id], who = n.id === 'hana' ? 'landlord' : (c && c.name) || n.name;
    if (st.time === 'evening' && S.clock < 17 * 60) { say(who, '…'); toast('…コンは ゆうがたに あらわれる · come back in the evening'); return true; }
    if (st.type === 'boss' && qs().bossLost[n.id] === SV().day) { say(who, st.lose); return true; }
    S.chat = { id: n.id, npc: n, who, turns: st.turns, i: 0, wait: false, until: S.t + 60, quest: true };
    if (st.type === 'boss') { S.chat.boss = { trust: 40, need: st.need || 60, require: st.require || [], used: {}, st }; bossMeter(); }
    chatTurn();
    return true;
  }
  // ---------- conversation bosses: a trust meter instead of HP ----------
  const RX = {
    question: /(なに|なん|どこ|だれ|いつ|どう|どれ|どの|いくら|なぜ|か[？?]?$|[？?])/,
    past: /(ました|でした|かった|った|いた|んだ|だった|た$|た[。、 ]|てた)/,
    polite: /(ます|です|ください|おねがい|お願い|ございます)/
  };
  function bossMeter() {
    const b = S.chat && S.chat.boss; if (!b) return;
    const n = Math.round(b.trust / 20);
    hint('しんらい ' + '■'.repeat(n) + '□'.repeat(5 - n) + '   ' + (b.st.hint || ''));
  }
  function bossAnswer(r) {
    const ch = S.chat, b = ch.boss, t = ch.turns[ch.i], w = t.want || {};
    const text = Words.norm(r.text || '');
    for (const k of Object.keys(RX)) if (RX[k].test(text)) b.used[k] = true;
    let key = Object.keys(w).find((k) => k !== 'any' && (RX[k] ? RX[k].test(text) : r.type === k));
    if (!key && w.any && CHAT_TYPES[r.type]) key = 'any';
    if (!key) {
      if (!CHAT_TYPES[r.type]) return false;   // a dog command
      b.trust = Math.max(0, b.trust - 15); ch.tries = (ch.tries || 0) + 1; bossMeter();
      say(ch.who, '…ん？', { noRepeat: true });
      if (ch.tries >= 2) { ch.wait = false; after(1.8, () => { if (S.chat === ch) { ch.i++; chatTurn(); } }); }
      return true;
    }
    b.trust = Math.min(100, b.trust + (key === 'any' ? 10 : 30)); bossMeter();
    ch.wait = false; success(); ch.tries = 0;
    say(ch.who, w[key]);
    after(2.8, () => { if (S.chat === ch) { ch.i++; chatTurn(); } });
    return true;
  }
  function bossEnd(ch) {
    const b = ch.boss, st = b.st, missing = b.require.filter((k) => !b.used[k]);
    after(0.4, () => {
      if (b.trust >= b.need && !missing.length) {
        say(ch.who, st.win);
        if (st.flag) SV().story[st.flag] = true;
        gainFriend(ch.id, 3);
        after(4, () => questStepDone());
      } else {
        say(ch.who, st.lose);
        qs().bossLost[ch.id] = SV().day; Save.save();
        toast(missing.length ? 'Try again tomorrow · remember to use: ' + missing.map((k) => ({ question: 'a question (なに / どこ / …か？)', past: 'the past tense (〜ました / 〜た)', polite: 'polite words (〜ます / ください)' }[k])).join(', ') : 'Try again tomorrow · answer each question more exactly');
      }
    });
  }
  // a new word for the dog, said in the right place
  function questSay(text) {
    const st = curStep(); if (!st || st.type !== 'say') return false;
    const t = Words.norm(text);
    if (!st.words.some((w) => t.includes(Words.norm(w)))) return false;
    if (MAP.id !== st.map && MAP.parent !== st.map) { dogMood('？'); toast('ここ じゃない · try it in ' + (MAPS[st.map] ? MAPS[st.map].name : st.map)); return true; }
    if (dogBusy()) { dogMood('…'); return true; }
    dog.trick = { id: st.anim, until: S.t + 3.5, from: { x: dog.x, y: dog.y } };
    dogMood('！', 3); Save.skill('verb:' + st.anim);
    after(3.6, questStepDone);
    return true;
  }
  function questInfo() {
    const q = curQuest(); if (!q) return null;
    const s = qs();
    return { chapter: q.chapter, chapterName: CHAPTERS[q.chapter], jp: q.jp, en: q.en, done: s.done.length, total: QUESTS.length,
      steps: q.steps.map((st, i) => ({ jp: st.jp, en: st.en, done: i < s.step, cur: i === s.step })) };
  }

  // ---------- friendship rewards ----------
  const STAR_PAY = { 1: { yen: 100, treats: 1 }, 2: { yen: 200, treats: 2 }, 3: { yen: 300, treats: 3 } };
  function npcName(id) { return (CH[id] && CH[id].name) || Jobs.NPC[id] || id; }
  function gainFriend(id, pts) {
    const up = Save.friend(id, pts);
    if (up) after(3.2, () => levelUp(id, up));
    return up;
  }
  function levelUp(id, stars) {
    const pay = STAR_PAY[stars] || STAR_PAY[1], c = CH[id];
    SV().yen += pay.yen; SV().treats += pay.treats;
    toast(npcName(id) + 'と なかよし ' + '★'.repeat(stars) + '  +¥' + pay.yen + '  +おやつ ' + pay.treats);
    const near = c && (MAP.npcs || []).find((n) => n.id === id);
    if (c && c.stars && c.stars[stars] && near) say(id === 'hana' ? 'landlord' : c.name, c.stars[stars]);
    if (stars >= 3 && c && c.gift) after(near ? 3.4 : 0, () => giveGift(id));
    Save.save(); syncBoard();
  }
  function giveGift(id) {
    const c = CH[id], who = id === 'hana' ? 'landlord' : c.name;
    addFurniture(c.gift.sprite, c.gift.en, id);
    say(who, c.gift.line);
    if (c.gift.extra) after(3.4, () => { addFurniture(c.gift.extra.sprite, c.gift.extra.en, id, c.gift.extra.for); say(who, c.gift.extra.line); });
    after(c.gift.extra ? 7 : 3.4, () => toast('🎁 ' + c.gift.en + (c.gift.extra ? ' + ' + c.gift.extra.en : '') + ' → おうち'));
    Save.save();
  }

  // ---------- little lines when you walk past ----------
  // People mutter to themselves (by time of day) or react to the dog, in a speech bubble and
  // their own voice. Not too often: each person waits 25-40 s, and only one talks at a time.
  const pick = (a) => (Array.isArray(a) ? a[Math.floor(Math.random() * a.length)] : a);
  let ambientT = 0;
  function ambient() {
    if (!['day', 'morning', 'evening'].includes(S.phase) || S.chat || (S.cur && !S.cur.waiting) || S.t < ambientT || S.t - (S.lastSayT || 0) < 5) return;
    for (const n of MAP.npcs || []) {
      const c = CH[n.id]; if (!c || !c.idle) continue;
      if (Math.hypot(n.x - S.hero.x, n.y - S.hero.y) > 3.4) continue;
      // only people clearly on screen, with room for the bubble clear of the HUD boxes in the top corners
      const sp = scr(n.x, n.y);
      if (sp.y < 36 || sp.y > H - 75 || sp.x < 30 || sp.x > W - 30) continue;
      if (n.nextIdle === undefined) { n.nextIdle = S.t + 1 + Math.random() * 3; continue; }
      if (S.t < n.nextIdle) continue;
      const nearDog = Math.hypot(n.x - dog.x, n.y - dog.y) < 1.8 && c.dog && Math.random() < 0.6;
      const part = S.clock < 11 * 60 ? 'm' : S.clock < 16.5 * 60 ? 'd' : 'e';
      const pool = (nearDog ? c.dog : c.idle[part] || c.idle.d).filter((t) => t !== n.lastIdle);
      const text = pick(pool.length ? pool : c.idle.d); if (!text) continue;
      n.lastIdle = text; n.talk = { text, until: S.t + 2.5 + text.length * 0.12 };
      n.nextIdle = S.t + 25 + Math.random() * 15; ambientT = S.t + 8;
      const who = n.id === 'hana' ? 'landlord' : c.name;
      if (window.Voice) Voice.speak(who, text);
      Words.wordsIn(text).forEach((w) => Save.word(w, 'heard'));
      logLine({ th: c.name, who: c.name, text, day: SV().day });
      net.broadcast({ t: 'line', who: c.name, th: c.name, text, day: SV().day, aside: true });
      return;
    }
  }
  function addFurniture(sprite, en, from, wishFor) {
    SV().house.furniture.push({ sprite, en, from, for: wishFor || null, day: SV().day, given: false });
  }
  function hasItem(sprite) { return SV().house.furniture.some((f) => f.sprite === sprite && !f.given); }
  function deliverWish(id, who) {
    const c = CH[id], w = c.wish, d = SV();
    d.house.furniture.find((f) => f.sprite === w.item && !f.given).given = true;
    d.wishes[id] = true;
    say(who, w.deliver);
    after(3.5, () => {
      d.scraps.push(Object.assign({ from: c.name, trick: w.trick.en, trickId: w.trick.id, day: d.day }, w.scrap));
      if (!d.tricks.includes(w.trick.id)) d.tricks.push(w.trick.id);
      toast('かけら: 「' + w.scrap.jp + '」 · say it to the dog for a new trick!');
      Save.save(true);
    });
  }

  // ---------- dog tricks (say a wish scrap's pun) ----------
  const TRICK_MOOD = { futon: 'zZz', dolphin: '≈≈', latte: '☕', traffic: 'ピッ', vanish: '…' };
  function trickIn(text) {
    const t = Words.norm(text);
    for (const c of Object.values(CH)) {
      const tr = c.wish && c.wish.trick;
      if (tr && tr.say.some((s) => t.includes(Words.norm(s)))) return tr;
    }
    return null;
  }
  function doTrick(tr) {
    if (!SV().tricks.includes(tr.id)) { dogMood('？'); toast('いぬは まだ しらない · the dog doesn\'t know that trick yet'); return; }
    if (dogBusy()) { dogMood('…'); return; }
    dog.trick = { id: tr.id, until: S.t + 4, from: { x: dog.x, y: dog.y } };
    dogMood(TRICK_MOOD[tr.id] || '!', 3.5);
    toast('いぬは ' + tr.en + '!');
    Save.skill('trick:' + tr.id);
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
    setClock(SV().clock || DAY_START); S.dayOver = false;
    markVisited();
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
    S.phase = 'dusk'; S.items.forEach((i) => (i.glow = false)); showBoard(false); setClock(Math.max(S.clock, 18 * 60 + 30));
    say('landlord', 'よるに なると… ゾンビが くるよ。');
    S.nightTarget = 1;
    after(4.5, () => { S.phase = 'night'; S.wave = 0; setClock(21 * 60); startWave(); });
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
    S.phase = 'morning'; S.nightTarget = 0; hint(''); setClock(6 * 60 + 30);
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
    // the current quest's new dog word
    if (questSay(text)) { heard(text, 'quest', true, 'quest'); return; }
    // a pun from a wish scrap makes the dog do its trick
    const tr = trickIn(text);
    if (tr) { doTrick(tr); heard(text, 'trick', true, 'trick'); return; }
    // in the middle of a chat, answers go to the person you're talking to
    if (S.chat && r.type !== 'repeat' && r.type !== 'slow' && chatAnswer(r)) { heard(text, LABEL[r.type] || '', true, r.type); return; }
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
          SV().story.met = true; S.phase = 'day'; Save.friend('hana', 0); Save.save(true);
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
    // with "townsfolk answer anything" on, whoever you're next to answers in character
    if (cfg.enabled && cfg.npcChat && S.phase !== 'night' && S.phase !== 'title') {
      const n = nearestPerson(3.2);
      if (n) return personAI(cfg, n, text);
    }
    if (!cfg.enabled || S.phase === 'night' || S.phase === 'title') {
      dogMood('?'); say('landlord', 'ん？', { noRepeat: true, quiet: true });
      return false;
    }
    // Hana answers in a bubble over her head, so only when she's here
    const hana = (MAP.npcs || []).find((n) => n.id === 'hana');
    if (!hana) { dogMood('?'); return false; }
    hana.talk = { text: 'うーん…', until: S.t + 8 };
    logYou(NAMES.landlord, text);
    S.chatLog.push({ role: 'user', content: text });
    S.chatLog = S.chatLog.slice(-8);
    try {
      const reply = await AI.chat(cfg, LANDLORD_PROMPT, S.chatLog);
      const clean = String(reply || '').replace(/\s*\n\s*/g, ' ').trim().slice(0, 60);
      if (!clean) throw new Error('empty');
      S.chatLog.push({ role: 'assistant', content: clean });
      aiBubble(hana, 'landlord', NAMES.landlord, clean);
      return true;
    } catch (e) {
      console.warn('AI failed', e);
      hana.talk = { text: 'ん？ もう一回？', until: S.t + 3 };
      return false;
    }
  }

  // AI replies go in a speech bubble over the speaker (not the caption box), and are only heard
  // if VOICEVOX can voice them: no browser voice for AI lines.
  function aiBubble(n, who, name, text) {
    n.talk = { text, until: S.t + 4 + text.length * 0.18 };
    if (window.Voice) Voice.speak(who, text, { noBrowser: true });
    Words.wordsIn(text).forEach((w) => Save.word(w, 'heard'));
    logLine({ th: name, who: name, text, day: SV().day });
    S.lastTh = { th: name, t: S.t };
    net.broadcast({ t: 'line', who: name, th: name, text, day: SV().day, ai: true });
  }
  // your line goes into their message thread before their reply
  function logYou(th, text) {
    const m = { th, who: NAMES.you, me: true, text, day: SV().day };
    logLine(m); net.broadcast(Object.assign({ t: 'said' }, m)); S.aiSaid = text;
  }
  function nearestPerson(range) {
    let best = null, bd = range;
    for (const n of MAP.npcs || []) { if (!n.id || !CH[n.id]) continue; const d = Math.hypot(n.x - S.hero.x, n.y - S.hero.y); if (d < bd) { bd = d; best = n; } }
    return best;
  }
  // Who they are, for the AI: role, personality, quirk, how they talk (their own lines), how well
  // they know you, and where and when this is. They may not want to answer at all.
  function personPrompt(id) {
    const c = CH[id], d = SV(), f = d.friends[id] || { stars: 0 };
    const samples = [].concat(...(c.chats || []).map((ch) => ch.map((t) => t.say)), ...Object.values(c.idle || {})).slice(0, 8);
    const know = ['you have only just met the player', 'you know the player a little', 'you are friendly with the player', 'the player is one of your closest friends'][f.stars || 0];
    return [
      'You are ' + c.name + ', the ' + c.role + ' in 手ぶら町 (Tebura-chō), a small Japanese town in a language-learning game.',
      'Personality: ' + (c.personality || '') + '. Quirk: ' + (c.quirk || '') + '.',
      'This is how you talk (your own lines): ' + samples.map((s) => '「' + s + '」').join(' '),
      'Right now: ' + clockText(S.clock) + ' (' + partOfDay(S.clock) + '), at ' + MAP.name + '. ' + know + ' (friendship ' + (f.stars || 0) + ' of 3).',
      'The player is a beginner learning Japanese; he has no arms, and his dog fetches things for him. He just said something to you.',
      'Decide, as your character would, whether you even want to answer. If it is something you would not care about, would not know, or find rude or weird, you may brush it off, change the subject, give a short non-answer, or ignore it (reply "…").',
      'Reply ONLY with a JSON object: {"reply": "<what you say>", "interested": true or false}.',
      'The reply: one or two short sentences, under 40 characters, in simple casual Japanese the way you talk above, mostly hiragana with spaces between phrases like your lines. Never English or romaji. Never mention being an AI or a game.'
    ].join('\n');
  }
  async function personAI(cfg, n, text) {
    const c = CH[n.id], who = n.id === 'hana' ? 'landlord' : c.name;
    n.talk = { text: '…', until: S.t + 8 };
    logYou(c.name, text);
    S.aiLog = S.aiLog || {};
    const log = (S.aiLog[n.id] = (S.aiLog[n.id] || []).concat({ role: 'user', content: text }).slice(-8));
    try {
      const raw = await AI.chat(cfg, personPrompt(n.id), log, { json: true, tokens: 140, temperature: 0.8 });
      let reply = '', interested = true;
      try { const j = JSON.parse(String(raw).replace(/^[^{]*/, '').replace(/[^}]*$/, '')); reply = String(j.reply || ''); interested = j.interested !== false; }
      catch (_) { reply = String(raw || ''); }
      reply = reply.replace(/\s*\n\s*/g, ' ').trim().slice(0, 70) || '…';
      log.push({ role: 'assistant', content: JSON.stringify({ reply, interested }) });
      aiBubble(n, who, c.name, reply);
      // a real answer counts towards friendship, at most twice a day each
      const d = SV(); d.aiTalk = d.aiTalk || {};
      const k = n.id + ':' + d.day;
      if (interested && reply !== '…' && (d.aiTalk[k] || 0) < 2) { d.aiTalk[k] = (d.aiTalk[k] || 0) + 1; gainFriend(n.id, 1); }
      return interested;
    } catch (e) {
      console.warn('AI failed', e);
      n.talk = { text: '…ん？', until: S.t + 2.5 };
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

    tickClock(dt);
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
      h.fx = wx / wl; h.fy = wy / wl;   // which way the hero faces (for the camera)
      wx = (wx / wl) * sp * dt; wy = (wy / wl) * sp * dt;
      const ex = exitAt(h.x + wx, h.y + wy);
      if (ex) tryExit(ex);
      else if (wy < 0 && !walkable(h.x, h.y + wy)) { const b = doorAt(h.x, h.y); if (b) enterRoom(b); }
      if (walkable(h.x + wx, h.y)) h.x += wx;
      if (walkable(h.x, h.y + wy)) h.y += wy;
      h.dir = Math.abs(ix) > Math.abs(iy) * 0.8 ? (ix > 0 ? 'right' : 'left') : (iy > 0 ? 'down' : 'up');
      h.walk += dt * 9;
    }

    // dog
    if (dog.moodT > 0) dog.moodT -= dt; else dog.mood = null;
    dog.anim += dt * 10;
    if (dog.state === 'idle') dog.state = 'follow';
    if (S.chat && S.t > S.chat.until) endChat(false);
    if ((S.ambT = (S.ambT || 0) + dt) > 0.5) { S.ambT = 0; ambient(); }
    if ((S.qT = (S.qT || 0) + dt) > 1) { S.qT = 0; questCheck(); }
    if (dog.state === 'follow' && !(dog.trick && S.t < dog.trick.until)) moveToward(dog, h.x + 0.7, h.y + 0.7, 3.4, dt, 0.5);
    else if (dog.state === 'go') {
      if (dog.chase) { dog.tx = dog.chase.x; dog.ty = dog.chase.y; }
      if (moveToward(dog, dog.tx, dog.ty, 5, dt, dog.chase ? 0.25 : 0.08)) { const fn = dog.then; dog.then = null; dog.chase = null; dog.state = 'idle'; fn && fn(); }
    } else if (dog.state === 'harvest') {
      const H = S.harvest;
      if (!H) dog.state = 'follow';
      else if ((H.next -= dt) <= 0) {
        H.count++; H.pile.push(H.wrongVeg || S.cur.params.veg);
        speak(COUNTER[H.count] || String(H.count), 1.1, 'landlord');
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
    if (MAP.interior) {
      // rooms: centred left to right; up and down it follows you between the wall tops and the
      // front edge, keeping clear of the caption box at the bottom of the screen
      const left = iso(0, MH).x, right = iso(MW, 0).x, top = -WALL_H - 8, bottom = iso(MW, MH).y + 14;
      tx = right - left < W - 10 ? (left + right) / 2 - W / 2 : clamp(tx, left - 8, right - W + 8);
      ty = bottom - top < H * 0.72 ? top - 6 : clamp(ty, top - 4, Math.min(top + 24, bottom - H * 0.72));
    } else {
      tx = maxX < minX ? (minX + maxX) / 2 : clamp(tx, minX, maxX);
      ty = maxY < minY ? (minY + maxY) / 2 : clamp(ty, minY, maxY);
    }
    const k = snap ? 1 : Math.min(1, dt * 6);
    S.cam.x += (tx - S.cam.x) * k; S.cam.y += (ty - S.cam.y) * k;
  }

  function drawGround() {
    g.fillStyle = C.sky; g.fillRect(0, 0, W, H);
    // back to front so each tile's side (map edge only) is covered by the row in front
    for (let s = 0; s < MW + MH - 1; s++) {
      for (let y = Math.max(0, s - MW + 1); y <= Math.min(MH - 1, s); y++) {
        const x = s - y, ch = MAP.ground[y][x], key = TILE[ch];
        const p = scr(x, y);
        if (p.x - 16 > W || p.y > H || p.x + 16 < 0 || p.y + 26 < 0) continue;
        if (FLOOR[ch]) {
          drawFloor(ch, x, y, p);
          if (y === MH - 1) sideBand(scr(x, y + 1), scr(x + 1, y + 1), MAP.trim || C.woodD);
          if (x === MW - 1) sideBand(scr(x + 1, y + 1), scr(x + 1, y), MAP.trim || C.woodD);
          continue;
        }
        const m = ATLAS['t_' + key];
        if (TILE_FLIP[MAP.ground[y][x]]) { g.save(); g.translate(p.x + 16, p.y); g.scale(-1, 1); g.drawImage(atlas, m[0], m[1], m[2], m[3], 0, 0, m[2], m[3]); g.restore(); }
        else g.drawImage(atlas, m[0], m[1], m[2], m[3], p.x - 16, p.y, m[2], m[3]);
        // the island's base: one continuous band along the two front edges, no seams between tiles
        const e = ATLAS['t_' + key + '_edge'] || ATLAS.t_grass_edge;
        if (y === MH - 1) sideBand(scr(x, y + 1), scr(x + 1, y + 1), e[6]);
        if (x === MW - 1) sideBand(scr(x + 1, y + 1), scr(x + 1, y), e[7]);
      }
    }
    if (MAP.interior) { drawWalls(); drawDoormat(); }
    // dig spot / hole by the fence
    if (MAP.id !== 'home') return;
    if (S.hole) spr('dig_spot', SPOTS.fenceHole.x, SPOTS.fenceHole.y + 0.2);
    else if (S.phase === 'morning') { const p = scr(SPOTS.fenceHole.x, SPOTS.fenceHole.y); R(p.x - 5, p.y - 2, 10, 3, '#8a6a45'); }
  }

  // ---------- inside floors and walls (drawn in code, no tiles needed) ----------
  const FLOOR = {
    o: { top: '#c89a64', line: '#a77945' },   // wooden boards
    m: { top: '#d8cf8f', line: '#b3a865', edge: '#4e6b3a' },   // tatami
    q: { top: '#e7e1d4', line: '#c9c0ae' },   // tiled stone
    c: { top: '#cfcac0', line: '#b8b2a6' }    // shop concrete
  };
  function diamond(p) { g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(p.x + 16, p.y + 8); g.lineTo(p.x, p.y + 16); g.lineTo(p.x - 16, p.y + 8); g.closePath(); }
  function drawFloor(ch, x, y, p) {
    const f = FLOOR[ch];
    diamond(p); g.fillStyle = f.top; g.fill();
    g.strokeStyle = f.line; g.lineWidth = 1;
    if (ch === 'o') {   // boards run along x
      for (let i = 1; i < 4; i++) { const a = iso(x, y + i / 4), b = iso(x + 1, y + i / 4); g.beginPath(); g.moveTo(a.x - S.cam.x, a.y - S.cam.y + 0.5); g.lineTo(b.x - S.cam.x, b.y - S.cam.y + 0.5); g.stroke(); }
    } else if (ch === 'm') {   // tatami mats: one seam and a dark cloth border on alternate mats
      const a = iso(x + 0.5, y), b = iso(x + 0.5, y + 1);
      g.beginPath(); g.moveTo(a.x - S.cam.x, a.y - S.cam.y); g.lineTo(b.x - S.cam.x, b.y - S.cam.y); g.stroke();
      if ((x + y) % 2 === 0) { g.strokeStyle = f.edge; diamond({ x: p.x, y: p.y + 0.5 }); g.stroke(); }
    } else {   // tiles: a grout cross
      const a = iso(x + 0.5, y), b = iso(x + 0.5, y + 1), c = iso(x, y + 0.5), d = iso(x + 1, y + 0.5);
      g.beginPath(); g.moveTo(a.x - S.cam.x, a.y - S.cam.y); g.lineTo(b.x - S.cam.x, b.y - S.cam.y); g.moveTo(c.x - S.cam.x, c.y - S.cam.y); g.lineTo(d.x - S.cam.x, d.y - S.cam.y); g.stroke();
      diamond(p); g.stroke();
    }
  }
  const WALL_H = 46;
  // the two back walls: 'n' runs along x at y=0, 'w' runs along y at x=0
  function wallQuad(a, b, col) {
    g.fillStyle = col; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.lineTo(b.x, b.y - WALL_H); g.lineTo(a.x, a.y - WALL_H); g.closePath(); g.fill();
  }
  function shade(hex, k) {
    const n = parseInt(hex.slice(1), 16), f = (v) => Math.max(0, Math.min(255, Math.round(v * k)));
    return 'rgb(' + f(n >> 16) + ',' + f((n >> 8) & 255) + ',' + f(n & 255) + ')';
  }
  function drawWalls() {
    const o = scr(0, 0), n1 = scr(MW, 0), w1 = scr(0, MH), wall = MAP.wall || '#eadfca', trim = MAP.trim || C.woodD;
    wallQuad(o, n1, wall); wallQuad(w1, o, shade(wall, 0.86));
    // skirting and top edge
    for (const [a, b] of [[o, n1], [w1, o]]) {
      g.strokeStyle = trim; g.lineWidth = 3; g.beginPath(); g.moveTo(a.x, a.y - 1.5); g.lineTo(b.x, b.y - 1.5); g.stroke();
      g.strokeStyle = C.ink; g.lineWidth = 1; g.beginPath(); g.moveTo(a.x, a.y - WALL_H + 0.5); g.lineTo(b.x, b.y - WALL_H + 0.5); g.stroke();
    }
    g.strokeStyle = C.ink; g.beginPath(); g.moveTo(o.x + 0.5, o.y); g.lineTo(o.x + 0.5, o.y - WALL_H); g.stroke();
    // shoji: a thin wooden grid along the top of the walls
    if (MAP.shoji) for (const [a, b] of [[o, n1], [w1, o]]) {
      g.strokeStyle = shade(trim, 1.2); g.lineWidth = 1;
      g.beginPath(); g.moveTo(a.x, a.y - WALL_H + 9); g.lineTo(b.x, b.y - WALL_H + 9); g.stroke();
    }
    // windows show the sky at this time of day
    const sky = skyColor(S.clock);
    for (const w of MAP.windows || []) {
      const at = w.at, half = (w.w || 1.6) / 2;
      const a = w.wall === 'n' ? scr(at - half, 0) : scr(0, at + half), b = w.wall === 'n' ? scr(at + half, 0) : scr(0, at - half);
      const top = 34, bot = 14;
      g.fillStyle = sky; g.beginPath(); g.moveTo(a.x, a.y - bot); g.lineTo(b.x, b.y - bot); g.lineTo(b.x, b.y - top); g.lineTo(a.x, a.y - top); g.closePath(); g.fill();
      g.strokeStyle = trim; g.lineWidth = 2; g.stroke();
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      g.lineWidth = 1; g.beginPath(); g.moveTo(mx, my - bot); g.lineTo(mx, my - top); g.stroke();
    }
  }
  function drawDoormat() {
    const ex = (MAP.exits || [])[0]; if (!ex) return;
    const a = scr((ex.x0 + ex.x1) / 2 - 0.7, MH - 0.55), b = scr((ex.x0 + ex.x1) / 2 + 0.7, MH - 0.55);
    g.strokeStyle = '#8c3b2e'; g.lineWidth = 5; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
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

  function drawTrick(d) {
    const tr = d.trick, k = 1 - (tr.until - S.t) / 4, p = scr(d.x, d.y);
    if (tr.id === 'vanish') {
      // a swirl of leaves, gone, then back a little way off
      for (let i = 0; i < 8; i++) { const a = S.t * 6 + i * 0.8, r = 6 + k * 10; R(p.x + Math.cos(a) * r, p.y - 6 + Math.sin(a) * r * 0.5, 2, 2, i % 2 ? '#d98a3a' : '#7fb36b'); }
      if (k > 0.25 && k < 0.7) return true;
      if (k >= 0.7 && !tr.moved) { tr.moved = true; d.x = tr.from.x + 1.4; d.y = tr.from.y - 0.8; if (!walkable(d.x, d.y)) { d.x = tr.from.x; d.y = tr.from.y; } }
      return false;
    }
    if (tr.id === 'swim') { for (let i = 0; i < 5; i++) R(p.x - 12 + i * 6, p.y + 1 + Math.sin(S.t * 5 + i) * 1.5, 4, 1, '#7ec3e6'); spr('dog', d.x, d.y, { flip: Math.sin(S.t * 2) > 0, lift: 1 }); return true; }
    if (tr.id === 'jump') { spr('dog', d.x, d.y, { flip: d.face > 0, lift: Math.round(Math.abs(Math.sin(S.t * 5)) * 16) }); return true; }
    if (tr.id === 'climb') { spr('dog', d.x, d.y, { flip: d.face > 0, lift: Math.round(Math.min(1, k * 1.6) * 22) }); return true; }
    if (tr.id === 'sneak') { g.globalAlpha = 0.45; spr('dog', d.x + Math.sin(S.t) * 0.3, d.y, { flip: d.face > 0 }); g.globalAlpha = 1; return true; }
    if (tr.id === 'traffic') { spr('dog', d.x, d.y, { flip: Math.sin(S.t * 4) > 0, lift: 5 }); R(p.x - 1, p.y - 22, 2, 5, '#d9533c'); return true; }
    if (tr.id === 'dolphin') { for (let i = 0; i < 5; i++) R(p.x - 12 + i * 6, p.y + 1 + Math.sin(S.t * 5 + i) * 1.5, 4, 1, '#7ec3e6'); spr('dog', d.x, d.y, { flip: d.face > 0, lift: 2 + Math.round(Math.sin(S.t * 3)) }); return true; }
    if (tr.id === 'futon') { for (let i = 0; i < 4; i++) { R(p.x - 9, p.y - 4 - i * 3, 18, 3, C.ink); R(p.x - 8, p.y - 3 - i * 3, 16, 2, i % 2 ? '#f2b6c6' : '#f6f3ea'); } spr('dog', d.x, d.y, { flip: d.face > 0, lift: 13 }); return true; }
    if (tr.id === 'latte') { R(p.x + 8, p.y - 10, 9, 8, C.ink); R(p.x + 9, p.y - 9, 7, 6, '#c89a64'); R(p.x + 11, p.y - 8, 3, 3, '#f6f3ea'); spr('dog', d.x, d.y, { flip: false, lift: Math.abs(Math.round(Math.sin(S.t * 8))) }); return true; }
    return false;
  }
  function drawDog(d) {
    const moving = d.state === 'go' || d.state === 'follow';
    const hop = moving && Math.sin(d.anim) > 0.3 ? 1 : 0;
    shadow(d.x, d.y, 6);
    if (d.trick && S.t < d.trick.until) { if (drawTrick(d)) { if (d.mood) { const p = scr(d.x, d.y); bubble(p.x, p.y - 24, d.mood); } return; } }
    else if (d.trick) d.trick = null;
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

  let lateDraw = [];
  function drawNpc(n) {
    shadow(n.x, n.y, 6); spr(n.sprite, n.x, n.y);
    const p = scr(n.x, n.y);
    // speech is drawn after the lighting so it stays easy to read at dusk and night
    if (n.talk && n.talk.until > S.t) lateDraw.push(() => talkBubble(p.x, p.y - 30, n.talk.text));
    else if (n.bubble && n.bubbleT > S.t) lateDraw.push(() => bubble(p.x, p.y - 30, n.bubble));
  }
  // a speech bubble with a line of Japanese, wrapped to fit
  function talkBubble(x, y, text) {
    g.font = '8px DotGothic16, monospace';
    const words = text.split(' '), lines = [];
    let cur = '';
    for (const w of words) { const t = cur ? cur + ' ' + w : w; if (g.measureText(t).width > 96 && cur) { lines.push(cur); cur = w; } else cur = t; }
    if (cur) lines.push(cur);
    const w = Math.ceil(Math.max(...lines.map((l) => g.measureText(l).width))) + 8, h = lines.length * 10 + 4;
    const bx = Math.round(Math.max(2, Math.min(W - w - 2, x - w / 2)));
    // above the head if there's room clear of the HUD and hints at the top; otherwise below the feet
    const below = y - h < 58, by = Math.round(below ? y + 38 : y - h);
    R(bx, by, w, h, '#fff8e7'); g.strokeStyle = C.ink; g.lineWidth = 1; g.strokeRect(bx + 0.5, by + 0.5, w - 1, h - 1);
    if (below) { R(x - 2, by - 2, 4, 3, '#fff8e7'); R(x - 1, by - 3, 2, 1, C.ink); }
    else { R(x - 2, by + h - 1, 4, 3, '#fff8e7'); R(x - 1, by + h + 2, 2, 1, C.ink); }
    g.fillStyle = C.ink; lines.forEach((l, i) => g.fillText(l, bx + 4, by + 10 + i * 10));
  }
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
    // time-of-day colour: pink at dawn, gold in late afternoon, violet at dusk (softer indoors)
    const tint = dayTint(S.clock);
    if (tint) { g.fillStyle = MAP.interior ? tint.replace(/[\d.]+\)$/, (a) => (parseFloat(a) * 0.5).toFixed(3) + ')') : tint; g.fillRect(0, 0, W, H); }
    if (S.night > 0.02 && MAP.interior) {
      // indoors the lights are on: darker at the edges, warm in the middle
      g.fillStyle = 'rgba(40,34,70,' + (0.22 * S.night).toFixed(3) + ')'; g.fillRect(0, 0, W, H);
      g.fillStyle = 'rgba(255,200,120,' + (0.07 * S.night).toFixed(3) + ')'; g.fillRect(0, 0, W, H);
    } else if (S.night > 0.02) {
      g.fillStyle = 'rgba(24,26,72,' + (0.55 * S.night).toFixed(3) + ')'; g.fillRect(0, 0, W, H);
      // lamp and window glow
      const lp = MAP.id === 'home' ? scr(13.1, 13.4) : scr(2.6, 6.3);
      g.fillStyle = 'rgba(255,220,140,' + (0.22 * S.night).toFixed(3) + ')';
      g.beginPath(); g.ellipse(lp.x, lp.y - 2, 26, 13, 0, 0, Math.PI * 2); g.fill();
      const wp = scr(SPOTS.houseDoor.x - 1.4, SPOTS.houseDoor.y - 0.4);
      g.fillStyle = 'rgba(255,220,140,' + (0.18 * S.night).toFixed(3) + ')';
      g.beginPath(); g.ellipse(wp.x, wp.y + 4, 22, 9, 0, 0, Math.PI * 2); g.fill();
    }
    drawCameraCone();
    lateDraw.forEach((f) => f()); lateDraw = [];
  }

  // ---------- loop ----------
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!tabletOpen()) update(dt);   // the world pauses while the tablet panel is open
    updateCamera(dt); draw();
    if ((S.tabT = (S.tabT || 0) + dt) > 2) { S.tabT = 0; if (tabletOpen()) renderTablet(); }
    if (S.shot) capturePhoto();
    drawCameraFlash();
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
    const night = S.clock >= 19 * 60 || S.clock < 5 * 60;
    $('hud-clock').innerHTML = '<span class="sun" style="background:' + (night ? '#f2ecd2' : skyColor(S.clock)) + '"></span>' + clockText(S.clock) + ' <small>' + partOfDay(S.clock) + '</small>';
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
    const qi = curStep();
    $('hud-quest').textContent = qi ? '📜 ' + qi.jp : '';
    $('hud-quest').title = qi ? qi.en : '';
    $('hud-quest-en').textContent = qi ? qi.en : '';
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
  function showBoard(on) { $('board').hidden = !on; if (on) { renderBoard(); fitBox($('board'), 1); } }
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
    for (const [id, c] of Object.entries(CH)) n[id] = c.name;
    for (const m of Object.values(MAPS)) for (const p of m.npcs || []) if (p.id && p.name) n[p.id] = p.name;
    return n;
  }
  // Areas you've been to. Old saves didn't record this, so it's filled in from where you are now
  // and the areas your finished quests took you to.
  function visited() {
    const d = SV();
    if (!d.visited || typeof d.visited !== 'object') d.visited = { home: true };
    if (!d.visitedInit) {
      d.visitedInit = true;
      const q = d.quest || {};
      QUESTS.forEach((qu, i) => qu.steps.forEach((st, k) => { if (st.type === 'go' && (i < (q.i || 0) || (i === q.i && k < q.step))) d.visited[st.map] = true; }));
      if (d.visited.square || d.story.ch0done) d.visited.lane = true;
      if (d.visited.cafe) d.visited.river = true;
      if (d.visited.police) d.visited.rail = true;
      if (d.visited.shrine) d.visited.bamboo = true;
      if (d.visited.forest) d.visited.terrace = true;
    }
    return d.visited;
  }
  function markVisited() { const v = visited(), id = MAP.parent || MAP.id; if (!v[id]) { v[id] = true; Save.save(); } }
  function mapList() {
    const open = (ex) => ex.to && (!ex.need || SV().story[ex.need] || SV().explore);
    const seen = { home: true }, order = ['home'];
    for (let i = 0; i < order.length; i++) for (const ex of MAPS[order[i]].exits || []) if (open(ex) && MAPS[ex.to] && !seen[ex.to]) { seen[ex.to] = true; order.push(ex.to); }
    const been = visited();
    const all = order.concat(Object.keys(MAPS).filter((id) => !seen[id])).filter((id) => !MAPS[id].interior && been[id]);
    const fr = SV().friends || {};
    return all.map((id) => {
      const m = MAPS[id], nm = m.name.split(' · ');
      return { id, jp: nm[0], en: nm[1] || '', here: id === MAP.id || id === MAP.parent, open: !!seen[id],
        npcs: (m.npcs || []).filter((p) => p.id && hasMet(p.id)).map((p) => ({ name: p.name || npcName(p.id), stars: (fr[p.id] || {}).stars || 0 })), unmet: (m.npcs || []).filter((p) => p.id && !hasMet(p.id)).length };
    });
  }
  function phoneState() {
    const d = SV(), names = npcNames(), nm = MAP.name.split(' · ');
    return {
      t: 'state', day: d.day, phase: S.phase, phaseJp: PHASE_JP[S.phase] || '昼', yen: d.yen, treats: Save.treatsLeft(),
      quest: questInfo(),
      clock: Math.floor(S.clock), clockText: clockText(S.clock), part: partOfDay(S.clock), sky: skyColor(S.clock),
      map: { id: MAP.id, jp: nm[0], en: nm[1] || '' }, maps: mapList(),
      mapsHidden: Object.keys(MAPS).filter((id) => !MAPS[id].interior && !visited()[id]).length,
      job: S.cur ? { title: S.cur.title, goal: S.cur.goal } : null,
      dog: { busy: dogBusy(), carry: dog.carry || null },
      words: Object.entries(d.words || {}).map(([id, w]) => Object.assign(Words.gloss(id), { heard: w.heard, said: w.said, strength: Math.round(Save.fade(id)) })),
      camera: !!S.camera, photoCount: (d.photos || []).length,
      unmetPeople: Object.keys(CH).filter((id) => !hasMet(id)).length,
      friends: Object.entries(d.friends || {}).filter(([id]) => hasMet(id)).map(([id, f]) => ({ id, name: names[id] || id, role: (CH[id] && CH[id].role) || '', personality: (CH[id] && CH[id].personality) || '', quirk: (CH[id] && CH[id].quirk) || '', stars: f.stars, points: f.points, chatted: d.chatDay[id] === d.day })),
      furniture: (d.house.furniture || []).map((f) => ({ sprite: f.sprite, en: f.en, from: npcName(f.from), for: f.for ? npcName(f.for) : '', given: !!f.given })),
      tricks: (d.tricks || []).map((id) => { const c = Object.values(CH).find((x) => x.wish && x.wish.trick.id === id); return c ? { id, say: c.wish.scrap.jp, en: c.wish.trick.en } : { id }; }),
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
      const url = new URL('phone.html?room=' + code + Net.turnParams(), location.href).href;
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
    onLeave() { $('phones').textContent = net.count() + ' phone connected'; if (!net.count()) { S.view = null; renderTablet(); } },
    onMsg(d, c) {
      if (!d || typeof d !== 'object') return;
      if (d.t === 'move') { S.input.x = clamp(+d.x || 0, -1, 1); S.input.y = clamp(+d.y || 0, -1, 1); }
      else if (d.t === 'speech') {
        if (d.id && c) { try { c.send({ t: 'ack', id: d.id }); } catch (_) {} }
        handleSpeech(Array.isArray(d.alts) ? d.alts.slice(0, 6).map(String) : [String(d.text || '')]);
      }
      else if (d.t === 'replay') replay(!!d.slow);
      else if (d.t === 'camera') { S.camera = !!d.on; if (!S.camera) S.shot = null; }
      else if (d.t === 'view') { S.view = { screen: String(d.screen || ''), sel: d.sel && typeof d.sel === 'object' ? d.sel : {} }; renderTablet(); }
      else if (d.t === 'turn') turnHero(+d.d || 0);
      else if (d.t === 'shoot') shoot();
      else if (d.t === 'album' && c) { try { c.send({ t: 'album', photos: SV().photos || [] }); } catch (_) {} }
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
    $('ai-npc').checked = !!c.npcChat;
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
    c.npcChat = $('ai-npc').checked;
    const prev = c.provider;
    c.provider = $('ai-provider').value;
    c.ollamaUrl = $('ai-url').value.trim() || 'http://localhost:11434';
    c.model = $('ai-model').value.trim();
    if (prev !== 'ollama' && prev === c.provider) c.keys[c.provider] = $('ai-key').value.trim();
    return c;
  }
  $('gear').addEventListener('click', () => { fillSettings(); $('settings').hidden = false; fitBox($('settings'), 0.9); });
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
  // ---------- voice settings ----------
  function fillVoice() {
    const c = Voice.config;
    $('voice-url').value = c.engineUrl || ''; $('voice-files').checked = c.useFiles !== false;
    Voice.filesReady().then((n) => { if (!$('voice-status').textContent) $('voice-status').textContent = n ? n + ' voice files ready.' : 'No voice files yet: lines use VOICEVOX live (if set) or the browser voice.'; });
  }
  function readVoice() {
    const c = Voice.config, voices = Object.assign({}, c.voices);
    voices.landlord = $('voice-hana').value; voices.default = $('voice-default').value;
    Voice.setConfig({ engineUrl: $('voice-url').value.trim(), useFiles: $('voice-files').checked, voices });
  }
  ['voice-url', 'voice-files', 'voice-hana', 'voice-default'].forEach((id) => $(id).addEventListener('change', readVoice));
  $('voice-list').addEventListener('click', async () => {
    readVoice(); $('voice-status').textContent = 'Asking VOICEVOX for its voices…';
    try {
      const list = await Voice.speakers(), c = Voice.config.voices;
      const opts = '<option value="">default</option>' + list.map((v) => '<option value="' + v.id + '">' + v.id + ' · ' + v.name + '</option>').join('');
      $('voice-hana').innerHTML = opts; $('voice-default').innerHTML = opts;
      $('voice-hana').value = c.landlord || ''; $('voice-default').value = c.default || '';
      $('voice-status').textContent = list.length + ' voices. Voices picked here are used live; to make files with them, put the same ids in tools/voices.json.';
    } catch (e) { $('voice-status').textContent = "Couldn't reach VOICEVOX at that address (" + e.message + '). Is the engine running, and has this browser accepted its certificate?'; }
  });
  $('voice-test').addEventListener('click', async () => {
    readVoice(); $('voice-status').textContent = 'Playing…';
    const how = await Voice.speak('landlord', 'こんにちは！ きょうも いい てんき だね。');
    $('voice-status').textContent = { file: 'Played a voice file.', live: 'Played live from VOICEVOX.', browser: 'Played with the browser voice' + (Voice.lastError ? ' (VOICEVOX: ' + Voice.lastError + ')' : '') + '.' }[how] || '';
  });
  $('voice-missing').addEventListener('click', () => {
    const lines = Voice.missingLines();
    if (!lines.length) { $('voice-status').textContent = 'Every line heard so far has a voice file.'; return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(lines, null, 1)], { type: 'application/json' }));
    a.download = 'missing-lines.json'; a.click();
    $('voice-status').textContent = lines.length + ' lines saved. On the Mac: python3 tools/voicegen.py --lines missing-lines.json';
  });
  fillVoice();
  Voice.filesReady().then(() => { if (Voice.credits.length) { $('credits').textContent = '音声 · Voices: ' + Voice.credits.join('、'); $('credits').hidden = false; } });

  $('clock-speed').value = String(clockRate);
  $('clock-speed').addEventListener('change', () => { clockRate = +$('clock-speed').value; try { localStorage.setItem('unhandyman.clockRate', String(clockRate)); } catch (_) {} });
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
    setClock(min) { setClock(min); },
    gainFriend, talkToNearby, get chat() { return S.chat; }, questCheck, questInfo, qs,
    camera(on) { S.camera = !!on; }, shoot, turnHero,
    view(screen, sel) { S.view = { screen, sel: sel || {} }; renderTablet(); },
    get clock() { return S.clock; },
    hero: () => S.hero,
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
