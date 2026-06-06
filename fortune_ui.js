// 全域設定快照變數
window.globalSettingsSnapshot = "";

// 📸 建立快照的函式（在「進入」設定頁面的那一刻呼叫）
window.captureSettingsSnapshot = function () {
    const currentSettings = typeof settings !== 'undefined' ? settings : {};
    window.globalSettingsSnapshot = JSON.stringify(currentSettings);
    console.log("📸 [系統] 已成功建立初始設定快照:", window.globalSettingsSnapshot);
};

window.createPoemSettingsHTML = function (prefix, targetTool) {
    return `
        <!-- 動態生成的頁籤 -->
        <div class="tab-group" style="margin-bottom:0; border-bottom-left-radius:0; border-bottom-right-radius:0; border-bottom:none; background:#111;">
            <div class="tab-btn active" id="tab-${prefix}-mode-online" 
                onclick="window.setPoemMode('${prefix}', 'online')">📱 線上求籤</div>
            <div class="tab-btn" id="tab-${prefix}-mode-manual" 
                onclick="window.setPoemMode('${prefix}', 'manual')">✍️ 手動求籤</div>
        </div>
        
        <div style="background:#1a1a1a; padding:10px; border-radius:8px; border-top-left-radius:0; border-top-right-radius:0; border: 1px solid #444;">
            
            <!-- 三宮格操作列 -->
            <div id="${prefix}-poem-action-row" style="display:flex; gap:6px; margin-bottom:10px; align-items:center; padding:0; border:none; background:transparent;">
                
                <!-- 1. 抽籤按鈕 -->
                <button type="button" id="btn-${prefix}-draw-trigger" class="action-btn" 
                    onclick="window.openMiniDraw('${prefix}-lot-num', '${prefix}-ask-perm', '${targetTool}', '${prefix}-draw-total')" 
                    style="margin:0; flex:1; background:#4CAF50; color:#fff; border:none; height:36px; padding:0; font-size:1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.2); border-radius:8px;">🙏 抽籤</button>
                
                <!-- 2. 籤號區 -->
                <div id="${prefix}-lot-wrapper" style="flex:1; display:flex; align-items:center; justify-content:center; background:#2a2a2a; border-radius:8px; padding:0 8px; border:1px solid #555; height:36px; box-sizing:border-box;">
                    <span id="${prefix}-lot-label" style="font-size:0.85rem; color:#aaa; margin-right:4px; white-space:nowrap; display:none;">籤號</span>
                    <input type="number" id="${prefix}-lot-num" placeholder="請點抽籤" readonly min="1" 
                        oninput="this.value = Math.abs(this.value) || ''; window.checkLotLimit(this, '${targetTool}')" 
                        style="margin:0; height:100%; border:none; text-align:center; background:transparent; color:#ccc; font-weight:bold; font-size:0.9rem; padding:0; width:100%; box-sizing:border-box; outline:none; appearance:textfield;">
                </div>

                <!-- 3. 動態右側區 -->
                <div style="flex:1; height:36px; display:flex;">
                    <div id="${prefix}-max-lot-container" style="display:flex; flex:1; align-items:center; justify-content:center; background:#222; border:1px solid #555; border-radius:8px; box-sizing:border-box; padding:0 5px;">
                        <span style="font-size:0.75rem; color:#aaa; margin-right:4px; white-space:nowrap;">最大數</span>
                        <input type="number" id="${prefix}-draw-total" value="101" style="width:40px; text-align:center; height:28px; border:1px solid #444; background:#111; color:var(--accent); border-radius:4px; font-weight:bold; padding:0; margin:0;">
                    </div>
                    <!-- 定位點 -->
                    <div id="${prefix}-times-poem-anchor" style="display:none; flex:1; justify-content:center; align-items:center; height:36px; margin:0;"></div>
                </div>
            </div>
            
            <!-- 下方設定區 -->
            <div id="${prefix}-online-settings" style="display:flex; align-items:center; justify-content:space-between; background:#222; padding:8px 12px; border-radius:6px; border:1px solid #333;">
                <label style="font-size:0.85rem; color:#aaa; display:inline-flex; align-items:center; cursor:pointer;">
                    <input type="checkbox" id="${prefix}-ask-perm" style="margin-right:6px; width:16px; height:16px; flex-shrink:0;"> 聖筊才抽籤
                </label>
                <label style="font-size:0.85rem; color:#aaa; display:inline-flex; align-items:center; cursor:pointer;">
                    <input type="checkbox" id="${prefix}-no-put-back" style="margin-right:6px; width:16px; height:16px; flex-shrink:0;"> 抽後不放回
                </label>
            </div>
        </div>
    `;
};

// 🧱 模組工廠：數字加減調節器 (只產生中間的控制框)
window.createNumberAdjusterHTML = function (id, defaultValue, min, max, onChangeFuncStr) {
    return `
        <div style="display:flex; align-items:center; background:#111; border-radius:4px; border:1px solid #555; height:28px;">
            <button type="button" onclick="adjustNumber('${id}', -1, ${min}, ${max}, '${onChangeFuncStr}')" style="background:transparent; border:none; color:#aaa; font-size:1.2rem; padding:0 12px; height:28px; display:flex; align-items:center; justify-content:center; cursor:pointer;">-</button>
            <input type="number" id="${id}" value="${defaultValue}" min="${min}" max="${max}" readonly style="margin:0; height:28px; width:35px; border:none; border-left:1px solid #333; border-right:1px solid #333; background:transparent; color:#fff; text-align:center; font-weight:bold; padding:0; outline:none; appearance:textfield;" onchange="${onChangeFuncStr ? `window.${onChangeFuncStr}()` : ''}">
            <button type="button" onclick="adjustNumber('${id}', 1, ${min}, ${max}, '${onChangeFuncStr}')" style="background:transparent; border:none; color:var(--accent); font-size:1.2rem; padding:0 12px; height:28px; display:flex; align-items:center; justify-content:center; cursor:pointer;">+</button>
        </div>
    `;
};

// 🧱 模組工廠：杯象手動輸入框 (聖/笑/蓋 三宮格)
window.createCupManualInputHTML = function (prefix) {
    return `
        <div style="flex:1; display:flex; align-items:center; background:#111; padding:5px; border-radius:5px; border:1px solid #555;">
            <span style="color:#ffb300; font-weight:bold; margin-right:5px; font-size:0.9rem;">聖</span>
            <input type="number" id="${prefix}-s" value="0" min="0" style="width:100%; border:none; background:transparent; color:#fff; text-align:center; padding:0; margin:0;">
        </div>
        <div style="flex:1; display:flex; align-items:center; background:#111; padding:5px; border-radius:5px; border:1px solid #555;">
            <span style="color:#ddd; font-weight:bold; margin-right:5px; font-size:0.9rem;">笑</span>
            <input type="number" id="${prefix}-l" value="0" min="0" style="width:100%; border:none; background:transparent; color:#fff; text-align:center; padding:0; margin:0;">
        </div>
        <div style="flex:1; display:flex; align-items:center; background:#111; padding:5px; border-radius:5px; border:1px solid #555;">
            <span style="color:#888; font-weight:bold; margin-right:5px; font-size:0.9rem;">蓋</span>
            <input type="number" id="${prefix}-c" value="0" min="0" style="width:100%; border:none; background:transparent; color:#fff; text-align:center; padding:0; margin:0;">
        </div>
    `;
};

// 📱 真實視窗高度鎖定 (解決手機網址列縮放導致畫面跳動)
//function lockViewportHeight() {
//    // 取得當下真實的內部高度 (扣除網址列與導覽列)
//    let vh = window.innerHeight * 0.01;
//    // 將這個值存入 CSS 變數 '--vh' 中
//    document.documentElement.style.setProperty('--vh', `${vh}px`);
//}

// 初始化執行一次
//lockViewportHeight();

// 監聽螢幕旋轉或視窗大小改變 (防抖動處理，避免過度頻繁觸發)
//window.addEventListener('resize', () => {
//    // 避免鍵盤彈出時的 resize 覆蓋掉我們的高度
//    if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
//        requestAnimationFrame(lockViewportHeight);
//    }
//});

// 🌟 UI 模組初始化注入
document.getElementById('simple-poem-settings').innerHTML = window.createPoemSettingsHTML('simple', 'simple');
document.getElementById('comp-fu-poem-settings').innerHTML = window.createPoemSettingsHTML('comp-fu', 'compare');
// 初始化：數字調節器模組 (ID, 預設值, 最小值, 最大值, 觸發函式)
const simpleTimesMod = document.getElementById('module-simple-times');
if (simpleTimesMod) simpleTimesMod.innerHTML = window.createNumberAdjusterHTML('simple-times', 3, 1, 100, 'renderSimpleCupRows');

const compTimesMod = document.getElementById('module-comp-times');
if (compTimesMod) compTimesMod.innerHTML = window.createNumberAdjusterHTML('comp-times', 3, 1, 100, 'renderCompareRows');

const detailFuTimesMod = document.getElementById('module-detail-fu-times');
if (detailFuTimesMod) {
    detailFuTimesMod.innerHTML = window.createNumberAdjusterHTML('detail-fu-times', 1, 1, 20, 'renderDetailFuRows') +
        `<span style="color:#888; margin-left:5px;">次</span>`;
}

