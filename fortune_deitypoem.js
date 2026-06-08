/* ---------------------------------------------------- */
/* ★ 籤詩系統分類字典 (POEM_CATEGORIES) - 解決分類分裂問題 */
/* ---------------------------------------------------- */
const POEM_CATEGORIES = {
    'mazu': { name: '🌸 天后宮一百籤', order: 1 },
    'guanyin': { name: '📿 觀音大士靈籤', order: 2 },
    'leiyushi': { name: '⛈️ 雷雨師一百籤', order: 3 },
    'baosheng': { name: '👨‍⚕️ 保生大帝靈籤', order: 4 },
    'shouzhi': { name: '🤴 受旨宮北帝靈籤', order: 5 },
    'jiazi': { name: '📜 六十甲子籤', order: 6 },
    'xuantianshangdi': { name: '🐢 玄天上帝感應靈籤', order: 7 },
    'kongming': { name: '🪭 啟示玄機院孔明神卦', order: 8 },
    'custom': { name: '🛠️ 自訂與大批匯入系統', order: 99 }
};

/* --- ★ 籤詩收錄：完美分組渲染引擎 (終極統一版) --- */
function renderCollectionMenu() {
    const container = document.getElementById('coll-menu-container');
    if (!container) return;

    container.innerHTML = '';
    container.className = ''; // 移除外層的 grid-menu，改由內部獨立生成

    // 裝箱作業：將所有的籤詩系統依據標籤 (category) 放入對應的箱子
    const grouped = {};
    Object.values(window.poemSystems).forEach(sys => {
        // 極致防呆：如果系統不存在或遇到壞資料，直接跳過
        if (!sys || !sys.id) return;

        let cat = sys.category || 'custom';
        if (String(sys.id).startsWith('sys_') || sys.isCustom) cat = 'custom';

        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(sys);
    });

    // 排序箱子：依照我們上方定義的 order
    const sortedCategories = Object.keys(grouped).sort((a, b) => {
        const orderA = POEM_CATEGORIES[a] ? POEM_CATEGORIES[a].order : 99;
        const orderB = POEM_CATEGORIES[b] ? POEM_CATEGORIES[b].order : 99;
        return orderA - orderB;
    });

    // 開始把箱子裡的按鈕畫到畫面上
    sortedCategories.forEach(cat => {
        const catInfo = POEM_CATEGORIES[cat] || { name: '📂 擴充系統' };
        const systems = grouped[cat];

        // 系統內部排序：【核心基礎籤】排第一，【宮廟繼承籤】排在它後面
        systems.sort((a, b) => {
            if (a.isBase && !b.isBase) return -1;
            if (!a.isBase && b.isBase) return 1;
            return 0;
        });

        // 建立這個分類的「區塊外框」
        const section = document.createElement('div');
        section.style.marginBottom = '25px';

        // 建立區塊「大標題」
        const header = document.createElement('h4');
        header.style.cssText = 'color: var(--accent); margin-bottom: 10px; border-bottom: 1px solid #444; padding-bottom: 8px; font-size: 1.15rem; display: flex; align-items: center;';
        header.innerText = catInfo.name;
        section.appendChild(header);

        // 建立這個分類專屬的「網格選單」
        const grid = document.createElement('div');
        grid.className = 'grid-menu';

        // 塞入系統按鈕
        systems.forEach(sys => {
            const btn = document.createElement('div');
            btn.className = 'menu-card compact-card';
            // 讓按鈕內距縮小，整體變矮
            btn.style.padding = '6px 12px';

            // 1. 決定預設樣式與圖示
            let defaultIcon = '📜';

            if (!sys.isBase && cat !== 'custom') {
                // ★ 繼承宮廟版：虛線框、放下面排列
                defaultIcon = '🏛️';
                btn.style.border = '1px dashed #666';
                btn.style.background = '#222';
            } else if (sys.isBase && cat !== 'custom') {
                // ★ 核心基礎籤：強制霸佔第一列，並給予特殊強調外觀
                btn.style.gridColumn = '1 / -1'; // 魔法：橫跨所有欄位 (獨佔一列)
                btn.style.border = '1px solid var(--accent)';
                btn.style.background = 'rgba(255, 255, 255, 0.05)';
            }

            if (cat === 'custom') defaultIcon = '✍️';

            // 2. 尋找有幾個神明綁定這個系統
            const linkedDeities = deities.filter(d => d && d.sysId === sys.id);

            // 3. 產生 icon 區塊的 HTML (調整大小適應左右排版)
            let iconHtml = `<div style="font-size: 2rem; line-height: 1;">${defaultIcon}</div>`;

            // 如果「剛好只有一個神明」綁定，就用該神明的專屬頭像 (支援上傳的聖像照片)
            if (linkedDeities.length === 1) {
                const d = linkedDeities[0];
                if (d.iconType === 'img') {
                    iconHtml = `<img src="${d.iconVal}" style="width: 2.2rem; height: 2.2rem; object-fit: cover; border-radius: 50%; border: 1px solid #555; background: #fff;">`;
                } else {
                    iconHtml = `<div style="font-size: 2rem; line-height: 1;">${d.iconVal}</div>`;
                }
            }

            // 4. ★ 組合按鈕內容：改為「左圖、右文」橫向緊湊排列
            btn.innerHTML = `
                    <div style="display: flex; align-items: center; width: 100%; text-align: left; gap: 10px;">
                        <div style="flex-shrink: 0; display: flex; align-items: center; justify-content: center; width: 2rem;">
                            ${iconHtml}
                        </div>
                        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; overflow: hidden;">
                            <div style="font-size: 1rem; font-weight: bold; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.2;">${sys.name}</div>
                            <div style="font-size: 0.75rem; color: #888; margin-top: 2px; line-height: 1;">共 ${sys.total} 籤</div>
                        </div>
                    </div>
                `;
            btn.onclick = () => { if (typeof openSystemList === 'function') openSystemList(sys.id, sys.name); };
            grid.appendChild(btn);
        });

        section.appendChild(grid);
        container.appendChild(section);
    });
}

// ==========================================
// ★ 模板引擎：自訂版型編輯區控制邏輯
// ==========================================

