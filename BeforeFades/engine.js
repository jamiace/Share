"use strict";

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
        backdrop: {
          fadeInMs: 900,
          fadeOutMs: 900,
          holdBeforeWordsMs: 420,
          startOpacity: 0,
          targetOpacity: 1,
          startBlurPx: 18,
          endBlurPx: 0,
          exitBlurPx: 18,
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

    const $ = (id) => document.getElementById(id);

    const dom = {
      game: $("game"),
      uiLayer: $("uiLayer"),
      bg: $("bgLayer"),
      bgImage: $("bgImage"),
      bgMediaFrame: $("bgMediaFrame"),
      titleLogo: $("titleLogo"),
      sprites: $("spriteLayer"),
      effects: $("effectLayer"),
      cutinLayer: $("cutinLayer"),
      cutinImage: $("cutinImage"),
      flash: $("flash"),
      modeBadge: $("modeBadge"),
      speaker: $("speakerName"),
      text: $("dialogueText"),
      dialogueBox: $("dialogueBox"),
      next: $("nextIndicator"),
      choices: $("choices"),
      sidePanel: $("sidePanel"),
      sideTitle: $("sideTitle"),
      sideContent: $("sideContent"),
      sideImageWrap: $("sideImageWrap"),
      sideImage: $("sideImage"),
      docViewer: $("docViewerLayer"),
      docViewerImage: $("docViewerImage"),
      docViewerCaption: $("docViewerCaption"),
      docViewerClose: $("docViewerClose"),
      loading: $("loadingLayer"),
      loadingProgressBar: $("loadingProgressBar"),
      loadingPercent: $("loadingPercent"),
      loadingStatus: $("loadingStatus"),
      loadingCurrent: $("loadingCurrent"),
      loadingStats: $("loadingStats"),
      loadingErrors: $("loadingErrors")
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

    const audio = {
      bgm: new Audio(),
      bgmNext: null,
      ambience: new Audio(),
      sfxPool: []
    };

    audio.bgm.loop = true;
    audio.bgm.volume = 0;
    audio.ambience.loop = true;
    audio.ambience.volume = 0.35;

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

    function bindEvents() {
      dom.game.addEventListener("click", (e) => {
        if (revealPendingTitleChoice()) {
          e.preventDefault();
          e.stopPropagation();
        }
      });
      dom.dialogueBox.addEventListener("click", () => advance());
      document.addEventListener("keydown", (e) => {
        if (state.inputLocked) {
          e.preventDefault();
          return;
        }
        if (isDocumentViewerOpen()) {
          if (["Escape", "Enter", " "].includes(e.key)) {
            e.preventDefault();
            hideDocumentViewer();
          }
          return;
        }
        if (["Enter", " "].includes(e.key)) {
          e.preventDefault();
          if (!revealPendingTitleChoice()) advance();
        }
      });
      dom.sideImageWrap.addEventListener("click", openSideDocument);
      dom.sideImageWrap.addEventListener("keydown", (e) => {
        if (["Enter", " "].includes(e.key)) {
          e.preventDefault();
          openSideDocument();
        }
      });
      dom.docViewerClose.addEventListener("click", hideDocumentViewer);
      dom.docViewer.addEventListener("click", (e) => { if (e.target === dom.docViewer) hideDocumentViewer(); });

      ["click", "keydown", "touchstart"].forEach((eventName) => {
        document.addEventListener(eventName, unlockAudio, { once: true });
      });
    }

    function unlockAudio() {
      state.startedAudio = true;
      [audio.bgm, audio.ambience].forEach(a => {
        a.play().then(() => a.pause()).catch(() => {});
      });
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

    function clearDialogueUi() {
      clearInterval(state.typeTimer);
      state.typeTimer = null;
      state.typing = false;
      state.fullText = "";
      if (dom.speaker) {
        dom.speaker.textContent = "";
        dom.speaker.className = "narrator";
      }
      if (dom.text) dom.text.textContent = "";
      if (dom.next) dom.next.style.opacity = "0";
    }

    function shouldClearDialogueForEffect(cmd = {}) {
      const name = String(cmd.name || "").trim().toLowerCase();
      return [
        "empathy",
        "empathyup",
        "empathydown",
        "empathyfall",
        "empathysink",
        "fadeblack"
      ].includes(name) || cmd.hideUiDuringEffect === true;
    }

    async function showText(speaker, text, className, cmd = {}) {
      const shownCharacterId = await autoShowSpeakerSprite(speaker, text, cmd);
      queueAfterTextActions(cmd, shownCharacterId);
      dom.speaker.textContent = speaker || "旁白";
      dom.speaker.className = className || "narrator";
      dom.text.textContent = "";
      state.fullText = text || "";
      state.typing = true;
      dom.next.style.opacity = "0";

      let i = 0;
      clearInterval(state.typeTimer);
      state.typeTimer = setInterval(() => {
        i += 1;
        dom.text.textContent = state.fullText.slice(0, i);
        if (i >= state.fullText.length) finishTyping();
      }, CONFIG.textSpeed);
    }

    function finishTyping() {
      clearInterval(state.typeTimer);
      state.typeTimer = null;
      dom.text.textContent = state.fullText;
      state.typing = false;
      dom.next.style.opacity = "1";
    }

    function classifySpeaker(speaker) {
      if (!speaker) return "narrator";
      const s = String(speaker).trim().toLowerCase();
      if (["庭如", "ruri"].includes(s)) return "ruri";
      if (["傑米", "jamie", "詹傑明"].includes(s)) return "jamie";
      if (["老麵", "老面", "mercer"].includes(s)) return "mercer";
      if (["凱特", "cate"].includes(s)) return "cate";
      if (["雷老師", "老師", "remy"].includes(s)) return "remy";
      if (["林薇", "wei"].includes(s)) return "wei";
      if (["系統", "system"].includes(s)) return "system";
      return "";
    }

    async function showChoice(cmd) {
      const isTitleChoice = isInitialTitleScene();
      const choiceUi = isTitleChoice ? { preset: "title" } : (cmd.choiceUi || state.currentChoiceUi);
      applyChoiceUi(choiceUi);

      dom.choices.classList.toggle("title-choice-mode", isTitleChoice);
      dom.choices.classList.toggle("standard-choice-mode", !isTitleChoice);

      if (cmd.prompt && !isTitleChoice) {
        dom.speaker.textContent = "選擇";
        dom.speaker.className = "system";
        dom.text.textContent = cmd.prompt;
      }

      dom.choices.innerHTML = "";
      state.awaitingChoice = true;
      const rawOptions = Array.isArray(cmd.options) ? cmd.options : [];
      const options = isTitleChoice
        ? rawOptions.filter(option => String(option.text || "").includes("開始遊戲")).slice(0, 1)
        : rawOptions;

      options.forEach((option, idx) => {
        const btn = document.createElement("button");
        btn.className = "choice-btn";
        btn.textContent = option.text || `選項 ${idx + 1}`;
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          playSfx("ui_click", 0.35);
          if (option.ui || option.focus) applyFocusUi(option.ui || option.focus, option.label);
          applySet(option.set || {});
          dom.choices.style.display = "none";
          dom.choices.innerHTML = "";
          state.awaitingChoice = false;
          state.awaitingTitleChoiceClick = false;
          state.titleChoiceRevealed = false;
          dom.game.classList.remove("title-screen", "title-await-click");
          if (option.next) jumpTo(option.next);
          else nextCommand();
        });
        dom.choices.appendChild(btn);
      });

      if (isTitleChoice) {
        state.awaitingTitleChoiceClick = true;
        state.titleChoiceRevealed = false;
        dom.game.classList.add("title-screen", "title-await-click");
        dom.choices.style.display = "none";
      } else {
        state.awaitingTitleChoiceClick = false;
        dom.game.classList.remove("title-await-click");
        dom.choices.style.display = "flex";
      }
    }

    function revealPendingTitleChoice() {
      if (!state.awaitingTitleChoiceClick || state.titleChoiceRevealed) return false;
      state.titleChoiceRevealed = true;
      state.awaitingTitleChoiceClick = false;
      dom.game.classList.remove("title-await-click");
      dom.choices.style.display = "flex";
      return true;
    }

    function shouldSuppressInitialTitleUi(cmd = {}) {
      if (!isInitialTitleScene()) return false;
      return ["note", "narrate"].includes(String(cmd.type || ""));
    }

    function isInitialTitleScene() {
      return state.sceneId === "start" && String(state.currentSceneMode || "").toLowerCase() === "title";
    }

    function applyDirectingContext(cmd = {}) {
      if (!cmd || typeof cmd !== "object") return;

      if (cmd.sceneMode) setSceneMode(cmd.sceneMode);
      if (cmd.conversation) setConversationContext(cmd.conversation);
      if (cmd.choiceUi) state.currentChoiceUi = cmd.choiceUi;

      if (cmd.sceneMode && !cmd.ui && !cmd.focus && cmd.type !== "mode") {
        const focus = focusFromSceneMode(cmd.sceneMode);
        if (focus) {
          const current = dom.modeBadge?.dataset?.focus || "";
          if (focus !== current) applyFocusUi(focus, labelFromSceneMode(cmd.sceneMode));
        }
      }
    }

    function setSceneMode(sceneMode) {
      const next = String(sceneMode || "system").trim() || "system";
      if (state.currentSceneMode !== next) {
        state.currentSceneMode = next;
        dom.game.dataset.sceneMode = next;
        updateTitleScreenChrome();
      }
    }

    function updateTitleScreenChrome() {
      const active = isInitialTitleScene();
      dom.game.classList.toggle("title-screen", active);
      if (!active) dom.game.classList.remove("title-await-click");
    }

    function setConversationContext(conversation = {}) {
      if (!conversation || typeof conversation !== "object") return;

      const prevKey = state.currentConversation?._key || "";
      const normalized = {
        layout: conversation.layout || "auto",
        participants: Array.isArray(conversation.participants) ? [...conversation.participants] : [],
        voiceOnlyParticipants: Array.isArray(conversation.voiceOnlyParticipants) ? [...conversation.voiceOnlyParticipants] : [],
        placementPolicy: conversation.placementPolicy || "primary-left-secondary-right-swap-once",
        clearPolicy: conversation.clearPolicy || ""
      };
      normalized._key = JSON.stringify({
        layout: normalized.layout,
        participants: normalized.participants,
        voiceOnlyParticipants: normalized.voiceOnlyParticipants,
        placementPolicy: normalized.placementPolicy
      });

      state.currentConversation = normalized;

      if (normalized._key !== prevKey) {
        resetDialogueLayout();
        cleanupSpritesForConversation(normalized);
      }
    }

    function focusFromSceneMode(sceneMode) {
      const mode = String(sceneMode || "").toLowerCase();
      if (["empathy"].includes(mode)) return "t";
      if (["stage", "confession", "reincarnation"].includes(mode)) return "j";
      if (mode) return "g";
      return "";
    }

    function labelFromSceneMode(sceneMode) {
      const mode = String(sceneMode || "").toLowerCase();
      const labels = {
        title: "Before Fades",
        control: "老麵 / 後台控制",
        empathy: "庭如 / 共感模式",
        jamie_room: "老麵 / 傑米休息室",
        memory: "記憶 / 錄音",
        stage: "傑米 / 舞台",
        confession: "傑米 / 告白",
        reincarnation: "傑米 / 輪迴發表",
        afterward: "演出後 / 觀察",
        office: "三個月後 / 辦公室",
        report: "案件 / 封存"
      };
      return labels[mode] || String(sceneMode || "SYSTEM").toUpperCase();
    }

    function normalizeSpeakerFocus(value) {
      const v = String(value || "primary").trim().toLowerCase();
      if (["voice", "voiceonly", "offscreen", "none"].includes(v)) return "voice";
      if (["secondary", "right", "support"].includes(v)) return "secondary";
      if (["center", "solo", "monologue"].includes(v)) return "center";
      return "primary";
    }

    function normalizeDisplayMode(value) {
      const v = String(value || "background").trim().toLowerCase();
      if (["doc", "document", "sidepanel", "sidepanelexpandable"].includes(v)) return "document";
      if (["cg", "cutscene"].includes(v)) return "cg";
      if (["logo", "ui_or_publish"].includes(v)) return "logo";
      if (["color", "solid"].includes(v)) return "color";
      return "background";
    }

    function applyChoiceUi(choiceUi = {}) {
      const ui = choiceUi && typeof choiceUi === "object" ? choiceUi : {};
      const layout = resolveChoiceLayout(ui);

      dom.choices.style.width = `min(${layout.widthRatio * 100}vw, calc(100vw - ${layout.viewportPaddingPx}px), ${layout.maxWidthPx}px)`;
      dom.choices.style.textAlign = layout.textAlign || "center";
      dom.choices.dataset.textAlign = layout.textAlign || "";
      dom.choices.dataset.fontScale = layout.fontScale || "";
    }

    function resolveChoiceLayout(ui = {}) {
      const presetName = ui.preset || ui.layoutPreset || CONFIG.choiceLayout.defaultPreset;
      const preset = CONFIG.choiceLayout.presets[presetName] || CONFIG.choiceLayout.presets[CONFIG.choiceLayout.defaultPreset];
      const widthRatio = clampNumber(
        ui.widthRatio ?? ui.ratio ?? preset.widthRatio,
        0.10,
        0.95,
        preset.widthRatio
      );

      return {
        widthRatio,
        maxWidthPx: clampNumber(ui.maxWidthPx ?? ui.maxWidth ?? preset.maxWidthPx, 240, 1600, preset.maxWidthPx),
        viewportPaddingPx: clampNumber(ui.viewportPaddingPx ?? ui.viewportPadding ?? preset.viewportPaddingPx, 0, 240, preset.viewportPaddingPx),
        textAlign: ui.textAlign || preset.textAlign || "center",
        fontScale: ui.fontScale || preset.fontScale || ""
      };
    }

    function clampNumber(value, min, max, fallback) {
      const n = Number(value);
      if (!Number.isFinite(n)) return fallback;
      return Math.min(max, Math.max(min, n));
    }

    function queueAfterTextActions(cmd = {}, shownCharacterId = "") {
      state.pendingAfterTextActions = [];
      if (cmd.leaveAfter && shownCharacterId) {
        state.pendingAfterTextActions.push({ type: "hide", id: shownCharacterId });
      }
    }

    function processPendingAfterTextActions() {
      const actions = state.pendingAfterTextActions || [];
      if (!actions.length) return;
      state.pendingAfterTextActions = [];
      actions.forEach(action => {
        if (action.type === "hide" && action.id) hideSprite(action.id);
      });
    }


    function normalizeFocus(value) {
      const v = String(value || "g").trim().toLowerCase();
      if (["t", "ruri", "warm", "yellow", "empathy"].includes(v)) return "t";
      if (["j", "jamie", "stage", "blue", "cool"].includes(v)) return "j";
      return "g";
    }

    function focusLabel(focus) {
      if (focus === "t") return "RURI / EMPATHY";
      if (focus === "j") return "JAMIE / STAGE";
      return "SYSTEM / CASE";
    }

    function applyFocusUi(value, label) {
      const focus = normalizeFocus(value);
      state.currentUi = focus;
      dom.game.classList.remove("theme-gray", "theme-ruri", "theme-jamie");
      if (focus === "t") dom.game.classList.add("theme-ruri");
      else if (focus === "j") dom.game.classList.add("theme-jamie");
      else dom.game.classList.add("theme-gray");
      dom.modeBadge.textContent = label || focusLabel(focus);
      dom.modeBadge.dataset.focus = focus;
    }

    function setMode(value, label, cmd = {}) {
      state.currentMode = value;
      if (cmd.sceneMode) setSceneMode(cmd.sceneMode);
      // 舊 JSON 若使用 mode，也盡量轉成焦點 UI，但不以 speaker 觸發。
      applyFocusUi(value, label || value || "SYSTEM");
      if (normalizeFocus(value) === "t") {
        dom.bg.style.filter = "saturate(0.86) brightness(0.90) contrast(1.05)";
      } else if (normalizeFocus(value) === "j") {
        dom.bg.style.filter = "saturate(0.78) brightness(0.86) contrast(1.10)";
      } else {
        dom.bg.style.filter = "";
      }
    }

    async function setBackground(cmdOrId, transition = "fade", postDelayMs = CONFIG.bgPostSwitchDelayMs) {
      const cmd = (cmdOrId && typeof cmdOrId === "object") ? cmdOrId : { id: cmdOrId, transition, waitAfter: postDelayMs };
      clearDialogueUi();
      let id = cmd.id || "";
      const requestedBgId = id;
      id = sanitizeBackgroundIdForScene(requestedBgId);
      const bg = state.script.assets?.backgrounds?.[id];

      if (!bg) {
        console.warn("Missing background:", id, requestedBgId && requestedBgId !== id ? `(requested: ${requestedBgId})` : "");
        dom.bg.style.background = CONFIG.defaultBg;
        dom.bgImage.removeAttribute("src");
        dom.bgImage.style.opacity = "0";
        updateTitleLogo("");
        await wait(normalizePostBgDelay(cmd.waitAfter ?? cmd.delayAfter ?? postDelayMs));
        return;
      }

      const src = typeof bg === "string" ? bg : (bg.src || "");
      const inferredCategory = src ? imageCategoryFor(id, src) : "background";
      const displayMode = normalizeDisplayMode(cmd.displayMode || imageDisplayModeFor(id, src, inferredCategory));
      const isDocument = displayMode === "document" || inferredCategory === "document" || cmd.documentTarget === "sidePanelExpandable";

      // doc_ / displayMode=document 不再切換主背景，只更新右下角 UI 縮圖，並保留目前舞台／房間背景。
      if (isDocument) {
        state.currentDocId = id || "";
        showDocumentInSidePanel(id, cmd);
        await wait(normalizePostBgDelay(cmd.waitAfter ?? cmd.delayAfter ?? postDelayMs));
        return;
      }

      state.currentBgId = id || "";
      state.currentDocId = "";
      setSideImage("");
      clearTransientSideNoteOnBackgroundChange(id);
      resetDialogueLayout();

      // 背景切換通常代表視覺焦點切換；先清掉不該跨場景殘留的舞台限定立繪，避免準備室或文件畫面誤出現台上傑米。
      clearInvalidSpritesForBackground(id);

      const actualTransition = cmd.transition ?? transition;
      if (actualTransition === "flash") await flash(0.78, 200);
      if (actualTransition === "fade") {
        dom.bg.style.opacity = "0";
        await wait(260);
      }

      dom.bg.classList.remove("display-cover", "display-cg", "display-document", "display-logo");

      if (bg.color || displayMode === "color") {
        dom.bg.classList.add("display-cover");
        dom.bg.style.background = bg.color || CONFIG.defaultBg;
        dom.bgImage.removeAttribute("src");
        dom.bgImage.style.opacity = "0";
        updateTitleLogo("");
      } else if (src) {
        const classMode = displayMode === "logo" ? "logo" : (displayMode === "cg" ? "cg" : "cover");
        dom.bg.classList.add(`display-${classMode}`);
        dom.bg.dataset.displayMode = displayMode;
        dom.bg.dataset.sceneMode = state.currentSceneMode || "";
        dom.bg.dataset.mainImageFit = cmd.mainImageFit || "";
        dom.bg.dataset.underlayFit = cmd.underlayFit || "";
        dom.bg.dataset.avoidUiOverlap = cmd.avoidUiOverlap === false ? "false" : "true";
        if (classMode === "cover") {
          // bg_ / background 圖只顯示在主舞台安全區，不再鋪成背後的大張底圖。
          dom.bg.style.backgroundImage = "none";
          dom.bg.style.background = CONFIG.defaultBg;
          dom.bg.style.backgroundSize = "cover";
          dom.bg.style.backgroundPosition = "center";
          dom.bg.style.backgroundRepeat = "no-repeat";
        } else {
          dom.bg.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.30), rgba(0,0,0,0.60)), url("${cssUrl(src)}")`;
          dom.bg.style.backgroundSize = "cover";
          dom.bg.style.backgroundPosition = "center";
          dom.bg.style.backgroundRepeat = "no-repeat";
        }
        dom.bgImage.style.opacity = "0";
        dom.bgImage.src = src;
        dom.bgImage.alt = assetDescriptionFor(id, src) || id || "background";
        await waitForImage(dom.bgImage);
        dom.bgImage.style.opacity = "1";
        updateTitleLogo(id);
      }

      dom.bg.style.opacity = "1";
      await wait(normalizePostBgDelay(cmd.waitAfter ?? cmd.delayAfter ?? postDelayMs));
    }

    function normalizePostBgDelay(value) {
      const n = Number(value);
      if (!Number.isFinite(n)) return CONFIG.bgPostSwitchDelayMs;
      return Math.max(0, n);
    }

    function sanitizeBackgroundIdForScene(id) {
      // 傑米錄音回憶段不要誤切到林薇 CG。保留 observe_wei 那種正式觀察段的使用權。
      if (id === "cg_wei_silent" && /^case_memory/i.test(String(state.sceneId || ""))) {
        return resolveBackgroundSrc("doc_voice_wave") ? "doc_voice_wave" : "case_file";
      }
      return id;
    }

    function clearInvalidSpritesForBackground(bgId) {
      const isStage = isStageBackground(bgId);
      state.sprites.forEach((img, id) => {
        const expression = String(img.dataset.expression || "");
        if (id === "jamie" && !isStage && ["show", "reincarnation"].includes(expression)) {
          img.remove();
          state.sprites.delete(id);
        }
      });
    }

    function isStageBackground(bgId = state.currentBgId) {
      const mode = String(state.currentSceneMode || "").toLowerCase();
      if (["stage", "confession", "reincarnation"].includes(mode)) return true;
      return /stage|show|confession|reincarnation|audience/.test(String(bgId || ""));
    }

    function imageDisplayModeFor(id, src, category) {
      if (category === "document") return "document";
      if (category === "cg") return "cg";
      if (category === "ui_or_publish" || /logo/i.test(id || src || "")) return "logo";
      return "background";
    }

    function imageCategoryFor(id, src) {
      const manifestMeta = imageMetaFor(id, src);
      if (manifestMeta?.category) return manifestMeta.category;
      const key = String(id || "").toLowerCase();
      const path = String(src || "").toLowerCase();
      if (key.startsWith("doc_") || path.includes("/doc_")) return "document";
      if (key.startsWith("cg_") || path.includes("/cg_")) return "cg";
      if (key.includes("logo") || path.includes("logo_")) return "ui_or_publish";
      return "background";
    }

    function imageMetaFor(id, src) {
      const manifest = state.script.assets?.imageManifest || {};
      if (id && manifest[id]) return manifest[id];
      if (src) {
        return Object.values(manifest).find(item => item?.src === src) || null;
      }
      return null;
    }

    function assetDescriptionFor(id, src) {
      return imageMetaFor(id, src)?.description || "";
    }

    function cssUrl(src) {
      return String(src || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    }

    function waitForImage(img) {
      if (!img || !img.src || img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    }

    function resolveBackgroundSrc(id) {
      const bg = state.script.assets?.backgrounds?.[id];
      if (!bg) return "";
      if (typeof bg === "string") return bg;
      return bg.src || "";
    }

    function updateTitleLogo(bgId) {
      const logo = resolveBackgroundSrc("logo_beforefades");
      if (!logo || !dom.titleLogo) {
        dom.titleLogo?.classList.remove("visible");
        return;
      }
      const shouldShow = ["title", "bg_title_mic_rose", "logo_beforefades"].includes(bgId);
      dom.titleLogo.alt = "";
      dom.titleLogo.onload = null;
      dom.titleLogo.onerror = null;
      dom.titleLogo.classList.remove("visible");
      if (!shouldShow) return;

      const showWhenLoaded = () => {
        if (dom.titleLogo.naturalWidth > 0) dom.titleLogo.classList.add("visible");
      };
      dom.titleLogo.onerror = () => dom.titleLogo.classList.remove("visible");
      dom.titleLogo.onload = showWhenLoaded;
      if (dom.titleLogo.src !== new URL(logo, window.location.href).href) dom.titleLogo.src = logo;
      else if (dom.titleLogo.complete) showWhenLoaded();
    }

    async function showSprite(cmd) {
      const id = cmd.id;
      if (!id || id === "none") return;
      if (Array.isArray(cmd.allowedSceneMode) && cmd.allowedSceneMode.length) {
        const allowed = cmd.allowedSceneMode.map(v => String(v).toLowerCase());
        if (!allowed.includes(String(state.currentSceneMode || "").toLowerCase())) {
          console.warn(`Skip sprite "${id}" because sceneMode "${state.currentSceneMode}" is not allowed.`, cmd);
          return;
        }
      }

      let img = state.sprites.get(id);
      if (!img) {
        img = document.createElement("img");
        img.className = "sprite";
        img.dataset.spriteId = id;
        dom.sprites.appendChild(img);
        state.sprites.set(id, img);
      }

      const requestedExpression = cmd.expression || img.dataset.expression || "default";
      const safeExpression = sanitizeCharacterExpression(id, requestedExpression);
      const src = resolveCharacterSrc(id, safeExpression, cmd.src);
      if (src && img.src !== new URL(src, window.location.href).href) img.src = src;
      img.dataset.auto = cmd.auto ? "true" : (img.dataset.auto || "false");
      img.dataset.expression = safeExpression;
      img.dataset.speakerFocus = cmd.speakerFocus || img.dataset.speakerFocus || "";
      img.dataset.presence = cmd.presence || img.dataset.presence || "onscreen";
      setSpritePosition(id, cmd.position || chooseDialogueSpritePosition(id, cmd));
      if (cmd.dimmed) img.classList.add("dimmed");
      bringSpriteToFront(id);
      if (cmd.instant) {
        requestAnimationFrame(() => img.classList.add("visible"));
        focusSprite(id);
        return;
      }
      await wait(30);
      img.classList.add("visible");
      focusSprite(id);
      await wait(260);
    }

    function setSpritePosition(id, position = "center") {
      const img = state.sprites.get(id);
      if (!img) return;
      const normalizedPosition = normalizeSpritePosition(id, position || "center");
      clearSpriteSlot(normalizedPosition, id);
      const visible = img.classList.contains("visible");
      const dimmed = img.classList.contains("dimmed");
      img.className = `sprite ${normalizedPosition || "center"}`;
      if (visible) img.classList.add("visible");
      if (dimmed) img.classList.add("dimmed");
      img.dataset.position = normalizedPosition || "center";
    }

    function normalizeSpritePosition(id, position = "center") {
      const mode = String(state.currentSceneMode || "").toLowerCase();
      const pos = String(position || "center").toLowerCase();
      if (mode === "jamie_room") {
        if (id === "jamie") return "left";
        if (id === "mercer") return "right";
      }
      if (["stage", "confession", "reincarnation"].includes(mode)) {
        if (id === "jamie") return "center";
        if (pos === "center") return "left";
      }
      return ["left", "right", "center"].includes(pos) ? pos : "center";
    }

    function clearSpriteSlot(position, keepId = "") {
      const target = String(position || "center").toLowerCase();
      state.sprites.forEach((sprite, spriteId) => {
        if (spriteId === keepId) return;
        const spritePosition = String(sprite.dataset.position || "").toLowerCase();
        if (spritePosition !== target) return;
        // 舞台中間保留傑米；其他左右欄位視為單一角色槽，避免人物互相覆蓋。
        if (spriteId === "jamie" && target === "center" && isStageBackground()) return;
        sprite.remove();
        state.sprites.delete(spriteId);
      });
    }

    function sanitizeCharacterExpression(id, expression) {
      const exp = String(expression || "default");
      if (id === "jamie" && state.currentBgId === "stage_dark" && exp === "show") {
        return "nervous";
      }
      if (id === "jamie" && !isStageBackground() && ["show", "reincarnation"].includes(exp)) {
        return "nervous";
      }
      return exp;
    }

    function bringSpriteToFront(id) {
      const img = state.sprites.get(id);
      if (!img) return;
      state.spriteZ = (state.spriteZ || 20) + 1;
      img.style.zIndex = String(state.spriteZ);
    }

    async function hideSprite(id) {
      const img = state.sprites.get(id);
      if (!img) return;
      img.classList.remove("visible");
      await wait(260);
      img.remove();
      state.sprites.delete(id);
    }

    function clearSprites() {
      state.sprites.forEach(img => img.remove());
      state.sprites.clear();
      resetDialogueLayout();
    }

    function resolveCharacterSrc(id, expression, directSrc) {
      if (directSrc) return directSrc;
      const chars = state.script.assets?.characters || {};
      const char = chars[id];
      if (!char) return "";
      if (typeof char === "string") return char;
      if (expression && char[expression]) return char[expression];
      if (char.default) return char.default;
      return Object.values(char)[0] || "";
    }


    function speakerToCharacter(speaker) {
      const s = String(speaker || "").trim().toLowerCase();
      const map = {
        "老麵": "mercer",
        "老面": "mercer",
        "mercer": "mercer",
        "庭如": "ruri",
        "ruri": "ruri",
        "傑米": "jamie",
        "jamie": "jamie",
        "詹傑明": "jamie",
        "凱特": "cate",
        "cate": "cate",
        "雷老師": "remy",
        "老師": "remy",
        "remy": "remy",
        "林薇": "wei",
        "wei": "wei"
      };
      return map[s] || "";
    }

    function cleanupSpritesForConversation(conversation = state.currentConversation) {
      const convo = conversation || {};
      const participants = Array.isArray(convo.participants) ? convo.participants : [];
      if (!participants.length) return;
      const allowed = new Set(participants.map(String));
      const sceneMode = String(state.currentSceneMode || "").toLowerCase();
      state.sprites.forEach((img, id) => {
        if (allowed.has(id)) return;
        // 舞台中間保留給傑米，若傑米正在舞台主位，不因工作人員對話被清掉。
        if (["stage", "confession", "reincarnation"].includes(sceneMode) && id === "jamie") return;
        if (img.dataset.auto === "true") {
          img.remove();
          state.sprites.delete(id);
        }
      });
    }

    function clearTransientSideNoteOnBackgroundChange(bgId = "") {
      const title = String(dom.sideTitle?.textContent || "");
      const shouldClear = /^(REC|DOCUMENT|VOICE|訪談錄音)/i.test(title) || dom.sidePanel?.classList.contains("has-document");
      if (!shouldClear) return;
      dom.sideTitle.textContent = "";
      dom.sideContent.textContent = "";
      setSideImage("");
    }

    async function autoShowSpeakerSprite(speaker, text, cmd = {}) {
      const mappedId = speakerToCharacter(speaker);
      const cmdCharacter = String(cmd.character || "").toLowerCase();
      const id = (cmdCharacter && cmdCharacter !== "none") ? cmd.character : mappedId;
      const presence = String(cmd.presence || "").toLowerCase();
      const speakerFocus = normalizeSpeakerFocus(cmd.speakerFocus);

      if (!id || id === "none") return "";
      if (speakerFocus === "voice" || presence === "voiceonly" || presence === "offscreen") return "";
      if (isEmpathyFullscreenActive()) return "";

      cleanupSpritesForConversation();

      const expression = sanitizeCharacterExpression(id, cmd.expression || "");
      const position = cmd.position || chooseDialogueSpritePosition(id, { ...cmd, speakerFocus });
      const src = resolveCharacterSrc(id, expression);
      if (!src) return "";

      const waitBeforeShow = state.pendingSpriteMoveMs || 0;
      state.pendingSpriteMoveMs = 0;
      if (waitBeforeShow > 0) await wait(waitBeforeShow);

      await showSprite({
        id,
        expression,
        position,
        auto: true,
        instant: true,
        speakerFocus: speakerFocus || cmd.speakerFocus || "primary",
        presence: presence || cmd.presence || "onscreen",
        allowedSceneMode: cmd.allowedSceneMode
      });
      return id;
    }


    function resetDialogueLayout() {
      state.dialogueLayout = { primaryId: "", secondaryId: "", swappedOnce: false };
      state.pendingSpriteMoveMs = 0;
    }

    function chooseDialogueSpritePosition(id, cmd = {}) {
      const focus = normalizeSpeakerFocus(cmd.speakerFocus);
      const conversation = state.currentConversation || {};
      const layoutType = String(conversation.layout || "").toLowerCase();
      const participants = Array.isArray(conversation.participants) ? conversation.participants : [];
      const sceneMode = String(state.currentSceneMode || "").toLowerCase();
      const isStageMode = ["stage", "confession", "reincarnation"].includes(sceneMode);
      const existing = state.sprites.get(id);

      if (cmd.position) return cmd.position;
      if (existing?.dataset?.position && !["center"].includes(existing.dataset.position)) return existing.dataset.position;

      // 舞台段中間保留給傑米；老麵、庭如、凱特、雷老師只能進左右兩端。
      if (isStageMode && id === "jamie") return "center";
      if (focus === "center" && !isStageMode) return "left";

      // 非舞台獨白也不要預設塞中間；除非是既有顯式 show 指令已經給了位置。
      if ((layoutType === "monologue" || (participants.length === 1 && participants[0] === id)) && !isStageMode) {
        return existing?.dataset?.position || "left";
      }

      const layout = state.dialogueLayout || (state.dialogueLayout = { primaryId: "", secondaryId: "", swappedOnce: false });

      if (!layout.primaryId || !state.sprites.has(layout.primaryId)) {
        layout.primaryId = id;
        layout.secondaryId = "";
        layout.swappedOnce = false;
        return "left";
      }

      if (id === layout.primaryId) return "left";
      if (id === layout.secondaryId) return "right";

      // 第一次換人主講時：不要再把原本左側人物「擠」到右邊。
      // 改成：原主講者先離場，新主講者進入原本左側位置；若原主講者之後再開口，才作為右側人物回來。
      if (focus === "primary" && !layout.swappedOnce) {
        const oldPrimary = layout.primaryId;
        layout.secondaryId = oldPrimary;
        layout.primaryId = id;
        layout.swappedOnce = true;
        state.pendingSpriteMoveMs = 0;
        const oldPrimarySprite = state.sprites.get(oldPrimary);
        if (oldPrimarySprite) {
          oldPrimarySprite.remove();
          state.sprites.delete(oldPrimary);
        }
        return "left";
      }

      if (layout.secondaryId && layout.secondaryId !== id) {
        const oldSecondary = state.sprites.get(layout.secondaryId);
        if (oldSecondary?.dataset?.auto === "true") {
          oldSecondary.remove();
          state.sprites.delete(layout.secondaryId);
        }
      }
      layout.secondaryId = id;
      return "right";
    }

    function defaultSpritePositionFor(id) {
      if (["stage", "confession", "reincarnation"].includes(String(state.currentSceneMode || "").toLowerCase()) && id === "jamie") return "center";
      if (id === "wei") return "right";
      return "left";
    }


    function focusSprite(activeId) {
      if (activeId) bringSpriteToFront(activeId);
      state.sprites.forEach((img, id) => {
        if (!activeId || id === activeId) img.classList.remove("dimmed");
        else img.classList.add("dimmed");
      });
    }

    function safePlay(media) {
      try {
        const promise = media.play();
        if (promise && typeof promise.catch === "function") promise.catch(() => {});
      } catch (_) {}
    }

    async function playBgm(id, volume = 0.45, loop = true, fade = CONFIG.bgmFadeMs) {
      const src = state.script.assets?.bgm?.[id];
      if (!src) {
        console.warn("Missing BGM:", id);
        return;
      }
      if (state.currentBgmId === id && !audio.bgm.paused) return;

      state.currentBgmId = id;
      const token = ++state.bgmToken;
      const old = audio.bgm;
      const next = new Audio(src);
      next.loop = loop !== false;
      next.volume = 0;
      audio.bgmNext = next;

      safePlay(next);

      Promise.all([
        fadeOutAudio(old, fade),
        fadeInAudio(next, volume, fade)
      ]).then(() => {
        if (token !== state.bgmToken) {
          next.pause();
          return;
        }
        old.pause();
        audio.bgm = next;
        audio.bgmNext = null;
      });
    }

    async function playAmbience(id, volume = 0.35, loop = true) {
      const src = state.script.assets?.ambience?.[id];
      if (!src) return;
      audio.ambience.src = src;
      audio.ambience.loop = loop !== false;
      audio.ambience.volume = volume;
      safePlay(audio.ambience);
    }

    function playSfx(id, volume = 0.6) {
      const sfxMap = state.script.assets?.sfx || {};
      const src = sfxMap[id] || (id === "click" ? sfxMap.ui_click : "");
      if (!src) return;
      const sfx = new Audio(src);
      sfx.volume = volume;
      audio.sfxPool.push(sfx);
      safePlay(sfx);
      sfx.addEventListener("ended", () => {
        audio.sfxPool = audio.sfxPool.filter(x => x !== sfx);
      });
    }

    function fadeInAudio(a, target, ms) {
      return new Promise((resolve) => {
        const start = performance.now();
        a.volume = 0;
        const tick = (now) => {
          const t = Math.min(1, (now - start) / Math.max(1, ms));
          a.volume = target * t;
          if (t < 1) requestAnimationFrame(tick);
          else resolve();
        };
        requestAnimationFrame(tick);
      });
    }

    function fadeOutAudio(a, ms) {
      return new Promise((resolve) => {
        const startVol = a.volume || 0;
        const start = performance.now();
        const tick = (now) => {
          const t = Math.min(1, (now - start) / Math.max(1, ms));
          a.volume = startVol * (1 - t);
          if (t < 1) requestAnimationFrame(tick);
          else resolve();
        };
        requestAnimationFrame(tick);
      });
    }

    async function runEffect(cmd) {
      if (shouldClearDialogueForEffect(cmd)) clearDialogueUi();
      switch (cmd.name) {
        case "shake": await shake(cmd.target || "game"); break;
        case "flash": await flash(cmd.opacity ?? 0.85, cmd.ms ?? 260); break;

        // 原本的庭如共感文字：上升。
        // JSON: { "type": "effect", "name": "empathy", "words": ["期待", "好奇"] }
        // 也可明確指定：{ "type": "effect", "name": "empathyUp", "words": [...] }
        case "empathy":
        case "empathyUp":
          await runEmpathyEffect(cmd);
          break;

        // 新增：負面情緒下墜。
        // JSON: { "type": "effect", "name": "empathyDown", "words": ["恐懼", "墜落"] }
        // 或：{ "type": "effect", "name": "empathy", "direction": "down", "words": [...] }
        case "empathyDown":
        case "empathyFall":
        case "empathySink":
          await runEmpathyEffect({ ...cmd, direction: cmd.direction || cmd.dir || "down" });
          break;

        case "fadeBlack": await fadeBlack(cmd.ms ?? 700, cmd); break;
        default: console.warn("Unknown effect:", cmd.name);
      }
    }

    async function shake(target) {
      const el = target === "bg" ? dom.bg : dom.game;
      el.classList.remove("shake");
      void el.offsetWidth;
      el.classList.add("shake");
      await wait(450);
      el.classList.remove("shake");
    }

    async function flash(opacity = 0.8, ms = 240) {
      dom.flash.style.transition = "none";
      dom.flash.style.background = `rgba(255,255,255,${opacity})`;
      await wait(30);
      dom.flash.style.transition = `background ${ms}ms ease`;
      dom.flash.style.background = "rgba(255,255,255,0)";
      await wait(ms + 40);
    }

	async function fadeBlack(ms = 700, cmd = {}) {
	  if (cmd?.finalLogo) {
		updateTitleLogo("logo_beforefades");

		dom.bg.style.setProperty("--final-bg-black-ms", `${ms}ms`);
		dom.bg.style.setProperty("--final-bg-black-opacity", "0");

		await wait(30);

		dom.bg.style.setProperty("--final-bg-black-opacity", "1");

		await wait(ms);
		return;
	  }

	  dom.effects.style.transition = `background ${ms}ms ease`;
	  dom.effects.style.background = "#000";
	  await wait(ms);
	}

    async function runEmpathyEffect(cmdOrWords = [], direction = "up") {
      const cmd = Array.isArray(cmdOrWords) || typeof cmdOrWords === "string"
        ? { words: cmdOrWords, direction }
        : (cmdOrWords || {});
      const sourceWords = cmd.words || [];
      const words = expandEmotionWords(sourceWords, Number.isFinite(Number(cmd.wordMultiplier)) ? Number(cmd.wordMultiplier) : 3);
      const dir = normalizeEmotionDirection(cmd.direction || cmd.dir || direction || "up");
      const assetId = cmd.visualBg || (dir === "down" ? "cg_empathy_fall" : "cg_empathy_warm");
      const duration = Number.isFinite(Number(cmd.duration)) ? Number(cmd.duration) : estimateEmotionDuration(words);
      const shouldLock = cmd.lockInput !== false;
      const backdrop = normalizeEmpathyBackdropOptions(cmd);

      if (shouldLock) lockInput(true);
      enterEmpathyFullscreen();
      try {
        await showEmpathyBackdrop(assetId, backdrop);
        await wait(backdrop.holdBeforeWordsMs);
        await empathyWords(words, dir, duration);
        await hideCutinImage(backdrop);
      } finally {
        exitEmpathyFullscreen();
        if (shouldLock) lockInput(false);
      }
    }

    function enterEmpathyFullscreen() {
      dom.game.classList.add("empathy-fullscreen-active");
      dom.effects.querySelectorAll(".emotion-word").forEach(el => el.remove());
      dom.cutinLayer?.classList.remove("visible");
    }

    function exitEmpathyFullscreen() {
      dom.game.classList.remove("empathy-fullscreen-active");
      dom.cutinLayer?.classList.remove("visible");
      if (dom.cutinImage) dom.cutinImage.removeAttribute("src");
      if (dom.cutinLayer) {
        dom.cutinLayer.style.backgroundImage = "";
        resetEmpathyBackdropCssVars();
      }
      dom.effects.querySelectorAll(".emotion-word").forEach(el => el.remove());
    }

    function isEmpathyFullscreenActive() {
      return dom.game?.classList.contains("empathy-fullscreen-active");
    }

    function normalizeEmpathyBackdropOptions(cmd = {}) {
      const defaults = CONFIG.emotion?.backdrop || {};
      return {
        fadeInMs: numberOr(cmd.fadeInMs, defaults.fadeInMs ?? 900),
        fadeOutMs: numberOr(cmd.fadeOutMs, defaults.fadeOutMs ?? 900),
        holdBeforeWordsMs: numberOr(cmd.holdBeforeWordsMs, defaults.holdBeforeWordsMs ?? 420),
        startOpacity: numberOr(cmd.startOpacity, defaults.startOpacity ?? 0),
        targetOpacity: numberOr(cmd.targetOpacity, defaults.targetOpacity ?? 1),
        startBlurPx: numberOr(cmd.startBlurPx, defaults.startBlurPx ?? 18),
        endBlurPx: numberOr(cmd.endBlurPx, defaults.endBlurPx ?? 0),
        exitBlurPx: numberOr(cmd.exitBlurPx, defaults.exitBlurPx ?? 18),
        startScale: numberOr(cmd.startScale, defaults.startScale ?? 1.035),
        endScale: numberOr(cmd.endScale, defaults.endScale ?? 1),
        exitScale: numberOr(cmd.exitScale, defaults.exitScale ?? 1.025)
      };
    }

    function applyEmpathyBackdropCssVars(options, phase = "enter") {
      if (!dom.cutinLayer) return;
      const fadeMs = phase === "exit" ? options.fadeOutMs : options.fadeInMs;
      const blurStart = phase === "exit" ? options.exitBlurPx : options.startBlurPx;
      const scaleStart = phase === "exit" ? options.exitScale : options.startScale;
      dom.cutinLayer.style.setProperty("--empathy-backdrop-fade-ms", `${fadeMs}ms`);
      dom.cutinLayer.style.setProperty("--empathy-backdrop-opacity", String(options.targetOpacity));
      dom.cutinLayer.style.setProperty("--empathy-backdrop-blur-start", `${blurStart}px`);
      dom.cutinLayer.style.setProperty("--empathy-backdrop-blur-end", `${options.endBlurPx}px`);
      dom.cutinLayer.style.setProperty("--empathy-backdrop-scale-start", String(scaleStart));
      dom.cutinLayer.style.setProperty("--empathy-backdrop-scale-end", String(options.endScale));
    }

    function resetEmpathyBackdropCssVars() {
      if (!dom.cutinLayer) return;
      [
        "--empathy-backdrop-fade-ms",
        "--empathy-backdrop-opacity",
        "--empathy-backdrop-blur-start",
        "--empathy-backdrop-blur-end",
        "--empathy-backdrop-scale-start",
        "--empathy-backdrop-scale-end"
      ].forEach(name => dom.cutinLayer.style.removeProperty(name));
    }

    async function showEmpathyBackdrop(assetId, options = normalizeEmpathyBackdropOptions()) {
      const src = resolveBackgroundSrc(assetId);
      if (!src || !dom.cutinLayer || !dom.cutinImage) return;
      window.clearTimeout(dom.cutinLayer._timer);
      dom.cutinLayer.classList.remove("visible");
      dom.cutinLayer.style.backgroundImage = "";
      applyEmpathyBackdropCssVars(options, "enter");
      dom.cutinImage.src = src;
      dom.cutinImage.alt = assetDescriptionFor(assetId, src) || assetId;
      await waitForImage(dom.cutinImage);
      await wait(30);
      dom.cutinLayer.classList.add("visible");
      await wait(options.fadeInMs);
    }

    async function hideCutinImage(options = normalizeEmpathyBackdropOptions()) {
      if (!dom.cutinLayer) return;
      applyEmpathyBackdropCssVars(options, "exit");
      await wait(30);
      dom.cutinLayer.classList.remove("visible");
      await wait(options.fadeOutMs);
      if (dom.cutinImage) dom.cutinImage.removeAttribute("src");
      dom.cutinLayer.style.backgroundImage = "";
      resetEmpathyBackdropCssVars();
    }

    function expandEmotionWords(words, multiplier = 3) {
      const base = Array.isArray(words) ? words.filter(Boolean) : String(words || "").split(/[，,\s]+/).filter(Boolean);
      if (!base.length) return [];
      const count = Math.max(1, Math.round(multiplier || 1));
      const expanded = [];
      for (let round = 0; round < count; round += 1) {
        base.forEach((word, idx) => {
          // 每一輪都保留原本字詞，但用輪次錯開位置，允許重複、避免缺漏。
          expanded.push(String(word));
        });
      }
      return expanded;
    }

    function estimateEmotionDuration(words) {
      const list = Array.isArray(words) ? words : String(words || "").split(/[，,\s]+/).filter(Boolean);
      const count = Math.max(1, list.length);
      return CONFIG.emotion.defaultLifeMs + (count - 1) * CONFIG.emotion.staggerMs + 160;
    }

    function lockInput(locked) {
      state.inputLocked = Boolean(locked);
      dom.effects?.classList.toggle("input-lock", state.inputLocked);
    }

    function normalizeEmotionDirection(direction) {
      const d = String(direction || "up").trim().toLowerCase();
      if (["down", "fall", "sink", "drop", "negative", "neg", "bad"].includes(d)) return "down";
      return "up";
    }

    async function empathyWords(words, direction = "up", totalDurationMs = null) {
      const list = Array.isArray(words) ? words : String(words || "").split(/[，,\s]+/).filter(Boolean);
      if (!list.length) return;

      const dir = normalizeEmotionDirection(direction);
      const className = dir === "down" ? "emotion-word float-down" : "emotion-word float-up";
      const staggerMs = CONFIG.emotion.staggerMs;
      const desiredTotal = Number.isFinite(Number(totalDurationMs)) ? Number(totalDurationMs) : null;
      const lifeMs = desiredTotal
        ? Math.max(1800, desiredTotal - Math.max(0, list.length - 1) * staggerMs - 160)
        : CONFIG.emotion.defaultLifeMs;
      const layout = CONFIG.emotion.layout[dir] || CONFIG.emotion.layout.up;

      list.forEach((word, idx) => {
        const el = document.createElement("div");
        el.className = className;
        el.textContent = word;

        const x = layout.leftVw + ((idx * layout.stepX + Math.floor(idx / 3) * layout.rowOffsetX) % layout.spreadVw);
        const y = layout.topVh + ((idx * layout.stepY + Math.floor(idx / 2) * layout.rowOffsetY) % layout.spreadVh);

        el.style.left = `${x}vw`;
        el.style.top = `${y}vh`;
        dom.effects.appendChild(el);

        const delayMs = idx * staggerMs;
        runEmotionWordAnimation(el, dir, lifeMs, delayMs);
        setTimeout(() => el.remove(), lifeMs + delayMs + 120);
      });
      await wait(lifeMs + Math.max(0, list.length - 1) * staggerMs + 160);
    }

    function runEmotionWordAnimation(el, direction, lifeMs, delayMs) {
      const profile = CONFIG.emotion.motionProfiles[direction] || CONFIG.emotion.motionProfiles.up;
      const frames = buildEmotionKeyframes(profile);

      if (typeof el.animate === "function") {
        el.animate(frames, {
          duration: lifeMs,
          delay: delayMs,
          easing: "ease",
          fill: "forwards"
        });
        return;
      }

      // 極舊瀏覽器 fallback：不用 CSS 百分比節點，只做最基本淡入淡出。
      setTimeout(() => {
        el.style.transition = `opacity ${Math.min(420, lifeMs * 0.18)}ms ease, transform ${lifeMs}ms ease, filter ${lifeMs}ms ease`;
        applyEmotionFrameStyle(el, profile.visible);
      }, delayMs);
      setTimeout(() => applyEmotionFrameStyle(el, profile.end), delayMs + Math.max(0, lifeMs - 520));
    }

    function buildEmotionKeyframes(profile) {
      const start = emotionFrame(profile.start, 0);
      const visible = emotionFrame(profile.visible, profile.fadeInAt);
      const hold = emotionFrame({ ...profile.visible, ...profile.hold }, profile.holdUntil);
      const end = emotionFrame(profile.end, 1);
      return [start, visible, hold, end];
    }

    function emotionFrame(frame, offset) {
      return {
        offset,
        opacity: frame.opacity,
        transform: `translateY(${frame.yPx ?? 0}px) scale(${frame.scale ?? 1})`,
        filter: `blur(${frame.blurPx ?? 0}px)`
      };
    }

    function applyEmotionFrameStyle(el, frame) {
      el.style.opacity = String(frame.opacity ?? 1);
      el.style.transform = `translateY(${frame.yPx ?? 0}px) scale(${frame.scale ?? 1})`;
      el.style.filter = `blur(${frame.blurPx ?? 0}px)`;
    }

    function showCutinImage(assetId, ms = 1800) {
      const src = resolveBackgroundSrc(assetId);
      if (!src || !dom.cutinLayer || !dom.cutinImage) return;
      dom.cutinLayer.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.24), rgba(0,0,0,0.62)), url("${cssUrl(src)}")`;
      dom.cutinImage.src = src;
      dom.cutinImage.alt = assetDescriptionFor(assetId, src) || assetId;
      dom.cutinLayer.classList.add("visible");
      window.clearTimeout(dom.cutinLayer._timer);
      dom.cutinLayer._timer = window.setTimeout(() => {
        dom.cutinLayer.classList.remove("visible");
        dom.cutinLayer.style.backgroundImage = "";
      }, ms);
    }

    function showLoadingScreen(status = "讀取中……", completed = 0, total = 0) {
      if (!dom.loading) return;
      dom.loading.classList.remove("is-hidden", "has-errors");
      dom.loading.setAttribute("aria-busy", "true");
      updateLoadingProgress({ completed, total, ok: 0, failed: 0, status, current: "" });
    }

    function hideLoadingScreen() {
      if (!dom.loading) return;
      dom.loading.classList.add("is-hidden");
      dom.loading.setAttribute("aria-busy", "false");
    }

    function updateLoadingProgress({ completed = 0, total = 0, ok = 0, failed = 0, status = "", current = "", failures = [] } = {}) {
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
      if (dom.loadingProgressBar) dom.loadingProgressBar.style.width = `${pct}%`;
      if (dom.loadingPercent) dom.loadingPercent.textContent = `${pct}%`;
      if (dom.loadingStatus) dom.loadingStatus.textContent = status || "正在載入素材……";
      if (dom.loadingCurrent) dom.loadingCurrent.textContent = current ? `讀取中：${current}` : "";
      if (dom.loadingStats) dom.loadingStats.textContent = total ? `${completed} / ${total}　成功 ${ok}　失敗 ${failed}` : "準備素材清單……";
      if (dom.loadingErrors) {
        if (failures && failures.length) {
          dom.loading?.classList.add("has-errors");
          dom.loadingErrors.textContent = `以下素材載入失敗，遊戲仍會繼續啟動：\n${failures.map(item => `- ${item.src}${item.reason ? `（${item.reason}）` : ""}`).join("\n")}`;
        } else {
          dom.loading?.classList.remove("has-errors");
          dom.loadingErrors.textContent = "";
        }
      }
    }

    async function preloadAllImagesWithProgress() {
      const assets = collectImageAssets();
      const total = assets.length;
      const failures = [];
      let completed = 0;
      let ok = 0;
      let failed = 0;

      updateLoadingProgress({ completed, total, ok, failed, status: total ? "正在預載圖片素材……" : "沒有需要預載的圖片素材。" });

      if (!total) {
        await wait(220);
        updateLoadingProgress({ completed: 0, total: 0, ok: 0, failed: 0, status: "圖片素材準備完成。" });
        return { total: 0, ok: 0, failed: 0, failures: [] };
      }

      let cursor = 0;
      const concurrency = Math.max(1, Math.min(CONFIG.imagePreloadConcurrency || 6, total));

      async function worker() {
        while (cursor < total) {
          const asset = assets[cursor++];
          updateLoadingProgress({ completed, total, ok, failed, status: "正在預載圖片素材……", current: asset.src, failures });
          const result = await preloadImageAsset(asset);
          completed += 1;
          if (result.ok) ok += 1;
          else {
            failed += 1;
            failures.push(result);
          }
          updateLoadingProgress({
            completed,
            total,
            ok,
            failed,
            status: completed >= total ? "圖片素材載入完成。" : "正在預載圖片素材……",
            current: completed >= total ? "" : asset.src,
            failures
          });
        }
      }

      await Promise.all(Array.from({ length: concurrency }, () => worker()));
      updateLoadingProgress({
        completed,
        total,
        ok,
        failed,
        status: failed ? "圖片素材載入完成，但有部分檔案失敗。" : "圖片素材全部載入完成。",
        current: "",
        failures
      });
      await wait(failed ? 900 : 420);
      return { total, ok, failed, failures };
    }

    function collectImageAssets() {
      const assets = new Map();
      const add = (src, id = "", category = "") => {
        if (!src || typeof src !== "string") return;
        if (!isImageAssetPath(src)) return;
        const normalizedSrc = src.trim();
        if (!assets.has(normalizedSrc)) {
          assets.set(normalizedSrc, { src: normalizedSrc, ids: new Set(), categories: new Set() });
        }
        const item = assets.get(normalizedSrc);
        if (id) item.ids.add(id);
        if (category) item.categories.add(category);
      };

      const bgs = state.script.assets?.backgrounds || {};
      Object.entries(bgs).forEach(([id, item]) => {
        const src = typeof item === "string" ? item : item?.src;
        add(src, id, imageCategoryFor(id, src));
      });

      const chars = state.script.assets?.characters || {};
      Object.entries(chars).forEach(([id, char]) => {
        if (typeof char === "string") add(char, id, "character");
        else Object.entries(char || {}).forEach(([expression, src]) => add(src, `${id}.${expression}`, "character"));
      });

      const manifest = state.script.assets?.imageManifest || {};
      Object.entries(manifest).forEach(([id, item]) => add(item?.src, id, item?.category || imageCategoryFor(id, item?.src)));

      collectImageAssetsFromObject(state.script.scenes || {}, add);

      return Array.from(assets.values()).map(item => ({
        src: item.src,
        ids: Array.from(item.ids),
        categories: Array.from(item.categories)
      }));
    }

    function collectImageAssetsFromObject(value, add) {
      if (Array.isArray(value)) {
        value.forEach(item => collectImageAssetsFromObject(item, add));
        return;
      }
      if (value && typeof value === "object") {
        Object.values(value).forEach(item => collectImageAssetsFromObject(item, add));
        return;
      }
      if (typeof value === "string" && isImageAssetPath(value)) {
        add(value, "inline", "inline");
      }
    }

    function isImageAssetPath(src) {
      return /\.(?:png|jpe?g|webp|gif|avif|svg)(?:[?#].*)?$/i.test(String(src || ""));
    }

    function preloadImageAsset(asset) {
      return new Promise((resolve) => {
        let settled = false;
        const img = new Image();
        const timeout = window.setTimeout(() => finish(false, "timeout"), CONFIG.imagePreloadTimeoutMs || 15000);

        function finish(ok, reason = "") {
          if (settled) return;
          settled = true;
          window.clearTimeout(timeout);
          img.onload = null;
          img.onerror = null;
          if (ok && CONFIG.keepPreloadedImageRefs) state.preloadedImages.set(asset.src, img);
          resolve({ ...asset, ok, reason });
        }

        img.onload = () => finish(true);
        img.onerror = () => finish(false, "load error");
        img.decoding = "async";
        img.src = asset.src;

        if (img.complete && img.naturalWidth > 0) finish(true);
      });
    }

    function resolveNoteImage(title, text) {
      const key = `${title || ""}\n${text || ""}`;
      if (/TITLE|Before/.test(key)) return "logo_beforefades";
      if (/CASE \/ STATUS|座位|來賓|地點/.test(key)) return "doc_seating_plan";
      if (/MONITOR|監控/.test(key)) return "";
      if (/RUN-DOWN|rundown|流程/.test(key)) return "doc_rundown";
      if (/GUEST LIST|來賓名單|家屬席/.test(key)) return "doc_guest_list";
      if (/ROOM|藥瓶|診斷摘要|神經退化/.test(key)) return "doc_medical_report";
      if (/REINCARNATION|輪迴|人格掃描|決策延續/.test(key)) return "doc_reincarnation_pitch";
      if (/講稿|脫口秀講稿/.test(key)) return "doc_jamie_script";
      if (/EMPATHY|共感/.test(key)) return "";
      if (/VOICE|錄音|訪談|波形/.test(key)) return "doc_voice_wave";
      if (/MAIL|內部|危機/.test(key)) return "doc_internal_mail";
      if (/NEWS|MEDIA|新聞|股價/.test(key)) return "doc_media_news";
      if (/CASE REPORT|案件封存|封存報告/.test(key)) return "doc_case_report";
      return "";
    }

    function setSideImage(assetId, options = {}) {
      if (!dom.sideImage || !dom.sideImageWrap) return;
      const src = resolveBackgroundSrc(assetId);
      const category = src ? imageCategoryFor(assetId, src) : "";
      if (!assetId || !src || category !== "document") {
        dom.sideImageWrap.classList.add("hidden");
        dom.sideImageWrap.classList.remove("doc-thumb");
        dom.sideImageWrap.removeAttribute("role");
        dom.sideImageWrap.removeAttribute("tabindex");
        delete dom.sideImageWrap.dataset.assetId;
        delete dom.sideImageWrap.dataset.src;
        delete dom.sideImageWrap.dataset.caption;
        dom.sideImage.removeAttribute("src");
        dom.sidePanel?.classList.remove("has-document");
        return;
      }
      const caption = options.caption || assetDescriptionFor(assetId, src) || assetId;
      dom.sideImage.src = src;
      dom.sideImage.alt = caption;
      dom.sideImageWrap.dataset.assetId = assetId;
      dom.sideImageWrap.dataset.src = src;
      dom.sideImageWrap.dataset.caption = caption;
      dom.sideImageWrap.setAttribute("role", "button");
      dom.sideImageWrap.setAttribute("tabindex", "0");
      dom.sideImageWrap.classList.add("doc-thumb");
      dom.sideImageWrap.classList.remove("hidden");
      dom.sidePanel?.classList.add("has-document");
    }

    function showDocumentInSidePanel(assetId, cmd = {}) {
      const src = resolveBackgroundSrc(assetId);
      const description = cmd.documentTitle || assetDescriptionFor(assetId, src) || assetId || "文件";
      dom.sideTitle.textContent = cmd.documentTitle || "DOCUMENT / 文件";
      dom.sideContent.textContent = `${description}
點擊右側縮圖可放大檢視。`;
      setSideImage(assetId, { caption: description });
    }

    function setSideNote(title, text) {
      dom.sideTitle.textContent = title || "NOTE";
      dom.sideContent.textContent = text || "";
      const noteImage = resolveNoteImage(title, text);
      if (noteImage) setSideImage(noteImage);
      else if (state.currentDocId) setSideImage(state.currentDocId);
      else setSideImage("");
    }

    function openSideDocument() {
      const assetId = dom.sideImageWrap?.dataset?.assetId;
      if (!assetId) return;
      const src = dom.sideImageWrap.dataset.src || resolveBackgroundSrc(assetId);
      if (!src) return;
      showDocumentViewer(src, dom.sideImageWrap.dataset.caption || assetDescriptionFor(assetId, src) || assetId);
    }

    function showDocumentViewer(src, caption = "") {
      dom.docViewerImage.src = src;
      dom.docViewerImage.alt = caption || "文件放大檢視";
      dom.docViewerCaption.textContent = caption || "";
      dom.docViewer.classList.add("visible");
      dom.docViewer.setAttribute("aria-hidden", "false");
      dom.docViewerClose.focus({ preventScroll: true });
    }

    function hideDocumentViewer() {
      if (!dom.docViewer) return;
      dom.docViewer.classList.remove("visible");
      dom.docViewer.setAttribute("aria-hidden", "true");
    }

    function isDocumentViewerOpen() {
      return Boolean(dom.docViewer?.classList.contains("visible"));
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

    init().catch((err) => {
      console.error(err);
      setSideNote("SYSTEM ERROR", err.message || String(err));
    });
