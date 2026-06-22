// 1. 從 CDN 匯入必要的 Firebase 功能
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, doc, setDoc, deleteDoc, getDoc, query, orderBy, onSnapshot, serverTimestamp, writeBatch, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";
import { firebaseConfig } from "./privatekey.js";
window.hasBuiltInKey = (typeof firebaseConfig !== 'undefined' && Object.keys(firebaseConfig).length > 0);
let app;
let db;
let storage;

// ==========================================
// ★ Firebase 安全啟動區 (加上防護網，保證不死當)
// ==========================================
try {
    app = initializeApp(firebaseConfig);
    
    // 🌟 【防當機核心】: 線上環境很容易擋快取，被擋時自動降級，保護整個網頁不死當！
    try {
        db = initializeFirestore(app, {
            localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
        });
    } catch (cacheErr) {
        console.warn("⚠️ 瀏覽器阻擋了 Firestore 離線快取，已自動降級為一般連線", cacheErr);
        db = getFirestore(app); // 降級保平安
    }
    
    storage = getStorage(app);
} catch (initErr) {
    console.error("❌ Firebase 初始化發生致命錯誤：", initErr);
}

// ==========================================
// ★ 雲端紀錄同步功能 (已修復 records 名稱錯亂問題)
// ==========================================
window.saveToCloud = async function (recordData) {
    if (!db) return;
    try {
        const cloudData = { ...recordData, updatedAt: serverTimestamp() };
        await setDoc(doc(db, "records", cloudData.id.toString()), cloudData);
        console.log("☁️ 雲端同步成功:", cloudData.id);
    } catch (e) { console.error("雲端儲存失敗:", e); }
};

window.deleteFromCloud = async function (id) {
    if (!db) return;
    try {
        await deleteDoc(doc(db, "records", id.toString()));
        console.log("🗑️ 雲端同步刪除成功:", id);
    } catch (e) { console.error("雲端刪除失敗:", e); }
};

window.startRealTimeSync = function (updateUICallback) {
    if (!db) return;
    const q = query(collection(db, "records"), orderBy("id", "desc"));
    onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
        if (snapshot.metadata.hasPendingWrites) return;
        const cloudRecords = [];
        snapshot.forEach((doc) => cloudRecords.push(doc.data()));
        if (typeof updateUICallback === 'function') updateUICallback(cloudRecords);
    });
};

window.uploadLegacyData = async function () {
    if (!db) return;
    const localData = JSON.parse(localStorage.getItem('zb_records_v3')) || [];
    if (localData.length === 0) return showToast("⚠️ 手機內無紀錄可同步");
    
    // 改用你系統原生的 showConfirm
    if (typeof showConfirm === 'function' && !await showConfirm(`準備將 ${localData.length} 筆紀錄上傳至雲端，是否繼續？`, "雲端同步")) return;

    showToast("⏳ 同步中，請稍候...", 3000);
    try {
        const batch = writeBatch(db);
        for (const rec of localData) {
            const ref = doc(db, "records", rec.id.toString());
            batch.set(ref, rec);
        }
        await batch.commit();
        showToast("✅ 雲端同步完成！");
    } catch (e) {
        showToast("❌ 同步失敗：" + e.message, 4000);
    }
};

// ==========================================
// ★ 補完核心：Firebase Firestore 全機喜好設定備份與還原引擎
// ==========================================

// 1. 雲端備份偏好設定與自訂神明
window.backupSystemToCloud = async function (backupData) {
    if (window.currentDB !== 'firebase' || !db) {
        if (typeof showToast === 'function') showToast("❌ 請先在設定中將資料庫類型切換為 Firebase 並儲存！");
        return;
    }

    try {
        if (typeof showToast === 'function') showToast("☁️ 正在上傳全機喜好設定至雲端...");
        const cloudUserId = "user_preference_profile"; 

        await setDoc(doc(db, "app_global_backups", cloudUserId), {
            payload: JSON.stringify(backupData),
            updatedAt: serverTimestamp() 
        });

        if (typeof showToast === 'function') showToast("✅ 雲端設定與偏好備份成功！");
    } catch (err) {
        console.error("❌ 雲端備份失敗:", err);
        if (typeof showToast === 'function') showToast("❌ 備份失敗：雲端資料庫拒絕連線");
    }
};

// 2. 雲端還原偏好設定與自訂神明
window.restoreSystemFromCloud = async function () {
    if (window.currentDB !== 'firebase' || !db) {
        if (typeof showToast === 'function') showToast("❌ 請先在設定中綁定 Firebase！");
        return;
    }

    // 🌟 修正：使用你系統自帶的 showConfirm 函數，避免找不到函數報錯
    if (typeof showConfirm === 'function' && !await showConfirm("⚠️ 警告：這將會使用雲端備份【覆蓋】目前手機上的所有設定與圖片！\n\n確定要從雲端還原嗎？", "雲端還原")) return;

    try {
        if (typeof showToast === 'function') showToast("☁️ 正在自雲端下載喜好設定...");
        const cloudUserId = "user_preference_profile";
        const docSnap = await getDoc(doc(db, "app_global_backups", cloudUserId));

        if (docSnap.exists()) {
            const cloudData = docSnap.data();
            const cloudSnapshot = JSON.parse(cloudData.payload);
            let restoreCount = 0;

            Object.keys(cloudSnapshot).forEach(key => {
                if (key === 'meta_info') return; 
                localStorage.setItem(key, cloudSnapshot[key]);
                restoreCount++;
            });

            if (typeof showToast === 'function') showToast(`🎉 成功還原 ${restoreCount} 項喜好設定！系統重載中...`);
            
            setTimeout(() => {
                sessionStorage.setItem('skipSplash', 'true');
                location.reload();
            }, 1500);

        } else {
            if (typeof showToast === 'function') showToast("⚠️ 雲端資料庫中查無您的備份紀錄！");
        }
    } catch (err) {
        console.error("❌ 雲端還原失敗:", err);
        if (typeof showToast === 'function') showToast("❌ 還原失敗：檔案解碼失敗或網路中斷");
    }
};

// ==========================================
// ★ 雲端 Storage 圖片引擎
// ==========================================
window.uploadImageToCloud = async function(fileOrBase64, storagePath) {
    if (!storage) throw new Error("Storage 尚未初始化");
    try {
        const storageRef = ref(storage, storagePath);
        
        if (typeof fileOrBase64 === 'string' && fileOrBase64.startsWith('data:image')) {
            const response = await fetch(fileOrBase64);
            const blob = await response.blob();
            await uploadBytes(storageRef, blob);
        } else {
            await uploadBytes(storageRef, fileOrBase64);
        }

        const downloadURL = await getDownloadURL(storageRef);
        console.log("☁️ 圖片上傳成功，網址:", downloadURL);
        return downloadURL; 
    } catch (error) {
        console.error("❌ 圖片上傳失敗:", error);
        throw error; 
    }
};
