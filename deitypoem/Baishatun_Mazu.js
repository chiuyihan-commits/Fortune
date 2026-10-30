// ==========================================
// ★ 白沙屯 / 山邊媽祖宮 擴充包 (含專屬版型)
// ==========================================
window.poemSystems = window.poemSystems || {};
window.customPoemTemplates = window.customPoemTemplates || {};
window.extraDeities = window.extraDeities || [];

// ★ 防呆：確保基礎資料已經載入
if (!window.RAW_POEM_ARRAYS || !window.RAW_POEM_ARRAYS['mazu']) {
    console.error("【天后宮載入失敗】請確認 Mazu.js 已在 HTML 中優先載入！");
} else {
    const baishatunContent = JSON.parse(JSON.stringify(window.poemSystems['mazu'].content));

    // ★ 核心修正 1：將原本的 101 改為全域籤王代碼 0 (相容舊紀錄查詢：同時保留 101 指向同一首)
    const kingPoemData = {
        lot: 0,
        level: "大吉 (籤王)",
        l1: "此籤尾尾連一詩",
        l2: "助油三斤補足添",
        l3: "求著此籤大吉利",
        l4: "百福駢臻萬事宜",
        intents: [
            { type: "功名", text: "春風報喜\n功名得意" },
            { type: "生意", text: "竹木萌芽\n大利初至" },
            { type: "行人", text: "好音頻來\n行人將至" },
            { type: "疾病", text: "神油補足\n自有痊癒" },
            { type: "婚姻", text: "家和事成\n合生貴子" },
            { type: "出行", text: "順風得利\n滿載榮歸" },
            { type: "官司", text: "官司明顯\n此事必勝" },
            { type: "失物", text: "命運已通\n可免失脫" },
            { type: "丁口", text: "春信頻來\n合家清吉" },
            { type: "田畜", text: "田肥苗秀\n六畜興旺" }
        ]
    };
    baishatunContent[0] = kingPoemData;

    // 3. 註冊系統
    window.poemSystems['Baishatun_Mazu'] = {
        id: 'Baishatun_Mazu', 
        name: '白沙屯拱天宮籤詩', 
        total: 101, 
        format: 'Baishatun_Mazu', 
        category: 'mazu', 
        isBase: false, 
        content: baishatunContent
    };

    window.poemSystems['Shanbian_Mazu'] = {
        id: 'Shanbian_Mazu', 
        name: '山邊媽祖宮籤詩', 
        total: 101, 
        format: 'Baishatun_Mazu', 
        category: 'mazu', 
        isBase: false, 
        content: baishatunContent
    };

    // ==========================================
    // ★ 白沙屯 / 山邊媽祖宮 專屬版面渲染引擎 (終極網格對齊版)
    // ==========================================
    window.customPoemTemplates['Baishatun_Mazu'] = function (poem, cleanLotNum, templeName, deity, customData) {
        // 若舊歷史紀錄存的是 101，自動轉抓 0 號籤王資料
        const numVal = Number(cleanLotNum);
        if ((numVal === 101 || numVal === 0) && (!poem || !poem.l1)) {
            poem = baishatunContent[0];
        }
        if (!poem) return `<div class="fortune-slip" style="padding:30px; text-align:center; color:#888;">第 ${cleanLotNum} 籤資料建置中...</div>`;

        // 中文數字轉換
        const cnNums = ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
        const getCn = n => { if (n == 100) return "一百"; if (n == 101) return "一〇一"; if (n < 10) return cnNums[n]; if (n < 20) return "十" + (n % 10 ? cnNums[n % 10] : ""); return cnNums[Math.floor(n / 10)] + "十" + (n % 10 ? cnNums[n % 10] : ""); };

        // ★ 核心修正 2：判斷籤紙右側邊欄要印什麼字
        // (預設印「籤 王」；如果你希望實體籤紙上還是印「第一〇一首」，把下面那行 '籤 王' 改成 '第一〇一首' 即可！)
        let rightLotTitle = (numVal === 0 || numVal === 101) ? "第一〇一首" : `第${getCn(numVal)}首`;

        let pLines = [poem.l1 || '', poem.l2 || '', poem.l3 || '', poem.l4 || ''];
        if (poem.poem) {
            let p = poem.poem.replace(/。/g, '').split(/[，,]/);
            pLines = [p[0] || '', p[1] || '', p[2] || '', p[3] || ''];
        }
        const lines = (customData && customData.l1) ? [customData.l1, customData.l2, customData.l3, customData.l4] :
            (deity && deity.l1) ? [deity.l1, deity.l2, deity.l3, deity.l4] : pLines;

        let intentsList = (customData && customData.intents) ? customData.intents : (poem.intents || []);

        // 宮廟抬頭處理 (支援左右護法字 + 圓圈印章效果)
        let revTitle = (templeName || '媽祖宮').split("").reverse().join("");
        let templeHtml = `<div class="temple-name">${revTitle}</div>`;
        if (deity && (deity.rightText || deity.leftText)) {
            const circleStyle = deity.circleText
                ? 'border: 2px solid #111; border-radius: 50%; width: 1.4em; height: 1.4em; display: flex; align-items: center; justify-content: center;'
                : '';
            templeHtml = `
        <div style="display: flex; align-items: center; justify-content: space-evenly; width: 100%;">
            ${deity.leftText ? `<div style="font-size: 5cqw; font-weight: 900; color: #111; ${circleStyle}">${deity.leftText}</div>` : ''}
            <div class="temple-name">${revTitle}</div>
            ${deity.rightText ? `<div style="font-size: 5cqw; font-weight: 900; color: #111; ${circleStyle}">${deity.rightText}</div>` : ''}
        </div>`;
        }

        // 地址電話處理
        let addressPhone = (deity && deity.address) ? deity.address.replace(/\n/g, '<br>').replace(/-/g, '︱') : "";
        let committeeText = (deity && deity.committee) ? deity.committee : "";

        // 聖意動態網格生成
        let intentHTML = "";
        if (intentsList.length > 0) {
            let gridCells = "";

            intentsList.forEach((item) => {
                let part1 = "", part2 = "";
                let cleanVal = item.text.replace(/[\s\n]+/g, '');

                if (cleanVal.length >= 8) {
                    part1 = cleanVal.substring(0, 4);
                    part2 = cleanVal.substring(4, 8);
                } else if (cleanVal.length >= 6) {
                    part1 = cleanVal.substring(0, 3);
                    part2 = cleanVal.substring(3);
                } else if (cleanVal.length === 4) {
                    part1 = cleanVal;
                    part2 = "";
                } else {
                    part1 = cleanVal;
                }

                gridCells += `
            <div class="grid-cell">
                ${item.type ? `<div class="cell-cat">${item.type}</div>` : ''}
                <div class="cell-val-container">
                    <div class="cell-val-line">${part1}</div>
                    <div class="cell-val-line">${part2}</div>
                </div>
            </div>`;
            });

            let rowCount = Math.ceil(intentsList.length / 5);
            if (rowCount < 1) rowCount = 1;

            intentHTML = `
        <div class="slip-interpretations" style="grid-template-rows: repeat(${rowCount}, 1fr);">
            ${gridCells}
        </div>`;
        } else {
            intentHTML = `<div class="slip-interpretations" style="display:flex; align-items:center; justify-content:center; height:100%;">無解說資料</div>`;
        }

        return `
        <style>
            .fortune-slip { 
                background-color: #fcf9f2; color: #000; 
                width: 90vw; max-width: 420px; 
                aspect-ratio: 40 / 68; 
                max-height: 75vh; 
                margin: 10px auto; padding: 3% 5%; 
                box-sizing: border-box; font-family: "BiauKai", "DFKai-SB", "KaiTi", serif; 
                box-shadow: 0 4px 15px rgba(0,0,0,0.4); container-type: inline-size; 
            }
            .slip-inner-border { border: 2px solid #000; width: 100%; height: 100%; display: flex; flex-direction: column; box-sizing: border-box; }
            .slip-header { height: 12%; border-bottom: 2px solid #000; display: flex; align-items: center; justify-content: center; }
            .slip-header .temple-name { font-size: 8.5cqw; font-weight: 900; letter-spacing: 0.3em; margin: 0; }
            .slip-body { height: 50%; border-bottom: 2px solid #000; display: flex; flex-direction: row-reverse; }
            .side-col { width: 12%; writing-mode: vertical-rl; text-orientation: upright; display: flex; align-items: center; justify-content: center; font-weight: bold; padding: 1cqw 0; }
            .right-col { border-left: 1px solid #000; font-size: 4.5cqw; letter-spacing: 0.2em; }
            .left-col { border-right: 1px solid #000; font-size: 3cqw; letter-spacing: 0.1em; line-height: 1.3; text-align: center;}
            .poem-text-area { width: 76%; display: flex; flex-direction: row-reverse; justify-content: space-around; align-items: center; padding: 1cqw; }
            .poem-line { writing-mode: vertical-rl; text-orientation: upright; font-size: 7.5cqw; font-weight: 600; letter-spacing: 0.1em; }
            .slip-interpretations { height: 38%; display: grid; grid-template-columns: repeat(5, 1fr); direction: rtl; width: 100%; }
            .slip-interpretations .grid-cell { 
                border: none !important;
                display: flex; flex-direction: column; align-items: center; justify-content: center; 
                padding: 0.5cqw 0; 
                box-sizing: border-box; 
            }
            .slip-interpretations .grid-cell:nth-child(5n) { border-left: none; }
            .slip-interpretations .grid-cell:nth-last-child(-n+5) { border-bottom: none; }
            .cell-cat { font-weight: 900; font-size: 4.2cqw; writing-mode: vertical-rl; text-orientation: upright; margin-bottom: 0.5cqw; letter-spacing: 0.1em;}
            .cell-val-container { writing-mode: vertical-rl; text-orientation: upright; display: flex; flex-direction: column; align-items: center; gap: 0; }
            .cell-val-line { font-size: 3.8cqw; font-weight: 500; white-space: nowrap; letter-spacing: 0;}
        </style>

        <div class="fortune-slip">
            <div class="slip-inner-border">
                <div class="slip-header">
                    ${templeHtml}
                </div>
                <div class="slip-body">
                    <div class="side-col right-col">${rightLotTitle}</div>
                    <div class="poem-text-area">
                        <div class="poem-line">${lines[0]}</div>
                        <div class="poem-line">${lines[1]}</div>
                        <div class="poem-line">${lines[2]}</div>
                        <div class="poem-line">${lines[3]}</div>
                    </div>
                    <div class="side-col left-col">
                        <div style="margin-bottom: 2cqw;">${committeeText}</div>
                        <div>${addressPhone}</div>
                    </div>
                </div>
                ${intentHTML}
            </div>
        </div>
    `;
    };

    // 5. 註冊神明
    window.extraDeities.push({
        id: 'Baishatun_Mazu', 
        name: '白沙屯媽祖', 
        iconType: 'emoji', 
        iconVal: '👸',
        builtInImg: './deitypoem/Baishatun_Mazu.jpg',
        cloudImgUrl:'',
        temple: '拱天宮', 
        committee: '',
        address: '苗栗縣通霄鎮白東里8巷8號\n電話:037-792058', 
        rightText: '', 
        leftText: '', 
        circleText: false, 
        sysId: 'Baishatun_Mazu'
    });

    window.extraDeities.push({
        id: 'Shanbian_Mazu', 
        name: '山邊媽祖', 
        iconType: 'emoji', 
        iconVal: '👸', 
        builtInImg: './deitypoem/Shanbian_Mazu.jpg',
        cloudImgUrl:'',
        temple: '媽祖宮', 
        committee: '',
        address: '苗栗縣後龍鎮南港里一〇八之三號\n電話:037-923923', 
        rightText: '山', 
        leftText: '邊', 
        circleText: true, 
        sysId: 'Shanbian_Mazu'
    });
}