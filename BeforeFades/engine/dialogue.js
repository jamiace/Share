"use strict";

/***********************************************************************
 * Before Fades Engine Module: dialogue.js
 * Loaded as a classic script. Shared engine bindings are available globally.
 ***********************************************************************/

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
