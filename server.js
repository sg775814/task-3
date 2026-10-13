import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3000;
const apiKey = process.env.OPENAI_API_KEY?.trim();
const openai = apiKey ? new OpenAI({ apiKey }) : null;
app.use(express.json({ limit: "1mb" }));
app.get("/", (_req, res) => res.sendFile(path.join(__dirname, "INDEX.HTML")));
app.get("/script.js", (_req, res) => res.sendFile(path.join(__dirname, "SCRIPT.JS")));
app.get("/style.css", (_req, res) => res.sendFile(path.join(__dirname, "STYLE.CSS")));
app.get("/api/health", (_req, res) => res.json({ status: "ok", aiConfigured: Boolean(openai) }));
app.post("/api/study", async (req, res) => {
  const prompt = typeof req.body?.prompt === "string" ? req.body.prompt.trim() : "";
  if (!prompt) return res.status(400).json({ error: "Please enter a question or study prompt." });
  if (prompt.length < 3) return res.status(400).json({ error: "Your prompt is too short." });
  if (prompt.length > 5000) return res.status(400).json({ error: "Your prompt must be 5000 characters or fewer." });
  if (!openai) return res.status(503).json({ error: "The backend is running, but OPENAI_API_KEY is not configured. Add it to task_3/.env and restart the server." });
  try {
    const response = await openai.responses.create({ model: "gpt-5-mini", instructions: "You are an AI study assistant. Explain academic topics clearly and concisely, using examples and steps when useful. For quizzes, create practice questions. For summaries, summarize the supplied material. Do not claim certainty when information is uncertain.", input: prompt });
    const answer = response.output_text?.trim();
    if (!answer) return res.status(502).json({ error: "The AI returned an empty response. Please try again." });
    return res.json({ answer });
  } catch (error) {
    console.error("AI request failed:", error);
    return res.status(500).json({ error: "Unable to get an AI response right now. Check the API key and try again." });
  }
});
app.listen(PORT, "0.0.0.0", () => console.log(`AI Study Assistant backend running at http://localhost:${PORT}`));
