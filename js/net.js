// Phone link. Whoever opens the TV page becomes the host; phones join with a room code.
// Uses PeerJS, so it runs straight from GitHub Pages with no server of our own.
// If your other games use a different connection module, swap it in here:
// the rest of the game only calls Net.host() and Net.join().
//
// Reliability:
// - several public STUN servers; a TURN relay can be added (see turnConfig) for phones on mobile data
// - JSON messages (no binary packing), so big messages and Japanese text arrive intact
// - the phone queues messages while the link is down, pings the TV every few seconds,
//   and rejoins by itself if the link drops or ICE fails
(function () {
  const PREFIX = 'unhandyman-';
  const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const PING_MS = 4000, DEAD_MS = 11000;

  // Optional TURN relay: ?turn=turn:host:3478&tu=user&tp=pass on the URL (remembered),
  // or localStorage 'unhandyman.turn' = JSON array of RTCIceServer objects.
  function turnConfig() {
    try {
      const q = new URLSearchParams(location.search);
      if (q.get('turn')) {
        const s = [{ urls: q.get('turn'), username: q.get('tu') || '', credential: q.get('tp') || '' }];
        localStorage.setItem('unhandyman.turn', JSON.stringify(s));
        return s;
      }
      const j = localStorage.getItem('unhandyman.turn');
      return j ? JSON.parse(j) : [];
    } catch (_) { return []; }
  }
  function peerOptions() {
    return {
      debug: 1,
      config: {
        iceServers: [
          { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
          { urls: 'stun:stun.cloudflare.com:3478' }
        ].concat(turnConfig()),
        iceCandidatePoolSize: 4
      }
    };
  }

  function randomCode() {
    let s = '';
    for (let i = 0; i < 4; i++) s += LETTERS[Math.floor(Math.random() * LETTERS.length)];
    return s;
  }
  function watchIce(c, onDead) {
    try {
      c.on('iceStateChanged', (st) => { if (st === 'failed' || st === 'closed') onDead('ice ' + st); });
    } catch (_) {}
    c.on('error', (e) => onDead(e && e.type ? e.type : 'error'));
  }

  function host(h) {
    if (!window.Peer) {
      h.onError && h.onError('The connection library did not load. Check your internet connection.');
      return { broadcast() {}, count: () => 0 };
    }
    const conns = new Set();
    let tries = 0, peer = null, code = null;

    function drop(c) {
      if (!conns.has(c)) return;
      conns.delete(c); try { c.close(); } catch (_) {}
      h.onLeave && h.onLeave(c);
    }
    // The TV keeps one room code for the whole session. If the signalling server drops us
    // (common with the free PeerJS server, or when the tab is in the background), phones that
    // are already connected keep working; we just rejoin the server so new phones can find us.
    let wait = 1000, retryT = null, lost = 0;
    function retry(why) {
      if (retryT) return;
      h.onSignal && h.onSignal('reconnecting', why);
      retryT = setTimeout(() => {
        retryT = null;
        if (peer && !peer.destroyed && peer.disconnected && lost < 3) { lost++; try { peer.reconnect(); } catch (_) { lost = 3; } }
        else { lost = 0; try { peer && peer.destroy(); } catch (_) {} open(); }   // start fresh with the same code
        // if that attempt goes nowhere, try again
        const p = peer;
        setTimeout(() => { if (p === peer && !p.open) retry('no answer'); }, 6000);
      }, wait);
      wait = Math.min(wait * 2, 15000);
    }
    function open() {
      code = code || randomCode();
      const p = peer = new Peer(PREFIX + code, peerOptions());
      p.on('open', () => { if (p !== peer) return; tries = 0; wait = 1000; lost = 0; h.onReady && h.onReady(code); h.onSignal && h.onSignal('ok'); });
      p.on('connection', (c) => {
        c.on('open', () => { conns.add(c); c.lastSeen = Date.now(); h.onJoin && h.onJoin(c); });
        c.on('data', (d) => {
          c.lastSeen = Date.now();
          if (d && d.t === 'ping') { try { c.send({ t: 'pong', n: d.n }); } catch (_) {} return; }
          h.onMsg && h.onMsg(d, c);
        });
        c.on('close', () => drop(c));
        watchIce(c, () => drop(c));
      });
      p.on('error', (e) => {
        if (p !== peer) return;
        if (e.type === 'unavailable-id') {
          // the server still holds our old code for a moment after a drop; brand-new sessions pick another
          if (conns.size) { lost = 3; retry('code still held'); }
          else if (tries++ < 5) { p.destroy(); code = null; open(); }
          else h.onError && h.onError(e.type);
        }
        else if (e.type === 'network' || e.type === 'server-error' || e.type === 'socket-error' || e.type === 'socket-closed') retry(e.type);
        else if (e.type === 'peer-unavailable') { /* a phone left mid-handshake; ignore */ }
        else h.onError && h.onError(e.type || String(e));
      });
      p.on('disconnected', () => { if (p === peer) retry('disconnected'); });
    }
    open();
    // phones ping every few seconds; forget any that went quiet
    setInterval(() => { const now = Date.now(); conns.forEach((c) => { if (now - c.lastSeen > DEAD_MS * 2) drop(c); }); }, 5000);

    return {
      broadcast(msg) { conns.forEach((c) => { if (c.open) { try { c.send(msg); } catch (_) {} } }); },
      count: () => conns.size
    };
  }

  function join(code, h) {
    if (!window.Peer) {
      h.onError && h.onError('The connection library did not load. Check your internet connection.');
      return { send() {}, ready: () => false };
    }
    const target = PREFIX + String(code).toUpperCase();
    let peer = null, conn = null, up = false, lastSeen = 0, wait = 1000, retryT = null, attempt = 0;
    const queue = [];
    const status = (s) => h.onStatus && h.onStatus(s);

    function flush() { while (up && queue.length) { try { conn.send(queue.shift()); } catch (_) { break; } } }
    function down(why) {
      if (retryT) return;
      const was = up, c = conn; up = false; conn = null;
      try { c && c.close(); } catch (_) {}
      if (was) h.onClose && h.onClose(why);
      status('Reconnecting… (' + why + ')');
      retryT = setTimeout(() => { retryT = null; connect(); }, wait);
      wait = Math.min(wait * 2, 8000);
    }
    function connect() {
      attempt++;
      if (!peer || peer.destroyed) {
        peer = new Peer(peerOptions());
        peer.on('open', () => dial());
        peer.on('disconnected', () => { try { if (!peer.destroyed) peer.reconnect(); } catch (_) {} });
        peer.on('error', (e) => {
          if (e.type === 'peer-unavailable') {
            h.onError && h.onError('No game with that code. Check the code on the TV.');
            down('no game');
          } else if (e.type === 'network' || e.type === 'server-error' || e.type === 'socket-error' || e.type === 'webrtc') {
            try { peer.destroy(); } catch (_) {} peer = null; down(e.type);
          } else h.onError && h.onError(e.type || String(e));
        });
      } else if (peer.open) dial();
    }
    function dial() {
      const c = conn = peer.connect(target, { reliable: true, serialization: 'json' });
      const giveUp = setTimeout(() => { if (conn === c && !up) down('timed out'); }, 10000);
      c.on('open', () => {
        clearTimeout(giveUp); if (conn !== c) return;
        up = true; wait = 1000; lastSeen = Date.now();
        status(''); h.onOpen && h.onOpen(); flush();
      });
      c.on('data', (d) => {
        lastSeen = Date.now();
        if (d && d.t === 'pong') return;
        h.onMsg && h.onMsg(d);
      });
      c.on('close', () => { if (conn === c) down('closed'); });
      watchIce(c, (why) => { if (conn === c) down(why); });
    }
    // heartbeat: if the TV stops answering, rejoin
    let n = 0;
    setInterval(() => {
      if (!up) return;
      if (Date.now() - lastSeen > DEAD_MS) { down('no reply'); return; }
      try { conn.send({ t: 'ping', n: ++n }); } catch (_) { down('send failed'); }
    }, PING_MS);
    // phones sleep their tabs; check the link as soon as the page is visible again
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && up && Date.now() - lastSeen > PING_MS * 1.5) {
        try { conn.send({ t: 'ping', n: ++n }); } catch (_) { down('asleep'); }
      }
    });
    connect();

    return {
      // move messages are dropped when offline (stale); everything else waits in the queue
      send(msg, opts) {
        if (up && conn && conn.open) { try { conn.send(msg); return true; } catch (_) { down('send failed'); } }
        if (!(opts && opts.drop)) { queue.push(msg); if (queue.length > 20) queue.shift(); }
        return false;
      },
      ready: () => up,
      reset: (why) => { if (up) down(why || 'reset'); }
    };
  }

  window.Net = { host, join };
})();
