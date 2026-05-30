"use strict";

/***********************************************************************
 * Before Fades Engine Module: dom.js
 * Loaded as a classic script. Shared engine bindings are available globally.
 ***********************************************************************/

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
      gameVersion: $("gameVersion"),
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

    function setGameVersion() {
      if (!dom.gameVersion) return;
      const meta = window.BF_CONFIG?.META || state.script?.meta || {};
      const rawVersion = meta.displayVersion || meta.gameVersion || meta.version || "";
      const text = String(rawVersion || "").trim();
      dom.gameVersion.textContent = text;
      dom.gameVersion.classList.toggle("hidden", !text);
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
