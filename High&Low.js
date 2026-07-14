// --- ゲームの状態を管理する変数 ---
let currentUser = ""; // 🔑 現在ログイン中のユーザー名
let currentCard = { suit: '', value: 0 };
let nextCard = { suit: '', value: 0 };
let streak = 0; 
let coins = 100; 
let passCount = 1;

// 🛡️ シールドの所持状態（追加）
let hasShield = false;

// 🎰 ダブルアップ用の変数
let isDoubleUpMode = false;
let pooledCoins = 0; 

let maxStreak = 0;
let maxCoins = 100;

const suits = ['clover', 'dia', 'heart', 'spades'];

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

// 🛡️ シールド表示要素（追加）
const shieldStatusEl = document.getElementById('shield-status');

// 🎰 ダブルアップ用の要素
const doubleUpGroup = document.getElementById('double-up-group');
const poolCoinsEl = document.getElementById('pool-coins');
const btnCollect = document.getElementById('btn-collect');
const btnDoubleContinue = document.getElementById('btn-double-continue');

// 🔑 ログイン・ユーザー管理用の要素（追加）
const loginArea = document.getElementById('login-area');
const gamePlayArea = document.getElementById('game-play-area');
const userStatusArea = document.getElementById('user-status-area');
const currentUserDisplay = document.getElementById('current-user-display');
const usernameInput = document.getElementById('username-input');
const btnLogin = document.getElementById('btn-login');
const btnLogout = document.getElementById('btn-logout');
const userSelectContainer = document.getElementById('user-select-container');
const userSelect = document.getElementById('user-select');

// --- 🔑 ユーザーデータの保存・読み込みロジック (LocalStorage) ---

// 保存されている全ユーザー名の一覧を取得
function getUserList() {
    const list = localStorage.getItem('hl_user_list');
    return list ? JSON.parse(list) : [];
}

// ユーザー一覧のドロップダウンメニューを更新
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

// 特定のユーザーのデータを保存
function saveUserData() {
    if (!currentUser) return;
    
    // 現在のゲーム状態をオブジェクトにまとめる
    const userData = {
        coins: coins,
        streak: streak,
        maxCoins: maxCoins,
        maxStreak: maxStreak,
        passCount: passCount,
        hasShield: hasShield
    };
    
    localStorage.setItem(`hl_user_${currentUser}`, JSON.stringify(userData));

    // ユーザー一覧リストにも追加（未登録の場合のみ）
    const users = getUserList();
    if (!users.includes(currentUser)) {
        users.push(currentUser);
        localStorage.setItem('hl_user_list', JSON.stringify(users));
    }
}

// 特定のユーザーのデータを読み込み
function loadUserData(username) {
    currentUser = username;
    const dataStr = localStorage.getItem(`hl_user_${username}`);
    
    if (dataStr) {
        // データが存在すれば復元
        const data = JSON.parse(dataStr);
        coins = data.coins ?? 100;
        streak = data.streak ?? 0;
        maxCoins = data.maxCoins ?? 100;
        maxStreak = data.maxStreak ?? 0;
        passCount = data.passCount ?? 1;
        hasShield = data.hasShield ?? false;
    } else {
        // 新規ユーザーの場合は初期値
        coins = 100;
        streak = 0;
        maxCoins = 100;
        maxStreak = 0;
        passCount = 1;
        hasShield = false;
    }

    // 表示の更新
    currentUserDisplay.textContent = currentUser;
    streakEl.textContent = streak;
    maxStreakEl.textContent = maxStreak;
    coinsEl.textContent = coins;
    maxCoinsEl.textContent = maxCoins;
    passCountEl.textContent = passCount;
    updateShieldUI();

    // 画面切り替え
    loginArea.style.display = 'none';
    userStatusArea.style.display = 'flex';
    gamePlayArea.style.display = 'block';

    // ゲーム盤面の初期化
    initGame(true); // ログイン直後はコインリセット等を走らせないためのフラグ
}

// ログイン処理
function handleLogin() {
    let name = usernameInput.value.trim();
    
    // セレクトボックスから選ばれている場合はそちらを優先
    if (userSelect.value) {
        name = userSelect.value;
    }

    if (!name) {
        alert("ユーザー名を入力するか、リストから選択してください！");
        return;
    }

    loadUserData(name);
    usernameInput.value = "";
}

// ログアウト処理
function handleLogout() {
    saveUserData(); // 現在の状態をセーブ
    currentUser = "";
    
    // 画面切り替え
    loginArea.style.display = 'block';
    userStatusArea.style.display = 'none';
    gamePlayArea.style.display = 'none';
    
    updateUserSelectDropdown();
}

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
    if (streak > maxStreak) {
        maxStreak = streak;
        localStorage.setItem('hl_max_streak', maxStreak);
    }
    if (coins > maxCoins) {
        maxCoins = coins;
        localStorage.setItem('hl_max_coins', maxCoins);
    }
    maxStreakEl.textContent = maxStreak;
    maxCoinsEl.textContent = maxCoins;

    // 記録が更新される可能性があるので都度セーブ
    saveUserData();
}

// 🛡️ シールドの表示を更新する関数（追加）
function updateShieldUI() {
    if (hasShield) {
        shieldStatusEl.textContent = "🛡️ あり (1回保護)";
        shieldStatusEl.style.color = "#ff416c"; // ピンク・赤系
    } else {
        shieldStatusEl.textContent = "🛡️ なし";
        shieldStatusEl.style.color = "#4cc9f0"; // 水色
    }
}

