// ==========================================
// ★ 小視窗編輯引擎 (支援鎖定、快照比對)
// ==========================================
window.currentEditTarget = { type: '', index: -1 };
window.tempEditCups = [];
window.snapshotEditState = "";

// 1. 打開編輯視窗
window.renderSimpleHistory = function () {
    const c = document.getElementById('simple-history-list');
    if (!c) return;
    c.innerHTML = "";
    if (typeof simpleSessionHistory === 'undefined') return;

    simpleSessionHistory.forEach((b, i) => {
        let editBtnHtml = "";
        if (!b.isOnlineDraw) {
            // 🌟 加入 data-html2canvas-ignore="true"
            editBtnHtml = `<button data-html2canvas-ignore="true" onclick="window.openHistoryEditModal('simple', ${i})" style="position:absolute; right:35px; top:10px; background:transparent; border:none; color:#2196F3; font-size:1.1rem; cursor:pointer; padding:0; line-height:1; opacity:0.8;">✏️</button>`;
        }

        let cleanHtml = "";
        if (b.details && b.details.length > 0) {
            cleanHtml = `<div class="res-dots-container" style="margin-top:0;">` +
                b.details.map(v => window.generateCupHtml(v, 24, 12)).join('') +
                `</div>`;
        }
        // 🌟 新增解析時間
        let timeHtml = b.time ? `<span style="margin-left:8px; font-weight:normal;">🕒 ${b.time}</span>` : '';

        c.innerHTML += `
            <div id="record-simple-${i}" class="session-block" style="position: relative;">
                ${editBtnHtml}
                <button data-html2canvas-ignore="true" onclick="window.deleteSimpleSessionItem(${i})" style="position:absolute; right:10px; top:10px; background:transparent; border:none; color:#f44336; font-size:1.1rem; cursor:pointer; padding:0; line-height:1; opacity:0.8;">🗑️</button>
                
                <div style="font-size:0.8rem; color:#888; margin-bottom:5px;">#${i + 1} ${timeHtml}</div>
                <div class="q-text" style="padding-right: 85px; margin-bottom: 6px;">問：${b.question}</div>        
                <div style="display:flex; align-items:center; flex-wrap:wrap; gap:8px;">
                    <div class="a-text" style="margin:0;">答：${b.result}</div>
                    ${cleanHtml ? `<div style="color:#555; font-size:0.9rem;">|</div> <div style="display:flex; align-items:center;">${cleanHtml}</div>` : ''}
                </div>
                
                ${b.poemBtn || ''}
            </div>
        `;
    });
    c.scrollTop = c.scrollHeight;
};

// 2. 關閉視窗
window.closeHistoryEditModal = function () {
    document.getElementById('history-edit-modal').style.display = 'none';
};

// 3. 畫出預設鎖定的筊杯列表
window.renderHistoryEditCups = function () {
    const container = document.getElementById('edit-history-cups-container');
    let htmlString = "";

    window.tempEditCups.forEach((val, i) => {
        let sClass = val === 1 ? 'active-saint' : '';
        let lClass = val === 0 ? 'active-laugh' : '';
        let cClass = val === -1 ? 'active-close' : '';

        // 判斷是否鎖定 (已有值就預設鎖定)
        let isLocked = (val !== null);
        let lockAttr = isLocked ? 'true' : 'false';

        // 🌟 魔法替換：直接呼叫共用函數，一行搞定圖片或文字！
        let resDisp = isLocked ? window.generateCupHtml(val, 24, 12) : '-';

        htmlString += `
            <div class="table-input-row" style="margin-bottom:8px; padding-bottom:8px; align-items:center; display:flex;">
                <div class="table-idx" style="width:45px; font-size:0.85rem; color:#aaa;">第${i + 1}次</div>
                <div class="res-select-group" id="edit-row-group-${i}" data-locked="${lockAttr}" style="flex:1; display:flex;">
                    <div class="res-btn ${sClass} ${isLocked && val !== 1 ? 'locked-btn' : ''}" onclick="window.setHistoryEditCup(${i}, 1, this)">聖</div>
                    <div class="res-btn ${lClass} ${isLocked && val !== 0 ? 'locked-btn' : ''}" onclick="window.setHistoryEditCup(${i}, 0, this)">笑</div>
                    <div class="res-btn ${cClass} ${isLocked && val !== -1 ? 'locked-btn' : ''}" onclick="window.setHistoryEditCup(${i}, -1, this)">蓋</div>
                </div>
                <div class="row-action-col" style="width:50px; margin:0 5px;">
                    <button class="secondary-btn" style="margin:0; padding:4px 0; font-size:0.75rem; width:100%; display:${isLocked ? 'block' : 'none'}; border-color:#f44336; color:#f44336;" onclick="window.resetHistoryEditCup(${i})">↺ 回復</button>
                </div>
                <div class="table-result-col" id="edit-row-res-${i}" style="width:30px; margin:0; padding:0; border:none; display:flex; justify-content:center;">${resDisp}</div>
            </div>
        `;
    });
    container.innerHTML = htmlString;
};

// 4. 設定新杯象並重新鎖定
window.setHistoryEditCup = function (idx, val, btnElem) {
    const group = document.getElementById(`edit-row-group-${idx}`);
    if (!group || group.dataset.locked === 'true') return;

    group.querySelectorAll('.res-btn').forEach(b => b.classList.remove('active-saint', 'active-laugh', 'active-close'));
    const resDisp = document.getElementById(`edit-row-res-${idx}`);

    if (val === 1) btnElem.classList.add('active-saint');
    else if (val === 0) btnElem.classList.add('active-laugh');
    else btnElem.classList.add('active-close');

    // 🌟 魔法替換
    resDisp.innerHTML = window.generateCupHtml(val, 24, 12);

    window.tempEditCups[idx] = val;
    group.dataset.locked = 'true';
    group.querySelectorAll('.res-btn').forEach(b => { if (b !== btnElem) b.classList.add('locked-btn'); });

    group.nextElementSibling.querySelector('.secondary-btn').style.display = 'block';
};

// 5. 解除鎖定
window.resetHistoryEditCup = function (idx) {
    const group = document.getElementById(`edit-row-group-${idx}`);
    group.dataset.locked = 'false';
    group.querySelectorAll('.res-btn').forEach(b => b.classList.remove('active-saint', 'active-laugh', 'active-close', 'locked-btn'));
    document.getElementById(`edit-row-res-${idx}`).innerHTML = '-';
    window.tempEditCups[idx] = null;
    group.nextElementSibling.querySelector('.secondary-btn').style.display = 'none';
};

// 6. 儲存編輯結果
window.saveHistoryEdit = async function () {
    if (window.tempEditCups.includes(null)) {
        if (typeof showToast === 'function') showToast("⚠️ 請完成所有次數的擲筊選擇！");
        return;
    }

    const newQ = document.getElementById('edit-history-q').value.trim();
    if (!newQ) {
        if (typeof showToast === 'function') showToast("⚠️ 問題內容不能為空！");
        return;
    }

    // 快照比對
    const currentStateStr = JSON.stringify({ q: newQ, c: window.tempEditCups });
    if (currentStateStr === window.snapshotEditState) {
        if (typeof showToast === 'function') showToast("無變動");
        window.closeHistoryEditModal();
        return;
    }

    if (await window.showConfirm("內容已修改，確定要儲存變更嗎？", "儲存確認")) {
        let type = window.currentEditTarget.type;
        let index = window.currentEditTarget.index;
        let historyArray = (type === 'simple') ? simpleSessionHistory : compFuHistory;
        let record = historyArray[index];

        // 🌟 核心修復：使用 window.tempEditCups 取代錯誤的 cups
        let saint = window.tempEditCups.filter(v => v === 1).length;
        let laugh = window.tempEditCups.filter(v => v === 0).length;
        let covered = window.tempEditCups.filter(v => v === -1).length;

        let visualHtml = `<div class="res-dots-container" style="margin-top:0;">`;
        visualHtml += window.tempEditCups.map(v => window.generateCupHtml(v, 24, 12)).join('');
        visualHtml += `</div>`;

        let summary = "";
        if (window.tempEditCups.length === 1) summary = saint ? "聖筊" : (laugh ? "笑筊" : "蓋筊");
        else if (laugh === 0 && covered === 0) summary = `${saint}聖筊`;
        else summary = `${saint}聖 ${laugh}笑 ${covered}蓋`;

        // 寫入變更
        record.question = newQ;
        record.details = [...window.tempEditCups];
        record.result = summary;
        record.html = visualHtml;
        record.time = record.time || new Date().toLocaleString(); // 🌟 保留原時間或補上新時間

        window.closeHistoryEditModal();
        if (type === 'simple') window.renderSimpleHistory();
        if (type === 'compFu') window.renderCompFuHistory();

        if (typeof showToast === 'function') showToast("✅ 已成功儲存修改");
    }
};

