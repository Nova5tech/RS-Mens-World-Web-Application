# RS Mens World Standalone Website Chat Widget

Embeddable customer assistance chat widget for external marketing websites, brand landing pages, and Shopify/WooCommerce store fronts.

## Installation

Place this script snippet just before the closing `</body>` tag of any HTML webpage:

```html
<script 
  src="https://cdn.rsmensworld.com/dist-widget/rs-chat.js" 
  data-api="https://api.rsmensworld.com" 
  data-branch="branch_1" 
  data-color="#0F4C3A"
  async>
</script>
```

### Config Attributes

| Attribute | Required | Default | Description |
|---|---|---|---|
| `data-api` | Yes | `https://api.rsmensworld.com` | Base URL for REST and WebSocket endpoints |
| `data-branch` | No | `branch_1` | Target store branch (`branch_1`, `branch_2`, `branch_3`, `branch_4`) |
| `data-color` | No | `#0F4C3A` | Primary brand accent color for widget header and buttons |
| `data-theme` | No | `light` | Widget theme (`light` or `dark`) |

## Features
- **Pre-chat visitor capture**: Captures Name, WhatsApp phone number, and marketing consent.
- **AI Knowledge Base Assistant**: Answers FAQs from approved store policies with 0 hallucination.
- **Human Handover**: Visitors requesting a human or asking about stock availability are automatically transferred to store staff in the Admin Inbox.
- **Automated Lead Generation**: High-intent visitor conversations automatically create leads in the CRM.
