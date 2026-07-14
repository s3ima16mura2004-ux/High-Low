// --- ゲームの状態を管理する変数 ---
let currentUser = ""; 
let currentCard = { suit: '', value: 0 };
let nextCard = { suit: '', value: 0 };
let streak = 0; 
let coins = 100; 
let passCount = 1;
let hasShield = false;

// 🎰 ダブルアップ用の変数
let isDoubleUpMode = false;
let pooledCoins = 0; 

// ユーザーごとの最高記録
let maxStreak = 0;
let maxCoins = 100;

const suits = ['clover', 'dia', 'heart', 'spades'];

// 🎯 デイリーミッション用の変数
let dailyMissions = []; 
let missionProgress = {}; 
let lastMissionDate = ""; 
let isCompleteRewardClaimed = false; 

// 🎡 ガチャ・コレクション・アイテム用の変数
let unlockedTitles = ["[初心者]"]; 
let unlockedSkins = ["default"];   
let activeTitle = "[初心者]";       
let activeSkin = "default";         
let itemPassCount = 0;             
let itemShieldCount = 0;           

// 🎨 スキン（背景テーマ）の定義
const SKINS_CONFIG = {
    default: {
        name: "デフォルト（紺）",
        background: "linear-gradient(135deg, #1e1e2f, #2a2a40)",
        cardAreaBg: "rgba(255, 255, 255, 0.05)",
        btnBg: "linear-gradient(135deg, #4facfe, #00f2fe)"
    },
    forest: {
        name: "フォレスト（緑）",
        background: "linear-gradient(135deg, #11998e, #38ef7d)",
        cardAreaBg: "rgba(0, 0, 0, 0.2)",
        btnBg: "linear-gradient(135deg, #11998e, #38ef7d)"
    },
    wolf: {
        name: "漆黒のウルフ（黒/赤）",
        background: "linear-gradient(135deg, #0f0c1b, #240b36)",
        cardAreaBg: "rgba(255, 0, 0, 0.05)",
        btnBg: "linear-gradient(135deg, #f12711, #f5af19)"
    },
    gorgeous: {
        name: "ゴージャス（金/紫）",
        background: "linear-gradient(135deg, #4e085e, #c08c10)",
        cardAreaBg: "rgba(255, 215, 0, 0.1)",
        btnBg: "linear-gradient(135deg, #ffd700, #ffa500)"
    }
};

// 🎯 マスターミッションプール（全12種類）
const MISSION_POOL = [
    { id: "m_streak",   text: "🔥 連勝の達人 (5連勝達成)", target: 5, reward: 50,  type: "count" },
    { id: "m_just",     text: "⚡ ジャストブレイカー (JUSTを1回的中)", target: 1, reward: 100, type: "count" },
    { id: "m_shield",   text: "🛡️ 鉄壁の守護 (シールド所持中に正解)", target: 1, reward: 40,  type: "count" },
    { id: "m_dia",      text: "♦️ ダイヤコレクター (♦ボーナスを累計2回発生)", target: 2, reward: 40,  type: "count" },
    { id: "m_highbet",  text: "💰 ハイローラー (30枚以上ベットして正解)", target: 1, reward: 50,  type: "count" },
    { id: "m_pass",     text: "🌀 パス使い (パスを累計2回使用)", target: 2, reward: 30,  type: "count" },
    { id: "m_bigwin",   text: "💎 大富豪への道 (一度に100枚以上獲得して確定)", target: 1, reward: 60,  type: "count" },
    { id: "m_spade",    text: "♠️ スペードの挑戦 (♠効果中に予測正解)", target: 1, reward: 50,  type: "count" },
    { id: "m_heart_get", text: "❤️ 愛の獲得者 (ハート効果でシールドを累計2回獲得)", target: 2, reward: 40, type: "count" },
    { id: "m_win_streak_3", text: "🥉 かけだし勝負師 (3連勝を累計2回達成)", target: 2, reward: 30, type: "count" },
    { id: "m_double_collect", text: "🎰 堅実なるコレクター (ダブルアップ成功後に2回コレクト)", target: 2, reward: 50, type: "count" },
    { id: "m_comeback", text: "❤️‍🩹 不死鳥の如く (シールド消費による身代わりを1回発生)", target: 1, reward: 40, type: "count" }
];

