"use client";
import FeatureDetailPage, { type FeatureDetailData } from "@/components/FeatureDetailPage";

const data: FeatureDetailData = {
  slug: "lead-scoring",
  tag: "Lead Scoring",
  heroTitle: "Know who to call<br /><span style=\"color:#ffb77d\">first. Always.</span>",
  heroSubtitle: "Automatic lead scoring based on engagement, profile completeness, and behaviour — so your team focuses on the hottest leads, not the longest queue.",
  heroScreen: "",
  overviewTitle: "Not every lead deserves equal attention.",
  overviewDesc: "When 300 contacts message you in a day, your team can't treat them all equally. Wazelo CRM's lead scoring engine assigns a score to every contact based on their WhatsApp engagement, how complete their profile is, which campaigns they responded to, and whether they've been tagged as qualified. High-score leads rise to the top. Low-score leads wait their turn.",
  capabilities: [
    { icon: "query_stats", title: "Automatic score calculation", desc: "Scores are calculated continuously based on engagement signals — no manual input required." },
    { icon: "tune", title: "Configurable scoring rules", desc: "Set which actions add or subtract score points: replied to campaign, opened chatbot, tag added, field filled." },
    { icon: "sort", title: "Sorted inbox view", desc: "Sort your inbox by lead score so agents always work the highest-value conversations first." },
    { icon: "label", title: "Score-based tagging", desc: "Automatically tag contacts as 'Hot', 'Warm', or 'Cold' when their score crosses a threshold." },
    { icon: "bolt", title: "Trigger automations on score", desc: "Use lead score as a workflow trigger — enrol a hot lead in a sequence, or alert a senior agent." },
    { icon: "insights", title: "Score distribution report", desc: "See how your lead base is distributed across score ranges. Identify bottlenecks in your qualification funnel." },
  ],
  howItWorks: [
    { step: "01", title: "Define your scoring rules", desc: "Set which signals increase or decrease a lead's score. Examples: +20 for replying to a campaign, +10 for filling a custom field, -15 for 7 days of no response." },
    { step: "02", title: "Scores update automatically", desc: "As contacts engage or disengage, their scores update in real time. No manual scoring or spreadsheet maintenance." },
    { step: "03", title: "Surface high-priority leads", desc: "Sort the inbox or contact list by score. Agents always see which conversations are worth the most attention." },
    { step: "04", title: "Act on score thresholds", desc: "When a contact crosses a score threshold, trigger an automation: enrol in a sequence, assign to a senior agent, or send an alert." },
  ],
  screens: [],
  relatedFeatures: [
    { label: "Contacts CRM", href: "/features/contacts", icon: "group" },
    { label: "Automation", href: "/features/automation", icon: "bolt" },
    { label: "Sequences", href: "/features/sequences", icon: "low_priority" },
    { label: "Deals Pipeline", href: "/features/deals", icon: "trending_up" },
  ],
};

export default function Page() {
  return <FeatureDetailPage data={data} />;
}
