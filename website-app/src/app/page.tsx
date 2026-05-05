"use client";

import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";

// ─── Responsive hook ─────────────────────────────────────────────────────────
function useBreakpoint() {
  const [bp, setBp] = useState({ mobile: false, tablet: false });
  useEffect(() => {
    const update = () => setBp({
      mobile: window.innerWidth < 768,
      tablet: window.innerWidth < 992,
    });
    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);
  return bp;
}

// ─── Scroll animation hook ───────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── Typing effect hook ──────────────────────────────────────────────────────
function useTypingEffect(text: string, speed = 18, active = false) {
  const [displayText, setDisplayText] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!active) { setDisplayText(""); setDone(false); return; }
    let i = 0;
    setDisplayText(""); setDone(false);
    const timer = setInterval(() => {
      i++;
      setDisplayText(text.slice(0, i));
      if (i >= text.length) { setDone(true); clearInterval(timer); }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed, active]);
  return { displayText, done };
}

// ─── Counter animation hook ──────────────────────────────────────────────────
function useCounter(target: number, duration = 1800, active = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [active, target, duration]);
  return count;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const features = [
  { icon: "forum", title: "Shared Inbox", desc: "Your whole team in one WhatsApp inbox. Assign, reply, and resolve.", href: "/features/shared-inbox" },
  { icon: "campaign", title: "Bulk Campaigns", desc: "Broadcast to thousands. Track delivery in real-time.", href: "/features/campaigns" },
  { icon: "bolt", title: "Automation", desc: "Auto-replies and workflow rules. Work while you sleep.", href: "/features/automation" },
  { icon: "bar_chart", title: "Analytics", desc: "Delivery rates, CSAT scores, team performance — one dashboard.", href: "/features/analytics" },
  { icon: "group", title: "Contacts CRM", desc: "Tag, segment, and manage all your leads and customers.", href: "/features/contacts" },
  { icon: "smart_toy", title: "Chatbot Builder", desc: "Build no-code WhatsApp chatbots in minutes.", href: "/features/chatbot" },
  { icon: "trending_up", title: "Deals Pipeline", desc: "Track every deal through stages. See your revenue forecast at a glance.", href: "/features/deals" },
  { icon: "low_priority", title: "Sequences", desc: "Automated drip campaigns on WhatsApp. Set it, forget it, close more.", href: "/features/sequences" },
  { icon: "star_rate", title: "CSAT Surveys", desc: "Auto-send satisfaction surveys after every resolved conversation.", href: "/features/csat" },
  { icon: "query_stats", title: "Lead Scoring", desc: "Automatically score and qualify leads based on engagement and profile data.", href: "/features/lead-scoring" },
  { icon: "devices", title: "Multi-Channel", desc: "Instagram, Facebook Messenger, and Email — alongside WhatsApp.", href: "/features/multi-channel" },
  { icon: "code", title: "Developer API", desc: "Full REST API and webhook system. Build custom integrations in minutes.", href: "/features/developer-api" },
];

// App base URL — register page
const APP_REGISTER_URL = "https://app.wazelo.in/auth/register";
const APP_LOGIN_URL    = "https://app.wazelo.in/auth/login";

const plans = [
  {
    name: "Starter", monthlyPrice: 499, yearlyPrice: 4990,
    subtitle: "5 users · 5 WA sessions · 5,000 msgs/mo · 10 campaigns",
    features: [
      "Shared WhatsApp inbox",
      "Bulk campaigns",
      "Basic contact CRM",
      "Email support",
    ],
    popular: false,
  },
  {
    name: "Growth", monthlyPrice: 999, yearlyPrice: 9990,
    subtitle: "15 users · 15 WA sessions · 25,000 msgs/mo · 50 campaigns",
    features: [
      "Everything in Starter",
      "Automation workflows",
      "Advanced analytics",
      "Priority support",
    ],
    popular: true,
  },
  {
    name: "Pro", monthlyPrice: 1999, yearlyPrice: 19990,
    subtitle: "50 users · 50 WA sessions · 1,00,000 msgs/mo · 200 campaigns",
    features: [
      "Everything in Growth",
      "Full API access",
      "Dedicated account manager",
      "24/7 phone support",
    ],
    popular: false,
  },
];


// ─── AI Features data ────────────────────────────────────────────────────────
type AiOutputType = "replies" | "sentiment" | "summary" | "categorization" | "intent" | "kbrag" | "routing" | "insights";
type AiFeature = { id: string; icon: string; label: string; tagline: string; outputType: AiOutputType; };
const AI_FEATURES: AiFeature[] = [
  { id: "smart-replies",       icon: "auto_fix_high",  label: "Smart Replies",        tagline: "3 contextual reply suggestions from conversation history",  outputType: "replies" },
  { id: "conversation-summary",icon: "summarize",      label: "Conversation Summary", tagline: "Key topics, timeline, and predicted CSAT in one pass",       outputType: "summary" },
  { id: "sentiment-analysis",  icon: "mood",           label: "Sentiment Analysis",   tagline: "Real-time POSITIVE / NEGATIVE / URGENT detection",           outputType: "sentiment" },
  { id: "auto-categorization", icon: "category",       label: "Auto-Categorization",  tagline: "Intent, priority, and language detection automatically",     outputType: "categorization" },
  { id: "intent-detection",    icon: "travel_explore", label: "Intent Detection",     tagline: "Entities, sub-intents, and routing hints extracted",         outputType: "intent" },
  { id: "kb-rag",              icon: "library_books",  label: "Knowledge Base RAG",   tagline: "Searches KB and generates cited answers for agents",         outputType: "kbrag" },
  { id: "routing-suggestions", icon: "account_tree",   label: "Routing Suggestions",  tagline: "Routes conversations to the right team based on context",    outputType: "routing" },
  { id: "ai-insights",         icon: "insights",       label: "AI Insights",          tagline: "Trend summaries, highlights, and warnings over 7d / 30d",   outputType: "insights" },
];

const partnerLogos = [
  { name: "Meta Business", abbr: "META" },
  { name: "Razorpay", abbr: "RZRPAY" },
  { name: "Shopify", abbr: "SHOPIFY" },
  { name: "Stripe", abbr: "STRIPE" },
];

// ─── SVG Divider ─────────────────────────────────────────────────────────────
function SvgDivider({ inView }: { inView: boolean }) {
  return (
    <svg viewBox="0 0 1440 1" width="100%" height="1" style={{ display: "block", overflow: "visible" }} preserveAspectRatio="none">
      <line
        x1="0" y1="0" x2="1440" y2="0"
        stroke="rgba(255,183,125,0.25)"
        strokeWidth="1"
        strokeDasharray="1440"
        strokeDashoffset={inView ? 0 : 1440}
        style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.16,1,0.3,1)" }}
      />
    </svg>
  );
}

// ─── Square Grid (Hero background) ───────────────────────────────────────────
function SquareGrid({ scrollY }: { scrollY: number }) {
  const cols = 24;
  const rows = 14;
  const total = cols * rows;
  const progress = Math.min(scrollY / 600, 1);

  // Determine which squares are visible based on scroll (bottom-up reveal)
  const squares = Array.from({ length: total }, (_, i) => {
    const row = Math.floor(i / cols);
    const rowFromBottom = rows - 1 - row;
    const threshold = (rowFromBottom / rows) * 0.7;
    return progress > threshold;
  });

  return (
    <div style={{
      position: "absolute", inset: 0,
      display: "grid",
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gridTemplateRows: `repeat(${rows}, 1fr)`,
      pointerEvents: "none", zIndex: 1,
    }}>
      {squares.map((visible, i) => (
        <div key={i} style={{
          border: "1px solid rgba(255,183,125,0.06)",
          opacity: visible ? 0.6 : 0,
          transition: `opacity 600ms ${(i * 137.508) % 400}ms ease`,
          background: visible ? "rgba(255,183,125,0.015)" : "transparent",
        }} />
      ))}
    </div>
  );
}

// ─── Animated Heading ─────────────────────────────────────────────────────────
function AnimatedHeading({ lines, started, highlightWord }: {
  lines: string[];
  started: boolean;
  highlightWord?: string;
}) {
  const charDelay = 28;
  const initialDelay = 180;
  let globalCharIndex = 0;

  return (
    <h1 style={{
      fontSize: "clamp(40px, 5.5vw, 76px)", fontWeight: 400,
      letterSpacing: "-0.04em", lineHeight: 1.1, color: "#fff",
      fontFamily: "'Inter', sans-serif", margin: 0,
    }}>
      {lines.map((line, li) => {
        const words = line.split(" ");
        return (
          <span key={li} style={{ display: "block" }}>
            {words.map((word, wi) => {
              const isHighlight = highlightWord && word === highlightWord;
              const chars = word.split("");
              const rendered = (
                <span key={wi} style={{ display: "inline-block" }}>
                  {chars.map((char) => {
                    const delay = initialDelay + globalCharIndex++ * charDelay;
                    return (
                      <span key={delay} style={{
                        display: "inline-block",
                        opacity: started ? 1 : 0,
                        transform: started ? "translateX(0)" : "translateX(-18px)",
                        transition: `opacity 500ms ${delay}ms ease, transform 500ms ${delay}ms ease`,
                        color: isHighlight ? "#ffb77d" : "inherit",
                        textShadow: isHighlight ? "0 0 40px rgba(255,183,125,0.5)" : "none",
                      }}>
                        {char}
                      </span>
                    );
                  })}
                </span>
              );
              const space = wi < words.length - 1 ? (
                <span key={`sp-${wi}`} style={{ display: "inline-block" }}>
                  {(() => { globalCharIndex++; return "\u00A0"; })()}
                </span>
              ) : null;
              return <span key={wi}>{rendered}{space}</span>;
            })}
          </span>
        );
      })}
    </h1>
  );
}

// ─── FadeIn wrapper ───────────────────────────────────────────────────────────
function FadeIn({ children, delay = 0, duration = 1000 }: { children: React.ReactNode; delay?: number; duration?: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div style={{ opacity: visible ? 1 : 0, transition: `opacity ${duration}ms ease` }}>
      {children}
    </div>
  );
}