// 超詳細的預設教學版型
const DEFAULT_CUSTOM_TEMPLATE = `<style>
  /* 1. 外框設定 (aspect-ratio 決定籤詩的寬/高比例) */
  .my-custom-slip {
    aspect-ratio: 100 / 150; 
    background-color: #fdfbf7; /* 籤紙底色 */
    border: 3px double #8b0000; /* 邊框樣式 */
    padding: 15px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    font-family: serif; /* 襯線字體，較有古典味 */
  }
  
  /* 2. 宮廟標題 */
  .my-title {
    text-align: center;
    color: #8b0000;
    font-size: 1.5rem;
    font-weight: bold;
    border-bottom: 2px solid #8b0000;
    padding-bottom: 10px;
    margin-bottom: 10px;
  }
  
  /* 3. 籤號與吉凶 */
  .my-lot-info {
    text-align: center;
    font-size: 1.2rem;
    font-weight: bold;
    color: #111;
    margin-bottom: 15px;
  }
  
  /* 4. 詩句區塊 (直書設定) */
  .my-poem-lines {
    flex: 1; /* 自動撐滿剩餘空間 */
    display: flex;
    flex-direction: row-reverse; /* 直排由右至左 */
    justify-content: space-evenly;
    align-items: center;
    font-size: 1.8rem;
    font-weight: bold;
    writing-mode: vertical-rl; /* ★ 這是直書的魔法屬性 */
    letter-spacing: 5px;
  }
  
  /* 5. 解說區塊 */
  .my-interpretation {
    font-size: 0.9rem;
    color: #333;
    border-top: 1px dashed #ccc;
    padding-top: 10px;
    line-height: 1.5;
  }
</style>

<div class="fortune-slip my-custom-slip">
  
  <div class="my-title">{{templeName}}</div>
  
  <div class="my-lot-info">
    第 {{lotNum}} 籤 【{{level}}】
  </div>
  
  <div class="my-poem-lines">
    <div>{{l1}}</div>
    <div>{{l2}}</div>
    <div>{{l3}}</div>
    <div>{{l4}}</div>
  </div>
  
  <div class="my-interpretation">
    <b>【解曰】</b><br>
    {{interpretation}}
  </div>
  
</div>`;

// 控制編輯區顯示/隱藏的函式
window.toggleCustomTemplateArea = function () {
    const formatSel = document.getElementById('new-sys-format');
    const customArea = document.getElementById('custom-template-area');
    const templateBox = document.getElementById('new-sys-template');

    if (formatSel.value === 'custom') {
        customArea.style.display = 'block';
        // 如果裡面是空的，才塞入預設教學版型，避免洗掉使用者已經打好的字
        if (!templateBox.value.trim()) {
            templateBox.value = DEFAULT_CUSTOM_TEMPLATE;
        }
    } else {
        customArea.style.display = 'none';
    }
};

// ==========================================
// ★ 核心模板引擎：處理 {{變數}} 替換
// ==========================================
window.customPoemTemplates = window.customPoemTemplates || {};

window.customPoemTemplates['custom'] = function (poem, cleanLotNum, templeName, customData) {
    // 1. 先抓出這首籤詩所屬的系統設定，把使用者寫的 HTML/CSS 撈出來
    // (假設我們能透過目前全域變數 currentSystem 取得，這在籤詩收錄或抽籤時通常都已經被設定好)
    if (!window.currentSystem || !window.currentSystem.customTemplate) {
        return `<div style="padding:20px; color:red; text-align:center; background:#fff; border:2px solid red;">找不到自訂版型語法，請重新編輯系統。</div>`;
    }

    let tpl = window.currentSystem.customTemplate;

    // 2. 準備要替換的變數資料
    // 中文數字轉換
    let displayLotNum = typeof window.getCn === 'function' ? window.getCn(cleanLotNum) : cleanLotNum;

    let pLines = [poem.l1 || '', poem.l2 || '', poem.l3 || '', poem.l4 || ''];
    if (poem.poem) {
        let p = poem.poem.replace(/。/g, '').split(/[，,]/);
        pLines = [p[0] || '', p[1] || '', p[2] || '', p[3] || ''];
    }
    // 若有客製化修改，優先使用
    const lines = customData ? [customData.l1, customData.l2, customData.l3, customData.l4] : pLines;

    // 3. 開始執行替換魔法 (使用正則表達式把 {{xxx}} 換成真實文字)
    tpl = tpl.replace(/\{\{templeName\}\}/g, templeName || '未命名宮廟');
    tpl = tpl.replace(/\{\{lotNum\}\}/g, displayLotNum);
    tpl = tpl.replace(/\{\{level\}\}/g, poem.level || '');
    tpl = tpl.replace(/\{\{l1\}\}/g, lines[0] || '');
    tpl = tpl.replace(/\{\{l2\}\}/g, lines[1] || '');
    tpl = tpl.replace(/\{\{l3\}\}/g, lines[2] || '');
    tpl = tpl.replace(/\{\{l4\}\}/g, lines[3] || '');

    // 解說區塊的處理 (相容字串與陣列物件)
    let interpText = poem.interpretation || poem.meaning || '';
    if (poem.intents && Array.isArray(poem.intents)) {
        // 如果是結構化的解曰，把它串接成一行一行的文字
        interpText += '<br>' + poem.intents.map(i => `[${i.type}] ${i.text}`).join('<br>');
    }
    tpl = tpl.replace(/\{\{interpretation\}\}/g, interpText);

    // 返回最終渲染的 HTML 字串
    return tpl;
};

// ==========================================
// ★ 神明網格 iOS 抖動拖曳模式
// ==========================================
let isDeityEditMode = false;
let deityGridSortable = null;

window.toggleDeityEditMode = function () {
    const container = document.getElementById('deity-selection-list');
    const btn = document.getElementById('btn-toggle-sort');
    isDeityEditMode = !isDeityEditMode;

    if (isDeityEditMode) {
        // 開啟抖動模式
        container.classList.add('edit-mode-active');
        btn.innerText = '✅ 完成排序';
        btn.style.background = 'var(--primary)';
        btn.style.color = '#fff';
        btn.style.border = 'none';

        // 啟動拖曳引擎
        deityGridSortable = new Sortable(container, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            onEnd: function () {
                // 拖曳放開時，馬上抓取新順序並存檔
                const newOrder = Array.from(container.children).map(el => el.dataset.id);
                localStorage.setItem('zb_deities_order', JSON.stringify(newOrder));
            }
        });
    } else {
        // 關閉抖動模式
        container.classList.remove('edit-mode-active');
        btn.innerText = '✏️ 調整神明順序';
        btn.style.background = 'transparent';
        btn.style.color = '#ccc';
        btn.style.border = '1px solid #888';
        if (deityGridSortable) deityGridSortable.destroy();

        // 重新載入確切順序
        window.deities = getOrderedDeities();
    }
};

