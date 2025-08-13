import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.static("public"));

const API_KEY = process.env.GROQ_API_KEY;
const MODEL = process.env.MODEL_NAME || "llama-3.3-70b-versatile";

app.post("/api/future-prediction", async (req, res) => {
  const { name, month, place } = req.body;
  if (!name || !month || !place) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const prompt = `You are an AI oracle from the year 3050. 
    Using advanced cosmic algorithms, predict a humorous but inspiring future for:
    Name: ${name}
    Birth Month: ${month}
    Favourite Place: ${place}
    Make it feel like a mystical sci-fi prophecy.`;

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
    const prediction = data?.choices?.[0]?.message?.content || "Your future is... unknown due to quantum fog. 🌫️";

    res.json({ prediction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Prediction failed" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
