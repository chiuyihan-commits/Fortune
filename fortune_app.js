async function initApp() {
    console.log("🚀 [系統追蹤] 1. 成功進入 initApp，準備開始載入流程...");

    // 🌟 關鍵 1：紀錄程式剛開始載入的精確時間
    const appStartTime = Date.now();

    try {
        console.log("🚀 [系統追蹤] 1.8 預載 IndexedDB 紀錄...");
        if (typeof localforage !== 'undefined') {
            const savedRecords = await localforage.getItem('zb_records_v3');
            if (savedRecords) {
                window.records = savedRecords;
                window.AppState.data.records = savedRecords;
            }
        }

        console.log("🚀 [系統追蹤] 1.5 準備預載本機非同步圖片庫...");
        if (window.ImageManager) await window.ImageManager.init(); // ★ 保證開機時圖片都進記憶體

        console.log("🚀 [系統追蹤] 2. 準備啟動資料庫引擎...");
        if (typeof window.initDatabaseEngine === 'function') await window.initDatabaseEngine();

        console.log("🚀 [系統追蹤] 3. 準備同步核心資料...");
        if (typeof syncCoreData === 'function') syncCoreData();

        console.log("🚀 [系統追蹤] 4. 準備載入系統設定...");
        if (typeof loadSettings === 'function') loadSettings();

        console.log("🚀 [系統追蹤] 5. 準備渲染歷史紀錄...");
        if (typeof renderRecords === 'function') renderRecords();

        console.log("🚀 [系統追蹤] 6. 啟動 Firebase 雲端監聽...");
        if (window.currentDB === 'firebase' && typeof window.startRealTimeSync === 'function') {
            // ★ 將原本被註解掉的 Firebase 監聽邏輯完整補回來
            window.startRealTimeSync((latestRecords) => {
                records = latestRecords;
                localStorage.setItem('zb_records_v3', JSON.stringify(records));

                // 如果使用者正好停留在紀錄頁面，立刻幫他重新渲染畫面
                const activePage = document.querySelector('.page.active');
                if (activePage && activePage.id === 'page-records') {
                    if (typeof renderRecords === 'function') renderRecords();
                }
            });
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
        el.classList.remove('show');
        return;
    }

    // 觸發微小震動
    triggerVibration(50);

    // 顯示框框並渲染「左邊隨機掉落不交疊筊杯 + 右邊延遲出現標示」
    el.classList.add('show');
    el.innerHTML = window.createScatteredBobeiHTML(res);
}

window.toggleTapShake = function (e) {
    if (e && e.cancelable) e.preventDefault();
    if (isDrawing) return;

    const animArea = document.getElementById('draw-anim-area');
    const instr = document.getElementById('draw-instruction');

    if (!isShaking) {
        isShaking = true;
        if (instr) instr.innerHTML = `<div style="font-size:1.3rem; margin-bottom:5px; font-weight:bold;">第 ${window.getWaveHtml()} 籤</div><span class='breathing-text'>✨ 抽籤中...憑直覺再次點擊抽籤</span>`;
        if (animArea) animArea.innerHTML = window.renderCylinderVisualHTML({ isShaking: true, isMini: false });
    } else {
        isShaking = false;
        isDrawing = true;
        if (animArea) animArea.removeEventListener('click', window.toggleTapShake);
        if (typeof finishDrawLot === 'function') finishDrawLot();
    }
};

function startTouchShake(e) {
    if (e && e.cancelable) e.preventDefault();
    if (isDrawing || isShaking) return;

    isShaking = true;
    const animArea = document.getElementById('draw-anim-area');
    const instr = document.getElementById('draw-instruction');

    if (animArea) animArea.innerHTML = window.renderCylinderVisualHTML({ isShaking: true, isMini: false });
    if (instr) instr.innerHTML = `<div style="font-size:1.3rem; margin-bottom:5px; font-weight:bold;">第 ${window.getWaveHtml()} 籤</div>👋 撥動中... (放開抽籤) 👋`;
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
    if (el) el.innerHTML = window.renderCylinderVisualHTML({ isShaking: true, isMini: false });
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

    // ★ 核心修正 1：優先從系統的 content 抓取「真實存在的籤號池 (包含 0 籤王、201 籤首)」
    let pool = [];
    if (currentSystem && currentSystem.content && Object.keys(currentSystem.content).length > 0) {
        pool = Object.keys(currentSystem.content).map(Number);
    } else {
        let total = window.getActiveMaxLots ? window.getActiveMaxLots(false) : 100;
        if (isNaN(total) || total < 1) total = 100;
        pool = Array.from({ length: total }, (_, i) => i + 1);
    }

    const putBack = document.getElementById('chk-put-back') && document.getElementById('chk-put-back').checked;

    if (!putBack) {
        // 【不放回模式】從真實籤號池抽籤
        if (!window.availableLots || window.availableLots.length === 0) {
            window.availableLots = [...pool];
        }
        const randomIndex = Math.floor(Math.random() * window.availableLots.length);
        currentLot = window.availableLots.splice(randomIndex, 1)[0];
        if (currentLot === undefined) currentLot = pool[Math.floor(Math.random() * pool.length)];
    } else {
        // 【傳統放回模式】從真實籤號池隨機抽一支
        currentLot = pool[Math.floor(Math.random() * pool.length)];
    }

    triggerVibration([50, 100, 50]);

    // ★ 核心修正 2：完美顯示「籤王 / 籤首 / 第 X 籤」
    const titleEl = document.getElementById('step2-lot-title');
    if (titleEl) {
        if (currentLot === 0 || currentLot === 201 || currentLot === 202) {
            const specialName = window.formatLotName ? window.formatLotName(currentLot) : `第 ${currentLot} 籤`;
            titleEl.innerHTML = `<span id="lot-num-display" style="font-size:2.8rem;">${specialName}</span>`;
        } else {
            titleEl.innerHTML = `第 <span id="lot-num-display" style="font-size:3rem;">${currentLot}</span> 籤`;
        }
        titleEl.style.opacity = '1';
    }

    // 左邊跳出寫著籤號的竹籤 + 右邊靜止籤筒
    if (animArea) {
        animArea.innerHTML = window.renderCylinderVisualHTML({ isShaking: false, drawnLot: currentLot, isMini: false });
    }

    setTimeout(() => {
        initConfirmStep();
    }, 1100);
}

function initConfirmStep() {
    document.getElementById('step-2').style.display = 'none';
    document.getElementById('step-3').style.display = 'flex';

    // 🌟 新增：處理 Step 3 上方的視覺 (支援一般求籤與神明求籤)
    const step3Header = document.getElementById('step3-deity-header');
    if (step3Header) {
        const lotText = window.formatStickCnLot(currentLot, false);

        if (currentMode === 'normal') {
            // 一般求籤：直接替換整個卷軸
            step3Header.innerHTML = `
                <div style="display:flex; justify-content:center; align-items:center; width:100%; height:100%;">
                    <!-- 🌟 透過外層 div 放大 1.7 倍 (可自行調整 1.5 ~ 2.0) -->
                    <div style="transform: scale(1.7); transform-origin: center center;">
                        <div class="drawn-single-stick" style="margin: 0 auto;">
                            <span>${lotText}</span>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // 神明求籤：保留神像，在右側空白處加入「懸浮籤支」
            const oldStick = step3Header.querySelector('.floating-stick-wrapper');
            if (oldStick) oldStick.remove();

            // 🌟 將 top 設為 50%，並在 transform 中加入 translateY(-50%) 達成完美絕對置中
            step3Header.insertAdjacentHTML('beforeend', `
                <div class="floating-stick-wrapper" style="position: absolute; right: max(6vw, 15px); top: 50%; z-index: 10; transform: translateY(-50%) scale(1.7); transform-origin: right center;">
                    <div class="drawn-single-stick" style="box-shadow: -3px 5px 15px rgba(0,0,0,0.6);">
                        <span>${lotText}</span>
                    </div>
                </div>
            `);
        }
    }

    // ★ 核心修正 3：讓 Step 3 的標題也支援顯示「籤王 / 籤首」，不會出現「第 0 籤」
    const confirmNumEl = document.getElementById('confirm-lot-num');
    if (confirmNumEl && confirmNumEl.parentElement) {
        if (currentLot === 0 || currentLot === 201 || currentLot === 202) {
            const specialName = window.formatLotName ? window.formatLotName(currentLot) : `第 ${currentLot} 籤`;
            confirmNumEl.parentElement.innerHTML = `<span id="confirm-lot-num" style="font-size:2.8rem;">${specialName}</span>`;
        } else {
            confirmNumEl.parentElement.innerHTML = `第 <span id="confirm-lot-num" style="font-size:3rem;">${currentLot}</span> 籤`;
        }
    }

    // ★ 重置抽屜動畫與恢復提示文字顯示
    const instructionEl = document.getElementById('confirm-instruction');
    const statusTextEl = document.getElementById('confirm-status-text');
    const confirmCupEl = document.getElementById('confirm-cup');
    if (instructionEl) instructionEl.style.display = 'block';
    if (statusTextEl) statusTextEl.style.display = 'block';
    if (confirmCupEl) {
        confirmCupEl.style.fontSize = "";
        confirmCupEl.style.color = "";
    }

    const msgEl = document.getElementById('step-3-msg');
    if (msgEl) {
        if (msgEl.closest('.unified-block-hint')) {
            msgEl.closest('.unified-block-hint').classList.remove('drawer-active');
        }
        msgEl.style.display = 'none';
        msgEl.innerHTML = '';
    }

    saintCount = 0;
    document.getElementById('saint-count').innerText = "0";

    let targetCount = 3;
    if (currentMode === 'deity' && currentDeity && currentDeity.saintTarget) {
        targetCount = parseInt(currentDeity.saintTarget);
    } else if (settings.saintTarget) {
        targetCount = parseInt(settings.saintTarget);
    }
    const reqSpan = document.getElementById('req-saint');
    if (reqSpan) reqSpan.innerText = targetCount;

    // 🌟 加上這兩行：同步更新畫面上的分母顯示
    const targetDisplaySpan = document.getElementById('saint-target-display');
    if (targetDisplaySpan) targetDisplaySpan.innerText = targetCount;

    updateCupDisplay('confirm-cup', { text: '準備擲筊', type: -1 });

    document.getElementById('step-3-action-area').style.display = 'none';
    document.getElementById('confirm-msg').style.display = 'none';
    const btnConf = document.getElementById('btn-confirm');

    // 🌟 加入這行：將雙手捧筊的懸浮動畫圖示套用進按鈕中
    btnConf.innerHTML = `${window.TINY_CUP_ICON} 擲筊確認`;

    btnConf.style.display = 'block';
    btnConf.disabled = false;
}

function throwCupForConfirm() {
    const btn = document.getElementById('btn-confirm');

    executeThrowCupWrapper(btn, (res) => {
        updateCupDisplay('confirm-cup', res);

        // 🌟 1. 第一時間把按鈕隱藏，進入「觀看筊象」的等待期，徹底防止連點！
        if (btn) btn.style.display = 'none';

        let targetCount = 3;
        if (currentMode === 'deity' && currentDeity && currentDeity.saintTarget) targetCount = parseInt(currentDeity.saintTarget);
        else if (settings.saintTarget) targetCount = parseInt(settings.saintTarget);

        // 🌟 2. 設定 650 毫秒的延遲，等筊象落地攤開、右邊聖/笑/蓋標示完全浮現後，再動作！
        setTimeout(() => {
            if (res.type === 1) {
                saintCount++;
                document.getElementById('saint-count').innerText = saintCount;
                if (saintCount >= targetCount) {
                    // 已經滿三聖筊了，維持隱藏
                    if (btn) btn.style.display = 'none';
                    const topBtn = document.querySelector('#step-3 button[onclick="reDraw()"]');
                    if (topBtn) topBtn.style.display = 'none';

                    // 達到目標，再等一小段時間才切換為慶祝動畫
                    setTimeout(() => {
                        showStep3Actions(true);
                    }, 450);
                } else {
                    // 還差幾筊，把按鈕顯示回來繼續擲！
                    if (btn) btn.style.display = 'block';
                }
            } else {
                saintCount = 0;
                document.getElementById('saint-count').innerText = "0";
                if (btn) btn.style.display = 'none';

                const msgEl = document.getElementById('confirm-msg');
                if (msgEl) msgEl.style.display = 'none';

                // 失敗，直接切換為失敗動作 (顯示黃色的重新抽籤按鈕)
                showStep3Actions(false);
            }
        }, 650); // 對齊筊象攤開動畫時間
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
    const hintBlock = msgEl ? msgEl.closest('.unified-block-hint') : null;

    actionArea.style.display = 'block';
    btnsEl.innerHTML = "";

    if (isSuccess) {
        // 1. 隱藏「請擲筊確認...」與「目前：X聖筊」
        if (instructionEl) instructionEl.style.display = 'none';
        if (statusTextEl) statusTextEl.style.display = 'none';

        // 2. 將原本顯示筊杯的地方，換成慶祝文字
        if (confirmCupEl) {
            confirmCupEl.innerHTML = "🎉三聖筊確認🎉";
            confirmCupEl.style.fontSize = "1.6rem";
            confirmCupEl.style.color = "var(--accent)";
        }

        // ★ 3. 核心升級：在提示與按鈕中間，顯示「30度俯視拉開籤詩木抽屜 + 內部小籤紙」動畫！
        const lotLabel = typeof window.formatStickCnLot === 'function' ? window.formatStickCnLot(currentLot, false) : `第 ${currentLot} 首`;
        if (hintBlock) hintBlock.classList.add('drawer-active');
        if (msgEl) {
            msgEl.style.display = 'block';
            msgEl.innerHTML = `
                <div class="poem-cabinet-stage">
                    <div class="cabinet-slot-frame">
                        <div class="cabinet-drawer-box">
                            <div class="drawer-slip-paper">
                                <div class="drawer-slip-inner">
                                    <div class="drawer-slip-lines"><i></i><i></i><i></i></div>
                                    <span class="drawer-slip-title">${lotLabel}</span>
                                </div>
                            </div>
                            <div class="drawer-front-panel">
                                <span class="drawer-front-badge">${lotLabel}</span>
                                <div class="drawer-pull-ring"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // 4. 顯示領取籤詩按鈕
        btnsEl.innerHTML = `<button class="action-btn" onclick="showResult()">📜 領取籤詩</button>`;
    } else {
        // 求籤失敗時 (蓋筊或笑筊)：確保移除抽屜高度解鎖
        if (hintBlock) hintBlock.classList.remove('drawer-active');
        if (instructionEl) instructionEl.style.display = 'none';
        if (statusTextEl) statusTextEl.style.display = 'block';

        if (msgEl) {
            msgEl.style.display = 'none';
            msgEl.innerHTML = "";
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

    // ★ 隱藏成功/失敗的提示訊息區塊，並移除抽屜高度解鎖 (直接使用上面宣告過的 msgEl，不重複宣告！)
    if (msgEl) {
        if (msgEl.closest('.unified-block-hint')) {
            msgEl.closest('.unified-block-hint').classList.remove('drawer-active');
        }
        msgEl.style.display = 'none';
        msgEl.innerHTML = "";
    }

    // 隱藏下方的按鈕區 (避免一進來就看到)
    const actionArea = document.getElementById('step-3-action-area');
    if (actionArea) actionArea.style.display = 'none';

    // 3. 確保內部計數器歸零
    if (typeof currentSaints !== 'undefined') {
        currentSaints = 0;
    }

    // ★ 核心修正 2：徹底解除抽籤鎖定，讓第二次觸控能順利觸發！
    if (typeof isDrawing !== 'undefined') isDrawing = false;
    if (typeof isShaking !== 'undefined') isShaking = false;
    window.isThrowingCup = false;

    // 5-1. 把上方的籤號重新隱藏
    const titleEl = document.getElementById('step2-lot-title');
    if (titleEl) titleEl.style.opacity = '0';

    const lotNumDisplay = document.getElementById('lot-num-display');
    if (lotNumDisplay) lotNumDisplay.innerText = '?';

    // 5-2. 把提示文字改回「請抽籤」
    const instr = document.getElementById('draw-instruction');
    if (instr) instr.innerText = "請抽籤";

    // 4. 執行重置動畫區函數
    setTimeout(() => {
        if (typeof setupDrawStep2 === 'function') setupDrawStep2();
    }, 10);
};

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
    if (confirm("確定要中斷求籤並返回首頁嗎？")) {
        //if (await showConfirm("確定要中斷求籤並返回首頁嗎？", "中斷求籤")) {
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

    // ★ 動態處理排序：套用全新的虛擬權重引擎
    let lots = Object.keys(currentSystem.content).map(Number);
    lots.sort((a, b) => {
        const getWeight = (num) => {
            if (num === 0) return -2;       // 籤王：權重最小，永遠第一
            if (num === 201) return -1;     // 籤首：權重次小，排在籤王後面、第 1 首前面
            if (num === 202) return 999999; // 籤尾：權重最大，永遠墊底
            return num;                     // 一般籤詩：直接用籤號當權重 (1, 2, 3...)
        };
        return getWeight(a) - getWeight(b);
    });

    // 依序畫出按鈕
    lots.forEach(i => {
        const btn = document.createElement('div');
        btn.className = 'poem-btn';
        const poem = currentSystem.content[i];
        if (!poem) return;

        const hasText = poem && (poem.l1 || poem.poem || poem.img || poem.v1 || poem.isKing);

        let previewText = '待建檔';

        // 💡 小提醒：你原本這裡寫 `if (poem.isKing) previewText = '籤首';`
        // 如果這個屬性是指「籤王」，或許可以改成 `previewText = '籤王';` 會更一致喔！
        if (poem.isKing) previewText = '籤首';
        else if (poem.l1) previewText = poem.l1;
        else if (poem.poem) previewText = poem.poem.split(/[，,。]/)[0];
        else if (poem.v1) previewText = poem.v1[0];
        else if (poem.img) previewText = '圖片籤詩';

        // 列表按鈕名稱轉換修正
        let idxText = `第 ${i} 首`;
        if (i === 0) idxText = "籤 王";
        if (i === 201) idxText = "籤 首"; // 101 已修正為 201
        if (i === 202) idxText = "籤 尾"; // 102 已修正為 202

        btn.innerHTML = `<div class="poem-idx">${idxText}</div><div class="poem-text">${hasText ? previewText : '待建檔'}</div>`;
        btn.onclick = () => { currentLot = i; goTo('collection-view'); renderPoemView(); };
        c.appendChild(btn);
    });
}

/* --- 9. 紀錄與設定 --- */
function populateManualTypes() {
    // 💡【核心修正】：因為 manual-type 在 HTML 中已改為 input type="hidden"，
    // 舊版塞 <option> 的邏輯會破壞網頁元件，在此直接清空防呆。
    return;
}

function populateSimpleCompareDeities() {
    // 💡【核心修正】：這裡只放畫面上真正的 <select> 下拉選單標籤！
    // 絕對不能把隱藏輸入框 (manual-selected-deity-id) 放進來用 innerHTML 破壞
    ['simple-deity-sel', 'compare-deity-sel', 'edit-rec-deity'].forEach(id => {
        const sel = document.getElementById(id);
        if (!sel) return;
        sel.innerHTML = '<option value="">(自訂神明/親臨聖前)</option>';
        deities.forEach(d => {
            sel.innerHTML += `<option value="${d.id}">${d.name}</option>`;
        });
    });

    // ★ 確保每次重置選單時，同步更新 Checkbox 隱藏與強制打勾的防呆狀態
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

    const rec = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        type: typeStr,
        lot: currentLot,
        subject: sub,
        note: note,
        source: 'online' // 🌟 APP 求籤的紀錄，一律標示為線上
    };

    window.Database.saveRecord(rec);
    isQiuqianActive = false;
    window.isFortuneSaved = true;
    showToast("💾 紀錄已成功儲存！");
    goTo('home');
}

// ==========================================
// ★ 紀錄列表渲染 (支援向左滑動顯示修改/刪除按鈕 + 分頁效能優化)
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
        let rType = String(r.type || "");
        let rSubj = String(r.subject || "");
        let rNote = String(r.note || "");
        let rDateStr = "";
        if (r.date) rDateStr = String(r.date);
        else if (r.timestamp) rDateStr = new Date(r.timestamp).toLocaleDateString();
        else if (r.id) rDateStr = new Date(r.id).toLocaleDateString();

        const matchKey = !keyword ||
            rSubj.toLowerCase().includes(keyword) ||
            rNote.toLowerCase().includes(keyword) ||
            rType.toLowerCase().includes(keyword) ||
            rDateStr.toLowerCase().includes(keyword);

        let matchType = true;
        if (filterType === 'poem') matchType = !rType.includes('問事') && !rType.includes('比較');
        if (filterType === 'simple') matchType = rType.includes('問事');
        if (filterType === 'compare') matchType = rType.includes('比較');
        return matchKey && matchType;
    });

    filteredRecords.sort((a, b) => {
        const timeA = a.timestamp || a.id;
        const timeB = b.timestamp || b.id;
        return timeB - timeA;
    });

    if (filteredRecords.length === 0) {
        c.innerHTML = "<div style='text-align:center;color:#666;margin-top:20px;'>無符合的紀錄</div>";
        return;
    }

    // 建立一個渲染單筆卡片的內部小函式，方便重複使用
    const createCardHTML = (r) => {
        const div = document.createElement('div');
        div.className = 'record-item';
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
        } else {
            if (r.source === 'manual') tagName = "神明求籤(手)";
            else tagName = "神明求籤(線)";
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

        const wrapper = div.querySelector('.swipe-scroll-wrapper');
        if (wrapper) {
            wrapper.addEventListener('scroll', function () {
                if (this.scrollLeft > 20) {
                    document.querySelectorAll('.swipe-scroll-wrapper').forEach(other => {
                        if (other !== this && other.scrollLeft > 0) {
                            other.scrollTo({ left: 0, behavior: 'smooth' });
                        }
                    });
                }
            });
        }
        return div;
    };

    const INITIAL_LIMIT = 30;
    const displayRecords = filteredRecords.slice(0, INITIAL_LIMIT);

    displayRecords.forEach(r => {
        c.appendChild(createCardHTML(r));
    });

    // 🌟 加入「載入更多」機制
    if (filteredRecords.length > INITIAL_LIMIT) {
        const moreDiv = document.createElement('div');
        moreDiv.style.cssText = "text-align:center; padding:15px; color:var(--accent); font-size:0.9rem; cursor:pointer;";
        moreDiv.innerHTML = `👇 點擊載入較舊的紀錄 (還有 ${filteredRecords.length - INITIAL_LIMIT} 筆)`;
        moreDiv.onclick = function() {
            this.innerHTML = "⏳ 載入中...";
            setTimeout(() => {
                this.remove(); // 移除這顆按鈕
                const remainingRecords = filteredRecords.slice(INITIAL_LIMIT);
                remainingRecords.forEach(r => {
                    c.appendChild(createCardHTML(r));
                });
            }, 50);
        };
        c.appendChild(moreDiv);
    }
};

