"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useBreakpoint, APP_REGISTER_URL, APP_LOGIN_URL } from "@/lib/wazelo";
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
                color: "rgba(219,194,176,0.8)", textDecoration: "none",
                fontFamily: "'Inter', sans-serif", borderBottom: "1px solid rgba(255,183,125,0.06)",
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

// ─── Section ─────────────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#e5e2e1", fontFamily: "'Inter', sans-serif", marginBottom: 16, letterSpacing: "-0.02em" }}>{title}</h2>
      {children}
    </div>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 15, color: "rgba(219,194,176,0.65)", lineHeight: 1.85, fontFamily: "'Inter', sans-serif", marginBottom: 14 }}>{children}</p>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li style={{ fontSize: 15, color: "rgba(219,194,176,0.65)", lineHeight: 1.85, fontFamily: "'Inter', sans-serif", marginBottom: 8, paddingLeft: 4 }}>{children}</li>
  );
}

// ─── Privacy Page ─────────────────────────────────────────────────────────────
export default function PrivacyPage() {
  const { mobile } = useBreakpoint();

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
      <Navbar />

      <main style={{ background: "var(--bg)", paddingTop: 96 }}>
        {/* Hero */}
        <div style={{ background: "#131313", borderBottom: "1px solid rgba(255,183,125,0.06)", padding: mobile ? "48px 20px" : "64px 48px" }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px",
              borderRadius: 100, background: "rgba(255,183,125,0.08)", border: "1px solid rgba(255,183,125,0.2)",
              marginBottom: 20,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ffb77d", display: "inline-block" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#ffb77d", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Inter', sans-serif" }}>Legal</span>
            </div>
            <h1 style={{ fontSize: mobile ? "clamp(28px,7vw,44px)" : "clamp(32px,3.5vw,52px)", fontWeight: 900, letterSpacing: "-0.04em", color: "#fff", fontFamily: "'Inter', sans-serif", marginBottom: 16 }}>
              Privacy Policy
            </h1>
            <p style={{ fontSize: 14, color: "rgba(219,194,176,0.45)", fontFamily: "'Inter', sans-serif" }}>
              Last updated: April 19, 2025 · Effective for all Wazelo CRM users
            </p>
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 800, margin: "0 auto", padding: mobile ? "56px 20px 80px" : "72px 48px 100px" }}>

          <Section title="1. Introduction">
            <P>Wazelo CRM ("we", "our", or "us") is committed to protecting the privacy of our users. This Privacy Policy explains how we collect, use, store, and share information when you use our platform at wazelo.in and its related services (collectively, the "Service").</P>
            <P>By using Wazelo CRM, you agree to the collection and use of information in accordance with this policy. If you do not agree, please discontinue use of the Service.</P>
          </Section>

          <Section title="2. Information We Collect">
            <P>We collect the following categories of information:</P>
            <ul style={{ paddingLeft: 20, marginBottom: 14 }}>
              <Li><strong style={{ color: "#e5e2e1" }}>Account information:</strong> Name, email address, phone number, company name, and password when you register.</Li>
              <Li><strong style={{ color: "#e5e2e1" }}>WhatsApp Business data:</strong> Your WhatsApp Business Account ID, phone number linked to the Meta Business API, and message templates.</Li>
              <Li><strong style={{ color: "#e5e2e1" }}>Contact data:</strong> Information about your customers and leads that you import or that is captured through conversations.</Li>
              <Li><strong style={{ color: "#e5e2e1" }}>Message content:</strong> WhatsApp message content transmitted through the platform for the purpose of delivering the Service.</Li>
              <Li><strong style={{ color: "#e5e2e1" }}>Usage data:</strong> Pages visited, features used, session duration, IP address, browser type, and device identifiers.</Li>
              <Li><strong style={{ color: "#e5e2e1" }}>Billing data:</strong> Payment details processed securely through our payment provider (Stripe / Razorpay). We do not store full card numbers.</Li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <P>We use the information we collect to:</P>
            <ul style={{ paddingLeft: 20, marginBottom: 14 }}>
              <Li>Provide, maintain, and improve the Wazelo CRM platform</Li>
              <Li>Process transactions and send billing-related communications</Li>
              <Li>Send service updates, security alerts, and support messages</Li>
              <Li>Analyse usage patterns to improve features and performance</Li>
              <Li>Comply with legal obligations and enforce our Terms of Service</Li>
              <Li>Respond to customer support requests</Li>
            </ul>
            <P>We do not sell your personal data or your customers' data to third parties. We do not use message content for advertising purposes.</P>
          </Section>

          <Section title="4. Data Storage & Security">
            <P>All data is stored on servers located in India or within AWS regions compliant with Indian data localisation guidelines. We use industry-standard security measures including:</P>
            <ul style={{ paddingLeft: 20, marginBottom: 14 }}>
              <Li>TLS 1.2+ encryption for all data in transit</Li>
              <Li>AES-256 encryption for sensitive data at rest</Li>
              <Li>Role-based access controls limiting internal data access</Li>
              <Li>Regular security audits and vulnerability assessments</Li>
            </ul>
            <P>While we take all reasonable steps to protect your data, no method of transmission over the internet is 100% secure.</P>
          </Section>

          <Section title="5. Data Retention">
            <P>We retain your account data for as long as your account is active, or as needed to provide you with the Service. If you close your account, we will delete or anonymise your personal data within 30 days, except where we are required to retain it for legal or tax compliance purposes.</P>
            <P>Message logs may be retained for up to 90 days for debugging and compliance purposes, after which they are permanently deleted.</P>
          </Section>

          <Section title="6. Sharing of Information">
            <P>We may share your information with:</P>
            <ul style={{ paddingLeft: 20, marginBottom: 14 }}>
              <Li><strong style={{ color: "#e5e2e1" }}>Meta Platforms:</strong> To deliver WhatsApp messages via the WhatsApp Business API, as required by Meta's terms.</Li>
              <Li><strong style={{ color: "#e5e2e1" }}>Payment processors:</strong> Stripe or Razorpay, for processing subscription payments securely.</Li>
              <Li><strong style={{ color: "#e5e2e1" }}>Infrastructure providers:</strong> AWS for hosting and storage, subject to data processing agreements.</Li>
              <Li><strong style={{ color: "#e5e2e1" }}>Legal requirements:</strong> When required by law, court order, or government authority.</Li>
            </ul>
            <P>All third-party processors are bound by data processing agreements and are prohibited from using your data for their own purposes.</P>
          </Section>

          <Section title="7. Cookies & Tracking">
            <P>We use cookies and similar tracking technologies to maintain sessions, remember preferences, and analyse platform usage. You can control cookie settings through your browser. Disabling cookies may affect certain features of the Service.</P>
            <P>We use analytics tools (such as PostHog or similar) to understand how users interact with the platform. This data is aggregated and anonymised.</P>
          </Section>

          <Section title="8. Your Rights">
            <P>Depending on your jurisdiction, you may have the right to:</P>
            <ul style={{ paddingLeft: 20, marginBottom: 14 }}>
              <Li>Access the personal data we hold about you</Li>
              <Li>Request correction of inaccurate data</Li>
              <Li>Request deletion of your data ("right to be forgotten")</Li>
              <Li>Object to or restrict processing of your data</Li>
              <Li>Data portability — receive your data in a machine-readable format</Li>
            </ul>
            <P>To exercise any of these rights, email us at <a href="mailto:privacy@wazelo.in" style={{ color: "#ffb77d", textDecoration: "none" }}>privacy@wazelo.in</a>. We will respond within 30 days.</P>
          </Section>

          <Section title="9. Children's Privacy">
            <P>Wazelo CRM is not directed at children under the age of 18. We do not knowingly collect personal information from minors. If you believe a minor has provided us with personal data, contact us and we will delete it promptly.</P>
          </Section>

          <Section title="10. Changes to This Policy">
            <P>We may update this Privacy Policy from time to time. We will notify you of significant changes by email or by posting a prominent notice in the platform. Continued use of the Service after changes constitutes your acceptance of the updated policy.</P>
          </Section>

          <Section title="11. Contact Us">
            <P>For privacy-related questions or requests, contact us at:</P>
            <div style={{ background: "#1c1b1b", border: "1px solid rgba(255,183,125,0.1)", borderRadius: 10, padding: "20px 24px" }}>
              <p style={{ fontSize: 14, color: "#e5e2e1", fontFamily: "'Inter', sans-serif", marginBottom: 4, fontWeight: 600 }}>Wazelo CRM</p>
              <p style={{ fontSize: 14, color: "rgba(219,194,176,0.6)", fontFamily: "'Inter', sans-serif", marginBottom: 4 }}>Email: <a href="mailto:privacy@wazelo.in" style={{ color: "#ffb77d", textDecoration: "none" }}>privacy@wazelo.in</a></p>
              <p style={{ fontSize: 14, color: "rgba(219,194,176,0.6)", fontFamily: "'Inter', sans-serif" }}>Website: <a href="https://wazelo.in" style={{ color: "#ffb77d", textDecoration: "none" }}>wazelo.in</a></p>
            </div>
          </Section>

        </div>
      </main>

      <SiteFooter />
    </>
  );
}
