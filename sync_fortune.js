// 🌟 輕量級 Hash 產生器
window.generateHash = function(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0; 
    }
    return hash;
};

// ==========================================
// ★ 雲端與資料庫同步引擎 (sync_fortune.js)
// 負責處理 Firebase、Google Sheets(GAS) 的備份與還原
// ==========================================
console.log("☁️ [模組載入] sync_fortune.js 雲端同步引擎已就緒");

// 動態初始化資料庫引擎 (優化版：相容內建私鑰檔案架構)
window.initDatabaseEngine = async function () {
    try {
        const dbType = localStorage.getItem('cfg_db_type'); 
        
        // 依據金鑰狀態顯示 UI
        const statusBanner = document.getElementById('cloud-key-status');
        const syncContainer = document.getElementById('sync-toggle-container');
        if (window.hasBuiltInKey) {
            if (statusBanner) statusBanner.style.display = 'block';
            if (syncContainer) syncContainer.style.display = 'flex'; // 有 KEY 才顯示開關
        }
        
        if (!dbType || dbType === 'firebase') {
            window.currentDB = 'firebase';
            localStorage.setItem('cfg_db_type', 'firebase'); 
            console.log("🔥 系統啟動：經由內建私鑰檔案連接 Firebase 雲端資料庫");
            return;
        }

        if (dbType === 'gas') {
            const gasUrl = localStorage.getItem('cfg_gas_url');
            if (gasUrl && gasUrl.trim() !== '') {
                window.gasUrl = gasUrl;
                window.currentDB = 'gas';
                console.log("📊 Google Sheets (GAS) 模式啟動！");
                return;
            }
        }

        window.currentDB = 'local';
        console.log("📱 使用者指定純本機單機模式");

    } catch (e) {
        console.error("❌ 資料庫引擎初始化失敗，降級為單機模式", e);
        window.currentDB = 'local';
    }
};

// 統一的雲端資料總管
const CloudManager = {
    saveRecord: async function (recordData) {
        const dbType = window.currentDB;
        const isSyncEnabled = localStorage.getItem('cfg_realtime_sync') !== 'false';

        // 🌟 1. 寫入本地雙軌防護：IndexedDB 優先，LocalStorage 備援
        let localRecords = JSON.parse(localStorage.getItem('zb_records_v3') || '[]');
        const existingIndex = localRecords.findIndex(r => r.id === recordData.id);
        if (existingIndex === -1) localRecords.unshift(recordData);
        else localRecords[existingIndex] = recordData;

        if (typeof localforage !== 'undefined') {
            localforage.setItem('zb_records_v3', localRecords).catch(e => console.warn(e));
        }
        try {
            localStorage.setItem('zb_records_v3', JSON.stringify(localRecords));
        } catch (e) {
            console.warn("LocalStorage 空間已滿，改由 IndexedDB 接管本地儲存");
        }

        if (dbType === 'local' || !isSyncEnabled) {
            return Promise.resolve(true);
        }

        // 🌟 2. 增量同步核心：Hash 比對攔截
        const pureData = { ...recordData };
        delete pureData.html; // 剔除視圖屬性以精準比對資料狀態
        const currentHash = window.generateHash(JSON.stringify(pureData));
        
        let syncHashes = JSON.parse(localStorage.getItem('zb_sync_hashes') || '{}');
        if (syncHashes[recordData.id] === currentHash) {
            console.log(`[增量同步] 紀錄 ${recordData.id} 無變更，已攔截雲端請求`);
            return Promise.resolve(true); 
        }

        // 3. 執行雲端上傳
        try {
            if (dbType === 'firebase' && typeof window.saveToCloud === 'function') {
                await window.saveToCloud(recordData);
            }
            else if (dbType === 'gas') {
                await fetch(window.gasUrl, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'saveRecord', data: recordData })
                });
            }
            
            // 4. 上傳成功，登錄 Hash
            syncHashes[recordData.id] = currentHash;
            localStorage.setItem('zb_sync_hashes', JSON.stringify(syncHashes));
            return true;
        } catch (err) {
            console.error("同步失敗", err);
            return false;
        }
    },

    getRecords: async function () {
        if (window.currentDB === 'firebase') { /* Firebase 讀取 */ } 
        else if (window.currentDB === 'gas') { /* fetch 讀取 */ } 
        else { 
            // 優先嘗試從 IndexedDB 讀取，再降級 LocalStorage
            if (typeof localforage !== 'undefined') {
                const idbRecords = await localforage.getItem('zb_records_v3');
                if (idbRecords) return idbRecords;
            }
            return JSON.parse(localStorage.getItem('zb_records_v3') || '[]'); 
        }
    }
};