// --- HTMLの要素を取得 ---
const currentCardImg = document.getElementById('current-card-img');
const nextCardInner = document.getElementById('next-card-inner'); 
const nextCardImg = document.getElementById('next-card-img');

const messageEl = document.getElementById('message');
const streakEl = document.getElementById('streak');
const maxStreakEl = document.getElementById('max-streak'); 
const coinsEl = document.getElementById('coins'); 
const maxCoinsEl = document.getElementById('max-coins'); 
const betInput = document.getElementById('bet-input'); 
const btnHigh = document.getElementById('btn-high');
const btnJust = document.getElementById('btn-just'); 
const btnLow = document.getElementById('btn-low');
const btnReset = document.getElementById('btn-reset');
const btnPass = document.getElementById('btn-pass'); 
const passCountEl = document.getElementById('pass-count'); 
const shieldStatusEl = document.getElementById('shield-status');

// 🎰 ダブルアップ用の要素
const doubleUpGroup = document.getElementById('double-up-group');
const poolCoinsEl = document.getElementById('pool-coins');
const btnCollect = document.getElementById('btn-collect');
const btnDoubleContinue = document.getElementById('btn-double-continue');

// 🔑 ログイン・ユーザー管理用の要素
const loginArea = document.getElementById('login-area');
const gamePlayArea = document.getElementById('game-play-area');
const userStatusArea = document.getElementById('user-status-area');
const currentUserDisplay = document.getElementById('current-user-display');
const usernameInput = document.getElementById('username-input');
const btnLogin = document.getElementById('btn-login');
const btnLogout = document.getElementById('btn-logout');
const userSelectContainer = document.getElementById('user-select-container');
const userSelect = document.getElementById('user-select');

// 🎯 ミッション表示用の要素
const missionListUI = document.getElementById('mission-list');
const missionDateUI = document.getElementById('mission-date');

// 🎡 ガチャ・コレクション用の要素
const titleDisplayEl = document.getElementById('title-display');
const btnGachaEl = document.getElementById('btn-gacha');
const gachaResultEl = document.getElementById('gacha-result');
const gachaResultTextEl = document.getElementById('gacha-result-text');
const selectTitleEl = document.getElementById('select-title');
const selectSkinEl = document.getElementById('select-skin');
const countItemPassEl = document.getElementById('count-item-pass');
const countItemShieldEl = document.getElementById('count-item-shield');
const btnUseItemPassEl = document.getElementById('btn-use-item-pass');
const btnUseItemShieldEl = document.getElementById('btn-use-item-shield');

// --- 🔑 ユーザーデータの保存・読み込みロジック (LocalStorage) ---

function getUserList() {
    const list = localStorage.getItem('hl_user_list');
    return list ? JSON.parse(list) : [];
}

function updateUserSelectDropdown() {
    const users = getUserList();
    if (users.length > 0) {
        userSelect.innerHTML = '<option value="">-- 選択してください --</option>';
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user;
            option.textContent = user;
            userSelect.appendChild(option);
        });
        userSelectContainer.style.display = 'block';
    } else {
        userSelectContainer.style.display = 'none';
    }
}

// セーブ機能
function saveUserData() {
    if (!currentUser) return;
    
    const userData = {
        coins: coins,
        streak: streak,
        maxCoins: maxCoins,
        maxStreak: maxStreak,
        passCount: passCount,
        hasShield: hasShield,
        dailyMissions: dailyMissions,
        missionProgress: missionProgress,
        lastMissionDate: lastMissionDate,
        isCompleteRewardClaimed: isCompleteRewardClaimed,
        unlockedTitles: unlockedTitles,
        unlockedSkins: unlockedSkins,
        activeTitle: activeTitle,
        activeSkin: activeSkin,
        itemPassCount: itemPassCount,
        itemShieldCount: itemShieldCount
    };
    
    localStorage.setItem(`hl_user_${currentUser}`, JSON.stringify(userData));

    const users = getUserList();
    if (!users.includes(currentUser)) {
        users.push(currentUser);
        localStorage.setItem('hl_user_list', JSON.stringify(users));
    }
}

