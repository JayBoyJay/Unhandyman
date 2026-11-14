// Optional AI for free conversation. Ollama on this computer is the default.
// Keys for cloud providers are stored only in this browser, never in the repo.
(function () {
  const KEY = 'unhandyman.ai';
  const DEFAULTS = {
    enabled: false,
    provider: 'ollama',
    ollamaUrl: 'http://localhost:11434',
    model: '',
    keys: { claude: '', openai: '', gemini: '' }
  };
  const MODEL_HINT = { ollama: '', claude: 'claude-haiku-5-5', openai: '', gemini: '' };

  function load() {
    try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
    catch (_) { return { ...DEFAULTS }; }
  }
  function save(cfg) {
    try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch (_) {}
  }

  // plain: send as text/plain so the browser makes a "simple" request with no CORS preflight.
  // Ollama reads the body as JSON whatever the header says, and this avoids preflights failing
  // through proxies (Caddy) or other machines on the network.
  async function postJSON(url, body, headers, plain) {
    const ctl = window.AbortController ? new AbortController() : null;
    const timer = ctl && setTimeout(() => ctl.abort(), 60000);   // first reply can be slow while the model loads
    let r;
    try {
      r = await fetch(url, {
        method: 'POST', body: JSON.stringify(body), signal: ctl ? ctl.signal : undefined,
        headers: plain ? { ...headers } : { 'content-type': 'application/json', ...headers }
      });
    } catch (e) {
      throw new Error(e.name === 'AbortError' ? 'No reply after 60 s (is the model still loading?)' : "Couldn't connect to " + new URL(url).host + ' (' + e.message + ')');
    } finally { timer && clearTimeout(timer); }
    if (!r.ok) throw new Error('HTTP ' + r.status + ': ' + (await r.text()).slice(0, 200));
    return r.json();
  }

  // messages: [{role: 'user'|'assistant', content}]
  async function chat(cfg, system, messages) {
    const model = cfg.model || MODEL_HINT[cfg.provider];
    if (!model) throw new Error('Pick a model in AI settings first.');
    if (cfg.provider === 'ollama') {
      const d = await postJSON(cfg.ollamaUrl.replace(/\/$/, '') + '/api/chat', {
        model, stream: false, messages: [{ role: 'system', content: system }, ...messages],
        options: { temperature: 0.6, num_predict: 80 }
      }, {}, true);
      return d.message && d.message.content;
    }
    if (cfg.provider === 'claude') {
      const d = await postJSON('https://api.anthropic.com/v1/messages', { model, max_tokens: 120, system, messages }, {
        'x-api-key': cfg.keys.claude, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true'
      });
      return d.content && d.content[0] && d.content[0].text;
    }
    if (cfg.provider === 'openai') {
      const d = await postJSON('https://api.openai.com/v1/chat/completions', {
        model, max_tokens: 120, messages: [{ role: 'system', content: system }, ...messages]
      }, { Authorization: 'Bearer ' + cfg.keys.openai });
      return d.choices && d.choices[0].message.content;
    }
    if (cfg.provider === 'gemini') {
      const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent?key=' + encodeURIComponent(cfg.keys.gemini);
      const d = await postJSON(url, {
        systemInstruction: { parts: [{ text: system }] },
        contents: messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }))
      });
      return d.candidates && d.candidates[0].content.parts.map((p) => p.text).join('');
    }
    throw new Error('Unknown provider');
  }

  async function ollamaModels(url) {
    const r = await fetch(url.replace(/\/$/, '') + '/api/tags');
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const d = await r.json();
    return (d.models || []).map((m) => m.name);
  }

  window.AI = { load, save, chat, ollamaModels, MODEL_HINT };
})();