// 開關切換的全域函式
window.toggleRealtimeSync = function(isChecked) {
    localStorage.setItem('cfg_realtime_sync', isChecked);
    if (typeof showToast === 'function') {
        showToast(isChecked ? "☁️ 已開啟雲端即時同步" : "⏸️ 已暫停同步 (僅存本機)");
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
// ★ 雲端手動備份打包引擎 (搭載雲端瘦身轉存與容量預警機制)
// ==========================================
window.triggerCloudBackup = async function () {
    const backupData = {};
    let count = 0;

    if (typeof showToast === 'function') showToast("⏳ 正在準備備份資料，請稍候...");

    // 1. 蒐集所有需要備份的本機資料
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        // ★ 核心邏輯：排除紀錄！(紀錄已有專屬的實時同步了，備份它浪費空間)
        if (key === 'zb_records_v3') continue;

        const isTarget = BACKUP_SCOPE.some(prefix => key.startsWith(prefix));
        if (isTarget) {
            backupData[key] = localStorage.getItem(key);
            count++;
        }
    }

    // ==========================================
    // ★ 核心優化：雲端瘦身術！(Base64 轉 URL)
    // ==========================================
    for (let key in backupData) {
        let val = backupData[key];
        
        // 如果發現這個設定值是一張又大又肥的 Base64 圖片
        if (typeof val === 'string' && val.startsWith('data:image')) {
            // 確保 Firebase Storage 的上傳模組有載入
            if (typeof window.uploadImageToCloud === 'function') {
                if (typeof showToast === 'function') showToast(`⏳ 正在將圖片同步至雲端空間...`);
                try {
                    // 建立雲端路徑，例如 system_images/custom_door_left_170000000.webp
                    const storagePath = `system_images/${key}_${Date.now()}.webp`;
                    const cloudUrl = await window.uploadImageToCloud(val, storagePath);
                    
                    if (cloudUrl) {
                        // ★ 魔法：把原本幾百 KB 的字串，替換成短短幾十個字的網址！
                        backupData[key] = cloudUrl; 
                    }
                } catch (e) {
                    console.warn(`圖片 ${key} 上傳雲端失敗，保留本機 Base64 格式`, e);
                }
            }
        }
    }

    backupData['meta_info'] = {
        date: new Date().toLocaleString(),
        version: 'Cloud_Backup_Optimized',
        itemCount: count
    };

    // ==========================================
    // ★ 容量預警防呆機制
    // ==========================================
    // 計算最終要寫入 Firestore 的 JSON 檔案大小 (1 byte ≈ 1 character)
    const finalJsonString = JSON.stringify(backupData);
    const byteSize = new Blob([finalJsonString]).size;
    
    // Firestore 單一文件限制為 1MB (1,048,576 bytes)，我們設定 900KB 為安全警戒線
    if (byteSize > 900000) {
        if (typeof showToast === 'function') {
            showToast("❌ 備份失敗：資料量逼近 1MB 上限！請刪除部分自訂籤詩或圖片後再試。");
        }
        return; // 終止上傳，避免觸發 Firebase 崩潰報錯
    }

    // 呼叫 Firebase 儲存
    if (typeof window.backupSystemToCloud === 'function') {
        if (typeof showToast === 'function') showToast("☁️ 正在打包上傳至資料庫...");
        window.backupSystemToCloud(backupData);
    } else {
        if (typeof showToast === 'function') showToast("❌ 找不到雲端連線模組，請確定 Firebase 已載入！");
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