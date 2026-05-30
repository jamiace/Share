"use strict";

/*
 * Compatibility note
 * --------------------------------------------------------------------------
 * The old single data/script.js has been split into:
 *   - config.js : META / ASSETS / CAST
 *   - macros.js : line(), bg(), effect(), select()...
 *   - scenes.js : actual scene and dialogue flow
 *
 * index.html now loads those files directly before engine.js.
 * Keep this file only if an old deployment or note still expects script.js to exist.
 */
window.BF_SCRIPT_SPLIT_VERSION = "3.0.0-split-project";
