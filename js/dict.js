// Words used in the game's lines, for tap-a-word in the phone's messages.
// One entry per line: kana | kanji (if it's usually written with kanji) | English | icon (optional emoji).
// Words also in the camera's PHOTO table get their sprite as the icon instead.
window.DICT_SRC = `
ね||(sentence ending: "isn't it?", "right?")
よ||(sentence ending: "you know", telling someone)
だ||is (plain)
です||is (polite)
だよ||it is, you know
だね||it is, isn't it
ですか||is it? (polite question)
ですよ||it is, you know (polite)
でしょ||right? isn't it?
でしょう||probably; right?
でした||was (polite)
でし||was (polite, cut short)
でございます||is (very polite)
ございます||(very polite "there is / is")
ございません||there isn't (very polite)
の||(possessive, "'s"; or softens a question)
か||(question marker)
な||(sentence ending, to yourself)
わ||(soft sentence ending)
さ||(casual sentence ending)
や||(Kansai casual "is")
て||(and, connecting)
と||and; with
も||also, too
は||(topic marker)
が||(subject marker)
を||(object marker)
に||to; at
で||at; with; by
へ||to, towards
から||from; because
まで||until
けど||but
って||(quoting: "they said")
いい||good
よい|良い|good
また||again
ふふ||(giggle) hehe
ふふふ||(giggle) hehehe
すき|好き|like, love|❤️
だいすき|大好き|really like, love|💕
こ|子|child
あ||ah, oh
え||eh? huh?
えっ||eh?!
そう||so, that way; really?
そうか||I see
そうだ||that's right
ありがとう||thank you|🙏
ありがと||thanks
ありが||thank... (cut short)
き|気|spirit, feeling (き を つけて = be careful)
きを つけて|気を付けて|take care, be careful
そ||(start of そう)
もう||already; more
ほら||look! here!
あなた||you
あら||oh my
かわいい|可愛い|cute
つけて|付けて|attach, put on (つけて = please …)
ちいさい|小さい|small
あげる||give
ください|下さい|please (give me)
すみません||excuse me; sorry
ほっほっほ||(old man's laugh) ho ho ho
おはよう||good morning|🌅
みて|見て|look!|👀
この||this
その||that
あの||that (over there); um
きょう|今日|today
どうぞ||here you are; go ahead
うち|家|home, my place|🏠
うちの|家の|our, my (family's)
こんど|今度|next time
じゃ||well then
じゃあ||well then
いる||be, stay (people/animals)
まいど|毎度|thanks for your custom (shop greeting)
しんぶん|新聞|newspaper|📰
あした|明日|tomorrow
ふん||hmph
はい||yes
まち|町|town|🏘️
あんた||you (casual)
かず|数|number, amount
ある||there is, have
なに|何|what
なん|何|what
いらっしゃい||welcome!
いらっしゃいませ||welcome (to the shop)
らっしゃい||welcome! (shop shout)
めっちゃ||super, really (casual)
きて|来て|come!
します||do (polite)
する||do
して||do (and…); please do
した||did
しない||don't
メモ||memo, note|📝
ひ|日|day; sun|☀️
たのしい|楽しい|fun
たのしそう|楽しそう|looks fun
い||(cut-off sound)
パン||bread|🍞
メロンパン||melon bread|🍈
こんにちは||hello|👋
こんにち||hello (cut short)
こんばんは||good evening|🌙
わんちゃん||doggy|🐶
わんこ||doggy|🐶
むかし|昔|long ago
えらい|偉い|good job; great
そろそろ||soon, about time
よる|夜|night|🌙
よかった|良かった|that's good; I'm glad
よく||well; often
ふるい|古い|old
ねえ||hey; right?
まじ||seriously? for real
いくつ||how many
へえ||oh really?
しごと|仕事|job, work|🧰
きた|来た|came
きいた|聞いた|heard
ん||(hum) mm
トマト||tomato|🍅
ねむい|眠い|sleepy|😪
ほう||oh? (interested)
てつだう|手伝う|help
てつだって|手伝って|help (me)
げんき|元気|well, lively
なる||become
なった||became
わたし|私|I, me
わたくし|私|I (very polite)
ぼく|僕|I (boy's word)
おれ|俺|I (rough)
わし||I (old man)
やる||do (casual)
やって||do (and…)
あさ|朝|morning|🌅
あさごはん|朝ご飯|breakfast|🍳
おしえて|教えて|tell me, teach me
おしえる|教える|teach, tell
おしえません|教えません|won't tell (polite)
ためして|試して|try it
じかん|時間|time|⏰
いちばん|一番|number one, the most
ないしょ|内緒|secret|🤫
ひみつ|秘密|secret|🤫
なまえ|名前|name
おなまえ|お名前|your name (polite)
まあ||well; oh my
ともだち|友達|friend|🧑‍🤝‍🧑
しんゆう|親友|best friend
マブダチ||best buddy (slang)
ダチ||buddy (slang)
なかま|仲間|friend, teammate
ゆっくり||slowly
まいにち|毎日|every day
すこし|少し|a little
スケボー||skateboard|🛹
スケボ||skateboard|🛹
さいこう|最高|the best
けっこう|結構|quite; no thanks
じゃん||isn't it! (casual)
いっしょ|一緒|together
いっしょに|一緒に|together
ぐう||(snore) zzz|💤
ない||there isn't; not
よし||alright!
えへ||(shy laugh) ehe
はなす|話す|talk
はなして|話して|talk; let go
はなせる|話せる|can talk
はなし|話|story, talk
ええ||yes; eh?
す||(end of です)
のう||(old man's "isn't it")
わんわん||woof woof|🐕
きいて|聞いて|listen; ask
おつかれさま|お疲れ様|good work today
よろしく||nice to meet you; please
ようこそ||welcome
なら||if
ひゃくえん|百円|100 yen|💴
ラーメン||ramen|🍜
うわ||whoa
めずらしい|珍しい|rare, unusual
やま|山|mountain|⛰️
山|やま|mountain|⛰️
やあ||hi there
どこ||where
ちゃん||(cute name ending)
のむ|飲む|drink|🥤
のんでる|飲んでる|drinking
みたい||seems like; want to see
てんき|天気|weather|🌤️
あげて||give (and…)
あげた||gave
あげたい||want to give
あげなきゃ||have to give
これ||this
それ||that
あれ||that (over there)
あれば||if there is
カウンター||counter
カウンタ||counter
たべる|食べる|eat|🍽️
たべて|食べて|eat (please)
たべた|食べた|ate
たべろ|食べろ|eat! (rough)
たべない|食べない|don't eat
たべなさい|食べなさい|eat up (parent's order)
たべてる|食べてる|eating
ざんねん|残念|too bad
しりたい|知りたい|want to know
いつ||when
いつでも||any time
なるほど||I see
でん||(part of a word)
しずか|静か|quiet
あるいて|歩いて|walk
あるいてた|歩いてた|was walking
おもしろい|面白い|interesting, funny
かた|方|person (polite); way
よろしい||all right (polite)
なんて||what a…; things like
いこう|行こう|let's go
ずつ||each
ことば|言葉|word, language
わかる|分かる|understand
わかった|分かった|got it
わかりました|分かりました|understood (polite)
わからない|分からない|don't understand
わからん|分からん|dunno (casual)
いま|今|now
ごらん||look (polite)
はやい|早い・速い|early; fast
はやく|早く|quickly, hurry
はやそう|速そう|looks fast
つよい|強い|strong|💪
こい|来い|come! (rough)
だいじ|大事|important
ねじ||screw|🔩
もってけ|持ってけ|take it! (casual)
じょうだん|冗談|joke
ふわふわ||fluffy
ほ||(start of a word)
やん||isn't it (Kansai)
いや||no; ugh
おい||hey!
きつい||tough, tight
ゆ|湯|hot water
みせて|見せて|show me
ふむ||hmm
ふむふむ||hmm hmm, I see
おやすみ||good night|😴
とん||(tap sound)
いった|行った|went
つぎ|次|next
ど||(start of a word)
やけた|焼けた|got baked|🔥
みっつ|三つ|three (things)
ひとつ|一つ|one (thing)
ちょっと||a little; hey
こわれて|壊れて|broken
こわれた|壊れた|broke
いて||be (and…)
おう||yeah! (rough)
やっほー||yoo-hoo!
うまい||tasty; skilful|😋
おきゃくさま|お客様|customer (polite)
おきゃくさん|お客さん|customer
きゃく|客|customer, guest
はやおき|早起き|early rising|🌅
くらく|暗く|dark (becoming)
あぶない|危ない|dangerous|⚠️
かぞく|家族|family|👨‍👩‍👧
おやつ||snack, treat|🍪
うれしい|嬉しい|happy|😊
ずっと||all along; forever
そっと||gently, quietly
きっと||surely
さいきん|最近|recently
ふかふか||soft and fluffy
あったら||if there is
なあ||(sigh) …huh
わあ||wow
ねむれる|眠れる|can sleep
ねむれない|眠れない|can't sleep
かわった|変わった|changed; unusual
でない|出ない|doesn't come out
おまえ|お前|you (rough)
おまえさん|お前さん|you (old-fashioned)
きみ|君|you
もったいない||what a waste
およげる|泳げる|can swim|🏊
およいで|泳いで|swim!|🏊
みろ|見ろ|look! (rough)
いか||squid; or less|🦑
いそがしい|忙しい|busy
ケーキ||cake|🍰
だめ||no good, not allowed|🙅
だめだ||it's no good
コーヒー||coffee|☕
コーヒ||coffee|☕
どう||how
どうだ||how's that?
カレー||curry|🍛
カレ||curry|🍛
みんな||everyone
みなさん|皆さん|everyone (polite)
おおきい|大きい|big
おおき|大き|big (cut short)
パトロール||patrol|🚓
ちゅう|中|in the middle of
できる||can do
はじめて|初めて|for the first time
はじめ|初め|beginning
はじめまして||nice to meet you|👋
こまったら|困ったら|if you're in trouble
おねがいします|お願いします|please|🙏
きのう|昨日|yesterday
たすかります|助かります|that helps a lot
たすかる|助かる|that helps
こん||(fox cry) kon|🦊
コン||(fox cry) kon|🦊
みえる|見える|can see
みえて|見えて|can see (and…)
ゆめ|夢|dream|💭
おります||am, be (humble)
がんばった|頑張った|did your best
がんばって|頑張って|do your best!
がんばります|頑張ります|I'll do my best
がんばりや|頑張り屋|hard worker
あそぼう|遊ぼう|let's play
ばいばーい||bye-bye!|👋
ばいばい||bye-bye|👋
ゆうがた|夕方|evening|🌇
のれる|乗れる|can ride
やつ||guy, thing
なでて|撫でて|pet (me/it)|🤚
やった||yay!; did it
こわい|怖い|scary|😱
ねる|寝る|sleep|🛏️
ねよう|寝よう|let's sleep
まえ|前|front; before
しろ|白|white
せいかく|性格|personality
やきたて|焼きたて|freshly baked|🥖
だいこん|大根|daikon radish|🥕
いっぽん|一本|one (long thing)
やすい|安い|cheap
のこり|残り|the rest
うれた|売れた|sold
おっ||oh!
にんじん|人参|carrot|🥕
やろう||let's do it
はは||haha
こえ|声|voice|🗣️
ごめん||sorry
ごめんね||sorry
きれい|綺麗|pretty; clean|✨
なんで||why
すてき|素敵|lovely
いっぱい||lots, full
なんでやねん||why on earth! (Kansai comedy)
ほんま||really (Kansai)
よう||well; often
きかせて|聞かせて|let me hear
パイプ||pipe
だいじょうぶ|大丈夫|OK, all right|👌
だいじょぶ|大丈夫|OK (casual)
みず|水|water|💧
すばらしい|素晴らしい|wonderful
おお||oh!
おまつり|お祭り|festival|🏮
あつい|暑い・熱い|hot|🔥
くれる||give (to me)
くれ||give me (rough)
くれます||gives me (polite)
しょうがない||it can't be helped
おる||be (old/western Japan)
んじゃ||then; it's that (old man)
ほれ||here! look!
キャンプ||camping|⛺
しよう||let's do
おにいちゃん|お兄ちゃん|big brother
しんじん|新人|newcomer
まず||first
しつもん|質問|question|❓
せや||that's right (Kansai)
きこえる|聞こえる|can hear|👂
ほか|他|other
ほかの|他の|other
おしまい||the end, finished
ちがう|違う|wrong; different
どれ||which one
なにいろ|何色|what colour|🎨
いろ|色|colour|🎨
四時|よじ|four o'clock|🕓
よじ|四時|four o'clock|🕓
いそいで|急いで|hurry!
カ||(katakana ka)
ぴったり||exactly right
おかえり||welcome home|🏠
くる|来る|come
こない|来ない|doesn't come
フェンス||fence
下|した|under, below
した|下|under; did
掘って|ほって|dig!|⛏️
すごい||amazing|🤩
広場|ひろば|town square
ひろば|広場|town square
行ける|いける|can go
いける||can go; it's good
ボード||board
見て|みて|look!|👀
どういたしまして||you're welcome
よんだ|呼んだ|called
ありました||there was (polite)
ありません||there isn't (polite)
ありませんでした||there wasn't (polite)
あります||there is (polite)
ちょうだい||give me, please
むり|無理|impossible, no way
ごはん|ご飯|rice; meal|🍚
つくえ|机|desk
おちゃ|お茶|tea|🍵
おなか||tummy
すいた|空いた|got hungry
じまん|自慢|pride, boast
さんぽ|散歩|walk|🦮
布団が吹っ飛んだ|ふとんが ふっとんだ|"The futon blew away!" (a pun)|🛏️
つけろ|付けろ|put it on!
かぜ|風|wind|🌬️
さかな|魚|fish|🐟
はねた|跳ねた|jumped, splashed
ゆうひ|夕日|sunset|🌇
あまり||not much; too
ちかづく|近づく|come close
わるくない|悪くない|not bad
わるく|悪く|bad(ly)
きらいじゃない|嫌いじゃない|don't dislike
のせて|乗せて|give (me) a ride
まだ||still, not yet
あと||after; more
さか|坂|slope, hill
さかみち|坂道|hillside road
やれ||do it!
イルカはいるか|イルカは いるか|"Is there a dolphin?" (a pun)|🐬
イルカ||dolphin|🐬
まってる|待ってる|waiting
まって|待って|wait!
キッチン||kitchen
モーニング||morning set (breakfast)
セット||set
におい|匂い|smell|👃
め|目|eye|👁️
さめる|覚める|wake up
あたらしい|新しい|new
みる|見る|look, see
みた|見た|saw
みない|見ない|don't look
みました|見ました|saw (polite)
みませんでした|見ませんでした|didn't see (polite)
みたら|見たら|if you look
しめる|閉める|close
しめろ|閉めろ|close it!
ミルク||milk|🥛
ホットミルク||hot milk|🥛
おみせ|お店|shop|🏪
みせ|店|shop|🏪
みせじまい|店じまい|closing the shop
なか|中|inside
じょうれんさん|常連さん|regular customer
のみもの|飲み物|drink|🥤
おぼえた|覚えた|remembered, learned
メニュー||menu|📋
メニュ||menu|📋
おいしい|美味しい|delicious|😋
こうちゃ|紅茶|black tea|☕
じつは|実は|actually
ほしい|欲しい|want
つくりたい|作りたい|want to make
つくる|作る|make
このカレーは辛え|このカレーは からえ|"This curry's hot!" (pun on カレー/からえ)|🍛
しつれい|失礼|excuse me; rude
あんぜん|安全|safety|🦺
そと|外|outside
ほうこくしょ|報告書|report|📄
かかない|書かない|don't write
かっこいい||cool|😎
とうろく|登録|registration
しんらい|信頼|trust
あんしん|安心|relief, peace of mind
ヒーロー||hero|🦸
ヒーロ||hero|🦸
ほんとう|本当|really, true
ほんと|本当|really
へんだなあ|変だなあ|that's strange…
へん|変|strange
ふしぎ|不思議|mysterious
電話に誰も出ん|でんわに だれも でん|"No one answers the phone" (a pun)|📞
おあいしましょう|お会いしましょう|let's meet (polite)
ごきげんよう||good day (elegant)
きえない|消えない|doesn't disappear
きえて|消えて|disappear
ひゃくねん|百年|a hundred years
そら|空|sky|☁️
います||is, be (polite)
いました||was (polite)
あいだ|間|between, while
なにか|何か|something
こわく|怖く|scared
など||and so on
ただ||just, only
さびしく|寂しく|lonely
さびしゅう|寂しゅう|lonely (old style)
よんで|呼んで・読んで|call; read
うれしゅう|嬉しゅう|happy (old style)
あぶらあげ|油揚げ|fried tofu (a fox's favourite)
おすき|お好き|like (polite)
ひとり|一人|one person, alone|🧍
くださいます|下さいます|kindly give (polite)
にぎやか|賑やか|lively
そっくり||exactly alike
狐がコンと来ん|きつねが コンと こん|"The fox didn't come with a 'kon'" (a pun)|🦊
きつね|狐|fox|🦊
いす|椅子|chair|🪑
たて||(part of a word)
よまなくちゃ|読まなくちゃ|have to read
よむ|読む|read|📖
かしこい|賢い|clever
わん||woof|🐕
にゃ||meow|🐈
せい|所為|fault, because of
にほんご|日本語|Japanese language|🇯🇵
じょうず|上手|good at
なんじ|何時|what time|🕐
とけい|時計|clock|🕐
べんきょう|勉強|study|📚
むずかしい|難しい|difficult
ラック||rack
かざる|飾る|decorate
ねむ|眠|sleepy (cut short)
だるい||sluggish, can't be bothered
わざ|技|trick, skill
やばくない||isn't that crazy?
やばい||crazy, awesome, bad
ひま|暇|free time
かえんなきゃ|帰んなきゃ|gotta go home
かえらなきゃ|帰らなきゃ|have to go home
かえり|帰り|way home
かえれ|帰れ|go home!
かえりました|帰りました|went home (polite)
おしえる|教える|teach, tell
ケチ||stingy
あったかい|暖かい|warm
あったかそう|暖かそう|looks warm
すぎて|過ぎて|too much
おきられない|起きられない|can't get up
おきる|起きる|get up|⏰
ハナさん||Hana
ひる|昼|midday|☀️
はじまる|始まる|begin
けど||but
どうぐかけ|道具掛け|tool rack|🧰
げんさん|源さん|Gen-san
てんけん|点検|inspection
ドア||door|🚪
さんミリ|三ミリ|three millimetres
ずれてる||is off, misaligned
まっすぐ||straight
いらん||don't need (casual)
う||(sound) u
なかなか||quite; not easily
きよう|器用|handy, skilful
こころがけ|心がけ|attitude, care
ばかもん|馬鹿者|you fool!
いってらっしゃい|行ってらっしゃい|see you, have a good trip|👋
いってらっしゃ|行ってらっしゃ|see you (cut short)
しあわせ|幸せ|happy|😊
うりきれ|売り切れ|sold out
はんがく|半額|half price
みみ|耳|ear|👂
くんくん||sniff sniff|👃
してる||is doing
おきにいり|お気に入り|favourite|⭐
ため||for the sake of
ためなら||if it's for
やいちゃった|焼いちゃった|baked (too many)
おうじさま|王子様|prince|🤴
ほん|本|book|📖
ひとくち|一口|one bite
まいあさ|毎朝|every morning
やく|焼く|bake, grill
だせ|出せ|put it out!
だい||big; stand
あさどれ|朝どれ|picked this morning
ごじゅうえん|五十円|50 yen|💴
ぜんぶ|全部|all
まけとく|負けとく|I'll give you a discount
いくら||how much|💴
とくべつ|特別|special
ねだん|値段|price
おまけ||a little extra free
だめだ||it's no good
つかう|使う|use
なの||is it? (soft)
さけんでる|叫んでる|is shouting
おつり|お釣り|change (money)|🪙
まちがえない|間違えない|don't make mistakes
のこったら|残ったら|if there's some left
おすそわけ|お裾分け|sharing extra
おとなしい||quiet, well-behaved
ひと|人|person|🧍
よろこぶ|喜ぶ|be glad
おもってる|思ってる|thinking
おもう|思う|think
さがしてる|探してる|looking for
さがしてた|探してた|was looking for
さがして|探して|look for
やさしい|優しい|kind
やさしく|優しく|kindly
あまい|甘い|sweet|🍬
よかったら|良かったら|if you like
あさつゆ|朝露|morning dew|💧
にてる|似てる|looks like
み|実|fruit, nut
さきますように|咲きますように|I hope it blooms|🌸
カレーなべ|カレー鍋|curry pot|🍲
ミカちゃん||Mika
ミカさん||Mika
スープ||soup|🥣
にこんでる|煮込んでる|simmering
どうや||how's that? (Kansai)
ひとりごと|独り言|talking to yourself
ようけ||lots (Kansai)
チャーシュー||roast pork (ramen topping)
チャーシュ||roast pork (ramen topping)
ぶん|分|portion
めん|麺|noodles|🍜
おおもり|大盛り|large serving
くう|食う|eat (rough)
くうて|食うて|eat (Kansai)
よっしゃ||alright! let's go!
からい|辛い|spicy|🌶️
ふつう|普通|normal
しとこ||let's do it
とおい|遠い|far
とこ|所|place
ところ|所|place
たのしんで|楽しんで|enjoy
たなかさん|田中さん|Tanaka-san
にがて|苦手|bad at, not keen on
きける|聞ける|can hear, can ask
かしら||I wonder
ボディガード||bodyguard|🕶️
しゃべらない|喋らない|doesn't talk
しんじる|信じる|believe
すなお|素直|honest, obedient
たぶん|多分|probably
どうして||why
ふうん||hmm (unimpressed)
きんぎょばち|金魚鉢|goldfish bowl|🐠
じゃま|邪魔|in the way
おと|音|sound|🔊
おちつき|落ち着き|calm
なおらなかった|直らなかった|didn't get fixed
なおして|直して|fix it|🔧
なおそう|直そう|let's fix it|🔧
なおせます|直せます|can fix (polite)|🔧
ます||(polite verb ending)
かまない|噛まない|doesn't bite
きんちょう|緊張|nervous
ななひき|七匹|seven (animals)
おうち|お家|home|🏠
てぶらちょう|手ぶら町|Tebura Town (the town's name)|🏘️
せかいいち|世界一|best in the world|🏆
へい||hey
えんぜつ|演説|speech
れんしゅう|練習|practice
ごほん|ご本|book (polite)
てらされた|照らされた|lit up
ごちゅうい|ご注意|caution (polite)|⚠️
マスコット||mascot
りっぱ|立派|splendid
たからもの|宝物|treasure|💎
メダル||medal|🏅
くらい||about; dark
めい|名|famous
ちょうみん|町民|townsperson
にんめい|任命|appointment
なります||become (polite)
ぜひ||by all means
いちいん|一員|member
いき|息・行き|breath; going
たこやき|たこ焼き|takoyaki|🐙
もって|持って|holding; bring
もってきて|持ってきて|bring it here|🐕
やせすぎ|痩せすぎ|too thin
むすこ|息子|son
やいて|焼いて|bake, grill
うそ|嘘|lie; no way!
ほった|掘った|dug|⛏️
くれん||won't give (Kansai)
けずる|削る|shave, carve
はいる|入る|go in
なれる||can become; get used to
まちがえたわい|間違えたわい|oops, I got it wrong (old man)
すじ|筋|line, sense
したく|支度|getting ready
ゆいいつ|唯一|the only one
いた||was there
くま|熊|bear|🐻
あおう|会おう|let's meet
にわ|庭|garden, yard|🌳
さんちょう|山頂|summit|🏔️
ゆうやけ|夕焼け|sunset glow|🌇
はろう||hello
やまのぼり|山登り|mountain climbing|🧗
なんさい|何歳|how old
のぼろう|登ろう|let's climb
のぼる|登る|climb
おにごっこ|鬼ごっこ|tag (the game)|🏃
ちょうちょ|蝶々|butterfly|🦋
よんでる|呼んでる|calling
おひさま|お日様|the sun|☀️
わんちゃーん||doggy!|🐶
やくそく|約束|promise|🤙
なりたい||want to become
くだもの|果物|fruit|🍎
せんたくもの|洗濯物|laundry|👕
ハイカー||hiker|🥾
あいさつ|挨拶|greeting|👋
たくさん||lots
金子さん|かねこさん|Kaneko-san
たのんで|頼んで|ask (a favour)
水野|みずの|Mizuno (a surname)
こちらこそ||likewise, the pleasure's mine
むこう|向こう|over there
いきたいの|行きたいの|want to go?
いく|行く|go
いぬ|犬|dog|🐕
いぬだ|犬だ|it's a dog|🐕
のれ|乗れ|get on!
つれて|連れて|take along
のりたいの|乗りたいの|want to ride?
なんにん|何人|how many people
のるの|乗るの|riding?
いいだろう||all right, fine
おいて|置いて|put down; leave
いけ|行け|go!
うわさ|噂|rumour
通り|とおり|street
とおり|通り|street
ばかり||only, nothing but
カフェ||café|☕
しってる|知ってる|know
しっとる|知っとる|know (old man)
おおい|多い|many
ジャンプ||jump|🦘
くれへん||won't you give (Kansai)
ねん||(Kansai sentence ending)
ちょくせつ|直接|directly
ききたい|聞きたい|want to hear, want to ask
えっと||um…
つまんない||boring
ちょうど||exactly, just
もの|物|thing
しらべて|調べて|investigate
ネムさん||Nemu-san
ゆうべ|夕べ|last night
こうもん|校門|school gate
とおった|通った|passed by
こっそり||secretly
だれか|誰か|someone
だれ|誰|who
はんにん|犯人|culprit|🕵️
うーん||hmm…
もう一回|もういっかい|one more time
しました||did (polite)
じゅんび|準備|preparation
おっしゃい||say it (polite order)
おっしゃって||please say (polite)
くださいませ|下さいませ|please (very polite)
おのぞみ|お望み|your wish
ていねい|丁寧|polite
たりません|足りません|not enough
なぜ||why
こと|事|thing, matter
いちど|一度|once
すん||(cut short)
おく|奥|the back; put
おなじ|同じ|same
なんだろう|何だろう|I wonder what it is
かぎ|鍵|key|🔑
かき|柿|persimmon|🟠
ゾンビ||zombie|🧟
ぼうし|帽子|hat|🎩
めがね|眼鏡|glasses|👓
かさ|傘|umbrella|☂️
あか|赤|red|🔴
あかい|赤い|red|🔴
あお|青|blue|🔵
あおい|青い|blue|🔵
きいろ|黄色|yellow|🟡
きいろい|黄色い|yellow|🟡
くろ|黒|black|⚫
くろい|黒い|black|⚫
しろい|白い|white|⚪
みどり|緑|green|🟢
むらさき|紫|purple|🟣
ピンク||pink
シャツ||shirt|👕
ボール||ball|⚽
バケツ||bucket|🪣
くつ|靴|shoe|👟
くつした|靴下|sock|🧦
タオル||towel
ほって|掘って|dig!|⛏️
おすわり|お座り|sit!|🐕
こっち||this way, over here
おいで||come here!
もどって|戻って|come back
ごめんなさい||I'm sorry
いいえ||no
うん||yeah
ううん||nope
えん|円|yen|💴
ふとん|布団|futon|🛏️
ふぁ||(yawn) fwah|🥱
びより|日和|perfect weather for…
そっか||oh, I see
あそぼ|遊ぼ|let's play!
たの||(cut short)
あなたにだけ|あなたにだけ|only for you
ねこ|猫|cat|🐈
かざって|飾って|decorate; put on display
だる||ugh, can't be bothered
あし|足|leg, foot|🦶
やさい|野菜|vegetables|🥬
つかって|使って|use (it)
たな|棚|shelf
もってき|持ってき|bring (cut short)
もってきな|持ってきな|bring it (casual)
ほしいん|欲しいん|want (explaining)
きたん|来たん|came (explaining)
どんな||what kind of
お||(polite prefix)
もっと||more
たこやきき|たこ焼き器|takoyaki pan|🐙
ほる|掘る|dig|⛏️
くまじゃ|熊じゃ|it's a bear (old man)|🐻
テント||tent|⛺
おはよー||mornin'!|🌅
ママ||mum|👩
ひとばかり|人ばかり|nothing but people
えき|駅|station|🚉
ふみきり|踏切|railway crossing|🚦
しって|知って|know
もり|森|forest|🌲
みち|道|road, path
ふね|船|boat|⛵
いえ|家|house|🏠
じんじゃ|神社|shrine|⛩️
ふんすい|噴水|fountain|⛲
こうばん|交番|police box|👮
どうぐ|道具|tools|🧰
なべ|鍋|pot|🍲
ミシン||sewing machine|🧵
きんぎょ|金魚|goldfish|🐠
竹林|ちくりん|bamboo grove|🎋
狐がコンと来ん|きつねが コンと こん|"The fox didn't come with a 'kon'" (a pun)|🦊
狐がコン|きつねが コン|"The fox goes 'kon'…" (part of a pun)|🦊
来ん|こん|didn't come (pun on the fox's こん)
ちかく|近く|nearby
ちかい|近い|near
`;
(function () {
  const kataToHira = (s) => s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
  const key = (s) => kataToHira(String(s || '').normalize('NFKC')).replace(/[\s、。！？!?「」『』…・〜~ー♪]/g, '');
  const DICT = {};
  window.DICT_SRC.split('\n').forEach((line) => {
    if (!line.trim()) return;
    const [form, other, en, icon] = line.split('|');
    // the entry's two spellings: whichever has kanji is the written form, the other the reading
    const hasK = (s) => /[一-龯]/.test(s || '');
    const kanji = hasK(form) ? form : (other || ''), kana = hasK(form) ? (other || form) : form;
    const e = { kana, kanji, en: en || '', icon: icon || '' };
    for (const f of [form, other, kana]) if (f && !DICT[key(f)]) DICT[key(f)] = e;
    if (kanji) kanji.split('・').forEach((k) => { if (!DICT[key(k)]) DICT[key(k)] = e; });
  });
  // endings stripped off a word, longest first, until something in the dictionary is found
  const ENDS = ['ですか', 'ですね', 'ですよ', 'でしょう', 'でしょ', 'だよね', 'だよ', 'だね', 'だな', 'には', 'では', 'とは', 'から', 'まで', 'より', 'けど', 'って', 'の', 'は', 'が', 'を', 'に', 'で', 'と', 'も', 'へ', 'よ', 'ね', 'な', 'か', 'さ', 'わ', 'や', 'だ'];
  function lookup(word) {
    let w = key(word);
    if (!w) return null;
    if (DICT[w]) return { base: w, entry: DICT[w], rest: '' };
    // try taking particles off the end, one or two at a time (きょうは → きょう + は)
    for (const a of ENDS) if (w.length > a.length && w.endsWith(a)) {
      const b = w.slice(0, -a.length);
      if (DICT[b]) return { base: b, entry: DICT[b], rest: a, restEntry: DICT[a] || null };
      for (const c of ENDS) if (b.length > c.length && b.endsWith(c) && DICT[b.slice(0, -c.length)]) {
        const bb = b.slice(0, -c.length);
        return { base: bb, entry: DICT[bb], rest: c + a, restEntry: DICT[c + a] || DICT[c] || null };
      }
    }
    return null;
  }
  // the camera's words (with their sprite as the icon), if words.js is loaded too
  function addPhoto(PHOTO) {
    for (const [sprite, v] of Object.entries(PHOTO || {})) {
      const [jp, kana, en] = v, hasK = /[\u4e00-\u9faf]/.test(jp);
      const e = { kana: kana || jp, kanji: hasK ? jp : '', en, icon: '', sprite: sprite.startsWith('t:') ? '' : sprite };
      for (const f of [jp, kana]) if (f) { const k = key(f); if (!DICT[k]) DICT[k] = e; else if (!DICT[k].sprite && e.sprite) DICT[k].sprite = e.sprite; }
    }
  }
  if (window.Words) addPhoto(window.Words.PHOTO);
  window.Dict = { lookup, key, DICT, addPhoto };
})();
