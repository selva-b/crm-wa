"use client";
import FeatureDetailPage, { type FeatureDetailData } from "@/components/FeatureDetailPage";

const data: FeatureDetailData = {
  slug: "sequences",
  tag: "Sequences",
  heroTitle: "Follow up automatically.<br /><span style=\"color:#ffb77d\">Every time.</span>",
  heroSubtitle: "Multi-step WhatsApp drip sequences that enrol contacts, space messages by hours or days, and stop automatically the moment a contact replies.",
  heroScreen: "",
  overviewTitle: "Your follow-up runs itself.",
  overviewDesc: "Sales teams lose deals not because they had the wrong product, but because they forgot to follow up. Wazelo CRM Sequences let you build a timed series of WhatsApp messages that automatically send to enrolled contacts — and automatically stop the moment someone responds, so you never message someone who's already engaged.",
  capabilities: [
    { icon: "low_priority", title: "Multi-step message flows", desc: "Chain up to 10+ messages with individual delays between each step — hours, days, or weeks." },
    { icon: "person_add", title: "Automatic enrolment", desc: "Enrol contacts via automation rules, tags, or manual selection. Bulk-enrol from a filtered segment." },
    { icon: "stop_circle", title: "Auto-stop on reply", desc: "The sequence pauses automatically when a contact replies. No more messaging someone who's already talking to you." },
    { icon: "edit_note", title: "Personalised messages", desc: "Use contact field variables in each message — name, company, product — so every message feels 1:1." },
    { icon: "schedule", title: "Send time controls", desc: "Set sequences to send only within business hours. Avoid messaging contacts at 3am." },
    { icon: "insights", title: "Sequence analytics", desc: "Open rate, reply rate, and drop-off by step — so you know exactly which message is losing them." },
  ],
  howItWorks: [
    { step: "01", title: "Build your sequence", desc: "Create a new sequence, give it a name, and add steps. Each step is a message with a delay before it sends." },
    { step: "02", title: "Write and personalise messages", desc: "Write each message using the editor. Insert contact field variables like {{first_name}} for personalisation." },
    { step: "03", title: "Enrol your contacts", desc: "Add contacts manually, from a tag filter, or set an automation rule to enrol contacts automatically when they hit a trigger." },
    { step: "04", title: "Let it run", desc: "The sequence handles timing, delivery, and auto-stopping. Review analytics to optimise open and reply rates per step." },
  ],
  screens: [],
  relatedFeatures: [
    { label: "Bulk Campaigns", href: "/features/campaigns", icon: "campaign" },
    { label: "Automation", href: "/features/automation", icon: "bolt" },
    { label: "Contacts CRM", href: "/features/contacts", icon: "group" },
    { label: "Deals Pipeline", href: "/features/deals", icon: "trending_up" },
  ],
};

export default function Page() {
  return <FeatureDetailPage data={data} />;
}
