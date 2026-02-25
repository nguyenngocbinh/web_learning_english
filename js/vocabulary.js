/* ============================================================
   FunEnglish Kids – Vocabulary Section
   ============================================================ */

(function () {
  const grid = document.getElementById('vocabGrid');
  const tabs = document.getElementById('categoryTabs');
  if (!grid || !tabs) return;

  function speak(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.85;
    utter.pitch = 1.1;
    window.speechSynthesis.speak(utter);
  }

  function renderCategory(cat) {
    const items = VOCAB[cat] || [];
    grid.innerHTML = '';
    items.forEach(function (item, i) {
      const card = document.createElement('div');
      card.className = 'vocab-card fade-in';
      card.style.animationDelay = (i * 0.05) + 's';
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', item.word);

      card.innerHTML =
        '<span class="vocab-emoji">' + item.emoji + '</span>' +
        '<span class="vocab-word">'  + item.word  + '</span>' +
        '<span class="vocab-phonetic">' + item.phonetic + '</span>';

      card.addEventListener('click', function () {
        speak(item.word);
        card.style.transform = 'scale(1.1)';
        setTimeout(function () { card.style.transform = ''; }, 250);
      });

      grid.appendChild(card);
    });
  }

  // Tab switching
  tabs.addEventListener('click', function (e) {
    const btn = e.target.closest('.cat-tab');
    if (!btn) return;
    tabs.querySelectorAll('.cat-tab').forEach(function (t) { t.classList.remove('active'); });
    btn.classList.add('active');
    renderCategory(btn.dataset.cat);
  });

  // Initial render
  renderCategory('animals');
})();
