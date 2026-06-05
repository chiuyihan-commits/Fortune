// ==========================================
// ★ 雲端與資料庫同步引擎 (sync_fortune.js)
// 負責處理 Firebase、Google Sheets(GAS) 的備份與還原
// ==========================================
console.log("☁️ [模組載入] sync_fortune.js 雲端同步引擎已就緒");

// 動態初始化資料庫引擎 (優化版：相容內建私鑰檔案架構)
window.initDatabaseEngine = async function () {
    try {
        const dbType = localStorage.getItem('cfg_db_type'); 
        
        // 情況 A：如果使用者是第一次開機、或是希望預設走雲端
        if (!dbType || dbType === 'firebase') {
            window.currentDB = 'firebase';
            localStorage.setItem('cfg_db_type', 'firebase'); // 確保狀態鎖定在雲端
            console.log("🔥 系統啟動：經由內建私鑰檔案連接 Firebase 雲端資料庫");
            return;
        }

        // 情況 B：使用 Google 試算表託管
        if (dbType === 'gas') {
            const gasUrl = localStorage.getItem('cfg_gas_url');
            if (gasUrl && gasUrl.trim() !== '') {
                window.gasUrl = gasUrl;
                window.currentDB = 'gas';
                console.log("📊 Google Sheets (GAS) 模式啟動！");
                return;
            }
        }

        // 情況 C：使用者手動在後台切換為純單機模式
        window.currentDB = 'local';
        console.log("📱 使用者指定純本機單機模式");

    } catch (e) {
        console.error("❌ 資料庫引擎初始化失敗，降級為單機模式", e);
        window.currentDB = 'local';
    }
};

// 統一的雲端資料總管
const CloudManager = {
    // 儲存紀錄
    saveRecord: async function (recordData) {
        const dbType = window.currentDB;

        if (dbType === 'firebase') {
            // 呼叫你在 div_sys_firebase-config.js 寫好的模組化存檔函數
            if (typeof window.saveToCloud === 'function') {
                return await window.saveToCloud(recordData);
            }
        }
        else if (dbType === 'gas') {
            // 丟給使用者的 Google 試算表
            return await fetch(window.gasUrl, {
                method: 'POST',
                mode: 'no-cors', // GAS 跨域通常用 no-cors 或正確設定 CORS
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'saveRecord', data: recordData })
            });
        }
        else {
            // 單機模式：只存 LocalStorage
            let localRecords = JSON.parse(localStorage.getItem('zb_records_v3') || '[]');
            localRecords.push(recordData);
            localStorage.setItem('zb_records_v3', JSON.stringify(localRecords));
            return Promise.resolve(true);
        }
    },

    // 讀取紀錄
    getRecords: async function () {
        if (window.currentDB === 'firebase') {
            /* 執行 Firebase 讀取邏輯 */
        } else if (window.currentDB === 'gas') {
            /* 執行 fetch GET 請求讀取試算表 */
        } else {
            return JSON.parse(localStorage.getItem('zb_records_v3') || '[]');
        }
    }
};

// 控制雲端資料庫輸入框的顯示與隱藏
window.toggleDbInput = function () {
    const dbType = document.getElementById('db-type-select').value;
    const gasInput = document.getElementById('db-input-gas');
    const firebaseInput = document.getElementById('db-input-firebase');

    // 先全部隱藏
    gasInput.style.display = 'none';
    firebaseInput.style.display = 'none';

    // 根據選擇顯示對應的輸入框
    if (dbType === 'gas') {
        gasInput.style.display = 'block';
    } else if (dbType === 'firebase') {
        firebaseInput.style.display = 'block';
    }
};

// 儲存雲端資料庫設定
window.saveCustomDatabase = function () {
    const dbType = document.getElementById('db-type-select').value;
    const gasUrl = document.getElementById('custom-gas-url').value.trim();
    const fbConfig = document.getElementById('custom-firebase-config').value.trim();

    // 簡單防呆
    if (dbType === 'gas' && !gasUrl) return showToast("⚠️ 請輸入 GAS 網址！");
    if (dbType === 'firebase' && !fbConfig) return showToast("⚠️ 請輸入 Firebase Config！");

    // 存入瀏覽器記憶體
    localStorage.setItem('cfg_db_type', dbType);
    if (dbType === 'gas') localStorage.setItem('cfg_gas_url', gasUrl);
    if (dbType === 'firebase') localStorage.setItem('cfg_firebase_config', fbConfig);

    // 重新啟動資料庫引擎
    window.initDatabaseEngine();

    showToast(`✅ 資料庫切換為 [${dbType}]，設定已儲存！`);
};

// ==========================================
// ★ 雲端手動備份打包引擎
// ==========================================
window.triggerCloudBackup = function () {
    const backupData = {};
    let count = 0;

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        // ★ 核心邏輯：排除紀錄！
        // 因為紀錄 (zb_records_v3) 已經有專屬的實時同步了，備份它浪費空間
        if (key === 'zb_records_v3') continue;

        const isTarget = BACKUP_SCOPE.some(prefix => key.startsWith(prefix));
        if (isTarget) {
            backupData[key] = localStorage.getItem(key);
            count++;
        }
    }

    backupData['meta_info'] = {
        date: new Date().toLocaleString(),
        version: 'Cloud_Backup',
        itemCount: count
    };

    // 呼叫 Firebase 儲存
    if (typeof window.backupSystemToCloud === 'function') {
        window.backupSystemToCloud(backupData);
    } else {
        showToast("❌ 找不到雲端連線模組，請確定 Firebase 已載入！");
    }
};

// ==========================================
// ★ Webhook / GAS 雲端資料傳送引擎
// ==========================================
window.sendDataToWebhook = async function(recordData) {
    // 1. 取得使用者在設定中填寫的 GAS 網址
    const webhookUrl = document.getElementById('custom-gas-url')?.value || localStorage.getItem('cfg_webhook_url');

    if (!webhookUrl) {
        if(typeof showToast === 'function') showToast("⚠️ 尚未設定 Google 雲端網址！");
        return;
    }

    try {
        if(typeof showToast === 'function') showToast("⏳ 正在傳送資料至 Google 雲端...");
        
        // 2. 打包你要傳送的資料 (🌟 關鍵：加入 action: 'upload' 讓 GAS 認得)
        const payload = {
            action: 'upload',               // 對應你 GAS 裡的判斷式
            timestamp: new Date().toISOString(),
            app_source: "擲筊助手",
            data: recordData                // 你的所有紀錄資料
        };

        // 3. 發送 POST 請求給 Google Apps Script
        const response = await fetch(webhookUrl, {
            method: 'POST',
            // 注意：GAS 對於跨域 (CORS) 比較嚴格，有時改用 text/plain 可以避開預檢請求錯誤
            headers: {
                'Content-Type': 'text/plain;charset=utf-8', 
            },
            body: JSON.stringify(payload)
        });

        // 4. 解析 GAS 回傳的結果
        const result = await response.json();

        if (result.success) {
            if(typeof showToast === 'function') showToast("✅ Google 雲端備份成功！");
        } else {
            throw new Error(result.error || "未知錯誤");
        }

    } catch (error) {
        console.error("雲端傳送失敗:", error);
        if(typeof showToast === 'function') showToast("❌ 備份失敗，請檢查網址或網路狀態。");
    }
};