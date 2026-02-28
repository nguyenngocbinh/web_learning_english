/* ============================================================
   FunEnglish Kids – Sentence Builder Game
   ============================================================ */
(function () {
  var emojiEl     = document.getElementById('sentEmoji');
  var slotsEl     = document.getElementById('sentSlots');
  var wordsEl     = document.getElementById('sentWords');
  var feedEl      = document.getElementById('sentFeedback');
  var numEl       = document.getElementById('sentNum');
  var scoreEl     = document.getElementById('sentScore');
  var clearBtn    = document.getElementById('sentClear');
  var startBtn    = document.getElementById('sentStart');
  var containerEl = document.getElementById('sentenceContainer');
  var resultEl    = document.getElementById('sentResult');
  var resultEmoji = document.getElementById('sentResultEmoji');
  var resultTitle = document.getElementById('sentResultTitle');
  var finalScore  = document.getElementById('sentFinalScore');
  var playAgain   = document.getElementById('sentPlayAgain');

  if (!slotsEl) return;

  var sentences, current, score, round, totalRounds, placed;
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

  function showSentence() {
    if (round >= totalRounds || round >= sentences.length) {
      showResult();
      return;
    }
    current = sentences[round];
    placed = [];
    feedEl.textContent = '';
    feedEl.className = 'sentence-feedback';
    numEl.textContent = round + 1;
    emojiEl.textContent = current.emoji;

    var correctWords = current.sentence.split(' ');
    var scrambled = shuffle(correctWords.slice());

    // Build answer slots
    slotsEl.innerHTML = '';
    for (var i = 0; i < correctWords.length; i++) {
      var slot = document.createElement('div');
      slot.className = 'sent-slot';
      slot.dataset.index = i;
      slotsEl.appendChild(slot);
    }

    // Build word buttons
    wordsEl.innerHTML = '';
    scrambled.forEach(function (w, idx) {
      var btn = document.createElement('button');
      btn.className = 'sent-word-btn';
      btn.textContent = w;
      btn.dataset.original = idx;
      wordsEl.appendChild(btn);
    });
  }

  function placeWord(word, btn) {
    if (placed.length >= current.sentence.split(' ').length) return;

    placed.push(word);
    btn.classList.add('sent-word-used');
    btn.disabled = true;

    var slot = slotsEl.children[placed.length - 1];
    if (slot) {
      slot.textContent = word;
      slot.classList.add('sent-slot-filled');
      slot.dataset.word = word;
    }

    // Check if all words placed
    if (placed.length === current.sentence.split(' ').length) {
      checkAnswer();
    }
  }

  function removeWord(index) {
    var word = placed[index];
    placed.splice(index);

    // Re-enable buttons for removed words and onwards
    var slots = slotsEl.querySelectorAll('.sent-slot');
    for (var i = index; i < slots.length; i++) {
      slots[i].textContent = '';
      slots[i].classList.remove('sent-slot-filled', 'sent-slot-correct', 'sent-slot-wrong');
      delete slots[i].dataset.word;
    }

    // Re-enable corresponding word buttons
    var btns = wordsEl.querySelectorAll('.sent-word-btn');
    btns.forEach(function (btn) {
      var isPlaced = placed.indexOf(btn.textContent) >= 0;
      // Count occurrences
      var placedCount = placed.filter(function(w) { return w === btn.textContent; }).length;
      var btnCount = 0;
      btns.forEach(function(b) {
        if (b.textContent === btn.textContent && b.disabled) btnCount++;
      });
      if (btnCount > placedCount) {
        btn.classList.remove('sent-word-used');
        btn.disabled = false;
      }
    });
    // Simpler approach: re-enable all, then disable placed ones
    btns.forEach(function(b) { b.classList.remove('sent-word-used'); b.disabled = false; });
    var tempPlaced = placed.slice();
    btns.forEach(function(b) {
      var idx = tempPlaced.indexOf(b.textContent);
      if (idx >= 0) {
        b.classList.add('sent-word-used');
        b.disabled = true;
        tempPlaced.splice(idx, 1);
      }
    });
  }

  function checkAnswer() {
    var answer = placed.join(' ');
    var correct = current.sentence;
    var correctWords = correct.split(' ');
    var slots = slotsEl.querySelectorAll('.sent-slot');

    if (answer === correct) {
      score++;
      scoreEl.textContent = score;
      slots.forEach(function (s) { s.classList.add('sent-slot-correct'); });
      feedEl.textContent = '🎉 Correct! "' + correct + '"';
      feedEl.className = 'sentence-feedback spell-correct';
      speak(correct);
      setTimeout(function () { round++; showSentence(); }, 2000);
    } else {
      // Highlight correct/wrong positions
      for (var i = 0; i < slots.length; i++) {
        if (placed[i] === correctWords[i]) {
          slots[i].classList.add('sent-slot-correct');
        } else {
          slots[i].classList.add('sent-slot-wrong');
        }
      }
      feedEl.textContent = '❌ Try again! The correct sentence is: "' + correct + '"';
      feedEl.className = 'sentence-feedback spell-wrong';
      speak(correct);
      setTimeout(function () { round++; showSentence(); }, 2500);
    }
  }

  function clearAll() {
    placed = [];
    var slots = slotsEl.querySelectorAll('.sent-slot');
    slots.forEach(function (s) {
      s.textContent = '';
      s.classList.remove('sent-slot-filled', 'sent-slot-correct', 'sent-slot-wrong');
    });
    var btns = wordsEl.querySelectorAll('.sent-word-btn');
    btns.forEach(function (b) {
      b.classList.remove('sent-word-used');
      b.disabled = false;
    });
    feedEl.textContent = '';
  }

  function showResult() {
    containerEl.classList.add('hidden');
    resultEl.classList.remove('hidden');
    finalScore.textContent = score;
    if (score >= 9) { resultEmoji.textContent = '🏆'; resultTitle.textContent = 'Sentence master!'; }
    else if (score >= 7) { resultEmoji.textContent = '🎉'; resultTitle.textContent = 'Great grammar!'; }
    else if (score >= 5) { resultEmoji.textContent = '👍'; resultTitle.textContent = 'Good effort!'; }
    else { resultEmoji.textContent = '📚'; resultTitle.textContent = 'Keep practicing!'; }
  }

  function startGame() {
    sentences = shuffle(SENTENCE_DATA.slice()).slice(0, totalRounds);
    score = 0; round = 0;
    scoreEl.textContent = '0';
    containerEl.classList.remove('hidden');
    resultEl.classList.add('hidden');
    showSentence();
  }

  // Click on word buttons to place
  wordsEl.addEventListener('click', function (e) {
    var btn = e.target.closest('.sent-word-btn');
    if (!btn || btn.disabled) return;
    placeWord(btn.textContent, btn);
  });

  // Click on filled slots to remove
  slotsEl.addEventListener('click', function (e) {
    var slot = e.target.closest('.sent-slot');
    if (!slot || !slot.classList.contains('sent-slot-filled')) return;
    var index = parseInt(slot.dataset.index);
    removeWord(index);
  });

  clearBtn.addEventListener('click', clearAll);
  startBtn.addEventListener('click', startGame);
  playAgain.addEventListener('click', startGame);
  startGame();
})();
