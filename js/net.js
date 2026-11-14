// Phone link. Whoever opens the TV page becomes the host; phones join with a room code.
// Uses PeerJS, so it runs straight from GitHub Pages with no server of our own.
// If your other games use a different connection module, swap it in here:
// the rest of the game only calls Net.host() and Net.join().
(function () {
  const PREFIX = 'unhandyman-';
  const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

  function randomCode() {
    let s = '';
    for (let i = 0; i < 4; i++) s += LETTERS[Math.floor(Math.random() * LETTERS.length)];
    return s;
  }

  function host(h) {
    if (!window.Peer) {
      h.onError && h.onError('The connection library did not load. Check your internet connection.');
      return { broadcast() {}, count: () => 0 };
    }
    const conns = new Set();
    let tries = 0;

    function open() {
      const code = randomCode();
      const peer = new Peer(PREFIX + code);
      peer.on('open', () => h.onReady && h.onReady(code));
      peer.on('connection', (c) => {
        c.on('open', () => { conns.add(c); h.onJoin && h.onJoin(c); });
        c.on('data', (d) => h.onMsg && h.onMsg(d, c));
        c.on('close', () => { conns.delete(c); h.onLeave && h.onLeave(c); });
      });
      peer.on('error', (e) => {
        if (e.type === 'unavailable-id' && tries++ < 5) { peer.destroy(); open(); }
        else h.onError && h.onError(e.type || String(e));
      });
      peer.on('disconnected', () => { try { peer.reconnect(); } catch (_) {} });
    }
    open();

    return {
      broadcast(msg) { conns.forEach((c) => { if (c.open) c.send(msg); }); },
      count: () => conns.size
    };
  }

  function join(code, h) {
    if (!window.Peer) {
      h.onError && h.onError('The connection library did not load. Check your internet connection.');
      return { send() {} };
    }
    const peer = new Peer();
    let conn = null;
    peer.on('open', () => {
      conn = peer.connect(PREFIX + String(code).toUpperCase(), { reliable: true });
      conn.on('open', () => h.onOpen && h.onOpen());
      conn.on('data', (d) => h.onMsg && h.onMsg(d));
      conn.on('close', () => h.onClose && h.onClose());
    });
    peer.on('error', (e) => h.onError && h.onError(e.type === 'peer-unavailable' ? 'No game with that code. Check the code on the TV.' : (e.type || String(e))));
    return { send(msg) { if (conn && conn.open) conn.send(msg); } };
  }

  window.Net = { host, join };
})();
