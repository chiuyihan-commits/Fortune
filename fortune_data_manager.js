// ==========================================
// ★ 全域變數初始化 (放在 JS 最上方)
// ==========================================
window.currentDeityTool = 'simple'; // 預設來源
window.miniDrawContext = {
    tool: 'simple',
    targetSaints: 3,
    currentSaints: 0,
    lotNum: 0
};

window.AppCache = {
    cupSaint: localStorage.getItem('custom_cup_saint'),
    cupLaugh: localStorage.getItem('custom_cup_laugh'),
    cupCovered: localStorage.getItem('custom_cup_covered')
};

// ==========================================
// 集中管理 App 所有變數與資料庫載入，取代散落的全域變數
// ==========================================
// 1. 安全載入 localStorage 的共用工具
function safeLoadStorage(key, defaultValue) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.warn(`⚠️ 讀取本地資料 [${key}] 異常，已套用預設值。`, error);
        return defaultValue;
    }
}

// 載入系統設定
let initialSettings = { drawMode: 'touch', animSeconds: 2, defaultSystem: '' };
try {
    let savedSettings = localStorage.getItem('zb_settings');
    if (savedSettings) initialSettings = Object.assign(initialSettings, JSON.parse(savedSettings));
} catch (e) { }

// 2. 宣告完美的 AppState 樹狀結構
window.AppState = {
    // 核心資料庫 (Database & Settings)
    data: {
        settings: initialSettings,
        records: safeLoadStorage('zb_records_v3', []),
        customPoems: safeLoadStorage('zb_custom_poems', {}),
        poemSystems: window.poemSystems || {},
        deities: []
    },
    // UI 與頁面狀態
    ui: {
        currentMode: 'normal',
        currentDeity: null,
        currentSystem: null,
        currentLot: 0,
        currentCollectionTitle: "",
        isQiuqianActive: false,
        scrollMemory: {}
    },
    // 物理與動畫狀態
    draw: {
        isDrawing: false,
        isShaking: false,
        shakeStartTime: 0,
        isListeningShake: false, // 修正：從 ui 搬過來
        saintCount: 0,
        isMiniShaking: false     // 新增：迷你籤筒的搖晃狀態
    },
    // 問事功能
    simple: {
        isActive: false,
        history: [],
        tempCups: []
    },
    // 比較功能
    compare: {
        isActive: false,
        isManualMode: false,   // 新增：手動比較模式判斷
        state: { options: [], results: [], targetThrows: 3, currentOptIndex: 0, currentThrowCount: 0, tableTempData: [] }
    },
    // 追問系統 (統合所有追問)
    followUp: {
        currentRecordId: null,
        mode: 'ask',
        tempCups: [null],
        tempResults: [],
        targetCount: 1,
        compHistory: [],
        compTempCups: [],
        compMode: 'ask',
        tempFollowUpRes: null    // 新增
    },
    // 編輯器與工具視窗
    editor: {
        imgData: null,
        poemImg: null,
        globalBgImg: null,
        deityBgImg: null,
        deityQt: { static: null, active: null },
        isDeityEditMode: false,
        currentDeityTool: '',
        currentMiniDrawTarget: 'simple-lot-num' // 新增：紀錄迷你籤筒要把號碼填去哪
    }
};

// ==========================================
// 3. ★ 隱形魔法橋樑 (Proxy Bridge)
// ==========================================
function bridgeVariable(oldVarName, getFn, setFn) {
    Object.defineProperty(window, oldVarName, {
        get: () => {
            // console.warn(`[過渡期提醒] 正在讀取舊變數: ${oldVarName}，請改用 AppState 物件`);
            return getFn();
        },
        set: (val) => {
            // console.warn(`[過渡期提醒] 正在修改舊變數: ${oldVarName}，請改用 AppState 物件`);
            setFn(val);
        },
        configurable: true,
        enumerable: true
    });
}

// -- Data --
bridgeVariable('settings', () => AppState.data.settings, val => AppState.data.settings = val);
bridgeVariable('records', () => AppState.data.records, val => AppState.data.records = val);
bridgeVariable('customPoems', () => AppState.data.customPoems, val => AppState.data.customPoems = val);
bridgeVariable('poemSystems', () => AppState.data.poemSystems, val => AppState.data.poemSystems = val);
bridgeVariable('deities', () => AppState.data.deities, val => AppState.data.deities = val);

// -- UI --
bridgeVariable('currentMode', () => AppState.ui.currentMode, val => AppState.ui.currentMode = val);
bridgeVariable('currentDeity', () => AppState.ui.currentDeity, val => AppState.ui.currentDeity = val);
bridgeVariable('currentSystem', () => AppState.ui.currentSystem, val => AppState.ui.currentSystem = val);
bridgeVariable('currentLot', () => AppState.ui.currentLot, val => AppState.ui.currentLot = val);
bridgeVariable('currentCollectionTitle', () => AppState.ui.currentCollectionTitle, val => AppState.ui.currentCollectionTitle = val);
bridgeVariable('isQiuqianActive', () => AppState.ui.isQiuqianActive, val => AppState.ui.isQiuqianActive = val);

