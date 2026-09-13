const OLLAMA_BASE =
  import.meta.env.VITE_OLLAMA_API_URL ||
  "https://api.justiceoncall.ca";

const OLLAMA_MODEL =
  import.meta.env.VITE_OLLAMA_MODEL ||
  "theo:latest";

type OllamaResponse = {
  response?: string;
  message?: {
    content?: string;
  };
};

export type ScamAnalysis = {
  riskScore: number;
  classification: "SAFE" | "SUSPICIOUS" | "SCAM";
  category: string;
  summary: string;
  indicators: string[];
  recommendation: string;
};

export type WebsiteAnalysisResult = {
  isPhishing: boolean;
  trustScore: number;
  verdict: string;
  technicalDiscrepancies: string[];
  isSpoofed: boolean;
  domainAgeInfo: string;
  officialSiteUrl?: string;
};

export type ImageScamAnalysis = {
  isScam: boolean;
  riskScore: number;
  confidence: number;
  intent: string;
  redFlags: string[];
  summary: string;
  forensicBreakdown: {
    psychologicalTriggers: string[];
    technicalAnomalies: string[];
    urgencyLevel: "Low" | "Medium" | "High" | "Extreme";
  };
  educationalInsight: string;
};

async function askOllama(
  prompt: string,
  images: string[] = [],
  model: string = OLLAMA_MODEL
): Promise<string> {
  const endpoint =
    "https://srg-scam-check-backend.onrender.com/api/ai";

  const cleanImages = images
    .filter(Boolean)
    .map((image) =>
      image.replace(/^data:image\/[^;]+;base64,/i, "")
    );

  console.log("OLLAMA REQUEST", {
    endpoint,
    model,
    hasImages: cleanImages.length > 0,
    imageCount: cleanImages.length,
  });

  let response: Response;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        type: cleanImages.length > 0 ? "vision" : "text",
        model,
        prompt,
        stream: false,
        ...(cleanImages.length
          ? { images: cleanImages }
          : {}),
      }),
    });
  } catch (error) {
    console.error("OLLAMA NETWORK ERROR:", error);
    throw new Error(
      "Unable to connect to the Ollama analysis server."
    );
  }

  const rawBody = await response.text();

  console.log("OLLAMA HTTP STATUS:", response.status);

  if (!response.ok) {
    console.error("OLLAMA ERROR BODY:", rawBody);
    throw new Error(
      `Ollama API error ${response.status}: ${
        rawBody || "empty response"
      }`
    );
  }

  if (!rawBody.trim()) {
    throw new Error(
      `Ollama returned an empty response for model "${model}".`
    );
  }

  let data: OllamaResponse;

  try {
    data = JSON.parse(rawBody);
  } catch {
    console.error(
      "OLLAMA INVALID API RESPONSE:",
      rawBody
    );
    throw new Error(
      "Ollama returned an invalid API response."
    );
  }

  const content =
    data.response?.trim() ||
    data.message?.content?.trim() ||
    "";

  if (!content) {
    console.error(
      "OLLAMA RESPONSE CONTAINED NO CONTENT:",
      data
    );
    throw new Error(
      `Ollama returned no model content for "${model}".`
    );
  }

  console.log(
    "OLLAMA RESPONSE LENGTH:",
    content.length
  );

  return content;
}

function extractJson<T>(text: string): T {
  if (!text || !text.trim()) {
    throw new Error(
      "Ollama returned empty model content."
    );
  }

  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // Continue with object extraction.
  }

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (
    start === -1 ||
    end === -1 ||
    end <= start
  ) {
    throw new Error(
      `Ollama returned invalid JSON: ${cleaned.slice(
        0,
        1000
      )}`
    );
  }

  const jsonCandidate = cleaned.slice(
    start,
    end + 1
  );

  try {
    return JSON.parse(jsonCandidate) as T;
  } catch {
    throw new Error(
      `Ollama returned malformed JSON: ${jsonCandidate.slice(
        0,
        1000
      )}`
    );
  }
}

