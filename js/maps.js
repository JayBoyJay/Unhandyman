// The town's other areas: Chapter 1–5 areas and the routes between them.
// Ground is built from rectangles so maps are easy to edit:
//   g grass  p petals  d dirt  P stone paving  r street  w water  k wooden planks
//   f forest floor  R rice paddy  T tea field  b bamboo floor  t/u railway track (along x / along y)  S stone steps  s soil  v vegetables
// Buildings sit on their front (lowest) corner. Props sit on their base. Exits lead to the next map.
(function (root) {
  function grid(w, h, base, rects) {
    const rows = Array.from({ length: h }, () => Array(w).fill(base));
    for (const [ch, x0, y0, x1, y1] of rects) {
      for (let y = Math.max(0, y0); y <= Math.min(h - 1, y1); y++) for (let x = Math.max(0, x0); x <= Math.min(w - 1, x1); x++) rows[y][x] = ch;
    }
    return rows.map((r) => r.join(''));
  }
  const P = (sprite, x, y, extra) => Object.assign({ sprite, x, y }, extra || {});
  const N = (id, name, sprite, x, y, hello) => ({ id, name, sprite, x, y, hello });

  const MAPS = {};

  // 広場 Town square (Chapter 1)
  MAPS.square = {
    id: 'square', name: '広場 · Town square',
    ground: grid(24, 18, 'g', [
      ['p', 0, 0, 3, 2], ['p', 20, 0, 23, 1],
      ['P', 6, 5, 17, 12],
      ['r', 18, 8, 23, 9],
      ['d', 0, 8, 5, 9],
      ['P', 9, 13, 13, 13],
      ['w', 0, 15, 23, 17], ['k', 10, 14, 11, 16]
    ]),
    buildings: [P('hardware', 9.5, 4.6), P('grocer_shop', 14, 4.6), P('bakery', 19, 4.6), P('landlord_house', 5.5, 13.6)],
    props: [
      P('fountain', 12.6, 9.6, { r: 1 }), P('noticeboard', 7.6, 6.6), P('bench', 15.6, 11.8), P('bench', 9.2, 12.0),
      P('stone_lantern', 6.4, 12.6), P('stone_lantern', 17.6, 12.6), P('lamp', 17.6, 7.4), P('lamp', 6.4, 7.4),
      P('ferry_boat', 13.2, 16.4, { solid: false }), P('cherry', 2.2, 4.6), P('cherry', 21.6, 13.6), P('cherry', 3.4, 16.2, { solid: false }),
      P('cherry', 21.4, 3.2), P('bush', 1.4, 11.6), P('bush', 18.6, 13.8), P('bush', 4.2, 1.2), P('vending_machine', 17.4, 5.2)
    ],
    npcs: [
      N('mayor', '町長さん', 'mayor', 8.6, 7.4, 'ようこそ、広場へ！'),
      N('kaneko', '金子さん', 'hardware_store_owner', 9.0, 5.4, 'なにか いる？ どうぐ なら ある。'),
      N('mari', 'マリさん', 'baker', 18.4, 5.4, 'パン、やけたよ〜！'),
      N('daikichi', '大吉さん', 'grocer', 13.4, 5.4, 'いらっしゃい！ トマト、みっつで ひゃくえん！'),
      N('mizuno', '水野さん', 'plumber', 14.2, 9.8, 'ふんすいが… あの… ちょっと こわれて いて…'),
      N('gen', '源さん', 'ferryman', 11.4, 14.4, '…おう。')
    ],
    exits: [
      { side: 'e', y0: 7.6, y1: 10.4, to: 'lane', at: { x: 0.9, y: 4.9 } },
      { side: 'w', y0: 7.6, y1: 10.4, to: 'river', at: { x: 27.1, y: 3.9 }, need: 'ch1done', locked: '川沿いの道 · finish Chapter 1 (the ferryman) first' }
    ],
    start: { x: 21, y: 8.9 }
  };

  // 川沿いの道 Riverside walk (Town square -> Café street)
  MAPS.river = {
    id: 'river', name: '川沿いの道 · Riverside walk',
    ground: grid(28, 10, 'g', [
      ['p', 6, 0, 9, 1], ['p', 22, 0, 24, 0],
      ['d', 4, 3, 27, 4], ['P', 0, 2, 3, 5],
      ['w', 0, 7, 27, 9], ['w', 0, 6, 15, 6], ['k', 20, 5, 21, 9]
    ]),
    buildings: [],
    props: [
      P('willow', 5.6, 1.6), P('willow', 15.4, 1.8), P('willow', 25.8, 1.4),
      P('reeds', 4.6, 6.2, { solid: false }), P('reeds', 9.4, 6.3, { solid: false }), P('reeds', 17.4, 6.6, { solid: false }), P('reeds', 24.2, 6.6, { solid: false }),
      P('stepping_stone', 11.4, 7.4, { solid: false }), P('stepping_stone', 12.4, 8.2, { solid: false }), P('stepping_stone', 13.6, 8.9, { solid: false }),
      P('fishing_rod', 9.2, 5.6, { solid: false }), P('frog', 7.2, 5.8, { solid: false }),
      P('red_bridge_railing', 21.9, 7.6, { solid: false }), P('bench', 18.2, 2.2), P('bush', 12.2, 0.8), P('stone_lantern', 3.4, 1.4)
    ],
    npcs: [N('yui', 'ユイ', 'student', 21.0, 6.6, 'やっほー！ この はし、めっちゃ いい でしょ？')],
    exits: [
      { side: 'e', y0: 2.6, y1: 5.4, to: 'square', at: { x: 0.9, y: 8.9 } },
      { side: 'w', y0: 1.6, y1: 5.4, to: 'cafe', at: { x: 23.1, y: 9.4 } }
    ],
    start: { x: 27, y: 3.9 }
  };

  // カフェ通り Café street (Chapter 2)
  MAPS.cafe = {
    id: 'cafe', name: 'カフェ通り · Café street',
    ground: grid(24, 18, 'g', [
      ['P', 0, 7, 23, 11], ['p', 0, 0, 4, 2], ['p', 19, 15, 23, 17], ['d', 10, 12, 11, 17]
    ]),
    buildings: [P('cafe', 9, 6.6), P('small_bar', 15, 6.6), P('landlord_house', 21.5, 6.6), P('workshop', 6.5, 16.6)],
    props: [
      P('florist_shop', 17.2, 7.0), P('high_wall', 3.4, 6.6), P('high_wall', 2.0, 6.6),
      P('ramen_stall', 14.4, 13.2), P('cafe_table', 9.2, 8.8), P('cafe_table', 11.2, 9.4), P('vending_machine', 18.6, 12.4),
      P('lamp', 5.6, 12.2), P('lamp', 13.4, 12.2), P('lamp', 20.6, 12.2),
      P('cherry', 2.2, 14.2), P('cherry', 17.4, 16.6, { solid: false }), P('cherry', 12.6, 2.2), P('bush', 6.4, 3.2), P('bush', 21.8, 14.2)
    ],
    npcs: [
      N('mika', 'ミカさん', 'cafe_owner', 8.2, 7.6, 'いらっしゃいませ！ なにに する？'),
      N('sakura', 'サクラさん', 'florist', 17.8, 8.0, '…あ、こんにちは。'),
      N('tetsu', '鉄さん', 'ramen_stall_owner', 14.8, 14.0, 'まいど！ ラーメン、めっちゃ うまいで！'),
      N('yuri', 'ユリママ', 'bar_owner', 14.0, 7.8, 'あら、いらっしゃい。 きいた？ あの うわさ…'),
      N('yamada', '山田さん', 'cafe_regular', 11.8, 10.0, 'おはよう。 きょうの しんぶん、もう よんだ？'),
      N('girl', 'ハルちゃん', 'girl', 4.6, 10.2, 'わんちゃん だ！ かわいい！')
    ],
    exits: [
      { side: 'e', y0: 6.6, y1: 11.4, to: 'river', at: { x: 0.9, y: 3.9 } },
      { side: 'w', y0: 6.6, y1: 11.4, to: 'rail', at: { x: 27.1, y: 4.9 }, need: 'ch2done', locked: '踏切 · finish Chapter 2 (the café owner) first' }
    ],
    start: { x: 23, y: 9.4 }
  };

  // 踏切 Railway crossing (Café street -> Police box)
  MAPS.rail = {
    id: 'rail', name: '踏切 · Railway crossing',
    ground: grid(28, 10, 'g', [
      ['r', 0, 4, 27, 5], ['u', 13, 0, 14, 9], ['P', 16, 0, 21, 2], ['P', 24, 3, 27, 6], ['p', 3, 7, 6, 9]
    ]),
    buildings: [],
    props: [
      P('local_train', 14.6, 1.0, { r: 0.5, flip: true }), P('station_sign', 18.6, 2.4), P('bench', 20.2, 1.8),
      P('level_crossing_gate', 12.6, 3.7, { solid: false }), P('level_crossing_gate', 15.6, 6.6, { solid: false }),
      P('power_pole', 6, 3.6), P('power_pole', 22, 6.6), P('power_pole', 9, 6.6),
      P('high_wall', 4.4, 3.6), P('high_wall', 3.0, 3.6), P('bush', 25.2, 1.2), P('cherry', 1.6, 8.8, { solid: false }), P('vending_machine', 23.6, 2.8)
    ],
    npcs: [],
    exits: [
      { side: 'e', y0: 2.6, y1: 6.4, to: 'cafe', at: { x: 0.9, y: 9.4 } },
      { side: 'w', y0: 3.6, y1: 6.4, to: 'police', at: { x: 23.1, y: 8.9 } }
    ],
    start: { x: 27, y: 4.9 }
  };

  // 交番と古い学校 Police box and old school (Chapter 3)
  MAPS.police = {
    id: 'police', name: '交番と古い学校 · Police box and old school',
    ground: grid(24, 18, 'g', [
      ['r', 0, 8, 23, 9], ['P', 4, 6, 9, 7], ['d', 11, 1, 21, 7], ['d', 13, 10, 20, 15], ['p', 0, 14, 3, 17], ['p', 22, 0, 23, 3]
    ]),
    buildings: [P('police_box', 8.4, 6.6), P('old_school', 20.4, 5.4), P('landlord_house', 6.4, 15.6), P('workshop', 23.4, 16.4)],
    props: [
      P('back_gate', 11.6, 2.6), P('police_bicycle', 9.6, 7.4, { solid: false }), P('sneaking_cat', 16.2, 12.4, { solid: false }),
      P('lamp', 10.6, 7.4), P('lamp', 2.4, 10.6), P('cherry', 21.6, 11.6), P('cherry', 1.8, 3.4), P('cherry', 11.4, 14.6),
      P('bush', 4.4, 11.4), P('bush', 17.4, 16.4), P('bench', 15.2, 7.2), P('tree_stump', 18.6, 13.2)
    ],
    npcs: [
      N('tanaka', '田中さん', 'police_officer', 9.6, 8.0, 'あ、こんにちは！ なにか ありましたか？'),
      N('nemu', 'ネムさん', 'night_guard', 11.8, 3.6, 'ふぁ〜…　ねむい…')
    ],
    exits: [
      { side: 'e', y0: 7.6, y1: 10.4, to: 'rail', at: { x: 0.9, y: 4.9 } },
      { side: 'w', y0: 7.6, y1: 10.4, to: 'bamboo', at: { x: 27.1, y: 4.9 }, need: 'ch3done', locked: '竹林の小道 · finish Chapter 3 (the police officer) first' }
    ],
    start: { x: 23, y: 8.9 }
  };

  // 竹林の小道 Bamboo path (Old school -> Shrine)
  const bambooProps = [];
  for (let x = 2; x < 27; x += 2.2) {
    if (x > 12.5 && x < 16) continue;
    bambooProps.push(P(x % 4.4 < 2.2 ? 'bamboo' : 'bamboo_thicket', x, 1.4 + ((x * 7) % 3) * 0.4));
    bambooProps.push(P(x % 4.4 < 2.2 ? 'bamboo_thicket' : 'bamboo', x + 1, 8.2 + ((x * 5) % 3) * 0.4));
  }
  MAPS.bamboo = {
    id: 'bamboo', name: '竹林の小道 · Bamboo path',
    ground: grid(28, 10, 'b', [['d', 3, 4, 27, 5], ['P', 0, 3, 2, 6], ['w', 14, 0, 15, 9], ['k', 14, 4, 15, 5]]),
    buildings: [],
    props: bambooProps.concat([
      P('jizo_statue', 8.2, 3.5), P('jizo_statue', 9.2, 3.5), P('jizo_statue', 10.2, 3.5),
      P('wayside_shrine', 19.6, 3.4), P('red_bridge_railing', 15.9, 3.7, { solid: false }), P('torii_gate', 3.6, 6.1, { solid: false, flip: true }),
      P('stone_lantern', 2.6, 2.6), P('stone_lantern', 2.6, 7.0)
    ]),
    npcs: [],
    exits: [
      { side: 'e', y0: 3.6, y1: 6.4, to: 'police', at: { x: 0.9, y: 8.9 } },
      { side: 'w', y0: 2.6, y1: 6.4, to: 'shrine', at: { x: 23.1, y: 8.9 } }
    ],
    start: { x: 27, y: 4.9 }
  };

  // 神社とお祭り広場 Shrine and festival grounds (Chapter 4)
  MAPS.shrine = {
    id: 'shrine', name: '神社とお祭り広場 · Shrine and festival grounds',
    ground: grid(24, 18, 'g', [
      ['P', 8, 8, 23, 9], ['S', 6, 8, 7, 9], ['P', 2, 7, 5, 11],
      ['d', 10, 1, 20, 6], ['d', 14, 0, 15, 0], ['p', 0, 13, 5, 17], ['p', 17, 12, 23, 17]
    ]),
    buildings: [P('fox_shrine', 4.6, 10.6)],
    props: [
      P('torii_gate', 17.2, 10.1, { solid: false, flip: true }), P('torii_gate', 10.4, 10.1, { solid: false, flip: true }),
      P('stone_lantern', 9.0, 7.4), P('stone_lantern', 9.0, 10.8), P('stone_lantern', 13.0, 7.4), P('stone_lantern', 13.0, 10.8),
      P('fox_statue', 6.4, 7.4), P('fox_statue', 6.4, 10.8),
      P('festival_food_stall', 12.6, 3.2), P('festival_food_stall', 18.4, 3.4), P('karaoke_stage', 16.6, 2.0, { r: 1 }),
      P('wish_board', 11.4, 6.4), P('festival_lanterns', 14.0, 5.2), P('festival_lanterns', 19.6, 6.2),
      P('cherry', 2.0, 3.6), P('cherry', 5.2, 15.4), P('cherry', 20.8, 14.6), P('cherry', 22.4, 4.4), P('cherry', 8.2, 15.8), P('cherry', 13.6, 14.4)
    ],
    npcs: [
      N('kon', 'コン', 'fox_spirit', 6.8, 9.2, '…ほう。 めずらしい おきゃくさま でございますね。'),
      N('obachan', 'たこ焼きの おばちゃん', 'festival_stallholder', 13.6, 4.0, 'ほら、てつだって ちょうだい！')
    ],
    exits: [
      { side: 'e', y0: 7.6, y1: 10.4, to: 'bamboo', at: { x: 0.9, y: 4.9 } },
      { side: 'n', x0: 13.6, x1: 16.4, to: 'terrace', at: { x: 27.1, y: 4.9 }, need: 'ch4done', locked: '棚田の道 · finish Chapter 4 (the fox spirit) first' }
    ],
    start: { x: 23, y: 8.9 }
  };

  // 棚田の道 Terrace road (Shrine -> Mountain forest)
  MAPS.terrace = {
    id: 'terrace', name: '棚田の道 · Terrace road',
    ground: grid(28, 10, 'g', [
      ['d', 0, 4, 27, 5], ['R', 8, 0, 13, 2], ['R', 15, 0, 20, 2], ['R', 9, 7, 16, 9], ['T', 19, 7, 25, 9], ['T', 22, 0, 26, 2],
      ['f', 0, 0, 4, 9]
    ]),
    buildings: [],
    props: [
      P('well', 6.4, 7.2), P('scarecrow', 12.6, 8.2), P('straw', 17.6, 6.8), P('straw', 18.4, 7.2), P('crow', 12.0, 3.6, { solid: false }),
      P('cedar_tree', 1.4, 2.0), P('cedar_tree', 3.0, 1.0), P('young_cedar', 2.4, 7.8), P('cedar_tree', 1.2, 9.4), P('fallen_log', 4.4, 7.8),
      P('bush', 14.4, 3.4), P('power_pole', 21, 3.6), P('trail_signpost', 5.6, 3.6)
    ],
    npcs: [],
    exits: [
      { side: 'e', y0: 3.6, y1: 6.4, to: 'shrine', at: { x: 14.9, y: 0.9 } },
      { side: 'w', y0: 3.6, y1: 6.4, to: 'forest', at: { x: 23.1, y: 8.9 } }
    ],
    start: { x: 27, y: 4.9 }
  };

  // 山の森 Mountain forest (Chapter 5)
  const cedars = [[2, 2], [4.6, 1.2], [7.4, 2.6], [1.4, 6.4], [3.6, 12.6], [1.6, 16.2], [8.6, 16.6], [12.6, 14.8], [15.4, 16.8], [21.6, 3.2], [23.2, 6.0], [19.6, 1.4], [22.4, 13.6], [17.6, 12.2], [5.4, 9.2], [10.4, 11.4]];
  MAPS.forest = {
    id: 'forest', name: '山の森 · Mountain forest',
    ground: grid(24, 18, 'f', [
      ['d', 14, 8, 23, 9], ['d', 9, 9, 14, 10], ['d', 6, 10, 9, 13], ['d', 15, 10, 16, 14],
      ['w', 10, 0, 11, 6], ['w', 11, 6, 12, 8], ['k', 11, 9, 12, 10], ['w', 12, 11, 13, 17]
    ]),
    buildings: [P('watch_hut', 19.4, 14.6), P('the_old_hut', 7.6, 16.6)],
    props: cedars.map(([x, y], i) => P(i % 3 === 2 ? 'young_cedar' : 'cedar_tree', x, y)).concat([
      P('waterfall_cliff', 12.2, 1.6, { r: 1.5 }), P('fallen_log', 17.8, 7.2), P('rocks', 14.2, 6.6), P('stone', 8.2, 7.6), P('tree_stump', 18.2, 11.2),
      P('mushrooms', 4.4, 10.6, { solid: false }), P('mushrooms', 20.2, 10.4, { solid: false }), P('mushrooms', 17.6, 3.4, { solid: false }), P('stone', 18.4, 2.2), P('trail_signpost', 14.6, 7.6)
    ]),
    npcs: [
      N('kumada', '熊田さん', 'forest_ranger', 17.6, 15.0, 'この 山は な… むかし むかし…'),
      N('ken', 'ケンさん', 'hiker', 17.2, 9.6, 'やあ！ どこから きたの？')
    ],
    exits: [{ side: 'e', y0: 7.6, y1: 10.4, to: 'terrace', at: { x: 0.9, y: 4.9 } }],
    start: { x: 23, y: 8.9 }
  };

  root.MAP_DEFS = MAPS;
})(typeof window !== 'undefined' ? window : globalThis);
