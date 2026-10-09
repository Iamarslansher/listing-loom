import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CircleDollarSign,
  FileText,
  Layers2,
  Search,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import {
  FaAmazon,
  FaBagShopping,
  FaEbay,
  FaStore,
} from "react-icons/fa6";
import {
  SiAlibabadotcom,
  SiAliexpress,
  SiEtsy,
  SiShopify,
} from "react-icons/si";
import { Brand } from "../components/Brand";

const marketplaces = [
  { name: "Shopify", Icon: SiShopify, color: "#7ab55c" },
  { name: "Amazon", Icon: FaAmazon, color: "#f39b3d" },
  { name: "eBay", Icon: FaEbay, color: "#3664d8" },
  { name: "Daraz", Icon: FaStore, color: "#f26b21" },
  { name: "Alibaba", Icon: SiAlibabadotcom, color: "#ff6a00" },
  { name: "Temu", Icon: FaBagShopping, color: "#f05a67" },
  { name: "Etsy", Icon: SiEtsy, color: "#f1641e" },
  { name: "AliExpress", Icon: SiAliexpress, color: "#e43225" },
];

const features = [
  {
    icon: <WandSparkles size={19} />,
    title: "From rough notes to ready",
    text: "Turn product details into polished, publish-ready copy in seconds. No blank-page staring.",
  },
  {
    icon: <Search size={19} />,
    title: "Made to be discovered",
    text: "Search-friendly titles and backend keywords help the right shoppers find your products.",
  },
  {
    icon: <Layers2 size={19} />,
    title: "One listing, every channel",
    text: "Shape every listing for Amazon, eBay, or Shopify, with the tone that fits your brand.",
  },
];

export default function HomePage() {
  return (
    <main>
      <header className="shell landing-header">
        <Link href="/" aria-label="ListingLoom home">
          <Brand />
        </Link>
        <nav className="landing-nav" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#features">Features</a>
          <Link href="/login">Log in</Link>
          <Link className="button-primary" href="/login">
            Get started <ArrowRight size={14} />
          </Link>
        </nav>
      </header>

      <section className="hero">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">
              Your unfair advantage on every marketplace
            </span>
            <h1>
              Great products deserve <span>great listings.</span>
            </h1>
            <p>
              Turn the product notes on your desk into the listings shoppers
              can’t scroll past. SEO-ready, on-brand, and all yours in seconds.
            </p>
            <div className="hero-actions">
              <Link href="/login" className="button-primary">
                Start weaving for free <ArrowRight size={15} />
              </Link>
            </div>
            <div className="hero-footnote">
              <Check size={13} color="#37ad85" /> No credit card needed{" "}
              <span>·</span> Your first listings are on us
            </div>
          </div>
          <div
            className="hero-visual"
            aria-label="Preview of a generated product listing"
          >
            <div className="floating-chip top">
              <span className="floating-icon">
                <Sparkles size={14} />
              </span>{" "}
              SEO score improved <span style={{ color: "#33ad81" }}>+82%</span>
            </div>
            <div className="preview-card">
              <div className="preview-top">
                <div className="preview-product">
                  <div className="preview-product-icon">☕</div>
                  <div>
                    <p>Stoneware coffee mug</p>
                    <small>Your product, all polished up</small>
                  </div>
                </div>
                <span className="preview-badge">
                  <BadgeCheck size={12} /> Listing ready
                </span>
              </div>
              <div className="preview-body">
                <p className="preview-label">
                  <FileText size={12} /> SEO title
                </p>
                <p className="preview-title">
                  Handmade Stoneware Coffee Mug, 14 oz Ceramic Cup with Speckled
                  Glaze
                </p>
                <p className="preview-label">
                  <Check size={12} color="#35b991" /> Listing highlights
                </p>
                <div className="preview-bullet">
                  <Check size={12} /> Individually hand-thrown for a
                  one-of-a-kind feel in every cup.
                </div>
                <div className="preview-bullet">
                  <Check size={12} /> A generous 14 oz capacity for your
                  slow-morning favorite.
                </div>
                <div className="preview-bullet">
                  <Check size={12} /> Speckled, food-safe glaze brings a little
                  everyday joy.
                </div>
                <div className="preview-tags">
                  <span className="preview-tag">handmade ceramic mug</span>
                  <span className="preview-tag">speckled stoneware</span>
                  <span className="preview-tag">artisan coffee cup</span>
                </div>
              </div>
            </div>
            <div className="floating-chip bottom">
              <span
                className="floating-icon"
                style={{ color: "#2e9f78", background: "#e9f8f1" }}
              >
                <CircleDollarSign size={14} />
              </span>{" "}
              Less typing, more selling
            </div>
          </div>
        </div>
      </section>

      <section className="proof-row" aria-label="Supported marketplaces">
        <span className="proof-title">One workspace. Your whole shop.</span>
        <div className="marquee-wrapper">
          <div className="marquee-track">
            {[false, true].map((isDuplicate) => (
                <div
                  className="marquee-group"
                  key={isDuplicate ? "duplicate" : "primary"}
                  aria-hidden={isDuplicate || undefined}
                >
                  {marketplaces.map(({ name, Icon, color }) => (
                    <div className="market-logo" key={name}>
                      <Icon
                        className="market-icon"
                        aria-hidden="true"
                        style={{ color }}
                      />
                      <span>{name}</span>
                    </div>
                  ))}
                </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="section shell">
        <div className="section-heading">
          <span className="eyebrow">The craft, without the busywork</span>
          <h2>Your best seller starts with a better listing.</h2>
          <p>
            All the little details that turn a product page from “just okay”
            into “add to cart.”
          </p>
        </div>
        <div className="features">
          {features.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="how-it-works"
        className="section shell"
        style={{ paddingTop: 6 }}
      >
        <div className="cta-strip">
          <div className="cta-strip-inner">
            <div>
              <h2>Your next listing is waiting to happen.</h2>
              <p>
                Give your product notes a glow-up. It takes less time than
                making coffee.
              </p>
            </div>
            <Link href="/login" className="button-primary">
              Make my first listing <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="shell landing-footer">
        <Brand />
        <span>Made for the makers, the sellers, and the do-it-allers.</span>
        <span>
          Developed by <strong>Arsalan Sher</strong>
        </span>
        <span>© {new Date().getFullYear()} ListingLoom</span>
      </footer>
    </main>
  );
}