function clampScore(value: unknown): number {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(0, Math.round(number))
  );
}

function normalizeClassification(
  value: unknown,
  riskScore: number
): "SAFE" | "SUSPICIOUS" | "SCAM" {
  const classification =
    String(value || "").toUpperCase();

  if (
    classification === "SAFE" ||
    classification === "SUSPICIOUS" ||
    classification === "SCAM"
  ) {
    return classification;
  }

  if (riskScore >= 75) return "SCAM";
  if (riskScore >= 35) return "SUSPICIOUS";

  return "SAFE";
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item): item is string =>
        typeof item === "string"
    )
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function analyzeScamImage(
  input: string
): Promise<ImageScamAnalysis> {
  if (!input || !input.trim()) {
    throw new Error(
      "No image was provided for analysis."
    );
  }

  const imageBase64 = input
    .replace(
      /^data:image\/[^;]+;base64,/i,
      ""
    )
    .trim();

  if (!imageBase64) {
    throw new Error(
      "The uploaded image contains no usable image data."
    );
  }

  const visionModel =
    import.meta.env.VITE_OLLAMA_VISION_MODEL ||
    "qwen3-vl:8b";

  const prompt = `
You are SRG ScamCheck's forensic image-analysis engine.

Look directly at the uploaded screenshot or image.

Analyze only evidence that is actually visible.

Look for:
- phishing
- impersonation
- fake account warnings
- fake bank/payment messages
- suspicious URLs
- credential harvesting
- password requests
- OTP requests
- payment requests
- gift card requests
- cryptocurrency requests
- urgency
- threats
- fear tactics
- social engineering
- fake employment offers
- fake government or law-enforcement messages
- suspicious logos or branding
- financial manipulation

Do not invent facts that are not visible.

Return ONLY one valid JSON object.
Do not use Markdown.

{
  "isScam": true,
  "riskScore": 85,
  "confidence": 90,
  "intent": "Phishing",
  "redFlags": [],
  "summary": "Short evidence-based explanation",
  "psychologicalTriggers": [],
  "technicalAnomalies": [],
  "urgencyLevel": "Extreme",
  "educationalInsight": "Explain why the user should be cautious"
}

Rules:
- riskScore must be 0-100.
- confidence must be 0-100.
- urgencyLevel must be Low, Medium, High, or Extreme.
- All list fields must be arrays of strings.
- Do not invent evidence.
`;

  const result = await askOllama(
    prompt,
    [imageBase64],
    visionModel
  );

  const parsed = extractJson<any>(result);

  const riskScore =
    clampScore(parsed.riskScore);

  const confidence =
    clampScore(
      parsed.confidence ??
        parsed.riskScore ??
        0
    );

  const urgencyValues = [
    "Low",
    "Medium",
    "High",
    "Extreme",
  ] as const;

  const urgency =
    urgencyValues.includes(
      parsed.urgencyLevel
    )
      ? parsed.urgencyLevel
      : riskScore >= 75
        ? "Extreme"
        : riskScore >= 50
          ? "High"
          : riskScore >= 25
            ? "Medium"
            : "Low";

  return {
    isScam:
      typeof parsed.isScam === "boolean"
        ? parsed.isScam
        : riskScore >= 75,

    riskScore,

    confidence,

    intent:
      typeof parsed.intent === "string" &&
      parsed.intent.trim()
        ? parsed.intent.trim()
        : "Suspicious content",

    redFlags:
      stringArray(parsed.redFlags),

    summary:
      typeof parsed.summary === "string" &&
      parsed.summary.trim()
        ? parsed.summary.trim()
        : "Image analysis completed.",

    forensicBreakdown: {
      psychologicalTriggers:
        stringArray(
          parsed.psychologicalTriggers
        ),

      technicalAnomalies:
        stringArray(
          parsed.technicalAnomalies
        ),

      urgencyLevel: urgency,
    },

    educationalInsight:
      typeof parsed.educationalInsight === "string" &&
      parsed.educationalInsight.trim()
        ? parsed.educationalInsight.trim()
        : "Review the sender, links, and requests independently before taking action.",
  };
}

