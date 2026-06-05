// ==========================================
// 終極擴充包：雷雨師系統與專屬神明
// ==========================================
// 確保全域變數存在 (防呆機制)
window.poemSystems = window.poemSystems || {};
window.customPoemTemplates = window.customPoemTemplates || {};

// ==========================================
// ★ 新增：南投魚池鄉啟示玄機院 - 諸葛孔明神卦 32 首
// ==========================================
const lotsKongming_32 = [
    { lot: 1, level: "第一卦 星震卦", l1: "彩鳳呈祥瑞", l2: "麒麟降帝都", l3: "禍去迎福至", l4: "喜氣映門楣", intents: [{ type: "歲運", text: "得天之助，社會之支持，福德充滿幸運之象，凡事能積極進行則更佳。" }, { type: "經商", text: "物質豐富，收入在預算之上，無意收回之金項，亦會收回。" }, { type: "工作", text: "工作經商，皆能順遂，若就業則將得上司賞識，地位漸次高升，如從事經商，則生意興隆，商譽日增。" }, { type: "求職", text: "所期待之職業，可望達成。" }, { type: "升學", text: "升學考試，可望名登金榜。" }, { type: "婚姻", text: "相親時，雙方意合時，快為佳，時間不可拖延，半年內結婚較為美滿。" }, { type: "遷居", text: "購新居或遷房屋皆無妨。" }, { type: "旅遊", text: "外出旅行，樣樣可稱心。" }, { type: "疾病", text: "玉體如違和，藥到病除不必煩惱。" }, { type: "失物", text: "所遺失之物，將在意外場所出現。" }] },
    { lot: 2, level: "第二卦 從革卦", l1: "從革宜更變", l2: "時來合動遷", l3: "龍門魚躍遠", l4: "凡骨作神仙", intents: [{ type: "歲運", text: "幸運已臨近，不必著急，前途非常光明，只要望著既定目標，努力進行必能有成。" }, { type: "經商", text: "錢的收入，將比預定的略少，故宜量入為出。" }, { type: "工作", text: "行新的計劃，成功的機會較多，買賣稍欠活潑，如能將原店鋪，略加改造裝設當可好轉。" }, { type: "求職", text: "求職只要努力進行，可能照希望達成。" }, { type: "升學", text: "考試好運已近，稍加努力即考取。" }, { type: "婚姻", text: "雖然對方令你滿意，然不可輕率，交際依序進行，切莫操之過急，表面上的媒人，以上司或有聲譽者為好。" }, { type: "遷居", text: "打破現狀另行遷居，換個新環境，對己有利。" }, { type: "旅遊", text: "嚴禁長途旅行外，作其他小旅行皆無妨，乘車船坐位選後排為佳。" }, { type: "疾病", text: "小心傷風、感冒、皮膚的損傷，如遇患病初癒，常做室外運動，以鍛練身體。" }, { type: "失物", text: "常會失物，物既失則永不復回，隨時要當心門戶之安全，在人群中謹防扒手。" }] },
    { lot: 3, level: "第三卦 曲直卦", l1: "動用因風便", l2: "求謀可託人", l3: "若逢戊己土", l4: "事事可成全", intents: [{ type: "歲運", text: "天雖不從人願，使你勞苦有加，然萬勿灰心洩氣，忍耐上進，相信最後勝利將屬於你。" }, { type: "經商", text: "收入常難如意，開支不免因過多而見絀，然前途光明在望，只要節省開支，度過難關，好景將到來。" }, { type: "工作", text: "一切要忍耐上進，前輩的助力，可幫助你打開困難，對於不能勝任工作最好避免。" }, { type: "求職", text: "只要面洽，有成功的希望。" }, { type: "升學", text: "考試順利能達願望。" }, { type: "婚姻", text: "第一印象可能難獲滿意，但經過兩三次交往後，自會發覺對方之好處，或另找媒人亦可。" }, { type: "遷居", text: "新建房屋或遷居，可望順利進行。" }, { type: "旅遊", text: "不必要旅行最好避免。" }, { type: "疾病", text: "如遇患病，病情漸見加重，此時最好再找良醫。" }, { type: "失物", text: "被盜之物不能復回，不必過份追究。" }] },
    { lot: 4, level: "第四卦 潤下卦", l1: "船泛江湖內", l2: "門邊獲寶珍", l3: "更宜進大用", l4: "禍散福歸來", intents: [{ type: "歲運", text: "冬盡春來，大地萬象更新，花開喜溢，花落結果，幸運之象。" }, { type: "經商", text: "可得商財有利，以往辛勞，終成果實。" }, { type: "工作", text: "採取新計劃，以爭取職位的升遷，你有貴人提拔，故不論工作經商均易獲成功。" }, { type: "求職", text: "求職順利。" }, { type: "升學", text: "升學考試順利通過。" }, { type: "婚姻", text: "婚姻之事，最好由女方提出，媒人以女性為佳，婚姻當能順利進行。" }, { type: "遷居", text: "遷居換個新環境較好，最好選定地理、環境。" }, { type: "旅遊", text: "經商、工作方面的旅行，可順利。" }, { type: "疾病", text: "遇有患病時，注意病情，可用新式療法，或找有經驗良醫即可。" }, { type: "失物", text: "失物有可復返，惟須小心火燭。" }] },
    { lot: 5, level: "第五卦 炎上卦", l1: "此卦按南方", l2: "災危不可當", l3: "公私不吉利", l4: "目下有小殃", intents: [{ type: "歲運", text: "要有百折不撓的精神，繼續向前邁進，才能克服艱難，打開僵局見到光明，要是畏縮不進，將要陷入困窮境地。" }, { type: "經商", text: "金錢方面，常感到跚跚來遲，處理有關金錢方面，要謹慎，以防遭遇損失。" }, { type: "工作", text: "在工作方面，切莫驕傲自大，以防失去他人的支持，而遭遇失敗，經商表面好看，內面實無利可得。" }, { type: "求職", text: "恐須碰些釘子，才能達成希望。" }, { type: "升學", text: "第一希望難達，第二願意可成。" }, { type: "婚姻", text: "婚姻乃終身大事，自己須有主見，不要輕信媒人言語。" }, { type: "遷居", text: "不得已時，最好遷居為佳。" }, { type: "旅遊", text: "旅行和順，時適宜外出旅遊。" }, { type: "疾病", text: "患病可能會加重，如過於憂慮會加重病情，速求良醫治療。" }, { type: "失物", text: "貴重物品不可攜帶出外，小心扒手。" }] },
    { lot: 6, level: "第六卦 稼穡卦", l1: "且守君子分", l2: "勿用小人言", l3: "凡事宜謹慎", l4: "作福保安然", intents: [{ type: "歲運", text: "遇到任何挫折時，切不可自暴自棄，不斷的努力，他日必有好光景。" }, { type: "經商", text: "常有意外開支，因浪費而陷困境，所持的證券可能跌落。" }, { type: "工作", text: "以致週轉不能，凡事有計畫，財運自然會開展。對現在的工作，感到厭倦或不滿，需忍耐以待，不可輕言轉職。" }, { type: "求職", text: "困難重重，恐難如願。" }, { type: "升學", text: "考試運不好，恐名落孫山。" }, { type: "婚姻", text: "親屬多，婚事進行多波折，媒人未能盡到力量。" }, { type: "遷居", text: "買房屋遷居等，不合時宜。" }, { type: "旅遊", text: "旅行常感不適意。" }, { type: "疾病", text: "要注意衛生，否則病從口入，會影響你的健康。" }, { type: "失物", text: "時時注意扒手，不過你的物品，雖一時失落，可望再出現。" }] },
    { lot: 7, level: "第七卦 進求卦", l1: "合家人安泰", l2: "名利兩興昌", l3: "出外皆大吉", l4: "有禍不成殃", intents: [{ type: "歲運", text: "在年輕時代，雖嚐了不少苦，只要有進取心，不氣餒，終會苦盡甘來。這是雪上開花之象。" }, { type: "經商", text: "不流汗之財必不可得，在不影響本業的原則下，兼榮副業，乃為得財之上策。" }, { type: "工作", text: "不必著急職位不升，只要你有進取心，自然會有機會，應發揮自己的才能，以自創事業。" }, { type: "求職", text: "求職希望可以達成。" }, { type: "升學", text: "考試只要發揮實力，升學必有希望。" }, { type: "婚姻", text: "可能有兩個合適的姻緣出現，故最好分別與之交往，以作較佳的選擇。" }, { type: "遷居", text: "新建遷居或開店，辦事能積極，當有助於財運發展。" }, { type: "旅遊", text: "旅行如意，如與上司長輩一同旅行，為開運機會。" }, { type: "疾病", text: "如有病痛，能於秋冬之時痊癒，在春夏期間應慎防災害侵犯。" }, { type: "失物", text: "遺失之物不久可復現。" }] },
    { lot: 8, level: "第八卦 進寶卦", l1: "好德承天佑", l2: "門招喜氣新", l3: "有人相助力", l4: "獲福盡歡欣", intents: [{ type: "歲運", text: "語云「有德之人，天報以福」，從此辛勞已得果，幸運到訪，精神物質兩如意。" }, { type: "經商", text: "財運旺，不用的東西最好賣掉，換求現金投資別種事業，能可得利。" }, { type: "工作", text: "工作順利，天賦幸運，但最怕因一時利慾而毀滅，自己應慎之。" }, { type: "求職", text: "具有工作實力，故求職很有希望。" }, { type: "升學", text: "成績很好升學異常有望。" }, { type: "婚姻", text: "所提婚姻中有好對象，故應一一予以小心觀察，自有理想對象出現。" }, { type: "遷居", text: "有適意的房子者，即可遷居。" }, { type: "旅遊", text: "旅行出差可得快樂。" }, { type: "疾病", text: "輕微感冒，可從靜養和睡眠中復原。" }, { type: "失物", text: "所遺失物品如能早日發現，可能歸還失主。" }] },
    { lot: 9, level: "第九卦 獲安卦", l1: "目下如冬樹", l2: "枯木未開花", l3: "看看春色動", l4: "漸漸發萌芽", intents: [{ type: "歲運", text: "雖有各種各樣的問題，常使你心不安，但只要繼續奮鬥，事態必能漸見好轉。" }, { type: "經商", text: "財運弱，所入不夠應付急需之用，然而不必過分焦急，只要等待收回的機會一到，即不致有損失。" }, { type: "工作", text: "對現實的工作需盡力為之，雖多少有些不如意，卻可能由此打開你的機運。" }, { type: "求職", text: "欲找職業，需遠離自宅。" }, { type: "升學", text: "投考比較遠方學校。方可能順利考上。" }, { type: "婚姻", text: "可以由相親先進入交際，結婚則尚須等待些時候。" }, { type: "遷居", text: "如有適當的地方，應遷居為妙。" }, { type: "旅遊", text: "遠途旅行，無妨害。" }, { type: "疾病", text: "有病不可急躁，依醫生指示，慢慢治療。" }, { type: "失物", text: "遺失物品，如為印章身份證之類或者可望復回，其他恐難收回。" }] },
    { lot: 10, level: "第十卦 遂心卦", l1: "時值融合氣", l2: "衰殘物再興", l3: "更逢微微雨", l4: "春色又還生", intents: [{ type: "歲運", text: "名利雙收，衣食豐隆，令人羨慕的幸運。" }, { type: "經商", text: "有先見之明，經商交易可得大利。" }, { type: "工作", text: "受上司前輩知己提拔，工作運旺盛。" }, { type: "求職", text: "可以遇貴人，而對你的求職給予極大幫助。" }, { type: "升學", text: "升學可望順利，考試須努力沒有問題。" }, { type: "婚姻", text: "緣份已到，雖不是十全十美之人選，但仍不失為理想的對象。" }, { type: "遷居", text: "如能遷居，環境氣氛一新，生活將更明朗。" }, { type: "旅遊", text: "旅行不但可獲得愉快，且可獲致意外的研究資料，供將來事業參考。" }, { type: "疾病", text: "生活要有規律才好，小病靜養即癒。" }, { type: "失物", text: "長期間所遺失之物，有收回的可能。" }] },
    { lot: 11, level: "第十一卦 災散卦", l1: "災散福門開", l2: "喜氣降臨來", l3: "月下相逢去", l4: "須當得橫財", intents: [{ type: "歲運", text: "喜氣盈滿，可獲得父母、朋友、上司、前輩的助力，同時更能給予周圍的人，份外好感。" }, { type: "經商", text: "經營之事業，有利可圖，遊資必須運用於事業，如事業能發展，財運可旺盛。" }, { type: "工作", text: "事業雄心可以實現，一面再借助朋友的智慧，以採取新計劃及有效宣傳，事業必能更上一層樓。" }, { type: "求職", text: "求職運氣好，故求職很有希望。" }, { type: "升學", text: "考試運好，考取沒有問題，但須努力。" }, { type: "婚姻", text: "有媒人介紹不妨相親，而進入交際，如滿意者，即可以定婚。" }, { type: "遷居", text: "遷居地點比現在好的房屋，當無妨。" }, { type: "旅遊", text: "旅行能可愉樂身心，也可獲利，一舉兩得，何樂而不為。" }, { type: "疾病", text: "患病隨時就良醫不可延誤，有貴人可無妨。" }, { type: "失物", text: "外出小心、謹慎，遺失物有找回的可能。" }] },
    { lot: 12, level: "第十二卦 上進卦", l1: "進取多隨意", l2: "寒儒衣錦歸", l3: "有人占此卦", l4: "凡事任意為", intents: [{ type: "歲運", text: "處事須有勇氣，必可得上司、前輩的提拔，好機會已迫近眼前，應好好利用。" }, { type: "經商", text: "可以照預定計劃，順利進行，金錢方面不必憂愁，物品方面暢銷。" }, { type: "工作", text: "受上司提拔的機會多，與上司應多作友誼交往，對新貨物如能積極進行，銷路當無問題。" }, { type: "求職", text: "利用人事關係，可達成目的。" }, { type: "升學", text: "考試運好，可達成大小升學願望。" }, { type: "婚姻", text: "可能同時有多起婚姻介紹，只等待你自己的決定了。" }, { type: "遷居", text: "不需遷居，但如與工作有關的遷居，當然無妨。" }, { type: "旅遊", text: "旅行需多帶金錢，但需注意小心為要。" }, { type: "疾病", text: "患病隨時可癒，但需隨時注意，咽喉、胃腸的健康。" }, { type: "失物", text: "所遺失的物品，不日可望收回。" }] },
    { lot: 13, level: "第十三卦 暗昧卦", l1: "井底觀明月", l2: "見影不見形", l3: "錢財多失去", l4: "謹守得安寧", intents: [{ type: "歲運", text: "維持現狀，靜以待時，交際、交易、說話都要謹慎，以免招來災禍。" }, { type: "經商", text: "財運貧弱，不可受人利用，勿為他人作保，否則有損失，貸出之款，不能回收。" }, { type: "工作", text: "屢遭阻礙，事事不如意，易受他人中傷，常有感情之衝突事發生。" }, { type: "求職", text: "求職有困難，動用人事亦無效果。" }, { type: "升學", text: "升學有困難，恐難遂心。" }, { type: "婚姻", text: "要慎重考慮，不可輕率允諾，否則將會帶給你不美滿的婚姻。" }, { type: "遷居", text: "暫時不要遷居，不要擴張店面，動不如靜。" }, { type: "旅遊", text: "旅行開支多，而且無甚益處。" }, { type: "疾病", text: "患病難癒，仍不可過於大意，時時注意安養，叫良醫診察。" }, { type: "失物", text: "失物不能收回。" }] },
    { lot: 14, level: "第十四卦 安靜卦", l1: "自心多不足", l2: "求謀未得成", l3: "忍耐方為福", l4: "守分免災星", intents: [{ type: "歲運", text: "計劃的事，已進行的事，挫折橫生，使你深受打擊，但別衝動，冷靜地研究對策，以靜制動吧！" }, { type: "經商", text: "財運差－有收入即有意處支出，買進的證券又逢跌價，須勤儉以待良機。" }, { type: "工作", text: "由於上司的誤會，使工作受阻，關鍵乃在你的粗心。應深切反省警惕，防糾紛發生。" }, { type: "求職", text: "無須期待，另找第二、第三希望較有利。" }, { type: "升學", text: "第一志願，恐怕難如願。" }, { type: "婚姻", text: "婚姻不可急，較慢即有良緣，若輕率會使您終身遺憾。" }, { type: "遷居", text: "維持現狀，不可遷居。" }, { type: "旅遊", text: "不宜外出旅行，恐有波折橫生。" }, { type: "疾病", text: "玉體常違和，病情持久，而反復無常或者與風水有關，求地理師指明。" }, { type: "失物", text: "外出時要注意，所攜帶的物品，一旦遺失即難得尋回。" }] },
    { lot: 15, level: "第十五卦 阻折卦", l1: "枯木逢霜雪", l2: "驚心無可託", l3: "孤舟遇大風", l4: "百事不亨通", intents: [{ type: "歲運", text: "運不佳，只有保守現狀外，別無良法，他助不如自助，求人不如求己。" }, { type: "經商", text: "你的開支過多，常作無謂的浪費，故經濟不免困窘。" }, { type: "工作", text: "由於你的心性無定，故易受人利用，隨時小心為要。" }, { type: "求職", text: "有阻礙，求職難成照舊業即可順利。" }, { type: "升學", text: "困難多多，故升學難達願望。" }, { type: "婚姻", text: "春天所提的婚事恐未得合，夏冬所提的婚事可能較為佳。" }, { type: "遷居", text: "不必遷居，職位亦不能改變，一切維持現狀。" }, { type: "旅遊", text: "旅行不順，工作上的旅行，由他人代替為佳。" }, { type: "疾病", text: "病情不但持久更會加重，春夏間特別要注意，即投下神祗保平安。" }, { type: "失物", text: "遺失之物品不能收回，追究亦枉然。" }] },
    { lot: 16, level: "第十六卦 保安卦", l1: "日出照四海", l2: "光輝天下明", l3: "動用和合吉", l4: "百事總皆成", intents: [{ type: "歲運", text: "飛黃騰達的時候，應該積極的進行，一定有好的收獲，工作經商按照新計劃進行吧。" }, { type: "經商", text: "充分發揮你的才能，錢財自會源源而來。" }, { type: "工作", text: "你的計劃也許將在途中遇到挫折，但不必氣餒，勇敢的幹去，你的理想必可達成。" }, { type: "求職", text: "求職希望可達成。" }, { type: "升學", text: "升學亦能順利須努力。" }, { type: "婚姻", text: "你認為理想的對象，可進行婚約無妨，自主無誤。" }, { type: "遷居", text: "為著升學或求職或是結婚的遷居，可以進行。" }, { type: "旅遊", text: "旅行要注意氣候，小心為要。" }, { type: "疾病", text: "如遇患病可全癒，睡眠不足，要注意。" }, { type: "失物", text: "遺失物品馬上追找，可望復回，要小心扒手。" }] },
    { lot: 17, level: "第十七卦 喜至卦", l1: "眾惡自消滅", l2: "福氣自然生", l3: "如人行暗夜", l4: "今己得天明", intents: [{ type: "歲運", text: "不必著急，只要堅守現在的崗位，充實自己的一切力量，開運機會已不遠。" }, { type: "經商", text: "錢財的收入，或許會比預定減少，購買安定的物產，可以獲利。" }, { type: "工作", text: "無需上司提拔，地位自能上陞，上進機會多，有時亦能得獎賞。" }, { type: "求職", text: "對於你，所盼望的工作可達成。" }, { type: "升學", text: "可以考取你理想的學校。" }, { type: "婚姻", text: "如有已訂婚約者，日期不可延長，半年以內即結婚較好。" }, { type: "遷居", text: "遷居無妨。" }, { type: "旅遊", text: "觀光旅行，一路必可順利安全。" }, { type: "疾病", text: "患病時很快就癒，多作室外運動較好。" }, { type: "失物", text: "遺失物品，馬上追找，可以復回。" }] },
    { lot: 18, level: "第十八卦 猶豫卦", l1: "此卦內恍惚", l2: "錢財暗消磨", l3: "恩愛反成怨", l4: "人情不相和", intents: [{ type: "歲運", text: "運氣不順，連綿不斷的打擊，使你失掉信心，且常與骨肉之親發生爭執，並多招惹口舌是非。" }, { type: "經商", text: "財運差開支多，預定的錢收入只有一半，證券難得兌現，週轉不能之兆。" }, { type: "工作", text: "運不順我失去人和，工作上無趣若經商，可能貨物滯銷。" }, { type: "求職", text: "求職恐難得願望。" }, { type: "升學", text: "考試運不好，勞而無功。" }, { type: "婚姻", text: "理想的婚姻難求，聽信媒人之言亦不是辦法，不可焦急，愈急愈糟。" }, { type: "遷居", text: "遷居倒是開運的好辦法。" }, { type: "旅遊", text: "旅行以作自我反省也好。" }, { type: "疾病", text: "患病將加重，而持久，或者與風水有關，並注意車禍。" }, { type: "失物", text: "小心門戶物品一經失去，難再復返。" }] },
    { lot: 19, level: "第十九卦 豐稔卦", l1: "根深枝葉茂", l2: "樹多格式高", l3: "經商多倍利", l4: "蘭蕙出逢蒿", intents: [{ type: "歲運", text: "春到人間，大地到處充滿了鳥語花香，此時的你是被幸福所包圍。" }, { type: "經商", text: "財運旺，所持之證券價值直線上漲，困難收回的金錢可收回，擴張門面必定興隆。" }, { type: "工作", text: "工作方面，受上司看重，及同事愛戴，地位漸次提高。" }, { type: "求職", text: "由你的智慧，求職無問題。" }, { type: "升學", text: "由你的好學，升學必能如願。" }, { type: "婚姻", text: "理想的婚姻，即可進行無妨，由你自己決定，美滿良緣可期。" }, { type: "遷居", text: "再買新房能合意即可。" }, { type: "旅遊", text: "旅行爽快，坐飛機也無妨。" }, { type: "疾病", text: "病無恙，常做運動，對你身體有益。" }, { type: "失物", text: "失物地點不遠，可以追回。" }] },
    { lot: 20, level: "第二十卦 得祿卦", l1: "高明居福祿", l2: "龍禽待放生", l3: "出入多財寶", l4: "更宜遠方行", intents: [{ type: "歲運", text: "沒有比現在更幸運，更幸福的時候了，所謀希望皆如意。事業可以進行。" }, { type: "經商", text: "財運很旺並有意外錢財可得。" }, { type: "工作", text: "以你的機智，使工作實績上升，但要慎防周圍的妒忌。" }, { type: "求職", text: "可進入大公司，操重要的工作，謀望皆能順利。" }, { type: "升學", text: "升學願意可達成。" }, { type: "婚姻", text: "春天是你結婚期，如有對象在春季即可訂婚結婚。" }, { type: "遷居", text: "遷居無妨，改變現狀，更換環境是上策。" }, { type: "旅遊", text: "航空、航海都很安全。" }, { type: "疾病", text: "小心注意，咽喉、和腹部的健康，隨時留意天氣變化。" }, { type: "失物", text: "貴重物品要直接保管，不可任意託他人。" }] },
    { lot: 21, level: "第二十一卦 明顯卦", l1: "明月青天上", l2: "今宵照綺筵", l3: "家家沾德澤", l4: "萬里淨雲煙", intents: [{ type: "歲運", text: "過去雖有糾紛或不如意事，現在可解決，從此光明漸見。" }, { type: "經商", text: "一向無可能收回的款項，或能意外收回，經濟方面漸覺豐裕。" }, { type: "工作", text: "頗受上司器重，能與同事間密切合作，事業成就厚望大。" }, { type: "求職", text: "利用人事關係，方能成功。" }, { type: "升學", text: "多加努力仍可以達成願望。" }, { type: "婚姻", text: "婚姻可望順利進行，結婚除夏天之外皆無妨。" }, { type: "遷居", text: "依職業和工作上的遷居，異常有益。" }, { type: "旅遊", text: "男女混合的旅行，行動須加慎重，行為務必小心。" }, { type: "疾病", text: "如是眼睛、牙齒、外科方面疾病無妨，其他生病應速延醫治療。" }, { type: "失物", text: "小心扒手，外出時身上所攜帶的物品，提防扒手，以免遭到損失。" }] },
    { lot: 22, level: "第二十二卦 福祿卦", l1: "福祿得安康", l2: "榮華保進昌", l3: "百事遂心意", l4: "千里共馨香", intents: [{ type: "歲運", text: "過去貧困和煩惱，都已經煙消雲散，從此物質精神兩無憂。" }, { type: "經商", text: "收入不錯，但須貯蓄，以備將來之用，替人作保要多慎重。" }, { type: "工作", text: "新的職務，也許較費心費力，但那有前途的工作，應該認真做下去。" }, { type: "求職", text: "盡量利用人事關係，爭取機會。" }, { type: "升學", text: "考試運好，有被錄取的希望。" }, { type: "婚姻", text: "婚事在三月或十月裡進行較佳，良緣已近了。" }, { type: "遷居", text: "為工作而遷居很好。" }, { type: "旅遊", text: "除三月、十月之外皆無妨，故注意時間為是。" }, { type: "疾病", text: "上半身容易受外傷，故上下樓小心為是，注意車禍。" }, { type: "失物", text: "注意門戶，貴重物品，保存的場所要一定。" }] },
    { lot: 23, level: "第二十三卦 凝滯卦", l1: "今朝占此卦", l2: "推車上高山", l3: "前進有顛險", l4: "退後保平安", intents: [{ type: "歲運", text: "機會總是不湊巧，要見的人見不到，徒勞往返，不如意事十之八九。" }, { type: "經商", text: "金錢出入無常，致憂心忡忡，不合時運。" }, { type: "工作", text: "工作上、事業上、欠順利，常有糾紛發生。" }, { type: "求職", text: "求職有阻礙，因而常導致徒勞無益。" }, { type: "升學", text: "升學運差希望難達成。" }, { type: "婚姻", text: "不要過於衝動，關於婚姻方面，要慎重處理。" }, { type: "遷居", text: "最好不要遷居。" }, { type: "旅遊", text: "旅行能延緩最好。" }, { type: "疾病", text: "身體有衰弱之象，要注意，從醫師診察，服藥為宜。" }, { type: "失物", text: "出外或家裡，隨時注意，貴重物品的安全小心。" }] },
    { lot: 24, level: "第二十四卦 顯達卦", l1: "三姓俱相伴", l2: "祥光得其生", l3: "更宜分造化", l4: "百福自然享", intents: [{ type: "歲運", text: "多年來所計劃的一切事宜，已漸接近實現階段，只要百尺竿頭更進一步，前途光明順利。" }, { type: "經商", text: "財運很旺，錢財源源而來，但不要隨便接受人家援助。" }, { type: "工作", text: "做事很熱心，上進機會多，也易受他人的嫉妒和敵視，只要發揮實力他人自會改變。" }, { type: "求職", text: "一帆風順，可以進入大公司或機關。" }, { type: "升學", text: "要有信心努力，考試沒有問題。" }, { type: "婚姻", text: "婚事在一、二月或十一、二月舉行較佳，審慎選擇，良緣在望。" }, { type: "遷居", text: "不動產買賣遷居都好。" }, { type: "旅遊", text: "旅行遠近 都無妨。" }, { type: "疾病", text: "多加注重飲食，睡眠、則健康可保安全。" }, { type: "失物", text: "因忙碌，往往以致遺失物件，自己小心別無他法。" }] },
    { lot: 25, level: "第二十五卦 福厚卦", l1: "此卦占太和", l2: "求謀喜事多", l3: "行人歸故里", l4: "身樂得歡歌", intents: [{ type: "歲運", text: "忍耐和努力的結果，使你由不安和困難中，漸入佳境。" }, { type: "經商", text: "雖財運差，由於平素不浪費，故稍有積蓄，對於臨時支出能從容應付。" }, { type: "工作", text: "不須要急於求表現，慢慢地大家會看到你，確實的成就。" }, { type: "求職", text: "職務雖不一定滿意，只要下定決心做，總會有成就。" }, { type: "升學", text: "金榜題名有望。" }, { type: "婚姻", text: "有周圍的人贊成，故婚姻順利，婚事宜，訂婚後，從速舉行婚禮為妙。" }, { type: "遷居", text: "若有適當地方時宜，遷居無妨。" }, { type: "旅遊", text: "工作上的旅行有益，由不安的困境中漸入佳境。" }, { type: "疾病", text: "注意氣候的調節，時時注意養生為宜。" }, { type: "失物", text: "遺失之物，假若尚記得其遺失地點必可收回。" }] },
    { lot: 26, level: "第二十六卦 保全卦", l1: "服藥將身保", l2: "相連詞訟纏", l3: "凡事宜守舊", l4: "大福自然安", intents: [{ type: "歲運", text: "不應自滿，凡事謹慎從事，做事自然安全。" }, { type: "經商", text: "不可過度的浪費，與無計劃的擴張，經商方面的收益約達預定中的六成。" }, { type: "工作", text: "對現在的工作，不可存有輕視的念頭，勤勉隨時會得到報酬，毋須掛慮薪資地位。" }, { type: "求職", text: "利用人事關係可達成，但不可自得意滿。" }, { type: "升學", text: "升學考試尚可順利。" }, { type: "婚姻", text: "不要靠媒人的力量，相親後再經審慎察看後決定，第四五回提到的婚姻可能較好。" }, { type: "遷居", text: "不要遷居，現在房屋較安全。" }, { type: "旅遊", text: "旅行平安，適合時宜。" }, { type: "疾病", text: "患病恐有意外不測，投下神祇，或者服藥可能生效，否則身不能保。" }, { type: "失物", text: "多小心。則可以減少失物，失物有追回的希望。" }] },
    { lot: 27, level: "第二十七卦 太平卦", l1: "霖雨滋稼穡", l2: "何愁不倍收", l3: "自然有快樂", l4: "作事永無憂", intents: [{ type: "歲運", text: "經一番勞苦後，幸福的日期即將靠近，此時開運的序曲已開始了。" }, { type: "經商", text: "就業經商，錢財漸見好轉，如意順利，進行無妨。" }, { type: "工作", text: "經商工作皆如意。" }, { type: "求職", text: "平時要努力充實能力，一切可天從人願。" }, { type: "升學", text: "平時多加努力，即可達成願望。" }, { type: "婚姻", text: "不合意的婚姻，即時拒絕，經一段時間，方能出現美滿良緣。" }, { type: "遷居", text: "遷居對工作、經商比較有利，方向以東方為佳。" }, { type: "旅遊", text: "旅行愉快，長途旅行也無妨。" }, { type: "疾病", text: "健康方面良好，有病時速就醫無妨。" }, { type: "失物", text: "小心物品保管，遺失的物件，不意中找回。" }] },
    { lot: 28, level: "第二十八卦 開發卦", l1: "蚌中珠獻瑞", l2: "石內玉生光", l3: "進財寶望吉", l4: "有禍不成殃", intents: [{ type: "歲運", text: "只要你的野心不太大，你的花園是充滿了安泰，工作方面，金錢方面皆順利。" }, { type: "經商", text: "報酬有預計的六成，出售之物自有人來接洽，預定款遲遲不入須備不時之需。" }, { type: "工作", text: "由於你的工作上，或許易受人家欺侮，惟有忍耐，不斷的努力才能使你達到光明的境界。" }, { type: "求職", text: "不可期望太高的職位，當能如願。" }, { type: "升學", text: "不可期望太高的學校，自然沒有問題。" }, { type: "婚姻", text: "婚姻的發生也許太快，但不必驚疑，現在已是原子時代了，快也無妨。" }, { type: "遷居", text: "不必要的遷居，最好避免為佳。" }, { type: "旅遊", text: "工作上的旅行，可望一帆風順。" }, { type: "疾病", text: "對在家庭以外的飲食，應小心，身體偶感不適應速就醫。" }, { type: "失物", text: "不可攜帶巨款行路，物品最好填上姓名住址，一旦遺失即有被送回的希望。" }] },
    { lot: 29, level: "第二十九卦 鷹揚卦", l1: "邊城將士勇", l2: "旌旗得勝回", l3: "功勳班師吉", l4: "門第有光輝", intents: [{ type: "歲運", text: "沒有什麼可憂心的問題，平和愉快地過活，有意外的幸運來臨，使你長年努力獲報酬。" }, { type: "經商", text: "你的經濟穩定，但萬不可受誘惑。" }, { type: "工作", text: "喜新厭舊的心情，使你對現實工作感到厭倦，但萬勿存轉職的想法，堅守崗位對你有好處。" }, { type: "求職", text: "你要有前輩的介紹，即能得到理想的工作。" }, { type: "升學", text: "升學無多大困難，只要多努力、多用心。" }, { type: "婚姻", text: "雖然你對媒人的介紹，並不多懷希望，但卻有意外的良緣。" }, { type: "遷居", text: "公司、學校工作的變動皆可以遷，如宅舍暫時實不必遷移。" }, { type: "旅遊", text: "旅行可以跟少數人在一起，將倍感愉快。" }, { type: "疾病", text: "無患病之憂，注意手足的保養，恐有外傷為害。" }, { type: "失物", text: "小心，所攜帶之物品。" }] },
    { lot: 30, level: "第三十卦 後吉卦", l1: "履薄登冰地", l2: "危橋得渡時", l3: "重重憂險過", l4: "春色自芳菲", intents: [{ type: "歲運", text: "現時處境，猶如臨深淵如履薄冰，心情不免戰戰兢兢，須以冷靜頭腦去克服，必可開創光明。" }, { type: "經商", text: "收支率相差甚大，入即有意外開支，平時應盡量儲蓄，財運如深陷在泥石中，煩腦層出。" }, { type: "工作", text: "對於平凡的工作要忍耐，總有一天，你會被賞識。" }, { type: "求職", text: "求職有困難。" }, { type: "升學", text: "求學須有非常的努力，否則難以如願。" }, { type: "婚姻", text: "切忌模稜兩可的態度，如認為不合意者、應明示拒絕，以免自誤誤人。" }, { type: "遷居", text: "非不得已時，以不遷居為佳。" }, { type: "旅遊", text: "夏秋之間較安全，不宜與陌生人群同行，可保安全。" }, { type: "疾病", text: "疾病也許一時會加重，但從速就醫，可免病情加重。" }, { type: "失物", text: "失物不可復返，出外不能攜帶大量錢財。" }] },
    { lot: 31, level: "第三十一卦 顛險卦", l1: "迢遞途中旅", l2: "途程日落山", l3: "驚心無可託", l4: "前後左右難", intents: [{ type: "歲運", text: "如深陷泥沼進退維谷，時有嫉妒阻礙你前進。須留心檢討對策，如粗心大意會加重苦境。" }, { type: "經商", text: "工作經商不能順利，且在人事方面煩惱疊出。" }, { type: "工作", text: "工作經商不能順利，且在人事方面煩惱疊出。" }, { type: "求職", text: "萬不可期望太高的職位，此時的您運氣太差，求職上困難重重。" }, { type: "升學", text: "升學考試運氣不佳，但並非考不取，恐有意外的事件耽誤。" }, { type: "婚姻", text: "對你不合適的婚姻，應在不傷感情的情形下加以拒絕，理想良緣將在他處近期出現。" }, { type: "遷居", text: "前半年不可遷移。" }, { type: "旅遊", text: "近處旅行時和少數人，意趣相合者，同往較佳，避免遠行為佳。" }, { type: "疾病", text: "身體不適時，應即刻治療以免病情加重，即麻煩。" }, { type: "失物", text: "忙碌時應注意隨身攜帶物品，以防遺失。" }] },
    { lot: 32, level: "第三十二卦 無數卦", l1: "寶鏡塵埋沒", l2: "白璧墜污泥", l3: "何日重出世", l4: "再得顯光輝", intents: [{ type: "歲運", text: "你的寶鏡蒙上灰塵，不能照出你美妙的姿態，在不安的生活中，身心俱疲，要特別注意健康。" }, { type: "經商", text: "收入少，開支多，常感經濟困難，所持證券會跌價，遭到損失。" }, { type: "工作", text: "工作雖賣力，卻吃力不討好，工作方面亦不順利。" }, { type: "求職", text: "求職有困難。" }, { type: "升學", text: "考運不佳，可能因病或事故而耽誤。" }, { type: "婚姻", text: "對象的一切，須徹底調查，終身大事慎重考慮較好。" }, { type: "遷居", text: "不可遷居移動。" }, { type: "旅遊", text: "旅行不如意，若勉強出遠門，則易招致事故也未可知。" }, { type: "疾病", text: "即使輕微的病，也要即刻治療，否則將會變得非常嚴重，要請良醫治療。" }, { type: "失物", text: "小心扒手、小偷，物品一經遺失，永不復回。" }] }
];

