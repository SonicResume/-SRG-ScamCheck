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

/**
 * Safely call Ollama.
 *
 * Handles:
 * - HTTP errors
 * - empty responses
 * - invalid JSON from the API
 * - Ollama response/content differences
 * - optional vision images
 */
async function askOllama(
  prompt: string,
  images: string[] = [],
  model: string = OLLAMA_MODEL
): Promise<string> {
  const endpoint = `${OLLAMA_BASE}/api/generate`;

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
        model,
        prompt,
        stream: false,
        ...(images.length ? { images } : {}),
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
  } catch (error) {
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

/**
 * Extract a JSON object from an Ollama response.
 */
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

  // First try the entire response.
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
    console.error(
      "INVALID OLLAMA JSON:",
      cleaned
    );

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
  } catch (error) {
    console.error(
      "MALFORMED OLLAMA JSON:",
      jsonCandidate
    );

    throw new Error(
      `Ollama returned malformed JSON: ${jsonCandidate.slice(
        0,
        1000
      )}`
    );
  }
}

/**
 * Keep numeric values safely inside the expected range.
 */
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

/**
 * Normalize classification.
 */
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

  if (riskScore >= 75) {
    return "SCAM";
  }

  if (riskScore >= 35) {
    return "SUSPICIOUS";
  }

  return "SAFE";
}

/**
 * Normalize a string array.
 */
function stringArray(
  value: unknown
): string[] {
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

/**
 * Analyze a screenshot/image for scam indicators.
 *
 * Requires a vision-capable Ollama model.
 */
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

Analyze only evidence that is actually visible in the image.

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
Do not add explanations outside JSON.

Required structure:

{
  "isScam": true,
  "riskScore": 85,
  "confidence": 90,
  "intent": "Phishing",
  "redFlags": [
    "Urgency or threat language",
    "Credential request"
  ],
  "summary": "Short evidence-based explanation",
  "psychologicalTriggers": [
    "Urgency",
    "Fear"
  ],
  "technicalAnomalies": [
    "Suspicious URL"
  ],
  "urgencyLevel": "Extreme",
  "educationalInsight": "Explain why the user should be cautious"
}

Rules:

- riskScore must be an integer from 0 to 100.
- confidence must be an integer from 0 to 100.
- isScam must be true only when the evidence supports a scam conclusion.
- urgencyLevel must be exactly:
  Low, Medium, High, or Extreme.
- redFlags must be an array of strings.
- psychologicalTriggers must be an array of strings.
- technicalAnomalies must be an array of strings.
- Do not claim a URL is malicious unless there is evidence visible in the image.
- Do not claim a company, person, bank, government agency, or organization is fraudulent without evidence.
- If the image appears legitimate, use isScam=false.
- If evidence is insufficient, use a lower riskScore and explain the uncertainty.
`;

  let result = "";

  try {
    result = await askOllama(
      prompt,
      [imageBase64],
      visionModel
    );

    const parsed =
      extractJson<any>(result);

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
        stringArray(parsed.redFlags).length > 0
          ? stringArray(parsed.redFlags)
          : stringArray(parsed.indicators),

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
        typeof parsed.educationalInsight ===
          "string" &&
        parsed.educationalInsight.trim()
          ? parsed.educationalInsight.trim()
          : typeof parsed.recommendation ===
                "string" &&
              parsed.recommendation.trim()
            ? parsed.recommendation.trim()
            : "Review the sender, links, and requests independently before taking action.",
    };
  } catch (error) {
    console.error(
      "OLLAMA IMAGE ANALYSIS FAILED"
    );

    console.error(
      "Vision model:",
      visionModel
    );

    console.error(
      "Raw model response:",
      result
    );

    throw error;
  }
}

/**
 * Analyze a website URL.
 */
export async function analyzeWebsiteURL(
  url: string
): Promise<ScamAnalysis> {
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
Do not claim that the website itself was visited or verified.

Return ONLY valid JSON:

{
  "riskScore": 0,
  "classification": "SAFE",
  "category": "Website",
  "summary": "Short evidence-based explanation",
  "indicators": [],
  "recommendation": "Short safety recommendation"
}

Rules:
- riskScore must be 0-100.
- classification must be SAFE, SUSPICIOUS, or SCAM.
- indicators must be an array of strings.
- Do not invent reputation or database results.

URL:
${cleanUrl}
`);

  const data =
    extractJson<any>(result);

  const riskScore =
    clampScore(data.riskScore);

  return {
    riskScore,

    classification:
      normalizeClassification(
        data.classification,
        riskScore
      ),

    category:
      data.category ||
      "Website",

    summary:
      data.summary ||
      "Website URL analysis completed.",

    indicators:
      stringArray(data.indicators),

    recommendation:
      data.recommendation ||
      "Verify the domain independently before entering credentials or making payments.",
  };
}

/**
 * Analyze a UPI/VPA/payment identifier.
 */
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

Important:
Do NOT claim that this identifier appears in a fraud database.

No external database evidence has been supplied.

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

  const data =
    extractJson<any>(result);

  const riskScore =
    clampScore(data.riskScore);

  return {
    riskScore,

    classification:
      normalizeClassification(
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

/**
 * Analyze a voice-call transcript.
 *
 * This does NOT perform acoustic/deepfake detection.
 */
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
Transcript text alone cannot establish whether a voice recording
is synthetically generated.

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

  const data =
    extractJson<any>(result);

  const riskScore =
    clampScore(data.riskScore);

  const classification =
    normalizeClassification(
      data.classification,
      riskScore
    );

  return {
    riskScore,

    classification,

    category:
      data.category ||
      "Voice scam",

    summary:
      data.summary ||
      "Voice transcript analysis completed.",

    indicators:
      stringArray(data.indicators),

    recommendation:
      data.recommendation ||
      "Verify the caller independently before sharing information or sending money.",

    // IMPORTANT:
    // This is NOT acoustic deepfake detection.
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

/**
 * Analyze employment/company information.
 */
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

Do not invent:
- registration records
- lawsuits
- complaints
- government records
- fraud databases
- reviews
- criminal history

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

  const data =
    extractJson<any>(result);

  const riskScore =
    clampScore(data.riskScore);

  return {
    riskScore,

    classification:
      normalizeClassification(
        data.classification,
        riskScore
      ),

    category:
      data.category ||
      "Employment scam",

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

/**
 * Generate a professional verification email.
 */
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