export async function analyzeWebsiteURL(
  url: string
): Promise<WebsiteAnalysisResult> {
  const cleanUrl = url.trim();

  if (!cleanUrl) {
    throw new Error(
      "Please provide a website URL."
    );
  }

  const result = await askOllama(`
You are SRG ScamCheck's website-forensics AI.

Analyze this URL for:
- phishing
- impersonation
- typosquatting
- suspicious domains
- credential harvesting
- financial fraud
- malicious-looking URL patterns
- social engineering

Important:
Analyze the URL structure only.
Do not claim that the website was visited.
Do not invent reputation, registry, SSL, WHOIS, or database results.

Return ONLY valid JSON:

{
  "isPhishing": false,
  "trustScore": 85,
  "verdict": "Short evidence-based verdict",
  "technicalDiscrepancies": [
    "URL structure appears normal"
  ],
  "isSpoofed": false,
  "domainAgeInfo": "Domain age cannot be verified from URL structure alone.",
  "officialSiteUrl": ""
}

Rules:
- isPhishing must be true only when URL evidence supports phishing.
- trustScore must be an integer from 0 to 100.
- technicalDiscrepancies must always be an array of strings.
- isSpoofed must be true only when impersonation evidence exists.
- domainAgeInfo must not claim an actual domain age unless supplied.
- officialSiteUrl must be empty when it cannot be established.

URL:
${cleanUrl}
`);

  const data = extractJson<any>(result);

  const trustScore = clampScore(
    data.trustScore ??
      (100 - clampScore(data.riskScore))
  );

  const technicalDiscrepancies =
    stringArray(
      data.technicalDiscrepancies
    );

  return {
    isPhishing:
      typeof data.isPhishing === "boolean"
        ? data.isPhishing
        : trustScore < 40,

    trustScore,

    verdict:
      typeof data.verdict === "string" &&
      data.verdict.trim()
        ? data.verdict.trim()
        : "Website URL analysis completed.",

    technicalDiscrepancies:
      technicalDiscrepancies.length > 0
        ? technicalDiscrepancies
        : [
            "No specific URL discrepancies identified.",
          ],

    isSpoofed:
      typeof data.isSpoofed === "boolean"
        ? data.isSpoofed
        : false,

    domainAgeInfo:
      typeof data.domainAgeInfo === "string" &&
      data.domainAgeInfo.trim()
        ? data.domainAgeInfo.trim()
        : "Domain age cannot be verified from URL structure alone.",

    officialSiteUrl:
      typeof data.officialSiteUrl === "string" &&
      data.officialSiteUrl.trim()
        ? data.officialSiteUrl.trim()
        : undefined,
  };
}

export async function checkUPI(
  upi: string
): Promise<ScamAnalysis> {
  const cleanUPI = upi.trim();

  if (!cleanUPI) {
    throw new Error(
      "Please provide a UPI/VPA identifier."
    );
  }

  const result = await askOllama(`
You are SRG ScamCheck's payment-fraud analysis engine.

Analyze this UPI/VPA/payment identifier for:
- suspicious naming
- impersonation
- social engineering
- unusual payment-related naming
- potential fraud indicators

Do NOT claim that this identifier appears in a fraud database.

Return ONLY valid JSON:

{
  "riskScore": 0,
  "classification": "SAFE",
  "category": "Payment identifier",
  "summary": "Short evidence-based explanation",
  "indicators": [],
  "recommendation": "Short safety recommendation"
}

UPI/VPA:
${cleanUPI}
`);

  const data = extractJson<any>(result);
  const riskScore = clampScore(data.riskScore);

  return {
    riskScore,
    classification: normalizeClassification(
      data.classification,
      riskScore
    ),
    category:
      data.category ||
      "Payment identifier",
    summary:
      data.summary ||
      "Payment identifier analysis completed.",
    indicators:
      stringArray(data.indicators),
    recommendation:
      data.recommendation ||
      "Verify the recipient independently before sending money.",
  };
}

