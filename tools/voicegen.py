#!/usr/bin/env python3
"""Make voice files for the game's spoken lines with VOICEVOX.

Run this on the Mac, from the repo folder, while the VOICEVOX engine is running:

    python3 tools/voicegen.py                      # every fixed line in the game
    python3 tools/voicegen.py --lines missing.json # plus lines the game saved as "no voice file yet"
    python3 tools/voicegen.py --speakers           # list the engine's voices and their ids
    python3 tools/voicegen.py --cast               # show which voice each character gets, then stop

Casting is in tools/voices.json: each character has a gender, a ranked list of VOICEVOX
voices/styles to try, and acting settings (pitch, speed, intonation). Characters whose voices
aren't installed get another voice of the same gender, preferring ones nobody else uses.

Files go to assets/voice/ as .m4a (via macOS afconvert), or .mp3 with ffmpeg, or .wav.
assets/voice/index.json lists them; the game finds a line's file by hashing "speaker id|text"
with FNV-1a, the same way js/voice.js does. Existing files are kept, so re-running is quick.
Only the Python standard library is needed.
"""
import argparse, json, os, re, shutil, subprocess, sys, tempfile, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'assets', 'voice')
VOICES_FILE = os.path.join(ROOT, 'tools', 'voices.json')


def fnv1a(s):
    h = 0x811c9dc5
    for b in s.encode('utf-8'):
        h ^= b
        h = (h * 0x01000193) & 0xffffffff
    return '%08x' % h


def load_casting():
    with open(VOICES_FILE, encoding='utf-8') as f:
        v = json.load(f)
    return v['cast'], v.get('byName', {}), v.get('pools', {})


def get_speakers(engine):
    """[(character name, style name, id)] for every voice the engine has."""
    with urllib.request.urlopen(engine + '/speakers', timeout=30) as r:
        return [(s['name'], st['name'], st['id']) for s in json.load(r) for st in s['styles']]


def cast_voices(cast, pools, speakers):
    """Pick a voice for every character. Returns role -> settings used by the game and this tool."""
    by_pair = {(n, st): i for n, st, i in speakers}
    first_style = {}
    for n, st, i in speakers:
        first_style.setdefault(n, (st, i))
    used = {}
    roles = {}
    # characters whose preferred voices are installed go first, so fallbacks avoid them
    order = sorted(cast, key=lambda r: 0 if any(tuple(t) in by_pair for t in cast[r].get('try', [])) else 1)
    for role in order:
        c = cast[role]
        pick = next(((t[0], t[1], by_pair[tuple(t)]) for t in c.get('try', []) if tuple(t) in by_pair), None)
        note = ''
        if not pick:   # same character in another style?
            for t in c.get('try', []):
                if t[0] in first_style:
                    st, i = first_style[t[0]]
                    pick, note = (t[0], st, i), 'other style'
                    break
        if not pick:   # anyone of the right gender, least used first
            pool = [n for n in pools.get(c.get('gender', 'f'), []) if n in first_style] or list(first_style)
            pool.sort(key=lambda n: used.get(n, 0))
            n = pool[0]
            pick, note = (n, first_style[n][0], first_style[n][1]), 'fallback'
        used[pick[0]] = used.get(pick[0], 0) + 1
        p = {'pitchScale': float(c.get('pitch', 0)), 'speedScale': float(c.get('speed', 1)), 'intonationScale': float(c.get('intonation', 1))}
        if note == 'fallback' and c.get('age') == 'old' and 'pitch' not in c:
            p['pitchScale'] = -0.04   # a borrowed voice sounds a bit older
        key = '%d:%+.2f:%.2f:%.2f' % (pick[2], p['pitchScale'], p['speedScale'], p['intonationScale'])
        roles[role] = {'id': pick[2], 'key': key, 'params': p, 'voice': '%s（%s）' % (pick[0], pick[1]), 'character': pick[0], 'note': note}
    return roles


def role_for(who, roles, by_name):
    return who if who in roles else by_name.get(who, 'default') if by_name.get(who, 'default') in roles else 'default'