// ロード機能
function loadUserData(username) {
    currentUser = username;
    const dataStr = localStorage.getItem(`hl_user_${username}`);
    const todayStr = getTodayString(); 

    if (dataStr) {
        const data = JSON.parse(dataStr);
        coins = data.coins ?? 100;
        streak = data.streak ?? 0;
        maxCoins = data.maxCoins ?? 100;
        maxStreak = data.maxStreak ?? 0;
        passCount = data.passCount ?? 1;
        hasShield = data.hasShield ?? false;
        
        lastMissionDate = data.lastMissionDate ?? "";
        isCompleteRewardClaimed = data.isCompleteRewardClaimed ?? false;

        unlockedTitles = data.unlockedTitles ?? ["[初心者]"];
        unlockedSkins = data.unlockedSkins ?? ["default"];
        activeTitle = data.activeTitle ?? "[初心者]";
        activeSkin = data.activeSkin ?? "default";
        itemPassCount = data.itemPassCount ?? 0;
        itemShieldCount = data.itemShieldCount ?? 0;

        if (lastMissionDate !== todayStr) {
            generateDailyMissions(todayStr);
        } else {
            dailyMissions = data.dailyMissions ?? [];
            missionProgress = data.missionProgress ?? {};
            if (dailyMissions.length === 0) generateDailyMissions(todayStr);
        }
    } else {
        coins = 100;
        streak = 0;
        maxCoins = 100;
        maxStreak = 0;
        passCount = 1;
        hasShield = false;
        
        unlockedTitles = ["[初心者]"];
        unlockedSkins = ["default"];
        activeTitle = "[初心者]";
        activeSkin = "default";
        itemPassCount = 0;
        itemShieldCount = 0;

        generateDailyMissions(todayStr);
    }

    currentUserDisplay.textContent = currentUser;
    titleDisplayEl.textContent = activeTitle;
    streakEl.textContent = streak;
    maxStreakEl.textContent = maxStreak;
    coinsEl.textContent = coins;
    maxCoinsEl.textContent = maxCoins;
    passCountEl.textContent = passCount;
    
    updateShieldUI();
    updateMissionUI();
    updateCollectionUI();
    applySkin(activeSkin);

    loginArea.style.display = 'none';
    userStatusArea.style.display = 'flex';
    gamePlayArea.style.display = 'block';

    initGame(true); 
}

function getTodayString() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function generateDailyMissions(todayStr) {
    lastMissionDate = todayStr;
    isCompleteRewardClaimed = false; 
    missionProgress = {};

    const shuffled = [...MISSION_POOL].sort(() => Math.random() - 0.5);
    dailyMissions = shuffled.slice(0, 5);

    dailyMissions.forEach(m => {
        missionProgress[m.id] = {
            current: 0,
            cleared: false
        };
    });
}

function updateMissionUI() {
    missionDateUI.textContent = lastMissionDate;
    missionListUI.innerHTML = ""; 

    let totalCleared = 0;

    dailyMissions.forEach((m, index) => {
        const prog = missionProgress[m.id];
        if (!prog) return;

        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.alignItems = 'center';
        li.style.padding = '6px 0';
        if (index < 4) li.style.borderBottom = '1px dashed rgba(255,255,255,0.1)';

        const spanText = document.createElement('span');
        spanText.textContent = m.text;

        const spanStatus = document.createElement('span');
        spanStatus.className = "mission-status";
        spanStatus.style.fontWeight = "bold";

        if (prog.cleared) {
            spanStatus.textContent = `🎉 クリア! (+${m.reward})`;
            spanStatus.style.color = "#00ffcc";
            totalCleared++;
        } else {
            spanStatus.textContent = `進行中 (${prog.current}/${m.target})`;
            spanStatus.style.color = "#ffb703";
        }

        if (!prog.cleared) {
            if (m.id === "m_streak") spanStatus.textContent = `進行中 (${Math.min(streak, m.target)}/${m.target})`;
            if (m.id === "m_shield" && hasShield) {
                spanStatus.textContent = "🛡️ 準備OK! (正解で達成)";
                spanStatus.style.color = "#ff416c";
            }
        }

        li.appendChild(spanText);
        li.appendChild(spanStatus);
        missionListUI.appendChild(li);
    });

    if (totalCleared === 5 && !isCompleteRewardClaimed) {
        isCompleteRewardClaimed = true;
        const rewardAmount = 150;
        coins += rewardAmount;
        coinsEl.textContent = coins;
        saveUserData();

        setTimeout(() => {
            alert(`🏆🏆🏆 PERFECT CLEAR!!! 🏆🏆🏆\n\n本日のデイリーミッションをすべて達成しました！\nコンプリートボーナスとして【 ${rewardAmount} コイン 】がプレゼントされました！`);
        }, 1200);
    }
}

