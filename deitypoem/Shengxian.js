// ==========================================
// ★ 苑裡聖賢宮擴充包：繼承雷雨師，擴充首尾籤
// ==========================================
window.poemSystems = window.poemSystems || {};
window.customPoemTemplates = window.customPoemTemplates || {};
window.extraDeities = window.extraDeities || [];

// ⚠️ 防呆：確保雷雨師基礎包已經先被載入
if (!window.poemSystems['Leiyushi_100']) {
    console.error("【聖賢宮載入失敗】請確認 div_data_leiyushi.js 已在 HTML 中優先載入！");
} else {
    // 1. 【繼承魔法】深拷貝雷雨師的 100 首資料
    const shengxianContent = JSON.parse(JSON.stringify(window.poemSystems['Leiyushi_100'].content));

    // 2. 【擴充資料】加入專屬的 101 (籤首) 與 102 (籤尾)
    shengxianContent[101] = {
        lot: 101,
        level: "大吉",
        l1: "聖賢籤首百事良", l2: "添油作福大吉昌", l3: "萬般皆能如己意", l4: "富貴榮華福壽長",
        meaning: "百事皆吉、求財得利、病得安康。",
        dongpo: "籤首之尊、萬事如意。"
    };

    shengxianContent[102] = {
        lot: 102,
        level: "大吉",
        l1: "聖賢籤尾好收場", l2: "春風化雨萬物長", l3: "此去前途多平穩", l4: "積善之家慶有餘",
        meaning: "功德圓滿、凡事大吉。",
        dongpo: "尾籤亦吉、收成豐碩。"
    };

    // 3. 註冊聖賢宮專屬籤詩系統
    window.poemSystems['Shengxian_102'] = {
        id: 'Shengxian_102',
        name: '苑裡聖賢宮籤詩',
        total: 102, // 總數變 102 了
        format: 'shengxian', // ★ 指派專屬版型
        category: 'leiyushi',
        isBase: false,
        content: shengxianContent
    };

    // 直接將聖賢宮的版型指標，指向雷雨師的引擎！
    window.customPoemTemplates['shengxian'] = window.customPoemTemplates['leiyushi'];

    // 5. 新增神明，綁定這個新系統
    window.extraDeities.push({
        id: 'Shengxian_Gong',
        name: '聖賢宮玄天上帝',
        iconType: 'emoji',
        builtInImg: '', // 🌟 內建圖片路徑
        cloudImgUrl:'', // 👈 Firebase 給的網址
        iconVal: '🏛️',
        temple: '聖賢宮',
        sysId: 'Shengxian_102' // ★ 綁定上方註冊的新系統
    });
}