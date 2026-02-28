/* ============================================================
   FunEnglish Kids – Word Bingo Game
   ============================================================ */
(function () {
  var boardEl     = document.getElementById('bingoBoard');
  var calledEl    = document.getElementById('bingoCalled');
  var callBtn     = document.getElementById('bingoCallBtn');
  var numEl       = document.getElementById('bingoNum');
  var startBtn    = document.getElementById('bingoStart');
  var sizeSelect  = document.getElementById('bingoSize');
  var containerEl = document.getElementById('bingoContainer');
  var resultEl    = document.getElementById('bingoResult');
  var resultEmoji = document.getElementById('bingoResultEmoji');
  var resultTitle = document.getElementById('bingoResultTitle');
  var resultStats = document.getElementById('bingoResultStats');
  var playAgain   = document.getElementById('bingoPlayAgain');

  if (!boardEl) return;

  var boardSize, board, callQueue, callIndex, marked, calledWords, gameOver;

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  function speak(text) {
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US'; u.rate = 0.8; u.pitch = 1.1;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }

  function createBoard() {
    boardSize = sizeSelect ? parseInt(sizeSelect.value) : 3;
    var total = boardSize * boardSize;
    var pool = shuffle(BINGO_WORDS.slice());
    board = pool.slice(0, total);
    marked = new Array(total).fill(false);
    calledWords = [];
    callIndex = 0;
    gameOver = false;

    // Call queue: all board words + some extras, shuffled
    callQueue = shuffle(board.slice());

    renderBoard();
    calledEl.innerHTML = '<span class="bingo-instruction">Press "Call Word" to start!</span>';
    numEl.textContent = '0';
  }

  function renderBoard() {
    boardEl.innerHTML = '';
    boardEl.style.gridTemplateColumns = 'repeat(' + boardSize + ', 1fr)';

    board.forEach(function (item, idx) {
      var cell = document.createElement('button');
      cell.className = 'bingo-cell';
      cell.dataset.index = idx;
      cell.innerHTML = '<span class="bingo-emoji">' + item.emoji + '</span><span class="bingo-label">' + item.word + '</span>';
      if (marked[idx]) cell.classList.add('bingo-marked');
      boardEl.appendChild(cell);
    });
  }

  function callWord() {
    if (gameOver || callIndex >= callQueue.length) return;

    var word = callQueue[callIndex];
    callIndex++;
    calledWords.push(word);
    numEl.textContent = callIndex;

    // Display and speak
    calledEl.innerHTML = '<span class="bingo-called-emoji">' + word.emoji + '</span> <span class="bingo-called-word">' + word.word + '</span>';
    speak(word.word);
  }

  function markCell(index) {
    if (gameOver || marked[index]) return;

    // Check if this word has been called
    var cellWord = board[index].word;
    var wasCalled = calledWords.some(function (w) { return w.word === cellWord; });

    if (!wasCalled) {
      // Flash wrong
      var cell = boardEl.children[index];
      cell.classList.add('bingo-wrong');
      setTimeout(function () { cell.classList.remove('bingo-wrong'); }, 600);
      return;
    }

    marked[index] = true;
    var cell = boardEl.children[index];
    cell.classList.add('bingo-marked');
    speak(cellWord);

    // Check for Bingo
    if (checkBingo()) {
      gameOver = true;
      setTimeout(showResult, 500);
    }
  }

  function checkBingo() {
    // Check rows
    for (var r = 0; r < boardSize; r++) {
      var rowWin = true;
      for (var c = 0; c < boardSize; c++) {
        if (!marked[r * boardSize + c]) { rowWin = false; break; }
      }
      if (rowWin) { highlightLine('row', r); return true; }
    }

    // Check columns
    for (var c = 0; c < boardSize; c++) {
      var colWin = true;
      for (var r = 0; r < boardSize; r++) {
        if (!marked[r * boardSize + c]) { colWin = false; break; }
      }
      if (colWin) { highlightLine('col', c); return true; }
    }

    // Check diagonals
    var diag1 = true, diag2 = true;
    for (var i = 0; i < boardSize; i++) {
      if (!marked[i * boardSize + i]) diag1 = false;
      if (!marked[i * boardSize + (boardSize - 1 - i)]) diag2 = false;
    }
    if (diag1) { highlightLine('diag', 0); return true; }
    if (diag2) { highlightLine('diag', 1); return true; }

    return false;
  }

  function highlightLine(type, index) {
    var cells = boardEl.querySelectorAll('.bingo-cell');
    for (var i = 0; i < boardSize; i++) {
      var cellIdx;
      if (type === 'row') cellIdx = index * boardSize + i;
      else if (type === 'col') cellIdx = i * boardSize + index;
      else if (type === 'diag' && index === 0) cellIdx = i * boardSize + i;
      else cellIdx = i * boardSize + (boardSize - 1 - i);
      cells[cellIdx].classList.add('bingo-win');
    }
  }

  function showResult() {
    containerEl.classList.add('hidden');
    resultEl.classList.remove('hidden');
    resultEmoji.textContent = '🎉';
    resultTitle.textContent = 'BINGO!';
    resultStats.textContent = 'You got Bingo in ' + callIndex + ' calls!';
    speak('Bingo! You win!');
  }

  function startGame() {
    containerEl.classList.remove('hidden');
    resultEl.classList.add('hidden');
    createBoard();
  }

  // Board click delegation
  boardEl.addEventListener('click', function (e) {
    var cell = e.target.closest('.bingo-cell');
    if (!cell) return;
    markCell(parseInt(cell.dataset.index));
  });

  callBtn.addEventListener('click', callWord);
  startBtn.addEventListener('click', startGame);
  playAgain.addEventListener('click', startGame);
  startGame();
})();
