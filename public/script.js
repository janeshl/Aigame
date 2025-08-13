document.addEventListener("DOMContentLoaded", () => {
  const gameSelection = document.getElementById("game-selection");
  const futureInputSection = document.getElementById("future-input-section");
  const outputSection = document.getElementById("output-section");

  const futureBtn = document.getElementById("future-btn");
  const liesBtn = document.getElementById("lies-btn");
  const playBtn = document.getElementById("future-play-btn");
  const resetBtn = document.getElementById("reset-btn");

  const nameInput = document.getElementById("name-input");
  const monthInput = document.getElementById("month-input");
  const placeInput = document.getElementById("place-input");
  const outputBox = document.getElementById("output");

  // Utility for switching panels
  function showPanel(panelToShow) {
    [gameSelection, futureInputSection, outputSection].forEach(panel => {
      panel.classList.add("hidden");
    });
    panelToShow.classList.remove("hidden");
    panelToShow.classList.add("slide-up");
  }

  // Click: Select Future Prediction Game
  futureBtn.addEventListener("click", () => {
    showPanel(futureInputSection);
  });

  // Click: Select Guess the AI's Lie (placeholder for now)
  liesBtn.addEventListener("click", () => {
    outputBox.innerHTML = `<p style="color:magenta">The 'Guess the AI’s Lie' game is coming soon in this new futuristic theme 🚀</p>`;
    showPanel(outputSection);
  });

  // Click: Play Future Prediction
  playBtn.addEventListener("click", async () => {
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

      if (!res.ok) throw new Error("Prediction request failed");

      const data = await res.json();
      outputBox.innerHTML = `<p style="color:lime">${data.prediction}</p>`;
    } catch (err) {
      console.error(err);
      outputBox.innerHTML = `<p style="color:red">Error fetching prediction. Try again.</p>`;
    }
  });

  // Reset to game selection
  resetBtn.addEventListener("click", () => {
    nameInput.value = "";
    monthInput.value = "";
    placeInput.value = "";
    showPanel(gameSelection);
  });
});
