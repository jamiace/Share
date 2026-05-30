"use strict";

/*
 * Before Fades Project - Static configuration
 * META / ASSETS / CAST only. No scene flow, no DOM logic.
 */
window.BF_CONFIG = (() => {
  const META = {
    title: "Before Fades：地獄脫口秀的產品發表會",
    version: "2.1.3-directed-script-real-diff-fixed-runtime-clean",
    language: "zh-Hant",
    engine: "Before Fades Static Web Visual Novel Engine",
    startScene: "start",
    description: "完整文本版：擴充地獄脫口秀、共感、舞台cue、演出結束觀察與案件封存。 / 新增相容式導演腳本欄位：sceneMode、conversation、displayMode、documentTarget、speakerFocus、lockInput。 / 2.1.1：整理 Title Screen、共感滿版流程、舞台站位、錄影/文件殘留與 doc_voice_wave 顯示順序。 / 2.1.2：實際修正休息室、案件回憶、舞台鏡頭、尾聲站位與結尾淡出。",
    cleanup: {
      scope: "runtime-safe cleanup for current index.html",
      removed: [
        "unreachable help scene",
        "unused duplicate asset aliases",
        "unused annotation fields"
      ]
    }
  };


  const ENGINE = {
    emotion: {
      /*
       * 情緒感知的正式演出設定。
       * scenes.js 只需要說「empathyUp / empathyDown」與提供 words。
       * 方向、背景圖、文字動態、是否鎖操作、顯示多久、文字出現延遲，都集中在這裡。
       */
      empathy: {
        defaultDirection: "up",
        durationMs: 6860,
        holdBeforeWordsMs: 350,
        lockInput: false,
        hideUiDuringEffect: true,
        wordMultiplier: 1,
        profiles: {
          up: {
            visualBg: "cg_empathy_warm",
            wordDirection: "up"
          },
          down: {
            visualBg: "cg_empathy_fall",
            wordDirection: "down"
          }
        }
      },

      /*
       * 情緒感知全螢幕背景圖設定。
       * fadeInMs / fadeOutMs：進退場時間。
       * startOpacity / targetOpacity：起始透明度與最終透明度。
       * startBlurPx / endBlurPx / exitBlurPx：進場起始、穩定狀態、退場結束的模糊度。
       */
      backdrop: {
        fadeInMs: 1200,
        fadeOutMs: 1200,
        startOpacity: 0,
        targetOpacity: 1,
        startBlurPx: 30,
        endBlurPx: 0,
        exitBlurPx: 30,
        startScale: 1.035,
        endScale: 1,
        exitScale: 1.025
      }
    }
  };


  const ASSETS = {
    backgrounds: {
      title: {
        src: "resource/image/bg_title_mic_rose.jpg"
      },
      control_room: {
        src: "resource/image/bg_control_room.jpg"
      },
      control_room_dark: {
        src: "resource/image/bg_control_room_dark.jpg"
      },
      stage_dark: {
        src: "resource/image/bg_stage_dark.jpg"
      },
      stage_show: {
        src: "resource/image/bg_stage_show.jpg"
      },
      stage_confession: {
        src: "resource/image/bg_stage_confession.jpg"
      },
      stage_reincarnation: {
        src: "resource/image/bg_stage_reincarnation.jpg"
      },
      jamie_room: {
        src: "resource/image/bg_jamie_room.jpg"
      },
      case_file: {
        src: "resource/image/bg_case_file.jpg"
      },
      office_news: {
        src: "resource/image/bg_office_news.jpg"
      },
      white_rose: {
        src: "resource/image/cg_white_rose.jpg"
      },
      young_jamie_video: {
        src: "resource/image/cg_young_jamie_video.jpg"
      },
      stock_news: {
        src: "resource/image/cg_stock_news.jpg"
      },
      cg_empathy_warm: {
        src: "resource/image/cg_empathy_warm.jpg"
      },
      cg_empathy_fall: {
        src: "resource/image/cg_empathy_fall.jpg"
      },
      cg_empty_stage_after: {
        src: "resource/image/cg_empty_stage_after.jpg"
      },
      cg_reincarnation_boot: {
        src: "resource/image/cg_reincarnation_boot.jpg"
      },
      cg_audience_laugh: {
        src: "resource/image/cg_audience_laugh.jpg"
      },
      cg_wei_silent: {
        src: "resource/image/cg_wei_silent.jpg"
      },
      cg_memory_phone: {
        src: "resource/image/cg_memory_phone.jpg"
      },
      doc_medical_report: {
        src: "resource/image/doc_medical_report.jpg"
      },
      doc_case_report: {
        src: "resource/image/doc_case_report.jpg"
      },
      doc_jamie_script: {
        src: "resource/image/doc_jamie_script.jpg"
      },
      doc_reincarnation_pitch: {
        src: "resource/image/doc_reincarnation_pitch.jpg"
      },
      doc_guest_list: {
        src: "resource/image/doc_guest_list.jpg"
      },
      doc_rundown: {
        src: "resource/image/doc_rundown.jpg"
      },
      doc_media_news: {
        src: "resource/image/doc_media_news.jpg"
      },
      doc_internal_mail: {
        src: "resource/image/doc_internal_mail.jpg"
      },
      doc_seating_plan: {
        src: "resource/image/doc_seating_plan.jpg"
      },
      doc_voice_wave: {
        src: "resource/image/doc_voice_wave.jpg"
      },
      logo_beforefades: {
        src: "resource/image/logo_beforefades.png"
      }
    },
    characters: {
      mercer: {
        default: "resource/image/ch_mercer_default.png",
        serious: "resource/image/ch_mercer_serious.png",
        silent: "resource/image/ch_mercer_silent.png"
      },
      ruri: {
        default: "resource/image/ch_ruri_default.png",
        empathy: "resource/image/ch_ruri_empathy.png",
        uneasy: "resource/image/ch_ruri_uneasy.png",
        silent: "resource/image/ch_ruri_silent.png"
      },
      jamie: {
        nervous: "resource/image/ch_jamie_nervous.png",
        show: "resource/image/ch_jamie_show.png",
        confession: "resource/image/ch_jamie_confession.png",
        reincarnation: "resource/image/ch_jamie_reincarnation.png"
      },
      cate: {
        default: "resource/image/ch_cate_default.png"
      },
      remy: {
        default: "resource/image/ch_remy_default.png"
      },
      wei: {
        default: "resource/image/ch_wei_default.png"
      }
    },
    bgm: {
      title: "resource/bgm/title.mp3",
      control: "resource/bgm/control_room.mp3",
      empathy: "resource/bgm/empathy.mp3",
      jamie_room: "resource/bgm/jamie_room.mp3",
      case_file: "resource/bgm/case_file.mp3",
      showtime: "resource/bgm/showtime.mp3",
      confession: "resource/bgm/confession.mp3",
      reincarnation: "resource/bgm/reincarnation.mp3",
      afterward: "resource/bgm/afterward.mp3",
      ending: "resource/bgm/ending.mp3"
    },
    sfx: {
      ui_click: "resource/sound_effect/ui_click.mp3",
      comm: "resource/sound_effect/comm_noise.mp3",
      monitor: "resource/sound_effect/monitor_switch.mp3",
      keyboard: "resource/sound_effect/keyboard.mp3",
      door: "resource/sound_effect/door_open.mp3",
      glass: "resource/sound_effect/glass_down.mp3",
      mic: "resource/sound_effect/mic_touch.mp3",
      spotlight: "resource/sound_effect/spotlight_on.mp3",
      audience_murmur: "resource/sound_effect/audience_murmur.mp3",
      awkward_laugh: "resource/sound_effect/audience_awkward_laugh.mp3",
      big_laugh: "resource/sound_effect/audience_big_laugh.mp3",
      applause_sparse: "resource/sound_effect/applause_sparse.mp3",
      crowd_shock: "resource/sound_effect/crowd_shock.mp3",
      led: "resource/sound_effect/led_on.mp3",
      phone: "resource/sound_effect/phone_vibrate.mp3",
      news: "resource/sound_effect/news_sting.mp3",
      stamp: "resource/sound_effect/case_stamp.mp3"
    },
    imageManifest: {
      bg_title_mic_rose: {
        src: "resource/image/bg_title_mic_rose.jpg",
        category: "background",
        description: "標題畫面。黑暗中一支麥克風，旁邊一朵白玫瑰，花瓣邊緣微微枯黃。"
      },
      bg_control_room: {
        src: "resource/image/bg_control_room.jpg",
        category: "background",
        description: "Before Fades 的後台臨時指揮中心。"
      },
      bg_control_room_dark: {
        src: "resource/image/bg_control_room_dark.jpg",
        category: "background",
        description: "庭如共感模式下的控制室暗色版。"
      },
      bg_stage_dark: {
        src: "resource/image/bg_stage_dark.jpg",
        category: "background",
        description: "主舞台開場前。"
      },
      bg_stage_show: {
        src: "resource/image/bg_stage_show.jpg",
        category: "background",
        description: "地獄脫口秀進行中的舞台。"
      },
      bg_stage_confession: {
        src: "resource/image/bg_stage_confession.jpg",
        category: "background",
        description: "真心告白段落。"
      },
      bg_stage_reincarnation: {
        src: "resource/image/bg_stage_reincarnation.jpg",
        category: "background",
        description: "【輪迴】產品發表瞬間。"
      },
      bg_jamie_room: {
        src: "resource/image/bg_jamie_room.jpg",
        category: "background",
        description: "傑米休息室。"
      },
      bg_case_file: {
        src: "resource/image/bg_case_file.jpg",
        category: "background",
        description: "案件資料介面／庭如回憶段／案件封存報告共用。"
      },
      bg_office_news: {
        src: "resource/image/bg_office_news.jpg",
        category: "background",
        description: "三個月後 Before Fades 辦公室。"
      },
      cg_white_rose: {
        src: "resource/image/cg_white_rose.jpg",
        category: "cg",
        description: "白玫瑰特寫。"
      },
      cg_young_jamie_video: {
        src: "resource/image/cg_young_jamie_video.jpg",
        category: "cg",
        description: "年輕傑米的黑白創業錄影。"
      },
      cg_stock_news: {
        src: "resource/image/cg_stock_news.jpg",
        category: "cg",
        description: "三個月後新聞畫面。"
      },
      cg_empathy_warm: {
        src: "resource/image/cg_empathy_warm.jpg",
        category: "cg",
        description: "庭如共感正向／複雜但溫暖情緒過場。"
      },
      cg_empathy_fall: {
        src: "resource/image/cg_empathy_fall.jpg",
        category: "cg",
        description: "庭如共感負面／沉重／墜落情緒過場。"
      },
      cg_empty_stage_after: {
        src: "resource/image/cg_empty_stage_after.jpg",
        category: "cg",
        description: "演出結束後的空舞台。"
      },
      cg_reincarnation_boot: {
        src: "resource/image/cg_reincarnation_boot.jpg",
        category: "cg",
        description: "【輪迴】系統啟動畫面。"
      },
      cg_audience_laugh: {
        src: "resource/image/cg_audience_laugh.jpg",
        category: "cg",
        description: "觀眾開始失控大笑的瞬間。"
      },
      cg_wei_silent: {
        src: "resource/image/cg_wei_silent.jpg",
        category: "cg",
        description: "林薇坐在人群中，沒有笑。"
      },
      cg_memory_phone: {
        src: "resource/image/cg_memory_phone.jpg",
        category: "cg",
        description: "「父親」共感段落。未撥出的電話、病房白牆、電梯。"
      },
      ch_mercer_default: {
        src: "resource/image/ch_mercer_default.png",
        category: "character",
        description: "老麵 default。"
      },
      ch_mercer_serious: {
        src: "resource/image/ch_mercer_serious.png",
        category: "character",
        description: "老麵 serious。"
      },
      ch_mercer_silent: {
        src: "resource/image/ch_mercer_silent.png",
        category: "character",
        description: "老麵 silent。"
      },
      ch_ruri_default: {
        src: "resource/image/ch_ruri_default.png",
        category: "character",
        description: "庭如 default。"
      },
      ch_ruri_empathy: {
        src: "resource/image/ch_ruri_empathy.png",
        category: "character",
        description: "庭如共感狀態。"
      },
      ch_ruri_uneasy: {
        src: "resource/image/ch_ruri_uneasy.png",
        category: "character",
        description: "庭如 uneasy。"
      },
      ch_ruri_silent: {
        src: "resource/image/ch_ruri_silent.png",
        category: "character",
        description: "庭如 silent。"
      },
      ch_jamie_nervous: {
        src: "resource/image/ch_jamie_nervous.png",
        category: "character",
        description: "傑米 nervous。"
      },
      ch_jamie_show: {
        src: "resource/image/ch_jamie_show.png",
        category: "character",
        description: "傑米 show。"
      },
      ch_jamie_confession: {
        src: "resource/image/ch_jamie_confession.png",
        category: "character",
        description: "傑米 confession。"
      },
      ch_jamie_reincarnation: {
        src: "resource/image/ch_jamie_reincarnation.png",
        category: "character",
        description: "傑米「輪迴發表」狀態。"
      },
      ch_cate_default: {
        src: "resource/image/ch_cate_default.png",
        category: "character",
        description: "凱特。"
      },
      ch_remy_default: {
        src: "resource/image/ch_remy_default.png",
        category: "character",
        description: "雷老師。"
      },
      ch_wei_default: {
        src: "resource/image/ch_wei_default.png",
        category: "character",
        description: "林薇。"
      },
      doc_medical_report: {
        src: "resource/image/doc_medical_report.jpg",
        category: "document",
        description: "傑米的診斷摘要。"
      },
      doc_case_report: {
        src: "resource/image/doc_case_report.jpg",
        category: "document",
        description: "Before Fades 案件封存報告。"
      },
      doc_jamie_script: {
        src: "resource/image/doc_jamie_script.jpg",
        category: "document",
        description: "傑米手寫脫口秀講稿。"
      },
      doc_reincarnation_pitch: {
        src: "resource/image/doc_reincarnation_pitch.jpg",
        category: "document",
        description: "【輪迴】產品簡報頁。"
      },
      doc_guest_list: {
        src: "resource/image/doc_guest_list.jpg",
        category: "document",
        description: "生前告別秀來賓名單。"
      },
      doc_rundown: {
        src: "resource/image/doc_rundown.jpg",
        category: "document",
        description: "演出 rundown 流程表。"
      },
      doc_media_news: {
        src: "resource/image/doc_media_news.jpg",
        category: "document",
        description: "媒體新聞網站畫面。"
      },
      doc_internal_mail: {
        src: "resource/image/doc_internal_mail.jpg",
        category: "document",
        description: "奇點無限內部危機 mail。"
      },
      doc_seating_plan: {
        src: "resource/image/doc_seating_plan.jpg",
        category: "document",
        description: "會場座位配置圖。"
      },
      doc_voice_wave: {
        src: "resource/image/doc_voice_wave.jpg",
        category: "document",
        description: "訪談錄音波形畫面。"
      },
      logo_beforefades: {
        src: "resource/image/logo_beforefades.png",
        category: "ui_or_publish",
        description: "Before Fades 遊戲 Logo。"
      }
    }
  };


  const CAST = {
    mercer: { speaker: "老麵", character: "mercer", speakerFocus: "primary", presence: "onscreen" },
    ruri: { speaker: "庭如", character: "ruri", speakerFocus: "primary", presence: "onscreen" },
    jamie: { speaker: "傑米", character: "jamie", speakerFocus: "primary", presence: "onscreen" },
    cate: { speaker: "凱特", character: "cate", speakerFocus: "primary", presence: "onscreen" },
    remy: { speaker: "雷老師", character: "remy", speakerFocus: "primary", presence: "onscreen" },
    wei: { speaker: "林薇", character: "wei", speakerFocus: "primary", presence: "onscreen" },

    mercer_past: { speaker: "老麵（三個月前）", character: "mercer", speakerFocus: "primary", presence: "onscreen" },
    ruri_past: { speaker: "庭如（三個月前）", character: "ruri", speakerFocus: "primary", presence: "onscreen" },
    cate_past: { speaker: "凱特（三個月前）", character: "cate", speakerFocus: "primary", presence: "onscreen" },
    remy_past: { speaker: "雷老師（三個月前）", character: "remy", speakerFocus: "primary", presence: "onscreen" }
  };


  return { META, ASSETS, CAST, ENGINE };
})();
