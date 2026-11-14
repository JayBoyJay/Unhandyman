// The main story: chapters of small quests, each leading to the next (see the design plan's chapter plan).
// Plain JSON after `window.QUESTS =`, so tools/voicegen.py can voice the lines too.
// Step types: flag (a story flag is set), go (reach a map), talk (say hello to someone: a short scene),
// jobs (finish n jobs), friends (n people at k stars), say (say a word to the dog in a map; it does the action),
// boss (a conversation with a trust meter; `require` = a skill you must use: question, past, polite).
window.QUESTS = [
 {
  "id": "c0_hello",
  "chapter": 0,
  "jp": "ハナさんに あいさつ",
  "en": "Say good morning to Hana",
  "steps": [
   {
    "type": "flag",
    "flag": "met",
    "jp": "ハナさんに 「おはよう」",
    "en": "Say おはよう to Hana"
   }
  ],
  "reward": {
   "yen": 0
  },
  "done": null
 },
 {
  "id": "c0_jobs",
  "chapter": 0,
  "jp": "はじめての しごと",
  "en": "Your first jobs",
  "steps": [
   {
    "type": "flag",
    "flag": "night0",
    "jp": "しごとを みっつ して、よるを まもる",
    "en": "Do three jobs, then protect the house at night"
   }
  ],
  "reward": {
   "yen": 100
  },
  "done": null
 },
 {
  "id": "c0_dig",
  "chapter": 0,
  "jp": "フェンスの 下",
  "en": "Under the fence",
  "steps": [
   {
    "type": "flag",
    "flag": "ch0done",
    "jp": "いぬに 「ほって」",
    "en": "Tell the dog to dig under the fence"
   }
  ],
  "reward": {
   "yen": 200
  },
  "done": null
 },
 {
  "id": "c1_square",
  "chapter": 1,
  "jp": "広場へ",
  "en": "To the town square",
  "steps": [
   {
    "type": "go",
    "map": "square",
    "jp": "うらみちを とおって 広場へ",
    "en": "Go through the back lane to the town square"
   },
   {
    "type": "talk",
    "npc": "mayor",
    "jp": "町長さんに あいさつ",
    "en": "Say hello to the mayor",
    "turns": [
     {
      "say": "おお！ あなたが ハナさんの ところの しんじん ですな！ ようこそ、てぶらちょうへ！",
      "want": {
       "greet": "ほっほっほ！ げんきな あいさつ ですな！",
       "yes": "けっこう、けっこう！",
       "any": "ほっほっほ！"
      }
     },
     {
      "say": "この 広場には みせが たくさん あります。 こまったら、みんなに きいて ください！",
      "want": {
       "yes": "よろしい！",
       "any": "ほっほっほ。"
      }
     }
    ]
   }
  ],
  "reward": {
   "yen": 100
  },
  "done": null
 },
 {
  "id": "c1_fountain",
  "chapter": 1,
  "jp": "こわれた ふんすい",
  "en": "The broken fountain",
  "steps": [
   {
    "type": "talk",
    "npc": "mizuno",
    "jp": "水野さんに ふんすいの こと を きく",
    "en": "Ask Mizuno about the fountain",
    "turns": [
     {
      "say": "あ、あの… ふんすいが… みずが でない ん です… パイプが… すみません…",
      "want": {
       "any": "ど、どうぐが ない ん です… 金子さんの みせに…"
      }
     },
     {
      "say": "か、金子さんに… ねじを たのんで くれますか…？",
      "want": {
       "yes": "あ、ありがとう ございます…！",
       "no": "そ、そう ですよね… すみません…",
       "any": "す、すみません…"
      }
     }
    ]
   },
   {
    "type": "talk",
    "npc": "kaneko",
    "jp": "金子さんに ねじを もらう",
    "en": "Get screws from Kaneko (say how many)",
    "turns": [
     {
      "say": "水野の ふんすいか。 ねじ、いくつ いる？ かずで いえ。",
      "want": {
       "number": "よし。 もってけ。 …せいかく だな。",
       "any": "かずで いえ。 いくつ だ？"
      }
     }
    ]
   },
   {
    "type": "talk",
    "npc": "mizuno",
    "jp": "水野さんに ねじを わたす",
    "en": "Bring the screws back to Mizuno",
    "turns": [
     {
      "say": "あ…！ ねじ…！ これで なおせます…！ ほんとうに ありがとう ございます！",
      "want": {
       "thanks": "い、いえ、こちらこそ…！",
       "any": "あ、ありがとう…！"
      }
     }
    ]
   }
  ],
  "reward": {
   "yen": 200,
   "treats": 1
  },
  "done": "ふんすいから みずが でた！"
 },
 {
  "id": "c1_work",
  "chapter": 1,
  "jp": "まちの やくに たつ",
  "en": "Be useful in town",
  "steps": [
   {
    "type": "jobs",
    "n": 2,
    "jp": "しごとを ふたつ する",
    "en": "Finish two jobs"
   },
   {
    "type": "friends",
    "n": 2,
    "stars": 1,
    "jp": "二人と なかよく なる (★1)",
    "en": "Reach one star with two people"
   }
  ],
  "reward": {
   "yen": 200
  },
  "done": null
 },
 {
  "id": "c1_swim",
  "chapter": 1,
  "jp": "いぬは およげる？",
  "en": "Can the dog swim?",
  "steps": [
   {
    "type": "talk",
    "npc": "gen",
    "jp": "源さんと はなす (ふなつきば)",
    "en": "Talk to Gen at the dock",
    "turns": [
     {
      "say": "…かわの むこうに いきたいのか？",
      "want": {
       "yes": "…ふねは ある。 だが、まず いぬだ。",
       "no": "…なら、よう は ない。",
       "any": "…ふん。"
      }
     },
     {
      "say": "…その いぬ、およげるか？ ためして みろ。 「およいで」と いえ。"
     }
    ]
   },
   {
    "type": "say",
    "words": [
     "およいで",
     "泳いで",
     "およげ",
     "泳げ"
    ],
    "map": "square",
    "anim": "swim",
    "jp": "いぬに 「およいで」",
    "en": "Tell the dog to swim (in the square, near the water)"
   }
  ],
  "reward": {
   "yen": 100
  },
  "done": "…ほう。 いい いぬ だ。"
 },
 {
  "id": "c1_boss",
  "chapter": 1,
  "jp": "源さんの ふね",
  "en": "Gen's boat",
  "steps": [
   {
    "type": "boss",
    "npc": "gen",
    "jp": "源さんに ほしい ものを ちゃんと いう",
    "en": "Tell Gen exactly what you need",
    "need": 60,
    "hint": "Answer each question exactly: yes/no, a number, where. もう一回 is free.",
    "turns": [
     {
      "say": "…ふねに のりたいのか？",
      "want": {
       "yes": "…そうか。"
      }
     },
     {
      "say": "…なんにん だ？ かずで。",
      "want": {
       "number": "…わかった。"
      }
     },
     {
      "say": "…いぬも のるのか？",
      "want": {
       "yes": "…いいだろう。",
       "no": "…いぬは おいて いけ。 …じょうだん だ。"
      }
     },
     {
      "say": "…どこまで だ？",
      "want": {
       "any": "…かわの むこう か。 …よし。"
      }
     }
    ],
    "win": "…のれ。 かわの むこうへ つれて いって やる。 …また な。",
    "lose": "…わからん。 また あした こい。",
    "flag": "ch1done"
   }
  ],
  "reward": {
   "yen": 300,
   "treats": 2
  },
  "done": "川沿いの道へ いける！"
 },
 {
  "id": "c2_cafe",
  "chapter": 2,
  "jp": "カフェ通りへ",
  "en": "To café street",
  "steps": [
   {
    "type": "go",
    "map": "cafe",
    "jp": "川沿いの道を とおって カフェ通りへ",
    "en": "Follow the riverside walk to café street"
   },
   {
    "type": "talk",
    "npc": "yamada",
    "jp": "山田さんと はなす",
    "en": "Talk to Yamada",
    "turns": [
     {
      "say": "やあ。 きみが うわさの しんじん だね。 この 通りは いい ひとばかり だよ。",
      "want": {
       "any": "ふふ。"
      }
     },
     {
      "say": "カフェの ミカさん、しってる？ ひみつが おおい ひと でね。 しつもん すると いい よ。",
      "want": {
       "yes": "そう、そう。",
       "no": "カフェに いって ごらん。",
       "any": "きいて ごらん。"
      }
     }
    ]
   }
  ],
  "reward": {
   "yen": 100
  },
  "done": null
 },
 {
  "id": "c2_friends",
  "chapter": 2,
  "jp": "ともだちを つくる",
  "en": "Make friends",
  "steps": [
   {
    "type": "friends",
    "n": 4,
    "stars": 1,
    "jp": "四人と なかよく なる (★1)",
    "en": "Reach one star with four people"
   },
   {
    "type": "friends",
    "n": 1,
    "stars": 2,
    "jp": "だれかと ★2",
    "en": "Reach two stars with someone"
   }
  ],
  "reward": {
   "yen": 200,
   "treats": 1
  },
  "done": null
 },
 {
  "id": "c2_jump",
  "chapter": 2,
  "jp": "とんで！",
  "en": "Jump!",
  "steps": [
   {
    "type": "talk",
    "npc": "yui",
    "jp": "ユイと はなす (はし の ちかく)",
    "en": "Talk to Yui by the bridge",
    "turns": [
     {
      "say": "ねえ ねえ！ その いぬ、ジャンプ できる？",
      "want": {
       "yes": "まじ！？ みせて！",
       "no": "えー、ためして みよ！",
       "any": "みせて みせて！"
      }
     },
     {
      "say": "「とんで」って いって みて！"
     }
    ]
   },
   {
    "type": "say",
    "words": [
     "とんで",
     "跳んで",
     "飛んで",
     "ジャンプ"
    ],
    "map": "river",
    "anim": "jump",
    "jp": "いぬに 「とんで」",
    "en": "Tell the dog to jump (on the riverside walk)"
   },
   {
    "type": "say",
    "words": [
     "のぼって",
     "登って",
     "上って"
    ],
    "map": "cafe",
    "anim": "climb",
    "jp": "いぬに 「のぼって」",
    "en": "Tell the dog to climb (on café street)"
   }
  ],
  "reward": {
   "yen": 150
  },
  "done": "やばっ！ めっちゃ すごい じゃん！"
 },
 {
  "id": "c2_secret",
  "chapter": 2,
  "jp": "ミカさんの ひみつ",
  "en": "Mika's secret",
  "steps": [
   {
    "type": "talk",
    "npc": "tetsu",
    "jp": "鉄さんに ミカさんの こと を きく",
    "en": "Ask Tetsu about Mika",
    "turns": [
     {
      "say": "ミカちゃん？ ええ こ やで！ でも すきな もん は おしえて くれへん ねん。",
      "want": {
       "any": "ほんま やで！"
      }
     },
     {
      "say": "ちょくせつ きいて みたら ええ やん！ 「なにが すき？」って な！",
      "want": {
       "yes": "せや せや！",
       "any": "がんばりや！"
      }
     }
    ]
   }
  ],
  "reward": {
   "yen": 100
  },
  "done": null
 },
 {
  "id": "c2_boss",
  "chapter": 2,
  "jp": "ミカさんと おしゃべり",
  "en": "Chatting with Mika",
  "steps": [
   {
    "type": "boss",
    "npc": "mika",
    "jp": "ミカさんに しつもん して、すきな ものを しる",
    "en": "Find out Mika's favourite things by asking questions (in the café)",
    "need": 60,
    "require": [
     "question"
    ],
    "hint": "Ask her things: なにが すき？ / どこ？ / いつ？",
    "turns": [
     {
      "say": "いらっしゃいませ！ きょうは なにを はなす？",
      "want": {
       "question": "ふふ、しりたい？ …わたしは ねこが すき！",
       "any": "ふふ、それで？"
      }
     },
     {
      "say": "ほかに ききたい こと、ある？",
      "want": {
       "question": "えっとね… カレーが いちばん すき なの！ ないしょ よ！",
       "yes": "なに なに？",
       "no": "えー、つまんない！"
      }
     },
     {
      "say": "あなたは？ なにが すき？",
      "want": {
       "any": "へえ〜！ すてき！"
      }
     }
    ],
    "win": "あなたと はなすの、たのしい！ また きて ね！ …あ、えきの ほうに いく なら、ふみきりに きを つけて ね。",
    "lose": "ごめん、いま いそがしい の。 また あした ね！",
    "flag": "ch2done"
   }
  ],
  "reward": {
   "yen": 300,
   "treats": 2
  },
  "done": "踏切へ いける！"
 },
 {
  "id": "c3_police",
  "chapter": 3,
  "jp": "交番へ",
  "en": "To the police box",
  "steps": [
   {
    "type": "go",
    "map": "police",
    "jp": "踏切を わたって 交番へ",
    "en": "Cross the railway to the police box"
   },
   {
    "type": "talk",
    "npc": "tanaka",
    "jp": "田中さんに あいさつ",
    "en": "Say hello to officer Tanaka",
    "turns": [
     {
      "say": "あ！ ちょうど よかった！ さいきん、よるに へんな ものが みえる そう です！",
      "want": {
       "any": "メモ します！"
      }
     },
     {
      "say": "ちいさい てが… あるいて いる そう です。 しらべて くれますか？",
      "want": {
       "yes": "たすかります！ まずは ネムさんに きいて ください！",
       "no": "そ、そう ですか…",
       "any": "おねがいします！"
      }
     }
    ]
   }
  ],
  "reward": {
   "yen": 100
  },
  "done": null
 },
 {
  "id": "c3_witness",
  "chapter": 3,
  "jp": "もくげきしゃ",
  "en": "Witnesses",
  "steps": [
   {
    "type": "talk",
    "npc": "nemu",
    "jp": "ネムさんに はなしを きく (古い学校)",
    "en": "Ask Nemu what he saw (old school)",
    "turns": [
     {
      "say": "…ふぁ… ゆうべ… ちいさい てが… こうもんを とおった…",
      "want": {
       "any": "…ゆめ… かな…"
      }
     },
     {
      "say": "…てが… しずかに… こっそり あるいて た…",
      "want": {
       "any": "…ぐう…"
      }
     }
    ]
   },
   {
    "type": "talk",
    "npc": "yuri",
    "jp": "ユリママに うわさを きく (カフェ通り)",
    "en": "Ask Yuri about the rumour (café street)",
    "turns": [
     {
      "say": "あら、ちいさい て の はなし？ ふふ、きいた わ よ。",
      "want": {
       "any": "ふふ。"
      }
     },
     {
      "say": "その て… だれかを さがして いる みたい。 …あなたを、かも ね。",
      "want": {
       "any": "…ふふ、こわい？"
      }
     }
    ]
   }
  ],
  "reward": {
   "yen": 150
  },
  "done": null
 },
 {
  "id": "c3_sneak",
  "chapter": 3,
  "jp": "こっそり",
  "en": "Sneaking",
  "steps": [
   {
    "type": "say",
    "words": [
     "こっそり",
     "しずかに",
     "静かに"
    ],
    "map": "police",
    "anim": "sneak",
    "jp": "いぬに 「こっそり」",
    "en": "Tell the dog to sneak (at the old school)"
   },
   {
    "type": "jobs",
    "n": 2,
    "jp": "しごとを ふたつ する",
    "en": "Finish two more jobs"
   }
  ],
  "reward": {
   "yen": 150
  },
  "done": "いぬが こっそり こうもんを とおった… なにか みつけた？"
 },
 {
  "id": "c3_boss",
  "chapter": 3,
  "jp": "アリバイ",
  "en": "Your alibi",
  "steps": [
   {
    "type": "boss",
    "npc": "tanaka",
    "jp": "田中さんに きのうの こと を はなす (かこけい)",
    "en": "Tell Tanaka what you did yesterday, in the past tense",
    "need": 60,
    "require": [
     "past"
    ],
    "hint": "Use the past tense: ねました / しごとを しました / いえに いました",
    "turns": [
     {
      "say": "では、しつもん です。 きのうの よる、なにを しましたか？",
      "want": {
       "past": "なるほど！ メモ します！",
       "any": "…きのう の こと です よ？"
      }
     },
     {
      "say": "どこに いましたか？",
      "want": {
       "past": "ふむふむ。",
       "any": "ふむ。"
      }
     },
     {
      "say": "いぬも いっしょ でしたか？",
      "want": {
       "yes": "わかりました！",
       "no": "ふむ…",
       "past": "わかりました！"
      }
     }
    ],
    "win": "あなたは はんにん では ありません！ …ちいさい ては 竹林の ほうへ いった そう です。 きを つけて！",
    "lose": "うーん… また あした、もう一回 きかせて ください！",
    "flag": "ch3done"
   }
  ],
  "reward": {
   "yen": 300,
   "treats": 2
  },
  "done": "竹林の小道へ いける！"
 },
 {
  "id": "c4_shrine",
  "chapter": 4,
  "jp": "神社へ",
  "en": "To the shrine",
  "steps": [
   {
    "type": "go",
    "map": "shrine",
    "jp": "竹林を とおって 神社へ",
    "en": "Go through the bamboo path to the shrine"
   },
   {
    "type": "talk",
    "npc": "obachan",
    "jp": "おばちゃんを てつだう",
    "en": "Help the takoyaki auntie",
    "turns": [
     {
      "say": "ほら、あんた！ おまつりの じゅんび、てつだって くれる？",
      "want": {
       "yes": "えらい！ ありがと！",
       "no": "もう、しょうがない ね！ …でも てつだって ね！",
       "any": "ほら ほら！"
      }
     },
     {
      "say": "ちょうちん、いくつ いる と おもう？",
      "want": {
       "number": "そう ね、それで いこう！",
       "any": "かずで いって！"
      }
     }
    ]
   },
   {
    "type": "jobs",
    "n": 2,
    "jp": "しごとを ふたつ する",
    "en": "Finish two jobs"
   }
  ],
  "reward": {
   "yen": 150
  },
  "done": null
 },
 {
  "id": "c4_fox",
  "chapter": 4,
  "jp": "きつねの こえ",
  "en": "The fox's voice",
  "steps": [
   {
    "type": "talk",
    "npc": "kon",
    "jp": "コンと はなす (ゆうがた)",
    "en": "Talk to Kon (it appears in the evening)",
    "time": "evening",
    "turns": [
     {
      "say": "…ほう。 わたくしの こえが きこえる のですね。",
      "want": {
       "yes": "…めずらしい かた。",
       "any": "…ふふ。"
      }
     },
     {
      "say": "…ちいさい ての こと、しって おります。 でも、ただでは おしえませんよ。 …まず、いぬに 「きえて」と おっしゃい。"
     }
    ]
   },
   {
    "type": "say",
    "words": [
     "きえて",
     "消えて"
    ],
    "map": "shrine",
    "anim": "vanish",
    "jp": "いぬに 「きえて」",
    "en": "Tell the dog to vanish (at the shrine)"
   }
  ],
  "reward": {
   "yen": 150
  },
  "done": "いぬが きえて… また あらわれた！"
 },
 {
  "id": "c4_boss",
  "chapter": 4,
  "jp": "きつねへの おねがい",
  "en": "A request to the fox",
  "steps": [
   {
    "type": "boss",
    "npc": "kon",
    "jp": "コンに ていねいに おねがい する",
    "en": "Ask Kon sincerely and politely",
    "need": 60,
    "require": [
     "polite"
    ],
    "hint": "Be polite: おしえて ください / おねがいします / 〜ます",
    "turns": [
     {
      "say": "…わたくしに、なにを おのぞみ ですか？",
      "want": {
       "polite": "…ていねいな かた。",
       "any": "…ことばが たりませんね。"
      }
     },
     {
      "say": "…なぜ ちいさい ての ことを しりたい のですか？",
      "want": {
       "any": "…ふふ。 そう でございますか。"
      }
     },
     {
      "say": "…もう いちど、ていねいに おっしゃって ください。",
      "want": {
       "polite": "…よろしい。"
      }
     }
    ],
    "win": "…ちいさい ては、山の もりの ふるい こや に かえりました。 …どうか、やさしく して あげて ください。",
    "lose": "…また あした、おいで くださいませ。",
    "flag": "ch4done"
   }
  ],
  "reward": {
   "yen": 300,
   "treats": 2
  },
  "done": "棚田の道へ いける！"
 },
 {
  "id": "c5_forest",
  "chapter": 5,
  "jp": "山の もりへ",
  "en": "Into the mountain forest",
  "steps": [
   {
    "type": "go",
    "map": "forest",
    "jp": "棚田の道を のぼって 山の森へ",
    "en": "Climb the terrace road to the mountain forest"
   },
   {
    "type": "talk",
    "npc": "kumada",
    "jp": "熊田さんに ふるい こやの こと を きく",
    "en": "Ask Kumada about the old hut",
    "turns": [
     {
      "say": "…ふるい こや か。 わしは しっとる。",
      "want": {
       "any": "…ふむ。"
      }
     },
     {
      "say": "…よるに なると、こやから ちいさい おとが する んじゃ。 …だれか、いや なにか が すんで おる。",
      "want": {
       "any": "…きを つけて な。"
      }
     }
    ]
   },
   {
    "type": "talk",
    "npc": "ken",
    "jp": "ケンさんに みちを きく",
    "en": "Ask Ken the way",
    "turns": [
     {
      "say": "やあ！ ふるい こや？ この みちの おく だよ！",
      "want": {
       "any": "きを つけてね！"
      }
     },
     {
      "say": "…でも ね、こやの まえで いつも おなじ ことばが きこえる んだ。 「ごめんね」って。",
      "want": {
       "any": "なんだろう ね…"
      }
     }
    ]
   },
   {
    "type": "flag",
    "flag": "finale",
    "jp": "つづく… (the finale is coming)",
    "en": "To be continued: the finale isn't built yet"
   }
  ],
  "reward": {
   "yen": 0
  },
  "done": null
 }
];
