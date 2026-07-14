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

// 🎯 デイリーミッション用の変数（追加・拡張）
let dailyMissions = []; // その日に選ばれた5つのミッション
let missionProgress = {}; // 各ミッションの進行度やクリアフラグ
let lastMissionDate = ""; // 最後にミッションを生成・読み込んだ日付 (YYYY-MM-DD)

// 🎯 マスターミッションプール（全8種類）
const MISSION_POOL = [
    { id: "m_streak",   text: "🔥 連勝の達人 (5連勝達成)", target: 5, reward: 50,  type: "count" },
    { id: "m_just",     text: "⚡ ジャストブレイカー (JUSTを1回的中)", target: 1, reward: 100, type: "count" },
    { id: "m_shield",   text: "🛡️ 鉄壁の守護 (シールド所持中に正解)", target: 1, reward: 40,  type: "count" },
    { id: "m_dia",      text: "♦️ ダイヤコレクター (♦ボーナスを累計2回発生)", target: 2, reward: 40,  type: "count" },
    { id: "m_highbet",  text: "💰 ハイローラー (30枚以上ベットして正解)", target: 1, reward: 50,  type: "count" },
    { id: "m_pass",     text: "🌀 パス使い (パスを累計2回使用)", target: 2, reward: 30,  type: "count" },
    { id: "m_bigwin",   text: "💎 大富豪への道 (一度に100枚以上獲得して確定)", target: 1, reward: 60,  type: "count" },
    { id: "m_spade",    text: "♠️ スペードの挑戦 (♠効果中に予測正解)", target: 1, reward: 50,  type: "count" }
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
        // 🎯 ミッション情報もセーブ
        dailyMissions: dailyMissions,
        missionProgress: missionProgress,
        lastMissionDate: lastMissionDate
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
    const todayStr = getTodayString(); // 今日の日付 (YYYY-MM-DD)

    if (dataStr) {
        const data = JSON.parse(dataStr);
        coins = data.coins ?? 100;
        streak = data.streak ?? 0;
        maxCoins = data.maxCoins ?? 100;
        maxStreak = data.maxStreak ?? 0;
        passCount = data.passCount ?? 1;
        hasShield = data.hasShield ?? false;
        
        lastMissionDate = data.lastMissionDate ?? "";

        // 🎯 日付が変わっているかチェック
        if (lastMissionDate !== todayStr) {
            // 日付が変わっていれば新しくミッションを5つ抽選
            generateDailyMissions(todayStr);
        } else {
            // 同一日の場合はデータを復元
            dailyMissions = data.dailyMissions ?? [];
            missionProgress = data.missionProgress ?? {};
            if (dailyMissions.length === 0) generateDailyMissions(todayStr);
        }
    } else {
        // 新規ユーザー
        coins = 100;
        streak = 0;
        maxCoins = 100;
        maxStreak = 0;
        passCount = 1;
        hasShield = false;
        generateDailyMissions(todayStr);
    }

    // 表示の更新
    currentUserDisplay.textContent = currentUser;
    streakEl.textContent = streak;
    maxStreakEl.textContent = maxStreak;
    coinsEl.textContent = coins;
    maxCoinsEl.textContent = maxCoins;
    passCountEl.textContent = passCount;
    updateShieldUI();
    updateMissionUI();

    loginArea.style.display = 'none';
    userStatusArea.style.display = 'flex';
    gamePlayArea.style.display = 'block';

    initGame(true); 
}

// 今日の日付文字列(YYYY-MM-DD)を取得する関数
function getTodayString() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 🎯 日付ベースでランダムに5つのミッションを決定する関数
function generateDailyMissions(todayStr) {
    lastMissionDate = todayStr;
    missionProgress = {};

    // 簡易シャッフルをしてプールから5個選出
    const shuffled = [...MISSION_POOL].sort(() => Math.random() - 0.5);
    dailyMissions = shuffled.slice(0, 5);

    // 進行状況オブジェクトを初期化
    dailyMissions.forEach(m => {
        missionProgress[m.id] = {
            current: 0,
            cleared: false
        };
    });
}

// 🎯 ミッションUIを綺麗に描写する関数
function updateMissionUI() {
    missionDateUI.textContent = lastMissionDate;
    missionListUI.innerHTML = ""; // 一旦クリア

    dailyMissions.forEach((m, index) => {
        const prog = missionProgress[m.id];
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.justify = 'space-between';
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
        } else {
            spanStatus.textContent = `進行中 (${prog.current}/${m.target})`;
            spanStatus.style.color = "#ffb703";
        }

        // 連勝ミッション、シールド所持ミッションなどはリアルタイムの状況を補足
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
}

// 🎯 あらゆるアクション時にミッションのカウントを進める共通関数
function progressMission(id, amount = 1) {
    // 今日の5つのミッションに含まれているかチェック
    if (!missionProgress[id] || missionProgress[id].cleared) return;

    const m = dailyMissions.find(item => item.id === id);
    if (!m) return;

    missionProgress[id].current += amount;

    // 目標値に達したらクリア！
    if (missionProgress[id].current >= m.target) {
        missionProgress[id].current = m.target;
        missionProgress[id].cleared = true;
        coins += m.reward;
        coinsEl.textContent = coins;
        
        // 達成アラート（少し遅らせて出す）
        setTimeout(() => {
            alert(`🎯 デイリーミッション達成！\n\n【${m.text}】\n報酬: ＋${m.reward} コインを獲得しました！`);
        }, 600);
    }
    updateMissionUI();
    saveUserData();
}

// ログイン処理
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

// ログアウト処理
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

    // ログイン時に日付が変わっている可能性のセーフティチェック
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

    // 🎯 ミッション進行：パス使い
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

    // ♦️ ダイヤボーナス
    let diaBonus = 0;
    if (nextCard.suit === 'dia') {
        diaBonus = nextCard.value * 2;
        coins += diaBonus;
        coinsEl.textContent = coins;
        // 🎯 ミッション進行：ダイヤコレクター
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

        // 🎯 ミッション進行チェック
        if (streak >= 5) progressMission("m_streak", 5); // 5連勝
        if (isJustBonus) progressMission("m_just", 1);  // JUST的中
        if (hadShieldBefore) progressMission("m_shield", 1); // シールド所持中の正解
        if (isSpadePenaltyActive) progressMission("m_spade", 1); // スペード効果中の正解
        if (!isDoubleUpMode && betAmount >= 30) progressMission("m_highbet", 1); // ハイローラー（初回ベット時のみ）
        if (isDoubleUpMode && pooledCoins / payoutMultiplier >= 30) progressMission("m_highbet", 1); // ダブルアップ時

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
    // 🎯 ミッション進行：大富豪への道（確定時に100枚以上獲得）
    if (pooledCoins >= 100) {
        progressMission("m_bigwin", 1);
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

updateUserSelectDropdown();
