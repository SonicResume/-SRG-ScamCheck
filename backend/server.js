import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// =========================
// SECURITY + MIDDLEWARE
// =========================
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"]
}));

app.use(express.json({ limit: "10kb" }));

// =========================
// HEALTH CHECK
// =========================
app.get("/test", (req, res) => {
  res.json({ status: "SRG ScamCheck backend is live 🚀" });
});

// =========================
// 🧠 SCAM DETECTION
// =========================
app.post("/api/analyze", (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No text provided" });
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

    return res.json({ label, probability, reason });

  } catch (err) {
    console.error("Analyze error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// =========================
// 🔗 URL CHECKER
// =========================
app.post("/api/check-url", (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "No URL provided" });
    }

    const lowerUrl = url.toLowerCase();

    let riskScore = 20;
    let label = "Safe";
    let reasons = [];

    if (["bit.ly", "tinyurl", "goo.gl"].some(x => lowerUrl.includes(x))) {
      riskScore += 30;
      reasons.push("Shortened URL detected.");
    }

    if (["login", "verify", "secure"].some(x => lowerUrl.includes(x))) {
      riskScore += 20;
      reasons.push("Suspicious login/verification terms.");
    }

    if (["paypal", "bank", "amazon"].some(x => lowerUrl.includes(x))) {
      riskScore += 20;
      reasons.push("Possible brand impersonation.");
    }

    if (["alert", "account"].some(x => lowerUrl.includes(x))) {
      riskScore += 10;
      reasons.push("Urgency-related wording detected.");
    }

    if (riskScore >= 70) label = "Scam";
    else if (riskScore >= 45) label = "Suspicious";

    return res.json({
      url,
      label,
      risk_score: Math.min(riskScore, 100),
      reasons: reasons.length ? reasons : ["No strong threats detected."]
    });

  } catch (err) {
    console.error("URL error:", err);
    return res.status(500).json({ error: "URL analysis failed" });
  }
});

// =========================
// 📩 FEEDBACK
// =========================
app.post("/api/feedback", (req, res) => {
  try {
    const { input_data, original_label, user_label, type } = req.body;

    if (!input_data || !original_label || !user_label || !type) {
      return res.status(400).json({ error: "Missing feedback payload" });
    }

    console.log("📩 Feedback received:", {
      input_data,
      original_label,
      user_label,
      type,
      time: new Date().toISOString()
    });

    return res.json({ success: true });

  } catch (err) {
    console.error("Feedback error:", err);
    return res.status(500).json({ error: "Failed to save feedback" });
  }
});

// =========================
// 🚀 START SERVER
// =========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 SRG ScamCheck running on port ${PORT}`);
});