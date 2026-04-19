"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useInView, useBreakpoint, APP_REGISTER_URL, APP_LOGIN_URL } from "@/lib/wazelo";
import SiteFooter from "@/components/Footer";

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { mobile } = useBreakpoint();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    h();
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const navLinks = [
    ["Features", "/#features"],
    ["Use Cases", "/use-cases"],
    ["Pricing", "/#pricing"],
    ["About", "/about"],
  ];

  return (
    <nav style={{
      position: "fixed", top: 0, width: "100%", zIndex: 50,
      background: scrolled ? "rgba(13,13,13,0.96)" : "rgba(13,13,13,0.7)",
      backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
      borderBottom: "1px solid rgba(255,183,125,0.08)",
      transition: "background 0.3s ease",
    }}>
      <div style={{
        maxWidth: 1440, margin: "0 auto",
        padding: mobile ? "0 20px" : "0 48px",
        height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <Image src="/logo/logo.jpeg" alt="Wazelo CRM" width={36} height={36}
            style={{ height: 36, width: 36, objectFit: "contain", mixBlendMode: "screen" }} />
          <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.04em", color: "#e5e2e1", fontFamily: "'Inter', sans-serif" }}>
            Wazelo <span style={{ color: "#ffb77d" }}>CRM</span>
          </span>
        </a>

        {!mobile && (
          <div style={{ display: "flex", gap: 36, alignItems: "center" }}>
            {navLinks.map(([label, href]) => (
              <a key={label} href={href} style={{
                fontSize: 13, fontWeight: 500, letterSpacing: "0.02em",
                textDecoration: "none",
                color: label === "Use Cases" ? "#ffb77d" : "rgba(219,194,176,0.75)",
                fontFamily: "'Inter', sans-serif", transition: "color 0.2s",
              }}
                onMouseEnter={e => ((e.target as HTMLAnchorElement).style.color = "#e5e2e1")}
                onMouseLeave={e => ((e.target as HTMLAnchorElement).style.color = label === "Use Cases" ? "#ffb77d" : "rgba(219,194,176,0.75)")}
              >{label}</a>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {!mobile && (
            <a href={APP_LOGIN_URL} style={{ fontSize: 13, fontWeight: 500, color: "#dbc2b0", textDecoration: "none", fontFamily: "'Inter', sans-serif" }}>Sign In</a>
          )}
          {!mobile && (
            <a href={APP_REGISTER_URL} style={{
              fontSize: 13, fontWeight: 700, padding: "10px 22px", borderRadius: 100,
              background: "#fff", color: "#131313", textDecoration: "none", display: "inline-block",
              fontFamily: "'Inter', sans-serif",
            }}>Get Started Free</a>
          )}
          {mobile && (
            <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", flexDirection: "column", gap: 5 }}>
              <span style={{ display: "block", width: 22, height: 2, background: menuOpen ? "#ffb77d" : "#e5e2e1", transition: "all 0.3s ease", transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "none" }} />
              <span style={{ display: "block", width: 22, height: 2, background: menuOpen ? "#ffb77d" : "#e5e2e1", transition: "all 0.3s ease", opacity: menuOpen ? 0 : 1 }} />
              <span style={{ display: "block", width: 22, height: 2, background: menuOpen ? "#ffb77d" : "#e5e2e1", transition: "all 0.3s ease", transform: menuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none" }} />
            </button>
          )}
        </div>
      </div>

      {mobile && (
        <div style={{
          maxHeight: menuOpen ? 400 : 0, overflow: "hidden",
          transition: "max-height 0.35s ease",
          background: "rgba(13,13,13,0.98)",
          borderTop: menuOpen ? "1px solid rgba(255,183,125,0.08)" : "none",
        }}>
          <div style={{ padding: "16px 20px 20px", display: "flex", flexDirection: "column", gap: 0 }}>
            {navLinks.map(([label, href]) => (
              <a key={label} href={href} onClick={() => setMenuOpen(false)} style={{
                padding: "14px 0", fontSize: 16, fontWeight: 500,
                color: label === "Use Cases" ? "#ffb77d" : "rgba(219,194,176,0.8)",
                textDecoration: "none", fontFamily: "'Inter', sans-serif",
                borderBottom: "1px solid rgba(255,183,125,0.06)",
              }}>{label}</a>
            ))}
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <a href={APP_LOGIN_URL} style={{ flex: 1, fontSize: 14, fontWeight: 500, padding: "12px", borderRadius: 8, border: "1px solid rgba(255,183,125,0.2)", color: "#dbc2b0", textDecoration: "none", textAlign: "center", fontFamily: "'Inter', sans-serif" }}>Sign In</a>
              <a href={APP_REGISTER_URL} style={{ flex: 1, fontSize: 14, fontWeight: 700, padding: "12px", borderRadius: 8, background: "#fff", color: "#131313", textDecoration: "none", textAlign: "center", fontFamily: "'Inter', sans-serif" }}>Get Started</a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── Use Case Section ─────────────────────────────────────────────────────────
function UseCaseSection({
  id, tag, title, desc, bullets, icon, reverse,
}: {
  id: string; tag: string; title: string; desc: string; bullets: string[]; icon: string; reverse?: boolean;
}) {
  const { mobile } = useBreakpoint();
  const view = useInView(0.15);

  return (
    <section id={id} ref={view.ref} style={{
      padding: mobile ? "80px 20px" : "100px 48px",
      background: "var(--bg)",
      borderBottom: "1px solid rgba(255,183,125,0.05)",
    }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        display: "grid",
        gridTemplateColumns: mobile ? "1fr" : "1fr 1fr",
        gap: mobile ? 40 : 80,
        direction: (!mobile && reverse) ? "rtl" : "ltr",
      }}>
        {/* Text */}
        <div style={{
          direction: "ltr",
          opacity: view.inView ? 1 : 0,
          transform: view.inView ? "translateX(0)" : (reverse ? "translateX(32px)" : "translateX(-32px)"),
          transition: "opacity 0.9s ease, transform 0.9s ease",
          display: "flex", flexDirection: "column", justifyContent: "center",
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#ffb77d", fontFamily: "'Inter', sans-serif", display: "block", marginBottom: 14 }}>{tag}</span>
          <h2 style={{ fontSize: "clamp(26px,3vw,40px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.2, color: "#e5e2e1", fontFamily: "'Inter', sans-serif", marginBottom: 18 }}>{title}</h2>
          <p style={{ fontSize: 15, color: "rgba(219,194,176,0.65)", lineHeight: 1.85, fontFamily: "'Inter', sans-serif", marginBottom: 28 }}>{desc}</p>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
            {bullets.map(b => (
              <li key={b} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <span style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(255,183,125,0.15)", border: "1px solid rgba(255,183,125,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ffb77d", display: "block" }} />
                </span>
                <span style={{ fontSize: 14, color: "rgba(219,194,176,0.75)", fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}>{b}</span>
              </li>
            ))}
          </ul>
          <a href={APP_REGISTER_URL} className="btn-primary" style={{
            marginTop: 36, display: "inline-block", padding: "12px 28px", borderRadius: 100,
            fontSize: 13, fontWeight: 800, textDecoration: "none", fontFamily: "'Inter', sans-serif",
            alignSelf: "flex-start",
          }}>Try it free</a>
        </div>

        {/* Visual card */}
        <div style={{
          direction: "ltr",
          opacity: view.inView ? 1 : 0,
          transform: view.inView ? "translateX(0)" : (reverse ? "translateX(-32px)" : "translateX(32px)"),
          transition: "opacity 0.9s 0.1s ease, transform 0.9s 0.1s ease",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            background: "var(--surface)", border: "1px solid rgba(255,183,125,0.15)",
            borderRadius: 24, padding: "48px 40px", textAlign: "center",
            boxShadow: "0 0 80px rgba(217,119,6,0.06)", width: "100%",
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 64, color: "#ffb77d", marginBottom: 20, display: "block" }}>{icon}</span>
            <div style={{ fontSize: 13, color: "rgba(219,194,176,0.4)", fontFamily: "'Inter', sans-serif", letterSpacing: "0.06em" }}>Wazelo CRM · {tag}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Industries data ──────────────────────────────────────────────────────────
const industries = [
  {
    id: "ecommerce",
    tag: "E-commerce",
    icon: "shopping_cart",
    title: "Recover carts. Drive repeat orders.",
    desc: "Turn WhatsApp into your most powerful sales channel. Reach customers at every stage of their buying journey with automated, personalised messages.",
    bullets: [
      "Abandoned cart recovery with one-click checkout links",
      "Order confirmation and shipping updates on WhatsApp",
      "Post-delivery review requests and upsell campaigns",
      "Customer support with shared team inbox",
    ],
  },
  {
    id: "realestate",
    tag: "Real Estate",
    icon: "apartment",
    title: "Close more deals. Faster.",
    desc: "Real estate runs on relationships. Wazelo CRM helps you follow up instantly, send property details, and stay top of mind with every prospect.",
    bullets: [
      "Instant lead response from WhatsApp ads and portals",
      "Property brochures and virtual tour links on demand",
      "Site visit reminders and follow-up automation",
      "Deal pipeline tracking with contact tags",
    ],
  },
  {
    id: "healthcare",
    tag: "Healthcare",
    icon: "health_and_safety",
    title: "Reduce no-shows. Improve care.",
    desc: "Automate appointment reminders, prescription alerts, and health tips — all through a channel your patients already use every day.",
    bullets: [
      "Appointment booking confirmations and reminders",
      "Prescription ready and refill notifications",
      "Post-visit care instructions and follow-ups",
      "Lab report delivery via secure WhatsApp message",
    ],
  },
  {
    id: "education",
    tag: "Education",
    icon: "school",
    title: "Engage students. Enrol faster.",
    desc: "From admission inquiries to fee payment nudges, Wazelo CRM keeps your institution connected with students and parents throughout the year.",
    bullets: [
      "Instant response to admission inquiry forms",
      "Fee due reminders and payment confirmation",
      "Exam schedule and result notifications",
      "Bulk broadcast for events and announcements",
    ],
  },
  {
    id: "travel",
    tag: "Travel & Hospitality",
    icon: "flight",
    title: "Deliver experiences before they arrive.",
    desc: "Set the tone before check-in. Send itineraries, upsell add-ons, and handle customer queries through a single WhatsApp-first inbox.",
    bullets: [
      "Booking confirmation with downloadable itinerary",
      "Pre-arrival upsell for room upgrades and excursions",
      "Real-time flight or tour status updates",
      "Post-trip review requests and loyalty offers",
    ],
  },
  {
    id: "finance",
    tag: "Finance & Insurance",
    icon: "account_balance",
    title: "Nurture leads. Retain clients.",
    desc: "Compliance-aware, personalised communication at scale. Follow up on policy renewals, KYC steps, and loan applications without missing a beat.",
    bullets: [
      "Policy renewal reminders and premium due alerts",
      "KYC document collection via WhatsApp",
      "Loan application status updates",
      "Investment portfolio alerts and SIP reminders",
    ],
  },
];

// ─── Use Cases Page ───────────────────────────────────────────────────────────
export default function UseCasesPage() {
  const { mobile } = useBreakpoint();
  const heroView = useInView(0.1);
  const whyView = useInView(0.15);
  const ctaView = useInView(0.2);
  const [activeIndustry, setActiveIndustry] = useState("ecommerce");

  // Update active pill as user scrolls
  useEffect(() => {
    const handler = () => {
      for (const ind of industries) {
        const el = document.getElementById(ind.id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= 120 && rect.bottom > 120) {
          setActiveIndustry(ind.id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollToIndustry = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 120;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const whyStats = [
    { stat: "98%", label: "Average open rate on WhatsApp" },
    { stat: "5×", label: "Higher reply rate vs email" },
    { stat: "2.5B+", label: "Active WhatsApp users globally" },
  ];

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />

      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section ref={heroView.ref} style={{
        minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: mobile ? "120px 20px 80px" : "120px 48px 80px",
        background: "var(--bg)", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle,rgba(217,119,6,0.07) 0%,transparent 70%)", pointerEvents: "none" }} />

        <div style={{ textAlign: "center", maxWidth: 860, position: "relative", zIndex: 1 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px",
            borderRadius: 100, background: "rgba(255,183,125,0.08)", border: "1px solid rgba(255,183,125,0.2)",
            marginBottom: 32,
            opacity: heroView.inView ? 1 : 0, transform: heroView.inView ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ffb77d", display: "inline-block" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#ffb77d", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'Inter', sans-serif" }}>Use Cases</span>
          </div>

          <h1 style={{
            fontSize: "clamp(38px,5.5vw,80px)", fontWeight: 900, letterSpacing: "-0.04em",
            lineHeight: 1.08, color: "#fff", fontFamily: "'Inter', sans-serif", marginBottom: 24,
            opacity: heroView.inView ? 1 : 0, transform: heroView.inView ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.9s 0.1s ease, transform 0.9s 0.1s ease",
          }}>
            One platform.<br />
            <span style={{ color: "#ffb77d" }}>Every industry.</span>
          </h1>

          <p style={{
            fontSize: "clamp(15px,1.6vw,18px)", color: "rgba(219,194,176,0.7)", lineHeight: 1.8,
            maxWidth: 580, margin: "0 auto 48px", fontFamily: "'Inter', sans-serif",
            opacity: heroView.inView ? 1 : 0, transform: heroView.inView ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.9s 0.2s ease, transform 0.9s 0.2s ease",
          }}>
            From e-commerce to healthcare, Wazelo CRM powers WhatsApp relationships for businesses of every shape and size.
          </p>

          {/* Industry quick-links */}
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center",
            opacity: heroView.inView ? 1 : 0, transition: "opacity 0.9s 0.3s ease",
          }}>
            {industries.map(ind => (
              <button key={ind.id} onClick={() => scrollToIndustry(ind.id)} style={{
                padding: "8px 18px", borderRadius: 100, fontSize: 13, fontWeight: 600,
                background: "rgba(255,183,125,0.08)", border: "1px solid rgba(255,183,125,0.2)",
                color: "#dbc2b0", cursor: "pointer", fontFamily: "'Inter', sans-serif",
                transition: "all 0.2s ease",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,183,125,0.18)"; (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,183,125,0.08)"; (e.currentTarget as HTMLButtonElement).style.color = "#dbc2b0"; }}
              >{ind.tag}</button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Marquee ticker ────────────────────────────────────────────────── */}
      <div style={{ background: "var(--surface-low)", borderTop: "1px solid rgba(255,183,125,0.06)", borderBottom: "1px solid rgba(255,183,125,0.06)", padding: "14px 0", overflow: "hidden" }}>
        <div className="animate-marquee" style={{ display: "flex", gap: 40, whiteSpace: "nowrap", width: "200%" }}>
          {[...industries, ...industries].map((ind, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 12, fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(219,194,176,0.35)", fontFamily: "'Inter', sans-serif", flexShrink: 0 }}>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,183,125,0.4)", display: "inline-block" }} />
              {ind.tag}
            </span>
          ))}
        </div>
      </div>

      {/* ── Sticky Jump Nav ───────────────────────────────────────────────── */}
      {!mobile && (
        <div style={{
          position: "sticky", top: 64, zIndex: 40,
          background: "rgba(13,13,13,0.95)", backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,183,125,0.06)",
          padding: "12px 48px",
        }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {industries.map(ind => (
              <button key={ind.id} onClick={() => scrollToIndustry(ind.id)} style={{
                padding: "7px 16px", borderRadius: 100, fontSize: 12, fontWeight: 600,
                background: activeIndustry === ind.id ? "rgba(255,183,125,0.18)" : "transparent",
                border: activeIndustry === ind.id ? "1px solid rgba(255,183,125,0.4)" : "1px solid transparent",
                color: activeIndustry === ind.id ? "#ffb77d" : "rgba(219,194,176,0.5)",
                cursor: "pointer", fontFamily: "'Inter', sans-serif",
                transition: "all 0.25s ease",
              }}>{ind.tag}</button>
            ))}
          </div>
        </div>
      )}

      {/* ── Industry Sections ─────────────────────────────────────────────── */}
      {industries.map((ind, i) => (
        <UseCaseSection key={ind.id} reverse={i % 2 === 1} {...ind} />
      ))}

      {/* ── Why WhatsApp ──────────────────────────────────────────────────── */}
      <section ref={whyView.ref} style={{
        background: "var(--surface-low)", padding: mobile ? "80px 20px" : "100px 48px",
        borderTop: "1px solid rgba(255,183,125,0.06)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#ffb77d", fontFamily: "'Inter', sans-serif", display: "block", marginBottom: 12 }}>The numbers</span>
          <h2 style={{
            fontSize: "clamp(28px,3.5vw,44px)", fontWeight: 800, letterSpacing: "-0.04em",
            color: "#e5e2e1", fontFamily: "'Inter', sans-serif", marginBottom: 56,
            opacity: whyView.inView ? 1 : 0, transform: whyView.inView ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
          }}>
            Why WhatsApp is the<br />
            <span style={{ color: "#ffb77d" }}>highest ROI channel</span>
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)",
            gap: 20,
            opacity: whyView.inView ? 1 : 0, transform: whyView.inView ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.9s 0.1s ease, transform 0.9s 0.1s ease",
          }}>
            {whyStats.map(s => (
              <div key={s.stat} style={{
                background: "var(--surface)", border: "1px solid rgba(255,183,125,0.12)",
                borderRadius: 16, padding: "40px 32px",
              }}>
                <div style={{ fontSize: "clamp(44px,5vw,64px)", fontWeight: 900, letterSpacing: "-0.04em", color: "#ffb77d", fontFamily: "'Inter', sans-serif", marginBottom: 12 }}>{s.stat}</div>
                <div style={{ fontSize: 14, color: "rgba(219,194,176,0.6)", fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section ref={ctaView.ref} style={{
        background: "var(--bg)", padding: mobile ? "80px 20px" : "100px 48px",
        borderTop: "1px solid rgba(255,183,125,0.08)",
      }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{
            fontSize: "clamp(28px,3.5vw,48px)", fontWeight: 800, letterSpacing: "-0.04em",
            color: "#e5e2e1", fontFamily: "'Inter', sans-serif", marginBottom: 16,
            opacity: ctaView.inView ? 1 : 0, transform: ctaView.inView ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
          }}>
            Start your WhatsApp CRM<br />journey today.
          </h2>
          <p style={{
            fontSize: 16, color: "rgba(219,194,176,0.6)", lineHeight: 1.7,
            fontFamily: "'Inter', sans-serif", marginBottom: 36,
            opacity: ctaView.inView ? 1 : 0, transition: "opacity 0.8s 0.1s ease",
          }}>
            Free trial. No credit card required. Setup in under 5 minutes.
          </p>
          <a href={APP_REGISTER_URL} className="btn-primary" style={{
            padding: "16px 40px", borderRadius: 100, fontSize: 15, fontWeight: 800,
            textDecoration: "none", fontFamily: "'Inter', sans-serif", display: "inline-block",
            opacity: ctaView.inView ? 1 : 0, transform: ctaView.inView ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.8s 0.2s ease, transform 0.8s 0.2s ease",
          }}>Get started for free</a>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <SiteFooter />
    </>
  );
}
