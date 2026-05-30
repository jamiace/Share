"use strict";

/***********************************************************************
 * Before Fades Engine Module: background.js
 * Loaded as a classic script. Shared engine bindings are available globally.
 ***********************************************************************/

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