// ==========================================
// ★ 畫出表列的擲筊按鈕 (純淨問事裝甲版)
// ==========================================
window.renderSimpleCupRows = function () {
    try {
        const container = document.getElementById('simple-cup-rows');
        if (!container) return; // 防呆機制：如果畫面上找不到這個區塊，就安全退出不當機

        const timesInput = document.getElementById('simple-times');
        let times = timesInput ? parseInt(timesInput.value) || 1 : 1;
        if (times < 1) times = 1;

        // 建立對應次數的空陣列，準備記錄結果
        simpleTempCups = new Array(times).fill(null);
        let htmlString = "";
        container.innerHTML = ""; // 清空舊畫面

        // 動態生成擲筊按鈕列
        for (let i = 0; i < times; i++) {
            htmlString += `
                <div class="table-input-row" style="margin-bottom:8px; padding-bottom:8px; align-items:center;">
                    <div class="table-idx" style="width:40px;">第${i + 1}次</div>
                    <div class="res-select-group" id="sim-row-group-${i}" data-locked="false" style="flex:1; display:flex;">
                        <div class="res-btn" onclick="setSimpleCupVal(${i}, 1, this)">聖</div>
                        <div class="res-btn" onclick="setSimpleCupVal(${i}, 0, this)">笑</div>
                        <div class="res-btn" onclick="setSimpleCupVal(${i}, -1, this)">蓋</div>
                    </div>
                    <div class="row-action-col">
                        <button class="secondary-btn" id="sim-auto-btn-${i}" style="margin:0; padding:6px 0; font-size:0.8rem; width:100%; display:flex; align-items:center; justify-content:center;" onclick="autoThrowSimpleRow(${i})">${window.TINY_CUP_ICON} 擲筊</button>
                        <button class="secondary-btn" id="sim-reset-btn-${i}" style="margin:0; padding:6px 0; font-size:0.8rem; width:100%; display:none; border-color:#f44336; color:#f44336;" onclick="resetSimpleCupRow(${i})">↺ 回復</button>
                    </div>
                    <div class="table-result-col" id="sim-row-res-${i}" style="width:40px; border:none; margin:0; padding:0;">-</div>
                </div>
            `;
        }
        container.innerHTML = htmlString;
    } catch (err) {
        console.error("渲染問事擲筊列發生錯誤:", err);
    }
};

// 初始化呼叫一次畫出表格
window.renderSimpleCupRows();

// 1. 即時檢查函式 (可以直接刪除了！)
// ★ 說明：因為求籤已經獨立到專屬頁面，問事畫面不會再有「求籤模式」的警告，所以這個函數直接淘汰。

// 2. 點擊與設定結果 (鎖定機制) - 乾淨版
window.setSimpleCupVal = function (idx, val, btnElem) {
    const group = document.getElementById(`sim-row-group-${idx}`);
    if (!group || group.dataset.locked === 'true') return;

    group.querySelectorAll('.res-btn').forEach(b => b.classList.remove('active-saint', 'active-laugh', 'active-close'));
    const resDisp = document.getElementById(`sim-row-res-${idx}`);
    if (val === 1) { btnElem.classList.add('active-saint'); resDisp.innerHTML = `<div class="res-dot dot-saint" style="width:24px;height:24px;font-size:12px;">聖</div>`; }
    else if (val === 0) { btnElem.classList.add('active-laugh'); resDisp.innerHTML = `<div class="res-dot dot-laugh" style="width:24px;height:24px;font-size:12px;">笑</div>`; }
    else { btnElem.classList.add('active-close'); resDisp.innerHTML = `<div class="res-dot dot-covered" style="width:24px;height:24px;font-size:12px;">蓋</div>`; }

    simpleTempCups[idx] = val;

    group.dataset.locked = 'true';
    group.querySelectorAll('.res-btn').forEach(b => { if (b !== btnElem) b.classList.add('locked-btn'); });

    const autoBtn = document.getElementById(`sim-auto-btn-${idx}`);
    const resetBtn = document.getElementById(`sim-reset-btn-${idx}`);
    if (autoBtn) autoBtn.style.display = 'none';
    if (resetBtn) resetBtn.style.display = 'block';

    // ★ 移除了舊的 checkSimplePoemWarn() 呼叫
};