// -- Draw --
bridgeVariable('isDrawing', () => AppState.draw.isDrawing, val => AppState.draw.isDrawing = val);
bridgeVariable('isShaking', () => AppState.draw.isShaking, val => AppState.draw.isShaking = val);
bridgeVariable('shakeStartTime', () => AppState.draw.shakeStartTime, val => AppState.draw.shakeStartTime = val);
bridgeVariable('isListeningShake', () => AppState.draw.isListeningShake, val => AppState.draw.isListeningShake = val);
bridgeVariable('saintCount', () => AppState.draw.saintCount, val => AppState.draw.saintCount = val);
bridgeVariable('isMiniShaking', () => AppState.draw.isMiniShaking, val => AppState.draw.isMiniShaking = val);

// -- Simple --
bridgeVariable('isSimpleActive', () => AppState.simple.isActive, val => AppState.simple.isActive = val);
bridgeVariable('simpleSessionHistory', () => AppState.simple.history, val => AppState.simple.history = val);
bridgeVariable('simpleTempCups', () => AppState.simple.tempCups, val => AppState.simple.tempCups = val);

// -- Compare --
bridgeVariable('isCompareActive', () => AppState.compare.isActive, val => AppState.compare.isActive = val);
bridgeVariable('isManualCompareMode', () => AppState.compare.isManualMode, val => AppState.compare.isManualMode = val);
bridgeVariable('compareState', () => AppState.compare.state, val => AppState.compare.state = val);

// -- FollowUp --
bridgeVariable('currentDetailRecordId', () => AppState.followUp.currentRecordId, val => AppState.followUp.currentRecordId = val);
bridgeVariable('currentDetailFuMode', () => AppState.followUp.mode, val => AppState.followUp.mode = val);
bridgeVariable('detailFuTempCups', () => AppState.followUp.tempCups, val => AppState.followUp.tempCups = val);
bridgeVariable('fuTempResults', () => AppState.followUp.tempResults, val => AppState.followUp.tempResults = val);
bridgeVariable('fuTargetCount', () => AppState.followUp.targetCount, val => AppState.followUp.targetCount = val);
bridgeVariable('compFuHistory', () => AppState.followUp.compHistory, val => AppState.followUp.compHistory = val);
bridgeVariable('compFuTempCups', () => AppState.followUp.compTempCups, val => AppState.followUp.compTempCups = val);
bridgeVariable('currentCompFuMode', () => AppState.followUp.compMode, val => AppState.followUp.compMode = val);
bridgeVariable('tempFollowUpRes', () => AppState.followUp.tempFollowUpRes, val => AppState.followUp.tempFollowUpRes = val);

// -- Editor & Tools --
bridgeVariable('tempImgData', () => AppState.editor.imgData, val => AppState.editor.imgData = val);
bridgeVariable('tempPoemImg', () => AppState.editor.poemImg, val => AppState.editor.poemImg = val);
bridgeVariable('tempGlobalBgImg', () => AppState.editor.globalBgImg, val => AppState.editor.globalBgImg = val);
bridgeVariable('tempDeityBgImg', () => AppState.editor.deityBgImg, val => AppState.editor.deityBgImg = val);
bridgeVariable('tempDeityQt', () => AppState.editor.deityQt, val => AppState.editor.deityQt = val);
bridgeVariable('isDeityEditMode', () => AppState.editor.isDeityEditMode, val => AppState.editor.isDeityEditMode = val);
bridgeVariable('currentDeityTool', () => AppState.editor.currentDeityTool, val => AppState.editor.currentDeityTool = val);
bridgeVariable('currentMiniDrawTarget', () => AppState.editor.currentMiniDrawTarget, val => AppState.editor.currentMiniDrawTarget = val);

function saveSettings() {
    // 讀取一般設定
    const chkSkip = document.getElementById('chk-skip');
    if (chkSkip) settings.skip = chkSkip.checked;

    // 儲存抽籤模式
    if (window.tempDrawMode) settings.drawMode = window.tempDrawMode;

    // 儲存秒數
    const inputSec = document.getElementById('input-anim-seconds');
    if (inputSec) {
        let sec = parseFloat(inputSec.value);
        if (sec < 1) sec = 1; if (sec > 5) sec = 5;
        settings.animDuration = sec;
    }

    // 儲存全域聖杯數
    const inputSaint = document.getElementById('input-global-saint-target');
    if (inputSaint) {
        let st = parseInt(inputSaint.value);
        if (st > 0) settings.saintTarget = st;
        else delete settings.saintTarget;
    }

    const selSys = document.getElementById('sel-default-system');
    if (selSys) settings.defaultSystem = selSys.value;

    // ★ 新增：儲存擲筊動畫設定
    const cupMode = document.getElementById('cup-trigger-mode');
    if (cupMode) settings.cupTriggerMode = cupMode.value;
    const cupAnimEn = document.getElementById('cup-anim-enabled');
    if (cupAnimEn) settings.cupAnimEnabled = cupAnimEn.checked;
    const cupTReady = document.getElementById('cup-time-ready');
    if (cupTReady) settings.cupTimeReady = parseFloat(cupTReady.value);
    const cupTThrow = document.getElementById('cup-time-throw');
    if (cupTThrow) settings.cupTimeThrow = parseFloat(cupTThrow.value);
    const resType = document.querySelector('input[name="cup-result-type"]:checked');
    if (resType) settings.cupResultType = resType.value;
    const cupTSec = document.getElementById('cup-time-result-sec');
    if (cupTSec) settings.cupTimeResultSec = parseFloat(cupTSec.value);

    // 儲存擲筊結果呈現方式
    const cupDispMode = document.querySelector('input[name="cup-display-mode"]:checked');
    if (cupDispMode) settings.cupDisplayMode = cupDispMode.value;

    // 寫入瀏覽器記憶體
    localStorage.setItem('zb_settings', JSON.stringify(settings));
}

