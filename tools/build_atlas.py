# Builds assets/atlas.png and assets/atlas.js from the native-size sprites in assets/source/sprites.
# Run from the project folder:  python3 tools/build_atlas.py
import json, os, numpy as np
from PIL import Image
SRC = 'assets/source/sprites'; OUT = 'assets'
# game name -> file in assets/source/sprites
PICK = {
 'grass': 'grass', 'grass_petals': 'petal_covered_grass', 'paving': 'stone_paving', 'dirt': 'dirt_path',
 'water': 'river_water', 'soil': 'garden_soil', 'veg_patch': 'vegetable_patch', 'street': 'street',
 'cherry': 'cherry_blossom_tree', 'cherry_young': 'young_cherry_tree', 'bush': 'bush', 'fence': 'fence',
 'dig_spot': 'dig_spot', 'veg_crate': 'vegetable_crate', 'dog_bed': 'dog_bed', 'washing_line': 'washing_line',
 'lamp': 'street_lamp', 'hero_front': 'hero_front', 'hero_side': 'hero_side', 'hero_back': 'hero_back',
 'dog': 'small_white_dog', 'z_hat': 'red_hat_zombie', 'z_glasses': 'glasses_zombie', 'z_flower': 'flower_holding_zombie',
 'landlord': 'landlord', 'bucket': 'bucket', 'key': 'key', 'persimmon': 'persimmon', 'scrap': 'diary_scrap',
 # buildings (rebuilt roofs)
 'workshop': 'your_workshop', 'landlord_house': 'landlord_s_house', 'tool_shed': 'tool_shed',
 'grocer_shop': 'grocer', 'bakery': 'bakery', 'hardware': 'hardware_store',
 # back lane
 'bus_stop': 'bus_stop', 'postbox': 'postbox', 'power_pole': 'power_pole', 'honesty_stall': 'honesty_vegetable_stall',
 'mini_truck': 'mini_truck', 'scarecrow': 'scarecrow', 'straw': 'rice_straw_bundle', 'crow': 'crow', 'frog': 'frog',
 'grocer': 'grocer_person', 'yamada': 'cafe_regular', 'tanuki': 'tanuki_statue'
}
# every other sprite in the source folder is included under its own file name
for f in sorted(os.listdir(SRC)):
    k = f[:-4]
    if f.endswith('.png') and k not in PICK.values() and k not in PICK: PICK[k] = k
# buildings: their footprint (in tiles) is measured from the wall corners
FIX = ['workshop', 'landlord_house', 'tool_shed', 'grocer_shop', 'bakery', 'hardware', 'cafe', 'small_bar', 'police_box',
       'old_school', 'fox_shrine', 'the_old_hut', 'watch_hut']
TILES = ['grass', 'grass_petals', 'paving', 'dirt', 'soil', 'veg_patch', 'street', 'water',
         'forest_floor', 'rice_paddy', 'tea_field', 'bamboo_grove_floor', 'railway_track', 'stone_steps', 'dock_planks']
INK = (43, 31, 51)
sprites = {k: Image.open(f'{SRC}/{v}.png').convert('RGBA') for k, v in PICK.items()}

# Ground tiles: keep only the 32x16 top face so neighbouring tiles butt together with no seams.
def diamond(r):  # half-width of the top face on row r (0..15)
    return 1 + 2 * r if r < 8 else 1 + 2 * (15 - r)
def top_face(im):
    a = np.array(im); t = np.zeros((16, 32, 4), np.uint8)
    for r in range(16):
        hw = diamond(r)
        t[r, 16 - hw:16 + hw] = a[r, 16 - hw:16 + hw]
    return t