// ==========================================
// ★ 4. 問事存檔防呆 (解除封印直球對決版)
// ==========================================
window.saveSimpleBlock = function () {
    try {
        const qTextEl = document.getElementById('simple-q-text');
        const qTextRaw = qTextEl && qTextEl.value ? qTextEl.value.trim() : "";
        const cups = window.simpleTempCups || [];
        const hasCups = cups.some(c => c !== null);

        if (!qTextRaw && !hasCups) {
            if (typeof window.showToast === 'function') window.showToast("⚠️ 尚未輸入任何資料！");
            return;
        }
        if (cups.length === 0 || cups.includes(null)) {
            if (typeof window.showToast === 'function') window.showToast("⚠️ 請完成所有次數的擲筊！");
            return;
        }

        let finalQuestion = qTextRaw || "未輸入問題";
        const isPoemActive = document.getElementById('tab-poem') && document.getElementById('tab-poem').classList.contains('active');
        const isOnline = document.getElementById('tab-simple-mode-online') && document.getElementById('tab-simple-mode-online').classList.contains('active');
        const lotNum = document.getElementById('simple-lot-num') ? document.getElementById('simple-lot-num').value.trim() : "";

        // 🌟 這裡修改：加入 (線) 或 (手) 的微型標示
        if (isPoemActive && lotNum) {
            const sourceTag = isOnline ? '(線)' : '(手)';
            finalQuestion = `${finalQuestion} [求得 第 ${lotNum} 籤 <span style="font-size:0.85em; color:#aaa;">${sourceTag}</span>]`;
        }

        let saint = cups.filter(v => v === 1).length;
        let laugh = cups.filter(v => v === 0).length;
        let covered = cups.filter(v => v === -1).length;

        let visualHtml = `<div class="res-dots-container" style="margin-top:5px;">`;
        visualHtml += cups.map(v => window.generateCupHtml(v, 24, 12)).join('');
        visualHtml += `</div>`;

        let summary = "";
        if (cups.length === 1) summary = saint ? "聖筊" : (laugh ? "笑筊" : "蓋筊");
        else if (laugh === 0 && covered === 0) summary = `${saint}聖筊`;
        else summary = `${saint}聖 ${laugh}笑 ${covered}蓋`;

        if (!window.simpleSessionHistory) window.simpleSessionHistory = [];

        // 🌟 核心防護：記錄是否為線上賜籤
        const isOnlineDraw = (isPoemActive && isOnline);

        window.simpleSessionHistory.push({ question: finalQuestion, result: summary, details: [...cups], isOnlineDraw: isOnlineDraw, time: new Date().toLocaleString() });

        window.isSimpleActive = true;
        if (document.getElementById('simple-lot-num')) document.getElementById('simple-lot-num').value = '';

        // 1. 重新渲染歷史紀錄
        if (typeof window.renderSimpleHistory === 'function') window.renderSimpleHistory();

        // 2. 清空輸入區塊
        if (typeof window.clearSimpleBlock === 'function') window.clearSimpleBlock(true);

        // 🌟 3. 加入這段魔法：自動將畫面定位到輸入框，確保使用者能看到剛存入的紀錄！
        setTimeout(() => {
            const actionArea = document.getElementById('simple-action-area');
            if (actionArea) {
                actionArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);

    } catch (e) { console.error("儲存區段發生錯誤", e); }
};

// ==========================================
// ★ 儲存比較擲筊追問區段
// ==========================================
window.saveCompFuBlock = function () {
    try {
        const qTextEl = document.getElementById('comp-fu-q-text');
        const qTextRaw = qTextEl && qTextEl.value ? qTextEl.value.trim() : "";
        const cups = window.compFuTempCups || [];
        const hasCups = cups.some(c => c !== null);

        if (!qTextRaw && !hasCups) {
            if (typeof window.showToast === 'function') window.showToast("⚠️ 尚未輸入任何資料！");
            return;
        }
        if (cups.length === 0 || cups.includes(null)) {
            if (typeof window.showToast === 'function') window.showToast("⚠️ 請完成所有次數的擲筊！");
            return;
        }

        let finalQuestion = qTextRaw || "未輸入追問內容";
        const isPoemActive = document.getElementById('comp-fu-tab-poem') && document.getElementById('comp-fu-tab-poem').classList.contains('active');
        const isOnline = document.getElementById('tab-comp-fu-mode-online') && document.getElementById('tab-comp-fu-mode-online').classList.contains('active');
        const lotNum = document.getElementById('comp-fu-lot-num') ? document.getElementById('comp-fu-lot-num').value.trim() : "";

        // 🌟 這裡修改：加入 (線) 或 (手) 的微型標示
        if (isPoemActive && lotNum) {
            const sourceTag = isOnline ? '(線)' : '(手)';
            finalQuestion = `${finalQuestion} [求得 第 ${lotNum} 籤 <span style="font-size:0.85em; color:#aaa;">${sourceTag}</span>]`;
        }

        let saint = cups.filter(v => v === 1).length;
        let laugh = cups.filter(v => v === 0).length;
        let covered = cups.filter(v => v === -1).length;

        let visualHtml = `<div class="res-dots-container" style="margin-top:5px;">`;
        visualHtml += cups.map(v => window.generateCupHtml(v, 24, 12)).join('');
        visualHtml += `</div>`;

        let summary = "";
        if (cups.length === 1) summary = saint ? "聖筊" : (laugh ? "笑筊" : "蓋筊");
        else if (laugh === 0 && covered === 0) summary = `${saint}聖筊`;
        else summary = `${saint}聖 ${laugh}笑 ${covered}蓋`;

        if (!window.compFuHistory) window.compFuHistory = [];

        // 🌟 核心防護：記錄是否為線上賜籤
        const isOnlineDraw = (isPoemActive && isOnline);

        window.compFuHistory.push({ question: finalQuestion, result: summary, details: [...cups], isOnlineDraw: isOnlineDraw, time: new Date().toLocaleString() });

        if (document.getElementById('comp-fu-lot-num')) document.getElementById('comp-fu-lot-num').value = '';
        if (typeof window.renderCompFuHistory === 'function') window.renderCompFuHistory();
        if (typeof window.clearCompFuBlock === 'function') window.clearCompFuBlock(true);

        // 🌟 加入 UX 優化：自動捲動對齊，讓使用者立刻看到剛存的紀錄
        setTimeout(() => {
            const actionArea = document.getElementById('comp-fu-action-area');
            if (actionArea) {
                actionArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);

    } catch (e) { console.error("儲存追問區段發生錯誤", e); }
};

window.commitSimpleSession = async function () {
    // ★ 核心修復：拔除 typeof 判斷，直球呼叫！
    if (!window.simpleSessionHistory || window.simpleSessionHistory.length === 0) {
        window.showToast("⚠️ 尚未輸入任何問事對話");
        return;
    }

    const globalSubEl = document.getElementById('simple-global-sub');
    const globalSub = (globalSubEl && globalSubEl.value) ? globalSubEl.value.trim() || "問事擲筊" : "問事擲筊";
    const selIdEl = document.getElementById('simple-deity-sel');
    const selId = selIdEl ? selIdEl.value : '';
    const currentDeities = typeof getOrderedDeities === 'function' ? getOrderedDeities() : (window.deities || []);

    let typeStr = "問事";
    if (selId === 'custom') {
        const customDeityEl = document.getElementById('simple-custom-deity');
        typeStr = customDeityEl && customDeityEl.value.trim() !== "" ? customDeityEl.value.trim() : "未具名神明";
    } else if (selId) {
        const d = currentDeities.find(x => x.id === selId);
        if (d) typeStr = d.name;
    }
    typeStr += " (問事)";

    const rec = {
        id: Date.now(), date: new Date().toLocaleString(), type: typeStr, lot: '-',
        subject: globalSub, note: `共 ${window.simpleSessionHistory.length} 次問事對話`, followUps: [...window.simpleSessionHistory]
    };

    window.Database.saveRecord(rec);

    if (typeof window.resetSimple === 'function') {
        await window.resetSimple(true);
    } else {
        window.isSimpleActive = false; window.simpleSessionHistory = [];
        if (globalSubEl) globalSubEl.value = "";
    }

    window.showToast("💾 對話紀錄已完整儲存！");
    if (typeof goTo === 'function') goTo('home');
};

// 4. 清空輸入框 - 移除崩潰危機版
window.clearSimpleBlock = async function (skipConfirm = false) {
    if (typeof unlockPermissionDenied === 'function') unlockPermissionDenied();

    if (!skipConfirm) {
        // 使用者手動點擊重置：跳出確認視窗
        if (!(await window.showConfirm("確定要清空目前輸入的內容嗎？", "重置確認"))) return;
    }

    // 1. 清空問題輸入框
    const qText = document.getElementById('simple-q-text');
    if (qText) qText.value = "";

    // 2. 清空籤號
    const lotNum = document.getElementById('simple-lot-num');
    if (lotNum) lotNum.value = "";

    // 🌟 3. 核心修復：強制重新渲染擲筊按鈕列，讓它們恢復成全新、未鎖定的狀態！
    if (typeof window.renderSimpleCupRows === 'function') {
        window.renderSimpleCupRows();
    }
};

function openNormalCompare() {
    // 1. 確保選單有神明資料
    populateSimpleCompareDeities();

    // 2. 重置輸入欄位 (清空舊資料)
    document.getElementById('comp-subject').value = "";
    document.getElementById('comp-options').innerHTML =
        `<div class="compare-row"><input type="text" placeholder="選項 1" class="comp-opt"></div>` +
        `<div class="compare-row"><input type="text" placeholder="選項 2" class="comp-opt"></div>`;

    // 3. 隱藏結果區，顯示設定區
    document.getElementById('compare-setup').style.display = 'block';
    document.getElementById('compare-step-panel').style.display = 'none';
    document.getElementById('compare-table-panel').style.display = 'none';
    document.getElementById('comp-result-area').style.display = 'none';

    // 🌟 新增：確保進入比較首頁時，吸底列是隱藏的
    const stickyBottom = document.getElementById('compare-sticky-bottom');
    if (stickyBottom) stickyBottom.style.display = 'none';

    goTo('compare');
}

// 比較功能 (簡化)
function addCompOpt() { const d = document.createElement('div'); d.className = 'compare-row'; d.innerHTML = '<input type="text" class="comp-opt" placeholder="選項">'; document.getElementById('comp-options').appendChild(d); }
function startTableMode() {
    if (!validateCompareInputs()) return;
    isCompareActive = true; // ★ 開啟防呆
    compareState.currentOptIndex = 0; compareState.results = [];
    document.getElementById('compare-setup').style.display = 'none';
    document.getElementById('compare-table-panel').style.display = 'block';
    document.getElementById('table-opt-total').innerText = compareState.options.length;
    renderTableInput();
}

function startCompareStepByStep() {
    if (!validateCompareInputs()) return;
    isCompareActive = true; // ★ 開啟防呆        
    compareState.currentOptIndex = 0;
    compareState.currentThrowCount = 0;
    compareState.results = compareState.options.map(opt => ({ name: opt, saints: 0, logs: "" }));
    document.getElementById('compare-setup').style.display = 'none';
    document.getElementById('compare-step-panel').style.display = 'block';
    loadCompareStep();
}

function runCompareBatch() {
    if (!validateCompareInputs()) return;
    isCompareActive = true; // ★ 開啟防呆        
    compareState.results = [];
    // 注意最上方的標題也順便加上了 margin 壓縮
    let html = "<h4 style='margin: 0 0 8px 0; font-size:1.05rem;'>結果分析：</h4>";

    const imgSaint = settings.cupDisplayMode === 'text' ? null : window.ImageManager.get('custom_cup_saint');
    const imgLaugh = settings.cupDisplayMode === 'text' ? null : window.ImageManager.get('custom_cup_laugh');
    const imgCovered = settings.cupDisplayMode === 'text' ? null : window.ImageManager.get('custom_cup_covered');

    compareState.options.forEach(optName => {
        let saint = 0; let log = "";
        for (let i = 0; i < compareState.targetThrows; i++) {
            let res = getCupResult();
            // 修正：動態套用圓點或自訂圖片
            if (res.imgSrc) {
                // 圖片模式：將 24px 縮小為 20px，左右間距縮小為 1px
                log += `<img src="${res.imgSrc}" style="width:20px; height:20px; object-fit:contain; margin:0 1px; vertical-align:middle;">`;
            } else {
                // 文字模式：強制指定 20px 寬高與 10px 字體，確保與圖片大小完美對齊
                log += `<div class="res-dot fu-dot-sm ${res.dotClass}" style="width:20px; height:20px; font-size:10px; display:inline-flex; justify-content:center; align-items:center; margin:0 1px; vertical-align:middle; box-sizing:border-box;">${res.char}</div>`;
            }
            if (res.type === 1) saint++;
        }
        compareState.results.push({ name: optName, saints: saint, logs: log });
        // ★ 修復：完整包裝在一個樣板字面值中
        html += `<div class="compare-result-item" style="border-bottom: 1px solid #444; padding: 5px 0; margin-bottom: 5px;">
                    <div style="font-weight:bold; color:var(--accent); font-size:1rem; margin-bottom:2px;">${optName}</div>
                    <div style="display:flex; align-items:center; flex-wrap:nowrap;">
                        <span style="margin-right:8px; flex-shrink:0; font-size:0.9rem;">聖筊：${saint}/${compareState.targetThrows}</span>
                        <div style="display:flex; align-items:center; overflow-x:auto; padding-bottom:2px; flex:1; white-space:nowrap;">${log}</div>
                    </div>
                </div>`;
    });
    showCompareResults(html);
}

function loadCompareStep() {
    const idx = compareState.currentOptIndex;
    document.getElementById('step-opt-idx').innerText = idx + 1;
    document.getElementById('step-opt-name').innerText = compareState.options[idx];
    document.getElementById('step-throw-count').innerText = 0;
    document.getElementById('step-history').innerText = "";
    updateCupDisplay('step-cup-res', { text: '準備', type: -1 });
    compareState.currentThrowCount = 0;
    document.getElementById('step-throw-btn').style.display = 'inline-block';
    document.getElementById('step-next-btn').style.display = 'none';
    document.getElementById('step-finish-btn').style.display = 'none';
}

function loadStepOption() { const idx = compareState.currentOptIndex; document.getElementById('step-opt-idx').innerText = idx + 1; document.getElementById('step-opt-name').innerText = compareState.options[idx]; document.getElementById('step-throw-count').innerText = 0; document.getElementById('step-history').innerText = ""; document.getElementById('step-cup-res').innerText = "準備擲筊"; compareState.currentThrowCount = 0; document.getElementById('step-throw-btn').style.display = 'inline-block'; document.getElementById('step-next-btn').style.display = 'none'; document.getElementById('step-finish-btn').style.display = 'none'; }

function throwCompareOne() {
    const btn = document.getElementById('step-throw-btn');
    // ★ 交給引擎接管
    executeThrowCupWrapper(btn, (res) => {
        updateCupDisplay('step-cup-res', res);
        const currentRes = compareState.results[compareState.currentOptIndex];

        let logHtml = res.imgSrc
            ? `<img src="${res.imgSrc}" style="width:24px; height:24px; object-fit:contain; margin:0 2px; vertical-align:middle;">`
            : `<div class="res-dot fu-dot-sm ${res.dotClass}" style="display:inline-flex; margin:0 2px; vertical-align:middle;">${res.char}</div>`;

        currentRes.logs += logHtml;
        if (res.type === 1) currentRes.saints++;
        compareState.currentThrowCount++;

        document.getElementById('step-throw-count').innerText = compareState.currentThrowCount;
        document.getElementById('step-history').innerHTML = currentRes.logs;

        if (compareState.currentThrowCount >= compareState.targetThrows) {
            btn.style.display = 'none';
            if (compareState.currentOptIndex < compareState.options.length - 1) document.getElementById('step-next-btn').style.display = 'inline-block';
            else document.getElementById('step-finish-btn').style.display = 'inline-block';
        }
    });
}

function nextCompareOption() { compareState.currentOptIndex++; loadCompareStep(); }
function finishCompareStep() {
    // 注意最上方的標題也順便加上了 margin 壓縮
    let html = "<h4 style='margin: 0 0 8px 0; font-size:1.05rem;'>結果分析：</h4>";
    compareState.results.forEach(r => {
        // ★ 修復：完整包裝在一個樣板字面值中
        html += `<div class="compare-result-item" style="border-bottom: 1px solid #444; padding: 5px 0; margin-bottom: 5px;">
                    <div style="font-weight:bold; color:var(--accent); font-size:1rem; margin-bottom:2px;">${r.name}</div>
                    <div style="display:flex; align-items:center; flex-wrap:nowrap;">
                        <span style="margin-right:8px; flex-shrink:0; font-size:0.9rem;">聖筊：${r.saints}</span>
                        <div style="display:flex; align-items:center; overflow-x:auto; padding-bottom:2px; flex:1; white-space:nowrap;">${r.logs}</div>
                    </div>
                </div>`;
    });
    document.getElementById('compare-step-panel').style.display = 'none';
    showCompareResults(html);
}
function validateCompareInputs() { const opts = document.querySelectorAll('.comp-opt'); let validOpts = []; opts.forEach(o => { if (o.value) validOpts.push(o.value); }); if (validOpts.length < 1) { showToast("至少一個選項"); return false; } compareState.options = validOpts; compareState.targetThrows = parseInt(document.getElementById('comp-times').value) || 3; compareState.subject = document.getElementById('comp-subject').value || "比較擲筊"; return true; }

window.showCompareResults = function (html) {
    document.getElementById('compare-setup').style.display = 'none';
    document.getElementById('comp-result-area').style.display = 'block';
    document.getElementById('comp-result-content').innerHTML = html;

    // 🌟 新增：進入結果與追問區時，顯示吸底列
    const stickyBottom = document.getElementById('compare-sticky-bottom');
    if (stickyBottom) stickyBottom.style.display = 'block';

    // ★ 自動初始化下方的追問區塊，無縫接軌！
    document.getElementById('comp-fu-q-text').value = "";
    if (typeof compFuHistory !== 'undefined') compFuHistory = [];
    const fuHistoryEl = document.getElementById('comp-fu-history');
    if (fuHistoryEl) fuHistoryEl.innerHTML = "";

    // ★ 刪除舊的 switchCompFuMode('ask'); 防止崩潰
    if (typeof renderCompFuRows === 'function') renderCompFuRows();
};

function initCompareUI() {
    const btnApp = document.getElementById('btn-compare-app');
    const btnBatch = document.getElementById('btn-compare-batch');
    const btnTable = document.getElementById('btn-compare-table');
    if (isManualCompareMode) {
        btnApp.style.display = 'none'; btnBatch.style.display = 'none';
        btnTable.style.flex = '1 1 100%';
    } else {
        btnApp.style.display = 'block';
        btnBatch.style.display = 'block'; btnTable.style.flex = '1';
        btnTable.style.marginTop = '10px';
    }
}

function addOption() {
    const div = document.createElement('div');
    div.className = 'compare-row';
    div.innerHTML = '<input type="text" placeholder="新選項" class="comp-opt">';
    document.getElementById('comp-options').appendChild(div);
}

/* ==========================================
   ★ 紀錄詳情追問系統 (純淨裝甲版)
   ========================================== */

// 刪除 switchDetailFuMode 與 checkDetailFuPoemWarn，直接留下核心功能
window.renderDetailFuRows = function () {
    let t = parseInt(document.getElementById('detail-fu-times').value);
    if (isNaN(t) || t < 1) { t = 1; document.getElementById('detail-fu-times').value = 1; }
    if (t > 20) { t = 20; document.getElementById('detail-fu-times').value = 20; }

    detailFuTempCups = new Array(t).fill(null);
    let htmlString = "";
    for (let i = 0; i < t; i++) {
        htmlString += `
                <div class="cup-row-group" id="dfu-row-group-${i}" data-locked="false">
                    <div style="font-size:0.8rem; color:#888; margin-bottom:5px;">第 ${i + 1} 擲</div>
                    <div style="display:flex; gap:5px; align-items:center;">
                        <button class="res-btn res-saint" onclick="setDetailFuCupVal(${i}, 1, this)">聖</button>
                        <button class="res-btn res-laugh" onclick="setDetailFuCupVal(${i}, 0, this)">笑</button>
                        <button class="res-btn res-covered" onclick="setDetailFuCupVal(${i}, -1, this)">蓋</button>
                        <button class="secondary-btn" id="dfu-auto-btn-${i}" onclick="autoThrowDetailFuRow(${i})" style="margin:0; flex:1; padding:10px 0; font-size:0.9rem;">🙏 擲筊</button>
                        <button class="secondary-btn" id="dfu-reset-btn-${i}" onclick="resetDetailFuCupRow(${i})" style="margin:0; flex:1; padding:10px 0; font-size:0.9rem; display:none; border-color:#555; color:#aaa;">↺ 重設</button>
                        <div class="row-res-disp" id="dfu-row-res-${i}">-</div>
                    </div>
                </div>
            `;
    }
    const container = document.getElementById('detail-fu-rows');
    if (container) container.innerHTML = htmlString;
};

window.setDetailFuCupVal = function (idx, val, btnElem) {
    const group = document.getElementById(`dfu-row-group-${idx}`);
    if (!group || group.dataset.locked === 'true') return;

    group.querySelectorAll('.res-btn').forEach(b => b.classList.remove('active-saint', 'active-laugh', 'active-close'));
    const resDisp = document.getElementById(`dfu-row-res-${idx}`);

    if (val === 1) { btnElem.classList.add('active-saint'); resDisp.innerHTML = `<div class="res-dot dot-saint" style="width:20px;height:20px;font-size:10px;">聖</div>`; }
    else if (val === 0) { btnElem.classList.add('active-laugh'); resDisp.innerHTML = `<div class="res-dot dot-laugh" style="width:20px;height:20px;font-size:10px;">笑</div>`; }
    else { btnElem.classList.add('active-close'); resDisp.innerHTML = `<div class="res-dot dot-covered" style="width:20px;height:20px;font-size:10px;">蓋</div>`; }

    detailFuTempCups[idx] = val;
    group.dataset.locked = 'true';
    group.querySelectorAll('.res-btn').forEach(b => { if (b !== btnElem) b.classList.add('locked-btn'); });

    document.getElementById(`dfu-auto-btn-${idx}`).style.display = 'none';
    document.getElementById(`dfu-reset-btn-${idx}`).style.display = 'block';
};

window.resetDetailFuCupRow = async function (idx) {
    if (!(await window.showConfirm("這樣會回復結果，是否確定？"))) return;
    const group = document.getElementById(`dfu-row-group-${idx}`);
    if (!group) return;
    group.dataset.locked = 'false';
    group.querySelectorAll('.res-btn').forEach(b => { b.classList.remove('active-saint', 'active-laugh', 'active-close', 'locked-btn'); });
    document.getElementById(`dfu-row-res-${idx}`).innerHTML = '-';
    detailFuTempCups[idx] = null;
    document.getElementById(`dfu-auto-btn-${idx}`).style.display = 'block';
    document.getElementById(`dfu-reset-btn-${idx}`).style.display = 'none';
};

window.clearDetailFuBlock = function () {
    window.renderDetailFuRows();
};

window.saveDetailFuBlock = function () {
    const qTextEl = document.getElementById('detail-fu-q-text');
    const qText = qTextEl ? qTextEl.value.trim() || "未輸入問題" : "未輸入問題";

    if (detailFuTempCups.includes(null)) {
        if (typeof showToast === 'function') showToast("⚠️ 請完成所有次數的擲筊！");
        return;
    }

    let saint = detailFuTempCups.filter(v => v === 1).length;
    let laugh = detailFuTempCups.filter(v => v === 0).length;
    let covered = detailFuTempCups.filter(v => v === -1).length;

    let visualHtml = `<div class="res-dots-container" style="margin-top:5px;">`;
    visualHtml += detailFuTempCups.map(v => window.generateCupHtml(v, 24, 12)).join('');
    visualHtml += `</div>`;

    let summary = detailFuTempCups.length === 1 ? (saint ? "聖筊" : (laugh ? "笑筊" : "蓋筊")) : `${saint}聖 ${laugh}笑 ${covered}蓋`;

    const recIndex = records.findIndex(r => r.id == currentDetailRecordId);
    if (recIndex === -1) return;

    if (!records[recIndex].followUps) records[recIndex].followUps = [];
    records[recIndex].followUps.push({
        question: qText,
        result: summary,
        details: [...detailFuTempCups],
        time: new Date().toLocaleString()
    });

    window.Database.saveRecord(records[recIndex]);

    if (qTextEl) qTextEl.value = "";

    if (typeof showToast === 'function') showToast("💾 追問紀錄已成功儲存！");

    // 💡【新增】：大掃除時間！儲存後徹底清空輸入框、恢復次數並重置杯象
    if (qTextEl) qTextEl.value = "";

    // 恢復擲筊次數為 1
    const timesInput = document.getElementById('detail-fu-times');
    if (timesInput) timesInput.value = 1;

    // 重新渲染擲筊格子，清空剛才的殘留杯象與陣列
    if (typeof window.renderDetailFuRows === 'function') {
        window.renderDetailFuRows();
    }

    // 改為局部刷新追問列表，並將畫面平滑滾動聚焦到剛新增的項目
    if (typeof renderFollowUps === 'function') {
        renderFollowUps(records[recIndex]);

        setTimeout(() => {
            const list = document.getElementById('detail-fu-list');
            if (list && list.lastElementChild) {
                list.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 150);
    }
};

window.autoThrowDetailFuRow = function (idx) {
    const btn = document.getElementById(`dfu-auto-btn-${idx}`);
    // 點擊當下先改變按鈕文字，讓使用者知道有反應
    btn.innerHTML = "請稍候...";

    // ★ 交給引擎接管
    executeThrowCupWrapper(btn, (res) => {
        const btns = document.getElementById(`dfu-row-group-${idx}`).querySelectorAll('.res-btn');
        let targetBtn;
        if (res.type === 1) targetBtn = btns[0];
        else if (res.type === 0) targetBtn = btns[1];
        else targetBtn = btns[2];

        setDetailFuCupVal(idx, res.type, targetBtn);
        // 恢復原本文字(但其實會被隱藏，以防萬一)
        btn.innerHTML = "🙏 擲筊";
    });
};

// 4. 比較擲筊：結束並儲存總紀錄 (雲端防護版)
window.commitCompareWithFu = async function () {
    const resContent = document.getElementById('comp-result-content');
    if (!resContent || !resContent.innerHTML.trim()) {
        if (typeof window.showToast === 'function') window.showToast("⚠️ 尚未有任何比較結果！");
        return;
    }

    if (!(await window.showConfirm("確定要結束比較並儲存所有紀錄嗎？", "儲存確認"))) return;

    // 🌟 核心防呆：先解除鎖定，這樣接下來跳轉到紀錄頁面，絕對不會跳出離開警告！
    window.isCompareActive = false;

    const deitySel = document.getElementById('compare-deity-sel');
    const customDeity = document.getElementById('compare-custom-deity');
    let finalDeity = "未指定神明";
    if (deitySel && deitySel.value) {
        finalDeity = deitySel.value === 'custom' ? (customDeity ? customDeity.value.trim() : "") || "自訂神明" : deitySel.options[deitySel.selectedIndex].text;
    }

    const subEl = document.getElementById('comp-subject');
    let title = subEl && subEl.value ? subEl.value : "比較擲筊紀錄";

    let finalHtml = resContent.innerHTML;

    if (typeof compFuHistory !== 'undefined' && compFuHistory.length > 0) {
        finalHtml += `<hr style="border-color:#444; margin:15px 0;">`;
        finalHtml += `<h4 style="color:var(--accent); margin-bottom:10px;">後續追問</h4>`;
        compFuHistory.forEach((b, i) => {
            let cleanHtml = "";
            if (b.details && b.details.length > 0) {
                cleanHtml = `<div class="res-dots-container" style="margin-top:0;">` +
                    b.details.map(v => window.generateCupHtml(v, 24, 12)).join('') +
                    `</div>`;
            } else if (b.html) {
                cleanHtml = b.html.replace('margin-top:5px;', 'margin-top:0;'); // 向下相容舊紀錄
            }
            let timeHtml = b.time ? `<span style="margin-left:8px; font-weight:normal;">🕒 ${b.time}</span>` : ''; // 🌟 新增時間

            finalHtml += `
                <div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:8px; margin-bottom:8px;">
                    <div style="font-size:0.8rem; color:#888;">#${i + 1} ${timeHtml}</div>
                    <div style="font-weight:bold; margin-bottom:6px;">問：${b.question}</div>
                    <div style="display:flex; align-items:center; flex-wrap:wrap; gap:8px;">
                        <div style="color:var(--accent); margin:0;">答：${b.result}</div>
                        ${cleanHtml ? `<div style="color:#555; font-size:0.9rem;">|</div> <div style="display:flex; align-items:center;">${cleanHtml}</div>` : ''}
                    </div>
                </div>
            `;
        });
    }

    const record = {
        id: Date.now().toString(),
        type: 'compare',
        deity: finalDeity,
        subject: title,
        note: "",
        date: new Date().toISOString(),
        htmlContent: finalHtml
    };

    if (typeof window.sysData !== 'undefined') {
        if (!window.sysData.records) window.sysData.records = [];
        window.sysData.records.unshift(record);
        if (typeof window.saveToLocalStorage === 'function') window.saveToLocalStorage();
    }

    if (typeof window.showToast === 'function') window.showToast("✅ 已儲存比較擲筊紀錄");

    // 鎖定解除後，安心重置與跳轉
    await window.resetCompare(true);
    if (typeof window.goTo === 'function') window.goTo('records');
};

// ==========================================
// ★ 3. 求籤跨頁導航 (智慧判斷輸入框與選單)
// ==========================================
window.goToQiuqianFromTool = async function (tool) {
    try {
        let deityId = '';
        const sel = document.getElementById(`${tool}-deity-sel`);
        if (sel) deityId = sel.value;

        let customName = '';
        const customInput = document.getElementById(`${tool}-custom-deity`);
        if (customInput) customName = customInput.value.trim();

        // ★ 偵測：如果下拉選單沒選，輸入框也沒打字
        if (!deityId && !customName) {
            const confirmed = await window.smartConfirm("尚未選取神明或輸入聖號，是否繼續求籤？\n(將進入一般求籤模式)", "尚未選擇神明");
            if (!confirmed) return; // 取消就留在原地

            // 確定繼續：進入一般求籤
            if (typeof startNormalMode === 'function') startNormalMode();
            return;
        }

        // 判斷該去哪種求籤模式
        if (deityId && deityId !== 'custom') {
            // 有選神明 ➔ 進入神明求籤
            if (typeof startDeityQiuqian === 'function') startDeityQiuqian(deityId);
        } else if (customName) {
            // 沒選神明，但有打字 ➔ 進入一般求籤，並自動帶入打的字
            if (typeof startNormalMode === 'function') startNormalMode();

            // 延遲 100ms 等畫面切過去後，自動把字填到「一般求籤」的輸入框裡
            setTimeout(() => {
                const normalInput = document.getElementById('input-normal-deity');
                const normalInputBox = document.getElementById('normal-deity-input-box');
                if (normalInput) normalInput.value = customName;
                if (normalInputBox) normalInputBox.style.display = 'block';
            }, 100);
        }
    } catch (err) {
        console.error("切換求籤發生錯誤:", err);
    }
};
// ==========================================
// ★ 終極重置引擎：問事擲筊 (UI完全同步版)
// ==========================================
window.resetSimple = async function (force = false) {
    try {
        if (!force) {
            if (!confirm("確定要重置問事畫面嗎？未儲存的內容將會遺失。")) return;
            //精美的showConfim視窗，考量程式運作安全性捨去不用
            //const confirmed = await window.smartConfirm("確定要重置問事畫面嗎？未儲存的內容將會遺失。", "重置確認");
            //if (!confirmed) return;
        }

        // 1. 清空背後資料陣列
        if (typeof simpleSessionHistory !== 'undefined') window.simpleSessionHistory = [];
        if (typeof simpleTempCups !== 'undefined') window.simpleTempCups = [];
        window.isSimpleActive = false;

        // 2. 清空神明選單與連動
        const deitySel = document.getElementById('simple-deity-sel');
        if (deitySel) {
            deitySel.value = '';
            if (typeof window.handleDeityChangeForTools === 'function') window.handleDeityChangeForTools('simple');
        }

        // 3. 清空所有文字輸入框與畫面列表
        const elementsToClear = ['simple-custom-deity', 'simple-global-sub', 'simple-q-text', 'simple-history-list', 'simple-lot-num'];
        elementsToClear.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.value = '';
                else el.innerHTML = '';
            }
        });

        // 🌟 4. 核心新增：強制恢復 UI 到「剛進來的預設狀態」
        const timesInput = document.getElementById('simple-times');
        if (timesInput) timesInput.value = 1; // 預設恢復為 1 次

        // 強制切換回「💬 一般問事」頁籤
        if (typeof window.switchSimpleMode === 'function') {
            window.switchSimpleMode('ask');
        }

        // 重新畫出乾淨的 1 次擲筊框
        if (typeof window.renderSimpleCupRows === 'function') window.renderSimpleCupRows();
    } catch (err) { console.error("重置問事發生錯誤:", err); }
};

// ==========================================
// ★ 終極重置引擎：比較擲筊 (UI完全同步版)
// ==========================================
window.resetCompare = async function (force = false) {
    try {
        if (!force) {
            if (!confirm("確定要重置比較擲筊嗎？未儲存的內容將會遺失。")) return;
            //精美的showConfim視窗，考量程式運作安全性捨去不用
            //const confirmed = await window.smartConfirm("確定要重置比較擲筊嗎？未儲存的內容將會遺失。", "重置確認");
            //if (!confirmed) return;
        }

        if (typeof compareState !== 'undefined') {
            compareState.results = [];
            compareState.currentOptIndex = 0;
            compareState.tableTempData = [];
        }
        if (typeof compFuHistory !== 'undefined') window.compFuHistory = [];
        if (typeof compFuTempCups !== 'undefined') window.compFuTempCups = [];

        // 🌟 核心防護：明確關閉活躍狀態，避免切換頁面時觸發離開警告！
        window.isCompareActive = false;

        const deitySel = document.getElementById('compare-deity-sel');
        if (deitySel) {
            deitySel.value = '';
            if (typeof window.handleDeityChangeForTools === 'function') window.handleDeityChangeForTools('compare');
        }

        const elementsToClear = ['compare-custom-deity', 'comp-subject', 'comp-result-content', 'comp-fu-history', 'comp-fu-q-text', 'comp-fu-lot-num'];
        elementsToClear.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.value = '';
                else el.innerHTML = '';
            }
        });

        // 🌟 修復：強制恢復比較擲筊初始的「預設 3 次」
        const compTimesInput = document.getElementById('comp-times');
        if (compTimesInput) compTimesInput.value = 3;

        const opts = document.getElementById('comp-options');
        if (opts) opts.innerHTML = '<div class="compare-row"><input type="text" placeholder="選項 1" class="comp-opt"></div><div class="compare-row"><input type="text" placeholder="選項 2" class="comp-opt"></div>';

        const setup = document.getElementById('compare-setup');
        const stepPanel = document.getElementById('compare-step-panel');
        const tablePanel = document.getElementById('compare-table-panel');
        const resArea = document.getElementById('comp-result-area');
        const stickyBottom = document.getElementById('compare-sticky-bottom');

        if (setup) setup.style.display = 'block';
        if (stepPanel) stepPanel.style.display = 'none';
        if (tablePanel) tablePanel.style.display = 'none';
        if (resArea) resArea.style.display = 'none';
        if (stickyBottom) stickyBottom.style.display = 'none';

        const fuTimesInput = document.getElementById('comp-fu-times');
        if (fuTimesInput) fuTimesInput.value = 1;

        if (typeof window.switchCompFuMode === 'function') {
            window.switchCompFuMode('ask');
        }

    } catch (err) { console.error("重置比較發生錯誤:", err); }
};

