# Un-Handy Man

AI-assisted Japanese learning game. You play an armless handyman in the cosy town of 手ぶら町, and your voice is the controller: talk to your dogs and the townsfolk in Japanese.

**Play it:** open the GitHub Pages site on a TV or computer, then scan the QR code with your phone to join as the controller.

What's playable so far:

- **Chapter 0:** the backyard, the landlord, the first zombie night and digging under the fence.
- **The daily job board:** 5 jobs a day, up to 3 taken at once.
  - Home jobs: Fetch it, Vegetable harvest, Laundry rescue.
  - Back-lane jobs: Post round, Honesty stall, Bus times.
- **Autosave**, plus a downloadable save file.
- **All eleven town maps**, walkable, with every NPC in place.

## Files

| File | What it does |
| --- | --- |
| `index.html` | The TV screen. Whoever opens it is the host. |
| `phone.html` | The phone controller: joystick, hold-to-talk, replay. |
| `js/game.js` | Game logic and pixel-art drawing. |
| `js/words.js` | Chapter 0 word list and the command parser. |
| `js/net.js` | Phone link (PeerJS). Swap in your own connection code here if you prefer. |
| `js/speech.js` | Speech recognition: phone built-in or offline Vosk. |
| `js/ai.js` | Optional AI for free chat (Ollama default; Claude, OpenAI, Gemini). |
| `js/jobs.js` | Job templates and the daily job board. |
| `js/save.js` | Autosave (IndexedDB), save download and load, word and skill trackers. |
| `js/maps.js` | The town square to the mountain forest, and the routes between them. |
| `js/rooms.js` | Inside rooms: your room, Hana's house, the greengrocer, the café and the police box. |
| `assets/` | `atlas.png` sprite sheet; `source/` holds every sprite and reference map at native size. |
| `tools/build_atlas.py` | Rebuilds the atlas from `assets/source`. |
| `design/` | The town-maps and phone-screen design canvas files. |

## Playing

1. Open `index.html` on the TV or computer.
2. Scan the QR code with your phone, or open `phone.html` and type the 4-letter code.
3. Hold 話す and speak. Let go to send.

Things to say in Chapter 0:

- Greeting: おはよう / おはようございます
- Fetch: いぬ、バケツを持ってきて · かぎ · ボール (try かき to see the dog get it wrong)
- Dog: おいで · おすわり · まって
- Zombies: 赤い帽子の！ · めがねの！ · 黄色い傘の！ · 大きいの！
- Help: もう一回 · ゆっくり · わからない
- Last step: 掘って

No phone handy? Use the "Test" box on the TV screen and type what you'd say.
Shortcuts in the browser console: `__game.skip('night')`, `__game.skip('morning')`.

## Testing locally

- The TV page works from a local server: run `python3 -m http.server` in this folder and open `http://localhost:8000`.
- Phones only allow the microphone on HTTPS, so voice from the phone needs the GitHub Pages copy (or another HTTPS address). The typed box works anywhere.
- The QR code and phone link load from CDNs, so you need an internet connection.

## Publishing on GitHub Pages

Push this folder to a repo and turn on Pages (Settings › Pages › deploy from branch). No build step.

## Voice recognition: phone vs Vosk

Switch on the phone with the "Voice" menu. Test both and keep the more accurate one.

- **Phone speech:** built in, nothing to install. Works in Chrome on Android and Safari on iPhone.
- **Vosk (offline):** download the small Japanese model `vosk-model-small-ja-0.22.zip` from the Vosk models page (alphacephei.com/vosk/models), unzip it, then re-pack the folder as `vosk-model-small-ja.tar.gz` and put it in a `models/` folder here. It's about 50 MB, so the first load on a phone takes a while. This path is untested and experimental.

## AI conversation (optional)

Off by default; the game is fully playable without it. With it on, anything you say that isn't a command becomes a chat with the landlord.

Click **AI** on the TV screen.