export async function auditVoiceResult(
  transcript: string
): Promise<
  ScamAnalysis & {
    isDeepfake: boolean;
    probability: number;
    verdict: string;
    anomalies: string[];
  }
> {
  const cleanTranscript =
    transcript.trim();

  if (!cleanTranscript) {
    throw new Error(
      "No voice transcript was provided."
    );
  }

  const result = await askOllama(`
You are SRG ScamCheck's voice-scam forensic analysis engine.

Analyze the transcript for:
- impersonation
- urgency
- threats
- financial manipulation
- credential requests
- OTP requests
- payment requests
- social engineering
- coercion
- suspicious instructions

Do NOT claim acoustic deepfake detection.

Return ONLY valid JSON:

{
  "riskScore": 0,
  "classification": "SAFE",
  "category": "Voice scam",
  "summary": "Short evidence-based explanation",
  "indicators": [],
  "recommendation": "Short safety recommendation"
}

Transcript:
${cleanTranscript}
`);

  const data = extractJson<any>(result);
  const riskScore = clampScore(data.riskScore);

  const classification =
    normalizeClassification(
      data.classification,
      riskScore
    );

  return {
    riskScore,
    classification,
    category:
      data.category || "Voice scam",
    summary:
      data.summary ||
      "Voice transcript analysis completed.",
    indicators:
      stringArray(data.indicators),
    recommendation:
      data.recommendation ||
      "Verify the caller independently before sharing information or sending money.",
    isDeepfake: false,
    probability: riskScore,
    verdict:
      data.summary ||
      classification ||
      "Analysis complete.",
    anomalies:
      stringArray(data.indicators),
  };
}

export async function verifyFirm(
  details: string
): Promise<ScamAnalysis> {
  const cleanDetails =
    details.trim();

  if (!cleanDetails) {
    throw new Error(
      "Please provide employment or company information."
    );
  }

  const result = await askOllama(`
You are SRG ScamCheck's employment-scam forensic engine.

Analyze the supplied information for:
- ghost-firm indicators
- fake recruitment
- advance-fee requests
- credential harvesting
- suspicious payment requests
- unrealistic offers
- impersonation
- fake HR communication
- requests for money before employment
- suspicious onboarding instructions

Important:
Do not claim that a company is fraudulent without evidence.
Do not invent registration records, lawsuits, complaints,
government records, fraud databases, reviews, or criminal history.

Return ONLY valid JSON:

{
  "riskScore": 0,
  "classification": "SAFE",
  "category": "Employment scam",
  "summary": "Short evidence-based explanation",
  "indicators": [],
  "recommendation": "Short safety recommendation"
}

Employment/company information:
${cleanDetails}
`);

  const data = extractJson<any>(result);
  const riskScore = clampScore(data.riskScore);

  return {
    riskScore,
    classification:
      normalizeClassification(
        data.classification,
        riskScore
      ),
    category:
      data.category || "Employment scam",
    summary:
      data.summary ||
      "Employment information analysis completed.",
    indicators:
      stringArray(data.indicators),
    recommendation:
      data.recommendation ||
      "Verify the employer independently before providing credentials, personal information, or money.",
  };
}

export async function generateVerificationEmail(
  context: string
): Promise<string> {
  const cleanContext =
    context.trim();

  if (!cleanContext) {
    throw new Error(
      "Please provide context for the verification email."
    );
  }

  return askOllama(`
Write a professional verification email based ONLY on the
following context.

Do not invent facts.
Do not invent names, dates, organizations, claims, or evidence.

The email should politely request independent verification.

Return only the email text.
Do not use JSON.
Do not use Markdown code fences.

Context:
${cleanContext}
`);
}
