// 新增：強化版圖片判斷器
function isImageUrl(str) {
    if (!str) return false;
    // 只要是 data:image 開頭，或是 http/https 開頭，都視為圖片
    return str.startsWith('data:image') || str.startsWith('http://') || str.startsWith('https://');
}

// ==========================================
// ★ 核心資料庫初始化 (防呆安全版)
// ==========================================
window.poemSystems = window.poemSystems || {};
window.extraDeities = window.extraDeities || [];
/* --- 0. 清除畫面函數 (防止圖片殘留核心) --- */
function clearDeityDisplay() {
    // 針對所有可能顯示圖片的 ID，全部清空內容
    const targetIds = ['deity-icon-display', 'step1-deity-header', 'step2-deity-header', 'step-1-icon'];
    targetIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = ""; // 直接清空
    });
}

/* --- 1. 啟動一般求籤 (修正版) --- */
function startNormalMode() {
    // 1. 清空舊顯示
    clearDeityDisplay();

    // 2. 設定模式
    currentMode = 'normal';
    currentDeity = null; // ★ 這一行最重要，null 才會顯示卷軸

    // 3. 設定系統
    if (settings.defaultSystem && poemSystems[settings.defaultSystem]) {
        currentSystem = poemSystems[settings.defaultSystem];
    } else {
        const t = settings.customTotal || 101;
        currentSystem = { id: 'custom', name: '自訂籤數', total: t, content: {} };
    }

    // 4. 跳轉
    goTo('qiuqian');
}

/* --- 2. 啟動神明求籤  --- */
function startDeityQiuqian(id) {
    clearDeityDisplay();

    currentMode = 'deity';
    currentDeity = deities.find(x => x.id === id);

    if (currentDeity) {
        currentSystem = poemSystems[currentDeity.sysId] || poemSystems['mazu'];
    }

    goTo('qiuqian');
}

function initAll() {
    syncCoreData();
    refreshSelectDeityList();
    initCupIcons();
    populateManualTypes();
    populateSimpleCompareDeities(); // 預載神明選單
    if (typeof window.initDatabaseEngine === 'function') {
        window.initDatabaseEngine();
    }
}

/* ---------------------------------------------------- */
/* 3. 頁面導航 (Page Navigation) - 優化整合版 */
/* ---------------------------------------------------- */
// 路由歷史管理
// ★ 新增一個變數，記錄是否正在求籤中
let isQiuqianActive = false;

/* ---------------------------------------------------- */
/* 3. 頁面導航與全域防呆攔截 (Page Navigation) */
/* ---------------------------------------------------- */
let isCompareActive = false; // ★ 新增比較擲筊的狀態旗標

// 統一的離開防呆攔截器 (升級版 async - 深度偵測未儲存陣列，保證徹底解鎖)
async function checkUnsaved(targetPage) {
    // 💡 動態判斷陣列裡是否已經有資料 (包含歷史紀錄，或是剛擲出的筊)
    let hasSimpleData = (typeof simpleSessionHistory !== 'undefined' && simpleSessionHistory.length > 0) ||
        (typeof simpleTempCups !== 'undefined' && simpleTempCups.some(c => c !== null));

    let hasCompareData = (typeof compareState !== 'undefined' && compareState.results && compareState.results.length > 0) ||
        (typeof compFuHistory !== 'undefined' && compFuHistory.length > 0);

    // 如果是跳往同一個頁面，直接放行
    if (targetPage === 'qiuqian' && isQiuqianActive) return true;
    if (targetPage === 'simple' && hasSimpleData) return true;
    if (targetPage === 'compare' && hasCompareData) return true;

    if (isQiuqianActive) {
        if (!(await window.safeConfirm("⚠️ 求籤尚未完成或儲存，確定要中斷並離開嗎？"))) return false;
        isQiuqianActive = false;
    }

    // ★ 處理問事：不僅清空陣列，更要強制解除 Active 狀態與呼叫終極重置
    if (hasSimpleData || (typeof isSimpleActive !== 'undefined' && isSimpleActive)) {
        if (!(await window.safeConfirm("⚠️ 您的「問事對話」尚未儲存，確定要離開嗎？\n(未儲存的內容將會遺失)"))) return false;
        if (typeof isSimpleActive !== 'undefined') isSimpleActive = false;
        if (typeof window.resetSimple === 'function') window.resetSimple(true);
    }

    // ★ 處理比較：不僅清空陣列，更要強制解除 Active 狀態與呼叫終極重置
    if (hasCompareData || (typeof isCompareActive !== 'undefined' && isCompareActive)) {
        if (!(await window.safeConfirm("⚠️ 您的「比較擲筊」尚未結束或儲存，確定要離開嗎？\n(未儲存的內容將會遺失)"))) return false;
        if (typeof isCompareActive !== 'undefined') isCompareActive = false;
        if (typeof window.resetCompare === 'function') window.resetCompare(true);
    }
    return true;
}

// ★ 新增：全域捲軸位置記憶體
window.scrollMemory = {};

// 路由歷史管理 (全面防呆版 + 捲軸記憶 + 純 SPA 滑順切換)
window.goTo = async function (pageId) {
    // 1. 檢查未儲存狀態 (統一防呆，包含回首頁也要檢查)
    if (typeof checkUnsaved === 'function' && !await checkUnsaved(pageId)) return;

    // 2. ★ 離開前：紀錄捲軸位置 (保留你的完美邏輯)
    const activePage = document.querySelector('.page.active');
    if (activePage) {
        const activeId = activePage.id.replace('page-', '');
        const mainEl = document.querySelector('main');
        window.scrollMemory[activeId] = {
            win: window.scrollY || document.documentElement.scrollTop,
            main: mainEl ? mainEl.scrollTop : 0,
            page: activePage.scrollTop
        };
    }

    // 3. 推入歷史紀錄
    window.history.pushState({ page: pageId }, '', '#' + pageId);

    // 4. ★ 核心修改：不管去哪一頁，通通走純前端渲染，拔除 reload
    if (typeof renderPage === 'function') {
        renderPage(pageId);
    }

    // 如果是回到首頁，背景靜默更新紀錄列表，不閃爍！
    if (pageId === 'home' && typeof renderRecords === 'function') {
        renderRecords();
    }
};

// ★ 安全的確認彈窗 (如果自訂視窗失效，自動降級為瀏覽器原生視窗，保證不卡死)
window.safeConfirm = async function (msg) {
    try {
        if (typeof showConfirm === 'function') {
            return await showConfirm(msg, "請確認");
        } else {
            return window.confirm(msg);
        }
    } catch (e) {
        return window.confirm(msg); // 發生錯誤才用原生的
    }
};

// ==========================================
// ★ 1. 動態生成的無敵漂亮視窗 (保證不卡死、不被蓋住)
// ==========================================
window.smartConfirm = function (msg, title = "請確認") {
    return new Promise(resolve => {
        // 先移除可能殘留的舊視窗，確保每次都是全新的
        let existing = document.getElementById('smart-confirm-modal');
        if (existing) existing.remove();

        // 🌟 文字處理魔法：遇到逗號、句號、驚嘆號、問號時自動換行
        // 先將原有的 \n 換成 <br>，接著在標點符號後補上 <br>，最後消除連續多餘的 <br>
        let formattedMsg = msg
            .replace(/\n/g, '<br>')
            .replace(/([，。！？；])/g, '$1<br>')
            .replace(/(<br>)+/g, '<br>');

        const modalHtml = `
        <div id="smart-confirm-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); z-index: 9999999; display: flex; justify-content: center; align-items: center; flex-direction: column; animation: fadeIn 0.2s;">
            <div style="background: #2d2d2d; width: 82%; max-width: 290px; border-radius: 16px; padding: 25px 20px; text-align: center; border: 1px solid var(--accent, #ffb300); box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                <div style="font-size:3rem; margin-bottom:10px;">⚠️</div>
                <h3 style="margin-top:0; color:#fff;">${title}</h3>
                
                <p style="color:#f5f5f5; font-size:1.1rem; line-height:1.6; white-space: normal; margin: 15px 0;">${formattedMsg}</p>
                
                <div style="display: flex; gap: 10px; margin-top: 25px;">
                    <button id="sc-btn-no" style="flex:1; background: transparent; border: 1px solid #555; color: #ccc; padding: 12px; border-radius: 8px; font-size: 1.05rem; cursor: pointer;">取消</button>
                    <button id="sc-btn-yes" style="flex:1; background: var(--primary, #d32f2f); color: white; border: none; padding: 12px; border-radius: 8px; font-size: 1.05rem; font-weight: bold; cursor: pointer;">確定</button>
                </div>
            </div>
        </div>`;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modal = document.getElementById('smart-confirm-modal');

        // 綁定點擊事件，點完立刻銷毀 HTML 元素，乾淨俐落！
        document.getElementById('sc-btn-yes').onclick = () => { modal.remove(); resolve(true); };
        document.getElementById('sc-btn-no').onclick = () => { modal.remove(); resolve(false); };
    });
};

// ==========================================
// ★ 2. 終極路由引擎與強制回首頁
// ==========================================
window.forceGoHome = function () {
    // 解除所有活躍狀態
    window.isThrowingCup = false;
    isQiuqianActive = false;
    if (typeof isSimpleActive !== 'undefined') isSimpleActive = false;
    if (typeof isCompareActive !== 'undefined') isCompareActive = false;

    // 🌟 核心魔法：設定軟重載記號，並直球 reload
    sessionStorage.setItem('skipSplash', 'true');
    window.location.hash = '#home';
    location.reload();
};

