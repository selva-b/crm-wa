"use client";
import FeatureDetailPage, { type FeatureDetailData } from "@/components/FeatureDetailPage";

const data: FeatureDetailData = {
  slug: "contacts",
  tag: "Contacts CRM",
  heroTitle: "Every lead.<br /><span style=\"color:#ffb77d\">Always organised.</span>",
  heroSubtitle: "Tag, segment, search, and manage all your WhatsApp contacts and customers in one place. Full conversation history. Zero spreadsheets.",
  heroScreen: "/screens/05-contacts-management.png",
  overviewTitle: "Your contacts are your business.",
  overviewDesc: "Every WhatsApp number that messages you is a potential customer. Wazelo CRM automatically creates a contact profile for every conversation — with their name, number, tags, custom fields, and full message history — so your team always has context and your marketing always hits the right segment.",
  capabilities: [
    { icon: "group", title: "Unified contact profiles", desc: "Each contact has a profile with name, WhatsApp number, email, tags, custom fields, and full conversation history." },
    { icon: "label", title: "Tags & custom fields", desc: "Create your own tags and fields to capture anything — lead source, city, product interest, deal stage." },
    { icon: "filter_list", title: "Powerful segmentation", desc: "Filter contacts by any combination of tags, fields, last message date, or conversation status to build precise lists." },
    { icon: "upload_file", title: "CSV import & export", desc: "Bulk import contacts from a CSV or export your entire database at any time." },
    { icon: "search", title: "Instant search", desc: "Find any contact by name, number, email, or custom field value in milliseconds." },
    { icon: "history", title: "Full conversation history", desc: "Every message ever exchanged with a contact is stored and searchable — across all agents and channels." },
  ],
  howItWorks: [
    { step: "01", title: "Contacts are created automatically", desc: "Every new WhatsApp conversation creates a contact profile. Or import your existing list via CSV." },
    { step: "02", title: "Enrich with tags and custom fields", desc: "Add tags manually or via automation rules. Fill in custom fields to capture any data your business needs." },
    { step: "03", title: "Segment your audience", desc: "Use the filter builder to create precise segments for campaigns, reports, or workflow triggers." },
    { step: "04", title: "Act on your data", desc: "Launch a campaign to a segment, assign conversations to the right agent, or export a list for use outside Wazelo." },
  ],
  screens: [
    { src: "/screens/01-inbox-shared-team.png", caption: "Contact profiles visible in every conversation" },
  ],
  relatedFeatures: [
    { label: "Bulk Campaigns", href: "/features/campaigns", icon: "campaign" },
    { label: "Shared Inbox", href: "/features/shared-inbox", icon: "forum" },
    { label: "Automation", href: "/features/automation", icon: "bolt" },
    { label: "Analytics", href: "/features/analytics", icon: "bar_chart" },
  ],
};

export default function Page() {
  return <FeatureDetailPage data={data} />;
}
