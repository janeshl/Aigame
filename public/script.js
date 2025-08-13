const fortuneBtn = document.getElementById("fortune-btn");
const liesBtn = document.getElementById("lies-btn");
const inputSection = document.getElementById("input-section");
const outputSection = document.getElementById("output-section");
const gameTitle = document.getElementById("game-title");
const userInput = document.getElementById("user-input");
const playBtn = document.getElementById("play-btn");
const resetBtn = document.getElementById("reset-btn");
const outputDiv = document.getElementById("output");

let currentGame = null;
let correctIndex = null;

function resetGame() {
  inputSection.classList.add("hidden");
  outputSection.classList.add("hidden");
  document.getElementById("game-selection").classList.remove("hidden");
  userInput.value = "";
  outputDiv.innerHTML = "";
}

fortuneBtn.addEventListener("click", () => {
  currentGame = "fortune";
  gameTitle.textContent = "🥠 AI Fortune Cookie";
  document.getElementById("game-selection").classList.add("hidden");
  inputSection.classList.remove("hidden");
  userInput.placeholder = "Enter your name or a fun fact...";
});

liesBtn.addEventListener("click", () => {
  currentGame = "lies";
  gameTitle.textContent = "🕵️ Guess the AI’s Lie";
  document.getElementById("game-selection").classList.add("hidden");
  inputSection.classList.remove("hidden");
  userInput.placeholder = "Enter a topic (e.g., cats, space, pizza)...";
});

playBtn.addEventListener("click", async () => {
  const text = userInput.value.trim();
  if (!text) return alert("Please enter something!");

  outputDiv.textContent = "Thinking...";
  outputSection.classList.remove("hidden");
  inputSection.classList.add("hidden");

  if (currentGame === "fortune") {
    const res = await fetch("/api/fortune", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: text })
    });
    const data = await res.json();
    outputDiv.textContent = data.ok ? data.fortune : "Error generating fortune.";
  } else if (currentGame === "lies") {
    const res = await fetch("/api/lies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: text })
    });
    const data = await res.json();
    if (!data.ok) {
      outputDiv.textContent = "Error generating quiz.";
      return;
    }
    correctIndex = data.answer_index;
    const factsList = data.facts
      .map((fact, i) => `<li data-index="${i}">${fact}</li>`)
      .join("");
    outputDiv.innerHTML = `<p>One of these is a lie — can you guess?</p><ul id="facts-list">${factsList}</ul>`;
    document.querySelectorAll("#facts-list li").forEach(li => {
      li.style.cursor = "pointer";
      li.addEventListener("click", () => {
        const idx = parseInt(li.dataset.index);
        if (idx === correctIndex) {
          li.style.color = "red";
          alert(`🎉 Correct! ${data.reveal_text}`);
        } else {
          li.style.color = "green";
          alert(`❌ Nope! The lie was: "${data.facts[correctIndex]}".`);
        }
      });
    });
  }
});

resetBtn.addEventListener("click", resetGame);

resetGame();