// ==========================================
// ★ 實體返回鍵監聽 (popstate) 終極完美融合版
// ==========================================
window.addEventListener('popstate', async function (e) {
    let isModalIntercepted = false;

    // 1. 全域彈窗攔截
    const openModals = document.querySelectorAll('.modal');
    openModals.forEach(m => {
        if (m.style.display === 'flex' || m.style.display === 'block') {
            m.style.display = 'none';
            isModalIntercepted = true;
        }
    });

    const modal1 = document.getElementById('deity-select-modal');
    const modal2 = document.getElementById('quick-add-deity-modal');
    if (modal2 && modal2.style.display === 'flex') { modal2.style.display = 'none'; isModalIntercepted = true; }
    if (modal1 && modal1.style.display === 'flex') { modal1.style.display = 'none'; isModalIntercepted = true; }

    if (isModalIntercepted) {
        const activePage = document.querySelector('.page.active');
        if (activePage) {
            const activeId = activePage.id.replace('page-', '');
            window.history.pushState({ page: activeId }, '', '#' + activeId);
        }
        return;
    }

    // ==========================================
    // 🚪 訴求一：首頁防誤觸退出與「關廟門動畫」
    // ==========================================
    // 如果退回到沒有 state 且 hash 為空（首頁），準備離開網頁
    if (!e.state && (!window.location.hash || window.location.hash === '')) {
        //const isExit = await window.showConfirm("🔮 您準備要離開廟宇了嗎？", "離開確認");
        
        //if (isExit) {
            const splashEl = document.getElementById('app-splash-screen');
            if (splashEl) {
                // 將開場遮罩拉回最上層
                splashEl.style.display = 'flex';
                splashEl.style.opacity = '1';
                splashEl.style.zIndex = '99999';
                
                // 觸發 CSS 關門動畫
                splashEl.classList.remove('doors-opening'); 
                
                // 等待動畫結束後關閉與轉址
                setTimeout(() => {
                    try { window.close(); } catch(err) {}
                    window.location.replace("about:blank"); 
                }, 1500); 
            }
            return; 
        //} else {
            // 反悔：鎖住畫面維持現狀
        //    window.history.pushState({ page: 'home' }, '', '#home');
        //    return;
        //}
    }

    // ==========================================
    // 🌟 保留你原本的邏輯：紀錄捲軸位置 & 設定頁自動存檔
    // ==========================================
    const activePage = document.querySelector('.page.active');
    if (activePage) {
        const activeId = activePage.id.replace('page-', '');
        const mainEl = document.querySelector('main');
        window.scrollMemory = window.scrollMemory || {};
        window.scrollMemory[activeId] = { win: window.scrollY, main: mainEl ? mainEl.scrollTop : 0, page: activePage.scrollTop };

        const savePages = ['settings', 'settings-bg', 'settings-image', 'settings-anim', 'settings-cup-anim', 'settings-normal', 'settings-mode', 'settings-backup', 'manage-deities', 'manage-systems', 'edit-deity', 'edit-system', 'edit-single-poem'];

        if (savePages.includes(activeId)) {
            const oldSettingsStr = JSON.stringify(typeof settings !== 'undefined' ? settings : {});
            if (typeof window.saveSettings === 'function') window.saveSettings();
            const newSettingsStr = JSON.stringify(typeof settings !== 'undefined' ? settings : {});

            if (oldSettingsStr !== newSettingsStr) {
                if (typeof window.showToast === 'function') window.showToast("💾 已自動儲存變更");
            }
        }
    }

    // ==========================================
    // 🌟 保留你原本的邏輯：未儲存資料的防護網
    // ==========================================
    let hasSimpleData = (typeof simpleSessionHistory !== 'undefined' && simpleSessionHistory.length > 0) ||
        (typeof simpleTempCups !== 'undefined' && simpleTempCups.some(c => c !== null));
    let hasCompareData = (typeof compareState !== 'undefined' && compareState.results && compareState.results.length > 0) ||
        (typeof compFuHistory !== 'undefined' && compFuHistory.length > 0);

    if ((typeof isQiuqianActive !== 'undefined' && isQiuqianActive) || hasSimpleData || hasCompareData || (typeof isCompareActive !== 'undefined' && isCompareActive)) {

        let currentPage = 'home';
        if (typeof isQiuqianActive !== 'undefined' && isQiuqianActive) currentPage = 'qiuqian';
        else if (hasSimpleData || (typeof isSimpleActive !== 'undefined' && isSimpleActive)) currentPage = 'simple';
        else if (hasCompareData || (typeof isCompareActive !== 'undefined' && isCompareActive)) currentPage = 'compare';

        window.history.pushState({ page: currentPage }, '', '#' + currentPage);

        let msg = "確定要中斷並離開嗎？未儲存的內容將會遺失。";
        if (typeof isQiuqianActive !== 'undefined' && isQiuqianActive) msg = "⚠️ 求籤尚未完成，確定要放棄離開嗎？";
        else if (hasSimpleData) msg = "⚠️ 您的「問事對話」尚未儲存，確定要放棄並離開嗎？";
        else if (hasCompareData) msg = "⚠️ 您的「比較擲筊」尚未儲存，確定要放棄並離開嗎？";

        //精美的showConfim視窗，考量程式運作安全性捨去不用
        //const confirmed = typeof window.smartConfirm === 'function' ? await window.smartConfirm(msg, "中斷確認") : confirm(msg);
        const confirmed = confirm(msg); // 🛑 強制呼叫原生視窗凍結實體返回鍵

        if (confirmed) {
            if (typeof isQiuqianActive !== 'undefined') isQiuqianActive = false;
            if (hasSimpleData && typeof window.resetSimple === 'function') window.resetSimple(true);
            if ((hasCompareData || (typeof isCompareActive !== 'undefined' && isCompareActive)) && typeof window.resetCompare === 'function') window.resetCompare(true);

            setTimeout(() => {
                window.history.back();
            }, 10);
        }
        return;
    }

    // ==========================================
    // 🌟 換頁渲染
    // ==========================================
    const targetPage = e.state ? e.state.page : 'home';
    const currentHash = window.location.hash.replace('#', '') || 'home';

    if (typeof renderPage === 'function') renderPage(targetPage || currentHash);
    if ((targetPage === 'home' || currentHash === 'home') && typeof renderRecords === 'function') renderRecords();
});


// 核心渲染函數
function renderPage(p) {
    window.isThrowingCup = false; // ★ 每次換頁時，強制解除所有的擲筊鎖定，避免卡死
    // ★ 幽靈驅除器：每次換頁時，強制隱藏所有可能卡住的彈出視窗
    document.querySelectorAll('.modal-overlay').forEach(el => el.style.display = 'none');

    // 1. 切換頁面顯示
    document.querySelectorAll('.page').forEach(x => x.classList.remove('active'));
    const target = document.getElementById('page-' + p) || document.getElementById('page-home');
    if (target) {
        target.classList.add('active');
    } else {
        console.warn('找不到對應的頁面元素：', p);
    }

    // 設定頁面清單定義（提早到上方供導覽列與快照機制共用）
    const savePages = ['settings', 'settings-bg', 'settings-image', 'settings-anim', 'settings-cup-anim', 'settings-normal', 'settings-mode', 'settings-backup', 'manage-deities', 'manage-systems', 'edit-deity', 'edit-system', 'edit-single-poem'];

    // 2. ★強制顯示全域 Header 與動態返回按鈕
    const globalHeader = document.querySelector('header');
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.style.display = (p === 'home') ? 'none' : 'block';

        // ★ 終極修正 1：不再強制呼叫 saveAndGoBack()，統一交給具備快照比對功能的 goBack() 接管！
        if (savePages.includes(p)) {
            backBtn.innerText = '💾 & ↩';
            backBtn.onclick = function () {
                // 統一呼叫全域智慧返回，由 goBack 內部的靜音存檔與快照差異演算法來決定要不要跳 Toast
                window.goBack();
            };
        } else {
            backBtn.innerText = '返回 ↩';
            backBtn.onclick = function () {
                window.goBack();
            };
        }
    }

    // 3. 設定標題與頁面初始化
    let title = "擲筊助手";
    switch (p) {
        case 'select-deity':
            title = "選擇神明";
            refreshSelectDeityList();
            break;

        case 'manage-deities':
            title = "⚙️ 設定 - 神明管理";
            renderManageDeityList();
            break;

        case 'sort-deities':
            title = "調整神明順序";
            break;

        case 'edit-deity':
            title = "編輯神明";
            break;

        case 'edit-system':
            title = "⚙️ 設定 - 新增籤詩系統";
            break;

        case 'collection-view':
            title = "籤詩內容";
            break;

        case 'edit-single-poem':
            title = "編輯籤詩";
            break;

        case 'record-detail':
            title = "紀錄明細";
            break;

        case 'qiuqian':
            if (currentMode !== 'normal' && !currentDeity) {
                console.warn("⚠️ 偵測到神明狀態遺失，攔截崩潰並導回首頁");
                if (typeof window.forceGoHome === 'function') {
                    window.forceGoHome();
                } else {
                    window.history.replaceState({ page: 'home' }, '', '#home');
                    renderPage('home');
                }
                return;
            }

            title = (currentMode === 'normal') ? "一般求籤" : (currentDeity ? currentDeity.name : "求籤");
            isQiuqianActive = true;
            initQiuqian();
            break;

        case 'collection-menu':
            title = "籤詩收錄";
            renderCollectionMenu();
            break;

        case 'records':
            title = "紀錄查詢";
            renderRecords();
            break;

        case 'settings':
            title = "⚙️ 設定中心";
            loadSettings();
            break;

        case 'settings-bg':
            title = "⚙️ 設定 - 背景主題";
            loadSettings();
            break;

        case 'settings-image':
            title = "⚙️ 設定 - 圖像自訂";
            loadSettings();
            initCupIcons();
            break;

        case 'settings-cup-anim':
            title = "⚙️ 設定 - 擲筊動畫";
            loadSettings();
            if (typeof renderCupAnimPreviews === 'function') renderCupAnimPreviews();
            break;

        case 'settings-anim':
            title = "⚙️ 設定 - 視覺與動畫";
            loadSettings();
            break;

        case 'settings-normal':
            title = "⚙️ 設定 - 一般求籤";
            loadSettings();
            break;

        case 'settings-mode':
            title = "⚙️ 設定 - 抽籤模式";
            loadSettings();
            break;

        case 'settings-backup':
            title = "⚙️ 設定 - 系統備份";
            break;

        case 'manage-systems':
            title = "⚙️ 設定 - 籤詩管理";
            renderSystemManager();
            break;

        case 'manual-add':
            title = "新增紀錄";
            populateManualTypes();
            break;

        case 'simple':
            title = "問事擲筊";
            if (typeof window.resetSimple === 'function') {
                window.resetSimple(true);
            }
            break;

        case 'compare':
            title = "比較擲筊";
            if (typeof window.resetCompare === 'function') {
                window.resetCompare(true);
            }
            break;

        case 'collection-list':
            break;

        case 'home':
        default:
            title = "擲筊助手";
            break;
    }

    // ★ 終極修正 2：在所有 loadSettings() 初始化完畢、UI baseline 建立的「黃金時間點」，立刻拍下初始快照！
    if (savePages.includes(p)) {
        if (typeof window.captureSettingsSnapshot === 'function') {
            window.captureSettingsSnapshot();
        }
    }

    // 4. 更新 Header 中間的文字
    const headerTitle = document.getElementById('header-title');
    if (headerTitle) headerTitle.innerText = title;

    setTimeout(initIcons, 50);
    applyTheme();

    // ★ 進入畫面後：全方位還原捲動高度
    setTimeout(() => {
        const saved = window.scrollMemory[p] || { win: 0, main: 0, page: 0 };

        // 1. 還原 Window 高度
        window.scrollTo({ top: saved.win, behavior: 'instant' });

        // 2. 還原 main 容器高度
        const mainEl = document.querySelector('main');
        if (mainEl) mainEl.scrollTop = saved.main;

        // 3. 還原 page 容器高度
        if (target) target.scrollTop = saved.page;

    }, 50);
}

/* --- 4. 圖示與 Emoji --- */
function getDisplayHtml(key, defaultEmoji, className) {
    const storedImg = localStorage.getItem(key);
    if (storedImg && storedImg.startsWith('data:image')) {
        return `<img src="${storedImg}" class="${className}" alt="img">`;
    }
    return `<div class="${className.includes('big') ? 'big-emoji' : 'icon-box'}"><span class="${className.includes('big') ? 'big-emoji' : 'icon-emoji'}">${defaultEmoji}</span></div>`;
}

