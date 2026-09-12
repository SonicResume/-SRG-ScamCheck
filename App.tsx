import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "./lib/firebase";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import DashboardContent from "./pages/Dashboard";
import Layout from "./components/Layout";
import Pricing from "./pages/Pricing";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Success from "./pages/Success";

import ScamScanner from "./pages/ScamScanner";
import UPIChecker from "./pages/UPIChecker";
import WebsiteVerifier from "./pages/WebsiteVerifier";
import GhostFirmVerifier from "./pages/GhostFirmVerifier";
import VoiceAudit from "./pages/VoiceAudit";
import History from "./pages/History";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Support from "./pages/Support";
import AccountPage from "./pages/AccountPage";

type PublicPage =
  | "landing"
  | "login"
  | "pricing"
  | "privacy"
  | "terms"
  | "success";

type AppPage =
  | "dashboard"
  | "scanner"
  | "upi"
  | "website"
  | "ghostfirm"
  | "voice"
  | "history"
  | "profile"
  | "settings"
  | "support"
  | "account";

const getPath = () => {
  const path = window.location.pathname.replace(/\/+$/, "");

  if (path === "" || path === "/") return "landing";
  if (path === "/login") return "login";
  if (path === "/pricing") return "pricing";
  if (path === "/privacy") return "privacy";
  if (path === "/terms") return "terms";
  if (path === "/success") return "success";

  if (path === "/dashboard") return "dashboard";
  if (path === "/scanner") return "scanner";
  if (path === "/upi") return "upi";
  if (path === "/website") return "website";
  if (path === "/ghostfirm") return "ghostfirm";
  if (path === "/voice") return "voice";
  if (path === "/history") return "history";
  if (path === "/profile") return "profile";
  if (path === "/settings") return "settings";
  if (path === "/support") return "support";
  if (path === "/account") return "account";

  return "landing";
};

const pathForPage = (page: string) => {
  switch (page) {
    case "login":
      return "/login";
    case "pricing":
      return "/pricing";
    case "privacy":
      return "/privacy";
    case "terms":
      return "/terms";
    case "success":
      return "/success";

    case "dashboard":
      return "/dashboard";
    case "scanner":
      return "/scanner";
    case "upi":
      return "/upi";
    case "website":
      return "/website";
    case "ghostfirm":
      return "/ghostfirm";
    case "voice":
      return "/voice";
    case "history":
      return "/history";
    case "profile":
      return "/profile";
    case "settings":
      return "/settings";
    case "support":
      return "/support";
    case "account":
      return "/account";

    default:
      return "/";
  }
};

const isPublicPage = (page: string) => {
  return [
    "landing",
    "login",
    "pricing",
    "privacy",
    "terms",
    "success",
  ].includes(page);
};

const isAppPage = (page: string) => {
  return [
    "dashboard",
    "scanner",
    "upi",
    "website",
    "ghostfirm",
    "voice",
    "history",
    "profile",
    "settings",
    "support",
    "account",
  ].includes(page);
};

function App() {
  const [currentPage, setCurrentPage] = useState<
    PublicPage | AppPage
  >(getPath());

  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(getPath());
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const navigate = (page: string) => {
    const path = pathForPage(page);

    window.history.pushState({}, "", path);
    setCurrentPage(page as PublicPage | AppPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogin = () => {
    navigate("login");
  };

  const handleLoginSuccess = () => {
    navigate("dashboard");
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate("landing");
  };

  const handleUpdateUser = async (data: {
  name?: string;
  avatar?: string;
  email?: string;
}) => {
  if (!currentUser) return;

  const updates: {
    displayName?: string;
    photoURL?: string;
  } = {};

  if (data.name !== undefined) {
    updates.displayName = data.name;
  }

  if (data.avatar !== undefined) {
    updates.photoURL = data.avatar;
  }

  if (Object.keys(updates).length > 0) {
    const { updateProfile } = await import("firebase/auth");
    await updateProfile(currentUser, updates);
    await currentUser.reload();
    setCurrentUser(auth.currentUser);
  }
};

  /*
   * PUBLIC PAGES
   *
   * These pages intentionally return BEFORE the dashboard shell.
   * They must never inherit the sidebar, dashboard header, or app layout.
   */
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f7f1e8] flex items-center justify-center">
        <div className="text-sm font-bold text-[#7451a7]">
          Loading...
        </div>
      </div>
    );
  }

  if (currentPage === "landing") {
    return (
      <Landing
        onStart={(targetPage?: string) => {
          if (targetPage) {
            navigate(targetPage);
            return;
          }

          if (currentUser) {
            navigate("dashboard");
          } else {
            navigate("login");
          }
        }}
        onLogin={handleLogin}
      />
    );
  }

  if (currentPage === "login") {
    return (
      <Login
        onAuthSuccess={handleLoginSuccess}
        onBack={() => navigate("landing")}
      />
    );
  }

  if (currentPage === "pricing") {
    return <Pricing />;
  }

  if (currentPage === "privacy") {
    return <Privacy />;
  }

  if (currentPage === "terms") {
    return <Terms />;
  }

  if (currentPage === "success") {
    return <Success />;
  }

  /*
   * PROTECTED APP PAGES
   *
   * Everything below this point is part of the authenticated
   * dashboard/application area.
   */
  if (!currentUser && isAppPage(currentPage)) {
    navigate("login");
    return null;
  }

  /*
   * DASHBOARD SHELL
   *
   * IMPORTANT:
   * Public pages above never enter this section.
   */
  return (
  <Layout
    activePage={currentPage}
    onNavigate={navigate}
    user={
      currentUser
        ? {
            name: currentUser.displayName || "User",
            email: currentUser.email || "",
            role: "User",
            isVerified: currentUser.emailVerified,
            avatar: currentUser.photoURL || undefined,
          }
        : undefined
    }
    notifications={[]}
    setNotifications={() => {}}
    onSignOut={handleLogout}
  >
    {(() => {
      switch (currentPage) {
        case "dashboard":
          return <DashboardContent />;

        case "scanner":
          return <ScamScanner />;

        case "upi":
          return <UPIChecker />;

        case "website":
          return <WebsiteVerifier />;

        case "ghostfirm":
          return <GhostFirmVerifier />;

        case "voice":
          return <VoiceAudit />;

        case "history":
          return <History />;

        case "profile":
  	  return (
            <Profile
              user={
                currentUser
                  ? {
                      name: currentUser.displayName || "User",
                      email: currentUser.email || "",
                      avatar: currentUser.photoURL || undefined,
                      role: "User",
                      isVerified: currentUser.emailVerified,
                   }
                 : undefined
             }
             historyCount={0}
             onSignOut={handleLogout}
             onUpdateUser={handleUpdateUser}
           />
         );
          
        case "settings":
          return <Settings />;

        case "support":
          return <Support />;

        case "account":
          return <AccountPage />;

        default:
          return <DashboardContent />;
      }
    })()}
   </Layout>
  );
}

export default App;