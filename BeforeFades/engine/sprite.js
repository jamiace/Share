"use strict";

/***********************************************************************
 * Before Fades Engine Module: sprite.js
 * Loaded as a classic script. Shared engine bindings are available globally.
 ***********************************************************************/

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