def collect_lines():
    """Fixed lines in the code: say('who', '...') calls and each NPC's hello line."""
    lines = []
    src = {}
    for name in ('game.js', 'maps.js', 'rooms.js', 'jobs.js'):
        p = os.path.join(ROOT, 'js', name)
        if os.path.exists(p):
            with open(p, encoding='utf-8') as f:
                src[name] = f.read()
    for text in src.values():
        for who, line in re.findall(r"say\('(\w+)',\s*'([^'\\]*)'", text):
            lines.append((who, line))
        # N('id', 'name', 'sprite', x, y, 'hello')
        for name, hello in re.findall(r"N\('[^']*',\s*'([^']*)',\s*'[^']*',\s*[\d.]+,\s*[\d.]+,\s*'([^'\\]*)'\)", text):
            lines.append((name, hello))
    # every character's chats, gift and wish lines (js/characters.js is JSON after the '=')
    chars = {}
    p = os.path.join(ROOT, 'js', 'characters.js')
    if os.path.exists(p):
        with open(p, encoding='utf-8') as f:
            src = f.read()
        chars = json.loads(src[src.rindex('window.CHARACTERS =') + len('window.CHARACTERS ='):src.rindex(';')])
        for cid, c in chars.items():
            who = 'landlord' if cid == 'hana' else c['name']
            again = c.get('again', '')
            said = (again if isinstance(again, list) else [again]) + [c['gift']['line'], c['gift'].get('extra', {}).get('line', '')]
            for part in c.get('idle', {}).values():
                said += part
            said += c.get('dog', []) + list(c.get('stars', {}).values())
            for chat in c['chats']:
                for turn in chat:
                    said.append(turn['say'])
                    said.extend(turn.get('want', {}).values())
            if 'wish' in c:
                said += [c['wish']['ask'], c['wish']['deliver'], c['wish']['scrap']['jp']]
            lines += [(who, s) for s in said if s]
    # the main story's scenes and bosses (js/quests.js)
    p = os.path.join(ROOT, 'js', 'quests.js')
    if os.path.exists(p):
        with open(p, encoding='utf-8') as f:
            src = f.read()
        quests = json.loads(src[src.rindex('window.QUESTS =') + len('window.QUESTS ='):src.rindex(';')])
        for qu in quests:
            for st in qu['steps']:
                npc = st.get('npc')
                if not npc:
                    continue
                who = 'landlord' if npc == 'hana' else chars.get(npc, {}).get('name', npc)
                said = [st.get('win', ''), st.get('lose', '')]
                for turn in st.get('turns', []):
                    said.append(turn['say'])
                    said.extend(turn.get('want', {}).values())
                lines += [(who, s) for s in said if s]
    return lines


def post(url, data=None, json_body=None):
    headers = {}
    if json_body is not None:
        data = json.dumps(json_body).encode('utf-8')
        headers['Content-Type'] = 'application/json'
    req = urllib.request.Request(url, data=data if data is not None else b'', headers=headers, method='POST')
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()


def synth(engine, speaker, text, params=None):
    q = json.loads(post(engine + '/audio_query?' + urllib.parse.urlencode({'speaker': speaker, 'text': text})))
    q.update(params or {})
    q['outputSamplingRate'] = 24000
    q['prePhonemeLength'] = 0.05
    q['postPhonemeLength'] = 0.15
    return post(engine + '/synthesis?' + urllib.parse.urlencode({'speaker': speaker}), json_body=q)


