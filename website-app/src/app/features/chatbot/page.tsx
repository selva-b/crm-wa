"use client";
import FeatureDetailPage, { type FeatureDetailData } from "@/components/FeatureDetailPage";

const data: FeatureDetailData = {
  slug: "chatbot",
  tag: "Chatbot Builder",
  heroTitle: "Build bots.<br /><span style=\"color:#ffb77d\">No code needed.</span>",
  heroSubtitle: "Create WhatsApp chatbots that qualify leads, answer FAQs, capture data, and hand off to your team — all without writing a single line of code.",
  heroScreen: "/screens/06-chatbot-builder.png",
  overviewTitle: "Automate the first conversation.",
  overviewDesc: "The first message a customer sends tells you everything about their intent. Wazelo CRM's chatbot builder lets you design response flows that ask the right questions, capture key information, and route to the right agent — or resolve entirely on their own — 24 hours a day, 7 days a week.",
  capabilities: [
    { icon: "smart_toy", title: "No-code flow builder", desc: "Build chatbot flows visually using a drag-and-drop canvas. No developer required." },
    { icon: "quiz", title: "Question & answer flows", desc: "Ask a sequence of questions, capture responses, and store answers as contact fields automatically." },
    { icon: "call_split", title: "Conditional branching", desc: "Route the conversation based on what the user says — keyword match, button selection, or numeric input." },
    { icon: "transfer_within_a_station", title: "Agent handoff", desc: "At any point, hand the conversation to a human agent — with the full chatbot transcript already in the inbox." },
    { icon: "quick_replies", title: "Quick reply buttons", desc: "Add tap-to-reply buttons so users don't have to type. Faster for them, cleaner data for you." },
    { icon: "schedule_send", title: "24/7 availability", desc: "Your chatbot handles incoming messages even when your whole team is offline. Nothing slips through after hours." },
  ],
  howItWorks: [
    { step: "01", title: "Design your flow", desc: "Use the visual builder to map out how your bot should respond to different inputs — start with a template or build from scratch." },
    { step: "02", title: "Add questions and branches", desc: "Insert question blocks, decision branches, and action steps like setting contact fields or adding tags." },
    { step: "03", title: "Set your triggers", desc: "Choose when the bot activates — on every first message, a specific keyword, outside business hours, or from a campaign CTA." },
    { step: "04", title: "Activate and review", desc: "Go live. Monitor bot sessions, drop-off points, and handoff rates to improve your flow over time." },
  ],
  screens: [
    { src: "/screens/03-automation-workflow.png", caption: "Chatbot flows integrate with automation workflows" },
  ],
  relatedFeatures: [
    { label: "Automation", href: "/features/automation", icon: "bolt" },
    { label: "Shared Inbox", href: "/features/shared-inbox", icon: "forum" },
    { label: "Contacts CRM", href: "/features/contacts", icon: "group" },
    { label: "Analytics", href: "/features/analytics", icon: "bar_chart" },
  ],
};

export default function Page() {
  return <FeatureDetailPage data={data} />;
}
