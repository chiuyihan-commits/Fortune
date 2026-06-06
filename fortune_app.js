async function initApp() {
    console.log("🚀 [系統追蹤] 1. 成功進入 initApp，準備開始載入流程...");
    
    // 🌟 關鍵 1：紀錄程式剛開始載入的精確時間
    const appStartTime = Date.now(); 

    try {
        // ... (中間保留你原本所有的載入邏輯) ...
        console.log("🚀 [系統追蹤] 2. 準備啟動資料庫引擎...");
        if (typeof window.initDatabaseEngine === 'function') await window.initDatabaseEngine();

        console.log("🚀 [系統追蹤] 3. 準備同步核心資料...");
        if (typeof syncCoreData === 'function') syncCoreData();

        console.log("🚀 [系統追蹤] 4. 準備載入系統設定...");
        if (typeof loadSettings === 'function') loadSettings();

        console.log("🚀 [系統追蹤] 5. 準備渲染歷史紀錄...");
        if (typeof renderRecords === 'function') renderRecords();

        if (window.currentDB === 'firebase' && typeof window.startRealTimeSync === 'function') {
            // ... firebase 監聽邏輯 ...
        }

    } catch (err) {
        console.error("APP 初始化過程中發生錯誤:", err);
    } finally {
        
        // ==========================================
        // 🌟 關鍵 2：完美開門協調器 (放在 initApp 的最後面)
        // ==========================================
        const splashEl = document.getElementById('app-splash-screen');
        if (splashEl) {
            const showSplash = localStorage.getItem('cfg_show_splash') !== 'false';
            const isSoftReload = sessionStorage.getItem('skipSplash') === 'true';

            if (isSoftReload || !showSplash) {
                // 如果是軟重載或關閉動畫，瞬間隱藏遮罩
                splashEl.style.display = 'none';
                sessionStorage.removeItem('skipSplash');
            } else {
                // ⏱️ 設定廟門「至少」要關著給使用者看幾毫秒 (這裡設為 1200 毫秒 = 1.2秒)
                const minWaitTime = 1200; 
                
                // 計算剛才上面的資料載入總共花了多少時間
                const loadTime = Date.now() - appStartTime; 
                
                // 數學魔法：如果載入只花了 100 毫秒，就強制補足剩下的 1100 毫秒
                // 如果手機很慢載入花了 2000 毫秒，remainingTime 就會是 0，立刻準備開門
                const remainingTime = Math.max(0, minWaitTime - loadTime);

                setTimeout(() => {
                    // 1. 觸發 3D 開門動畫
                    splashEl.classList.add('doors-opening'); 
                    
                    // 2. 等待 1.5 秒 (配合 CSS 的 1.5s 轉場時間)，門完全推開後再徹底隱藏
                    setTimeout(() => {
                        splashEl.style.display = 'none';
                    }, 1500); 
                    
                }, remainingTime);
            }
        }
        
    }
}

window.debounce = function (func, delay = 300) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, delay);
    };
};

function updateCupDisplay(id, res) {
    const el = document.getElementById(id);
    if (!el) return;

    // 如果是重置狀態 (-1)，隱藏框框
    if (res.type === -1) {
        el.innerText = res.text;
        el.classList.remove('show'); // 隱藏
        return;
    }

    // ★ 新增：每次顯示筊杯結果時，觸發微小震動 (50毫秒)！
    triggerVibration(50);

    // 有結果時，顯示框框
    el.classList.add('show');

    let content = "";
    if (res.imgSrc) {
        content = `<img src="${res.imgSrc}" class="cup-icon-sm">`;
    } else {
        content = `<div class="res-dot ${res.dotClass}">${res.char}</div>`;
    }
    el.innerHTML = `<div class="cup-content" style="display:flex; align-items:center; justify-content:center;">${content}<span>${res.text}</span></div>`;
}

// ★ 專屬 Tap 模式切換邏輯 (點一下搖、再點一下停)
window.toggleTapShake = function (e) {
    if (e && e.cancelable) e.preventDefault();
    if (isDrawing) return; // 如果已經在出籤了就防連點

    const animArea = document.getElementById('draw-anim-area');
    const instr = document.getElementById('draw-instruction');

    if (!isShaking) {
        // 第一下點擊：開始搖晃
        isShaking = true;
        // 加入 breathing-text 創造神秘呼吸感
        if (instr) instr.innerHTML = "<span class='breathing-text'>✨ 抽籤中...憑直覺再次點擊抽籤</span>";
        
        if (animArea) {
            const qt = typeof getCurrentQtImages === 'function' ? getCurrentQtImages() : { static: '🏺', active: '🏺' };
            animArea.innerHTML = qt.active.startsWith('data:')
                ? `<img src="${qt.active}" class="shake-anim" style="height:100px; object-fit:contain;">`
                : `<span style="font-size:4rem;" class="shake-anim" id="step2-cylinder-icon">${qt.active}</span>`;
        }
    } else {
        // 第二下點擊：停止搖晃並出籤
        isShaking = false;
        isDrawing = true;
        
        if (animArea) animArea.removeEventListener('click', window.toggleTapShake);
        
        if (typeof finishDrawLot === 'function') finishDrawLot();
    }
};

function startTouchShake(e) {
    if (e && e.cancelable) e.preventDefault(); // 阻止滾動與選取
    if (isDrawing || isShaking) return;

    isShaking = true;
    // 🗑️ shakeStartTime = Date.now(); (已經不需要記時了)

    const animArea = document.getElementById('draw-anim-area');
    const instr = document.getElementById('draw-instruction');
    const qt = typeof getCurrentQtImages === 'function' ? getCurrentQtImages() : { static: '🏺', active: '🏺' };

    // ★ 加入高度鎖定與動態圖案切換
    if (animArea) {
        animArea.innerHTML = qt.active.startsWith('data:')
            ? `<img src="${qt.active}" class="shake-anim" style="height:100px; object-fit:contain; pointer-events:none; user-select:none; -webkit-touch-callout:none;">`
            : `<span style="font-size:4rem;" class="shake-anim" id="step2-cylinder-icon">${qt.active}</span>`;
    }
    
    if (instr) instr.innerText = "👋 撥動中... (放開抽籤) 👋";
}

function stopTouchShake(e) {
    if (e && e.cancelable) e.preventDefault();
    if (!isShaking || isDrawing) return;

    // 🗑️ 已經將 const diff = Date.now() - shakeStartTime; 
    // 🗑️ 以及 if (diff < 100) { ... } 的 0.1 秒防誤觸機制徹底刪除！

    // 確認放開手指，鎖定狀態並出籤
    isDrawing = true;
    isShaking = false;

    const animArea = document.getElementById('draw-anim-area');
    if (animArea) {
        animArea.removeEventListener('touchstart', startTouchShake);
        animArea.removeEventListener('touchend', stopTouchShake);
        animArea.removeEventListener('touchcancel', stopTouchShake);
        animArea.removeEventListener('mousedown', startTouchShake);
        animArea.removeEventListener('mouseup', stopTouchShake);
        animArea.removeEventListener('mouseleave', stopTouchShake);
    }

    // 立刻執行出籤！
    if (typeof finishDrawLot === 'function') finishDrawLot();
}

function showActiveImage(el, imgSrc) {
    if (imgSrc.startsWith('data:')) {
        const cls = imgSrc.startsWith('data:image/gif') ? '' : 'shake-anim';
        el.innerHTML = `<img src="${imgSrc}" style="height:150px;width:auto; pointer-events:none; user-select:none; -webkit-touch-callout:none;" class="${cls}">`;
    } else {
        el.innerHTML = `<div style="font-size:5rem; user-select:none; pointer-events:none; -webkit-touch-callout:none;" class="shake-anim">${imgSrc}</div>`;
    }
}

function startTimerDraw() {
    if (isDrawing) return; // 防連點
    isDrawing = true;

    const btn = document.getElementById('btn-draw');
    btn.disabled = true; // 立即反灰

    const animArea = document.getElementById('draw-anim-area');
    const imgs = getCurrentQtImages();

    showActiveImage(animArea, imgs.active);

    setTimeout(() => {
        finishDrawLot();
        // ★ 修改點：移除 btn.disabled = false; 
        // 讓它保持反灰，直到畫面切換到下一步，避免使用者在動畫結束瞬間重複點擊
    }, (settings.animDuration || 2) * 1000);
}

