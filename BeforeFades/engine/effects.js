"use strict";

/***********************************************************************
 * Before Fades Engine Module: effects.js
 * Loaded as a classic script. Shared engine bindings are available globally.
 ***********************************************************************/

    async function runEffect(cmd) {
      if (shouldClearDialogueForEffect(cmd)) clearDialogueUi();
      switch (cmd.name) {
        case "shake": await shake(cmd.target || "game"); break;
        case "flash": await flash(cmd.opacity ?? 0.85, cmd.ms ?? 260); break;

        // 原本的庭如共感文字：上升。
        // JSON: { "type": "effect", "name": "empathy", "words": ["期待", "好奇"] }
        // 也可明確指定：{ "type": "effect", "name": "empathyUp", "words": [...] }
        case "empathy":
          await runEmpathyEffect(cmd);
          break;
        case "empathyUp":
          await runEmpathyEffect(cmd, "up");
          break;

        // 負面情緒下墜。
        case "empathyDown":
        case "empathyFall":
        case "empathySink":
          await runEmpathyEffect(cmd, "down");
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
