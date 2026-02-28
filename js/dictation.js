/* ============================================================
   FunEnglish Kids – Dictation Game
   ============================================================ */
(function () {
  var inputEl     = document.getElementById('dictInput');
  var playBtn     = document.getElementById('dictPlayBtn');
  var submitBtn   = document.getElementById('dictSubmit');
  var hintBtn     = document.getElementById('dictHintBtn');
  var hintEl      = document.getElementById('dictHint');
  var feedEl      = document.getElementById('dictFeedback');
  var exampleEl   = document.getElementById('dictExample');
  var numEl       = document.getElementById('dictNum');
  var scoreEl     = document.getElementById('dictScore');
  var startBtn    = document.getElementById('dictStart');
  var containerEl = document.getElementById('dictationContainer');
  var resultEl    = document.getElementById('dictResult');
  var resultEmoji = document.getElementById('dictResultEmoji');
  var resultTitle = document.getElementById('dictResultTitle');
  var finalScore  = document.getElementById('dictFinalScore');
  var playAgain   = document.getElementById('dictPlayAgain');

  if (!inputEl) return;

  var words, currentWord, score, round, totalRounds, answered;
  totalRounds = 10;

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  function speak(text, rate) {
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US'; u.rate = rate || 0.8; u.pitch = 1.1;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }

  function showWord() {
    if (round >= totalRounds || round >= words.length) {
      showResult();
      return;
    }
    currentWord = words[round];
    answered = false;
    inputEl.value = '';
    inputEl.disabled = false;
    inputEl.className = 'dict-input';
    inputEl.focus();
    hintEl.textContent = '';
    hintEl.style.display = 'none';
    feedEl.textContent = '';
    feedEl.className = 'dictation-feedback';
    exampleEl.textContent = '';
    exampleEl.style.display = 'none';
    numEl.textContent = round + 1;
    submitBtn.disabled = false;

    // Auto-play the word
    setTimeout(function () { speak(currentWord.word); }, 300);
  }

  function checkAnswer() {
    if (answered) return;
    answered = true;
    var answer = inputEl.value.trim().toLowerCase();
    var correct = currentWord.word.toLowerCase();

    inputEl.disabled = true;
    submitBtn.disabled = true;

    if (answer === correct) {
      score++;
      scoreEl.textContent = score;
      inputEl.className = 'dict-input dict-input-correct';
      feedEl.textContent = '✅ Correct! "' + currentWord.word + '"';
      feedEl.className = 'dictation-feedback spell-correct';
      speak('Correct! ' + currentWord.word);
    } else {
      inputEl.className = 'dict-input dict-input-wrong';
      feedEl.textContent = '❌ The word is "' + currentWord.word + '"';
      feedEl.className = 'dictation-feedback spell-wrong';
      speak('The word is ' + currentWord.word);
    }

    // Show example sentence
    if (currentWord.example) {
      exampleEl.textContent = '📝 ' + currentWord.example;
      exampleEl.style.display = 'block';
    }

    setTimeout(function () { round++; showWord(); }, 2500);
  }

  function showHint() {
    if (!currentWord) return;
    var word = currentWord.word;
    var hint = word[0] + ' _ '.repeat(word.length - 1).trim() + '  (' + word.length + ' letters)';
    hintEl.textContent = '💡 ' + currentWord.hint + '  |  ' + hint;
    hintEl.style.display = 'block';
  }

  function showResult() {
    containerEl.classList.add('hidden');
    resultEl.classList.remove('hidden');
    finalScore.textContent = score;
    if (score >= 9) { resultEmoji.textContent = '🏆'; resultTitle.textContent = 'Perfect hearing!'; }
    else if (score >= 7) { resultEmoji.textContent = '🎉'; resultTitle.textContent = 'Great listener!'; }
    else if (score >= 5) { resultEmoji.textContent = '👍'; resultTitle.textContent = 'Good effort!'; }
    else { resultEmoji.textContent = '📚'; resultTitle.textContent = 'Keep practicing!'; }
  }

  function startGame() {
    words = shuffle(DICTATION_WORDS.slice()).slice(0, totalRounds);
    score = 0; round = 0;
    scoreEl.textContent = '0';
    containerEl.classList.remove('hidden');
    resultEl.classList.add('hidden');
    showWord();
  }

  // Event listeners
  playBtn.addEventListener('click', function () {
    if (currentWord) speak(currentWord.word, 0.7);
  });

  submitBtn.addEventListener('click', checkAnswer);

  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !answered) checkAnswer();
  });

  hintBtn.addEventListener('click', showHint);
  startBtn.addEventListener('click', startGame);
  playAgain.addEventListener('click', startGame);
  startGame();
})();