// 初始化：杯象手動輸入框模組 (傳入字首 ID)
const manualAskCupsMod = document.getElementById('module-manual-ask-cups');
if (manualAskCupsMod) manualAskCupsMod.innerHTML = window.createCupManualInputHTML('manual-ask');

/* ==========================================
★ 主題引擎與背景設定邏輯
========================================== */
window.updateSystemTotalUI = function () {
    const sel = document.getElementById('sel-default-system');
    const area = document.getElementById('setting-total-lot-area');
    const input = document.getElementById('input-total-lot');
    const hint = document.getElementById('setting-total-lot-hint');

    // 確保元素存在
    if (!sel || !area || !input || !hint) return;

    const sysId = sel.value;

    if (sysId === 'none' || !sysId) {
        // 沒有選擇系統：保持正常狀態
        area.style.opacity = '1';
        area.style.pointerEvents = 'auto'; // 允許點擊
        input.disabled = false;            // 解除鎖定
        hint.style.display = 'none';       // 隱藏提示
    } else {
        // 有選擇系統：整塊反灰
        area.style.opacity = '0.3';
        area.style.pointerEvents = 'none'; // 禁用所有點擊
        input.disabled = true;             // 禁用輸入框

        // 抓取該系統的籤詩總數
        let total = 101;
        if (window.AppState && window.AppState.data && window.AppState.data.systems) {
            const sys = window.AppState.data.systems.find(x => x.id === sysId);
            if (sys && sys.poems) {
                total = sys.poems.length;
            }
        }

        // 顯示提示文字
        hint.innerText = `※所選籤詩系統為 ${total} 籤`;
        hint.style.display = 'block';
    }
};

// 1. 動態套用主題
function applyTheme() {
    let hColor = settings.headerColor || '#d32f2f'; // 預設紅
    let bColor = settings.bgColor || '#1a1a1a';     // 預設黑
    let bImage = settings.bgImage || null;

    // 如果在求籤畫面且有指定神明，優先使用神明專屬設定
    const activePage = document.querySelector('.page.active');
    if (activePage && activePage.id === 'page-qiuqian' && currentMode === 'deity' && currentDeity) {
        if (currentDeity.headerColor) hColor = currentDeity.headerColor;
        if (currentDeity.bgColor) bColor = currentDeity.bgColor;
        if (currentDeity.bgImage) bImage = currentDeity.bgImage;
    }

    // 修改 CSS 變數，瞬間改變所有表頭和按鈕顏色
    document.documentElement.style.setProperty('--primary', hColor);
    document.documentElement.style.setProperty('--bg-color', bColor);

    // 修改背景圖片
    if (bImage) {
        document.body.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${bImage})`; // 加上半透明遮罩防字看不清楚
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundAttachment = 'fixed';
    } else {
        document.body.style.backgroundImage = 'none';
    }
}

// 2. 全域背景設定功能
function clearGlobalBg() {
    tempGlobalBgImg = "CLEAR";
    document.getElementById('global-bg-preview').style.backgroundImage = 'none';
}

// 1. 修正背景儲存（拔除 alert 與 goTo）
window.saveBgSettings = function () {
    settings.headerColor = document.getElementById('global-header-color').value;
    settings.bgColor = document.getElementById('global-bg-color').value;
    if (AppState.editor.globalBgImg === "CLEAR") delete settings.bgImage;
    else if (AppState.editor.globalBgImg) settings.bgImage = AppState.editor.globalBgImg;

    localStorage.setItem('zb_settings', JSON.stringify(settings));
    applyTheme();
};

// 2. 升級還原預設的確認視窗 (加上 async/await 與 showConfirm)
window.resetBgSettings = async function () {
    // 改用美美的 confirm，注意前面一定要加 await
    if (await showConfirm('確定要還原為預設的黑紅主題嗎？', '還原確認')) {
        document.getElementById('global-header-color').value = '#d32f2f';
        document.getElementById('global-bg-color').value = '#1a1a1a';
        clearGlobalBg();
        saveBgSettings();
        showToast("✅ 已還原預設主題");
    }
};

// 3. 神明專屬背景設定功能
function handleDeityBgUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    compressImage(file, 800, 0.7, (res) => {
        tempDeityBgImg = res;
        document.getElementById('edit-deity-bg-preview').style.backgroundImage = `url(${res})`;
    });
}

function clearDeityBg() {
    tempDeityBgImg = "CLEAR";
    document.getElementById('edit-deity-bg-preview').style.backgroundImage = 'none';
}

/* ==========================================
★ App 專業功能擴充引擎 (Toast / Haptics / Capture)
========================================== */
// ==========================================
// ★ Toast 提示引擎 (頂部降臨版)
// ==========================================
window.showToast = function (msg, duration = 3000) {
    const oldToast = document.getElementById('smart-toast-box');
    if (oldToast) oldToast.remove();

    if (!document.getElementById('smart-toast-css')) {
        const style = document.createElement('style');
        style.id = 'smart-toast-css';
        style.innerHTML = `
            @keyframes toastFadeInTop {
                from { opacity: 0; transform: translate(-50%, -20px); }
                to { opacity: 1; transform: translate(-50%, 0); }
            }
            @keyframes toastFadeOutTop {
                from { opacity: 1; transform: translate(-50%, 0); }
                to { opacity: 0; transform: translate(-50%, -20px); }
            }
        `;
        document.head.appendChild(style);
    }

    // 🌟 核心修復：加入了 display: flex、align-items: center，並把 pre-wrap 改成 nowrap 🌟
    const toastHtml = `
        <div id="smart-toast-box" style="position: fixed; left: 50%; top: 30px; transform: translateX(-50%); background: rgba(20, 20, 20, 0.95); color: #fff; padding: 12px 25px; border-radius: 30px; font-size: 1.05rem; z-index: 9999999; border: 1px solid var(--accent, #ffb300); box-shadow: 0 8px 20px rgba(0,0,0,0.6); pointer-events: none; display: flex; align-items: center; justify-content: center; gap: 8px; white-space: nowrap; width: max-content; max-width: 90vw; animation: toastFadeInTop 0.3s forwards;">
            ${msg}
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', toastHtml);
    const toastEl = document.getElementById('smart-toast-box');

    if (window.toastTimer) clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => {
        if (toastEl) {
            toastEl.style.animation = "toastFadeOutTop 0.3s forwards";
            setTimeout(() => toastEl.remove(), 300);
        }
    }, duration);
};

// 替換成這個版本：自動去呼叫最新的無敵動態視窗
window.showConfirm = async function (msg, title = "請確認") {
    if (typeof window.smartConfirm === 'function') {
        return await window.smartConfirm(msg, title);
    } else {
        return window.confirm(msg);
    }
};

// 3. 震動反饋引擎 (Haptics)
window.triggerVibration = function (pattern = 50) {
    // 檢查裝置是否支援震動 API
    if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
    }
};

