"use strict";

/***********************************************************************
 * Before Fades Engine Module: empathy.js
 * Loaded as a classic script. Shared engine bindings are available globally.
 ***********************************************************************/

    async function runEmpathyEffect(cmdOrWords = [], fallbackDirection = "up") {
      const cmd = Array.isArray(cmdOrWords) || typeof cmdOrWords === "string"
        ? { words: cmdOrWords }
        : (cmdOrWords || {});
      const runtime = resolveEmpathyRuntimeOptions(cmd, fallbackDirection);
      const sourceWords = cmd.words || [];
      const words = expandEmotionWords(sourceWords, runtime.wordMultiplier);

      if (runtime.lockInput) lockInput(true);
      enterEmpathyFullscreen(runtime);
      try {
        await showEmpathyBackdrop(runtime.visualBg, runtime.backdrop);
        await wait(runtime.holdBeforeWordsMs);
        await empathyWords(words, runtime.wordDirection, runtime.durationMs);
        await hideCutinImage(runtime.backdrop);
      } finally {
        exitEmpathyFullscreen();
        if (runtime.lockInput) lockInput(false);
      }
    }

    function resolveEmpathyRuntimeOptions(cmd = {}, fallbackDirection = "up") {
      const empathyConfig = CONFIG.emotion?.empathy || {};
      const direction = normalizeEmotionDirection(
        cmd.direction ||
        cmd.dir ||
        directionFromEmpathyName(cmd.name) ||
        fallbackDirection ||
        empathyConfig.defaultDirection ||
        "up"
      );
      const profiles = empathyConfig.profiles || {};
      const profile = profiles[direction] || profiles.up || {};
      const wordDirection = normalizeEmotionDirection(cmd.wordDirection || profile.wordDirection || direction);
      const visualBg = cmd.visualBg || cmd.background || profile.visualBg || (direction === "down" ? "cg_empathy_fall" : "cg_empathy_warm");
      const durationMs = numberOr(cmd.durationMs, empathyConfig.durationMs ?? estimateEmotionDuration(cmd.words || []));
      const holdBeforeWordsMs = numberOr(cmd.holdBeforeWordsMs, empathyConfig.holdBeforeWordsMs ?? 420);
      const wordMultiplier = Number.isFinite(Number(cmd.wordMultiplier))
        ? Number(cmd.wordMultiplier)
        : numberOr(empathyConfig.wordMultiplier, 1);
      const lockInput = typeof cmd.lockInput === "boolean"
        ? cmd.lockInput
        : Boolean(empathyConfig.lockInput);
      const hideUiDuringEffect = typeof cmd.hideUiDuringEffect === "boolean"
        ? cmd.hideUiDuringEffect
        : empathyConfig.hideUiDuringEffect !== false;

      return {
        direction,
        wordDirection,
        visualBg,
        durationMs,
        holdBeforeWordsMs,
        wordMultiplier,
        lockInput,
        hideUiDuringEffect,
        backdrop: normalizeEmpathyBackdropOptions(cmd)
      };
    }

    function directionFromEmpathyName(name = "") {
      const n = String(name || "").trim().toLowerCase();
      if (["empathydown", "empathyfall", "empathysink"].includes(n)) return "down";
      if (["empathyup", "empathy"].includes(n)) return "up";
      return "";
    }

    function enterEmpathyFullscreen(options = {}) {
      dom.game.classList.add("empathy-fullscreen-active");
      dom.game.classList.toggle("empathy-hide-ui", options.hideUiDuringEffect !== false);
      dom.effects.querySelectorAll(".emotion-word").forEach(el => el.remove());
      dom.cutinLayer?.classList.remove("visible");

      // 避免其他效果留下來的 inline 黑場蓋在共感背景上。
      // CSS selector 不能覆蓋 inline style，所以這裡必須由引擎清掉。
      dom.effects.style.transition = "";
      dom.effects.style.background = "transparent";
    }

    function exitEmpathyFullscreen() {
      dom.game.classList.remove("empathy-fullscreen-active", "empathy-hide-ui");
      dom.cutinLayer?.classList.remove("visible");
      if (dom.cutinImage) dom.cutinImage.removeAttribute("src");
      if (dom.cutinLayer) {
        dom.cutinLayer.style.backgroundImage = "";
        resetEmpathyBackdropCssVars();
        resetEmpathyBackdropInlineState();
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
      dom.cutinLayer.style.setProperty("--empathy-backdrop-opacity-start", String(options.startOpacity));
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
        "--empathy-backdrop-opacity-start",
        "--empathy-backdrop-opacity",
        "--empathy-backdrop-blur-start",
        "--empathy-backdrop-blur-end",
        "--empathy-backdrop-scale-start",
        "--empathy-backdrop-scale-end"
      ].forEach(name => dom.cutinLayer.style.removeProperty(name));
    }

    function setEmpathyBackdropTransition(ms) {
      if (!dom.cutinLayer) return;
      const duration = Math.max(0, numberOr(ms, 0));
      dom.cutinLayer.style.transition = [
        `opacity ${duration}ms ease`,
        `filter ${duration}ms ease`,
        `transform ${duration}ms ease`
      ].join(", ");
    }

    function setEmpathyBackdropInlineState({ opacity, blurPx, scale }) {
      if (!dom.cutinLayer) return;
      dom.cutinLayer.style.opacity = String(opacity);
      dom.cutinLayer.style.filter = `blur(${blurPx}px)`;
      dom.cutinLayer.style.transform = `scale(${scale})`;
    }

    function resetEmpathyBackdropInlineState() {
      if (!dom.cutinLayer) return;
      dom.cutinLayer.style.transition = "";
      dom.cutinLayer.style.opacity = "";
      dom.cutinLayer.style.filter = "";
      dom.cutinLayer.style.transform = "";
    }

    async function prepareEmpathyBackdropFirstFrame(options) {
      if (!dom.cutinLayer || !dom.cutinImage) return;

      cancelEmpathyBackdropAnimations();
      applyEmpathyBackdropCssVars(options, "enter");

      dom.cutinLayer.classList.remove("visible");
      dom.cutinLayer.style.backgroundImage = "";
      dom.cutinLayer.style.transition = "none";

      setEmpathyBackdropInlineState({
        opacity: options.startOpacity,
        blurPx: options.startBlurPx,
        scale: options.startScale
      });

      // 這裡不能只靠 class + CSS transition。
      // 圖片如果已經在快取裡，瀏覽器可能會把 src 設定與 visible 狀態合併成同一幀，
      // 造成「瞬間亮起」；所以先強制提交透明模糊的第一幀。
      void dom.cutinLayer.offsetWidth;
      await nextFrame();
      await nextFrame();
    }

    function cancelEmpathyBackdropAnimations() {
      if (!dom.cutinLayer?.getAnimations) return;
      dom.cutinLayer.getAnimations().forEach(animation => {
        try { animation.cancel(); } catch (_) {}
      });
    }

    async function renderCommittedFrame() {
      await nextFrame();
      await nextFrame();
    }

    async function animateEmpathyBackdrop(from, to, ms) {
      if (!dom.cutinLayer) return;

      const duration = Math.max(0, numberOr(ms, 0));
      cancelEmpathyBackdropAnimations();
      dom.cutinLayer.style.transition = "none";
      setEmpathyBackdropInlineState(from);

      void dom.cutinLayer.offsetWidth;
      await renderCommittedFrame();

      if (duration <= 0) {
        setEmpathyBackdropInlineState(to);
        return;
      }

      // 優先使用 Web Animations API，避免 CSS transition 被 class 順序、快取圖片、
      // 或瀏覽器合併重排影響，導致 fadeInMs 設很長仍然瞬間完成。
      if (typeof dom.cutinLayer.animate === "function") {
        const animation = dom.cutinLayer.animate(
          [
            {
              opacity: String(from.opacity),
              filter: `blur(${from.blurPx}px)`,
              transform: `scale(${from.scale})`
            },
            {
              opacity: String(to.opacity),
              filter: `blur(${to.blurPx}px)`,
              transform: `scale(${to.scale})`
            }
          ],
          {
            duration,
            easing: "ease",
            fill: "forwards"
          }
        );

        try {
          await animation.finished;
        } catch (_) {
          // 被下一個演出中斷時不視為錯誤。
        }

        setEmpathyBackdropInlineState(to);
        try { animation.cancel(); } catch (_) {}
        return;
      }

      // 舊瀏覽器 fallback。
      setEmpathyBackdropTransition(duration);
      await nextFrame();
      setEmpathyBackdropInlineState(to);
      await wait(duration);
      dom.cutinLayer.style.transition = "none";
    }

    async function showEmpathyBackdrop(assetId, options = normalizeEmpathyBackdropOptions()) {
      const src = resolveBackgroundSrc(assetId);
      if (!src || !dom.cutinLayer || !dom.cutinImage) return;

      window.clearTimeout(dom.cutinLayer._timer);
      await prepareEmpathyBackdropFirstFrame(options);

      dom.cutinImage.removeAttribute("src");
      dom.cutinImage.alt = assetDescriptionFor(assetId, src) || assetId;
      dom.cutinImage.src = src;
      await waitForImage(dom.cutinImage);

      // 圖片載入完成後，再提交一次「透明 + 模糊」狀態。
      // 這一步是修正瞬間顯示的關鍵，尤其是圖片已快取時。
      setEmpathyBackdropInlineState({
        opacity: options.startOpacity,
        blurPx: options.startBlurPx,
        scale: options.startScale
      });
      void dom.cutinLayer.offsetWidth;
      await renderCommittedFrame();

      dom.cutinLayer.classList.add("visible");
      await animateEmpathyBackdrop(
        {
          opacity: options.startOpacity,
          blurPx: options.startBlurPx,
          scale: options.startScale
        },
        {
          opacity: options.targetOpacity,
          blurPx: options.endBlurPx,
          scale: options.endScale
        },
        options.fadeInMs
      );
    }

    async function hideCutinImage(options = normalizeEmpathyBackdropOptions()) {
      if (!dom.cutinLayer) return;

      applyEmpathyBackdropCssVars(options, "exit");

      await animateEmpathyBackdrop(
        {
          opacity: options.targetOpacity,
          blurPx: options.endBlurPx,
          scale: options.endScale
        },
        {
          opacity: options.startOpacity,
          blurPx: options.exitBlurPx,
          scale: options.exitScale
        },
        options.fadeOutMs
      );

      dom.cutinLayer.classList.remove("visible");
      if (dom.cutinImage) dom.cutinImage.removeAttribute("src");
      dom.cutinLayer.style.backgroundImage = "";
      resetEmpathyBackdropCssVars();
      resetEmpathyBackdropInlineState();
    }

    function expandEmotionWords(words, multiplier = 1) {
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
