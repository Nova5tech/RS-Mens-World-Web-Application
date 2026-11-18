/**
 * @typedef {Object} Branch
 * @property {string} id - Unique branch identifier (e.g. 'B1', 'B2')
 * @property {string} name - Branch store display name (e.g. 'Rajahmundry Main Store')
 * @property {string} code - Short code (e.g. 'RJY')
 * @property {string} address - Store address
 * @property {string} phone - Store contact number
 * @property {string} hours - Operating hours (e.g. '10:00 AM - 9:30 PM')
 * @property {boolean} enabled - Whether branch is active for campaigns and routing
 */

/**
 * @typedef {Object} Customer
 * @property {string} id - Unique customer ID
 * @property {string} name - Customer full name
 * @property {string} mobile - 10-digit mobile number
 * @property {string} [email] - Optional customer email
 * @property {string} [birthday] - Optional birthday (YYYY-MM-DD)
 * @property {string} [anniversary] - Optional anniversary (YYYY-MM-DD)
 * @property {string} branchId - Assigned store branch ID (e.g. 'B1')
 * @property {boolean} marketingOptIn - Explicit consent for marketing messages
 * @property {string} [consentSource] - Source of consent (e.g. 'Petpooja Import', 'Chatbot')
 * @property {string} [consentDate] - Timestamp when consent was recorded
 * @property {string} source - Origin of customer record
 * @property {string} createdAt - ISO timestamp of record creation
 */

/**
 * @typedef {Object} ChatMessage
 * @property {string} id - Unique message ID
 * @property {'user' | 'assistant' | 'staff' | 'system'} role - Message author role
 * @property {string} text - Message text
 * @property {string} timestamp - ISO timestamp
 * @property {boolean} [isAi] - Whether message was AI-generated
 * @property {boolean} [isApprovedFaq] - Whether text came from approved knowledge base
 * @property {boolean} [isUnknown] - Flagged if AI couldn't answer with approved FAQ
 */

/**
 * @typedef {Object} Chat
 * @property {string} id - Unique chat session ID
 * @property {'website' | 'whatsapp'} channel - Channel source
 * @property {string} [visitorName] - Visitor name if captured
 * @property {string} [visitorMobile] - Visitor phone if captured
 * @property {string} startedAt - ISO timestamp
 * @property {ChatMessage[]} messages - Array of conversation messages
 * @property {string} [leadId] - Associated lead ID if created
 * @property {boolean} handoverRequested - Whether visitor or bot requested staff escalation
 * @property {string} [handoverTimestamp] - ISO timestamp of handover request
 * @property {string} [branchId] - Target store branch ID
 * @property {'active' | 'handover_pending' | 'resolved'} status - Chat state
 */

/**
 * @typedef {'New' | 'Contacted' | 'Qualified' | 'Follow-up' | 'Converted' | 'Lost'} LeadStage
 * @typedef {'Low' | 'Medium' | 'High' | 'Urgent'} LeadPriority
 * @typedef {'Wedding Wear' | 'Suits & Blazers' | 'Casual Shirts' | 'Ethnic & Kurta' | 'Alterations' | 'General Enquiry'} LeadCategory
 *
 * @typedef {Object} LeadNote
 * @property {string} id - Unique note ID
 * @property {string} text - Note contents
 * @property {string} author - Author staff name
 * @property {string} timestamp - ISO timestamp
 *
 * @typedef {Object} Lead
 * @property {string} id - Unique lead identifier
 * @property {string} name - Customer name
 * @property {string} mobile - 10-digit mobile number
 * @property {string} [email] - Customer email
 * @property {string} enquiry - Raw customer enquiry text
 * @property {string} source - Origin ('AI Chat', 'Website Form', 'Campaign Reply', 'Manual')
 * @property {string} preferredBranchId - Customer's chosen store branch
 * @property {string} assignedBranchId - Staff assigned store branch
 * @property {boolean} consentToContact - Explicit contact permission
 * @property {string} [aiSummary] - AI-generated brief summary
 * @property {LeadCategory} [aiCategory] - AI-predicted enquiry category
 * @property {LeadPriority} [aiPriority] - AI-calculated priority score
 * @property {LeadPriority} priority - Active priority (can be manually overridden)
 * @property {LeadStage} stage - Current pipeline stage
 * @property {string} [assignedTo] - Name of assigned sales representative
 * @property {string} [followUpDate] - ISO date/time for scheduled follow-up
 * @property {LeadNote[]} notes - Internal staff timeline notes
 * @property {boolean} [isManualOverride] - True if staff modified AI suggestions
 * @property {string} createdAt - ISO timestamp
 * @property {string} updatedAt - ISO timestamp
 */

/**
 * @typedef {Object} Campaign
 * @property {string} id - Unique campaign identifier
 * @property {string} title - Campaign internal title
 * @property {string} templateId - Approved WhatsApp/SMS template ID
 * @property {string} [imageUrl] - Optional banner image URL
 * @property {string} caption - Campaign message text
 * @property {string[]} enabledBranchIds - Array of branch IDs targeted (B1-B4)
 * @property {{ totalEligible: number, perBranch: Record<string, number> }} audienceSummary - Computed audience tally
 * @property {string} [scheduleAt] - ISO timestamp for future dispatch
 * @property {'Draft' | 'Scheduled' | 'Sending' | 'Completed' | 'Cancelled'} status - Dispatch state
 * @property {{ sent: number, delivered: number, read: number, failed: number }} deliveryCounts - Delivery statistics
 * @property {string} createdAt - ISO timestamp
 */

export const LeadStages = [
  'New',
  'Contacted',
  'Qualified',
  'Follow-up',
  'Converted',
  'Lost'
];

export const LeadPriorities = ['Low', 'Medium', 'High', 'Urgent'];

export const LeadCategories = [
  'Wedding Wear',
  'Suits & Blazers',
  'Casual Shirts',
  'Ethnic & Kurta',
  'Alterations',
  'General Enquiry'
];