function progressMission(id, amount = 1) {
    if (!missionProgress[id] || missionProgress[id].cleared) return;

    const m = dailyMissions.find(item => item.id === id);
    if (!m) return;

    missionProgress[id].current += amount;

    if (missionProgress[id].current >= m.target) {
        missionProgress[id].current = m.target;
        missionProgress[id].cleared = true;
        coins += m.reward;
        coinsEl.textContent = coins;
        
        setTimeout(() => {
            alert(`🎯 ミッション達成！\n\n【${m.text}】\n報酬: ＋${m.reward} コインを獲得しました！`);
        }, 600);
    }
    updateMissionUI();
    saveUserData();
}

// --- ガチャ・コレクションのロジック ---

function drawGacha() {
    if (coins < 100) {
        alert("コインが足りません！ガチャを引くには100コイン必要です。");
        return;
    }

    coins -= 100;
    coinsEl.textContent = coins;
    
    const rand = Math.random() * 100;
    let rewardType = "";
    let rewardObj = null;

    if (rand < 40) {
        rewardType = "title";
        const titleRand = Math.random() * 100;
        if (titleRand < 5) rewardObj = "🎰 神引きの伝説";
        else if (titleRand < 15) rewardObj = "JUSTを極めし者";
        else if (titleRand < 35) rewardObj = "シールドマスター";
        else rewardObj = "一獲千金";
    } else if (rand < 70) {
        rewardType = "skin";
        const skinRand = Math.random() * 100;
        if (skinRand < 20) rewardObj = "gorgeous"; 
        else if (skinRand < 50) rewardObj = "wolf";     
        else rewardObj = "forest";                      
    } else {
        rewardType = "item";
        rewardObj = (Math.random() < 0.5) ? "item_pass" : "item_shield";
    }

    let displayText = "";
    let isDuplicate = false;

    if (rewardType === "title") {
        const titleName = `[${rewardObj}]`;
        if (unlockedTitles.includes(titleName)) {
            isDuplicate = true;
            coins += 50; 
            displayText = `称号「${titleName}」(重複のため🪙50返還！)`;
        } else {
            unlockedTitles.push(titleName);
            displayText = `新称号：${titleName}！`;
        }
    } else if (rewardType === "skin") {
        const skinId = rewardObj;
        const skinName = SKINS_CONFIG[skinId].name;
        if (unlockedSkins.includes(skinId)) {
            isDuplicate = true;
            coins += 50; 
            displayText = `スキン「${skinName}」(重複のため🪙50返還！)`;
        } else {
            unlockedSkins.push(skinId);
            displayText = `新スキン：${skinName}！`;
        }
    } else if (rewardType === "item") {
        if (rewardObj === "item_pass") {
            itemPassCount++;
            displayText = `お助けアイテム「🌀パス回数＋1」を獲得！`;
        } else {
            itemShieldCount++;
            displayText = `お助けアイテム「🛡️初期シールド」を獲得！`;
        }
    }

    coinsEl.textContent = coins;
    
    gachaResultEl.style.display = "block";
    gachaResultTextEl.textContent = displayText;

    updateCollectionUI();
    saveUserData();
}

function updateCollectionUI() {
    selectTitleEl.innerHTML = "";
    unlockedTitles.forEach(t => {
        const opt = document.createElement("option");
        opt.value = t;
        opt.textContent = t;
        if (t === activeTitle) opt.selected = true;
        selectTitleEl.appendChild(opt);
    });

    selectSkinEl.innerHTML = "";
    unlockedSkins.forEach(s => {
        const opt = document.createElement("option");
        opt.value = s;
        opt.textContent = SKINS_CONFIG[s].name;
        if (s === activeSkin) opt.selected = true;
        selectSkinEl.appendChild(opt);
    });

    countItemPassEl.textContent = itemPassCount;
    countItemShieldEl.textContent = itemShieldCount;

    const isPlaying = (streak > 0 || isDoubleUpMode);
    btnUseItemPassEl.disabled = isPlaying || itemPassCount <= 0;
    btnUseItemShieldEl.disabled = isPlaying || itemShieldCount <= 0 || hasShield;
}

