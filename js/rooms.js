// Inside rooms. Walk into a building's door to go in; walk out of the front edge to leave.
// Floors:  o wooden boards   m tatami   q tiled stone   c shop concrete
// A room is linked to its building in game.js: the building lists { room: '<id>', door: <0..1> },
// where door is how far along the front-left wall the door is, measured from the front corner.
// Walls: the two back walls are drawn by the game. `wall` is the paint colour, `trim` the skirting,
// and `windows` show the sky outside, so they change colour with the time of day.
(function (root) {
  const ROOMS = {};
  const P = (sprite, x, y, extra) => Object.assign({ sprite, x, y }, extra || {});
  const N = (id, name, sprite, x, y, hello) => ({ id, name, sprite, x, y, hello });
  function floor(w, h, base, rects) {
    const rows = Array.from({ length: h }, () => Array(w).fill(base));
    for (const [ch, x0, y0, x1, y1] of rects || []) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (rows[y] && x < w) rows[y][x] = ch;
    return rows.map((r) => r.join(''));
  }

  // あなたの部屋 Your room: the workshop in the back yard, where the hero lives.
  // Later the おうち app places friends' furniture here.
  ROOMS.room = {
    id: 'room', name: 'あなたの部屋 · Your room', interior: true,
    ground: floor(8, 7, 'o', [['m', 0, 0, 3, 3]]),
    wall: '#e9dcc0', trim: '#8a6a45', light: 'warm',
    windows: [{ wall: 'n', at: 4.6, w: 2 }, { wall: 'w', at: 4.2, w: 1.6 }],
    buildings: [],
    props: [
      P('the_fluffiest_futon_in_town', 2.2, 2.6, { solid: true, r: 0.5 }),
      P('a_tool_wall', 7.4, 0.9, { solid: true }),
      P('dog_bed', 6.6, 5.4),
      P('paper_lantern', 0.8, 5.6, { solid: false }),
      P('an_old_dial_phone', 5.2, 0.9, { solid: true })
    ],
    npcs: [],
    homeSpot: { x: 4.4, y: 4.2 }   // where the hero stands when the おうち app opens (later)
  };

  // ハナさんの家 Hana's house: tatami living room, kotatsu, her sewing table and goldfish.
  ROOMS.hana_house = {
    id: 'hana_house', name: 'ハナさんの家 · Hana\'s house', interior: true,
    ground: floor(9, 7, 'm', [['o', 0, 5, 8, 6]]),
    wall: '#f1e6cc', trim: '#6f5236', shoji: true, light: 'warm',
    windows: [{ wall: 'n', at: 2.2, w: 2.4 }, { wall: 'n', at: 6.2, w: 1.6 }],
    buildings: [],
    props: [
      P('a_kotatsu', 4.6, 3.4, { solid: true, r: 0.5 }),
      P('her_old_sewing_table', 1.8, 1.4, { solid: true }),
      P('a_goldfish_tank', 8.4, 1.2, { solid: true }),
      P('an_old_dial_phone', 8.2, 4.0, { solid: true }),
      P('paper_lantern', 0.8, 4.4, { solid: false }),
      P('sneaking_cat', 6.6, 5.6, { solid: false })
    ],
    npcs: []
  };

  // 八百屋 Daikichi's greengrocer (Town square)
  ROOMS.grocer_in = {
    id: 'grocer_in', name: '八百屋 · Greengrocer', interior: true,
    ground: floor(8, 6, 'c', [['q', 0, 0, 7, 1]]),
    wall: '#e3efd6', trim: '#3f6b4a', light: 'cool',
    windows: [{ wall: 'w', at: 3, w: 2 }],
    buildings: [],
    props: [
      P('a_fruit_stand', 2.4, 2.6, { solid: true, r: 0.5 }),
      P('a_fruit_stand', 5.4, 2.6, { solid: true, r: 0.5, flip: true }),
      P('veg_crate', 1.2, 4.6), P('veg_crate', 1.9, 5.1), P('veg_crate', 6.8, 4.8),
      P('a_cafe_counter', 7.4, 1.6, { solid: true, r: 0.5 }),
      P('a_flower_shelf', 0.9, 1.0, { solid: true })
    ],
    npcs: [N('daikichi_wife', '大吉さんの おくさん', 'grocer', 6.2, 1.3, 'いらっしゃい！ きょうは トマトが やすいよ。')]
  };

  // カフェ Mika's café (Café street)
  ROOMS.cafe_in = {
    id: 'cafe_in', name: 'カフェ · Café', interior: true,
    ground: floor(9, 7, 'o', [['q', 5, 0, 8, 2]]),
    wall: '#f6e1c8', trim: '#7a4e2e', light: 'warm',
    windows: [{ wall: 'w', at: 2.4, w: 2 }, { wall: 'w', at: 5.2, w: 1.4 }, { wall: 'n', at: 2.6, w: 2 }],
    buildings: [],
    props: [
      P('a_cafe_counter', 7.6, 2.4, { solid: true, r: 0.5 }),
      P('bench', 2.6, 3.4, { solid: true }), P('bench', 2.6, 5.8, { solid: true }), P('a_kotatsu', 5.2, 5.4, { solid: true, r: 0.5 }),
      P('a_jukebox', 8.5, 4.6, { solid: true }),
      P('a_reading_chair_and_newspaper_rack', 4.4, 1.0, { solid: true }),
      P('a_goldfish_tank', 1.0, 1.0, { solid: true })
    ],
    npcs: [N('mika', 'ミカさん', 'cafe_owner', 6.4, 1.6, 'いらっしゃいませ！ なにに する？')]
  };

  // 交番 Police box (inside is one small office)
  ROOMS.police_in = {
    id: 'police_in', name: '交番 · Police box', interior: true,
    ground: floor(6, 5, 'c'),
    wall: '#e6ecf3', trim: '#2f3d5c', light: 'cool',
    windows: [{ wall: 'n', at: 3, w: 1.6 }],
    buildings: [],
    props: [
      P('her_old_sewing_table', 3.4, 1.6, { solid: true }),
      P('an_old_dial_phone', 1.0, 1.0, { solid: true }),
      P('a_police_box_lamp', 5.4, 0.9, { solid: true }),
      P('noticeboard', 0.9, 3.6, { solid: true })
    ],
    npcs: []
  };

  root.ROOM_DEFS = ROOMS;
})(typeof window !== 'undefined' ? window : globalThis);
