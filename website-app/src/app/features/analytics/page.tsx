"use client";
import FeatureDetailPage, { type FeatureDetailData } from "@/components/FeatureDetailPage";

const data: FeatureDetailData = {
  slug: "analytics",
  tag: "Analytics",
  heroTitle: "Data that<br /><span style=\"color:#ffb77d\">drives deals.</span>",
  heroSubtitle: "Track response times, delivery rates, agent performance, and CSAT scores — all in one real-time dashboard.",
  heroScreen: "/screens/04-analytics-dashboard.png",
  overviewTitle: "You can't improve what you can't measure.",
  overviewDesc: "Gut feel doesn't scale. Wazelo CRM gives you a live analytics layer across your entire WhatsApp operation — from message delivery rates and campaign performance to individual agent response times and customer satisfaction scores. Export raw data or integrate via API into your BI tool of choice.",
  capabilities: [
    { icon: "bar_chart", title: "Message delivery analytics", desc: "Track sent, delivered, read, and failed counts per campaign, channel, or time period." },
    { icon: "speed", title: "Response time tracking", desc: "Measure first response time and average resolution time per agent, team, or conversation type." },
    { icon: "person_search", title: "Agent performance", desc: "Leaderboards for conversations handled, resolution rate, and CSAT score per agent." },
    { icon: "star_rate", title: "CSAT scores", desc: "Automatic customer satisfaction surveys with aggregated scoring by agent, team, and time period." },
    { icon: "trending_up", title: "Campaign performance", desc: "Open rates, reply rates, and conversion tracking for every broadcast campaign." },
    { icon: "download", title: "Export & API", desc: "Download CSV exports or access raw analytics via REST API for use in your own BI dashboards." },
  ],
  howItWorks: [
    { step: "01", title: "Data is collected automatically", desc: "Every message sent, delivered, read, or replied — every agent action and CSAT response — is captured in real time." },
    { step: "02", title: "View your live dashboard", desc: "Open the Analytics tab for a real-time overview: today vs yesterday, week-over-week trends, and team leaderboards." },
    { step: "03", title: "Drill down into specifics", desc: "Filter by agent, date range, campaign, or conversation tag to isolate exactly what you need to see." },
    { step: "04", title: "Export or pipe to your BI tool", desc: "Download CSV reports or use the API to send data to Metabase, Looker, Power BI, or any other tool." },
  ],
  screens: [
    { src: "/screens/09-csat-surveys.png", caption: "CSAT survey responses tracked in analytics" },
  ],
  relatedFeatures: [
    { label: "Shared Inbox", href: "/features/shared-inbox", icon: "forum" },
    { label: "Bulk Campaigns", href: "/features/campaigns", icon: "campaign" },
    { label: "Contacts CRM", href: "/features/contacts", icon: "group" },
    { label: "Automation", href: "/features/automation", icon: "bolt" },
  ],
};

export default function Page() {
  return <FeatureDetailPage data={data} />;
}