function applySkin(skinId) {
    const cfg = SKINS_CONFIG[skinId] || SKINS_CONFIG.default;
    document.body.style.background = cfg.background;

    const gameContainer = document.querySelector(".game-container");
    if (gameContainer) {
        gameContainer.style.background = "rgba(0, 0, 0, 0.4)";
        gameContainer.style.borderColor = (skinId === "gorgeous") ? "#ffd700" : "rgba(255, 255, 255, 0.1)";
    }

    const cardAreas = document.querySelectorAll(".card-area");
    cardAreas.forEach(area => {
        area.style.background = cfg.cardAreaBg;
    });
}

function useItemPass() {
    if (itemPassCount <= 0) return;
    itemPassCount--;
    passCount++;
    passCountEl.textContent = passCount;
    btnPass.disabled = false;
    alert("🌀 お助けアイテムを使用しました！パス回数が1増えました。");
    updateCollectionUI();
    saveUserData();
}

function useItemShield() {
    if (itemShieldCount <= 0 || hasShield) return;
    itemShieldCount--;
    hasShield = true;
    updateShieldUI();
    alert("🛡️ お助けアイテムを使用しました！シールドを装備した状態でスタートします。");
    updateCollectionUI();
    saveUserData();
}

// 🔑 ログイン・ログアウト処理
function handleLogin() {
    let name = usernameInput.value.trim();
    if (userSelect.value) name = userSelect.value;

    if (!name) {
        alert("ユーザー名を入力するか、リストから選択してください！");
        return;
    }
    loadUserData(name);
    usernameInput.value = "";
}

function handleLogout() {
    saveUserData(); 
    currentUser = "";
    loginArea.style.display = 'block';
    userStatusArea.style.display = 'none';
    gamePlayArea.style.display = 'none';
    updateUserSelectDropdown();
}

// --- 既存のゲームロジック ---

function getRandomCard() {
    const randomSuit = suits[Math.floor(Math.random() * suits.length)];
    const randomValue = Math.floor(Math.random() * 13) + 1;
    return { suit: randomSuit, value: randomValue };
}

function getCardFileNameValue(value) {
    if (value === 11) return 'J';
    if (value === 12) return 'Q';
    if (value === 13) return 'K';
    return value.toString();
}

function getCardImagePath(card) {
    const fileValue = getCardFileNameValue(card.value);
    return `images/${card.suit}${fileValue}.png`;
}

function updateHighScore() {
    if (streak > maxStreak) maxStreak = streak;
    if (coins > maxCoins) maxCoins = coins;
    maxStreakEl.textContent = maxStreak;
    maxCoinsEl.textContent = maxCoins;
    saveUserData();
}

function updateShieldUI() {
    if (hasShield) {
        shieldStatusEl.textContent = "🛡️ あり (1回保護)";
        shieldStatusEl.style.color = "#ff416c";
    } else {
        shieldStatusEl.textContent = "🛡️ なし";
        shieldStatusEl.style.color = "#4cc9f0";
    }
}

function initGame(isFirstLogin = false) {
    if (!currentUser) return;

    const todayStr = getTodayString();
    if (lastMissionDate !== todayStr) {
        generateDailyMissions(todayStr);
    }

    if (coins <= 0 && !isFirstLogin) {
        coins = 100;
        streak = 0;
        streakEl.textContent = streak;
        passCount = 1; 
        hasShield = false; 
    }
    
    coinsEl.textContent = coins;
    passCountEl.textContent = passCount;
    updateShieldUI();
    updateMissionUI(); 
    updateHighScore();
    updateCollectionUI(); 

    isDoubleUpMode = false;
    pooledCoins = 0;
    doubleUpGroup.style.display = 'none';

    currentCard = getRandomCard();
    nextCard = getRandomCard();

    currentCardImg.src = getCardImagePath(currentCard);
    nextCardInner.classList.remove('is-flipped');
    
    messageEl.textContent = '次のカードは、高い？同じ？低い？';
    messageEl.style.color = '#ffffff';

    btnHigh.disabled = false;
    btnJust.disabled = false;
    btnLow.disabled = false;
    betInput.disabled = false; 
    btnReset.style.display = 'none';

    if (passCount > 0) {
        btnPass.disabled = false;
    } else {
        btnPass.disabled = true;
    }
}

function usePass() {
    if (passCount <= 0) return;

    passCount--;
    passCountEl.textContent = passCount;
    btnPass.disabled = true; 

    currentCard = getRandomCard();
    currentCardImg.src = getCardImagePath(currentCard);

    messageEl.textContent = 'カードを引き直しました！さあ、どっち？';
    messageEl.style.color = '#4cc9f0';

    progressMission("m_pass", 1);
    saveUserData(); 
}