/* --- 修正圖片顯示邏輯 (v44 穩定版) --- */
function initIcons() {
    let activeHtml = "";

    if (currentMode === 'normal') {
        activeHtml = `<div style="font-size:6rem; text-align:center; display:block; width:100%;">📜</div>`;
    }
    else if (currentDeity) {
        // 🌟 優先權 1：如果有手動上傳的圖片 (iconType 為 img)
        if (currentDeity.iconType === 'img' && currentDeity.iconVal) {
            activeHtml = `<img src="${currentDeity.iconVal}" class="big-img" style="height: 38vh; max-height: 280px; aspect-ratio: 13 / 18; width: auto; object-fit:cover; object-position: center 15%; border-radius:12px; border:3px solid var(--accent); display:block; margin:0 auto; box-shadow: 0 0 15px rgba(255, 235, 59, 0.4);">`;
        }
        // 🌟 優先權 2：如果有設定內建圖片路徑 (builtInImg)
        else if (currentDeity.builtInImg) {
            activeHtml = `<img src="${currentDeity.builtInImg}" class="big-img" style="height: 38vh; max-height: 280px; aspect-ratio: 13 / 18; width: auto; object-fit:cover; object-position: center 15%; border-radius:12px; border:3px solid var(--accent); display:block; margin:0 auto; box-shadow: 0 0 15px rgba(255, 235, 59, 0.4);">`;
        }
        // 🌟 優先權 3：顯示 Emoji (iconType 為 emoji)
        else {
            activeHtml = `<div style="font-size:6rem; text-align:center; display:block; width:100%;">${currentDeity.iconVal}</div>`;
        }
    }
    else {
        activeHtml = `<div style="font-size:6rem; text-align:center; display:block; width:100%;">🔮</div>`;
    }

    // 2. 更新 DOM (針對 V99 版的 step1~3 ID)
    ['step1', 'step2', 'step3'].forEach(prefix => {
        const el = document.getElementById(`${prefix}-deity-header`);
        if (el) {
            el.innerHTML = activeHtml;
            // 強制重繪，避免瀏覽器渲染延遲
            el.style.display = 'flex';
            el.style.justifyContent = 'center';
            el.style.alignItems = 'center';
        }
    });

    // 3. 更新設定頁面的籤筒預覽
    const qtImg = localStorage.getItem('custom_qiantong_static') || QIANTONG_DEFAULT;
    const qtEl = document.getElementById('preview-qiantong');
    if (qtEl) {
        if (qtImg.startsWith('data:image')) qtEl.innerHTML = `<img src="${qtImg}" style="width:50px;height:50px;object-fit:contain">`;
        else qtEl.innerText = qtImg;
    }

    // 4. 更新筊杯
    initCupIcons();
}

function getIconHtml(d, isBig = false) {
    // 🌟 判斷是否要顯示圖片 (包含手動上傳 img 或 內建 builtInImg)
    if (d.iconType === 'img' || d.builtInImg) {
        const cls = isBig ? 'big-img' : 'icon-img';
        const src = (d.iconType === 'img' && d.iconVal) ? d.iconVal : d.builtInImg;
        return `<img src="${src}" class="${cls}">`;
    } else {
        // 顯示 Emoji
        const cls = isBig ? 'big-emoji' : 'icon-emoji';
        return `<div class="${isBig ? 'step-deity-header' : 'icon-box'}"><span class="${cls}">${d.iconVal}</span></div>`;
    }
}

/* --- 6. 求籤邏輯 (修正版) --- */
function startQiuqian(mode) {
    if (mode === 'normal') {
        currentMode = 'normal';
        currentDeity = null;
        currentSystem = null;
        goTo('qiuqian');
    }
}

/* --- v40.0 雙模式抽籤引擎 --- */
// 初始化求籤頁面
function initQiuqian() {
    window.availableLots = null;
    saintCount = 0;
    currentLot = 0;
    isDrawing = false;
    isShaking = false;
    window.sessionDrawnLots = null; // 每次進入求籤，重置已抽過的籤筒陣列
    window.isFortuneSaved = false;

    // ★ 新增：每次重新求籤時清空問事內容輸入框
    const step1Sub = document.getElementById('input-qiuqian-subject-step1');
    if (step1Sub) step1Sub.value = "";

    // 隱藏後續步驟
    ['step-2', 'step-3', 'step-4'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    // 判斷「是否跳過稟報」，只有一般求籤且設定開啟時才允許跳過
    const shouldSkip = settings.skip && currentMode === 'normal';

    // ★ 修改 1：無論是否跳過，永遠都先顯示步驟 1 (稟報頁)
    const step1 = document.getElementById('step-1');
    if (step1) step1.style.display = 'flex';

    // 設置標題與輸入框
    const step1Text = document.getElementById('step-1-text');
    const normalInput = document.getElementById('normal-deity-input-box');

    if (currentMode === 'normal') {
        if (step1Text) step1Text.innerText = "弟子/信女誠心稟報...";
        if (normalInput) {
            normalInput.style.display = 'block';
            document.getElementById('input-normal-deity').value = "";
        }

        // ★ 核心修正 4：初始化當次籤詩系統選單
        const normalSysInput = document.getElementById('normal-system-input-box');
        if (normalSysInput) {
            normalSysInput.style.display = 'block';
            const sel = document.getElementById('input-normal-system');

            // 產生選單選項
            sel.innerHTML = '<option value="">預設 (不指定/數字籤)</option>';
            Object.values(window.poemSystems).forEach(s => {
                sel.innerHTML += `<option value="${s.id}">${s.name} (${s.total}籤)</option>`;
            });

            // 讀取當次暫存記憶 (若無，則首次帶入全域設定)
            if (typeof window.sessionNormalSystem === 'undefined') {
                window.sessionNormalSystem = (typeof settings !== 'undefined' && settings.defaultSystem) ? settings.defaultSystem : '';
            }
            sel.value = window.sessionNormalSystem;
            window.changeSessionNormalSystem(); // 套用選擇
        }

        showIcon(null);
    } else {
        // 神明求籤模式，隱藏這些一般求籤專屬的輸入框
        let deityName = currentDeity ? currentDeity.name : '神明';
        if (step1Text) step1Text.innerText = `請向${deityName}稟報...`;

        if (normalInput) normalInput.style.display = 'none';
        const normalSysInput = document.getElementById('normal-system-input-box');
        if (normalSysInput) normalSysInput.style.display = 'none';

        showIcon(currentDeity);
    }

    // ★ 修改 2：動態處理按鈕與筊杯顯示邏輯
    const permCup = document.getElementById('perm-cup');
    const btnPerm = document.getElementById('btn-perm');
    const msg = document.getElementById('perm-reject-msg');
    if (msg) msg.style.display = 'none';

    if (shouldSkip) {
        // 【跳過請示模式】：隱藏筊杯預覽，按鈕改為「前往抽籤」
        if (typeof updateCupDisplay === 'function') updateCupDisplay('perm-cup', { text: '', type: -1 });
        if (permCup) permCup.style.display = 'none';

        if (btnPerm) {
            btnPerm.innerText = "前往抽籤 ❯";
            btnPerm.style.display = 'block'; // ★ 破案關鍵：強制顯示！
            btnPerm.disabled = false;        // ★ 破案關鍵：強制解鎖！
            btnPerm.onclick = function () {
                document.getElementById('step-1').style.display = 'none';
                document.getElementById('step-2').style.display = 'flex';
                if (typeof setupDrawStep2 === 'function') setupDrawStep2();
            };
        }
    } else {
        // 【正常請示模式】：顯示筊杯，按鈕為「擲筊請示」
        if (permCup) permCup.style.display = '';
        if (typeof updateCupDisplay === 'function') updateCupDisplay('perm-cup', { text: '準備請示', type: -1 });

        if (btnPerm) {
            btnPerm.innerText = "🙏 擲筊請示";
            btnPerm.style.display = 'block'; // ★ 破案關鍵：強制顯示！
            btnPerm.disabled = false;        // ★ 破案關鍵：強制解鎖！
            btnPerm.onclick = window.askPermission;
        }
    }
}

// ★ 新增函式：處理下拉選單變更，並記住當次選擇
window.changeSessionNormalSystem = function () {
    const selVal = document.getElementById('input-normal-system').value;
    window.sessionNormalSystem = selVal; // 獨立記住當次選擇，不寫入全域 settings

    if (selVal && window.poemSystems && window.poemSystems[selVal]) {
        currentSystem = window.poemSystems[selVal];
    } else {
        const t = (typeof settings !== 'undefined' && settings.customTotal) ? settings.customTotal : 101;
        currentSystem = { id: 'custom', name: '自訂籤數', total: t, content: {} };
    }
};

function showIcon(d) {
    const targetIds = ['step1-deity-header', 'step2-deity-header'];
    let html = '<div class="big-emoji">📜</div>';

    if (d) {
        if (d.iconType === 'img') {
            html = `<img src="${d.iconVal}" class="big-img">`;
        } else {
            html = `<div class="big-emoji">${d.iconVal}</div>`;
        }
    }

    targetIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
    });
}

// ==========================================
// ★ 請示神明賜籤 (加入聖筊瞬間鎖定防護)
// ==========================================
window.askPermission = function () {
    const btn = document.getElementById('btn-perm');

    // 交給核心引擎擲筊
    window.executeThrowCupWrapper(btn, (res) => {
        if (typeof updateCupDisplay === 'function') updateCupDisplay('perm-cup', res);

        if (res.type === 1) { // 🌟 擲出聖筊
            document.getElementById('perm-reject-msg').style.display = 'none';

            // ★ 核心修復：立刻將按鈕隱藏，徹底防止使用者在動畫過場時手癢連點！
            if (btn) btn.style.display = 'none';

            setTimeout(() => {
                document.getElementById('step-1').style.display = 'none';
                document.getElementById('step-2').style.display = 'flex';
                if (typeof setupDrawStep2 === 'function') setupDrawStep2();

                window.isThrowingCup = false; // 進入下一階段，安全解鎖
            }, 800);

            return true;
        } else { // ❌ 笑筊 或 蓋筊
            const msgEl = document.getElementById('perm-reject-msg');
            if (msgEl) {
                msgEl.style.display = 'block'; // 確保元素可見

                // 🌟 加入呼吸燈特效邏輯 🌟
                // 1. 先拔掉可能殘留的動畫 class
                msgEl.classList.remove('rejection-blink');

                // 2. 這是魔法！強制瀏覽器重新計算佈局 (Trigger Reflow)，這樣動畫才會重置
                void msgEl.offsetWidth;

                // 3. 重新掛上動畫 class，開始閃爍！
                msgEl.classList.add('rejection-blink');
            }

            // 讓核心引擎自然解除鎖定，讓使用者可以再次點擊
            return false;
        }
    });
};

function getCupResult() {
    const r1 = Math.random() > 0.5;
    const r2 = Math.random() > 0.5;

    let type, text, dotClass, char, key;

    if (!r1 && !r2) {
        type = 0;
        text = "蓋筊";
        char = "蓋";
        dotClass = "dot-covered";
        key = 'custom_cup_covered'; // 預留給自訂圖片的 key
    }
    else if (r1 && r2) {
        type = 0;
        text = "笑筊";
        char = "笑";
        dotClass = "dot-laugh";
        key = 'custom_cup_laugh';
    }
    else {
        type = 1;
        text = "聖筊";
        char = "聖";
        dotClass = "dot-saint";
        key = 'custom_cup_saint';
    }

    // 檢查是否有使用者自訂的上傳圖片
    let imgSrc = localStorage.getItem(key);

    // ★ 核心攔截：如果設定為 'text'，強制把圖片設為 null，系統就會乖乖畫陰刻文字！
    if (settings.cupDisplayMode === 'text') {
        imgSrc = null;
    }

    return { type, text, dotClass, char, imgSrc };
}

