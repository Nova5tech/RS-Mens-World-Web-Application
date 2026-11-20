# Spec: Customer Table Interactions, Status Tabs & Action Menus

## ADDED REQUIREMENTS

### Requirement: Reactive Customer Status Tabs
The customer database MUST render four functional status tabs:
- `All Customers` tab: Displays all permitted customer records within the user's branch boundary.
- `New` tab: Displays only customers with `status === 'New'` or `customerType === 'New'` or created recently.
- `Active` tab: Displays only customers with `status === 'Active'`.
- `Inactive` tab: Displays only customers with `status === 'Inactive'`.
- Each tab badge SHALL display the exact count dynamically derived from the permitted customer dataset.

### Requirement: Customer Row Contextual Actions Menu
Every customer table row MUST include a functional three-dot actions button (`MoreVertical`):
- Clicking the button SHALL toggle an accessible contextual actions menu.
- The menu MUST provide:
  - `View Details`: Sets the customer as selected and opens the right-docked Customer Details panel.
  - `Edit Customer`: Opens the customer profile edit dialog with prefilled customer data.
  - `Toggle Status`: Toggles the customer's status between `Active` and `Inactive` and triggers a toast confirmation.
- The menu SHALL close on click-outside, item selection, or Escape key press.
- Opening the action menu SHALL NOT toggle the row's selection checkbox or navigate away.

### Requirement: Customer Details Panel & Record Integrity
- Selecting any customer record SHALL display their full details in the docked right panel (name, mobile, email, store branch, consent status, and customer type).
- Updating a customer record via the edit modal or action menu SHALL immediately synchronize both the table row and details panel without requiring a page refresh.
