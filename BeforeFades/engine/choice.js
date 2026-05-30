"use strict";

/***********************************************************************
 * Before Fades Engine Module: choice.js
 * Loaded as a classic script. Shared engine bindings are available globally.
 ***********************************************************************/

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