// --- ゲーム初期化 ---
function initGame(isFirstLogin = false) {
    if (!currentUser) return;

    if (coins <= 0 && !isFirstLogin) {
        coins = 100;
        streak = 0;
        streakEl.textContent = streak;
        passCount = 1; 
        hasShield = false; // 復活時はシールドもリセット
    }
    coinsEl.textContent = coins;
    passCountEl.textContent = passCount;
    updateShieldUI();
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

// パス関数
function usePass() {
    if (passCount <= 0) return;

    passCount--;
    passCountEl.textContent = passCount;
    btnPass.disabled = true; 

    currentCard = getRandomCard();
    currentCardImg.src = getCardImagePath(currentCard);

    messageEl.textContent = 'カードを引き直しました！さあ、どっち？';
    messageEl.style.color = '#4cc9f0';
    saveUserData(); // パス回数の減少をセーブ
}

// --- 勝敗判定 ---
function checkChoice(playerChoice) {
    let betAmount = 0;

    // ダブルアップ中ならプールされているコインをそのまま賭け金にする
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
        // 通常ベット時は先に手持ちから引いてプールしておく
        coins -= betAmount;
        coinsEl.textContent = coins;
        saveUserData(); // ベットした時点の状態をセーブ
    }

    // 入力やボタンの無効化
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

    // ♦️ ダイヤの即時ボーナス判定（勝敗に関係なく、めくれた瞬間に発動！）
    let diaBonus = 0;
    if (nextCard.suit === 'dia') {
        diaBonus = nextCard.value * 2;
        coins += diaBonus;
        coinsEl.textContent = coins;
    }

    if (isCorrect) {
        streak++;
        streakEl.textContent = streak;

        // ♠️ スペードの倍率ボーナス（左側のベースカードがスペードなら配当1.5倍）
        const isSpadePenaltyActive = (currentCard.suit === 'spades');
        const payoutMultiplier = isSpadePenaltyActive ? 1.5 : 1.0;

        // 配当の計算
        let winCoins = 0;
        if (isJustBonus) {
            winCoins = Math.round(betAmount * 5 * payoutMultiplier); 
        } else {
            winCoins = Math.round(betAmount * 2 * payoutMultiplier); 
        }

        // ❤️ ハートのシールド判定（右側の正解カードがハートならシールド獲得）
        let shieldEarned = false;
        if (nextCard.suit === 'heart' && !hasShield) {
            hasShield = true;
            shieldEarned = true;
        }

        // メッセージの構築
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

        setTimeout(() => {
            currentCard = nextCard;
            nextCard = getRandomCard();

            currentCardImg.src = getCardImagePath(currentCard);
            nextCardInner.classList.remove('is-flipped');
            updateShieldUI(); // シールド状態を画面に反映
            
            messageEl.textContent = 'ダブルアップに挑戦しますか？それともコインを確定（コレクト）しますか？';
            messageEl.style.color = '#ffd700';

            poolCoinsEl.textContent = pooledCoins;
            doubleUpGroup.style.display = 'block';
        }, 2500); // 演出メッセージが少し長いため、余韻を考慮して2.5秒に調整

    } else {
        // ❌ 不正解時の処理

        // 🛡️ シールドによる保護が発動するかチェック
        if (hasShield) {
            hasShield = false; // シールドを消費
            
            // 没収されるはずだったベット額をプレイヤーの手元に戻す
            if (!isDoubleUpMode) {
                coins += betAmount; 
                coinsEl.textContent = coins;
            }

            let shieldSaveMsg = `不正解！ですが、🛡️シールドが身代わりになってくれました！`;
            if (diaBonus > 0) shieldSaveMsg += ` [♦ボーナス +${diaBonus}コイン！]`;
            
            messageEl.textContent = shieldSaveMsg;
            messageEl.style.color = '#ffb703'; // 黄・オレンジ系

            // シールドで生き残った場合は、ダブルアップを強制終了して次のターンへ進む
            isDoubleUpMode = false;
            pooledCoins = 0;

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
            }, 2500);

        } else {
            // シールドがない通常ペナルティ

            // ♠️ スペードの追加ペナルティ（ベースカードがスペードなら損失1.5倍）
            if (currentCard.suit === 'spades' && !isDoubleUpMode) {
                // すでにbetAmount分はcoinsから引かれているため、追加で0.5倍分を没収する
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
            updateHighScore();

            if (coins <= 0) {
                messageEl.textContent = `無一文になりました…ゲームオーバーです！`;
                btnReset.textContent = "破産から復活する（コイン100枚）";
            } else {
                btnReset.textContent = "次のカードへ（リセット）";
            }
            
            messageEl.style.color = '#ff4b2b';
            btnReset.style.display = 'block';
        }
    }
}

// コインを確定して通常モードに戻る処理（コレクト）
function collectCoins() {
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

// ダブルアップを継続する処理
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

// 🔑 ログイン・ログアウト用イベントリスナー（追加）
btnLogin.addEventListener('click', handleLogin);
btnLogout.addEventListener('click', handleLogout);
usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
});

// 🔑 アプリ起動時の初期化処理（ログイン待ち状態にする）
updateUserSelectDropdown();

// ゲームスタート
//initGame();