// ==========================================
// ★ 孔明神機版專用控制邏輯 (全域函數)
// ==========================================

// 切換：半張檢視 vs 整張平移
window.switchKSMode = function (btn, mode) {
    const root = btn.closest('.ks-layout-root');
    const btns = root.querySelectorAll('.ks-toggle-btn');
    btns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    if (mode === 'full') {
        root.querySelector('.ks-full-mode').style.display = 'block';
        root.querySelector('.ks-half-mode').style.display = 'none';
        root.querySelector('.ks-full-hint').style.display = 'block';
    } else {
        root.querySelector('.ks-full-mode').style.display = 'none';
        root.querySelector('.ks-half-mode').style.display = 'block';
        root.querySelector('.ks-full-hint').style.display = 'none';
    }
};

// 抽屜：開啟與關閉神意解說
window.toggleKSDrawer = function (btn, action, cat, text) {
    const wrapper = btn.closest('.ks-half-view-wrapper');
    const drawer = wrapper.querySelector('.ks-drawer');

    if (action === 'open') {
        wrapper.querySelector('.ks-drawer-cat').innerText = cat;
        wrapper.querySelector('.ks-drawer-text').innerHTML = text;
        drawer.classList.add('active');
    } else {
        drawer.classList.remove('active');
    }
};

window.deleteDeity = async function (targetId) {
    const id = targetId || document.getElementById('edit-deity-id').value;
    if (!id) return;

    if (await showConfirm("確定送神（刪除此神明）？\n資料將無法復原。", "送神確認")) {
        AppState.data.deities = AppState.data.deities.filter(x => x.id !== id);
        localStorage.setItem('zb_deities', JSON.stringify(AppState.data.deities));
        if (targetId) {
            renderManageDeityList();
        } else {
            goBack();
        }
        showToast("🗑️ 已成功請神明迴避");
    }
};

window.deletePoemSystem = async function (sysId) {
    const targetSys = AppState.data.poemSystems[sysId];
    if (!targetSys) return;

    const confirmMsg = `⚠️ 警告：您確定要刪除「${targetSys.name}」嗎？...`;

    if (await showConfirm(confirmMsg, "刪除系統確認")) {
        delete AppState.data.poemSystems[sysId];
        
        // ★ 修正：只做存檔與防呆，不要去呼叫 renderPoemView
        try {
            localStorage.setItem('zb_poem_systems', JSON.stringify(AppState.data.poemSystems));
        } catch (e) {
            console.error(e);
            showToast("❌ 儲存失敗！容量不足。");
        }

        // 2. 善後處理：檢查神明設定 (保持不變)
        let deityUpdated = false;
        deities.forEach(d => {
            if (d.sysId === sysId) {
                d.sysId = 'mazu'; 
                deityUpdated = true;
            }
        });
        if (deityUpdated) {
            localStorage.setItem('zb_deities', JSON.stringify(deities));
        }

        // 3. 善後處理：檢查一般求籤設定 (保持不變)
        if (settings.defaultSystem === sysId) {
            settings.defaultSystem = ""; 
            localStorage.setItem('zb_settings', JSON.stringify(settings));
            const sysSel = document.getElementById('sel-default-system');
            if (sysSel) sysSel.value = "";
        }

        showToast("🗑️ 已刪除該籤詩系統");
        renderSystemManager();
        renderPage('settings');
    }
}

function renderPoemView() {
    // 自動尋找是否有神明使用這個籤詩系統
    let matchedDeity = deities.find(x => x.sysId === currentSystem.id);

    // 如果找不到對應神明，就顯示系統名稱
    const customHeader = matchedDeity ? matchedDeity : { temple: currentCollectionTitle, address: "" };

    document.getElementById('collection-view-container').innerHTML = getFortuneSlipHTML(currentLot, currentSystem, customHeader);

    // ==========================================
    // ★ 唯讀保護魔法：如果是內建系統，就隱藏「編輯此籤」按鈕
    // ==========================================
    const editBtn = document.querySelector('#page-collection-view button[onclick="editCurrentPoem()"]');
    if (editBtn) {
        // 判斷它是不是自訂系統
        const isCustomSystem = currentSystem.isCustom;

        if (isCustomSystem) {
            editBtn.style.display = 'block'; // 自訂系統 -> 允許編輯
        } else {
            editBtn.style.display = 'none';  // 內建模組 (如白沙屯、孔明等) -> 保護資料，隱藏編輯按鈕
        }
    }
}

// 產生一個新的聖意輸入群組
function addIntentItem(typeVal = "", textVal = "") {
    const container = document.getElementById('esp-intents-container');
    const div = document.createElement('div');
    div.className = 'intent-edit-item form-group';
    div.style.cssText = 'background: #1a1a1a; padding: 12px; border-radius: 8px; border-left: 4px solid var(--accent); position: relative; margin-bottom: 12px;';
    div.innerHTML = `
            <button type="button" onclick="this.parentElement.remove()" style="position:absolute; right:8px; top:8px; background:rgba(244,67,54,0.2); border:1px solid #f44336; color:#f44336; border-radius:4px; padding:2px 8px; font-size:0.8rem; cursor:pointer;">刪除</button>
            <input type="text" class="intent-type-input" placeholder="類型 (例如: 功名、求財、婚姻)" value="${typeVal}" style="width: 75%; margin-bottom: 8px; padding: 8px; background:#111;">
            <textarea class="intent-text-input" rows="3" placeholder="解曰內容... (按 Enter 可換行)" style="width: 100%; margin-bottom: 0; padding: 8px; background:#111;">${textVal}</textarea>
        `;
    container.appendChild(div);
}