function checkChoice(playerChoice) {
    let betAmount = 0;
    const hadShieldBefore = hasShield;

    if (isDoubleUpMode) {
        betAmount = pooledCoins;
    } else {
        betAmount = parseInt(betInput.value, 10);
        if (isNaN(betAmount) || betAmount <= 0) {
            alert("1枚以上ベットしてください！");
            return;
        }
        if (betAmount > coins) {
            alert("所持コインが足りません！");
            return;
        }
        coins -= betAmount;
        coinsEl.textContent = coins;
        saveUserData(); 
    }

    btnHigh.disabled = true;
    btnJust.disabled = true;
    btnLow.disabled = true;
    btnPass.disabled = true;
    betInput.disabled = true;
    doubleUpGroup.style.display = 'none'; 

    nextCardImg.src = getCardImagePath(nextCard);
    nextCardInner.classList.add('is-flipped');

    let isCorrect = false;
    let isJustBonus = false;

    if (playerChoice === 'just' && nextCard.value === currentCard.value) {
        isCorrect = true;
        isJustBonus = true;
    } else if (playerChoice === 'high' && nextCard.value > currentCard.value) {
        isCorrect = true;
    } else if (playerChoice === 'low' && nextCard.value < currentCard.value) {
        isCorrect = true;
    }

    let diaBonus = 0;
    if (nextCard.suit === 'dia') {
        diaBonus = nextCard.value * 2;
        coins += diaBonus;
        coinsEl.textContent = coins;
        progressMission("m_dia", 1);
    }

    if (isCorrect) {
        streak++;
        streakEl.textContent = streak;

        const isSpadePenaltyActive = (currentCard.suit === 'spades');
        const payoutMultiplier = isSpadePenaltyActive ? 1.5 : 1.0;

        let winCoins = 0;
        if (isJustBonus) {
            winCoins = Math.round(betAmount * 5 * payoutMultiplier); 
        } else {
            winCoins = Math.round(betAmount * 2 * payoutMultiplier); 
        }

        let shieldEarned = false;
        if (nextCard.suit === 'heart' && !hasShield) {
            hasShield = true;
            shieldEarned = true;
            progressMission("m_heart_get", 1);
        }

        let successMsg = `正解！ ＋${winCoins}コインのチャンス！`;
        if (isJustBonus) successMsg = `凄すぎる！JUST的中！ ＋${winCoins}コインのチャンス！`;
        if (isSpadePenaltyActive) successMsg += ` (♠効果で配当1.5倍！)`;
        if (diaBonus > 0) successMsg += ` [♦ボーナス +${diaBonus}コイン！]`;
        if (shieldEarned) successMsg += ` 🛡️ハートのシールドを獲得！`;

        messageEl.textContent = successMsg;
        messageEl.style.color = '#00ffcc';
        if (isJustBonus) messageEl.style.color = '#8a2be2';

        pooledCoins = winCoins; 
        isDoubleUpMode = true;  

        if (streak >= 5) progressMission("m_streak", 5); 
        if (streak >= 3 && streak === 3) progressMission("m_win_streak_3", 1);
        if (isJustBonus) progressMission("m_just", 1);  
        if (hadShieldBefore) progressMission("m_shield", 1); 
        if (isSpadePenaltyActive) progressMission("m_spade", 1); 
        if (!isDoubleUpMode && betAmount >= 30) progressMission("m_highbet", 1); 
        if (isDoubleUpMode && pooledCoins / payoutMultiplier >= 30) progressMission("m_highbet", 1); 

        setTimeout(() => {
            currentCard = nextCard;
            nextCard = getRandomCard();

            currentCardImg.src = getCardImagePath(currentCard);
            nextCardInner.classList.remove('is-flipped');
            updateShieldUI();
            
            messageEl.textContent = 'ダブルアップに挑戦しますか？それともコインを確定（コレクト）しますか？';
            messageEl.style.color = '#ffd700';

            poolCoinsEl.textContent = pooledCoins;
            doubleUpGroup.style.display = 'block';
            saveUserData();
        }, 2500);

    } else {
        if (hasShield) {
            hasShield = false; 
            if (!isDoubleUpMode) {
                coins += betAmount; 
                coinsEl.textContent = coins;
            }

            let shieldSaveMsg = `不正解！ですが、🛡️シールドが身代わりになってくれました！`;
            if (diaBonus > 0) shieldSaveMsg += ` [♦ボーナス +${diaBonus}コイン！]`;
            
            messageEl.textContent = shieldSaveMsg;
            messageEl.style.color = '#ffb703';

            isDoubleUpMode = false;
            pooledCoins = 0;

            progressMission("m_comeback", 1);
            updateMissionUI();

            setTimeout(() => {
                currentCard = nextCard;
                nextCard = getRandomCard();

                currentCardImg.src = getCardImagePath(currentCard);
                nextCardInner.classList.remove('is-flipped');
                updateShieldUI();

                messageEl.textContent = '次のカードは、高い？同じ？低い？';
                messageEl.style.color = '#ffffff';

                btnHigh.disabled = false;
                btnJust.disabled = false;
                btnLow.disabled = false;
                betInput.disabled = false;
                if (passCount > 0) btnPass.disabled = false;
                saveUserData();
            }, 2500);

        } else {
            if (currentCard.suit === 'spades' && !isDoubleUpMode) {
                const extraLoss = Math.round(betAmount * 0.5);
                coins -= extraLoss;
                coinsEl.textContent = coins;
                messageEl.textContent = `残念、不正解！ ♠効果でペナルティ1.5倍！ (追加 －${extraLoss}コイン)`;
            } else {
                messageEl.textContent = `残念、不正解！ ベットしたコインは没収されました。`;
            }

            if (diaBonus > 0) {
                messageEl.textContent += ` [♦ボーナス +${diaBonus}コイン獲得]`;
            }

            pooledCoins = 0;
            isDoubleUpMode = false;
            streak = 0;
            streakEl.textContent = streak;
            updateShieldUI();
            updateMissionUI(); 
            updateHighScore();

            if (coins <= 0) {
                messageEl.textContent = `無一文になりました…ゲームオーバーです！`;
                btnReset.textContent = "破産から復活する（コイン100枚）";
            } else {
                btnReset.textContent = "次のカードへ（リセット）";
            }
            
            messageEl.style.color = '#ff4b2b';
            btnReset.style.display = 'block';
            saveUserData();
        }
    }
}