// 4. 籤詩轉圖片並下載/分享 (html2canvas)
window.downloadPoemImage = function (containerId) {
    const targetEl = document.querySelector(`#${containerId} .fortune-slip`);
    if (!targetEl) return showToast("⚠️ 找不到籤詩畫面");

    showToast("📸 正在產生精美籤詩圖片...", 3000);

    // 稍微放大提升畫質，並確保跨網域圖片(如神像)能渲染
    html2canvas(targetEl, { scale: 2, useCORS: true, backgroundColor: null }).then(canvas => {
        const link = document.createElement('a');
        link.download = `神明賜籤_${new Date().getTime()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast("✅ 圖片已儲存，快去分享吧！");
    }).catch(err => {
        console.error(err);
        showToast("❌ 圖片產生失敗");
    });
};

// 電腦代擲
window.autoThrowSimpleRow = function (idx) {
    const res = getCupResult();
    const group = document.getElementById(`sim-row-group-${idx}`);
    const btns = group.querySelectorAll('.res-btn');
    if (res.type === 1) setSimpleCupVal(idx, 1, btns[0]);
    else if (res.type === 0 && res.text === '笑筊') setSimpleCupVal(idx, 0, btns[1]);
    else setSimpleCupVal(idx, -1, btns[2]);
};

// 回復結果
window.resetSimpleCupRow = async function (idx) {
    // 微調提示文字，讓語意更明確
    if (!(await showConfirm("這樣會清空此筊的結果，是否確定？"))) return;

    const group = document.getElementById(`sim-row-group-${idx}`);
    // 🛡️ 防呆 1：確保這個群組真的存在才繼續執行
    if (!group) return;

    group.dataset.locked = 'false';

    // 恢復所有按鈕狀態
    group.querySelectorAll('.res-btn').forEach(b => {
        b.classList.remove('active-saint', 'active-laugh', 'active-close', 'locked-btn');
    });

    // 🛡️ 防呆 2：確保顯示結果的元素存在
    const resDisplay = document.getElementById(`sim-row-res-${idx}`);
    if (resDisplay) {
        resDisplay.innerHTML = '-';
    }

    // 清空資料陣列
    simpleTempCups[idx] = null;

    // 🛡️ 防呆 3 & 排版優化：
    // 把 'block' 改成 '' (空字串) 或 'inline-block'。
    // 因為如果你的按鈕本來是用 flex 或 inline-block 排列，強制塞 'block' 可能會讓按鈕變形撐滿整行！
    const autoBtn = document.getElementById(`sim-auto-btn-${idx}`);
    if (autoBtn) autoBtn.style.display = ''; // 清除 style，讓它吃原本 CSS 的預設顯示方式

    const resetBtn = document.getElementById(`sim-reset-btn-${idx}`);
    if (resetBtn) resetBtn.style.display = 'none';

    // 🌟 核心 UX 優化：連動檢查 🌟
    // 因為使用者剛剛「取消」了一個筊杯結果，原本可能因為擲出「聖筊」而亮起的【抽籤】按鈕，
    // 現在應該要被重新評估是否需要再次隱藏或鎖定！
    if (typeof window.checkSimplePoemPerm === 'function') {
        window.checkSimplePoemPerm(); // 假設你有這個檢查抽籤權限的函式，記得在這裡呼叫它
    }
};

window.deleteSimpleSessionItem = async function (index) {
    if (!(await window.showConfirm("確定要刪除這筆問事紀錄嗎？", "刪除確認"))) return;
    if (typeof simpleSessionHistory !== 'undefined') {
        simpleSessionHistory.splice(index, 1);
        window.renderSimpleHistory();
    }
};

window.deleteCompFuItem = async function (index) {
    if (!(await window.showConfirm("確定要刪除這筆追問紀錄嗎？", "刪除確認"))) return;
    if (typeof compFuHistory !== 'undefined') {
        compFuHistory.splice(index, 1);
        window.renderCompFuHistory();
    }
};

// ==========================================
// ★ 強制覆蓋：開啟並渲染籤詩畫面 (修復籤詩收錄的神明連動)
// ==========================================
window.openPoemModal = function (lotNum) {
    // 取得目前的系統，預設抓您統一的 Baishatun_Mazu 或 Shanbian_Mazu
    let sys = currentSystem || poemSystems['Baishatun_Mazu'] || poemSystems['Shanbian_Mazu'];
    let d = currentDeity;

    // ★ 核心修正：如果是在「籤詩收錄」裡面點開，強制將神明切換為該籤詩專屬的神明！
    // 這樣圖示、地址、宮名與左右護法字才會跟著變成該神明的設定。
    if (document.getElementById('page-collection').classList.contains('active') ||
        document.getElementById('page-poem-sys').classList.contains('active')) {
        let matchedDeity = deities.find(x => x.sysId === sys.id);
        if (matchedDeity) d = matchedDeity;
    }

    document.getElementById('poem-modal-body').innerHTML = getFortuneSlipHTML(lotNum, sys, d);
    document.getElementById('poem-modal').style.display = 'flex';
};
window.closePoemModal = function () { document.getElementById('poem-view-modal').style.display = 'none'; };



// 比較追問專用：重置重抽功能 (保留問題，只清空籤號與杯象)
window.clearCompFuBlock = async function (skipConfirm = false) {
    if (typeof unlockPermissionDenied === 'function') unlockPermissionDenied();

    if (!skipConfirm) {
        // 使用者手動點擊「重置重抽」：貼心保留問題文字，只清空結果與按鈕
        if (!(await window.showConfirm("確定要清除目前的擲筊結果與籤號重新開始嗎？\n(您的提問文字會為您保留)", "重置確認"))) return;
    } else {
        // 存檔後系統自動呼叫：連同問題一起清空，準備迎接下一個追問！
        const qText = document.getElementById('comp-fu-q-text');
        if (qText) qText.value = "";
    }

    // 清空籤號
    const lotNum = document.getElementById('comp-fu-lot-num');
    if (lotNum) lotNum.value = "";

    // 🌟 核心修復：強制重新渲染擲筊按鈕列，解除鎖定狀態！
    if (typeof window.renderCompFuRows === 'function') {
        window.renderCompFuRows();
    }
};

window.renderCompFuHistory = function () {
    const c = document.getElementById('comp-fu-history');
    if (!c) return;
    c.innerHTML = "";
    if (typeof compFuHistory === 'undefined') return;

    compFuHistory.forEach((b, i) => {
        let editBtnHtml = "";
        if (!b.isOnlineDraw) {
            // 🌟 加入 data-html2canvas-ignore="true"
            editBtnHtml = `<button data-html2canvas-ignore="true" onclick="window.openHistoryEditModal('compFu', ${i})" style="position:absolute; right:32px; top:8px; background:transparent; border:none; color:#2196F3; font-size:1.05rem; cursor:pointer; padding:0; line-height:1; opacity:0.8;">✏️</button>`;
        }

        let cleanHtml = b.html ? b.html.replace('margin-top:5px;', 'margin-top:0;') : '';

        c.innerHTML += `
            <div id="record-comp-${i}" class="session-block" style="padding:8px; background:rgba(255,255,255,0.08); position: relative;">
                
                ${editBtnHtml}
                
                <button data-html2canvas-ignore="true" onclick="window.deleteCompFuItem(${i})" style="position:absolute; right:8px; top:8px; background:transparent; border:none; color:#f44336; font-size:1.05rem; cursor:pointer; padding:0; line-height:1; opacity:0.8;">🗑️</button>
                
                <div style="font-size:0.75rem; color:#888; margin-bottom: 2px;">#${i + 1}</div>
                <div class="q-text" style="font-size:0.9rem; margin-bottom:6px; padding-right: 80px;">問：${b.question}</div>
                
                <div style="display:flex; align-items:center; flex-wrap:wrap; gap:8px;">
                    <div class="a-text" style="font-size:0.85rem; margin:0;">答：${b.result}</div>
                    ${cleanHtml ? `<div style="color:#555; font-size:0.9rem;">|</div> <div style="display:flex; align-items:center;">${cleanHtml}</div>` : ''}
                </div>

                ${b.poemBtn || ''}
            </div>
        `;
    });
    c.scrollTop = c.scrollHeight;
};

window.renderCompFuRows = function () {
    const container = document.getElementById('comp-fu-rows');
    let times = parseInt(document.getElementById('comp-fu-times').value) || 1;
    compFuTempCups = new Array(times).fill(null);
    let htmlString = "";
    container.innerHTML = "";

    for (let i = 0; i < times; i++) {
        htmlString += `
            <div class="table-input-row" style="margin-bottom:8px; padding-bottom:8px; align-items:center;">
                <div class="table-idx" style="width:40px; font-size:0.8rem;">第${i + 1}次</div>
                <div class="res-select-group" id="cfu-row-group-${i}" data-locked="false" style="flex:1; display:flex;">
                    <div class="res-btn" style="padding:4px 0;" onclick="setCompFuCupVal(${i}, 1, this)">聖</div>
                    <div class="res-btn" style="padding:4px 0;" onclick="setCompFuCupVal(${i}, 0, this)">笑</div>
                    <div class="res-btn" style="padding:4px 0;" onclick="setCompFuCupVal(${i}, -1, this)">蓋</div>
                </div>
                <div class="row-action-col" style="width:50px; margin:0 5px;">
                    <button class="secondary-btn" id="cfu-auto-btn-${i}" style="margin:0; padding:4px 0; font-size:0.75rem; width:100%;" onclick="autoThrowCompFuRow(${i})">🎲</button>
                    <button class="secondary-btn" id="cfu-reset-btn-${i}" style="margin:0; padding:4px 0; font-size:0.75rem; width:100%; display:none; border-color:#f44336; color:#f44336;" onclick="resetCompFuCupRow(${i})">↺</button>
                </div>
                <div class="table-result-col" id="cfu-row-res-${i}" style="width:30px; margin:0; padding:0; border:none;">-</div>
            </div>
        `;
    }
    container.innerHTML = htmlString;
};

// 1. 開啟追問區 (移除舊版 switch 呼叫)
window.openCompareFollowUp = function () {
    const qText = document.getElementById('comp-fu-q-text');
    if (qText) qText.value = "";
    if (typeof compFuHistory !== 'undefined') compFuHistory = [];
    const historyEl = document.getElementById('comp-fu-history');
    if (historyEl) historyEl.innerHTML = "";

    // 強制重畫乾淨的擲筊格子
    if (typeof renderCompFuRows === 'function') renderCompFuRows();
};

// 2. 關閉追問區 (補上 async/await 與 window.showConfirm)
window.closeCompareFuModal = async function () {
    if (typeof compFuHistory !== 'undefined' && compFuHistory.length > 0) {
        if (!(await window.showConfirm("確定關閉？尚未點擊下方「儲存紀錄」的追問內容將會遺失。"))) return;
    }
    const modal = document.getElementById('compare-fu-modal');
    if (modal) modal.style.display = 'none';
};

// 3. 點擊與設定杯象 (移除 checkCompFuPoemWarn 呼叫)
window.setCompFuCupVal = function (idx, val, btnElem) {
    const group = document.getElementById(`cfu-row-group-${idx}`);
    if (!group || group.dataset.locked === 'true') return;

    group.querySelectorAll('.res-btn').forEach(b => b.classList.remove('active-saint', 'active-laugh', 'active-close'));
    const resDisp = document.getElementById(`cfu-row-res-${idx}`);

    if (val === 1) btnElem.classList.add('active-saint');
    else if (val === 0) btnElem.classList.add('active-laugh');
    else btnElem.classList.add('active-close');
    resDisp.innerHTML = window.generateCupHtml(val, 24, 12);
    compFuTempCups[idx] = val;

    group.dataset.locked = 'true';
    group.querySelectorAll('.res-btn').forEach(b => { if (b !== btnElem) b.classList.add('locked-btn'); });

    document.getElementById(`cfu-auto-btn-${idx}`).style.display = 'none';
    document.getElementById(`cfu-reset-btn-${idx}`).style.display = 'block';
};

// 4. 重置杯象 (移除 checkCompFuPoemWarn 呼叫，補上 window.showConfirm)
window.resetCompFuCupRow = async function (idx) {
    if (!(await window.showConfirm("這樣會回復結果，是否確定？"))) return;
    const group = document.getElementById(`cfu-row-group-${idx}`);
    if (!group) return;

    group.dataset.locked = 'false';
    group.querySelectorAll('.res-btn').forEach(b => { b.classList.remove('active-saint', 'active-laugh', 'active-close', 'locked-btn'); });

    document.getElementById(`cfu-row-res-${idx}`).innerHTML = '-';
    compFuTempCups[idx] = null;

    document.getElementById(`cfu-auto-btn-${idx}`).style.display = 'block';
    document.getElementById(`cfu-reset-btn-${idx}`).style.display = 'none';
};


// ==========================================
// ★ 拖曳排序管理系統
// ==========================================
window.openSortDeitiesPage = function () {
    goTo('sort-deities'); // 切換到排序頁面
    const listEl = document.getElementById('sortable-deities-list');
    listEl.innerHTML = '';

    // 抓取目前最新的排序
    const currentDeities = getOrderedDeities();

    // 產生清單 HTML
    currentDeities.forEach(d => {
        const item = document.createElement('div');
        item.className = 'sortable-item';
        item.dataset.id = d.id; // ★ 將神明 ID 綁定在 HTML 上，存檔時會用到
        item.innerHTML = `
            <div style="display:flex; align-items:center;">
                <span style="font-size:1.8rem; margin-right:12px;">${d.iconType === 'emoji' ? d.iconVal : '⛩️'}</span>
                <div>
                    <div style="font-size:1.1rem; font-weight:bold;">${d.name}</div>
                    <div style="font-size:0.8rem; color:#888;">${d.temple || '系統神明'}</div>
                </div>
            </div>
            <div class="drag-handle">☰</div>
        `;
        listEl.appendChild(item);
    });

    // 啟動 SortableJS 拖曳引擎
    if (window.deitySortable) window.deitySortable.destroy(); // 避免重複綁定
    window.deitySortable = new Sortable(listEl, {
        handle: '.drag-handle', // 只有按住 ☰ 才能拖，避免誤觸
        animation: 200,         // 拖曳時的滑順動畫 (200毫秒)
        ghostClass: 'sortable-ghost'
    });
};

window.saveDeitiesOrder = function () {
    const listEl = document.getElementById('sortable-deities-list');
    // 掃描畫面上目前由上到下的順序，把神明 ID 抓出來變成陣列
    const newOrder = Array.from(listEl.children).map(item => item.dataset.id);

    // 存入 LocalStorage
    localStorage.setItem('zb_deities_order', JSON.stringify(newOrder));

    if (typeof showToast === 'function') showToast('✅ 順序已儲存！');

    // 延遲 0.5 秒後直接重新整理網頁，確保首頁用最新的順序乾淨地重新畫出來
    setTimeout(() => {
        location.reload();
    }, 500);
};

// 🌟 新增：雲端圖片背景下載與轉存工人
window.downloadAndCacheCloudImage = async function (deityId, url) {
    try {
        // 去 Firebase Storage 把圖片抓下來
        const response = await fetch(url);
        if (!response.ok) throw new Error("下載失敗");

        const blob = await response.blob();
        const reader = new FileReader();

        reader.onloadend = function () {
            const base64data = reader.result;
            // 1. 存進 LocalStorage，下次打開 App 瞬間就能讀到 (第一優先)
            try {
                localStorage.setItem(`custom_deity_img_${deityId}`, base64data);
            } catch (e) { console.warn("圖片太大，LocalStorage 存不下"); }

            // 2. 找到畫面上的佔位符號，瞬間替換成圖片
            const targetEl = document.getElementById(`cloud-img-target-${deityId}`);
            if (targetEl) {
                targetEl.innerHTML = `
                    <img src="${base64data}" 
                         style="width:40px; height:40px; border-radius:50%; object-fit:cover; margin-bottom:5px; border: 1px solid var(--accent); animation: fadeIn 0.5s;">`;
            }
        }
        reader.readAsDataURL(blob); // 轉成 Base64
    } catch (error) {
        console.error("無法下載雲端聖像:", error);
    }
};

window.saveImageOnly = function () {
    // 假設您正在編輯的是籤詩圖片
    if (window.AppState && AppState.editor.poemImg) {
        // ...執行您的資料庫寫入邏輯...

        // 顯示成功提示而不切換頁面
        showToast("💾 圖片儲存成功！");

        // 清除暫存顯示
        AppState.editor.poemImg = null;
    } else {
        showToast("⚠️ 尚未選擇任何新圖片");
    }
};

// 當小視窗開啟時，在歷史紀錄推入一層，並「帶上當前的頁面名稱」
window.fixModalBackBehavior = function (isOpen) {
    if (isOpen) {
        // 抓出現在是在哪一個頁面 (例如 'simple' 或 'compare')
        const activePage = document.querySelector('.page.active');
        const currentPage = activePage ? activePage.id.replace('page-', '') : 'home';

        // 推入狀態時，順便把 page 帶進去，這樣 app.js 就不會迷路跳回首頁
        window.history.pushState({ page: currentPage, modalOpen: true }, "");
    } else {
        // 關閉視窗時，如果當前是我們推入的狀態，就退回一步
        if (window.history.state && window.history.state.modalOpen) {
            window.history.back();
        }
    }
};

// 在自訂神明儲存函數
window.saveCustomDeity = function (isPermanent) {
    const name = document.getElementById('edit-deity-name').value.trim();
    const sysId = document.getElementById('edit-deity-system').value;
    const saintTarget = document.getElementById('edit-deity-saint-target').value || 3;

    if (!name) return showToast("⚠️ 請輸入神明聖號");

    // 建立新物件 (isTemp 決定祂會不會出現在管理清單)
    const newObj = {
        id: 'd_temp_' + Date.now(),
        name: name,
        sysId: sysId,
        saintTarget: parseInt(saintTarget),
        isTemp: !isPermanent,
        iconType: 'emoji',
        iconVal: '🙏'
    };

    //AppState.data.deities.push(newObj);
    //localStorage.setItem('zb_deities', JSON.stringify(AppState.data.deities));
    try {
        localStorage.setItem('zb_deities', JSON.stringify(AppState.data.deities));
    } catch (e) {
        showToast("⚠️ 圖片可能太大導致存檔失敗，請移除部分自訂圖片或壓縮後再試。");
        // 復原剛剛 push 進去的資料避免記憶體與 localStorage 狀態不一致
        AppState.data.deities.pop();
    }
    showToast(isPermanent ? "✅ 已列入神明列位！" : "✅ 臨時神明設定完成！");

    const tool = window.currentDeityTool;

    // 退回上一頁
    goBack();

    // 等待動畫結束後，將神明套用到剛才的工具中
    setTimeout(() => {
        if (tool === 'qiuqian') {
            startDeityQiuqian(newObj.id);
        } else if (tool === 'simple' || tool === 'compare' || tool === 'manual') {
            const selectEl = document.getElementById(`${tool}-deity-sel`) || document.getElementById('manual-selected-deity-id');
            if (selectEl) {
                // 如果是下拉選單，先動態補上這個選項
                if (selectEl.tagName === 'SELECT') {
                    selectEl.innerHTML += `<option value="${newObj.id}">${newObj.name}</option>`;
                }
                selectEl.value = newObj.id;
                selectEl.dispatchEvent(new Event('change'));
            }

            // 針對手動新增的介面更新
            if (tool === 'manual') {
                document.getElementById('btn-manual-name').innerText = newObj.name;
                document.getElementById('btn-manual-icon').innerHTML = "🙏";
            }
        }
    }, 150);
};

// ==========================================
// ★ 快速新增神明小視窗邏輯
// ==========================================
window.openQuickAddModal = function (toolId) {
    const deityModal = document.getElementById('deity-select-modal');

    // 1. 智慧判斷：檢查背後是否有「九宮格視窗」是開著的？
    if (deityModal && deityModal.style.display === 'flex') {
        // 如果有，隱藏它。因為九宮格已經幫我們產生過「假紀錄」了，共用即可。
        deityModal.style.display = 'none';
    } else {
        // 如果沒有 (代表是從神明求籤頁面直接點擊的)，我們就要主動產生「假紀錄」保護返回鍵！
        if (typeof fixModalBackBehavior === 'function') {
            fixModalBackBehavior(true);
        }
    }

    // 2. 記錄是從哪裡來的，並重置欄位
    window.currentDeityTool = toolId;
    document.getElementById('quick-deity-name').value = '';
    document.getElementById('quick-deity-saint-target').value = 3;

    // 3. 載入系統選單
    const sel = document.getElementById('quick-deity-system');
    sel.innerHTML = '<option value="">無 (不綁定系統)</option>';
    if (window.AppState && AppState.data.poemSystems) {
        Object.values(AppState.data.poemSystems).forEach(s => {
            sel.innerHTML += `<option value="${s.id}">${s.name}</option>`;
        });
    }

    // 4. 顯示快速新增視窗
    document.getElementById('quick-add-deity-modal').style.display = 'flex';
};

window.closeQuickAddModal = function () {
    const modal = document.getElementById('quick-add-deity-modal');
    // 如果有歷史紀錄，呼叫返回鍵，讓 popstate 去關閉它
    if (window.history.state && window.history.state.modalOpen) {
        window.history.back();
    } else {
        if (modal) modal.style.display = 'none';
    }
};

window.saveQuickAddDeity = function (isPermanent) {
    const name = document.getElementById('quick-deity-name').value.trim();
    const sysId = document.getElementById('quick-deity-system').value;
    const saintTarget = document.getElementById('quick-deity-saint-target').value || 3;

    if (!name) return showToast("⚠️ 請輸入神明聖號");

    // 1. 建立新神明物件 (根據 isPermanent 決定是否為臨時)
    const newObj = {
        id: (isPermanent ? 'd_' : 'd_temp_') + Date.now(),
        name: name,
        sysId: sysId,
        saintTarget: parseInt(saintTarget),
        isTemp: !isPermanent,  // 👈 完美繼承雙軌制邏輯
        iconType: 'emoji',
        iconVal: '🙏'
    };

    // 2. 存入資料庫
    //AppState.data.deities.push(newObj);
    //localStorage.setItem('zb_deities', JSON.stringify(AppState.data.deities));
    try {
        localStorage.setItem('zb_deities', JSON.stringify(AppState.data.deities));
    } catch (e) {
        showToast("⚠️ 圖片可能太大導致存檔失敗，請移除部分自訂圖片或壓縮後再試。");
        // 復原剛剛 push 進去的資料避免記憶體與 localStorage 狀態不一致
        AppState.data.deities.pop();
    }
    showToast(isPermanent ? "✅ 已成功加入神明列位！" : "✅ 臨時神明設定完成！");

    const tool = window.currentDeityTool;

    // 3. 關閉小視窗
    closeQuickAddModal();

    // 4. ✨ 核心魔法：自動帶入神明聖號 ✨
    // 延遲 150 毫秒，等小視窗關閉動畫跑完後執行
    setTimeout(() => {
        if (tool === 'qiuqian') {
            startDeityQiuqian(newObj.id);
        } else if (tool === 'simple' || tool === 'compare' || tool === 'manual') {
            // 找到背後那個被隱藏的下拉選單
            const selectEl = document.getElementById(`${tool}-deity-sel`) || document.getElementById('manual-selected-deity-id');
            if (selectEl) {
                // 如果是下拉選單，我們「動態」幫它增加一個 <option>，這樣它才認識這尊新神明
                if (selectEl.tagName === 'SELECT') {
                    selectEl.innerHTML += `<option value="${newObj.id}">${newObj.name}</option>`;
                }
                // 將選單的值設定為新神明的 ID
                selectEl.value = newObj.id;
                // 主動發送 'change' 事件，觸發 handleDeityChangeForTools() 去更新畫面上的大按鈕！
                selectEl.dispatchEvent(new Event('change'));
            }

            // 手動新增紀錄頁面的特殊處理
            if (tool === 'manual') {
                document.getElementById('btn-manual-name').innerText = newObj.name;
                document.getElementById('btn-manual-icon').innerHTML = "🙏";
            }
        }
    }, 150);
};

// ==========================================
// 1. 初始化與切換介面
// ==========================================
window.openManualAdd = function () {
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    document.getElementById('manual-date').value = localDateTime;
    window.switchManualType('normal');
    goTo('manual-add');
};

window.switchManualType = function (type) {
    const btns = ['normal', 'deity', 'ask', 'compare'];
    btns.forEach(b => {
        const el = document.getElementById(`btn-manual-${b}`);
        if (el) { el.style.background = 'transparent'; el.style.borderColor = '#555'; el.style.color = '#ccc'; }
    });

    const activeBtn = document.getElementById(`btn-manual-${type}`);
    if (activeBtn) { activeBtn.style.background = 'var(--primary)'; activeBtn.style.borderColor = 'var(--primary)'; activeBtn.style.color = '#fff'; }

    // 隱藏所有區塊
    ['manual-normal-area', 'manual-deity-area', 'manual-basic-area', 'manual-ask-area', 'manual-compare-area'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    const typeInput = document.getElementById('manual-type');

    if (type === 'normal') {
        typeInput.value = '一般求籤';
        document.getElementById('manual-normal-area').style.display = 'block';
        document.getElementById('manual-basic-area').style.display = 'block';
    } else if (type === 'deity') {
        typeInput.value = '神明求籤';
        document.getElementById('manual-deity-area').style.display = 'block';
        document.getElementById('manual-basic-area').style.display = 'block';
    } else if (type === 'ask') {
        typeInput.value = '問事擲筊';
        document.getElementById('manual-deity-area').style.display = 'block'; // 問事也支援選神明
        document.getElementById('manual-ask-area').style.display = 'block';
    } else if (type === 'compare') {
        typeInput.value = '比較擲筊';
        document.getElementById('manual-deity-area').style.display = 'block'; // 比較也支援選神明
        document.getElementById('manual-compare-area').style.display = 'block';

        // 預設塞入兩個「不可刪除」的選項
        const compRows = document.getElementById('manual-comp-rows');
        if (compRows && compRows.innerHTML.trim() === '') {
            window.addManualCompRow('選項 1', false);
            window.addManualCompRow('選項 2', false);
        }
    }
};

// ==========================================
// 2. 比較擲筊：極致壓縮的同行項目列
// ==========================================
window.addManualCompRow = function (placeholder = "項目名稱", isDeletable = true) {
    const container = document.getElementById('manual-comp-rows');
    const row = document.createElement('div');
    row.className = "manual-comp-item";

    // ✨ 加入 position:relative 讓小紅點可以懸浮，並稍微加大上方的 padding
    row.style.cssText = "position:relative; display:flex; gap:4px; align-items:center; background:#111; padding:12px 6px 8px 6px; border-radius:6px; border:1px solid #333; margin-bottom:10px;";

    // ✨ 精緻的紅色懸浮 X 按鈕
    const delBtn = isDeletable ? `<button type="button" onclick="this.parentElement.remove()" style="position:absolute; top:-6px; right:-6px; background:#f44336; color:#fff; border:none; border-radius:50%; width:20px; height:20px; font-size:12px; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.5); z-index:2; padding:0;">✕</button>` : '';

    row.innerHTML = `
        ${delBtn}
        <input type="text" class="mc-name" placeholder="${placeholder}" style="flex:1; padding:6px; margin:0; border:1px solid #444; background:#222; color:#fff; font-size:0.85rem; min-width:60px;">
        <span style="color:#ffb300; font-size:0.8rem; font-weight:bold;">聖</span>
        <input type="number" class="mc-s" value="0" min="0" style="width:32px; padding:4px 2px; text-align:center; background:#222; border:1px solid #555; color:#fff; border-radius:4px;">
        <span style="color:#ddd; font-size:0.8rem; font-weight:bold;">笑</span>
        <input type="number" class="mc-l" value="0" min="0" style="width:32px; padding:4px 2px; text-align:center; background:#222; border:1px solid #555; color:#fff; border-radius:4px;">
        <span style="color:#888; font-size:0.8rem; font-weight:bold;">蓋</span>
        <input type="number" class="mc-c" value="0" min="0" style="width:32px; padding:4px 2px; text-align:center; background:#222; border:1px solid #555; color:#fff; border-radius:4px;">
    `;
    container.appendChild(row);
};

// ==========================================
// 3. 儲存與嚴格防呆邏輯
// ==========================================
window.saveManualRecord = function () {
    const typeBase = document.getElementById('manual-type').value;

    // ✨ 日期防呆：如果沒填，就抓取按下儲存這一瞬間的時間
    const rawDate = document.getElementById('manual-date').value;
    const finalDate = rawDate ? new Date(rawDate).toLocaleString() : new Date().toLocaleString();

    const note = document.getElementById('manual-note').value.trim();

    // 🌟 核心修復：抓取共用的「歸屬神明」 (改用最穩定的 getOrderedDeities 或 window.deities)
    let selectedDeityName = "";
    const deityIdEl = document.getElementById('manual-selected-deity-id');
    const deityId = deityIdEl ? deityIdEl.value : '';

    if (deityId && deityId !== 'none') {
        const currentDeities = typeof window.getOrderedDeities === 'function' ? window.getOrderedDeities() : (window.deities || []);
        const d = currentDeities.find(x => x.id === deityId);
        if (d) selectedDeityName = d.name;
    }

    let finalTypeStr = typeBase;
    let finalLot = '-';
    let finalSubject = '';
    let finalFollowUps = [];
    let finalCompareData = null;

    // 🛑 【一般求籤】防呆：必須輸入籤號
    if (typeBase === '一般求籤') {
        const customName = document.getElementById('manual-normal-deity').value.trim();
        finalTypeStr = customName ? `${customName} (一般)` : '一般求籤';
        finalLot = document.getElementById('manual-lot').value || '-';
        finalSubject = document.getElementById('manual-subject').value.trim();

        if (finalLot === '-') return showToast("⚠️ 一般求籤請務必輸入「籤號」！");
    }
    // 🛑 【神明求籤】防呆：必須選神明、必須輸入籤號
    else if (typeBase === '神明求籤') {
        if (!selectedDeityName) return showToast("⚠️ 神明求籤請務必選擇「神明」！");
        finalTypeStr = selectedDeityName;
        finalLot = document.getElementById('manual-lot').value || '-';
        finalSubject = document.getElementById('manual-subject').value.trim();

        if (finalLot === '-') return showToast("⚠️ 神明求籤請務必輸入「籤號」！");
    }
    // 🛑 【問事擲筊】防呆：必須輸入問事內容、杯數至少1個
    else if (typeBase === '問事擲筊') {
        finalTypeStr = selectedDeityName ? `${selectedDeityName} (問事)` : '問事 (問事)';
        const q = document.getElementById('manual-ask-q').value.trim();
        const lot = document.getElementById('manual-ask-lot').value || '-';

        if (!q) return showToast("⚠️ 問事擲筊請務必輸入「問事內容」！");

        const s = parseInt(document.getElementById('manual-ask-s').value) || 0;
        const l = parseInt(document.getElementById('manual-ask-l').value) || 0;
        const c = parseInt(document.getElementById('manual-ask-c').value) || 0;

        if (s + l + c === 0) return showToast("⚠️ 請至少輸入一次擲筊的杯數！");

        finalSubject = "手動問事紀錄";
        let questionText = q;
        if (lot !== '-') questionText += ` [求得 第 ${lot} 籤]`;

        let simulatedDetails = [];
        for (let i = 0; i < s; i++) simulatedDetails.push(1);
        for (let i = 0; i < l; i++) simulatedDetails.push(0);
        for (let i = 0; i < c; i++) simulatedDetails.push(-1);

        finalFollowUps = [{ question: questionText, result: `${s}聖 ${l}笑 ${c}蓋`, details: simulatedDetails }];
    }
    // 🛑 【比較擲筊】防呆：必須至少有1個選項名稱、杯數至少1個
    else if (typeBase === '比較擲筊') {
        finalTypeStr = selectedDeityName ? `${selectedDeityName} (比較)` : '比較擲筊 (比較)';
        finalSubject = document.getElementById('manual-comp-subject').value.trim() || "手動比較紀錄";
        const lot = document.getElementById('manual-comp-lot') ? document.getElementById('manual-comp-lot').value : '-';

        const items = document.querySelectorAll('.manual-comp-item');
        let compareStr = "【手動比較結果】\n";
        let hasCups = false;
        let hasValidOption = false;

        items.forEach(item => {
            const name = item.querySelector('.mc-name').value.trim();
            if (name) hasValidOption = true;
            const optName = name || "未命名選項";

            const s = parseInt(item.querySelector('.mc-s').value) || 0;
            const l = parseInt(item.querySelector('.mc-l').value) || 0;
            const c = parseInt(item.querySelector('.mc-c').value) || 0;

            if (s + l + c > 0) hasCups = true;

            let logs = "";
            for (let i = 0; i < s; i++) logs += "聖 ";
            for (let i = 0; i < l; i++) logs += "笑 ";
            for (let i = 0; i < c; i++) logs += "蓋 ";
            compareStr += `${optName}: ${s}聖 (${logs.trim()})\n`;
        });

        if (!hasValidOption) return showToast("⚠️ 比較擲筊請至少輸入一個「選項名稱」！");
        if (!hasCups) return showToast("⚠️ 比較項目中，請至少輸入一次擲筊結果！");

        if (lot !== '-') {
            const ls = parseInt(document.getElementById('manual-comp-lot-s') ? document.getElementById('manual-comp-lot-s').value : 0) || 0;
            const ll = parseInt(document.getElementById('manual-comp-lot-l') ? document.getElementById('manual-comp-lot-l').value : 0) || 0;
            const lc = parseInt(document.getElementById('manual-comp-lot-c') ? document.getElementById('manual-comp-lot-c').value : 0) || 0;
            compareStr += `\n🎯 最終決定求得：第 ${lot} 籤`;
            if (ls + ll + lc > 0) {
                compareStr += ` (${ls}聖 ${ll}笑 ${lc}蓋)`;
            }
        }

        finalCompareData = compareStr;
    }

    // --- 組合與儲存 ---
    const rec = {
        id: Date.now(),
        date: finalDate,
        type: finalTypeStr,
        lot: finalLot,
        subject: finalSubject,
        note: note,
        followUps: finalFollowUps
    };

    if (finalCompareData) rec.compareData = finalCompareData;
    window.Database.saveRecord(rec);
    showToast("✅ 紀錄已手動新增！");
    goTo('records');
};

window.enforceCupModeLogic = function (isUserClick = false) {
    const radioImage = document.getElementById('radio-mode-image');
    const radioText = document.getElementById('radio-mode-text');
    if (!radioImage || !radioText) return;

    // 檢查有沒有上傳任何圖片
    const hasSaint = localStorage.getItem('zb_cup_saint');
    const hasLaugh = localStorage.getItem('zb_cup_laugh');
    const hasCovered = localStorage.getItem('zb_cup_covered');
    const hasAnyImage = hasSaint || hasLaugh || hasCovered;

    if (!hasAnyImage) {
        // 如果沒有圖片，強制跳回陰刻文字
        if (radioImage.checked) {
            radioText.checked = true;

            // 🌟 只有使用者主動點擊時，才跳出提示
            if (isUserClick) {
                if (typeof showToast === 'function') {
                    showToast("⚠️ 未偵測到自訂圖片，已自動切換回陰刻文字");
                }
            }
            if (typeof saveSettings === 'function') saveSettings();
        }
    } else {
        // 如果有圖片且使用者選了圖片模式，儲存設定
        if (radioImage.checked) {
            if (typeof saveSettings === 'function') saveSettings();
        }
    }
};

// --- 🌟 神明聖像分屏魔法 🌟 ---
const step2ImgContainer = document.getElementById('step2-deity-img-container');
const step2Img = document.getElementById('step2-deity-img');
// 判斷：如果有選神明，且 emoji 欄位裡面裝的是 Base64 照片 (開頭是 data:image)
if (window.currentDeity && window.currentDeity.emoji && window.currentDeity.emoji.startsWith('data:image')) {
    if (step2Img) step2Img.src = window.currentDeity.emoji;
    if (step2ImgContainer) step2ImgContainer.style.display = 'flex';
} else {
    // 沒照片或只是一般 Emoji，就維持原本排版
    if (step2ImgContainer) step2ImgContainer.style.display = 'none'; // 🛡️ 加上 if 保護，抓不到就不做事，絕不當機！
}

// 全能重置函數：還原「啟動、過場、結果」所有相關設定
window.resetAllAnimationSettings = async function () {
    const confirmed = await window.showConfirm(
        "確定要將所有「啟動遮罩」、「擲筊過場」與「結果停留」的圖片與秒數全部還原為預設嗎？",
        "重置所有動畫設定"
    );

    if (!confirmed) return;

    // 1. 定義所有相關的 Storage Keys
    const keysToRemove = [
        // 啟動體驗
        'cfg_show_splash', 'custom_splash_logo', 'cfg_splash_duration',
        // 擲筊過場
        'custom_cup_ready', 'custom_cup_throw', 'cup_time_ready', 'cup_time_throw',
        // 結果停留
        'cup_result_type', 'cup_time_result_sec'
    ];

    // 2. 執行清理
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // 3. 顯示成功訊息並重新載入
    // 因為這類全域設定涉及多個變數初始化，直接 reload 是最乾淨且保險的做法
    if (typeof window.showToast === 'function') {
        window.showToast("🔄 已還原為系統預設值，正在重新載入...");
    }

    setTimeout(() => {
        location.reload();
    }, 1200);
};

// 處理啟動雙階段圖示上傳
window.handleSplashUpload = function (event, phase) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
        window.showToast("⚠️ 檔案較大，建議使用 1MB 以下的 GIF 以確保順暢");
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const base64 = e.target.result;
        const storageKey = phase === 'start' ? 'custom_splash_logo_start' : 'custom_splash_logo_end';
        const previewId = phase === 'start' ? 'prev-splash-start' : 'prev-splash-end';

        localStorage.setItem(storageKey, base64);
        const prev = document.getElementById(previewId);
        if (prev) prev.innerHTML = `<img src="${base64}" style="max-height:100%; max-width:100%; object-fit:contain;">`;
        window.showToast(`✅ ${phase === 'start' ? '掛載中' : '開幕'}圖示已更新`);
    };
    reader.readAsDataURL(file);
};

// ==========================================
// 🚀 動畫設定還原引擎 (拆分版)
// ==========================================
// 1. 僅還原所有自訂圖片 (GIF/Base64)
window.resetAnimImagesOnly = async function () {
    if (!(await window.showConfirm("確定要清除所有自訂的啟動圖示與擲筊動畫圖片嗎？", "還原圖案預設"))) return;

    const imgKeys = [
        'custom_splash_logo_start',
        'custom_splash_logo_end',
        'custom_cup_ready',
        'custom_cup_throw'
    ];
    imgKeys.forEach(k => localStorage.removeItem(k));

    if (typeof window.showToast === 'function') {
        window.showToast("🖼️ 圖片已恢復預設，重新整理中...");
    }
    // 重新整理頁面以徹底套用變更
    setTimeout(() => location.reload(), 1000);
};

// 2. 僅還原所有時間設定 (秒數)
window.resetDurationsOnly = async function () {
    if (!(await window.showConfirm("確定要將所有啟動停留、動畫播放與結果停留的秒數恢復為預設嗎？", "還原秒數預設"))) return;

    const timeKeys = [
        'cfg_splash_dur_start',
        'cfg_splash_dur_end',
        'cup_time_ready',
        'cup_time_throw',
        'cup_time_result_sec',
        'cup_result_type'
    ];
    timeKeys.forEach(k => localStorage.removeItem(k));

    if (typeof window.showToast === 'function') {
        window.showToast("⏱️ 秒數已恢復預設，重新整理中...");
    }
    // 重新整理頁面以徹底套用變更
    setTimeout(() => location.reload(), 1000);
};

document.addEventListener('DOMContentLoaded', function () {

    // ==========================================
    // 📏 0. 真實視窗高度鎖定 (解決手機網址列縮放跳動)
    // ==========================================
    function lockViewportHeight() {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    lockViewportHeight(); // 初始化執行
    window.addEventListener('resize', () => {
        // 鍵盤彈出時不重算高度，避免衝突
        if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) return;
        requestAnimationFrame(lockViewportHeight);
    });

    // ==========================================
    // ⚙️ 2. 系統核心與路由初始化
    // ==========================================
    if (typeof initAll === 'function') {
        initAll();
    }

    if (window.location.hash) {
        const page = window.location.hash.substring(1);
        if (page === 'qiuqian' || page === 'simple' || page === 'compare') {
            window.history.replaceState({ page: 'home' }, '', '#home');
            if (typeof renderPage === 'function') renderPage('home');
        } else if (page !== 'home') {
            window.history.replaceState({ page: 'home' }, '', '#home');
            window.history.pushState({ page: page }, '', '#' + page);
            if (typeof renderPage === 'function') renderPage(page);
        } else {
            window.history.replaceState({ page: 'home' }, '', '#home');
            if (typeof renderPage === 'function') renderPage('home');
        }
    } else {
        window.history.replaceState({ page: 'home' }, '', '#home');
        if (typeof renderPage === 'function') renderPage('home');
    }

    if (typeof window.startRealTimeSync === 'function') {
        window.startRealTimeSync((latestRecords) => {
            records = latestRecords;
            localStorage.setItem('zb_records_v3', JSON.stringify(records));
            const activePage = document.querySelector('.page.active');
            if (activePage && activePage.id === 'page-records') {
                if (typeof renderRecords === 'function') renderRecords();
            }
        });
    }

    // ==========================================
    // 🖱️ 3. UI 事件綁定 (搜尋框防抖與紀錄列表事件代理)
    // ==========================================
    const searchInput = document.getElementById('globalPoemSearch');
    if (searchInput && typeof window.debounce === 'function') {
        searchInput.addEventListener('input', window.debounce(window.searchGlobalPoems, 300));
    }

    const recordsContainer = document.getElementById('records-container');
    if (recordsContainer) {
        recordsContainer.addEventListener('click', function (e) {
            const editBtn = e.target.closest('.edit-record-btn');
            if (editBtn) {
                const recordId = editBtn.getAttribute('data-id');
                if (typeof window.openHistoryEditModal === 'function') {
                    window.openHistoryEditModal(recordId);
                }
            }
        });
    }

    // ==========================================
    // 📱 4. 現代化視覺區域監聽 (Visual Viewport API)
    // ==========================================
    if (window.visualViewport) {
        const viewport = window.visualViewport;
        document.body.style.transition = 'padding-bottom 0.3s ease';

        viewport.addEventListener('resize', () => {
            const keyboardHeight = window.innerHeight - viewport.height;
            if (keyboardHeight > 150) {
                document.body.style.paddingBottom = `${keyboardHeight}px`;
                const activeElement = document.activeElement;
                if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
                    let container = activeElement.closest('.step-box') ||
                        activeElement.closest('.detail-section') ||
                        activeElement.closest('.form-group') ||
                        activeElement.closest('.modal-content') ||
                        activeElement.parentElement;
                    if (container) {
                        setTimeout(() => {
                            container.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 100);
                    }
                }
            } else {
                document.body.style.paddingBottom = '0px';
                window.scrollTo({ top: window.scrollY, behavior: 'smooth' });
            }
        });
    } else {
        console.warn('您的瀏覽器不支援 VisualViewport API');
    }

    // ==========================================
    // ⌨️ 5. Step-1 手機虛擬鍵盤擠壓聖像優化 (已改用 CSS 彈性高度取代，故停用)
    // ==========================================
    /*
    const deityHeader = document.getElementById('step1-deity-header');
    const inputIds = ['input-normal-deity', 'input-qiuqian-subject-step1'];

    inputIds.forEach(id => {
        const inputEl = document.getElementById(id);
        if (inputEl) {
            inputEl.addEventListener('focus', () => {
                if (deityHeader) deityHeader.style.display = 'none'; 
            });
            inputEl.addEventListener('blur', () => {
                setTimeout(() => {
                    if (deityHeader) deityHeader.style.display = 'flex'; 
                }, 150);
            });
        }
    });
    */

    // ==========================================
    // 🌟 6. 智能捲動按鈕控制邏輯 (Main 與 Step4 完美融合版)
    // ==========================================
    const mainContainer = document.querySelector('main');
    const btnUp = document.getElementById('btn-scroll-up');
    const btnDown = document.getElementById('btn-scroll-down');
    const step4 = document.getElementById('step-4');

    if (btnUp && btnDown) {
        let idleTimer; // 共用的靜置隱藏計時器

        // --- A. 共用的點擊事件 (自動判斷現在該滾動誰) ---
        window.handleSmartScroll = function (direction) {
            const isStep4Active = step4 && step4.style.display !== 'none';
            // 如果 Step 4 開啟，就滾動 Step 4；否則滾動全域 Main
            const targetContainer = isStep4Active ? step4 : mainContainer;
            const scrollAmount = isStep4Active ? targetContainer.clientHeight * 0.6 : targetContainer.clientHeight * 0.8;

            if (direction === 'up') {
                targetContainer.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                targetContainer.scrollBy({ top: scrollAmount, behavior: 'smooth' });
            }
        };

        // --- B. 檢查捲動位置的邏輯 ---
        function checkScrollPosition(container) {
            if (!container) return;
            const scrollTop = container.scrollTop;
            const scrollHeight = container.scrollHeight;
            const clientHeight = container.clientHeight;

            // 內容不足以捲動時，隱藏按鈕
            if (scrollHeight <= clientHeight + 10) {
                btnUp.classList.remove('show');
                btnDown.classList.remove('show');
                return;
            }

            const isAtBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight - 20;
            const isPastHalfPage = scrollTop > clientHeight * 0.5;

            // 🔝 向上按鈕：滑過半頁顯示
            if (isPastHalfPage) btnUp.classList.add('show');
            else btnUp.classList.remove('show');

            // ⏬ 向下按鈕：還沒到底部就顯示
            if (!isAtBottom) btnDown.classList.add('show');
            else btnDown.classList.remove('show');
        }

        // --- C. 綁定滾動事件與靜置隱藏 ---
        function attachScrollEvent(container) {
            if (!container) return;
            container.addEventListener('scroll', () => {
                checkScrollPosition(container);
                window.clearTimeout(idleTimer);
                // 1.5 秒後自動隱藏按鈕
                idleTimer = setTimeout(() => {
                    btnUp.classList.remove('show');
                    btnDown.classList.remove('show');
                }, 1500);
            });
        }

        // 同時監聽 Main 和 Step 4
        attachScrollEvent(mainContainer);
        attachScrollEvent(step4);

        // --- D. 畫面切換時的觀察器 ---
        if (mainContainer) {
            new MutationObserver(() => {
                const isStep4Active = step4 && step4.style.display !== 'none';
                setTimeout(() => checkScrollPosition(isStep4Active ? step4 : mainContainer), 300);
            }).observe(mainContainer, { childList: true, subtree: true });
        }

        if (step4) {
            new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.attributeName === 'style') {
                        if (step4.style.display !== 'none') {
                            // Step 4 打開時
                            setTimeout(() => checkScrollPosition(step4), 500);
                        } else {
                            // Step 4 關閉時
                            btnUp.classList.remove('show');
                            btnDown.classList.remove('show');
                            
                            // 👇 新增這段：自動收合備註區塊並恢復按鈕顏色 👇
                            const notes = document.getElementById('qiuqian-notes-container');
                            const notesBtn = document.getElementById('btn-toggle-notes');
                            if (notes) notes.style.display = 'none';
                            if (notesBtn) {
                                notesBtn.style.background = '#333';
                                notesBtn.style.color = '#fff';
                            }
                        }
                    }
                });
            }).observe(step4, { attributes: true });
        }
    }
});

window.goBack = async function () {
    try {
        const activePageEl = document.querySelector('.page.active');
        // 1. 安全檢查：找不到當前頁面則暴力回首頁
        if (!activePageEl) {
            if (typeof window.forceGoHome === 'function') window.forceGoHome();
            else window.location.hash = '#home';
            return;
        }

        const activeId = activePageEl.id; // page-qiuqian
        const activePage = activeId.replace('page-', '');

        // 2. 🌟 智慧型自動存檔與快照比對機制 (核心修正)
        // --------------------------------------------------
        if (activePage.startsWith('settings-') || activePage === 'settings') {
            if (typeof window.saveSettings === 'function') {
                
                // 💡 技巧 A：暫時將 showToast 弄啞（靜音），防止 saveSettings 原始函式內建的提示音爆出
                const originalToast = window.showToast;
                window.showToast = function () {};

                // 執行實際存檔（將 UI 欄位寫入變數並儲存到 LocalStorage）
                window.saveSettings();

                // 恢復原本的 showToast 正常功能
                window.showToast = originalToast;

                // 💡 技巧 B：拿剛剛儲存完的最新設定，與「進入頁面時」的初始快照做字串比對
                const currentSettingsStr = JSON.stringify(typeof settings !== 'undefined' ? settings : {});
                
                if (window.globalSettingsSnapshot && window.globalSettingsSnapshot !== currentSettingsStr) {
                    // 偵測到兩者不一致 -> 代表使用者進來後「真的有改過東西」才跳提示
                    if (typeof window.showToast === 'function') {
                        window.showToast("💾 已成功儲存變更");
                    }
                } else {
                    // 兩者完全一致 -> 代表沒動過任何開關，完全安靜返回
                    console.log("🤫 設定無任何變動，安靜返回不干擾");
                }
            }
        }

        // 3. 🛡️ 防呆攔截區 (求籤、問事、比較中斷邏輯)
        // --------------------------------------------------
        if (activePage === 'qiuqian') {
            // 🌟 修正：加入 typeof 判斷！如果找不到 smartConfirm，就退回使用原生的 confirm()
            if (typeof currentLot !== 'undefined' && currentLot > 0 && !window.isFortuneSaved) {
                const msg = "⚠️ 已抽出籤詩並請示中，確定要放棄並離開嗎？\n(離開後本次結果將不予保留)";
                const confirmed = typeof window.smartConfirm === 'function' ? await window.smartConfirm(msg, "放棄離開") : confirm(msg);
                if (!confirmed) return; 
                
                if (typeof isQiuqianActive !== 'undefined') isQiuqianActive = false;
            } 
            else if (typeof isQiuqianActive !== 'undefined' && isQiuqianActive) {
                const msg = "⚠️ 求籤尚未完成，確定要中斷並離開嗎？";
                const confirmed = typeof window.smartConfirm === 'function' ? await window.smartConfirm(msg, "中斷求籤") : confirm(msg);
                if (!confirmed) return; 
                isQiuqianActive = false;
            }
        }
        else if (activePage === 'simple') {
            const hasSimpleData = (typeof simpleSessionHistory !== 'undefined' && simpleSessionHistory.length > 0) ||
                (typeof simpleTempCups !== 'undefined' && simpleTempCups.some(c => c !== null));
            if (hasSimpleData) {
                const confirmed = await window.smartConfirm("⚠️ 您的「問事對話」尚未儲存，確定要離開嗎？\n(未儲存內容將會遺失)", "中斷問事");
                if (!confirmed) return;
            }
            if (typeof window.resetSimple === 'function') window.resetSimple(true); // 確定離開則大掃除
        }
        else if (activePage === 'compare') {
            const hasCompareData = (typeof compareState !== 'undefined' && compareState.results && compareState.results.length > 0) ||
                (typeof compFuHistory !== 'undefined' && compFuHistory.length > 0);
            if (hasCompareData || (typeof isCompareActive !== 'undefined' && isCompareActive)) {
                const confirmed = await window.smartConfirm("⚠️ 您的「比較擲筊」尚未結束，確定要離開嗎？", "中斷比較");
                if (!confirmed) return;
            }
            if (typeof isCompareActive !== 'undefined') isCompareActive = false;
            if (typeof window.resetCompare === 'function') window.resetCompare(true);
        }

        // 4. 🗺️ 路由地圖 (決定返回哪一頁)
        // --------------------------------------------------
        let targetPage = 'home'; // 預設全部回首頁
        const routeMap = {
            'select-deity': 'home',
            // 'qiuqian': 'select-deity', // 🌟 從求籤返回，已經交給下方動態判斷
            'collection-list': 'collection-menu',
            'collection-view': 'collection-list',
            'edit-single-poem': 'collection-view',
            'record-detail': 'records',
            'manual-add': 'records',
            'manage-deities': 'settings',
            'edit-deity': 'manage-deities',
            'sort-deities': 'select-deity',
            'manage-systems': 'settings',
            'edit-system': 'collection-menu',
            'settings-bg': 'settings',
            'settings-image': 'settings',
            'settings-cup-anim': 'settings',
            'settings-normal': 'settings',
            'settings-mode': 'settings',
            'settings-backup': 'settings',
            'settings-anim': 'settings'
        };

        // ★ 核心修正 1：動態判斷求籤頁面的返回目的地
        if (activePage === 'qiuqian') {
            // 如果是「一般求籤」就回首頁；如果是「神明求籤」就回選神明
            targetPage = (typeof currentMode !== 'undefined' && currentMode === 'normal') ? 'home' : 'select-deity';
        } else if (routeMap[activePage]) {
            targetPage = routeMap[activePage];
        }

        // 5. 🚀 執行導航與歷史紀錄清理
        window.history.replaceState({ page: targetPage }, '', '#' + targetPage);

        // 🌟 核心修復：拔掉 goTo，換回您原本正確的 renderPage 強制渲染！
        if (typeof renderPage === 'function') {
            renderPage(targetPage);
        } else {
            // 回退機制：若沒有 renderPage 則直接跳轉 hash
            window.location.hash = '#' + targetPage;
        }

    } catch (err) {
        console.error("返回邏輯發生異常:", err);
        if (typeof window.forceGoHome === 'function') window.forceGoHome();
    }
};

// ★ 設定頁面的儲存與返回機制
window.saveAndGoBack = function () {
    // 1. 執行儲存邏輯 (如儲存設定)
    if (typeof saveSettings === 'function') saveSettings();

    // 2. 檢查是否有正在編輯的神明頭像並儲存
    if (window.AppState && AppState.editor.imgData && AppState.ui.currentDeity) {
        localStorage.setItem(`custom_deity_img_${AppState.ui.currentDeity.id}`, AppState.editor.imgData);
        // 儲存後清除暫存區
        AppState.editor.imgData = null;
    }

    // 3. 使用系統內建的 Toast 提示
    showToast("✅ 已儲存成功！");

    // 4. 返回上一頁
    setTimeout(() => {
        goBack();
    }, 500); // 稍微延遲 0.5 秒讓使用者看清楚提示

    // 5. 同步更新相關畫面
    if (typeof initCupIcons === 'function') initCupIcons();
};

// ★ 因為核心快照比對已經收納進 goBack 了，此智慧返回函式只需單純呼叫 goBack 即可，絕不打架
window.smartSaveAndBack = function () {
    if (typeof window.goBack === 'function') {
        window.goBack();
    }
};

// ==========================================
    // 🚀 1. 雙階段啟動遮罩控制中心 (3D 廟門升級版)
    // ==========================================
    // 在 DOMContentLoaded 內部找到 splashEl 控制區塊
    const splashEl = document.getElementById('app-splash-screen');
    if (splashEl) {
        const isSoftReload = sessionStorage.getItem('skipSplash') === 'true';
        const showSplash = localStorage.getItem('cfg_show_splash') !== 'false';

        // 如果是軟重載，或者設定關閉動畫，直接拔除遮罩
        if (isSoftReload || !showSplash) {
            splashEl.style.display = 'none';
            sessionStorage.removeItem('skipSplash'); // 用完立刻清除記號
        } else {
            // 取得使用者設定的停留秒數
            const durStart = parseFloat(localStorage.getItem('cfg_splash_dur_start')) || 1.5;

            // 停留指定秒數後，觸發「開廟門」動畫
            setTimeout(() => {
                splashEl.classList.add('doors-opening');
                
                // 等待門完全推開 (配合 CSS 的 1.5s 動畫時間)
                setTimeout(() => {
                    splashEl.style.display = 'none'; // 動畫播完後徹底隱藏，釋放點擊穿透
                }, 1500); 
                
            }, durStart * 1000);
        }
    }
