// Chapter 0 word list and the command parser.
// Every form is matched after normalising (katakana -> hiragana, no spaces or punctuation),
// so each word only needs its kanji and kana spellings listed once.
(function (root) {
  const LEX = {
    dog: ['いぬ', '犬', 'わんちゃん', 'わんこ'],
    items: {
      bucket: { jp: 'バケツ', forms: ['ばけつ'] },
      key: { jp: 'かぎ', forms: ['かぎ', '鍵'] },
      persimmon: { jp: 'かき', forms: ['かき', '柿'] },
      ball: { jp: 'ボール', forms: ['ぼーる', 'ぼうる'] },
      shoe: { jp: 'くつ', forms: ['くつ', '靴'] },
      // vegetables (harvest job)
      tomato: { jp: 'トマト', forms: ['とまと'] },
      carrot: { jp: 'にんじん', forms: ['にんじん', '人参'] },
      daikon: { jp: 'だいこん', forms: ['だいこん', '大根'] },
      // washing (laundry job)
      shirt: { jp: 'シャツ', forms: ['しゃつ', 'てぃーしゃつ'] },
      towel: { jp: 'タオル', forms: ['たおる'] },
      sock: { jp: 'くつした', forms: ['くつした', '靴下'] }
    },
    // counting things: ひとつ, ふたつ … and digits / kanji numerals
    numbers: {
      // things (つ), people (り / にん) and animals (ひき)
      1: ['ひとつ', '一つ', 'いっこ', '1つ', '1こ', 'いちばん', 'ひとり', '一人', 'いっぴき', '一匹'], 2: ['ふたつ', '二つ', '2つ', 'にばん', 'ふたり', '二人', 'にひき', '二匹'], 3: ['みっつ', '三つ', '3つ', 'さんばん', 'さんにん', '三人', 'さんびき', '三匹'],
      4: ['よっつ', '四つ', '4つ', 'よんばん', 'よにん', '四人', 'よんひき', 'よんびき', '四匹'], 5: ['いつつ', '五つ', '5つ', 'ごばん', 'ごにん', '五人', 'ごひき', '五匹'], 6: ['むっつ', '六つ', '6つ', 'ろくばん', 'ろくにん', '六人', 'ろっぴき'],
      7: ['ななつ', '七つ', '7つ', 'ななにん', 'しちにん', '七人', 'ななひき'], 8: ['やっつ', '八つ', '8つ', 'はちにん', '八人', 'はっぴき'], 9: ['ここのつ', '九つ', '9つ', 'きゅうにん', '九人'], 10: ['とお', '十', '10', 'じゅうにん', '十人']
    },
    // people on the back lane (post round)
    names: {
      tanaka: ['田中', 'たなか'], suzuki: ['鈴木', 'すずき'], sato: ['佐藤', 'さとう'],
      yamamoto: ['山本', 'やまもと'], ito: ['伊藤', 'いとう'], kimura: ['木村', 'きむら']
    },
    yen: ['えん', '円'],
    sleep: ['おやすみ', 'お休み', 'ねる', '寝る'],
    actions: {
      fetch: ['持ってきて', 'もってきて', '持って来て', '持ってこい', 'もってこい', '取ってきて', 'とってきて', '持ってって'],
      dig: ['掘って', 'ほって', '掘れ', 'ほれ', '掘る', 'ほる'],
      sit: ['おすわり', 'お座り', 'すわって', '座って'],
      wait: ['まって', '待って', 'すとっぷ', 'とまって', '止まって'],
      come: ['おいで', 'こっち', '来て', 'きて', 'もどって', '戻って']
    },
    greet: ['おはよう', 'こんにちは', 'こんばんは', 'はじめまして'],
    thanks: ['ありがとう'],
    repeat: ['もう一回', 'もういっかい', 'もう1回', 'もう一度', 'もういちど', 'もう1度'],
    slow: ['ゆっくり'],
    dunno: ['わからない', '分からない', 'わかりません', '分かりません', 'わかんない'],
    yes: ['はい', 'うん', 'いいよ', 'ええ'],
    no: ['いいえ', 'ううん', 'いや'],
    colors: {
      red: ['赤', 'あか'],
      blue: ['青', 'あお'],
      yellow: ['黄色', 'きいろ', '黄'],
      white: ['白', 'しろ'],
      black: ['黒', 'くろ'],
      green: ['緑', 'みどり'],
      purple: ['紫', 'むらさき'],
      pink: ['ピンク', 'ぴんく']
    },
    parts: {
      hat: ['帽子', 'ぼうし', 'はっと'],
      glasses: ['眼鏡', 'めがね'],
      umbrella: ['傘', 'かさ']
    },
    sizes: {
      big: ['大きい', 'おおきい', 'でかい', '大きな', 'おおきな'],
      small: ['小さい', 'ちいさい', 'ちっちゃい', '小さな', 'ちいさな']
    }
  };

  function kataToHira(s) {
    return s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
  }

  function norm(s) {
    return kataToHira(String(s || '').normalize('NFKC'))
      .toLowerCase()
      .replace(/[\s、。，．,.!！?？「」『』…・〜~]/g, '');
  }

  const NLEX = (function build(x) {
    if (Array.isArray(x)) return x.map(norm);
    if (x && typeof x === 'object') {
      const o = {};
      for (const k of Object.keys(x)) o[k] = k === 'jp' ? x[k] : build(x[k]);
      return o;
    }
    return x;
  })(LEX);

  // First position where any form appears, or -1.
  function findAny(text, forms) {
    let best = -1;
    let len = 0;
    for (const f of forms) {
      const i = text.indexOf(f);
      if (i !== -1 && (best === -1 || i < best || (i === best && f.length > len))) { best = i; len = f.length; }
    }
    return { at: best, len };
  }
  const has = (text, forms) => findAny(text, forms).at !== -1;

  function findItem(text) {
    let hit = null;
    for (const [id, it] of Object.entries(NLEX.items)) {
      const f = findAny(text, it.forms);
      if (f.at !== -1 && (!hit || f.at < hit.at || (f.at === hit.at && f.len > hit.len))) hit = { id, at: f.at, len: f.len };
    }
    return hit ? hit.id : null;
  }

  // A number in the sentence: counters (よっつ), kanji (四つ) or digits (4).
  const KANJI = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10 };
  const PLAIN = { 'いち': 1, 'に': 2, 'さん': 3, 'よん': 4, 'し': 4, 'ご': 5, 'ろく': 6, 'なな': 7, 'しち': 7, 'はち': 8, 'きゅう': 9, 'く': 9, 'じゅう': 10 };
  function findNumber(t) {
    let best = null;
    for (const [n, forms] of Object.entries(NLEX.numbers)) {
      const f = findAny(t, forms);
      if (f.at !== -1 && (!best || f.at < best.at)) best = { n: +n, at: f.at };
    }
    if (best) return best.n;
    const d = t.match(/(\d+)/); if (d) return +d[1];
    const k = t.match(/[一二三四五六七八九十]/); if (k) return KANJI[k[0]];
    if (PLAIN[t] !== undefined) return PLAIN[t];       // a bare number on its own
    const p = t.match(/^(いち|に|さん|よん|ご|ろく|なな|はち|きゅう|じゅう)(こ|つ|ほん)?(ほって|ほれ|ちょうだい|おねがい)?$/);
    return p ? PLAIN[p[1]] : null;
  }
  // Kana numbers up to 999: ひゃくごじゅう -> 150, さんびゃくにじゅう -> 320.
  const ONES = [['きゅう', 9], ['いち', 1], ['なな', 7], ['しち', 7], ['はち', 8], ['ろく', 6], ['よん', 4], ['さん', 3], ['に', 2], ['ご', 5], ['く', 9], ['し', 4], ['よ', 4]];
  const HUNDREDS = [['きゅうひゃく', 900], ['はっぴゃく', 800], ['ななひゃく', 700], ['ろっぴゃく', 600], ['ごひゃく', 500], ['よんひゃく', 400], ['さんびゃく', 300], ['にひゃく', 200], ['ひゃく', 100]];
  function kanaNumber(t) {
    t = t.replace(/じゅっ/g, 'じゅう').replace(/いっ/g, 'いち');
    let n = 0, i = 0, any = false;
    const take = (list) => { for (const [w, v] of list) if (t.startsWith(w, i)) { i += w.length; any = true; return v; } return 0; };
    n += take(HUNDREDS);
    const tensPre = take(ONES.filter(([w]) => w.length > 1 || 'にごさん'.includes(w)));
    if (t.startsWith('じゅう', i)) { i += 3; n += (tensPre || 1) * 10; any = true; n += take(ONES); }
    else n += tensPre;
    return any && i === t.length ? n : null;
  }
  function kanjiNumber(t) {
    const D = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9 };
    let n = 0, cur = 0, any = false;
    for (const c of t) {
      if (D[c]) { cur = D[c]; any = true; }
      else if (c === '百') { n += (cur || 1) * 100; cur = 0; any = true; }
      else if (c === '十') { n += (cur || 1) * 10; cur = 0; any = true; }
      else return null;
    }
    return any ? n + cur : null;
  }
  function anyNumber(t) {
    if (!t) return null;
    if (/^\d+$/.test(t)) return +t;
    const k = kanjiNumber(t); if (k !== null) return k;
    return kanaNumber(t);
  }
  // An amount of money: 150えん, 百五十円, ひゃくごじゅうえん
  function findYen(t) {
    const m = t.match(/^(.*?)(えん|円)/);
    const body = (m ? m[1] : t).replace(/^(ぜんぶで|ぜんぶ|これで|はい)/, '');
    return anyNumber(body);
  }
  // A clock time: 9時40分, くじよんじゅっぷん, じゅうじはん -> { h, m }
  const HOURS = { 'いち': 1, 'に': 2, 'さん': 3, 'よ': 4, 'ご': 5, 'ろく': 6, 'しち': 7, 'なな': 7, 'はち': 8, 'く': 9, 'じゅう': 10, 'じゅういち': 11, 'じゅうに': 12 };
  function findTime(t) {
    let m = t.match(/(\d{1,2})(?:時|じ|:)(\d{1,2})?/);
    if (m) return { h: +m[1], m: m[2] ? +m[2] : /はん|半/.test(t) ? 30 : 0 };
    m = t.match(/^(.*?)(?:時|じ(?!ゅ))(.*)$/);
    if (!m) return null;
    const hk = m[1].replace(/^(つぎは|つぎの|いま)/, '');
    const h = HOURS[hk] !== undefined ? HOURS[hk] : kanjiNumber(hk);
    if (!h) return null;
    let rest = m[2].replace(/(です|だよ|だ|よ|かな)$/, '');
    if (/^(はん|半)/.test(rest)) return { h, m: 30 };
    rest = rest.replace(/(ふん|ぷん|分)$/, '');
    if (!rest) return { h, m: 0 };
    const mm = anyNumber(rest.replace(/じゅっ$/, 'じゅう').replace(/っ$/, ''));
    return mm === null ? null : { h, m: mm };
  }
  function findName(t) {
    let best = null;
    for (const [id, forms] of Object.entries(NLEX.names)) { const f = findAny(t, forms); if (f.at !== -1 && (!best || f.at < best.at)) best = { id, at: f.at }; }
    return best ? best.id : null;
  }

  function findColors(t) {
    const out = [];
    for (const [color, forms] of Object.entries(NLEX.colors)) { const f = findAny(t, forms); if (f.at !== -1) out.push(color); }
    return out;
  }

  // Zombie description: colours bind to the part that follows them ("赤い帽子" = red hat).
  function parseDescription(text) {
    const parts = [];
    for (const [part, forms] of Object.entries(NLEX.parts)) {
      const f = findAny(text, forms);
      if (f.at !== -1) parts.push({ part, at: f.at });
    }
    const colors = [];
    for (const [color, forms] of Object.entries(NLEX.colors)) {
      const f = findAny(text, forms);
      if (f.at !== -1) colors.push({ color, at: f.at, end: f.at + f.len });
    }
    let size = null;
    for (const [s, forms] of Object.entries(NLEX.sizes)) if (has(text, forms)) size = s;

    const want = { parts: {}, looseColors: [], size };
    for (const p of parts) want.parts[p.part] = { color: null };
    for (const c of colors) {
      const owner = parts
        .filter((p) => p.at >= c.end && p.at - c.end <= 3)
        .sort((a, b) => a.at - b.at)[0];
      if (owner) want.parts[owner.part].color = c.color;
      else want.looseColors.push(c.color);
    }
    const any = parts.length || colors.length || size;
    return any ? want : null;
  }

  // Does a zombie match a description?
  function zombieMatches(z, want) {
    for (const [part, req] of Object.entries(want.parts)) {
      const zp = z[part];
      if (!zp) return false;
      if (req.color && zp.color !== req.color) return false;
    }
    for (const c of want.looseColors) {
      const colorsOnZombie = ['hat', 'umbrella', 'shirt'].map((p) => z[p] && z[p].color).filter(Boolean);
      if (!colorsOnZombie.includes(c)) return false;
    }
    if (want.size && z.size !== want.size) return false;
    return true;
  }

  function parseOne(raw) {
    const t = norm(raw);
    if (!t) return { type: 'none', text: raw };
    const out = { text: raw, norm: t, dog: has(t, NLEX.dog), num: findNumber(t), colors: findColors(t), name: findName(t), time: findTime(t), yen: has(t, NLEX.yen) ? findYen(t) : null };

    if (has(t, NLEX.repeat)) return { ...out, type: 'repeat' };
    if (has(t, NLEX.dunno)) return { ...out, type: 'dunno' };
    if (has(t, NLEX.slow) && t.length <= 6) return { ...out, type: 'slow' };

    const item = findItem(t);
    if (has(t, NLEX.actions.fetch)) return { ...out, type: 'fetch', item };
    if (has(t, NLEX.actions.dig)) return { ...out, type: 'dig', item };
    if (has(t, NLEX.actions.sit)) return { ...out, type: 'sit' };
    if (has(t, NLEX.actions.wait)) return { ...out, type: 'wait' };

    if (out.name) return { ...out, type: 'name' };
    const desc = parseDescription(t);
    if (desc) return { ...out, type: 'describe', desc };
    if (item) return { ...out, type: 'item', item };

    if (has(t, NLEX.sleep)) return { ...out, type: 'sleep' };
    if (out.yen !== null) return { ...out, type: 'yen' };
    if (out.time) return { ...out, type: 'time' };
    if (out.num !== null) return { ...out, type: 'number' };
    if (has(t, NLEX.actions.come)) return { ...out, type: 'come' };
    if (has(t, NLEX.greet)) return { ...out, type: 'greet' };
    if (has(t, NLEX.thanks)) return { ...out, type: 'thanks' };
    if (has(t, NLEX.yes)) return { ...out, type: 'yes' };
    if (has(t, NLEX.no)) return { ...out, type: 'no' };
    if (out.dog) return { ...out, type: 'dogname' };
    return { ...out, type: 'unknown' };
  }

  // Speech gives several guesses; keep the first one that means something.
  function parse(alts) {
    const list = (Array.isArray(alts) ? alts : [alts]).filter(Boolean);
    let first = null;
    for (const a of list) {
      const r = parseOne(a);
      if (!first) first = r;
      if (r.type !== 'unknown' && r.type !== 'none') return r;
    }
    return first || { type: 'none', text: '' };
  }

  // Words the Vosk grammar may listen for (kana and kanji forms as the model spells them).
  function grammarWords() {
    const words = new Set();
    const walk = (x) => {
      if (Array.isArray(x)) x.forEach((w) => words.add(w));
      else if (x && typeof x === 'object') Object.entries(x).forEach(([k, v]) => k !== 'jp' && walk(v));
    };
    walk(LEX);
    return [...words];
  }

  // Which lexicon words a sentence contains, as ids like "item:key" or "color:red".
  function wordsIn(raw) {
    const t = norm(raw), ids = [];
    for (const [id, it] of Object.entries(NLEX.items)) if (has(t, it.forms)) ids.push('item:' + id);
    for (const [id, forms] of Object.entries(NLEX.actions)) if (has(t, forms)) ids.push('verb:' + id);
    for (const [id, forms] of Object.entries(NLEX.colors)) if (has(t, forms)) ids.push('color:' + id);
    for (const [id, forms] of Object.entries(NLEX.parts)) if (has(t, forms)) ids.push('part:' + id);
    for (const [id, forms] of Object.entries(NLEX.sizes)) if (has(t, forms)) ids.push('size:' + id);
    const n = findNumber(t); if (n !== null) ids.push('number:' + n);
    for (const [id, forms] of Object.entries(NLEX.names)) if (has(t, forms)) ids.push('name:' + id);
    if (has(t, NLEX.yen)) ids.push('word:yen');
    if (findTime(t)) ids.push('word:time');
    for (const k of ['greet', 'thanks', 'repeat', 'slow', 'yes', 'no', 'sleep']) if (has(t, NLEX[k])) ids.push('phrase:' + k);
    if (has(t, NLEX.dog)) ids.push('item:dog');
    // drop words that only matched inside a longer one (くつ in くつした, きて in もってきて)
    const drop = new Set();
    if (ids.includes('item:sock')) drop.add('item:shoe');
    if (ids.includes('verb:fetch')) drop.add('verb:come');
    return ids.filter((i) => !drop.has(i));
  }


  // Dictionary entries for the phone's 言葉 app: kanji/kana as written, reading and English.
  const GLOSS = {
    'item:bucket': ['バケツ', '', 'bucket'], 'item:key': ['鍵', 'かぎ', 'key'], 'item:persimmon': ['柿', 'かき', 'persimmon'],
    'item:ball': ['ボール', '', 'ball'], 'item:shoe': ['靴', 'くつ', 'shoe'], 'item:tomato': ['トマト', '', 'tomato'],
    'item:carrot': ['人参', 'にんじん', 'carrot'], 'item:daikon': ['大根', 'だいこん', 'daikon radish'], 'item:shirt': ['シャツ', '', 'shirt'],
    'item:towel': ['タオル', '', 'towel'], 'item:sock': ['靴下', 'くつした', 'sock'], 'item:dog': ['犬', 'いぬ', 'dog'],
    'verb:fetch': ['持ってきて', 'もってきて', 'bring it'], 'verb:dig': ['掘って', 'ほって', 'dig'], 'verb:sit': ['お座り', 'おすわり', 'sit'],
    'verb:wait': ['待って', 'まって', 'wait'], 'verb:come': ['おいで', '', 'come here'],
    'color:red': ['赤', 'あか', 'red'], 'color:blue': ['青', 'あお', 'blue'], 'color:yellow': ['黄色', 'きいろ', 'yellow'],
    'color:white': ['白', 'しろ', 'white'], 'color:black': ['黒', 'くろ', 'black'], 'color:green': ['緑', 'みどり', 'green'],
    'color:purple': ['紫', 'むらさき', 'purple'], 'color:pink': ['ピンク', '', 'pink'],
    'part:hat': ['帽子', 'ぼうし', 'hat'], 'part:glasses': ['眼鏡', 'めがね', 'glasses'], 'part:umbrella': ['傘', 'かさ', 'umbrella'],
    'size:big': ['大きい', 'おおきい', 'big'], 'size:small': ['小さい', 'ちいさい', 'small'],
    'name:tanaka': ['田中', 'たなか', 'Tanaka (name)'], 'name:suzuki': ['鈴木', 'すずき', 'Suzuki (name)'], 'name:sato': ['佐藤', 'さとう', 'Satō (name)'],
    'name:yamamoto': ['山本', 'やまもと', 'Yamamoto (name)'], 'name:ito': ['伊藤', 'いとう', 'Itō (name)'], 'name:kimura': ['木村', 'きむら', 'Kimura (name)'],
    'word:yen': ['円', 'えん', 'yen'], 'word:time': ['時', 'じ', "o'clock"],
    'phrase:greet': ['おはよう', '', 'good morning / hello'], 'phrase:thanks': ['ありがとう', '', 'thank you'], 'phrase:repeat': ['もう一回', 'もういっかい', 'one more time'],
    'phrase:slow': ['ゆっくり', '', 'slowly'], 'phrase:yes': ['はい', '', 'yes'], 'phrase:no': ['いいえ', '', 'no'], 'phrase:sleep': ['お休み', 'おやすみ', 'good night']
  };
  // Names for things the camera can photograph: sprite -> [written, reading, English, category].
  // Categories: しぜん nature, たてもの buildings, もの things, いきもの animals, ひと people, ばしょ ground.
  const PHOTO = {
    cherry: ['桜', 'さくら', 'cherry tree', 'しぜん'], cherry_young: ['桜', 'さくら', 'cherry tree', 'しぜん'], bush: ['茂み', 'しげみ', 'bush', 'しぜん'],
    willow: ['柳', 'やなぎ', 'willow', 'しぜん'], cedar_tree: ['杉', 'すぎ', 'cedar', 'しぜん'], young_cedar: ['杉', 'すぎ', 'cedar', 'しぜん'],
    bamboo: ['竹', 'たけ', 'bamboo', 'しぜん'], bamboo_thicket: ['竹', 'たけ', 'bamboo', 'しぜん'], mushrooms: ['きのこ', '', 'mushrooms', 'しぜん'],
    reeds: ['葦', 'あし', 'reeds', 'しぜん'], straw: ['わら', '', 'straw', 'しぜん'], stone: ['石', 'いし', 'stone', 'しぜん'], rocks: ['岩', 'いわ', 'rocks', 'しぜん'],
    tree_stump: ['切り株', 'きりかぶ', 'tree stump', 'しぜん'], fallen_log: ['丸太', 'まるた', 'log', 'しぜん'], waterfall_cliff: ['滝', 'たき', 'waterfall', 'しぜん'],
    stepping_stone: ['飛び石', 'とびいし', 'stepping stones', 'しぜん'],
    landlord_house: ['家', 'いえ', 'house', 'たてもの'], workshop: ['家', 'いえ', 'house', 'たてもの'], tool_shed: ['物置', 'ものおき', 'shed', 'たてもの'],
    the_old_hut: ['小屋', 'こや', 'hut', 'たてもの'], watch_hut: ['小屋', 'こや', 'hut', 'たてもの'], cafe: ['喫茶店', 'きっさてん', 'café', 'たてもの'],
    small_bar: ['バー', '', 'bar', 'たてもの'], hardware: ['金物屋', 'かなものや', 'hardware store', 'たてもの'], grocer_shop: ['八百屋', 'やおや', 'greengrocer', 'たてもの'],
    bakery: ['パン屋', 'パンや', 'bakery', 'たてもの'], florist_shop: ['花屋', 'はなや', 'florist', 'たてもの'], police_box: ['交番', 'こうばん', 'police box', 'たてもの'],
    old_school: ['学校', 'がっこう', 'school', 'たてもの'], fox_shrine: ['神社', 'じんじゃ', 'shrine', 'たてもの'], wayside_shrine: ['祠', 'ほこら', 'little shrine', 'たてもの'],
    torii_gate: ['鳥居', 'とりい', 'torii gate', 'たてもの'], back_gate: ['門', 'もん', 'gate', 'たてもの'], high_wall: ['壁', 'かべ', 'wall', 'たてもの'],
    red_bridge_railing: ['橋', 'はし', 'bridge', 'たてもの'], well: ['井戸', 'いど', 'well', 'たてもの'], fountain: ['噴水', 'ふんすい', 'fountain', 'たてもの'],
    station_sign: ['駅', 'えき', 'station', 'たてもの'], level_crossing_gate: ['踏切', 'ふみきり', 'level crossing', 'たてもの'], bus_stop: ['バス停', 'バスてい', 'bus stop', 'たてもの'],
    karaoke_stage: ['舞台', 'ぶたい', 'stage', 'たてもの'], ramen_stall: ['屋台', 'やたい', 'food stall', 'たてもの'], festival_food_stall: ['屋台', 'やたい', 'food stall', 'たてもの'],
    honesty_stall: ['無人販売', 'むじんはんばい', 'honesty stall', 'たてもの'],
    stone_lantern: ['灯籠', 'とうろう', 'stone lantern', 'もの'], lamp: ['街灯', 'がいとう', 'street lamp', 'もの'], power_pole: ['電柱', 'でんちゅう', 'power pole', 'もの'],
    bench: ['ベンチ', '', 'bench', 'もの'], veg_crate: ['箱', 'はこ', 'box', 'もの'], vending_machine: ['自動販売機', 'じどうはんばいき', 'vending machine', 'もの'],
    an_old_dial_phone: ['電話', 'でんわ', 'telephone', 'もの'], trail_signpost: ['看板', 'かんばん', 'sign', 'もの'], scarecrow: ['かかし', '', 'scarecrow', 'もの'],
    paper_lantern: ['提灯', 'ちょうちん', 'paper lantern', 'もの'], festival_lanterns: ['提灯', 'ちょうちん', 'paper lantern', 'もの'], a_lantern_that_never_goes_out: ['提灯', 'ちょうちん', 'paper lantern', 'もの'],
    noticeboard: ['掲示板', 'けいじばん', 'noticeboard', 'もの'], wish_board: ['絵馬', 'えま', 'wish plaques', 'もの'], jizo_statue: ['お地蔵さん', 'おじぞうさん', 'Jizo statue', 'もの'],
    fox_statue: ['狐の像', 'きつねのぞう', 'fox statue', 'もの'], her_old_sewing_table: ['ミシン', '', 'sewing machine', 'もの'], dog_bed: ['ベッド', '', 'bed', 'もの'],
    cafe_table: ['テーブル', '', 'table', 'もの'], a_kotatsu: ['こたつ', '', 'kotatsu', 'もの'], a_cafe_counter: ['カウンター', '', 'counter', 'もの'],
    a_noodle_bar_counter: ['カウンター', '', 'counter', 'もの'], a_fruit_stand: ['果物', 'くだもの', 'fruit', 'もの'], a_flower_shelf: ['花', 'はな', 'flowers', 'しぜん'],
    a_goldfish_tank: ['金魚', 'きんぎょ', 'goldfish', 'いきもの'], washing_line: ['洗濯物', 'せんたくもの', 'laundry', 'もの'], the_fluffiest_futon_in_town: ['布団', 'ふとん', 'futon', 'もの'],
    a_tool_wall: ['道具', 'どうぐ', 'tools', 'もの'], a_reading_chair_and_newspaper_rack: ['新聞', 'しんぶん', 'newspaper', 'もの'], a_police_box_lamp: ['ランプ', '', 'lamp', 'もの'],
    a_jukebox: ['ジュークボックス', '', 'jukebox', 'もの'], a_bread_oven: ['オーブン', '', 'oven', 'もの'], a_takoyaki_grill: ['たこ焼き', 'たこやき', 'takoyaki', 'もの'],
    a_town_banner: ['旗', 'はた', 'flag', 'もの'], a_camping_tent_for_the_yard: ['テント', '', 'tent', 'もの'], a_carved_bear: ['熊', 'くま', 'bear (carving)', 'もの'],
    a_carved_wooden_fox: ['狐', 'きつね', 'fox (carving)', 'もの'], a_brass_ship_s_bell: ['鐘', 'かね', 'bell', 'もの'], a_giant_curry_pot: ['鍋', 'なべ', 'pot', 'もの'],
    a_rope_hammock: ['ハンモック', '', 'hammock', 'もの'], a_skateboard_wall_rack: ['スケボー', '', 'skateboard', 'もの'], fishing_rod: ['釣り竿', 'つりざお', 'fishing rod', 'もの'],
    ferry_boat: ['舟', 'ふね', 'boat', 'もの'], postbox: ['ポスト', '', 'postbox', 'もの'], police_bicycle: ['自転車', 'じてんしゃ', 'bicycle', 'もの'],
    mini_truck: ['トラック', '', 'truck', 'もの'], local_train: ['電車', 'でんしゃ', 'train', 'もの'], firework: ['花火', 'はなび', 'fireworks', 'もの'],
    bucket: ['バケツ', '', 'bucket', 'もの'], key: ['鍵', 'かぎ', 'key', 'もの'], persimmon: ['柿', 'かき', 'persimmon', 'もの'], ball: ['ボール', '', 'ball', 'もの'], shoe: ['靴', 'くつ', 'shoe', 'もの'],
    dog: ['犬', 'いぬ', 'dog', 'いきもの'], sneaking_cat: ['猫', 'ねこ', 'cat', 'いきもの'], crow: ['烏', 'からす', 'crow', 'いきもの'], frog: ['蛙', 'かえる', 'frog', 'いきもの'],
    tanuki: ['狸', 'たぬき', 'tanuki', 'いきもの'],
    // people: what they do
    landlord: ['大家さん', 'おおやさん', 'landlady', 'ひと'], mayor: ['町長', 'ちょうちょう', 'mayor', 'ひと'], hardware_store_owner: ['店長', 'てんちょう', 'shopkeeper', 'ひと'],
    baker: ['パン屋さん', 'パンやさん', 'baker', 'ひと'], grocer: ['八百屋さん', 'やおやさん', 'greengrocer', 'ひと'], plumber: ['水道屋さん', 'すいどうやさん', 'plumber', 'ひと'],
    ferryman: ['船頭', 'せんどう', 'ferryman', 'ひと'], student: ['学生', 'がくせい', 'student', 'ひと'], florist: ['花屋さん', 'はなやさん', 'florist', 'ひと'],
    ramen_stall_owner: ['ラーメン屋さん', 'ラーメンやさん', 'ramen cook', 'ひと'], bar_owner: ['ママ', '', 'bar owner', 'ひと'], cafe_regular: ['おじさん', '', 'older man', 'ひと'],
    cafe_owner: ['店長', 'てんちょう', 'café owner', 'ひと'], girl: ['女の子', 'おんなのこ', 'girl', 'ひと'], police_officer: ['お巡りさん', 'おまわりさん', 'police officer', 'ひと'],
    night_guard: ['警備員', 'けいびいん', 'guard', 'ひと'], fox_spirit: ['狐', 'きつね', 'fox spirit', 'ひと'], festival_stallholder: ['おばさん', '', 'auntie', 'ひと'],
    forest_ranger: ['おじいさん', '', 'old man', 'ひと'], hiker: ['ハイカー', '', 'hiker', 'ひと'],
    // ground
    't:g': ['草', 'くさ', 'grass', 'ばしょ'], 't:p': ['花びら', 'はなびら', 'petals', 'ばしょ'], 't:d': ['土', 'つち', 'dirt', 'ばしょ'], 't:s': ['畑', 'はたけ', 'field', 'ばしょ'],
    't:v': ['野菜', 'やさい', 'vegetables', 'ばしょ'], 't:r': ['道', 'みち', 'road', 'ばしょ'], 't:P': ['石畳', 'いしだたみ', 'paving', 'ばしょ'], 't:w': ['川', 'かわ', 'river', 'ばしょ'],
    't:k': ['桟橋', 'さんばし', 'pier', 'ばしょ'], 't:f': ['森', 'もり', 'forest', 'ばしょ'], 't:R': ['田んぼ', 'たんぼ', 'rice paddy', 'ばしょ'], 't:T': ['茶畑', 'ちゃばたけ', 'tea field', 'ばしょ'],
    't:b': ['竹林', 'ちくりん', 'bamboo grove', 'ばしょ'], 't:t': ['線路', 'せんろ', 'railway', 'ばしょ'], 't:u': ['線路', 'せんろ', 'railway', 'ばしょ'], 't:S': ['階段', 'かいだん', 'steps', 'ばしょ'],
    't:o': ['床', 'ゆか', 'floor', 'ばしょ'], 't:m': ['畳', 'たたみ', 'tatami', 'ばしょ'], 't:q': ['床', 'ゆか', 'floor', 'ばしょ'], 't:c': ['床', 'ゆか', 'floor', 'ばしょ']
  };
  // word id for a photographed thing: "thing:<reading>", so cedars young and old are one word
  function photoWord(key) {
    const p = PHOTO[key]; if (!p) return null;
    return { id: 'thing:' + (p[1] || p[0]), jp: p[0], kana: p[1], en: p[2], cat: p[3], sprite: key.startsWith('t:') ? null : key };
  }
  const PHOTO_BY_ID = {};
  Object.keys(PHOTO).forEach((k) => { const w = photoWord(k); if (!PHOTO_BY_ID[w.id] || (w.sprite && !PHOTO_BY_ID[w.id].sprite)) PHOTO_BY_ID[w.id] = w; });
  const NUM_JP = ['', '一つ', '二つ', '三つ', '四つ', '五つ', '六つ', '七つ', '八つ', '九つ', '十'];
  const NUM_KANA = ['', 'ひとつ', 'ふたつ', 'みっつ', 'よっつ', 'いつつ', 'むっつ', 'ななつ', 'やっつ', 'ここのつ', 'とお'];
  const CAT = { item: 'もの', verb: 'うごき', color: 'いろ', part: 'もの', size: 'ようす', number: 'かず', word: 'かず', name: 'ひと', phrase: 'あいさつ' };
  function gloss(id) {
    if (PHOTO_BY_ID[id]) return Object.assign({}, PHOTO_BY_ID[id]);
    const kind = id.split(':')[0], cat = CAT[kind] || 'ほか';
    if (kind === 'number') {
      const n = +id.split(':')[1];
      return n >= 1 && n <= 10 ? { id, jp: NUM_JP[n], kana: NUM_KANA[n], en: String(n), cat } : { id, jp: String(n), kana: '', en: String(n), cat };
    }
    const g = GLOSS[id];
    return g ? { id, jp: g[0], kana: g[1], en: g[2], cat } : { id, jp: id.split(':')[1] || id, kana: '', en: '', cat };
  }

  const api = { gloss, photoWord, PHOTO, LEX, norm, parse, parseOne, parseDescription, zombieMatches, grammarWords, wordsIn, findNumber, findYen, findTime, kanaNumber };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Words = api;
})(typeof window !== 'undefined' ? window : globalThis);