// 萬用數字調整器 (支援整數與小數點)
window.adjustNumber = function (inputId, delta, min, max, renderFuncStr) {
    const inputEl = document.getElementById(inputId);
    if (!inputEl) return;

    let currentVal = parseFloat(inputEl.value) || min;
    let newVal = currentVal + delta;

    newVal = Math.round(newVal * 100) / 100;

    // 🌟 新增：邊界偵測與 Toast 提示
    let hitBoundary = false;
    let toastMsg = "";

    if (newVal < min) {
        newVal = min;
        hitBoundary = true;
        toastMsg = `⚠️ 已經是最小值 ${min} 囉！`;
    }
    if (newVal > max) {
        newVal = max;
        hitBoundary = true;
        toastMsg = `⚠️ 最多只能設定到 ${max} 喔！`;
    }

    inputEl.value = Number.isInteger(delta) ? newVal : newVal.toFixed(2);

    // 觸發 HTML 上的 onchange 事件 (用來啟動下方的防呆與存檔)
    inputEl.dispatchEvent(new Event('change'));

    // 如果撞到邊界，跳出警告
    if (hitBoundary && typeof showToast === 'function') {
        showToast(toastMsg);
    }

    if (renderFuncStr && typeof window[renderFuncStr] === 'function') {
        window[renderFuncStr]();
    }
};

