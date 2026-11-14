// Characters: daily chats, friendship gifts and the five core wishes (pun scraps and dog tricks).
// Plain JSON after the '=' so tools/voicegen.py can read the lines too. See the design plan.
// chats[stage]: one short conversation per friendship stage (0, 1, 2 stars). Each turn's `want`
// maps what you say (yes, no, greet, thanks, number, time, dunno, any) to their answer.
window.CHARACTERS = {
 "hana": {
  "name": "ハナさん",
  "role": "landlady",
  "core": true,
  "chats": [
   [
    {
     "say": "きょうも いい てんき だね。",
     "want": {
      "yes": "ね！ さんぽ びより だよ。",
      "no": "そう？ わたしは すき だけど ね。",
      "any": "ふふ、そう だね。"
     }
    }
   ],
   [
    {
     "say": "いぬは げんき？",
     "want": {
      "yes": "よかった。 いい こ だね。",
      "no": "あら… おやつ、あげて ね。",
      "any": "ふふ。 いぬは かわいい ね。"
     }
    }
   ],
   [
    {
     "say": "この まち、すき？",
     "want": {
      "yes": "うれしい！ わたしも ずっと すき だよ。",
      "no": "そっか… これから すきに なる よ、きっと。",
      "any": "ゆっくりで いい よ。"
     }
    }
   ]
  ],
  "again": "また あした ね。",
  "gift": {
   "sprite": "her_old_sewing_table",
   "en": "Her old sewing table",
   "line": "これ、むかしの ミシンの つくえ。 あげる ね！"
  },
  "wish": {
   "item": "the_fluffiest_futon_in_town",
   "item_en": "The fluffiest futon in town",
   "ask": "さいきん、よく ねむれない の… ふかふかの ふとんが あったら なあ。",
   "deliver": "わあ！ ふかふかの ふとん！ ありがとう！ これで よく ねむれる よ。",
   "scrap": {
    "jp": "布団が吹っ飛んだ",
    "html": "<ruby>布団<rt>ふとん</rt></ruby>が<ruby>吹<rt>ふ</rt></ruby>っ<ruby>飛<rt>と</rt></ruby>んだ",
    "en": "The futon flew away!",
    "note": "ふとん (futon) sounds like ふっとんだ (blew away)."
   },
   "trick": {
    "id": "futon",
    "en": "folds every futon in the house into a tower and naps on top",
    "say": [
     "ふとんがふっとんだ",
     "布団が吹っ飛んだ",
     "布団がふっとんだ",
     "ふとんが吹っ飛んだ",
     "布団が吹っとんだ"
    ]
   }
  }
 },
 "gen": {
  "name": "源さん",
  "role": "ferryman",
  "core": true,
  "chats": [
   [
    {
     "say": "…ふねか？",
     "want": {
      "yes": "…まだ だ。 あとで。",
      "no": "…そうか。",
      "any": "…ふん。"
     }
    }
   ],
   [
    {
     "say": "…さかな、すきか？",
     "want": {
      "yes": "…おれも だ。",
      "no": "…もったいない。",
      "any": "…そうか。"
     }
    }
   ],
   [
    {
     "say": "…いぬ、およげるか？",
     "want": {
      "yes": "…いい いぬ だ。",
      "no": "…おしえて やれ。",
      "dunno": "…ためして みろ。",
      "any": "…ふん。"
     }
    }
   ]
  ],
  "again": "…また な。",
  "gift": {
   "sprite": "a_rope_hammock",
   "en": "A rope hammock",
   "line": "…ハンモック だ。 やる。"
  },
  "wish": {
   "item": "a_brass_ship_s_bell",
   "item_en": "A brass ship's bell",
   "ask": "…かねが あれば な。 ふねの かね。",
   "deliver": "…これは… いい かね だ。 …ありがとよ。",
   "scrap": {
    "jp": "イルカはいるか？",
    "html": "イルカはいるか？",
    "en": "Is there a dolphin?",
    "note": "イルカ (dolphin) sounds like いるか (is there?)."
   },
   "trick": {
    "id": "dolphin",
    "en": "walks across the river on top of the water",
    "say": [
     "いるかはいるか",
     "イルカはいるか"
    ]
   }
  }
 },
 "mika": {
  "name": "ミカさん",
  "role": "café owner",
  "core": true,
  "chats": [
   [
    {
     "say": "いらっしゃいませ！ コーヒー、すき？",
     "want": {
      "yes": "よかった！ うちの コーヒー、おいしい よ。",
      "no": "じゃあ、こうちゃは どう？",
      "any": "ふふ、また きて ね！"
     }
    }
   ],
   [
    {
     "say": "きょうの ケーキ、たべる？",
     "want": {
      "yes": "はい、どうぞ！ …いぬは だめ よ。",
      "no": "ざんねん！ また こんど ね。",
      "any": "ふふ。"
     }
    }
   ],
   [
    {
     "say": "ねえ、ひみつ、しりたい？",
     "want": {
      "yes": "じつは… カレーが いちばん すき なの！",
      "no": "えー！ じゃあ また こんど。",
      "any": "ふふ、ないしょ。"
     }
    }
   ]
  ],
  "again": "また きて ね！",
  "gift": {
   "sprite": "a_cafe_counter",
   "en": "A café counter for your kitchen",
   "line": "これ、ふるい カウンター。 キッチンに どうぞ！"
  },
  "wish": {
   "item": "a_giant_curry_pot",
   "item_en": "A giant curry pot",
   "ask": "おおきな カレーの なべが ほしい なあ… みんなに つくりたい の。",
   "deliver": "わあ、おおきい なべ！ ありがとう！ カレー、つくる ね！",
   "scrap": {
    "jp": "このカレーは辛えー",
    "html": "このカレーは<ruby>辛<rt>から</rt></ruby>えー",
    "en": "This curry is spicy!",
    "note": "カレー (curry) sounds like からえー (rough way to say spicy)."
   },
   "trick": {
    "id": "latte",
    "en": "pours latte art of your face",
    "say": [
     "かれーはからえ",
     "かれーはかれー",
     "カレーは辛え",
     "カレーはからえ",
     "カレーは辛い"
    ]
   }
  }
 },
 "tanaka": {
  "name": "田中さん",
  "role": "police officer",
  "core": true,
  "chats": [
   [
    {
     "say": "こんにちは！ この まちは はじめて ですか？",
     "want": {
      "yes": "ようこそ！ こまったら、こうばんへ どうぞ！",
      "no": "そうですか！ いつも ありがとう ございます！",
      "any": "はい！ よろしく おねがいします！"
     }
    }
   ],
   [
    {
     "say": "その いぬ、おなまえは？",
     "want": {
      "any": "なるほど！ いい なまえ ですね！"
     }
    }
   ],
   [
    {
     "say": "きのうの よる… ちいさい てを みませんでしたか？",
     "want": {
      "yes": "ほんとう ですか！？ メモ します！",
      "no": "そうですか… へんだなあ。",
      "dunno": "わからない… ですよね。",
      "any": "ふしぎ ですね…"
     }
    }
   ]
  ],
  "again": "パトロール、がんばります！",
  "gift": {
   "sprite": "a_police_box_lamp",
   "en": "A police-box lamp",
   "line": "こうばんの ランプ です！ どうぞ！"
  },
  "wish": {
   "item": "an_old_dial_phone",
   "item_en": "An old dial phone",
   "ask": "こうばんの でんわが こわれて… ふるい でんわが あれば…",
   "deliver": "でんわ！ たすかります！ ありがとう ございます！",
   "scrap": {
    "jp": "電話に誰も出んわ",
    "html": "<ruby>電話<rt>でんわ</rt></ruby>に<ruby>誰<rt>だれ</rt></ruby>も<ruby>出<rt>で</rt></ruby>んわ",
    "en": "Nobody's answering the phone.",
    "note": "でんわ (phone) sounds like でんわ (won't pick up, in dialect)."
   },
   "trick": {
    "id": "traffic",
    "en": "stands on two legs, salutes, blows a whistle and directs traffic",
    "say": [
     "でんわにだれもでんわ",
     "電話に誰も出んわ",
     "電話に誰もでんわ",
     "だれもでんわ",
     "誰も出んわ"
    ]
   }
  }
 },
 "kon": {
  "name": "コン",
  "role": "fox spirit",
  "core": true,
  "chats": [
   [
    {
     "say": "…ほう。 わたくしが みえる のですか？",
     "want": {
      "yes": "…めずらしい。 うれしゅう ございます。",
      "no": "…ふふ。 では、これは ゆめ でございます。",
      "any": "…ふふふ。"
     }
    }
   ],
   [
    {
     "say": "あぶらあげは おすき ですか？",
     "want": {
      "yes": "まあ！ なかま でございますね。",
      "no": "…ざんねん でございます。",
      "any": "…ふふ。"
     }
    }
   ],
   [
    {
     "say": "…ひとりは さびしゅう ございます。 また きて くださいますか？",
     "want": {
      "yes": "…ありがとう ございます。 まって おります。",
      "no": "…そう でございますか。",
      "any": "…ふふ。"
     }
    }
   ]
  ],
  "again": "また おあいしましょう。",
  "gift": {
   "sprite": "a_lantern_that_never_goes_out",
   "en": "A paper lantern that never goes out",
   "line": "きえない ちょうちん でございます。 どうぞ。"
  },
  "wish": {
   "item": "a_carved_wooden_fox",
   "item_en": "A carved wooden fox",
   "ask": "…きの きつねが あれば、じんじゃが にぎやかに… なんて。",
   "deliver": "まあ…！ わたくしに そっくり！ ありがとう ございます。",
   "scrap": {
    "jp": "狐がコン、来ん",
    "html": "<ruby>狐<rt>きつね</rt></ruby>がコン、<ruby>来<rt>こ</rt></ruby>ん",
    "en": "The fox goes 'kon'… and won't come.",
    "note": "コン (a fox's cry) sounds like こん (won't come, in dialect)."
   },
   "trick": {
    "id": "vanish",
    "en": "vanishes in a swirl of leaves and reappears somewhere else",
    "say": [
     "きつねがこんこん",
     "きつねがこん",
     "狐がコン",
     "狐が来ん",
     "狐がこん"
    ]
   }
  }
 },
 "yamada": {
  "name": "山田さん",
  "role": "retired teacher, café regular",
  "core": false,
  "chats": [
   [
    {
     "say": "しんぶん、よむ？",
     "want": {
      "yes": "えらい ね。 まいにち すこし ずつ。",
      "no": "まいにち すこし ずつ で いい よ。",
      "any": "そうか、そうか。"
     }
    }
   ],
   [
    {
     "say": "いま、なんじ か わかる？",
     "want": {
      "time": "そう、ありがとう。",
      "number": "そう、ありがとう。",
      "dunno": "とけいを みて ごらん。",
      "any": "なるほど。"
     }
    }
   ],
   [
    {
     "say": "にほんごの べんきょう、たのしい？",
     "want": {
      "yes": "いい ね。 がんばって。",
      "no": "はじめは むずかしい よ。 ゆっくり ね。",
      "any": "ゆっくりで いい よ。"
     }
    }
   ]
  ],
  "again": "また あした。",
  "gift": {
   "sprite": "a_reading_chair_and_newspaper_rack",
   "en": "A reading chair and newspaper rack",
   "line": "わたしの いすと しんぶん たて。 どうぞ。"
  }
 },
 "yui": {
  "name": "ユイ",
  "role": "student, skater",
  "core": false,
  "chats": [
   [
    {
     "say": "やっほー！ スケボー、のれる？",
     "want": {
      "yes": "まじ！？ こんど いっしょに！",
      "no": "だいじょぶ、おしえる って！",
      "any": "へー！"
     }
    }
   ],
   [
    {
     "say": "その いぬ、めっちゃ かわいい じゃん！ なでて いい？",
     "want": {
      "yes": "やったー！",
      "no": "えー、ケチ！",
      "any": "かわいい〜！"
     }
    }
   ],
   [
    {
     "say": "ねえ、すきな いろ なに？",
     "want": {
      "any": "へー、いい じゃん！"
     }
    }
   ]
  ],
  "again": "じゃあ ね〜！",
  "gift": {
   "sprite": "a_skateboard_wall_rack",
   "en": "A skateboard wall rack",
   "line": "スケボーの ラック、あげる！ かざって ね！"
  }
 },
 "nemu": {
  "name": "ネムさん",
  "role": "night guard",
  "core": false,
  "chats": [
   [
    {
     "say": "ふぁ〜… よる、ねむい… あなたも？",
     "want": {
      "yes": "…なかま だ ね…",
      "no": "…いいな…",
      "any": "…ふぁ〜…"
     }
    }
   ],
   [
    {
     "say": "…ゾンビ、こわい？",
     "want": {
      "yes": "…ぼくも… ねむい けど…",
      "no": "…つよい ね…",
      "any": "…そっか…"
     }
    }
   ],
   [
    {
     "say": "…ねる まえ、なに のむ？",
     "want": {
      "any": "…ぼくは ホットミルク…"
     }
    }
   ]
  ],
  "again": "…おやすみ…",
  "gift": {
   "sprite": "a_kotatsu",
   "en": "A kotatsu",
   "line": "…こたつ… あったかい よ… あげる…",
   "extra": {
    "sprite": "the_fluffiest_futon_in_town",
    "en": "The fluffiest futon in town",
    "for": "hana",
    "line": "…あと、この ふとん… ふかふか すぎて おきられない… ハナさんに どう…？"
   }
  }
 },
 "kaneko": {
  "name": "金子さん",
  "role": "hardware store owner",
  "core": false,
  "chats": [
   [
    {
     "say": "なにか いる？",
     "want": {
      "any": "…ふん。 また こい。"
     }
    }
   ],
   [
    {
     "say": "ねじ、いくつ いる？ かずで いえ。",
     "want": {
      "number": "よし。 せいかく だ。",
      "any": "かずで いえ。"
     }
    }
   ],
   [
    {
     "say": "どうぐは だいじに して いるか？",
     "want": {
      "yes": "いい こころがけ だ。",
      "no": "…ばかもん。",
      "any": "…ふん。"
     }
    }
   ]
  ],
  "again": "…また こい。",
  "gift": {
   "sprite": "a_tool_wall",
   "en": "A tool wall",
   "line": "どうぐかけ だ。 だいじに しろ。",
   "extra": {
    "sprite": "a_brass_ship_s_bell",
    "en": "A brass ship's bell",
    "for": "gen",
    "line": "あと、この かね。 ふねの かね だ。 げんさんに どうだ。"
   }
  }
 },
 "mari": {
  "name": "マリさん",
  "role": "baker",
  "core": false,
  "chats": [
   [
    {
     "say": "おはよう〜！ パン、すき〜？",
     "want": {
      "yes": "でしょ〜！ やきたて だよ〜！",
      "no": "えっ、ほんと〜？ ひとくち たべて みて〜！",
      "any": "えへへ〜"
     }
    }
   ],
   [
    {
     "say": "まいあさ よじに おきる の〜！ はやい でしょ〜？",
     "want": {
      "yes": "でしょ〜！ でも たのしい の〜！",
      "no": "えへへ〜",
      "any": "えへへ〜"
     }
    }
   ],
   [
    {
     "say": "いちばん すきな パン、なに〜？",
     "want": {
      "any": "いいね〜！ こんど やくね〜！"
     }
    }
   ]
  ],
  "again": "また ね〜！",
  "gift": {
   "sprite": "a_bread_oven",
   "en": "A bread oven",
   "line": "パンの オーブン、あげる〜！"
  }
 },
 "daikichi": {
  "name": "大吉さん",
  "role": "greengrocer",
  "core": false,
  "chats": [
   [
    {
     "say": "らっしゃい！ トマト、いくつ？",
     "want": {
      "number": "まいど！ ひとつ おまけ だ！",
      "any": "かずで いって くれ！"
     }
    }
   ],
   [
    {
     "say": "やさい、まいにち たべてる か！？",
     "want": {
      "yes": "えらい！",
      "no": "だめだ！ たべろ！",
      "any": "たべろ たべろ！"
     }
    }
   ],
   [
    {
     "say": "あんたの いぬ、だいこん すき か？",
     "want": {
      "yes": "いい いぬ だ！",
      "no": "ざんねん！",
      "any": "ははは！"
     }
    }
   ]
  ],
  "again": "まいど！",
  "gift": {
   "sprite": "a_fruit_stand",
   "en": "A fruit stand",
   "line": "くだものの だい だ！ もってけ！"
  }
 },
 "daikichi_wife": {
  "name": "大吉さんの おくさん",
  "role": "grocer's wife",
  "core": false,
  "chats": [
   [
    {
     "say": "いらっしゃい。 きょうは なにを さがしてる の？",
     "want": {
      "any": "ゆっくり みて いって ね。"
     }
    }
   ],
   [
    {
     "say": "うちの ひと、こえが おおきい でしょ？",
     "want": {
      "yes": "ふふ、ごめん ね。",
      "no": "やさしい ね。",
      "any": "ふふ。"
     }
    }
   ],
   [
    {
     "say": "にんじん、すき？",
     "want": {
      "yes": "よかった。 あまい よ。",
      "no": "あら、そう。",
      "any": "ふふ。"
     }
    }
   ]
  ],
  "again": "まいど ありがとう。",
  "gift": {
   "sprite": "veg_crate",
   "en": "A vegetable crate",
   "line": "やさいの はこ。 つかって ね。"
  }
 },
 "sakura": {
  "name": "サクラさん",
  "role": "florist",
  "core": false,
  "chats": [
   [
    {
     "say": "…あ、こんにちは。",
     "want": {
      "greet": "…はい。 こんにちは。",
      "any": "…あ、はい。"
     }
    }
   ],
   [
    {
     "say": "…はな、すき です か？",
     "want": {
      "yes": "…よかった。",
      "no": "…そう ですか。",
      "any": "…あ、はい。"
     }
    }
   ],
   [
    {
     "say": "…どの いろの はなが すき？",
     "want": {
      "any": "…すてき です ね。"
     }
    }
   ]
  ],
  "again": "…また。",
  "gift": {
   "sprite": "a_flower_shelf",
   "en": "A flower shelf",
   "line": "…はなの たな です。 よかったら…"
  }
 },
 "tetsu": {
  "name": "鉄さん",
  "role": "ramen stall owner (Kansai)",
  "core": false,
  "chats": [
   [
    {
     "say": "まいど！ ラーメン、くう？",
     "want": {
      "yes": "よっしゃ！ めっちゃ うまいで！",
      "no": "なんでやねん！ こんど くうて や！",
      "any": "まいど！"
     }
    }
   ],
   [
    {
     "say": "からいの、いける？",
     "want": {
      "yes": "ほんま！？ つよい やん！",
      "no": "ほな、ふつうの に しとこか。",
      "any": "ほな！"
     }
    }
   ],
   [
    {
     "say": "あんた、どこから きたん？",
     "want": {
      "any": "ほー！ とおい とこから よう きたな！"
     }
    }
   ]
  ],
  "again": "ほな、また な！",
  "gift": {
   "sprite": "a_noodle_bar_counter",
   "en": "A noodle bar counter",
   "line": "ラーメンの カウンターや！ もってき！",
   "extra": {
    "sprite": "a_giant_curry_pot",
    "en": "A giant curry pot",
    "for": "mika",
    "line": "あと この カレーなべ… ミカちゃんに あげたって や。"
   }
  }
 },
 "yuri": {
  "name": "ユリママ",
  "role": "bar owner",
  "core": false,
  "chats": [
   [
    {
     "say": "あら、いらっしゃい。 うわさ、きいた？",
     "want": {
      "yes": "あら、はやい わね。",
      "no": "ふふ、ひみつ よ。",
      "any": "ふふ。"
     }
    }
   ],
   [
    {
     "say": "よる、まちで… ちいさい てが あるいてた ん だって。 しんじる？",
     "want": {
      "yes": "あら、すなお ね。",
      "no": "ふふ、わたしも よ。 …たぶん ね。",
      "any": "ふふ。"
     }
    }
   ],
   [
    {
     "say": "あなたは どうして この まちに きた の？",
     "want": {
      "any": "…ふうん。 いつか ゆっくり きかせて ね。"
     }
    }
   ]
  ],
  "again": "また いらっしゃい。",
  "gift": {
   "sprite": "a_jukebox",
   "en": "A jukebox",
   "line": "ジュークボックス、あげる。 たのしんで ね。",
   "extra": {
    "sprite": "an_old_dial_phone",
    "en": "An old dial phone",
    "for": "tanaka",
    "line": "それと この でんわ。 たなかさんが さがしてた わ。"
   }
  }
 },
 "mizuno": {
  "name": "水野さん",
  "role": "plumber",
  "core": false,
  "chats": [
   [
    {
     "say": "あ、あの… ふんすい、なおして… いや、なおそうと して… その…",
     "want": {
      "any": "…す、すみません！ いえ、だいじょうぶ です…"
     }
    }
   ],
   [
    {
     "say": "あの… みず、すき ですか？ ぼく… みずが すき で…",
     "want": {
      "yes": "で、ですよね！",
      "no": "あ… すみません…",
      "any": "あ、はい…"
     }
    }
   ],
   [
    {
     "say": "きんぎょ… かって ます。 ななひき…",
     "want": {
      "any": "…か、かわいい ですよ…"
     }
    }
   ]
  ],
  "again": "あ、また…！",
  "gift": {
   "sprite": "a_goldfish_tank",
   "en": "A goldfish tank",
   "line": "き、きんぎょばち… どうぞ…！"
  }
 },
 "mayor": {
  "name": "町長さん",
  "role": "mayor",
  "core": false,
  "chats": [
   [
    {
     "say": "この まちは いかが ですか？",
     "want": {
      "yes": "すばらしい！",
      "no": "これから もっと よく なります！",
      "any": "ほっほっほ。"
     }
    }
   ],
   [
    {
     "say": "まちの ボード、みましたか？",
     "want": {
      "yes": "けっこう！",
      "no": "ぜひ みて ください！",
      "any": "ほっほっほ。"
     }
    }
   ],
   [
    {
     "say": "あなたも まちの いちいん です！ うれしい ですか？",
     "want": {
      "yes": "ほっほっほ！",
      "no": "…いつか きっと！",
      "any": "ほっほっほ。"
     }
    }
   ]
  ],
  "again": "では、また！",
  "gift": {
   "sprite": "a_town_banner",
   "en": "A town banner",
   "line": "まちの はた です！ おうちに どうぞ！"
  }
 },
 "obachan": {
  "name": "たこ焼きの おばちゃん",
  "role": "festival stallholder",
  "core": false,
  "chats": [
   [
    {
     "say": "ほら、あんた！ たこやき、たべる？",
     "want": {
      "yes": "はい、あつい から きを つけて！",
      "no": "えー！ もったいない！",
      "any": "ほら ほら！"
     }
    }
   ],
   [
    {
     "say": "ちょっと てつだって くれる？",
     "want": {
      "yes": "えらい！ ありがと！",
      "no": "もう、しょうがない ね！",
      "any": "ほら！"
     }
    }
   ],
   [
    {
     "say": "おまつり、すき？",
     "want": {
      "yes": "でしょ！",
      "no": "うそ でしょ！",
      "any": "ははは！"
     }
    }
   ]
  ],
  "again": "また おいで！",
  "gift": {
   "sprite": "a_takoyaki_grill",
   "en": "A takoyaki grill",
   "line": "たこやきき！ もってって！"
  }
 },
 "kumada": {
  "name": "熊田さん",
  "role": "forest ranger",
  "core": false,
  "chats": [
   [
    {
     "say": "むかし この 山に、きつねが いた んじゃ。",
     "want": {
      "any": "…まあ、むかしの はなし じゃ。"
     }
    }
   ],
   [
    {
     "say": "くま、こわいか？",
     "want": {
      "yes": "…わしも じゃ。",
      "no": "…つよい のう。",
      "any": "…そうか。"
     }
    }
   ],
   [
    {
     "say": "きを ほるのが すき でな… みたいか？",
     "want": {
      "yes": "…ほれ、くまじゃ。",
      "no": "…そうか。",
      "any": "…ほれ。"
     }
    }
   ]
  ],
  "again": "…きを つけて な。",
  "gift": {
   "sprite": "a_carved_bear",
   "en": "A carved bear",
   "line": "わしが ほった くま じゃ。 やる。",
   "extra": {
    "sprite": "a_carved_wooden_fox",
    "en": "A carved wooden fox",
    "for": "kon",
    "line": "…それと、この きつね。 じんじゃの コンに あげて くれんか。"
   }
  }
 },
 "ken": {
  "name": "ケンさん",
  "role": "hiker",
  "core": false,
  "chats": [
   [
    {
     "say": "どこから きたの？",
     "want": {
      "any": "へえ！ いい ね！"
     }
    }
   ],
   [
    {
     "say": "やま、のぼる？",
     "want": {
      "yes": "いっしょに いこう！",
      "no": "たのしい よ！",
      "any": "へえ！"
     }
    }
   ],
   [
    {
     "say": "キャンプ、した こと ある？",
     "want": {
      "yes": "いい ね！",
      "no": "こんど やろう！",
      "any": "へえ！"
     }
    }
   ]
  ],
  "again": "またね！",
  "gift": {
   "sprite": "a_camping_tent_for_the_yard",
   "en": "A camping tent for the yard",
   "line": "テント あげる！ にわで キャンプ しよう！"
  }
 },
 "girl": {
  "name": "ハルちゃん",
  "role": "little girl",
  "core": false,
  "chats": [
   [
    {
     "say": "わんちゃん、なでて いい？",
     "want": {
      "yes": "やったー！ ふわふわ！",
      "no": "えー…",
      "any": "ふわふわ〜！"
     }
    }
   ],
   [
    {
     "say": "わんちゃんの なまえ、なに？",
     "want": {
      "any": "かわいい なまえ！"
     }
    }
   ],
   [
    {
     "say": "わたし、いぬに なりたい！ あなたは？",
     "want": {
      "yes": "いっしょ だ！",
      "no": "えー、なんで？",
      "any": "えへへ！"
     }
    }
   ]
  ],
  "again": "ばいばーい！",
  "gift": {
   "sprite": "dog_bed",
   "en": "A dog bed",
   "line": "いぬの ベッド！ わんちゃんに！"
  }
 }
};