- **Ollama (default):** install Ollama on the computer that opens the TV page and pull a model with good Japanese. Ollama has to allow the game's web address, so start it with `OLLAMA_ORIGINS` set, for example `OLLAMA_ORIGINS=https://jayboyjay.github.io,http://localhost:8000`. Then click "Find Ollama models".
- **Claude, OpenAI or Gemini:** paste your own API key. It stays in that browser only and is never part of the repo.

## Voices (VOICEVOX)

Lines are spoken with, in order: a ready-made voice file in `assets/voice/`, the VOICEVOX engine running live on your Mac, or the browser's own voice.

**1. Run the VOICEVOX engine on the Mac.** Install the VOICEVOX app from voicevox.hiroshiba.jp (it includes the engine), or download just the engine for macOS from github.com/VOICEVOX/voicevox_engine/releases. With the app open, the engine listens on `http://localhost:50021`.

**2. Make voice files for the game's fixed lines** (in the repo folder on the Mac):
```
python3 tools/voicegen.py --speakers   # list voices and their ids
python3 tools/voicegen.py              # make the files (m4a via afconvert)
git add assets/voice && git commit -m "Voice files" && git push
```
Casting is in `tools/voices.json`: every character has a gender, a ranked list of VOICEVOX voices and styles to try (e.g. Hana: もち子さん（のんびり）, the ferryman: 青山龍星（不機嫌）), and acting settings: `pitch` (-0.15 to 0.15), `speed` and `intonation` (1 = normal). If a voice isn't installed, the character gets another of the same gender, preferring one nobody else uses. Check the casting with `python3 tools/voicegen.py --cast`. Re-run after changing it or adding lines; unchanged lines keep their files, changed characters get new ones (`--prune` deletes the old).

**3. Lines that change** (job requests with numbers, AI replies) can't be made ahead of time. Either:
- play the game for a while, then 設定 → Voices → **Save missing lines**, and run `python3 tools/voicegen.py --lines missing-lines.json`, or
- let the TV ask VOICEVOX live: give the engine an https address with Caddy (add this to the Caddyfile on the Mac, then `caddy reload`), open that address once on the TV to accept the certificate, and put it in 設定 → Voices.
```
https://192.168.5.158:50443 {
  tls internal
  header Access-Control-Allow-Origin "*"
  @preflight method OPTIONS
  respond @preflight 204
  reverse_proxy localhost:50021 {
    header_up Host localhost:50021
    header_up -Origin
    header_up Content-Type application/json
  }
}
```

**Credit:** VOICEVOX voices must be credited as `VOICEVOX:<character name>` wherever the game is shared, and each character has its own terms of use (see the VOICEVOX site).

## Characters and friendships (new)

`js/characters.js` holds every character's daily chats, parting line, three-star gift, and for the five core characters (Hana, Gen, Mika, Tanaka, Kon) their wish, pun scrap and dog trick. It's plain JSON after `window.CHARACTERS =`, so tools/voicegen.py voices it too.