// ★ 共用元件：生成筊杯 HTML
window.generateCupHtml = function (val, size = 24, fontSize = 12) {
    const mode = (typeof settings !== 'undefined' && settings.cupDisplayMode) ? settings.cupDisplayMode : 'css';

    if (mode === 'css') {
        const cssW = size;
        const cssH = size * 0.5; // 月牙形比例
        let cup1 = '', cup2 = '';

        if (val === 1) { // 聖筊 (一陰一陽)
            cup1 = 'bobei-yin'; cup2 = 'bobei-yang';
        } else if (val === 0) { // 笑筊 (兩陽)
            cup1 = 'bobei-yang'; cup2 = 'bobei-yang';
        } else { // 蓋筊 (兩陰)
            cup1 = 'bobei-yin'; cup2 = 'bobei-yin';
        }

        // ★ 核心修正：套用高質感的 bobei-base 與陰陽面
        return `
            <div style="display:inline-flex; align-items:center; gap: 4px;">
                <div class="bobei-base ${cup1}" style="width:${cssW}px; height:${cssH}px; transform: rotate(-15deg); margin:0;"></div>
                <div class="bobei-base ${cup2}" style="width:${cssW}px; height:${cssH}px; transform: rotate(15deg); margin:0;"></div>
            </div>`;
    }

    // 模式 B & C：圖片模式 或 文字模式 (維持你原本的邏輯)
    const isImageMode = (mode === 'image');
    let imgSrc = null, dotClass = '', char = '';

    if (val === 1) {
        imgSrc = isImageMode ? window.AppCache.cupSaint : null;
        dotClass = 'dot-saint'; char = '聖';
    } else if (val === 0) {
        imgSrc = isImageMode ? window.AppCache.custom_cup_laugh : null;
        dotClass = 'dot-laugh'; char = '笑';
    } else {
        imgSrc = isImageMode ? window.AppCache.custom_cup_covered : null;
        dotClass = 'dot-covered'; char = '蓋';
    }

    if (imgSrc) {
        return `<img src="${imgSrc}" style="width:${size}px; height:${size}px; object-fit:contain; margin:0 2px; vertical-align:middle; animation: popIn 0.3s;">`;
    } else {
        return `<div class="res-dot fu-dot-sm ${dotClass}" style="width:${size}px; height:${size}px; font-size:${fontSize}px; display:inline-flex; justify-content:center; align-items:center; margin:0 2px; vertical-align:middle; box-sizing:border-box; animation: popIn 0.3s;">${char}</div>`;
    }
};

