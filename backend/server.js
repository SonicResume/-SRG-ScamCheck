import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";

dotenv.config();

const app = express();

app.get("/test", (req, res) => {
  res.status(200).json({
    status: "SRG ScamCheck backend is live 🚀"
  });
});


// =========================
// CONFIG
// =========================
const PORT = process.env.PORT || 5000;
const OLLAMA_API_URL = process.env.OLLAMA_API_URL;
const OLLAMA_MODEL =
  process.env.OLLAMA_MODEL ||
  "theo:latest";

const OLLAMA_VISION_MODEL =
  process.env.OLLAMA_VISION_MODEL ||
  "qwen3-vl:8b";

const VOICE_API_URL =
  process.env.VOICE_API_URL;

if (!VOICE_API_URL) {
  console.warn("⚠️ VOICE_API_URL is not configured");
}

if (!OLLAMA_API_URL) {
  console.warn("⚠️ OLLAMA_API_URL is not configured");
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024
  }
});

// =========================
// SECURITY + MIDDLEWARE
// =========================
const allowedOrigin = process.env.FRONTEND_URL || "*";

app.use(
  cors({
    origin: allowedOrigin,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json({ limit: "15mb" }));

// =========================
// HEALTH CHECK
// =========================
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "SRG ScamCheck backend"
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "SRG ScamCheck backend"
  });
});

app.post("/api/analyze", upload.single("audio"), async (req, res) => {
  try {
    // -------------------------
    // AUDIO
    // -------------------------
    if (req.file) {
      console.log("Audio received:", {
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      });

      if (!VOICE_API_URL) {
        return res.status(503).json({
          error: "Voice analysis service is not configured"
        });
      }

      const voiceEndpoint =
        `${VOICE_API_URL.replace(/\\/$/, "")}/api/analyze-audio`;

      console.log("Forwarding audio to:", voiceEndpoint);

      const formData = new FormData();

      formData.append(
        "audio",
        new Blob(
          [req.file.buffer],
          {
            type:
              req.file.mimetype ||
              "application/octet-stream"
          }
        ),
        req.file.originalname
      );

      const controller = new AbortController();

      const timeout = setTimeout(() => {
        controller.abort();
      }, 120000);

      try {
        const voiceResponse = await fetch(
          voiceEndpoint,
          {
            method: "POST",
            body: formData,
            signal: controller.signal
          }
        );

        const contentType =
          voiceResponse.headers.get("content-type") || "";

        const voiceData =
          contentType.includes("application/json")
            ? await voiceResponse.json()
            : {
                response: await voiceResponse.text()
              };

        console.log(
          "Voice API status:",
          voiceResponse.status
        );

        if (!voiceResponse.ok) {
          console.error("Voice API error:", voiceData);

          return res.status(voiceResponse.status).json({
            error:
              voiceData?.error ||
              voiceData?.detail ||
              "Voice analysis failed"
          });
        }

        return res.json(voiceData);
      } finally {
        clearTimeout(timeout);
      }
    }

    // -------------------------
    // TEXT
    // -------------------------
    const { text } = req.body;

    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        error: "No text provided"
      });
    }

    let label = "Safe";
    let probability = 20;
    let reason = "Message looks normal.";

    const lowerText = text.toLowerCase();

    if (
      lowerText.includes("otp") ||
      lowerText.includes("bank") ||
      lowerText.includes("urgent") ||
      lowerText.includes("account blocked") ||
      lowerText.includes("click here") ||
      lowerText.includes("lottery") ||
      lowerText.includes("won")
    ) {
      label = "Scam";
      probability = 90;
      reason = "Contains scam-like keywords.";
    } else if (
      lowerText.includes("offer") ||
      lowerText.includes("discount") ||
      lowerText.includes("call now")
    ) {
      label = "Suspicious";
      probability = 60;
      reason = "Looks promotional or risky.";
    }

    return res.json({
      label,
      probability,
      reason
    });
  } catch (err) {
    console.error("Analyze error:", err);

    return res.status(500).json({
      error: "Internal server error"
    });
  }
});

// =========================
// URL CHECKER
// =========================
app.post("/api/check-url", (req, res) => {
  try {
    const { url } = req.body;

    if (typeof url !== "string" || !url.trim()) {
      return res.status(400).json({
        error: "No URL provided"
      });
    }

    const cleanUrl = url.trim();
    const lowerUrl = cleanUrl.toLowerCase();

    let riskScore = 20;
    let label = "Safe";
    const reasons = [];

    if (["bit.ly", "tinyurl", "goo.gl"].some(x => lowerUrl.includes(x))) {
      riskScore += 30;
      reasons.push("Shortened URL detected.");
    }

    if (
      ["login", "verify", "secure"].some(x =>
        lowerUrl.includes(x)
      )
    ) {
      riskScore += 20;
      reasons.push("Suspicious login/verification terms.");
    }

    if (
      ["paypal", "bank", "amazon"].some(x =>
        lowerUrl.includes(x)
      )
    ) {
      riskScore += 20;
      reasons.push("Possible brand impersonation.");
    }

    if (
      ["alert", "account"].some(x =>
        lowerUrl.includes(x)
      )
    ) {
      riskScore += 10;
      reasons.push("Urgency-related wording detected.");
    }

    if (riskScore >= 70) {
      label = "Scam";
    } else if (riskScore >= 45) {
      label = "Suspicious";
    }

    return res.json({
      url: cleanUrl,
      label,
      risk_score: Math.min(riskScore, 100),
      reasons: reasons.length
        ? reasons
        : ["No strong threats detected."]
    });
  } catch (err) {
    console.error("URL error:", err);

    return res.status(500).json({
      error: "URL analysis failed"
    });
  }
});

