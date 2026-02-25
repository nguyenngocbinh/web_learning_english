/* ============================================================
   FunEnglish Kids – Alphabet Section
   ============================================================ */

(function () {
  const grid = document.getElementById('alphabetGrid');
  if (!grid) return;

  // Speak a word using Web Speech API (if available)
  function speak(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.85;
    utter.pitch = 1.2;
    window.speechSynthesis.speak(utter);
  }

  // Build alphabet grid
  ALPHABET.forEach(function (item) {
    const card = document.createElement('div');
    card.className = 'letter-card';
    card.style.background = item.color;
    card.setAttribute('title', item.letter + ' for ' + item.word);
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', 'Letter ' + item.letter + ', ' + item.word);

    card.innerHTML =
      '<span class="letter-char">' + item.letter + '</span>' +
      '<span class="letter-emoji">' + item.emoji + '</span>' +
      '<span class="letter-word">' + item.word + '</span>';

    card.addEventListener('click', function () {
      // Animate
      card.classList.remove('active');
      void card.offsetWidth; // reflow to restart animation
      card.classList.add('active');
      speak(item.letter + '. ' + item.word);
    });

    grid.appendChild(card);
  });
})();