// ─── Navbar (desktop + hamburger mobile) ─────────────────────────────────────
function Navbar() {
  const [visible, setVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { mobile } = useBreakpoint();

  useEffect(() => {
    const h = () => setVisible(window.scrollY > window.innerHeight * 0.8);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const navLinks = [["Features", "#features"], ["Use Cases", "/use-cases"], ["Pricing", "#pricing"], ["About", "/about"]];

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, width: "100%", zIndex: 50,
        background: "rgba(13,13,13,0.92)",
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,183,125,0.08)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-100%)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
        pointerEvents: visible ? "auto" : "none",
      }}>
        <div style={{
          maxWidth: 1440, margin: "0 auto",
          padding: mobile ? "0 20px" : "0 48px",
          height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <a href="#" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
            <Image src="/logo/logo.jpeg" alt="Wazelo CRM" width={36} height={36} style={{ height: 36, width: 36, objectFit: "contain", mixBlendMode: "screen" }} />
            <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.04em", color: "#e5e2e1", fontFamily: "'Inter', sans-serif" }}>
              Wazelo <span style={{ color: "#ffb77d" }}>CRM</span>
            </span>
          </a>

          {/* Desktop links */}
          {!mobile && (
            <div style={{ display: "flex", gap: 36, alignItems: "center" }}>
              {navLinks.map(([label, href]) => (
                <a key={label} href={href} style={{
                  fontSize: 13, fontWeight: 500, letterSpacing: "0.02em",
                  textDecoration: "none", color: "rgba(219,194,176,0.75)",
                  fontFamily: "'Inter', sans-serif", transition: "color 0.2s",
                }}
                  onMouseEnter={e => ((e.target as HTMLAnchorElement).style.color = "#e5e2e1")}
                  onMouseLeave={e => ((e.target as HTMLAnchorElement).style.color = "rgba(219,194,176,0.75)")}
                >{label}</a>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {!mobile && (
              <a href={APP_LOGIN_URL} style={{ fontSize: 13, fontWeight: 500, color: "#dbc2b0", background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", textDecoration: "none" }}>
                Sign In
              </a>
            )}
            {!mobile && (
              <a href={APP_REGISTER_URL} style={{
                fontSize: 13, fontWeight: 700, padding: "10px 22px", borderRadius: 100,
                background: "#fff", color: "#131313", border: "none", cursor: "pointer",
                fontFamily: "'Inter', sans-serif", textDecoration: "none", display: "inline-block",
              }}>
                Get Started Free
              </a>
            )}
            {/* Hamburger */}
            {mobile && (
              <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", flexDirection: "column", gap: 5 }}>
                <span style={{ display: "block", width: 22, height: 2, background: menuOpen ? "#ffb77d" : "#e5e2e1", transition: "all 0.3s ease", transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "none" }} />
                <span style={{ display: "block", width: 22, height: 2, background: menuOpen ? "#ffb77d" : "#e5e2e1", transition: "all 0.3s ease", opacity: menuOpen ? 0 : 1 }} />
                <span style={{ display: "block", width: 22, height: 2, background: menuOpen ? "#ffb77d" : "#e5e2e1", transition: "all 0.3s ease", transform: menuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none" }} />
              </button>
            )}
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobile && (
          <div style={{
            maxHeight: menuOpen ? 320 : 0, overflow: "hidden",
            transition: "max-height 0.35s ease",
            background: "rgba(13,13,13,0.98)",
            borderTop: menuOpen ? "1px solid rgba(255,183,125,0.08)" : "none",
          }}>
            <div style={{ padding: "16px 20px 20px", display: "flex", flexDirection: "column", gap: 0 }}>
              {navLinks.map(([label, href]) => (
                <a key={label} href={href} onClick={() => setMenuOpen(false)} style={{
                  padding: "14px 0", fontSize: 16, fontWeight: 500, color: "rgba(219,194,176,0.8)",
                  textDecoration: "none", fontFamily: "'Inter', sans-serif",
                  borderBottom: "1px solid rgba(255,183,125,0.06)",
                }}>{label}</a>
              ))}
              <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                <a href={APP_LOGIN_URL} style={{ flex: 1, fontSize: 14, fontWeight: 500, padding: "12px", borderRadius: 8, background: "none", border: "1px solid rgba(255,183,125,0.2)", color: "#dbc2b0", cursor: "pointer", fontFamily: "'Inter', sans-serif", textDecoration: "none", textAlign: "center" }}>Sign In</a>
                <a href={APP_REGISTER_URL} style={{ flex: 1, fontSize: 14, fontWeight: 700, padding: "12px", borderRadius: 8, background: "#fff", color: "#131313", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", textDecoration: "none", textAlign: "center" }}>Get Started Free</a>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  const [started, setStarted] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const { mobile } = useBreakpoint();

  useEffect(() => { const t = setTimeout(() => setStarted(true), 80); return () => clearTimeout(t); }, []);
  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <section style={{ position: "relative", width: "100%", height: "100vh", minHeight: 600, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <video autoPlay loop muted playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}>
        <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4" type="video/mp4" />
      </video>

      {/* Square grid overlay */}
      <SquareGrid scrollY={scrollY} />

      {/* Floating liquid-glass pill navbar */}
      <div style={{ position: "relative", zIndex: 40, width: "100%", padding: mobile ? "16px 16px 0" : "24px 48px 0", display: "flex", justifyContent: "center" }}>
        <nav className="liquid-glass" style={{
          display: "inline-flex", alignItems: "center", gap: mobile ? 20 : 48,
          padding: mobile ? "8px 16px 8px 20px" : "10px 20px 10px 24px", borderRadius: 100,
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 20px 50px rgba(217,119,6,0.05)",
          width: mobile ? "100%" : "auto", justifyContent: mobile ? "space-between" : "flex-start",
        }}>
          <span style={{ fontSize: mobile ? 16 : 18, fontWeight: 900, letterSpacing: "-0.04em", color: "#e5e2e1", whiteSpace: "nowrap", fontFamily: "'Inter', sans-serif" }}>
            Wazelo
          </span>
          {!mobile && (
            <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
              {[["Features", "#features"], ["Use Cases", "/use-cases"], ["Pricing", "#pricing"], ["About", "/about"]].map(([label, href]) => (
                <a key={label} href={href} style={{ fontSize: 13, fontWeight: 500, color: "rgba(229,226,225,0.7)", textDecoration: "none", letterSpacing: "0.01em", fontFamily: "'Inter', sans-serif", transition: "color 0.2s" }}
                  onMouseEnter={e => ((e.target as HTMLAnchorElement).style.color = "#fff")}
                  onMouseLeave={e => ((e.target as HTMLAnchorElement).style.color = "rgba(229,226,225,0.7)")}
                >{label}</a>
              ))}
            </div>
          )}
          <a href={APP_REGISTER_URL} style={{
            fontSize: 13, fontWeight: 700, padding: mobile ? "8px 18px" : "9px 22px", borderRadius: 100,
            background: "#fff", color: "#131313", border: "none", cursor: "pointer",
            fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap", textDecoration: "none",
          }}>
            Get Started Free
          </a>
        </nav>
      </div>

      {/* Hero content */}
      <div style={{ position: "relative", zIndex: 20, flex: 1, display: "flex", alignItems: "flex-end", padding: mobile ? "0 20px 48px" : "0 48px 64px" }}>
        <div style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: mobile ? "1fr" : "1fr 1fr",
          gap: mobile ? 32 : 48,
          alignItems: "flex-end",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <AnimatedHeading
              lines={["Close every deal", "with Wazelo."]}
              highlightWord="Wazelo."
              started={started}
            />
            <FadeIn delay={1400} duration={800}>
              <p style={{ fontSize: mobile ? 16 : 18, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, margin: 0, fontFamily: "'Inter', sans-serif" }}>
                The WhatsApp CRM built for teams that never stop closing.
              </p>
            </FadeIn>
            <FadeIn delay={1700} duration={800}>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <a href={APP_REGISTER_URL} style={{
                  fontSize: 14, fontWeight: 700, padding: "14px 32px", borderRadius: 8,
                  background: "linear-gradient(135deg, #ffb77d 0%, #d97707 100%)",
                  color: "#4d2600", border: "none", cursor: "pointer",
                  fontFamily: "'Inter', sans-serif",
                  boxShadow: "0 0 40px rgba(255,183,125,0.15)",
                  textDecoration: "none", display: "inline-block",
                }}>
                  Start Free Trial
                </a>
                <a href={APP_LOGIN_URL} className="liquid-glass" style={{ fontSize: 14, fontWeight: 500, padding: "14px 32px", borderRadius: 8, color: "#e5e2e1", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", textDecoration: "none", display: "inline-block" }}>
                  Sign In
                </a>
              </div>
            </FadeIn>
          </div>

          {/* Right tag card — hide on mobile */}
          {!mobile && (
            <div style={{ display: "flex", justifyContent: "flex-end", paddingBottom: 4 }}>
              <FadeIn delay={1200} duration={1000}>
                <div className="liquid-glass" style={{ borderRadius: 16, padding: "20px 32px", display: "inline-block" }}>
                  <p style={{ fontSize: 22, fontWeight: 300, color: "#e5e2e1", letterSpacing: "-0.02em", margin: 0, fontFamily: "'Inter', sans-serif" }}>
                    Inbox. Campaigns. Automation.
                  </p>
                </div>
              </FadeIn>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Marquee ──────────────────────────────────────────────────────────────────
function MarqueeTicker() {
  const items = ["SHARED INBOX", "CAMPAIGNS", "AUTOMATION", "ANALYTICS", "CONTACTS CRM", "CHATBOT BUILDER", "DEALS PIPELINE", "SEQUENCES", "CSAT SURVEYS", "LEAD SCORING", "MULTI-CHANNEL", "DEVELOPER API", "KNOWLEDGE BASE", "SLA TRACKING", "LEAD ADS", "CUSTOM FIELDS"];
  const text = items.map(i => `${i}  ·  `).join("") + items.map(i => `${i}  ·  `).join("");
  return (
    <div style={{ width: "100%", background: "#0e0e0e", overflow: "hidden", padding: "13px 0", borderTop: "1px solid rgba(85,67,54,0.1)", borderBottom: "1px solid rgba(85,67,54,0.1)" }}>
      <span className="font-headline animate-marquee" style={{ display: "inline-block", fontSize: 10, fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase", color: "#d97707", whiteSpace: "nowrap" }}>
        {text}{text}
      </span>
    </div>
  );
}

// ─── Partners / Integrations Carousel ────────────────────────────────────────
function PartnersSection() {
  const { ref, inView } = useInView(0.1);
  const { mobile } = useBreakpoint();
  const logoText = [...partnerLogos, ...partnerLogos].map(l => `${l.name}  ·  `).join("");

  return (
    <section style={{ background: "#0e0e0e", padding: mobile ? "56px 0" : "80px 0", overflow: "hidden" }}>
      <div ref={ref} style={{ maxWidth: 1300, margin: "0 auto", padding: mobile ? "0 20px" : "0 48px", marginBottom: 40 }}>
        <p className="font-body" style={{
          textAlign: "center", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em",
          textTransform: "uppercase", color: "rgba(163,140,124,0.5)", marginBottom: 0,
          opacity: inView ? 1 : 0, transition: "all 0.7s ease",
        }}>
          Works with the tools you already use
        </p>
      </div>
      {/* Scrolling logo strip */}
      <div style={{ width: "100%", overflow: "hidden", padding: "24px 0", borderTop: "1px solid rgba(85,67,54,0.1)", borderBottom: "1px solid rgba(85,67,54,0.1)" }}>
        <span className="font-headline animate-marquee" style={{
          display: "inline-block", fontSize: 13, fontWeight: 700,
          letterSpacing: "0.25em", textTransform: "uppercase",
          color: "rgba(163,140,124,0.35)", whiteSpace: "nowrap",
        }}>
          {logoText}{logoText}
        </span>
      </div>
    </section>
  );
}

// ─── Feature Card (extracted to satisfy Rules of Hooks) ──────────────────────
function FeatureCard({ f, i, mobile }: { f: typeof features[0]; i: number; mobile: boolean }) {
  const { ref, inView } = useInView(0.1);
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(32px)",
      transition: `all 0.7s ${i * 0.08}s ease`,
    }}>
      <a href={f.href} className="feature-card" style={{
        background: "#2a2a2a", borderRadius: 8, padding: mobile ? "24px 24px" : "32px 36px",
        border: "1px solid rgba(255,255,255,0.05)", cursor: "pointer",
        textDecoration: "none", display: "block",
      }}>
        <div className="card-icon" style={{
          width: 48, height: 48, background: "#0e0e0e", borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 20, color: "#ffb77d",
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>{f.icon}</span>
        </div>
        <h3 className="font-headline" style={{ fontSize: 19, fontWeight: 700, color: "#e5e2e1", marginBottom: 10, letterSpacing: "-0.025em" }}>{f.title}</h3>
        <p className="font-body" style={{ fontSize: 14, color: "#dbc2b0", lineHeight: 1.7 }}>{f.desc}</p>
        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 4, color: "#ffb77d", fontSize: 12, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
          Learn more <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
        </div>
      </a>
    </div>
  );
}

// ─── AI Chat Section ──────────────────────────────────────────────────────────
function AiChatSection() {
  const { ref, inView } = useInView(0.1);
  const { mobile, tablet } = useBreakpoint();

  const chips = ["GPT-powered replies", "Lead qualification", "Agent handoff", "24/7 automation"];

  return (
    <section style={{ background: "#0e0e0e", padding: mobile ? "64px 20px" : tablet ? "80px 32px" : "100px 48px" }}>
      <div style={{ maxWidth: 1300, margin: "0 auto" }}>

        {/* Header row */}
        <div ref={ref} style={{
          display: "flex", flexDirection: mobile ? "column" : "row",
          alignItems: mobile ? "flex-start" : "flex-end",
          justifyContent: "space-between", gap: 24, marginBottom: mobile ? 32 : 48,
        }}>
          <div>
            <span className="font-body" style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase",
              color: "#ffb77d", display: "inline-block",
              borderBottom: "1px solid rgba(255,183,125,0.3)", paddingBottom: 6, marginBottom: 20,
              opacity: inView ? 1 : 0, transition: "all 0.7s ease",
            }}>AI-POWERED CONVERSATIONS</span>
            <h2 className="font-headline" style={{
              fontSize: mobile ? "clamp(36px,10vw,56px)" : "clamp(44px,5vw,80px)",
              fontWeight: 900, lineHeight: 0.9, letterSpacing: "-0.045em",
              textTransform: "uppercase", color: "#e5e2e1", margin: 0,
              opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(28px)",
              transition: "all 0.8s 0.1s ease",
            }}>
              CHAT SMARTER.{"\n"}<span style={{ background: "linear-gradient(135deg,#ffb77d,#d97707)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>CLOSE FASTER.</span>
            </h2>
          </div>
          <div style={{ maxWidth: 380, opacity: inView ? 1 : 0, transition: "all 0.8s 0.25s ease" }}>
            <p className="font-body" style={{ fontSize: 16, lineHeight: 1.7, color: "#dbc2b0", fontWeight: 300, margin: "0 0 20px" }}>
              Build AI chatbot flows that qualify leads, answer FAQs, and hand off to agents — all on WhatsApp. No code. Live in minutes.
            </p>
            <a href="/features/chatbot" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              color: "#ffb77d", fontWeight: 700, fontSize: 12,
              textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase",
            }}>
              <span className="font-body">Explore AI Chatbot</span>
              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>arrow_right_alt</span>
            </a>
          </div>
        </div>

        {/* Main card */}
        <div style={{
          position: "relative",
          opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(40px)",
          transition: "all 0.9s 0.3s ease",
        }}>
          {/* Glow */}
          <div className="animate-glow" style={{
            position: "absolute", inset: 0,
            background: "rgba(217,119,6,0.07)", filter: "blur(80px)",
            borderRadius: 12, transform: "translateY(24px)", pointerEvents: "none",
          }} />

          <div style={{
            position: "relative",
            background: "#1c1b1b",
            borderTop: "2px solid #ffb77d",
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 40px 100px rgba(0,0,0,0.6)",
          }}>
            {/* Top bar with chips */}
            <div style={{
              padding: mobile ? "16px 20px" : "20px 32px",
              borderBottom: "1px solid rgba(85,67,54,0.2)",
              display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#ffb77d" }}>smart_toy</span>
              <span className="font-body" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#dbc2b0" }}>AI Chatbot Builder</span>
              <div style={{ flex: 1 }} />
              {!mobile && chips.map(c => (
                <span key={c} className="font-body" style={{
                  fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
                  color: "rgba(255,183,125,0.7)", padding: "4px 10px",
                  border: "1px solid rgba(255,183,125,0.15)", borderRadius: 100,
                }}>{c}</span>
              ))}
            </div>

            {/* Screenshot */}
            <div style={{ position: "relative", lineHeight: 0 }}>
              <Image
                src="/screens/06-chatbot-builder.png"
                alt="AI Chatbot Builder"
                width={1440}
                height={900}
                style={{ width: "100%", height: "auto", display: "block", maxHeight: mobile ? 260 : 520, objectFit: "cover", objectPosition: "top" }}
              />
              {/* Bottom gradient overlay */}
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0, height: "50%",
                background: "linear-gradient(to bottom, transparent, #1c1b1b)",
                pointerEvents: "none",
              }} />
            </div>

            {/* Bottom stat strip */}
            <div style={{
              padding: mobile ? "20px" : "28px 32px",
              display: "grid",
              gridTemplateColumns: mobile ? "repeat(2,1fr)" : "repeat(4,1fr)",
              gap: mobile ? 16 : 0,
              borderTop: "1px solid rgba(85,67,54,0.15)",
            }}>
              {[
                { val: "3 min", label: "Avg setup time" },
                { val: "68%", label: "Leads auto-qualified" },
                { val: "24/7", label: "Always on" },
                { val: "0 code", label: "No dev needed" },
              ].map((s, i) => (
                <div key={s.label} style={{
                  textAlign: "center",
                  borderRight: (!mobile && i < 3) ? "1px solid rgba(85,67,54,0.2)" : "none",
                  padding: mobile ? 0 : "0 24px",
                }}>
                  <div className="font-headline" style={{ fontSize: mobile ? 28 : 36, fontWeight: 900, letterSpacing: "-0.04em", color: "#ffb77d", lineHeight: 1 }}>{s.val}</div>
                  <div className="font-body" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(163,140,124,0.7)", marginTop: 6 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────
function FeaturesSection() {
  const { ref, inView } = useInView(0.1);
  const { mobile, tablet } = useBreakpoint();

  return (
    <section id="features" style={{ background: "#131313", padding: mobile ? "72px 20px" : tablet ? "88px 32px" : "112px 48px" }}>
      <div style={{ maxWidth: 1300, margin: "0 auto" }}>
        {/* SVG Divider top */}
        <SvgDivider inView={inView} />
        {/* <div style={{ height: 64 }} /> */}

        {/* Header */}
        <div ref={ref} style={{ marginBottom: mobile ? 48 : 80, maxWidth: 680 }}>
          <span className="font-headline" style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase",
            color: "#ffb77d", display: "block", marginBottom: 18,
            opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.7s ease",
          }}>EVERYTHING YOU NEED</span>
          <h2 className="font-headline" style={{
            fontSize: mobile ? "clamp(36px,10vw,56px)" : "clamp(44px,5.5vw,80px)",
            fontWeight: 900, lineHeight: 0.9,
            letterSpacing: "-0.045em", textTransform: "uppercase", color: "#e5e2e1", marginBottom: 28,
            opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(28px)",
            transition: "all 0.8s 0.1s ease",
          }}>
            ONE PLATFORM.<br />EVERY WHATSAPP<br />USE CASE.
          </h2>
          <p className="font-body" style={{
            fontSize: 17, lineHeight: 1.7, color: "#dbc2b0", fontWeight: 300, maxWidth: 500,
            opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.8s 0.2s ease",
          }}>
            From solo sales reps to enterprise teams — Wazelo CRM scales with your business.
          </p>
        </div>

        {/* Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: mobile ? "1fr" : tablet ? "repeat(2,1fr)" : "repeat(3,1fr)",
          gap: mobile ? 16 : 20,
        }}>
          {features.map((f, i) => (
            <FeatureCard key={f.title} f={f} i={i} mobile={mobile} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Scroll Sequence Section ──────────────────────────────────────────────────
// Frame filenames in order (gaps 008–011 are missing)
const SEQUENCE_FRAMES = [
  ...Array.from({ length: 7 },  (_, i) => `ezgif-frame-${String(i + 1).padStart(3, "0")}.jpg`),
  ...Array.from({ length: 29 }, (_, i) => `ezgif-frame-${String(i + 12).padStart(3, "0")}.jpg`),
];
const FRAME_COUNT = SEQUENCE_FRAMES.length; // 36

function ScrollSequenceSection() {
  const outerRef  = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameRef  = useRef(0);
  const rafRef    = useRef<number>(0);
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const { mobile } = useBreakpoint();

  // Preload all frames
  useEffect(() => {
    let done = 0;
    const imgs: HTMLImageElement[] = SEQUENCE_FRAMES.map((name) => {
      const img = new window.Image();
      img.src = `/scroll-sequence/${name}`;
      img.onload = () => { done++; if (done === FRAME_COUNT) setLoaded(true); };
      img.onerror = () => { done++; if (done === FRAME_COUNT) setLoaded(true); };
      return img;
    });
    imagesRef.current = imgs;
  }, []);

  // Draw frame to canvas
  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const img = imagesRef.current[index];
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Fit image to canvas preserving aspect ratio (cover)
    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  }, []);

  // RAF loop — read scroll, advance frame, draw
  useEffect(() => {
    const tick = () => {
      const outer = outerRef.current;
      if (outer) {
        const rect = outer.getBoundingClientRect();
        const totalScroll = outer.offsetHeight - window.innerHeight;
        const scrolled = Math.max(0, -rect.top);
        const p = Math.min(1, Math.max(0, scrolled / totalScroll));
        setProgress(p);
        const newFrame = Math.min(FRAME_COUNT - 1, Math.round(p * (FRAME_COUNT - 1)));
        if (newFrame !== frameRef.current || p === 0) {
          frameRef.current = newFrame;
          drawFrame(newFrame);
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [drawFrame]);

  // Redraw when images finish loading
  useEffect(() => {
    if (loaded) drawFrame(frameRef.current);
  }, [loaded, drawFrame]);

  // Mobile fallback — just show first frame as img
  if (mobile) {
    return (
      <section style={{ background: "#0d0d0d", padding: "64px 20px", textAlign: "center" }}>
        <span className="font-body" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#ffb77d", display: "block", marginBottom: 16 }}>PLATFORM WALKTHROUGH</span>
        <h2 className="font-headline" style={{ fontSize: "clamp(32px,9vw,52px)", fontWeight: 900, lineHeight: 0.92, letterSpacing: "-0.045em", textTransform: "uppercase", color: "#e5e2e1", marginBottom: 32 }}>
          SEE IT IN ACTION.
        </h2>
        <Image src={`/scroll-sequence/${SEQUENCE_FRAMES[0]}`} alt="Wazelo CRM walkthrough" width={760} height={475} style={{ width: "100%", height: "auto", borderRadius: 8, border: "1px solid rgba(85,67,54,0.2)" }} />
      </section>
    );
  }

  // Desktop — sticky canvas scroll sequence
  return (
    <div
      ref={outerRef}
      style={{ height: "350vh", position: "relative", background: "#0d0d0d" }}
    >
      <div style={{
        position: "sticky", top: 0, height: "100vh",
        overflow: "hidden", background: "#0d0d0d",
      }}>
        {/* Header — slides out as you scroll past 60% */}
        <div style={{
          position: "absolute", top: "8%", left: "5%", zIndex: 30,
          opacity: progress < 0.7 ? 1 - progress / 0.7 : 0,
          transform: `translateX(${-progress * 120}px)`,
          transition: "none",
          pointerEvents: "none",
        }}>
          <span className="font-body" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#ffb77d", display: "block", marginBottom: 14 }}>
            PLATFORM WALKTHROUGH
          </span>
          <h2 className="font-headline" style={{
            fontSize: "clamp(36px,4.5vw,64px)", fontWeight: 900, lineHeight: 0.9,
            letterSpacing: "-0.045em", textTransform: "uppercase", color: "#e5e2e1",
            maxWidth: 520,
          }}>
            SEE WAZELO<br />
            <span style={{ color: "#ffb77d" }}>IN ACTION.</span>
          </h2>
        </div>

        {/* Canvas — full bleed, cover fit */}
        <canvas
          ref={canvasRef}
          width={1920}
          height={1080}
          aria-label="Wazelo CRM platform walkthrough animation"
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover",
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.6s ease",
          }}
        />

        {/* Dark overlay gradient — top and bottom */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 20,
          background: "linear-gradient(to bottom, rgba(13,13,13,0.55) 0%, transparent 25%, transparent 75%, rgba(13,13,13,0.7) 100%)",
        }} />

        {/* Loading skeleton */}
        {!loaded && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 25 }}>
            <span className="font-body" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(163,140,124,0.4)" }}>
              LOADING...
            </span>
          </div>
        )}

        {/* Bottom progress bar */}
        <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: 2, background: "rgba(85,67,54,0.15)", zIndex: 30 }}>
          <div style={{
            height: "100%",
            width: `${progress * 100}%`,
            background: "linear-gradient(90deg, #ffb77d, #d97707)",
          }} />
        </div>

        {/* Frame counter — bottom right */}
        <div style={{ position: "absolute", bottom: 20, right: 48, zIndex: 30 }}>
          <span className="font-body" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(163,140,124,0.45)" }}>
            {String(Math.min(FRAME_COUNT - 1, Math.round(progress * (FRAME_COUNT - 1))) + 1).padStart(2, "0")} / {String(FRAME_COUNT).padStart(2, "0")}
          </span>
        </div>

        {/* Scroll hint — bottom center, fades out */}
        <div style={{
          position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)",
          zIndex: 30, display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          opacity: progress < 0.08 ? 1 : 0,
          transition: "opacity 0.4s ease",
          pointerEvents: "none",
        }}>
          <span className="font-body" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,183,125,0.6)" }}>SCROLL</span>
          <div style={{ width: 1, height: 32, background: "linear-gradient(to bottom, rgba(255,183,125,0.6), transparent)" }} />
        </div>
      </div>
    </div>
  );
}



// ─── Feature Scroll Section (scroll-driven interactive) ──────────────────────
const featureReveals = [
  {
    id: "inbox",
    tag: "Shared Inbox",
    title: "YOUR WHOLE TEAM.\nONE INBOX.",
    desc: "Every WhatsApp conversation, routed to the right agent. Assign, transfer, resolve — at scale. No lead slips through.",
    img: "/screens/01-inbox-shared-team.jpeg",
    watermark: "INBOX",
    href: "/features/shared-inbox",
  },
  {
    id: "campaigns",
    tag: "Bulk Campaigns",
    title: "REACH THOUSANDS.\nONE CLICK.",
    desc: "Schedule and send personalised WhatsApp broadcasts to segmented lists. Real-time delivery tracking, retry logic, and CSAT follow-ups built in.",
    img: "/screens/02-campaigns-broadcast.png",
    watermark: "CAMPAIGNS",
    href: "/features/campaigns",
  },
  {
    id: "automation",
    tag: "Automation",
    title: "BUILD FLOWS.\nNOT BUSYWORK.",
    desc: "Visual workflow builder for follow-up sequences, lead qualification, and routing — no code required. Runs 24/7 so your team doesn't have to.",
    img: "/screens/03-automation-workflow.png",
    watermark: "AUTOMATE",
    href: "/features/automation",
  },
  {
    id: "analytics",
    tag: "Analytics",
    title: "DATA THAT\nDRIVES DEALS.",
    desc: "Track response times, delivery rates, agent performance, and CSAT scores. Export reports or pipe to your BI tool via API.",
    img: "/screens/04-analytics-dashboard.png",
    watermark: "ANALYTICS",
    href: "/features/analytics",
  },
  {
    id: "deals",
    tag: "Deals Pipeline",
    title: "TRACK EVERY\nDEAL. ALWAYS.",
    desc: "Full CRM pipeline for WhatsApp-driven sales. Move deals through stages, set values, assign owners, and forecast revenue — without leaving the platform.",
    img: "/screens/10-deals-pipeline.png",
    watermark: "DEALS",
    href: "/features/deals",
  },
  {
    id: "sequences",
    tag: "Sequences",
    title: "DRIP ON\nAUTOPILOT.",
    desc: "Build multi-step WhatsApp drip sequences. Enrol contacts automatically, space messages by days or hours, and stop the moment they reply.",
    img: "/screens/11-sequences-drip.png",
    watermark: "DRIP",
    href: "/features/sequences",
  },
];

// Single pinned feature panel — each gets its own 200vh scroll budget
function FeaturePin({ feat, reverse }: { feat: typeof featureReveals[0]; reverse: boolean }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const rafRef   = useRef<number>(0);
  const [p, setP] = useState(0); // 0→1 through this panel's scroll range
  const { mobile, tablet } = useBreakpoint();

  useEffect(() => {
    const tick = () => {
      const el = outerRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const total = el.offsetHeight - window.innerHeight;
        const scrolled = Math.max(0, -rect.top);
        setP(Math.min(1, Math.max(0, scrolled / total)));
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Smooth easing
  const ease = (v: number) => v < 0.5 ? 2*v*v : -1+(4-2*v)*v;

  // Phase 0→0.5: content enters (clip-path wipe + slide)
  // Phase 0.5→1: fully visible hold — NO exit fade (next panel overlays seamlessly)
  const enterP  = Math.min(1, p / 0.5);
  const entered = ease(enterP);

  // Image panel: clips in from the outer edge
  const imgClip = reverse
    ? `inset(0 ${(1 - entered) * 100}% 0 0)`
    : `inset(0 0 0 ${(1 - entered) * 100}%)`;

  // Text: slides in from opposite side, fully opaque once entered
  const textSlide = reverse
    ? (1 - entered) * 60
    : -(1 - entered) * 60;


  if (mobile || tablet) {
    return (
      <section style={{ background: "#131313", padding: mobile ? "72px 20px" : "80px 32px", position: "relative", overflow: "hidden" }}>
        <div className="font-headline" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: mobile ? "22vw" : "15vw", fontWeight: 900, color: "rgba(255,255,255,0.014)", letterSpacing: "-0.04em", pointerEvents: "none", userSelect: "none", whiteSpace: "nowrap" }}>{feat.watermark}</div>
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <span style={{ width: 28, height: 2, background: "#ffb77d", display: "inline-block" }} />
            <span className="font-body" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#ffb77d" }}>{feat.tag}</span>
          </div>
          <h2 className="font-headline" style={{ fontSize: "clamp(30px,8vw,48px)", fontWeight: 900, lineHeight: 0.92, letterSpacing: "-0.045em", textTransform: "uppercase", color: "#e5e2e1", marginBottom: 18, whiteSpace: "pre-line" }}>{feat.title}</h2>
          <p className="font-body" style={{ fontSize: 14, color: "#dbc2b0", lineHeight: 1.75, marginBottom: 28, maxWidth: 480 }}>{feat.desc}</p>
          <a href={feat.href} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", padding: "12px 24px", borderRadius: 6, background: "#2a2a2a", textDecoration: "none", color: "#dbc2b0", border: "1px solid rgba(85,67,54,0.3)" }}>
            Learn More <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_right_alt</span>
          </a>
          <div style={{ marginTop: 36, borderRadius: 10, border: "1px solid rgba(85,67,54,0.2)", overflow: "hidden", background: "#201f1f" }}>
            <div style={{ height: 28, background: "#0e0e0e", display: "flex", alignItems: "center", padding: "0 12px", gap: 6 }}>
              {[0,1,2].map(i => <span key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#353534", display: "inline-block" }} />)}
            </div>
            <Image src={feat.img} alt={feat.tag} width={760} height={475} style={{ width: "100%", height: "auto", display: "block" }} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <div ref={outerRef} style={{ height: "150vh", position: "relative" }}>
      <div style={{
        position: "sticky", top: 0, height: "100vh", overflow: "hidden",
        background: "#0f0f0f",
        display: "flex", flexDirection: reverse ? "row-reverse" : "row",
      }}>
        {/* ── Left / right: text half ───────────────────── */}
        <div style={{
          flex: "0 0 45%", display: "flex", alignItems: "center",
          padding: reverse ? "0 5% 0 7%" : "0 7% 0 9%",
          position: "relative", zIndex: 10,
          opacity: entered,
          transform: `translateX(${textSlide}px)`,
          transition: "none",
        }}>
          {/* Watermark behind text */}
          <div className="font-headline" style={{
            position: "absolute", bottom: "8%", left: reverse ? "auto" : "5%", right: reverse ? "5%" : "auto",
            fontSize: "11vw", fontWeight: 900, color: "rgba(255,255,255,0.022)",
            letterSpacing: "-0.04em", pointerEvents: "none", userSelect: "none", whiteSpace: "nowrap",
            lineHeight: 1,
          }}>{feat.watermark}</div>

          <div style={{ position: "relative" }}>
            {/* Step number */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
              <span style={{ width: 36, height: 2, background: "linear-gradient(to right, #ffb77d, #d97707)", display: "inline-block" }} />
              <span className="font-body" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#ffb77d" }}>{feat.tag}</span>
            </div>

            <h2 className="font-headline" style={{
              fontSize: "clamp(38px,4vw,64px)", fontWeight: 900, lineHeight: 0.88,
              letterSpacing: "-0.045em", textTransform: "uppercase", color: "#e5e2e1",
              marginBottom: 24, whiteSpace: "pre-line",
            }}>{feat.title}</h2>

            <p className="font-body" style={{
              fontSize: 15, color: "rgba(219,194,176,0.75)", lineHeight: 1.85,
              maxWidth: 380, marginBottom: 40,
            }}>{feat.desc}</p>

            <a href={feat.href} style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
              padding: "13px 28px", borderRadius: 6,
              background: "transparent",
              textDecoration: "none", color: "#dbc2b0",
              border: "1px solid rgba(85,67,54,0.4)",
              transition: "all 0.2s",
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,183,125,0.5)";
                (e.currentTarget as HTMLAnchorElement).style.color = "#ffb77d";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(85,67,54,0.4)";
                (e.currentTarget as HTMLAnchorElement).style.color = "#dbc2b0";
              }}
            >
              Explore {feat.tag}
              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>arrow_right_alt</span>
            </a>
          </div>
        </div>

        {/* ── Right / left: screenshot half ─────────────── */}
        <div style={{
          flex: "0 0 55%", position: "relative", overflow: "hidden",
        }}>
          {/* Clip-path wipe reveal */}
          <div style={{
            position: "absolute", inset: 0,
            clipPath: imgClip,
            transition: "none",
          }}>
            {/* Subtle gradient fade on inner edge */}
            <div style={{
              position: "absolute", inset: 0, zIndex: 5, pointerEvents: "none",
              background: reverse
                ? "linear-gradient(to right, #0f0f0f 0%, transparent 12%)"
                : "linear-gradient(to left, #0f0f0f 0%, transparent 12%)",
            }} />
            {/* Glow */}
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "60%", height: "50%", background: "rgba(217,119,6,0.1)", filter: "blur(100px)", borderRadius: "50%", pointerEvents: "none", zIndex: 4 }} />
            {/* Screenshot */}
            <div style={{
              position: "absolute",
              top: "50%", left: "4%", right: "4%",
              transform: "translateY(-50%)",
              borderRadius: 12, overflow: "hidden",
              border: "1px solid rgba(85,67,54,0.2)",
              background: "#1a1a1a",
              boxShadow: "0 48px 120px -20px rgba(0,0,0,0.7)",
            }}>
              {/* Fake browser bar */}
              <div style={{ height: 34, background: "#111", display: "flex", alignItems: "center", padding: "0 14px", gap: 7, borderBottom: "1px solid rgba(85,67,54,0.12)", flexShrink: 0 }}>
                {[0,1,2].map(i => <span key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: i === 0 ? "#ff5f57" : i === 1 ? "#febc2e" : "#28c840", display: "inline-block" }} />)}
                <div style={{ flex: 1, height: 18, background: "#1c1b1b", borderRadius: 3, marginLeft: 12, maxWidth: 240 }} />
              </div>
              <Image src={feat.img} alt={feat.tag} width={960} height={600} style={{ width: "100%", height: "auto", display: "block" }} />
            </div>
          </div>
        </div>

        {/* Scroll indicator — fades out once scrolling starts */}
        <div style={{
          position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)",
          zIndex: 30, display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          opacity: p < 0.06 ? 0.5 : 0, transition: "opacity 0.5s", pointerEvents: "none",
        }}>
          <span className="font-body" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: "#ffb77d" }}>SCROLL</span>
          <div style={{ width: 1, height: 32, background: "linear-gradient(to bottom,#ffb77d,transparent)" }} />
        </div>
      </div>
    </div>
  );
}

function FeatureScrollSection() {
  return (
    <>
      {featureReveals.map((feat, i) => (
        <FeaturePin key={feat.id} feat={feat} reverse={i % 2 === 1} />
      ))}
    </>
  );
}

// ─── AI Features Section (real product UI) ───────────────────────────────────

// ─── AI Inbox Mockup ─────────────────────────────────────────────────────────
// Renders a faithful pixel-for-pixel recreation of the actual product inbox
// showing all three AI components exactly as they appear in the real app:
//   1. ConversationSummaryPanel (top, on-demand)
//   2. AiInsightPanel (below messages, always-on)
//   3. AiReplySuggestions (chip bar above input)

type InboxTab = "summary" | "insights" | "replies";

function InboxMockup({ activeTab, inView }: { activeTab: InboxTab; inView: boolean }) {
  const [summaryVisible, setSummaryVisible] = useState(false);
  const [insightExpanded, setInsightExpanded] = useState(true);
  const [kbOpen, setKbOpen] = useState(false);
  const [typed, setTyped] = useState("");

  // Reset state when tab switches
  useEffect(() => {
    setSummaryVisible(false);
    setInsightExpanded(true);
    setKbOpen(false);
    setTyped("");
  }, [activeTab]);

  // Animate summary open for summary tab
  useEffect(() => {
    if (activeTab !== "summary" || !inView) return;
    const t = setTimeout(() => setSummaryVisible(true), 600);
    return () => clearTimeout(t);
  }, [activeTab, inView]);

  // Animate KB open for insights tab
  useEffect(() => {
    if (activeTab !== "insights" || !inView) return;
    const t = setTimeout(() => setKbOpen(true), 1200);
    return () => clearTimeout(t);
  }, [activeTab, inView]);

  // Animate typing for replies tab
  const replyText = "Hi Priya! Your refund for order #WZ-29831 has been approved and will be credited within 5–7 business days.";
  useEffect(() => {
    if (activeTab !== "replies" || !inView) return;
    let i = 0;
    setTyped("");
    const t = setInterval(() => {
      i++;
      setTyped(replyText.slice(0, i));
      if (i >= replyText.length) clearInterval(t);
    }, 22);
    return () => clearInterval(t);
  }, [activeTab, inView]);

  const messages = [
    { from: "contact", text: "Hi, I placed order #WZ-29831 last week and haven't received it yet. I need help.", time: "10:42 AM" },
    { from: "agent",   text: "Hi Priya! Let me look into this for you right away. Can you confirm the delivery address?", time: "10:44 AM" },
    { from: "contact", text: "Yes, it's 14 MG Road, Bengaluru. I've been waiting 8 days now.", time: "10:45 AM" },
    { from: "agent",   text: "I can see the shipment got delayed at our Bengaluru warehouse. I've escalated this.", time: "10:47 AM" },
    { from: "contact", text: "This is really frustrating. I'd like a refund please.", time: "10:49 AM" },
  ];

  // Color vars matching the real product's design tokens
  const primary    = "#6366f1";   // Indigo primary
  const surface    = "#1e1e2e";   // Surface
  const surfaceHigh= "#262637";
  const outline    = "rgba(255,255,255,0.08)";
  const textPrimary= "#e2e8f0";
  const textMuted  = "rgba(148,163,184,0.7)";
  const success    = "#22c55e";
  const warning    = "#f59e0b";
  const error      = "#ef4444";
  const info       = "#3b82f6";

  return (
    <div style={{
      background: surface, borderRadius: 12, overflow: "hidden",
      border: `1px solid ${outline}`,
      display: "flex", flexDirection: "column",
      height: 540, fontFamily: "'Inter', sans-serif",
      boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
    }}>
      {/* Chat header */}
      <div style={{
        height: 52, background: surfaceHigh,
        borderBottom: `1px solid ${outline}`,
        display: "flex", alignItems: "center", padding: "0 16px", gap: 10, flexShrink: 0,
      }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff" }}>P</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>Priya Sharma</div>
          <div style={{ fontSize: 10, color: textMuted }}>+91 98765 43210 · last seen 2 min ago</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          {/* Summarize button */}
          <button
            onClick={() => setSummaryVisible(v => !v)}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "5px 10px", borderRadius: 6, border: `1px solid ${outline}`,
              background: summaryVisible ? `${primary}22` : "transparent",
              color: summaryVisible ? primary : textMuted,
              fontSize: 11, fontWeight: 500, cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <span style={{ fontSize: 12 }}>✨</span> Summarize
          </button>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: success }} />
          <span style={{ fontSize: 11, color: textMuted }}>Kavya R.</span>
        </div>
      </div>

      {/* Summary panel */}
      <div style={{
        maxHeight: summaryVisible ? 120 : 0, overflow: "hidden",
        transition: "max-height 0.4s cubic-bezier(0.16,1,0.3,1)",
        flexShrink: 0,
      }}>
        <div style={{ margin: "10px 12px 0", padding: "10px 12px", background: `${primary}0d`, border: `1px solid ${primary}22`, borderRadius: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12 }}>✨</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: primary }}>AI Summary</span>
            </div>
            <button onClick={() => setSummaryVisible(false)} style={{ background: "none", border: "none", color: textMuted, cursor: "pointer", fontSize: 14, lineHeight: 1 }}>×</button>
          </div>
          <p style={{ fontSize: 12, color: textPrimary, lineHeight: 1.6, margin: 0 }}>
            Customer reporting non-delivery of order #WZ-29831 placed 8 days ago. Requesting refund after warehouse escalation confirmed delay. Sentiment has shifted from frustrated to urgent.
          </p>
          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            {["↘ NEGATIVE", "refund", "delivery-delay", "escalated"].map((tag, i) => (
              <span key={i} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: i === 0 ? `${warning}18` : `${primary}12`, color: i === 0 ? warning : `${primary}cc`, border: `1px solid ${i === 0 ? warning + "30" : primary + "25"}` }}>{tag}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10, scrollbarWidth: "none" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.from === "agent" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "72%", padding: "8px 11px", borderRadius: m.from === "agent" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
              background: m.from === "agent" ? primary : surfaceHigh,
              fontSize: 12, color: m.from === "agent" ? "#fff" : textPrimary, lineHeight: 1.55,
            }}>{m.text}</div>
            <span style={{ fontSize: 9, color: textMuted, marginTop: 3, paddingLeft: 2, paddingRight: 2 }}>{m.time}</span>
          </div>
        ))}
      </div>

      {/* AI Insights Panel */}
      <div style={{ borderTop: `1px solid ${outline}`, background: `${surfaceHigh}88`, flexShrink: 0 }}>
        <button
          onClick={() => setInsightExpanded(v => !v)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            width: "100%", padding: "7px 14px",
            background: "none", border: "none", cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 13 }}>🧠</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: primary }}>AI Insights</span>
            <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 3, background: `${error}20`, color: error, border: `1px solid ${error}35` }}>URGENT</span>
          </div>
          <span style={{ fontSize: 12, color: textMuted }}>{insightExpanded ? "⌃" : "⌄"}</span>
        </button>

        <div style={{
          maxHeight: insightExpanded ? 300 : 0,
          overflow: "hidden",
          transition: "max-height 0.35s cubic-bezier(0.16,1,0.3,1)",
        }}>
          <div style={{ padding: "0 14px 10px", display: "flex", flexDirection: "column", gap: 8 }}>

            {/* Sentiment row */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 8px", borderRadius: 6, background: `${warning}15` }}>
                <span style={{ fontSize: 11 }}>🙁</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: warning }}>Negative</span>
                <span style={{ fontSize: 9, color: textMuted }}>87%</span>
              </div>
              <span style={{ fontSize: 10, color: textMuted }}>Frustrated about delivery delay and requesting refund</span>
            </div>

            {/* Intent row */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11 }}>🎯</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: textPrimary }}>Refund Request</span>
              <span style={{ fontSize: 9, color: textMuted }}>→ order_status_query</span>
              <span style={{ fontSize: 9, fontWeight: 600, padding: "1px 7px", borderRadius: 3, background: `${info}15`, color: info, border: `1px solid ${info}25` }}>
                ↗ Escalate
              </span>
            </div>

            {/* Entities */}
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {[["order_id","WZ-29831"],["days","8"],["location","Bengaluru"]].map(([k,v]) => (
                <span key={k} style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: "rgba(255,255,255,0.05)", color: textMuted }}>
                  <span style={{ fontWeight: 600 }}>{k}:</span> {v}
                </span>
              ))}
            </div>

            {/* Labels + priority */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11 }}>🏷</span>
              {["refund","logistics","e-commerce"].map(t => (
                <span key={t} style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, background: "rgba(255,255,255,0.06)", color: textMuted }}>{t}</span>
              ))}
              <button style={{ fontSize: 9, color: primary, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Apply</button>
              <span style={{ marginLeft: 4, fontSize: 9, fontWeight: 600, padding: "1px 6px", borderRadius: 3, background: `${warning}18`, color: warning, border: `1px solid ${warning}28` }}>HIGH priority</span>
              <span style={{ fontSize: 9, color: textMuted }}>EN-IN</span>
            </div>

            {/* KB toggle */}
            <div style={{ borderTop: `1px solid ${outline}`, paddingTop: 7, display: "flex", alignItems: "flex-start", flexDirection: "column", gap: 6 }}>
              <button onClick={() => setKbOpen(v => !v)} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: primary, background: "none", border: "none", cursor: "pointer" }}>
                <span>📖</span> {kbOpen ? "Hide KB Suggestions" : "Find KB Articles"}
              </button>
              <div style={{
                maxHeight: kbOpen ? 120 : 0, overflow: "hidden",
                transition: "max-height 0.35s ease",
                width: "100%",
              }}>
                <div style={{ padding: "8px 10px", background: `${primary}0a`, border: `1px solid ${primary}18`, borderRadius: 8 }}>
                  <p style={{ fontSize: 10, color: textPrimary, lineHeight: 1.6, margin: "0 0 6px" }}>
                    For orders marked as undelivered after 7 business days, customers are eligible for a full refund or free re-shipment within 5–7 working days.
                  </p>
                  <div style={{ display: "flex", gap: 5 }}>
                    {["📄 refund-policy.md", "📄 shipping-sla.md"].map(s => (
                      <span key={s} style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, background: `${primary}10`, color: `${primary}bb` }}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Reply chips */}
      <div style={{
        borderTop: `1px solid ${outline}`, background: `${surfaceHigh}55`,
        padding: "6px 12px", display: "flex", gap: 6, overflowX: "auto",
        alignItems: "center", flexShrink: 0, scrollbarWidth: "none",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          <span style={{ fontSize: 12 }}>✨</span>
          <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", color: `${primary}80`, textTransform: "uppercase" }}>AI</span>
        </div>
        {[
          "Refunds are processed in 5–7 business days.",
          "I've flagged order #WZ-29831 for priority review.",
          "Would you prefer a refund or re-shipment?",
        ].map((r, i) => (
          <button key={i} onClick={() => setTyped(r)} style={{
            flexShrink: 0, padding: "4px 10px", borderRadius: 100,
            background: `${primary}0d`, border: `1px solid ${primary}20`,
            fontSize: 11, color: textPrimary, cursor: "pointer",
            whiteSpace: "nowrap", transition: "all 0.15s ease",
          }}>
            {r.length > 50 ? r.slice(0, 47) + "…" : r}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div style={{
        height: 46, background: surfaceHigh, borderTop: `1px solid ${outline}`,
        display: "flex", alignItems: "center", padding: "0 12px", gap: 10, flexShrink: 0,
      }}>
        <div style={{
          flex: 1, height: 30, background: "rgba(255,255,255,0.05)", borderRadius: 8,
          border: `1px solid ${outline}`, padding: "0 10px",
          display: "flex", alignItems: "center",
          fontSize: 11, color: typed ? textPrimary : textMuted,
          overflow: "hidden",
        }}>
          {typed || "Type a message..."}
          {activeTab === "replies" && typed && typed.length < replyText.length && (
            <span style={{ display: "inline-block", width: 6, height: 11, background: primary, marginLeft: 1, animation: "cursorBlink 1s ease-in-out infinite" }} />
          )}
        </div>
        <button style={{ width: 28, height: 28, borderRadius: 6, background: primary, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ color: "#fff", fontSize: 13 }}>↑</span>
        </button>
      </div>
    </div>
  );
}

// ─── AI Features Section ─────────────────────────────────────────────────────
function AiFeaturesSection() {
  const { ref, inView } = useInView(0.12);
  const { mobile, tablet } = useBreakpoint();
  const [activeTab, setActiveTab] = useState<InboxTab>("insights");
  const [paused, setPaused] = useState(false);
  const pauseRef = useRef<ReturnType<typeof setTimeout>>(null);
  const tabs: Array<{ id: InboxTab; label: string; tagline: string }> = [
    { id: "insights",  label: "AI Insights Panel",       tagline: "Sentiment, intent, entities, labels, priority, and KB answers — live inside every conversation." },
    { id: "summary",   label: "Conversation Summary",    tagline: "One click summarises the full thread with key topics, outcome, and predicted CSAT." },
    { id: "replies",   label: "Smart Reply Suggestions", tagline: "3 contextual reply chips generated from the last 20 messages — click to fill the input instantly." },
  ];

  useEffect(() => {
    if (paused || !inView) return;
    const id = setInterval(() => setActiveTab(t => {
      const i = tabs.findIndex(x => x.id === t);
      return tabs[(i + 1) % tabs.length].id;
    }), 6000);
    return () => clearInterval(id);
  }, [paused, inView]);

  const handleTab = (id: InboxTab) => {
    setActiveTab(id);
    setPaused(true);
    if (pauseRef.current) clearTimeout(pauseRef.current);
    pauseRef.current = setTimeout(() => setPaused(false), 15000);
  };

  const active = tabs.find(t => t.id === activeTab)!;

  return (
    <section style={{ background: "#0d0d0d", padding: mobile ? "72px 20px" : tablet ? "88px 32px" : "112px 48px" }}>
      <div style={{ maxWidth: 1300, margin: "0 auto" }}>

        {/* Header */}
        <div ref={ref} style={{ marginBottom: mobile ? 40 : 64 }}>
          <span className="font-body" style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase",
            color: "#ffb77d", display: "inline-block", marginBottom: 18,
            borderBottom: "1px solid rgba(255,183,125,0.25)", paddingBottom: 6,
            opacity: inView ? 1 : 0, transition: "all 0.7s ease",
          }}>AI-NATIVE INTELLIGENCE</span>
          <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", alignItems: mobile ? "flex-start" : "flex-end", justifyContent: "space-between", gap: 24 }}>
            <h2 className="font-headline" style={{
              fontSize: mobile ? "clamp(36px,10vw,60px)" : "clamp(48px,5vw,80px)",
              fontWeight: 900, lineHeight: 0.9, letterSpacing: "-0.045em",
              textTransform: "uppercase", color: "#e5e2e1", marginTop: 12,
              opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(28px)",
              transition: "all 0.8s 0.1s ease",
            }}>
              YOUR INBOX.<br />
              <span style={{ background: "linear-gradient(135deg,#ffb77d,#d97707)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>NOW THINKS.</span>
            </h2>
            <p className="font-body" style={{
              fontSize: 15, lineHeight: 1.75, color: "#dbc2b0", fontWeight: 300,
              maxWidth: 380, flexShrink: 0,
              opacity: inView ? 1 : 0, transition: "all 0.8s 0.2s ease",
            }}>
              AI runs silently on every conversation — detecting intent, scoring sentiment, suggesting replies, and pulling KB answers — so your agents close faster without thinking harder.
            </p>
          </div>
        </div>

        {/* Main layout */}
        <div style={{
          display: "grid",
          gridTemplateColumns: mobile ? "1fr" : tablet ? "1fr" : "1fr 1fr",
          gap: mobile ? 32 : 56,
          alignItems: "start",
          opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(32px)",
          transition: "all 0.9s 0.3s ease",
        }}>
          {/* Left: tab selector + description */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => handleTab(tab.id)} style={{
                display: "flex", alignItems: "flex-start", gap: 14, padding: "18px 20px",
                background: tab.id === activeTab ? "#1c1b1b" : "transparent",
                border: "none",
                borderLeft: `3px solid ${tab.id === activeTab ? "#ffb77d" : "rgba(85,67,54,0.25)"}`,
                borderRadius: "0 8px 8px 0",
                cursor: "pointer", textAlign: "left", transition: "all 0.25s ease",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                  background: tab.id === activeTab ? "rgba(255,183,125,0.12)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${tab.id === activeTab ? "rgba(255,183,125,0.3)" : "rgba(255,255,255,0.06)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, transition: "all 0.25s ease",
                }}>
                  {tab.id === "insights" ? "🧠" : tab.id === "summary" ? "✨" : "💬"}
                </div>
                <div>
                  <div style={{
                    fontSize: 14, fontWeight: 700,
                    color: tab.id === activeTab ? "#e5e2e1" : "rgba(163,140,124,0.65)",
                    fontFamily: "'Manrope', sans-serif", marginBottom: 5,
                    transition: "color 0.25s ease",
                  }}>{tab.label}</div>
                  <div style={{
                    fontSize: 12, color: "rgba(163,140,124,0.5)",
                    fontFamily: "'Manrope', sans-serif", lineHeight: 1.55,
                    maxWidth: 340,
                  }}>{tab.tagline}</div>
                </div>
              </button>
            ))}

            {/* Feature chips */}
            <div style={{ marginTop: 12, paddingLeft: 20, display: "flex", flexWrap: "wrap", gap: 7 }}>
              {[
                "Sentiment Analysis","Intent Detection","Entity Extraction",
                "Auto-Categorization","Smart Replies","KB RAG Search",
                "Conversation Summary","Priority Classification",
              ].map(f => (
                <span key={f} className="font-body" style={{
                  fontSize: 10, fontWeight: 600, padding: "4px 9px",
                  borderRadius: 4, border: "1px solid rgba(85,67,54,0.25)",
                  color: "rgba(163,140,124,0.55)", letterSpacing: "0.02em",
                }}>{f}</span>
              ))}
            </div>
          </div>

          {/* Right: real inbox mockup */}
          <div style={{ position: "relative" }}>
            {/* Glow */}
            <div className="animate-glow" style={{
              position: "absolute", inset: 0, background: "rgba(99,102,241,0.08)",
              filter: "blur(60px)", borderRadius: 16, transform: "translateY(16px)", pointerEvents: "none",
            }} />
            <div style={{ position: "relative" }}>
              <InboxMockup activeTab={activeTab} inView={inView} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Stats & Social Proof ─────────────────────────────────────────────────────
function StatsSection() {
  const { ref, inView } = useInView(0.15);
  const { mobile, tablet } = useBreakpoint();

  const c1 = useCounter(1200, 1600, inView);
  const c2 = useCounter(94, 1400, inView);
  const c3 = useCounter(48, 1200, inView);
  const c4 = useCounter(48500, 1800, inView);

  const metrics = [
    { label: "Active Businesses", display: `${c1}+`, micro: "↑ Growing fast" },
    { label: "Message Delivery Rate", display: `${c2}%`, micro: "Industry avg: 65%" },
    { label: "Average Response Time", display: `${(c3 / 10).toFixed(1)} min`, micro: "↓ Down from 45 min" },
    { label: "Conversations Handled", display: c4.toLocaleString(), micro: "This month" },
  ];

  return (
    <section id="stats" style={{ background: "#0e0e0e" }}>
      <div style={{ padding: mobile ? "72px 20px 56px" : "112px 48px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "60%", height: 200, background: "rgba(255,183,125,0.05)", filter: "blur(80px)", borderRadius: "100%", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1300, margin: "0 auto" }}>
          {/* SVG Divider */}
          <SvgDivider inView={inView} />
          <div style={{ height: 56 }} />

          <div ref={ref} style={{ textAlign: "center", marginBottom: 56 }}>
            <span className="font-body" style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#ffb77d",
              display: "inline-block", borderBottom: "1px solid rgba(255,183,125,0.3)", paddingBottom: 6, marginBottom: 20,
              opacity: inView ? 1 : 0, transition: "all 0.7s ease",
            }}>BY THE NUMBERS</span>
            <h2 className="font-headline" style={{
              fontSize: mobile ? "clamp(40px,10vw,64px)" : "clamp(48px,6vw,88px)", fontWeight: 900, lineHeight: 0.9,
              letterSpacing: "-0.045em", textTransform: "uppercase", color: "#e5e2e1",
              opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(24px)", transition: "all 0.8s 0.1s ease",
            }}>
              NUMBERS THAT{" "}
              <span style={{ background: "linear-gradient(135deg,#ffb77d,#d97707)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>SPEAK.</span>
            </h2>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: mobile ? "repeat(2,1fr)" : tablet ? "repeat(2,1fr)" : "repeat(4,1fr)",
            gap: mobile ? 12 : 20,
          }}>
            {metrics.map((m, i) => (
              <div key={m.label} style={{
                background: "#1c1b1b", borderRadius: 8, padding: mobile ? 24 : 40,
                borderTop: "1px solid rgba(255,183,125,0.2)", position: "relative", overflow: "hidden",
                opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(40px)",
                transition: `all 0.8s ${i * 0.1}s ease`,
              }}>
                <div className="font-headline" style={{ fontSize: mobile ? "clamp(36px,8vw,64px)" : "clamp(52px,4.5vw,88px)", fontWeight: 900, letterSpacing: "-0.045em", color: "#ffb77d", lineHeight: 1, marginBottom: 10 }}>
                  {m.display}
                </div>
                <div className="font-body" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#dbc2b0", marginBottom: 14 }}>{m.label}</div>
                <div className="font-body" style={{ fontSize: 12, color: i === 2 ? "#a3defe" : "rgba(163,140,124,0.6)" }}>{m.micro}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonial */}
      <div style={{ background: "#131313", padding: mobile ? "56px 20px 72px" : "80px 48px 112px" }}>
        <div style={{ maxWidth: 1300, margin: "0 auto", display: "grid", gridTemplateColumns: mobile ? "1fr" : tablet ? "1fr" : "7fr 5fr", gap: mobile ? 40 : 80, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 28 }}>
            <div style={{ width: 3, background: "linear-gradient(to bottom,#ffb77d,#d97707,transparent)", flexShrink: 0, borderRadius: 4 }} />
            <div>
              <span className="material-symbols-outlined" style={{ fontSize: 48, color: "rgba(255,183,125,0.18)", display: "block", marginBottom: 16 }}>format_quote</span>
              <blockquote className="font-headline" style={{ fontStyle: "italic", fontWeight: 300, fontSize: mobile ? "clamp(18px,5vw,28px)" : "clamp(22px,2.5vw,40px)", lineHeight: 1.3, letterSpacing: "-0.02em", color: "rgba(229,226,225,0.88)", marginBottom: 32 }}>
                "We went from missing 40% of leads to a 94% response rate in 3 weeks. Wazelo CRM is the only tool that actually works for WhatsApp sales."
              </blockquote>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", border: "2px solid rgba(85,67,54,0.4)", overflow: "hidden", background: "#2a2a2a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="material-symbols-outlined" style={{ color: "#a38c7c", fontSize: 24 }}>person</span>
                </div>
                <div>
                  <div className="font-body" style={{ fontSize: 16, fontWeight: 700, color: "#e5e2e1", marginBottom: 2 }}>Rajesh M.</div>
                  <div className="font-body" style={{ fontSize: 12, fontWeight: 500, color: "#ffb77d", textTransform: "uppercase", letterSpacing: "0.1em" }}>Head of Sales, PropEdge Realty</div>
                </div>
              </div>
            </div>
          </div>

          {/* Case study card */}
          <div style={{ position: "relative" }}>
            <div className="animate-glow" style={{ position: "absolute", inset: 0, background: "rgba(217,119,6,0.08)", filter: "blur(60px)", borderRadius: 12, transform: "translateY(16px)" }} />
            <div style={{ position: "relative", background: "#1c1b1b", borderTop: "2px solid #ffb77d", borderRadius: 8, padding: mobile ? 28 : 40, boxShadow: "0 32px 80px rgba(0,0,0,0.5)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#0e0e0e", border: "1px solid rgba(85,67,54,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "linear-gradient(135deg,#ffb77d,#d97707)" }} />
                </div>
                <span className="font-headline" style={{ fontSize: 16, fontWeight: 700, color: "#e5e2e1" }}>PropEdge Realty</span>
              </div>
              <h3 className="font-headline" style={{ fontSize: mobile ? "clamp(20px,5vw,28px)" : "clamp(24px,2.5vw,34px)", fontWeight: 900, letterSpacing: "-0.03em", color: "#e5e2e1", lineHeight: 1.15, marginBottom: 28 }}>
                3x lead conversion<br />in 30 days
              </h3>
              <div style={{ borderLeft: "1px solid rgba(85,67,54,0.3)", paddingLeft: 16, marginBottom: 28, display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { label: "Leads responded", val: "↑ 340%", color: "#ffb77d" },
                  { label: "Response time", val: "↓ 87%", color: "#a3defe" },
                  { label: "Revenue attributed", val: "₹24L", color: "#e5e2e1" },
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="font-body" style={{ fontSize: 13, color: "#dbc2b0" }}>{row.label}</span>
                    <span className="font-headline" style={{ fontSize: 16, fontWeight: 700, color: row.color }}>{row.val}</span>
                  </div>
                ))}
              </div>
              <a href="/case-study/propedge-realty" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#ffb77d", fontWeight: 700, fontSize: 12, textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                <span className="font-body">Read case study</span>
                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>arrow_right_alt</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────────
function PricingSection() {
  const [yearly, setYearly] = useState(false);
  const { ref, inView } = useInView(0.1);
  const { mobile, tablet } = useBreakpoint();

  return (
    <section id="pricing" style={{ background: "#131313", padding: mobile ? "72px 20px" : "112px 48px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* SVG Divider */}
        <SvgDivider inView={inView} />
        <div style={{ height: 64 }} />

        <div ref={ref} style={{ textAlign: "center", marginBottom: 56 }}>
          <span className="font-body" style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#ffb77d", marginBottom: 18, opacity: inView ? 1 : 0, transition: "all 0.7s ease" }}>
            Pricing
          </span>
          <h2 className="font-headline" style={{
            fontSize: mobile ? "clamp(36px,10vw,56px)" : "clamp(44px,5.5vw,80px)", fontWeight: 900, lineHeight: 0.9,
            letterSpacing: "-0.045em", textTransform: "uppercase", color: "#e5e2e1", marginBottom: 18,
            opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(28px)", transition: "all 0.8s 0.1s ease",
          }}>
            Simple Pricing.<br />Serious Results.
          </h2>
          <p className="font-body" style={{ fontSize: 16, color: "#dbc2b0", fontWeight: 300, marginBottom: 32, opacity: inView ? 1 : 0, transition: "all 0.8s 0.2s ease" }}>
            All plans include a 14-day free trial. No credit card required.
          </p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 14 }}>
            <span className="font-body" style={{ fontSize: 14, color: yearly ? "#a38c7c" : "#e5e2e1" }}>Monthly</span>
            <button onClick={() => setYearly(!yearly)} style={{ width: 52, height: 28, borderRadius: 100, background: "#2a2a2a", border: "1px solid rgba(85,67,54,0.3)", cursor: "pointer", position: "relative", padding: 0 }}>
              <span style={{ position: "absolute", top: 3, left: yearly ? 24 : 3, width: 22, height: 22, borderRadius: "50%", background: "#ffb77d", transition: "left 0.22s ease", display: "block" }} />
            </button>
            <span className="font-body" style={{ fontSize: 14, color: yearly ? "#e5e2e1" : "#a38c7c" }}>Yearly</span>
            {yearly && <span className="font-body" style={{ background: "rgba(217,119,6,0.12)", color: "#ffb77d", fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 100, letterSpacing: "0.05em" }}>SAVE 17%</span>}
          </div>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: mobile ? "1fr" : tablet ? "1fr" : "repeat(3,1fr)",
          gap: 20, alignItems: "start", marginBottom: 16,
        }}>
          {plans.map((plan, i) => (
            <div key={plan.name} style={{
              background: plan.popular ? "rgba(217,119,6,0.05)" : "#1c1b1b",
              border: `1px solid ${plan.popular ? "rgba(255,183,125,0.35)" : "rgba(85,67,54,0.2)"}`,
              borderRadius: 8, padding: mobile ? 28 : 36, position: "relative", display: "flex", flexDirection: "column",
              transform: (!mobile && !tablet && plan.popular) ? "translateY(-16px)" : "none",
              boxShadow: plan.popular ? "0 0 60px 8px rgba(217,119,6,0.1)" : "none",
              opacity: inView ? 1 : 0,
              transition: `all 0.8s ${0.2 + i * 0.1}s ease`,
            }}>
              {plan.popular && (
                <div style={{ position: "absolute", top: 0, right: 0, background: "#ffb77d", color: "#4d2600", fontSize: 10, fontWeight: 900, padding: "5px 14px", borderRadius: "0 8px 0 8px", letterSpacing: "0.07em", textTransform: "uppercase" }}>
                  Most Popular
                </div>
              )}
              <h3 className="font-headline" style={{ fontSize: 20, fontWeight: 700, color: plan.popular ? "#ffb77d" : "#e5e2e1", marginBottom: 12 }}>{plan.name}</h3>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 10 }}>
                <span className="font-headline" style={{ fontSize: plan.popular ? 48 : 40, fontWeight: 900, color: plan.popular ? "#ffb77d" : "#e5e2e1", letterSpacing: "-0.045em", lineHeight: 1 }}>
                  ₹{yearly ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice}
                </span>
                <span className="font-body" style={{ fontSize: 13, color: "#dbc2b0" }}>/mo</span>
              </div>
              <p className="font-body" style={{ fontSize: 12, color: "#dbc2b0", borderBottom: "1px solid rgba(85,67,54,0.2)", paddingBottom: 18, marginBottom: 20 }}>{plan.subtitle}</p>
              <ul style={{ listStyle: "none", marginBottom: 28, flex: 1 }}>
                {plan.features.map(feat => (
                  <li key={feat} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12, fontSize: 13, color: "#e5e2e1" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#ffb77d", flexShrink: 0, marginTop: 1 }}>check_circle</span>
                    <span className="font-body">{feat}</span>
                  </li>
                ))}
              </ul>
              <a href={APP_REGISTER_URL} className={plan.popular ? "btn-primary font-body" : "btn-ghost font-body"} style={{
                width: "100%", padding: plan.popular ? "15px" : "13px", borderRadius: 6,
                fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
                cursor: "pointer", background: plan.popular ? undefined : "#3a3939",
                color: plan.popular ? undefined : "#e5e2e1", border: plan.popular ? "none" : "1px solid rgba(85,67,54,0.3)",
                textDecoration: "none", display: "block", textAlign: "center",
              }}>
                Start Free Trial — 14 Days
              </a>
            </div>
          ))}
        </div>

        <div style={{ background: "#0e0e0e", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 8, padding: mobile ? "16px 20px" : "18px 28px", display: "flex", flexDirection: mobile ? "column" : "row", alignItems: mobile ? "flex-start" : "center", justifyContent: "space-between", gap: 12 }}>
          <div className="font-body">
            <span style={{ fontWeight: 700, fontSize: 15, color: "#e5e2e1" }}>Enterprise</span>
            <span style={{ color: "#dbc2b0", fontSize: 13, marginLeft: 12 }}>200 users · 200 WA sessions · Unlimited msgs & campaigns · Full API · Custom SLA</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
            <span className="font-body" style={{ fontSize: 13, color: "#ffb77d", fontWeight: 700 }}>₹3,999<span style={{ color: "#a38c7c", fontWeight: 400 }}>/mo</span></span>
            <a href="mailto:sales@wazelo.in" style={{ display: "flex", alignItems: "center", gap: 6, color: "#ffb77d", fontWeight: 700, fontSize: 12, textDecoration: "none", whiteSpace: "nowrap", border: "1px solid rgba(255,183,125,0.3)", padding: "10px 20px", borderRadius: 6 }}>
              <span className="font-body">Contact Sales</span>
              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>arrow_forward</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────
function CtaSection() {
  const { ref, inView } = useInView(0.15);
  const { mobile } = useBreakpoint();

  return (
    <section style={{ position: "relative", background: "#0e0e0e", minHeight: mobile ? "auto" : 640, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: mobile ? "80px 20px" : "112px 48px", textAlign: "center" }}>
      <div className="animate-glow" style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at center,rgba(217,119,7,0.13) 0%,transparent 60%)", pointerEvents: "none" }} />
      {!mobile && <div className="font-headline" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: "20vw", fontWeight: 900, color: "rgba(255,255,255,0.016)", letterSpacing: "-0.05em", pointerEvents: "none", userSelect: "none", whiteSpace: "nowrap" }}>WAZELO</div>}

      <div ref={ref} style={{ position: "relative", zIndex: 10, maxWidth: 860 }}>
        <span className="font-body" style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "#ffb77d", marginBottom: 32, opacity: inView ? 1 : 0, transition: "all 0.7s ease" }}>
          Get Started Today
        </span>
        <h2 className="font-headline" style={{
          fontSize: mobile ? "clamp(48px,13vw,96px)" : "clamp(60px,9vw,128px)", fontWeight: 900, lineHeight: 0.86,
          letterSpacing: "-0.05em", textTransform: "uppercase", color: "#e5e2e1", marginBottom: 40,
          opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(40px)", transition: "all 0.9s 0.1s ease",
        }}>
          {"Don't Just"}<br />Message.<br />
          <span style={{ color: "#ffb77d", fontStyle: "italic", fontWeight: 300, letterSpacing: "-0.02em" }}>Close Deals.</span>
        </h2>
        <a href={APP_REGISTER_URL} className="btn-primary font-headline" style={{ display: "inline-flex", alignItems: "center", gap: 12, fontSize: mobile ? 15 : 18, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em", padding: mobile ? "16px 36px" : "20px 52px", borderRadius: 100, border: "none", cursor: "pointer", opacity: inView ? 1 : 0, transition: "all 0.8s 0.25s ease", textDecoration: "none" }}>
          Start Your Free Trial
          <span className="material-symbols-outlined" style={{ fontSize: mobile ? 18 : 22 }}>arrow_forward</span>
        </a>
        <p className="font-body" style={{ marginTop: 18, fontSize: 11, color: "rgba(219,194,176,0.4)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          No credit card required · 14-day free trial · Cancel anytime
        </p>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const { mobile, tablet } = useBreakpoint();
  const cols = [
    { title: "Product", links: [["Shared Inbox", "/features/shared-inbox"], ["Bulk Campaigns", "/features/campaigns"], ["Automation", "/features/automation"], ["Deals Pipeline", "/features/deals"], ["Sequences", "/features/sequences"], ["Developer API", "/features/developer-api"], ["Pricing", "#pricing"]] },
    { title: "Resources", links: [["Documentation", "mailto:hello@wazelo.in"], ["API Reference", "mailto:hello@wazelo.in"], ["Community", "mailto:hello@wazelo.in"], ["Support", "mailto:support@wazelo.in"]] },
    { title: "Company", links: [["About Us", "/about"], ["Careers", "mailto:hello@wazelo.in"], ["Press", "mailto:hello@wazelo.in"], ["Contact", "/contact"]] },
  ];

  return (
    <footer style={{ background: "#0e0e0e", borderTop: "1px solid rgba(255,183,125,0.1)", paddingTop: mobile ? 56 : 80, paddingBottom: 40, position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 1, background: "linear-gradient(to right,transparent,rgba(255,183,125,0.35),transparent)" }} />
      <div style={{ maxWidth: 1300, margin: "0 auto", padding: mobile ? "0 20px" : "0 48px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: mobile ? "1fr 1fr" : tablet ? "1fr 1fr 1fr" : "2fr 1fr 1fr 1fr",
          gap: mobile ? 32 : 48, marginBottom: 48,
        }}>
          <div style={{ gridColumn: mobile ? "1 / -1" : "auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Image src="/logo/logo.jpeg" alt="Wazelo CRM" width={32} height={32} style={{ height: 32, width: 32, objectFit: "contain", mixBlendMode: "screen" }} />
              <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: "-0.03em", color: "#e5e2e1", fontFamily: "'Inter', sans-serif" }}>
                Wazelo <span style={{ color: "#ffb77d" }}>CRM</span>
              </span>
            </div>
            <p className="font-body" style={{ fontSize: 13, color: "rgba(219,194,176,0.45)", lineHeight: 1.75, maxWidth: 280 }}>
              The cinematic monolith of WhatsApp relationship management. Precision engineered for high-end deal flow.
            </p>
          </div>
          {cols.map(col => (
            <div key={col.title}>
              <h4 className="font-headline" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#e5e2e1", marginBottom: 16 }}>{col.title}</h4>
              <ul style={{ listStyle: "none" }}>
                {col.links.map(([label, href]) => (
                  <li key={label} style={{ marginBottom: 10 }}>
                    <a href={href} className="font-body" style={{ fontSize: 13, color: "rgba(163,140,124,0.7)", textDecoration: "none", transition: "color 0.2s" }}
                      onMouseEnter={e => ((e.target as HTMLAnchorElement).style.color = "#e5e2e1")}
                      onMouseLeave={e => ((e.target as HTMLAnchorElement).style.color = "rgba(163,140,124,0.7)")}
                    >{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 24, display: "flex", flexDirection: mobile ? "column" : "row", justifyContent: "space-between", alignItems: mobile ? "flex-start" : "center", gap: 12 }}>
          <p className="font-body" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>© 2025 Wazelo CRM. All rights reserved.</p>
          <div style={{ display: "flex", gap: 20 }}>
            {[["Privacy", "/privacy"], ["Terms", "/terms"]].map(([label, href]) => <a key={label} href={href} className="font-body" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", textDecoration: "none" }}>{label}</a>)}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <MarqueeTicker />
      <FeaturesSection />
      <ScrollSequenceSection />
      <PartnersSection />
      <FeatureScrollSection />
      <AiChatSection />
      <AiFeaturesSection />
      <StatsSection />
      <PricingSection />
      <CtaSection />
      <Footer />
    </>
  );
}
