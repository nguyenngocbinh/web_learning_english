/* ============================================================
   FunEnglish Kids – Hangman Game
   ============================================================ */
(function () {
  var canvas    = document.getElementById('hangmanCanvas');
  var wordEl    = document.getElementById('hangWord');
  var hintEl    = document.getElementById('hangHint');
  var kbEl      = document.getElementById('hangKeyboard');
  var feedEl    = document.getElementById('hangFeedback');
  var emojiEl   = document.getElementById('hangEmoji');
  var livesEl   = document.getElementById('hangLives');
  var numEl     = document.getElementById('hangNum');
  var scoreEl   = document.getElementById('hangScore');
  var startBtn  = document.getElementById('hangStart');
  var resultEl  = document.getElementById('hangResult');
  var containerEl = document.getElementById('hangmanContainer');
  var resultEmoji = document.getElementById('hangResultEmoji');
  var resultTitle = document.getElementById('hangResultTitle');
  var finalScore  = document.getElementById('hangFinalScore');
  var playAgain   = document.getElementById('hangPlayAgain');

  if (!canvas || !wordEl) return;

  var ctx = canvas.getContext('2d');
  var words, currentWord, guessed, wrong, score, round, totalRounds;

  totalRounds = 10;

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  function speak(text) {
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US'; u.rate = 0.85; u.pitch = 1.1;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }

  function drawHangman(step) {
    ctx.strokeStyle = '#2d3436';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    // Scale for responsive canvas
    var w = canvas.width;
    var h = canvas.height;
    var s = w / 200; // scale factor

    switch (step) {
      case 1: // gallows base
        ctx.beginPath(); ctx.moveTo(20*s, 180*s); ctx.lineTo(80*s, 180*s); ctx.stroke(); break;
      case 2: // gallows pole
        ctx.beginPath(); ctx.moveTo(50*s, 180*s); ctx.lineTo(50*s, 20*s); ctx.stroke(); break;
      case 3: // gallows top
        ctx.beginPath(); ctx.moveTo(50*s, 20*s); ctx.lineTo(140*s, 20*s); ctx.stroke(); break;
      case 4: // rope
        ctx.beginPath(); ctx.moveTo(140*s, 20*s); ctx.lineTo(140*s, 45*s); ctx.stroke(); break;
      case 5: // head
        ctx.beginPath(); ctx.arc(140*s, 60*s, 15*s, 0, Math.PI * 2); ctx.stroke(); break;
      case 6: // body
        ctx.beginPath(); ctx.moveTo(140*s, 75*s); ctx.lineTo(140*s, 120*s); ctx.stroke(); break;
      case 7: // left arm
        ctx.beginPath(); ctx.moveTo(140*s, 85*s); ctx.lineTo(115*s, 105*s); ctx.stroke(); break;
      case 8: // right arm
        ctx.beginPath(); ctx.moveTo(140*s, 85*s); ctx.lineTo(165*s, 105*s); ctx.stroke(); break;
      case 9: // left leg
        ctx.beginPath(); ctx.moveTo(140*s, 120*s); ctx.lineTo(115*s, 155*s); ctx.stroke(); break;
      case 10: // right leg
        ctx.beginPath(); ctx.moveTo(140*s, 120*s); ctx.lineTo(165*s, 155*s); ctx.stroke();
        // sad face
        ctx.beginPath(); ctx.arc(134*s, 57*s, 2*s, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(146*s, 57*s, 2*s, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(140*s, 68*s, 5*s, Math.PI, 0); ctx.stroke();
        break;
    }
  }

  function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function displayWord() {
    var html = '';
    for (var i = 0; i < currentWord.word.length; i++) {
      var ch = currentWord.word[i].toUpperCase();
      if (ch === ' ') {
        html += '<span class="hang-letter hang-space">&nbsp;</span>';
      } else if (guessed.indexOf(ch) >= 0) {
        html += '<span class="hang-letter hang-revealed">' + ch + '</span>';
      } else {
        html += '<span class="hang-letter">_</span>';
      }
    }
    wordEl.innerHTML = html;
  }

  function buildKeyboard() {
    kbEl.innerHTML = '';
    for (var i = 65; i <= 90; i++) {
      var letter = String.fromCharCode(i);
      var btn = document.createElement('button');
      btn.className = 'hang-key';
      btn.textContent = letter;
      btn.dataset.letter = letter;
      if (guessed.indexOf(letter) >= 0) {
        btn.disabled = true;
        btn.classList.add(currentWord.word.toUpperCase().indexOf(letter) >= 0 ? 'hang-key-correct' : 'hang-key-wrong');
      }
      kbEl.appendChild(btn);
    }
  }

  function checkWin() {
    var word = currentWord.word.toUpperCase();
    for (var i = 0; i < word.length; i++) {
      if (word[i] !== ' ' && guessed.indexOf(word[i]) < 0) return false;
    }
    return true;
  }

  function nextWord() {
    if (round >= totalRounds || round >= words.length) {
      showResult();
      return;
    }
    currentWord = words[round];
    guessed = [];
    wrong = 0;
    clearCanvas();
    emojiEl.textContent = currentWord.emoji;
    hintEl.textContent = '💡 ' + currentWord.hint;
    hintEl.style.display = 'none';
    feedEl.textContent = '';
    feedEl.className = 'hangman-feedback';
    numEl.textContent = (round + 1);
    livesEl.textContent = 10 - wrong;
    displayWord();
    buildKeyboard();
  }

  function guessLetter(letter) {
    if (guessed.indexOf(letter) >= 0) return;
    guessed.push(letter);

    var word = currentWord.word.toUpperCase();
    if (word.indexOf(letter) >= 0) {
      speak(letter);
      displayWord();
      buildKeyboard();
      if (checkWin()) {
        score++;
        scoreEl.textContent = score;
        feedEl.textContent = '🎉 Correct! The word is "' + currentWord.word + '"!';
        feedEl.className = 'hangman-feedback spell-correct';
        speak('Great! ' + currentWord.word);
        setTimeout(function () { round++; nextWord(); }, 1800);
      }
    } else {
      wrong++;
      livesEl.textContent = 10 - wrong;
      drawHangman(wrong);
      buildKeyboard();
      if (wrong >= 10) {
        // Reveal the word
        guessed = word.split('');
        displayWord();
        feedEl.textContent = '😢 The word was "' + currentWord.word + '"';
        feedEl.className = 'hangman-feedback spell-wrong';
        speak('The word was ' + currentWord.word);
        setTimeout(function () { round++; nextWord(); }, 2200);
      }
    }
  }

  function showResult() {
    containerEl.classList.add('hidden');
    resultEl.classList.remove('hidden');
    finalScore.textContent = score;
    if (score >= 9) { resultEmoji.textContent = '🏆'; resultTitle.textContent = 'Amazing!'; }
    else if (score >= 7) { resultEmoji.textContent = '🎉'; resultTitle.textContent = 'Great job!'; }
    else if (score >= 5) { resultEmoji.textContent = '👍'; resultTitle.textContent = 'Good effort!'; }
    else { resultEmoji.textContent = '📚'; resultTitle.textContent = 'Keep practicing!'; }
  }

  function startGame() {
    words = shuffle(HANGMAN_WORDS.slice()).slice(0, totalRounds);
    score = 0; round = 0;
    scoreEl.textContent = '0';
    containerEl.classList.remove('hidden');
    resultEl.classList.add('hidden');
    nextWord();
  }

  // Keyboard click delegation
  kbEl.addEventListener('click', function (e) {
    var btn = e.target.closest('.hang-key');
    if (!btn || btn.disabled) return;
    guessLetter(btn.dataset.letter);
  });

  // Hint button: show hint after 3 wrong guesses or on click
  var hintBtn = document.getElementById('hangHintBtn');
  if (hintBtn) {
    hintBtn.addEventListener('click', function () {
      hintEl.style.display = 'block';
    });
  }

  // Physical keyboard support
  document.addEventListener('keydown', function (e) {
    var panel = document.getElementById('game-hangman');
    if (!panel || !panel.classList.contains('active')) return;
    var key = e.key.toUpperCase();
    if (key.length === 1 && key >= 'A' && key <= 'Z') {
      guessLetter(key);
    }
  });

  startBtn.addEventListener('click', startGame);
  playAgain.addEventListener('click', startGame);
  startGame();
})();
