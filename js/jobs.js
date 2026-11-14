// Handyman jobs: templates and the daily board (5 jobs, up to 3 taken at once).
(function (root) {
  const COUNTER = ['', 'ひとつ', 'ふたつ', 'みっつ', 'よっつ', 'いつつ', 'むっつ', 'ななつ', 'やっつ', 'ここのつ', 'とお'];
  const JP = {
    bucket: 'バケツ', key: 'かぎ', ball: 'ボール', shoe: 'くつ', persimmon: 'かき',
    tomato: 'トマト', carrot: 'にんじん', daikon: 'だいこん',
    shirt: 'シャツ', towel: 'タオル', sock: 'くつした',
    red: 'あかい', blue: 'あおい', yellow: 'きいろい', white: 'しろい', green: 'みどりの', pink: 'ピンクの'
  };
  const NPC = { hana: 'ハナさん', yamada: '山田さん' };
  const HOUSES = [
    { n: 1, name: 'tanaka', jp: '田中', kana: 'たなか' }, { n: 2, name: 'suzuki', jp: '鈴木', kana: 'すずき' },
    { n: 3, name: 'sato', jp: '佐藤', kana: 'さとう' }, { n: 4, name: 'yamamoto', jp: '山本', kana: 'やまもと' },
    { n: 5, name: 'ito', jp: '伊藤', kana: 'いとう' }, { n: 6, name: 'kimura', jp: '木村', kana: 'きむら' }
  ];
  const MAP_NAME = { home: '家と裏庭', lane: '裏道' };
  const hhmm = (t) => t.h + ':' + String(t.m).padStart(2, '0');
  const MAX_TAKEN = 3, BOARD_SIZE = 5;

  // Small seeded random, so a day's board is the same if the page reloads.
  function rng(seed) {
    let a = seed >>> 0;
    return function () { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const pick = (r, list) => list[Math.floor(r() * list.length)];

  // Prefer words the player has used least recently, so repeat jobs are review.
  function pickWord(r, ids, prefix) {
    const S = root.Save;
    const scored = ids.map((id) => ({ id, s: (S ? S.fade(prefix + id) : 0) + r() * 25 }));
    scored.sort((a, b) => a.s - b.s);
    return scored[0].id;
  }

  const TEMPLATES = {
    fetch: {
      title: '持ってきて', en: 'Fetch it', client: 'hana',
      make(r, day, forced) {
        const item = forced || pickWord(r, ['bucket', 'key', 'ball', 'shoe'], 'item:');
        return {
          params: { item },
          brief: JP[item] + '、持ってきて！',
          goal: JP[item] + ' を ハナさんに',
          reward: { yen: 100, treats: r() < 0.3 ? 1 : 0 },
          words: ['item:' + item, 'verb:fetch']
        };
      }
    },
    harvest: {
      title: 'やさいの しゅうかく', en: 'Vegetable harvest', client: 'hana',
      make(r, day) {
        const veg = pickWord(r, ['tomato', 'carrot', 'daikon'], 'item:');
        const top = Math.min(10, 3 + day);           // bigger numbers on later days
        const n = 2 + Math.floor(r() * (top - 1));
        return {
          params: { veg, n },
          brief: JP[veg] + 'を ' + COUNTER[n] + ' 掘って！',
          goal: JP[veg] + ' ×' + n,
          reward: { yen: 150, treats: r() < 0.4 ? 1 : 0 },
          words: ['item:' + veg, 'number:' + n, 'verb:dig', 'verb:wait']
        };
      }
    },
    laundry: {
      title: 'せんたくもの', en: 'Laundry rescue', client: 'hana',
      make(r, day) {
        const count = day <= 1 ? 3 : 4;
        const types = ['shirt', 'towel', 'sock'], colors = ['red', 'blue', 'yellow', 'white', 'green', 'pink'];
        const pieces = [], used = new Set();
        while (pieces.length < count) {
          const p = { type: pick(r, types), color: pick(r, colors) };
          if (used.has(p.type + p.color)) continue;
          used.add(p.type + p.color); pieces.push(p);
        }
        return {
          params: { pieces },
          brief: 'かぜ！ せんたくものが とんでる！',
          goal: 'せんたくもの ×' + count,
          reward: { yen: 200, treats: 1 },
          words: ['color:' + pieces[0].color, 'item:' + pieces[0].type, 'verb:fetch']
        };
      }
    }
  };

  // back lane jobs (after Chapter 0)
  TEMPLATES.post = {
    title: '郵便屋さん', en: 'Post round', client: 'hana', map: 'lane', speaker: 'phone',
    make(r) {
      const pool = HOUSES.slice().sort(() => r() - 0.5).slice(0, 3);
      return {
        params: { letters: pool.map((h) => ({ n: h.n, name: h.name, jp: h.jp, kana: h.kana })) },
        brief: 'もしもし？ てがみ、とどけて くれる？ 裏道の いえ だよ。',
        goal: 'てがみ ×3 (裏道)',
        reward: { yen: 180, treats: r() < 0.5 ? 1 : 0 },
        words: ['number:' + pool[0].n, 'name:' + pool[0].name]
      };
    }
  };
  TEMPLATES.stall = {
    title: '無人販売', en: 'Honesty stall', client: 'hana', map: 'lane', speaker: 'phone',
    make(r, day) {
      const veg = pick(r, ['tomato', 'carrot', 'daikon']);
      const price = 100 + Math.floor(r() * (day < 4 ? 10 : 30)) * 10;   // 100–190 at first, up to 390 later
      return {
        params: { veg, price },
        brief: 'もしもし？ 裏道の 無人販売で ' + JP[veg] + '、かって きて！',
        goal: JP[veg] + 'を かう (裏道)',
        reward: { yen: 150, treats: 1 },
        words: ['item:' + veg, 'word:yen']
      };
    }
  };
  TEMPLATES.bus = {
    title: 'バスの時間', en: 'Bus times', client: 'yamada', map: 'lane', speaker: 'yamada',
    make(r) {
      const start = 7 + Math.floor(r() * 5), off = pick(r, [0, 10, 20]);
      const times = [0, 1, 2, 3, 4].map((i) => { const t = start * 60 + off + i * 30; return { h: Math.floor(t / 60), m: t % 60 }; });
      const nowMin = start * 60 + off + 5 + Math.floor(r() * 4) * 5;
      const now = { h: Math.floor(nowMin / 60), m: nowMin % 60 };
      return {
        params: { times, now },
        brief: 'すみません… つぎの バスは なんじ？',
        goal: 'バスの じかん (裏道)',
        reward: { yen: 120, treats: r() < 0.4 ? 1 : 0 },
        words: ['word:time']
      };
    }
  };

  function makeJob(kind, r, day, forced, n) {
    const t = TEMPLATES[kind], m = t.make(r, day, forced);
    return { id: 'd' + day + '-' + n + '-' + kind, kind, title: t.title, en: t.en, client: t.client, clientName: NPC[t.client], map: t.map || 'home', speaker: t.speaker || 'landlord', state: 'open', stars: 0, ...m };
  }

  // Five jobs a day. Day 1 is fixed so the key/persimmon joke always happens.
  function makeBoard(day, unlocked) {
    const r = rng(day * 9973 + 17);
    let plan;
    if (day === 1) plan = [['fetch', 'key'], ['harvest'], ['laundry'], ['fetch', 'bucket'], ['fetch', 'ball']];
    else {
      const home = ['fetch', 'harvest', 'laundry'], lane = ['post', 'stall', 'bus'];
      const shuffle = (xs) => xs.map((k) => [r(), k]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);
      // different kinds of job where possible; once the back lane is open, five of the six kinds
      const pool = unlocked && unlocked.lane ? shuffle(home.concat(lane)) : home;
      plan = pool.slice(0, BOARD_SIZE).map((k) => [k]);
      while (plan.length < BOARD_SIZE) plan.push([pick(r, home)]);
      plan.sort(() => r() - 0.5);
    }
    return { day, jobs: plan.map(([k, forced], i) => makeJob(k, r, day, forced, i)) };
  }

  function taken(board) { return board.jobs.filter((j) => j.state === 'taken'); }
  function doneCount(board) { return board.jobs.filter((j) => j.state === 'done').length; }

  // Take or drop a job. Returns a short reason when it can't.
  function take(board, id) {
    const j = board.jobs.find((x) => x.id === id);
    if (!j || j.state !== 'open') return 'not open';
    if (taken(board).length >= MAX_TAKEN) return 'full';
    j.state = 'taken'; j.takenAt = Date.now();
    return null;
  }
  function drop(board, id) {
    const j = board.jobs.find((x) => x.id === id);
    if (!j || j.state !== 'taken') return 'not taken';
    j.state = 'open'; delete j.takenAt;
    return null;
  }

  // Stars to rewards: full reward at three stars.
  function payout(job, stars) {
    const yen = Math.round(job.reward.yen * (0.5 + stars / 6));
    const treats = stars >= 2 ? job.reward.treats : 0;
    return { yen, treats };
  }

  root.Jobs = { TEMPLATES, COUNTER, JP, NPC, HOUSES, MAP_NAME, hhmm, MAX_TAKEN, BOARD_SIZE, makeBoard, taken, doneCount, take, drop, payout };
})(typeof window !== 'undefined' ? window : globalThis);