function finishDrawLot() {
    const animArea = document.getElementById('draw-anim-area');
    const instr = document.getElementById('draw-instruction');
    if (instr) instr.innerText = "✨ 籤詩已出！";

    let total = 101;
    if (currentMode === 'normal') {
        total = (currentSystem) ? currentSystem.total : (settings.customTotal || 60);
    } else {
        total = (currentSystem ? currentSystem.total : 101);
    }
    total = parseInt(total);
    if (isNaN(total) || total < 1) total = 101;

    // ★ 核心修正：判斷是否「抽後不放回」
    const putBack = document.getElementById('chk-put-back') && document.getElementById('chk-put-back').checked;

    if (!putBack) {
        // 【不放回模式】

        // 1. 檢查可用籤筒是否為空 (代表剛開始，或是全抽完了)，若為空則重新填滿 1~total
        if (!window.availableLots || window.availableLots.length === 0) {
            window.availableLots = Array.from({ length: total }, (_, i) => i + 1);
        }

        // 2. 從「還沒被抽掉的籤」裡面，隨機挑選一個「位置 (Index)」
        const randomIndex = Math.floor(Math.random() * window.availableLots.length);

        // 3. 抽出該位置的籤號，並同時將它從陣列中刪除
        currentLot = window.availableLots.splice(randomIndex, 1)[0];

        // 🛡️ 4. 防呆機制：萬一真的抽出 undefined，給它一個備用的隨機數
        if (!currentLot) {
            currentLot = Math.floor(Math.random() * total) + 1;
        }

    } else {
        // 【傳統模式】直接抽 (抽後放回)
        currentLot = Math.floor(Math.random() * total) + 1;
    }

    //抽出籤的瞬間「登愣」的兩段震動效果
    triggerVibration([50, 100, 50]);

    // ★ 核心修正 1：把數字放到畫面上方的獨立區塊
    const lotNumDisplay = document.getElementById('lot-num-display');
    if (lotNumDisplay) lotNumDisplay.innerText = currentLot;
    
    // ★ 核心修正 2：讓上方的籤號區塊浮現 (透明度變 1)
    const titleEl = document.getElementById('step2-lot-title');
    if (titleEl) titleEl.style.opacity = '1';

    // ★ 核心修正 3：讓下方的籤筒變成「抽完籤」的終止狀態 (qt.active)
    const qt = typeof getCurrentQtImages === 'function' ? getCurrentQtImages() : { static: '🏺', active: '🏺' };
    animArea.innerHTML = qt.active.startsWith('data:')
        ? `<img src="${qt.active}" style="height:100%; object-fit:contain; animation: popIn 0.5s;">`
        : `<span style="font-size:4rem; animation: popIn 0.5s;" id="step2-cylinder-icon">${qt.active}</span>`;

    // 延遲 800 毫秒後進入步驟 3
    setTimeout(() => {
        initConfirmStep(); // 進入步驟 3
    }, 800);
}

/* --- 步驟 3：確認籤號 (嚴格模式) --- */
function initConfirmStep() {
    document.getElementById('step-2').style.display = 'none';
    document.getElementById('step-3').style.display = 'flex';

    document.getElementById('confirm-lot-num').innerText = currentLot;
    saintCount = 0;
    document.getElementById('saint-count').innerText = "0";

    // 更新目標杯數
    let targetCount = 3;
    if (currentMode === 'deity' && currentDeity && currentDeity.saintTarget) {
        targetCount = parseInt(currentDeity.saintTarget);
    } else if (settings.saintTarget) {
        targetCount = parseInt(settings.saintTarget);
    }
    const reqSpan = document.getElementById('req-saint');
    if (reqSpan) reqSpan.innerText = targetCount;

    updateCupDisplay('confirm-cup', { text: '準備擲筊', type: -1 });

    document.getElementById('step-3-action-area').style.display = 'none';
    document.getElementById('confirm-msg').style.display = 'none';
    const btnConf = document.getElementById('btn-confirm');
    btnConf.style.display = 'block';
    btnConf.disabled = false;
}

function throwCupForConfirm() {
    const btn = document.getElementById('btn-confirm');

    // ★ 交給引擎接管
    executeThrowCupWrapper(btn, (res) => {
        updateCupDisplay('confirm-cup', res);

        let targetCount = 3;
        if (currentMode === 'deity' && currentDeity && currentDeity.saintTarget) targetCount = parseInt(currentDeity.saintTarget);
        else if (settings.saintTarget) targetCount = parseInt(settings.saintTarget);

        if (res.type === 1) {
            saintCount++;
            document.getElementById('saint-count').innerText = saintCount;
            if (saintCount >= targetCount) {
                btn.style.display = 'none';
                const topBtn = document.querySelector('#step-3 button[onclick="reDraw()"]');
                if (topBtn) topBtn.style.display = 'none';
                showStep3Actions(true);
            }
        } else {
            saintCount = 0;
            document.getElementById('saint-count').innerText = "0";
            btn.style.display = 'none';

            // 🌟 1. 隱藏原本會出現的「笑/蓋筊請重新抽籤」外框訊息
            const msgEl = document.getElementById('confirm-msg');
            if (msgEl) msgEl.style.display = 'none';

            // 🌟 2. 直接在剛產生出來的杯象 (res.text) 後面追加文字
            const cupDisplay = document.getElementById('confirm-cup');
            if (cupDisplay) {
                cupDisplay.innerHTML += `<span style="color:#ff5252; font-weight:bold; font-size:1.2rem;">，請重新抽籤</span>`;
            }

            showStep3Actions(false);
        }
    });
}

function showStep3Actions(isSuccess) {
    const actionArea = document.getElementById('step-3-action-area');
    const msgEl = document.getElementById('step-3-msg');
    const btnsEl = document.getElementById('step-3-btns');

    // 取得要操作的文字與杯象區塊
    const instructionEl = document.getElementById('confirm-instruction');
    const statusTextEl = document.getElementById('confirm-status-text');
    const confirmCupEl = document.getElementById('confirm-cup');

    actionArea.style.display = 'block';
    btnsEl.innerHTML = "";

    if (isSuccess) {
        // 1. 隱藏「請擲筊確認...」與「目前：X聖筊」
        if (instructionEl) instructionEl.style.display = 'none';
        if (statusTextEl) statusTextEl.style.display = 'none';

        // 2. 直接將原本顯示筊杯的地方，換成慶祝文字
        if (confirmCupEl) {
            confirmCupEl.innerHTML = "🎉三聖筊確認🎉";
            // 確保文字大小與顏色夠顯眼 (可依喜好調整)
            confirmCupEl.style.fontSize = "1.8rem";
            confirmCupEl.style.color = "var(--accent)";
        }

        // 3. 隱藏原本的 msgEl，因為不需要再顯示「第XX籤 三聖筊確認」了
        msgEl.innerText = "";
        msgEl.style.display = 'none';

        // 顯示領取籤詩按鈕
        btnsEl.innerHTML = `<button class="action-btn" onclick="showResult()">📜 領取籤詩</button>`;
    } else {
        // 求籤失敗時 (蓋筊或笑筊)

        // 請擲筊確認是否為此籤 (需連續3聖筊)」提示開關
        if (instructionEl) instructionEl.style.display = 'none';
        // 「目前：0聖筊」提示開關
        if (statusTextEl) statusTextEl.style.display = 'block';
        msgEl.style.display = 'block';

        msgEl.innerText = "求籤失敗 (未滿三聖筊)";
        msgEl.style.color = "#f44336";

        // 🌟 5. 隱藏原本的「求籤失敗 (未滿三聖筊)」文字
        if (msgEl) {
            msgEl.style.display = 'none';
            msgEl.innerText = "";
        }

        // 提供「重新抽籤」按鈕
        btnsEl.innerHTML = `
            <button class="action-btn" onclick="window.retryDraw()" style="background:#ffb300; color:#000;">🔄 重新抽籤</button>
        `;
    }
}

