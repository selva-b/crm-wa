"use client";
import FeatureDetailPage, { type FeatureDetailData } from "@/components/FeatureDetailPage";

const data: FeatureDetailData = {
  slug: "multi-channel",
  tag: "Multi-Channel",
  heroTitle: "Every channel.<br /><span style=\"color:#ffb77d\">One inbox.</span>",
  heroSubtitle: "Manage WhatsApp, Instagram DMs, Facebook Messenger, and Email conversations from a single shared inbox — with the same automations, routing, and analytics across all channels.",
  heroScreen: "",
  overviewTitle: "Your customers don't stay on one channel.",
  overviewDesc: "A lead might find you on Instagram, message on WhatsApp, and follow up by email. Without a unified inbox, your team handles each channel in a different tool — missing context, duplicating work, and delivering inconsistent experiences. Wazelo CRM brings WhatsApp, Instagram DMs, Facebook Messenger, and Email into a single workspace where every conversation is managed, routed, and tracked the same way.",
  capabilities: [
    { icon: "devices", title: "Unified multi-channel inbox", desc: "WhatsApp, Instagram DMs, Facebook Messenger, and Email — all in one shared queue. One workflow, all channels." },
    { icon: "account_tree", title: "Cross-channel routing", desc: "Apply the same assignment rules and automation workflows across all channels. No duplicate setup." },
    { icon: "manage_history", title: "Unified contact timeline", desc: "See every message a contact has ever sent — across all channels — in a single conversation timeline." },
    { icon: "bolt", title: "Multi-channel automations", desc: "Build workflows that trigger and act across channels. Auto-reply on Instagram, follow up on WhatsApp." },
    { icon: "bar_chart", title: "Per-channel analytics", desc: "Volume, response time, and CSAT broken down by channel — so you know where to focus investment." },
    { icon: "verified", title: "Consistent brand experience", desc: "Same tone, same SLAs, same escalation path — regardless of which channel the customer chose." },
  ],
  howItWorks: [
    { step: "01", title: "Connect your channels", desc: "Link your WhatsApp Business number, Instagram account, Facebook Page, and email inbox in the Channels settings. Each connection is authorised via OAuth." },
    { step: "02", title: "All messages arrive in one inbox", desc: "Every incoming message from every connected channel lands in the shared inbox queue — with a channel badge showing its origin." },
    { step: "03", title: "Apply the same rules", desc: "Your routing rules, auto-replies, and automation workflows apply across all channels automatically. Build once, run everywhere." },
    { step: "04", title: "Report across channels", desc: "Your analytics dashboard shows volume, response time, and CSAT for each channel side by side — so you can compare and optimise." },
  ],
  screens: [],
  relatedFeatures: [
    { label: "Shared Inbox", href: "/features/shared-inbox", icon: "forum" },
    { label: "Automation", href: "/features/automation", icon: "bolt" },
    { label: "Analytics", href: "/features/analytics", icon: "bar_chart" },
    { label: "Chatbot Builder", href: "/features/chatbot", icon: "smart_toy" },
  ],
};

export default function Page() {
  return <FeatureDetailPage data={data} />;
}