// ==========================================
// ★ Google Sheet Webhook 教學攻略互動引擎
// ==========================================
// 1. 開關教學面板
window.toggleGasTutorial = function () {
    const box = document.getElementById('gas-tutorial-box');
    if (box) {
        // 切換顯示狀態
        box.style.display = (box.style.display === 'none') ? 'block' : 'none';
        // 如果打開了，就稍微向下捲動讓使用者看清楚
        if (box.style.display === 'block') {
            setTimeout(() => {
                box.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }, 100);
        }
    }
};

// 2. 複製程式碼功能
window.copyGasCode = function () {
    const codeArea = document.getElementById('gas-code-block');
    if (!codeArea) return;

    // 使用現代 Clipboard API
    navigator.clipboard.writeText(codeArea.value).then(() => {
        if (typeof showToast === 'function') {
            showToast("✅ 程式碼已成功複製！請至 Google Sheet 貼上。");
        } else {
            alert("✅ 程式碼已成功複製！");
        }
    }).catch(err => {
        console.error("複製失敗:", err);
        // 備用方案：如果瀏覽器阻擋 Clipboard API
        codeArea.select();
        document.execCommand('copy');
        if (typeof showToast === 'function') showToast("✅ 程式碼已複製！");
    });
};

// 3. 原生分享教學攻略功能
window.shareGasTutorial = async function () {
    const tutorialText = `🎁 【擲筊助手】打造專屬 Google Webhook 雲端硬碟\n\n免註冊複雜伺服器，只要 3 個步驟，免費把 Google 試算表變成專屬的雲端備份中心：\n\n1️⃣ 開啟一個全新的 Google 試算表，點擊上方選單 [擴充功能] -> [Apps Script]。\n2️⃣ 貼上專屬串接程式碼 (請至 APP 內複製)。\n3️⃣ 點擊右上角 [部署] -> [新增部署作業] -> 類型選擇 [網頁應用程式]。將存取權限設為 [所有人]，部署後拿到一串 URL，貼回 APP 設定中即可完成串接！`;

    try {
        // 判斷手機是否支援原生 Web Share API
        if (navigator.share) {
            await navigator.share({
                title: 'Google Webhook 雲端備份教學',
                text: tutorialText
            });
        } else {
            // 不支援分享的裝置（例如部分電腦），直接幫他複製純文字攻略
            await navigator.clipboard.writeText(tutorialText);
            if (typeof showToast === 'function') showToast("✅ 攻略文字已複製到剪貼簿，你可以貼給朋友囉！");
        }
    } catch (err) {
        console.error("分享失敗:", err);
    }
};

// ==========================================
// ★ 圖片生成與原生分享引擎 (Web Share API)
// ==========================================
window.shareResultRecord = async function (buttonElement, targetDivId) {
    // 1. 防止重複點擊，先把按鈕反灰
    const originalText = buttonElement.innerHTML;
    buttonElement.innerHTML = "⏳ 處理中...";
    buttonElement.style.pointerEvents = "none";

    try {
        const targetDiv = document.getElementById(targetDivId);
        if (!targetDiv) throw new Error("找不到要截圖的區塊");

        // 2. 使用 html2canvas 將區塊轉為 Canvas
        // 設定 backgroundColor 確保背景不會變透明黑色
        const canvas = await html2canvas(targetDiv, {
            backgroundColor: "#222",
            scale: 2 // 提高圖片解析度
        });

        // 3. 將 Canvas 轉成 Blob 檔案
        canvas.toBlob(async (blob) => {
            const file = new File([blob], `divination_record_${Date.now()}.png`, { type: "image/png" });

            // 4. 判斷手機是否支援原生分享 (通常 HTTPS 環境下的 iOS/Android 都支援)
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: '我的擲筊結果',
                    text: '這是我剛求到的紀錄，分享給你！',
                    files: [file]
                });
            } else {
                // 5. 不支援原生分享的舊手機或電腦，改為直接下載
                const link = document.createElement('a');
                link.download = file.name;
                link.href = URL.createObjectURL(blob);
                link.click();
            }
        });
    } catch (error) {
        console.error("截圖或分享失敗:", error);
        if (typeof showToast === 'function') showToast("❌ 分享失敗");
    } finally {
        // 恢復按鈕狀態
        buttonElement.innerHTML = originalText;
        buttonElement.style.pointerEvents = "auto";
    }
};

// ==========================================
// ★ 直接輸入防呆與儲存 (整合版)
// ==========================================
window.validateDirectInput = function (inputId, min, max) {
    const el = document.getElementById(inputId);
    if (!el) return;

    // 取得輸入值並檢查是否為數字
    let val = parseFloat(el.value);

    // 防呆處理：小於最小或非數字
    if (isNaN(val) || val < min) {
        val = min;
        if (typeof showToast === 'function') showToast(`⚠️ 數字不能小於 ${min} 喔！`);
    }
    // 防呆處理：大於最大值
    else if (val > max) {
        val = max;
        if (typeof showToast === 'function') showToast(`⚠️ 數字最多只能設定到 ${max}！`);
    }

    // 將修正後的值寫回畫面，統一保留兩位小數 (例如 2.00)
    el.value = val.toFixed(2);

    // 🌟 將新數值寫入系統與資料庫
    const keyMap = {
        'input-anim-seconds': 'animSeconds',        // 主畫面與小視窗共用的搖晃秒數
        'cfg-splash-dur-start': 'splashStart',      // 開場動畫一
        'cfg-splash-dur-end': 'splashEnd',          // 開場動畫二
        'cup-time-ready': 'cupTimeReady',           // 擲筊靜止秒數
        'cup-time-throw': 'cupTimeThrow',           // 擲筊搖晃秒數
        'cup-time-result-sec': 'cupTimeResultSec'   // 擲筊停留秒數
    };

    if (keyMap[inputId]) {
        const paramKey = keyMap[inputId];
        // 1. 寫入全域變數記憶體
        if (typeof settings !== 'undefined') {
            settings[paramKey] = val;
        }

        // 2. 寫入本地資料庫 (localStorage)
        try {
            let savedData = JSON.parse(localStorage.getItem('zb_settings') || '{}');
            savedData[paramKey] = val;
            localStorage.setItem('zb_settings', JSON.stringify(savedData));
        } catch (e) {
            console.error("設定存檔失敗:", e);
        }
    }

    // 呼叫主存檔邏輯確保萬無一失
    if (typeof window.saveSettings === 'function') window.saveSettings();
};