// 失敗後的重抽函式
window.retryDraw = function () {
    // 1. 切換顯示步驟
    document.getElementById('step-3').style.display = 'none';
    document.getElementById('step-2').style.display = 'flex';
    currentLot = 0; // 清空目前籤號

    const instructionEl = document.getElementById('confirm-instruction');
    const statusTextEl = document.getElementById('confirm-status-text');
    const confirmCupEl = document.getElementById('confirm-cup');
    const saintCountEl = document.getElementById('saint-count');
    const msgEl = document.getElementById('step-3-msg');

    // 恢復顯示提示文字
    if (instructionEl) instructionEl.style.display = 'block';
    if (statusTextEl) statusTextEl.style.display = 'block';

    // 恢復筊杯區的預設狀態
    if (confirmCupEl) {
        confirmCupEl.style.fontSize = ""; // 清除被放大的字體
        confirmCupEl.style.color = "";    // 清除特殊顏色
        confirmCupEl.innerHTML = "準備擲筊"; // 恢復預設文字
    }

    // 畫面上的聖杯計數器歸零
    if (saintCountEl) saintCountEl.innerText = "0";

    // 隱藏成功/失敗的提示訊息區塊
    if (msgEl) {
        msgEl.style.display = 'none';
        msgEl.innerText = "";
    }

    // 隱藏下方的按鈕區 (避免一進來就看到)
    const actionArea = document.getElementById('step-3-action-area');
    if (actionArea) actionArea.style.display = 'none';

    // ==========================================
    // 3. 確保內部計數器歸零
    // ==========================================
    if (typeof currentSaints !== 'undefined') {
        currentSaints = 0;
    }
    
    // ★ 核心修正 2：徹底解除抽籤鎖定，讓第二次觸控能順利觸發！
    if (typeof isDrawing !== 'undefined') isDrawing = false;
    if (typeof isShaking !== 'undefined') isShaking = false;
    window.isThrowingCup = false;

    // ==========================================
    // ★ 5. UI 無縫接軌還原魔法 (移至 setupDrawStep2 前面執行)
    // ==========================================
    // 5-1. 把上方的籤號重新隱藏
    const titleEl = document.getElementById('step2-lot-title');
    if (titleEl) titleEl.style.opacity = '0';
    
    // 改變文字會觸發背後的 MutationObserver
    const lotNumDisplay = document.getElementById('lot-num-display');
    if (lotNumDisplay) lotNumDisplay.innerText = '?';
    
    // 5-2. 把提示文字改回「請抽籤」
    const instr = document.getElementById('draw-instruction');
    if (instr) instr.innerText = "請抽籤";

    // 🗑️ 刪除了 5-3，不再手動覆寫籤筒！防呆交給 setupDrawStep2 處理。

    // 4. 執行重置動畫區函數
    // ★ 核心修正 3：加入 setTimeout！確保在 Observer 執行完畢後，
    // 再由 setupDrawStep2 覆蓋上帶有「防觸控選取 (pointer-events:none)」的最完美 DOM。
    setTimeout(() => {
        if (typeof setupDrawStep2 === 'function') setupDrawStep2();
    }, 10);
}

function showResult() {
    document.getElementById('step-3').style.display = 'none';
    document.getElementById('step-4').style.display = 'flex';

    // ★ 新增：將步驟 1 的問事內容自動帶入步驟 4 的主旨框
    const step1Sub = document.getElementById('input-qiuqian-subject-step1');
    const finalSub = document.getElementById('input-subject');
    if (step1Sub && finalSub) {
        finalSub.value = step1Sub.value;
    }

    const container = document.getElementById('result-display');
    const normalDisplay = document.getElementById('normal-result-display');

    if (currentMode === 'normal') {
        const defSysId = settings.defaultSystem;
        if (defSysId && poemSystems[defSysId]) {
            normalDisplay.style.display = 'none';
            container.style.display = 'block';
            const genericHeader = { temple: '求籤結果', committee: '' };
            container.innerHTML = getFortuneSlipHTML(currentLot, poemSystems[defSysId], genericHeader);
        } else {
            normalDisplay.style.display = 'block';
            container.style.display = 'none';
            document.getElementById('final-lot-num').innerText = currentLot;
        }
    } else {
        normalDisplay.style.display = 'none';
        container.style.display = 'block';
        container.innerHTML = getFortuneSlipHTML(currentLot, currentSystem, currentDeity);
    }
    // 強制將籤詩結果區塊捲動回最頂部
    //const resultDisplay = document.getElementById('result-display');
    //if (resultDisplay) {
    //    resultDisplay.scrollTop = 0;
    //}
    // 強制將求籤結果畫面捲動回最頂部
    const step4 = document.getElementById('step-4');
    if (step4) {
        step4.scrollTop = 0;
    }
}

window.finishQiuqian = async function () {
    if (await showConfirm("確定要中斷求籤並返回首頁嗎？", "中斷求籤")) {
        isQiuqianActive = false; // ★ 確定要結束，解除防跳出攔截
        goTo('home');
    }
}

/* --- ★ 渲染現代版版型 --- */
function renderModernSlip(templeName, lotStr, poem, lines, intentsList, oldIntentText) {
    let modernIntentHTML = "";
    if (intentsList.length > 0) {
        modernIntentHTML = intentsList.map(item => `<div style="margin-bottom: 12px; text-align:left;">${item.type ? `<span style="background:var(--primary); color:#fff; padding:3px 8px; border-radius:6px; font-size:0.95rem; margin-right:8px; display:inline-block; font-weight:bold;">${item.type}</span>` : ''}<span style="line-height:1.6; color:#555;">${item.text.replace(/\n/g, '<br>')}</span></div>`).join('');
    } else if (oldIntentText) {
        modernIntentHTML = oldIntentText.replace(/\n/g, '<br>');
    }
    return `
        <div class="fortune-slip modern">
            <div class="modern-temple">${templeName}</div>
            <div class="modern-lot">${lotStr} ${poem.level ? `【${poem.level}】` : ''}</div>
            <div class="modern-poem">${lines[0]}，${lines[1]}。<br>${lines[2]}，${lines[3]}。</div>
            ${modernIntentHTML ? `<div class="modern-intent"><strong style="color:var(--primary); font-size:1.1rem; display:block; margin-bottom:10px;">【聖意 / 解曰】</strong>${modernIntentHTML}</div>` : ''}
        </div>
    `;
}

function renderClassicSlip(classicTempleHtml, lotStr, lines, intentsList, oldIntentText) {
    let classicIntentHTML = "";
    if (intentsList.length > 0) {
        classicIntentHTML = intentsList.map(item => `<div class="classic-intent-col">${item.type ? `<div class="classic-i-type">${item.type}</div>` : ''}<div class="classic-i-text" style="white-space: pre-wrap;">${item.text.replace(/\n/g, '<br>')}</div></div>`).join('');
    } else if (oldIntentText) {
        classicIntentHTML = oldIntentText.split('\n\n').map(block => `<div class="classic-intent-col"><div class="classic-i-text" style="white-space: pre-wrap;">${block.replace(/\n/g, '<br>')}</div></div>`).join('');
    }

    return `
        <div class="fortune-slip classic">
            <div class="slip-inner-border">
                <div class="slip-header">${classicTempleHtml}</div>
                <div class="slip-body">
                    <div class="side-col" style="writing-mode: vertical-rl; text-orientation: upright; display:flex; justify-content:center; align-items:center; font-weight:bold;">${lotStr}</div>
                    <div class="poem-text-area" style="display:flex; flex-direction:row-reverse; justify-content:space-around; align-items:center;">
                        <div class="poem-line" style="writing-mode:vertical-rl; text-orientation:upright; font-weight:bold;">${lines[0]}</div>
                        <div class="poem-line" style="writing-mode:vertical-rl; text-orientation:upright; font-weight:bold;">${lines[1]}</div>
                        <div class="poem-line" style="writing-mode:vertical-rl; text-orientation:upright; font-weight:bold;">${lines[2]}</div>
                        <div class="poem-line" style="writing-mode:vertical-rl; text-orientation:upright; font-weight:bold;">${lines[3]}</div>
                    </div>
                </div>
                <div class="slip-interpretations" style="display:flex; flex-direction:row-reverse; height:35%; padding:3cqw; box-sizing:border-box;">
                    <div class="classic-intent-container">
                        ${classicIntentHTML || '<div style="writing-mode:vertical-rl; text-orientation:upright; font-size:3.6cqw;">（尚無解說）</div>'}
                    </div>
                </div>
            </div>
        </div>
    `;
}