/* --- v40.0 圖像壓縮與設定邏輯 --- */
// 1. 極致壓縮函式 (WebP + Resize)
function compressImage(file, maxWidth, quality, callback) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (event) {
        const img = new Image();
        img.src = event.target.result;
        img.onload = function () {
            let width = img.width;
            let height = img.height;
            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);

            // 輸出 WebP
            const dataUrl = canvas.toDataURL('image/webp', quality);
            callback(dataUrl);
        };
    };
}

// 2. 處理筊杯上傳
function handleCupUpload(e, key) {
    const file = e.target.files[0];
    if (!file) return;
    // 筊杯很小，壓到 100px, 0.6 品質
    compressImage(file, 100, 0.6, (res) => {
        try { localStorage.setItem('custom_' + key, res); initCupIcons(); }
        catch (err) { showToast("空間不足"); }
    });
}

// 3. 處理籤筒上傳 (含 GIF 判斷)
function handleQiantongUpload(e, type) {
    const file = e.target.files[0];
    if (!file) return;
    const key = (type === 'static') ? 'custom_qiantong_static' : 'custom_qiantong_active';

    // GIF 不壓縮，但檢查大小
    if (file.type === 'image/gif') {
        if (file.size > 512000) return showToast("GIF 請小於 500KB");
        const reader = new FileReader();
        reader.onload = function (ev) {
            try { localStorage.setItem(key, ev.target.result); initCupIcons(); }
            catch (err) { showToast("空間不足"); }
        };
        reader.readAsDataURL(file);
    } else {
        // 靜態圖壓到 250px
        compressImage(file, 250, 0.6, (res) => {
            try { localStorage.setItem(key, res); initCupIcons(); }
            catch (err) { showToast("空間不足"); }
        });
    }
}

// 1. 智慧匯出功能 (支援自訂檔名)
function exportAllData() {
    const backupData = {};
    let count = 0;

    // 遍歷 localStorage 所有的 Key
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        // 檢查這個 Key 是否在我們的備份範圍內
        // (只要開頭符合 BACKUP_SCOPE 裡的任何一個字串，就備份)
        const isTarget = BACKUP_SCOPE.some(prefix => key.startsWith(prefix));

        if (isTarget) {
            backupData[key] = localStorage.getItem(key);
            count++;
        }
    }

    // 加入版本資訊 (方便未來除錯或遷移)
    backupData['meta_info'] = {
        date: new Date().toLocaleString(),
        version: 'v40.1',
        itemCount: count
    };

    // --- 處理檔名 ---
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const defaultName = `求籤系統備份_${yyyy}${mm}${dd}`;

    let fileName = prompt("請輸入備份檔名：", defaultName);
    if (fileName === null) return; // 取消
    if (fileName.trim() === "") fileName = defaultName;
    if (!fileName.endsWith(".json")) fileName += ".json";

    // --- 下載檔案 ---
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 2. 智慧匯入功能 (完整還原)
function importAllData(event) {
    const file = event.target.files[0];
    if (!file) return;

    // 重置 input，確保下次選同一個檔案也能觸發 onchange
    event.target.value = '';

    if (!confirm("⚠️ 警告：\n匯入將會「覆蓋」目前所有的神明、圖片與紀錄。\n\n建議您先匯出目前的資料作為備份。\n確定要還原嗎？")) {
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result);

            // 簡單驗證：檢查是否為我們的備份檔
            // (通常會有 meta_info 或者 zb_deities)
            if (!data['meta_info'] && !data['zb_deities']) {
                showToast("匯入失敗：這似乎不是本系統的備份檔。");
                return;
            }

            let importCount = 0;

            // 開始還原
            // 策略：直接把備份檔裡的 key 全部寫回 localStorage
            Object.keys(data).forEach(key => {
                // 跳過 meta_info
                if (key === 'meta_info') return;

                // 寫入 localStorage
                localStorage.setItem(key, data[key]);
                importCount++;
            });

            showToast(`成功還原 ${importCount} 筆資料！\n頁面將重新整理以套用設定。`, 3000);

            // 強制重整，確保神明列表、圖片、設定都能立即生效
            location.reload();

        } catch (err) {
            console.error(err);
            showToast("匯入失敗：檔案格式錯誤或損毀。");
        }
    };
    reader.readAsText(file);
}

/* --- v40.1 智慧備份與還原系統 --- */

// 定義備份範圍：包含以下「完整名稱」或「前綴」的資料都會被備份
const BACKUP_SCOPE = [
    'zb_',              // 包含 zb_settings, zb_deities, zb_records_v3, zb_custom_systems
    'custom_cup_',      // 包含 custom_cup_saint, custom_cup_laugh, custom_cup_covered
    'custom_qiantong_'  // 包含 custom_qiantong_static, custom_qiantong_active, custom_qiantong_img
];