function editCurrentPoem() {
    goTo('edit-single-poem');
    document.getElementById('esp-system-id').value = currentSystem.id;
    document.getElementById('esp-lot-num').value = currentLot;

    const poem = currentSystem.content[currentLot];
    document.getElementById('esp-preview').innerHTML = "";
    ['l1', 'l2', 'l3', 'l4'].forEach(k => document.getElementById('esp-' + k).value = "");
    document.getElementById('esp-intents-container').innerHTML = ""; // 清空清單
    tempPoemImg = null;

    if (poem) {
        if (poem.img) document.getElementById('esp-preview').innerHTML = `<img src="${poem.img}" style="width:100%">`;

        const elLevel = document.getElementById('esp-level');
        if (elLevel) elLevel.value = poem.level || "";

        document.getElementById('esp-l1').value = poem.l1 || "";
        document.getElementById('esp-l2').value = poem.l2 || "";
        document.getElementById('esp-l3').value = poem.l3 || "";
        document.getElementById('esp-l4').value = poem.l4 || "";

        // 讀取聖意陣列
        if (poem.intents && poem.intents.length > 0) {
            poem.intents.forEach(item => addIntentItem(item.type, item.text));
        } else if (poem.interpretation) {
            // 兼容舊版的單一文字
            addIntentItem("聖意", poem.interpretation);
        } else {
            addIntentItem(); // 預設給一個空的
        }
    } else {
        addIntentItem();
    }
}

function handleSinglePoemImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        tempPoemImg = ev.target.result;
        document.getElementById('esp-preview').innerHTML = `<img src="${tempPoemImg}" style="width:100%">`;
    };
    reader.readAsDataURL(file);
}

function clearSinglePoemImage() {
    tempPoemImg = "CLEAR";
    document.getElementById('esp-preview').innerHTML = "";
}

function saveSinglePoem() {
    const level = document.getElementById('esp-level') ? document.getElementById('esp-level').value : "";
    const l1 = document.getElementById('esp-l1').value;
    const l2 = document.getElementById('esp-l2').value;
    const l3 = document.getElementById('esp-l3').value;
    const l4 = document.getElementById('esp-l4').value;

    // 收集所有輸入的聖意資料
    let intents = [];
    document.querySelectorAll('.intent-edit-item').forEach(item => {
        const type = item.querySelector('.intent-type-input').value.trim();
        const text = item.querySelector('.intent-text-input').value.trim();
        if (type || text) intents.push({ type, text });
    });

    let poem = currentSystem.content[currentLot] || {};
    poem.level = level;
    poem.l1 = l1; poem.l2 = l2; poem.l3 = l3; poem.l4 = l4;
    poem.intents = intents; // ★ 存入陣列
    delete poem.interpretation; // 清除舊版格式以省空間

    if (tempPoemImg === "CLEAR") delete poem.img;
    else if (tempPoemImg) poem.img = tempPoemImg;

    currentSystem.content[currentLot] = poem;
    poemSystems[currentSystem.id] = currentSystem;
    
    // ★ 修正後的乾淨區塊
    try {
        localStorage.setItem('zb_poem_systems', JSON.stringify(AppState.data.poemSystems));
        showToast("已儲存");
        goBack().then(() => setTimeout(renderPoemView, 50));
    } catch (e) {
        console.error(e);
        showToast("❌ 儲存失敗！可能是圖片太多導致容量不足，請清除部分圖片。");
    }
}

function createNewPoemSystem() {
    const name = document.getElementById('new-sys-name').value;
    const total = parseInt(document.getElementById('new-sys-total').value);
    const format = document.getElementById('new-sys-format').value; 
    if (!name) return showToast("請輸入名稱");
    
    const id = 'sys_' + Date.now();
    poemSystems[id] = { id, name, total, format, isCustom: true, content: {} };
    
    // ★ 修正：專屬於「建立系統」的 try...catch
    try {
        localStorage.setItem('zb_poem_systems', JSON.stringify(AppState.data.poemSystems));
        showToast("建立成功");
        
        // 🌟 建立成功後清空名稱，避免下次進來還殘留
        document.getElementById('new-sys-name').value = '';

        renderCollectionMenu();
        goBack();
    } catch (e) {
        console.error(e);
        showToast("❌ 建立失敗！容量不足。");
    }
}

// =========================================================================
// ★ 遺失的神明聖像產生器 (全域統一版)
// =========================================================================
window.getDeityIconHtml = function (deityId) {
    if (!deityId || deityId === 'custom') return `<div style="font-size:2rem; margin-bottom:5px;">✍️</div>`;

    // 1. 尋找神明資料
    let d = null;
    if (typeof deities !== 'undefined') {
        d = deities.find(x => x.id === deityId);
    }
    if (!d && typeof window.extraDeities !== 'undefined') {
        d = window.extraDeities.find(x => x.id === deityId);
    }
    if (!d && window.AppState && window.AppState.data && window.AppState.data.deities) {
        d = window.AppState.data.deities.find(x => x.id === deityId);
    }

    const defaultEmoji = (d && d.iconType === 'emoji') ? d.iconVal : '⛩️';
    const fallbackHtml = `<div style="font-size:2rem; margin-bottom:5px;">${defaultEmoji}</div>`;

    // 2. 檢查本地自訂上傳的照片
    const customImg = localStorage.getItem(`custom_deity_img_${deityId}`);
    if (customImg) {
        return `<div class="icon-wrapper">
                    <img src="${customImg}" 
                         onerror="this.parentElement.innerHTML='${fallbackHtml}'" 
                         style="width:40px; height:40px; border-radius:50%; object-fit:cover; margin-bottom:5px; border: 1px solid var(--accent);">
                </div>`;
    }

    // 3. 檢查內建照片
    let builtInImgPath = d ? (d.builtInImg || (d.iconType === 'img' ? d.iconVal : null)) : null;
    if (builtInImgPath) {
        return `<div class="icon-wrapper">
                    <img src="${builtInImgPath}" 
                         onerror="this.parentElement.innerHTML='${fallbackHtml}'" 
                         style="width:40px; height:40px; border-radius:50%; object-fit:cover; margin-bottom:5px; border: 1px solid var(--accent);">
                </div>`;
    }

    // 4. 檢查雲端照片 (如果有)
    if (d && d.cloudImgUrl) {
        if (typeof window.downloadAndCacheCloudImage === 'function') {
            window.downloadAndCacheCloudImage(deityId, d.cloudImgUrl);
        }
        return `<div class="icon-wrapper" id="cloud-img-target-${deityId}">
                    ${fallbackHtml}
                </div>`;
    }

    // 5. 什麼都沒有，就回傳 Emoji
    return fallbackHtml;
};