/* --- ★ 全新多版型渲染引擎 (極簡動態路由版) --- */
function getFortuneSlipHTML(lotNum, system, deity) {
    const cleanLotNum = parseInt(lotNum, 10);
    const poem = (system && system.content) ? (system.content[cleanLotNum] || {}) : {};

    // 處理客製化圖片籤詩
    let customKey = (deity ? deity.id : (system ? system.id : '')) + '_' + cleanLotNum;
    let customData = customPoems[customKey] || customPoems['baishatun_mazu_' + cleanLotNum] || customPoems['Baishatun_Mazu_' + cleanLotNum];

    if (customData && customData.type === 'img') return `<img src="${customData.val}" style="width:90vw; max-width:420px; display:block; margin:15px auto; border-radius:12px; box-shadow:0 8px 20px rgba(0,0,0,0.4);">`;
    if (poem.img) return `<img src="${poem.img}" style="width:90vw; max-width:420px; display:block; margin:15px auto; border-radius:12px; box-shadow:0 8px 20px rgba(0,0,0,0.4);">`;

    const templeName = deity ? deity.temple : (system ? system.name : "廟宇");

    // 決定 format (版型名稱)
    let format = (system && system.format) ? system.format : 'classic';

    // ==========================================
    // ★ 核心修復：只要有註冊外掛版型，就交給外掛處理！
    // 統一傳遞 5 個參數：(詩文資料, 籤號, 宮名, 神明資料, 客製資料)
    // ==========================================
    if (window.customPoemTemplates && window.customPoemTemplates[format]) {
        return window.customPoemTemplates[format](poem, cleanLotNum, templeName, deity, customData);
    }

    // ==========================================
    // 以下為沒有專屬外掛時的「通用備用版型」(Fallback)
    // ==========================================
    let pLines = [poem.l1 || '', poem.l2 || '', poem.l3 || '', poem.l4 || ''];
    if (poem.poem) {
        let p = poem.poem.replace(/。/g, '').split(/[，,]/);
        pLines = [p[0] || '', p[1] || '', p[2] || '', p[3] || ''];
    }
    const lines = (customData && customData.l1) ? [customData.l1, customData.l2, customData.l3, customData.l4] :
        (deity && deity.l1) ? [deity.l1, deity.l2, deity.l3, deity.l4] : pLines;

    let intentsList = (customData && customData.intents) ? customData.intents : (poem.intents || []);
    let oldIntentText = (customData && customData.interpretation) ? customData.interpretation : (poem.interpretation || poem.meaning || "");

    const cnNums = ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
    const getCn = n => { if (n == 100) return "一百"; if (n == 101) return "一〇一"; if (n < 10) return cnNums[n]; if (n < 20) return "十" + (n % 10 ? cnNums[n % 10] : ""); return cnNums[Math.floor(n / 10)] + "十" + (n % 10 ? cnNums[n % 10] : ""); };

    let displayLotCn = getCn(cleanLotNum);
    let lotStr = `第${displayLotCn}籤`;
    if (cleanLotNum === 0) lotStr = "籤王";
    else if (cleanLotNum === 101) lotStr = "籤首";
    else if (cleanLotNum === 102) lotStr = "籤尾";

    let classicTempleHtml = `<div class="temple-name" style="font-size:10cqw; font-weight:bold; letter-spacing:0.3em; direction: rtl; unicode-bidi: bidi-override;">${templeName}</div>`;
    if (deity && (deity.rightText || deity.leftText)) {
        classicTempleHtml = `
            <div style="display: flex; align-items: center; justify-content: space-evenly; width: 100%; padding: 0 1cqw; direction: rtl;">
                ${deity.leftText ? `<div style="font-size: 6cqw; font-weight: bold; color: #111;">${deity.leftText}</div>` : ''}
                <div class="temple-name" style="margin: 0; font-size:8cqw; font-weight:bold; letter-spacing:0.3em; direction: rtl; unicode-bidi: bidi-override;">${templeName}</div>
                ${deity.rightText ? `<div style="font-size: 6cqw; font-weight: bold; color: #111;">${deity.rightText}</div>` : ''}
            </div>`;
    }
    if (format === 'modern') {
        return renderModernSlip(templeName, lotStr, poem, lines, intentsList, oldIntentText);
    }
    return renderClassicSlip(classicTempleHtml, lotStr, lines, intentsList, oldIntentText);
}

/* --- 管理系統列表 (修正版) --- */
function renderSystemManager() {
    const container = document.getElementById('manage-system-list');
    if (!container) return;
    container.innerHTML = "";

    const systems = Object.values(poemSystems);
    const customSystems = systems.filter(s => s && s.isCustom);
    if (customSystems.length === 0) {
        container.innerHTML = "<div style='color:#666; text-align:center; padding:20px; border:1px dashed #555; border-radius:10px;'>目前無自訂籤詩系統<br><span style='font-size:0.8rem'>(內建系統受到保護，無法刪除)</span></div>";
        return;
    }

    customSystems.forEach(sys => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.style.marginBottom = '10px';
        div.innerHTML = `
                <div class="list-text">
                    <div class="list-title" style="font-size:1.1rem; color:var(--accent);">${sys.name}</div>
                    <div class="list-sub">總籤數: ${sys.total} 首</div>
                </div>
                <button class="secondary-btn" onclick="deletePoemSystem('${sys.id}')" style="width:auto; padding:8px 15px; color:#f44336; border-color:#f44336; font-weight:bold;">🗑️ 刪除</button>
            `;
        container.appendChild(div);
    });
}

function openSystemList(sysId, title) {
    currentSystem = poemSystems[sysId];
    currentCollectionTitle = title;

    goTo('collection-list');

    // 標題直接用系統傳來的名字
    document.getElementById('poem-list-title').innerText = title;

    const searchInput = document.getElementById('poemSearchInput');
    if (searchInput) { searchInput.value = ''; }

    const c = document.getElementById('poem-list-container');
    c.innerHTML = "";

    // ★ 動態處理排序：有什麼號碼就排什麼，把 101, 102 抓到最前面
    let lots = Object.keys(currentSystem.content).map(Number);
    lots.sort((a, b) => {
        if (a > 100 && b <= 100) return -1; // 101, 102 放前面
        if (b > 100 && a <= 100) return 1;
        return a - b; // 其餘照順序
    });

    // 依序畫出按鈕
    lots.forEach(i => {
        const btn = document.createElement('div');
        btn.className = 'poem-btn';
        const poem = currentSystem.content[i];
        if (!poem) return;

        const hasText = poem && (poem.l1 || poem.poem || poem.img || poem.v1 || poem.isKing);

        let previewText = '待建檔';
        if (poem.isKing) previewText = '籤首'; // 籤王列表顯示為籤首
        else if (poem.l1) previewText = poem.l1;
        else if (poem.poem) previewText = poem.poem.split(/[，,。]/)[0];
        else if (poem.v1) previewText = poem.v1[0];
        else if (poem.img) previewText = '圖片籤詩';

        let idxText = `第${i}首`;
        if (i === 0) idxText = "籤　首"; // 數字 0 顯示為籤首
        if (i === 101) idxText = "籤　首";
        if (i === 102) idxText = "籤　尾";

        btn.innerHTML = `<div class="poem-idx">${idxText}</div><div class="poem-text">${hasText ? previewText : '待建檔'}</div>`;
        btn.onclick = () => { currentLot = i; goTo('collection-view'); renderPoemView(); };
        c.appendChild(btn);
    });
}

/* --- 9. 紀錄與設定 --- */
function populateManualTypes() {
    const sel = document.getElementById('manual-type');
    if (!sel) return;
    sel.innerHTML = `<option value="一般求籤">一般求籤</option>`;
    deities.forEach(d => {
        sel.innerHTML += `<option value="${d.name}">${d.name}</option>`;
    });
    sel.innerHTML += `<option value="問事">問事</option><option value="比較">比較擲筊</option>`;
}