// ==========================================
// ★ 低代碼平台引擎：一鍵匯出神明專屬 .JS 外掛包
// ==========================================
window.exportDeityToJS = function (deityId) {
    // 1. 抓取神明與系統資料
    const deity = window.deities.find(d => d.id === deityId);
    if (!deity) return showToast("⚠️ 找不到神明資料！");

    const sys = window.poemSystems[deity.sysId];
    if (!sys) return showToast("找不到該神明綁定的籤詩系統！");

    let jsContent = `// ==========================================\n`;
    jsContent += `// ★ 自動生成外掛包：${deity.name} (${sys.name})\n`;
    jsContent += `// ★ 由「擲筊助手」平台自動編譯匯出\n`;
    jsContent += `// ==========================================\n\n`;
    jsContent += `window.poemSystems = window.poemSystems || {};\n`;
    jsContent += `window.customPoemTemplates = window.customPoemTemplates || {};\n`;
    jsContent += `window.extraDeities = window.extraDeities || [];\n\n`;

    // 2. 封裝籤詩系統與資料
    jsContent += `// 1. 註冊專屬籤詩系統\n`;
    // 將系統物件轉成字串，並漂亮地縮排
    let sysDataStr = JSON.stringify(sys.content, null, 4);
    jsContent += `const generatedContent = ${sysDataStr};\n\n`;

    jsContent += `window.poemSystems['${sys.id}'] = {\n`;
    jsContent += `    id: '${sys.id}',\n`;
    jsContent += `    name: '${sys.name}',\n`;
    jsContent += `    total: ${sys.total},\n`;
    jsContent += `    format: '${sys.format}',\n`;
    jsContent += `    category: '${sys.category || 'custom'}',\n`;
    jsContent += `    isBase: false,\n`;
    jsContent += `    content: generatedContent\n`;
    jsContent += `};\n\n`;

    // 3. 如果是玩家自訂版型 (custom)，把 HTML/CSS 也包進去
    if (sys.format === 'custom' && sys.customTemplate) {
        jsContent += `// 2. 註冊自訂版型引擎\n`;
        // 處理反引號的跳脫字元，避免生成的程式碼報錯
        let safeTemplate = sys.customTemplate.replace(/`/g, '\\`').replace(/\$/g, '\\$');

        jsContent += `window.customPoemTemplates['custom'] = window.customPoemTemplates['custom'] || {};\n`;
        // 這裡用一個簡單的替換引擎來支援匯出的版型
        jsContent += `window.customPoemTemplates['${sys.id}_format'] = function(poem, cleanLotNum, templeName, customData) {\n`;
        jsContent += `    if(!poem) return '<div style="padding:20px;text-align:center;">資料建置中...</div>';\n`;
        jsContent += `    let tpl = \`${safeTemplate}\`;\n`;
        jsContent += `    let pLines = [poem.l1||'', poem.l2||'', poem.l3||'', poem.l4||''];\n`;
        jsContent += `    if (poem.poem) { let p = poem.poem.replace(/。/g, '').split(/[，,]/); pLines = [p[0]||'', p[1]||'', p[2]||'', p[3]||'']; }\n`;
        jsContent += `    tpl = tpl.replace(/\\{\\{templeName\\}\\}/g, templeName || '${deity.temple}');\n`;
        jsContent += `    tpl = tpl.replace(/\\{\\{lotNum\\}\\}/g, typeof window.getCn==='function'?window.getCn(cleanLotNum):cleanLotNum);\n`;
        jsContent += `    tpl = tpl.replace(/\\{\\{level\\}\\}/g, poem.level || '');\n`;
        jsContent += `    tpl = tpl.replace(/\\{\\{l1\\}\\}/g, pLines[0] || '');\n`;
        jsContent += `    tpl = tpl.replace(/\\{\\{l2\\}\\}/g, pLines[1] || '');\n`;
        jsContent += `    tpl = tpl.replace(/\\{\\{l3\\}\\}/g, pLines[2] || '');\n`;
        jsContent += `    tpl = tpl.replace(/\\{\\{l4\\}\\}/g, pLines[3] || '');\n`;
        jsContent += `    let interpText = poem.interpretation || poem.meaning || '';\n`;
        jsContent += `    if (poem.intents && Array.isArray(poem.intents)) interpText += '<br>' + poem.intents.map(i => '['+i.type+'] '+i.text).join('<br>');\n`;
        jsContent += `    tpl = tpl.replace(/\\{\\{interpretation\\}\\}/g, interpText);\n`;
        jsContent += `    return tpl;\n`;
        jsContent += `};\n`;

        // 將神明的 format 指向這個新生成的專屬 format
        jsContent = jsContent.replace(`format: 'custom'`, `format: '${sys.id}_format'`);
    }

    // 4. 封裝神明設定
    jsContent += `\n// 3. 註冊神明\n`;
    jsContent += `window.extraDeities.push({\n`;
    jsContent += `    id: '${deity.id}', \n`;
    jsContent += `    name: '${deity.name}', \n`;
    jsContent += `    iconType: '${deity.iconType}', \n`;
    jsContent += `    iconVal: '${deity.iconVal}', \n`;
    jsContent += `    temple: '${deity.temple}', \n`;
    jsContent += `    committee: '${deity.committee || ''}', \n`;
    jsContent += `    address: \`${deity.address || ''}\`, \n`;
    jsContent += `    rightText: '${deity.rightText || ''}', \n`;
    jsContent += `    leftText: '${deity.leftText || ''}', \n`;
    jsContent += `    circleText: ${deity.circleText ? 'true' : 'false'}, \n`;
    jsContent += `    sysId: '${sys.id}'\n`;
    jsContent += `});\n`;

    // 5. 觸發瀏覽器下載
    const blob = new Blob([jsContent], { type: 'text/javascript;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `div_${deity.id}.js`); // 自動命名為 div_神明ID.js
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (typeof showToast === 'function') showToast(`成功匯出外掛：div_${deity.id}.js`);
};




/* ==========================================
       ★ 大批匯入 CSV 引擎系統
       ========================================== */

// 1. 產生並下載 CSV 範例檔 (內建範例引擎)
function downloadCsvTemplate() {
    // 加入 BOM 碼 (\uFEFF)，這是魔法！它能確保用微軟 Excel 打開時「絕對不會變成亂碼」
    const bom = "\uFEFF";

    // 建立表頭 (欄位名稱)
    let csv = "籤號(數字),吉凶提示(選填),詩句一,詩句二,詩句三,詩句四,解曰類型1,解曰內容1,解曰類型2,解曰內容2,解曰類型3,解曰內容3\n";
    // 範例 1：傳統宮廟格式 (多個小類型)
    csv += "1,日出東方萬象融,風調雨順慶年豐,生逢盛世真歡樂,好把心田答化工,功名,必得,婚姻,和合,疾病,漸癒\n";

    // 範例 2：長篇解說格式 (展示如何在 CSV 中使用換行，只要用雙引號包起來即可)
    // 在 Excel 裡面編輯時，只要按下 Alt + Enter 就可以在同一格裡面換行了！
    csv += "2,這是第二首第一句,這是第二首第二句,這是第二首第三句,這是第二首第四句,聖意,\"神明指示您：\n第一、凡事順其自然\n第二、切勿急躁\",,,\n";

    //範例3：籤詩下方有提示格式\
    csv += "1,上上,日出東方萬象融,風調雨順慶年豐,生逢盛世真歡樂,好把心田答化工,功名,必得,婚姻,和合,疾病,漸癒\n";
    csv += "2,上中,玉女捧劍 金童捧印,足踏龜蛇 黑帝降壇,,,功名,多年苦幹 天神感之,六甲,身心調適\n";

    // 轉換成檔案並觸發下載
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "求籤系統_大批匯入範例格式.csv"; // 下載的預設檔名
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 2. 專業級 CSV 解析器 (支援 Excel 儲存格內的換行與逗號)
function parseCSV(str) {
    const arr = [];
    let quote = false;  // 標記是否在雙引號內部
    let row = 0, col = 0;
    for (let r = 0; r < 2000; r++) arr[r] = [];

    for (let c = 0; c < str.length; c++) {
        let cc = str[c], nc = str[c + 1];
        arr[row][col] = arr[row][col] || '';

        if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }
        if (cc == '"') { quote = !quote; continue; }
        if (cc == ',' && !quote) { ++col; continue; }
        if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }
        if (cc == '\n' && !quote) { ++row; col = 0; continue; }
        if (cc == '\r' && !quote) { ++row; col = 0; continue; }

        arr[row][col] += cc;
    }
    return arr.filter(row => row.length > 0 && row.some(col => col.trim() !== ''));
}

// 3. 讀取並轉換為系統格式
function importCsvSystem(event) {
    const file = event.target.files[0];
    if (!file) return;

    const sysName = document.getElementById('new-sys-name').value.trim();
    const sysFormat = document.getElementById('new-sys-format').value;

    if (!sysName) {
        showToast("⚠️ 請先在上方輸入「系統名稱」！", 3000);
        event.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const text = e.target.result;
            const rows = parseCSV(text);

            if (rows.length <= 1) {
                showToast("❌ 檔案內容為空或格式錯誤！", 3000);
                return;
            }

            const newSysId = 'sys_' + Date.now();
            const newSystem = {
                id: newSysId,
                name: sysName,
                format: sysFormat,
                total: 0,
                isCustom: true,
                content: {}
            };

            let maxLotNum = 0;

            // 跳過第一行標題 (i=1 開始)
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                const lotNum = parseInt(row[0]);

                if (isNaN(lotNum)) continue;
                if (lotNum > maxLotNum) maxLotNum = lotNum;

                // ★ 新增讀取 level (Index 1)
                const level = row[1] ? row[1].trim() : "";

                // ★ 詩句往後推一格 (Index 2~5)
                const l1 = row[2] ? row[2].trim() : "";
                const l2 = row[3] ? row[3].trim() : "";
                const l3 = row[4] ? row[4].trim() : "";
                const l4 = row[5] ? row[5].trim() : "";

                let intents = [];
                // ★ 解曰往後推一格 (從 Index 6 開始)
                for (let j = 6; j < row.length; j += 2) {
                    const type = row[j] ? row[j].trim() : "";
                    const txt = row[j + 1] ? row[j + 1].trim() : "";
                    if (type || txt) {
                        intents.push({ type: type, text: txt });
                    }
                }

                newSystem.content[lotNum] = { level, l1, l2, l3, l4, intents };
            }

            newSystem.total = maxLotNum;

            newSystem.customTemplate = (sysFormat === 'custom') ? document.getElementById('new-sys-template').value : null;
            poemSystems[newSysId] = newSystem;
            localStorage.setItem('zb_poem_systems', JSON.stringify(poemSystems));

            showToast(`🎉 成功匯入 ${Object.keys(newSystem.content).length} 支籤詩！`, 3000);
            event.target.value = ''; // 重置 input

            // 🌟 匯入成功後清空名稱
            document.getElementById('new-sys-name').value = '';

            renderCollectionMenu();
            goBack(); // 🌟 只在這裡執行「唯一一次」返回

        } catch (err) {
            console.error(err);
            showToast("❌ 解析 CSV 時發生錯誤，請檢查檔案格式！", 3000);
        }
    };
    // 讀取檔案，預設使用 UTF-8
    reader.onerror = function () {
        event.target.value = '';
    };
    reader.readAsText(file, "UTF-8");
}

