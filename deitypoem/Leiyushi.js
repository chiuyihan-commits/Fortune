// ==========================================
// 終極擴充包：雷雨師系統與專屬神明
// ==========================================
// 確保全域變數存在 (防呆機制)
window.poemSystems = window.poemSystems || {};
window.customPoemTemplates = window.customPoemTemplates || {};
window.extraDeities = window.extraDeities || []; // 用來存放外掛進來的神明

// ==========================================
// ★ 1.新增資料庫：雷雨師 100 籤 (含東坡解與精準備位)
// ==========================================
const lotsLeiyushi_100 = {
    1: { level: "大吉", ganzhi: "甲甲", story: "漢高祖入關 / 十八學士登瀛洲 / 洪武受命", poem: "巍巍獨步向雲間，玉殿千官第一班，富貴榮華天付汝，福如東海壽如山。", meaning: "功名遂、求財豐、訟得理、病即癒、孕生男、婚必合。", dongpo: "出身得地。步入雲間。占第一尊。何等奇驖。報知詞客。晚年大器。若問前程。指日可期。" },
    2: { level: "上吉", ganzhi: "甲乙", story: "張子房遊赤松 / 蘇秦不第", poem: "盈虛消息總天時，自此君當百事宜，若問前程歸縮地，更須方寸好修為。", meaning: "訟即解、病即安、名利達成、婚必合、行人回。", dongpo: "萬事乘除。隨時而處。否極泰來。事無不吉。若問前程。更須修為。但行好事。福祿來宜。" },
    3: { level: "中吉", ganzhi: "甲丙", story: "賈誼遇漢文帝 / 岳飛報國", poem: "衣食自然生處有，勸君不用苦勞心，但能孝悌存忠信，福祿來時禍不侵。", meaning: "問名利、自有時、訟和吉、病安康、婚自合、孕生男。", dongpo: "衣食自足。強求則虧。但能孝悌。福祿來宜。莫貪名利。徒爾勞心。隨分守己。禍必不侵。" },
    4: { level: "中吉", ganzhi: "甲丁", story: "小秦王三跳澗 / 項羽困烏江", poem: "去年百事頗相宜，若較今年時運衰，好把瓣香告神佛，莫教福謝悔無追。", meaning: "名利無、訟宜和、病祈禱、孕生女、婚未成、守舊吉。", dongpo: "先吉後凶。時運衰微。且隨分過。莫問是非。好把瓣香。告於神明。求祈保祐。免致災愆。" },
    5: { level: "中平", ganzhi: "甲戊", story: "呂蒙正守困 / 蘇東坡會客", poem: "子有三般不自由，門庭蕭索冷如秋，若逢牛鼠交承日，萬事回春不用憂。", meaning: "財祿散、名利虛、訟不勝、病未痊、婚不合、宜待時。", dongpo: "富貴前定。何須強求。徒勞心力。反致貽憂。事逢子丑。自有一番。今且守舊。休問前程。" },
    6: { level: "下下", ganzhi: "甲己", story: "藺相如完璧歸趙 / 司馬相如琴挑文君", poem: "何勞鼓瑟更吹笙，寸步如登萬里程，彼此懷疑不相信，休將私意憶濃情。", meaning: "名與利、皆不遂、訟宜和、病審醫、孕有驚、凡事守。", dongpo: "凡事苦辛。勞神費力。彼此懷疑。不如意處。且宜守舊。休將私意。妄意請求。免生災愆。" },
    7: { level: "大吉", ganzhi: "甲庚", story: "洞賓煉丹 / 盤古開天", poem: "仙風道骨本天生，又遇仙宗為主盟，指日丹成謝巖谷，一朝引領向天行。", meaning: "圖名遂、求財豐、訟得理、病即癒、孕生男、終大吉。", dongpo: "仙風道骨。本是天生。又遇神明。為主結盟。指日可期。一朝引領。向上天行。凡事如意。" },
    8: { level: "上上", ganzhi: "甲辛", story: "大舜耕歷山 / 薛仁貴回家", poem: "年來耕稼苦無收，今歲田疇定有秋，況遇太平無事日，士農工賈百無憂。", meaning: "名利遂、財物獲、病即安、孕生男、家宅安、行人至。", dongpo: "先否後泰。百事如意。士農工商。皆有大利。若逢秋成。必有大秋。凡事吉慶。不用疑慮。" },
    9: { level: "大吉", ganzhi: "甲壬", story: "宋太祖陳橋即位 / 張仙送子", poem: "望渠消息向長安，常把菱花仔細看，見說文書將入境，今朝喜色上眉端。", meaning: "名必成、財必遂、病即癒、訟即息、凡事好、皆如意。", dongpo: "謀望已久。忽得好音。音信即到。可以放心。若問前程。必有發達。好將手藝。建起樓臺。" },
    10: { level: "下吉", ganzhi: "甲癸", story: "冉伯牛染疾 / 孟郊不遇", poem: "病患時時命蹇衰，何須打瓦共鑽龜，直教重見一陽復，始可求神仗佛持。", meaning: "名利無、訟則凶、病危險、宜向善、凡事不可強求。", dongpo: "命運當蹇。萬事遲疑。且宜守舊。不用妄為。直教重見。一陽復初。始可求神。仗佛扶持。" },
    11: { level: "下下", ganzhi: "乙甲", story: "韓信功勞不久 / 孫臏遇龐涓", poem: "今年好事一番新，富貴榮華萃汝身，誰識機關難料處，到頭獨立轉傷神。", meaning: "莫貪求、名未遂、財祿平、訟不利、病者凶、多阻滯。", dongpo: "歷涉艱險。求謀未遂。凡事守舊。方可無虞。若能向善。福祿來宜。莫貪名利。徒爾勞心。" },
    12: { level: "中平", ganzhi: "乙乙", story: "鮑叔牙薦管仲 / 蘇武牧羊", poem: "營為期望在春前，誰料秋來又不然，直遇清江貴公子，一生活計始安全。", meaning: "求名遲、財未至、病有災、訟且息、孕生女、婚不合。", dongpo: "營求未至。且隨緣分。直遇貴人。始得安全。凡事守舊。莫問前程。但存善念。禍不降臨。" },
    13: { level: "中平", ganzhi: "乙丙", story: "姜太公釣魚 / 渭水釣魚", poem: "君今庚甲未亨通，且向江頭作釣翁，玉兔重生應發跡，萬人頭上逞英雄。", meaning: "名阻滯、財平常、訟宜和、病求神、孕生女、宜守舊。", dongpo: "命運未通。且且隨緣。玉兔重生。應有發跡。萬人頭上。逞英雄才。凡事守舊。免致災愆。" },
    14: { level: "下下", ganzhi: "乙丁", story: "郭華戀王月英 / 蘇小妹答詩", poem: "一見佳人便喜歡，誰知去後有多般，人情冷暖君休訝，歷涉應知行路難。", meaning: "名與利、且隨緣、訟不利、病有災、孕生女、事多難。", dongpo: "一見佳人。即便喜歡。誰知去後。有多般難。人情冷暖。君休訝怪。歷涉應知。行路之難。" },
    15: { level: "中平", ganzhi: "乙戊", story: "張君瑞憶鶯鶯 / 王昭君和番", poem: "兩家門戶各相當，不是姻緣莫較量，直待春風好消息，卻調琴瑟向蘭房。", meaning: "名阻滯、財平平、訟宜和、病未安、孕生女、婚可期。", dongpo: "兩家門戶。各自分別。不是姻緣。莫且較量。直待春風。好消息至。卻調琴瑟。向於蘭房。" },
    16: { level: "下下", ganzhi: "乙己", story: "王祥臥冰 / 田氏紫荊再榮", poem: "官事悠悠難辨明，不如息了且歸耕，傍人煽惑君休信，此事當謀親弟兄。", meaning: "訟難明、和為貴、功名無、行人至、婚未成、財莫貪。", dongpo: "官事悠悠。難以辨明。不如息了。且去歸耕。傍人煽惑。君休信之。此事當謀。親兄弟翁。" },
    17: { level: "下下", ganzhi: "乙庚", story: "石崇被難 / 桑榆晚景", poem: "田園價貫好商量，事到公庭彼此傷，縱使機關圖得勝，定為後世子孫殃。", meaning: "事悖理、訟必傷、名未濟、財平常、產勿謀、且謹慎。", dongpo: "田園價貫。且好商量。事到公庭。彼此俱傷。縱使機關。圖得勝時。定為後世。子孫之殃。" },
    18: { level: "中平", ganzhi: "乙辛", story: "孟嘗君招賢 / 王佐斷臂", poem: "知君指擬是空華，底事茫茫未有涯，牢把腳根踏實地，善為善應永無差。", meaning: "名利難、終則有、病禱神、訟勿問、行人遲、事難就。", dongpo: "知君指擬。總是空華。底事茫茫。未有生涯。牢把腳根。踏於實地。善為善應。永無差錯。" },
    19: { level: "上吉", ganzhi: "乙壬", story: "劉智遠得岳氏 / 裴度還帶", poem: "嗟子從來未得時，今年星運頗相宜，營求動作都如意，和合婚姻誕貴兒。", meaning: "作事吉、名利遂、婚姻成、訟得理、孕生男、病即癒。", dongpo: "嗟子從來。未得時運。今年星運。頗相合宜。營求動作。無不遂意。和合婚姻。必誕貴兒。" },
    20: { level: "下下", ganzhi: "乙癸", story: "嚴子陵登釣臺 / 王十朋祭江", poem: "一生心事向誰論，十八灘頭說與君，世事盡從流水去，功名富貴等浮雲。", meaning: "訟終凶、止則宜、名利輕、病擇醫、行人遠、婚遲疑。", dongpo: "一生心事。向誰論說。十八灘頭。備細說與。世事盡從。流水消去。功名富貴。等是浮雲。" },
    21: { level: "下吉", ganzhi: "丙甲", story: "孫龐鬥智結仇 / 邵康節定陰陽", poem: "與君夙昔結成冤，今日相逢那得緣，好把經文多諷誦，祈求戶內保嬋娟。", meaning: "事無成、病禱癒、出不宜、訟有理、求神解、防耗散。", dongpo: "與君夙昔。結成冤仇。今日相逢。那得好緣。好把經文。多多諷誦。祈求戶內。保得嬋娟。" },
    22: { level: "上吉", ganzhi: "丙乙", story: "李太白醉草嚇蠻書 / 皎然和尚", poem: "碧玉池中開白蓮，莊嚴色相自天然，生來骨格超凡俗，正是人間第一仙。", meaning: "訟退、病漸安、名漸成、財漸進、婚可成、行人回。", dongpo: "碧玉池中。開出白蓮。莊嚴色相。本自天然。生來骨格。超於凡俗。正是人間。第一天仙。" },
    23: { level: "下下", ganzhi: "丙丙", story: "吳王愛西施 / 孫策以玉璽借兵", poem: "花開花謝在春風，貴賤窮通百歲中，羨子榮華今已矣，到頭萬事總成空。", meaning: "勿貪求、宜守舊、訟必敗、病危險、婚未成、財莫貪。", dongpo: "花開花謝。在於春風。貴賤窮通。百歲之中。羨子榮華。今已往矣。到頭萬事。總是成空。" },
    24: { level: "中平", ganzhi: "丙丁", story: "張騫誤入斗牛宮 / 郭子儀免冑退紇", poem: "一春萬事苦憂煎，夏裏營求始帖然，更遇秋成冬至後，恰如騎鶴與腰纏。", meaning: "春不吉、夏漸通、秋遂意、冬最隆、病漸安、訟必解。", dongpo: "一春萬事。苦受憂煎。夏裏營求。始得帖然。更遇秋成。冬至之後。恰如騎鶴。與腰纏萬。" },
    25: { level: "中平", ganzhi: "丙戊", story: "唐明皇遊月宮 / 芙蓉仙子", poem: "寅午戍年多阻滯，亥子丑月漸亨嘉，更逢玉兔金雞會，枯木逢春自放花。", meaning: "病求神、訟必解、財必獲、名漸就、婚漸成、孕生男。", dongpo: "寅午戍年。多有阻滯。亥子丑月。漸漸亨嘉。更逢玉兔。金雞會時。枯木逢春。自然放花。" },
    26: { level: "中吉", ganzhi: "丙己", story: "邵堯夫告天 / 桓溫得荊州", poem: "年來豐歉皆天數，自是今年旱較多，與子定期三日內，田疇霑足雨滂沱。", meaning: "謀事先損後遂、病得醫、訟得理、名利難、行人至、婚未成。", dongpo: "年來豐歉。皆是天數。自是今年。旱魃較多。與子定期。三日之內。田疇霑足。雨下滂沱。" },
    27: { level: "下下", ganzhi: "丙庚", story: "江東得道 / 項羽困烏江", poem: "世間萬物各有主，一粒一毫君莫取，英雄豪傑自天生，也須步步循規矩。", meaning: "訟莫興、病審醫、名與利、聽天推、婚未定、行人遲。", dongpo: "世間萬物。各自有主。一粒一毫。君休妄取。英雄豪傑。本自天生。也須步步。循其規矩。" },
    28: { level: "上吉", ganzhi: "丙辛", story: "司馬相如題橋 / 韓信功勞", poem: "公侯將相本無種，好把勤勞契上天，人事盡從天理見，才高豈得困林泉。", meaning: "名與利、且隨緣、訟宜和、病漸安、婚必成、孕生男。", dongpo: "公侯將相。本無種性。好把勤勞。契合金天。人事盡從。天理中見。才高豈得。困於林泉。" },
    29: { level: "上吉", ganzhi: "丙壬", story: "司馬溫公拜相 / 王十朋遇群仙", poem: "祖宗積德幾多年，源遠流長慶自然，若更操修無倦已，天須還汝舊青氈。", meaning: "訟得理、病漸安、名利就、婚可成、行人回。", dongpo: "祖宗積德。幾多年代。源遠流長。吉慶自然。若更操修。無有倦怠。天須還汝。舊時青氈。" },
    30: { level: "中吉", ganzhi: "丙癸", story: "柳毅傳書 / 蔡伯喈不認妻", poem: "奉公謹守莫欺心，自有亨通吉利臨，目下營求且休矣，秋期與子定佳音。", meaning: "訟必解、病漸安、名利就、婚漸成、行人至。", dongpo: "奉公謹守。莫要欺心。自有亨通。吉利降臨。目下營求。且且休矣。待到秋期。定有佳音。" },
    31: { level: "中吉", ganzhi: "丁甲", story: "蘇卿負信 / 達摩面壁", poem: "秋冬作事只尋常，春到門庭漸吉昌，千里信音符遠望，萱堂快樂未渠央。", meaning: "訟漸理、病漸康、財始達、名始彰、行人近、婚姻良。", dongpo: "秋冬作事。只覺尋常。春到門庭。漸漸吉昌。千里信音。符其遠望。萱堂快樂。未有渠央。" },
    32: { level: "下下", ganzhi: "丁乙", story: "周公解夢 / 常何薦馬周", poem: "勞心汨汨竟何歸，疾病兼多是與非，事到頭來渾似夢，何如休要用心機。", meaning: "訟必凶、病有危、名利無、行人遲、婚未成、財莫貪。", dongpo: "勞心汨汨。竟是何歸。疾病兼多。惹起是非。事到頭來。渾然似夢。何如休要。妄用心機。" },
    33: { level: "中平", ganzhi: "丁丙", story: "莊子慕道 / 鮑叔薦管仲", poem: "不分南北與西東，眼底昏昏耳似聾，熟讀黃庭經一卷，不論貴賤與窮通。", meaning: "訟莫爭、病難癒、名利無、行人遲、婚未成、財莫貪。", dongpo: "不分南北。與其西東。眼底昏昏。耳又似聾。熟讀黃庭。經卷一冊。不論貴賤。與其窮通。" },
    34: { level: "中平", ganzhi: "丁丁", story: "蕭何追韓信 / 孫龐鬥智", poem: "春夏纔過秋又冬，紛紛謀慮攪心胸，貴人垂手來相援，休把私心論淡濃。", meaning: "訟必解、病漸安、名利就、婚漸成、行人回、孕生男。", dongpo: "春夏纔過。秋又到冬。紛紛謀慮。攪亂心胸。貴人垂手。來相援救。休把私心。論其淡濃。" },
    35: { level: "下下", ganzhi: "丁戊", story: "王昭君和番 / 蘇東坡貶嶺南", poem: "一山如畫對清江，門裏團圓事事雙，誰料半途分折去，空幃無語對寒窗。", meaning: "訟必凶、病有危、名利無、行人遲、婚未成、財莫貪。", dongpo: "一山如畫。面對清江。門裏團圓。事事成雙。誰料半途。分折而去。空幃無語。對著寒窗。" },
    36: { level: "上吉", ganzhi: "丁己", story: "羅隱求官 / 史思明拒命", poem: "功名富貴自能為，偶著仙鞭莫問伊，萬里鵬程君有分，吳山頂上好鑽龜。", meaning: "名與利、在晚成、訟得理、病漸亨、問遠信、婚可合。", dongpo: "功名富貴。自能有為。偶著仙鞭。休要問伊。萬里鵬程。君自有分。吳山頂上。好去鑽龜。" },
    37: { level: "中平", ganzhi: "丁庚", story: "邵堯夫祝香 / 楚項羽困烏江", poem: "焚香來告復何辭，善惡平分汝自知，屏卻昧公心裏事，出門無礙是通時。", meaning: "訟和吉、病禱神、名利無、行人遲、婚未成、財莫貪。", dongpo: "焚香來告。更有何辭。善惡平分。汝本自知。屏卻昧公。心裏之事。出門無礙。是其通時。" },
    38: { level: "下吉", ganzhi: "丁辛", story: "孟姜女思夫 / 郭華戀王月英", poem: "蛩吟唧唧守孤幃，千里懸懸望信歸，等得榮華公子到，秋冬括括雨霏霏。", meaning: "訟必凶、病有危、名利無、行人遲、婚未成、財莫貪。", dongpo: "蛩吟唧唧。獨守孤幃。千里懸懸。望其信歸。等得榮華。公子來到。秋冬括括。雨下霏霏。" },
    39: { level: "下下", ganzhi: "丁壬", story: "陶淵明賞菊 / 司馬懿占曹操", poem: "北山門下好安居，若問終時慎厥初，堪笑包藏許多事，鱗鴻雖便莫傳書。", meaning: "訟必凶、病有危、名利無、行人遲、婚未成、財莫貪。", dongpo: "北山門下。正好安居。若問終時。慎其厥初。堪笑包藏。許多之事。鱗鴻雖便。莫去傳書。" },
    40: { level: "中平", ganzhi: "丁癸", story: "漢光武陷昆陽 / 漢光武中興", poem: "新來換得好規模，何用隨他步與趨，只聽耳邊消息到，崎嶇歷盡見亨衢。", meaning: "名與利、漸漸成、訟得理、病漸安、婚可合、孕將生。", dongpo: "新來換得。大好規模。何用隨他。舉步與趨。只聽耳邊。好消息到。崎嶇歷盡。始見亨衢。" },
    41: { level: "上吉", ganzhi: "戊甲", story: "劉文龍求官 / 李固言柳汁染衣", poem: "自南自北自東西，欲到天涯誰作梯，遇鼠逢牛三弄笛，好將名姓榜頭題。", meaning: "訟無定、終有遇、病多憂、擇醫癒、信即到、婚終好。", dongpo: "自南自北。自東自西。欲到天涯。誰來作梯。遇鼠逢牛。三弄長笛。好將名姓。榜頭來題。" },
    42: { level: "中吉", ganzhi: "戊乙", story: "董永賣身 / 班定遠投筆從戎", poem: "我曾許汝事和諧，誰料修為汝自乖，但改新圖莫依舊，營謀應得稱心懷。", meaning: "病更醫、訟改圖、名與利、換規模、婚別議、行人遲。", dongpo: "我曾許汝。萬事和諧。誰料修為。汝本自乖。但改新圖。莫依其舊。營謀應得。稱滿心懷。" },
    43: { level: "中吉", ganzhi: "戊丙", story: "玄德公黃鶴樓赴宴 / 薛仁貴回家", poem: "一紙官書火急催，扁舟速下浪如雷，雖然目下多驚險，保汝平安去復回。", meaning: "星辰耗、暗祈保、訟和吉、病且老、求財平、婚難好。", dongpo: "一紙官書。火急來催。扁舟速下。浪湧如雷。雖然目下。多有驚險。保汝平安。去而復回。" },
    44: { level: "中平", ganzhi: "戊丁", story: "王莽篡漢 / 留侯博浪椎沙", poem: "汝是人中最吉人，誤為誤作損精神，堅牢一念酬香願，富貴榮華萃汝身。", meaning: "事多錯、訟且和、病祈禱、財平平、婚未就、行未回。", dongpo: "汝是人中。最吉之人。誤為誤作。枉損精神。堅牢一念。來酬香願。富貴榮華。萃於汝身。" },
    45: { level: "中平", ganzhi: "戊戊", story: "高祖遇丁公 / 夏侯嬰滕公保嬰", poem: "好將心地力耕耘，彼此山頭總是墳，陰地不如心地好，修為到底卻輸君。", meaning: "心既好、地亦美、病即安、訟得理、財勿求、且守己。", dongpo: "好將心地。著力耕耘。彼此山頭。無非是墳。陰地何如。心地更好。修為到底。卻要輸君。" },
    46: { level: "中平", ganzhi: "戊己", story: "孤兒報冤 / 趙五娘尋夫", poem: "君是山中萬戶侯，信知騎馬勝騎牛，今朝馬上看山色，爭似騎牛得自由。", meaning: "名與利、不宜求、訟必凶、休興起、病有險、婚難定。", dongpo: "君是山中。萬戶之侯。信知騎馬。定勝騎牛。今朝馬上。來看山色。爭似騎牛。落得自由。" },
    47: { level: "中平", ganzhi: "戊庚", story: "楚漢爭鋒 / 高妙觀對弈", poem: "與君萬語復千言，祗欲平和雪爾冤，訟則終凶君記取，試於清夜把心捫。", meaning: "訟莫興、和為貴、名與利、且守己、病祈禱、婚未定。", dongpo: "與君萬語。復其千言。祗欲平和。雪卻爾冤。訟則終凶。君宜記取。試於清夜。捫心細思。" },
    48: { level: "中平", ganzhi: "戊辛", story: "趙五娘尋夫 / 竇禹鈞折桂", poem: "登山涉水正天寒，兄弟姻親那得安，幸遇虎頭人一喚，全家遂保汝重歡。", meaning: "財且守、名未遂、訟宜和、病有畏、婚未成、行未至。", dongpo: "登山涉水。正遇天寒。兄弟姻親。那得平安。幸遇虎頭。大聲一喚。全家遂保。重結交歡。" },
    49: { level: "下下", ganzhi: "戊壬", story: "張子房遁跡 / 孟賁舉鼎", poem: "彼此家居只一山，如何似隔鬼門關，日月如梭人易老，許多勞碌不如閑。", meaning: "名與利、且隨緣、訟有險、病祈保、婚未成、行未回。", dongpo: "彼此家居。同在一山。如何似隔。鬼門之關。日月如梭。人極易老。許多勞碌。不如安閑。" },
    50: { level: "上吉", ganzhi: "戊癸", story: "蘇東坡勸民 / 蘇武牧羊", poem: "人說今年勝舊年，也須步多要周旋，一家和氣多生福，萋菲讒言莫聽偏。", meaning: "名利就、訟得理、病即安、婚必合、行人回、孕生男。", dongpo: "人說今年。勝於舊年。也須步步。處處周旋。一家和氣。多生百福。萋菲讒言。休要聽偏。" },
    51: { level: "上吉", ganzhi: "己甲", story: "御溝流紅葉 / 韓夫人指路", poem: "君今百事且隨緣，水到渠成聽自然，莫嘆年來不如意，喜逢新運稱心田。", meaning: "名漸顯、訟漸寬、財自裕、病自安、行有信、婚可定。", dongpo: "君今百事。且且隨緣。水到渠成。聽其自然。莫嘆年來。多不如意。喜逢新運。稱滿心田。" },
    52: { level: "上吉", ganzhi: "己乙", story: "匡衡夜讀書 / 晉文公復國", poem: "兀坐幽居歎寂寥，孤燈掩映度清宵，黃金忽報秋光好，活計扁舟渡北朝。", meaning: "名晚成、利遲得、病漸安、訟終息、孕無驚、婚姻吉。", dongpo: "兀坐幽居。獨歎寂寥。孤燈掩映。度過清宵。黃金忽報。秋來光好。活計扁舟。好渡北朝。" },
    53: { level: "中平", ganzhi: "己丙", story: "劉備招親 / 莊子慕道", poem: "艱難險阻路蹊蹺，南鳥孤飛依北巢，今日貴人曾識面，相逢卻在夏秋交。", meaning: "病審醫、訟宜和、名與利、必有阻、婚未定、行未至。", dongpo: "艱難險阻。其路蹊蹺。南鳥孤飛。依於北巢。今日貴人。曾經識面。相逢卻在。夏秋之交。" },
    54: { level: "中平", ganzhi: "己丁", story: "蘇秦刺股 / 蘇秦十上書", poem: "萬人叢裏逞英豪，便欲飛騰霄漢高，爭奈承流風未便，青燈黃卷且勤勞。", meaning: "財未遂、名未超、訟不宜、病未消、婚難信、行路迢。", dongpo: "萬人叢裏。逞其英豪。便欲飛騰。上霄漢高。爭奈承流。好風未便。青燈黃卷。且去勤勞。" },
    55: { level: "中平", ganzhi: "己戊", story: "包龍圖勸農 / 周武王登位", poem: "勤耕力作莫蹉跎，衣食隨時安分過，縱使經商收倍利，不如逐歲廩禾多。", meaning: "名與利、且隨緣、訟宜和、病祈禱、婚未成、行未至。", dongpo: "勤耕力作。莫要蹉跎。衣食隨時。安分度過。縱使經商。收得倍利。不如逐歲。廩禾為多。" },
    56: { level: "下下", ganzhi: "己己", story: "王樞密奸險 / 范少伯泛舟", poem: "心頭理曲強詞遮，直欲欺官行路斜，一旦醜形臨月鏡，身投憲網莫咨嗟。", meaning: "事悖理、訟必凶、名與利、皆落空、病有危、婚未成。", dongpo: "心頭理曲。強以詞遮。直欲欺官。行路歪斜。一旦醜形。臨於月鏡。身投憲網。休莫咨嗟。" },
    57: { level: "中平", ganzhi: "己庚", story: "爛柯觀棋 / 董仲舒學道", poem: "事端百出慮雖長，莫聽人言自主張，一著仙機君記取，紛紛鬧裏更思量。", meaning: "訟必解、病祈禱、名與利、且隨緣、婚未定、行未回。", dongpo: "事端百出。遠慮雖長。莫聽人言。自作主張。一著仙機。君須記取。紛紛鬧裏。更細思量。" },
    58: { level: "上吉", ganzhi: "己辛", story: "蘇秦背劍 / 文王問太公", poem: "蘇秦三寸足平生，富貴功名在此行，更好修為陰騭事，前程萬里自通亨。", meaning: "名與利、必有成、訟得理、病漸安、婚可合、孕生男。", dongpo: "蘇秦三寸。已足平生。富貴功名。即在此行。更好修為。陰騭之事。前程萬里。自然通亨。" },
    59: { level: "中平", ganzhi: "己壬", story: "鄧伯道無兒 / 鄧攸避難", poem: "門衰戶冷苦伶仃，自嘆祈求不一靈，幸有祖宗陰騭在，香煙未斷續螟蛉。", meaning: "名難保、財難圖、訟不利、病無虞、婚可合、信音無。", dongpo: "門衰戶冷。孤苦伶仃。自嘆祈求。不獲一靈。幸有祖宗。陰騭尚在。香煙未斷。可續螟蛉。" },
    60: { level: "上上", ganzhi: "己癸", story: "宋郊兄弟同科考 / 郊祈拜將", poem: "羨君兄弟好名聲，只管謙撝莫自矜，丹詔槐黃相逼近，巍巍科甲兩同登。", meaning: "訟得理、病即安、名與利、皆成就、婚必合、行人至。", dongpo: "羨君兄弟。大好名聲。只管謙撝。莫去自矜。丹詔槐黃。互相逼近。巍巍科甲。兩位同登。" },
    61: { level: "中平", ganzhi: "庚甲", story: "蒯徹見韓信 / 祭遵逢光武", poem: "嘯聚山林兇惡儔，善良無事苦煎憂，主人大笑出門去，不用干戈盜賊休。", meaning: "財平平、病漸效、訟自散、莫與較、遠行歸、婚亦宜。", dongpo: "嘯聚山林。兇惡之儔。善良無事。橫受煎憂。主人大笑。出得門去。不用干戈。盜賊自休。" },
    62: { level: "中平", ganzhi: "庚乙", story: "韓信戰霸王 / 項羽困烏江", poem: "百千人面虎狼心，賴汝干戈用力深，得勝回時秋漸老，虎頭城裏喜相尋。", meaning: "訟必勝、財必豐、病有險、救則從、婚不合、行未逢。", dongpo: "百千人面。盡虎狼心。賴汝干戈。用力極深。得勝回時。秋已漸老。虎頭城裏。皆喜相尋。" },
    63: { level: "中平", ganzhi: "庚丙", story: "楊令公撞李陵碑 / 鐵拐李達道", poem: "曩時敗北且圖南，筋力雖衰尚一堪，欲識生前君大數，前三三與後三三。", meaning: "病可醫、訟中平、財尋常、信有期、名未就、婚可許。", dongpo: "曩時敗北。且去圖南。筋力雖衰。尚可一堪。欲識生前。君之大數。前有三三。後有三三。" },
    64: { level: "上上", ganzhi: "庚丁", story: "管鮑分金 / 魯仲連排難解紛", poem: "吉人相遇本和同，況有持謀天水翁，人力不勞公論協，事成功倍笑談中。", meaning: "名能成、病可療、財有餘、婚亦好、訟即了、問信音到。", dongpo: "吉人相遇。本自和同。況有持謀。天水老翁。人力不勞。公論允協。事成功倍。盡笑談中。" },
    65: { level: "上上", ganzhi: "庚戊", story: "蒙正木蘭和詩 / 越王謀復國", poem: "朔風凜凜正窮冬，漸覺門庭喜氣濃，更入新春人事後，衷言方得信先容。", meaning: "財多得、名高中、可問婚、亦宜訟、病即安、行人動。", dongpo: "朔風凜凜。正遇窮冬。漸覺門庭。喜氣甚濃。更入新春。人事之後。衷言方得。信有先容。" },
    66: { level: "上上", ganzhi: "庚己", story: "杜甫遊春 / 諸葛隱南陽", poem: "耕耘只可在鄉邦，何用求謀向外方，見說今年新運好，門闌喜氣事雙雙。", meaning: "病即安、訟即決、財漸豐、名高揭、行人回、婚可結。", dongpo: "耕耘只可。在於鄉邦。何用求謀。向外遠方。見說今年。大好新運。門闌喜氣。萬事雙雙。" },
    67: { level: "中平", ganzhi: "庚庚", story: "江遺囑兒 / 李泌辭官", poem: "纔發君心天已知，何須問我決狐疑，願子改圖從孝悌，不愁家室不相宜。", meaning: "訟和吉、病禱神、財平平、名未遂、婚可合、求自濟。", dongpo: "纔發君心。蒼天已知。何須問我。決斷狐疑。願子改圖。一從孝悌。不愁家室。有不相宜。" },
    68: { level: "中平", ganzhi: "庚辛", story: "錢大王販鹽 / 呂望相周", poem: "南販珍珠北買緜，年來生意兩俱全，交春方有平平望，夏月營求得厚錢。", meaning: "訟和吉、病漸安、財平平、名未遂、婚可合、有阻滯。", dongpo: "南販珍珠。北去買緜。年來生意。兩得俱全。交春方有。平平之望。夏月營求。賺得厚錢。" },
    69: { level: "下下", ganzhi: "庚壬", story: "孫龐鬥智 / 楚霸王自刎", poem: "捨舟遵路總相宜，慎勿交枝與結枝，爭奈此身多繫絆，事須重結必生悲。", meaning: "訟且和、病多凶、名與利、皆皆空、婚不合、路未通。", dongpo: "捨舟遵路。總屬相宜。慎勿交枝。與其結枝。爭奈此身。多有繫絆。事須重結。必定生悲。" },
    70: { level: "中平", ganzhi: "庚癸", story: "王曾祈禱 / 戴伯通遇神", poem: "雷雨風雲各有司，至誠禱告莫生疑，與君定卻為霖日，正是蘊隆中伏時。", meaning: "訟與病、漸可解、名與利、姑少待、婚宜遲、行未回。", dongpo: "雷雨風雲。各自有司。至誠禱告。莫去生疑。與君定卻。為甘霖日。正是蘊隆。中伏之時。" },
    71: { level: "中平", ganzhi: "辛甲", story: "蘇武還鄉 / 丁蘭刻木", poem: "喜鵲簷前報好音，知君千里欲歸心，繡幃重結鴛鴦帶，葉落霜飛寒色侵。", meaning: "訟宜和、名漸顯、婚再合、病有險、求財難、秋冬吉。", dongpo: "喜鵲簷前。報出好音。知君千里。欲有歸心。繡幃重結。交鴛鴦帶。葉落霜飛。寒冷色侵。" },
    72: { level: "下下", ganzhi: "辛乙", story: "范蠡歸湖 / 荀息勸晉武", poem: "河渠傍路有高低，可歎長途日已西，縱有榮華好時節，直須猴犬換金雞。", meaning: "訟莫興、病多險、名與利、皆未顯、婚且待、且守己。", dongpo: "河渠傍路。多有高低。可歎長途。日已偏西。縱有榮華。大好時節。直須猴犬。換得金雞。" },
    73: { level: "下吉", ganzhi: "辛丙", story: "王昭君憶漢帝 / 齊國張奉怨", poem: "憶昔蘭房分半釵，而今忽把信音乖，癡心指望成連理，到底誰知事不諧。", meaning: "訟宜和、病且醫、名與利、皆虛脾、婚不合、且待時。", dongpo: "憶昔蘭房。分折半釵。而今忽把。好信音乖。癡心指望。得成連理。到底誰知。事竟不諧。" },
    74: { level: "上吉", ganzhi: "辛丁", story: "崔武求官 / 竇禹鈞折桂", poem: "崔巍崔巍復崔巍，履險如夷去復來，身似菩提心似鏡，長安一道放春回。", meaning: "訟與病、險而平、名與利、得而盈、婚必合、孕生男。", dongpo: "崔巍崔巍。復復崔巍。履險如夷。去而復來。身似菩提。心清似鏡。長安一道。任放春回。" },
    75: { level: "中吉", ganzhi: "辛戊", story: "劉小姐愛蒙正 / 丁蘭尋父", poem: "生前結得好緣姻，一笑相逢情自親，相當人物無高下，得意休論富與貧。", meaning: "財平平、病漸痊、訟和吉、婚亦然、名漸遂、防後患。", dongpo: "生前結得。大好緣姻。一笑相逢。情分自親。相當人物。原無高下。得意休論。是富與貧。" },
    76: { level: "中平", ganzhi: "辛己", story: "蕭何註律 / 孫臏被害", poem: "三千法律八千文，此事如何說與君，善惡兩途君自作，一生禍福此中分。", meaning: "訟和吉、病禱神、名與利、在修為、婚可定、福自來。", dongpo: "三千法律。八千條文。此事如何。盡說與君。善惡兩途。君本自作。一生禍福。即此中分。" },
    77: { level: "下下", ganzhi: "辛庚", story: "呂后害韓信 / 楚漢爭鋒", poem: "木有根荄水有源，君當認祖理知恩，因何切木圖刀鋸，惹得官災與禍門。", meaning: "訟必凶、病有危、名與利、皆無望、婚不合、事多危。", dongpo: "木有根荄。水有其源。君當認祖。理宜知恩。因何切木。反圖刀鋸。惹得官災。與其禍門。" },
    78: { level: "下下", ganzhi: "辛辛", story: "袁安守困 / 石崇被害", poem: "家道豐盈楚客多，撞鐘擊鼓出奇歌，秋來未必相逢節，更把心腸細揣摩。", meaning: "訟必凶、病有危、名與利、皆難求、婚不合、且守己。", dongpo: "家道豐盈。其楚客多。撞鐘擊鼓。唱出奇歌。秋來未必。相逢佳節。更把心腸。細細揣摩。" },
    79: { level: "中平", ganzhi: "辛壬", story: "宋神宗誤圩牛頭山", poem: "乾亥來龍仔細看，坎居午向自當安，若移丑艮陰陽逆，門戶凋零家道難。", meaning: "名與利、依理求、婚與訟、莫妄謀、病擇醫、方無憂。", dongpo: "乾亥來龍。仔細觀看。坎居午向。自當平安。若移丑艮。陰陽倒逆。門戶凋零。家道維難。" },
    80: { level: "中平", ganzhi: "辛癸", story: "陶侃卜牛眠 / 郭璞為母卜葬", poem: "一朝無事忽遭官，也是門衰墳未安，改換陰陽移禍福，勸君莫作等閒看。", meaning: "名與利、宜改圖、訟和解、保無虞、病更醫、婚別配。", dongpo: "一朝無事。忽遇遭官。也是門衰。祖墳未安。改換陰陽。移其禍福。勸君莫作。等閒來看。" },
    81: { level: "中平", ganzhi: "壬甲", story: "寇公任雷陽 / 假借行裝作賈客", poem: "假君財物自當還，謀賴心欺他自奸，幸有高臺明月鏡，請來對照破機關。", meaning: "訟宜和、病祈禱、求財無、婚未成、信未至、守舊吉。", dongpo: "假君財物。自當清還。謀賴心欺。他本自奸。幸有高臺。明月之鏡。請來對照。看破機關。" },
    82: { level: "上吉", ganzhi: "壬乙", story: "宋仁宗認母 / 陶母截髮留賓", poem: "彼亦儔中一輩賢，勸君特達與周旋，此時賓主歡相會，他日王侯卻並肩。", meaning: "訟退、病漸安、名漸成、財漸進、婚可成、行人回。", dongpo: "彼亦儔中。一輩之賢。勸君特達。與之周旋。此時賓主。兩歡相會。他日王侯。卻可並肩。" },
    83: { level: "下平", ganzhi: "壬丙", story: "諸葛孔明學道 / 邵君平卜肆垂簾", poem: "隨分堂前赴粥饘，何須妄想苦憂煎，主張門戶誠難事，百歲安閒得幾年。", meaning: "名與利、莫貪求、訟宜和、行未至、病瘥遲、婚莫議。", dongpo: "隨分堂前。赴其粥饘。何須妄想。苦受憂煎。主張門戶。誠為難事。百歲安閒。賺得幾年。" },
    84: { level: "中平", ganzhi: "壬丁", story: "須賈害范睢 / 李廣不封侯", poem: "箇中事緒更紛然，當局須知一著先，長舌婦人休酷聽，力行好事保蒼天。", meaning: "訟宜解、病擇醫、名莫貪、財平常、婚宜慎、行即還。", dongpo: "箇中事緒。更多紛然。當局須知。一著之先。長舌婦人。休去酷聽。力行好事。可保蒼天。" },
    85: { level: "中平", ganzhi: "壬戊", story: "姜女尋夫 / 蘇東坡貶嶺南", poem: "一春風雨正瀟瀟，千里行人去路遙，移寡就多君得計，如何歸路轉無聊。", meaning: "且隨分、莫貪財、訟宜息、防外災、婚不利、遠行回。", dongpo: "一春風雨。下正瀟瀟。千里行人。去路迢遙。移寡就多。君方得計。如何歸路。反轉無聊。" },
    86: { level: "上上", ganzhi: "壬己", story: "管鮑為賈", poem: "一舟行貨好招邀，積少成多自富饒，常把他人比自己，管須日後勝今朝。", meaning: "財祿富、訟得理、婚和合、病漸止、問行人、莫害人。", dongpo: "一舟行貨。大好招邀。積少成多。自然富饒。常把他人。比之自己。管須日後。定勝今朝。" },
    87: { level: "下下", ganzhi: "壬庚", story: "武侯與子敬同舟", poem: "陰裏詳看怪爾曹，舟中敵國笑中刀，藩籬剖破渾無事，一種天生惜羽毛。", meaning: "名利無、病有祟、訟莫興、和為貴、莫貪財、婚不利。", dongpo: "陰裏詳看。怪爾之曹。舟中敵國。藏笑中刀。藩籬剖破。渾然無事。一種天生。極惜羽毛。" },
    88: { level: "上吉", ganzhi: "壬辛", story: "高文定守困 / 周廟觀欹器", poem: "從前作事總徒勞，纔見新春時漸遭，百計營求都得意，更須守己莫心高。", meaning: "名與利、且隨緣、訟解釋、病安痊、婚姻合、行人還。", dongpo: "從前作事。總是徒勞。纔見新春。時運漸遭。百計營求。盡都得意。更須守己。莫妄心高。" },
    89: { level: "中平", ganzhi: "壬壬", story: "班超歸玉門關 / 寧戚飯牛", poem: "樽前無事且高歌，時未來時奈若何，白馬渡江嘶日暮，虎頭城裏看巍峨。", meaning: "名晚遇、財尚遲、病徐癒、行漸歸、訟可解、婚和合。", dongpo: "樽前無事。且去高歌。時未來時。將奈若何。白馬渡江。輕嘶日暮。虎頭城裏。來看巍峨。" },
    90: { level: "中平", ganzhi: "壬癸", story: "楊文廣陷柳州", poem: "崆峒城裏事如麻，無事如君有幾家，勸汝不須勤致禱，徒勞生事苦咨嗟。", meaning: "訟和吉、求財無、婚未成、病無虞、信未至、不須禱。", dongpo: "崆峒城裏。其事如麻。無事如君。能有幾家。勸汝不須。殷勤致禱。徒勞生事。空苦咨嗟。" },
    91: { level: "中吉", ganzhi: "癸甲", story: "趙子龍抱太子", poem: "佛說淘沙始見金，只緣君子不勞心，榮華總得詩書效，妙裏工夫仔細尋。", meaning: "求名利、勤苦有、訟須勞、終無咎、問婚姻、宜擇偶。", dongpo: "佛說淘沙。始見黃金。只緣君子。原不勞心。榮華總得。詩書之效。妙裏工夫。仔細去尋。" },
    92: { level: "下吉", ganzhi: "癸乙", story: "高祖治漢民", poem: "今年禾穀不如前，物價喧騰倍百年，災數流行多疫癘，一陽復後始安全。", meaning: "訟紛紜、久自解、病患多、終無害、財祿難、有且待。", dongpo: "今年禾穀。遠不如前。物價喧騰。已倍百年。災數流行。多染疫癘。一陽復後。始得安全。" },
    93: { level: "中平", ganzhi: "癸丙", story: "邵康節定陰陽", poem: "春來雨水太連綿，入夏晴乾雨又愆，節氣直交三伏始，喜逢滂沛足田園。", meaning: "謀望阻、後必康、訟反覆、久方決、問病安、婚可定。", dongpo: "春來雨水。太過連綿。入夏晴乾。甘雨又愆。節氣直交。三伏開始。喜逢滂沛。沾足田園。" },
    94: { level: "中平", ganzhi: "癸丁", story: "提結過長者門 / 天隨子召拜拾遺", poem: "一般器用與人同，巧斵輪輿梓匠工，凡事有緣且隨分，秋冬方遇主人翁。", meaning: "遇貴人、訟得理、財尚遲、病未癒、婚未成、待秋冬。", dongpo: "一般器用。本與人同。巧斵輪輿。好梓匠工。凡事有緣。且且隨分。秋冬方遇。好主人翁。" },
    95: { level: "中平", ganzhi: "癸戊", story: "張文遠求官", poem: "知君袖內有驪珠，生不逢辰亦強圖，可歎頭顱已如許，而今方得貴人扶。", meaning: "財發遲、訟終折、名晚成、婚未決、遇貴人、災撲滅。", dongpo: "知君袖內。懷有驪珠。生不逢辰。亦妄強圖。可歎頭顱。年已如許。而今方得。遇貴人扶。" },
    96: { level: "上吉", ganzhi: "癸己", story: "山濤見王衍 / 于公高大門閭", poem: "婚姻子息莫嫌遲，但把精神仗佛持，四十年前須報應，功圓行滿育馨兒。", meaning: "名利訟、遲方吉、病漸瘥、婚姻結、得子息、咸無慮。", dongpo: "婚姻子息。君莫嫌遲。但把精神。全仗佛持。四十年前。必須報應。功圓行滿。孕育馨兒。" },
    97: { level: "上上", ganzhi: "癸庚", story: "買臣五十富貴 / 公孫宏白衣三公", poem: "五十功名心已灰，那知富貴逼人來，更行好事存方寸，壽比岡陵位鼎台。", meaning: "訟即解、名可成、財漸聚、病且寧、孕生子、事稱情。", dongpo: "五十功名。其心已灰。那知富貴。逼著人來。更行好事。存於方寸。壽比岡陵。榮位鼎台。" },
    98: { level: "中平", ganzhi: "癸辛", story: "薛仁貴投軍 / 張騫泛牛斗", poem: "經營百出費精神，南北奔馳運未新，玉兔交時當得意，恰如枯木再逢春。", meaning: "名利有、晚方成、訟與病、久方平、孕生子、遇卯亨。", dongpo: "經營百出。枉費精神。南北奔馳。時運未新。玉兔交時。君當得意。恰如枯木。又再逢春。" },
    99: { level: "上上", ganzhi: "癸壬", story: "百里奚投秦", poem: "貴人遭遇水雲鄉，冷淡交情滋味長，黃閣開時延故客，驊騮應得驟康莊。", meaning: "家宅安、風水利、名與利、皆快便、婚可成、病安全。", dongpo: "貴人遭遇。在水雲鄉。冷淡交情。其滋味長。黃閣開時。延接故客。驊騮應得。馳驟康莊。" },
    100: { level: "上上", ganzhi: "癸癸", story: "唐明宗禱告天 / 趙開道焚香告天", poem: "我本天仙雷雨師，吉凶禍福我先知，至誠禱告皆靈驗，抽得終籤百事宜。", meaning: "百事遂、前通達、訟有理、婚必合、病全安、凡事吉。", dongpo: "我本天仙。稱雷雨師。吉凶禍福。我本先知。至誠禱告。無不靈驗。抽得終籤。百事皆宜。" }
};

