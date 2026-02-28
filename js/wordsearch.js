/* ============================================================
   FunEnglish Kids – Word Search Game
   ============================================================ */
(function () {
  var gridEl     = document.getElementById('wsGrid');
  var wordListEl = document.getElementById('wsWordList');
  var timerEl    = document.getElementById('wsTimer');
  var foundEl    = document.getElementById('wsFound');
  var totalEl    = document.getElementById('wsTotal');
  var startBtn   = document.getElementById('wsStart');
  var containerEl = document.getElementById('wordsearchContainer');
  var resultEl   = document.getElementById('wsResult');
  var resultEmoji = document.getElementById('wsResultEmoji');
  var resultTitle = document.getElementById('wsResultTitle');
  var finalTime  = document.getElementById('wsFinalTime');
  var finalFound = document.getElementById('wsFinalFound');
  var playAgain  = document.getElementById('wsPlayAgain');

  if (!gridEl) return;

  var GRID_SIZE = 10;
  var grid, words, foundWords, timer, seconds;
  var selecting = false, selStart = null, selCells = [];

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

  function createEmptyGrid() {
    var g = [];
    for (var r = 0; r < GRID_SIZE; r++) {
      g[r] = [];
      for (var c = 0; c < GRID_SIZE; c++) {
        g[r][c] = '';
      }
    }
    return g;
  }

  function canPlace(grid, word, row, col, dr, dc) {
    for (var i = 0; i < word.length; i++) {
      var r = row + i * dr;
      var c = col + i * dc;
      if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return false;
      if (grid[r][c] !== '' && grid[r][c] !== word[i]) return false;
    }
    return true;
  }

  function placeWord(grid, word) {
    // Directions: right, down, diagonal-down-right
    var dirs = [[0,1],[1,0],[1,1]];
    var attempts = 0;
    while (attempts < 100) {
      var d = dirs[Math.floor(Math.random() * dirs.length)];
      var row = Math.floor(Math.random() * GRID_SIZE);
      var col = Math.floor(Math.random() * GRID_SIZE);
      if (canPlace(grid, word, row, col, d[0], d[1])) {
        var cells = [];
        for (var i = 0; i < word.length; i++) {
          grid[row + i * d[0]][col + i * d[1]] = word[i];
          cells.push({ r: row + i * d[0], c: col + i * d[1] });
        }
        return cells;
      }
      attempts++;
    }
    return null;
  }

  function fillEmpty(grid) {
    var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (var r = 0; r < GRID_SIZE; r++) {
      for (var c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c] === '') {
          grid[r][c] = letters[Math.floor(Math.random() * 26)];
        }
      }
    }
  }

  function buildGrid() {
    grid = createEmptyGrid();
    var placed = [];
    var pool = shuffle(WORDSEARCH_WORDS.slice());

    for (var i = 0; i < pool.length && placed.length < 6; i++) {
      if (pool[i].word.length <= GRID_SIZE) {
        var cells = placeWord(grid, pool[i].word);
        if (cells) {
          placed.push({ emoji: pool[i].emoji, word: pool[i].word, cells: cells });
        }
      }
    }

    fillEmpty(grid);
    words = placed;
    return grid;
  }

  function renderGrid() {
    gridEl.innerHTML = '';
    gridEl.style.gridTemplateColumns = 'repeat(' + GRID_SIZE + ', 1fr)';
    for (var r = 0; r < GRID_SIZE; r++) {
      for (var c = 0; c < GRID_SIZE; c++) {
        var cell = document.createElement('button');
        cell.className = 'ws-cell';
        cell.textContent = grid[r][c];
        cell.dataset.row = r;
        cell.dataset.col = c;
        gridEl.appendChild(cell);
      }
    }
  }

  function renderWordList() {
    wordListEl.innerHTML = '';
    words.forEach(function (w) {
      var li = document.createElement('li');
      li.className = 'ws-word-item';
      li.dataset.word = w.word;
      li.innerHTML = '<span class="ws-word-emoji">' + w.emoji + '</span> <span class="ws-word-text">' + w.word + '</span>';
      wordListEl.appendChild(li);
    });
  }

  function getCellsBetween(r1, c1, r2, c2) {
    var dr = r2 === r1 ? 0 : (r2 > r1 ? 1 : -1);
    var dc = c2 === c1 ? 0 : (c2 > c1 ? 1 : -1);
    // Check valid line (horizontal, vertical, or diagonal)
    if (dr === 0 && dc === 0) return [{ r: r1, c: c1 }];
    var diffR = Math.abs(r2 - r1);
    var diffC = Math.abs(c2 - c1);
    if (diffR !== 0 && diffC !== 0 && diffR !== diffC) return [];

    var cells = [];
    var steps = Math.max(diffR, diffC);
    for (var i = 0; i <= steps; i++) {
      cells.push({ r: r1 + i * dr, c: c1 + i * dc });
    }
    return cells;
  }

  function highlightCells(cells, className) {
    cells.forEach(function (pos) {
      var cel = gridEl.querySelector('[data-row="' + pos.r + '"][data-col="' + pos.c + '"]');
      if (cel) cel.classList.add(className);
    });
  }

  function clearHighlight() {
    gridEl.querySelectorAll('.ws-cell-selecting').forEach(function (el) {
      el.classList.remove('ws-cell-selecting');
    });
  }

  function checkSelection(cells) {
    var selected = '';
    cells.forEach(function (pos) {
      selected += grid[pos.r][pos.c];
    });
    var reversed = selected.split('').reverse().join('');

    for (var i = 0; i < words.length; i++) {
      if (foundWords.indexOf(words[i].word) >= 0) continue;
      if (words[i].word === selected || words[i].word === reversed) {
        foundWords.push(words[i].word);
        highlightCells(words[i].cells, 'ws-cell-found');
        foundEl.textContent = foundWords.length;
        speak(words[i].word);

        // Strike through in word list
        var listItem = wordListEl.querySelector('[data-word="' + words[i].word + '"]');
        if (listItem) listItem.classList.add('ws-word-found');

        if (foundWords.length === words.length) {
          clearInterval(timer);
          setTimeout(showResult, 800);
        }
        return true;
      }
    }
    return false;
  }

  // Touch/mouse event handling for selection
  gridEl.addEventListener('mousedown', function (e) {
    var cell = e.target.closest('.ws-cell');
    if (!cell) return;
    selecting = true;
    selStart = { r: parseInt(cell.dataset.row), c: parseInt(cell.dataset.col) };
    clearHighlight();
    cell.classList.add('ws-cell-selecting');
  });

  gridEl.addEventListener('mouseover', function (e) {
    if (!selecting) return;
    var cell = e.target.closest('.ws-cell');
    if (!cell) return;
    clearHighlight();
    var r2 = parseInt(cell.dataset.row);
    var c2 = parseInt(cell.dataset.col);
    selCells = getCellsBetween(selStart.r, selStart.c, r2, c2);
    highlightCells(selCells, 'ws-cell-selecting');
  });

  document.addEventListener('mouseup', function () {
    if (!selecting) return;
    selecting = false;
    if (selCells.length > 0) {
      var found = checkSelection(selCells);
      if (!found) {
        clearHighlight();
      }
    }
    selCells = [];
  });

  // Touch events
  gridEl.addEventListener('touchstart', function (e) {
    var touch = e.touches[0];
    var cell = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!cell || !cell.classList.contains('ws-cell')) return;
    e.preventDefault();
    selecting = true;
    selStart = { r: parseInt(cell.dataset.row), c: parseInt(cell.dataset.col) };
    clearHighlight();
    cell.classList.add('ws-cell-selecting');
  }, { passive: false });

  gridEl.addEventListener('touchmove', function (e) {
    if (!selecting) return;
    e.preventDefault();
    var touch = e.touches[0];
    var cell = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!cell || !cell.classList.contains('ws-cell')) return;
    clearHighlight();
    var r2 = parseInt(cell.dataset.row);
    var c2 = parseInt(cell.dataset.col);
    selCells = getCellsBetween(selStart.r, selStart.c, r2, c2);
    highlightCells(selCells, 'ws-cell-selecting');
  }, { passive: false });

  gridEl.addEventListener('touchend', function (e) {
    if (!selecting) return;
    selecting = false;
    if (selCells.length > 0) {
      var found = checkSelection(selCells);
      if (!found) clearHighlight();
    }
    selCells = [];
  });

  function showResult() {
    containerEl.classList.add('hidden');
    resultEl.classList.remove('hidden');
    finalTime.textContent = seconds;
    finalFound.textContent = foundWords.length;
    if (foundWords.length === words.length) {
      resultEmoji.textContent = '🏆';
      resultTitle.textContent = 'All words found!';
    } else {
      resultEmoji.textContent = '👍';
      resultTitle.textContent = 'Good try!';
    }
  }

  function startGame() {
    foundWords = [];
    seconds = 0;
    clearInterval(timer);
    buildGrid();
    renderGrid();
    renderWordList();
    foundEl.textContent = '0';
    totalEl.textContent = words.length;
    timerEl.textContent = '0';
    containerEl.classList.remove('hidden');
    resultEl.classList.add('hidden');
    timer = setInterval(function () {
      seconds++;
      timerEl.textContent = seconds;
    }, 1000);
  }

  startBtn.addEventListener('click', startGame);
  playAgain.addEventListener('click', startGame);
  startGame();
})();