// ==========================================
// ★ 整合所有模組化的籤詩與神明
// ==========================================
// 建立一個整合引擎，確保外部檔案載入後才合併資料
function syncCoreData() {
    // 🌟 加上這兩行安全防護，確保變數一定存在，避免 undefined 報錯
    window.poemSystems = window.poemSystems || {};
    window.extraDeities = window.extraDeities || [];

    // 1. 整合籤詩系統
    try {
        let savedSystems = JSON.parse(localStorage.getItem('zb_poem_systems')) || {};

        // 將所有使用者手動新增的(isCustom)保留下來，其他的直接用外部 js 覆寫
        Object.keys(savedSystems).forEach(key => {
            if (savedSystems[key] && savedSystems[key].isCustom) {
                window.poemSystems[key] = savedSystems[key];
            }
        });

        // 同步最新外部檔案的資料進入 localStorage
        Object.values(window.poemSystems).forEach(sys => {
            savedSystems[sys.id] = sys;
        });

    } catch (e) { }
    localStorage.setItem('zb_poem_systems', JSON.stringify(window.poemSystems));

    // 2. 整合神明
    try {
        let savedDeities = JSON.parse(localStorage.getItem('zb_deities'));
        if (savedDeities && Array.isArray(savedDeities)) deities = savedDeities;
    } catch (e) { }

    window.extraDeities.forEach(ed => {
        let exists = deities.find(d => d && d.id === ed.id);
        if (!exists) {
            deities.push(ed);
        } else {
            Object.assign(exists, { ...ed, ...exists });
        }
    });
    localStorage.setItem('zb_deities', JSON.stringify(deities));
}