tiles = {}
for k in TILES:
    t = top_face(sprites[k])
    if k in ('water', 'rice_paddy'):
        # these sprites have a bank or levee on every tile, which draws a grid; make the surface seamless:
        # one flat colour plus a few small highlights placed away from the tile edges
        body = t[5:11, 10:22].reshape(-1, 4)
        cols, n = np.unique(body, axis=0, return_counts=True)
        order = n.argsort()[::-1]
        main = cols[order[0]]
        lum = lambda c: 0.3 * int(c[0]) + 0.59 * int(c[1]) + 0.11 * int(c[2])
        accents = [c for c in cols[order[1:]] if abs(lum(c) - lum(main)) > 12][:2]
        for r in range(16):
            hw = diamond(r)
            for x in range(16 - hw, 16 + hw): t[r, x] = main
        spots = [(4, 13), (7, 18), (9, 10), (11, 16), (6, 8), (8, 22)] if k == 'water' else [(4, 14), (6, 9), (6, 19), (8, 14), (10, 10), (10, 20), (12, 15)]
        for i, (r, x) in enumerate(spots):
            if accents:
                c = accents[i % len(accents)]
                t[r, x] = c; t[r, x + 1] = c
    # strip the outline from the top face, or every tile draws a grid line around itself
    for r in range(16):
        hw = diamond(r)
        for x in range(16 - hw, 16 + hw):
            if sum(abs(int(t[r, x][i]) - INK[i]) for i in range(3)) < 40:
                step = 1 if x < 16 else -1; xx = x
                while 16 - hw <= xx < 16 + hw and sum(abs(int(t[r, xx][i]) - INK[i]) for i in range(3)) < 40: xx += step
                rr = r
                if not (16 - hw <= xx < 16 + hw): rr = r + (1 if r < 8 else -1); xx = x
                t[r, x] = t[rr, min(max(xx, 0), 31)]
    tiles[k] = Image.fromarray(t)
# the map's outer edge uses the full tile (with its side) so the island still has a base
for k in TILES:
    tiles[k + '_edge'] = sprites[k]
for k in tiles: sprites['t_' + k] = tiles[k]
for k in TILES: del sprites[k]

# pack a simple shelf atlas
order = sorted(sprites, key=lambda k: -sprites[k].height)
W = 1024; x = y = 0; sh = 0; meta = {}
for k in order:
    im = sprites[k]
    if x + im.width > W: x = 0; y += sh + 1; sh = 0
    meta[k] = [x, y, im.width, im.height]; x += im.width + 1; sh = max(sh, im.height)
atlas = Image.new('RGBA', (W, y + sh + 1))
for k, (x, y, w, h) in meta.items(): atlas.paste(sprites[k], (x, y))
atlas.save(OUT + '/atlas.png')
# anchor = the point that sits on the ground: front corner for buildings, bottom centre otherwise
for k, (x, y, w, h) in list(meta.items()):
    a = np.array(sprites[k])[:, :, 3] > 0
    if k.startswith('t_'):
        meta[k] += [16, 0]
        if k.endswith('_edge'):  # side colours for drawing the island's base as one band
            e = np.array(sprites[k]); hx = lambda c: '#%02x%02x%02x' % tuple(int(v) for v in c[:3])
            meta[k] += [hx(e[18, 6]), hx(e[18, 26]), hx(e[22, 6]), hx(e[22, 26])]
        continue
    ys = np.nonzero(a.any(1))[0]; yb = ys.max(); xs = np.nonzero(a[yb])[0]
    meta[k] += [int(round((xs.min() + xs.max()) / 2)), int(yb)]
    if k in FIX:  # footprint in tiles from the wall corners
        cols = [np.nonzero(a[:, c])[0].max() if a[:, c].any() else -1 for c in range(w)]
        fx = meta[k][4]; fy = yb
        lx = min(c for c in range(w) if cols[c] >= fy - (fx - c) / 2 - 1.5)
        rx = max(c for c in range(w) if cols[c] >= fy - (c - fx) / 2 - 1.5)
        meta[k] += [round((fx - lx) / 16, 2), round((rx - fx) / 16, 2)]
open(OUT + '/atlas.js', 'w').write('// Generated: sprite rectangles in atlas.png (native pixels)\nwindow.ATLAS = ' + json.dumps(meta) + ';\n')
print(atlas.size, len(meta))