function collectCoins() {
    if (pooledCoins >= 100) {
        progressMission("m_bigwin", 1);
    }
    if (isDoubleUpMode) {
        progressMission("m_double_collect", 1);
    }

    coins += pooledCoins;
    coinsEl.textContent = coins;
    messageEl.textContent = `${pooledCoins}コインを確定しました！`;
    messageEl.style.color = '#00ffcc';

    isDoubleUpMode = false;
    pooledCoins = 0;
    doubleUpGroup.style.display = 'none';
    
    updateHighScore();

    setTimeout(() => {
        initGame();
    }, 1500);
}

function continueDoubleUp() {
    doubleUpGroup.style.display = 'none';
    messageEl.textContent = `ダブルアップ継続！次のカードは、高い？同じ？低い？`;
    messageEl.style.color = '#ffffff';

    btnHigh.disabled = false;
    btnJust.disabled = false;
    btnLow.disabled = false;
    if (passCount > 0) btnPass.disabled = false;
}

// 🔑 称号・スキンの切り替えイベントハンドラ
selectTitleEl.addEventListener('change', (e) => {
    activeTitle = e.target.value;
    titleDisplayEl.textContent = activeTitle;
    saveUserData();
});

selectSkinEl.addEventListener('change', (e) => {
    activeSkin = e.target.value;
    applySkin(activeSkin);
    saveUserData();
});

// --- イベントリスナー ---
btnHigh.addEventListener('click', () => checkChoice('high'));
btnJust.addEventListener('click', () => checkChoice('just'));
btnLow.addEventListener('click', () => checkChoice('low'));
btnReset.addEventListener('click', () => initGame());
btnPass.addEventListener('click', () => usePass()); 

btnCollect.addEventListener('click', collectCoins);
btnDoubleContinue.addEventListener('click', continueDoubleUp);

btnLogin.addEventListener('click', handleLogin);
btnLogout.addEventListener('click', handleLogout);
usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
});

btnGachaEl.addEventListener('click', drawGacha);
btnUseItemPassEl.addEventListener('click', useItemPass);
btnUseItemShieldEl.addEventListener('click', useItemShield);

updateUserSelectDropdown();
