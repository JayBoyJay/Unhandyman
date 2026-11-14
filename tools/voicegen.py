#!/usr/bin/env python3
"""Make voice files for the game's spoken lines with VOICEVOX.

Run this on the Mac, from the repo folder, while the VOICEVOX engine is running:

    python3 tools/voicegen.py                      # every fixed line in the game
    python3 tools/voicegen.py --lines missing.json # plus lines the game saved as "no voice file yet"
    python3 tools/voicegen.py --speakers           # list the engine's voices and their ids

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


def load_voices():
    with open(VOICES_FILE, encoding='utf-8') as f:
        v = json.load(f)
    return v['voices'], v.get('byName', {})


def speaker_for(who, voices, by_name):
    role = who if who in voices else by_name.get(who, 'default')
    return int(voices.get(role, voices['default']))


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
    return lines


def post(url, data=None, json_body=None):
    headers = {}
    if json_body is not None:
        data = json.dumps(json_body).encode('utf-8')
        headers['Content-Type'] = 'application/json'
    req = urllib.request.Request(url, data=data if data is not None else b'', headers=headers, method='POST')
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()


def synth(engine, speaker, text):
    q = json.loads(post(engine + '/audio_query?' + urllib.parse.urlencode({'speaker': speaker, 'text': text})))
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
    ap.add_argument('--redo', action='store_true', help='make every file again')
    ap.add_argument('--prune', action='store_true', help='delete files no line uses any more')
    a = ap.parse_args()
    engine = a.engine.rstrip('/')

    try:
        with urllib.request.urlopen(engine + '/version', timeout=5) as r:
            ver = r.read().decode().strip('"')
    except Exception as e:
        sys.exit("Can't reach the VOICEVOX engine at %s (%s). Start it first, see the README." % (engine, e))

    if a.speakers:
        with urllib.request.urlopen(engine + '/speakers') as r:
            for s in json.load(r):
                for st in s['styles']:
                    print('%4d  %s（%s）' % (st['id'], s['name'], st['name']))
        return

    voices, by_name = load_voices()
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
        sp = speaker_for(who, voices, by_name)
        key = fnv1a('%d|%s' % (sp, text))
        if key in seen:
            continue
        seen.add(key)
        if not a.redo and key in old and os.path.exists(os.path.join(OUT, old[key])):
            files[key] = old[key]
            kept += 1
            continue
        try:
            files[key] = encode(synth(engine, sp, text), key)
            made += 1
            print('  made  %s  [%d] %s' % (files[key], sp, text))
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
            files.setdefault(k, v)

    # credit line for every voice used (VOICEVOX's terms ask for "VOICEVOX:<name>")
    names = {}
    try:
        with urllib.request.urlopen(engine + '/speakers') as r:
            for s in json.load(r):
                for st in s['styles']:
                    names[st['id']] = s['name']
    except Exception:
        pass
    credits = sorted({'VOICEVOX:' + names[int(v)] for v in voices.values() if int(v) in names})

    # the game reads which voice each role uses from here, so lookups always match these files
    with open(idx_path, 'w', encoding='utf-8') as f:
        json.dump({'engine': 'VOICEVOX ' + ver, 'credits': credits, 'voices': voices, 'byName': by_name, 'files': files}, f, ensure_ascii=False, indent=1, sort_keys=True)
    print('\n%d new, %d kept, %d failed. %d files listed in assets/voice/index.json' % (made, kept, failed, len(files)))
    print('Next: git add assets/voice && git commit -m "Voice files" && git push')


if __name__ == '__main__':
    main()
