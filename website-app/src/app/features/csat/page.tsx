"use client";
import FeatureDetailPage, { type FeatureDetailData } from "@/components/FeatureDetailPage";

const data: FeatureDetailData = {
  slug: "csat",
  tag: "CSAT Surveys",
  heroTitle: "Know how customers<br /><span style=\"color:#ffb77d\">really feel.</span>",
  heroSubtitle: "Automatically send satisfaction surveys after every resolved WhatsApp conversation. Collect scores, read responses, and identify your best and worst-performing agents.",
  heroScreen: "/screens/09-csat-surveys.png",
  overviewTitle: "Every resolved conversation is a data point.",
  overviewDesc: "CSAT surveys are usually an afterthought — a form link nobody clicks. Wazelo CRM sends satisfaction surveys directly on WhatsApp, immediately after a conversation is marked resolved, with quick-tap rating buttons so customers respond in 2 seconds. Every score is automatically linked to the agent and conversation, giving you a real, unbiased view of team performance.",
  capabilities: [
    { icon: "star_rate", title: "Automatic post-resolution surveys", desc: "Survey sends the moment a conversation is marked resolved. No manual trigger required." },
    { icon: "thumbs_up_down", title: "1–5 star or thumbs rating", desc: "Choose your rating format — numeric scale or thumbs up/down. Tapping sends the response instantly." },
    { icon: "message", title: "Open-ended follow-up", desc: "After the rating, optionally ask a follow-up question to capture qualitative feedback." },
    { icon: "person_search", title: "Per-agent scoring", desc: "Every CSAT score is linked to the agent who handled the conversation. Agent leaderboards update in real time." },
    { icon: "bar_chart", title: "CSAT analytics dashboard", desc: "Average score by agent, team, date range, and conversation tag. Spot trends before they become problems." },
    { icon: "notifications", title: "Low-score alerts", desc: "Get notified immediately when a contact gives a 1 or 2-star rating so you can follow up fast." },
  ],
  howItWorks: [
    { step: "01", title: "Enable CSAT for your team", desc: "Turn on CSAT surveys in your settings and choose your rating format. One toggle — no template approvals needed." },
    { step: "02", title: "Survey sends automatically", desc: "When any agent marks a conversation resolved, the CSAT message is sent to the customer on WhatsApp within seconds." },
    { step: "03", title: "Customer taps a rating", desc: "The customer sees a rating message and taps their score. No forms, no links, no friction." },
    { step: "04", title: "Track scores in real time", desc: "Every response appears in your CSAT dashboard. Filter by agent, date, or tag to understand performance across your team." },
  ],
  screens: [],
  relatedFeatures: [
    { label: "Shared Inbox", href: "/features/shared-inbox", icon: "forum" },
    { label: "Analytics", href: "/features/analytics", icon: "bar_chart" },
    { label: "Automation", href: "/features/automation", icon: "bolt" },
    { label: "Bulk Campaigns", href: "/features/campaigns", icon: "campaign" },
  ],
};

export default function Page() {
  return <FeatureDetailPage data={data} />;
}
