const express = require("express");
const router  = express.Router();
const Groq    = require("groq-sdk");

/*
  WHY keep AI calls on the backend?
  If you call Groq directly from the frontend, your API key
  is exposed in the browser — anyone can steal it and use your
  free quota. Backend acts as a proxy: frontend calls YOUR
  server, YOUR server calls Groq with the secret key.
*/

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = "llama-3.1-8b-instant"; // free, fast model on Groq

// ── 1. REVIEW SUMMARIZER ─────────────────────────────────────────────────────
// POST /api/ai/summarize-reviews
// Body: { reviews: [{ rating, comment }] }
// Returns: { summary: "one line summary" }
router.post("/summarize-reviews", async (req, res) => {
  try {
    const { reviews } = req.body;

    if (!reviews || reviews.length === 0) {
      return res.json({ summary: null });
    }

    if (reviews.length < 2) {
      return res.json({ summary: null }); // not enough reviews to summarize
    }

    const reviewText = reviews
      .map((r) => `Rating: ${r.rating}/5 — "${r.comment}"`)
      .join("\n");

    const response = await groq.chat.completions.create({
      model: MODEL,
      max_tokens: 80,
      messages: [
        {
          role: "system",
          content:
            "You are a review summarizer for an e-commerce site. " +
            "Summarize customer reviews in ONE concise sentence (max 20 words). " +
            "Mention what customers love and any common complaints. " +
            "Be honest and neutral. Return ONLY the summary sentence, nothing else.",
        },
        {
          role: "user",
          content: `Summarize these product reviews:\n${reviewText}`,
        },
      ],
    });

    const summary = response.choices[0].message.content.trim();
    res.json({ summary });
  } catch (err) {
    console.error("AI summarize error:", err.message);
    res.status(500).json({ message: "AI service unavailable" });
  }
});

// ── 2. DESCRIPTION GENERATOR ─────────────────────────────────────────────────
// POST /api/ai/generate-description
// Body: { name, category, price }
// Returns: { description: "generated text" }
router.post("/generate-description", async (req, res) => {
  try {
    const { name, category, price } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Product name is required" });
    }

    const response = await groq.chat.completions.create({
      model: MODEL,
      max_tokens: 150,
      messages: [
        {
          role: "system",
          content:
            "You are a product description writer for an Indian e-commerce platform. " +
            "Write compelling, honest product descriptions in 2-3 sentences. " +
            "Mention key features and benefits. Use simple, clear language. " +
            "Return ONLY the description, no headings or extra text.",
        },
        {
          role: "user",
          content: `Write a product description for:
Name: ${name}
Category: ${category || "General"}
Price: ₹${price || "Not specified"}`,
        },
      ],
    });

    const description = response.choices[0].message.content.trim();
    res.json({ description });
  } catch (err) {
    console.error("AI description error:", err.message);
    res.status(500).json({ message: "AI service unavailable" });
  }
});

// ── 3. SHOPPING ASSISTANT ─────────────────────────────────────────────────────
// POST /api/ai/shopping-assistant
// Body: { message, products: [{ name, price, category, averageRating }] }
// Returns: { reply: "assistant response" }
router.post("/shopping-assistant", async (req, res) => {
  try {
    const { message, products } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    // Send product catalog to AI so it can make real recommendations
    // We trim the data to keep the prompt small (Groq has token limits)
    const catalog = (products || [])
      .slice(0, 30) // max 30 products in context
      .map((p) => `- ${p.name} | ₹${p.price} | ${p.category || "General"} | ★${p.averageRating || 0}`)
      .join("\n");

    const response = await groq.chat.completions.create({
      model: MODEL,
      max_tokens: 200,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful shopping assistant for ShopZone, an Indian e-commerce platform. " +
            "Help customers find products from our catalog. " +
            "Be friendly, concise, and recommend specific products by name when relevant. " +
            "If no product matches, suggest what to search for. " +
            "Keep replies under 3 sentences.\n\n" +
            `Current product catalog:\n${catalog}`,
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const reply = response.choices[0].message.content.trim();
    res.json({ reply });
  } catch (err) {
    console.error("AI assistant error:", err.message);
    res.status(500).json({ message: "AI service unavailable" });
  }
});

module.exports = router;