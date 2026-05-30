# Before Fades Project

拆分後結構：

```text
Before Fades Project/
├─ index.html       # 極簡 HTML 骨架，負責載入外部檔案
├─ style.css        # 版面、顏色、UI、元件樣式
├─ engine/          # 遊戲引擎核心，依責任拆分
│  ├─ core.js          # 主流程、scene index、execute command
│  ├─ dom.js           # DOM 取得與 UI 基礎操作
│  ├─ dialogue.js      # 文字顯示、打字機、speaker
│  ├─ background.js    # 背景 / CG / document display mode
│  ├─ sprite.js        # 人物出入場、站位、清場
│  ├─ audio.js         # BGM / SFX / fade
│  ├─ effects.js       # shake / flash / fadeBlack 等一般特效
│  ├─ empathy.js       # 情緒感知專用系統
│  ├─ choice.js        # 選項 UI 與 route
│  ├─ preload.js       # 圖片預載與 loading
│  └─ documentViewer.js # 文件縮圖與放大檢視
├─ config.js        # 靜態設定：META、ASSETS、CAST
├─ macros.js        # 劇本巨集：line(), bg(), effect(), select()...
├─ scenes.js        # 純劇本內容
├─ script.js        # 舊 script.js 相容說明，不再承載劇本
└─ resource/
   ├─ image/
   ├─ bgm/
   ├─ sound_effect/
   └─ vfx/
```

## 這版重構重點

1. `index.html` 不再塞整包 CSS / engine / 劇本，維護時不用在同一個巨大檔案裡迷路。
2. `choiceUi.width: "50%"` 已改成 `choiceUi.widthRatio: 0.5` 這種數值語意。
3. `engine.js` 裡的 `applyChoiceUi()` 不再判斷固定字串，例如 `"70%"`。
4. 情緒文字動畫不再由 CSS 裡的無語意 keyframes 控制；改成 `CONFIG.emotion.motionProfiles`，用 `fadeInAt`、`holdUntil`、`opacity`、`yPx`、`scale`、`blurPx` 這種有語意的欄位調整。
5. 素材路徑已從 `assets/images`、`assets/bgm`、`assets/sfx` 改為 `resource/image`、`resource/bgm`、`resource/sound_effect`。

## 修改寬度方式

在 `scenes.js` 的選項指令中調整：

```js
choiceUi: {
  widthRatio: 0.5,
  maxWidthPx: 680,
  textAlign: "center"
}
```

`widthRatio` 是 0.1 到 0.95 的數值，不要再寫 `"50%"`。

## 修改情緒文字透明度 / 動畫方式

在 `engine.js` 的 `CONFIG.emotion.motionProfiles` 調整，例如：

```js
up: {
  fadeInAt: 0.18,
  holdUntil: 0.78,
  start: { opacity: 0, yPx: 12, scale: 0.96, blurPx: 6 },
  visible: { opacity: 1, yPx: 0, scale: 1, blurPx: 0 },
  hold: { opacity: 0.92 },
  end: { opacity: 0, yPx: -52, scale: 1.06, blurPx: 2 }
}
```

透明度與寬度已經完全分離：寬度在 `choiceLayout / choiceUi`，透明度在 `emotion.motionProfiles` 或個別特效參數。


## 2026-05-30 共感背景轉場調整

共感全螢幕背景已改為透明度 + 模糊的漸進式進退場，不再由 `#effectLayer` 直接黑場硬切。
可在 `config.js` 的 `ENGINE.emotion.backdrop` 調整：

- `fadeInMs` / `fadeOutMs`：進場與退場時間。
- `startBlurPx` / `endBlurPx` / `exitBlurPx`：進場模糊、清晰程度、退場模糊。
- `startScale` / `endScale` / `exitScale`：輕微縮放，避免畫面太死。
- `targetOpacity`：共感背景圖最終不透明度。

單一劇本指令仍可覆蓋，例如：

```js
effect({
  name: "empathyUp",
  visualBg: "cg_empathy_warm",
  words: ["期待", "不安"],
  fadeInMs: 1200,
  fadeOutMs: 1000,
  startBlurPx: 24,
  exitBlurPx: 20
})
```


## Title Screen 版號

Title Screen 右下角會顯示小型遊戲版號。

正式調整位置在 `config.js`：

```js
META.displayVersion = "v 0.7"
```

`index.html` 只放版號節點，`style.css` 控制顯示位置與樣式，`engine.js` 啟動時把 `META.displayVersion` 寫進畫面。


## 2026-05-30 Engine 模組化拆分

原本單一 `engine.js` 已拆成 `engine/` 目錄下的多個 classic script 模組。

這一版的目標是拆責任邊界，不改劇本內容、不改文字、不改演出節奏。`index.html` 會依序載入：

```html
<script src="./engine/core.js"></script>
<script src="./engine/dom.js"></script>
<script src="./engine/dialogue.js"></script>
<script src="./engine/background.js"></script>
<script src="./engine/sprite.js"></script>
<script src="./engine/audio.js"></script>
<script src="./engine/effects.js"></script>
<script src="./engine/empathy.js"></script>
<script src="./engine/choice.js"></script>
<script src="./engine/preload.js"></script>
<script src="./engine/documentViewer.js"></script>
```

`engine/documentViewer.js` 是最後載入的模組，負責在所有 engine 函式都準備完成後啟動 `init()`。
