document.addEventListener("DOMContentLoaded", () => {
  const gameSelection = document.getElementById("game-selection");
  const futureInputSection = document.getElementById("future-input-section");
  const lieInputSection = document.getElementById("lie-input-section");
  const outputSection = document.getElementById("output-section");

  const futureBtn = document.getElementById("future-btn");
  const liesBtn = document.getElementById("lies-btn");

  const futurePlayBtn = document.getElementById("future-play-btn");
  const liePlayBtn = document.getElementById("lie-play-btn");

  const guessInput = document.getElementById("guess-input");
  const guessSubmitBtn = document.getElementById("guess-submit-btn");

  const resetBtn = document.getElementById("reset-btn");
  const outputBox = document.getElementById("output");

  const nameInput = document.getElementById("name-input");
  const monthInput = document.getElementById("month-input");
  const placeInput = document.getElementById("place-input");

  let currentLieAnswer = null;

  function showPanel(panelToShow) {
    [gameSelection, futureInputSection, lieInputSection, outputSection].forEach(panel => {
      panel.classList.add("hidden");
    });
    panelToShow.classList.remove("hidden");
    panelToShow.classList.add("slide-up");
  }

  // Future Prediction Game
  futureBtn.addEventListener("click", () => {
    showPanel(futureInputSection);
  });

  futurePlayBtn.addEventListener("click", async () => {
    const name = nameInput.value.trim();
    const month = monthInput.value.trim();
    const place = placeInput.value.trim();

    if (!name || !month || !place) {
      outputBox.innerHTML = `<p style="color:red">Please fill in all fields before we predict your future.</p>`;
      showPanel(outputSection);
      return;
    }

    outputBox.innerHTML = `<p style="color:cyan">Scanning the cosmic data streams... 🌌</p>`;
    showPanel(outputSection);

    try {
      const res = await fetch("/api/future-prediction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, month, place })
      });

      const data = await res.json();
      outputBox.innerHTML = `<p style="color:lime">${data.prediction}</p>`;
    } catch (err) {
      outputBox.innerHTML = `<p style="color:red">Error fetching prediction. Try again.</p>`;
    }
  });

  // Lie Game
  liesBtn.addEventListener("click", () => {
    showPanel(lieInputSection);
  });

  liePlayBtn.addEventListener("click", async () => {
    outputBox.innerHTML = `<p style="color:cyan">Generating your challenge...</p>`;
    showPanel(outputSection);

    try {
      const res = await fetch("/api/lies-game", { method: "GET" });
      const data = await res.json();
      currentLieAnswer = data.answer;
      outputBox.innerHTML = `<p style="color:yellow">${data.statements.join("<br>")}</p>
                             <p style="color:cyan">Which one is the lie? (Enter 1, 2, or 3 below)</p>`;
      guessInput.classList.remove("hidden");
      guessSubmitBtn.classList.remove("hidden");
    } catch (err) {
      outputBox.innerHTML = `<p style="color:red">Error fetching challenge.</p>`;
    }
  });

  guessSubmitBtn.addEventListener("click", () => {
    const guess = guessInput.value.trim();
    if (guess === currentLieAnswer) {
      outputBox.innerHTML += `<p style="color:lime">✅ Correct! You spotted the lie.</p>`;
    } else {
      outputBox.innerHTML += `<p style="color:red">❌ Nope! The lie was #${currentLieAnswer}.</p>`;
    }
    guessInput.classList.add("hidden");
    guessSubmitBtn.classList.add("hidden");
  });

  // Reset
  resetBtn.addEventListener("click", () => {
    nameInput.value = "";
    monthInput.value = "";
    placeInput.value = "";
    guessInput.value = "";
    guessInput.classList.add("hidden");
    guessSubmitBtn.classList.add("hidden");
    showPanel(gameSelection);
  });
});
