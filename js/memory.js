/* ============================================================
   FunEnglish Kids – Memory Match Game
   ============================================================ */

(function () {
  const board     = document.getElementById('memoryBoard');
  const btnStart  = document.getElementById('memStart');
  const btnAgain  = document.getElementById('memPlayAgain');
  const elTimer   = document.getElementById('memTimer');
  const elMoves   = document.getElementById('memMoves');
  const elResult  = document.getElementById('memResult');
  const elRTime   = document.getElementById('rTime');
  const elRMoves  = document.getElementById('rMoves');
  const difficulty= document.getElementById('memDifficulty');

  if (!board) return;

  let flipped   = [];
  let matched   = 0;
  let moves     = 0;
  let totalPairs= 8;
  let timerInterval = null;
  let seconds   = 0;
  let locked    = false;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function startTimer() {
    clearInterval(timerInterval);
    seconds = 0;
    elTimer.textContent = '0';
    timerInterval = setInterval(function () {
      seconds++;
      elTimer.textContent = seconds;
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
  }

  function updateStats() {
    elMoves.textContent = moves;
    var pairsEl = document.getElementById('memPairs');
    if (pairsEl) pairsEl.textContent = matched;
  }

  function createCard(item) {
    const card = document.createElement('div');
    card.className = 'mem-card';
    card.dataset.value = item.label;
    card.innerHTML =
      '<div class="mem-card-inner">' +
        '<div class="mem-card-front"></div>' +
        '<div class="mem-card-back">' +
          item.emoji +
          '<span>' + item.label + '</span>' +
        '</div>' +
      '</div>';

    card.addEventListener('click', function () {
      if (locked) return;
      if (card.classList.contains('flipped')) return;
      if (card.classList.contains('matched')) return;

      card.classList.add('flipped');
      flipped.push(card);

      if (flipped.length === 2) {
        locked = true;
        moves++;
        updateStats();
        checkMatch();
      }
    });
    return card;
  }

  function checkMatch() {
    const [c1, c2] = flipped;
    if (c1.dataset.value === c2.dataset.value) {
      c1.classList.add('matched');
      c2.classList.add('matched');
      matched++;
      updateStats();
      flipped = [];
      locked  = false;
      if (matched === totalPairs) {
        stopTimer();
        setTimeout(showResult, 500);
      }
    } else {
      setTimeout(function () {
        c1.classList.remove('flipped');
        c2.classList.remove('flipped');
        flipped = [];
        locked  = false;
      }, 1000);
    }
  }

  function showResult() {
    elRTime.textContent  = seconds;
    elRMoves.textContent = moves;
    elResult.classList.remove('hidden');
  }

  function startGame() {
    // Clear state
    board.innerHTML = '';
    flipped  = [];
    matched  = 0;
    moves    = 0;
    locked   = false;
    elResult.classList.add('hidden');

    const mode = difficulty ? difficulty.value : 'easy';
    totalPairs = (mode === 'medium') ? 12 : 8;

    // Update displayed total
    document.getElementById('memPairs').textContent = '0';
    document.querySelector('#game-memory .info-badge:last-of-type').innerHTML =
      '✅ Pairs: <strong id="memPairs">0</strong>/' + totalPairs;

    const cols = (mode === 'medium') ? 6 : 4;
    board.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';

    // Update the pairs label without breaking cached ref
    var pairsLabel = document.querySelector('#game-memory .info-badge:last-of-type');
    if (pairsLabel) pairsLabel.innerHTML = '✅ Pairs: <strong id="memPairs">0</strong>/' + totalPairs;

    const pool    = shuffle(MEMORY_CARDS).slice(0, totalPairs);
    const doubled = shuffle([...pool, ...pool]);

    doubled.forEach(function (item) {
      board.appendChild(createCard(item));
    });

    updateStats();
    startTimer();
  }

  btnStart.addEventListener('click', startGame);
  if (btnAgain) btnAgain.addEventListener('click', startGame);

  // Auto-start on load
  startGame();
})();