// ==========================================
// 2. 註冊系統 (讓系統選單能抓到它)
// ==========================================
window.poemSystems = window.poemSystems || {}; // 確保物件存在
const kongmingContent = {};
lotsKongming_32.forEach(p => {
    kongmingContent[p.lot] = p;
});

window.poemSystems['Kongming_32'] = {
    id: 'Kongming_32',
    name: '啟示玄機院孔明神卦',
    total: 32,
    format: 'kongming_shenji',
    category: 'kongming',
    isBase: false,  // ★ 錯誤修正 1：必須是大寫 B，不然會抓不到分類！
    content: {}
};

lotsKongming_32.forEach(poem => {
    window.poemSystems['Kongming_32'].content[poem.lot] = {
        level: poem.level,
        l1: poem.l1,
        l2: poem.l2,
        l3: poem.l3,
        l4: poem.l4,
        intents: poem.intents
    };
});

// ==========================================
// ★ 啟示玄機院孔明神卦 - 專屬版面
// ==========================================
window.customPoemTemplates['kongming_shenji'] = function (poem, cleanLotNum, templeName, customData) {
    if (!poem) {
        return `<div class="fortune-slip" style="padding:30px; text-align:center; color:#888;">第 ${cleanLotNum} 籤資料建置中...</div>`;
    }

    // ★ 錯誤修正 2：補上缺少的變數宣告！如果不加這三行，系統會大當機變白畫面！
    let lines = [poem.l1 || '', poem.l2 || '', poem.l3 || '', poem.l4 || ''];
    let intentsList = poem.intents || [];
    let oldIntentText = poem.interpretation || poem.meaning || "";

    // 1. 產生【整張檢視】的十宮格神意
    let fullGridCells = "";
    let halfLen = Math.ceil(intentsList.length / 2);
    if (halfLen < 5 && intentsList.length > 0) halfLen = 5;
    intentsList.forEach((item, i) => {
        let lineStyle = i < halfLen ? 'border-bottom: 1px dashed rgba(0,0,0,0.2); padding-bottom: 1cqw; margin-bottom: 1cqw;' : '';
        fullGridCells += `
                <div class="grid-cell" style="display:flex; flex-direction:column; align-items:center; justify-content:flex-start; padding: 0 1cqw; gap: 0; ${lineStyle}">
                    ${item.type ? `<div style="writing-mode:vertical-rl; text-orientation:upright; font-weight:900; font-size:5.5cqw; margin-bottom:0.8cqw; color:#111;">${item.type}</div>` : ''}
                    <div style="writing-mode:vertical-rl; text-orientation:upright; font-size:4.5cqw; text-align:center; color:#333; line-height:1.4;">${item.text.replace(/\n/g, '<br>')}</div>
                </div>
            `;
    });
    let fullIntentHTML = `<div style="display: grid; grid-template-columns: repeat(${halfLen}, 1fr); direction: rtl; align-content: start; padding: 1cqw; height:100%; box-sizing:border-box;">${fullGridCells}</div>`;

    // 2. 產生【半張檢視】的抽屜按鈕 (★ 放大按鈕字體與框線比例)
    let btnCells = "";
    intentsList.forEach(item => {
        let safeText = item.text.replace(/\n/g, '<br>').replace(/'/g, "\\'").replace(/"/g, '&quot;');
        btnCells += `
                    <div onclick="
                            const root = this.closest('.ks-layout-root');
                            root.querySelector('.ks-drawer-cat').innerText = '${item.type}';
                            root.querySelector('.ks-drawer-text').innerHTML = '${safeText}';
                            root.querySelector('.ks-drawer').classList.add('active');
                         " 
                         style="writing-mode: vertical-rl; text-orientation: upright; border: 2px solid #b71c1c; color: #b71c1c; border-radius: 8px; font-weight: bold; font-size: 6.5cqw; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 2px 2px 5px rgba(0,0,0,0.1); background: #fff; width: 100%; height: 100%;">
                        ${item.type}
                    </div>
                `;
    });

    // ★ 要求 1：雙層抬頭字體互換 (上方小、下方大)
    const headerHTML = `
                <div style="text-align: center; margin-bottom: 1.5cqw; width: 100%;">
                    <div style="display: inline-flex; flex-direction: column; align-items: center; background-color: #b71c1c; color: #fff; padding: 1.5cqw 6cqw; clip-path: polygon(8% 0%, 92% 0%, 100% 100%, 0% 100%);">
                        <div style="font-size: 5.5cqw; font-weight: bold; letter-spacing: 0.5em;">${templeName.split('').reverse().join('')}</div>
                        <div style="font-size: 8cqw; font-weight: bold; letter-spacing: 0.2em; margin-top: 0.5cqw;">卦神明孔葛諸</div>
                    </div>
                </div>
            `;

    // ★ 要求 2：底下的地址與電話，獨立出來放在最底下 (跨區塊置中)
    const footerHTML = `
                <div style="text-align: center; margin-top: 1cqw; padding-bottom: 0.5cqw; width: 100%;">
                    <span style="font-size: 3.2cqw; font-weight: bold; color: #111; letter-spacing: 1px; white-space: nowrap; font-family: Arial, sans-serif;">
                        南投縣魚池鄉中明村 049-2895064
                    </span>
                </div>
            `;

    // --- 籤詩右半部的專屬版型 ---
    const poemOnlyHTML = `
                <div class="km-poem-container" style="display: flex; flex-direction: column; width: 100%; height: 100%; justify-content: center;">
                    <div style="display: flex; flex-direction: row-reverse; flex: 1; align-items: stretch; justify-content: center; padding-top: 0.5cqw;">
                        <div style="font-size: 3.0cqw; font-weight: bold; writing-mode: vertical-rl; text-orientation: upright; letter-spacing: 0.3cqw; color: #b71c1c; margin-left: 2cqw; display: flex; align-items: center; justify-content: flex-end;">
                            神卦真傳 疑題解答 顯化神機 心誠則靈
                        </div>
                        <div style="background-color: #FFE4E1; border: 2px solid #b71c1c; border-radius: 8px; padding: 2cqw; display: flex; flex-direction: row-reverse; justify-content: space-evenly; align-items: center; flex: 1;">
                            <div style="writing-mode: vertical-rl; text-orientation: upright; font-size: 5.5cqw; font-weight: bold; color: #111; letter-spacing: 0.5cqw;">
                                ${poem.level || ''}
                            </div>
                            <div style="writing-mode: vertical-rl; text-orientation: upright; font-size: 6.8cqw; font-weight: bold; letter-spacing: 1cqw; color: #222;">
                                ${lines[0]}　${lines[1]}
                            </div>
                            <div style="writing-mode: vertical-rl; text-orientation: upright; font-size: 6.8cqw; font-weight: bold; letter-spacing: 1cqw; color: #222;">
                                ${lines[2]}　${lines[3]}
                            </div>
                        </div>
                    </div>
                </div>
            `;

    // ----------------------------------------------------
    // ★ 修復關鍵：確保解析聖意的變數有被正確定義，防止崩潰
    // ----------------------------------------------------
    let safeIntentsList = (typeof customData !== 'undefined' && customData && customData.intents) ? customData.intents : (poem.intents || []);

    let scrollableIntents = "";
    safeIntentsList.forEach((item, index) => {
        let borderStyle = index === safeIntentsList.length - 1 ? "" : "border-left: 1px dashed rgba(183, 28, 28, 0.3);";
        scrollableIntents += `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 0 2cqw; ${borderStyle} height: 100%; flex-shrink: 0;">
                        <div style="writing-mode: vertical-rl; text-orientation: upright; font-weight: 900; font-size: 5cqw; color: #b71c1c; margin-bottom: 1cqw;">${item.type}</div>
                        <div style="writing-mode: vertical-rl; text-orientation: upright; font-size: 4.2cqw; color: #333; line-height: 1.5; text-align: left;">${item.text.replace(/\n/g, '<br>')}</div>
                    </div>
                `;
    });

    let scrollableIntentHTML = `
                <div class="hide-scrollbar" style="display: flex; flex-direction: row-reverse; height: 100%; width: 100%; overflow-x: auto; overflow-y: hidden; padding-bottom: 1cqw;">
                    <div style="writing-mode: vertical-rl; text-orientation: upright; font-size: 3.2cqw; color: #888; font-weight: bold; display: flex; align-items: center; justify-content: center; padding: 0 1cqw; flex-shrink: 0;">
                        ◀ 向左滑動檢視解曰
                    </div>
                    ${scrollableIntents}
                </div>
            `;

    // ----------------------------------------------------
    // ★ 組合最終 HTML
    // ----------------------------------------------------
    return `
                <style>
                    .ks-toggle-bar { display: flex; justify-content: center; gap: 10px; margin-bottom: 15px; }
                    .ks-toggle-btn { background: #444; color: #fff; border: 2px solid #666; padding: 8px 16px; border-radius: 20px; font-size: 1rem; cursor: pointer; transition: 0.3s; }
                    .ks-toggle-btn.active { background: var(--primary); border-color: var(--primary); font-weight: bold; }
                    .ks-drawer { position: absolute; top: 0; left: 0; bottom: 0; width: 50%; background: #fcf9f2; transform: translateX(-100%); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); z-index: 10; display: flex; flex-direction: row-reverse; padding: 3cqw; box-sizing: border-box; border-right: 3px solid #b71c1c; box-shadow: 5px 0 15px rgba(0,0,0,0.3); }
                    .ks-drawer.active { transform: translateX(0); }
                    
                    /* 隱藏捲軸但保留滑動功能 */
                    .hide-scrollbar::-webkit-scrollbar { display: none; }
                    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                </style>

                <div class="ks-layout-root" style="width: 100%; max-width: 600px; margin: 0 auto;">
                    
                    <div class="ks-toggle-bar">
                        <button class="ks-toggle-btn btn-half active" onclick="
                            const root = this.closest('.ks-layout-root');
                            root.querySelector('.ks-full-mode').style.display='none';
                            root.querySelector('.ks-half-mode').style.display='block';
                            root.querySelector('.ks-full-hint').style.display='none';
                            root.querySelectorAll('.ks-toggle-btn').forEach(b => b.classList.remove('active'));
                            this.classList.add('active');
                        ">📱 半張檢視</button>
                        
                        <button class="ks-toggle-btn btn-full" onclick="
                            const root = this.closest('.ks-layout-root');
                            root.querySelector('.ks-half-mode').style.display='none';
                            root.querySelector('.ks-full-mode').style.display='block';
                            root.querySelector('.ks-full-hint').style.display='block';
                            root.querySelectorAll('.ks-toggle-btn').forEach(b => b.classList.remove('active'));
                            this.classList.add('active');
                        ">🗺️ 整張滑動</button>
                    </div>

                    <div class="ks-half-mode ks-half-view-wrapper" style="position: relative; overflow: hidden; border-radius: 12px; box-shadow: 0 8px 20px rgba(0,0,0,0.4);">
                        <div class="fortune-slip" style="aspect-ratio: 75 / 95 !important; margin: 0; width: 100%; padding: 2% 3%;">
                            <div class="slip-inner-border" style="display: flex; flex-direction: column; border: none; height: 100%; justify-content: space-between;">
                                ${headerHTML}
                                <div style="display: flex; flex-direction: row-reverse; flex: 1; overflow: hidden; margin-bottom: 1.5cqw;">
                                    <div style="width: 50%; display: flex; flex-direction: column; border-left: 2px dashed rgba(183, 28, 28, 0.4); padding-left: 1.5cqw; padding-right: 1cqw;">
                                        ${poemOnlyHTML}
                                    </div>
                                    <div style="width: 50%; display: grid; grid-template-rows: repeat(5, 1fr); grid-auto-flow: column; direction: rtl; gap: 2cqw 3cqw; padding: 0 1.5cqw; height: 97%;">
                                        ${btnCells}
                                    </div>
                                </div>
                                ${footerHTML}
                            </div>
                        </div>

                        <div class="ks-drawer">
                            <div onclick="this.closest('.ks-drawer').classList.remove('active');" 
                                 style="writing-mode: vertical-rl; text-orientation: upright; font-size: 5cqw; font-weight: bold; color: #fff; background: #b71c1c; padding: 3cqw 1cqw; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 10px;">
                                <span>❌返回</span>
                            </div>
                            <div class="ks-drawer-cat" style="writing-mode: vertical-rl; text-orientation: upright; font-size: 7cqw; font-weight: 900; color: #111; margin-right: 3cqw; letter-spacing: 0.5cqw;"></div>
                            <div class="ks-drawer-text" style="writing-mode: vertical-rl; text-orientation: upright; font-size: 5.5cqw; line-height: 1.6; color: #333; margin-right: 3cqw; flex: 1; overflow-x: auto;"></div>
                        </div>
                    </div>

                    <div class="ks-full-mode" style="display: none; width: 100%; height: 75vh; background: #222; border-radius: 12px; padding: 15px; box-sizing: border-box;">
                        <div class="fortune-slip" style="height: 100%; width: 100%; background: #fff; margin: 0; padding: 3% 4%; box-sizing: border-box; box-shadow: 0 0 15px rgba(0,0,0,0.8); overflow: hidden;">
                            <div class="slip-inner-border" style="display: flex; flex-direction: column; border: none; height: 100%; justify-content: space-between;">
                                ${headerHTML}
                                <div style="display: flex; flex-direction: row-reverse; flex: 1; overflow: hidden; margin-bottom: 1cqw;">
                                    <div style="width: 50%; display: flex; flex-direction: column; border-left: 2px solid #b71c1c; padding-left: 1.5cqw; height: 100%;">
                                        ${poemOnlyHTML}
                                    </div>
                                    <div style="width: 50%; height: 100%; padding-right: 1.5cqw; overflow: hidden;">
                                        ${scrollableIntentHTML}
                                    </div>
                                </div>
                                ${footerHTML}
                            </div>
                        </div>
                    </div>
                    
                    <div style="text-align:center; color:#888; font-size:0.8rem; margin-top:8px; display:none;" class="ks-full-hint">
                        ※ 整張檢視模式下，可向左滑動檢視解曰
                    </div>
                </div>
            `;
};

window.extraDeities = window.extraDeities || []; // 用來存放外掛進來的神明
window.extraDeities.push({
    id: 'Kongming_32',
    name: '孔明先師',
    iconType: 'emoji',
    iconVal: '🤴',
    builtInImg: './deitypoem/Kongming.jpg', // 🌟 內建圖片路徑
    cloudImgUrl:'', // 👈 Firebase 給的網址
    temple: '魚池鄉啟示玄機院',
    committee: '',
    address: '南投縣魚池鄉中明村\n電話:049-2895064',  // ★ 內建地址與電話
    rightText: '',    // 內建右側字
    leftText: '',     // 內建左側字
    circleText: false,  // 預設開啟圓圈
    sysId: 'Kongming_32'
});