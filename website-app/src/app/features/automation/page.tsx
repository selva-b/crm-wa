"use client";
import FeatureDetailPage, { type FeatureDetailData } from "@/components/FeatureDetailPage";

const data: FeatureDetailData = {
  slug: "automation",
  tag: "Automation",
  heroTitle: "Build flows.<br /><span style=\"color:#ffb77d\">Not busywork.</span>",
  heroSubtitle: "Visual workflow builder for WhatsApp automation — follow-up sequences, lead qualification, smart routing, and more. No code, no limits.",
  heroScreen: "/screens/03-automation-workflow.png",
  overviewTitle: "Your best agent works 24/7 and never sleeps.",
  overviewDesc: "Manual follow-ups, repetitive answers, and missed triggers cost your team hours every day. Wazelo CRM's automation engine lets you build visual workflows that run on autopilot — from a new lead's first message to a resolved ticket's CSAT survey — so your team focuses only on conversations that need a human touch.",
  capabilities: [
    { icon: "bolt", title: "Trigger-based workflows", desc: "Start automations on any event: new message received, contact tag added, campaign replied, time elapsed, and more." },
    { icon: "account_tree", title: "Visual flow builder", desc: "Drag-and-drop conditions, delays, actions, and branches. Build complex flows without a single line of code." },
    { icon: "reply", title: "Auto-replies", desc: "Respond instantly to common queries — outside hours, on weekends, or while your team is busy." },
    { icon: "label", title: "Auto-tagging & routing", desc: "Classify and route conversations automatically based on message content, contact fields, or intent." },
    { icon: "timer", title: "Delay steps", desc: "Add time delays between steps — send a follow-up 2 hours after no reply, or a reminder 24 hours before an appointment." },
    { icon: "hub", title: "Webhook integrations", desc: "Connect to any external system. Trigger a webhook on any workflow step to sync with your CRM, ERP, or custom API." },
  ],
  howItWorks: [
    { step: "01", title: "Choose a trigger", desc: "Select what starts the workflow — an inbound message, a tag, a form submission, a time condition, or a campaign interaction." },
    { step: "02", title: "Build your flow", desc: "Add conditions, actions, delays, and branches using the visual builder. Preview the flow before activating." },
    { step: "03", title: "Test it", desc: "Run the workflow on a test contact to verify every step fires correctly before going live." },
    { step: "04", title: "Activate and monitor", desc: "Switch it on. Monitor run counts, errors, and conversion metrics from the automation dashboard." },
  ],
  screens: [],
  relatedFeatures: [
    { label: "Shared Inbox", href: "/features/shared-inbox", icon: "forum" },
    { label: "Chatbot Builder", href: "/features/chatbot", icon: "smart_toy" },
    { label: "Sequences", href: "/features/sequences", icon: "low_priority" },
    { label: "Lead Scoring", href: "/features/lead-scoring", icon: "query_stats" },
  ],
};

export default function Page() {
  return <FeatureDetailPage data={data} />;
}
