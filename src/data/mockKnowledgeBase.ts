export interface KnowledgeArticle {
  id: string;
  topic: string;
  title: string;
  content: string;
  url: string;
}

export const mockKnowledgeBase: KnowledgeArticle[] = [
  {
    id: "kb-001",
    topic: "password",
    title: "How to Reset Your FastSaaS Password",
    content: "If you forgot your password, go to the login page and click 'Forgot Password'. Enter your registered email address, and we will send you a reset link. Click the link within 24 hours to create a new password.",
    url: "/help/accounts/password-reset"
  },
  {
    id: "kb-002",
    topic: "refund",
    title: "Understanding Our Refund Policy",
    content: "We offer a 14-day money-back guarantee for all new subscriptions. Beyond 14 days, refunds are only issued if there were technical service interruptions exceeding 48 hours. Please submit a written request via our billing portal.",
    url: "/help/billing/refund-policy"
  },
  {
    id: "kb-003",
    topic: "integration",
    title: "Connecting to Slack",
    content: "To connect FastSaaS to Slack, navigate to Settings > Integrations > Slack. Click 'Connect Workspace' and authorize the application. You can then map specific alert channels within the notification settings.",
    url: "/help/integrations/slack"
  },
  {
    id: "kb-004",
    topic: "pricing",
    title: "Enterprise Pricing Tiers",
    content: "Our Enterprise tier offers custom SLAs, dedicated account managers, and single sign-on (SSO). Pricing is volume-based and starts at 500 active users. Contact our sales team using the enterprise booking form to get a personalized quote.",
    url: "/pricing/enterprise"
  }
];
