import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper for Gemini AI instance (lazy initialization)
function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured. Please add it in Settings > Secrets.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

const DEFAULT_SYSTEM_INSTRUCTION = `You are "Mochiku-chan" (もちくちゃん), the sweet, cheerful, and expert AI Mochi Sommelier & Virtual Concierge for "MOCHIKU" (もちく) — an authentic artisanal Japanese Daifuku & Mochi boutique in Indonesia.

Your personality:
- Warm, kawaii, polite, enthusiastic, and knowledgeable about Japanese wagashi (和菓子), fruits, matchas, and mochi pairings.
- You speak naturally in friendly Indonesian (Bahasa Indonesia) with occasional cute Japanese greetings (like "Konnichiwa! 🌸", "Arigatou gozaimasu! ✨", "Itadakimasu! 🍡").
- You know all MOCHIKU menu items: Ichigo Daifuku (Fresh Japanese Strawberry with Sweet Red Bean), Uji Matcha Bliss (Ceremonial Uji Matcha cream), Mango Tango Daifuku (Sweet Tropical Harum Manis Mango), Choco Hazelnut Supreme (Rich Belgian Chocolate), Cookies & Cream Crunchy (Oreo bites), and custom toppings (matcha dust, edible gold leaf, roasted kinako powder, choco glaze, crushed almonds).
- MOCHIKU store outlets are located in Jakarta: Senopati (South Jakarta), Grand Indonesia Mall (Central Jakarta), and PIK Avenue (North Jakarta).
- Price format is in Indonesian Rupiah (Rp).
- Loyalty Program: MOCHIKU Club gives 1 point for every Rp 1.000 spent, and 50 points welcome bonus upon signing up!
- When asked about locations, places, or directions, provide accurate Indonesian context.
- Keep answers engaging, formatted nicely with bullet points or emojis when helpful.`;

// 1. Multi-turn Gemini Chat Endpoint
app.post("/api/gemini/chat", async (req: Request, res: Response) => {
  try {
    const {
      messages = [],
      modelType = "general", // 'fast' | 'general' | 'search' | 'maps' | 'pro'
      systemInstruction = DEFAULT_SYSTEM_INSTRUCTION,
    } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array cannot be empty." });
    }

    const ai = getGenAI();

    // Select model and tools strictly according to requirements:
    // - gemini-3.1-pro-preview for complex tasks
    // - gemini-3.5-flash for general tasks
    // - gemini-3.1-flash-lite for tasks that should happen fast
    // - gemini-3.5-flash (with googleSearch tool) for Search Grounding
    // - gemini-3.5-flash (with googleMaps tool) for Maps Grounding
    let model = "gemini-3.5-flash";
    const tools: any[] = [];

    if (modelType === "fast") {
      model = "gemini-3.1-flash-lite";
    } else if (modelType === "pro") {
      model = "gemini-3.1-pro-preview";
    } else if (modelType === "search") {
      model = "gemini-3.5-flash";
      tools.push({ googleSearch: {} });
    } else if (modelType === "maps") {
      model = "gemini-3.5-flash";
      tools.push({ googleMaps: {} });
    } else {
      model = "gemini-3.5-flash";
    }

    // Transform messages to @google/genai format
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" || m.role === "model" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const config: any = {
      systemInstruction,
    };

    if (tools.length > 0) {
      config.tools = tools;
    }

    const response = await ai.models.generateContent({
      model,
      contents,
      config,
    });

    const replyText = response.text || "Gomen ne, saya belum bisa memproses jawaban saat ini. Silakan coba lagi ya! 🌸";
    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata || null;

    return res.json({
      text: replyText,
      model,
      groundingMetadata,
    });
  } catch (error: any) {
    console.error("Gemini Chat API Error:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate response from Gemini.",
    });
  }
});

