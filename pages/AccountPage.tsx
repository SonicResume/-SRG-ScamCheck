"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  ShieldAlert,
  LogOut,
  Trash2,
  Sparkles,
  Check,
} from "lucide-react";

import { auth, db } from "../lib/firebase";
import {
  deleteUser,
  updateEmail,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";


const STRIPE_PRO_PRICE_ID =
  "price_1TbF9BPE4wCsfg732ScUJfmc";

const STRIPE_BUSINESS_PRICE_ID =
  "price_1TnzrFPE4wCsfg73xSOMZNuH";

const STRIPE_PREMIUM_PRICE_ID =
  "price_1TGwAJPE4wCsfg73gMQlv8Ph";


export default function AccountPage() {

  const navigate = useNavigate();

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [emailUpdating, setEmailUpdating] = useState(false);
  const [plan, setPlan] = useState("free");
  const [credits, setCredits] = useState(20);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);


  useEffect(() => {

    const unsubscribe = auth.onAuthStateChanged(
      async (currentUser) => {

        setUser(currentUser);

        if (currentUser) {

          const userRef = doc(
            db,
            "users",
            currentUser.uid
          );

          const snap = await getDoc(userRef);

          if (snap.exists()) {

            const data = snap.data();

            setPlan(data.plan || "free");

            setCredits(
              data.credits ?? 20
            );

          }

        }

        setLoading(false);
      }
    );


    return () => unsubscribe();

  }, []);


  const openDashboard = () => {

    if (
      plan === "free" &&
      credits <= 0
    ) {
      navigate("/pricing");
      return;
    }

    navigate("/dashboard");
  };


  const handleCheckout = async (
    priceId: string,
    planKey: string
  ) => {

    if (!user) {
      navigate("/login");
      return;
    }

    setCheckoutLoading(planKey);

    try {

      const BILLING_URL =
        import.meta.env.VITE_BILLING_URL;

      if (!BILLING_URL) {
        throw new Error(
          "Billing URL is not configured."
        );
      }

      const res = await fetch(
        BILLING_URL,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            price_id: priceId,
            email: user.email || "test@example.com",
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.detail ||
          data.error ||
          "Checkout failed"
        );
      }

      if (!data.url) {
        throw new Error(
          "No checkout URL returned"
        );
      }

      window.location.href = data.url;

    } catch (error) {

      console.error(
        "Checkout error:",
        error
      );

      alert(
        "Something went wrong starting checkout."
      );

    } finally {

      setCheckoutLoading(null);

    }

  };


  const handleLogout = async () => {

    await signOut(auth);

    navigate("/login");

  };


  const handleDeleteAccount = async () => {

    if (!user) return;


    const ok = window.confirm(
      "Delete your account permanently?"
    );


    if (!ok) return;


    setActionLoading(true);


    try {

      await deleteUser(user);

      navigate("/");

    } catch (error) {

      console.error(error);

      alert(
        "Please login again before deleting your account."
      );

    }


    setActionLoading(false);

  };


  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center">

        Loading account...

      </div>

    );

  }


  return (

    <div className="min-h-screen bg-slate-50 p-6">


      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-8 space-y-8">


        <div className="flex justify-between items-center border-b pb-5">

          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm font-bold text-emerald-600"
          >
            Dashboard
          </button>

          <h1 className="font-black">
            NOAH Account
          </h1>

        </div>


        <div className="flex items-center gap-4 bg-slate-100 p-5 rounded-2xl">

          <User className="text-emerald-600"/>

          <div>

            <p className="text-xs text-gray-400">
              EMAIL
            </p>

            <p className="font-bold">
              {user?.email}
            </p>

          </div>

        </div>


        <div className="bg-slate-900 text-white rounded-3xl p-6 space-y-5">


          <div className="flex gap-2 items-center">

            <Sparkles className="text-yellow-400"/>

            <h2 className="font-black">
              {plan.toUpperCase()} PLAN
            </h2>

          </div>


          <p className="text-sm text-slate-300">

            Credits remaining:
            {" "}

            {plan === "free"
              ? credits
              : "Unlimited"}

          </p>


          <div className="space-y-2 text-sm">

            {[
              "AI Translation",
              "Language Tools",
              "Audio Features",
              "Premium Modules"

            ].map(item => (

              <div
                key={item}
                className="flex gap-2"
              >

                <Check
                  size={16}
                  className="text-green-400"
                />

                {item}

              </div>

            ))}

          </div>


          <button
            onClick={openDashboard}
            className="w-full bg-emerald-600 hover:bg-emerald-500 py-3 rounded-xl font-bold"
          >
            Open Dashboard
          </button>


          {plan === "free" && (

            <p className="text-xs text-yellow-300">

              Free accounts include 20 credits.
              Upgrade when credits run out.

            </p>

          )}


          <div className="grid grid-cols-1 gap-3 pt-4">


            <button
              onClick={() =>
                handleCheckout(
                  STRIPE_PRO_PRICE_ID,
                  "pro"
                )
              }
              disabled={checkoutLoading !== null}
              className="bg-white text-black text-center py-3 rounded-xl font-bold disabled:opacity-50"
            >

              {checkoutLoading === "pro"
                ? "Loading..."
                : "Upgrade Pro $19/mo"}

            </button>


            <button
              onClick={() =>
                handleCheckout(
                  STRIPE_BUSINESS_PRICE_ID,
                  "business"
                )
              }
              disabled={checkoutLoading !== null}
              className="bg-white text-black text-center py-3 rounded-xl font-bold disabled:opacity-50"
            >

              {checkoutLoading === "business"
                ? "Loading..."
                : "Business $29/mo"}

            </button>


            <button
              onClick={() =>
                handleCheckout(
                  STRIPE_PREMIUM_PRICE_ID,
                  "premium"
                )
              }
              disabled={checkoutLoading !== null}
              className="bg-white text-black text-center py-3 rounded-xl font-bold disabled:opacity-50"
            >

              {checkoutLoading === "premium"
                ? "Loading..."
                : "Premium $49/mo"}

            </button>


          </div>


        </div>


        <div className="grid grid-cols-2 gap-3">


          <button
            onClick={handleLogout}
            className="border p-4 rounded-xl flex justify-center gap-2"
          >

            <LogOut size={16}/>
            Logout

          </button>


          <button
            disabled={actionLoading}
            onClick={handleDeleteAccount}
            className="border border-red-300 text-red-500 p-4 rounded-xl flex justify-center gap-2"
          >

            <Trash2 size={16}/>
            Delete

          </button>


        </div>


        <div className="text-xs text-center text-gray-400 flex justify-center gap-2">

          <ShieldAlert size={14}/>

          Firebase secured account access

        </div>


      </div>

    </div>

  );

}