def encode(wav_bytes, base):
    """Write the smallest format this machine can make; returns the file name."""
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as t:
        t.write(wav_bytes)
        tmp = t.name
    try:
        if shutil.which('afconvert'):
            out = base + '.m4a'
            subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '48000', tmp, os.path.join(OUT, out)], check=True, capture_output=True)
            return out
        if shutil.which('ffmpeg'):
            out = base + '.mp3'
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp, '-b:a', '64k', os.path.join(OUT, out)], check=True)
            return out
        out = base + '.wav'
        shutil.copy(tmp, os.path.join(OUT, out))
        return out
    finally:
        os.unlink(tmp)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--engine', default='http://localhost:50021', help='VOICEVOX engine address')
    ap.add_argument('--lines', action='append', default=[], help='extra lines: JSON exported from the game (設定 → Voice → Save missing lines)')
    ap.add_argument('--speakers', action='store_true', help='list the voices the engine has, then stop')
    ap.add_argument('--cast', action='store_true', help="show which voice each character gets, then stop")
    ap.add_argument('--redo', action='store_true', help='make every file again')
    ap.add_argument('--prune', action='store_true', help='delete files no line uses any more')
    a = ap.parse_args()
    engine = a.engine.rstrip('/')

    try:
        with urllib.request.urlopen(engine + '/version', timeout=5) as r:
            ver = r.read().decode().strip('"')
    except Exception as e:
        sys.exit("Can't reach the VOICEVOX engine at %s (%s). Start it first, see the README." % (engine, e))

    speakers = get_speakers(engine)
    if a.speakers:
        for n, st, i in speakers:
            print('%4d  %s（%s）' % (i, n, st))
        return

    cast, by_name, pools = load_casting()
    roles = cast_voices(cast, pools, speakers)
    if a.cast:
        for role, r in roles.items():
            print('  %-16s %-26s %s%s' % (role, r['voice'], r['key'], '   (' + r['note'] + ')' if r['note'] else ''))
        return
    lines = collect_lines()
    for path in a.lines:
        with open(path, encoding='utf-8') as f:
            for m in json.load(f):
                lines.append((m['who'], m['text']))

    os.makedirs(OUT, exist_ok=True)
    idx_path = os.path.join(OUT, 'index.json')
    old = {}
    if os.path.exists(idx_path):
        with open(idx_path, encoding='utf-8') as f:
            old = json.load(f).get('files', {})

    files, made, kept, failed, seen = {}, 0, 0, 0, set()
    for who, text in lines:
        text = text.strip()
        if not text:
            continue
        role = roles[role_for(who, roles, by_name)]
        sp = role['id']
        key = fnv1a('%s|%s' % (role['key'], text))
        if key in seen:
            continue
        seen.add(key)
        if not a.redo and key in old and os.path.exists(os.path.join(OUT, old[key])):
            files[key] = old[key]
            kept += 1
            continue
        try:
            files[key] = encode(synth(engine, sp, text, role['params']), key)
            made += 1
            print('  made  %s  %-14s %s' % (files[key], role['character'], text))
        except Exception as e:
            failed += 1
            print('  FAILED [%d] %s: %s' % (sp, text, e))

    if a.prune:
        used = set(files.values()) | {'index.json'}
        for f in os.listdir(OUT):
            if f not in used:
                os.unlink(os.path.join(OUT, f))
                print('  removed', f)
    else:
        for k, v in old.items():   # keep files from earlier runs (e.g. lines added by --lines)
            if os.path.exists(os.path.join(OUT, v)):
                files.setdefault(k, v)

    # credit line for every voice used (VOICEVOX's terms ask for "VOICEVOX:<name>")
    credits = sorted({'VOICEVOX:' + r['character'] for r in roles.values()})
    game_roles = {k: {'id': r['id'], 'key': r['key'], 'params': r['params'], 'voice': r['voice']} for k, r in roles.items()}

    # the game reads each character's voice from here, so its lookups always match these files
    with open(idx_path, 'w', encoding='utf-8') as f:
        json.dump({'engine': 'VOICEVOX ' + ver, 'credits': credits, 'roles': game_roles, 'byName': by_name, 'files': files}, f, ensure_ascii=False, indent=1, sort_keys=True)
    print('\n%d new, %d kept, %d failed. %d files listed in assets/voice/index.json' % (made, kept, failed, len(files)))
    print('Next: git add assets/voice && git commit -m "Voice files" && git push')


if __name__ == '__main__':
    main()
