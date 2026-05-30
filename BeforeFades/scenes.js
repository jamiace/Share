"use strict";

/*
 * Before Fades Project - Pure scenario data
 * Scene flow and dialogue only. No asset registry, no DOM engine code.
 */
window.BEFORE_FADES_SCRIPT = (() => {
  const { META, ASSETS } = window.BF_CONFIG;
  const {
    scene,
    context,
    line,
    bg,
    withScene,
    music,
    sound,
    note,
    clearSprites,
    show,
    hide,
    effect,
    empathyUp,
    empathyDown,
    pause,
    jump,
    endGame,
    option,
    select,
    whenFlag,
    route
  } = window.BF_MACROS;

  const scenes = {
    start: [
      bg({
        id: "title",
        transition: "fade",
        waitAfter: 700,
        conversation: {
          layout: "choice",
          participants: [],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        },
        displayMode: "background",
        scene: "title"
      }),
      music({
        id: "title",
        volume: 0.35,
        loop: true,
        fade: 800
      }),
      scene({
        mode: "title",
        label: "Before Fades",
        value: "system",
        ui: "g",
        layout: "choice"
      }),
      select({
        prompt: "",
        options: [
          option({
            text: "開始遊戲",
            next: "opening_01"
          })
        ],
        choiceUi: {
          widthRatio: 0.5,
          textAlign: "center",
          fontScale: "title"
        }
      })
    ],
    opening_01: [
      scene({
        mode: "control",
        label: "老麵 / 後台控制",
        value: "mercer",
        ui: "g",
        layout: "group",
        participants: ["mercer", "cate", "remy", "ruri"]
      }),
      clearSprites(),
      bg({
        id: "control_room",
        transition: "fade",
        waitAfter: 700,
        displayMode: "background"
      }),
      music({
        id: "control",
        volume: 0.42,
        loop: true,
        fade: 900
      }),
      note({
        title: "CASE / STATUS",
        text: "距離正式開始：32分鐘\n地點：市中心展演空間\n場域：後台臨時指揮中心"
      }),
      sound({
        id: "audience_murmur",
        volume: 0.3
      }),
      line({
        text: "距離「傑米・詹，生前告別秀」正式開始，還有三十二分鐘。"
      }),
      line({
        text: "這裡不像傳統告別式。沒有罐頭塔，沒有輓聯，沒有誦經聲。取而代之的是冷灰色水泥牆、訂製香氛、半圓形排列的設計師單椅、巨大的 LED 螢幕，以及一支孤零零立在舞台中央的麥克風。"
      }),
      clearSprites(),
      bg({
        id: "white_rose",
        transition: "fade",
        waitAfter: 500,
        displayMode: "background"
      }),
      line({
        role: "mercer",
        text: "凱特，七號桌的白玫瑰，花瓣邊緣有一點點枯黃，去換掉。",
        position: "left"
      }),
      sound({
        id: "comm",
        volume: 0.42
      }),
      line({
        role: "cate",
        text: "麵老闆，你裝了鷹眼嗎？\n全場一百二十個座位，三百多朵花，你怎麼看見的？",
        position: "right"
      }),
      route({
        branches: [
          whenFlag("debug_final_screen", "final_screen")
        ]
      }),
      line({
        role: "mercer",
        text: "我不是鷹。\n我是這場夢的守門人。",
        expression: "serious",
        position: "left"
      }),
      line({
        role: "mercer",
        text: "守門人不能容忍任何一點瑕疵吵醒做夢的人。",
        expression: "serious",
        position: "left"
      }),
      line({
        role: "cate",
        text: "你這句話很帥，但我還是要說，變態。",
        position: "right"
      }),
      clearSprites(),
      bg({
        id: "control_room",
        transition: "fade",
        waitAfter: 1000,
        displayMode: "background"
      }),
      line({
        role: "remy",
        text: "音訊軌道已經確認。\n保證連他吞口水時喉結滾動的聲音，都有死亡的BASS感。",
        position: "left"
      }),
      line({
        role: "ruri",
        text: "很吵。",
        expression: "uneasy",
        position: "right"
      }),
      line({
        role: "remy",
        text: "我音量還沒推啊。",
        position: "left"
      }),
      line({
        role: "ruri",
        text: "不是聲音。\n是人。",
        expression: "empathy",
        position: "right"
      }),
      clearSprites(),
      select({
        prompt: "老麵先確認哪一項？",
        options: [
          option({
            text: "檢查監控與活動流程",
            next: "opening_investigate"
          }),
          option({
            text: "讓庭如先感受現場情緒",
            next: "empathy_01"
          })
        ],
        choiceUi: {
          widthRatio: 0.3,
          textAlign: "center",
          fontScale: "standard"
        }
      })
    ],
    opening_investigate: [
      scene({
        mode: "control",
        label: "老麵 / 調查",
        value: "mercer",
        ui: "g",
        layout: "duo",
        participants: ["mercer", "cate"]
      }),
      clearSprites(),
      bg({
        id: "control_room",
        transition: "fade",
        waitAfter: 300,
        displayMode: "background"
      }),
      sound({
        id: "monitor",
        volume: 0.45
      }),
      note({
        title: "MONITOR",
        text: "CAM01 主舞台：麥克風、高腳凳、LED待機\nCAM02 入口光廊：來賓陸續入場\nCAM03 媒體區：手機、相機、筆電待命\nCAM04 前排家屬席：悲傷得有些過於完整\nCAM05 高層區：低聲交談\nCAM08 休息室：傑米來回踱步"
      }),
      line({
        text: "十二格監控畫面持續跳動。\n每個人都以為舞台在前面，其實舞台到處都是。"
      }),
      clearSprites(),
      bg({
        id: "doc_rundown",
        transition: "fade",
        waitAfter: 10,
        displayMode: "document",
        documentTarget: "sidePanelExpandable",
        documentTitle: "演出 rundown 流程表"
      }),
      note({
        title: "RUN-DOWN",
        text: "19:00 黑白開場影片\n19:03 傑米登場\n19:05 地獄脫口秀\n19:24 真心告白\n19:30 【輪迴】系統發表\n備註：真心告白與【輪迴】發表之間，目前預設為立即切換。"
      }),
      line({
        role: "mercer",
        text: "最難的不是讓人哭。\n最難的是知道，眼淚掉下來的那一秒，你該不該把燈打亮。",
        expression: "serious",
        position: "left"
      }),
      bg({
        id: "doc_guest_list",
        transition: "fade",
        waitAfter: 10,
        displayMode: "document",
        documentTarget: "sidePanelExpandable",
        documentTitle: "生前告別秀來賓名單"
      }),
      note({
        title: "GUEST LIST",
        text: "奇點無限董事會：8人\n一級主管：12人\n財經記者：10人\n科技線記者：9人\n商業夥伴：26人\n朋友與舊識：31人\n前任與私人關係者：3人\n家屬席：公關部協調名單"
      }),
      line({
        role: "mercer",
        text: "一場告別式最麻煩的，不是死者。\n是所有還活著、卻各自帶著目的來的人。",
        position: "left"
      }),
      line({
        role: "cate",
        text: "麵老闆，傑米還在休息室裡繞圈圈。\n你再不去，他可能會把地板磨成馬賽克藝術。",
        position: "right"
      }),
      select({
        prompt: "接下來？",
        options: [
          option({
            text: "切換到庭如，共感現場空氣",
            next: "empathy_01"
          }),
          option({
            text: "老麵直接去傑米休息室",
            next: "jamie_room_01"
          })
        ],
        choiceUi: {
          widthRatio: 0.3,
          textAlign: "center",
          fontScale: "standard"
        }
      })
    ],
    empathy_01: [
      scene({
        mode: "empathy",
        label: "庭如 / 共感模式",
        value: "ruri",
        ui: "t",
        layout: "monologue",
        participants: ["ruri"]
      }),
      clearSprites(),
      bg({
        id: "control_room_dark",
        transition: "fade",
        waitAfter: 1000,
        displayMode: "background"
      }),
      music({
        id: "empathy",
        volume: 0.38,
        loop: true,
        fade: 900
      }),
      empathyUp(["期待", "好奇", "社交恐懼", "悲傷", "懷疑", "飢餓", "怕被忘記", "期待", "好奇", "社交恐懼", "悲傷", "懷疑", "飢餓", "怕被忘記"]),
      note({
        title: "EMPATHY",
        text: "庭如能感覺強烈情緒留下的形狀、溫度與方向。"
      }),
      line({
        text: "監控畫面變得模糊。\n人群不再是清楚的臉，而是一片片浮動的光斑。\n每個光斑裡，有不同顏色的詞浮上來，又慢慢沉下去。"
      }),
      line({
        role: "ruri",
        text: "入口那邊很亮。\n不是燈光的亮，是很多人在等煙火。",
        expression: "empathy",
        position: "left"
      }),
      line({
        role: "ruri",
        text: "可是煙火的中心，是一個快死的人。",
        expression: "uneasy",
        position: "left"
      }),
      line({
        role: "ruri",
        text: "前排有悲傷。\n可是形狀太整齊了，像排練過的雨。",
        expression: "empathy",
        position: "left"
      }),
      line({
        role: "ruri",
        text: "媒體區很餓。\n他們不是壞人，只是已經太習慣把人的痛，剪成一行可以被轉貼的文字。",
        expression: "uneasy",
        position: "left"
      }),
      line({
        role: "ruri",
        text: "高層那邊像會議室。\n有人擔心傑米失控，也有人擔心傑米不夠失控。\n最好是悲傷剛好，瘋狂剛好，熱搜也剛好。",
        expression: "empathy",
        position: "left"
      }),
      line({
        role: "ruri",
        text: "舞台中間很空。\n不是留白，比較像洞。",
        expression: "silent",
        position: "left"
      }),
      line({
        role: "ruri",
        text: "休息室那邊有一種很冷的恐懼。\n他不怕上台後的驚慌，是怕上台之後，自己還是會被忘記。",
        expression: "silent",
        position: "left"
      }),
      select({
        prompt: "庭如要對老麵說什麼？",
        options: [
          option({
            text: "前排的悲傷不太自然。",
            next: "empathy_alert",
            set: {
              ruri_alert: true
            }
          }),
          option({
            text: "傑米很怕。怕被忘記。",
            next: "empathy_sympathy",
            set: {
              ruri_sympathy: true
            }
          }),
          option({
            text: "先不要說，繼續觀察。",
            next: "empathy_silent",
            set: {
              ruri_observer: true
            }
          })
        ],
        choiceUi: {
          widthRatio: 0.3,
          textAlign: "center",
          fontScale: "standard"
        }
      })
    ],
    empathy_alert: [
      context({
        mode: "empathy"
      }),
      line({
        role: "ruri",
        text: "前排的悲傷不太自然。",
        expression: "empathy",
        position: "left",
        conversation: {
          layout: "duo",
          participants: ["ruri", "mercer"],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      line({
        role: "mercer",
        text: "我知道。\n公關部安排的人。",
        position: "right"
      }),
      line({
        role: "ruri",
        text: "所以他們不是家人？",
        position: "left"
      }),
      line({
        role: "mercer",
        text: "不全是。\n有時候一場儀式需要觀眾先相信，其他人才有辦法跟著相信。",
        position: "right"
      }),
      line({
        role: "ruri",
        text: "那如果他們跟著相信了假的東西呢？",
        position: "left"
      }),
      line({
        role: "mercer",
        text: "那就要看後面有沒有真的東西接住它。",
        position: "right"
      }),
      jump({
        next: "jamie_room_01"
      })
    ],
    empathy_sympathy: [
      context({
        mode: "empathy"
      }),
      line({
        role: "ruri",
        text: "傑米很怕。\n不是怕死而已，他怕大家以後不再需要他。",
        expression: "empathy",
        position: "left",
        conversation: {
          layout: "duo",
          participants: ["ruri", "mercer"],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      line({
        role: "mercer",
        text: "怕不代表不能上台。\n有時候，怕才是他必須上台的原因。",
        position: "right"
      }),
      line({
        role: "ruri",
        text: "你真的相信這句話嗎？",
        position: "left"
      }),
      line({
        role: "mercer",
        text: "我現在需要相信。",
        expression: "silent",
        position: "right"
      }),
      jump({
        next: "jamie_room_01"
      })
    ],
    empathy_silent: [
      context({
        mode: "empathy"
      }),
      line({
        role: "ruri",
        text: "沒事。\n我想再看一下。",
        expression: "silent",
        position: "left",
        conversation: {
          layout: "duo",
          participants: ["ruri", "mercer"],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      line({
        role: "mercer",
        text: "妳的沒事通常都很有事。\n如果妳看到什麼會讓今晚出事的東西，記得要說出來。",
        expression: "serious",
        position: "right"
      }),
      line({
        role: "ruri",
        text: "如果出事的是今晚本身呢？",
        expression: "uneasy",
        position: "left"
      }),
      line({
        text: "老麵沒有立刻回答。"
      }),
      jump({
        next: "jamie_room_01"
      })
    ],
    jamie_room_01: [
      scene({
        mode: "jamie_room",
        label: "老麵 / 傑米休息室",
        value: "mercer",
        ui: "g",
        layout: "monologue",
        participants: ["jamie"]
      }),
      clearSprites(),
      bg({
        id: "jamie_room",
        transition: "fade",
        waitAfter: 700,
        displayMode: "background"
      }),
      music({
        id: "jamie_room",
        volume: 0.42,
        loop: true,
        fade: 900
      }),
      sound({
        id: "door",
        volume: 0.45
      }),
      show({
        id: "jamie",
        expression: "nervous",
        position: "left",
        speakerFocus: "primary"
      }),
      note({
        title: "ROOM",
        text: "物件：威士忌、藥瓶、診斷摘要、筆電、手寫講稿\n狀態：傑米反覆摩擦袖口"
      }),
      line({
        text: "傑米站在鏡子前。\n他的黑色西裝完美得像一個答案，但他的手指反覆摩擦袖口，像在確認自己還沒有散掉。"
      }),
      line({
        role: "jamie",
        text: "你說，我是不是瘋了？",
        expression: "nervous",
        position: "left"
      }),
      select({
        prompt: "老麵要怎麼回答？",
        options: [
          option({
            text: "如果這是產品發表，風險很高；如果這是你人生最後一次登場，它很精準。",
            next: "jamie_answer_professional",
            set: {
              mercer_executor: true
            }
          }),
          option({
            text: "你不是瘋了，你只是還不能接受自己真的會死。",
            next: "jamie_answer_human",
            set: {
              mercer_protector: true
            }
          }),
          option({
            text: "你確實在騙人。但你也確實在說真話。今晚麻煩的是，兩者都是真的。",
            next: "jamie_answer_cruel",
            set: {
              mercer_doubt: true
            }
          })
        ],
        choiceUi: {
          widthRatio: 0.9,
          textAlign: "center",
          fontScale: "standard"
        }
      })
    ],
    jamie_answer_professional: [
      context({
        mode: "jamie_room"
      }),
      line({
        role: "mercer",
        text: "如果這是產品發表，風險很高。 \n如果這是你人生最後一次登場，它很精準。",
        expression: "serious",
        position: "right",
        conversation: {
          layout: "duo",
          participants: ["mercer", "jamie"],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      line({
        role: "jamie",
        text: "精準。\n我都快死了，你還在跟我講精準。",
        expression: "nervous",
        position: "left"
      }),
      line({
        role: "mercer",
        text: "你找我的原因，不就是因為你不想讓自己死得模糊嗎？",
        position: "right"
      }),
      line({
        role: "jamie",
        text: "對。\n我討厭模糊。\n死亡就是最模糊的東西。",
        expression: "nervous",
        position: "left"
      }),
      jump({
        next: "jamie_room_investigate"
      })
    ],
    jamie_answer_human: [
      context({
        mode: "jamie_room"
      }),
      line({
        role: "mercer",
        text: "你不是瘋了。\n你只是還不能接受自己真的會死。",
        position: "right",
        conversation: {
          layout: "duo",
          participants: ["mercer", "jamie"],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      line({
        text: "傑米沉默。\n他拿起杯子，卻沒有喝。"
      }),
      line({
        role: "jamie",
        text: "你這樣講很不專業。\n可是比專業有用。",
        expression: "nervous",
        position: "left"
      }),
      sound({
        id: "glass",
        volume: 0.42
      }),
      jump({
        next: "jamie_room_investigate"
      })
    ],
    jamie_answer_cruel: [
      context({
        mode: "jamie_room"
      }),
      line({
        role: "mercer",
        text: "你確實在騙人。\n但你也確實在說真話。\n今晚麻煩的是，兩者都是真的。",
        position: "right",
        conversation: {
          layout: "duo",
          participants: ["mercer", "jamie"],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      line({
        role: "jamie",
        text: "你知道嗎？這就是我喜歡你的地方。\n你安慰人的方式，就像在拿手術刀剝橘子。",
        expression: "nervous",
        position: "left"
      }),
      line({
        role: "mercer",
        text: "那你最好慶幸，我的手還算穩。",
        expression: "serious",
        position: "right"
      }),
      jump({
        next: "jamie_room_investigate"
      })
    ],
    jamie_room_investigate: [
      context({
        mode: "jamie_room"
      }),
      line({
        role: "jamie",
        text: "我上一次這麼緊張，是大學第一次約女生看電影。\n那次我只是怕搞砸一場約會，這次我怕我搞砸的是我自己的人生。",
        expression: "nervous",
        position: "left",
        conversation: {
          layout: "group",
          participants: ["jamie", "mercer", "remy"],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      line({
        role: "jamie",
        text: "我是第一次上台讓大家看我死。\n而且更爛的是，我還要說服他們，這不是死，是升級。",
        expression: "nervous",
        position: "left"
      }),
      note({
        title: "藥瓶",
        text: "劑量、頻率、醫囑都真實得讓人無法把今晚單純當成表演。"
      }),
      line({
        role: "mercer",
        text: "今天吃藥了嗎？",
        expression: "serious",
        position: "right"
      }),
      line({
        role: "jamie",
        text: "吃了。\n放心，我不會在台上倒下。\n至少不會在輪迴發表前。",
        expression: "nervous",
        position: "left"
      }),
      bg({
        id: "doc_medical_report",
        transition: "fade",
        waitAfter: 10,
        displayMode: "document",
        documentTarget: "sidePanelExpandable",
        documentTitle: "傑米的診斷摘要"
      }),
      note({
        title: "診斷摘要",
        text: "罕見神經退化疾病。\n不可逆。\n目前治療以延緩惡化與緩解症狀為主。\n預估剩餘時間：不足一年。"
      }),
      line({
        role: "jamie",
        text: "我第一次看到那張紙的時候，第一個想法不是我會死。\n我想的是，這份文件排版很爛。\n然後我才開始發抖。",
        expression: "nervous",
        position: "left"
      }),
      bg({
        id: "doc_reincarnation_pitch",
        transition: "fade",
        waitAfter: 10,
        displayMode: "document",
        documentTarget: "sidePanelExpandable",
        documentTitle: "【輪迴】產品簡報頁"
      }),
      note({
        title: "REINCARNATION / 輪迴",
        text: "人格掃描、記憶建模、決策延續。\n肉體會終止，意志不必。"
      }),
      line({
        role: "mercer",
        text: "這句文案有一種邪教的意味了。",
        position: "right"
      }),
      line({
        role: "jamie",
        text: "所有偉大的科技，在剛開始看起來都像邪教。\n也可能只是邪教，所以我才需要先死一次，讓大家閉嘴。",
        expression: "nervous",
        position: "left"
      }),
      bg({
        id: "doc_jamie_script",
        transition: "fade",
        waitAfter: 10,
        displayMode: "document",
        documentTarget: "sidePanelExpandable",
        documentTitle: "傑米手寫脫口秀講稿"
      }),
      note({
        title: "地獄脫口秀講稿",
        text: "前半段幾乎都是刀。每一句都帶著笑點，也帶著一點血。\n後半段留下：我希望你們記得，今天晚上，這個有點緊張，說了很多爛笑話，而且非常非常害怕被忘記的，詹傑明。"
      }),
      line({
        role: "mercer",
        text: "很好，這段不要改。",
        expression: "serious",
        position: "right"
      }),
      line({
        role: "jamie",
        text: "我覺得太軟了。",
        expression: "nervous",
        position: "left"
      }),
      line({
        role: "mercer",
        text: "所以不要改。",
        expression: "serious",
        position: "right"
      }),
      line({
        role: "jamie",
        text: "你真煩。",
        expression: "nervous",
        position: "left"
      }),
      sound({
        id: "comm",
        volume: 0.45
      }),
      hide({
        id: "mercer"
      }),
      hide({
        id: "jamie"
      }),
      line({
        role: "remy",
        text: "倒數十分鐘。\n主舞台已經準備好讓人類文明開始丟臉了。",
        position: "right"
      }),
      hide({
        id: "remy"
      }),
      line({
        role: "jamie",
        text: "如果等一下我在台上後悔了呢？",
        expression: "nervous",
        position: "left"
      }),
      line({
        role: "mercer",
        text: "那你就看著我。我會提醒你，你當初為什麼要做這件事。",
        expression: "serious",
        position: "right"
      }),
      line({
        role: "jamie",
        text: "如果我還是想逃？",
        expression: "nervous",
        position: "left"
      }),
      line({
        role: "mercer",
        text: "那我會讓燈暗下來。\n不是放你走，是讓你至少逃得有美感。",
        expression: "silent",
        position: "right"
      }),
      line({
        role: "jamie",
        text: "你們 Before Fades 真的有病。",
        expression: "nervous",
        position: "left"
      }),
      line({
        role: "mercer",
        text: "所以你才找我們，不是嗎？。",
        position: "right"
      }),
      line({
        role: "jamie",
        text: "好。\n讓他們看看，我要連死亡，都比他們活著更精彩。",
        expression: "nervous",
        position: "left"
      }),
      clearSprites(),
      jump({
        next: "case_file_01"
      })
    ],
    case_file_01: [
      scene({
        mode: "case_file",
        label: "庭如 / 案件資料",
        value: "ruri",
        ui: "g",
        layout: "group",
        participants: ["cate", "remy", "ruri", "mercer"]
      }),
      clearSprites(),
      bg({
        id: "case_file",
        transition: "fade",
        waitAfter: 700,
        displayMode: "background"
      }),
      music({
        id: "case_file",
        volume: 0.36,
        loop: true,
        fade: 900
      }),
      clearSprites(),
      bg({
        id: "doc_case_report",
        transition: "fade",
        waitAfter: 10,
        displayMode: "document",
        documentTarget: "sidePanelExpandable",
        documentTitle: "Before Fades 案件封存報告"
      }),
      note({
        title: "CASE 001",
        text: "傑米・詹 / 生前告別秀\n資料：接案會議紀錄、訪談錄音、庭如筆記、輪迴企劃摘要、地獄脫口秀講稿草稿"
      }),
      line({
        text: "庭如坐在控制室角落。她沒有看舞台，而是打開三個月前的資料。有些事情，不是因為即將發生才重要，而是因為在很久以前，大家就已經選擇讓它發生。",
        character: "ruri",
        speakerFocus: "primary",
        presence: "onscreen"
      }),
      note({
        title: "接案會議紀錄",
        text: "凱特：這層層疊疊的結構，簡直是藝術品。\n雷老師：用自己的命幫公司股價抬轎，狠得很有創意。\n庭如：我們不能接。\n老麵：什麼是真實？"
      }),
      clearSprites(),
      line({
        role: "cate_past",
        text: "用一場真實的告別，去包裝一場商業發表會，再用這場發表會，去掩蓋死亡的真相？\n這層層疊疊的結構，簡直是藝術品。",
        position: "left"
      }),
      line({
        role: "remy_past",
        text: "用自己的命幫公司股價抬轎，狠得很有創意。\n我先聲明，我已經想到 BGM 了。",
        position: "right"
      }),
      hide({
        id: "cate"
      }),
      hide({
        id: "remy"
      }),
      line({
        role: "ruri_past",
        text: "我們不能接。",
        position: "left"
      }),
      line({
        role: "mercer_past",
        text: "理由是？",
        position: "right"
      }),
      line({
        role: "ruri_past",
        text: "我們的工作，是陪伴和轉譯真實的情感。\n但這個案子裡，真實的情感被當成商業佈局的誘餌。\n我感覺不到溫度，只有一種很冷的東西。像是把悲傷磨尖，再交給媒體。",
        expression: "silent",
        position: "left"
      }),
      line({
        role: "mercer_past",
        text: "什麼是真實？傑米正在真實地走向死亡，這是核心。\n他想被世界記住的樣子，就是一個至死都在顛覆傳統、化不可能為可能的狂人。",
        position: "right"
      }),
      line({
        role: "ruri_past",
        text: "可是如果他的真實，會傷害其他人的真實呢？",
        expression: "uneasy",
        position: "left"
      }),
      line({
        role: "mercer_past",
        text: "那就是我們要承擔的風險。",
        expression: "serious",
        position: "right"
      }),
      line({
        text: "庭如看著那行會議紀錄。\n那時候她以為自己已經夠堅持了。\n現在回頭看，她只覺得還不夠。"
      }),
      clearSprites(),
      note({
        title: "訪談錄音 03",
        text: "標記詞：贏 / 父親 / 公司 / 前任 / 靈魂 / 被遺忘\n庭如將依序回溯這些詞。"
      }),
      jump({
        next: "case_memory_win"
      })
    ],
    case_memory_win: [
      context({
        mode: "memory"
      }),
      clearSprites({
        conversation: {
          layout: "voiceover",
          participants: [],
          voiceOnlyParticipants: ["none"],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      empathyUp(["贏", "火災", "停不下來", "存在", "贏", "火災", "停不下來", "存在", "贏", "火災", "停不下來", "存在"]),
      line({
        text: "他說「贏」的時候，聲音很亮。"
      }),
      line({
        text: "但亮的東西不一定是太陽，也可能是火災。"
      }),
      line({
        text: "他說自己贏過競爭對手，贏過市場，贏過投資人，贏過所有說他瘋了的人。\n可是在那個字的底下，庭如聽見另一個更小的聲音。"
      }),
      line({
        speaker: "錄音中的傑米",
        text: "我不是想證明他們錯。",
        leaveAfter: true
      }),
      line({
        speaker: "錄音中的傑米",
        text: "我是想證明我存在。",
        leaveAfter: true
      }),
      jump({
        next: "case_memory_father"
      })
    ],
    case_memory_father: [
      context({
        mode: "memory"
      }),
      clearSprites({
        conversation: {
          layout: "voiceover",
          participants: [],
          voiceOnlyParticipants: ["none"],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      bg({
        id: "cg_memory_phone",
        transition: "fade",
        waitAfter: 1000,
        displayMode: "bg"
      }),
      empathyDown(["父親", "未撥出的電話", "病房", "以為還有時間", "父親", "未撥出的電話", "病房", "以為還有時間"]),
      line({
        text: "父親這個詞很重。\n不是濃烈的悲傷，而是一支手機被拿起來，又放下。"
      }),
      line({
        text: "一通電話存在過，但沒有被撥出去。\n庭如看見病房白色的牆，看見傑米站在電梯裡，手機螢幕亮著，會議提醒跳出來。"
      }),
      line({
        text: "很多人的人生都是這樣壞掉的。\n不是因為不愛，是因為以為還有時間。"
      }),
      line({
        speaker: "錄音中的傑米",
        text: "我爸最後一次清醒的時候，我還在開會。",
        leaveAfter: true
      }),
      line({
        speaker: "錄音中的傑米",
        text: "那場會議，到後來其實沒有那麼重要了。",
        leaveAfter: true
      }),
      jump({
        next: "case_memory_company"
      })
    ],
    case_memory_company: [
      context({
        mode: "memory"
      }),
      clearSprites({
        conversation: {
          layout: "voiceover",
          participants: [],
          voiceOnlyParticipants: ["none"],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      empathyUp(["公司", "王國", "墳墓", "財報", "公司", "王國", "墳墓", "財報", "公司", "王國", "墳墓", "財報"]),
      bg({
        id: "doc_internal_mail",
        transition: "fade",
        waitAfter: 10,
        displayMode: "document",
        documentTarget: "sidePanelExpandable",
        documentTitle: "奇點無限內部危機 mail"
      }),
      line({
        text: "公司不是公司。\n在傑米心裡，它像一座王國。"
      }),
      line({
        text: "但不是因為他想當國王，而是因為王國倒下時，沒有人會忘記它曾經存在。"
      }),
      line({
        text: "他把公司蓋得越大，就越像在替自己蓋一座不會倒的墳。"
      }),
      line({
        speaker: "錄音中的傑米",
        text: "我用盡一生打造一個王國。",
        leaveAfter: true
      }),
      line({
        speaker: "錄音中的傑米",
        text: "但我好像從來沒有時間，看看王國裡的風景。",
        leaveAfter: true
      }),
      jump({
        next: "case_memory_ex"
      })
    ],
    case_memory_ex: [
      context({
        mode: "memory"
      }),
      clearSprites({
        conversation: {
          layout: "voiceover",
          participants: [],
          voiceOnlyParticipants: ["none"],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      empathyUp(["前任", "被愛過的版本", "不是混蛋", "電影票", "前任", "被愛過的版本", "不是混蛋", "電影票", "前任", "被愛過的版本", "不是混蛋", "電影票"]),
      bg({
        id: "doc_voice_wave",
        transition: "fade",
        waitAfter: 10,
        displayMode: "document",
        documentTarget: "sidePanelExpandable",
        documentTitle: "訪談錄音波形畫面"
      }),
      line({
        text: "前任這個詞裡沒有得意。\n有一點羞恥，一點懷念，還有一個很小、很舊的自己。"
      }),
      line({
        text: "那個自己還不是傳奇，還沒有被財經雜誌叫作下一個誰。\n還會在約會前緊張，還會把電影票捏皺。"
      }),
      line({
        text: "庭如感覺到：傑米不是懷念那些人。\n他懷念的是，那些人曾經愛過一個還不需要表演的他。"
      }),
      line({
        speaker: "錄音中的傑米",
        text: "她們在我還不是混蛋的時候愛過我。",
        leaveAfter: true
      }),
      line({
        speaker: "錄音中的傑米",
        text: "這很珍貴。\n也很不幸，因為後來我確實變成了混蛋。",
        leaveAfter: true
      }),
      jump({
        next: "case_memory_soul"
      })
    ],
    case_memory_soul: [
      context({
        mode: "memory"
      }),
      clearSprites({
        conversation: {
          layout: "voiceover",
          participants: [],
          voiceOnlyParticipants: ["none"],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      bg({
        id: "cg_reincarnation_boot",
        transition: "fade",
        waitAfter: 1000,
        displayMode: "bg"
      }),
      empathyUp(["靈魂", "資料", "名字", "詹傑明", "靈魂", "資料", "名字", "詹傑明"]),
      line({
        text: "他說的是科技：\n掃描、建模、人格延續、決策模擬。"
      }),
      line({
        text: "可庭如聽到的不是科技，而是一個孩子站在空房間裡問：\n如果我不在了，你們還會不會知道我怎麼笑？"
      }),
      line({
        text: "傑米說想留下靈魂。\n但他真正想留下的，好像不是資料，是有人還能像以前那樣，叫他的名字。\n不是傑米・詹，是詹傑明。"
      }),
      line({
        speaker: "錄音中的傑米",
        text: "我想留下的不是身體。",
        leaveAfter: true
      }),
      line({
        speaker: "錄音中的傑米",
        text: "我想留下的是，他們還能知道我是誰。",
        leaveAfter: true
      }),
      jump({
        next: "case_memory_forgotten"
      })
    ],
    case_memory_forgotten: [
      context({
        mode: "memory"
      }),
      clearSprites({
        conversation: {
          layout: "voiceover",
          participants: [],
          voiceOnlyParticipants: ["none"],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      bg({
        id: "doc_media_news",
        transition: "fade",
        waitAfter: 10,
        displayMode: "document",
        documentTarget: "sidePanelExpandable",
        documentTitle: "媒體新聞網站畫面"
      }),
      empathyDown(["被遺忘", "冷", "消失", "不再被需要", "被遺忘", "冷", "消失", "不再被需要", "被遺忘"]),
      line({
        text: "這裡很冷。不是死亡的冷。是世界繼續往前走，沒有人再提起你的冷。"
      }),
      line({
        text: "今天還有人為你哭。明天有人發文紀念你。一週後，大家開始談下一個新聞。一年後，你的名字變成一個案例。"
      }),
      line({
        text: "十年後，有人搜尋你，只是為了寫一篇「曾經改變 AI 產業的十個人」。"
      }),
      line({
        speaker: "錄音中的傑米",
        text: "人不是死掉才消失。",
        leaveAfter: true
      }),
      line({
        speaker: "錄音中的傑米",
        text: "人是在不再被需要的時候，開始消失。",
        leaveAfter: true
      }),
      jump({
        next: "case_note_choice"
      })
    ],
    case_note_choice: [
      context({
        mode: "case_file"
      }),
      select({
        prompt: "庭如在筆記中寫下了一句話。",
        options: [
          option({
            text: "他想利用死亡。",
            next: "rundown_choice",
            set: {
              ruri_ethics: true
            }
          }),
          option({
            text: "他害怕死亡。",
            next: "rundown_choice",
            set: {
              ruri_sympathy: true
            }
          }),
          option({
            text: "這兩件事都是真的。",
            next: "rundown_choice",
            set: {
              ruri_paradox: true
            }
          }),
          option({
            text: "他只是不想要消失。",
            next: "rundown_choice",
            set: {
              ruri_sympathy: true,
              ruri_paradox: true
            }
          })
        ],
        conversation: {
          layout: "choice",
          participants: [],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        },
        choiceUi: {
          widthRatio: 0.3,
          textAlign: "center",
          fontScale: "standard"
        }
      })
    ],
    rundown_choice: [
      scene({
        mode: "control",
        label: "老麵 / 演出流程確認",
        value: "mercer",
        ui: "g",
        layout: "choice"
      }),
      clearSprites(),
      bg({
        id: "control_room",
        transition: "fade",
        waitAfter: 700,
        displayMode: "background"
      }),
      music({
        id: "control",
        volume: 0.36,
        loop: true,
        fade: 800
      }),
      clearSprites(),
      bg({
        id: "doc_rundown",
        transition: "fade",
        waitAfter: 10,
        displayMode: "document",
        documentTarget: "sidePanelExpandable",
        documentTitle: "演出 rundown 流程表"
      }),
      note({
        title: "RUN-DOWN / CRITICAL CUE",
        text: "19:24 真心告白\n19:30 【輪迴】系統發表\n目前預設：立即切換"
      }),
      line({
        text: "老麵看著那行字：「立即切入」。\n它代表在傑米最像人的那一刻，立刻把他推回產品。\n它代表這場告別會非常有效，也可能非常殘忍。"
      }),
      select({
        prompt: "真心告白與【輪迴】發表之間，要留下多少沉默？",
        options: [
          option({
            text: "立即切換。\n情緒最高點，就是產品發表的最佳切入點。",
            next: "opening_video",
            set: {
              silence: 0,
              mercer_executor: true
            }
          }),
          option({
            text: "留三秒。 讓現場吸收一下，但不要讓氣氛散掉。",
            next: "opening_video",
            set: {
              silence: 3,
              mercer_balance: true
            }
          }),
          option({
            text: "留七秒。 至少讓那段真話，先像真話一樣存在。",
            next: "opening_video",
            set: {
              silence: 7,
              mercer_protector: true
            }
          }),
          option({
            text: "詢問傑米。 這不是技術問題，是他的人生。",
            next: "ask_jamie_silence",
            set: {
              silence: 0,
              ask_jamie: true
            }
          })
        ],
        choiceUi: {
          widthRatio: 0.6,
          textAlign: "center",
          fontScale: "standard"
        }
      })
    ],
    ask_jamie_silence: [
      context({
        mode: "control"
      }),
      sound({
        id: "comm",
        volume: 0.45,
        conversation: {
          layout: "group",
          participants: ["mercer", "jamie", "ruri"],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      line({
        role: "mercer",
        text: "傑米。\n真心告白後，要不要留一段沉默？",
        expression: "silent",
        position: "left"
      }),
      line({
        role: "jamie",
        text: "不要浪費眼淚！\n眼淚要在最有用的時候發光。\n直接切！",
        expression: "nervous",
        position: "center"
      }),
      line({
        role: "mercer",
        text: "收到。",
        position: "left"
      }),
      line({
        role: "ruri",
        text: "……",
        position: "right"
      }),
      jump({
        next: "opening_video"
      })
    ],
    opening_video: [
      scene({
        mode: "control",
        label: "主舞台 / 開場影片",
        value: "system",
        ui: "g",
        layout: "voiceover",
        voiceOnly: ["none"]
      }),
      clearSprites(),
      bg({
        id: "young_jamie_video",
        transition: "fade",
        waitAfter: 1000,
        displayMode: "bg"
      }),
      music({
        id: "title",
        volume: 0.3,
        loop: true,
        fade: 900
      }),
      note({
        title: "REC",
        text: "黑白影像 / 年輕傑米 / 創業初期錄影"
      }),
      line({
        text: "LED 螢幕亮起。\n黑白影像帶著老式錄影機雜訊。\n年輕的傑米坐在鏡頭前，二十出頭，笑起來有點不知所措。"
      }),
      line({
        speaker: "年輕傑米",
        text: "嗨……如果有人看到這段影片，那大概代表我……\n呃，創業成功了？或是失敗得很徹底。",
        leaveAfter: true
      }),
      line({
        speaker: "年輕傑米",
        text: "我叫詹傑明，大家可以叫我傑米。\n我有一個夢想。我希望有一天，科技可以幫助我們留住我們所愛的人。",
        leaveAfter: true
      }),
      line({
        speaker: "年輕傑米",
        text: "不是留住他們的身體，是留住他們的靈魂。\n他們的思想，他們講笑話的爛品味，他們明明很煩可是你還是會想念的那些小習慣。",
        leaveAfter: true
      }),
      line({
        speaker: "年輕傑米",
        text: "如果未來的我真的做到這件事，我希望你不要忘記一開始為什麼想做。\n不是為了要贏，也不是為了變有錢，是因為失去一個人，那真的很痛。",
        leaveAfter: true
      }),
      line({
        text: "影像停格。\n雜訊。\n螢幕暗下。"
      }),
      jump({
        next: "showtime_01"
      })
    ],
    showtime_01: [
      scene({
        mode: "stage",
        label: "老麵 / 舞台監控",
        value: "mercer",
        ui: "j",
        layout: "stage-with-backstage-monitor",
        participants: ["jamie", "ruri"]
      }),
      clearSprites(),
      bg({
        id: "stage_dark",
        transition: "fade",
        waitAfter: 700,
        displayMode: "background"
      }),
      music({
        id: "showtime",
        volume: 0.44,
        loop: true,
        fade: 900
      }),
      show({
        id: "jamie",
        expression: "nervous",
        position: "center",
        speakerFocus: "primary",
        allowedSceneMode: ["stage", "confession", "reincarnation"]
      }),
      sound({
        id: "mic",
        volume: 0.55
      }),
      line({
        role: "jamie",
        text: "嗨，大家好。\n我是傑米。\n感謝你們今天來參加這場……不是追思會、不是告別式，而是我人生最後一場售票演出。",
        expression: "confession",
        position: "center"
      }),
      line({
        role: "jamie",
        text: "雖然你們沒付錢。\n真不意外。",
        expression: "confession",
        position: "center"
      }),
      effect({
        name: "shake",
        target: "game"
      }),
      line({
        text: "全場死寂。\n那一秒，像是笑聲還沒拿到入場證。"
      }),
      line({
        role: "ruri",
        text: "困惑上升。\n前排有一點憤怒。\n媒體區……更興奮了。",
        expression: "empathy",
        position: "left"
      }),
      clearSprites(),
      select({
        prompt: "第一個地獄梗後，老麵如何處理現場尷尬？",
        options: [
          option({
            text: "保持沉默，讓尷尬自己發酵。",
            next: "showtime_silence",
            set: {
              natural_laugh: true
            }
          }),
          option({
            text: "加入極低頻音效，把尷尬變成表演感。",
            next: "showtime_lowfreq",
            set: {
              controlled_laugh: true
            }
          }),
          option({
            text: "切觀眾反應鏡頭，讓笑聲更快擴散。",
            next: "showtime_camera",
            set: {
              camera_reaction: true
            }
          }),
          option({
            text: "降低 BGM，讓傑米的聲音更赤裸。",
            next: "showtime_raw",
            set: {
              raw_voice: true
            }
          })
        ],
        choiceUi: {
          widthRatio: 0.5,
          textAlign: "center",
          fontScale: "standard"
        }
      })
    ],
    showtime_silence: [
      context({
        mode: "stage"
      }),
      line({
        text: "老麵沒有讓任何音軌進來。\n三秒。那三秒長得像一場小型墜樓。\n然後後排有人笑了，第二個人跟上，第三個人跟上。笑聲像火星，落在乾草上。",
        conversation: {
          layout: "narrative",
          participants: [],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      sound({
        id: "awkward_laugh",
        volume: 0.5
      }),
      jump({
        next: "showtime_jokes"
      })
    ],
    showtime_lowfreq: [
      scene({
        mode: "stage",
        label: "舞台 / 後台監看",
        ui: "j",
        layout: "stage-with-backstage-monitor",
        participants: ["jamie", "ruri", "mercer"]
      }),
      line({
        text: "很低的聲音進入空氣，幾乎聽不見，但現場的尷尬突然有了形狀。\n大家意識到，自己正在被允許進入一場表演。",
        conversation: {
          layout: "stage-with-backstage-monitor",
          participants: ["ruri", "mercer"],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      line({
        role: "ruri",
        text: "操控感變強了。",
        position: "left"
      }),
      line({
        role: "mercer",
        text: "是舞台感。",
        position: "right"
      }),
      line({
        role: "ruri",
        text: "我知道，所以我說操控感。",
        expression: "uneasy",
        position: "left"
      }),
      hide({
        id: "ruri"
      }),
      hide({
        id: "mercer"
      }),
      jump({
        next: "showtime_jokes"
      })
    ],
    showtime_camera: [
      context({
        mode: "stage"
      }),
      bg({
        id: "cg_audience_laugh",
        transition: "fade",
        waitAfter: 300,
        displayMode: "bg"
      }),
      line({
        text: "側邊螢幕短暫帶到觀眾表情。\n有人震驚，有人憋笑，有人不知道該不該笑。\n正是這種不知道，讓笑聲找到出口。",
        conversation: {
          layout: "narrative",
          participants: [],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      sound({
        id: "awkward_laugh",
        volume: 0.5
      }),
      jump({
        next: "showtime_jokes"
      })
    ],
    showtime_raw: [
      scene({
        mode: "stage",
        label: "舞台 / 後台監看",
        ui: "j",
        layout: "stage-with-backstage-monitor",
        participants: ["jamie", "ruri"]
      }),
      line({
        text: "BGM 被推到更遠。\n傑米的聲音變得非常清楚，清楚到每個人都無法假裝那只是段子。\n笑聲比較少，但每一個笑聲都帶著不安。",
        conversation: {
          layout: "monologue",
          participants: ["ruri"],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      line({
        role: "ruri",
        text: "他聽起來有一點孤單。",
        position: "left"
      }),
      hide({
        id: "ruri"
      }),
      jump({
        next: "showtime_jokes"
      })
    ],
    showtime_jokes: [
      scene({
        mode: "stage",
        label: "舞台 / 脫口秀",
        ui: "j",
        layout: "stage-with-backstage-monitor",
        participants: ["jamie", "cate", "remy", "ruri", "mercer"]
      }),
      line({
        role: "jamie",
        text: "這是我人生最後一次，合法講幹話不用上法院。",
        expression: "nervous",
        position: "center",
        conversation: {
          layout: "stage-with-backstage-monitor",
          participants: ["jamie", "cate", "remy", "ruri", "mercer"],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      sound({
        id: "awkward_laugh",
        volume: 0.45
      }),
      bg({
        id: "stage_show",
        transition: "fade",
        waitAfter: 300,
        displayMode: "background"
      }),
      show({
        id: "jamie",
        expression: "show",
        position: "center"
      }),
      line({
        role: "jamie",
        text: "醫生說我還有一年。\n我說，不用那麼久，這世界爛到我自己都不想撐滿這學期了。",
        expression: "show",
        position: "center"
      }),
      hide({
        id: "jamie"
      }),
      bg({
        id: "cg_audience_laugh",
        transition: "fade",
        waitAfter: 300,
        displayMode: "bg"
      }),
      sound({
        id: "big_laugh",
        volume: 0.55
      }),
      line({
        role: "jamie",
        text: "我現在，就是一台即將報廢的特斯拉。\n還沒撞人，自己就先起火。",
        expression: "show",
        position: "center"
      }),
      show({
        id: "jamie",
        expression: "show",
        position: "center"
      }),
      bg({
        id: "stage_show",
        transition: "fade",
        waitAfter: 300,
        displayMode: "background"
      }),
      show({
        id: "jamie",
        expression: "show",
        position: "center"
      }),
      line({
        role: "jamie",
        text: "你知道你真的要死了，是什麼感覺嗎？\n就像你手機掉進馬桶後撿起來發現……\n幹，其實沒差，它本來就沒電了。",
        expression: "show",
        position: "center"
      }),
      sound({
        id: "big_laugh",
        volume: 0.58
      }),
      line({
        role: "jamie",
        text: "你們今天每個人都有一本紀念冊，對吧？\n如果你們不想看也沒關係，反正我也沒在讀你們的留言。",
        expression: "show",
        position: "center"
      }),
      line({
        role: "jamie",
        text: "我只是在陰間等你們犯錯，好下去相見。",
        expression: "show",
        position: "center"
      }),
      hide({
        id: "jamie"
      }),
      line({
        role: "cate",
        text: "他把我辛苦做的紀念冊講得像是死亡筆記本。",
        position: "left"
      }),
      line({
        role: "remy",
        text: "效果拔群！",
        position: "right"
      }),
      line({
        role: "cate",
        text: "我知道，所以我更生氣。",
        position: "left"
      }),
      hide({
        id: "cate"
      }),
      hide({
        id: "remy"
      }),
      line({
        role: "ruri",
        text: "大家開始放鬆了。\n悲傷被好奇跟娛樂蓋住。",
        expression: "empathy",
        position: "left"
      }),
      hide({
        id: "remy"
      }),
      hide({
        id: "cate"
      }),
      line({
        role: "mercer",
        text: "不是蓋住。\n是開路。",
        position: "right"
      }),
      line({
        role: "ruri",
        text: "你最好是對的。",
        expression: "uneasy",
        position: "left"
      }),
      line({
        role: "mercer",
        text: "我也希望。",
        expression: "silent",
        position: "right"
      }),
      jump({
        next: "showtime_empathy"
      })
    ],
    showtime_empathy: [
      scene({
        mode: "stage",
        label: "庭如 / 笑聲底下",
        value: "ruri",
        ui: "j",
        layout: "monologue",
        participants: ["jamie"]
      }),
      clearSprites(),
      empathyUp(["禁忌快感", "表面的熱", "被冒犯", "好奇", "不知道該不該笑", "禁忌快感", "表面的熱", "被冒犯", "好奇", "不知道該不該笑"]),
      bg({
        id: "stage_show",
        transition: "fade",
        waitAfter: 700,
        displayMode: "background"
      }),
      line({
        role: "jamie",
        text: "首先，我要感謝我的家人，真的。",
        expression: "show",
        position: "center"
      }),
      line({
        role: "jamie",
        text: "給我爸。\n我爸年輕的時候常說，男人就要硬起來。",
        expression: "show",
        position: "center"
      }),
      line({
        role: "jamie",
        text: "現在我躺在病床上，看著一堆醫療管線插進我身體裡……\n我終於明白了，原來硬起來的真正意思，是指這些屍斑。",
        expression: "show",
        position: "center"
      }),
      hide({
        id: "jamie"
      }),
      bg({
        id: "cg_audience_laugh",
        transition: "fade",
        waitAfter: 300,
        displayMode: "bg"
      }),
      sound({
        id: "big_laugh",
        volume: 0.62
      }),
      line({
        text: "笑聲很熱。但熱的不是心，是表面。\n那種快感來自一個被禁止的地方。\n大家知道這不應該好笑，所以它更好笑。"
      }),
      bg({
        id: "stage_show",
        transition: "fade",
        waitAfter: 700,
        displayMode: "background"
      }),
      line({
        role: "jamie",
        text: "然後這一段是給我媽的。\n我媽這輩子最大的遺憾，是沒看到我結婚。",
        expression: "show",
        position: "center"
      }),
      line({
        role: "jamie",
        text: "媽，妳看清楚。\n我現在穿著西裝，現場有花，有座位，有哭聲。",
        expression: "show",
        position: "center"
      }),
      line({
        role: "jamie",
        text: "這場派對唯一缺的，就是新娘而已。",
        expression: "show",
        position: "center"
      }),
      hide({
        id: "jamie"
      }),
      sound({
        id: "big_laugh",
        volume: 0.58
      }),
      bg({
        id: "cg_audience_laugh",
        transition: "fade",
        waitAfter: 300,
        displayMode: "bg"
      }),
      line({
        text: "前排的臨時演員母親也笑了。\n那個笑有一點不小心。她一開始是在演，可是人有時候演得太久，會被自己的表演拖進去。"
      }),
      bg({
        id: "stage_show",
        transition: "fade",
        waitAfter: 700,
        displayMode: "background"
      }),
      line({
        role: "jamie",
        text: "而且拜託，不結婚就怎樣？你們那些結婚的，不是也整天在臉書說婚姻像墳墓嗎？\n現在好了，我直接住進去，贏你們一整輪。",
        expression: "show",
        position: "center"
      }),
      select({
        prompt: "庭如要觀察誰？",
        options: [
          option({
            text: "林薇。",
            next: "observe_wei",
            set: {
              wei_seen: true
            }
          }),
          option({
            text: "奇點無限高層。",
            next: "observe_exec",
            set: {
              executives_seen: true
            }
          }),
          option({
            text: "臨時家屬。",
            next: "observe_fake_family",
            set: {
              fake_family_seen: true
            }
          }),
          option({
            text: "傑米。",
            next: "observe_jamie",
            set: {
              jamie_blackhole: true
            }
          })
        ],
        choiceUi: {
          widthRatio: 0.3,
          textAlign: "center",
          fontScale: "standard"
        }
      })
    ],
    observe_wei: [
      context({
        mode: "stage"
      }),
      clearSprites({
        conversation: {
          layout: "stage-with-backstage-monitor",
          participants: ["ruri", "mercer"],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      bg({
        id: "cg_wei_silent",
        transition: "fade",
        waitAfter: 700,
        displayMode: "bg"
      }),
      line({
        text: "林薇沒有笑。\n她看著台上的傑米，像看著一間曾經住過的房子，被拆掉隔間、打上燈，改裝成供人拍照的展覽館。"
      }),
      line({
        role: "ruri",
        text: "她很痛。",
        expression: "uneasy",
        position: "left"
      }),
      line({
        role: "mercer",
        text: "誰？",
        position: "right"
      }),
      line({
        role: "ruri",
        text: "林薇，傑米的前女友。\n她不是恨他，只是忽然明白，\n自己曾經愛過的那個人，已經學會把所有東西都變成舞台效果。",
        position: "left"
      }),
      clearSprites(),
      bg({
        id: "stage_show",
        transition: "fade",
        waitAfter: 700,
        displayMode: "background"
      }),
      jump({
        next: "showtime_more_jokes"
      })
    ],
    observe_exec: [
      context({
        mode: "stage"
      }),
      line({
        text: "高層笑得很小心。笑太少，怕被拍到冷血；\n笑太多，怕被寫成不尊重創辦人。\n有人真心佩服傑米，也有人已經在想明天開盤。",
        conversation: {
          layout: "stage-with-backstage-monitor",
          participants: ["ruri", "mercer"],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      line({
        role: "ruri",
        text: "他們在笑，也在計算。",
        expression: "empathy",
        position: "left"
      }),
      line({
        role: "mercer",
        text: "這不衝突。",
        position: "right"
      }),
      line({
        role: "ruri",
        text: "我知道，所以才可怕。",
        expression: "uneasy",
        position: "left"
      }),
      clearSprites(),
      bg({
        id: "stage_show",
        transition: "fade",
        waitAfter: 700,
        displayMode: "background"
      }),
      jump({
        next: "showtime_more_jokes"
      })
    ],
    observe_fake_family: [
      context({
        mode: "stage"
      }),
      clearSprites({
        conversation: {
          layout: "stage-with-backstage-monitor",
          participants: ["ruri", "mercer"],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      hide({
        id: "jamie"
      }),
      bg({
        id: "cg_audience_laugh",
        transition: "fade",
        waitAfter: 300,
        displayMode: "bg"
      }),
      line({
        text: "前排那幾位「家屬」知道自己的任務：\n低頭、擦眼淚、在適當時候哽咽。"
      }),
      line({
        text: "他們一開始只是工作。\n可是當傑米開始說母親，說婚禮，說墳墓，說自己快死了，他們裡面的某個地方被觸碰到。"
      }),
      line({
        text: "也許不是為傑米。\n也許是為自己的父親、母親、孩子、某個來不及道別的人。\n悲傷被租來，但它不是假貨。它只是被錯放在這裡。"
      }),
      line({
        role: "ruri",
        text: "他們原本在表演悲傷。\n現在真的有一點悲傷。",
        expression: "empathy",
        position: "left"
      }),
      line({
        role: "mercer",
        text: "所以悲傷是真的？",
        position: "right"
      }),
      line({
        role: "ruri",
        text: "是真的。\n但位置不對。",
        expression: "uneasy",
        position: "left"
      }),
      clearSprites(),
      bg({
        id: "stage_show",
        transition: "fade",
        waitAfter: 700,
        displayMode: "background"
      }),
      jump({
        next: "showtime_more_jokes"
      })
    ],
    observe_jamie: [
      scene({
        mode: "stage",
        label: "舞台 / 觀察傑米",
        ui: "j",
        layout: "stage-with-backstage-monitor",
        participants: ["jamie", "ruri", "mercer"]
      }),
      line({
        text: "他掌控了全場。每一個笑點，每一個眼神，都像精準算過。\n可是他的恐懼沒有因此變小。笑聲只是蓋子，蓋住一個很深、很深的洞。",
        conversation: {
          layout: "stage-with-backstage-monitor",
          participants: ["ruri", "mercer"],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      line({
        role: "ruri",
        text: "他在燃燒自己。",
        expression: "empathy",
        position: "left"
      }),
      line({
        role: "mercer",
        text: "我知道。",
        position: "right"
      }),
      line({
        role: "ruri",
        text: "你知道還讓他繼續？",
        expression: "uneasy",
        position: "left"
      }),
      line({
        role: "mercer",
        text: "這是他選擇的燃燒方式。",
        position: "right"
      }),
      clearSprites(),
      bg({
        id: "stage_show",
        transition: "fade",
        waitAfter: 700,
        displayMode: "background"
      }),
      jump({
        next: "showtime_more_jokes"
      })
    ],
    showtime_more_jokes: [
      context({
        mode: "stage"
      }),
      line({
        role: "jamie",
        text: "接下來，我要感謝我的前任們。",
        expression: "nervous",
        position: "center",
        conversation: {
          layout: "monologue",
          participants: ["jamie"],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      hide({
        id: "jamie"
      }),
      bg({
        id: "cg_wei_silent",
        transition: "fade",
        waitAfter: 300,
        displayMode: "bg"
      }),
      line({
        text: "觀眾席中段，穿著灰色洋裝的林薇微微低下頭。"
      }),
      bg({
        id: "stage_show",
        transition: "fade",
        waitAfter: 500,
        displayMode: "background"
      }),
      line({
        role: "jamie",
        text: "我有幾任前女友今天沒來，沒關係，我原諒妳們。\n畢竟妳們平常連我的生日都忘記，我死了妳們記得才奇怪。",
        expression: "confession",
        position: "center"
      }),
      line({
        role: "jamie",
        text: "但妳們要知道一件事。\n我雖然人快走了，但我最後的願望之一，就是希望妳們過得比我活著時更痛苦。",
        expression: "show",
        position: "center"
      }),
      line({
        role: "jamie",
        text: "所以我安排了AI語音留言。\n每年七夕，會寄一段我對妳說的情話到妳們公司的 LINE 群組裡。",
        expression: "show",
        position: "center"
      }),
      line({
        role: "jamie",
        text: "我愛過妳，但妳不值得被我記得。",
        expression: "show",
        position: "center"
      }),
      line({
        role: "jamie",
        text: "還會配上一張我的骨灰罐自拍照。",
        expression: "show",
        position: "center"
      }),
      hide({
        id: "jamie"
      }),
      bg({
        id: "cg_audience_laugh",
        transition: "fade",
        waitAfter: 300,
        displayMode: "bg"
      }),
      sound({
        id: "big_laugh",
        volume: 0.62
      }),
      empathyDown(["笑話", "傷口", "不用道歉", "林薇", "碎裂", "笑話", "傷口", "不用道歉", "林薇", "碎裂"]),
      bg({
        id: "stage_show",
        transition: "fade",
        waitAfter: 350,
        displayMode: "background"
      }),
      line({
        text: "庭如感覺到一個小小的碎裂聲。\n不是很大，可能連林薇自己都不想承認，但它存在。"
      }),
      line({
        text: "有些笑話不是讓人笑，是讓講的人可以不用道歉。"
      }),
      line({
        role: "jamie",
        text: "給來參加的朋友們。\n我活著的時候你們都說「改天聚一下」。\n我都快死了你們才出現，這個改天，是不是太準時了點？",
        expression: "show",
        position: "center"
      }),
      sound({
        id: "awkward_laugh",
        volume: 0.48
      }),
      line({
        role: "jamie",
        text: "不過也好啦，今天你們終於都來了。\n我也終於知道誰只會在我IG底下打emoji，誰是真的肯為我出門的人。",
        expression: "show",
        position: "center"
      }),
      line({
        role: "jamie",
        text: "你們那幾個沒穿黑色的衣服，難道是以為今天我結婚嗎？",
        expression: "show",
        position: "center"
      }),
      hide({
        id: "jamie"
      }),
      bg({
        id: "cg_audience_laugh",
        transition: "fade",
        waitAfter: 300,
        displayMode: "bg"
      }),
      sound({
        id: "big_laugh",
        volume: 0.56
      }),
      line({
        role: "jamie",
        text: "給奇點無限的同事們。\n你們一直說我很會講幹話，我現在要告訴你們一個事實。\n我都要死了，你們還是最廢的那群人。",
        expression: "show",
        position: "center"
      }),
      line({
        text: "奇點無限的員工區瞬間安靜。"
      }),
      line({
        role: "jamie",
        text: "我已經立好遺囑，如果你們在我的追思會上講什麼「他是一個善良的人」這種話，我就從冥界投訴你們造謠。",
        expression: "show",
        position: "center"
      }),
      hide({
        id: "jamie"
      }),
      bg({
        id: "cg_audience_laugh",
        transition: "fade",
        waitAfter: 300,
        displayMode: "bg"
      }),
      sound({
        id: "big_laugh",
        volume: 0.58
      }),
      line({
        text: "笑聲像浪潮一樣，一波接著一波。\n人們開始享受這種在肅穆場合大笑的禁忌快感。"
      }),
      select({
        prompt: "庭如是否提醒老麵？",
        options: [
          option({
            text: "他在燃燒自己。",
            next: "warn_burning",
            set: {
              ruri_warn_burning: true
            }
          }),
          option({
            text: "觀眾已經被他帶走了。",
            next: "warn_success",
            set: {
              show_success: true
            }
          }),
          option({
            text: "這些笑聲有點不真實。",
            next: "warn_unreal",
            set: {
              laugh_unreal: true
            }
          }),
          option({
            text: "讓他繼續。",
            next: "mic_down",
            set: {
              let_continue: true
            }
          })
        ],
        choiceUi: {
          widthRatio: 0.3,
          textAlign: "center",
          fontScale: "standard"
        }
      })
    ],
    warn_burning: [
      context({
        mode: "story"
      }),
      line({
        role: "ruri",
        text: "他在燃燒自己。\n不是舞台效果的那種。",
        expression: "empathy",
        position: "left",
        conversation: {
          layout: "duo",
          participants: ["ruri", "mercer"],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      line({
        role: "mercer",
        text: "幫我看著他什麼時候開始不是在演，而是在消耗自己。",
        position: "right"
      }),
      line({
        role: "ruri",
        text: "也許已經開始了。",
        expression: "uneasy",
        position: "left"
      }),
      jump({
        next: "mic_down"
      })
    ],
    warn_success: [
      context({
        mode: "story"
      }),
      line({
        role: "ruri",
        text: "觀眾已經被他帶走了。",
        position: "left",
        conversation: {
          layout: "duo",
          participants: ["ruri", "mercer"],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      line({
        role: "mercer",
        text: "很好。",
        position: "right"
      }),
      line({
        role: "ruri",
        text: "你聽起來像在看數據。",
        expression: "uneasy",
        position: "left"
      }),
      line({
        role: "mercer",
        text: "我現在必須像在看數據。",
        position: "right"
      }),
      jump({
        next: "mic_down"
      })
    ],
    warn_unreal: [
      context({
        mode: "story"
      }),
      line({
        role: "ruri",
        text: "這些笑聲有點不真實。",
        expression: "silent",
        position: "left",
        conversation: {
          layout: "duo",
          participants: ["ruri", "mercer"],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      line({
        role: "mercer",
        text: "越大的聲音，越容易讓人忘記自己在逃避什麼。",
        position: "right"
      }),
      line({
        role: "ruri",
        text: "所以你知道。",
        expression: "uneasy",
        position: "left"
      }),
      line({
        role: "mercer",
        text: "我知道很多事，不代表我每次都能處理得好。",
        position: "right"
      }),
      jump({
        next: "mic_down"
      })
    ],
    mic_down: [
      scene({
        mode: "stage",
        label: "老麵 / 真心告白 CUE",
        value: "mercer",
        ui: "j",
        layout: "choice"
      }),
      clearSprites(),
      bg({
        id: "stage_confession",
        transition: "fade",
        waitAfter: 700,
        displayMode: "background"
      }),
      music({
        id: "confession",
        volume: 0,
        loop: true,
        fade: 600
      }),
      line({
        text: "傑米講完同事段落，全場氣氛達到高點。\n他喝一口水，安靜幾秒。\n所有人都在等下一個更狠的笑話，但他沒有。"
      }),
      sound({
        id: "mic",
        volume: 0.55
      }),
      line({
        text: "他把麥克風從架上拿下來，不是拿著講，而是輕輕放到舞台地板上。\n那聲音很輕，卻像一個段落的句點。"
      }),
      select({
        prompt: "燈光怎麼處理？",
        options: [
          option({
            text: "暖光慢慢進。",
            next: "cue_light_warm",
            set: {
              light_warm: true
            }
          }),
          option({
            text: "聚光燈縮小。",
            next: "cue_light_small",
            set: {
              light_small: true
            }
          }),
          option({
            text: "先暗一拍，再進暖光。",
            next: "cue_light_dramatic",
            set: {
              light_dramatic: true
            }
          }),
          option({
            text: "保持冷光。 讓他自己把溫度說出來。",
            next: "cue_light_cold",
            set: {
              light_cold: true
            }
          })
        ],
        choiceUi: {
          widthRatio: 0.5,
          textAlign: "center",
          fontScale: "standard"
        }
      })
    ],
    cue_light_warm: [
      context({
        mode: "story"
      }),
      sound({
        id: "spotlight",
        volume: 0.42,
        conversation: {
          layout: "narrative",
          participants: [],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      line({
        text: "暖色的光從傑米肩膀後方爬上來，\n像有人終於替他披上一件不太合身的外套。"
      }),
      jump({
        next: "cue_music"
      })
    ],
    cue_light_small: [
      context({
        mode: "story"
      }),
      sound({
        id: "spotlight",
        volume: 0.42,
        conversation: {
          layout: "narrative",
          participants: [],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      line({
        text: "舞台變暗。\n世界退後。傑米被留在一小圈光裡，那圈光不像榮耀，比較像病房床邊的閱讀燈。"
      }),
      jump({
        next: "cue_music"
      })
    ],
    cue_light_dramatic: [
      context({
        mode: "story"
      }),
      sound({
        id: "spotlight",
        volume: 0.42,
        conversation: {
          layout: "narrative",
          participants: [],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      line({
        text: "舞台短暫暗下。\n下一秒，暖光打開。\n傑米坐在那裡，像剛從某個很深的地方回來。"
      }),
      jump({
        next: "cue_music"
      })
    ],
    cue_light_cold: [
      context({
        mode: "story"
      }),
      line({
        text: "冷白色燈光沒有變。\n傑米的臉顯得更疲憊，也更真實。",
        conversation: {
          layout: "narrative",
          participants: [],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      jump({
        next: "cue_music"
      })
    ],
    cue_music: [
      context({
        mode: "story"
      }),
      select({
        prompt: "音樂怎麼進？",
        options: [
          option({
            text: "大提琴先進。",
            next: "confession_cello",
            set: {
              music_cello: true
            }
          }),
          option({
            text: "吉他先進。",
            next: "confession_guitar",
            set: {
              music_guitar: true
            }
          }),
          option({
            text: "完全無音樂。 只剩下傑米的呼吸聲。",
            next: "confession_no_music",
            set: {
              music_silent: true
            }
          }),
          option({
            text: "維持極簡鋼琴，保留時間壓迫。",
            next: "confession_piano",
            set: {
              music_piano: true
            }
          })
        ],
        conversation: {
          layout: "choice",
          participants: [],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        },
        choiceUi: {
          widthRatio: 0.5,
          textAlign: "center",
          fontScale: "standard"
        }
      })
    ],
    confession_cello: [
      context({
        mode: "confession"
      }),
      music({
        id: "confession",
        volume: 0.34,
        loop: true,
        fade: 1000,
        conversation: {
          layout: "narrative",
          participants: [],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      line({
        text: "低沉的大提琴聲慢慢進來。\n不是催淚，比較像有人坐到他旁邊，沒有說話。"
      }),
      jump({
        next: "cue_camera"
      })
    ],
    confession_guitar: [
      context({
        mode: "confession"
      }),
      music({
        id: "confession",
        volume: 0.3,
        loop: true,
        fade: 1000,
        conversation: {
          layout: "narrative",
          participants: [],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      line({
        text: "幾個乾淨的吉他音落下。\n舞台忽然沒那麼像發表會，比較像深夜客廳裡，一個人終於願意講真話。"
      }),
      jump({
        next: "cue_camera"
      })
    ],
    confession_no_music: [
      context({
        mode: "confession"
      }),
      line({
        text: "沒有大提琴，沒有吉他，沒有鋼琴。只剩下傑米的呼吸聲。\n那一瞬間，他不像CEO，也不像產品。他只像一個快死的人。",
        conversation: {
          layout: "narrative",
          participants: [],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      jump({
        next: "cue_camera"
      })
    ],
    confession_piano: [
      context({
        mode: "confession"
      }),
      music({
        id: "title",
        volume: 0.22,
        loop: true,
        fade: 700,
        conversation: {
          layout: "narrative",
          participants: [],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      line({
        text: "原本像倒數的鋼琴單音沒有消失。\n它提醒每個人，時間沒有因為真心告白而停止。"
      }),
      jump({
        next: "cue_camera"
      })
    ],
    cue_camera: [
      context({
        mode: "confession"
      }),
      select({
        prompt: "鏡頭怎麼處理？",
        options: [
          option({
            text: "近切傑米。 讓所有人看見他眼角的紅。",
            next: "camera_close",
            set: {
              camera_close: true
            }
          }),
          option({
            text: "留全身遠景。 讓他坐在舞台中央，小而孤單。",
            next: "camera_wide",
            set: {
              camera_wide: true
            }
          }),
          option({
            text: "切觀眾反應。 讓現場看見自己被打開。",
            next: "camera_audience",
            set: {
              camera_audience: true
            }
          }),
          option({
            text: "不切。 讓他自己說。",
            next: "camera_still",
            set: {
              camera_still: true
            }
          })
        ],
        conversation: {
          layout: "choice",
          participants: [],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        },
        choiceUi: {
          widthRatio: 0.5,
          textAlign: "center",
          fontScale: "standard"
        }
      })
    ],
    camera_close: [
      context({
        mode: "confession"
      }),
      line({
        text: "側邊螢幕放大傑米的臉。\n他的眼角有細微的紅，那不是表演能輕易做到的東西。",
        conversation: {
          layout: "narrative",
          participants: [],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      jump({
        next: "confession_text"
      })
    ],
    camera_wide: [
      context({
        mode: "confession"
      }),
      line({
        text: "畫面留在遠景。\n傑米坐在舞台中央，很小，很亮，也很孤單。",
        conversation: {
          layout: "narrative",
          participants: [],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      jump({
        next: "confession_text"
      })
    ],
    camera_audience: [
      context({
        mode: "confession"
      }),
      line({
        text: "鏡頭掃過台下。\n有人還沒從笑聲裡回來，有人已經開始不安。\n林薇抬手擦掉眼角。",
        conversation: {
          layout: "narrative",
          participants: [],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      jump({
        next: "confession_text"
      })
    ],
    camera_still: [
      context({
        mode: "confession"
      }),
      line({
        text: "沒有螢幕特寫，沒有剪輯，沒有人替這段真話加框。\n傑米必須用自己的聲音穿過整個會場。",
        conversation: {
          layout: "narrative",
          participants: [],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      jump({
        next: "confession_text"
      })
    ],
    confession_text: [
      scene({
        mode: "confession",
        label: "舞台 / 真心告白",
        value: "stage",
        ui: "j",
        layout: "stage-with-backstage-monitor",
        participants: ["jamie", "ruri", "mercer"]
      }),
      bg({
        id: "stage_confession",
        transition: "fade",
        waitAfter: 700,
        displayMode: "background"
      }),
      music({
        id: "confession",
        volume: 0.36,
        loop: true,
        fade: 1200,
        conversation: {
          layout: "stage-with-backstage-monitor",
          participants: ["jamie", "ruri", "mercer"],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      show({
        id: "jamie",
        expression: "confession",
        position: "center",
        speakerFocus: "primary"
      }),
      line({
        role: "jamie",
        text: "好了。\n笑話說完了。\n接下來，我想說一些真話。",
        expression: "confession",
        position: "center"
      }),
      line({
        role: "jamie",
        text: "我這一生，都在追求贏。\n我要贏過競爭對手，贏得市場，賺比別人更多的錢，登上所有雜誌封面。\n我做到了，對嗎？",
        expression: "confession",
        position: "center"
      }),
      sound({
        id: "applause_sparse",
        volume: 0.36
      }),
      line({
        role: "jamie",
        text: "但直到三個月前，我才發現，我輸了。\n輸得一敗塗地。我輸給了我身體裡幾個不聽話的細胞。\n它們比我更懂創業，悄悄在我體內建立了一個無法擊敗的王國。",
        expression: "confession",
        position: "center"
      }),
      line({
        role: "jamie",
        text: "我害怕。",
        expression: "confession",
        position: "center"
      }),
      line({
        role: "jamie",
        text: "我怕痛。\n我怕死。\n但我最怕的，是被人遺忘。",
        expression: "confession",
        position: "center"
      }),
      empathyUp(["害怕", "空", "被遺忘", "詹傑明", "害怕", "空", "被遺忘", "詹傑明"]),
      line({
        role: "jamie",
        text: "我怕我死後，傑米・詹這個名字。\n只會變成財經新聞裡的一組歷史數據，或者科技論壇上一段被人爭論不休的文字。",
        expression: "confession",
        position: "center"
      }),
      line({
        role: "jamie",
        text: "我用盡一生去打造一個王國。\n但我從來沒有時間，好好看看我王國裡的風景。",
        expression: "confession",
        position: "center"
      }),
      line({
        role: "jamie",
        text: "我沒能好好陪我父親走完最後一程。\n我錯過了我最好朋友的婚禮。\n我甚至記不清，我上一次不為任何目的地去旅行，是什麼時候。",
        expression: "confession",
        position: "center"
      }),
      line({
        role: "jamie",
        text: "所以我辦了這場秀。\n我想用我最擅長的方式，跟你們每一個人，好好道別。\n用那些傷人的笑話，戳破我們之間那些客套的謊言。",
        expression: "confession",
        position: "center"
      }),
      line({
        role: "jamie",
        text: "我想告訴我的家人，對不起，我不是一個及格的兒子。\n我想告訴我的前任們，謝謝妳們，在我還不是個混蛋的時候愛過我。\n我想告訴我的朋友們，我很抱歉，總是把你們的邀約排在工作後面。",
        expression: "confession",
        position: "center"
      }),
      line({
        role: "jamie",
        text: "我希望你們記得的，不是那個成功的、刻薄的、永遠正確的CEO。",
        expression: "confession",
        position: "center"
      }),
      line({
        role: "jamie",
        text: "我希望你們記得，今天晚上，這個有點緊張，說了很多爛笑話，\n而且非常非常害怕被忘記的——詹傑明。",
        expression: "confession",
        position: "center"
      }),
      line({
        text: "現場一片安靜。\n這不是死寂。\n這是人們終於不知道該用什麼反應，才不會弄髒剛剛那段話。"
      }),
      line({
        role: "ruri",
        text: "這就是你說的餘韻，對嗎？",
        position: "left"
      }),
      line({
        role: "mercer",
        text: "……對。",
        position: "right"
      }),
      clearSprites(),
      show({
        id: "jamie",
        expression: "confession",
        position: "center"
      }),
      line({
        role: "jamie",
        text: "但是。\n告別，不代表結束。",
        expression: "confession",
        position: "center"
      }),
      route({
        branches: [
          whenFlag("silence", "reincarnation_silence7", 7)
        ],
        default: "reincarnation_check3"
      })
    ],
    reincarnation_silence7: [
      context({
        mode: "reincarnation"
      }),
      pause({
        ms: 7000,
        conversation: {
          layout: "narrative",
          participants: [],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      line({
        text: "那七秒幾乎像一場真正的告別。\n也因此，當它被打斷時，顯得更殘忍。"
      }),
      jump({
        next: "reincarnation_01"
      })
    ],
    reincarnation_check3: [
      context({
        mode: "reincarnation"
      }),
      route({
        branches: [
          whenFlag("silence", "reincarnation_silence3", 3)
        ],
        default: "reincarnation_silence0",
        conversation: {
          layout: "narrative",
          participants: [],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      })
    ],
    reincarnation_silence3: [
      context({
        mode: "reincarnation"
      }),
      pause({
        ms: 3000,
        conversation: {
          layout: "narrative",
          participants: [],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      line({
        text: "那三秒裡，沒有人知道該不該鼓掌。\n有人低頭，有人閉眼。\n然後，燈光大亮，世界被重新命名成產品。"
      }),
      jump({
        next: "reincarnation_01"
      })
    ],
    reincarnation_silence0: [
      context({
        mode: "reincarnation"
      }),
      line({
        text: "淚水還沒真正落下，LED 已經亮起。\n【輪迴】兩個字像刀一樣切進現場。",
        conversation: {
          layout: "narrative",
          participants: [],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      jump({
        next: "reincarnation_01"
      })
    ],
    reincarnation_01: [
      scene({
        mode: "reincarnation",
        label: "庭如 / 情緒崩裂",
        value: "ruri",
        ui: "j",
        layout: "stage-with-backstage-monitor",
        participants: ["jamie", "ruri"]
      }),
      clearSprites(),
      bg({
        id: "stage_reincarnation",
        transition: "flash",
        waitAfter: 700,
        displayMode: "background"
      }),
      clearSprites(),
      music({
        id: "reincarnation",
        volume: 0.56,
        loop: true,
        fade: 550
      }),
      sound({
        id: "led",
        volume: 0.72
      }),
      clearSprites(),
      empathyDown([
          "震驚",
          "背叛",
          "欽佩",
          "憤怒",
          "困惑",
          "興奮",
          "悲傷",
          "股價",
          "永生",
          "騙子",
          "天才",
          "怪物",
          "震驚",
          "背叛",
          "欽佩",
          "憤怒",
          "困惑",
          "興奮",
          "悲傷",
          "股價",
          "永生",
          "騙子",
          "天才",
          "怪物"
        ]),
      bg({
        id: "stage_reincarnation",
        transition: "fade",
        waitAfter: 700,
        displayMode: "background"
      }),
      show({
        id: "jamie",
        expression: "reincarnation",
        position: "center",
        speakerFocus: "primary",
        allowedSceneMode: ["stage", "confession", "reincarnation"]
      }),
      line({
        role: "jamie",
        text: "死亡，是人類的終極命題。\n而我，用我的一生，在為這個命題尋找答案。\n今天，我找到了。",
        expression: "reincarnation",
        position: "center"
      }),
      line({
        role: "jamie",
        text: "「輪迴」系統，是我和我的團隊，獻給這個世界的最終解答。\n它將完整地掃描、複製並上傳人類的意識、記憶與人格。",
        expression: "reincarnation",
        position: "center"
      }),
      line({
        role: "jamie",
        text: "肉體會消亡。\n但「你」，將以另一種形式，永遠存在。",
        expression: "reincarnation",
        position: "center"
      }),
      line({
        role: "ruri",
        text: "太多了。\n太多東西撞在一起了。\n有人覺得被騙，有人覺得看見奇蹟，有人在生氣，有人已經在想新聞標題。",
        expression: "silent",
        position: "left"
      }),
      line({
        role: "ruri",
        text: "有人覺得自己贏了。\n可是他也很悲傷。",
        expression: "empathy",
        position: "left"
      }),
      hide({
        id: "ruri"
      }),
      hide({
        id: "mercer"
      }),
      hide({
        id: "cate"
      }),
      hide({
        id: "remy"
      }),
      show({
        id: "jamie",
        expression: "reincarnation",
        position: "center"
      }),
      line({
        role: "jamie",
        text: "很快，我的身體將會停止運作。\n但是傑米・詹，將會繼續活下去。\n活在雲端，活在數據裡，繼續帶領奇點無限，走向下一個奇蹟。",
        expression: "reincarnation",
        position: "center"
      }),
      line({
        role: "jamie",
        text: "我將成為「輪迴」計畫的第一位使用者。\n第一個，數位永生人。",
        expression: "reincarnation",
        position: "center"
      }),
      line({
        role: "jamie",
        text: "所以，朋友們，不要為我悲傷。\n這不是一場告別式，這是一場產品發表會。\n是我人生中，最重要、也最成功的一次。",
        expression: "reincarnation",
        position: "center"
      }),
      line({
        role: "jamie",
        text: "歡迎來到，永生的紀元。",
        expression: "reincarnation",
        position: "center"
      }),
      select({
        prompt: "庭如在心裡記下了一句話。",
        options: [
          option({
            text: "他真的在告別。",
            next: "after_show_01",
            set: {
              ending_sympathy: true
            }
          }),
          option({
            text: "他真的在利用他們。",
            next: "after_show_01",
            set: {
              ending_ethics: true
            }
          }),
          option({
            text: "兩件事同時是真的。",
            next: "after_show_01",
            set: {
              ending_paradox: true
            }
          }),
          option({
            text: "我們幫他完成了這一切。",
            next: "after_show_01",
            set: {
              ending_guilt: true
            }
          })
        ],
        choiceUi: {
          widthRatio: 0.4,
          textAlign: "center",
          fontScale: "standard"
        }
      })
    ],
    after_show_01: [
      scene({
        mode: "afterward",
        label: "老麵 / 演出結束",
        value: "mercer",
        ui: "g",
        layout: "duo",
        participants: ["remy", "cate"]
      }),
      clearSprites(),
      music({
        id: "afterward",
        volume: 0.34,
        loop: true,
        fade: 1200
      }),
      clearSprites(),
      sound({
        id: "crowd_shock",
        volume: 0.46
      }),
      clearSprites(),
      bg({
        id: "cg_empty_stage_after",
        transition: "fade",
        waitAfter: 700,
        displayMode: "bg"
      }),
      line({
        text: "燈光慢慢恢復，但會場沒有恢復。媒體區像被點燃，手機亮成一片。\n奇點無限高層有人站起來打電話。朋友區有人沉默。\n林薇離開座位，沒有回頭。"
      }),
      clearSprites(),
      bg({
        id: "control_room_dark",
        transition: "fade",
        waitAfter: 700,
        displayMode: "background"
      }),
      line({
        role: "remy",
        text: "演出結束。",
        position: "left"
      }),
      line({
        role: "cate",
        text: "……這算成功嗎？",
        position: "right"
      }),
      select({
        prompt: "演出結束後，老麵先看向誰？",
        options: [
          option({
            text: "看傑米。",
            next: "after_observe_jamie",
            set: {
              after_see_Jamie: true
            }
          }),
          option({
            text: "看庭如。",
            next: "after_observe_ruri",
            set: {
              after_see_Ruri: true
            }
          }),
          option({
            text: "看現場來賓。",
            next: "after_observe_guests",
            set: {
              after_see_guests: true
            }
          }),
          option({
            text: "看手機新聞推播。",
            next: "after_observe_phone",
            set: {
              after_see_phone: true
            }
          })
        ],
        choiceUi: {
          widthRatio: 0.3,
          textAlign: "center",
          fontScale: "standard"
        }
      })
    ],
    after_observe_jamie: [
      context({
        mode: "afterward"
      }),
      line({
        text: "監控切到舞台側邊。\n傑米靠著牆，看起來像剛打贏一場仗。",
        conversation: {
          layout: "duo",
          participants: ["mercer", "jamie"],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      line({
        text: "但沒有一個勝利者，會這樣用力抓著自己的袖口。"
      }),
      line({
        role: "mercer",
        text: "傑米。你做到了。",
        position: "left"
      }),
      line({
        role: "jamie",
        text: "我知道。",
        expression: "nervous",
        position: "right"
      }),
      line({
        role: "jamie",
        text: "他們會記得嗎？",
        expression: "nervous",
        position: "right"
      }),
      line({
        role: "mercer",
        text: "會。",
        position: "left"
      }),
      line({
        role: "jamie",
        text: "多久？",
        expression: "nervous",
        position: "right"
      }),
      line({
        text: "老麵沒有回答。\n傑米也沒有追問。"
      }),
      clearSprites(),
      bg({
        id: "control_room_dark",
        transition: "fade",
        waitAfter: 700,
        displayMode: "background"
      }),
      jump({
        next: "after_ruri_choice"
      })
    ],
    after_observe_ruri: [
      context({
        mode: "afterward"
      }),
      line({
        text: "庭如坐在控制室角落。\n她沒有哭，但她的表情像剛剛聽見什麼東西裂開。",
        conversation: {
          layout: "duo",
          participants: ["mercer", "ruri"],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      line({
        role: "mercer",
        text: "妳還好嗎？",
        position: "left"
      }),
      line({
        role: "ruri",
        text: "不知道。",
        expression: "uneasy",
        position: "right"
      }),
      line({
        role: "mercer",
        text: "這不是妳平常會給的答案。",
        expression: "silent",
        position: "left"
      }),
      line({
        role: "ruri",
        text: "因為我平常比較知道自己感覺到什麼。 \n現在太多了，像有人把一整間房子的燈同時打開，可是房子裡每一個人都在流血。",
        expression: "silent",
        position: "right"
      }),
      clearSprites(),
      bg({
        id: "control_room_dark",
        transition: "fade",
        waitAfter: 700,
        displayMode: "background"
      }),
      jump({
        next: "after_ruri_choice"
      })
    ],
    after_observe_guests: [
      context({
        mode: "afterward"
      }),
      clearSprites({
        conversation: {
          layout: "duo",
          participants: ["mercer", "ruri"],
          voiceOnlyParticipants: ["none"],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      hide({
        id: "jamie"
      }),
      bg({
        id: "cg_audience_laugh",
        transition: "fade",
        waitAfter: 300,
        displayMode: "bg"
      }),
      line({
        text: "監控掃過會場。\n有人鼓掌，有人咒罵，有人急著打電話，有人坐在原位，像忘了怎麼站起來。"
      }),
      line({
        speaker: "記者A",
        text: "死亡行銷。",
        leaveAfter: true
      }),
      line({
        speaker: "記者B",
        text: "不，這叫數位永生第一案。",
        leaveAfter: true
      }),
      line({
        speaker: "記者C",
        text: "標題可以下：\n他用自己的死亡，發表了人類的未來。",
        leaveAfter: true
      }),
      line({
        role: "mercer",
        text: "他們已經開始了。",
        position: "right"
      }),
      line({
        role: "ruri",
        text: "大家都開始了。",
        expression: "silent",
        position: "left"
      }),
      clearSprites(),
      bg({
        id: "control_room_dark",
        transition: "fade",
        waitAfter: 700,
        displayMode: "background"
      }),
      jump({
        next: "after_ruri_choice"
      })
    ],
    after_observe_phone: [
      context({
        mode: "afterward"
      }),
      clearSprites({
        conversation: {
          layout: "group",
          participants: ["mercer", "remy", "ruri"],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      bg({
        id: "doc_media_news",
        transition: "fade",
        waitAfter: 10,
        displayMode: "document",
        documentTarget: "sidePanelExpandable",
        documentTitle: "媒體新聞網站畫面"
      }),
      sound({
        id: "phone",
        volume: 0.5
      }),
      note({
        title: "PUSH",
        text: "傑米・詹生前告別秀驚爆 AI 永生計畫。\n死亡行銷？科技狂人以自身生命包裝產品發表，引發倫理爭議。\n輪迴系統是突破，還是騙局？"
      }),
      line({
        role: "mercer",
        text: "太快了。",
        position: "left"
      }),
      line({
        role: "remy",
        text: "網路最擅長的就是把人的一生壓縮成三十秒懶人包。",
        position: "right"
      }),
      hide({
        id: "mercer"
      }),
      hide({
        id: "remy"
      }),
      line({
        role: "ruri",
        text: "可是我們今天做的事，不也是嗎？",
        expression: "uneasy",
        position: "left"
      }),
      hide({
        id: "ruri"
      }),
      line({
        text: "控制室再次安靜。"
      }),
      clearSprites(),
      bg({
        id: "control_room_dark",
        transition: "fade",
        waitAfter: 700,
        displayMode: "background"
      }),
      jump({
        next: "after_ruri_choice"
      })
    ],
    after_ruri_choice: [
      context({
        mode: "afterward"
      }),
      select({
        prompt: "老麵要對庭如說什麼？",
        options: [
          option({
            text: "我們完成了。",
            next: "after_say_completed",
            set: {
              completed_case: true
            }
          }),
          option({
            text: "妳還覺得我們不該接嗎？",
            next: "after_say_ethics",
            set: {
              ethics_question: true
            }
          }),
          option({
            text: "我不知道這算什麼。",
            next: "after_say_unknown",
            set: {
              admit_unknown: true
            }
          }),
          option({
            text: "沉默。",
            next: "three_months_later",
            set: {
              silent_after: true
            }
          })
        ],
        conversation: {
          layout: "choice",
          participants: [],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        },
        choiceUi: {
          widthRatio: 0.4,
          textAlign: "center",
          fontScale: "standard"
        }
      })
    ],
    after_say_completed: [
      context({
        mode: "afterward"
      }),
      line({
        role: "mercer",
        text: "我們完成了。",
        position: "left",
        conversation: {
          layout: "duo",
          participants: ["mercer", "ruri"],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      line({
        role: "ruri",
        text: "我知道。",
        expression: "uneasy",
        position: "right"
      }),
      line({
        role: "mercer",
        text: "妳聽起來不像高興。",
        position: "left"
      }),
      line({
        role: "ruri",
        text: "完成不是只有一種意思。\n有些傷害也會被完成。",
        position: "right"
      }),
      jump({
        next: "three_months_later"
      })
    ],
    after_say_ethics: [
      context({
        mode: "afterward"
      }),
      line({
        role: "mercer",
        text: "妳還覺得我們不該接嗎？",
        position: "left",
        conversation: {
          layout: "duo",
          participants: ["mercer", "ruri"],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      line({
        role: "ruri",
        text: "我現在更不知道了。",
        expression: "easy",
        position: "right"
      }),
      line({
        role: "mercer",
        text: "這算進步還是退步？",
        position: "left"
      }),
      line({
        role: "ruri",
        text: "這樣...算是事情變得比較真實了。",
        expression: "silent",
        position: "right"
      }),
      jump({
        next: "three_months_later"
      })
    ],
    after_say_unknown: [
      context({
        mode: "afterward"
      }),
      line({
        role: "mercer",
        text: "我不知道這算什麼。",
        expression: "silent",
        position: "left",
        conversation: {
          layout: "duo",
          participants: ["mercer", "ruri"],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      line({
        role: "ruri",
        text: "你終於說了。",
        position: "right"
      }),
      line({
        role: "mercer",
        text: "說什麼？",
        position: "left"
      }),
      line({
        role: "ruri",
        text: "說你不知道。\n你一直都很會把不知道包裝成流程。",
        position: "right"
      }),
      clearSprites(),
      jump({
        next: "three_months_later"
      })
    ],
    three_months_later: [
      scene({
        mode: "office",
        label: "三個月後 / Before Fades 辦公室",
        value: "mercer",
        ui: "g",
        layout: "group",
        participants: ["cate", "remy", "mercer", "ruri"],
        voiceOnly: ["none"]
      }),
      bg({
        id: "office_news",
        transition: "fade",
        waitAfter: 700,
        displayMode: "background"
      }),
      music({
        id: "afterward",
        volume: 0.32,
        loop: true,
        fade: 1200
      }),
      sound({
        id: "news",
        volume: 0.5
      }),
      note({
        title: "NEWS",
        text: "奇點無限創辦人傑米・詹，於今日凌晨在家中病逝，享年三十六歲。\n奇點無限股價開盤後應聲漲停。"
      }),
      line({
        text: "Before Fades 辦公室裡，光線很冷。\n電視新聞聲音正在播放。\n老麵、凱特、雷老師、庭如都在，沒有一個人坐得很舒服。"
      }),
      line({
        speaker: "新聞主播",
        text: "奇點無限創辦人傑米・詹，於今日凌晨在家中病逝，享年三十六歲。",
        leaveAfter: true
      }),
      line({
        speaker: "新聞主播",
        text: "三個月前。\n他曾在一場極具爭議的生前告別秀中，公開發表AI人格備份與數位永生計畫「輪迴」。",
        leaveAfter: true
      }),
      line({
        speaker: "新聞主播",
        text: "當時許多評論認為，這只是一次高明卻殘酷的死亡行銷。",
        leaveAfter: true
      }),
      line({
        speaker: "新聞主播",
        text: "然而隨著傑米・詹今日正式離世。\n奇點無限宣布，將依照其生前安排，啟動第一階段人格上傳與董事會顧問模型測試。",
        leaveAfter: true
      }),
      line({
        speaker: "新聞主播",
        text: "奇點無限股價開盤後應聲漲停。",
        leaveAfter: true
      }),
      clearSprites(),
      bg({
        id: "stock_news",
        transition: "fade",
        waitAfter: 700,
        displayMode: "bg"
      }),
      line({
        role: "cate",
        text: "他真的死了。",
        position: "left"
      }),
      line({
        role: "cate",
        text: "明明知道他會死。\n可是看到新聞，還是覺得……",
        position: "left"
      }),
      line({
        role: "remy",
        text: "我昨天還在剪那天的片。",
        position: "right"
      }),
      hide({
        id: "cate"
      }),
      line({
        role: "mercer",
        text: "你不是說要封存檔案？",
        position: "left"
      }),
      line({
        role: "remy",
        text: "是啊。\n所以我打開看了一下，又封回去了。\n那個混蛋真的很會講。",
        position: "right"
      }),
      hide({
        id: "mercer"
      }),
      hide({
        id: "remy"
      }),
      line({
        role: "cate",
        text: "也真的很會傷人。",
        position: "left"
      }),
      hide({
        id: "cate"
      }),
      line({
        role: "ruri",
        text: "那天晚上，我感覺到的所有情緒，都是真的。",
        expression: "empathy",
        position: "left"
      }),
      line({
        role: "ruri",
        text: "他的恐懼是真的。",
        position: "left"
      }),
      line({
        role: "ruri",
        text: "他的驕傲是真的。",
        position: "left"
      }),
      line({
        role: "ruri",
        text: "他的悲傷是真的。",
        expression: "empathy",
        position: "left"
      }),
      line({
        role: "ruri",
        text: "他的算計也是真的。",
        expression: "uneasy",
        position: "left"
      }),
      line({
        role: "ruri",
        text: "全部都是真的。",
        expression: "silent",
        position: "left"
      }),
      line({
        role: "mercer",
        text: "所以才麻煩。",
        position: "right"
      }),
      clearSprites(),
      line({
        text: "老麵走到電視前，關掉。\n新聞聲音消失，但那條向上的股價線，好像還留在每個人眼睛裡。"
      }),
      jump({
        next: "case_report_01"
      })
    ],
    case_report_01: [
      scene({
        mode: "report",
        label: "案件封存報告",
        value: "mercer",
        ui: "g",
        layout: "choice"
      }),
      clearSprites(),
      bg({
        id: "case_file",
        transition: "fade",
        waitAfter: 700,
        displayMode: "background"
      }),
      music({
        id: "ending",
        volume: 0.34,
        loop: true,
        fade: 1200
      }),
      note({
        title: "CASE 001 / 封存",
        text: "客戶：傑米・詹\n案件：生前告別秀\n狀態：待封存"
      }),
      clearSprites(),
      bg({
        id: "doc_case_report",
        transition: "fade",
        waitAfter: 10,
        displayMode: "document",
        documentTarget: "sidePanelExpandable",
        documentTitle: "Before Fades 案件封存報告"
      }),
      line({
        text: "老麵坐回電腦前。\n案件管理系統打開。\n游標停在最後一欄，等待他替這一切命名。"
      }),
      select({
        prompt: "這場告別是否完成客戶需求？",
        options: [
          option({
            text: "是。",
            next: "case_report_truth",
            set: {
              report_completed: true
            }
          }),
          option({
            text: "否。 流程完成，但告別本身被商業發表破壞。",
            next: "case_report_truth",
            set: {
              report_ethics: true
            }
          }),
          option({
            text: "無法判定。 完成與傷害並存。",
            next: "case_report_truth",
            set: {
              report_paradox: true
            }
          })
        ],
        choiceUi: {
          widthRatio: 0.5,
          textAlign: "center",
          fontScale: "standard"
        }
      })
    ],
    case_report_truth: [
      context({
        mode: "report"
      }),
      select({
        prompt: "這場告別是否真誠？",
        options: [
          option({
            text: "是。 真誠不因商業目的存在而完全失效。",
            next: "case_report_legacy",
            set: {
              truth_yes: true
            }
          }),
          option({
            text: "否。 情緒被導向產品發表節點。",
            next: "case_report_legacy",
            set: {
              truth_no: true
            }
          }),
          option({
            text: "是，但不乾淨。",
            next: "case_report_legacy",
            set: {
              truth_dirty: true
            }
          }),
          option({
            text: "不是，但有真心。",
            next: "case_report_legacy",
            set: {
              truth_partial: true
            }
          })
        ],
        conversation: {
          layout: "choice",
          participants: [],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        },
        choiceUi: {
          widthRatio: 0.4,
          textAlign: "center",
          fontScale: "standard"
        }
      })
    ],
    case_report_legacy: [
      context({
        mode: "report"
      }),
      select({
        prompt: "Before Fades 留下了什麼？",
        options: [
          option({
            text: "一場成功案例。",
            next: "ending_route_check_ethics",
            set: {
              legacy_success: true
            }
          }),
          option({
            text: "一道倫理傷口。",
            next: "ending_b",
            set: {
              legacy_ethics: true
            }
          }),
          option({
            text: "一段無法歸類的餘韻。",
            next: "ending_c",
            set: {
              legacy_paradox: true
            }
          }),
          option({
            text: "一次太完美的錯誤。",
            next: "ending_b",
            set: {
              legacy_guilt: true
            }
          })
        ],
        conversation: {
          layout: "choice",
          participants: [],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        },
        choiceUi: {
          widthRatio: 0.3,
          textAlign: "center",
          fontScale: "standard"
        }
      })
    ],
    ending_route_check_ethics: [
      context({
        mode: "report"
      }),
      route({
        branches: [
          whenFlag("ending_ethics", "ending_b"),
          whenFlag("ending_paradox", "ending_c")
        ],
        default: "ending_a",
        conversation: {
          layout: "narrative",
          participants: [],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      })
    ],
    ending_a: [
      context({
        mode: "report"
      }),
      sound({
        id: "keyboard",
        volume: 0.38,
        conversation: {
          layout: "narrative",
          participants: [],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      line({
        text: "我們完成了他的委託。"
      }),
      line({
        text: "他想被記得成一個至死仍在顛覆世界的人。他不是安靜退場的人，他也不想被安靜地原諒。他要燈光、舞台、笑聲、震驚、新聞、股價，以及所有人無法立刻說清楚的沉默。"
      }),
      line({
        text: "我們沒有替他美化，也沒有替他懺悔。\n我們只是把他人生最後的矛盾，完整留了下來。"
      }),
      line({
        text: "如果那就是傑米・詹想被記得的樣子。\n那麼，本案完成。"
      }),
      jump({
        next: "final_screen"
      })
    ],
    ending_b: [
      context({
        mode: "report"
      }),
      sound({
        id: "keyboard",
        volume: 0.38,
        conversation: {
          layout: "narrative",
          participants: [],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      line({
        text: "我們完成了他的委託。"
      }),
      line({
        text: "但完成，不代表無罪。\n那天晚上，他留下了真心，也留下了傷口。\n他真的害怕，也真的利用了別人的悲傷。"
      }),
      line({
        text: "我們真的幫助他告別，也真的幫助他，把告別做成了一場產品發表。"
      }),
      line({
        text: "有些餘韻不是被設計出來的，是被人承受下來的。"
      }),
      line({
        text: "本案封存。\n但不結案。"
      }),
      jump({
        next: "final_screen"
      })
    ],
    ending_c: [
      context({
        mode: "report"
      }),
      sound({
        id: "keyboard",
        volume: 0.38,
        conversation: {
          layout: "narrative",
          participants: [],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      line({
        text: "那天晚上，所有情緒都是真的。"
      }),
      line({
        text: "他的恐懼是真的。他的驕傲是真的。\n他的悲傷是真的。他的算計也是真的。"
      }),
      line({
        text: "我們沒有解開死亡，也沒有證明永生。"
      }),
      line({
        text: "我們只是替它打了一束太漂亮的光。\n然後看著所有人，在那束光裡，看見自己想看的東西。"
      }),
      jump({
        next: "final_screen"
      })
    ],
    final_screen: [
      context({
        mode: "title"
      }),
      clearSprites({
        conversation: {
          layout: "narrative",
          participants: [],
          voiceOnlyParticipants: [],
          placementPolicy: "primary-left-secondary-right-swap-once",
          clearPolicy: "clear-at-scene-boundary-and-major-visual-change"
        }
      }),
      bg({
        id: "white_rose",
        transition: "fade",
        waitAfter: 700,
        displayMode: "background"
      }),
      music({
        id: "ending",
        volume: 0.28,
        loop: true,
        fade: 1200
      }),
      sound({
        id: "stamp",
        volume: 0.42
      }),
      note({
        title: "Before Fades",
        text: "CASE CLOSED"
      }),
      line({
        text: "黑暗中，那朵白玫瑰慢慢浮現。\n它仍在玻璃瓶裡。花瓣邊緣出現一點點枯黃。\n這一次，沒有人叫凱特去換掉。"
      }),
      line({
        text: "有些人不是在死亡時離開。\n是在沒有人再提起他的時候，慢慢淡出。"
      }),
      effect({
        name: "fadeBlack",
        ms: 2600,
        finalLogo: true,
        logoFadeMs: 1800
      }),
      endGame({
        finalLogo: true,
        logoFadeMs: 1800
      })
    ]
  };


  return { meta: META, assets: ASSETS, scenes };
})();