function populateSimpleCompareDeities() {
    ['simple-deity-sel', 'compare-deity-sel'].forEach(id => {
        const sel = document.getElementById(id);
        if (!sel) return;
        sel.innerHTML = '<option value="">(自訂神明/親臨聖前)</option>';
        deities.forEach(d => {
            sel.innerHTML += `<option value="${d.id}">${d.name}</option>`;
        });
    });

    // ★ 加入這行：確保每次重置選單時，同步更新 Checkbox 隱藏與強制打勾的防呆狀態
    if (typeof handleDeityChangeForTools === 'function') {
        handleDeityChangeForTools();
    }
}

function saveRecord() {
    // 🌟 修正：把 const 改成 let，允許後續重新賦值
    let sub = document.getElementById('input-subject').value.trim();
    const note = document.getElementById('input-note').value;

    // 注意：如果是神明求籤，可以不強制輸入主旨(為了顯示籤號)，但一般求籤建議輸入
    // 這裡為了彈性，暫時不強制擋
    if (!sub) {
        sub = currentLot ? `第 ${currentLot} 籤` : "求籤紀錄";
    }

    let typeStr = "";
    if (currentMode === 'normal') {
        const manual = document.getElementById('input-normal-deity').value.trim();
        // 格式：如果有輸入神明，存成 "神明名稱 (一般)"，沒輸入存成 "一般求籤"
        typeStr = manual ? `${manual} (一般)` : "一般求籤";
    } else {
        typeStr = currentDeity ? currentDeity.name : '未知神明';
    }

    const rec = { id: Date.now(), date: new Date().toLocaleString(), type: typeStr, lot: currentLot, subject: sub, note: note };
    window.Database.saveRecord(rec);
    isQiuqianActive = false;
    window.isFortuneSaved = true;
    showToast("💾 紀錄已成功儲存！");
    goTo('home');
}

// ==========================================
// ★ 紀錄列表渲染 (支援向左滑動顯示修改/刪除按鈕)
// ==========================================
window.renderRecords = function () {
    const c = document.getElementById('records-container');
    if (!c) return;
    c.innerHTML = "";

    // 1. 動態注入隱藏捲軸的 CSS (只要注入一次)
    if (!document.getElementById('swipe-style')) {
        document.head.insertAdjacentHTML('beforeend', '<style id="swipe-style">.swipe-scroll-wrapper::-webkit-scrollbar { display: none; } .swipe-scroll-wrapper { -ms-overflow-style: none; scrollbar-width: none; }</style>');
    }

    const keyword = (document.getElementById('search-keyword')?.value || "").toLowerCase();
    const filterType = document.getElementById('search-filter')?.value || "all";

    let filteredRecords = records.filter(r => {
        const matchKey = !keyword ||
            (r.subject && r.subject.toLowerCase().includes(keyword)) ||
            (r.note && r.note.toLowerCase().includes(keyword));
        let matchType = true;
        if (filterType === 'poem') matchType = !r.type.includes('問事') && !r.type.includes('比較');
        if (filterType === 'simple') matchType = r.type.includes('問事');
        if (filterType === 'compare') matchType = r.type.includes('比較');
        return matchKey && matchType;
    });

    if (filteredRecords.length === 0) {
        c.innerHTML = "<div style='text-align:center;color:#666;margin-top:20px;'>無符合的紀錄</div>";
        return;
    }

    filteredRecords.forEach(r => {
        const div = document.createElement('div');
        div.className = 'record-item';
        // 移除預設的 padding，交給內部容器控制
        div.style.cssText = "padding:0; overflow:hidden; border-radius:10px; margin-bottom:10px; border:1px solid #444;";

        let tagClass = "tag-yellow";
        let tagName = "神明求籤";
        let displayDeity = r.type;

        if (r.type.includes("一般求籤") || r.type.includes("(一般)")) {
            tagClass = "tag-white"; tagName = "一般求籤";
            displayDeity = r.type.replace("一般求籤", "").replace("(一般)", "").trim();
        } else if (r.type.includes("問事")) {
            tagClass = "tag-red"; tagName = "問事擲筊";
            displayDeity = r.type.replace("(問事)", "").replace("問事", "").trim();
        } else if (r.type.includes("比較")) {
            tagClass = "tag-blue"; tagName = "比較擲筊";
            displayDeity = r.type.replace("(比較)", "").replace("比較擲筊", "").replace("比較", "").trim();
        }

        if (r.lot && r.lot !== '-') {
            let lotHtml = `<span style="color:var(--accent); font-size:0.9em; margin-left:4px;">#${r.lot}</span>`;
            displayDeity = displayDeity ? (displayDeity + lotHtml) : lotHtml;
        }

        let mainSubject = r.subject;
        if ((!mainSubject || mainSubject.trim() === "") && r.lot && r.lot !== '-') {
            mainSubject = `第 ${r.lot} 籤`;
        }

        let headerHtml = `<span class="rec-tag ${tagClass}">${tagName}</span>`;
        if (displayDeity) headerHtml += `<span class="rec-deity-name">${displayDeity}</span>`;
        let bodyHtml = `<span class="rec-main-subject">${mainSubject || "(無主旨)"}</span>`;

        div.innerHTML = `
            <div class="swipe-scroll-wrapper" style="display:flex; width:100%; overflow-x:auto; scroll-snap-type: x mandatory; background:var(--card-bg, #222);">
                <div id="record-card-${r.id}" style="flex: 0 0 100%; scroll-snap-align: start; padding: 15px; cursor:pointer; box-sizing:border-box; background:var(--card-bg, #222);" onclick="openRecordDetail(${r.id})">
                    <div class="rec-top" style="display:block;">
                        <div class="rec-header-row">
                            ${headerHtml}
                            <span class="rec-date" style="margin-left:auto; margin-right:10px;">${r.date.split(' ')[0]}</span>
                        </div>
                        ${bodyHtml}
                    </div>
                </div>
                <div style="flex: 0 0 140px; scroll-snap-align: end; display:flex;">
                    <button onclick="window.openEditRecordModal(${r.id})" style="flex:1; background:#1976d2; color:#fff; border:none; border-radius:0; font-size:0.9rem; margin:0; cursor:pointer;">✎<br>修改</button>
                    <button onclick="window.deleteRecord(${r.id})" style="flex:1; background:#d32f2f; color:#fff; border:none; border-radius:0; font-size:0.9rem; margin:0; cursor:pointer;">🗑️<br>刪除</button>
                </div>
            </div>
        `;
        c.appendChild(div);
    });
};