// 取得「已經排好序」且「不重複」的神明清單
function getOrderedDeities() {
    let base = [];

    // A. 讀取 LocalStorage 看有沒有「使用者手動新增的神明」
    try {
        let saved = JSON.parse(localStorage.getItem('zb_deities'));
        if (saved && Array.isArray(saved)) {
            saved.forEach(savedDeity => base.push(savedDeity));
        }
    } catch (e) { }

    // B. 如果連存檔都沒有，就載入系統基礎名單
    // 【修正】：加入 window.DEFAULT_DEITIES 的存在性檢查
    if (base.length === 0 && window.DEFAULT_DEITIES && window.DEFAULT_DEITIES.length > 0) {
        base = [...window.DEFAULT_DEITIES];
    }

    // C. 把外掛神明 (extraDeities) 聰明地加進來，避免雙胞胎
    if (window.extraDeities) {
        window.extraDeities.forEach(ed => {
            let idx = base.findIndex(b => b.id === ed.id);
            if (idx === -1) {
                base.push(ed); // 沒見過的神明，加入！
            } else {
                // 如果神明已經在名單裡，確保外掛的屬性優先 (避免舊快取干擾)
                base[idx] = { ...base[idx], ...ed };
            }
        });
    }

    // D. 照著使用者的拖曳設定排序
    try {
        const savedOrder = JSON.parse(localStorage.getItem('zb_deities_order'));
        if (savedOrder && Array.isArray(savedOrder)) {
            base.sort((a, b) => {
                let indexA = savedOrder.indexOf(a.id);
                let indexB = savedOrder.indexOf(b.id);
                if (indexA === -1) indexA = 999;
                if (indexB === -1) indexB = 999;
                return indexA - indexB;
            });
        }
    } catch (e) { }
    return base;
}

// 最終定案全域神明
window.deities = getOrderedDeities();

// 輔助：更新圖片預覽
function updateImagePreviews() {
    // 更新筊杯
    const setPrev = (id, key, typeText, cssClass) => {
        const el = document.getElementById(id);
        if (!el) return;
        const customSrc = localStorage.getItem('custom_' + key);
        if (customSrc) {
            el.innerHTML = `<img src="${customSrc}" class="cup-preview-img">`;
        } else {
            el.innerHTML = `<div class="res-dot main-dot-lg ${cssClass}">${typeText.charAt(0)}</div>`;
        }
    };
    setPrev('prev-cup-saint', 'cup_saint', '聖', 'dot-saint');
    setPrev('prev-cup-laugh', 'cup_laugh', '笑', 'dot-laugh');
    setPrev('prev-cup-covered', 'cup_covered', '蓋', 'dot-covered');

    // 更新靜止籤筒 (圖1)
    const qtS = localStorage.getItem('custom_qiantong_static') || QIANTONG_DEFAULT;
    const elQt = document.getElementById('prev-qt-static');
    if (elQt) {
        if (qtS.startsWith('data:')) {
            elQt.innerHTML = `<img src="${qtS}" class="icon-img">`;
        } else {
            // ★關鍵：如果是 Emoji，使用 span 顯示並放大，不要用 img tag
            elQt.innerHTML = `<span class="icon-emoji" style="font-size:3rem;">${qtS}</span>`;
        }
    }

    // 更新抽籤籤筒 (圖2)
    const qtA = localStorage.getItem('custom_qiantong_active');
    const elQtA = document.getElementById('prev-qt-active');
    if (elQtA) {
        if (qtA && qtA.startsWith('data:')) {
            elQtA.innerHTML = `<img src="${qtA}" class="icon-img">`;
        } else if (qtA) {
            elQtA.innerHTML = `<span class="icon-emoji" style="font-size:3rem;">${qtA}</span>`;
        } else {
            elQtA.innerHTML = '';
        }
    }
}

