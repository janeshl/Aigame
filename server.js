import express from "express";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { z } from "zod";
import Groq from "groq-sdk";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const MODEL = process.env.MODEL_NAME || "llama-3.3-70b-versatile";

if (!process.env.GROQ_API_KEY) {
  console.error("❌ Missing GROQ_API_KEY in environment.");
  process.exit(1);
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Middleware
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("tiny"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false
  })
);

// Serve frontend
app.use(express.static("public"));

// Schemas
const fortuneSchema = z.object({
  input: z.string().min(1).max(160)
});
const liesSchema = z.object({
  topic: z.string().min(1).max(120)
});

function sanitizeForPrompt(s) {
  return s.replace(/\s+/g, " ").trim();
}

// Routes
app.post("/api/fortune", async (req, res) => {
  try {
    const { input } = fortuneSchema.parse(req.body);
    const cleaned = sanitizeForPrompt(input);

    const systemPrompt = `
You are a witty AI fortune teller for a public stall.
Give exactly ONE fortune, 1–2 short sentences, playful, absurd, family-friendly.
`;
    const userPrompt = `Give a fortune for: ${cleaned}`;

    const completion = await groq.chat.completions.create({
      model: MODEL,
      temperature: 0.9,
      max_tokens: 80,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    });

    const fortune =
      completion.choices?.[0]?.message?.content?.trim() ||
      "You will unexpectedly win a staring contest with a squirrel.";

    res.json({ ok: true, fortune });
  } catch (err) {
    console.error(err);
    res.status(400).json({ ok: false, error: "Could not generate fortune." });
  }
});

app.post("/api/lies", async (req, res) => {
  try {
    const { topic } = liesSchema.parse(req.body);
    const cleaned = sanitizeForPrompt(topic);

    const systemPrompt = `
You are a quizmaster for a family event.
Given a topic, make 2 true facts and 1 funny fake fact.
Return strict JSON:
{
  "facts": ["...", "...", "..."],
  "answer_index": 0,
  "reveal_text": "Short funny reveal"
}
`;
    const userPrompt = `Create quiz for topic: ${cleaned}`;

    const completion = await groq.chat.completions.create({
      model: MODEL,
      temperature: 0.8,
      max_tokens: 200,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    });

    let payload;
    try {
      payload = JSON.parse(completion.choices[0].message.content);
    } catch (e) {
      throw new Error("Bad JSON from model");
    }

    res.json({
      ok: true,
      facts: payload.facts,
      answer_index: payload.answer_index,
      reveal_text: payload.reveal_text
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ ok: false, error: "Could not create quiz." });
  }
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