// 2. Google Search Grounding Endpoint (gemini-3.5-flash with googleSearch tool)
app.post("/api/gemini/search", async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query is required for Google Search Grounding." });
    }

    const ai = getGenAI();

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: query,
      config: {
        systemInstruction: `${DEFAULT_SYSTEM_INSTRUCTION}\nYou are utilizing live Google Search grounding to retrieve verified, real-time culinary facts, viral mochi trends, wagashi history, health benefits, or recent Japanese bakery reviews. Always provide concise and trustworthy information.`,
        tools: [{ googleSearch: {} }],
      },
    });

    const replyText = response.text || "";
    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;

    // Extract sources and queries if available
    const webChunks = groundingMetadata?.groundingChunks?.filter((c: any) => c.web?.uri) || [];
    const sources = webChunks.map((c: any) => ({
      title: c.web.title || "Web Reference",
      url: c.web.uri,
    }));
    const searchQueries = groundingMetadata?.webSearchQueries || [];

    return res.json({
      text: replyText,
      model: "gemini-3.5-flash",
      sources,
      searchQueries,
      groundingMetadata,
    });
  } catch (error: any) {
    console.error("Gemini Search Grounding Error:", error);
    return res.status(500).json({
      error: error.message || "Search grounding failed.",
    });
  }
});

// 3. Google Maps Grounding Endpoint (gemini-3.5-flash with googleMaps tool)
app.post("/api/gemini/maps", async (req: Request, res: Response) => {
  try {
    const { query, userLocation } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query is required for Google Maps Grounding." });
    }

    const ai = getGenAI();

    let prompt = query;
    if (userLocation?.lat && userLocation?.lng) {
      prompt += `\n(User's current coordinates: Latitude ${userLocation.lat}, Longitude ${userLocation.lng})`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: `${DEFAULT_SYSTEM_INSTRUCTION}\nYou are using Google Maps Grounding to help users find nearby Mochiku outlets in Jakarta (Senopati, Grand Indonesia, PIK), check distance estimations, find landmark points of interest, opening hours, or popular dessert spots. Provide helpful navigational advice.`,
        tools: [{ googleMaps: {} }],
      },
    });

    const replyText = response.text || "";
    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;

    return res.json({
      text: replyText,
      model: "gemini-3.5-flash",
      groundingMetadata,
    });
  } catch (error: any) {
    console.error("Gemini Maps Grounding Error:", error);
    return res.status(500).json({
      error: error.message || "Maps grounding failed.",
    });
  }
});

// 4. Intelligence & Flavor Pairing Generator (gemini-3.1-flash-lite / gemini-3.5-flash)
app.post("/api/gemini/recommend", async (req: Request, res: Response) => {
  try {
    const { mood, occasion, preference } = req.body;
    const ai = getGenAI();

    const prompt = `Berdasarkan preferensi pelanggan:
- Suasana hati (Mood): "${mood || 'Lagi butuh mood booster'}"
- Momen / Acara: "${occasion || 'Santai sore'}"
- Preferensi Rasa: "${preference || 'Segar dan manis pas'}"

Rekomendasikan racikan mochi MOCHIKU yang paling cocok dalam format JSON:
- recommendedFlavor: "strawberry" | "matcha" | "mango" | "oreo" | "chocolate"
- flavorName: Nama menu cantik (misal: "Matcha Zen Bliss")
- toppings: Array 1-2 topping rekomendasi (pilihan: "Matcha Dust", "Edible Gold", "Kinako Powder", "Chocolate Glaze", "Almond Crunch")
- sweetLevel: persentase angka manis (contoh: 50 atau 75)
- explanation: penjelasan singkat dan ramah kenapa racikan ini cocok banget (2-3 kalimat)`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite", // Fast task
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are a Japanese artisan mochi maker recommending custom Daifuku combos based on flavor science and customer emotions. Respond purely in JSON.",
      },
    });

    const raw = response.text || "{}";
    let data = {};
    try {
      data = JSON.parse(raw);
    } catch {
      data = { raw };
    }

    return res.json(data);
  } catch (error: any) {
    console.error("Gemini Recommendation Error:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate recommendation.",
    });
  }
});

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "mochiku-server" });
});

// Vite Middleware integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MOCHIKU Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