// ==========================================
// ★ 開啟紀錄詳情 (修復神明後綴字比對錯誤)
// ==========================================
window.openRecordDetail = function (id) {
    currentDetailRecordId = id;

    if (typeof window.renderDetailFuRows === 'function') window.renderDetailFuRows();
    const qText = document.getElementById('detail-fu-q-text');
    if (qText) qText.value = "";

    const r = records.find(x => x.id == id);
    if (!r) return;

    const idEl = document.getElementById('detail-id');
    if (idEl) idEl.value = r.id;

    const dateEl = document.getElementById('detail-date');
    if (dateEl) dateEl.innerText = r.date;

    const subjEl = document.getElementById('detail-subject');
    if (subjEl) subjEl.value = r.subject || "";

    const noteEl = document.getElementById('detail-note');
    if (noteEl) noteEl.value = r.note || "";

    const lotEl = document.getElementById('detail-lot');
    if (lotEl) lotEl.innerText = `${r.type} ${r.lot && r.lot !== '-' ? '#' + r.lot : ''}`;

    const area = document.getElementById('detail-res-container');
    const shareBtn = document.getElementById('btn-share-poem');

    if (shareBtn) shareBtn.style.display = 'none';

    if (area) {
        area.innerHTML = "";

        if (r.compareData) {
            area.innerHTML = `
                <div class="detail-label">比較結果</div>
                <div id="compare-readonly-box" class="readonly-box">
                    ${r.compareData}
                    <button class="edit-icon-btn" onclick="toggleEditResult()">✎ 編輯</button>
                </div>
                <textarea id="compare-edit-area" style="display:none;" rows="5" onchange="saveDetailChanges()">${r.compareData}</textarea>
            `;
        } else {
            // 🌟 核心修復：解析真實的神明名稱，剝除 (一般)、(問事)、(比較) 等後綴詞
            let realDeityName = r.type || "";
            if (realDeityName.includes('問事')) {
                realDeityName = realDeityName.replace('(問事)', '').replace('問事', '').trim();
            } else if (realDeityName.includes('比較')) {
                realDeityName = realDeityName.replace('(比較)', '').replace('比較擲筊', '').replace('比較', '').trim();
            } else if (realDeityName.includes('一般')) {
                realDeityName = realDeityName.replace('(一般)', '').replace('一般求籤', '').trim();
            } else {
                realDeityName = realDeityName.trim();
            }

            // 使用解析乾淨的名稱來尋找神明
            let deity = typeof deities !== 'undefined' ? deities.find(d => d.name === realDeityName || d.name === r.type) : null;
            let system = (deity && typeof poemSystems !== 'undefined') ? poemSystems[deity.sysId] : null;

            if (r.type.includes('一般求籤') && r.lot !== '-') {
                area.innerHTML = `<div style="text-align:center;font-size:2rem;padding:20px;border:1px solid #555;border-radius:10px;">第 ${r.lot} 籤</div>`;
            } else if (r.lot && !isNaN(r.lot) && r.lot !== '-') {
                if (system) {
                    area.innerHTML = typeof getFortuneSlipHTML === 'function' ? getFortuneSlipHTML(parseInt(r.lot), system, deity) : '';
                    if (shareBtn) shareBtn.style.display = 'block';
                } else {
                    area.innerHTML = `
                    <div style="text-align:center; padding:20px; border:1px solid #555; border-radius:10px; background:#222;">
                        <div style="font-size:2.5rem; color:var(--accent); font-weight:bold;">第 ${r.lot} 籤</div>
                        <div style="font-size:0.9rem; color:#888; margin-top:10px;">(此神明未綁定專屬籤詩)</div>
                    </div>`;
                }
            }
        }
    }

    if (typeof renderFollowUps === 'function') renderFollowUps(r);
    if (typeof goTo === 'function') goTo('record-detail');

    setTimeout(() => {
        const imageContainer = document.getElementById('detail-res-container');
        if (imageContainer) {
            imageContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 300);
};

// ★ 新增：切換編輯狀態
window.toggleEditResult = function () {
    const box = document.getElementById('compare-readonly-box');
    const area = document.getElementById('compare-edit-area');
    if (box && area) {
        box.style.display = 'none';
        area.style.display = 'block';
        area.focus();
    }
}

function saveDetailChanges() {
    const id = parseInt(document.getElementById('detail-id').value);
    const r = records.find(x => x.id === id);
    if (r) {
        r.subject = document.getElementById('detail-subject').value;
        r.note = document.getElementById('detail-note').value;

        // ★ 新增：如果正在編輯比較結果，也一併儲存
        const compArea = document.getElementById('compare-edit-area');
        if (compArea && compArea.style.display !== 'none') {
            r.compareData = compArea.value;
        }
        window.Database.saveRecord(r);
    }
}

// 刪除紀錄 (替換 confirm)
window.deleteRecord = async function (id, fromDetail = false) { // ★ 加上 async
    if (await showConfirm("確定要永久刪除此紀錄嗎？\n(刪除後無法復原)", "刪除確認")) { // ★ 取代 confirm
        if (typeof window.deleteFromCloud === 'function') window.deleteFromCloud(id); // ★ 同步刪除雲端
        const numId = parseInt(id, 10);
        records = records.filter(r => parseInt(r.id, 10) !== numId);
        localStorage.setItem('zb_records_v3', JSON.stringify(records));
        if (fromDetail) goBack(); else renderRecords();
        showToast("🗑️ 紀錄已刪除");
    }
}

// ==========================================
//  抽籤模式切換與設定儲存 (統一修復版)
// ==========================================
function switchDrawMode(mode) {
    // 1. 記錄當前模式
    window.tempDrawMode = mode;

    // 2. 更新按鈕 UI 狀態 (紅色外框)
    const btnTimer = document.getElementById('btn-mode-timer');
    const btnTouch = document.getElementById('btn-mode-touch');
    const btnTap = document.getElementById('btn-mode-tap');
    
    if (btnTimer) btnTimer.classList.toggle('active', mode === 'timer');
    if (btnTouch) btnTouch.classList.toggle('active', mode === 'touch');
    if (btnTap) btnTap.classList.toggle('active', mode === 'tap');

    // 3. 顯示/隱藏下方對應的提示與設定區塊
    const timerArea = document.getElementById('timer-config-area');
    const touchArea = document.getElementById('touch-hint-area');
    const tapArea = document.getElementById('tap-hint-area');
    
    if (timerArea) timerArea.style.display = (mode === 'timer') ? 'block' : 'none';
    if (touchArea) touchArea.style.display = (mode === 'touch') ? 'block' : 'none';
    if (tapArea) tapArea.style.display = (mode === 'tap') ? 'block' : 'none';
}

function initCupIcons() {
    // 定義一個內部函式來處理筊杯顯示邏輯
    const setPrev = (id, key, typeText, cssClass) => {
        const el = document.getElementById(id);
        if (!el) return;

        const customSrc = localStorage.getItem('custom_' + key);

        if (customSrc) {
            // 情境 A: 使用者有上傳圖片 -> 顯示縮圖
            el.innerHTML = `<img src="${customSrc}" style="max-height:100%; max-width:100%; object-fit:contain;">`;
        } else {
            // 情境 B: 沒圖片 -> 顯示預設文字
            el.innerHTML = `<div class="res-dot main-dot-lg ${cssClass}" style="width:40px;height:40px;font-size:20px;">${typeText.charAt(0)}</div>`;
        }
    };

    // 依序設定三個筊杯預覽
    setPrev('prev-cup-saint', 'cup_saint', '聖', 'dot-saint');
    setPrev('prev-cup-laugh', 'cup_laugh', '笑', 'dot-laugh');
    setPrev('prev-cup-covered', 'cup_covered', '蓋', 'dot-covered');

    // ★ 核心修復：正確抓取「抽籤前」與「抽籤後」的籤筒新 ID
    const qtS = localStorage.getItem('custom_qiantong_static') || QIANTONG_DEFAULT;
    const elQtS = document.getElementById('prev-qt-static');
    if (elQtS) {
        elQtS.innerHTML = qtS.startsWith('data:')
            ? `<img src="${qtS}" style="height:100%; object-fit:contain;">`
            : `<span style="font-size:2.5rem;">${qtS}</span>`;
    }

    // 如果沒有設定動態籤筒，就預設沿用靜態籤筒的圖案
    const qtA = localStorage.getItem('custom_qiantong_active') || qtS;
    const elQtA = document.getElementById('prev-qt-active');
    if (elQtA) {
        elQtA.innerHTML = qtA.startsWith('data:')
            ? `<img src="${qtA}" style="height:100%; object-fit:contain;">`
            : `<span style="font-size:2.5rem;">${qtA}</span>`;
    }

    // 籤筒保持原樣 (圖片或 Emoji)
    const qtImg = localStorage.getItem('custom_qiantong_img') || QIANTONG_DEFAULT;
    const qtEl = document.getElementById('preview-qiantong');
    if (qtEl) {
        if (qtImg.startsWith('data:image')) qtEl.innerHTML = `<img src="${qtImg}" style="width:50px;height:50px;object-fit:contain">`;
        else qtEl.innerText = qtImg;
    }
}

window.resetAllCups = async function () {
    if (await showConfirm("確定清除所有自訂的筊杯圖片嗎？", "還原確認")) {
        ['cup_saint', 'cup_laugh', 'cup_covered'].forEach(k => localStorage.removeItem('custom_' + k));
        initCupIcons();
        showToast("🗑️ 已還原預設筊杯");
    }
};

window.resetQiantong = async function () {
    if (await showConfirm("確定還原預設籤筒圖像嗎？", "還原確認")) {
        localStorage.removeItem('custom_qiantong_img');
        initCupIcons();
        showToast("🗑️ 已還原預設籤筒");
    }
};

function toggleManualLot() {
    const type = document.getElementById('manual-type').value;
    if (type === '比較') {
        document.getElementById('manual-standard-area').style.display = 'none';
        document.getElementById('manual-compare-area').style.display = 'block';
    } else {
        document.getElementById('manual-standard-area').style.display = 'block';
        document.getElementById('manual-compare-area').style.display = 'none';
        document.getElementById('manual-lot-group').style.display = (type === '求籤' || type === '白沙屯媽祖') ? 'block' : 'none';
    }
}
function goToCompareFromManual() { isManualCompareMode = true; goTo('compare'); }

/* ==========================================
   8. 進階追問系統 (統合修復版)
   ========================================== */
// 暫存變數
let fuTempResults = []; // 存放 [1, 0, -1]
let fuTargetCount = 1;

// 1.渲染紀錄詳情的追問列表 (新版)
window.renderFollowUps = function (record) {
    const list = document.getElementById('detail-fu-list');
    if (!list) return;
    list.innerHTML = "";

    if (!record.followUps || record.followUps.length === 0) {
        list.innerHTML = "<div style='color:#666; font-size:0.9rem; text-align:center; padding:10px;'>尚無追問紀錄</div>";
        return;
    }

    record.followUps.forEach((b, i) => {
        let visualHtml = b.html || "";
        if (!visualHtml && b.details && b.details.length > 0) {
            visualHtml = `<div class="res-dots-container" style="margin-top:5px;">`;
            b.details.forEach(v => {
                if (v === 1) visualHtml += `<div class="res-dot fu-dot-sm dot-saint" style="width:20px;height:20px;font-size:10px;">聖</div>`;
                else if (v === 0) visualHtml += `<div class="res-dot fu-dot-sm dot-laugh" style="width:20px;height:20px;font-size:10px;">笑</div>`;
                else visualHtml += `<div class="res-dot fu-dot-sm dot-covered" style="width:20px;height:20px;font-size:10px;">蓋</div>`;
            });
            visualHtml += `</div>`;
        }

        list.innerHTML += `
                <div id="record-fu-${record.id}-${i}" class="session-block" style="padding:12px; background:rgba(255,255,255,0.05); border-left:3px solid var(--accent); border-radius:8px; margin-bottom:10px; position:relative;">
                    
                    <button data-html2canvas-ignore="true" onclick="deleteDetailFollowUp(${record.id}, ${i})" style="position:absolute; right:10px; top:10px; background:transparent; border:1px solid #d32f2f; color:#d32f2f; border-radius:4px; padding:2px 8px; font-size:0.75rem; cursor:pointer;">刪除</button>
                    
                    <div class="q-text" style="font-size:0.95rem; margin-bottom:5px; color:#ddd; font-weight:bold; padding-right:80px;">問：${b.question}</div>
                    <div class="a-text" style="font-size:0.9rem; color:var(--accent);">答：${b.result}</div>
                    ${visualHtml}
                    ${b.poemBtn ? `<div style="margin-top:8px;">${b.poemBtn}</div>` : ''}
                </div>
            `;
    });
};

// 刪除紀錄詳情中的單筆追問 (新版)
window.deleteDetailFollowUp = function (recId, index) {
    if (!confirm("確定刪除此追問？")) return;
    const r = records.find(x => x.id == recId);
    if (r && r.followUps) {
        r.followUps.splice(index, 1);
        window.Database.saveRecord(r);
        renderFollowUps(r); // 重新渲染列表
    }
};

function renderTableInput() {
    const optName = compareState.options[compareState.currentOptIndex];
    document.getElementById('table-opt-name').innerText = optName;
    document.getElementById('table-opt-idx').innerText = compareState.currentOptIndex + 1;
    const container = document.getElementById('table-rows-container');
    container.innerHTML = "";
    compareState.tableTempData = new Array(compareState.targetThrows).fill(null);

    for (let i = 1; i <= compareState.targetThrows; i++) {
        const idx = i - 1;
        const row = document.createElement('div');
        row.className = 'table-input-row';
        row.style.alignItems = 'center';
        row.innerHTML = `
                <div class="table-idx">第 ${i} 次</div>
                <div class="res-select-group" id="row-group-${i}" data-locked="false" style="flex:1; display:flex;">
                    <div class="res-btn" onclick="setTableVal(${i}, 1, this)">聖</div>
                    <div class="res-btn" onclick="setTableVal(${i}, 0, this)">笑</div>
                    <div class="res-btn" onclick="setTableVal(${i}, -1, this)">蓋</div>
                </div>
                <div class="row-action-col">
                    <button class="secondary-btn" id="comp-auto-btn-${i}" style="margin:0; padding:6px 0; font-size:0.8rem; width:100%;" onclick="autoThrowCompareRow(${i})">🌗擲筊</button>
                    <button class="secondary-btn" id="comp-reset-btn-${i}" style="margin:0; padding:6px 0; font-size:0.8rem; width:100%; display:none; border-color:#f44336; color:#f44336;" onclick="resetTableValRow(${i})">↺ 回復</button>
                </div>
                <div class="table-result-col" id="row-res-${i}" style="margin-left:0;">-</div>
            `;
        container.appendChild(row);
    }
}

window.setTableVal = function (rowNum, val, btnElem) {
    const group = document.getElementById(`row-group-${rowNum}`);
    if (group.dataset.locked === 'true') return; // 已鎖定防呆

    group.querySelectorAll('.res-btn').forEach(b => {
        b.classList.remove('active-saint', 'active-laugh', 'active-close');
    });

    const resDisp = document.getElementById(`row-res-${rowNum}`);
    let content = "";
    if (val === 1) { btnElem.classList.add('active-saint'); content = `<div class="res-dot dot-saint" style="width:24px;height:24px;font-size:12px;">聖</div>`; }
    else if (val === 0) { btnElem.classList.add('active-laugh'); content = `<div class="res-dot dot-laugh" style="width:24px;height:24px;font-size:12px;">笑</div>`; }
    else if (val === -1) { btnElem.classList.add('active-close'); content = `<div class="res-dot dot-covered" style="width:24px;height:24px;font-size:12px;">蓋</div>`; }

    resDisp.innerHTML = content;
    compareState.tableTempData[rowNum - 1] = val;

    // 鎖定其他按鈕
    group.dataset.locked = 'true';
    group.querySelectorAll('.res-btn').forEach(b => {
        if (b !== btnElem) b.classList.add('locked-btn');
    });

    // 切換按鈕為「回復」
    document.getElementById(`comp-auto-btn-${rowNum}`).style.display = 'none';
    document.getElementById(`comp-reset-btn-${rowNum}`).style.display = 'block';
}

window.autoThrowCompareRow = function (rowNum) {
    const res = getCupResult();
    const group = document.getElementById(`row-group-${rowNum}`);
    const btns = group.querySelectorAll('.res-btn');
    if (res.type === 1) setTableVal(rowNum, 1, btns[0]);
    else if (res.type === 0 && res.text === '笑筊') setTableVal(rowNum, 0, btns[1]);
    else setTableVal(rowNum, -1, btns[2]);
};

window.resetTableValRow = function (rowNum) {
    if (!confirm("這樣會回復結果，是否確定？")) return;
    const group = document.getElementById(`row-group-${rowNum}`);
    group.dataset.locked = 'false';

    group.querySelectorAll('.res-btn').forEach(b => {
        b.classList.remove('active-saint', 'active-laugh', 'active-close', 'locked-btn');
    });

    document.getElementById(`row-res-${rowNum}`).innerHTML = '-';
    compareState.tableTempData[rowNum - 1] = null;

    document.getElementById(`comp-auto-btn-${rowNum}`).style.display = 'block';
    document.getElementById(`comp-reset-btn-${rowNum}`).style.display = 'none';
};

function nextTableStep() {
    if (compareState.tableTempData.includes(null)) {
        showToast("請完成所有次數的選擇！");
        return;
    }

    let saints = 0;
    let logStr = "";

    // 取得使用者設定的自訂筊杯圖片
    const imgSaint = settings.cupDisplayMode === 'text' ? null : localStorage.getItem('custom_cup_saint');
    const imgLaugh = settings.cupDisplayMode === 'text' ? null : localStorage.getItem('custom_cup_laugh');
    const imgCovered = settings.cupDisplayMode === 'text' ? null : localStorage.getItem('custom_cup_covered');

    compareState.tableTempData.forEach(v => {
        if (v === 1) {
            saints++;
            if (imgSaint) logStr += `<img src="${imgSaint}" style="width:24px; height:24px; object-fit:contain; margin:0 2px; vertical-align:middle;">`;
            else logStr += `<div class="res-dot fu-dot-sm dot-saint" style="display:inline-flex; margin:0 2px; vertical-align:middle;">聖</div>`;
        } else if (v === 0) {
            if (imgLaugh) logStr += `<img src="${imgLaugh}" style="width:24px; height:24px; object-fit:contain; margin:0 2px; vertical-align:middle;">`;
            else logStr += `<div class="res-dot fu-dot-sm dot-laugh" style="display:inline-flex; margin:0 2px; vertical-align:middle;">笑</div>`;
        } else if (v === -1) {
            if (imgCovered) logStr += `<img src="${imgCovered}" style="width:24px; height:24px; object-fit:contain; margin:0 2px; vertical-align:middle;">`;
            else logStr += `<div class="res-dot fu-dot-sm dot-covered" style="display:inline-flex; margin:0 2px; vertical-align:middle;">蓋</div>`;
        }
    });

    compareState.results.push({ name: compareState.options[compareState.currentOptIndex], saints: saints, logs: logStr });

    if (compareState.currentOptIndex < compareState.options.length - 1) {
        compareState.currentOptIndex++;
        renderTableInput();
    } else {
        finishTableMode();
    }
}
function finishTableMode() {
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
    document.getElementById('compare-table-panel').style.display = 'none';
    showCompareResults(html);
}

function saveSimpleRecord() {
    if (!lastSimpleResult) return;
    const sub = document.getElementById('simple-subject').value || "問事擲筊";
    addRecordToDB({ type: '問事', subject: sub, note: `擲筊結果：${lastSimpleResult}`, details: null, followUps: [] });
    showToast("✅ 問事紀錄已儲存！");
    document.getElementById('simple-save-btn').style.display = 'none';
}

function goHome() { window.history.back(); }
/* --- 補上或覆蓋：比較擲筊的存檔功能 (終極大掃除升級版) --- */
window.saveCompareToRecords = async function () {
    if (typeof showToast === 'function' &&
        (!compareState || !compareState.results || compareState.results.length === 0)) {
        showToast("⚠️ 尚未產生任何比較結果！");
        return;
    }

    let finalNote = "【比較結果】\n";
    const results = compareState.results || [];
    results.forEach(r => {
        finalNote += `${r.name}: ${r.saints}聖 (${r.logs})\n`;
    });

    const selElement = document.getElementById('compare-deity-sel');
    const inputElement = document.getElementById('compare-custom-deity');
    let typeStr = "比較擲筊";
    const currentDeities = typeof getOrderedDeities === 'function' ? getOrderedDeities() : (window.deities || []);

    if (selElement && selElement.value) {
        if (selElement.value === 'custom') {
            typeStr = inputElement && inputElement.value.trim() ? inputElement.value.trim() : "未具名神明";
        } else {
            const d = currentDeities.find(x => x.id === selElement.value);
            typeStr = d ? d.name : "比較擲筊";
        }
    }
    typeStr += " (比較)";

    const subInput = document.getElementById('comp-subject');
    const sub = (subInput && subInput.value) ? subInput.value : "比較事項";

    // 將結果與追問紀錄合併儲存
    const rec = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        type: typeStr,
        lot: '-',
        subject: sub,
        compareData: finalNote,
        note: `包含 ${typeof compFuHistory !== 'undefined' ? compFuHistory.length : 0} 筆後續追問`,
        followUps: typeof compFuHistory !== 'undefined' ? [...compFuHistory] : []
    };

    if (typeof records !== 'undefined') {
        records.unshift(rec);
        localStorage.setItem('zb_records_v3', JSON.stringify(records));
    }

    window.Database.saveRecord(rec);

    // ★ 呼叫終極大掃除引擎，執行最徹底的重置與畫面清空 (force=true 代表不跳警告窗)
    if (typeof window.resetCompare === 'function') {
        await window.resetCompare(true);
    } else {
        isCompareActive = false;
        if (typeof compareState !== 'undefined') compareState.results = [];
        if (typeof compFuHistory !== 'undefined') compFuHistory = [];
    }

    if (typeof showToast === 'function') showToast("✅ 比較紀錄已完整儲存！");
    if (typeof goTo === 'function') goTo('home');
};

function addRecordToDB(newRec) {
    newRec.id = Date.now();
    newRec.date = new Date().toLocaleString();
    window.Database.saveRecord(newRec);
    saveRecordsDB();
}

function saveRecordsDB() {
    localStorage.setItem('zb_records_v3', JSON.stringify(records));
}

// 儲存邏輯 (包含新增與更新)
function saveFollowUp() {
    const id = parseInt(document.getElementById('detail-id').value);
    const r = records.find(x => x.id == id);
    const q = document.getElementById('fu-question').value;
    const editIndex = parseInt(document.getElementById('fu-edit-index').value);

    if (!q) { showToast("請輸入問題"); return; }
    if (fuTempResults.length === 0) { showToast("請先進行擲筊"); return; }

    if (!r.followUps) r.followUps = [];

    // 產生文字摘要
    let summary = "";
    let saint = 0, laugh = 0, covered = 0;
    fuTempResults.forEach(v => {
        if (v === 1) saint++; else if (v === 0) laugh++; else covered++;
    });

    if (fuTempResults.length === 1) {
        summary = (saint === 1) ? "聖筊" : ((laugh === 1) ? "笑筊" : "蓋筊");
    } else {
        summary = `${saint}聖 ${laugh}笑 ${covered}蓋`;
    }

    const newObj = {
        question: q,
        result: summary,
        details: [...fuTempResults] // ✅ 修正：使用展開運算子複製陣列，切斷連線避免被清空
    };

    if (!isNaN(editIndex) && editIndex >= 0) { // ✅ 修正：更嚴謹的數字判斷
        // 更新現有
        r.followUps[editIndex] = newObj;
    } else {
        // 新增
        r.followUps.push(newObj);
    }
    window.Database.saveRecord(r);
    // 清除焦點與重置 UI
    document.activeElement.blur();
    resetFuInput(); // 關閉輸入框並重置
    renderFollowUps(r); // 重新渲染列表

    // 1. 立即強制視窗歸位 (針對 iOS/Android 瀏覽器視窗偏移)
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;

    // 2. 透過雙層 requestAnimationFrame 處理 DOM 渲染後的精準捲動
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            // 確保鍵盤收起
            if (document.activeElement) {
                document.activeElement.blur();
            }

            // 抓取負責捲動的容器與追問列表
            const mainEl = document.querySelector('main');
            const list = document.getElementById('detail-fu-list');

            // ==========================================
            // 🔄 在下方選項 A 與選項 B 之間互相切換註解即可：
            // ==========================================

            // 選項 A: 滾動到最頂端 (看到 Header)
            if (mainEl) {
                mainEl.scrollTo({ top: 0, behavior: 'instant' });
            }

            // 選項 B: 滾動到剛新增的追問位置 (聚焦最新結果)
            // if (list && list.lastElementChild) {
            //     list.lastElementChild.scrollIntoView({ behavior: "smooth", block: "center" });
            // }
        });
    });
}

// ==========================================
// ★ 終極防護：防止手殘重新整理 (F5) 或關閉網頁
// ==========================================
window.addEventListener('beforeunload', function (e) {
    let hasSimpleData = (typeof simpleSessionHistory !== 'undefined' && simpleSessionHistory.length > 0) ||
        (typeof simpleTempCups !== 'undefined' && simpleTempCups.some(c => c !== null));
    let hasCompareData = (typeof compareState !== 'undefined' && compareState.results && compareState.results.length > 0) ||
        (typeof compFuHistory !== 'undefined' && compFuHistory.length > 0);

    // 只要是正在求籤、問事或比較中，一律觸發瀏覽器原生的離開警告
    if (isQiuqianActive || hasSimpleData || hasCompareData || (typeof isCompareActive !== 'undefined' && isCompareActive)) {
        e.preventDefault();
        e.returnValue = '您有尚未儲存的紀錄，確定要離開嗎？';
    }
});
