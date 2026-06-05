// ==========================================
// ★ 苗栗玉清宮擴充包：繼承雷雨師，擴充籤王與英文解說
// ==========================================
window.poemSystems = window.poemSystems || {};
window.customPoemTemplates = window.customPoemTemplates || {};
window.extraDeities = window.extraDeities || [];

if (!window.poemSystems['Leiyushi_100']) {
    console.error("【玉清宮載入失敗】請確認 div_data_leiyushi.js 已在 HTML 中優先載入！");
} else {
    // 1. 【繼承魔法】深拷貝雷雨師資料
    const yucingContent = JSON.parse(JSON.stringify(window.poemSystems['Leiyushi_100'].content));

    // 2. 【擴充籤王】加入 0 號籤 (籤王)
    yucingContent[0] = {
        lot: 0,
        level: "籤王",
        l1: "求得籤王百事良", l2: "萬事如意大吉昌", l3: "宜加力作行方便", l4: "可保福壽永安康",
        meaning: "百事皆吉、求財得利、病得安康。",
        english: "This divination tells of the greatest possible good fortune, shining most auspiciously on every aspect of your life, provided only that you hold sincerely true to your faith."
    };

    // 3. 【擴充原有資料】幫原本的雷雨師 1~100 籤加上英文解說
    if (yucingContent[1]) {
        yucingContent[1].english = "This is a superlative divination message. You will enjoy great fortune and favor, all that you place your hopes in can be smoothly and gratifyingly attained, and the door will be open for gaining career advancement.";
        yucingContent[2].english = "Do not act in haste. Wait for a favorable time before taking action. You need to make a habit of self-cultivation and accumulating merit. Keep good thoughts in your heart, make sure to pray for heaven's blessing, and all will naturally turn out well.";
        yucingContent[3].english = "You should stick to old ways, and remain in your proper sphere in all things. Do not be greedy, and you will never want for the basic necessities of life. As the old saying goes: \"If something is predestined for you, you will have it sooner or later; if it isn't predestined, there's no use being importunate for it.\"";
        yucingContent[4].english = "Good fortune has left you, and woe is drawing near. Ill fortune will cast a cloud over you before good fortune returns. Your plans and hopes will be very hard to achieve, and you can only pray to the gods for their protection.";
        yucingContent[5].english = "Anxiety will be followed by joy, bad luck followed by good. Though things are not as you would wish them now, you just need to be patient while waiting for autumn to pass and spring to arrive. As all life blooms anew in the spring, everything will then go smoothly for you. For now, be stoical and hold on.";
        yucingContent[6].english = "Hard toil has worn you down. You should just look after yourself, and not do anything impetuously, since nothing is ripe for change. Everything will work out fortunately if you keep god-sent guidance in mind.";
        yucingContent[7].english = "For those who are wealthy, this divination indicates self-ability to gain their heart's desires. If you are in straitened and humble circumstances, you still can seek and gain peace, and do not need to be troubled by anything.";
        yucingContent[8].english = "You have worked painfully hard to gain the rich rewards you enjoy today, and you should grasp them well. While your past efforts are just beginning to pay you back, many more good things will be coming to you in the future.";
        yucingContent[9].english = "You can now enjoy a great harvest after a long wait. Everything can turn out just as you would wish it.";
        yucingContent[10].english = "You are going through a period of bad fortune now. At this time, you should cultivate your heart and nature, do good deeds to accumulate virtue, and pray for the blessing of the gods. Then, your fortune will be transformed in the natural way of things.";
        yucingContent[11].english = "Nothing has been going well for you, and you need to be cautious. Do not ask for too much, but take what comes to you and be glad of it. Greediness will only bring you harm and loss.";
        yucingContent[12].english = "You never seem able to bring your best plans to fruition. You need support from others as the only way to be sure of earning a living securely and not having to worry about being provided with the basic necessities of life.";
        yucingContent[13].english = "You are experiencing a dip in your luck. All you can do is keep your head down, do as you need to, and avoid acting without the most careful thought. Bide your time at present for the sake of achieving success later on.";
        yucingContent[14].english = "Initial joy will turn to sorrow. Do not let a momentary sentiment lead you into making a mistake, when regret will already be too late. Good things will be hard to bring to fruition, grievance will arise among those close to you, trouble will be hard to avoid, the path to marriage will be rough, and things easily begun will be hard to carry through. You should be very cautious in your social intercourse, to avoid any later remorse.";
        yucingContent[15].english = "Everything should be put off until the lunar new year, for only then can your heart's desire be gained. If you act impetuously, your efforts will be futile, and you are hardly likely to end up with what you desire.";
        yucingContent[16].english = "Do not rashly heed other people's incitement, and so lose your direction. Know your own mind in all matters, and talks things over with your own brothers, for only thus will you reach correct decisions.";
        yucingContent[17].english = "Act in accordance with your duty, follow the path of righteousness, and then you will naturally have successful outcomes.";
        yucingContent[18].english = "You should slow everything down, and not rush into action. Keep your feet on the ground, be earnest, go forward unhurriedly and steadfastly, then you may be able to achieve satisfactory results.";
        yucingContent[19].english = "Your luck is opening up in a big way, and everything should start working out very smoothly and satisfyingly for you. Almost anything that you ask for could be attained.";
        yucingContent[20].english = "You are now rather isolated and cut off from help, sighing for want of financial assistance from a benefactor. You are also frustrated that your talents are unrecognized, and your ambitions are hard to pursue. With everything so inauspicious, you need to be guarded and discreet for your own protection.";
        yucingContent[21].english = "It is better to end an enmity than to keep it alive. You need to bury the hatchet and mend fences. If you keep positive thoughts of each other in your hearts, and act philanthropically, you can move the gods and gain their protective blessing.";
        yucingContent[22].english = "You have cultivated your moral character very well in the past, and have gained considerable karmic reward. Hence, heaven ordains that you are blessed with good luck on all sides, and that no hand of man is needed to bring good fortune to you and make whatever ills you encounter turn to good.";
        yucingContent[23].english = "Pay heed to this warning that you must keep your life free from extravagance and dissipation, or else everything will turn to nothing. Take precautions against possible disasters, and thoroughly transform your ways: Be penitent, spurn wickedness, practice good deeds, cultivate your moral character, and hold fast to mindfulness.";
        yucingContent[24].english = "The first steps are always the most difficult, or will be fraught with many obstacles. But just so long as you persist to the end, you will surely be able to accomplish your goals.";
        yucingContent[25].english = "Everything has its season. For now, you just need to wait for the right time to come, and the joys of spring will return.";
        yucingContent[26].english = "Though things are not yet going well for you at present, it is presaged that within three days a great opportunity will come knocking on your door, and you need to grasp it securely.";
        yucingContent[27].english = "Do not take a speculative path or take advantage of influence and connections. Plant your feet on the ground and do things by the book. Even if you are blessed with great advantages, you still need to work hard at endeavors before you can gain good results. If you lack such advantages, then you need to work twice as hard.";
        yucingContent[28].english = "Everything depends on putting in hard work to gain results. As long as your endeavors comply with heavenly principles, and are not reckless or rash, all of your hopes can be realized.";
        yucingContent[29].english = "You can do all things as long as you are morally upright. Then you will be rewarded with the blessings you wish for.";
        yucingContent[30].english = "You have fallen into a state of inner conflict. The more you yearn for your hopes, the less able you are to achieve them. The only thing to do is start from the heart, be upright of mind, and good fortune will naturally come your way.";
        yucingContent[31].english = "In autumn and winter, your fortune is flat, and you should not rush into action. Wait until spring, and then your fortune will gradually become more propitious.";
        yucingContent[32].english = "Nothing is working out smoothly for you. In life and interaction with people, avoid dispute and quarrel, strive to get along harmoniously, and then your fortune will change.";
        yucingContent[33].english = "No need to be concerned about what happens in this world, and no need to be concerned about what fortune will bring you in the future. Put everything to the back of your mind, and do not think too much.";
        yucingContent[34].english = "This matter is not going smoothly, but later on you can expect to receive help from a benefactor. Be reminded that you should be less selfish and display more true friendship, for this can be helpful to all you ask for.";
        yucingContent[35].english = "Though things may seem to be going very well for you at present, accidents may fall at any time out of clear skies. Good luck may turn to bad, and things may change in the future. Dangers are lurking that could threaten your life, and you cannot be heedless of them.";
        yucingContent[36].english = "Success will come to you relatively late, but you need to be patient and not act in haste, or else you will only slow things down by trying to speed them up.";
        yucingContent[37].english = "If matters are proving troublesome, there is no one to blame but yourself. If you can start by changing yourself, your affairs can change for the good.";
        yucingContent[38].english = "What you are asking for is likely to have a poor outcome. Do not rush into any decision, but tranquilly wait for the situation to change. Look upon further harshness of fortune as a tempering sent by heaven.";
        yucingContent[39].english = "Be cautious and think clearly before you embark on any action. Do not act rashly. Look upon unlawful and unreasonable matters with magnanimity and tolerance, and do not casually expose them in correspondence.";
        yucingContent[40].english = "You need to be resolute in all matters, know your own mind, and not be swayed by others' opinions. As long as you make changes according to your own inner voice, your future will be bright.";
        yucingContent[41].english = "Tasks that are difficult at the outset will later become easy. Everything depends on yourself, and you cannot depend on anyone else. The years of the rat and the ox will be propitious for all you ask for, or will bring you a benefactor.";
        yucingContent[42].english = "You need to start with a clean slate, do more good deeds, and cultivate virtue. If you can do thus, you will be able to smoothly attain what you seek, and be aided by the gods in light and dark.";
        yucingContent[43].english = "Bad fortune will be succeeded by good. In all your affairs and strivings, you will be under the protection of the gods. You will have a scare, but not be in danger, and will turn ill luck into good fortune, so that in the end, you will be able to pull through all difficulties.";
        yucingContent[44].english = "A momentary error of conduct has caused you to do wrong and stir up trouble. If you are repentant, fame and fortune will be within reach. Acknowledging a fault goes halfway to redressing it.";
        yucingContent[45].english = "Even though you are morally upright and a good person, others may still treat you impolitely, and you need to be mentally prepared for this. Adhere to your virtue, and you are sure to be well rewarded for it in the future.";
        yucingContent[46].english = "Exercise caution in everything you do. You cannot just go ahead and do whatever you think of doing, but must think it over very thoroughly.";
        yucingContent[47].english = "Act always with a calm mind and even temper. Pay heed to dissuading voices, be quick to repent of your mistakes, and do not act on impulse. Make sure to reflect on yourself and exercise self-restraint, then misfortune will naturally disappear without a trace.";
        yucingContent[48].english = "A person you meet with may be your benefactor, so you must not miss this chance. Under this person's guidance and assistance, you will be able to put the troublesome face of your affairs behind you.";
        yucingContent[49].english = "A bad attitude that you harbor in your heart is causing difficulty in your affairs. If you can reflect on yourself and change this attitude to good, such problem will naturally be resolved.";
        yucingContent[50].english = "This year is markedly better than last, with your fortune steadily improving. As long as you behave in a fit and proper way, you will enjoy more good fortune.";
        yucingContent[51].english = "You ought not to mind too much about a momentary frustration. A stroke of good fortune to be cherished will be coming your way very soon.";
        yucingContent[52].english = "Your luck is presently at a low ebb, and you feel alone and helpless. However, autumn will bring an upturn in your fortune, and from then on your plight will be set at rest.";
        yucingContent[53].english = "You seem to run against a wall in everything you do. But as summer gives way to autumn, you will receive powerful help from another, and all will start to change for the better.";
        yucingContent[54].english = "Things have not been turning out the way you want them to. You just have to preserve your accomplishments, and not act rashly, otherwise your efforts will come to waste. You must work hard, and hold on in wait for good fortune.";
        yucingContent[55].english = "Take things as they are, accept what is allotted to you, and do not ask for too much. Be honest and incorruptible, industrious and thrifty, and if you can be thus, you will be able to live your life in peace.";
        yucingContent[56].english = "Do not put your faith in luck, but act uprightly and rationally, do good deeds and accumulate virtue, then you will be able to stave off dreadful misfortune.";
        yucingContent[57].english = "Do not let others make decisions for you, because that is sure to have a bad outcome. Have faith in your own judgment.";
        yucingContent[58].english = "You rely on your smoothness of tongue to earn your daily bread and keep from want of necessities. If you wish to gain constant prosperity and rank, be sure to do more good deeds, for only thus will your future prospects be more enduring and favorable.";
        yucingContent[59].english = "You were not born with much luck, so your ventures do not run smoothly. Even if you pray to the gods, it will be of little use, because your morality and conduct fall short of earning their favor. However, thanks to your ancestors' virtue, there is still a thread of hope for you. If you do more good deeds and accumulate merit, you can smooth the course of your ventures.";
        yucingContent[60].english = "Great things happen in pairs. All your requests can be fulfilled. Refrain from vanity, stay humble, do not spur or envy your fellow pupils, and good fortune can stay with you always.";
        yucingContent[61].english = "Whatever dangerous situation you encounter will be resolved by itself. But if you respond to it with the heart of a villain, you will instead make it into a source of distress. You should cultivate a just and honorable heart.";
        yucingContent[62].english = "You have weathered some major storms and come through them unscathed. You can look forward to an easy life in your later years, and enjoy many happy events.";
        yucingContent[63].english = "You need to be patient and endure hard work to attain your ambitions. Success can be yours if you have the stamina to endure these challenges.";
        yucingContent[64].english = "This is the very best of divinations. Everything can turn out as you wish, you will gain preferment from a benefactor, and your comings and goings will all be attended by good fortune.";
        yucingContent[65].english = "Your luck, which has been stagnant, is now free from any obstruction, and your wishes can come true. A benefactor will appear to help you bring your ideas to reality, and you must grasp this fine opportunity.";
        yucingContent[66].english = "You should not travel afar and should just stick to old ways. There will be an unending series of happy events in your family. As long as you hold on to your original family property, you will have very good progression.";
        yucingContent[67].english = "What goes around comes around. If you do not rid your heart of ill thoughts, you will be visited by misfortune.";
        yucingContent[68].english = "Be content with your lot in life. Otherwise, covetous thoughts will bring you misfortune.";
        yucingContent[69].english = "Keep your feet planted firmly on the ground in all you do. Guard against being injured by villainous relative or friend. Do not lust for fame and gain, but just hold on securely to what you have.";
        yucingContent[70].english = "In all matters you need to wait for the right time to come, for only then can you gain success. Say your prayers with sincerity, and your future will surely run smoothly.";
        yucingContent[71].english = "Things will become much easier after initial difficulties. What you are asking for cannot be attained in your early years, but must be delayed until your later years, and will also mean wiping the slate clean for a fresh start.";
        yucingContent[72].english = "Your fortune is not good at present, and you must patiently wait for the opportune time to arrive. For goodness sake do not be impatient, or else you will usher in misfortune.";
        yucingContent[73].english = "Vows you made before have long since been overtaken by change. There is no need to go on waiting, but be quick to see the facts as they are, wipe the slate clean, and you will have a fresh start.";
        yucingContent[74].english = "Though you are in a tight spot, you will not be affected by it at all. As long as you keep good thoughts in your heart, you will be sure of a good outcome, and will be favored by fortune in subsequent matters.";
        yucingContent[75].english = "You are going to meet a like-minded person, or your dealings are going to succeed to your heart's desire. All will naturally come about by the will of heaven. But all of these things are predestined by a former existence, and you must understand to cherish this.";
        yucingContent[76].english = "The misfortunes and blessings in your life are all completely determined by your own conduct.";
        yucingContent[77].english = "You should properly self-reflect on the root causes of all things that happen, not just look at their outward appearance, and not lend a ready ear to slander. You need to be able to distinguish between right and wrong, and also be cautious in your words and actions, then you will naturally keep misfortune at bay and bring on good fortune.";
        yucingContent[78].english = "Good or bad fortune is of your own making. If you do good deeds you will be able to attract good fortune. Conversely, if you engage in bad behavior, you will only pitch yourself into misfortune.";
        yucingContent[79].english = "Do everything in accordance with heavenly principles. Do not go against common sense and commit foolish acts, otherwise you will only bring misfortune upon yourself.";
        yucingContent[80].english = "You must change to some extent as the only way you will be able to transform bad fortune to good. Do not underestimate its importance, or bear doubt in your heart. Rouse yourself to act, and your fortune will also change along with it.";
        yucingContent[81].english = "Heaven's justice is slow but sure. If karmic return has not been forthcoming, it means the time for it has not yet come. Do not deliberately take advantage of others.";
        yucingContent[82].english = "If you encounter wise and able people, you should associate with them as much as you can. They can be the stepping stones of your future advancement.";
        yucingContent[83].english = "Focus on preserving the achievements of your predecessors, and do not overstep your boundaries. Delusional thinking will only entrap you in suffering and increased vexation.";
        yucingContent[84].english = "Do not hang onto what other people say, but have your own thoughts. You should be particularly careful of heeding females in your family. You need to be firm in confidence and set to work with resolution, acting decisively and without hesitation, and then things are sure to turn out as you wish.";
        yucingContent[85].english = "You should just keep within your own bounds, and not make presumptuous demands. Do not charge forward on a whim and without knowing how to retreat. Sometimes, mulling how to back off completely could be the best approach.";
        yucingContent[86].english = "You should proceed in an orderly way step by step, mindful that more haste results in less speed. Keep kindness in your heart, and your days of affluence and happiness can be made to last, while the future will surely be even better than the present.";
        yucingContent[87].english = "Be sincere and respectful toward other people, and conduct yourself with openhearted integrity. Then you will be able to avoid courting misfortune, and turn bad luck into good.";
        yucingContent[88].english = "Your luck is about to take a positive turn, and you must grasp this good fortune. Do not let the complacency of a moment cause this great chance to be wasted.";
        yucingContent[89].english = "Your luck is down at present. You must exercise patience and await your opportunity. If you are unable to bide your time in an optimistic frame of mind, you will only nurse resentment in your heart, and harm the good fortune of your late years.";
        yucingContent[90].english = "Your fate bears no promise of great riches. You are destined to lead a simple life, but will not suffer from want of food. It will be no use pleading to the gods for more, and you have no choice but to be content with your lot.";
        yucingContent[91].english = "There is no free lunch in the world. You have to work hard for fortune and fame.";
        yucingContent[92].english = "You are beset by poor fortune this year, and nothing is going well. You will have to wait until the winter solstice at the year's end before things can look up. You must be particularly cautious in attitude and careful in actions.";
        yucingContent[93].english = "Your plans will stutter in the beginning, but at last sweet rainfall will end the drought, and the crisis will be solved.";
        yucingContent[94].english = "You are frequently absorbed in meticulously studying a craft. Wait for your opportunity, and when the time comes, you will meet people who recognize the worth of your skills.";
        yucingContent[95].english = "The timing is bad right now. Your fame and fortune will come later on. You need to work hard at strengthening your abilities, and when a benefactor shows up to give you a hand, it will be the time for your luck to turn.";
        yucingContent[96].english = "All things are more difficult at the start. You need to do good deeds and accumulate merit, and eventually you are sure to be able to achieve your aims to your full satisfaction.";
        yucingContent[97].english = "Success and recognition will come to you late, with wealth and rank coming unasked for after middle age. Always keep good thoughts in your heart, for that is the best way to preserve wealth and rank, and thereafter you will be successful in all that you wish for.";
        yucingContent[98].english = "Your time has not yet come. You will have to go through a period of hard work and disappointments before the right time arrives, and only then will your fortune gradually enter into a positive phase.";
        yucingContent[99].english = "Your luck has previously been rather flat, but will subsequently run more benignly. As your fortune gradually enters an uplifted phase, you will be able to meet a benefactor who helps you gain promotion, and all will run smoothly for you.";
        yucingContent[100].english = "As long as you pray with sincerity of heart, all can go well for you. No matter what you wish to do, just go ahead and do it.";
    }

    // 4. 註冊玉清宮系統
    window.poemSystems['Yucing_101'] = {
        id: 'Yucing_101',
        name: '苗栗玉清宮籤詩',
        total: 101, // 100首 + 1首籤王
        format: 'yucing',
        category: 'leiyushi',
        isBase: false,
        content: yucingContent
    };

    window.customPoemTemplates['yucing'] = function (poem, cleanLotNum, templeName, deity, customData) {
        // 1. 先呼叫雷雨師把主體畫出來
        let baseHtml = window.customPoemTemplates['leiyushi'](poem, cleanLotNum, templeName, deity, customData);

        // 2. 如果有英文，就進行高度解鎖並塞入英文區塊
        if (poem && poem.english) {

            // ★ 解開雷雨師的比例與高度封印
            // 拔掉 aspect-ratio 比例限制
            baseHtml = baseHtml.replace(/aspect-ratio:\s*100\s*\/\s*235\s*!important;?/, 'height: auto !important;');
            // 把內層框線的 height: 100% 換成 auto，讓紅框能往下長
            baseHtml = baseHtml.replace(/height:\s*100%;/g, 'height: auto; min-height: 100%;');

            // 英文區塊設計 (帶有上方紅線區隔)
            const engHtml = `
        <div style="width: 100%; box-sizing: border-box; padding: 2cqw; border-top: 2px solid #8b0000; font-family: sans-serif; font-size: 3.5cqw; text-align: left; background:#fdfbf7;">
            <div style="color: #8b0000; font-weight: bold; margin-bottom: 1cqw;">English Translation:</div>
            <div style="color: #333; line-height: 1.6;">${poem.english}</div>
        </div>`;

            // 將英文塞入倒數兩個 </div> 之前 (確保它包在紅框裡面)
            baseHtml = baseHtml.replace(/(<\/div>\s*<\/div>\s*)$/, engHtml + '\n$1');
        }

        return baseHtml;
    };

    // 6. 新增神明
    window.extraDeities.push({
        id: 'Yucing_Gong',
        name: '玉清宮關聖帝君',
        iconType: 'emoji',
        iconVal: '🧔',
        builtInImg: '', // 🌟 內建圖片路徑
        cloudImgUrl:'', // 👈 Firebase 給的網址
        temple: '玉清宮',
        sysId: 'Yucing_101'
    });
}