"use strict";

/*
 * Before Fades Project - Scene macros
 * These are only syntax helpers for scenes.js. They do not touch the DOM.
 */
window.BF_MACROS = (() => {
  const { CAST } = window.BF_CONFIG || {};

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

  function bg(input = {}) {
    const { scene, sceneMode, ...rest } = input || {};
    const cmd = { type: "bg", ...rest };
    if (scene || sceneMode) cmd.sceneMode = scene || sceneMode;
    return cmd;
  }

  function withScene(type, input = {}) {
    const { scene, sceneMode, ...rest } = input || {};
    const cmd = { type, ...rest };
    if (scene || sceneMode) cmd.sceneMode = scene || sceneMode;
    return cmd;
  }

  function music(input = {}) {
    return withScene("bgm", input);
  }

  function sound(input = {}) {
    return withScene("sfx", input);
  }

  function note(input = {}) {
    const { scene, sceneMode, ...rest } = input || {};
    const cmd = { type: "note", ...rest };
    if (scene || sceneMode) cmd.sceneMode = scene || sceneMode;
    return cmd;
  }

  function clearSprites(input = {}) {
    return withScene("clearSprites", input);
  }

  function show(input = {}) {
    return withScene("show", input);
  }

  function hide(input = {}) {
    return withScene("hide", input);
  }

  function effect(input = {}) {
    const { scene, sceneMode, ...rest } = input || {};
    const cmd = { type: "effect", ...rest };
    if (scene || sceneMode) cmd.sceneMode = scene || sceneMode;
    return cmd;
  }

  function empathyUp(words = []) {
    return effect({ name: "empathyUp", words });
  }

  function empathyDown(words = []) {
    return effect({ name: "empathyDown", words });
  }

  function pause(input = {}) {
    return withScene("wait", input);
  }

  function jump(input = {}) {
    if (typeof input === "string") return { type: "jump", next: input };
    return withScene("jump", input);
  }

  function endGame(input = {}) {
    return withScene("end", input);
  }

  function option(input = {}) {
    if (typeof input === "string") return { text: input };
    return { ...(input || {}) };
  }

  function select(input = {}) {
    const { scene, sceneMode, ...rest } = input || {};
    const cmd = { type: "choice", ...(rest || {}) };
    if (scene || sceneMode) cmd.sceneMode = scene || sceneMode;
    return cmd;
  }

  function whenFlag(flag, next, equals = true) {
    return { flag, equals, next };
  }

  function route(input = {}) {
    const { scene, sceneMode, ...rest } = input || {};
    const cmd = { type: "route", ...(rest || {}) };
    if (scene || sceneMode) cmd.sceneMode = scene || sceneMode;
    return cmd;
  }


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
