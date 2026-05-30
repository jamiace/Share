# Before Fades Project 詳細技術與劇情編寫說明

> 本文件不是程式註解，而是給「劇情企劃、協作者、未來維護者」看的交接文件。  
> 目標是說清楚：每個檔案負責什麼、每個巨集怎麼用、engine 模組有哪些函式、參數代表什麼，以及為什麼架構要這樣拆。

---

## 0. 專案目前定位

Before Fades 目前不是單純的 HTML 小遊戲，也不是把小說文字貼進網頁而已。它比較接近一套「靜態網頁版視覺小說 / 劇情演出引擎」。

它的核心設計目標是：

1. **劇情企劃可以用簡潔語法寫 `scenes.js`**，不用碰 DOM、CSS、動畫細節。
2. **演出規則集中在 `config.js` 與 engine 模組**，避免每段劇本重複指定 duration、背景圖、UI 行為。
3. **engine 負責怎麼跑，scene 負責發生什麼事。**
4. **未來可以新增章節、資料片，甚至交給另一個人分工。**

目前專案仍使用「classic script」方式載入，不使用 ES module / bundler。理由是降低部署門檻：整包丟到 GitHub Pages、Netlify、Cloudflare Pages 或本機靜態伺服器就能跑。

---

## 1. 專案檔案結構

```text
Before Fades Project/
├─ index.html
├─ style.css
├─ config.js
├─ macros.js
├─ scenes.js
├─ script.js
├─ README.md
├─ README_DETAILED.md
├─ engine/
│  ├─ core.js
│  ├─ dom.js
│  ├─ dialogue.js
│  ├─ background.js
│  ├─ sprite.js
│  ├─ audio.js
│  ├─ effects.js
│  ├─ empathy.js
│  ├─ choice.js
│  ├─ preload.js
│  └─ documentViewer.js
└─ resource/
   ├─ image/
   ├─ bgm/
   ├─ sound_effect/
   └─ vfx/
```

### 責任總覽

| 檔案 / 資料夾 | 責任 | 誰主要會改 |
|---|---|---|
| `index.html` | HTML 骨架、DOM 節點、載入 JS/CSS | 工程 / 引擎維護者 |
| `style.css` | UI、背景、人物、共感、文件檢視器、loading 樣式 | 美術前端 / 工程 |
| `config.js` | META、版號、素材路徑、角色、engine 可調參數 | PM / 工程 / 內容管理 |
| `macros.js` | 給企劃寫 `scenes.js` 的語法糖 | 工程 / 工具設計 |
| `scenes.js` | 劇本流程、對話、場景、選項 | 劇情企劃 |
| `script.js` | 舊版相容說明，目前不承載劇本 | 通常不用改 |
| `engine/` | 遊戲引擎實作，依責任拆分 | 工程 |
| `resource/` | 圖片、音樂、音效、特效素材 | 美術 / 音效 / 內容管理 |

---

## 2. 載入順序與為什麼很重要

`index.html` 會依序載入：