// =========================================================================
// ★ 雲端圖片背景下載與轉存工人
// =========================================================================
window.downloadAndCacheCloudImage = async function (deityId, url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("下載失敗");

        const blob = await response.blob();
        const reader = new FileReader();

        reader.onloadend = function () {
            const base64data = reader.result;
            try {
                localStorage.setItem(`custom_deity_img_${deityId}`, base64data);
            } catch (e) { console.warn("圖片太大，LocalStorage 存不下"); }

            const targetEl = document.getElementById(`cloud-img-target-${deityId}`);
            if (targetEl) {
                targetEl.innerHTML = `
                    <img src="${base64data}" 
                         style="width:40px; height:40px; border-radius:50%; object-fit:cover; margin-bottom:5px; border: 1px solid var(--accent); animation: fadeIn 0.5s;">`;
            }
        }
        reader.readAsDataURL(blob);
    } catch (error) {
        console.error("無法下載雲端聖像:", error);
    }
};

// =========================================================================
// ★ 終極神明選擇引擎 (Smart Modal 全動態生成版，保證 100% 絕對彈出！)
// =========================================================================
// 1. 動態開啟視窗
window.openDeityModal = function (toolId) {
    window.currentDeityTool = toolId;
    const modal = document.getElementById('deity-select-modal');
    if (modal) {
        modal.style.display = 'flex';
        window.refreshSelectDeityList(); // 重新畫出清單
    }
};

// 2. 物理銷毀視窗 (乾淨俐落)
window.closeDeityModal = function () {
    //const modal = document.getElementById('dynamic-deity-modal');
    //if (modal) modal.remove(); // ★ 用完直接物理毀滅，保證不留幽靈
    const modal = document.getElementById('deity-select-modal');
    if (modal) modal.style.display = 'none';

    // 退回網址歷史紀錄
    if (window.history.state && window.history.state.modalOpen) {
        setTimeout(() => window.history.back(), 50);
    }
};

// 3. 選擇神明後觸發
window.selectDeityFromModal = function (deityId) {
    try {
        window.closeDeityModal(); // 第一時間銷毀視窗

        let tool = window.currentDeityTool;
        if (!tool) return;

        if (tool === 'qiuqian') {
            if (typeof startDeityQiuqian === 'function') startDeityQiuqian(deityId);
            return;
        }

        let selectElId = tool === 'manual' ? 'manual-selected-deity-id' : `${tool}-deity-sel`;
        const selectEl = document.getElementById(selectElId);

        if (selectEl) {
            selectEl.value = deityId;
            if (tool === 'manual') {
                const d = (window.deities || []).find(x => x.id === deityId);
                if (d) {
                    const btnName = document.getElementById('btn-manual-name');
                    const btnIcon = document.getElementById('btn-manual-icon');
                    
                    if (btnName) btnName.innerText = d.name;
                    
                    // 💡【核心修正】：改用系統標準的 getIconHtml(d) 來產生正確的圖片標籤或 Emoji
                    if (btnIcon) {
                        if (typeof window.getIconHtml === 'function') {
                            // 加上縮放樣式，避免圖片太大把按鈕撐壞
                            const rawHtml = window.getIconHtml(d);
                            // 用簡單正則表達式或 CSS 控制圖片大小，確保相容按鈕高度
                            btnIcon.innerHTML = rawHtml.replace('<img', '<img style="width:24px; height:24px; border-radius:50%; object-fit:cover; margin-right:5px;"');
                        } else {
                            btnIcon.innerText = d.emoji || '⛩️';
                        }
                    }
                }
            } else {
                // 如果是問事或比較模式，觸發它們專屬的更新邏輯
                if (typeof window.handleDeityChangeForTools === 'function') {
                    window.handleDeityChangeForTools();
                }
            }
        }
    } catch (e) { console.error("選擇神明發生錯誤:", e); }
};

// ==========================================
// ★ 完美融合版：神明大頭貼上傳 (支援壓縮與舊版邏輯)
// ==========================================
window.handleDeityImage = function (e) {
    const file = e.target.files[0];
    if (!file) return;

    // 處理圖片顯示與存檔的內部邏輯
    const processImage = (base64) => {
        // 1. 存入暫存變數 (相容你的 AppState 架構)
        tempImgData = base64;

        // 2. 呼叫你原本寫好的預覽更新函數
        if (typeof updateDeityPreview === 'function') {
            updateDeityPreview(base64);
        }

        // 3. 貼心小功能：上傳圖片後自動清空文字 Emoji
        const emojiInput = document.getElementById('edit-deity-emoji');
        if (emojiInput) emojiInput.value = "";
    };

    // 如果系統有壓縮圖片的功能，就壓縮後再存 (超級重要！)
    if (typeof compressImage === 'function') {
        compressImage(file, 400, 0.8, processImage);
    } else {
        // 萬一沒載入壓縮功能，退回你舊版的原生讀取方式
        const reader = new FileReader();
        reader.onload = (ev) => processImage(ev.target.result);
        reader.readAsDataURL(file);
    }
};

window.refreshSelectDeityList = function () {
    // 1. 動態判斷：如果是彈出視窗開啟中，就渲染到彈出視窗；否則渲染到主頁面
    // (保險起見，多加一個 === 'block' 的判斷)
    const isModalOpen = document.getElementById('deity-select-modal').style.display === 'flex' || document.getElementById('deity-select-modal').style.display === 'block';
    const containerId = isModalOpen ? 'modal-deity-selection-list' : 'deity-selection-list';
    const container = document.getElementById(containerId);

    if (!container) return;
    container.innerHTML = "";

    const currentDeities = (typeof getOrderedDeities === 'function' ? getOrderedDeities() : window.deities) || [];

    if (currentDeities.length === 0) {
        container.innerHTML = "<div style='grid-column: span 3; color: #888;'>尚無神明資料，請先新增</div>";
        return;
    }

    currentDeities.forEach(d => {
        const card = document.createElement('div');
        card.className = 'menu-card';
        card.style.cssText = "border: 2px solid var(--accent); padding: 10px 5px; cursor: pointer; text-align:center;";

        card.onclick = (e) => {
            e.preventDefault(); e.stopPropagation();

            if (isModalOpen) {
                // 💡 【核心修正】：不要在這裡自己寫死邏輯了！
                // 直接呼叫上面那段已經寫好的 selectDeityFromModal，讓它統一處理！
                if (typeof window.selectDeityFromModal === 'function') {
                    window.selectDeityFromModal(d.id);
                }
            } else {
                // 情境 B：在「神明求籤」的主頁面中點擊，直接進入求籤模式
                if (typeof startDeityQiuqian === 'function') startDeityQiuqian(d.id);
            }
        };

        const iconHtml = typeof window.getIconHtml === 'function' ? window.getIconHtml(d) : '⛩️';
        card.innerHTML = `${iconHtml}<h3 style="font-size: 0.9rem; margin-top: 5px;">${d.name}</h3>`;
        container.appendChild(card);
    });
};

