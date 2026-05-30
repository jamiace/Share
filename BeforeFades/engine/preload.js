"use strict";

/***********************************************************************
 * Before Fades Engine Module: preload.js
 * Loaded as a classic script. Shared engine bindings are available globally.
 ***********************************************************************/

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
