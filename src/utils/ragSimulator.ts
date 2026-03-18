import { mockKnowledgeBase, type KnowledgeArticle } from '../data/mockKnowledgeBase';

export interface RagResult {
  confidence: "high" | "medium" | "low";
  matchedArticle?: KnowledgeArticle;
  suggestedDraft: string;
  finalResponse?: string;
  tags: string[];
  escalationReason?: string;
}

/**
 * Simulates a RAG retrieval and generation process.
 */
export async function simulateRagQuery(query: string): Promise<RagResult> {
  const q = query.toLowerCase();
  
  // Simulate network/LLM latency
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 500));

  let matchedArticle = null;
  let tags: string[] = [];

  if (q.includes("password") || q.includes("login") || q.includes("reset")) {
    matchedArticle = mockKnowledgeBase.find(kb => kb.topic === "password");
    tags.push("Account Access");
  } else if (q.includes("refund") || q.includes("money back") || q.includes("cancel")) {
    matchedArticle = mockKnowledgeBase.find(kb => kb.topic === "refund");
    tags.push("Billing", "Refund Request");
  } else if (q.includes("slack") || q.includes("integration")) {
    matchedArticle = mockKnowledgeBase.find(kb => kb.topic === "integration");
    tags.push("Technical Support", "Integrations");
  } else if (q.includes("enterprise") || q.includes("price") || q.includes("cost")) {
    matchedArticle = mockKnowledgeBase.find(kb => kb.topic === "pricing");
    tags.push("Pricing", "Sales Routing");
  } else {
    tags.push("General Inquiry");
  }

  const isComplaint = q.includes("complain") || q.includes("angry") || q.includes("too high") || q.includes("expensive");
  const isVague = q.includes("how does this work") || q.length < 15;

  // 1. LOW CONFIDENCE (Escalation)
  if (!matchedArticle || isComplaint) {
    if (isComplaint) tags.push("Escalation Risk");
    const reason = isComplaint ? "Emotional escalation detected in query" : "No strong article match found in KB";
    const topicHint = matchedArticle ? matchedArticle.title : "this topic";
    
    return {
      confidence: "low",
      matchedArticle: matchedArticle || undefined,
      tags,
      escalationReason: reason,
      suggestedDraft: `Hi there,\n\nI understand you're asking about ${topicHint}. I see you might need specific help regarding this. Would you like me to connect you with one of our specialized account representatives to look into your exact situation?`
    };
  }

  // 2. MEDIUM CONFIDENCE (Auto-Answer with Caution flag)
  if (isVague) {
    return {
      confidence: "medium",
      matchedArticle,
      tags,
      suggestedDraft: ``,
      finalResponse: `I found some information that might help, but I'm not entirely sure it covers your specific situation: \n\n${matchedArticle.content.substring(0, 100)}...\n\nIf this doesn't fully answer your question, would you like me to connect you with a human agent?`
    };
  }

  // 3. HIGH CONFIDENCE (Auto-resolve)
  return {
    confidence: "high",
    matchedArticle,
    tags,
    suggestedDraft: ``,
    finalResponse: `Based on our documentation, here is the answer:\n\n${matchedArticle.content}`
  };
}