- **Personalities:** each character has a `personality` and `quirk`, a few lines for morning / day / evening (`idle`) that they say in a speech bubble as you walk past, reactions when the dog comes close (`dog`), a few goodbyes (`again`) and a line for each friendship star (`stars`). Walk-by lines wait 25-40 s per person, only one person talks at a time, and they stay quiet during jobs.
- **Daily chat:** say こんにちは near someone. They say one thing and wait for your answer (はい / いいえ / a number / …); each turn's `want` lists what they react to, `any` catches everything else. Commands for the dog still go to the dog mid-chat. One chat per person per day: +3 friendship. Jobs add 2 per job star.
- **Stars** at 5 / 15 / 30 points pay ¥100 / ¥200 / ¥300 and 1 / 2 / 3 treats. Three stars also gives that person's furniture (it goes to おうち on the phone).
- **Wishes:** at three stars a core character asks for something. Five townsfolk include it with their own three-star gift (ネムさん → Hana's futon, 金子さん → Gen's bell, 鉄さん → Mika's curry pot, ユリママ → Tanaka's phone, 熊田さん → Kon's fox). Say hello to the core character while you have it to hand it over: you get a pun scrap (日記 → かけら) and a trick. Saying the pun to the dog makes it do the trick.

## Main story (new)

`js/quests.js` is the story: six chapters of small quests, one after another (plain JSON after `window.QUESTS =`, voiced by tools/voicegen.py). The current step shows on the TV under the clock and as a checklist at the top of the phone's 依頼 app.

| Chapter | Area | Quests | New dog word | Boss (skill) | Opens |
|---|---|---|---|---|---|
| 0 Arrival | Home | Greet Hana, first jobs and zombie night, dig under the fence | 掘って | (the first night) | Back lane, town square |
| 1 Settling in | Town square | Meet the mayor, fix the fountain (screws from Kaneko), be useful, can the dog swim? | 泳いで | 源さん: answer exactly (yes/no, a number, where) | Riverside walk |
| 2 Making friends | Café street | Meet Yamada, make friends, jump and climb with Yui, ask Tetsu about Mika | 跳んで, 登って | ミカさん: ask her questions | Railway crossing |
| 3 Mystery begins | Police box | Tanaka's little-hands report, witnesses (Nemu, Yuri), sneak | こっそり | 田中さん: your alibi in the past tense | Bamboo path |
| 4 Part of the town | Shrine | Help the takoyaki auntie, the fox at dusk, vanish | 消えて | コン: a polite, sincere request | Terrace road |
| 5 Local | Mountain forest | Kumada and Ken point to the old hut | | (the finale, still to build) | |

Step types: `flag`, `go` (reach a map), `talk` (say hello to them: a short scene), `jobs`, `friends`, `say` (a new word for the dog, in the right area), `boss`. Bosses use a trust meter (shown at the top): exact answers +30, other replies +10, not understood −15 (もう一回 is free). Finish with enough trust and the required skill used, or they say また あした and you try again the next day.

## Camera (new)

Open カメラ on the phone and a viewfinder cone appears in front of the hero on the TV. Turn with ↺ ↻ (or walk on the controller), then press the shutter. Everything inside the cone (up to six things, people and animals, nearest first, plus the ground) gets a numbered tag in the photo; the phone lists each one with its Japanese, reading, English, a picture and a play button, and NEW on first sight. Words go into 日記 → 言葉 with their pictures; the last 24 photos are kept in the album. Names live in the `PHOTO` table in `js/words.js` (sprite → written, reading, English, category).

## Tablet panel on the TV (new)

When the phone is on any app except the controller and the camera, the TV shows a tablet-sized, more detailed version of it, and the game pauses (clock, jobs and chatter stop). It follows the phone: tap a word, person, map area, job, scrap or piece of furniture there and its full page opens on the TV.

- **Overview** (phone home): day and time, current quest, stats (words, strong words, jobs, stars, friends, yen, quests, photos, scraps, furniture), new words per day, recent lines.
- **Messages:** every conversation; a thread shows each line with the words it uses.
- **Map:** a picture of the whole area, who's there with their stars, rooms you can enter, and where each road goes (or what unlocks it).
- **Diary:** a word page (big reading, heard/said, first met, last used, strength, the kanji it's written with, example sentences from the town), strongest and fading words; scraps in full.
- **Story and jobs:** the whole quest log by chapter (future quests hidden), the current quest's steps; job details.
- **People:** everyone's card; a person's page with personality, quirk, friendship progress, their gift and wish.
- **Home:** furniture and where it came from; dog tricks with the pun explained.

The panel sits on the right of the TV, with the game still visible on the left.

## Known gaps

- Voices use the browser's Japanese text-to-speech; VOICEVOX recordings come later.
- Art is placeholder pixel art drawn in code.
- Vosk path not yet tested on a real phone.

## Viewport and sprites (new)

- The TV now shows a close camera (about 10 tiles across) that follows the hero around a 22×17 tile isometric backyard, instead of the whole map at once.
- Sprites come from `assets/atlas.png` (generated from the mock sprite canvas at native size). Ground tiles use only their top face, so they butt together with no gaps; the island's edge is drawn as one band.
- The workshop, landlord's house and tool shed use rebuilt roofs (proper gable: ridge in the middle, back slope and gable end lined up).
- Walk with the phone stick, the arrow keys or WASD.
- Zombie hat colours are recoloured in the browser, which needs the page served over http (`python3 -m http.server`), not opened as a file.

## Jobs board and saving (new)

- **Job board:** after greeting the landlord, the board shows 5 jobs for the day. Take up to 3 at once on the phone's しごと tab, or on the TV with the しごと button (J, then 1–5 on a keyboard). The board is new every day, so some jobs get missed.
- **Chapter 0 jobs:**
  - Fetch it: 「かぎ、持ってきて」
  - Vegetable harvest: the dog digs one at a time and counts out loud; say 「まって」 on the right number, or say it first with 「トマトを みっつ 掘って」.
  - Laundry rescue: washing blows towards the street; name each piece, like 「あかい シャツ、持ってきて」.
- **Stars and rewards:** 1–3 stars per job. Rewards are yen, dog treats and friendship with ハナさん. You get 3 free treats each morning.
- **Day 1:** finishing 3 jobs brings the first zombie night. On later days, 3 jobs ends the day; say 「おやすみ」 to sleep.
- **Saving:** autosaves in this browser (IndexedDB plus a localStorage copy). 設定 → Download save gives a JSON file, and Load save restores it in any browser.
- **Word and skill tracking:** words the NPCs say and words you say are logged with a strength score. Jobs pick the words you have used least recently.
- **Testing from the browser console:** `__game.skip('night')`, `__game.skip('morning')`, `__game.nextDay()`, `__game.Save.data`.

## Back lane (new)

- After Chapter 0, walk west off the end of the street to reach 裏道, the back lane. Its west end (the town square) is locked until the next build.
- From day 2 on, the board mixes home jobs with back-lane jobs. A back-lane job waits until you walk there.
- **Post round:** ハナさん phones and asks you to deliver letters. Read each letter out loud by name, house number or both (「木村さん、6ばん」), and the dog delivers it. Delivering to the wrong house gets a 「ちがうよ！」.
- **Honesty stall:** say the price on the sign (「150えん」, 「ひゃくごじゅうえん」). The dog pays and brings the vegetable back. A crow tells you if you paid too little or too much.
- **Bus times:** 山田さん asks when the next bus leaves, then the one after. Answer from the timetable, for example 「9時20分」, 「くじにじゅっぷん」 or 「くじはん」.
- Sprites come from `assets/source`. Rebuild the atlas with `python3 tools/build_atlas.py`.

## All areas (new)

- Eleven walkable maps, joined end to end. Walk off the edge of the path to go to the next one:
  - Home → Back lane → Town square → Riverside walk → Café street → Railway crossing → Police box and old school → Bamboo path → Shrine and festival grounds (exit north) → Terrace road → Mountain forest
- Each later area opens when the chapter before it is finished. For testing, tick 設定 → "Unlock all areas".
- Every named NPC stands in their area. Say 「こんにちは」 next to someone and they answer with one line.
- Map data lives in `js/maps.js`: ground is drawn from rectangles, and buildings, props, NPCs and exits are listed by tile position.
- Rooms live in `js/rooms.js`. To give a building a room, add `room: '<id>', door: <0–1>` to it (door = how far along the front-left wall, from the front corner). Floors are drawn in code: `o` boards, `m` tatami, `q` tiles, `c` concrete.
- The clock runs from 7:00 to 18:00 in the daytime (about 11 minutes at normal speed; change it in 設定). At 16:00 Hana warns you, at 18:00 the day ends and unfinished jobs are missed.
- To check a whole map at once, run `__game.overview('square')` in the browser console. It returns an image of the full map.
