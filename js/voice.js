// Voices for spoken lines, best first:
//   1. a ready-made audio file in assets/voice/ (made on the Mac with tools/voicegen.py)
//   2. the VOICEVOX engine running live on the Mac (for lines nobody prepared, like AI replies)
//   3. the browser's own Japanese voice
// The same file is used by the TV page and the phone page. Files are found by a hash of the
// speaker id and the text, so the Python tool and this file must hash the same way (FNV-1a).
(function (root) {
  const KEY = 'unhandyman.voice';
  // VOICEVOX speaker ids. Change them in 設定 or in tools/voices.json (see /speakers on the engine).
  const DEFAULT_VOICES = {
    landlord: 20,   // ハナさん: もち子さん (gentle)
    radio: 13,      // ラジオ: 青山龍星 (deep announcer)
    yamada: 11,     // 山田さん: 玄野武宏
    crow: 3,        // カラス: ずんだもん
    house: 12,      // いえの 人: 白上虎太郎
    child: 3,       // children
    default: 8      // everyone else: 春日部つむぎ
  };
  // NPC names (as they appear in lines) that should use a particular voice
  const BY_NAME = { phone: 'landlord', 'ハナさん': 'landlord', 'ハナさん · 電話': 'landlord', '山田さん': 'yamada', 'ハルちゃん': 'child', 'カラス': 'crow', 'ラジオ': 'radio' };

  function load() {
    let c = {};
    try { c = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (_) {}
    return Object.assign({ engineUrl: '', useFiles: true, voices: {} }, c);
  }
  function save(c) { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (_) {} }
  let cfg = load();

  // Each character's voice. The voice files' own casting (assets/voice/index.json, made from
  // tools/voices.json) wins, so lookups match the files: { id, key, params } per character, where
  // key = "id:pitch:speed:intonation" and params are the acting settings sent to VOICEVOX.
  let roles = {}, names = BY_NAME;
  Object.keys(DEFAULT_VOICES).forEach((r) => (roles[r] = { id: DEFAULT_VOICES[r], key: String(DEFAULT_VOICES[r]), params: {} }));
  function roleOf(who) { return roles[who] ? who : roles[names[who]] ? names[who] : 'default'; }
  // a voice picked in 設定 replaces that role's casting (used live; the files keep their voices)
  function voiceFor(who) {
    const role = roleOf(who), v = cfg.voices[role], cast = roles[role] || roles.default;
    if (v !== undefined && v !== '') return { id: +v, key: String(+v), params: cast.params || {} };
    return cast;
  }
  function speakerFor(who) { return voiceFor(who).id; }
  // FNV-1a 32-bit over the UTF-8 bytes of "speaker|text", as 8 hex digits
  function hash(speaker, text) {
    const bytes = new TextEncoder().encode(speaker + '|' + text);
    let h = 0x811c9dc5;
    for (const b of bytes) { h ^= b; h = Math.imul(h, 0x01000193) >>> 0; }
    return h.toString(16).padStart(8, '0');
  }

  // the list of ready-made files
  let index = null;
  const indexReady = fetch('assets/voice/index.json', { cache: 'no-cache' })
    .then((r) => (r.ok ? r.json() : {}))
    .then((j) => {
      index = (j && j.files) || {};
      Voice.credits = (j && j.credits) || [];
      if (j && j.roles) { Object.assign(roles, j.roles); names = Object.assign({}, BY_NAME, j.byName || {}); }
    }, () => (index = {}));

  // lines spoken this session that had no file yet (the Mac tool can make files for them)
  const missing = new Map();
  function noteMissing(who, speaker, text) {
    const k = speaker + '|' + text;
    if (!missing.has(k)) missing.set(k, { who, speaker, text });
    try { localStorage.setItem('unhandyman.voice.missing', JSON.stringify([...missing.values()].slice(-500))); } catch (_) {}
  }
  try { (JSON.parse(localStorage.getItem('unhandyman.voice.missing') || '[]')).forEach((m) => missing.set(m.speaker + '|' + m.text, m)); } catch (_) {}

  let audio = null, liveCache = new Map(), token = 0;
  function stop() {
    token++;
    if (audio) { try { audio.pause(); } catch (_) {} audio = null; }
    try { speechSynthesis.cancel(); } catch (_) {}
  }
  function playUrl(url, slow, my) {
    return new Promise((resolve) => {
      if (my !== token) return resolve(true);
      const a = new Audio(url);
      a.playbackRate = slow ? 0.75 : 1;
      try { a.preservesPitch = true; a.webkitPreservesPitch = true; } catch (_) {}
      audio = a;
      a.onended = () => resolve(true);
      a.onerror = () => resolve(false);
      a.play().catch(() => resolve(false));
    });
  }
  // VOICEVOX: POST /audio_query then POST /synthesis. The body is sent as a typeless Blob so the
  // browser makes a "simple" request (no CORS preflight); the engine still reads it as JSON.
  async function live(voice, text, slow) {
    const base = cfg.engineUrl.replace(/\/$/, ''), speaker = voice.id;
    const k = voice.key + '|' + text + (slow ? '|slow' : '');
    if (liveCache.has(k)) return liveCache.get(k);
    const q = await fetch(base + '/audio_query?speaker=' + speaker + '&text=' + encodeURIComponent(text), { method: 'POST' });
    if (!q.ok) throw new Error('audio_query ' + q.status);
    const query = await q.json();
    Object.assign(query, voice.params || {});
    if (slow) query.speedScale = (query.speedScale || 1) * 0.75;
    const s = await fetch(base + '/synthesis?speaker=' + speaker, { method: 'POST', body: new Blob([JSON.stringify(query)]) });
    if (!s.ok) throw new Error('synthesis ' + s.status);
    const url = URL.createObjectURL(await s.blob());
    liveCache.set(k, url);
    if (liveCache.size > 80) { const first = liveCache.keys().next().value; URL.revokeObjectURL(liveCache.get(first)); liveCache.delete(first); }
    return url;
  }
  let jaVoice = null;
  function pickVoice() { try { jaVoice = speechSynthesis.getVoices().find((v) => /^ja/i.test(v.lang)) || null; } catch (_) {} }
  try { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; } catch (_) {}
  function browser(text, slow, rate) {
    return new Promise((resolve) => {
      try {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'ja-JP'; if (jaVoice) u.voice = jaVoice; u.rate = rate || (slow ? 0.65 : 1);
        u.onend = u.onerror = () => resolve(true);
        speechSynthesis.speak(u);
      } catch (_) { resolve(false); }
    });
  }

  // Speak a line. who: a role ('landlord', 'radio', …) or a speaker's name. Resolves when done.
  async function speak(who, text, opts) {
    opts = opts || {};
    stop();
    const my = token, slow = !!opts.slow;
    text = String(text || '').trim();
    if (!text) return;
    if (!index) await Promise.race([indexReady, new Promise((r) => setTimeout(r, 400))]);
    if (my !== token) return;
    const voice = voiceFor(who), k = hash(voice.key, text);
    if (cfg.useFiles && index && index[k]) { if (await playUrl('assets/voice/' + index[k], slow, my)) return 'file'; }
    if (my !== token) return;
    noteMissing(who, voice.key, text);
    if (cfg.engineUrl) {
      try { const url = await live(voice, text, slow); if (my !== token) return; if (await playUrl(url, false, my)) return 'live'; }
      catch (e) { Voice.lastError = e.message; }
    }
    if (my !== token) return;
    await browser(text, slow, opts.rate);
    return 'browser';
  }

  async function speakers() {
    const r = await fetch(cfg.engineUrl.replace(/\/$/, '') + '/speakers');
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return (await r.json()).flatMap((s) => s.styles.map((st) => ({ id: st.id, name: s.name + (st.name !== 'ノーマル' ? '（' + st.name + '）' : '') })));
  }

  const Voice = {
    speak, stop, hash, speakerFor, voiceFor, speakers, DEFAULT_VOICES,
    get config() { return cfg; },
    setConfig(c) { cfg = Object.assign(load(), c); save(cfg); liveCache.clear(); },
    missingLines: () => [...missing.values()],
    clearMissing() { missing.clear(); try { localStorage.removeItem('unhandyman.voice.missing'); } catch (_) {} },
    filesReady: () => indexReady.then(() => Object.keys(index || {}).length),
    lastError: '', credits: []
  };
  root.Voice = Voice;
})(window);