// ==========================================
// ★ 系統設定載入 (整合版：保留原有功能並加入新版秒數同步)
// ==========================================
window.loadSettings = function () {
    // 1. 從瀏覽器記憶體讀取最新設定
    const s = localStorage.getItem('zb_settings');
    if (s) {
        settings = { ...settings, ...JSON.parse(s) };
    }

    // 防呆：預設系統失效時重置為白沙屯
    if (settings.defaultSystem && typeof poemSystems !== 'undefined' && !poemSystems[settings.defaultSystem]) {
        settings.defaultSystem = Object.keys(poemSystems)[0] || '';
        localStorage.setItem('zb_settings', JSON.stringify(settings));
    }

    // 2. 填入一般畫面元素
    const chkSkip = document.getElementById('chk-skip');
    if (chkSkip) chkSkip.checked = settings.skip;

    const inputTotal = document.getElementById('input-total-lot');
    if (inputTotal) inputTotal.value = settings.customTotal || "";

    const inputSaint = document.getElementById('input-global-saint-target');
    if (inputSaint) inputSaint.value = settings.saintTarget || 3;

    // 建立下拉選單
    const selSys = document.getElementById('sel-default-system');
    if (selSys && typeof poemSystems !== 'undefined') {
        selSys.innerHTML = '<option value="">(不指定 - 依總數)</option>';
        Object.values(poemSystems).forEach(sys => {
            selSys.innerHTML += `<option value="${sys.id}">${sys.name}</option>`;
        });
        selSys.value = settings.defaultSystem || "";
    }

    const selLayout = document.getElementById('sel-intent-layout');
    if (selLayout) selLayout.value = settings.intentLayout || 'vertical';

    // 切換模式 UI (觸控、秒數、感應)
    const mode = settings.drawMode || 'timer';
    if (typeof switchDrawMode === 'function') switchDrawMode(mode);

    // 3. 填入全域背景設定面板
    const hColorInp = document.getElementById('global-header-color');
    if (hColorInp) hColorInp.value = settings.headerColor || '#d32f2f';
    const bColorInp = document.getElementById('global-bg-color');
    if (bColorInp) bColorInp.value = settings.bgColor || '#1a1a1a';
    const bgPrev = document.getElementById('global-bg-preview');
    if (bgPrev) bgPrev.style.backgroundImage = settings.bgImage ? `url(${settings.bgImage})` : 'none';

    // 4. 載入擲筊動畫與過場設定
    const cupMode = document.getElementById('cup-trigger-mode');
    if (cupMode) cupMode.value = settings.cupTriggerMode || 'click';

    const cupAnimEn = document.getElementById('cup-anim-enabled');
    const cupAnimDet = document.getElementById('cup-anim-details');
    if (cupAnimEn) {
        cupAnimEn.checked = settings.cupAnimEnabled || false;
        if (cupAnimDet) cupAnimDet.style.display = cupAnimEn.checked ? 'block' : 'none';
    }

    const resType = settings.cupResultType || 'timer';
    const radio = document.querySelector(`input[name="cup-result-type"][value="${resType}"]`);
    if (radio) radio.checked = true;

    // 5. 統一處理所有與「秒數」相關的輸入框 (包含搖晃秒數、動畫秒數)
    const timeFields = {
        'input-anim-seconds': settings.animSeconds || 2,
        'cfg-splash-dur-start': settings.splashStart || 1.5,
        'cfg-splash-dur-end': settings.splashEnd || 1.0,
        'cup-time-ready': settings.cupTimeReady || 0.5,
        'cup-time-throw': settings.cupTimeThrow || 0.5,
        'cup-time-result-sec': settings.cupTimeResultSec || 0.5
    };

    for (let id in timeFields) {
        const el = document.getElementById(id);
        if (el) {
            // 強制轉換為浮點數並保留兩位小數
            el.value = parseFloat(timeFields[id]).toFixed(2);
        }
    }

    // 6. 資料庫備份設定載入
    const dbTypeSelect = document.getElementById('db-type-select');
    if (dbTypeSelect) {
        dbTypeSelect.value = localStorage.getItem('cfg_db_type') || 'local';

        const gasInput = document.getElementById('custom-gas-url');
        if (gasInput) gasInput.value = localStorage.getItem('cfg_gas_url') || '';

        const fbInput = document.getElementById('custom-firebase-config');
        if (fbInput) fbInput.value = localStorage.getItem('cfg_firebase_config') || '';

        // 觸發 UI 顯示隱藏
        if (typeof window.toggleDbInput === 'function') window.toggleDbInput();
    }

    // 🌟 修正重點：套用開場提詞與燈籠顯示 (改為預設開啟邏輯)
    const textContainer = document.getElementById('splash-text-content');
    const dynamicText = document.getElementById('splash-dynamic-text');

    // 修正：只要不是明確被設為 false，全新狀態下一律預設為 true (開啟)
    const isShow = settings.showSplashText !== false;
    const customText = settings.splashText || ''; //原本：誠心準備中......

    // 1. 更新 3D 廟門的畫面
    if (textContainer && dynamicText) {
        textContainer.style.display = isShow ? 'flex' : 'none';
        dynamicText.innerText = customText;
    }

    // 2. 同步更新設定頁面上的輸入框與開關狀態
    const chkUI = document.getElementById('chk-show-splash-text');
    const inpUI = document.getElementById('input-splash-text');
    if (chkUI) chkUI.checked = isShow;
    if (inpUI) inpUI.value = settings.splashText || '';

    // 🌟 新增連動：同步更新「啟動開場畫面 (開門動畫)」的 Checkbox 狀態
    const chkShowSplash = document.getElementById('cfg-show-splash');
    if (chkShowSplash) {
        // 配合 fortune_app.js 的寫法，非 'false' 即為勾選
        chkShowSplash.checked = localStorage.getItem('cfg_show_splash') !== 'false';
    }

    // 7. 更新畫面與預覽
    if (typeof updateImagePreviews === 'function') updateImagePreviews();
    if (typeof renderCupAnimPreviews === 'function') renderCupAnimPreviews();
    if (typeof renderSplashPreviews === 'function') renderSplashPreviews();

    // 載入擲筊結果呈現方式 (預設為 image，以相容之前上傳過的圖片)
    const cupDispMode = settings.cupDisplayMode || 'image';
    const radioDisp = document.querySelector(`input[name="cup-display-mode"][value="${cupDispMode}"]`);
    if (radioDisp) radioDisp.checked = true;

    // 執行結尾的 UI 更新排程
    if (typeof window.updateSystemTotalUI === 'function') window.updateSystemTotalUI();
    if (typeof window.enforceCupModeLogic === 'function') setTimeout(window.enforceCupModeLogic, 200);
};

