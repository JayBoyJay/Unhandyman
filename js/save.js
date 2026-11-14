// Progress saving: autosave to the browser (IndexedDB, with localStorage as a backup),
// plus download / load of the whole save as a JSON file.
(function (root) {
  const VERSION = 1;
  const DB = 'unhandyman', STORE = 'kv', KEY = 'save';

  function fresh() {
    return {
      v: VERSION,
      createdAt: new Date().toISOString(),
      savedAt: null,
      day: 1,
      yen: 0,
      treats: 0,          // treats earned from jobs (kept)
      freeTreats: 3,      // three free treats, refilled each morning
      story: { met: false, night0: false, ch0done: false },
      board: null,        // today's job board, see Jobs.makeBoard
      friends: {},        // npc id -> { points, stars }
      words: {},          // word id -> { heard, said, firstHeard, firstSaid, last, strength }
      skills: {},         // skill id -> { uses, firstUsed, last }
      stats: { jobsDone: 0, starsEarned: 0 },
      house: { furniture: [] },
      scraps: [],
      diary: [],
      explore: false,
      chatDay: {},       // npc id -> the day you last had their daily chat
      tricks: [],        // dog tricks learned from wish scraps
      wishes: {},        // core npc id -> true once their wish is delivered
      visited: { home: true },   // areas you've walked into (the map only shows these)
      photos: [],        // camera album: { day, clock, map, thumb (small jpeg), items }
      quest: { i: 0, step: 0, base: {}, done: [], stepDone: false, bossLost: {} },   // main story progress (js/quests.js)
      clock: 420         // minutes after midnight (7:00)
    };
  }

  // ---------- IndexedDB (falls back silently when unavailable) ----------
  let dbp = null;
  function db() {
    if (dbp) return dbp;
    dbp = new Promise((resolve) => {
      try {
        const req = indexedDB.open(DB, 1);
        req.onupgradeneeded = () => req.result.createObjectStore(STORE);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      } catch (_) { resolve(null); }
    });
    return dbp;
  }
  async function idbGet() {
    const d = await db(); if (!d) return null;
    return new Promise((resolve) => {
      try {
        const r = d.transaction(STORE, 'readonly').objectStore(STORE).get(KEY);
        r.onsuccess = () => resolve(r.result || null); r.onerror = () => resolve(null);
      } catch (_) { resolve(null); }
    });
  }
  async function idbSet(val) {
    const d = await db(); if (!d) return false;
    return new Promise((resolve) => {
      try {
        const tx = d.transaction(STORE, 'readwrite'); tx.objectStore(STORE).put(val, KEY);
        tx.oncomplete = () => resolve(true); tx.onerror = () => resolve(false);
      } catch (_) { resolve(false); }
    });
  }
  const ls = {
    get() { try { const s = localStorage.getItem('unhandyman.save'); return s ? JSON.parse(s) : null; } catch (_) { return null; } },
    set(v) { try { localStorage.setItem('unhandyman.save', JSON.stringify(v)); return true; } catch (_) { return false; } },
    clear() { try { localStorage.removeItem('unhandyman.save'); } catch (_) {} }
  };

  // Fill in anything a save from an older version is missing.
  function upgrade(s) {
    if (!s || typeof s !== 'object') return fresh();
    const base = fresh();
    for (const k of Object.keys(base)) if (s[k] === undefined) s[k] = base[k];
    for (const k of Object.keys(base.story)) if (s.story[k] === undefined) s.story[k] = base.story[k];
    s.v = VERSION;
    return s;
  }
  function valid(s) { return s && typeof s === 'object' && typeof s.day === 'number' && s.words && typeof s.words === 'object'; }

  // ---------- public API ----------
  const Save = {
    data: fresh(),
    async load() {
      const a = await idbGet(), b = ls.get();
      // take whichever copy was saved last
      let pick = a;
      if (b && (!a || (b.savedAt || '') > (a.savedAt || ''))) pick = b;
      Save.data = valid(pick) ? upgrade(pick) : fresh();
      return Save.data;
    },
    _t: null,
    // Saves soon; many events in a row collapse into one write.
    save(now) {
      clearTimeout(Save._t);
      const run = async () => {
        Save.data.savedAt = new Date().toISOString();
        const copy = JSON.parse(JSON.stringify(Save.data));
        ls.set(copy); await idbSet(copy);
        Save.onSaved && Save.onSaved(Save.data.savedAt);
      };
      if (now) return run();
      Save._t = setTimeout(run, 400);
    },
    async reset() { Save.data = fresh(); ls.clear(); await idbSet(null); await Save.save(true); return Save.data; },

    download() {
      Save.data.savedAt = new Date().toISOString();
      const blob = new Blob([JSON.stringify(Save.data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'unhandyman-save-day' + Save.data.day + '.json';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    },
    async loadFile(file) {
      const text = await file.text();
      let s; try { s = JSON.parse(text); } catch (_) { throw new Error('That file is not a save (not JSON).'); }
      if (!valid(s)) throw new Error('That file is not an Un-Handy Man save.');
      if (s.v > VERSION) throw new Error('That save is from a newer version of the game.');
      Save.data = upgrade(s);
      await Save.save(true);
      return Save.data;
    },

    // ---------- trackers ----------
    // heard: an NPC said it. said: the player said it and it was understood.
    word(id, how) {
      const now = Date.now(), w = Save.data.words[id] || (Save.data.words[id] = { heard: 0, said: 0, firstHeard: null, firstSaid: null, last: null, strength: 0 });
      if (how === 'heard') { w.heard++; w.firstHeard = w.firstHeard || now; w.strength = Math.min(100, w.strength + 2); }
      else { w.said++; w.firstSaid = w.firstSaid || now; w.strength = Math.min(100, w.strength + 8); }
      w.firstDay = w.firstDay || Save.data.day;   // the in-game day it was first met
      w.last = now; Save.save();
    },
    skill(id) {
      const now = Date.now(), s = Save.data.skills[id] || (Save.data.skills[id] = { uses: 0, firstUsed: now, last: now });
      s.uses++; s.last = now; Save.save();
    },
    // Words fade if unused, so review picks them again. Strength drops about 10 a day unused.
    fade(id) {
      const w = Save.data.words[id]; if (!w || !w.last) return 0;
      const days = (Date.now() - w.last) / 86400000;
      return Math.max(0, w.strength - days * 10);
    },
    friend(npc, points) {
      const f = Save.data.friends[npc] || (Save.data.friends[npc] = { points: 0, stars: 0 });
      f.points += points;
      const before = f.stars;
      f.stars = f.points >= 30 ? 3 : f.points >= 15 ? 2 : f.points >= 5 ? 1 : 0;
      Save.save();
      return f.stars > before ? f.stars : 0;   // new star level reached, or 0
    },
    treatsLeft() { return Save.data.treats + Save.data.freeTreats; }
  };

  root.Save = Save;
})(typeof window !== 'undefined' ? window : globalThis);
