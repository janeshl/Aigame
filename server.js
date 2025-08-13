import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.static("public"));

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL = process.env.MODEL_NAME || "llama-3.3-70b-versatile";

async function queryGroq(prompt) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8
    })
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

app.post("/api/future", async (req, res) => {
  const { name, month, place } = req.body;
  try {
    const prompt = `Using the name "${name}", birth month "${month}", and favourite place "${place}", write a 2-3 short, fun, and mystical prediction about this person's future in a cyberpunk style.`;
    const prediction = await queryGroq(prompt);
    res.json({ ok: true, prediction });
  } catch (e) {
    res.json({ ok: false });
  }
});

app.post("/api/lies", async (req, res) => {
  const { topic } = req.body;
  try {
    const prompt = `Give 4 statements about ${topic}, where 3 are true and 1 is false. Mark the false one clearly and funny.`;
    const answer = await queryGroq(prompt);
    const lines = answer.split("\n").filter(l => l.trim());
    const facts = lines.map(l => l.replace(/^\d+\.\s*/, ""));
    const answer_index = facts.findIndex(f => /false|lie/i.test(f));
    res.json({
      ok: true,
      facts,
      answer_index,
      reveal_text: "That was the AI's trick!"
    });
  } catch (e) {
    res.json({ ok: false });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