```html
<script src="./config.js"></script>
<script src="./macros.js"></script>
<script src="./scenes.js"></script>
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

### 為什麼是這個順序？

1. `config.js` 必須先載入，因為它提供 `window.BF_CONFIG`，包含素材、角色、版號、engine 設定。
2. `macros.js` 依賴 `BF_CONFIG.CAST`，所以必須在 `config.js` 後面。
3. `scenes.js` 會使用 `BF_MACROS` 產生劇本資料，並設定 `window.BEFORE_FADES_SCRIPT`。
4. engine 模組最後載入，讀取 `window.BEFORE_FADES_SCRIPT` 並開始執行。
5. `documentViewer.js` 是最後一個 engine 模組，因為它檔尾會呼叫 `init()`。這代表所有 engine 函式必須在它之前載入完成。

### 為什麼目前不用 ES modules？

目前專案目標是「靜態網頁可直接部署」，不希望額外引入 build step。Classic script 雖然比較傳統，但有幾個好處：

- 不需要 npm / Vite / Webpack。
- 不需要處理 module path、CORS、local file 的限制。
- 對非工程協作者比較直覺。
- 目前專案規模仍可接受。

缺點是：所有函式目前都在全域作用域，命名需要小心。未來如果專案繼續長大，可以再升級成 ES module 或 build pipeline。

---

## 3. 執行流程總覽

遊戲啟動流程大致如下：

```text
index.html 載入 DOM
↓
config.js 建立 META / ENGINE / ASSETS / CAST
↓
macros.js 建立劇本巨集
↓
scenes.js 產生 window.BEFORE_FADES_SCRIPT
↓
engine/*.js 載入所有引擎函式
↓
documentViewer.js 呼叫 init()
↓
init() 合併 config、綁定事件、預載圖片
↓
runCurrent() 讀取目前 scene 的目前指令
↓
execute(cmd) 根據 cmd.type 執行對應功能
↓
指令完成後 nextCommand() 推進下一個指令
```

核心觀念：`scenes.js` 裡的每一個巨集最後都會變成一個 command 物件，例如：

```js
line({ role: "mercer", text: "準備好了嗎？" })
```

會變成類似：

```js
{
  type: "say",
  speaker: "老麵",
  character: "mercer",
  text: "準備好了嗎？"
}
```

engine 不在乎這個 command 是手寫的還是巨集產生的，只看 `type` 來決定要怎麼執行。

---

## 4. `index.html` 詳細說明

`index.html` 的責任非常單純：

1. 提供遊戲需要的 DOM 容器。
2. 載入 `style.css`。
3. 依序載入 config、macros、scenes、engine 模組。

### 主要 DOM 節點

| 節點 | 用途 |
|---|---|
| `#game` | 最外層遊戲容器，theme class、title-screen class 都掛在這裡 |
| `#bgLayer` | 背景層 |
| `#bgImage` | 主背景 / CG 圖片 |
| `#titleLogo` | Title Screen logo |
| `#spriteLayer` | 人物立繪層 |
| `#effectLayer` | 特效層，包含 flash、cutin、共感文字 |
| `#cutinLayer` / `#cutinImage` | 共感全螢幕背景 / cutin 圖 |
| `#uiLayer` | 對話框與上方狀態列 |
| `#modeBadge` | 目前模式顯示，例如 SYSTEM、RURI / EMPATHY |
| `#dialogueBox` | 對話框，可點擊推進 |
| `#speakerName` | 說話者名稱 |
| `#dialogueText` | 對話文字 |
| `#sidePanel` | 右側輔助資訊欄 |
| `#choices` | 選項按鈕容器 |
| `#gameVersion` | Title Screen 右下角版號 |
| `#docViewerLayer` | 文件放大檢視器 |
| `#loadingLayer` | 載入畫面與預載進度 |

### 設計理由

`index.html` 不應該放劇情、不應該放大量 CSS、不應該放 engine 邏輯。它只負責「畫面骨架」。這樣未來如果要調整劇情，不會動到 HTML；如果要調整 engine，也不用翻一支巨大的 HTML。

---

## 5. `style.css` 詳細說明

`style.css` 負責視覺呈現。它不決定劇情流程，也不判斷目前劇情走到哪裡。

### 重要區塊

#### 5.1 CSS 變數

`:root` 裡定義了 UI 常用顏色、字體、安全距離：

```css
--ui-bg
--ui-bg-strong
--ui-border
--text
--accent
--top-safe
--hud-height
--hud-gap
```

這些是全域視覺基礎。未來想換 UI 風格，可以優先從這裡調。

#### 5.2 Theme class

```css
#game.theme-gray
#game.theme-ruri
#game.theme-jamie
```

這三種 theme 對應不同演出狀態：

| Theme | 用途 |
|---|---|
| `theme-gray` | 一般系統 / 老麵 / 控制室 |
| `theme-ruri` | 庭如 / 共感模式 |
| `theme-jamie` | 傑米 / 舞台演出 |

為什麼不要用 speaker 自動決定 theme？

因為「誰在說話」不等於「畫面焦點」。例如庭如說話不一定代表進入共感；老麵在共感操作中說話，也可能仍然要保持共感 UI。theme 應該由 sceneMode / ui focus 控制，而不是 speaker。

#### 5.3 背景顯示模式

```css
#bgLayer.display-cover
#bgLayer.display-cg
#bgLayer.display-document
#bgLayer.display-logo
```

這些對應不同素材類型：

| Mode | 用途 |
|---|---|
| `display-cover` | 一般背景圖 |
| `display-cg` | CG / cutscene 圖 |
| `display-document` | 文件圖保護模式，不當主背景 |
| `display-logo` | logo 或發布用視覺圖 |

設計理由：避免所有圖片都用同一種 `object-fit` 和位置。背景、CG、文件、logo 的語意不同，顯示規則也應該不同。

#### 5.4 人物立繪 `.sprite`

`.sprite.left`、`.sprite.center`、`.sprite.right` 控制人物位置。人物進退場由 opacity 和 transform transition 處理。

設計理由：人物位置應該是 engine 的站位系統決定，但具體怎麼顯示、陰影、大小、淡入淡出，屬於 CSS。

#### 5.5 共感全螢幕背景

```css
#game.empathy-fullscreen-active #cutinLayer
#game.empathy-fullscreen-active #cutinImage
```

共感背景現在不再使用 CSS transition 主控，而是由 `engine/empathy.js` 使用 Web Animations API 控制。CSS 只保留基本狀態與變數。

為什麼要這樣？

之前遇到過圖片瞬間顯示的問題。原因是瀏覽器可能把「設 src」、「設 class」、「套用 visible 狀態」合併在同一幀，導致 `fadeInMs` 設很長仍然瞬間完成。改用 Web Animations API 可以更穩定地控制從透明模糊到清晰不透明的過程。

#### 5.6 Title Screen 版號

```css
#gameVersion
#game.title-screen #gameVersion
```

版號平常隱藏，只在 `#game` 有 `title-screen` class 時顯示。用途是快速確認玩家或測試者看到的是不是最新版本。

---

## 6. `config.js` 詳細說明

`config.js` 是靜態設定檔，會建立：

```js
window.BF_CONFIG = {
  META,
  ENGINE,
  ASSETS,
  CAST
}
```

### 6.1 META

`META` 放產品資訊：

```js
const META = {
  title: "Before Fades：地獄脫口秀的產品發表會",
  version: "",
  displayVersion: "v0.7.0",
  language: "zh-Hant",
  engine: "Before Fades Static Web Visual Novel Engine",
  startScene: "start"
};
```

| 欄位 | 用途 |
|---|---|
| `title` | 遊戲標題 |
| `version` | 可保留給內部版本 |
| `displayVersion` | Title Screen 右下角顯示的版號 |
| `language` | 語言標記 |
| `engine` | engine 名稱 |
| `startScene` | 起始場景 ID，目前 engine 預設仍使用 `start` |

### 為什麼要有版號？

在靜態網頁部署時，很容易被瀏覽器 cache、GitHub Pages 延遲、打包錯誤搞混。Title Screen 右下角的小版號可以快速判斷目前跑的是不是最新版本。

---

### 6.2 ENGINE

`ENGINE` 是 engine 可調參數。這些東西不應該寫在 `scenes.js` 裡，因為它們是「系統演出規則」，不是劇情內容。

#### 情緒感知設定

```js
ENGINE.emotion.empathy = {
  defaultDirection: "up",
  durationMs: 6860,
  holdBeforeWordsMs: 350,
  lockInput: false,
  hideUiDuringEffect: true,
  wordMultiplier: 1,
  profiles: {
    up: {
      visualBg: "cg_empathy_warm",
      wordDirection: "up"
    },
    down: {
      visualBg: "cg_empathy_fall",
      wordDirection: "down"
    }
  }
};
```

| 欄位 | 用途 |
|---|---|
| `defaultDirection` | 沒指定方向時預設上升或下降 |
| `durationMs` | 情緒文字整體演出時間 |
| `holdBeforeWordsMs` | 背景出現後，文字開始前的等待時間 |
| `lockInput` | 是否在共感期間禁止玩家操作 |
| `hideUiDuringEffect` | 共感期間是否隱藏 UI |
| `wordMultiplier` | 是否把傳入 words 自動倍增；目前保留 1，避免改動劇情文字數量 |
| `profiles.up.visualBg` | 上升共感使用的背景圖 key |
| `profiles.down.visualBg` | 下降共感使用的背景圖 key |
| `profiles.up.wordDirection` | 上升文字動畫方向 |
| `profiles.down.wordDirection` | 下降文字動畫方向 |

#### 為什麼這些不放 scenes.js？

因為 scene 只應該描述：

```text
這裡要發動情緒上升，顯示哪些詞。
```

不應該每次都寫：

```text
用哪張背景、持續幾毫秒、文字何時出現、UI 是否隱藏、是否鎖操作。
```

這些是演出規格，應該集中管理。未來如果要把所有共感延長 300ms，只要改 config，不用掃整支 scenes.js。

#### 共感背景設定

```js
ENGINE.emotion.backdrop = {
  fadeInMs: 1200,
  fadeOutMs: 1200,
  startOpacity: 0,
  targetOpacity: 1,
  startBlurPx: 30,
  endBlurPx: 0,
  exitBlurPx: 30,
  startScale: 1.035,
  endScale: 1,
  exitScale: 1.025
};
```

| 欄位 | 用途 |
|---|---|
| `fadeInMs` | 共感背景淡入時間 |
| `fadeOutMs` | 共感背景淡出時間 |
| `startOpacity` | 進場起始透明度 |
| `targetOpacity` | 進場完成透明度 |
| `startBlurPx` | 進場起始模糊度 |
| `endBlurPx` | 穩定狀態模糊度 |
| `exitBlurPx` | 退場結束模糊度 |
| `startScale` | 進場起始縮放 |
| `endScale` | 穩定狀態縮放 |
| `exitScale` | 退場結束縮放 |

---

### 6.3 ASSETS

`ASSETS` 放素材路徑：

```js
ASSETS = {
  backgrounds: {},
  characters: {},
  bgm: {},
  sfx: {},
  imageManifest: {}
}
```

#### backgrounds

背景、CG、文件、logo 都放在 `backgrounds`。engine 會依照 ID / path / manifest 判斷 category。

命名建議：

| 前綴 | 用途 |
|---|---|
| `bg_` | 一般背景 |
| `cg_` | CG / 特殊畫面 |
| `doc_` | 文件圖，預設顯示在 side panel，而不是主背景 |
| `logo_` | logo 或 UI 發布圖 |

#### characters

角色立繪：

```js
characters: {
  mercer: {
    default: "resource/image/ch_mercer_default.png",
    serious: "resource/image/ch_mercer_serious.png"
  }
}
```

`show({ id: "mercer", expression: "serious" })` 會讀 `characters.mercer.serious`。

#### bgm / sfx

BGM 與音效用 key 管理：

```js
music({ id: "title" })
sound({ id: "ui_click" })
```

劇本不要直接寫檔案路徑，否則未來換素材時會很痛。

#### imageManifest

`imageManifest` 用來補充素材分類與描述。文件 viewer、side panel caption、loading 報表都可以使用這些資訊。

---

### 6.4 CAST

`CAST` 是角色定義。`line({ role: "mercer", text: "..." })` 會從這裡查角色名稱、character id、預設表情等。

設計理由：劇情企劃不應該每次都寫：

```js
speaker: "老麵",
character: "mercer"
```

而是寫：

```js
line({ role: "mercer", text: "..." })
```

角色顯示名稱、角色 ID、預設圖像由 CAST 統一管理。

---

## 7. `macros.js` 詳細說明

`macros.js` 是給 `scenes.js` 使用的劇本語法糖。它不碰 DOM，不播放音樂，不顯示圖片。它只把比較好寫的語法轉成 engine 看得懂的 command。

### 巨集總覽

| 巨集 | 用途 |
|---|---|
| `scene()` | 設定主要場景模式與對話參與者 |
| `context()` | 中途切換場景語意 / 對話脈絡 |
| `line()` | 角色對白 / 旁白 |
| `bg()` | 切換背景、CG、文件 |
| `music()` | 播放 BGM |
| `sound()` | 播放音效 |
| `note()` | 更新右側資訊欄 |
| `show()` | 顯示人物 |
| `hide()` | 隱藏人物 |
| `clearSprites()` | 清掉所有人物 |
| `effect()` | 一般特效 |
| `empathyUp()` | 情緒上升共感 |
| `empathyDown()` | 情緒下降共感 |
| `pause()` | 等待 |
| `select()` | 選項 |
| `option()` | 選項項目 |
| `jump()` | 跳場景 |
| `route()` | 依 flag 分流 |
| `whenFlag()` | route 分支條件 |
| `endGame()` | 結束遊戲 |

---

### 7.1 `scene(input)`

用於一個場景段落的開頭，設定目前 sceneMode、UI label、對話參與者。

```js
scene({
  mode: "control",
  label: "老麵 / 後台控制",
  participants: ["mercer", "ruri"],
  layout: "auto"
})
```

常用參數：

| 參數 | 說明 |
|---|---|
| `mode` | 場景模式，例如 `title`、`control`、`empathy`、`stage` |
| `label` | 上方 modeBadge 顯示文字 |
| `ui` | UI theme 簡寫：`g` / `t` / `j` |
| `participants` | 本段對話主要角色，用於自動清理不相關立繪 |
| `voiceOnly` | 只出聲不顯示立繪的角色 |
| `layout` | 對話站位策略，目前常用 `auto` |
| `conversation` | 若設為 `false`，不建立 conversation context |

為什麼需要 `scene()`？

因為 scene 不只是背景，它還包括 UI 焦點、人物站位、對話參與者、title screen 狀態等。把這些集中在段落開頭，比每一句對白都重複指定乾淨。

---

### 7.2 `context(input)`

用於中途切換脈絡，但不像 `scene()` 那樣強烈代表一個新段落。

```js
context({
  scene: "empathy",
  label: "庭如 / 共感模式",
  participants: ["ruri"]
})
```

常用於：

- 從一般控制室切到共感操作。
- 從舞台演出切到回憶。
- 同一 scene 內調整人物參與者。

---

### 7.3 `line(input)`

最常用的對白巨集。

#### 旁白

```js
line("第三入境大廳的燈，亮得像不打算讓人安息。")
```

或：

```js
line({ text: "第三入境大廳的燈，亮得像不打算讓人安息。" })
```

#### 角色對白

```js
line({ role: "mercer", text: "準備好了嗎？" })
```

#### 指定表情

```js
line({ role: "ruri", expression: "uneasy", text: "我覺得不太對。" })
```

#### 指定位置

```js
line({ role: "mercer", position: "right", text: "我站這邊。" })
```

#### 只出聲，不顯示人物

```js
line({ speaker: "通訊器", text: "訊號不穩。" })
```

如果用 `speaker` / `name` 而不是 `role`，巨集會預設：

```js
character: "none",
speakerFocus: "voice",
presence: "voiceOnly"
```

這代表它是聲音，不會自動顯示人物立繪。

---

### 7.4 `bg(input)`

切換背景、CG、文件圖。

```js
bg({ id: "control_room" })
```

常用參數：

| 參數 | 說明 |
|---|---|
| `id` | `ASSETS.backgrounds` 裡的素材 key |
| `transition` | `fade` / `flash` 等切換方式 |
| `waitAfter` | 背景切換後等待時間 |
| `displayMode` | 強制顯示模式：`background` / `cg` / `document` / `logo` |
| `documentTitle` | 文件顯示在 side panel 時的標題 |

範例：

```js
bg({ id: "stage_show", transition: "fade", waitAfter: 800 })
```

文件範例：

```js
bg({ id: "doc_jamie_script", documentTitle: "傑米手寫講稿" })
```

如果素材 key 是 `doc_` 開頭，engine 會傾向把它顯示在右側文件縮圖，而不是主背景。這是為了避免文件圖把整個舞台畫面蓋掉。

---

### 7.5 `music(input)` / `sound(input)`

```js
music({ id: "control", volume: 0.45, fade: 900 })
sound({ id: "keyboard", volume: 0.6 })
```

`music()` 產生 `type: "bgm"`，由 `engine/audio.js` 執行。  
`sound()` 產生 `type: "sfx"`，由 `engine/audio.js` 執行。

---

### 7.6 `note(input)`

更新右側 side panel。

```js
note({
  title: "CASE / STATUS",
  text: "來賓入場中。\n主舞台待機。"
})
```

`documentViewer.js` 會根據 title / text 嘗試自動配一張文件縮圖。例如包含「來賓」「座位」可能會顯示座位表，包含「錄音」「波形」可能顯示聲音波形圖。

---

### 7.7 `show(input)` / `hide(input)` / `clearSprites()`

#### 顯示人物

```js
show({ id: "mercer", expression: "serious", position: "left" })
```

常用參數：

| 參數 | 說明 |
|---|---|
| `id` | 角色 id，例如 `mercer`、`ruri`、`jamie` |
| `expression` | 表情 key，例如 `default`、`serious`、`uneasy` |
| `position` | `left` / `center` / `right` |
| `instant` | 是否立即顯示 |
| `dimmed` | 是否灰暗化 |
| `allowedSceneMode` | 限定在哪些 sceneMode 可顯示 |

#### 隱藏人物

```js
hide({ id: "ruri" })
```

#### 清場

```js
clearSprites()
```

---

### 7.8 `effect(input)`

一般特效巨集。

```js
effect({ name: "shake", target: "game" })
effect({ name: "flash", opacity: 0.8, ms: 260 })
effect({ name: "fadeBlack", ms: 900 })
```

常見 `name`：

| name | 效果 |
|---|---|
| `shake` | 畫面震動 |
| `flash` | 白色閃光 |
| `fadeBlack` | 黑場淡入 |
| `empathy` / `empathyUp` | 情緒上升共感 |
| `empathyDown` / `empathyFall` / `empathySink` | 情緒下降共感 |

一般劇情企劃應優先使用更語意化的巨集，例如 `empathyUp()`，而不是手寫完整 `effect({ name: "empathyUp", ... })`。

---

### 7.9 `empathyUp(words)` / `empathyDown(words)`

情緒感知專用巨集。

```js
empathyUp([
  "期待",
  "好奇",
  "社交恐懼",
  "悲傷"
])
```

```js
empathyDown([
  "恐懼",
  "愧疚",
  "被遺忘"
])
```

重要規則：

1. `scene` 只要決定上升或下降，不需要指定背景圖。
2. `scene` 只要提供情緒文字，不需要指定 duration。
3. 不要在 scene 裡寫 `visualBg`、`holdBeforeWordsMs`、`lockInput: false`、`wordMultiplier: 1`。
4. 如果情緒文字故意重複兩次、三次，就保留。這是劇情節奏，不是 engine 該自動整理的東西。

對應設定在 `config.js`：

```js
ENGINE.emotion.empathy.profiles.up.visualBg
ENGINE.emotion.empathy.profiles.down.visualBg
ENGINE.emotion.empathy.durationMs
ENGINE.emotion.empathy.holdBeforeWordsMs
```

---

### 7.10 `pause(input)`

等待一段時間。

```js
pause({ ms: 500 })
```

會產生：

```js
{ type: "wait", ms: 500 }
```

---

### 7.11 `select(input)` / `option(input)`

選項。

```js
select({
  prompt: "要怎麼回應？",
  options: [
    option({ text: "確認流程", next: "check_flow" }),
    option({ text: "直接進場", next: "go_stage" })
  ]
})
```

選項參數：

| 參數 | 說明 |
|---|---|
| `text` | 選項文字 |
| `next` | 選到後跳去的 scene id |
| `set` | 選到後設定 flag |
| `ui` / `focus` | 選到後切換 UI focus |
| `label` | 搭配 UI focus 的顯示文字 |

`choiceUi` 可以控制選項寬度：

```js
select({
  choiceUi: { preset: "medium" },
  options: [ ... ]
})
```

或：

```js
select({
  choiceUi: {
    widthRatio: 0.5,
    maxWidthPx: 680,
    textAlign: "center"
  },
  options: [ ... ]
})
```

不要再寫 `width: "50%"`。寬度是數值語意，不應該用字串硬判斷。

---

### 7.12 `jump(input)`、`route(input)`、`whenFlag()`

#### 直接跳轉

```js
jump("next_scene")
```

或：

```js
jump({ next: "next_scene" })
```

#### 依 flag 分流

```js
route({
  branches: [
    whenFlag("accepted", "accepted_scene"),
    { flag: "score", equals: 2, next: "score_two_scene" },
    { any: ["a", "b"], next: "any_scene" },
    { all: ["a", "b"], next: "all_scene" },
    { not: "failed", next: "not_failed_scene" }
  ],
  default: "fallback_scene"
})
```

`route()` 的真正判斷在 `engine/core.js` 的 `handleRoute()` / `branchMatches()`。

---

## 8. `scenes.js` 編寫原則

`scenes.js` 應該是純劇本內容。

### 應該放在 scenes.js 的東西

```text
對話
旁白
場景切換
人物出現 / 消失
選項
情緒文字內容
必要的特殊演出 cue
```

### 不應該放在 scenes.js 的東西

```text
共感預設 duration
共感預設背景圖
共感文字出現前等待時間
UI 顏色系統規則
角色素材路徑
BGM 檔案路徑
選項預設寬度
情緒文字動畫 keyframe
```

### 好的 scene 寫法

```js
scene({ mode: "control", participants: ["mercer", "ruri"] }),
bg({ id: "control_room" }),
line({ role: "mercer", text: "準備開始。" }),
line({ role: "ruri", expression: "uneasy", text: "我感覺到了。" }),
empathyUp(["期待", "好奇", "悲傷"]),
line({ role: "ruri", text: "那些情緒不是他的全部。" })
```

### 不推薦的 scene 寫法

```js
effect({
  name: "empathyUp",
  direction: "up",
  visualBg: "cg_empathy_warm",
  duration: 6860,
  holdBeforeWordsMs: 750,
  hideUiDuringEffect: true,
  lockInput: false,
  wordMultiplier: 1,
  words: ["期待", "好奇"]
})
```

問題：這把系統規則塞到劇本裡。未來要調整共感節奏時，會變成到處搜尋、到處改。

---

## 9. Engine 模組詳細說明

### 9.1 `engine/core.js`

核心流程模組。負責 state、CONFIG fallback、初始化、執行 command、場景跳轉、flag 判斷。

#### 重要資料：`CONFIG`

`CONFIG` 是 engine 的內部預設值。`config.js` 的 `ENGINE` 會透過 `applyExternalEngineConfig()` 合併進來。

設計理由：

- engine 必須有 fallback，避免 config 缺欄位時整個壞掉。
- 正式調整仍應放 `config.js`，不要直接改 engine 裡的 fallback。

#### 重要資料：`state`

`state` 保存目前遊戲狀態：

| 欄位 | 用途 |
|---|---|
| `script` | 目前劇本資料 |
| `sceneId` | 目前場景 id |
| `index` | 目前場景內第幾個 command |
| `flags` | 選項或 route 使用的旗標 |
| `busy` | 是否正在執行 command |
| `typing` | 是否正在打字機顯示 |
| `awaitingChoice` | 是否正在等待選項 |
| `currentSceneMode` | 目前場景模式 |
| `currentConversation` | 目前對話脈絡 |
| `currentBgId` | 目前背景 key |
| `sprites` | 目前場上的角色立繪 Map |
| `inputLocked` | 是否鎖定操作 |
| `preloadedImages` | 已預載圖片 |

#### `init()`

啟動遊戲。

流程：

```text
合併外部 config
↓
綁定事件
↓
顯示 loading
↓
讀取劇本
↓
設定版號
↓
預載圖片
↓
檢查起始 scene
↓
套用初始 UI
↓
隱藏 loading
↓
執行第一個 command
```

#### `execute(cmd)`

所有 command 的入口。依照 `cmd.type` 分派：

| type | 執行函式 |
|---|---|
| `say` | `showText()` |
| `narrate` | `showText("旁白")` |
| `ui` / `focus` | `applyFocusUi()` |
| `mode` | `setMode()` |
| `context` | 只更新脈絡後前進 |
| `bg` | `setBackground()` |
| `show` | `showSprite()` |
| `hide` | `hideSprite()` |
| `clearSprites` | `clearSprites()` |
| `bgm` | `playBgm()` |
| `sfx` | `playSfx()` |
| `effect` | `runEffect()` |
| `wait` | `wait()` |
| `choice` | `showChoice()` |
| `jump` | `jumpTo()` |
| `route` | `handleRoute()` |
| `if` | `handleIf()` |
| `note` | `setSideNote()` |
| `end` | `endGame()` |

#### 為什麼要有 `busy` 與 `continueAfterBusy`？

很多 command 是 async，例如背景淡入、文字顯示、BGM fade、共感演出。如果玩家點擊或程式自動推進時 command 還沒完成，會造成 index 亂跳。`busy` 用來阻止重入，`continueAfterBusy` 則用來記錄「忙完後要繼續」。

#### `advance()`

玩家點擊或按 Enter / Space 時呼叫。邏輯：

1. 如果 input locked、選項開著、文件 viewer 開著，就不推進。
2. 如果正在打字，先直接補完文字。
3. 如果沒忙，進下一個 command。

#### `jumpTo(sceneId)`

切換場景，重設 index、選項狀態、title choice 狀態，再開始執行新場景。

#### `handleRoute()` / `branchMatches()`

用於選項後分流或條件劇情。支援：

```js
{ flag: "x", equals: true, next: "a" }
{ all: ["a", "b"], next: "scene_all" }
{ any: ["a", "b"], next: "scene_any" }
{ not: "failed", next: "scene_not_failed" }
```

---

### 9.2 `engine/dom.js`

負責 DOM cache、事件綁定、UI theme、sceneMode、conversation context。

#### `dom`

一次抓取所有 DOM 節點，讓其他模組直接使用 `dom.xxx`。

#### `setGameVersion()`

把 `config.js` 的 `META.displayVersion` 寫進 `#gameVersion`。

為什麼不直接寫死在 HTML？

因為版號是產品資訊，應該集中在 `config.js`。HTML 只放節點，engine 負責填值。

#### `bindEvents()`

綁定：

- 點擊遊戲畫面顯示 title choice。
- 點擊對話框推進。
- Enter / Space 推進。
- Escape / Enter / Space 關閉文件 viewer。
- 點擊 side image 開啟文件 viewer。
- 第一次互動時 unlock audio。

#### `applyDirectingContext(cmd)`

每個 command 執行前都會先套用導演脈絡，例如：

- `sceneMode`
- `conversation`
- `choiceUi`
- UI focus

這讓 scene 可以在任意 command 上附加 `sceneMode`，不用另外插一行 mode command。

#### `setSceneMode(sceneMode)`

更新目前場景模式，並觸發 title screen class 更新。

#### `setConversationContext(conversation)`

設定本段對話參與者與站位策略。當 conversation 改變時，會 reset dialogue layout 並清理不屬於本段的自動立繪。

#### `normalizeDisplayMode()`

把不同寫法統一成 engine 使用的 display mode：

```text
背景：background
文件：document / doc / sidePanel
CG：cg / cutscene
Logo：logo
純色：color / solid
```

#### `applyFocusUi()` / `setMode()`

控制 UI theme：灰色、庭如共感、傑米舞台。

---

### 9.3 `engine/dialogue.js`

負責文字顯示、打字機效果、speaker class、文字結束後的後置動作。

#### `showText(speaker, text, className, cmd)`

流程：

1. 呼叫 `autoShowSpeakerSprite()`，必要時自動顯示說話角色。
2. 設定說話者名稱與 CSS class。
3. 清空對話文字。
4. 依照 `CONFIG.textSpeed` 啟動打字機。

#### `finishTyping()`

玩家點擊時，如果文字還沒跑完，直接補完全文。

#### `classifySpeaker(speaker)`

把 speaker 名稱轉成 CSS class，例如：

| speaker | class |
|---|---|
| 庭如 / ruri | `ruri` |
| 傑米 / jamie | `jamie` |
| 老麵 / mercer | `mercer` |
| 系統 / system | `system` |
| 空值 | `narrator` |

#### `queueAfterTextActions()`

目前支援 `leaveAfter`。意思是這句話結束、玩家推進下一句時，把自動顯示的角色移除。

---

### 9.4 `engine/background.js`

負責背景、CG、文件、logo 顯示規則。

#### `setBackground(cmdOrId, transition, postDelayMs)`

可接受字串或 command：

```js
setBackground("control_room")
```

或：

```js
setBackground({ id: "stage_show", transition: "fade", waitAfter: 800 })
```

流程：

1. 清空對話 UI。
2. 依據 id 找素材。
3. 判斷素材 category / displayMode。
4. 如果是 document，交給 side panel，不切主背景。
5. 如果是 background / cg / logo，套用對應 class 與圖片。
6. 等圖片載入。
7. 更新 title logo。
8. 等待 `waitAfter`。

#### 為什麼 `doc_` 不切主背景？

文件圖通常是報告、講稿、名單、錄音波形。如果當主背景，會破壞舞台或場景畫面。現在文件預設放在右側 panel，玩家可點擊放大。

#### `sanitizeBackgroundIdForScene(id)`

保護特定回憶段不要誤切到錯誤 CG。目前有一段避免 `case_memory` 誤用 `cg_wei_silent`，改顯示 `doc_voice_wave` 或 `case_file`。

這是針對劇情演出防呆，不是通用規則。未來如果類似保護變多，應該移到 config 或 directing 規則。

#### `imageCategoryFor(id, src)`

依據 manifest、id 前綴、path 判斷：

```text
doc_ → document
cg_ → cg
logo → ui_or_publish
其他 → background
```

---

### 9.5 `engine/sprite.js`

負責人物立繪：顯示、隱藏、站位、自動出場、對話站位邏輯。

#### `showSprite(cmd)`

顯示角色立繪。

常用參數：

| 參數 | 說明 |
|---|---|
| `id` | 角色 ID |
| `expression` | 表情 |
| `position` | `left` / `center` / `right` |
| `instant` | 是否跳過等待 |
| `dimmed` | 是否灰暗 |
| `allowedSceneMode` | 限制在特定場景模式才顯示 |

#### `normalizeSpritePosition(id, position)`

站位修正：

- `jamie_room` 中，傑米固定左、老麵固定右。
- `stage` / `confession` / `reincarnation` 中，傑米固定中間。
- 舞台段其他人若要求 center，會被改到 left，避免搶走傑米主位。

#### 為什麼要有這種規則？

因為劇本企劃可能只寫「傑米說話」，不一定每次都想手動指定位置。engine 需要根據場景語意給出合理站位，避免人物亂疊。

#### `clearSpriteSlot(position, keepId)`

同一個位置原則上只保留一個角色，避免立繪互相覆蓋。但舞台中間的傑米有保護規則。

#### `sanitizeCharacterExpression(id, expression)`

防止傑米在非舞台背景拿到 `show` / `reincarnation` 這類舞台表情。若不合場景，會改成 `nervous`。

#### `autoShowSpeakerSprite(speaker, text, cmd)`

當 `showText()` 顯示角色對白時，自動決定要不要顯示該角色。

不會自動顯示的情況：

- 沒有對應角色。
- `character: "none"`。
- `speakerFocus: "voice"`。
- `presence: "voiceOnly"` / `offscreen`。
- 共感全螢幕正在顯示。

#### `chooseDialogueSpritePosition(id, cmd)`

自動站位核心。處理 primary / secondary speaker、第一次換主講者、左右角色、舞台中央保留等規則。

這段設計的目的，是讓企劃可以寫乾淨的對白，而不是每一句都指定 left/right。

---

### 9.6 `engine/audio.js`

負責 BGM、環境音、音效。

#### `unlockAudio()`

瀏覽器通常禁止自動播放音訊。第一次 click / keydown / touchstart 時，engine 會嘗試 unlock audio。

#### `playBgm(id, volume, loop, fade)`

播放 BGM，支援 crossfade。

```js
music({ id: "control", volume: 0.45, fade: 900 })
```

`bgmToken` 用來防止連續切 BGM 時舊 fade callback 把新音樂停掉。

#### `playSfx(id, volume)`

播放音效，每次建立一個新的 Audio 實例，播完後從 `sfxPool` 移除。

---

### 9.7 `engine/effects.js`

一般特效分派。

#### `runEffect(cmd)`

根據 `cmd.name` 執行：

| name | 函式 |
|---|---|
| `shake` | `shake()` |
| `flash` | `flash()` |
| `empathy` / `empathyUp` | `runEmpathyEffect()` |
| `empathyDown` / `empathyFall` / `empathySink` | `runEmpathyEffect(..., "down")` |
| `fadeBlack` | `fadeBlack()` |

#### `shake(target)`

對 `game` 或 `bg` 加上 `.shake` class，450ms 後移除。

#### `flash(opacity, ms)`

白色閃光。先瞬間設為白色，再用 transition 淡出。

#### `fadeBlack(ms, cmd)`

黑場。若 `cmd.finalLogo` 為 true，會走結尾 logo 專用黑場；否則直接讓 effectLayer 背景變黑。

---

### 9.8 `engine/empathy.js`

情緒感知專用模組。這是目前專案最有特色、也最需要保持乾淨的系統。

#### `runEmpathyEffect(cmdOrWords, fallbackDirection)`

共感主流程：

```text
整理 runtime options
↓
必要時鎖 input
↓
進入全螢幕共感模式
↓
顯示共感背景
↓
等待 holdBeforeWordsMs
↓
顯示情緒文字
↓
退場共感背景
↓
離開全螢幕共感模式
↓
解除 input lock
```

#### `resolveEmpathyRuntimeOptions(cmd, fallbackDirection)`

把 scene command 與 config 合併成 runtime 設定。

優先順序：

```text
cmd 個別指定
>
config.js 的 ENGINE.emotion.empathy
>
engine fallback
```

雖然保留 cmd override，但正式寫 scene 時應優先使用 `empathyUp(words)` / `empathyDown(words)`，不要在 scene 裡覆蓋 duration、背景、延遲等。

#### `directionFromEmpathyName(name)`

把 `empathyUp`、`empathyDown`、`empathyFall`、`empathySink` 轉成方向。

#### `enterEmpathyFullscreen(options)`

把 `#game` 加上：

```css
empathy-fullscreen-active
empathy-hide-ui
```

並清除殘留 emotion words、cutin visible、effectLayer 黑場背景。

為什麼要清 inline background？

因為 `fadeBlack()` 可能留下 inline style，CSS selector 無法覆蓋 inline style。如果不清掉，共感背景會被黑場蓋住。

#### `showEmpathyBackdrop(assetId, options)`

顯示共感背景。使用 Web Animations API 執行透明度、模糊、縮放動畫。

為什麼不用純 CSS transition？

因為圖片快取時，瀏覽器可能把「初始狀態」和「visible 狀態」合併成同一幀，造成 fade in 瞬間完成。這裡用 `offsetWidth`、雙 `requestAnimationFrame`、Web Animations API 強制先提交第一幀。

#### `hideCutinImage(options)`

共感背景退場，從清晰不透明變成透明模糊。

#### `expandEmotionWords(words, multiplier)`

如果 `wordMultiplier > 1`，自動複製 words。  
目前 `config.js` 是 1，且劇情企劃故意手動重複的詞不會被整理或去重。

#### `estimateEmotionDuration(words)`

如果沒有指定 duration，依照文字數量估算時間。目前正式設定放在 `config.js`，所以通常不會用到估算。

#### `empathyWords(words, direction, totalDurationMs)`

建立每個情緒文字 DOM，依照方向與 layout 分散在畫面上，再呼叫 `runEmotionWordAnimation()`。

#### `buildEmotionKeyframes(profile)`

根據 `CONFIG.emotion.motionProfiles` 建立 Web Animations keyframes。這是把原本 CSS 裡沒有語意的 `18% / 62% / 78%` 改成 `fadeInAt / holdUntil` 的原因。

---

### 9.9 `engine/choice.js`

選項 UI 與選項分支。

#### `showChoice(cmd)`

顯示選項。

特殊規則：如果目前是 title scene，只顯示包含「開始遊戲」文字的選項，並且第一次點畫面才顯示開始按鈕。

#### `applyChoiceUi(choiceUi)`

套用選項寬度與文字對齊。

現在使用：

```js
widthRatio: 0.5
```

而不是：

```js
width: "50%"
```

設計理由：寬度是數值，不應該用字串硬判斷，更不應該和透明度概念混在一起。

#### `resolveChoiceLayout(ui)`

合併 preset 與個別設定。

支援 preset：

```text
default
title
compact
medium
wide
```

---

### 9.10 `engine/preload.js`

圖片預載與 loading 畫面。

#### `showLoadingScreen()` / `hideLoadingScreen()`

顯示與隱藏 loading layer。

#### `updateLoadingProgress()`

更新：

- 進度條
- 百分比
- 成功數
- 失敗數
- 目前讀取素材
- 失敗清單

#### `preloadAllImagesWithProgress()`

預載所有圖片，支援 concurrency。

流程：

1. `collectImageAssets()` 收集圖片。
2. 建立 worker pool。
3. 每個 worker 呼叫 `preloadImageAsset()`。
4. 更新 loading UI。
5. 回傳 `{ total, ok, failed, failures }`。

#### `collectImageAssets()`

從以下來源收集圖片：

- `ASSETS.backgrounds`
- `ASSETS.characters`
- `ASSETS.imageManifest`
- `scenes.js` 裡直接出現的圖片路徑

#### 為什麼要預載？

VN 最怕切背景或人物時閃一下、空白一下。預載能讓正式遊玩時的切換更穩定，也能在 loading 畫面提前知道哪些素材缺漏。

---

### 9.11 `engine/documentViewer.js`

文件縮圖與放大檢視。

#### `resolveNoteImage(title, text)`

根據 note 的 title / text 自動判斷要顯示哪張文件縮圖。

例如：

| 關鍵字 | 對應圖 |
|---|---|
| `RUN-DOWN` / `流程` | `doc_rundown` |
| `GUEST LIST` / `來賓名單` | `doc_guest_list` |
| `VOICE` / `錄音` / `波形` | `doc_voice_wave` |
| `NEWS` / `新聞` | `doc_media_news` |
| `CASE REPORT` / `案件封存` | `doc_case_report` |

這是便利規則，不是必須。未來若要更嚴謹，可改成 note 直接指定 `image`。

#### `setSideImage(assetId, options)`

把文件縮圖放到 side panel。只有 category 是 `document` 的素材會顯示為文件縮圖。

#### `showDocumentInSidePanel(assetId, cmd)`

當 `bg({ id: "doc_xxx" })` 時，background module 會呼叫這個函式，把文件顯示在 side panel，而不是主背景。

#### `openSideDocument()` / `showDocumentViewer()` / `hideDocumentViewer()`

點擊 side panel 縮圖後，開啟全畫面文件 viewer。Escape、Enter、Space 或點擊背景可關閉。

#### 為什麼 `init()` 放在這個檔案最後？

因為目前是 classic script，沒有 import/export。必須等所有 engine 函式都載入後才啟動。`documentViewer.js` 是最後載入的 engine 模組，所以把 `init()` 放在這裡最簡單。

未來如果改成 ES module，應該建立 `engine/main.js` 或 `bootstrap.js` 來專門啟動遊戲。

---

## 10. `script.js`

目前 `script.js` 只保留舊版相容說明，不再承載劇本。

目的：

- 避免舊部署或舊說明找不到檔案。
- 提醒目前專案已改成 `config.js + macros.js + scenes.js`。

一般不用改。

---

## 11. 常見需求要改哪裡？

| 需求 | 修改位置 |
|---|---|
| 改遊戲版號 | `config.js` 的 `META.displayVersion` |
| 新增背景圖 | `config.js` 的 `ASSETS.backgrounds` |
| 新增角色表情 | `config.js` 的 `ASSETS.characters` |
| 改對話文字 | `scenes.js` |
| 改某段換行 | `scenes.js` |
| 改共感背景 fade 時間 | `config.js` 的 `ENGINE.emotion.backdrop.fadeInMs / fadeOutMs` |
| 改共感文字整體時間 | `config.js` 的 `ENGINE.emotion.empathy.durationMs` |
| 改共感文字動畫曲線 | `engine/core.js` 的 `CONFIG.emotion.motionProfiles`，未來建議移到 `config.js` |
| 改選項預設寬度 | `engine/core.js` 的 `CONFIG.choiceLayout`，未來建議移到 `config.js` |
| 改人物站位規則 | `engine/sprite.js` |
| 改文件縮圖自動判斷 | `engine/documentViewer.js` 的 `resolveNoteImage()` |
| 改 UI 顏色 | `style.css` |
| 改 title screen 版號位置 | `style.css` 的 `#gameVersion` |
| 新增巨集 | `macros.js`，再由 engine 支援對應 command |
| 新增 command type | `engine/core.js` 的 `execute()`，並可能新增 engine module |

---

## 12. 協作者分工建議

### 劇情企劃

主要改：

```text
scenes.js
```

可使用：

```js
scene()
context()
line()
bg()
note()
show()
hide()
empathyUp()
empathyDown()
select()
option()
pause()
jump()
```

不要改：

```text
engine/
style.css
config.js 的 engine 設定
```

除非已經和工程負責人確認。

### 美術 / 素材管理

主要改：

```text
resource/image/
resource/bgm/
resource/sound_effect/
config.js 的 ASSETS
```

### 工程 / 引擎維護者

主要改：

```text
engine/
style.css
macros.js
config.js 的 ENGINE
```

---

## 13. 設計原則總結

### 13.1 Scene 不要知道太多

錯誤方向：

```js
effect({
  name: "empathyUp",
  direction: "up",
  visualBg: "cg_empathy_warm",
  durationMs: 6860,
  holdBeforeWordsMs: 350,
  lockInput: false,
  hideUiDuringEffect: true,
  words: [...]
})
```

正確方向：

```js
empathyUp([...])
```

原因：scene 是劇情，不是引擎設定表。

### 13.2 文字內容不要被 engine 自作聰明改掉

如果劇情企劃故意放兩倍、三倍情緒詞，engine 不應該自動去重、不應該排序、不應該重寫。文字是內容資產，不能被工具亂動。

### 13.3 命名要有語意

避免：

```js
width: "78%"
```

卻拿去控制透明度。這會造成維護者誤判。

應該改成：

```js
widthRatio: 0.78
opacity: 0.92
```

寬度就是寬度，透明度就是透明度。

### 13.4 Config 管規則，Scene 管事件

- `config.js`：這個系統一般怎麼運作。
- `scenes.js`：這一刻發生什麼事。
- `engine/`：怎麼把它演出來。

### 13.5 Engine 模組要按責任拆

不要讓一支 `engine.js` 同時管所有東西。現在拆成 `core / dom / dialogue / background / sprite / audio / effects / empathy / choice / preload / documentViewer`，就是為了未來可維護。

---

## 14. 未來可改善項目

### 14.1 把更多 engine fallback 設定移到 config.js

目前 `motionProfiles`、`choiceLayout` 仍在 `engine/core.js` 的 `CONFIG` fallback 裡。未來若常常需要調整，建議移到 `config.js`。

### 14.2 建立章節資料夾

未來新章節可改成：

```text
chapters/
├─ ch01_before_fades/
│  ├─ scenes.js
│  ├─ assets.js
│  └─ notes.md
├─ ch02_xxx/
│  ├─ scenes.js
│  ├─ assets.js
│  └─ notes.md
```

### 14.3 建立 debug overlay

建議顯示：

```text
version
sceneId
index
sceneMode
currentBgId
currentBgmId
sprites
flags
```

這對測試很有幫助。

### 14.4 建立素材檢查報表

目前 loading 會顯示圖片失敗，但可以進一步輸出：

- 未使用素材。
- scenes.js 有引用但 ASSETS 沒定義的素材。
- ASSETS 有定義但檔案不存在的素材。

### 14.5 改成 ES module 或 build pipeline

等專案再長大，可以考慮：

```text
src/
dist/
npm scripts
Vite
ES module import/export
```

但現在階段不用急，因為目前的目標是保持靜態部署簡單。

---

## 15. 最小 scene 範例

```js
const {
  scene,
  line,
  bg,
  music,
  sound,
  note,
  empathyUp,
  select,
  option,
  jump,
  endGame
} = window.BF_MACROS;

window.BEFORE_FADES_SCRIPT = {
  meta: window.BF_CONFIG.META,
  assets: window.BF_CONFIG.ASSETS,
  scenes: {
    start: [
      scene({ mode: "title", label: "Before Fades" }),
      bg({ id: "title" }),
      music({ id: "title" }),
      select({
        options: [
          option({ text: "開始遊戲", next: "opening" })
        ]
      })
    ],

    opening: [
      scene({ mode: "control", participants: ["mercer", "ruri"] }),
      bg({ id: "control_room" }),
      note({ title: "SYSTEM", text: "演出準備中。" }),
      line({ role: "mercer", text: "準備好了嗎？" }),
      line({ role: "ruri", expression: "uneasy", text: "我感覺到了。" }),
      empathyUp(["期待", "好奇", "不安"]),
      line({ role: "ruri", text: "那些情緒，正在靠近。" }),
      endGame()
    ]
  }
};
```

---

## 16. 最後提醒

這個專案目前最重要的維護原則：

```text
不要讓 scenes.js 變回垃圾場。
```

只要你發現某個參數在每一段都重複出現，例如：

```text
duration
holdBeforeWordsMs
visualBg
lockInput:false
hideUiDuringEffect:true
wordMultiplier:1
```

那它大概率不屬於劇本，而應該移到 config 或 engine 的某個 profile 裡。

相反地，如果某個東西是內容本身，例如：

```text
對白
換行
情緒詞數量
角色此刻要不要沉默
某一幕是否停頓
```

那就應該留在 scenes.js，不要讓 engine 自作聰明。

