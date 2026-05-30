"use strict";

/*
 * Before Fades Project - Scene Macros
 * ---------------------------------------------------------------------------
 * 這支檔案是「劇本語法糖」，專門給 scenes.js 使用。
 *
 * 重要原則：
 * 1. macros.js 不直接操作畫面、不碰 DOM、不播放音效，也不處理動畫。
 * 2. macros.js 只負責把好寫、好讀的劇本語法，轉成 engine 可以執行的 command object。
 * 3. 劇情企劃寫 scenes.js 時，應該優先使用這裡提供的巨集，而不是手寫底層 JSON。
 * 4. 角色、素材、情緒感知預設參數等共用設定，請放在 config.js。
 * 5. 對話文字、情緒文字、劇情分歧內容，請放在 scenes.js。
 *
 * scenes.js 常見寫法範例：
 *
 * const {
 *   scene, context, line, bg, show, hide, clearSprites,
 *   music, sound, note, empathyUp, empathyDown,
 *   pause, select, option, jump, route, whenFlag, endGame
 * } = window.BF_MACROS;
 *
 * window.BEFORE_FADES_SCENES = {
 *   start: [
 *     scene({ mode: "title", label: "Before Fades" }),
 *     bg({ id: "bg_title", displayMode: "cover" }),
 *     select({
 *       options: [
 *         option({ text: "開始遊戲", next: "opening" })
 *       ]
 *     })
 *   ],
 *   opening: [
 *     scene({ mode: "control", participants: ["mercer", "ruri"] }),
 *     line({ role: "mercer", text: "準備好了嗎？" }),
 *     line({ role: "ruri", text: "我試試看。" }),
 *     empathyUp(["期待", "好奇", "不安"])
 *   ]
 * };
 */
