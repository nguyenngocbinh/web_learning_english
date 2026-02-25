/* ============================================================
   FunEnglish Kids – Word Quiz Game
   ============================================================ */

(function () {
  const container   = document.getElementById('quizContainer');
  const resultPanel = document.getElementById('quizResult');
  const elNum       = document.getElementById('qNum');
  const elScore     = document.getElementById('qScore');
  const elProgress  = document.getElementById('qProgress');
  const elEmoji     = document.getElementById('qEmoji');
  const elText      = document.getElementById('qText');
  const elOptions   = document.getElementById('qOptions');
  const elResultEmoji = document.getElementById('qResultEmoji');
  const elResultTitle = document.getElementById('qResultTitle');
  const elFinal     = document.getElementById('qFinalScore');
  const btnAgain    = document.getElementById('quizPlayAgain');

  if (!container) return;

  const TOTAL = 10;
  let questions = [];
  let current   = 0;
  let score     = 0;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function speak(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.85;
    utter.pitch = 1.1;
    window.speechSynthesis.speak(utter);
  }

  function startQuiz() {
    questions = shuffle(QUIZ_QUESTIONS).slice(0, TOTAL);
    current   = 0;
    score     = 0;
    container.classList.remove('hidden');
    resultPanel.classList.add('hidden');
    showQuestion();
  }

  function showQuestion() {
    const q = questions[current];
    elNum.textContent      = current + 1;
    elScore.textContent    = score;
    elProgress.style.width = ((current / TOTAL) * 100) + '%';

    // Animate emoji change
    elEmoji.style.animation = 'none';
    void elEmoji.offsetWidth;
    elEmoji.style.animation = '';
    elEmoji.textContent = q.emoji;
    elText.textContent  = q.question;

    // Shuffle options and render
    const shuffled = shuffle(q.options);
    elOptions.innerHTML = '';
    shuffled.forEach(function (opt) {
      const btn = document.createElement('button');
      btn.className   = 'quiz-option';
      btn.textContent = opt;
      btn.addEventListener('click', function () { selectAnswer(opt, q.answer); });
      elOptions.appendChild(btn);
    });

    speak(q.question);
  }

  function selectAnswer(selected, correct) {
    // Disable all options
    elOptions.querySelectorAll('.quiz-option').forEach(function (btn) {
      btn.disabled = true;
      if (btn.textContent === correct) {
        btn.classList.add('correct');
      } else if (btn.textContent === selected && selected !== correct) {
        btn.classList.add('wrong');
      }
    });

    if (selected === correct) {
      score++;
      speak('Correct! ' + correct);
    } else {
      speak('The answer is ' + correct);
    }

    elScore.textContent = score;

    setTimeout(function () {
      current++;
      if (current < TOTAL) {
        showQuestion();
      } else {
        showResult();
      }
    }, 1200);
  }

  function showResult() {
    elProgress.style.width = '100%';
    container.classList.add('hidden');
    resultPanel.classList.remove('hidden');

    elFinal.textContent = score;

    if (score >= 9) {
      elResultEmoji.textContent = '🏆';
      elResultTitle.textContent = 'Outstanding!';
    } else if (score >= 7) {
      elResultEmoji.textContent = '🎉';
      elResultTitle.textContent = 'Great Job!';
    } else if (score >= 5) {
      elResultEmoji.textContent = '👍';
      elResultTitle.textContent = 'Good Try!';
    } else {
      elResultEmoji.textContent = '📚';
      elResultTitle.textContent = 'Keep Practicing!';
    }
  }

  if (btnAgain) {
    btnAgain.addEventListener('click', startQuiz);
  }

  // Auto-start
  startQuiz();
})();
