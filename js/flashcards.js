/* ============================================================
   FunEnglish Kids – Flashcards (Spaced Repetition)
   ============================================================ */
(function () {
  var cardEl      = document.getElementById('flashCard');
  var emojiEl     = document.getElementById('flashEmoji');
  var wordEl      = document.getElementById('flashWord');
  var phoneticEl  = document.getElementById('flashPhonetic');
  var progressEl  = document.getElementById('flashProgress');
  var numEl       = document.getElementById('flashNum');
  var totalEl     = document.getElementById('flashTotal');
  var knownEl     = document.getElementById('flashKnown');
  var catSelect   = document.getElementById('flashCatSelect');
  var startBtn    = document.getElementById('flashStart');
  var knowBtn     = document.getElementById('flashKnowBtn');
  var dontKnowBtn = document.getElementById('flashDontKnowBtn');
  var listenBtn   = document.getElementById('flashListen');
  var containerEl = document.getElementById('flashcardsContainer');
  var resultEl    = document.getElementById('flashResult');
  var resultEmoji = document.getElementById('flashResultEmoji');
  var resultTitle = document.getElementById('flashResultTitle');
  var finalScore  = document.getElementById('flashFinalScore');
  var finalTotal  = document.getElementById('flashFinalTotal');
  var playAgain   = document.getElementById('flashPlayAgain');

  if (!cardEl) return;

  var deck, currentIndex, knownCount, isFlipped;

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

  // Populate category dropdown
  function populateCategories() {
    catSelect.innerHTML = '<option value="all">🎲 All Categories</option>';
    Object.keys(VOCAB).forEach(function (cat) {
      var opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
      catSelect.appendChild(opt);
    });
  }

  function showCard() {
    if (currentIndex >= deck.length) {
      showResult();
      return;
    }
    var item = deck[currentIndex];
    isFlipped = false;
    cardEl.classList.remove('flash-flipped');

    emojiEl.textContent = item.emoji;
    wordEl.textContent = item.word;
    phoneticEl.textContent = item.phonetic || '';

    numEl.textContent = currentIndex + 1;
    progressEl.style.width = ((currentIndex + 1) / deck.length * 100) + '%';

    // Hide action buttons until flipped
    knowBtn.classList.add('hidden');
    dontKnowBtn.classList.add('hidden');
  }

  function flipCard() {
    if (isFlipped) return;
    isFlipped = true;
    cardEl.classList.add('flash-flipped');
    var item = deck[currentIndex];
    speak(item.word);

    // Show action buttons
    knowBtn.classList.remove('hidden');
    dontKnowBtn.classList.remove('hidden');
  }

  function markKnown() {
    knownCount++;
    knownEl.textContent = knownCount;
    currentIndex++;
    showCard();
  }

  function markDontKnow() {
    // Push to end for review
    deck.push(deck[currentIndex]);
    currentIndex++;
    totalEl.textContent = deck.length;
    showCard();
  }

  function showResult() {
    containerEl.classList.add('hidden');
    resultEl.classList.remove('hidden');
    finalScore.textContent = knownCount;
    finalTotal.textContent = knownCount;
    var pct = knownCount;
    if (pct >= 10) { resultEmoji.textContent = '🏆'; resultTitle.textContent = 'You know them all!'; }
    else if (pct >= 7) { resultEmoji.textContent = '🎉'; resultTitle.textContent = 'Great memory!'; }
    else if (pct >= 4) { resultEmoji.textContent = '👍'; resultTitle.textContent = 'Good progress!'; }
    else { resultEmoji.textContent = '📚'; resultTitle.textContent = 'Keep learning!'; }
  }

  function startGame() {
    var cat = catSelect.value;
    var pool;
    if (cat === 'all') {
      pool = [];
      Object.keys(VOCAB).forEach(function (k) {
        pool = pool.concat(VOCAB[k]);
      });
    } else {
      pool = VOCAB[cat].slice();
    }
    deck = shuffle(pool).slice(0, 12);
    currentIndex = 0;
    knownCount = 0;
    knownEl.textContent = '0';
    totalEl.textContent = deck.length;
    containerEl.classList.remove('hidden');
    resultEl.classList.add('hidden');
    showCard();
  }

  // Event listeners
  cardEl.addEventListener('click', flipCard);
  knowBtn.addEventListener('click', markKnown);
  dontKnowBtn.addEventListener('click', markDontKnow);
  if (listenBtn) {
    listenBtn.addEventListener('click', function () {
      if (currentIndex < deck.length) speak(deck[currentIndex].word);
    });
  }
  startBtn.addEventListener('click', startGame);
  playAgain.addEventListener('click', startGame);

  populateCategories();
  startGame();
})();
