"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useInView, useBreakpoint, APP_REGISTER_URL, APP_LOGIN_URL } from "@/lib/wazelo";
import SiteFooter from "@/components/Footer";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface FeatureDetailData {
  slug: string;
  tag: string;
  heroTitle: string;
  heroSubtitle: string;
  heroScreen: string;
  overviewTitle: string;
  overviewDesc: string;
  capabilities: { icon: string; title: string; desc: string }[];
  howItWorks: { step: string; title: string; desc: string }[];
  screens: { src: string; caption: string }[];
  relatedFeatures: { label: string; href: string; icon: string }[];
}

// ─── Shared Navbar ────────────────────────────────────────────────────────────
function Navbar({ activeSlug }: { activeSlug: string }) {
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
                color: label === "Features" ? "#ffb77d" : "rgba(219,194,176,0.75)",
                fontFamily: "'Inter', sans-serif", transition: "color 0.2s",
              }}
                onMouseEnter={e => ((e.target as HTMLAnchorElement).style.color = "#e5e2e1")}
                onMouseLeave={e => ((e.target as HTMLAnchorElement).style.color = label === "Features" ? "#ffb77d" : "rgba(219,194,176,0.75)")}
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
              <span style={{ display: "block", width: 22, height: 2, background: menuOpen ? "#ffb77d" : "#e5e2e1", transition: "all 0.3s", transform: menuOpen ? "rotate(45deg) translate(5px,5px)" : "none" }} />
              <span style={{ display: "block", width: 22, height: 2, background: menuOpen ? "#ffb77d" : "#e5e2e1", transition: "all 0.3s", opacity: menuOpen ? 0 : 1 }} />
              <span style={{ display: "block", width: 22, height: 2, background: menuOpen ? "#ffb77d" : "#e5e2e1", transition: "all 0.3s", transform: menuOpen ? "rotate(-45deg) translate(5px,-5px)" : "none" }} />
            </button>
          )}
        </div>
      </div>

      {mobile && (
        <div style={{ maxHeight: menuOpen ? 400 : 0, overflow: "hidden", transition: "max-height 0.35s ease", background: "rgba(13,13,13,0.98)", borderTop: menuOpen ? "1px solid rgba(255,183,125,0.08)" : "none" }}>
          <div style={{ padding: "16px 20px 20px", display: "flex", flexDirection: "column", gap: 0 }}>
            {navLinks.map(([label, href]) => (
              <a key={label} href={href} onClick={() => setMenuOpen(false)} style={{ padding: "14px 0", fontSize: 16, fontWeight: 500, color: "rgba(219,194,176,0.8)", textDecoration: "none", fontFamily: "'Inter', sans-serif", borderBottom: "1px solid rgba(255,183,125,0.06)" }}>{label}</a>
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

// ─── Capability Card ──────────────────────────────────────────────────────────
function CapabilityCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="feature-card" style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 16, padding: "28px 24px",
    }}>
      <span className="material-symbols-outlined card-icon" style={{ fontSize: 26, color: "#ffb77d", marginBottom: 14, display: "block" }}>{icon}</span>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#e5e2e1", marginBottom: 8, fontFamily: "'Inter', sans-serif" }}>{title}</h3>
      <p style={{ fontSize: 13, color: "rgba(219,194,176,0.6)", lineHeight: 1.75, fontFamily: "'Inter', sans-serif" }}>{desc}</p>
    </div>
  );
}

// ─── Main Feature Detail Page ─────────────────────────────────────────────────
export default function FeatureDetailPage({ data }: { data: FeatureDetailData }) {
  const { mobile, tablet } = useBreakpoint();

  const heroView   = useInView(0.05);
  const overView   = useInView(0.15);
  const capsView   = useInView(0.1);
  const howView    = useInView(0.1);
  const screensView = useInView(0.1);
  const relatedView = useInView(0.15);
  const ctaView    = useInView(0.2);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
      <Navbar activeSlug={data.slug} />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section ref={heroView.ref} style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: mobile ? "120px 20px 60px" : "120px 48px 60px",
        background: "var(--bg)", position: "relative", overflow: "hidden",
      }}>
        {/* Ambient glow */}
        <div style={{ position: "absolute", top: "35%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle,rgba(217,119,6,0.07) 0%,transparent 70%)", pointerEvents: "none" }} />

        <div style={{ textAlign: "center", maxWidth: 860, position: "relative", zIndex: 1 }}>
          {/* Breadcrumb */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 28,
            opacity: heroView.inView ? 1 : 0, transition: "opacity 0.7s ease",
          }}>
            <a href="/#features" style={{ fontSize: 12, color: "rgba(219,194,176,0.4)", textDecoration: "none", fontFamily: "'Inter', sans-serif" }}>Features</a>
            <span style={{ fontSize: 12, color: "rgba(219,194,176,0.2)", fontFamily: "'Inter', sans-serif" }}>/</span>
            <span style={{ fontSize: 12, color: "#ffb77d", fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>{data.tag}</span>
          </div>

          <h1 style={{
            fontSize: "clamp(36px,5.5vw,76px)", fontWeight: 900, letterSpacing: "-0.04em",
            lineHeight: 1.06, color: "#fff", fontFamily: "'Inter', sans-serif", marginBottom: 24,
            opacity: heroView.inView ? 1 : 0, transform: heroView.inView ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.9s 0.08s ease, transform 0.9s 0.08s ease",
          }}
            dangerouslySetInnerHTML={{ __html: data.heroTitle }}
          />

          <p style={{
            fontSize: "clamp(15px,1.6vw,18px)", color: "rgba(219,194,176,0.7)", lineHeight: 1.8,
            maxWidth: 580, margin: "0 auto 40px", fontFamily: "'Inter', sans-serif",
            opacity: heroView.inView ? 1 : 0, transform: heroView.inView ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.9s 0.18s ease, transform 0.9s 0.18s ease",
          }}>
            {data.heroSubtitle}
          </p>

          <div style={{
            display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center",
            opacity: heroView.inView ? 1 : 0, transition: "opacity 0.9s 0.28s ease",
          }}>
            <a href={APP_REGISTER_URL} className="btn-primary" style={{
              padding: "14px 32px", borderRadius: 100, fontSize: 14, fontWeight: 800,
              textDecoration: "none", fontFamily: "'Inter', sans-serif", display: "inline-block",
            }}>Start Free Trial</a>
            <a href="/#features" className="btn-ghost" style={{
              padding: "14px 32px", borderRadius: 100, fontSize: 14, fontWeight: 600,
              textDecoration: "none", fontFamily: "'Inter', sans-serif", display: "inline-block",
            }}>See all features</a>
          </div>
        </div>

        {/* Hero screenshot */}
        {data.heroScreen && (
          <div style={{
            marginTop: 64, maxWidth: 1100, width: "100%", position: "relative", zIndex: 1,
            opacity: heroView.inView ? 1 : 0, transform: heroView.inView ? "translateY(0) scale(1)" : "translateY(32px) scale(0.97)",
            transition: "opacity 1s 0.4s ease, transform 1s 0.4s ease",
          }}>
            <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,183,125,0.15)", boxShadow: "0 40px 120px rgba(0,0,0,0.6)" }}>
              <Image src={data.heroScreen} alt={data.tag} width={1280} height={720} style={{ width: "100%", height: "auto", display: "block" }} priority />
            </div>
          </div>
        )}
      </section>

      {/* ── Overview ──────────────────────────────────────────────────────── */}
      <section ref={overView.ref} style={{
        background: "var(--surface-low)", padding: mobile ? "80px 20px" : "100px 48px",
        borderTop: "1px solid rgba(255,183,125,0.06)",
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <div style={{
            width: 40, height: 2, background: "linear-gradient(to right,#ffb77d,#d97707)", margin: "0 auto 32px",
            opacity: overView.inView ? 1 : 0, transition: "opacity 0.8s ease",
          }} />
          <h2 style={{
            fontSize: "clamp(24px,3vw,40px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.2,
            color: "#e5e2e1", fontFamily: "'Inter', sans-serif", marginBottom: 20,
            opacity: overView.inView ? 1 : 0, transform: overView.inView ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.9s 0.05s ease, transform 0.9s 0.05s ease",
          }}>{data.overviewTitle}</h2>
          <p style={{
            fontSize: 16, color: "rgba(219,194,176,0.65)", lineHeight: 1.85, fontFamily: "'Inter', sans-serif",
            opacity: overView.inView ? 1 : 0, transition: "opacity 0.9s 0.15s ease",
          }}>{data.overviewDesc}</p>
        </div>
      </section>

      {/* ── Capabilities ──────────────────────────────────────────────────── */}
      <section ref={capsView.ref} style={{
        background: "var(--bg)", padding: mobile ? "80px 20px" : "100px 48px",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#ffb77d", fontFamily: "'Inter', sans-serif", display: "block", marginBottom: 12 }}>What you can do</span>
            <h2 style={{
              fontSize: "clamp(24px,3vw,40px)", fontWeight: 800, letterSpacing: "-0.04em",
              color: "#e5e2e1", fontFamily: "'Inter', sans-serif",
              opacity: capsView.inView ? 1 : 0, transform: capsView.inView ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.8s ease, transform 0.8s ease",
            }}>Key capabilities</h2>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: mobile ? "1fr" : tablet ? "1fr 1fr" : "repeat(3, 1fr)",
            gap: 16,
            opacity: capsView.inView ? 1 : 0, transform: capsView.inView ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.9s 0.1s ease, transform 0.9s 0.1s ease",
          }}>
            {data.capabilities.map(c => <CapabilityCard key={c.title} {...c} />)}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section ref={howView.ref} style={{
        background: "var(--surface-low)", padding: mobile ? "80px 20px" : "100px 48px",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#ffb77d", fontFamily: "'Inter', sans-serif", display: "block", marginBottom: 12 }}>How it works</span>
            <h2 style={{
              fontSize: "clamp(24px,3vw,40px)", fontWeight: 800, letterSpacing: "-0.04em",
              color: "#e5e2e1", fontFamily: "'Inter', sans-serif",
              opacity: howView.inView ? 1 : 0, transition: "opacity 0.8s ease",
            }}>Up and running in minutes</h2>
          </div>
          <div style={{
            display: "flex", flexDirection: "column", gap: 0,
            opacity: howView.inView ? 1 : 0, transition: "opacity 0.9s 0.1s ease",
          }}>
            {data.howItWorks.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: mobile ? 20 : 40, alignItems: "flex-start", paddingBottom: i < data.howItWorks.length - 1 ? 40 : 0, position: "relative" }}>
                {/* Connector line */}
                {i < data.howItWorks.length - 1 && (
                  <div style={{ position: "absolute", left: mobile ? 19 : 27, top: 48, width: 2, height: "calc(100% - 20px)", background: "linear-gradient(to bottom,rgba(255,183,125,0.3),rgba(255,183,125,0.05))" }} />
                )}
                <div style={{ width: mobile ? 40 : 56, height: mobile ? 40 : 56, borderRadius: "50%", background: "rgba(255,183,125,0.1)", border: "1px solid rgba(255,183,125,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: mobile ? 13 : 16, fontWeight: 800, color: "#ffb77d", fontFamily: "'Inter', sans-serif" }}>{step.step}</span>
                </div>
                <div style={{ paddingTop: mobile ? 8 : 14 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "#e5e2e1", fontFamily: "'Inter', sans-serif", marginBottom: 8 }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: "rgba(219,194,176,0.6)", lineHeight: 1.75, fontFamily: "'Inter', sans-serif" }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── More Screenshots ──────────────────────────────────────────────── */}
      {data.screens.length > 0 && (
        <section ref={screensView.ref} style={{
          background: "var(--bg)", padding: mobile ? "80px 20px" : "100px 48px",
        }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 52 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#ffb77d", fontFamily: "'Inter', sans-serif", display: "block", marginBottom: 12 }}>Product screenshots</span>
              <h2 style={{
                fontSize: "clamp(24px,3vw,40px)", fontWeight: 800, letterSpacing: "-0.04em",
                color: "#e5e2e1", fontFamily: "'Inter', sans-serif",
                opacity: screensView.inView ? 1 : 0, transition: "opacity 0.8s ease",
              }}>See it in action</h2>
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: mobile ? "1fr" : data.screens.length === 1 ? "1fr" : "1fr 1fr",
              gap: 20,
              opacity: screensView.inView ? 1 : 0, transform: screensView.inView ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.9s 0.1s ease, transform 0.9s 0.1s ease",
            }}>
              {data.screens.map(s => (
                <div key={s.src} style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,183,125,0.1)" }}>
                  <Image src={s.src} alt={s.caption} width={800} height={450} style={{ width: "100%", height: "auto", display: "block" }} />
                  <div style={{ padding: "12px 16px", background: "var(--surface)", borderTop: "1px solid rgba(255,183,125,0.06)" }}>
                    <p style={{ fontSize: 12, color: "rgba(219,194,176,0.4)", fontFamily: "'Inter', sans-serif", textAlign: "center" }}>{s.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Related Features ──────────────────────────────────────────────── */}
      <section ref={relatedView.ref} style={{
        background: "var(--surface-low)", padding: mobile ? "80px 20px" : "100px 48px",
        borderTop: "1px solid rgba(255,183,125,0.06)",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#ffb77d", fontFamily: "'Inter', sans-serif", display: "block", marginBottom: 12 }}>Keep exploring</span>
          <h2 style={{
            fontSize: "clamp(22px,2.5vw,36px)", fontWeight: 800, letterSpacing: "-0.04em",
            color: "#e5e2e1", fontFamily: "'Inter', sans-serif", marginBottom: 36,
            opacity: relatedView.inView ? 1 : 0, transition: "opacity 0.8s ease",
          }}>Related features</h2>
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center",
            opacity: relatedView.inView ? 1 : 0, transition: "opacity 0.9s 0.1s ease",
          }}>
            {data.relatedFeatures.map(f => (
              <a key={f.label} href={f.href} style={{
                display: "inline-flex", alignItems: "center", gap: 10, padding: "12px 20px",
                borderRadius: 12, background: "var(--surface)", border: "1px solid var(--border)",
                textDecoration: "none", transition: "border-color 0.2s, background 0.2s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,183,125,0.3)"; (e.currentTarget as HTMLAnchorElement).style.background = "var(--surface-high)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLAnchorElement).style.background = "var(--surface)"; }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#ffb77d" }}>{f.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#dbc2b0", fontFamily: "'Inter', sans-serif" }}>{f.label}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section ref={ctaView.ref} style={{
        background: "var(--bg)", padding: mobile ? "80px 20px" : "100px 48px",
        borderTop: "1px solid rgba(255,183,125,0.08)",
      }}>
        <div style={{ maxWidth: 660, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{
            fontSize: "clamp(26px,3.5vw,48px)", fontWeight: 800, letterSpacing: "-0.04em",
            color: "#e5e2e1", fontFamily: "'Inter', sans-serif", marginBottom: 16,
            opacity: ctaView.inView ? 1 : 0, transform: ctaView.inView ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
          }}>
            Ready to try <span style={{ color: "#ffb77d" }}>{data.tag}?</span>
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
            opacity: ctaView.inView ? 1 : 0, transform: ctaView.inView ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.8s 0.2s ease, transform 0.8s 0.2s ease",
          }}>Start for free</a>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <SiteFooter />
    </>
  );
}