// ==========================================
// 2. 註冊系統 (讓系統選單能抓到它)
// ==========================================
window.poemSystems = window.poemSystems || {}; // 確保物件存在
poemSystems['Leiyushi_100'] = {
    id: 'Leiyushi_100',
    name: '雷雨師一百籤',
    total: 100,
    format: 'leiyushi', // ★ 這裡指定了它要用 leiyushi 版型
    category: 'leiyushi',
    isBase: true, // ★ 修正 1：必須是大寫的 B
    content: lotsLeiyushi_100
};

// ==========================================
// 3. 雷雨師專屬版型引擎
// ==========================================
window.customPoemTemplates = window.customPoemTemplates || {};

window.customPoemTemplates['leiyushi'] = function (poem, cleanLotNum, templeName, deity, customData) {
    if (!poem) {
        return `<div class="fortune-slip" style="padding:30px; text-align:center; color:#888;">第 ${cleanLotNum} 籤資料建置中...</div>`;
    }

    const cnNums = ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
    const getCn = n => { if (n == 100) return "一百"; if (n == 101) return "一〇一"; if (n < 10) return cnNums[n]; if (n < 20) return "十" + (n % 10 ? cnNums[n % 10] : ""); return cnNums[Math.floor(n / 10)] + "十" + (n % 10 ? cnNums[n % 10] : ""); };

    // 1. 讀取新版資料結構
    let levelName = poem.level || "";
    let ganzhi = poem.ganzhi || "";
    let story = poem.story || "";
    let meaning = poem.meaning || "";
    let dongpo = poem.dongpo || "";

    // 兼容舊資料格式 (防呆)
    if (!levelName && poem.level && poem.level.includes('(')) {
        let matchLevel = poem.level.match(/(.+?)\s*\((.+?)\)/);
        if (matchLevel) {
            levelName = matchLevel[1];
            ganzhi = matchLevel[2];
        }
    }
    if (!story && poem.interpretation) {
        let matchStory = poem.interpretation.match(/【典故】(.*?)\n/);
        if (matchStory) story = matchStory[1];
        let matchMeaning = poem.interpretation.match(/【聖意】(.*)/);
        if (matchMeaning) meaning = matchMeaning[1];
    }

    // 將典故中的 / 替換為全形直排線 ｜
    let formattedStory = story.replace(/\s*\/\s*/g, '｜');

    // 將詩句解開 
    let pLines = [poem.l1 || '', poem.l2 || '', poem.l3 || '', poem.l4 || ''];
    if (poem.poem) {
        let p = poem.poem.replace(/。/g, '').split(/[，,]/);
        pLines = [p[0] || '', p[1] || '', p[2] || '', p[3] || ''];
    }
    const lines = (customData && customData.l1) ? [customData.l1, customData.l2, customData.l3, customData.l4] :
        (deity && deity.l1) ? [deity.l1, deity.l2, deity.l3, deity.l4] : pLines;

    // ★ 魔法：安全讀取使用者設定的排版方向 (預設為 vertical 直書)
    let currentSettings = {};
    try { currentSettings = JSON.parse(localStorage.getItem('zb_settings')) || {}; } catch (e) { }
    let layoutMode = currentSettings.intentLayout || 'vertical';

    let interpretationHTML = "";

    // 從資料庫提取聖意與東坡解，並將「、」和原有的換行都替換為 <br> 標籤
    // 提取資料後，先消滅「最結尾的句號」，再將「、」與換行轉成 <br>
    let meaningText = poem.meaning ? poem.meaning.replace(/。[\s\n]*$/, '').replace(/、/g, '<br>').replace(/\n/g, '<br>') : "";
    let dongpoText = poem.dongpo ? poem.dongpo.replace(/。[\s\n]*$/, '').replace(/。/g, '<br>').replace(/\n/g, '<br>') : "";

    if (layoutMode === 'vertical') {
        // 各佔一列直排，標準 vertical-rl 排列
        interpretationHTML = `
                <div style="display: flex; flex-direction: column; width: 100%; border-top: 2px solid #8b0000; padding-top: 1.5cqw; box-sizing: border-box;">
                    
                    ${meaningText ? `
                    <div style="display: flex; flex-direction: row-reverse; margin-bottom: 2cqw; border-bottom: 1px dashed #8b0000; padding-bottom: 2cqw;">
                        <div style="writing-mode: vertical-rl; text-orientation: upright; font-size: 4.8cqw; font-weight: bold; color: #8b0000; margin-left: 1.5cqw; flex-shrink: 0;">【聖意】</div>
                        <div style="writing-mode: vertical-rl; text-orientation: upright; font-size: 4cqw; line-height: 1.5; text-align: left;">${meaningText}</div>
                    </div>
                    ` : ''}

                    ${dongpoText ? `
                    <div style="display: flex; flex-direction: row-reverse;">
                        <div style="writing-mode: vertical-rl; text-orientation: upright; font-size: 4.8cqw; font-weight: bold; color: #8b0000; margin-left: 1.5cqw; flex-shrink: 0;">【東坡解】</div>
                        <div style="writing-mode: vertical-rl; text-orientation: upright; font-size: 4cqw; line-height: 1.5; text-align: left;">${dongpoText}</div>
                    </div>
                    ` : ''}
                    
                </div>
            `;
    } else {
        // ------------------------------------
        // 模式 B：現代橫書排列 (手機易讀)
        // ------------------------------------
        interpretationHTML = `
                <div style="display: flex; flex-direction: column; width: 100%; flex: 1; overflow-y: auto; text-align: left; padding-top: 5px;">
                    ${meaning ? `
                    <div style="margin-bottom: 8px;">
                        <span style="font-size: 4.5cqw; font-weight: bold; color: #8b0000; background: rgba(139,0,0,0.1); padding: 2px 6px; border-radius: 4px;">【聖意】</span>
                        <div style="font-size: 4.2cqw; color: #111; font-weight: bold; line-height: 1.6; margin-top: 6px;">${meaning.replace(/\n/g, '<br>')}</div>
                    </div>
                    ` : ''}
                    ${dongpo ? `
                    <div>
                        <span style="font-size: 4.5cqw; font-weight: bold; color: #8b0000; background: rgba(139,0,0,0.1); padding: 2px 6px; border-radius: 4px;">【東坡解】</span>
                        <div style="font-size: 4cqw; color: #444; font-weight: bold; line-height: 1.6; margin-top: 6px;">${dongpo.replace(/\n/g, '<br>')}</div>
                    </div>
                    ` : ''}
                </div>
            `;
    }

    // 下面的基本變數不用動
    let numValue = Number(cleanLotNum);
    let displayLotNum = `第${getCn(numValue)}籤`;
    if (numValue === 101) displayLotNum = "籤首";
    if (numValue === 102) displayLotNum = "籤尾";

    let actualTempleName = templeName;
    if (actualTempleName.includes("雷雨師") || actualTempleName.includes("含首尾")) {
        if (numValue >= 1 && numValue <= 100) actualTempleName = "雷雨師一百籤";
        else if (numValue === 101 || numValue === 102) actualTempleName = "";
    }

    let revDisplayLotNum = displayLotNum.split('').reverse().join('');
    let hasSideCol = levelName || ganzhi || story;

    return `
            <div class="fortune-slip leiyushi" style="aspect-ratio: 100 / 155 !important; margin: 0; width: 100%; padding: 2% 3%; background-color: #fdfbf7;">
                <div class="slip-inner-border" style="display: flex; flex-direction: column; border: 3px solid #8b0000; height: 100%; padding: 2cqw; box-sizing: border-box;">        
                    <div style="text-align: center; border-bottom: 2px solid #8b0000; padding-bottom: 1.5cqw; margin-bottom: 1.5cqw;">
                        <div style="font-size: 7.5cqw; font-weight: bold; letter-spacing: 0.2em; color: #8b0000; direction: rtl; unicode-bidi: bidi-override;">${actualTempleName}</div>
                        <div style="font-size: 6cqw; font-weight: bold; margin-top: 1cqw; letter-spacing: 0.5em; color: #111;">${revDisplayLotNum}</div>
                    </div>      
                    <div style="display: flex; flex-direction: row-reverse; border-bottom: ${(meaning || dongpo) ? '2px solid #8b0000' : 'none'}; padding-bottom: 1.5cqw; margin-bottom: 1.5cqw;">
                        ${hasSideCol ? `
                        <div style="width: 32%; border-left: 1px dashed #8b0000; display: flex; flex-direction: row-reverse; padding-left: 1.5cqw; overflow: hidden;">
                            <div style="writing-mode: vertical-rl; text-orientation: upright; font-size: 5.5cqw; font-weight: bold; color: #111; display: flex; align-items: center; justify-content: flex-start;">
                                ${levelName ? `<span style="border: 2px solid #8b0000; color: #8b0000; padding: 0.5cqw; border-radius: 4px; margin-bottom: 1.5cqw;">${levelName}</span>` : ''}
                                ${ganzhi ? `<span style="letter-spacing: 0.2em;">${ganzhi}</span>` : ''}
                            </div>
                            <div style="writing-mode: vertical-rl; text-orientation: upright; font-size: 4.5cqw; line-height: 1.6; color: #333; margin-right: 1.5cqw;">
                                ${formattedStory ? `<span style="font-weight: bold; background: #8b0000; color: #fff; padding: 0.5cqw 0;">典故</span><br>${formattedStory}` : ''}
                            </div>
                        </div>
                        ` : ''}
                        <div style="width: ${hasSideCol ? '68%' : '100%'}; display: flex; flex-direction: row-reverse; justify-content: space-evenly; align-items: center; padding-right: 1cqw;">
                            <div style="writing-mode: vertical-rl; text-orientation: upright; font-size: ${hasSideCol ? '7.5cqw' : '10cqw'}; font-weight: bold; letter-spacing: 0.8cqw; color: #222;">${lines[0] || ''}</div>
                            <div style="writing-mode: vertical-rl; text-orientation: upright; font-size: ${hasSideCol ? '7.5cqw' : '10cqw'}; font-weight: bold; letter-spacing: 0.8cqw; color: #222;">${lines[1] || ''}</div>
                            <div style="writing-mode: vertical-rl; text-orientation: upright; font-size: ${hasSideCol ? '7.5cqw' : '10cqw'}; font-weight: bold; letter-spacing: 0.8cqw; color: #222;">${lines[2] || ''}</div>
                            <div style="writing-mode: vertical-rl; text-orientation: upright; font-size: ${hasSideCol ? '7.5cqw' : '10cqw'}; font-weight: bold; letter-spacing: 0.8cqw; color: #222;">${lines[3] || ''}</div>
                        </div>
                    </div>

                    ${interpretationHTML}
                </div>
            </div>
        `;
};