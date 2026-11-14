// Speech recognition on the phone. Two engines behind one switch so we can keep the more accurate:
//  - 'phone': the browser's built-in recognizer (Chrome on Android, Safari on iPhone)
//  - 'vosk':  an offline Japanese model running in the browser, limited to the game's words
(function () {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  // Android: a fresh recognizer per press; the old one is shut down first and its late events
  // ignored (Android allows only one at a time).
  // iPhone/iPad (Safari, Edge, Chrome there are all WebKit): new recognizers after the first
  // often never hear anything, so we keep ONE recognizer and restart it each press, waiting
  // for the last press to end fully. If it doesn't start hearing within 2 s, we rebuild it.
  const ANDROID = /Android/i.test(navigator.userAgent);
  const IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const PhoneRec = {
    name: 'phone',
    available: () => !!SR,
    sess: null, shared: null, log: () => {},
    build(sessRef, reuse) {
      const r = reuse || new SR();
      r.lang = 'ja-JP'; r.interimResults = true; r.maxAlternatives = 5;
      r.continuous = !ANDROID;   // continuous mode is unreliable on Android
      r.onaudiostart = () => { const s = sessRef(r); if (s) { s.hearing = true; this.log('mic on'); } };
      r.onresult = (e) => {
        const s = sessRef(r); if (!s) return;
        s.results = Array.from(e.results).slice(s.from || 0);
        s.opts && s.opts.onInterim && s.opts.onInterim(s.results.map((x) => x[0].transcript).join(''));
      };
      r.onerror = (e) => { const s = sessRef(r); this.log('error: ' + e.error); if (s) s.error = e.error; };
      r.onend = () => { r._running = false; this.log('end'); const s = r._sess; if (s) { s.ended = true; s.onEnd && s.onEnd(); } };
      return r;
    },
    async start(opts) {
      if (!SR) throw new Error("This browser has no built-in speech recognition. Use Chrome on Android or Safari on iPhone, or switch to Vosk.");
      this.log = (opts && opts.onLog) || (() => {});
      this.lastError = null;
      await this.shutdown();
      const sess = this.sess = { results: [], error: null, ended: false, onEnd: null, rec: null, opts, hearing: false };
      const mine = (r) => (this.sess === sess && sess.rec === r ? sess : null);
      let r = IOS && this.shared ? this.shared : this.build(mine);
      if (IOS) {
        // re-point the shared recognizer's handlers at this press
        if (r !== this.shared) this.shared = r;
        else this.build(mine, r);
      }
      sess.rec = r; r._sess = sess;
      const go = () => { r._running = true; r.start(); this.log('start'); };
      try { go(); }
      catch (e) {   // "already started": give the old one a moment, then rebuild once
        this.log('start failed: ' + (e.name || e.message));
        await new Promise((res) => setTimeout(res, 400));
        r = sess.rec = this.build(mine); r._sess = sess; if (IOS) this.shared = r; sess.ended = false; go();
      }
      if (IOS) setTimeout(() => {
        // never heard anything: throw the shared recognizer away and use a new one
        if (this.sess === sess && !sess.hearing && !sess.ended) {
          this.log('no mic, rebuilding');
          try { r.abort(); } catch (_) {}
          const n = this.build(mine); this.shared = n; sess.rec = n; n._sess = sess;
          try { n._running = true; n.start(); } catch (_) {}
        }
      }, 2000);
    },
    // stop any recognizer still running and wait for it to finish
    shutdown() {
      const old = this.sess; this.sess = null;
      if (!old || !old.rec || old.ended || !old.rec._running) return Promise.resolve();
      return new Promise((resolve) => {
        old.onEnd = resolve;
        try { IOS ? old.rec.stop() : old.rec.abort(); } catch (_) { resolve(); }
        setTimeout(resolve, IOS ? 1500 : 700);
      });
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
      // join every piece, then offer the alternatives for the last piece
      const head = res.slice(0, -1).map((r) => r[0].transcript).join('');
      const lastRes = res[res.length - 1];
      const alts = [];
      for (let i = 0; i < lastRes.length; i++) alts.push(head + lastRes[i].transcript);
      return [...new Set(alts.map((a) => a.trim()))].filter(Boolean);
    }
  };
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

  window.Speech = { engines: { phone: PhoneRec, vosk: VoskRec } };
})();