window.assignRecordToDeity = function () {
    const selId = document.getElementById('detail-assign-deity-sel').value;
    if (!selId) return showToast("請先選擇神明");

    const id = parseInt(document.getElementById('detail-id').value);
    const r = records.find(x => x.id === id);
    const d = deities.find(x => x.id === selId);

    if (r && d) {
        // 更新紀錄的 type 為神明的名字
        r.type = d.name;

        // 儲存更新
        window.Database.saveRecord(r);

        showToast(`✅ 紀錄已成功歸屬給 ${d.name}`);

        // 重新整理詳情畫面
        openRecordDetail(id);
    }
};

// ==========================================
// ★ 開啟修改視窗 (智慧解析雙選單版)
// ==========================================
window.openEditRecordModal = function (id) {
    const r = records.find(x => x.id == id);
    if (!r) return;

    document.getElementById('edit-rec-id').value = r.id;

    // 🌟 核心修復：先檢查畫面上到底有沒有這個元素，有才填入，沒有就跳過，絕對不報錯！
    const lotInput = document.getElementById('edit-rec-lot');
    if (lotInput) {
        lotInput.value = r.lot || '-';
    }

    const catSel = document.getElementById('edit-rec-category');
    const deitySel = document.getElementById('edit-rec-deity');

    // 1. 建立類型選單
    catSel.innerHTML = `
        <option value="一般">一般求籤</option>
        <option value="神明">神明求籤</option>
        <option value="問事">問事擲筊</option>
        <option value="比較">比較擲筊</option>
    `;

    // 2. 建立神明選單
    deitySel.innerHTML = `<option value="none">無 (不指定)</option>`;
    deities.forEach(d => {
        deitySel.innerHTML += `<option value="${d.name}">${d.name}</option>`;
    });

    // 3. 智慧解析原本的 r.type 字串
    let parsedCategory = '神明'; // 預設
    let parsedDeityName = 'none';
    let rawType = r.type || "";

    if (rawType.includes('問事')) {
        parsedCategory = '問事';
        parsedDeityName = rawType.replace('(問事)', '').replace('問事', '').trim();
    } else if (rawType.includes('比較')) {
        parsedCategory = '比較';
        parsedDeityName = rawType.replace('(比較)', '').replace('比較擲筊', '').replace('比較', '').trim();
    } else if (rawType.includes('一般')) {
        parsedCategory = '一般';
        parsedDeityName = rawType.replace('(一般)', '').replace('一般求籤', '').trim();
    } else {
        parsedCategory = '神明';
        parsedDeityName = rawType.trim();
    }

    const systemPlaceholders = ['未具名神明', '一般求籤', '比較擲筊', '問事擲筊', ''];
    if (systemPlaceholders.includes(parsedDeityName)) {
        parsedDeityName = 'none';
    }

    // 4. 套用到畫面上
    catSel.value = parsedCategory;

    // 🛡️ 高階防呆：如果這筆紀錄的神明，後來被使用者從設定裡刪除了怎麼辦？
    let deityExists = Array.from(deitySel.options).some(opt => opt.value === parsedDeityName);
    if (parsedDeityName !== 'none' && !deityExists) {
        // 動態補上這個幽靈選項，讓使用者知道原本是綁定誰
        deitySel.innerHTML += `<option value="${parsedDeityName}">${parsedDeityName} (已刪除)</option>`;
    }
    deitySel.value = parsedDeityName;

    document.getElementById('record-edit-modal').style.display = 'flex';
};