// ==========================================
// ★ 開啟紀錄詳情 (修復神明後綴字比對錯誤)
// ==========================================
window.openRecordDetail = function (id, isTrash = false) {
    currentDetailRecordId = id;
    window.isViewingTrashDetail = isTrash; // 記錄全域狀態，讓其他函數也能知道

    if (typeof window.renderDetailFuRows === 'function') window.renderDetailFuRows();
    const qText = document.getElementById('detail-fu-q-text');
    if (qText) qText.value = "";

    // 🌟 依據是否在垃圾桶，從不同的來源抓取資料
    let r;
    if (window.isViewingTrashDetail) {
        let trash = JSON.parse(localStorage.getItem('zb_trash_records_v3') || '[]');
        r = trash.find(x => x.id == id);
    } else {
        r = records.find(x => x.id == id);
    }

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

    // 🌟 垃圾桶純瀏覽模式：封印輸入框、變成灰階、隱藏操作區塊
    const pageDetail = document.getElementById('page-record-detail');
    const fuInputBox = document.getElementById('detail-fu-input-container');
    const shareBtn = document.getElementById('btn-share-poem');

    if (window.isViewingTrashDetail) {
        if (pageDetail) pageDetail.style.filter = 'grayscale(100%) opacity(0.8)';
        if (subjEl) { subjEl.readOnly = true; subjEl.style.pointerEvents = "none"; subjEl.style.color = "#888"; }
        if (noteEl) { noteEl.readOnly = true; noteEl.style.pointerEvents = "none"; noteEl.style.color = "#888"; }
        if (fuInputBox) fuInputBox.style.display = 'none'; // 隱藏追問新增區
        if (shareBtn) shareBtn.style.display = 'none'; // 隱藏分享
    } else {
        if (pageDetail) pageDetail.style.filter = 'none';
        if (subjEl) { subjEl.readOnly = false; subjEl.style.pointerEvents = "auto"; subjEl.style.color = "#fff"; }
        if (noteEl) { noteEl.readOnly = false; noteEl.style.pointerEvents = "auto"; noteEl.style.color = "#fff"; }
        if (fuInputBox) fuInputBox.style.display = 'block'; // 恢復顯示追問新增區
    }

    const area = document.getElementById('detail-res-container');

    if (area) {
        area.innerHTML = "";

        if (r.compareData) {
            // 🌟 垃圾桶模式下隱藏「編輯」按鈕
            let editBtnHtml = window.isViewingTrashDetail ? "" : `<button class="edit-icon-btn" onclick="toggleEditResult()">✎ 編輯</button>`;

            area.innerHTML = `
                <div class="detail-label">比較結果</div>
                <div id="compare-readonly-box" class="readonly-box">
                    ${r.compareData}
                    ${editBtnHtml}
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
                    if (shareBtn && !window.isViewingTrashDetail) shareBtn.style.display = 'block'; // 確認非垃圾桶才顯示分享
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
window.deleteRecord = async function (id, fromDetail = false) { 
    if (confirm("確定要將此紀錄移至垃圾桶嗎？")) {
        const numId = parseInt(id, 10);

        // 🌟 1. 找出要刪除的紀錄，並存入垃圾桶
        const recToTrash = records.find(r => parseInt(r.id, 10) === numId);
        if (recToTrash) {
            let trash = JSON.parse(localStorage.getItem('zb_trash_records_v3') || '[]');
            trash.unshift(recToTrash);
            localStorage.setItem('zb_trash_records_v3', JSON.stringify(trash));
        }

        if (typeof window.deleteFromCloud === 'function') window.deleteFromCloud(id); 

        // 🌟 2. 清理 Hash 註冊表 (增量同步的 Tombstone 機制)
        let syncHashes = JSON.parse(localStorage.getItem('zb_sync_hashes') || '{}');
        delete syncHashes[numId];
        localStorage.setItem('zb_sync_hashes', JSON.stringify(syncHashes));

        // 🌟 3. 從主紀錄中移除
        records = records.filter(r => parseInt(r.id, 10) !== numId);
        
        // 雙軌儲存更新
        if (typeof localforage !== 'undefined') localforage.setItem('zb_records_v3', records).catch(e => {});
        try { localStorage.setItem('zb_records_v3', JSON.stringify(records)); } catch(e) {}

        if (fromDetail) goBack(); else renderRecords();
        showToast("🗑️ 紀錄已移至垃圾桶");
    }
};

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

        // ★ 修改：改用 ImageManager 非同步快取讀取
        const customSrc = window.ImageManager.get('custom_' + key);

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

    // ★ 更新靜止籤筒 (圖1 - 完美置中自適應)
    const qtS = window.ImageManager.get('custom_qiantong_static');
    const elQtS = document.getElementById('prev-qt-static');
    if (elQtS) {
        elQtS.style.margin = '0 auto';
        elQtS.style.overflow = 'visible'; // 🌟 強制解除 .icon-box 的裁切限制
        elQtS.innerHTML = qtS
            ? `<img src="${qtS}" style="height:100%; width:100%; object-fit:contain;">`
            : `<div style="width:100%; height:100%; display:flex; justify-content:center; align-items:center; overflow:visible;"> <!-- 🌟 改為 visible -->
                   <div style="transform: scale(0.65); transform-origin: center center; display:flex; justify-content:center; align-items:center;">
                       ${window.renderCylinderVisualHTML({ isShaking: false, isMini: true })}
                   </div>
               </div>`;
    }

    // ★ 更新抽籤籤筒 (圖2 - 搖晃與隨機出籤輪播動畫)
    const qtA = window.ImageManager.get('custom_qiantong_active');
    const elQtA = document.getElementById('prev-qt-active');
    if (elQtA) {
        elQtA.style.margin = '0 auto';
        elQtA.style.overflow = 'visible'; // 🌟 強制解除 .icon-box 的裁切限制
        if (window.previewQtTimer) clearTimeout(window.previewQtTimer);

        if (qtA) {
            elQtA.innerHTML = `<img src="${qtA}" style="height:100%; width:100%; object-fit:contain;">`;
        } else {
            let qtState = 0; // 0: 搖晃中, 1: 已出籤
            const renderActiveQt = () => {
                const el = document.getElementById('prev-qt-active');
                if (!el) return;

                if (qtState === 0) {
                    el.innerHTML = `
                        <div style="width:100%; height:100%; display:flex; justify-content:center; align-items:center; overflow:visible;"> <!-- 🌟 改為 visible -->
                            <div style="transform: scale(0.65); transform-origin: center center; display:flex; justify-content:center; align-items:center;">
                                ${window.renderCylinderVisualHTML({ isShaking: true, isMini: true })}
                            </div>
                        </div>`;
                    qtState = 1;
                    window.previewQtTimer = setTimeout(renderActiveQt, 1200);
                } else {
                    const randomLot = Math.floor(Math.random() * 60) + 1;
                    el.innerHTML = `
                        <div style="width:100%; height:100%; display:flex; justify-content:center; align-items:center; overflow:visible;"> <!-- 🌟 改為 visible -->
                            <div style="transform: scale(0.65); transform-origin: center center; display:flex; justify-content:center; align-items:center;">
                                ${window.renderCylinderVisualHTML({ isShaking: false, drawnLot: randomLot, isMini: true })}
                            </div>
                        </div>`;
                    qtState = 0;
                    window.previewQtTimer = setTimeout(renderActiveQt, 1500);
                }
            };
            renderActiveQt();
        }
    }

    // ★ 修改：籤筒保持原樣 (圖片或 Emoji)
    const qtImg = window.ImageManager.get('custom_qiantong_img') || QIANTONG_DEFAULT;
    const qtEl = document.getElementById('preview-qiantong');
    if (qtEl) {
        if (qtImg.startsWith('data:image')) qtEl.innerHTML = `<img src="${qtImg}" style="width:50px;height:50px;object-fit:contain">`;
        else qtEl.innerText = qtImg;
    }
}

window.resetAllCups = async function () {
    if (confirm("確定清除所有自訂的筊杯圖片嗎？")) {
        //if (await showConfirm("確定清除所有自訂的筊杯圖片嗎？", "還原確認")) {
        ['cup_saint', 'cup_laugh', 'cup_covered'].forEach(k => window.ImageManager.remove('custom_' + k));
        initCupIcons();
        showToast("🗑️ 已還原預設筊杯");
    }
};

window.resetQiantong = async function () {
    if (confirm("確定還原預設籤筒圖像嗎？")) {
        //if (await showConfirm("確定還原預設籤筒圖像嗎？", "還原確認")) {
        window.ImageManager.remove('custom_qiantong_img');
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
        // 🌟 1. 新增：判斷是否在垃圾桶，若是純瀏覽模式則隱藏刪除按鈕
        let deleteBtnHtml = window.isViewingTrashDetail ? "" : `<button data-html2canvas-ignore="true" onclick="deleteDetailFollowUp(${record.id}, ${i})" style="position:absolute; right:10px; top:10px; background:transparent; border:1px solid #d32f2f; color:#d32f2f; border-radius:4px; padding:2px 8px; font-size:0.75rem; cursor:pointer;">刪除</button>`;

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

        // 🌟 新增：解析時間並轉換為 HTML
        let timeHtml = b.time ? `<div style="font-size:0.75rem; color:#888; margin-bottom:4px;">🕒 ${b.time}</div>` : '';

        // 🌟 2. 修改：將原本寫死的刪除按鈕替換為 ${deleteBtnHtml}
        list.innerHTML += `
            <div id="record-fu-${record.id}-${i}" class="session-block" style="padding:12px; background:rgba(255,255,255,0.05); border-left:3px solid var(--accent); border-radius:8px; margin-bottom:10px; position:relative;">
                
                ${deleteBtnHtml}
                
                ${timeHtml}
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
                    <button class="secondary-btn" id="comp-auto-btn-${i}" style="margin:0; padding:6px 0; font-size:0.8rem; width:100%; display:flex; align-items:center; justify-content:center;" onclick="autoThrowCompareRow(${i})">${window.TINY_CUP_ICON} 擲筊</button>
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
    const imgSaint = settings.cupDisplayMode === 'text' ? null : window.ImageManager.get('custom_cup_saint');
    const imgLaugh = settings.cupDisplayMode === 'text' ? null : window.ImageManager.get('custom_cup_laugh');
    const imgCovered = settings.cupDisplayMode === 'text' ? null : window.ImageManager.get('custom_cup_covered');

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
        details: [...fuTempResults], // ✅ 使用展開運算子複製陣列
        time: (!isNaN(editIndex) && editIndex >= 0 && r.followUps[editIndex].time) ? r.followUps[editIndex].time : new Date().toLocaleString() // 🕒 新增時間戳記
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
            //if (mainEl) {
            //    mainEl.scrollTo({ top: 0, behavior: 'instant' });
            //}

            //選項 B: 滾動到剛新增的追問位置 (聚焦最新結果)
            if (list && list.lastElementChild) {
                list.lastElementChild.scrollIntoView({ behavior: "smooth", block: "center" });
            }
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

// 🌟 新增：渲染垃圾桶列表
window.renderTrashRecords = function () {
    const c = document.getElementById('trash-container');
    if (!c) return;
    c.innerHTML = "";

    let trash = JSON.parse(localStorage.getItem('zb_trash_records_v3') || '[]');
    if (trash.length === 0) {
        c.innerHTML = "<div style='text-align:center;color:#666;margin-top:20px;'>垃圾桶是空的</div>";
        return;
    }

    trash.forEach(r => {
        const div = document.createElement('div');
        div.className = 'record-item';
        // 讓垃圾桶內的紀錄變淡灰
        div.style.cssText = "padding:15px; border-radius:10px; margin-bottom:10px; border:1px solid #444; background: rgba(255,255,255,0.02); cursor:pointer; filter: grayscale(100%) opacity(0.7);";

        let tagClass = "tag-white"; let tagName = "一般求籤"; let displayDeity = r.type;

        if (r.type.includes("一般求籤") || r.type.includes("(一般)")) {
            displayDeity = r.type.replace("一般求籤", "").replace("(一般)", "").trim();
        } else if (r.type.includes("問事")) {
            tagClass = "tag-red"; tagName = "問事擲筊"; displayDeity = r.type.replace("(問事)", "").replace("問事", "").trim();
        } else if (r.type.includes("比較")) {
            tagClass = "tag-blue"; tagName = "比較擲筊"; displayDeity = r.type.replace("(比較)", "").replace("比較擲筊", "").replace("比較", "").trim();
        } else {
            tagName = r.source === 'manual' ? "神明求籤(手)" : "神明求籤(線)";
        }

        if (r.lot && r.lot !== '-') {
            let lotHtml = `<span style="margin-left:4px;">#${r.lot}</span>`;
            displayDeity = displayDeity ? (displayDeity + lotHtml) : lotHtml;
        }

        let mainSubject = r.subject;
        if ((!mainSubject || mainSubject.trim() === "") && r.lot && r.lot !== '-') mainSubject = `第 ${r.lot} 籤`;

        div.innerHTML = `
            <div class="rec-top" style="display:block;">
                <div class="rec-header-row">
                    <span class="rec-tag ${tagClass}" style="filter: grayscale(1);">${tagName}</span>
                    <span class="rec-deity-name">${displayDeity}</span>
                    <span class="rec-date" style="margin-left:auto; margin-right:10px;">${r.date.split(' ')[0]}</span>
                </div>
                <span class="rec-main-subject">${mainSubject || "(無主旨)"}</span>
            </div>
            <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:12px; border-top:1px dashed #555; padding-top:12px;">
                <button onclick="event.stopPropagation(); window.restoreRecord(${r.id})" style="background:transparent; border:1px solid #4CAF50; color:#4CAF50; border-radius:15px; padding:6px 15px; font-size:0.85rem; cursor:pointer;">↩️ 復原</button>
                <button onclick="event.stopPropagation(); window.permanentDeleteRecord(${r.id})" style="background:transparent; border:1px solid #f44336; color:#f44336; border-radius:15px; padding:6px 15px; font-size:0.85rem; cursor:pointer;">❌ 刪除</button>
            </div>
        `;

        // 點擊以純瀏覽模式開啟
        div.onclick = () => window.openRecordDetail(r.id, true);
        c.appendChild(div);
    });
};

window.restoreRecord = function (id) {
    let trash = JSON.parse(localStorage.getItem('zb_trash_records_v3') || '[]');
    const numId = parseInt(id, 10);
    const rec = trash.find(r => parseInt(r.id, 10) === numId);
    if (rec) {
        if (!rec.timestamp) rec.timestamp = Date.now(); // 確保骨子還在
        records.unshift(rec);
        localStorage.setItem('zb_records_v3', JSON.stringify(records));

        trash = trash.filter(r => parseInt(r.id, 10) !== numId);
        localStorage.setItem('zb_trash_records_v3', JSON.stringify(trash));

        renderTrashRecords();
        showToast("✅ 紀錄已復原");
    }
};

window.permanentDeleteRecord = function (id) {
    if (confirm("確定要永久刪除此紀錄嗎？(無法復原)")) {
        let trash = JSON.parse(localStorage.getItem('zb_trash_records_v3') || '[]');
        trash = trash.filter(r => parseInt(r.id, 10) !== parseInt(id, 10));
        localStorage.setItem('zb_trash_records_v3', JSON.stringify(trash));
        renderTrashRecords();
        showToast("🗑️ 紀錄已永久刪除");
    }
};

window.emptyTrash = function () {
    if (confirm("確定要清空垃圾桶嗎？(無法復原)")) {
        localStorage.removeItem('zb_trash_records_v3');
        renderTrashRecords();
        showToast("🗑️ 垃圾桶已清空");
    }
};