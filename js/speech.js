// Speech recognition on the phone. Two engines behind one switch so we can keep the more accurate:
//  - 'phone': the browser's built-in recognizer (Chrome on Android, Safari on iPhone)
//  - 'vosk':  an offline Japanese model running in the browser, limited to the game's words
(function () {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  const PhoneRec = {
    name: 'phone',
    available: () => !!SR,
    async start(opts) {
      if (!SR) throw new Error("This browser has no built-in speech recognition. Try Chrome, or switch to Vosk.");
      this.results = []; this.error = null; this.ended = false; this.onEnd = null;
      const r = new SR();
      r.lang = 'ja-JP'; r.interimResults = true; r.maxAlternatives = 5; r.continuous = true;
      r.onresult = (e) => {
        this.results = Array.from(e.results);
        opts && opts.onInterim && opts.onInterim(this.results.map((x) => x[0].transcript).join(''));
      };
      r.onerror = (e) => { this.error = e.error; };
      r.onend = () => { this.ended = true; this.onEnd && this.onEnd(); };
      r.start();
      this.rec = r;
    },
    stop() {
      return new Promise((resolve) => {
        let done = false;
        const finish = () => {
          if (done) return; done = true;
          try { resolve(this.collect()); } catch (e) { this.lastError = e.message; resolve([]); }
        };
        if (this.ended) return finish();
        this.onEnd = finish;
        try { this.rec.stop(); } catch (_) { finish(); }
        setTimeout(finish, 2500);
      });
    },
    collect() {
      const res = this.results || [];
      if (!res.length) {
        if (this.error === 'not-allowed') throw new Error('Microphone permission was blocked.');
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
