// --- ゲームの状態を管理する変数 ---
let currentCard = { suit: '', value: 0 };
let nextCard = { suit: '', value: 0 };
let streak = 0; 
let coins = 100; 
let passCount = 1; // 🌀 パスが使える回数（初期値1回）

let maxStreak = localStorage.getItem('hl_max_streak') ? parseInt(localStorage.getItem('hl_max_streak'), 10) : 0;
let maxCoins = localStorage.getItem('hl_max_coins') ? parseInt(localStorage.getItem('hl_max_coins'), 10) : 100;

const suits = ['clover', 'dia', 'heart', 'spades'];

// --- HTMLの要素（パーツ）を取得 ---
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
const btnPass = document.getElementById('btn-pass'); // 追加
const passCountEl = document.getElementById('pass-count'); // 追加

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
}

// --- ゲーム初期化 ---
function initGame() {
    // もし破産して復活するタイミングならパス回数もリセット
    if (coins <= 0) {
        coins = 100;
        streak = 0;
        streakEl.textContent = streak;
        passCount = 1; 
    }
    coinsEl.textContent = coins;
    passCountEl.textContent = passCount;
    updateHighScore();

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

    // パスボタンの残り回数に応じた有効・無効化
    if (passCount > 0) {
        btnPass.disabled = false;
    } else {
        btnPass.disabled = true;
    }
}

// 🌀 パス（カードチェンジ）関数
function usePass() {
    if (passCount <= 0) return;

    // パス回数を1減らす
    passCount--;
    passCountEl.textContent = passCount;
    btnPass.disabled = true; // ボタンを無効化

    // 現在のカードを新しいランダムなカードに変更
    currentCard = getRandomCard();
    currentCardImg.src = getCardImagePath(currentCard);

    messageEl.textContent = 'カードを引き直しました！さあ、どっち？';
    messageEl.style.color = '#4cc9f0';
}

// --- 勝敗判定 ---
function checkChoice(playerChoice) {
    const betAmount = parseInt(betInput.value, 10);

    if (isNaN(betAmount) || betAmount <= 0) {
        alert("1枚以上ベットしてください！");
        return;
    }
    if (betAmount > coins) {
        alert("所持コインが足りません！");
        return;
    }

    // ゲーム判定中はパスも含めて全ボタンを無効化
    btnHigh.disabled = true;
    btnJust.disabled = true;
    btnLow.disabled = true;
    btnPass.disabled = true;
    betInput.disabled = true;

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

    if (isCorrect) {
        streak++;
        streakEl.textContent = streak;

        if (isJustBonus) {
            const winCoins = betAmount * 5; 
            coins += (winCoins - betAmount); 
            messageEl.textContent = `凄すぎる！JUST的中！ ＋${winCoins}コイン！`;
            messageEl.style.color = '#8a2be2';
        } else {
            const winCoins = betAmount * 2; 
            coins += (winCoins - betAmount);
            messageEl.textContent = `正解！ ＋${winCoins}コイン！`;
            messageEl.style.color = '#00ffcc';
        }
        
        coinsEl.textContent = coins;
        updateHighScore();

        setTimeout(() => {
            currentCard = nextCard;
            nextCard = getRandomCard();

            currentCardImg.src = getCardImagePath(currentCard);
            nextCardInner.classList.remove('is-flipped');
            
            messageEl.textContent = '次のカードは、高い？同じ？低い？';
            messageEl.style.color = '#ffffff';

            btnHigh.disabled = false;
            btnJust.disabled = false;
            btnLow.disabled = false;
            betInput.disabled = false;

            // パス回数がまだあれば次のラウンドでまた使えるようにする
            if (passCount > 0) btnPass.disabled = false;
        }, 2200);

    } else {
        coins -= betAmount;
        coinsEl.textContent = coins;
        streak = 0;
        streakEl.textContent = streak;
        updateHighScore();

        if (coins <= 0) {
            messageEl.textContent = `無一文になりました…ゲームオーバーです！`;
            btnReset.textContent = "破産から復活する（コイン100枚）";
        } else {
            if (nextCard.value === currentCard.value) {
                messageEl.textContent = `残念！同じ数字（JUST）でした… －${betAmount}コイン`;
            } else {
                messageEl.textContent = `残念、不正解！ －${betAmount}コイン`;
            }
            btnReset.textContent = "次のカードへ（リセット）";
        }
        
        messageEl.style.color = '#ff4b2b';
        btnReset.style.display = 'block';
    }
}

// --- イベントリスナー ---
btnHigh.addEventListener('click', () => checkChoice('high'));
btnJust.addEventListener('click', () => checkChoice('just'));
btnLow.addEventListener('click', () => checkChoice('low'));
btnReset.addEventListener('click', () => initGame());
btnPass.addEventListener('click', () => usePass()); // 追加

// ゲームスタート
initGame();