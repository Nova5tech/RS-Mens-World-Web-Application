# Spec: Branch Authentication & Split Login Layout

## ADDED REQUIREMENTS

### Requirement: Split Screen Visual Authentication
The application MUST render a full-screen split layout matching the reference screenshot (`media_1795088943133_750b023d.jpg`):
- The left column SHALL display dark teal branding (`#07352d` to `#004F4C`), a retail store background image with gradient overlay, organic mint-green wave swooshes, the coat hanger logo, "RS Mens World", the uppercase tracking tagline "MULTI-BRANCH RETAIL & CUSTOMER ENGAGEMENT", and four feature highlights with rounded icon badges:
  1. `Branch-wise Access` / `Manage your branch operations` (`Store` icon)
  2. `Leads & Customers` / `Track and engage customers` (`Users` icon)
  3. `Campaigns` / `Run WhatsApp campaigns` (`Megaphone` icon)
  4. `Branch Reports` / `View your branch performance` (`BarChart3` icon)
  5. Trust indicators: `Secure Login` • `Role-based Access` • `Multi-branch`.
- The right column SHALL display a floating white card with `rounded-3xl` corners, shadow, and segmented navigation tabs.

### Requirement: Segmented Authentication Tabs
The login card MUST provide a segmented tab bar with two tabs:
- `Head Office (Admin)` tab with a building icon.
- `Branch Login` tab with a store icon.
- Clicking either tab SHALL transition the form view without reloading the page.
- The active tab MUST have a deep teal background (`#004F4C`), white bold text, and a rounded pill container background (`#f1f5f9`).

### Requirement: Interactive Branch Selection Dropdown
In the `Branch Login` tab, the UI MUST provide an interactive custom dropdown:
- The closed trigger SHALL display a store icon, the currently selected branch name (e.g. `Branch 1 – Rajahmandary Main Branch`), and a chevron down icon.
- Clicking the trigger SHALL toggle the options list containing the four official stores:
  1. `Branch 1 – Rajahmandary Main Branch`
  2. `Branch 2 – Kakinada Branch`
  3. `Branch 3 – Vijayawada Branch`
  4. `Branch 4 – Guntur Branch`
- The currently selected option SHALL be highlighted with a mint green background (`#d1fae5`) and display a green checkmark icon on the right.
- Selecting any option SHALL update the selected branch and synchronize the corresponding demo user account (`acc-b1`–`acc-b4`).

### Requirement: Credential Input & Password Toggle
The password/PIN input MUST:
- Provide an icon indicator (`Lock` icon).
- Provide an `Eye` / `EyeOff` button that toggles masked password display (`password` vs. `text`).
- Accept 4–6 digit numeric PINs and standard alphanumeric passwords.

### Requirement: Sign In Action & Feedback
Clicking the "Sign In" button:
- SHALL validate that a branch is selected and credentials are provided.
- SHALL display an inline error alert if credentials fail.
- SHALL show a spinner during authentication.
- On success, SHALL redirect Super Admin to `/` with all-branch view and Branch Users to `/` with their assigned branch active.
- SHALL provide a `← Back to Role Selection` link that toggles back to role overview / alternate tab.
