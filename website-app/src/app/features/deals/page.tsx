"use client";
import FeatureDetailPage, { type FeatureDetailData } from "@/components/FeatureDetailPage";

const data: FeatureDetailData = {
  slug: "deals",
  tag: "Deals Pipeline",
  heroTitle: "Your pipeline.<br /><span style=\"color:#ffb77d\">Always full.</span>",
  heroSubtitle: "A full CRM-style sales pipeline built into your WhatsApp workflow. Track deal stages, values, close dates, and owners — without switching tools.",
  heroScreen: "",
  overviewTitle: "Stop losing deals in DMs.",
  overviewDesc: "Most WhatsApp sales teams track deals in their heads, on paper, or in a spreadsheet they never update. Wazelo CRM gives you a Kanban-style pipeline where every deal is linked to a WhatsApp conversation, a contact, and a stage — so your team sees exactly what's open, what's stalled, and what's about to close.",
  capabilities: [
    { icon: "view_kanban", title: "Kanban deal board", desc: "Visualise every open deal across your custom pipeline stages. Drag to move, click to open." },
    { icon: "attach_money", title: "Deal value & close date", desc: "Set expected revenue and expected close date per deal. Your forecast updates in real time." },
    { icon: "assignment_ind", title: "Deal owner assignment", desc: "Assign each deal to the agent or team responsible. Accountability at every stage." },
    { icon: "forum", title: "Linked conversation", desc: "Every deal is linked to a WhatsApp conversation thread. Full context, always one click away." },
    { icon: "history", title: "Deal activity log", desc: "Automatic log of every stage change, note, and file attached to the deal." },
    { icon: "trending_up", title: "Pipeline analytics", desc: "Win rate, average deal size, time in stage, and conversion rate — tracked automatically." },
  ],
  howItWorks: [
    { step: "01", title: "Create a deal from any conversation", desc: "Open any WhatsApp conversation and create a deal in two clicks. Contact details, tags, and history carry over automatically." },
    { step: "02", title: "Set your pipeline stages", desc: "Define your own stages — e.g. New Lead, Qualified, Proposal Sent, Negotiation, Won. Drag deals between stages as they progress." },
    { step: "03", title: "Log notes and set close dates", desc: "Add internal notes, set deal values, and pick an expected close date. Use these to prioritise your daily follow-ups." },
    { step: "04", title: "Review your forecast", desc: "Open the pipeline analytics view to see total open value, win rate, and which stage is becoming a bottleneck for your team." },
  ],
  screens: [],
  relatedFeatures: [
    { label: "Shared Inbox", href: "/features/shared-inbox", icon: "forum" },
    { label: "Contacts CRM", href: "/features/contacts", icon: "group" },
    { label: "Lead Scoring", href: "/features/lead-scoring", icon: "query_stats" },
    { label: "Sequences", href: "/features/sequences", icon: "low_priority" },
  ],
};

export default function Page() {
  return <FeatureDetailPage data={data} />;
}
