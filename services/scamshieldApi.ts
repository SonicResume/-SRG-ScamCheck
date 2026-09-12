const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function analyzeText(text: string) {
  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function analyzeUrl(url: string) {
  const res = await fetch(`${API_BASE}/api/check-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