window.BF_MACROS = (() => {
  // CAST 來自 config.js。
  // line({ role: "mercer", text: "..." }) 會透過 CAST 自動補上 speaker、character 等資料。
  const { CAST } = window.BF_CONFIG || {};

  /*
   * scene(input)
   * -------------------------------------------------------------------------
   * 用途：宣告「一個場景或段落的主要狀態」。
   *
   * 適合放在一段場景的開頭，例如 title、control、stage、empathy 等。
   * engine 會根據 sceneMode / mode 更新 UI 焦點、場景狀態、對話站位邏輯。
   *
   * 常用欄位：
   * - mode: 場景模式。例如 "title"、"control"、"stage"、"empathy"。
   * - label: 顯示在左上角 modeBadge 的文字。
   * - ui: UI 主題。通常可省略，讓 engine 依 mode 自動判斷。
   * - participants: 這段對話會出現的主要角色 id。
   * - voiceOnly: 只有聲音、不要顯示立繪的角色 id。
   * - conversation: false 表示不要更新對話上下文。
   *
   * 範例：
   * scene({ mode: "control", label: "老麵 / 後台控制", participants: ["mercer", "ruri"] })
   */
  function scene(input = {}) {
    const {
      mode = "system",
      value,
      label,
      ui,
      layout = "auto",
      participants = [],
      voiceOnly = [],
      voiceOnlyParticipants,
      placementPolicy = "primary-left-secondary-right-swap-once",
      clearPolicy = "clear-at-scene-boundary-and-major-visual-change",
      conversation,
      ...extra
    } = input || {};

    const cmd = {
      type: "mode",
      value: value || mode,
      label: label || String(mode || "SYSTEM").toUpperCase(),
      sceneMode: mode,
      ...extra
    };

    if (ui) cmd.ui = ui;

    if (conversation !== false) {
      cmd.conversation = conversation || {
        layout,
        participants,
        voiceOnlyParticipants: voiceOnlyParticipants || voiceOnly,
        placementPolicy,
        clearPolicy
      };
    }

    return cmd;
  }

  /*
   * context(input)
   * -------------------------------------------------------------------------
   * 用途：只更新目前段落的上下文，不一定切換大場景。
   *
   * 和 scene() 的差異：
   * - scene() 通常用在一段場景開頭，會產生 type: "mode"。
   * - context() 通常用在中途微調，例如換對話成員、換 sceneMode、改 UI 焦點。
   *
   * 範例：
   * context({ scene: "empathy", participants: ["ruri"], voiceOnly: ["jamie"] })
   */
  function context(input = {}) {
    const {
      mode = "system",
      scene,
      sceneMode,
      label,
      ui,
      layout,
      participants,
      voiceOnly,
      voiceOnlyParticipants,
      placementPolicy = "primary-left-secondary-right-swap-once",
      clearPolicy = "clear-at-scene-boundary-and-major-visual-change",
      conversation,
      ...extra
    } = input || {};

    const resolvedMode = scene || sceneMode || mode;
    const cmd = {
      type: "context",
      sceneMode: resolvedMode,
      ...extra
    };

    if (label) cmd.label = label;
    if (ui) cmd.ui = ui;
    if (conversation) cmd.conversation = conversation;
    else if (layout || participants || voiceOnly || voiceOnlyParticipants) {
      cmd.conversation = {
        layout: layout || "auto",
        participants: participants || [],
        voiceOnlyParticipants: voiceOnlyParticipants || voiceOnly || [],
        placementPolicy,
        clearPolicy
      };
    }

    return cmd;
  }

  /*
   * line(input)
   * -------------------------------------------------------------------------
   * 用途：寫一句旁白或角色台詞。
   *
   * 三種常見寫法：
   *
   * 1. 旁白簡寫：
   *    line("控制室裡，只剩下監控畫面的光。")
   *
   * 2. 已登錄角色台詞：
   *    line({ role: "mercer", text: "先不要急。" })
   *    - role 必須存在於 config.js 的 CAST。
   *    - 會自動補 speaker、character、speakerFocus 等角色設定。
   *
   * 3. 未登錄角色 / 純聲音台詞：
   *    line({ speaker: "廣播", text: "請所有工作人員注意。" })
   *    - 不顯示立繪，只當聲音或一般說話者處理。
   *
   * 常用欄位：
   * - role: 使用 CAST 裡的角色 id。
   * - speaker / name: 直接指定顯示名稱，不使用 CAST。
   * - text: 對話文字。
   * - expression / expr: 角色表情。
   * - position / pos: 角色站位，例如 "left"、"center"、"right"。
   * - scene / sceneMode: 這一句話臨時指定場景模式。
   */
  function line(input = {}) {
    if (typeof input === "string") return { type: "narrate", text: input };

    const {
      role,
      speaker,
      name,
      text = "",
      expression,
      expr,
      position,
      pos,
      scene,
      sceneMode,
      ...extra
    } = input || {};

    if (role) {
      const cast = CAST[role];
      if (!cast) throw new Error(`Unknown line role: ${role}`);
      const cmd = { type: "say", ...cast, text, ...extra };
      if (expression || expr) cmd.expression = expression || expr;
      if (position || pos) cmd.position = position || pos;
      if (scene || sceneMode) cmd.sceneMode = scene || sceneMode;
      return cmd;
    }

    if (speaker || name) {
      const cmd = {
        type: "say",
        speaker: speaker || name,
        character: "none",
        speakerFocus: "voice",
        presence: "voiceOnly",
        text,
        ...extra
      };
      if (scene || sceneMode) cmd.sceneMode = scene || sceneMode;
      return cmd;
    }

    const cmd = { type: "narrate", text, ...extra };
    if (scene || sceneMode) cmd.sceneMode = scene || sceneMode;
    return cmd;
  }

  /*
   * bg(input)
   * -------------------------------------------------------------------------
   * 用途：切換背景、CG、Logo、文件圖等視覺素材。
   *
   * 常用欄位：
   * - id: 背景素材 id，需存在於 config.js 的 ASSETS.backgrounds。
   * - displayMode: 顯示模式，例如 "cover"、"cg"、"logo"、"document"。
   * - waitAfter / delayAfter: 切換後等待時間。
   * - scene / sceneMode: 切換背景時順便指定場景模式。
   *
   * 範例：
   * bg({ id: "bg_control_room", displayMode: "cover" })
   * bg({ id: "doc_guest_list", displayMode: "document" })
   */
  function bg(input = {}) {
    const { scene, sceneMode, ...rest } = input || {};
    const cmd = { type: "bg", ...rest };
    if (scene || sceneMode) cmd.sceneMode = scene || sceneMode;
    return cmd;
  }

  /*
   * withScene(type, input)
   * -------------------------------------------------------------------------
   * 內部共用工具。
   *
   * 用途：產生任意 type 的 command，並支援 scene / sceneMode 欄位。
   * 劇情企劃通常不需要直接使用它，除非要寫新的簡單巨集。
   */
  function withScene(type, input = {}) {
    const { scene, sceneMode, ...rest } = input || {};
    const cmd = { type, ...rest };
    if (scene || sceneMode) cmd.sceneMode = scene || sceneMode;
    return cmd;
  }

  /*
   * music(input)
   * -------------------------------------------------------------------------
   * 用途：播放或切換 BGM。
   *
   * 常用欄位：
   * - id: BGM id，需存在於 config.js 的 ASSETS.bgm。
   * - volume: 音量，通常 0 到 1。
   * - loop: 是否循環。
   * - fade: 淡入淡出時間。
   *
   * 範例：
   * music({ id: "bgm_control_room", volume: 0.55, loop: true, fade: 1200 })
   */
  function music(input = {}) {
    return withScene("bgm", input);
  }

  /*
   * sound(input)
   * -------------------------------------------------------------------------
   * 用途：播放一次性音效。
   *
   * 常用欄位：
   * - id: 音效 id，需存在於 config.js 的 ASSETS.sfx。
   * - volume: 音量，通常 0 到 1。
   *
   * 範例：
   * sound({ id: "ui_click", volume: 0.4 })
   */
  function sound(input = {}) {
    return withScene("sfx", input);
  }

  /*
   * note(input)
   * -------------------------------------------------------------------------
   * 用途：更新右側資訊欄 / 案件筆記 / 文件說明。
   *
   * 常用欄位：
   * - title: 右側欄標題。
   * - text: 右側欄內容。
   * - image: 可選，搭配文件或縮圖顯示。
   *
   * 範例：
   * note({ title: "CASE / NOTE", text: "目前等待指示。" })
   */
  function note(input = {}) {
    const { scene, sceneMode, ...rest } = input || {};
    const cmd = { type: "note", ...rest };
    if (scene || sceneMode) cmd.sceneMode = scene || sceneMode;
    return cmd;
  }

  /*
   * clearSprites(input)
   * -------------------------------------------------------------------------
   * 用途：清除目前畫面上的所有角色立繪。
   *
   * 適合用在：
   * - 大場景切換。
   * - 回憶 / CG / 文件畫面前。
   * - 避免上一段角色殘留到下一段。
   *
   * 範例：
   * clearSprites()
   */
  function clearSprites(input = {}) {
    return withScene("clearSprites", input);
  }

  /*
   * show(input)
   * -------------------------------------------------------------------------
   * 用途：顯示角色立繪。
   *
   * 常用欄位：
   * - id / character: 角色 id。
   * - expression / expr: 表情。
   * - position / pos: 站位，例如 "left"、"center"、"right"。
   *
   * 範例：
   * show({ id: "mercer", expression: "default", position: "left" })
   */
  function show(input = {}) {
    return withScene("show", input);
  }

  /*
   * hide(input)
   * -------------------------------------------------------------------------
   * 用途：隱藏角色立繪。
   *
   * 常用欄位：
   * - id: 要隱藏的角色 id。
   *
   * 範例：
   * hide({ id: "ruri" })
   */
  function hide(input = {}) {
    return withScene("hide", input);
  }

  /*
   * effect(input)
   * -------------------------------------------------------------------------
   * 用途：執行特殊效果。
   *
   * 注意：一般劇情企劃應優先使用更語意化的巨集，例如 empathyUp() / empathyDown()。
   * 只有在需要特殊效果，例如 shake、flash、fadeBlack 時，才直接使用 effect()。
   *
   * 常用欄位：
   * - name: 特效名稱。
   * - duration / ms: 特效持續時間，若是共用演出請優先放 config.js。
   * - words: 情緒文字，僅情緒感知類特效使用。
   *
   * 範例：
   * effect({ name: "shake", duration: 420 })
   */
  function effect(input = {}) {
    const { scene, sceneMode, ...rest } = input || {};
    const cmd = { type: "effect", ...rest };
    if (scene || sceneMode) cmd.sceneMode = scene || sceneMode;
    return cmd;
  }

  /*
   * empathyUp(words)
   * -------------------------------------------------------------------------
   * 用途：發動「情緒上升」演出。
   *
   * 劇情企劃只需要放情緒文字陣列。
   * 不需要在 scene 裡指定 direction、visualBg、duration、holdBeforeWordsMs、lockInput。
   * 這些演出規則由 config.js 的 ENGINE.emotion.empathy 統一管理。
   *
   * 注意：
   * - words 的內容、順序、重複次數會原樣保留。
   * - 如果你故意把某些詞放兩次或三次，engine 不會自動刪除。
   *
   * 範例：
   * empathyUp(["期待", "好奇", "怕被忘記"])
   */
  function empathyUp(words = []) {
    return effect({ name: "empathyUp", words });
  }

  /*
   * empathyDown(words)
   * -------------------------------------------------------------------------
   * 用途：發動「情緒下降」演出。
   *
   * 規則同 empathyUp()，只差在會使用 config.js 裡定義的下降背景與下降文字動態。
   *
   * 範例：
   * empathyDown(["恐懼", "愧疚", "沉重"])
   */
  function empathyDown(words = []) {
    return effect({ name: "empathyDown", words });
  }

  /*
   * pause(input)
   * -------------------------------------------------------------------------
   * 用途：等待一段時間。
   *
   * 常用欄位：
   * - ms: 等待毫秒數。
   *
   * 範例：
   * pause({ ms: 800 })
   */
  function pause(input = {}) {
    return withScene("wait", input);
  }

  /*
   * jump(input)
   * -------------------------------------------------------------------------
   * 用途：跳到指定 scene。
   *
   * 寫法：
   * jump("opening")
   * jump({ next: "bad_end" })
   */
  function jump(input = {}) {
    if (typeof input === "string") return { type: "jump", next: input };
    return withScene("jump", input);
  }

  /*
   * endGame(input)
   * -------------------------------------------------------------------------
   * 用途：結束遊戲流程。
   *
   * 範例：
   * endGame()
   */
  function endGame(input = {}) {
    return withScene("end", input);
  }

  /*
   * option(input)
   * -------------------------------------------------------------------------
   * 用途：建立選項。
   *
   * 簡寫：
   * option("繼續")
   *
   * 完整寫法：
   * option({ text: "開始遊戲", next: "opening" })
   *
   * 常用欄位：
   * - text: 玩家看到的選項文字。
   * - next: 選完後跳到哪個 scene。
   * - set: 選完後設定 flag，例如 { accepted: true }。
   */
  function option(input = {}) {
    if (typeof input === "string") return { text: input };
    return { ...(input || {}) };
  }

  /*
   * select(input)
   * -------------------------------------------------------------------------
   * 用途：顯示選項組。
   *
   * 常用欄位：
   * - prompt: 選項上方提示文字。
   * - options: option(...) 陣列。
   * - choiceUi: 選項版面設定，例如 widthRatio、maxWidthPx、textAlign。
   *
   * 範例：
   * select({
   *   prompt: "要怎麼回應？",
   *   options: [
   *     option({ text: "答應", next: "accept", set: { accepted: true } }),
   *     option({ text: "拒絕", next: "reject" })
   *   ]
   * })
   */
  function select(input = {}) {
    const { scene, sceneMode, ...rest } = input || {};
    const cmd = { type: "choice", ...(rest || {}) };
    if (scene || sceneMode) cmd.sceneMode = scene || sceneMode;
    return cmd;
  }

  /*
   * whenFlag(flag, next, equals = true)
   * -------------------------------------------------------------------------
   * 用途：建立 route() 用的分歧條件。
   *
   * 範例：
   * route({
   *   branches: [
   *     whenFlag("accepted", "accept_route"),
   *     whenFlag("sawSecret", "secret_route")
   *   ],
   *   default: "normal_route"
   * })
   */
  function whenFlag(flag, next, equals = true) {
    return { flag, equals, next };
  }

  /*
   * route(input)
   * -------------------------------------------------------------------------
   * 用途：依照 flags 決定要跳到哪個 scene。
   *
   * 常用欄位：
   * - branches: 條件陣列。
   * - default / else / fallback: 沒有符合條件時的目標 scene。
   *
   * 範例：
   * route({
   *   branches: [whenFlag("accepted", "accept_scene")],
   *   default: "normal_scene"
   * })
   */
  function route(input = {}) {
    const { scene, sceneMode, ...rest } = input || {};
    const cmd = { type: "route", ...(rest || {}) };
    if (scene || sceneMode) cmd.sceneMode = scene || sceneMode;
    return cmd;
  }

  // 對外輸出：scenes.js 只能使用這裡 return 的名稱。
  return {
    scene,
    context,
    line,
    bg,
    withScene,
    music,
    sound,
    note,
    clearSprites,
    show,
    hide,
    effect,
    empathyUp,
    empathyDown,
    pause,
    jump,
    endGame,
    option,
    select,
    whenFlag,
    route
  };
})();
