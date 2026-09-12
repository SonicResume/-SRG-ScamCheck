import { useEffect, useState } from "react";

const DASHBOARD_URLS: Record<string, string> = {
  "noah-language": "https://language.sonicresume.com/dashboard",

  // Add more apps here later
  // "resume-builder": "https://resume-builder.vercel.app/dashboard",
};

export default function SuccessPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Verifying payment...");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyPayment = async () => {
      const params = new URLSearchParams(window.location.search);
      const session = params.get("session_id");

      if (!session) {
        setStatus("Payment session not found.");
        setLoading(false);
        return;
      }

      setSessionId(session);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/verify-payment?session_id=${session}`
        );

        const data = await response.json();

        if (data.success) {
          setSuccess(true);
          setStatus("Your account has been upgraded 🎉");
        } else {
          setStatus(data.message || "Payment verification failed.");
        }
      } catch (error) {
        console.error(error);
        setStatus("Unable to verify payment. Please contact support.");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, []);

  const returnToDashboard = () => {
    const app = localStorage.getItem("paymentApp");

    if (app && DASHBOARD_URLS[app]) {
      localStorage.removeItem("paymentApp");
      window.location.href = DASHBOARD_URLS[app];
      return;
    }

    localStorage.removeItem("paymentApp");
    window.location.href = "/";
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>
          {loading ? "⏳" : success ? "🎉" : "⚠️"}
        </div>

        <h1 style={styles.title}>
          {success ? "Payment Successful" : "Payment Verification"}
        </h1>

        <p style={styles.subtitle}>{status}</p>

        {loading && (
          <div style={styles.loader}>
            Confirming your upgrade...
          </div>
        )}

        {!loading && success && (
          <button
            onClick={returnToDashboard}
            style={styles.button}
          >
            Go To Dashboard
          </button>
        )}

        {!loading && !success && (
          <a href="/pricing" style={styles.button}>
            Return To Pricing
          </a>
        )}

        {sessionId && (
          <p style={styles.session}>
            Transaction ID:
            <br />
            {sessionId}
          </p>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg,#ecfdf5,#f8fafc)",
    fontFamily: "system-ui,sans-serif",
    padding: "20px",
  },

  card: {
    background: "#fff",
    width: "100%",
    maxWidth: "430px",
    padding: "45px 30px",
    borderRadius: "24px",
    textAlign: "center",
    boxShadow: "0 20px 50px rgba(0,0,0,.08)",
  },

  icon: {
    fontSize: "48px",
    marginBottom: "15px",
  },

  title: {
    fontSize: "28px",
    fontWeight: 800,
    marginBottom: "12px",
  },

  subtitle: {
    color: "#64748b",
    fontSize: "15px",
    marginBottom: "25px",
  },

  loader: {
    color: "#64748b",
    fontSize: "14px",
  },

  button: {
    display: "inline-block",
    background: "#000",
    color: "#fff",
    padding: "14px 25px",
    borderRadius: "12px",
    textDecoration: "none",
    fontWeight: 700,
    cursor: "pointer",
    border: "none",
  },

  session: {
    marginTop: "25px",
    fontSize: "11px",
    color: "#94a3b8",
    wordBreak: "break-all",
  },
};