// =========================================================================
// ★ 1. 萬用籤詩抽象化解析器 (Universal Poem Abstractor)
// 自動相容：內建系統、CSV 大批匯入、手動新增編輯、未來未知的自訂欄位結構
// =========================================================================
window.extractAbstractPoemSections = function (poem, customData, activeContainer) {
    if (!poem && !customData) return { meta: [], lines: [], sections: [] };
    const src = Object.assign({}, poem || {}, customData || {});

    // -----------------------------------------
    // A. 抽象提取：副標題 / 籤詩屬性 (吉凶、干支、卦象)
    // -----------------------------------------
    const meta = [];
    if (src.name) meta.push(src.name);
    if (src.level) meta.push(src.level);
    if (src.ganzhi) meta.push(src.ganzhi);
    if (src.bua) meta.push(`卦象：${src.bua}`);
    if (src.elemDir) meta.push(src.elemDir);

    // -----------------------------------------
    // B. 抽象提取：詩句本體 (相容多版本、陣列、單字串、l1~l4)
    // -----------------------------------------
    let lines = [];
    let activeKingIntents = null;

    if (src.isKing && Array.isArray(src.versions)) {
        // 情境 1：多版本陣列結構 (如六十甲子籤王)
        let activeVerIdx = src.versions.length - 1;
        if (activeContainer) {
            const btns = activeContainer.querySelectorAll('.king-btn');
            btns.forEach((b, idx) => {
                if (b.style.background.includes('0, 0, 0') || b.style.background === '#000' || b.style.background === 'rgb(0, 0, 0)') {
                    activeVerIdx = idx;
                }
            });
        }
        const kv = src.versions[activeVerIdx] || src.versions[0];
        if (kv) {
            lines = [kv.l1, kv.l2, kv.l3, kv.l4].filter(Boolean);
            if (kv.intents) activeKingIntents = kv.intents;
        }
    } else if (Array.isArray(src.v1) && Array.isArray(src.v2)) {
        // 情境 2：雙版本切換結構 (如觀音百首)
        const toggleBtn = activeContainer ? activeContainer.querySelector('.gy-toggle-btn') : null;
        const currentVer = (toggleBtn && toggleBtn.dataset.version === 'v2') ? src.v2 : src.v1;
        lines = currentVer.filter(Boolean);
    } else if (src.l1 || src.l2 || src.l3 || src.l4) {
        // 情境 3：標準四句結構 (含 CSV 匯入與手動編輯，支援只有 2 句或 3 句的特殊籤)
        lines = [src.l1, src.l2, src.l3, src.l4].map(s => (s || '').trim()).filter(Boolean);
    } else if (typeof src.poem === 'string' && src.poem.trim()) {
        // 情境 4：單一字串詩句
        lines = [src.poem.trim()];
    } else if (Array.isArray(src.lines)) {
        // 情境 5：自訂 lines 陣列
        lines = src.lines.filter(Boolean);
    }

    // -----------------------------------------
    // C. 抽象提取：聖意 / 解曰 / 自訂擴充欄位
    // -----------------------------------------
    const sections = [];

    // 內部小工具：格式化單一解曰項目 (自動判斷單行或保留多行縮排)
    const formatIntentItem = (typeStr, textStr) => {
        const cleanType = String(typeStr || '').trim();
        const cleanText = String(textStr || '').trim();
        if (!cleanType && !cleanText) return '';

        // 若使用者在 CSV 或編輯器裡有按 Enter 換行 (多行長文)，保留換行讓排版更漂亮
        if (cleanText.includes('\n')) {
            const indented = cleanText.split('\n').map(l => l.trim()).filter(Boolean).join('\n   ');
            return cleanType ? `▪ 【${cleanType}】\n   ${indented}` : `▪ ${indented}`;
        }
        return cleanType ? `▪ ${cleanType}：${cleanText}` : `▪ ${cleanText}`;
    };

    // 1. 處理結構化陣列 intents (涵蓋：CSV 匯入、手動新增編輯、媽祖、受旨宮、孔明、玄天上帝、六十甲子)
    const rawIntents = activeKingIntents || src.intents;
    if (Array.isArray(rawIntents) && rawIntents.length > 0) {
        // 智慧判斷：如果陣列裡只有 1 筆，且類型名稱本身就是大標題 (例如「聖意」、「解曰」、「解釋」)，直接當作段落標題，避免印出重複的兩層標題！
        if (rawIntents.length === 1) {
            const singleType = (rawIntents[0].type || rawIntents[0].k || '聖意 / 解曰').trim();
            const singleText = (rawIntents[0].text || rawIntents[0].v || '').trim();
            if (singleText) {
                sections.push({ title: singleType, body: singleText });
            }
        } else {
            const itemsText = rawIntents.map(item => {
                if (typeof item === 'string') return `▪ ${item.trim()}`;
                const k = item.type || item.k || item.title || item.label || '';
                const v = item.text || item.v || item.value || item.content || '';
                return formatIntentItem(k, v);
            }).filter(Boolean).join('\n');

            if (itemsText) {
                sections.push({ title: '聖意 / 解曰', body: itemsText });
            }
        }
    }

    // 2. 建立「已知擴充屬性字典」並依序提取
    const knownFieldMap = [
        { key: 'intent', title: '聖意' },
        { key: 'meaning', title: '聖意' },
        { key: 'jian_intent', title: '聖意' },
        { key: 'bao_intent', title: '詩解' },
        { key: 'interpretation', title: '解曰' },
        { key: 'dongpo', title: '東坡解' },
        { key: 'translation', title: '語譯' },
        { key: 'story', title: '典故' },
        { key: 'stories', title: '典故' },
        { key: 'english', title: 'English Translation' }
    ];

    knownFieldMap.forEach(({ key, title }) => {
        // 若已有 intents 陣列，且舊版殘留相同的 interpretation，則跳過避免重複
        if (key === 'interpretation' && Array.isArray(rawIntents) && rawIntents.length > 0) return;

        const val = src[key];
        if (!val) return;

        if (Array.isArray(val) && val.length > 0) {
            sections.push({ title, body: val.join('、') });
        } else if (typeof val === 'string' && val.trim() !== '') {
            sections.push({ title, body: val.trim() });
        }
    });

    // 3. ★ 終極抽象魔法：自動掃描並相容「未來或使用者自訂的未知欄位」！
    // (只要不是系統保留字，不管使用者在自訂 JSON / JS 外掛裡塞了什麼新欄位，都能自動抓出來顯示)
    const reservedKeys = new Set([
        'lot', 'id', 'name', 'level', 'ganzhi', 'bua', 'elemDir',
        'l1', 'l2', 'l3', 'l4', 'poem', 'lines', 'v1', 'v2', 'isKing', 'versions',
        'img', 'type', 'val', 'intents',
        ...knownFieldMap.map(m => m.key)
    ]);

    Object.keys(src).forEach(key => {
        if (reservedKeys.has(key)) return;
        const val = src[key];
        if (val === null || val === undefined || val === '') return;

        if (typeof val === 'string' && val.trim()) {
            sections.push({ title: key, body: val.trim() });
        } else if (Array.isArray(val) && val.length > 0) {
            const arrStr = val.map(v => {
                if (typeof v === 'object' && v !== null) {
                    return formatIntentItem(v.type || v.k || '', v.text || v.v || JSON.stringify(v));
                }
                return `▪ ${String(v).trim()}`;
            }).join('\n');
            sections.push({ title: key, body: arrStr });
        } else if (typeof val === 'object') {
            // 若使用者自訂了一個 Key-Value 物件，例如 { "求財": "大吉", "婚姻": "和合" }
            const objStr = Object.entries(val)
                .map(([k, v]) => formatIntentItem(k, v))
                .filter(Boolean)
                .join('\n');
            if (objStr) sections.push({ title: key, body: objStr });
        }
    });

    return { meta, lines, sections };
};

// =========================================================================
// ★ 2. 複製籤詩純文字主函式 (呼叫上方抽象化解析器 + DOM 智慧備援)
// =========================================================================
window.copyPoemText = function (sourceMode = 'collection') {
    let sys = null;
    let lotNum = null;
    let titleName = "";
    let recContext = null;

    const activeContainer = document.getElementById(
        sourceMode === 'collection' ? 'collection-view-container' : 'detail-res-container'
    );

    if (sourceMode === 'collection') {
        sys = window.currentSystem;
        lotNum = window.currentLot;
        let matchedDeity = (window.deities || []).find(x => x && sys && x.sysId === sys.id);
        titleName = matchedDeity ? (matchedDeity.temple || matchedDeity.name) : (window.currentCollectionTitle || (sys ? sys.name : "籤詩"));
    } else if (sourceMode === 'record') {
        const recId = window.currentDetailRecordId || document.getElementById('detail-id')?.value;
        const r = (window.records || []).find(x => x.id == recId);
        if (!r) return window.showToast("⚠️ 找不到紀錄資料");
        recContext = r;
        lotNum = r.lot;

        let realDeityName = (r.type || "")
            .replace('(問事)', '').replace('問事', '')
            .replace('(比較)', '').replace('比較擲筊', '').replace('比較', '')
            .replace('(一般)', '').replace('一般求籤', '').trim();

        let deity = (window.deities || []).find(d => d.name === realDeityName || d.name === r.type);
        if (deity && window.poemSystems && window.poemSystems[deity.sysId]) {
            sys = window.poemSystems[deity.sysId];
            titleName = `${deity.temple ? deity.temple + ' ' : ''}${deity.name}`;
        } else if (window.settings && settings.defaultSystem && window.poemSystems[settings.defaultSystem]) {
            sys = window.poemSystems[settings.defaultSystem];
            titleName = realDeityName || sys.name;
        } else {
            titleName = realDeityName || "求籤紀錄";
        }
    }

    const cleanLot = parseInt(lotNum, 10);
    let lotTitle = (typeof window.formatStickCnLot === 'function' && !isNaN(cleanLot))
        ? window.formatStickCnLot(cleanLot, false)
        : (lotNum && lotNum !== '-' ? `第 ${lotNum} 籤` : '');

    if (sys && (sys.id === 'Baishatun_Mazu' || sys.Id === 'Shanbian_Mazu') && (cleanLot === 0 || cleanLot === 101)) {
        lotTitle = "第一〇一首 (籤王)";
    }

    let poem = (sys && sys.content) ? (sys.content[cleanLot] || (cleanLot === 101 ? sys.content[0] : null)) : null;
    let customKey = (sys ? sys.id : '') + '_' + cleanLot;
    let customData = (window.customPoems && window.customPoems[customKey]) ? window.customPoems[customKey] : null;

    let textLines = [];
    textLines.push(`【${titleName}】${lotTitle}`.trim());

    // ★ 呼叫抽象化解析器
    const parsed = window.extractAbstractPoemSections(poem, customData, activeContainer);

    if (parsed.meta.length > 0) {
        textLines.push(parsed.meta.join(' ｜ '));
    }

    if (parsed.lines.length > 0) {
        textLines.push('');
        textLines.push('【籤詩】');
        textLines.push(parsed.lines.join('\n'));
    }

    if (parsed.sections.length > 0) {
        parsed.sections.forEach(sec => {
            textLines.push('');
            textLines.push(`【${sec.title}】`);
            textLines.push(sec.body);
        });
    }

    // ★ 終極防呆備援：萬一使用者是用純自訂 HTML 版型寫死的文字、導致資料庫物件是空的，自動從畫面 DOM 擷取純文字
    if (parsed.lines.length === 0 && parsed.sections.length === 0 && activeContainer) {
        const slipEl = activeContainer.querySelector('.fortune-slip') || activeContainer;
        const domText = (slipEl.innerText || '').trim();
        if (domText) {
            textLines.push('');
            textLines.push(domText);
        }
    }

    // 若是從「紀錄明細」複製，附上求籤日期與主旨備註
    if (sourceMode === 'record' && recContext) {
        textLines.push('');
        textLines.push('--------------------');
        if (recContext.date) textLines.push(`📅 日期：${recContext.date}`);
        if (recContext.subject) textLines.push(`🙏 主旨：${recContext.subject}`);
        if (recContext.note) textLines.push(`📝 備註：${recContext.note}`);
    }

    const finalStr = textLines.join('\n').trim();

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(finalStr).then(() => {
            if (typeof window.showToast === 'function') window.showToast("✅ 已複製籤詩純文字！");
        }).catch(() => {
            fallbackCopyText(finalStr);
        });
    } else {
        fallbackCopyText(finalStr);
    }
};

function fallbackCopyText(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
        document.execCommand('copy');
        if (typeof window.showToast === 'function') window.showToast("✅ 已複製籤詩純文字！");
    } catch (err) {
        if (typeof window.showToast === 'function') window.showToast("❌ 複製失敗，請手動選取");
    }
    document.body.removeChild(ta);
}