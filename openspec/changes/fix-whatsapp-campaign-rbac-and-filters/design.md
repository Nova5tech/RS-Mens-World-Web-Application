# Design Specification: WhatsApp Campaigns RBAC, Branch Scoping, & Filters

## 1. Permission Architecture
We implement role-based access checks based on `useAuth()`:
- `currentUser.role === 'admin'`: Super Administrator
- `currentUser.role === 'branch_user'`: Branch Manager

### Permission Matrix
| Capability | Super Admin | Branch User (e.g. B1) |
|---|---|---|
| View All Campaigns | Yes | No (Only B1 targeting campaigns) |
| Branch Filter Selector | Yes (`ALL`, `B1`, `B2`, `B3`, `B4`) | Locked store badge (`B1` only) |
| Audience & Metrics | Consolidated cross-branch totals | B1-specific audience & delivery only |
| Create WhatsApp Campaign | Yes (Full 4-step wizard) | Blocked (Hidden & Guarded) |
| Toggle Branch Switches | Yes (Independent ON/OFF) | Blocked (Hidden) |
| Image Upload & Mock Preview | Yes | Blocked (Hidden) |
| Save Draft / Schedule / Send | Yes | Blocked (Hidden) |
| Read-Only Campaign Details | Yes | Yes (Default right panel for branch users) |
| Filter Drawer | Full filters + branch selection | Status, Type, Date, Template (branch locked) |

## 2. Branch-Scoped Audience & Performance Breakdown
Each campaign record contains per-branch breakdown:
```typescript
interface CampaignRecord {
  id: string;
  name: string;
  type: 'Promotional' | 'Announcement' | 'Loyalty' | 'Event' | 'Engagement';
  branches: string[]; // e.g. ['B1', 'B2', 'B3', 'B4']
  branchesDisplay: string;
  audience: number; // Consolidated total
  branchAudience: Record<string, number>; // { B1: 2750, B2: 2350, B3: 2120, B4: 1200 }
  status: 'Sent' | 'Scheduled' | 'Draft';
  date: string;
  template: string;
  imageUrl?: string | null;
  caption: string;
  deliveryCounts: { sent: number; delivered: number; read: number; failed: number };
  branchDelivery?: Record<string, { sent: number; delivered: number; read: number; failed: number }>;
  deliveryRate: string;
  readRate: string;
  createdAt: string;
}
```

When viewed by a Branch 1 User:
- Only campaigns where `camp.branches.includes('B1')` are included in `authorizedCampaigns`.
- Display audience: `camp.branchAudience?.B1 || Math.round(camp.audience * 0.35)`
- Display branches: `currentUser.branchName || 'Rajahmandary Main Branch'`
- Top stats (Total, Sent, Scheduled, Audience): Computed strictly from the B1 authorized campaigns and B1 audiences.

## 3. Right Column: Split Workflow
- **Super Admin**: Renders `Create WhatsApp Campaign` (Steppers 1-4, inputs, image upload, branch switches, audience calculations, Send/Schedule).
- **Branch User**: Renders `Campaign Details` (Read-only overview of currently selected campaign, store badge, B1 audience, delivery metrics, message bubble preview, test preview helper).

## 4. Filters Drawer Component
A modular `CampaignFiltersDrawer` (or popover) providing:
- Status filter: `ALL`, `SENT`, `SCHEDULED`, `DRAFT`
- Type filter: `ALL`, `Promotional`, `Announcement`, `Loyalty`, `Event`, `Engagement`
- Date range: `ALL`, `TODAY`, `THIS_WEEK`, `THIS_MONTH`, `LAST_30_DAYS`
- Template: `ALL`, and template catalog items
- Branch: Admin-only branch selection
- Actions: `Apply Filters`, `Clear All`, `Close`
- Active filter badge count rendered on the `Filters` trigger button.
