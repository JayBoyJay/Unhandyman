// Speech recognition on the phone. Two engines behind one switch so we can keep the more accurate:
//  - 'phone': the browser's built-in recognizer (Chrome on Android, Safari on iPhone)
//  - 'vosk':  an offline Japanese model running in the browser, limited to the game's words
(function () {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  // One fresh recognizer per press, started straight away inside the tap (no waiting first):
  // iPhone only allows speech recognition that starts directly from a real tap, and cancels
  // it ("aborted") otherwise. Any recognizer from the last press is aborted and its late
  // events ignored. On iPhone the talk button is tap-to-talk (see phone.html), because only
  // a finished tap counts there, not a finger going down.
  const ANDROID = /Android/i.test(navigator.userAgent);
  const IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const PhoneRec = {
    name: 'phone',
    tapToTalk: IOS,
    available: () => !!SR,
    sess: null, log: () => {},
    build(sess) {
      const r = new SR();
      r.lang = 'ja-JP'; r.interimResults = true; r.maxAlternatives = 5;
      r.continuous = !ANDROID && !IOS;   // continuous mode is unreliable on phones
      const mine = () => this.sess === sess && sess.rec === r;
      r.onaudiostart = () => { if (mine()) this.log('mic on'); };
      r.onsoundstart = () => { if (mine()) this.log('sound'); };
      r.onspeechstart = () => { if (mine()) this.log('speech'); };
      r.onspeechend = () => { if (mine()) this.log('speech end'); };
      r.onaudioend = () => { if (mine()) this.log('mic off'); };
      r.onnomatch = () => { if (mine()) this.log('no match'); };
      r.onresult = (e) => {
        if (!mine()) return;
        sess.results = Array.from(e.results);
        const last = sess.results[sess.results.length - 1];
        this.log('result' + (last && last.isFinal ? ' (final)' : '') + ': ' + sess.results.map((x) => x[0].transcript).join(''));
        sess.opts && sess.opts.onInterim && sess.opts.onInterim(sess.results.map((x) => x[0].transcript).join(''));
      };
      r.onerror = (e) => { if (mine()) { this.log('error: ' + e.error); sess.error = e.error; } };
      r.onend = () => {
        if (sess.rec !== r) return;
        sess.ended = true; this.log('end');
        if (sess.onEnd) sess.onEnd();
        else if (this.sess === sess && sess.opts && sess.opts.onAutoEnd) sess.opts.onAutoEnd();   // stopped by itself after a pause
      };
      return r;
    },
    // Not async on purpose: r.start() must run inside the tap's own event handler.
    start(opts) {
      if (!SR) return Promise.reject(new Error("This browser has no built-in speech recognition. Use Safari or Chrome."));
      this.log = (opts && opts.onLog) || (() => {});
      this.lastError = null;
      const old = this.sess;
      if (old && old.rec && !old.ended) { try { old.rec.abort(); } catch (_) {} }
      const sess = this.sess = { results: [], error: null, ended: false, onEnd: null, rec: null, opts };
      sess.rec = this.build(sess);
      try { sess.rec.start(); this.log('start'); return Promise.resolve(); }
      catch (e) {
        // the old one hadn't let go yet: try once more shortly (may not work on iPhone)
        this.log('start failed: ' + (e.name || e.message) + ', retrying');
        return new Promise((res, rej) => setTimeout(() => {
          if (this.sess !== sess) return res();
          sess.rec = this.build(sess);
          try { sess.rec.start(); this.log('start'); res(); } catch (e2) { rej(new Error('Speech could not start: ' + (e2.message || e2.name))); }
        }, 400));
      }
    },
    stop() {
      const sess = this.sess;
      return new Promise((resolve) => {
        if (!sess) return resolve([]);
        let done = false;
        const finish = () => {
          if (done) return; done = true;
          try { resolve(this.collect(sess)); } catch (e) { this.lastError = e.message; resolve([]); }
        };
        if (sess.ended) return finish();
        sess.onEnd = finish;
        try { sess.rec.stop(); } catch (_) { finish(); }
        setTimeout(finish, 2500);
      });
    },
    collect(sess) {
      const res = sess.results || [];
      if (!res.length) {
        if (sess.error === 'not-allowed' || sess.error === 'service-not-allowed') throw new Error('Microphone or speech permission was blocked. Check Settings → (browser) → Microphone, and Settings → Privacy → Speech Recognition.');
        if (sess.error && sess.error !== 'no-speech' && sess.error !== 'aborted') this.lastError = 'Speech error: ' + sess.error;
        return [];
      }
      const head = res.slice(0, -1).map((r) => r[0].transcript).join('');
      const lastRes = res[res.length - 1];
      const alts = [];
      for (let i = 0; i < lastRes.length; i++) alts.push(head + lastRes[i].transcript);
      return [...new Set(alts.map((a) => a.trim()))].filter(Boolean);
    }
  };
  // iPhone/iPad: after the first recognition session, iOS often feeds new sessions silence and
  // then aborts them. So we start ONE continuous session on the first tap and keep it running.
  // Each press only marks where your line starts; release takes the words heard since then.
  // If iOS ends the session (long silence, page hidden), the next tap starts a new one.
  const IosLive = {
    name: 'phone',
    tapToTalk: true,
    available: () => !!SR,
    live: null, cur: null, log: () => {},
    open(opts) {
      const r = new SR();
      r.lang = 'ja-JP'; r.interimResults = true; r.maxAlternatives = 5; r.continuous = true;
      const L = { rec: r, results: [], ended: false, error: null, started: Date.now() };
      const mine = () => this.live === L;
      r.onaudiostart = () => { if (mine()) this.log('mic on (kept on)'); };
      r.onsoundstart = () => { if (mine() && this.cur) this.log('sound'); };
      r.onspeechstart = () => { if (mine() && this.cur) this.log('speech'); };
      r.onresult = (e) => {
        if (!mine()) return;
        L.results = Array.from(e.results);
        const fin = L.results[L.results.length - 1];
        if (fin && fin.isFinal && L.onFinal) { const f = L.onFinal; L.onFinal = null; f(); }
        const c = this.cur;
        if (c) {
          const t = L.results.slice(c.from).map((x) => x[0].transcript).join('');
          const last = L.results[L.results.length - 1];
          this.log('result' + (last && last.isFinal ? ' (final)' : '') + ': ' + t);
          c.opts && c.opts.onInterim && c.opts.onInterim(t);
          if (last && last.isFinal && t.trim() && c.opts && c.opts.onAutoEnd) c.opts.onAutoEnd();   // you paused: send it
        }
      };
      r.onerror = (e) => { if (mine()) { L.error = e.error; this.log('error: ' + e.error); } };
      r.onend = () => {
        L.ended = true; this.log('session ended after ' + Math.round((Date.now() - L.started) / 1000) + ' s');
        if (mine()) { const c = this.cur; if (c && c.waiting) c.waiting(); }
      };
      this.live = L;
      r.start();
      this.log('session start');
      return L;
    },
    // Not async: when a new session is needed, r.start() must run inside the tap.
    start(opts) {
      if (!SR) return Promise.reject(new Error('This browser has no built-in speech recognition. Use Safari.'));
      this.log = (opts && opts.onLog) || (() => {});
      this.lastError = null;
      let L = this.live;
      if (!L || L.ended) {
        try { L = this.open(opts); }
        catch (e) { return Promise.reject(new Error('Speech could not start: ' + (e.message || e.name))); }
      }
      // a result still being spoken when you pressed belongs to the old line, so start after it
      this.cur = { from: L.results.length, opts, L };
      this.log('press · from #' + this.cur.from);
      return Promise.resolve();
    },
    stop() {
      const c = this.cur; this.cur = null;
      if (!c) return Promise.resolve([]);
      // this line is the results from the press up to now (the last one may still be finishing)
      c.to = Math.max(c.L.results.length, c.from + 1);
      const take = () => c.L.results.slice(c.from, c.to);
      return new Promise((resolve) => {
        let done = false;
        const finish = () => {
          if (done) return; done = true;
          const res = take();
          if (!res.length) {
            if (c.L.error === 'not-allowed' || c.L.error === 'service-not-allowed') this.lastError = 'Microphone or speech permission was blocked. Check Settings → Privacy & Security → Speech Recognition and Microphone.';
            else if (c.L.error && c.L.error !== 'no-speech' && c.L.error !== 'aborted') this.lastError = 'Speech error: ' + c.L.error;
            return resolve([]);
          }
          const head = res.slice(0, -1).map((r) => r[0].transcript).join('');
          const last = res[res.length - 1], alts = [];
          for (let i = 0; i < last.length; i++) alts.push(head + last[i].transcript);
          resolve([...new Set(alts.map((a) => a.trim()))].filter(Boolean));
        };
        const res = take(), last = res[res.length - 1];
        if (!res.length || (last && last.isFinal)) { if (res.length) return finish(); }
        // wait briefly for iOS to finish the last words
        c.L.onFinal = finish;
        c.waiting = finish;
        setTimeout(finish, 700);
      });
    },
    shutdown() { const L = this.live; this.live = null; this.cur = null; if (L && !L.ended) { try { L.rec.abort(); } catch (_) {} } }
  };
  // switch the mic off when the phone page is hidden; the next tap starts a fresh session
  if (IOS) document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') IosLive.shutdown(); });

  const VOSK_LIB = 'https://cdn.jsdelivr.net/npm/vosk-browser@0.0.8/dist/vosk.js';
  const VoskRec = {
    name: 'vosk',
    modelUrl: 'models/vosk-model-small-ja.tar.gz',
    available: () => !!(navigator.mediaDevices && window.AudioContext),
    loadLib() {
      if (window.Vosk) return Promise.resolve();
      return new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = VOSK_LIB; s.onload = res; s.onerror = () => rej(new Error('Could not load the Vosk library.'));
        document.head.appendChild(s);
      });
    },
    async prepare(onStatus) {
      if (this.model) return;
      onStatus && onStatus('Loading the offline Japanese model (first time only)…');
      await this.loadLib();
      try { this.model = await Vosk.createModel(this.modelUrl); }
      catch (e) { throw new Error('Could not load ' + this.modelUrl + '. See the README for how to add the model.'); }
      onStatus && onStatus('');
    },
    async start(opts) {
      await this.prepare(opts && opts.onStatus);
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 } });
      this.ctx = new AudioContext();
      const rate = this.ctx.sampleRate;
      const grammar = opts && opts.grammar;
      let rec;
      try {
        rec = grammar && grammar.length
          ? new this.model.KaldiRecognizer(rate, JSON.stringify(grammar.concat(['[unk]'])))
          : new this.model.KaldiRecognizer(rate);
      } catch (_) { rec = new this.model.KaldiRecognizer(rate); }
      this.text = []; this.partial = '';
      rec.on('result', (m) => { const t = m.result && m.result.text; if (t) this.text.push(t); });
      rec.on('partialresult', (m) => {
        this.partial = (m.result && m.result.partial) || '';
        opts && opts.onInterim && opts.onInterim((this.text.join('') + this.partial).replace(/\s+/g, ''));
      });
      this.rec = rec;
      const src = this.ctx.createMediaStreamSource(this.stream);
      const node = this.ctx.createScriptProcessor(4096, 1, 1);
      node.onaudioprocess = (e) => { try { rec.acceptWaveform(e.inputBuffer); } catch (_) {} };
      src.connect(node); node.connect(this.ctx.destination);
      this.node = node; this.src = src;
    },
    async stop() {
      try { this.node.disconnect(); this.src.disconnect(); } catch (_) {}
      try { this.stream.getTracks().forEach((t) => t.stop()); } catch (_) {}
      try { this.rec.retrieveFinalResult(); } catch (_) {}
      await new Promise((r) => setTimeout(r, 500));
      try { this.ctx.close(); } catch (_) {}
      try { this.rec.remove(); } catch (_) {}
      const t = (this.text.join('') || this.partial || '').replace(/\s+/g, '').replace(/\[unk\]/g, '');
      return t ? [t] : [];
    }
  };

  window.Speech = { engines: { phone: IOS ? IosLive : PhoneRec, vosk: VoskRec }, IOS };
})();
