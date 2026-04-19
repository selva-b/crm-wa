"use client";
import FeatureDetailPage, { type FeatureDetailData } from "@/components/FeatureDetailPage";

const data: FeatureDetailData = {
  slug: "shared-inbox",
  tag: "Shared Inbox",
  heroTitle: "Your whole team.<br /><span style=\"color:#ffb77d\">One inbox.</span>",
  heroSubtitle: "Every WhatsApp conversation — routed, assigned, and resolved from a single shared workspace. No lead ever falls through again.",
  heroScreen: "/screens/01-inbox-shared-team.png",
  overviewTitle: "One inbox. Zero chaos.",
  overviewDesc: "When your team manages customer conversations across personal WhatsApp numbers, messages get missed and accountability disappears. Wazelo CRM's shared inbox gives every agent a unified view — with real-time routing, clear ownership, and full conversation history — so your team can deliver fast, consistent support at scale.",
  capabilities: [
    { icon: "forum", title: "Unified conversation view", desc: "All incoming WhatsApp messages appear in one shared queue. No agent works in isolation." },
    { icon: "assignment_ind", title: "Smart assignment", desc: "Route conversations by agent, team, or keyword rules. Manual or automatic — you choose." },
    { icon: "swap_horiz", title: "Transfer & escalate", desc: "Hand off conversations between agents with full context preserved. No customer ever has to repeat themselves." },
    { icon: "check_circle", title: "Resolve & reopen", desc: "Mark conversations resolved when done. Reopen instantly if the customer follows up." },
    { icon: "visibility", title: "Live agent presence", desc: "See who is online, who is typing, and which conversations are being handled right now." },
    { icon: "history", title: "Full conversation history", desc: "Every message, note, and file ever exchanged — searchable, forever. Context at your fingertips." },
  ],
  howItWorks: [
    { step: "01", title: "Connect your WhatsApp Business number", desc: "Link your Meta-approved WhatsApp Business API number to Wazelo CRM in under 5 minutes." },
    { step: "02", title: "Invite your team", desc: "Add agents and set their roles. Admins get full access; agents see only their assigned conversations." },
    { step: "03", title: "Set routing rules", desc: "Define how incoming messages are assigned — round-robin, keyword-based, or manual." },
    { step: "04", title: "Reply, resolve, grow", desc: "Your team works from the shared inbox — responding faster, collaborating better, and never missing a message." },
  ],
  screens: [
    { src: "/screens/05-contacts-management.png", caption: "Contact profiles linked to conversations" },
    { src: "/screens/09-csat-surveys.png", caption: "Automatic CSAT surveys after resolution" },
  ],
  relatedFeatures: [
    { label: "Bulk Campaigns", href: "/features/campaigns", icon: "campaign" },
    { label: "Automation", href: "/features/automation", icon: "bolt" },
    { label: "Analytics", href: "/features/analytics", icon: "bar_chart" },
    { label: "Contacts CRM", href: "/features/contacts", icon: "group" },
  ],
};

export default function Page() {
  return <FeatureDetailPage data={data} />;
}