// =========================
// FEEDBACK
// =========================
app.post("/api/feedback", (req, res) => {
  try {
    const {
      input_data,
      original_label,
      user_label,
      type
    } = req.body;

    if (
      !input_data ||
      !original_label ||
      !user_label ||
      !type
    ) {
      return res.status(400).json({
        error: "Missing feedback payload"
      });
    }

    console.log("📩 Feedback received:", {
      input_data,
      original_label,
      user_label,
      type,
      time: new Date().toISOString()
    });

    return res.json({
      success: true
    });
  } catch (err) {
    console.error("Feedback error:", err);

    return res.status(500).json({
      error: "Failed to save feedback"
    });
  }
});

// =========================
// PRIVATE AI PROXY
// =========================
// The browser sends ONLY:
//   prompt
//   images
//   type
//
// The browser NEVER supplies:
//   model
//   Ollama URL
//
// The backend chooses the model privately.
// =========================
app.post("/api/ai", async (req, res) => {
  try {
    if (!OLLAMA_API_URL) {
      return res.status(503).json({
        error: "AI service is not configured"
      });
    }

    const {
      prompt,
      images = [],
      type = "text"
    } = req.body;

    if (typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({
        error: "Missing prompt"
      });
    }

    if (type !== "text" && type !== "vision") {
      return res.status(400).json({
        error: "Invalid AI request type"
      });
    }

    const cleanImages = Array.isArray(images)
      ? images
          .filter(
            image =>
              typeof image === "string" &&
              image.length > 0
          )
          .map(image =>
            image.replace(
              /^data:image\/[^;]+;base64,/i,
              ""
            )
          )
      : [];

    const selectedModel =
      type === "vision"
        ? OLLAMA_VISION_MODEL
        : OLLAMA_MODEL;

    const generateUrl =
      OLLAMA_API_URL.endsWith("/api/generate")
        ? OLLAMA_API_URL
        : `${OLLAMA_API_URL.replace(/\/$/, "")}/api/generate`;

    console.log("AI request:", {
      type,
      model: selectedModel,
      imageCount: cleanImages.length
    });

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 120000);

    try {
      const response = await fetch(
        generateUrl,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            model: selectedModel,
            prompt: prompt.trim(),
            stream: false,
            ...(cleanImages.length
              ? { images: cleanImages }
              : {})
          }),
          signal: controller.signal
        }
      );

      const rawText = await response.text();

      let data;

      try {
        data = JSON.parse(rawText);
      } catch {
        data = {
          response: rawText
        };
      }

      if (!response.ok) {
        console.error("Ollama error:", data);

        return res.status(response.status).json({
          error:
            data?.error ||
            data?.message ||
            "Ollama request failed"
        });
      }

      return res.json(data);
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    console.error("AI route error:", error);

    if (error?.name === "AbortError") {
      return res.status(504).json({
        error: "AI request timed out"
      });
    }

    return res.status(500).json({
      error: error?.message || "AI request failed"
    });
  }
});

// =========================
// LEGACY OLLAMA ENDPOINT
// =========================
// Kept for compatibility.
// Model is now controlled by the backend.
// =========================
app.post("/api/ollama", async (req, res) => {
  try {
    if (!OLLAMA_API_URL) {
      return res.status(503).json({
        error: "Ollama analysis server is not configured"
      });
    }

    const {
      prompt,
      stream = false,
      images
    } = req.body;

    if (typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({
        error: "Missing prompt"
      });
    }

    const cleanImages = Array.isArray(images)
      ? images
          .filter(
            image =>
              typeof image === "string" &&
              image.length > 0
          )
          .map(image =>
            image.replace(
              /^data:image\/[^;]+;base64,/i,
              ""
            )
          )
      : [];

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 120000);

    try {
      const response = await fetch(
        `${OLLAMA_API_URL.replace(/\/$/, "")}/api/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            model: OLLAMA_MODEL,
            prompt: prompt.trim(),
            stream,
            ...(cleanImages.length
              ? { images: cleanImages }
              : {})
          }),
          signal: controller.signal
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const data = await response.json();

        return res.status(response.status).json(data);
      }

      const text = await response.text();

      return res.status(response.status).send(text);
    } finally {
      clearTimeout(timeout);
    }
  } catch (err) {
    console.error("Ollama proxy error:", err);

    if (err.name === "AbortError") {
      return res.status(504).json({
        error: "Ollama analysis server timed out"
      });
    }

    return res.status(502).json({
      error: "Unable to connect to Ollama analysis server"
    });
  }
});

// =========================
// 404 HANDLER
// =========================
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found"
  });
});

// =========================
// GLOBAL ERROR HANDLER
// =========================
app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);

  res.status(500).json({
    error: "Internal server error"
  });
});

// =========================
// START SERVER
// =========================
app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `🚀 SRG ScamCheck running on port ${PORT}`
  );
});