// ==========================================
// ★ 儲存修改 (重新組合雙選單版)
// ==========================================
window.saveRecordHeaderEdit = function () {
    // 🛡️ 防呆 1：確保隱藏的 ID 欄位存在
    const idEl = document.getElementById('edit-rec-id');
    if (!idEl || !idEl.value) {
        console.warn("找不到紀錄 ID，無法儲存");
        return;
    }

    const id = parseInt(idEl.value);
    const r = records.find(x => x.id === id);
    if (!r) return;

    // 🛡️ 防呆 2：使用 `?.value` 取得值。如果該輸入框不存在，就給它一個安全的預設值
    const newCategory = document.getElementById('edit-rec-category')?.value || '一般';
    const newDeity = document.getElementById('edit-rec-deity')?.value || 'none';

    // 籤號比較特別，因為有 .trim() 操作，要先確保元素存在
    const lotEl = document.getElementById('edit-rec-lot');
    const newLot = (lotEl ? lotEl.value.trim() : '') || '-';

    // 重新組合 r.type 字串，確保與系統其他地方的顯示相容
    let finalTypeStr = "";

    if (newCategory === '一般') {
        finalTypeStr = (newDeity === 'none') ? '一般求籤' : `${newDeity} (一般)`;
    } else if (newCategory === '神明') {
        finalTypeStr = (newDeity === 'none') ? '未具名神明' : newDeity;
    } else if (newCategory === '問事') {
        finalTypeStr = (newDeity === 'none') ? '問事 (問事)' : `${newDeity} (問事)`;
    } else if (newCategory === '比較') {
        finalTypeStr = (newDeity === 'none') ? '比較擲筊 (比較)' : `${newDeity} (比較)`;
    }

    r.type = finalTypeStr;
    r.lot = newLot;

    window.Database.saveRecord(r);

    // 🛡️ 防呆 3：確保彈窗元素存在再隱藏它
    const editModal = document.getElementById('record-edit-modal');
    if (editModal) {
        editModal.style.display = 'none';
    }

    if (typeof renderRecords === 'function') renderRecords();

    if (typeof window.showToast === 'function') window.showToast("✅ 紀錄修改成功！");
};

// ==========================================
// ★ 資料庫統一接口 (核心保留，安全呼叫外部模組)
// ==========================================
window.Database = {
    saveRecord: function (record) {
        // 1. 處理本地記憶體陣列
        if (typeof records !== 'undefined') {
            const existingIndex = records.findIndex(r => r.id === record.id);
            if (existingIndex === -1) {
                records.unshift(record); // 新紀錄插到最前
            } else {
                records[existingIndex] = record; // 舊紀錄覆蓋更新
            }
        }

        // 2. 寫入本地硬碟 (單機功能絕對保留)
        localStorage.setItem('zb_records_v3', JSON.stringify(records));

        // 3. 呼叫雲端同步 (特徵偵測：如果外部模組有載入才執行)
        if (typeof window.saveToCloud === 'function') {
            try {
                const p = window.saveToCloud(record);
                if (p && p.catch) p.catch(e => console.warn("雲端同步異常", e));
            } catch (e) { }
        }
    }
};

// ==========================================
// ★ 使用者上次偏好設定之記憶與還原模組
// ==========================================

// 記憶偏好設定
window.saveUserLastPreference = function () {
    if (typeof settings === 'undefined') return;

    // 記憶上次使用的功能頁籤 (如：'tab-simple-mode-online')
    const activeSimpleTab = document.querySelector('#page-simple .tab-btn.active');
    if (activeSimpleTab) {
        settings.lastSimpleMode = activeSimpleTab.id;
    }

    // 記憶上次點選的籤數上限
    const simpleTotalInput = document.getElementById('simple-draw-total');
    if (simpleTotalInput) {
        settings.lastSimpleTotal = parseInt(simpleTotalInput.value) || 101;
    }

    // 寫入本地硬碟
    localStorage.setItem('zb_settings', JSON.stringify(settings));
};

// 還原偏好設定
window.restoreUserPreference = function () {
    if (typeof settings === 'undefined') return;

    // 1. 還原上次的籤數上限
    const simpleTotalInput = document.getElementById('simple-draw-total');
    if (simpleTotalInput && settings.lastSimpleTotal) {
        simpleTotalInput.value = settings.lastSimpleTotal;
    }

    // 2. 還原上次點選的功能頁籤
    if (settings.lastSimpleMode && typeof window.switchSimpleMode === 'function') {
        // 判斷原頁籤字串來對應切換模式
        const mode = settings.lastSimpleMode.includes('mode-online') ? 'online' : 'manual';
        window.switchSimpleMode(mode);
    }
};


// ==========================================
// ★ 雲端模組防呆墊片 (Fallback Stubs)
// 如果 sync_fortune.js 沒被載入，就會執行以下的安全備案，確保 App 不會當機
// ==========================================

// 1. 資料庫引擎初始化防呆
if (typeof window.initDatabaseEngine !== 'function') {
    window.initDatabaseEngine = async function () {
        window.currentDB = 'local';
        console.log("📱 [系統] 雲端同步模組未載入，啟動純單機模式");
    };
}

// 2. 介面按鈕防呆：切換雲端輸入框
if (typeof window.toggleDbInput !== 'function') {
    window.toggleDbInput = function () {
        console.warn("模組未載入：toggleDbInput");
    };
}

// 3. 介面按鈕防呆：儲存雲端設定
if (typeof window.saveCustomDatabase !== 'function') {
    window.saveCustomDatabase = function () {
        if (typeof showToast === 'function') showToast("⚠️ 雲端模組未載入，無法設定資料庫");
    };
}

// 4. 介面按鈕防呆：觸發全機備份
if (typeof window.triggerCloudBackup !== 'function') {
    window.triggerCloudBackup = function () {
        if (typeof showToast === 'function') showToast("⚠️ 雲端備份模組尚未載入");
    };
}

// 5. Webhook 傳送防呆
if (typeof window.sendDataToWebhook !== 'function') {
    window.sendDataToWebhook = async function (recordData) {
        if (typeof showToast === 'function') showToast("⚠️ GAS 傳送模組未載入");
    };
}