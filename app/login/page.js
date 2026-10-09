"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { ArrowRight, Chrome } from "lucide-react";
import { toast } from "sonner";
import { Brand } from "../../components/Brand";
import { getFirebaseConfigError, getFirebaseServices } from "../../lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [services, setServices] = useState(null);

  useEffect(() => {
    try {
      setServices(getFirebaseServices());
    } catch (serviceError) {
      setError(serviceError.message);
      toast.error(serviceError.message);
      return;
    }
    const { auth } = getFirebaseServices();
    let initialAuthCheck = true;
    return onAuthStateChanged(auth, (user) => {
      if (initialAuthCheck && user) router.replace("/dashboard");
      initialAuthCheck = false;
    });
  }, [router]);

  async function handleAuth(action) {
    setError("");
    setBusy(true);
    try {
      if (!services) throw new Error(getFirebaseConfigError() || "Firebase is not configured.");
      const { auth, googleProvider } = services;
      const { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, updateProfile } =
        await import("firebase/auth");
      let user;
      if (action === "google") {
        user = (await signInWithPopup(auth, googleProvider)).user;
      } else if (mode === "signup") {
        user = (await createUserWithEmailAndPassword(auth, email, password)).user;
        const name = email.split("@")[0];
        await updateProfile(user, { displayName: name });
      } else {
        user = (await signInWithEmailAndPassword(auth, email, password)).user;
      }
      const { db } = services;
      const userRef = doc(db, "users", user.uid);
      const userData = {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || "",
      };
      const userSnapshot = await getDoc(userRef);
      if (userSnapshot.exists()) {
        await setDoc(userRef, userData, { merge: true });
      } else {
        await setDoc(userRef, { ...userData, createdAt: serverTimestamp() });
      }
      toast.success(
        action === "google"
          ? "Signed in successfully."
          : mode === "signup"
            ? "Account created successfully."
            : "Welcome back.",
      );
      router.push("/dashboard");
    } catch (authError) {
      const messages = {
        "auth/email-already-in-use": "An account already exists for this email. Try logging in.",
        "auth/invalid-credential": "Email or password is incorrect.",
        "auth/weak-password": "Choose a password with at least 6 characters.",
        "auth/invalid-email": "Enter a valid email address.",
        "auth/popup-closed-by-user": "Google sign-in was closed before finishing.",
      };
      const code = authError.code || "";
      const message = authError.message || "";
      const invalidApiKey =
        code.includes("api-key-not-valid") ||
        code.includes("invalid-api-key") ||
        message.toLowerCase().includes("api key not valid");

      const errorMessage = invalidApiKey
          ? "Firebase rejected this project's Web API key. In Firebase Console → Project settings → General, copy the Web app config's apiKey into NEXT_PUBLIC_FIREBASE_API_KEY in .env.local. In Google Cloud Console, make sure the key allows the Identity Toolkit API and your current domain. Restart the dev server after changing it."
          : messages[code] || message || "Sign-in failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-panel">
        <div className="auth-card">
          <Link href="/" aria-label="ListingLoom home"><Brand /></Link>
          <h1>{mode === "signup" ? "Let’s make it official." : "Welcome back."}</h1>
          <p>{mode === "signup" ? "Your next great listing is only a few details away." : "Pick up where your next great listing left off."}</p>
          {error && <div className="notice-error" role="alert" style={{ marginBottom: 15 }}>{error}</div>}
          <button className="button-secondary" type="button" disabled={busy} onClick={() => handleAuth("google")} style={{ width: "100%", minHeight: 43 }}>
            <Chrome size={15} /> Continue with Google
          </button>
          <div className="auth-divider">or continue with email</div>
          <form className="auth-form" onSubmit={(event) => { event.preventDefault(); handleAuth("email"); }}>
            <label>
              <span className="input-label">Email address</span>
              <input className="text-field" required type="email" autoComplete="email" placeholder="you@yourshop.com" value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
            <label>
              <span className="input-label">Password</span>
              <input className="text-field" required minLength={6} type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} placeholder="At least 6 characters" value={password} onChange={(event) => setPassword(event.target.value)} />
            </label>
            <button className="button-primary" type="submit" disabled={busy} style={{ width: "100%", marginTop: 2 }}>
              {busy ? "One moment…" : mode === "signup" ? "Create free account" : "Log in"} {!busy && <ArrowRight size={14} />}
            </button>
          </form>
          <div className="auth-switch">
            {mode === "signup" ? "Already have an account? " : "New around here? "}
            <button className="text-action" type="button" onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setError(""); }}>
              {mode === "signup" ? "Log in" : "Create account"}
            </button>
          </div>
          <p style={{ marginTop: 24, marginBottom: 0, fontSize: 10, textAlign: "center" }}>By continuing, you agree to make your product listings a little more lovely.</p>
        </div>
      </section>
      <aside className="auth-art">
        <Link href="/" aria-label="ListingLoom home"><Brand dark /></Link>
        <div className="auth-art-content">
          <span>A little less listing. A lot more selling.</span>
          <h2>Weave your product story into something shoppers love.</h2>
          <p>Everything your next great listing needs, thoughtfully put together in one place.</p>
          <div className="auth-quote">“I had a page of notes and a product photo. A few seconds later, I had a listing ready to publish.”<br /><span style={{ color: "#9d99ff" }}>— one very happy shop owner</span></div>
        </div>
        <div className="auth-art-footer">Your words, your shop, your next big thing.</div>
      </aside>
    </main>
  );
}
