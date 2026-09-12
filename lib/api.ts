// ===============================
// NOAH LEGAL / AI RESUME ANALYZER
// FRONTEND API BRIDGE
// ===============================

const BASE_URL = "https://my-backend-1-qdhh.onrender.com";

/* ===============================
   AI ANALYSIS (MAIN ENGINE)
================================ */
export async function callAI(text: string, email = "guest") {
  try {
    const res = await fetch(`${BASE_URL}/api/ai`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, email }),
    });

    return await res.json();
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "AI request failed",
    };
  }
}

/* ===============================
   FILE UPLOAD (PDF / IMAGE / TXT)
================================ */
export async function uploadFile(file: File) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${BASE_URL}/api/upload`, {
      method: "POST",
      body: formData,
    });

    return await res.json();
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Upload failed",
    };
  }
}

/* ===============================
   CONTACT FORM
================================ */
export async function sendContact(
  name: string,
  email: string,
  message: string
) {
  try {
    const res = await fetch(`${BASE_URL}/api/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, message }),
    });

    return await res.json();
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Contact request failed",
    };
  }
}

/* ===============================
   SIGNUP EMAIL
================================ */
export async function signup(email: string) {
  try {
    const res = await fetch(`${BASE_URL}/api/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    return await res.json();
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Signup failed",
    };
  }
}

/* ===============================
   PROCESS TOOL (SMART AI ROUTER)
================================ */
export async function processText(
  text: string,
  tool?: string,
  type = "text",
  language = "English",
  app = "NOAH"
) {
  try {
    const res = await fetch(`${BASE_URL}/api/process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        tool,
        type,
        language,
        app,
      }),
    });

    return await res.json();
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Process failed",
    };
  }
}

/* ===============================
   HEALTH CHECK (SERVER STATUS)
================================ */
export async function checkHealth() {
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    return await res.json();
  } catch (error: any) {
    return {
      success: false,
      error: "Server offline",
    };
  }
}