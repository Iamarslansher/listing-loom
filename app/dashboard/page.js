"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronDown,
  Copy,
  FileText,
  History,
  Layers2,
  LogOut,
  Plus,
  Sparkles,
  Trash2,
  WandSparkles,
} from "lucide-react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { toast } from "sonner";
import { Brand } from "../../components/Brand";
import { getFirebaseServices } from "../../lib/firebase";

const tabs = [
  { id: "seoTitle", label: "SEO title" },
  { id: "bulletPoints", label: "Bullet points" },
  { id: "descriptionHtml", label: "Description" },
  { id: "backendKeywords", label: "Keywords" },
];
const tones = ["Professional", "Persuasive", "SEO-focused"];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [marketplace, setMarketplace] = useState("Amazon");
  const [tone, setTone] = useState("SEO-focused");
  const [productName, setProductName] = useState("");
  const [rawDescription, setRawDescription] = useState("");
  const [generatedData, setGeneratedData] = useState(null);
  const [activeTab, setActiveTab] = useState("seoTitle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState("workspace");
  const [auth, setAuth] = useState(null);
  const [db, setDb] = useState(null);

  useEffect(() => {
    try {
      const services = getFirebaseServices();
      setAuth(services.auth);
      setDb(services.db);
      return onAuthStateChanged(services.auth, (currentUser) => {
        if (!currentUser) window.location.assign("/login");
        else setUser(currentUser);
      });
    } catch (serviceError) {
      setError(serviceError.message);
      toast.error(serviceError.message);
    }
  }, []);

  useEffect(() => {
    if (!user || !db) return undefined;
    const listingsQuery = query(
      collection(db, "listings"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );
    return onSnapshot(
      listingsQuery,
      (snapshot) => {
        setListings(
          snapshot.docs.map((listing) => ({
            id: listing.id,
            ...listing.data(),
          })),
        );
      },
      (snapshotError) => {
        const errorMessage = `Could not load saved listings: ${snapshotError.message}`;
        setError(errorMessage);
        toast.error(errorMessage);
      },
    );
  }, [user, db]);

  const selectedListing = useMemo(
    () => listings.find((item) => item.id === generatedData?.listingId),
    [listings, generatedData],
  );

  async function generateListing(event) {
    event.preventDefault();
    setError("");
    if (!user || !db) {
      const errorMessage = "Sign in before generating and saving listings.";
      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }
    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          productName,
          rawDescription,
          marketplace,
          tone,
        }),
      });
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload.error || "Listing generation failed.");
      const record = {
        userId: user.uid,
        productName: productName.trim(),
        rawDescription: rawDescription.trim(),
        marketplace,
        tone,
        generatedData: payload.generatedData,
        createdAt: serverTimestamp(),
      };
      const listingRef = await addDoc(collection(db, "listings"), record);
      setGeneratedData({ ...payload.generatedData, listingId: listingRef.id });
      setActiveTab("seoTitle");
      toast.success("Your listing is ready and saved to your collection.");
    } catch (generationError) {
      const errorMessage =
        generationError.message ||
        "Could not generate this listing. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  function loadListing(listing) {
    setGeneratedData({ ...listing.generatedData, listingId: listing.id });
    setProductName(listing.productName || "");
    setRawDescription(listing.rawDescription || "");
    setMarketplace(listing.marketplace || "Amazon");
    setTone(listing.tone || "SEO-focused");
    setActiveTab("seoTitle");
    setView("workspace");
    setError("");
    toast.success("Saved listing loaded.");
  }

  async function deleteListing(listingId) {
    setError("");
    try {
      await deleteDoc(doc(db, "listings", listingId));
      if (generatedData?.listingId === listingId) setGeneratedData(null);
      toast.success("Listing deleted.");
    } catch (deleteError) {
      const errorMessage = `Could not delete listing: ${deleteError.message}`;
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }

  async function copyText(value) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied to clipboard.");
    } catch {
      const errorMessage =
        "Clipboard access was blocked. Select the text and copy it manually.";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }

  function getActiveContent() {
    if (!generatedData) return null;
    if (activeTab === "seoTitle") return generatedData.seoTitle;
    if (activeTab === "bulletPoints") return generatedData.bulletPoints;
    if (activeTab === "descriptionHtml") return generatedData.descriptionHtml;
    return generatedData.backendKeywords;
  }

  function descriptionText(html) {
    if (typeof window === "undefined")
      return html
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    const container = document.createElement("div");
    container.innerHTML = html;
    return container.textContent || "";
  }

  const activeContent = getActiveContent();

  return (
    <main className="workspace">
      <aside className="sidebar">
        <a className="sidebar-brand" href="/dashboard">
          <Brand />
        </a>
        <span className="sidebar-label">Workspace</span>
        <nav className="sidebar-nav" aria-label="Workspace navigation">
          <button
            type="button"
            className={`sidebar-link ${view === "workspace" ? "active" : ""}`}
            onClick={() => setView("workspace")}
          >
            <WandSparkles size={15} /> Generator
          </button>
          <button
            type="button"
            className={`sidebar-link ${view === "history" ? "active" : ""}`}
            onClick={() => setView("history")}
          >
            <History size={15} /> Saved listings{" "}
            <span style={{ marginLeft: "auto", opacity: 0.7 }}>
              {listings.length || ""}
            </span>
          </button>
        </nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-user">
          <span className="user-avatar">
            {(user?.displayName || user?.email || "S")
              .slice(0, 1)
              .toUpperCase()}
          </span>
          <div className="user-meta">
            <strong>{user?.displayName || user?.email || "Your shop"}</strong>
            <span>Free workspace</span>
          </div>
          <button
            className="icon-button"
            type="button"
            aria-label="Sign out"
            title="Sign out"
            onClick={async () => {
              try {
                await signOut(auth);
                toast.success("You’ve been signed out.");
                router.push("/login");
              } catch (signOutError) {
                const errorMessage = `Could not sign out: ${signOutError.message}`;
                setError(errorMessage);
                toast.error(errorMessage);
              }
            }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      <section className="workspace-main">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Workspace</span>
            <span>/</span>
            <strong>
              {view === "history" ? "Saved listings" : "Generator"}
            </strong>
          </div>
          <div className="topbar-right">
            <span className="status-dot" /> Your work, safely saved
          </div>
        </header>
        <div className="workspace-content">
          {view === "history" ? (
            <>
              <div className="workspace-heading">
                <div>
                  <span className="eyebrow">Your collection</span>
                  <h1>Saved listings</h1>
                  <p>Every idea you’ve woven, ready to pick up again.</p>
                </div>
                <button
                  className="button-primary"
                  type="button"
                  onClick={() => setView("workspace")}
                >
                  <Plus size={14} /> New listing
                </button>
              </div>
              {error && (
                <div
                  className="notice-error"
                  role="alert"
                  style={{ marginBottom: 14 }}
                >
                  {error}
                </div>
              )}
              <section className="panel">
                <div className="panel-head">
                  <h2>Your listings</h2>
                  <span>{listings.length} saved</span>
                </div>
                {listings.length ? (
                  listings.map((listing) => (
                    <div className="listing-row" key={listing.id}>
                      <div className="listing-info">
                        <strong>{listing.productName}</strong>
                        <span>
                          {listing.marketplace} ·{" "}
                          {listing.createdAt
                            ?.toDate?.()
                            .toLocaleDateString?.() || "Recently saved"}
                        </span>
                      </div>
                      <div className="listing-actions">
                        <button
                          className="button-secondary"
                          type="button"
                          onClick={() => loadListing(listing)}
                        >
                          <FileText size={12} /> Open
                        </button>
                        <button
                          className="icon-button"
                          type="button"
                          aria-label={`Delete ${listing.productName}`}
                          onClick={() => deleteListing(listing.id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="history-empty">
                    Your next great listing will be right here.
                  </div>
                )}
              </section>
            </>
          ) : (
            <>
              <div className="workspace-heading">
                <div>
                  <span className="eyebrow">Your little listing studio</span>
                  <h1>Let’s weave something great.</h1>
                  <p>A few product details in. A listing worth clicking on.</p>
                </div>
                <button
                  type="button"
                  className="button-secondary"
                  onClick={() => setView("history")}
                >
                  <History size={14} /> View saved listings
                </button>
              </div>
              {error && (
                <div
                  className="notice-error"
                  role="alert"
                  style={{ marginBottom: 13 }}
                >
                  {error}
                </div>
              )}
              <div className="generator-grid">
                <section className="panel">
                  <div className="panel-head">
                    <h2>Tell us about your product</h2>
                    <span>
                      <Sparkles size={12} /> The good stuff
                    </span>
                  </div>
                  <form className="form-body" onSubmit={generateListing}>
                    <label>
                      <span className="input-label">Product name</span>
                      <input
                        className="text-field"
                        required
                        maxLength={160}
                        placeholder="e.g. Handmade stoneware coffee mug"
                        value={productName}
                        onChange={(event) => setProductName(event.target.value)}
                      />
                    </label>
                    <label>
                      <span className="input-label">
                        Product notes{" "}
                        <span
                          style={{
                            color: "#a1a4af",
                            fontSize: 9,
                            fontWeight: 400,
                          }}
                        >
                          What makes it special?
                        </span>
                      </span>
                      <textarea
                        className="text-field"
                        required
                        maxLength={6000}
                        rows={6}
                        placeholder={
                          "Materials, dimensions, who it's for, the little details shoppers will love…"
                        }
                        value={rawDescription}
                        onChange={(event) =>
                          setRawDescription(event.target.value)
                        }
                        style={{ resize: "vertical", lineHeight: 1.65 }}
                      />
                      <span
                        style={{
                          display: "block",
                          marginTop: 5,
                          color: "#a1a4af",
                          fontSize: 9,
                          textAlign: "right",
                        }}
                      >
                        {rawDescription.length}/6000
                      </span>
                    </label>
                    <label>
                      <span className="input-label">
                        Where are you selling?
                      </span>
                      <span className="select-wrap">
                        <select
                          className="text-field"
                          value={marketplace}
                          onChange={(event) =>
                            setMarketplace(event.target.value)
                          }
                        >
                          <option>Amazon</option>
                          <option>Shopify</option>
                          <option>eBay</option>
                          <option>Temu</option>
                          <option>AliExpress</option>
                          <option>Etsy</option>
                          <option>Alibaba</option>
                          <option>Daraz</option>
                        </select>
                        <ChevronDown className="select-chevron" size={14} />
                      </span>
                    </label>
                    <div>
                      <span className="input-label">Pick your voice</span>
                      <div
                        className="segmented"
                        role="group"
                        aria-label="Tone of voice"
                      >
                        {tones.map((choice) => (
                          <button
                            key={choice}
                            type="button"
                            className={`segment ${tone === choice ? "selected" : ""}`}
                            aria-pressed={tone === choice}
                            onClick={() => setTone(choice)}
                          >
                            {choice}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      className="button-primary generate-button"
                      type="submit"
                      disabled={loading || !user}
                    >
                      {loading ? (
                        <>
                          <span className="loading-dots">
                            <span />
                            <span />
                            <span />
                          </span>{" "}
                          Weaving your listing…
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} /> Generate my listing
                        </>
                      )}
                    </button>
                    <div className="usage-note">
                      <Check size={12} color="#37ad85" /> Your listing is
                      automatically saved
                    </div>
                  </form>
                </section>

                <section className="panel output-panel">
                  <div className="panel-head">
                    <h2>Your listing, taking shape</h2>
                    {generatedData && (
                      <span style={{ color: "#30a77d" }}>
                        <Check size={12} /> Ready to copy
                      </span>
                    )}
                  </div>
                  <div
                    className="output-tabs"
                    role="tablist"
                    aria-label="Generated listing details"
                  >
                    {tabs.map((tab) => (
                      <button
                        type="button"
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        key={tab.id}
                        className={`output-tab ${activeTab === tab.id ? "active" : ""}`}
                        onClick={() => setActiveTab(tab.id)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                  <div className="output-content">
                    {!generatedData ? (
                      <div className="output-placeholder">
                        <div>
                          <div className="placeholder-icon">
                            <Layers2 size={22} />
                          </div>
                          <h3>Your next great listing starts here.</h3>
                          <p>
                            Share the little details about your product. We’ll
                            turn them into something shoppers remember.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="output-copy">
                          <span>
                            {selectedListing?.marketplace || marketplace} ·{" "}
                            {tabs.find((tab) => tab.id === activeTab)?.label}
                          </span>
                          <button
                            className="button-secondary"
                            type="button"
                            onClick={() =>
                              copyText(
                                Array.isArray(activeContent)
                                  ? activeContent.join("\n")
                                  : activeTab === "descriptionHtml"
                                    ? descriptionText(activeContent)
                                    : activeContent,
                              )
                            }
                          >
                            <Copy size={12} /> Copy
                          </button>
                        </div>
                        {activeTab === "bulletPoints" && (
                          <ul className="output-list">
                            {activeContent.map((item, index) => (
                              <li key={`${index}-${item}`}>
                                <Check size={14} /> <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        {activeTab === "seoTitle" && (
                          <p className="output-text title-output">
                            {activeContent}
                          </p>
                        )}
                        {activeTab === "descriptionHtml" && (
                          <div
                            className="output-text"
                            style={{ lineHeight: 1.8 }}
                            dangerouslySetInnerHTML={{ __html: activeContent }}
                          />
                        )}
                        {activeTab === "backendKeywords" && (
                          <div className="keyword-cloud">
                            {activeContent.map((item, index) => (
                              <span key={`${index}-${item}`}>{item}</span>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </section>
              </div>

              <section className="panel history-section">
                <div className="panel-head">
                  <h2>
                    <History
                      size={14}
                      style={{ verticalAlign: "middle", marginRight: 6 }}
                    />{" "}
                    Recently woven
                  </h2>
                  <button
                    type="button"
                    className="text-action"
                    onClick={() => setView("history")}
                  >
                    See all
                  </button>
                </div>
                {listings.length ? (
                  listings.slice(0, 3).map((listing) => (
                    <div className="listing-row" key={listing.id}>
                      <div className="listing-info">
                        <strong>{listing.productName}</strong>
                        <span>
                          {listing.marketplace} ·{" "}
                          {listing.createdAt
                            ?.toDate?.()
                            .toLocaleDateString?.() || "Recently saved"}
                        </span>
                      </div>
                      <div className="listing-actions">
                        <button
                          className="button-secondary"
                          type="button"
                          onClick={() => loadListing(listing)}
                        >
                          <FileText size={12} /> Open
                        </button>
                        <button
                          className="icon-button"
                          type="button"
                          aria-label={`Delete ${listing.productName}`}
                          onClick={() => deleteListing(listing.id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="history-empty">
                    Generate your first listing and it’ll be saved here.
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
