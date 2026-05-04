"use client";
import FeatureDetailPage, { type FeatureDetailData } from "@/components/FeatureDetailPage";

const data: FeatureDetailData = {
  slug: "developer-api",
  tag: "Developer API",
  heroTitle: "Build anything<br /><span style=\"color:#ffb77d\">on top of Wazelo.</span>",
  heroSubtitle: "Full REST API, webhook system, and API key management for teams that need to integrate Wazelo CRM with their own systems, automations, or data pipelines.",
  heroScreen: "",
  overviewTitle: "Your data, your way.",
  overviewDesc: "Not every workflow fits inside a SaaS interface. Wazelo CRM's Developer API gives you programmatic access to contacts, conversations, campaigns, and analytics — so your engineering team can build custom integrations, sync data to internal systems, and trigger Wazelo actions from external events. Generate API keys, subscribe to webhooks, and explore the full reference in the docs.",
  capabilities: [
    { icon: "code", title: "Full REST API", desc: "Read and write contacts, conversations, campaigns, messages, and analytics data via a documented REST API." },
    { icon: "key", title: "API key management", desc: "Generate, rotate, and revoke API keys from the dashboard. Scoped keys available for read-only or write access." },
    { icon: "webhook", title: "Webhook subscriptions", desc: "Subscribe to real-time events: new message, conversation assigned, deal stage changed, CSAT received, and more." },
    { icon: "data_object", title: "JSON response format", desc: "Clean, consistent JSON responses. Pagination, filtering, and sorting built into every list endpoint." },
    { icon: "book", title: "Full API reference docs", desc: "Every endpoint documented with request/response examples, authentication instructions, and rate limit info." },
    { icon: "speed", title: "Rate limits and reliability", desc: "Generous rate limits for Pro and Enterprise plans. Retry headers and idempotency keys supported." },
  ],
  howItWorks: [
    { step: "01", title: "Generate an API key", desc: "Go to Settings → Developer → API Keys. Click 'Create Key', name it, choose its scope, and copy the key. It only shows once." },
    { step: "02", title: "Authenticate your requests", desc: "Pass your API key in the Authorization header: Bearer <your-api-key>. All requests require HTTPS." },
    { step: "03", title: "Call any endpoint", desc: "Use our REST API to fetch contacts, send messages, create deals, tag contacts, or pull analytics. Full reference at /api-reference." },
    { step: "04", title: "Subscribe to webhooks", desc: "Register a webhook URL to receive real-time POST events for any action in Wazelo — new message, resolved conversation, CSAT score received, and more." },
  ],
  screens: [],
  relatedFeatures: [
    { label: "Automation", href: "/features/automation", icon: "bolt" },
    { label: "Analytics", href: "/features/analytics", icon: "bar_chart" },
    { label: "Contacts CRM", href: "/features/contacts", icon: "group" },
    { label: "Bulk Campaigns", href: "/features/campaigns", icon: "campaign" },
  ],
};

export default function Page() {
  return <FeatureDetailPage data={data} />;
}
