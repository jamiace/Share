"use strict";

/***********************************************************************
 * Before Fades Engine Module: core.js
 * Loaded as a classic script. Shared engine bindings are available globally.
 ***********************************************************************/

    /***********************************************************************
     * Before Fades Static Web Visual Novel Engine
     * ---------------------------------------------------------------------
     * 使用方式：
     * 專案拆分版：
     * - index.html：HTML 骨架與外部檔案載入
     * - style.css：版面、色彩、元件樣式
     * - engine.js：狀態管理、DOM 操作、音效、動畫與遊戲流程
     * - config.js：META、ASSETS、CAST
     * - macros.js：劇本巨集
     * - scenes.js：純劇本流程
     * - resource/*：圖片、BGM、音效、VFX 素材
     *
     * 新增：焦點 UI 指令。
     *   { "type": "ui", "v": "g" }  灰色：老麵、凱特、雷老師、系統旁白等一般焦點
     *   { "type": "ui", "v": "t" }  暖黃色：庭如操作／共感焦點
     *   { "type": "ui", "v": "j" }  冷藍色：傑米台上表演焦點
     * 也可以掛在任一指令上：{ "type": "say", "ui": "t", "speaker": "庭如", "text": "..." }
     *
     * 共感文字特效：
     *   { "type": "effect", "name": "empathy", "words": ["期待"] }       原上升效果
     *   { "type": "effect", "name": "empathyUp", "words": ["期待"] }     明確上升
     *   { "type": "effect", "name": "empathyDown", "words": ["恐懼"] }  新增下墜
     *   { "type": "effect", "name": "empathy", "direction": "down", "words": ["恐懼"] }  同樣下墜
     ***********************************************************************/

    const CONFIG = {
      scriptGlobalName: "BEFORE_FADES_SCRIPT",
      textSpeed: 26,
      bgmFadeMs: 900,
      bgPostSwitchDelayMs: 680,
      choiceLayout: {
        defaultPreset: "default",
        presets: {
          default: { widthRatio: 0.70, maxWidthPx: 1000, viewportPaddingPx: 48, textAlign: "center" },
          title: { widthRatio: 0.3, maxWidthPx: 400, viewportPaddingPx: 48, textAlign: "center", fontScale: "title" },
          compact: { widthRatio: 0.30, maxWidthPx: 520, viewportPaddingPx: 48, textAlign: "center" },
          medium: { widthRatio: 0.50, maxWidthPx: 680, viewportPaddingPx: 48, textAlign: "center" },
          wide: { widthRatio: 0.70, maxWidthPx: 860, viewportPaddingPx: 48, textAlign: "center" }
        }
      },
      emotion: {
        defaultLifeMs: 5800,
        staggerMs: 150,
        // 共感演出的正式可調參數放在 config.js 的 window.BF_CONFIG.ENGINE.emotion。
        // engine.js 只保留流程與最低保底值。
        empathy: {
          defaultDirection: "up",
          durationMs: 6860,
          holdBeforeWordsMs: 350,
          lockInput: false,
          hideUiDuringEffect: true,
          wordMultiplier: 1,
          profiles: {
            up: { visualBg: "cg_empathy_warm", wordDirection: "up" },
            down: { visualBg: "cg_empathy_fall", wordDirection: "down" }
          }
        },
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
        },
        layout: {
          up: { leftVw: 9, topVh: 12, spreadVw: 78, spreadVh: 46, stepX: 29, stepY: 18, rowOffsetX: 11, rowOffsetY: 8 },
          down: { leftVw: 9, topVh: 10, spreadVw: 78, spreadVh: 42, stepX: 29, stepY: 17, rowOffsetX: 11, rowOffsetY: 7 }
        },
        motionProfiles: {
          up: {
            fadeInAt: 0.18,
            holdUntil: 0.78,
            start: { opacity: 0, yPx: 12, scale: 0.96, blurPx: 6 },
            visible: { opacity: 1, yPx: 0, scale: 1, blurPx: 0 },
            hold: { opacity: 0.92 },
            end: { opacity: 0, yPx: -52, scale: 1.06, blurPx: 2 }
          },
          down: {
            fadeInAt: 0.18,
            holdUntil: 0.62,
            start: { opacity: 0, yPx: -18, scale: 1.03, blurPx: 7 },
            visible: { opacity: 1, yPx: 0, scale: 1, blurPx: 0 },
            hold: { opacity: 0.88, yPx: 22, scale: 0.98, blurPx: 0.5 },
            end: { opacity: 0, yPx: 82, scale: 0.90, blurPx: 3 }
          }
        }
      },
      imagePreloadConcurrency: 8,
      imagePreloadTimeoutMs: 15000,
      keepPreloadedImageRefs: true,
      defaultBg: "radial-gradient(circle at 50% 30%, #202530 0%, #080a0e 65%, #020305 100%)"
    };

    const state = {
      script: null,
      sceneId: "start",
      index: 0,
      flags: {},
      busy: false,
      typing: false,
      fullText: "",
      typeTimer: null,
      awaitingChoice: false,
      startedAudio: false,
      currentBgmId: null,
      currentMode: "system",
      currentSceneMode: "system",
      currentConversation: null,
      currentBgId: "",
      currentDocId: "",
      currentUi: "g",
      currentChoiceUi: null,
      pendingAfterTextActions: [],
      continueAfterBusy: false,
      bgmToken: 0,
      spriteZ: 20,
      sprites: new Map(),
      dialogueLayout: { primaryId: "", secondaryId: "", swappedOnce: false },
      pendingSpriteMoveMs: 0,
      awaitingTitleChoiceClick: false,
      titleChoiceRevealed: false,
      inputLocked: false,
      preloadedImages: new Map(),
      preloadReport: null
    };

    const EMPTY_SCRIPT = {
      meta: {
        title: "Before Fadeout Static Web Visual Novel Engine",
        version: "engine-only"
      },
      assets: {
        backgrounds: {},
        characters: {},
        bgm: {},
        ambience: {},
        sfx: {}
      },
      scenes: {
        start: [
          { "type": "ui", "v": "g", "label": "SYSTEM / NO SCRIPT" },
          { "type": "note", "title": "SCRIPT NOT FOUND", "text": "找不到 data/script.js。\n請建立劇情腳本檔案後重新整理頁面。" },
          { "type": "narrate", "text": "找不到 data/script.js。這個 index.html 是純遊戲引擎，不包含正式劇情。" },
          { "type": "end" }
        ]
      }
    };

    function applyExternalEngineConfig() {
      const external = window.BF_CONFIG?.ENGINE || window.BF_CONFIG?.engine || window.BF_CONFIG?.runtime || null;
      if (external && typeof external === "object") deepMerge(CONFIG, external);
    }

    function deepMerge(target, source) {
      if (!source || typeof source !== "object") return target;
      Object.entries(source).forEach(([key, value]) => {
        if (value && typeof value === "object" && !Array.isArray(value)) {
          if (!target[key] || typeof target[key] !== "object" || Array.isArray(target[key])) target[key] = {};
          deepMerge(target[key], value);
        } else {
          target[key] = value;
        }
      });
      return target;
    }

    function numberOr(value, fallback) {
      const n = Number(value);
      return Number.isFinite(n) ? n : fallback;
    }

    async function init() {
      applyExternalEngineConfig();
      bindEvents();
      showLoadingScreen("讀取劇本中……", 0, 0);
      state.script = await loadScript();
      setGameVersion();
      state.preloadReport = await preloadAllImagesWithProgress();
      validateScene(state.sceneId);
      applyFocusUi("g", "SYSTEM / READY");
      setSideNote("SYSTEM", `腳本載入完成：${state.script.meta?.title || "Untitled"}\n圖片素材：${state.preloadReport.ok}/${state.preloadReport.total} 已載入，失敗 ${state.preloadReport.failed}。\n按一下文字框或按 Enter / Space 推進。`);
      hideLoadingScreen();
      await wait(260);
      await runCurrent();
    }

    async function loadScript() {
      const scriptData = window[CONFIG.scriptGlobalName];

      if (scriptData && typeof scriptData === "object") {
        return scriptData;
      }

      console.warn(
        `無法載入劇本。請確認 config.js、macros.js、scenes.js 已依序載入，且 scenes.js 有設定 window.${CONFIG.scriptGlobalName}。`
      );
      return EMPTY_SCRIPT;
    }

    async function runCurrent() {
      if (state.busy || state.awaitingChoice) return;
      const scene = getScene();
      if (!scene[state.index]) return;
      state.busy = true;
      const cmd = scene[state.index];
      try {
        await execute(cmd);
      } catch (err) {
        console.error("Command error:", cmd, err);
        await showText("系統", `腳本指令執行錯誤：${cmd.type || "unknown"}\n${err.message}`, "system");
      } finally {
        state.busy = false;
        if (state.continueAfterBusy && !state.awaitingChoice && !state.typing) {
          state.continueAfterBusy = false;
          runCurrent();
        }
      }
    }

    async function execute(cmd = {}) {
      applyDirectingContext(cmd);

      if (cmd.ui || cmd.focus) {
        applyFocusUi(cmd.ui || cmd.focus, cmd.label);
      }

      switch (cmd.type) {
        case "say":
          await showText(cmd.speaker || "", cmd.text || "", classifySpeaker(cmd.speaker), cmd);
          break;
        case "narrate":
          if (shouldSuppressInitialTitleUi(cmd)) nextCommand();
          else await showText("旁白", cmd.text || "", "narrator", cmd);
          break;
        case "ui":
        case "focus":
          applyFocusUi(cmd.v || cmd.value || cmd.focus || cmd.ui || "g", cmd.label || cmd.l);
          nextCommand();
          break;
        case "mode":
          setMode(cmd.value || cmd.v || "system", cmd.label || cmd.l || cmd.value || cmd.v || "SYSTEM", cmd);
          nextCommand();
          break;
        case "context":
          // context 的實際狀態已由 applyDirectingContext() 處理；這裡只負責前進。
          nextCommand();
          break;
        case "bg":
          await setBackground(cmd);
          nextCommand();
          break;
        case "show":
          await showSprite(cmd);
          nextCommand();
          break;
        case "hide":
          await hideSprite(cmd.id);
          nextCommand();
          break;
        case "clearSprites":
          clearSprites();
          nextCommand();
          break;
        case "bgm":
          await playBgm(cmd.id, cmd.volume, cmd.loop, cmd.fade);
          nextCommand();
          break;
        case "sfx":
          playSfx(cmd.id, cmd.volume);
          nextCommand();
          break;
        case "effect":
          await runEffect(cmd);
          nextCommand();
          break;
        case "wait":
          await wait(cmd.ms || 500);
          nextCommand();
          break;
        case "choice":
          await showChoice(cmd);
          break;
        case "jump":
          jumpTo(cmd.next);
          break;
        case "route":
          handleRoute(cmd);
          break;
        case "if":
          handleIf(cmd);
          break;
        case "note":
          if (shouldSuppressInitialTitleUi(cmd)) {
            nextCommand();
          } else {
            setSideNote(cmd.title || "NOTE", cmd.text || "");
            nextCommand();
          }
          break;
        case "end":
          await endGame();
          break;
        default:
          console.warn("Unknown command:", cmd);
          nextCommand();
      }
    }

    function advance() {
      if (state.inputLocked || state.awaitingChoice || isDocumentViewerOpen()) return;
      unlockAudio();
      if (state.typing) {
        finishTyping();
        return;
      }
      if (!state.busy) nextCommand();
    }

    function nextCommand() {
      processPendingAfterTextActions();
      state.index += 1;
      if (state.busy) {
        state.continueAfterBusy = true;
        return;
      }
      runCurrent();
    }

    function getScene() {
      validateScene(state.sceneId);
      return state.script.scenes[state.sceneId];
    }

    function validateScene(id) {
      if (!state.script?.scenes?.[id]) throw new Error(`找不到場景：${id}`);
    }

    function jumpTo(sceneId) {
      validateScene(sceneId);
      state.sceneId = sceneId;
      state.index = 0;
      dom.choices.style.display = "none";
      dom.choices.innerHTML = "";
      dom.choices.classList.remove("title-choice-mode", "standard-choice-mode");
      state.awaitingChoice = false;
      state.awaitingTitleChoiceClick = false;
      state.titleChoiceRevealed = false;
      updateTitleScreenChrome();
      if (state.busy) {
        state.continueAfterBusy = true;
        return;
      }
      runCurrent();
    }

    function handleIf(cmd) {
      const actual = getFlag(cmd.flag);
      const match = ("equals" in cmd) ? actual === cmd.equals : Boolean(actual);
      const target = match ? cmd.then : cmd.else;
      if (target) jumpTo(target);
      else nextCommand();
    }

    function handleRoute(cmd) {
      const branches = Array.isArray(cmd.branches) ? cmd.branches : [];
      const matched = branches.find(branchMatches);
      const target = matched?.next || cmd.default || cmd.else || cmd.fallback;
      if (target) jumpTo(target);
      else nextCommand();
    }

    function branchMatches(branch = {}) {
      if (Array.isArray(branch.all)) return branch.all.every(flag => Boolean(getFlag(flag)));
      if (Array.isArray(branch.any)) return branch.any.some(flag => Boolean(getFlag(flag)));
      if (Array.isArray(branch.not)) return branch.not.every(flag => !getFlag(flag));
      if (typeof branch.not === "string") return !getFlag(branch.not);
      if (branch.flag) {
        const actual = getFlag(branch.flag);
        return ("equals" in branch) ? actual === branch.equals : Boolean(actual);
      }
      return false;
    }

    function getFlag(path) { return state.flags[path]; }

    function applySet(values) {
      Object.entries(values).forEach(([key, value]) => { state.flags[key] = value; });
    }

    async function endGame() {
      clearSprites();
      hideDocumentViewer();
      dom.choices.style.display = "none";
      dom.choices.innerHTML = "";
      state.awaitingChoice = false;
      clearDialogueUi();

      dom.game.classList.add("final-ending-active");
      updateTitleLogo("logo_beforefades");

      if (dom.uiLayer) {
        dom.uiLayer.style.transition = "opacity 900ms ease";
        dom.uiLayer.style.opacity = "0";
      }

      await fadeBlack(900);
    }

    function escapeHtml(value) {
      return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;")
        .replaceAll("\n", "<br>");
    }

    function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

    function nextFrame() {
      return new Promise(resolve => requestAnimationFrame(() => resolve()));
    }
