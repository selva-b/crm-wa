"use client";
import FeatureDetailPage, { type FeatureDetailData } from "@/components/FeatureDetailPage";

const data: FeatureDetailData = {
  slug: "campaigns",
  tag: "Bulk Campaigns",
  heroTitle: "Reach thousands.<br /><span style=\"color:#ffb77d\">One click.</span>",
  heroSubtitle: "Schedule and send personalised WhatsApp broadcasts to segmented contact lists. Track delivery, opens, and replies in real time.",
  heroScreen: "/screens/02-campaigns-broadcast.png",
  overviewTitle: "Campaigns that actually get read.",
  overviewDesc: "Email open rates hover around 20%. WhatsApp messages get read 98% of the time — usually within 3 minutes. Wazelo CRM's campaign engine lets you broadcast to your entire contact list or a targeted segment, personalise each message with contact fields, and track every delivery and reply as it happens.",
  capabilities: [
    { icon: "campaign", title: "Broadcast to segments", desc: "Send to your full list or a filtered segment — by tag, location, last interaction, or custom field." },
    { icon: "person", title: "Personalised messages", desc: "Merge contact fields into your message: name, city, order number, or any custom attribute." },
    { icon: "schedule", title: "Scheduled sending", desc: "Set campaigns to send at the optimal time — even if that's 3am. We'll deliver it." },
    { icon: "repeat", title: "Smart retry logic", desc: "Failed deliveries are automatically retried. No message is dropped without logging the reason." },
    { icon: "insights", title: "Real-time delivery tracking", desc: "Live dashboard showing sent, delivered, read, and replied counts as they update." },
    { icon: "star_rate", title: "CSAT follow-ups", desc: "Automatically send a satisfaction survey after a campaign interaction completes." },
  ],
  howItWorks: [
    { step: "01", title: "Import or build your contact list", desc: "Upload a CSV or use contacts already in your CRM. Apply filters to target the right segment." },
    { step: "02", title: "Create your message template", desc: "Write your message using our editor. Use {{name}} and other variables for personalisation. Submit for Meta approval if needed." },
    { step: "03", title: "Schedule and launch", desc: "Pick a send time or launch immediately. Wazelo handles rate limiting and queuing automatically." },
    { step: "04", title: "Track and optimise", desc: "Monitor delivery and reply rates live. Filter replies into your shared inbox for follow-up." },
  ],
  screens: [
    { src: "/screens/04-analytics-dashboard.png", caption: "Campaign analytics dashboard" },
  ],
  relatedFeatures: [
    { label: "Shared Inbox", href: "/features/shared-inbox", icon: "forum" },
    { label: "Automation", href: "/features/automation", icon: "bolt" },
    { label: "Sequences", href: "/features/sequences", icon: "low_priority" },
    { label: "Lead Scoring", href: "/features/lead-scoring", icon: "query_stats" },
  ],
};

export default function Page() {
  return <FeatureDetailPage data={data} />;
}
