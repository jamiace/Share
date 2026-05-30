"use strict";

/***********************************************************************
 * Before Fades Engine Module: documentViewer.js
 * Loaded as a classic script. Shared engine bindings are available globally.
 ***********************************************************************/

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

init().catch((err) => {
  console.error(err);
  setSideNote("SYSTEM ERROR", err.message || String(err));
});
