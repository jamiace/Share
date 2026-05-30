"use strict";

/***********************************************************************
 * Before Fades Engine Module: audio.js
 * Loaded as a classic script. Shared engine bindings are available globally.
 ***********************************************************************/

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

    function unlockAudio() {
      state.startedAudio = true;
      [audio.bgm, audio.ambience].forEach(a => {
        a.play().then(() => a.pause()).catch(() => {});
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