// ==========================================
// ★ 重構：管理神明列表 (3欄排版 + 滿版新增按鈕 + 圖片優先判別)
// ==========================================
window.renderManageDeityList = function () {
    const listContainer = document.getElementById('manage-deity-list');
    if (!listContainer) return;

    // 1. 拔除外層的 grid-menu class，讓外層成為一般容器，才能放滿版按鈕
    listContainer.className = ''; 

    // 2. 建立內層的 3 欄網格容器
    let html = '<div class="grid-menu grid-3-col">';

    const allDeities = typeof window.getAllDeities === 'function' ? window.getAllDeities() : (window.deities || []);

    // 3. 渲染所有神明卡片
    allDeities.forEach(d => {
        let iconHtml = '';
        const imgSrc = d.cloudImgUrl || d.builtInImg; // 抓取圖片網址
        
        // ★ 核心判別式：有圖片網址就優先帶入圖片，沒有才帶入 Emoji
        if (imgSrc) {
            iconHtml = `<img src="${imgSrc}" alt="${d.name}" class="icon-img" onerror="this.style.display='none'">`;
        } else {
            const emoji = d.iconVal || '🙏';
            iconHtml = `<span class="icon-emoji">${emoji}</span>`;
        }

        const safeId = String(d.id).replace(/['"]/g, ''); 
        const deityName = d.name || '未命名';

        html += `
            <div class="menu-card compact-card" onclick="window.openEditDeity('${safeId}')">
                <div class="icon-box">
                    ${iconHtml}
                </div>
                <h3 style="margin-top:5px; font-size:0.9rem;">${deityName}</h3>
            </div>
        `;
    });

    html += '</div>'; // 關閉 3 欄網格容器

    // 4. ★ 新增神明滿版按鈕 (獨立於網格之外，置底延展)
    html += `
        <button class="action-btn" onclick="window.openEditDeity()" 
            style="margin-top: 25px; border: 1px dashed #ffb300; background: rgba(255, 179, 0, 0.1); color: #ffb300; box-shadow: none;">
            ➕ 新增神明
        </button>
    `;

    listContainer.innerHTML = html;
};

// ==========================================
// ★ 神明切換連動：自動帶入籤詩系統總數
// ==========================================
window.handleDeityChangeForTools = function (tool = 'simple') {
    ['simple', 'compare'].forEach(t => {
        const sel = document.getElementById(`${t}-deity-sel`);
        const btnName = document.getElementById(`btn-${t}-name`);
        const btnIcon = document.getElementById(`btn-${t}-icon`);
        const clearBtn = document.getElementById(`btn-${t}-clear`);
        const customInput = document.getElementById(`${t}-custom-deity`);

        const drawTotalInput = document.getElementById(t === 'simple' ? 'simple-draw-total' : 'comp-fu-draw-total');
        const askPermChk = document.getElementById(t === 'simple' ? 'simple-ask-perm' : 'comp-fu-ask-perm');
        // 🌟 新增：抓取 Checkbox 外層的 Label 標籤
        const askPermLabel = askPermChk ? askPermChk.closest('label') : null;

        if (sel && btnName && btnIcon) {
            const val = sel.value;
            if (val && val !== 'custom') {
                const currentDeities = typeof getOrderedDeities === 'function' ? getOrderedDeities() : (window.deities || []);
                const d = currentDeities.find(x => x.id === val);
                if (d) {
                    btnName.innerText = d.name;
                    btnIcon.innerHTML = typeof window.getIconHtml === 'function' ? window.getIconHtml(d) : '🙏';
                    if (clearBtn) clearBtn.style.display = 'block';
                    if (customInput) { customInput.style.display = 'none'; customInput.value = ''; }

                    // 🌟 強制請示：勾選、鎖定，並將整行字反灰 (半透明)
                    if (askPermChk) {
                        askPermChk.checked = true;
                        askPermChk.disabled = false;
                        if (askPermLabel) {
                            askPermLabel.style.opacity = '1';// 保持正常亮度
                            askPermLabel.style.cursor = 'pointer'; // 滑鼠游標恢復正常
                        }
                    }

                    const sys = window.poemSystems[d.sysId];
                    if (sys && drawTotalInput) {
                        drawTotalInput.value = sys.total;
                        drawTotalInput.readOnly = true;
                        drawTotalInput.style.background = '#333';
                        drawTotalInput.style.color = '#aaa';
                    } else if (drawTotalInput) {
                        drawTotalInput.readOnly = false;
                        drawTotalInput.style.background = '#111';
                        drawTotalInput.style.color = 'var(--accent)';
                    }
                }
            } else {
                btnName.innerText = "點擊選擇神明";
                btnIcon.innerHTML = "⛩️";
                if (clearBtn) clearBtn.style.display = 'none';
                if (customInput) customInput.style.display = 'block';

                // 🌟 解除鎖定，並恢復文字顏色
                if (askPermChk) {
                    askPermChk.disabled = false;
                    if (askPermLabel) {
                        askPermLabel.style.opacity = '1'; // 恢復亮度
                        askPermLabel.style.cursor = 'pointer'; // 滑鼠游標恢復正常
                    }
                }

                if (drawTotalInput) {
                    drawTotalInput.readOnly = false;
                    drawTotalInput.style.background = '#111';
                    drawTotalInput.style.color = 'var(--accent)';
                }
            }
        }
    });
};

// ==========================================
// ★ 2. 送神功能 (清除神明)
// ==========================================
window.clearToolDeity = async function (tool) {
    if (await window.smartConfirm("確定要清除目前選擇的神明嗎？", "送神確認")) {
        const sel = document.getElementById(`${tool}-deity-sel`);
        if (sel) {
            sel.value = ''; // 清空選單值
            window.handleDeityChangeForTools(tool); // 觸發畫面更新
            window.showToast("✅ 已完成送神");
        }
    }
};

window.openEditDeity = function (id = null, isTempMode = false, sourceTool = '') {
    // 記錄來源工具
    if (sourceTool) window.currentDeityTool = sourceTool;

    // 重置所有暫存與欄位
    tempImgData = null;
    tempDeityQt = { static: null, active: null }; // 🌟 重置專屬籤筒暫存

    document.getElementById('edit-deity-id').value = id || "";
    document.getElementById('edit-deity-name').value = "";
    document.getElementById('edit-deity-temple').value = "";
    document.getElementById('edit-deity-saint-target').value = 3;
    document.getElementById('edit-deity-emoji').value = "🙏";
    
    // 🌟 幫你補回來的：清空進階欄位
    document.getElementById('edit-deity-committee').value = "";
    document.getElementById('edit-deity-address').value = "";
    document.getElementById('edit-deity-right-text').value = "";
    document.getElementById('edit-deity-left-text').value = "";
    document.getElementById('edit-deity-circle-text').checked = false;
    document.getElementById('edit-deity-header-color').value = "#d32f2f";
    document.getElementById('edit-deity-bg-color').value = "#1a1a1a";
    
    const bgPreview = document.getElementById('edit-deity-bg-preview');
    if (bgPreview) bgPreview.style.backgroundImage = 'none';

    // 🌟 預先重置所有預覽區塊
    updateDeityPreview(); 
    updateDeityQtPreview('static', null);
    updateDeityQtPreview('active', null);

    // 載入系統選單
    const sel = document.getElementById('edit-deity-system');
    if (sel) {
        sel.innerHTML = '<option value="">無 (不綁定系統)</option>';
        if (typeof AppState !== 'undefined' && AppState.data && AppState.data.poemSystems) {
            Object.values(AppState.data.poemSystems).forEach(s => {
                sel.innerHTML += `<option value="${s.id}">${s.name}</option>`;
            });
        }
    }

    const headerTitle = document.getElementById('header-title');

    // ★ 切換顯示模式
    if (isTempMode) {
        if (headerTitle) headerTitle.innerText = "臨時自訂神明";
        document.getElementById('edit-deity-advanced-fields').style.display = 'none';
        document.getElementById('edit-deity-normal-btns').style.display = 'none';
        document.getElementById('edit-deity-temp-btns').style.display = 'block';
    } else {
        if (headerTitle) headerTitle.innerText = id ? "編輯神明" : "新增神明";
        document.getElementById('edit-deity-advanced-fields').style.display = 'block';
        document.getElementById('edit-deity-normal-btns').style.display = 'flex';
        document.getElementById('edit-deity-temp-btns').style.display = 'none';

        // ★ 載入舊資料邏輯 (完整版)
        if (id) {
            const allDeities = typeof window.getAllDeities === 'function' ? window.getAllDeities() : (AppState.data.deities || []);
            const d = allDeities.find(x => String(x.id) === String(id));
            
            if (d) {
                document.getElementById('edit-deity-name').value = d.name || "";
                document.getElementById('edit-deity-temple').value = d.temple || "";
                if (sel) sel.value = d.sysId || '';
                document.getElementById('edit-deity-saint-target').value = d.saintTarget || 3;
                
                // 🌟 幫你補回來的：載入進階屬性
                document.getElementById('edit-deity-committee').value = d.committee || "";
                document.getElementById('edit-deity-address').value = d.address || "";
                document.getElementById('edit-deity-right-text').value = d.rightText || "";
                document.getElementById('edit-deity-left-text').value = d.leftText || "";
                document.getElementById('edit-deity-circle-text').checked = !!d.circleText;
                document.getElementById('edit-deity-header-color').value = d.headerColor || "#d32f2f";
                document.getElementById('edit-deity-bg-color').value = d.bgColor || "#1a1a1a";
                if (d.bgImg && bgPreview) bgPreview.style.backgroundImage = `url(${d.bgImg})`;

                // 🌟 頭像判別式：圖片 > 專屬 Emoji > 預設 🙏
                const imgSrc = d.cloudImgUrl || d.builtInImg;
                
                // 無論有沒有圖片，先把 Emoji 欄位填入正確的備胎值 (擴充包設定 > 預設 🙏)
                // 只要 d.iconVal 有值就填入，如果是空的就給 🙏
                document.getElementById('edit-deity-emoji').value = d.iconVal ? d.iconVal : '🙏';

                // 決定預覽區要顯示什麼
                if (imgSrc) {
                    // 有圖片網址，強制預覽圖片
                    updateDeityPreview(imgSrc);
                } else {
                    // 沒圖片，呼叫空參數，系統會自動去抓剛剛填好的 Emoji 來顯示
                    updateDeityPreview(); 
                }

                // 🌟 籤筒判別式：將資料丟給專屬預覽函數判斷
                tempDeityQt = { static: d.qtStatic || null, active: d.qtActive || null };
                updateDeityQtPreview('static', tempDeityQt.static);
                updateDeityQtPreview('active', tempDeityQt.active);

                document.getElementById('btn-del-deity').style.display = 'block';
            }
        } else {
            document.getElementById('btn-del-deity').style.display = 'none';
        }
    }

    if (typeof goTo === 'function') goTo('edit-deity');
};

// --- 神明專屬籤筒邏輯 ---
let tempDeityQt = { static: null, active: null }; // 暫存變數

function handleDeityQtUploadTemp(e, type) {
    const file = e.target.files[0];
    if (!file) return;

    // 判斷是否為 GIF (不壓縮) 或一般圖片 (壓縮)
    if (file.type === 'image/gif') {
        const reader = new FileReader();
        reader.onload = (ev) => {
            tempDeityQt[type] = ev.target.result;
            updateDeityQtPreview(type, ev.target.result);
        };
        reader.readAsDataURL(file);
    } else {
        // 使用既有的壓縮函數 (200px 夠用了)
        compressImage(file, 200, 0.6, (res) => {
            tempDeityQt[type] = res;
            updateDeityQtPreview(type, res);
        });
    }
}

function updateDeityQtPreview(type, src) {
    const id = (type === 'static') ? 'edit-deity-qt-static-preview' : 'edit-deity-qt-active-preview';
    const el = document.getElementById(id);
    if (!el) return;

    if (src) {
        // 判斷 src 是否為圖片 (Base64 或 網址)
        if (src.startsWith('data:') || src.startsWith('http') || src.startsWith('./')) {
            el.innerHTML = `<img src="${src}" style="height:100%; width:100%; object-fit:contain; color:transparent;" alt="qt-preview">`;
        } else {
            // 如果不是圖片，那就是 Emoji！顯示 Emoji
            el.innerHTML = `<span style="font-size:2rem; color:#fff;">${src}</span>`;
        }
    } else {
        // 如果沒有 src，顯示預設的提示文字
        el.innerHTML = `<span style="color:#666;">${type === 'static' ? '靜止' : '搖動'}</span>`;
    }
}

function updateDeityPreview(imgSrc = null) {
    const box = document.getElementById('edit-deity-preview');
    if (!box) return;
    
    if (imgSrc) {
        // 如果有傳入圖片，顯示圖片，並使用 transparent 魔法隱藏破圖文字
        box.innerHTML = `<img src="${imgSrc}" style="width:100%; height:100%; object-fit:cover; border-radius:8px; color:transparent;" alt="preview">`;
    } else {
        // 否則顯示 Emoji
        const emo = document.getElementById('edit-deity-emoji').value || "🙏";
        box.innerHTML = `<span class="icon-emoji" style="font-size:2.5rem">${emo}</span>`;
    }
}

async function saveDeity() {
    const id = document.getElementById('edit-deity-id').value;
    const name = document.getElementById('edit-deity-name').value;
    const temple = document.getElementById('edit-deity-temple').value;
    const committee = document.getElementById('edit-deity-committee').value;
    const address = document.getElementById('edit-deity-address').value;
    const rightText = document.getElementById('edit-deity-right-text').value.trim();
    const leftText = document.getElementById('edit-deity-left-text').value.trim();
    const circleText = document.getElementById('edit-deity-circle-text').checked;
    const sysId = document.getElementById('edit-deity-system').value;
    const saintTarget = document.getElementById('edit-deity-saint-target').value || 3;
    if (!name) return showToast("請輸入名稱");

    let iconType = 'emoji';
    let iconVal = document.getElementById('edit-deity-emoji').value || "🙏";
    let cloudImgUrl = null;

    if (tempImgData) {
        // 使用者有上傳新圖片
        iconType = 'img'; // 或許您可以新增一個類型叫做 'cloud_img'
        iconVal = tempImgData; // 本地先保留一份 Base64 (可選，作為離線備用)

        // 🌟 啟動雲端上傳
        showToast("⏳ 正在將聖像同步至雲端...");
        try {
            // 建立一個獨一無二的路徑，例如 deity_icons/d_123456789.webp
            const storagePath = `deity_icons/${id || 'd_' + Date.now()}.webp`;
            cloudImgUrl = await window.uploadImageToCloud(tempImgData, storagePath);
            showToast("✅ 雲端同步完成！");
        } catch (error) {
            console.error("雲端上傳失敗，僅儲存於本機", error);
            // 您可以決定失敗時是要中止儲存，還是繼續只存本地
        }
    } else if (id) {
        const old = deities.find(x => x.id === id);
        if (old && old.cloudImgUrl) cloudImgUrl = old.cloudImgUrl;
    }

    // 建立新物件
    const newObj = {
        id: id || 'd' + Date.now(),
        name,
        temple,
        committee,
        address,
        rightText,
        leftText,
        circleText,
        sysId,
        iconType,
        iconVal,
        cloudImgUrl: cloudImgUrl, // 🌟 存入資料庫
        // ★ 加入籤筒資料
        qtStatic: tempDeityQt.static,
        qtActive: tempDeityQt.active,
        saintTarget: saintTarget,
        // ★ 新增：存入主題設定
        headerColor: document.getElementById('edit-deity-header-color').value,
        bgColor: document.getElementById('edit-deity-bg-color').value,
    };
    // ★ 新增：處理背景圖片邏輯
    if (tempDeityBgImg === "CLEAR") {
        newObj.bgImage = null;
    } else if (tempDeityBgImg) {
        newObj.bgImage = tempDeityBgImg;
    } else if (id) {
        const old = deities.find(x => x.id === id);
        if (old && old.bgImage) newObj.bgImage = old.bgImage; // 沒換圖就保留舊圖
    }

    // 如果是編輯模式且沒有上傳新籤筒，保留舊的 (避免被 null 覆蓋)
    if (id) {
        const old = deities.find(x => x.id === id);
        if (old) {
            if (!newObj.qtStatic && old.qtStatic) newObj.qtStatic = old.qtStatic;
            if (!newObj.qtActive && old.qtActive) newObj.qtActive = old.qtActive;
        }
    }

    if (id) {
        const idx = deities.findIndex(x => x.id === id);
        if (idx !== -1) deities[idx] = newObj;
    } else {
        deities.push(newObj);
    }
    localStorage.setItem('zb_deities', JSON.stringify(deities));
    showToast("儲存成功");
    goBack();
}

//  抽籤時讀取神明籤筒  //
function getCurrentQtImages() {
    // 1. 讀取系統預設 (System Defaults)
    let s = localStorage.getItem('custom_qiantong_static');
    let a = localStorage.getItem('custom_qiantong_active');

    // 互補邏輯：如果只設定了一張，另一張也用一樣的
    if (s && !a) a = s;
    if (!s && a) s = a;

    // 預設值 (如果都沒設定，就用變數 QIANTONG_DEFAULT)
    s = s || QIANTONG_DEFAULT;
    a = a || s;

    // 2. 讀取神明專屬 (Deity Specific) - 優先權更高
    if (currentMode === 'deity' && currentDeity) {
        let ds = currentDeity.qtStatic;
        let da = currentDeity.qtActive;

        // 兼容舊資料欄位 qiantongImg (避免舊版資料出錯)
        if (currentDeity.qiantongImg) {
            if (!ds) ds = currentDeity.qiantongImg;
            if (!da) da = currentDeity.qiantongImg;
        }

        // 互補
        if (ds && !da) da = ds;
        if (!ds && da) ds = da;

        // 如果有神明設定，就覆蓋系統設定
        if (ds) s = ds;
        if (da) a = da;
    }

    return { static: s, active: a };
}
