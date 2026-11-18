/**
 * Analyzes raw customer enquiry text and returns heuristic AI classification recommendations.
 *
 * @param {string} text - Raw enquiry text from chat, form, or campaign
 * @returns {{
 *   category: 'Wedding Wear' | 'Suits & Blazers' | 'Casual Shirts' | 'Ethnic & Kurta' | 'Alterations' | 'General Enquiry',
 *   priority: 'Low' | 'Medium' | 'High' | 'Urgent',
 *   summary: string,
 *   confidence: number,
 *   detectedKeywords: string[]
 * }}
 */
export function classifyLeadEnquiry(text = '') {
  const lower = text.toLowerCase();
  const keywordsFound = [];

  // 1. Detect Category
  let category = 'General Enquiry';
  let confidence = 0.75;

  if (/(sherwani|safa|groom|reception|wedding|baraat|haldi|marriage|pelli)/i.test(lower)) {
    category = 'Wedding Wear';
    confidence = 0.92;
    keywordsFound.push('wedding/groom');
  } else if (/(suit|blazer|tuxedo|coat|formal|corporate|three piece|two piece)/i.test(lower)) {
    category = 'Suits & Blazers';
    confidence = 0.89;
    keywordsFound.push('suit/blazer');
  } else if (/(kurta|dhoti|jodhpuri|ethnic|traditional|indo western|modi jacket)/i.test(lower)) {
    category = 'Ethnic & Kurta';
    confidence = 0.88;
    keywordsFound.push('ethnic/kurta');
  } else if (/(alter|fitting|stitch|tight|loose|length|waistcoat tailor|urgent fitting)/i.test(lower)) {
    category = 'Alterations';
    confidence = 0.85;
    keywordsFound.push('alteration');
  } else if (/(shirt|jeans|t-shirt|denim|trouser|casual|linen)/i.test(lower)) {
    category = 'Casual Shirts';
    confidence = 0.82;
    keywordsFound.push('casual wear');
  }

  // 2. Detect Priority
  let priority = 'Medium';
  if (/(urgent|today|tomorrow|asap|emergency|rush|immediate|2 days|next week)/i.test(lower)) {
    priority = 'Urgent';
    keywordsFound.push('urgency flag');
  } else if (/(wedding|marriage|pelli|groom|reception|bulk|corporate|10 sets|15 sets|vip)/i.test(lower)) {
    priority = 'High';
    keywordsFound.push('high value flag');
  } else if (/(casual|just checking|looking around|price check|general)/i.test(lower)) {
    priority = 'Low';
  }

  // 3. Generate concise AI summary
  let summary = '';
  if (category === 'Wedding Wear') {
    summary = 'Wedding groom/family requirement with custom trial requested.';
  } else if (category === 'Suits & Blazers') {
    summary = 'Tailored suit/blazer enquiry with fabric and measurement consultation.';
  } else if (category === 'Ethnic & Kurta') {
    summary = 'Ethnic collection/festive kurta enquiry.';
  } else if (category === 'Alterations') {
    summary = 'Garment alteration and master tailor fitting request.';
  } else if (category === 'Casual Shirts') {
    summary = 'Casual wear and shirt collection enquiry.';
  } else {
    summary = 'General customer enquiry regarding RS Mens World products or services.';
  }

  // Append context if urgency or specifics are mentioned
  if (priority === 'Urgent') {
    summary += ' Flagged as time-sensitive.';
  }

  return {
    category,
    priority,
    summary,
    confidence,
    detectedKeywords: keywordsFound,
  };
}

/**
 * Searches approved knowledge base for matching FAQ
 * @param {string} query
 * @param {Array} knowledgeBase
 * @returns {{ matched: boolean, faq?: object, response: string, isApproved: boolean }}
 */
export function queryKnowledgeBase(query = '', knowledgeBase = []) {
  const clean = query.trim().toLowerCase();
  if (!clean) {
    return {
      matched: false,
      response: 'Please ask a question regarding RS Mens World store locations, collections, hours, or tailoring.',
      isApproved: false,
    };
  }

  // Check keyword hits
  let bestMatch = null;
  let highestScore = 0;

  for (const item of knowledgeBase) {
    let score = 0;
    for (const kw of item.keywords) {
      if (clean.includes(kw.toLowerCase())) {
        score += 2;
      }
    }
    const qWords = item.question.toLowerCase().split(/\s+/);
    for (const qw of qWords) {
      if (qw.length > 3 && clean.includes(qw)) {
        score += 1;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  if (bestMatch && highestScore >= 2) {
    return {
      matched: true,
      faq: bestMatch,
      response: bestMatch.answer,
      isApproved: true,
    };
  }

  return {
    matched: false,
    response: "I don't have verified store information regarding that specific enquiry. Would you like me to connect you with our Rajahmundry store staff or another branch manager?",
    isApproved: false,
  };
}
