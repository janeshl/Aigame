import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.static("public"));

const API_KEY = process.env.GROQ_API_KEY;
const MODEL = process.env.MODEL_NAME || "llama-3.3-70b-versatile";

// AI Future Prediction
app.post("/api/future-prediction", async (req, res) => {
  const { name, month, place } = req.body;
  if (!name || !month || !place) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const prompt = `You are a futuristic AI oracle from the year 3050.
  Given:
  Name: ${name}
  Birth Month: ${month}
  Favourite Place: ${place}
  Create a humorous yet mystical sci-fi prediction about their future.
  Keep it under 80 words and make it inspiring.`;

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.9
      })
    });

    const data = await groqRes.json();
    const prediction = data?.choices?.[0]?.message?.content || "Your future is cloaked in quantum mist. 🌫️";

    res.json({ prediction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Prediction failed" });
  }
});

// Guess the AI's Lie Game
app.get("/api/lies-game", async (req, res) => {
  const prompt = `Create a "Three Truths and a Lie" game.
  Give 4 numbered statements (1, 2, 3, 4).
  Randomly make one false and mark which number is false in your answer.
  Respond in JSON format:
  {
    "statements": ["...", "...", "...", "..."],
    "answer": "number"
  }`;

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8
      })
    });

    const data = await groqRes.json();
    let parsed;
    try {
      parsed = JSON.parse(data?.choices?.[0]?.message?.content);
    } catch (err) {
      return res.status(500).json({ error: "AI response parse error" });
    }

    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lies game failed" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