// ==========================================
// ★ 籤詩收錄：跨系統全域搜尋引擎
// ==========================================
window.searchGlobalPoems = function () {
    const keyword = document.getElementById('globalPoemSearch').value.toLowerCase().trim();
    const resContainer = document.getElementById('globalSearchResult');
    const menuContainer = document.getElementById('coll-menu-container');

    // 如果沒有輸入字，恢復顯示方塊選單
    if (!keyword) {
        resContainer.style.display = 'none';
        menuContainer.style.display = 'grid';
        return;
    }

    // 開始搜尋：隱藏選單，顯示結果區塊
    resContainer.style.display = 'block';
    menuContainer.style.display = 'none';
    resContainer.innerHTML = "";

    let results = [];

    // 遍歷所有的籤詩系統
    Object.values(poemSystems).forEach(sys => {

        // 1. 檢查系統名稱本身是否符合
        if (sys.name.toLowerCase().includes(keyword)) {
            results.push({
                type: 'system',
                sysId: sys.id,
                title: sys.name,
                text: `符合籤詩系統名稱`
            });
        }

        // 2. 檢查該系統內的每一首籤詩
        Object.keys(sys.content).forEach(lotKey => {
            const poem = sys.content[lotKey];
            const numValue = Number(lotKey);
            if (!poem) return;

            // ★ 修正：將新版屬性 (poem, meaning, dongpo, story) 也加入搜尋比對
            let searchStr = `${poem.l1 || ''} ${poem.l2 || ''} ${poem.l3 || ''} ${poem.l4 || ''} ${poem.poem || ''} ${poem.interpretation || ''} ${poem.meaning || ''} ${poem.dongpo || ''} ${poem.story || ''}`;
            if (poem.intents) {
                poem.intents.forEach(int => searchStr += ` ${int.type || ''} ${int.text || ''}`);
            }
            searchStr = searchStr.toLowerCase();

            // 判斷是否包含關鍵字，或是輸入了正確的數字(籤號)
            if (searchStr.includes(keyword) || lotKey.toString() === keyword) {

                let idxText = `第${numValue}首`;
                if (numValue === 101) idxText = "籤首";
                if (numValue === 102) idxText = "籤尾";

                // 處理預覽文字
                let previewText = poem.l1;
                if (!previewText && poem.poem) previewText = poem.poem.split(/[，,。]/)[0];
                if (!previewText) previewText = '圖片籤詩';

                results.push({
                    type: 'poem',
                    sysId: sys.id,
                    lot: numValue,
                    sysName: sys.name,
                    idxText: idxText,
                    l1: previewText
                });
            }
        });
    });

    // 畫面渲染：找不到結果
    if (results.length === 0) {
        resContainer.innerHTML = `<div style="padding:15px; text-align:center; color:#888;">搜尋無結果</div>`;
        return;
    }

    // 畫面渲染：限制最多顯示 50 筆，避免手機卡頓
    const displayResults = results.slice(0, 50);

    displayResults.forEach(r => {
        const item = document.createElement('div');
        item.style.cssText = "padding: 12px 15px; border-bottom: 1px solid #333; cursor: pointer;";

        if (r.type === 'system') {
            // 系統選項
            item.innerHTML = `<div style="color:var(--accent); font-weight:bold; font-size:1.1rem;">📚 ${r.title}</div><div style="font-size:0.8rem; color:#888; margin-top:4px;">${r.text}</div>`;
            item.onclick = () => {
                document.getElementById('globalPoemSearch').value = ""; // 清空搜尋
                openSystemList(r.sysId, r.title);
            };
        } else {
            // 籤詩選項
            item.innerHTML = `<div style="color:var(--accent); font-weight:bold;">${r.sysName} / ${r.idxText}</div><div style="font-size:0.95rem; color:#ccc; margin-top:4px;">${r.l1}</div>`;
            item.onclick = () => {
                document.getElementById('globalPoemSearch').value = ""; // 清空搜尋
                currentSystem = poemSystems[r.sysId];
                currentLot = r.lot;
                // 自動抓取對應的神明抬頭
                let matchedDeity = deities.find(x => x.sysId === currentSystem.id);
                currentCollectionTitle = matchedDeity ? matchedDeity.temple : currentSystem.name;
                goTo('collection-view');
                renderPoemView();
            };
        }
        resContainer.appendChild(item);
    });

    if (results.length > 50) {
        resContainer.innerHTML += `<div style="padding:10px; text-align:center; color:#666; font-size:0.8rem;">僅顯示前 50 筆結果...請輸入更精確的關鍵字</div>`;
    }
};

// ==========================================
// ★ 籤詩收錄：即時搜尋與檢索引擎
// ==========================================
window.filterPoemList = function () {
    // 1. 取得使用者輸入的關鍵字，並轉成小寫
    const keyword = document.getElementById('poemSearchInput').value.toLowerCase();

    // 2. 抓出畫面上所有的籤詩按鈕 (您使用的 class 是 poem-btn)
    const cards = document.querySelectorAll('.poem-btn');

    // 3. 逐一比對
    cards.forEach(card => {
        // 將整張卡片裡的文字(包含籤號、詩句)抓出來轉小寫
        const content = card.innerText.toLowerCase();

        // 如果卡片內容包含關鍵字，就顯示；如果不包含，就隱藏
        if (content.includes(keyword)) {
            card.style.display = ''; // 恢復顯示
        } else {
            card.style.display = 'none'; // 隱藏
        }
    });
};

const QIANTONG_DEFAULT = "🏺";
// ==========================================
// ★ 全域：擲筊動畫與搖晃引擎 (終極版)
// ==========================================
// 1. 偵測搖晃函式 (支援 iOS 權限要求)
window.waitForShake = function (callback) {
    if (isListeningShake) return;

    const startListen = () => {
        isListeningShake = true;
        let lastX = null, lastY = null, lastZ = null;
        const threshold = 18; // 搖晃靈敏度

        const handleMotion = (e) => {
            let acc = e.accelerationIncludingGravity;
            if (!acc) return;
            if (lastX !== null) {
                let delta = Math.abs(lastX - acc.x) + Math.abs(lastY - acc.y) + Math.abs(lastZ - acc.z);
                if (delta > threshold) {
                    window.removeEventListener('devicemotion', handleMotion);
                    isListeningShake = false;
                    callback(); // 搖晃成功，觸發下一步！
                }
            }
            lastX = acc.x; lastY = acc.y; lastZ = acc.z;
        };
        window.addEventListener('devicemotion', handleMotion);
    };

    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission()
            .then(state => {
                if (state === 'granted') startListen();
                else { showToast("需要晃動權限，已暫時切換為點擊模式。"); callback(); }
            }).catch(console.error);
    } else {
        startListen();
    }
};

// 2. 處理上傳動畫圖
window.handleCupAnimUpload = function (e, type) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (ev) {
        localStorage.setItem(`custom_cup_anim_${type}`, ev.target.result);
        if (typeof renderCupAnimPreviews === 'function') renderCupAnimPreviews();
    };
    reader.readAsDataURL(file);
};

// 3. 渲染預覽圖
window.renderCupAnimPreviews = function () {
    const rImg = localStorage.getItem('custom_cup_anim_ready');
    const tImg = localStorage.getItem('custom_cup_anim_throw');
    const rEl = document.getElementById('prev-cup-anim-ready');
    const tEl = document.getElementById('prev-cup-anim-throw');
    if (rEl) rEl.innerHTML = rImg ? `<img src="${rImg}" style="height:100%;object-fit:contain;">` : '🙏';
    if (tEl) tEl.innerHTML = tImg ? `<img src="${tImg}" style="height:100%;object-fit:contain;">` : '🌗';
};

window.resetCupAnimImages = function () {
    if (confirm('確定清除自訂的擲筊動畫圖片嗎？')) {
        localStorage.removeItem('custom_cup_anim_ready');
        localStorage.removeItem('custom_cup_anim_throw');
        if (typeof renderCupAnimPreviews === 'function') renderCupAnimPreviews();
    }
};

// 4. ★ 核心引擎：包裝所有的擲筊動作
window.executeThrowCupWrapper = function (btnElement, logicCallback) {
    // ★ 核心防護：防連點機制
    if (window.isThrowingCup) return;
    window.isThrowingCup = true;
    if (btnElement) btnElement.disabled = true;
    const mode = document.getElementById('cup-trigger-mode') ? document.getElementById('cup-trigger-mode').value : (settings.cupTriggerMode || 'click');

    const animEnabled = document.getElementById('cup-anim-enabled') ? document.getElementById('cup-anim-enabled').checked : (settings.cupAnimEnabled || false);
    const tReady = parseFloat(document.getElementById('cup-time-ready') ? document.getElementById('cup-time-ready').value : (settings.cupTimeReady || 0.5));
    const tThrow = parseFloat(document.getElementById('cup-time-throw') ? document.getElementById('cup-time-throw').value : (settings.cupTimeThrow || 0.5));
    const resType = document.querySelector('input[name="cup-result-type"]:checked') ? document.querySelector('input[name="cup-result-type"]:checked').value : (settings.cupResultType || 'timer');
    const tResultSec = parseFloat(document.getElementById('cup-time-result-sec') ? document.getElementById('cup-time-result-sec').value : (settings.cupTimeResultSec || 0.5));
    const tResult = (resType === 'click') ? 'click' : tResultSec;

    const res = typeof getCupResult === 'function' ? getCupResult() : { type: 1, text: "聖筊", char: "聖", dotClass: "dot-saint" };

    let overlay = document.getElementById('cup-master-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'cup-master-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:99999;display:flex;flex-direction:column;justify-content:center;align-items:center;transition:opacity 0.2s;';
        document.body.appendChild(overlay);
    }
    overlay.onclick = null;
    overlay.style.opacity = '1';
    overlay.style.display = 'flex';

    const showScreen = (src, fallback, textHint) => {
        let content = src ? `<img src="${src}" style="max-width:80vw; max-height:40vh; object-fit:contain; animation: popIn 0.3s;">` : `<div style="font-size:8rem; animation: popIn 0.3s;">${fallback}</div>`;
        if (textHint) content += `<div style="color:#fff; font-size:1.5rem; margin-top:20px; font-weight:bold; animation: pulse 1s infinite;">${textHint}</div>`;
        overlay.innerHTML = content;
    };

    const finishThrow = () => {
        overlay.style.opacity = '0';
        setTimeout(() => {
            // ✅ 最佳實踐：徹底從 DOM 樹中移除這個節點，而不是只隱藏它
            if (overlay && overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }

            logicCallback(res);
            if (btnElement) btnElement.disabled = false;
            window.isThrowingCup = false; // ★ 解除防護
        }, 200);
    };

    if (!animEnabled) {
        if (mode === 'shake') {
            showScreen(null, '📱', '請晃動手機擲筊...');
            waitForShake(finishThrow);
        } else {
            overlay.style.display = 'none';
            logicCallback(res);
            if (btnElement) btnElement.disabled = false;
            window.isThrowingCup = false; // ★ 解除防護
        }
        return;
    }

    const imgReady = localStorage.getItem('custom_cup_anim_ready');
    const imgThrow = localStorage.getItem('custom_cup_anim_throw');

    const phaseResult = () => {
        if (typeof triggerVibration === 'function') triggerVibration(100);
        let resContent = res.imgSrc
            ? `<img src="${res.imgSrc}" style="max-width:60vw; max-height:30vh; object-fit:contain; animation: popIn 0.3s;">`
            : `<div class="res-dot ${res.dotClass}" style="width:150px;height:150px;font-size:70px;animation: popIn 0.3s;">${res.char}</div>`;

        let hintHtml = tResult === 'click' ? `<div style="position:absolute; bottom:10%; color:#aaa; font-size:1.2rem; animation: pulse 1.5s infinite;">👆 點擊畫面繼續</div>` : '';
        overlay.innerHTML = `${resContent}<div style="color:#fff; font-size:2.5rem; margin-top:20px; font-weight:bold;">${res.text}</div>${hintHtml}`;

        if (tResult === 'click') {
            overlay.onclick = finishThrow;
        } else {
            setTimeout(finishThrow, parseFloat(tResult) * 1000);
        }
    };

    const phaseThrow = () => {
        if (typeof triggerVibration === 'function') triggerVibration(50);
        showScreen(imgThrow, '🌗', '');
        setTimeout(phaseResult, tThrow * 1000);
    };

    const phaseReady = () => {
        if (mode === 'shake') {
            showScreen(imgReady, '🙏', '📱 請晃動手機...');
            waitForShake(phaseThrow);
        } else {
            showScreen(imgReady, '🙏', '');
            setTimeout(phaseThrow, tReady * 1000);
        }
    };

    phaseReady();
};

