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