// ==========================================
// ★ 1. 線上/手動求籤模式切換 (切換 UI 狀態)
// ==========================================
window.setPoemMode = function (tool, mode) {
    const tabOnline = document.getElementById(`tab-${tool}-mode-online`);
    const tabManual = document.getElementById(`tab-${tool}-mode-manual`);
    const triggerBtn = document.getElementById(`btn-${tool}-draw-trigger`);
    const inputLot = document.getElementById(`${tool}-lot-num`);
    const lotLabel = document.getElementById(`${tool}-lot-label`); // 抓取「籤號」標籤
    const lotWrapper = document.getElementById(`${tool}-lot-wrapper`);
    const onlineSettings = document.getElementById(`${tool}-online-settings`);

    // 共用的「擲筊次數」區塊與手動模式定位點
    const timesBox = document.getElementById('shared-simple-times-container');
    const timesInput = document.getElementById('simple-times');
    const anchorPoem = document.getElementById(`${tool}-times-poem-anchor`);

    // 🌟 抓取最大籤數的容器
    const maxLotContainer = document.getElementById(`${tool}-max-lot-container`);

    const cupRows = document.getElementById(tool === 'simple' ? 'simple-cup-rows' : 'comp-fu-rows');

    if (mode === 'online') {
        if (tabOnline) tabOnline.classList.add('active');
        if (tabManual) tabManual.classList.remove('active');
        if (triggerBtn) triggerBtn.style.display = 'block';

        if (lotWrapper) {
            lotWrapper.style.background = '#333';
            lotWrapper.style.borderColor = '#555';
        }

        // 🌟 變色龍魔法：線上模式 🌟
        if (inputLot) {
            inputLot.readOnly = true;
            inputLot.style.color = '#ccc';
            inputLot.placeholder = '請點抽籤'; // 換字
            inputLot.style.fontSize = '0.9rem'; // 縮小字體才塞得下
            inputLot.value = '';
        }
        if (lotLabel) lotLabel.style.display = 'none'; // 隱藏前方標籤

        if (onlineSettings) onlineSettings.style.display = 'flex';
        if (maxLotContainer) maxLotContainer.style.display = 'flex'; // 顯示最大籤數

        // 隱藏手動專屬的元素
        if (timesBox) timesBox.style.display = 'none';
        if (anchorPoem) anchorPoem.style.display = 'none';
        if (cupRows) cupRows.style.display = 'none';

        if (tool === 'simple') window.simpleTempCups = [];
        if (tool === 'comp-fu') window.compFuTempCups = [];

        setTimeout(() => {
            const actionArea = document.getElementById(`${tool}-action-area`);
            if (actionArea) actionArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);

    } else { // mode === 'manual'
        if (tabOnline) tabOnline.classList.remove('active');
        if (tabManual) tabManual.classList.add('active');
        if (triggerBtn) triggerBtn.style.display = 'none';

        if (lotWrapper) {
            lotWrapper.style.background = '#111';
            lotWrapper.style.borderColor = 'var(--accent)';
        }

        // 🌟 變色龍魔法：手動模式 🌟
        if (inputLot) {
            inputLot.readOnly = false;
            inputLot.style.color = 'var(--accent)';
            inputLot.placeholder = '手填'; // 變回手填
            inputLot.style.fontSize = '1.1rem'; // 放大字體
            inputLot.value = '';
        }
        if (lotLabel) lotLabel.style.display = 'inline-block'; // 顯示前方標籤

        if (onlineSettings) onlineSettings.style.display = 'none';
        if (maxLotContainer) maxLotContainer.style.display = 'none'; // 隱藏最大籤數

        // 瞬移大法：搬到手動求籤定位點
        if (timesBox && anchorPoem) {
            anchorPoem.appendChild(timesBox);
            timesBox.style.display = 'flex';
            timesBox.style.width = '100%';
            anchorPoem.style.display = 'flex';

            if (timesInput && (!timesInput.value || timesInput.value == 1)) {
                timesInput.value = 3;
            }
        }

        if (cupRows) cupRows.style.display = 'block';

        if (tool === 'simple' && typeof window.renderSimpleCupRows === 'function') window.renderSimpleCupRows();
        if (tool === 'comp-fu' && typeof window.renderCompFuRows === 'function') window.renderCompFuRows();

        setTimeout(() => {
            const qText = document.getElementById(`${tool}-q-text`);
            if (qText) qText.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
    }
};

// ==========================================
// ★ 智慧籤數上限防呆引擎
// ==========================================
window.checkLotLimit = function (inputEl, tool) {
    let val = parseInt(inputEl.value);
    if (isNaN(val)) return;

    let maxLimit = 103; // 狀況2 & 3：無綁定系統時，給予預設的合理上限 103
    let sysName = "";

    // 判斷狀況1：是否有選擇神明，且神明有綁定系統
    const selId = document.getElementById(`${tool}-deity-sel`)?.value;
    const currentDeities = typeof getOrderedDeities === 'function' ? getOrderedDeities() : (window.deities || []);

    if (selId && selId !== 'custom') {
        const d = currentDeities.find(x => x.id === selId);
        if (d && d.sysId && window.poemSystems[d.sysId]) {
            // 抓到神明綁定的系統總籤數！
            maxLimit = parseInt(window.poemSystems[d.sysId].total);
            sysName = window.poemSystems[d.sysId].name;
        }
    } else {
        // 如果沒有選擇神明，檢查是否有設定「一般求籤」的全域預設系統
        if (typeof settings !== 'undefined' && settings.defaultSystem && window.poemSystems[settings.defaultSystem]) {
            maxLimit = parseInt(window.poemSystems[settings.defaultSystem].total);
            sysName = "預設系統";
        }
    }

    // 執行攔截：如果輸入超過上限，立刻修正並跳出 Toast 提示
    if (val > maxLimit) {
        inputEl.value = maxLimit; // 強制將輸入框的值改回最大值
        if (typeof window.showToast === 'function') {
            let msg = sysName ? `⚠️ 根據「${sysName}」，最大籤數為 ${maxLimit}` : `⚠️ 合理籤數通常不超過 ${maxLimit}`;
            window.showToast(msg);
        }
    }
};

// 處理 Tab 切換時的狀態重置
window.switchSimpleMode = function (mode) {
    // 1. 初始化頁籤與區塊顯示狀態
    document.getElementById('tab-ask').classList.remove('active');
    document.getElementById('tab-poem').classList.remove('active');
    document.getElementById('simple-poem-settings').style.display = 'none';

    // 🌟 取得共用的「擲筊次數」區塊與輸入框
    const timesBox = document.getElementById('shared-simple-times-container');
    const timesInput = document.getElementById('simple-times');
    const cupRows = document.getElementById('simple-cup-rows');

    if (mode === 'ask') {
        document.getElementById('tab-ask').classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // 🌟 瞬移大法：搬回一般問事定位點
        if (timesBox) {
            const anchorAsk = document.getElementById('simple-times-ask-anchor');
            if (anchorAsk) anchorAsk.appendChild(timesBox);
            timesBox.style.display = 'flex';
            timesBox.style.width = 'auto'; // 恢復靠右的小巧寬度

            // 貼心防呆：從求籤切回問事時，如果還是 3 次，自動變回 1 次
            if (timesInput && Number(timesInput.value) === 3) {
                timesInput.value = 1;
            }
            if (typeof window.renderSimpleCupRows === 'function') window.renderSimpleCupRows();
        }

        if (cupRows) cupRows.style.display = 'block';

    } else { // mode === 'poem'
        document.getElementById('tab-poem').classList.add('active');
        document.getElementById('simple-poem-settings').style.display = 'block';

        // 判斷目前第二層頁籤在哪裡，決定要不要搬移次數框
        const isManual = document.getElementById('tab-simple-mode-manual').classList.contains('active');
        if (isManual) {
            window.setPoemMode('simple', 'manual');
        } else {
            window.setPoemMode('simple', 'online');
        }
    }
};

window.switchCompFuMode = function (mode) {
    document.getElementById('comp-fu-tab-ask').classList.remove('active');
    document.getElementById('comp-fu-tab-poem').classList.remove('active');
    document.getElementById('comp-fu-poem-settings').style.display = 'none';
    const timesConfig = document.getElementById('comp-fu-times-config');
    const cupRows = document.getElementById('comp-fu-rows');
    const timesInput = document.getElementById('comp-fu-times');

    if (mode === 'ask') {
        document.getElementById('comp-fu-tab-ask').classList.add('active');
        if (timesConfig) {
            timesConfig.style.display = 'flex';

            // 🌟 智慧判斷：比照辦理
            if (timesInput && timesInput.value == 3) {
                timesInput.value = 1;
            }

            if (typeof window.renderCompFuRows === 'function') window.renderCompFuRows();
        }
        if (cupRows) cupRows.style.display = 'block';
    } else {
        document.getElementById('comp-fu-tab-poem').classList.add('active');
        document.getElementById('comp-fu-poem-settings').style.display = 'block';
        window.setPoemMode('comp-fu', 'online');
    }
};

// ==========================================
// ★ 2. 終極神明賜籤引擎 (三階段連貫流程)
// ==========================================
window.miniDrawContext = { targetInputId: '', lotNum: 0, totalLots: 101, tool: 'simple', drawnLots: [] };

const setDisplaySafe = (id, displayValue) => {
    const el = document.getElementById(id);
    if (el) el.style.display = displayValue;
};

window.openMiniDraw = function (inputId, permCheckboxId, tool, totalInputId) {
    window.miniDrawContext.targetInputId = inputId;
    window.miniDrawContext.tool = tool;

    // 抓取神明與設定
    const selId = document.getElementById(`${tool}-deity-sel`)?.value;
    const customName = document.getElementById(`${tool}-custom-deity`)?.value.trim();

    let requirePerm = document.getElementById(permCheckboxId) ? document.getElementById(permCheckboxId).checked : false;

    // 🌟 神明列位強制請示
    //let requirePerm = document.getElementById(permCheckboxId)?.checked;
    //if (selId && selId !== 'custom') {
    //    requirePerm = true;
    //}

    if (requirePerm) {
        let tempCups = tool === 'simple' ? (window.simpleTempCups || []) : (window.compFuTempCups || []);
        // 防呆：確認是否已在上方的擲筊獲得聖杯 (這段保留您原本的邏輯)
        if (tempCups.length === 0 || tempCups[tempCups.length - 1] !== 1) {
            // 如果您上方已經沒有預設要先擲聖杯，可以把這段警告拿掉，直接讓它進去視窗裡請示
        }
    }

    const totalInput = document.getElementById(totalInputId);
    window.miniDrawContext.totalLots = totalInput ? parseInt(totalInput.value) || 101 : 101;

    // 設定視窗內文字
    const iconBox = document.getElementById('mini-perm-icon');
    window.miniDrawContext.targetSaints = 3;

    if (selId && selId !== 'custom') {
        const d = (window.deities || []).find(x => x.id === selId);
        if (d) {
            window.miniDrawContext.targetSaints = d.saintTarget ? parseInt(d.saintTarget) : 3;
            if (iconBox) iconBox.innerHTML = typeof window.getIconHtml === 'function' ? window.getIconHtml(d) : '🙏';
        }
    } else if (customName) {
        if (iconBox) iconBox.innerHTML = `<div style="font-size:3rem;">🙏</div><div style="color:var(--accent); font-weight:bold;">${customName}</div>`;
    } else {
        if (iconBox) iconBox.innerHTML = '<div style="font-size:4rem;">📜</div>';
    }

    const modal = document.getElementById('mini-draw-modal');
    if (!modal) return;

    if (requirePerm) {
        window.resetMiniPermission();
    } else {
        document.getElementById('mini-draw-perm-area').style.display = 'none';
        document.getElementById('mini-draw-cylinder-area').style.display = 'block';
        document.getElementById('mini-draw-confirm-area').style.display = 'none';
    }

    modal.style.display = 'flex';
};

// 請示區塊重置
window.resetMiniPermission = function () {
    document.getElementById('mini-draw-perm-area').style.display = 'block';
    document.getElementById('mini-draw-cylinder-area').style.display = 'none';
    document.getElementById('mini-draw-confirm-area').style.display = 'none';
    document.getElementById('mini-perm-failed-actions').style.display = 'none';

    const cupRes = document.getElementById('mini-perm-cup-res');
    if (cupRes) cupRes.innerHTML = '<span style="font-size:3.5rem; opacity:0.2;">🙏</span>';

    const btn = document.getElementById('btn-mini-perm-toss');
    if (btn) { btn.style.display = 'block'; btn.disabled = false; }
};

// 執行請示擲筊
window.tossMiniPermission = function () {
    const btn = document.getElementById('btn-mini-perm-toss');
    if (typeof window.executeThrowCupWrapper === 'function') {
        window.executeThrowCupWrapper(btn, (res) => {
            const resBox = document.getElementById('mini-perm-cup-res');
            if (resBox) resBox.innerHTML = res.imgSrc
                ? `<img src="${res.imgSrc}" style="height:60px; object-fit:contain; animation: popIn 0.3s;">`
                : `<div class="res-dot ${res.dotClass}" style="width:60px;height:60px;font-size:24px;">${res.char}</div>`;

            if (res.type === 1) { // 聖筊：前往籤筒
                if (btn) btn.style.display = 'none';
                setTimeout(() => {
                    document.getElementById('mini-draw-perm-area').style.display = 'none';
                    document.getElementById('mini-draw-cylinder-area').style.display = 'block';
                    window.setupMiniCylinderMode();
                }, 800);
            } else { // 笑/蓋：顯示失敗選單
                if (btn) btn.style.display = 'none';
                document.getElementById('mini-perm-failed-actions').style.display = 'flex';
            }
        });
    }
};

// ==========================================
// ★ 執行抽籤 (完美防呆 + 支援不放回設定)
// ==========================================
window.executeMiniDrawResult = function () {
    const tool = window.miniDrawContext.tool || 'simple';
    const total = window.miniDrawContext.totalLots;
    const noPutBackEl = document.getElementById(`${tool}-no-put-back`);
    const noPutBack = noPutBackEl ? noPutBackEl.checked : false;

    let rn;
    if (noPutBack) {
        if (!window.miniDrawContext.drawnLots) window.miniDrawContext.drawnLots = [];
        if (window.miniDrawContext.drawnLots.length >= total) {
            if (typeof window.showToast === 'function') window.showToast("⚠️ 籤筒已空！為您重新洗牌");
            window.miniDrawContext.drawnLots = [];
        }
        do { rn = Math.floor(Math.random() * total) + 1; }
        while (window.miniDrawContext.drawnLots.includes(rn));
        window.miniDrawContext.drawnLots.push(rn);
    } else {
        rn = Math.floor(Math.random() * total) + 1;
    }

    window.miniDrawContext.lotNum = rn;
    window.miniDrawContext.currentSaints = 0;

    // 1. 隱藏原本的搖晃區，顯示確認區
    document.getElementById('mini-draw-cylinder-area').style.display = 'none';
    const confirmArea = document.getElementById('mini-draw-confirm-area');
    confirmArea.style.display = 'block';

    // 2. ★ 核心魔法：把搖動後的籤筒影像「植入」到請示區塊的上方
    let cylWrapper = document.getElementById('mini-confirm-cylinder-wrapper');
    if (!cylWrapper) {
        cylWrapper = document.createElement('div');
        cylWrapper.id = 'mini-confirm-cylinder-wrapper';
        cylWrapper.style.marginBottom = '10px';
        confirmArea.insertBefore(cylWrapper, confirmArea.firstChild); // 塞到最上面
    }
    const qt = typeof getCurrentQtImages === 'function' ? getCurrentQtImages() : { active: '🏺' };
    cylWrapper.innerHTML = qt.active.startsWith('data:')
        ? `<img src="${qt.active}" style="height:100px; object-fit:contain;">`
        : `<span style="font-size:4rem;">${qt.active}</span>`;

    // 3. ★ 鎖死高度魔法：固定杯象區塊的高度，防止畫面上下跳動
    const cupRes = document.getElementById('mini-draw-cup-res');
    if (cupRes) {
        cupRes.style.height = '60px'; // 預留給筊杯的高度，文字就不會被擠了！
        cupRes.style.display = 'flex';
        cupRes.style.justifyContent = 'center';
        cupRes.style.alignItems = 'center';
        cupRes.innerHTML = "<span style='color:#888; font-size:1.2rem;'>準備</span>";
    }

    const resEl = document.getElementById('mini-draw-result');
    if (resEl) {
        resEl.innerText = `第 ${rn} 籤`;
        resEl.style.display = 'block';
        resEl.style.animation = "popIn 0.5s ease-out forwards";
    }

    const tgtEl = document.getElementById('mini-draw-target-saint');
    if (tgtEl) tgtEl.innerText = window.miniDrawContext.targetSaints || 3;

    const cntEl = document.getElementById('mini-draw-saint-count');
    if (cntEl) cntEl.innerText = "0";

    const btnToss = document.getElementById('btn-mini-toss');
    if (btnToss) btnToss.style.display = 'block';
};

// 執行三聖杯確認
window.tossMiniConfirm = function () {
    const btn = document.getElementById('btn-mini-toss');

    // ★ 1. 播放丟出去的動畫 (不論文字或圖片，都可以讓容器跳起來翻轉)
    if (resArea) {
        // 先顯示準備中的「兩個翻轉中的 CSS 筊杯」代表正在空中的狀態
        resArea.innerHTML = `
            <div style="display:inline-flex;" class="anim-tossing">
                <div class="css-cup cup-up" style="width:40px; height:40px;"></div>
                <div class="css-cup cup-down" style="width:40px; height:40px;"></div>
            </div>`;
    }

    // 將按鈕暫時鎖死防連點
    if (btn) btn.style.pointerEvents = 'none';

    window.executeThrowCupWrapper(btn, (res) => {
        const resArea = document.getElementById('mini-draw-cup-res');
        setTimeout(() => {
            // 直接呼叫我們剛寫好的強大生成器 (指定大小 60px)
            if (resArea) resArea.innerHTML = window.generateCupHtml(res.type, 40, 24);

            // 恢復按鈕可點擊
            if (btn) btn.style.pointerEvents = 'auto';

            //if (resArea) resArea.innerHTML = res.imgSrc
            //    ? `<img src="${res.imgSrc}" style="height:60px; object-fit:contain; animation: popIn 0.3s;">`
            //    : `<div class="res-dot ${res.dotClass}" style="width:60px;height:60px;font-size:24px;">${res.char}</div>`;

            if (res.type === 1) { // 聖筊
                window.miniDrawContext.currentSaints++;
                const cntEl = document.getElementById('mini-draw-saint-count');
                if (cntEl) cntEl.innerText = window.miniDrawContext.currentSaints;

                if (window.miniDrawContext.currentSaints >= window.miniDrawContext.targetSaints) {
                    if (btn) btn.style.display = 'none';
                    setTimeout(() => {
                        if (typeof window.showToast === 'function') window.showToast(`🎉 成功求得 第 ${window.miniDrawContext.lotNum} 籤！`);

                        const input = document.getElementById(window.miniDrawContext.targetInputId);
                        if (input) input.value = window.miniDrawContext.lotNum;

                        // 🌟 自動填入聖筊紀錄，讓儲存時能直接讀到完美的結果！
                        const tool = window.miniDrawContext.tool;
                        const target = window.miniDrawContext.targetSaints;
                        const autoCups = new Array(target).fill(1); // 產生陣列 [1, 1, 1]
                        if (tool === 'simple') window.simpleTempCups = autoCups;
                        if (tool === 'compare') window.compFuTempCups = autoCups;

                        window.closeMiniDraw(true);
                    }, 800);
                }
            } else { // 笑/蓋：失敗退回籤筒
                window.miniDrawContext.currentSaints = 0;
                const cntEl = document.getElementById('mini-draw-saint-count');
                if (cntEl) cntEl.innerText = "0";
                if (btn) btn.style.display = 'none';
                const failedActions = document.getElementById('mini-confirm-failed-actions');
                if (failedActions) failedActions.style.display = 'flex';
            }
        }, 600); // 這裡的 600ms 與 CSS 的 tossCupAnim 動畫時間對齊
    });
};

// 確認帶入
window.confirmMiniDraw = function () {
    const num = window.miniDrawContext.lotNum;
    const input = document.getElementById(window.miniDrawContext.targetInputId);
    if (input) {
        input.value = num;
        if (typeof window.showToast === 'function') window.showToast(`✅ 已帶入第 ${num} 籤`);
    }
    window.closeMiniDraw();
};

// 新增：按下繼續求籤，退回籤筒狀態
window.resetMiniCylinder = function () {
    document.getElementById('mini-confirm-failed-actions').style.display = 'none';
    document.getElementById('mini-draw-confirm-area').style.display = 'none';
    document.getElementById('mini-draw-cylinder-area').style.display = 'block';
    window.setupMiniCylinderMode();

    // 將杯象恢復預設
    const cupRes = document.getElementById('mini-draw-cup-res');
    if (cupRes) cupRes.innerHTML = "準備";

    // 恢復擲筊按鈕
    const btnToss = document.getElementById('btn-mini-toss');
    if (btnToss) btnToss.style.display = 'block';
};

// 修改：關閉小視窗的防呆保護
window.closeMiniDraw = async function (forceClose = false) {
    if (!forceClose) {
        // 使用 smartConfirm 確認是否關閉
        if (!(await window.smartConfirm("確定要結束求籤並返回嗎？目前的求籤進度將會遺失。", "結束求籤"))) {
            return;
        }
    }
    const modal = document.getElementById('mini-draw-modal');
    if (modal) modal.style.display = 'none';
};

// ==========================================
// 🌊 籤號波浪動畫產生器 (全域小工具)
// ==========================================
window.getWaveHtml = function() {
    return `
        <div style="display:inline-flex; gap:4px; align-items:center; vertical-align:middle; margin:0 4px; height:1em;">
            <div style="width:4px; height:20px; background-color:var(--accent); border-radius:2px; animation: waveScale 0.8s ease-in-out infinite; animation-delay: 0s;"></div>
            <div style="width:4px; height:20px; background-color:var(--accent); border-radius:2px; animation: waveScale 0.8s ease-in-out infinite; animation-delay: 0.15s;"></div>
            <div style="width:4px; height:20px; background-color:var(--accent); border-radius:2px; animation: waveScale 0.8s ease-in-out infinite; animation-delay: 0.3s;"></div>
        </div>
    `;
};

// ==========================================
// ★ 小籤筒 (Mini Draw) 觸控與按鈕模式切換引擎
// ==========================================
window.toggleMiniTapShake = function (e) {
    if (e && e.cancelable) e.preventDefault();
    const area = document.getElementById('mini-draw-area');
    const instr = document.getElementById('mini-draw-instruction');

    if (!window.isMiniShaking) {
        window.isMiniShaking = true;
        // 🌟 搖晃時：顯示波浪動畫
        if (instr) instr.innerHTML = `<div style="font-size:1.3rem; margin-bottom:5px; font-weight:bold;">第 ${window.getWaveHtml()} 籤</div><span class='breathing-text' style='font-size:0.9rem; color:#aaa;'>✨ 抽籤中...憑直覺再次點擊出籤</span>`;
        if (area) {
            const qt = typeof getCurrentQtImages === 'function' ? getCurrentQtImages() : { static: '🏺', active: '🏺' };
            area.innerHTML = qt.active.startsWith('data:')
                ? `<img src="${qt.active}" class="shake-anim" style="height:100px; object-fit:contain;">`
                : `<span style="font-size:4rem;" class="shake-anim">${qt.active}</span>`;
        }
    } else {
        window.isMiniShaking = false;
        area.onclick = null; // 防連點
        if (typeof window.executeMiniDrawResult === 'function') window.executeMiniDrawResult();
    }
};

window.startMiniShake = function (e) {
    if (e && e.cancelable) e.preventDefault();
    window.isMiniShaking = true;
    const area = document.getElementById('mini-draw-area');
    const instr = document.getElementById('mini-draw-instruction');
    // 🌟 搖晃時：顯示波浪動畫
    if (instr) instr.innerHTML = `<div style="font-size:1.3rem; margin-bottom:5px; font-weight:bold;">第 ${window.getWaveHtml()} 籤</div><span class='breathing-text' style='font-size:0.9rem; color:#aaa;'>✨ 中...鬆開出籤</span>`;
    // ★ 修正 2：按壓搖晃時，切換為「自訂搖晃籤筒」，並維持 100px 高度防跳動
    if (area) {
        const qt = typeof getCurrentQtImages === 'function' ? getCurrentQtImages() : { static: '🏺', active: '🏺' };
        area.innerHTML = qt.active.startsWith('data:')
            ? `<img src="${qt.active}" class="shake-anim" style="height:100px; object-fit:contain;">`
            : `<span style="font-size:4rem;" class="shake-anim">${qt.active}</span>`;
    }
};

window.stopMiniShake = function (e) {
    if (e && e.cancelable) e.preventDefault();
    if (!window.isMiniShaking) return;

    window.isMiniShaking = false;

    // ★ 修正 3：刪除了 diff < 100 的「0.1秒防誤觸機制」
    // 現在只要手指一離開螢幕 (或滑鼠一放開)，就會立刻觸發出籤！
    if (typeof window.executeMiniDrawResult === 'function') {
        window.executeMiniDrawResult();
    }
};

window.toggleQiuqianNotes = function () {
    const container = document.getElementById('qiuqian-notes-container');
    const btn = document.getElementById('btn-toggle-notes');

    if (container.style.display === 'none') {
        container.style.display = 'block';
        btn.style.background = 'var(--accent)';
        btn.style.color = '#000';

        // ★ 核心修復：精準滾動 step-4 區域
        setTimeout(() => {
            const step4 = document.getElementById('step-4');
            if (step4) {
                step4.scrollTo({ top: step4.scrollHeight, behavior: 'smooth' });
            }
        }, 100);
    } else {
        container.style.display = 'none';
        btn.style.background = '#333';
        btn.style.color = '#fff';
    }
};


// ==========================================
// ★ 1. 限定秒數上下限 (即時監聽防呆)
// ==========================================
window.enforceAnimLimit = function (input) {
    let val = parseFloat(input.value);
    if (isNaN(val)) return;
    if (val < 1) input.value = 1;
    if (val > 10) input.value = 10;
};

// ==========================================
// ★ 2. 一般求籤主畫面 (完美融合舊版視覺與新版秒數引擎)
// ==========================================
window.setupDrawStep2 = function() {
    if (typeof isDrawing !== 'undefined') window.isDrawing = false;
    if (typeof isShaking !== 'undefined') window.isShaking = false;
    
    const animArea = document.getElementById('draw-anim-area');
    const instr = document.getElementById('draw-instruction');
    const btn = document.getElementById('btn-draw');
    const imgs = typeof getCurrentQtImages === 'function' ? getCurrentQtImages() : { static: '🏺', active: '🏺' };

    let content = imgs.static.startsWith('data:')
        ? `<img src="${imgs.static}" style="height:100px; object-fit:contain; pointer-events:none; user-select:none; -webkit-touch-callout:none;">`
        : `<span style="font-size:4rem; user-select:none; pointer-events:none; -webkit-touch-callout:none;">${imgs.static}</span>`;
    if (animArea) animArea.innerHTML = content;

    if (animArea && animArea.parentNode) {
        const newAnimArea = animArea.cloneNode(true);
        animArea.parentNode.replaceChild(newAnimArea, animArea);
    }
    const targetArea = document.getElementById('draw-anim-area');
    if (!targetArea) return;

    targetArea.style.userSelect = "none";
    targetArea.style.webkitTouchCallout = "none";

    const mode = (typeof settings !== 'undefined' && settings.drawMode) ? settings.drawMode : 'timer';
    const animSec = (typeof settings !== 'undefined' && settings.animSeconds) ? parseFloat(settings.animSeconds) : 2;

    if (mode === 'touch' || mode === 'tap') {
        targetArea.style.background = 'rgba(255, 255, 255, 0.05)';
        targetArea.style.borderRadius = '16px';
        targetArea.style.border = '1px dashed rgba(255, 255, 255, 0.15)';
    } else {
        targetArea.style.background = 'transparent';
        targetArea.style.border = 'none';
    }

    if (btn) btn.style.display = 'none'; // 隱藏所有模式的按鈕

    // 🌟 靜止時：預設顯示「第 ？ 籤」
    if (mode === 'timer') {
        if (instr) instr.innerHTML = `<div style="font-size:1.3rem; margin-bottom:5px; font-weight:bold;">第 ？ 籤</div><span style="font-size:0.9rem; color:#aaa;">👇點擊籤筒 ${animSec} 秒後出籤👇</span>`;
        targetArea.style.cursor = "pointer";
        targetArea.addEventListener('click', window.startTimerDrawEngine); 
    } else if (mode === 'touch') {
        if (instr) instr.innerHTML = `<div style="font-size:1.3rem; margin-bottom:5px; font-weight:bold;">第 ？ 籤</div><span style="font-size:0.9rem; color:#aaa;">👇壓住撥動、鬆開抽籤👇</span>`;
        targetArea.addEventListener('touchstart', window.startTouchShake || window.startShake, { passive: false });
        targetArea.addEventListener('touchend', window.stopTouchShake || window.stopShake, { passive: false });
        targetArea.addEventListener('touchcancel', window.stopTouchShake || window.stopShake, { passive: false });
        targetArea.addEventListener('mousedown', window.startTouchShake || window.startShake);
        targetArea.addEventListener('mouseup', window.stopTouchShake || window.stopShake);
        targetArea.addEventListener('mouseleave', window.stopTouchShake || window.stopShake);
    } else if (mode === 'tap') {
        if (instr) instr.innerHTML = `<div style="font-size:1.3rem; margin-bottom:5px; font-weight:bold;">第 ？ 籤</div><span style="font-size:0.9rem; color:#aaa;">👇點擊撥動籤筒👇</span>`;
        targetArea.addEventListener('click', window.toggleTapShake);
    }
};

// ==========================================
// ★ 3. 神明賜籤小視窗 (同步支援秒數引擎)
// ==========================================
window.setupMiniCylinderMode = function () {
    const mode = (typeof settings !== 'undefined' && settings.drawMode) ? settings.drawMode : 'timer';
    const btn = document.getElementById('btn-mini-draw');
    const instr = document.getElementById('mini-draw-instruction');
    const area = document.getElementById('mini-draw-area');

    if (!area) return;

    const qt = typeof getCurrentQtImages === 'function' ? getCurrentQtImages() : { static: '🏺', active: '🏺' };
    area.innerHTML = qt.static.startsWith('data:')
        ? `<img src="${qt.static}" style="height:100px; object-fit:contain; pointer-events:none;">`
        : `<span style="font-size:4rem; pointer-events:none;">${qt.static}</span>`;

    // 移除舊監聽器 (保留你的 cloneNode 魔法)
    if (area.parentNode) {
        const newArea = area.cloneNode(true);
        area.parentNode.replaceChild(newArea, area);
    }
    const targetArea = document.getElementById('mini-draw-area');
    if (!targetArea) return;

    window.isMiniShaking = false;

    // 保留你的視覺暗示魔法
    if (mode === 'touch' || mode === 'tap') {
        targetArea.style.background = 'rgba(255, 255, 255, 0.05)';
        targetArea.style.borderRadius = '16px';
        targetArea.style.border = '1px dashed rgba(255, 255, 255, 0.15)';
    } else {
        targetArea.style.background = 'transparent';
        targetArea.style.border = 'none';
    }

    const animSec = (typeof settings !== 'undefined' && settings.animSeconds) ? parseFloat(settings.animSeconds) : 2;
    if (btn) btn.style.display = 'none';

    // 🌟 靜止時：預設顯示「第 ？ 籤」
    if (mode === 'touch') {
        if (instr) instr.innerHTML = `<div style='font-size:1.3rem; margin-bottom:5px; font-weight:bold;'>第 ？ 籤</div><span style='font-size:0.9rem; color:#aaa;'>👇壓住撥動、鬆開抽籤👇</span>`;
        targetArea.style.userSelect = "none"; targetArea.style.webkitTouchCallout = "none";
        targetArea.addEventListener('mousedown', window.startMiniShake);
        targetArea.addEventListener('touchstart', window.startMiniShake, { passive: false });
        targetArea.addEventListener('mouseup', window.stopMiniShake);
        targetArea.addEventListener('touchend', window.stopMiniShake, { passive: false });
        targetArea.addEventListener('touchcancel', window.stopMiniShake, { passive: false });
        targetArea.addEventListener('mouseleave', window.stopMiniShake);
    } else if (mode === 'tap') {
        if (instr) instr.innerHTML = `<div style='font-size:1.3rem; margin-bottom:5px; font-weight:bold;'>第 ？ 籤</div><span style='font-size:0.9rem; color:#aaa;'>👇點擊開始搖晃👇</span>`;
        targetArea.style.userSelect = "none"; targetArea.style.webkitTouchCallout = "none";
        targetArea.addEventListener('click', window.toggleMiniTapShake);
    } else {
        if (instr) instr.innerHTML = `<div style='font-size:1.3rem; margin-bottom:5px; font-weight:bold;'>第 ？ 籤</div><span style='font-size:0.9rem; color:#aaa;'>👇點擊籤筒 ${animSec} 秒後出籤👇</span>`;
        targetArea.style.userSelect = "none"; 
        targetArea.style.webkitTouchCallout = "none";
        targetArea.style.cursor = "pointer";
        targetArea.addEventListener('click', window.startMiniTimerDrawEngine);
    }
};

// ==========================================
// ★ 主畫面求籤引擎 (一般求籤專用)
// ==========================================
window.startTimerDrawEngine = function(e) {
    if (e && e.cancelable) e.preventDefault();

    const targetArea = document.getElementById('draw-anim-area');
    const instr = document.getElementById('draw-instruction');

    let mode = 'timer';
    let animSec = 2;
    try {
        const savedData = JSON.parse(localStorage.getItem('zb_settings') || '{}');
        mode = savedData.drawMode || (typeof settings !== 'undefined' ? settings.drawMode : 'timer');
        animSec = (typeof settings !== 'undefined' && settings.animSeconds) ? parseFloat(settings.animSeconds) : (savedData.animSeconds ? parseFloat(savedData.animSeconds) : 2);
    } catch (err) {}

    // 🌟 核心煞車系統：拔除動畫，恢復靜止籤筒
    const stopShakingUI = () => {
        if (instr) instr.innerHTML = "✨ 抽籤中...";
        if (targetArea) {
            const qt = typeof getCurrentQtImages === 'function' ? getCurrentQtImages() : { static: '🏺' };
            if (isImageUrl(qt.static)) {
                targetArea.innerHTML = `<img src="${qt.static}" style="height:100px; max-width:100%; object-fit:contain; pointer-events:none;" onerror="this.onerror=null; this.outerHTML='<span style=\\'font-size:4rem; pointer-events:none;\\'>🏺</span>';">`;
            } else {
                targetArea.innerHTML = `<span style="display:inline-block; font-size:4rem; max-width:100%; pointer-events:none; word-break:break-all; overflow-wrap:anywhere;">${qt.static}</span>`;
            }
        }
    };

    if (mode === 'tap') {
        if (window.isDrawing) {
            window.isDrawing = false;
            stopShakingUI(); // 👉 停止搖晃
            if (typeof window.executeDrawResult === 'function') window.executeDrawResult();
        } else {
            window.isDrawing = true;
            // 🌟 搖晃時：顯示波浪動畫
            if (instr) instr.innerHTML = `<div style="font-size:1.3rem; margin-bottom:5px; font-weight:bold;">第 ${window.getWaveHtml()} 籤</div><span style="animation: splashBreathe 1.5s infinite; font-size:0.9rem; color:#aaa;">✨撥動籤支..憑直覺再次點擊抽籤</span>`;
            if (targetArea) {
                const qt = typeof getCurrentQtImages === 'function' ? getCurrentQtImages() : { active: '🏺' };
                if (isImageUrl(qt.active)) {
                    targetArea.innerHTML = `<img src="${qt.active}" class="shake-anim" style="height:100px; max-width:100%; object-fit:contain; pointer-events:none;" onerror="this.onerror=null; this.outerHTML='<span style=\\'font-size:4rem; pointer-events:none;\\'>🏺</span>';">`;
                } else {
                    targetArea.innerHTML = `<span class="shake-anim" style="display:inline-block; font-size:4rem; max-width:100%; pointer-events:none; word-break:break-all; overflow-wrap:anywhere;">${qt.active}</span>`;
                }
            }
        }
        return; 
    }

    if (window.isDrawing) return; 
    window.isDrawing = true;
    
    // 🌟 搖晃時：顯示波浪動畫
    if (instr) instr.innerHTML = `<div style="font-size:1.3rem; margin-bottom:5px; font-weight:bold;">第 ${window.getWaveHtml()} 籤</div><span style="animation: splashBreathe 1.5s infinite; font-size:0.9rem; color:#aaa;">✨ 撥動籤支...${animSec} 秒後抽籤</span>`;
    
    if (targetArea) {
        const qt = typeof getCurrentQtImages === 'function' ? getCurrentQtImages() : { active: '🏺' };
        if (isImageUrl(qt.active)) {
            targetArea.innerHTML = `<img src="${qt.active}" class="shake-anim" style="height:100px; max-width:100%; object-fit:contain; pointer-events:none;" onerror="this.onerror=null; this.outerHTML='<span style=\\'font-size:4rem; pointer-events:none;\\'>🏺</span>';">`;
        } else {
            targetArea.innerHTML = `<span class="shake-anim" style="display:inline-block; font-size:4rem; max-width:100%; pointer-events:none; word-break:break-all; overflow-wrap:anywhere;">${qt.active}</span>`;
        }
    }
    
    setTimeout(() => {
        if (!window.isDrawing) return; 
        window.isDrawing = false;
        stopShakingUI(); // 👉 秒數到，瞬間停止搖晃
        if (typeof window.executeDrawResult === 'function') window.executeDrawResult();
    }, animSec * 1000);
};

// ==========================================
// ★ 小視窗求籤引擎 (問事/比較專用)
// ==========================================
window.startMiniTimerDrawEngine = function(e) {
    if (e && e.cancelable) e.preventDefault();
    
    const targetArea = document.getElementById('mini-draw-area');
    const instr = document.getElementById('mini-draw-instruction');
    
    let mode = 'timer';
    let animSec = 2;
    try {
        const savedData = JSON.parse(localStorage.getItem('zb_settings') || '{}');
        mode = savedData.drawMode || (typeof settings !== 'undefined' ? settings.drawMode : 'timer');
        animSec = (typeof settings !== 'undefined' && settings.animSeconds) ? parseFloat(settings.animSeconds) : (savedData.animSeconds ? parseFloat(savedData.animSeconds) : 2);
    } catch (err) {}

    // 🌟 核心煞車系統：拔除動畫，恢復靜止籤筒
    const stopShakingUI = () => {
        if (instr) instr.innerHTML = "✨ 賜籤中...";
        if (targetArea) {
            const qt = typeof getCurrentQtImages === 'function' ? getCurrentQtImages() : { static: '🏺' };
            if (isImageUrl(qt.static)) {
                targetArea.innerHTML = `<img src="${qt.static}" style="height:100px; max-width:100%; object-fit:contain; pointer-events:none;" onerror="this.onerror=null; this.outerHTML='<span style=\\'font-size:4rem; pointer-events:none;\\'>🏺</span>';">`;
            } else {
                targetArea.innerHTML = `<span style="display:inline-block; font-size:4rem; max-width:100%; pointer-events:none; word-break:break-all; overflow-wrap:anywhere;">${qt.static}</span>`;
            }
        }
    };

    if (mode === 'tap') {
        if (window.isMiniShaking) {
            window.isMiniShaking = false;
            stopShakingUI(); // 👉 停止搖晃
            if (typeof window.executeMiniDrawResult === 'function') window.executeMiniDrawResult();
        } else {
            window.isMiniShaking = true;
            // 🌟 搖晃時：顯示波浪動畫
            if (instr) instr.innerHTML = `<div style="font-size:1.3rem; margin-bottom:5px; font-weight:bold;">第 ${window.getWaveHtml()} 籤</div><span style="animation: splashBreathe 1.5s infinite; font-size:0.9rem; color:#aaa;">✨撥動籤支...憑直覺再點擊抽籤</span>`;
            if (targetArea) {
                const qt = typeof getCurrentQtImages === 'function' ? getCurrentQtImages() : { active: '🏺' };
                if (isImageUrl(qt.active)) {
                    targetArea.innerHTML = `<img src="${qt.active}" class="shake-anim" style="height:100px; max-width:100%; object-fit:contain; pointer-events:none;" onerror="this.onerror=null; this.outerHTML='<span style=\\'font-size:4rem; pointer-events:none;\\'>🏺</span>';">`;
                } else {
                    targetArea.innerHTML = `<span class="shake-anim" style="display:inline-block; font-size:4rem; max-width:100%; pointer-events:none; word-break:break-all; overflow-wrap:anywhere;">${qt.active}</span>`;
                }
            }
        }
        return; 
    }

    if (window.isMiniShaking) return;
    window.isMiniShaking = true;
    
    // 🌟 搖晃時：顯示波浪動畫
    if (instr) instr.innerHTML = `<div style="font-size:1.3rem; margin-bottom:5px; font-weight:bold;">第 ${window.getWaveHtml()} 籤</div><span style="animation: splashBreathe 1.5s infinite; font-size:0.9rem; color:#aaa;">✨ 撥動籤支...${animSec} 秒後抽籤</span>`;
    
    if (targetArea) {
        const qt = typeof getCurrentQtImages === 'function' ? getCurrentQtImages() : { active: '🏺' };
        if (isImageUrl(qt.active)) {
            targetArea.innerHTML = `<img src="${qt.active}" class="shake-anim" style="height:100px; max-width:100%; object-fit:contain; pointer-events:none;" onerror="this.onerror=null; this.outerHTML='<span style=\\'font-size:4rem; pointer-events:none;\\'>🏺</span>';">`;
        } else {
            targetArea.innerHTML = `<span class="shake-anim" style="display:inline-block; font-size:4rem; max-width:100%; pointer-events:none; word-break:break-all; overflow-wrap:anywhere;">${qt.active}</span>`;
        }
    }
    
    setTimeout(() => {
        if (!window.isMiniShaking) return;
        window.isMiniShaking = false;
        
        stopShakingUI(); // 👉 秒數到，瞬間停止搖晃

        if (typeof window.executeMiniDrawResult === 'function') {
            window.executeMiniDrawResult();
        } else {
            if (instr) instr.innerHTML = "👉 發生錯誤，請重新點擊";
        }
    }, animSec * 1000);
};
