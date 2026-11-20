/**
 * customerExport.js
 * Client-side CSV export utility for RS Men's World Customer Database.
 * Formats customer records following RFC-4180 CSV specifications.
 */

function escapeCSV(val) {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates an RFC-4180 compliant CSV string for the given customers list.
 * @param {Array<Object>} customers - List of customer objects to export
 * @returns {string} CSV string
 */
export function generateCustomersCSV(customers) {
  const headers = [
    'Customer ID',
    'Customer Name',
    'Phone',
    'Branch ID',
    'Branch Name',
    'Marketing Consent (DPDP)',
    'Customer Type',
    'Status',
    'Last Interaction',
    'Customer Since',
    'Total Purchases',
    'No of Orders',
    'Avg Order Value',
  ];

  const rows = customers.map(c => [
    escapeCSV(c.id),
    escapeCSV(c.name),
    escapeCSV(c.phone || c.mobile || ''),
    escapeCSV(c.branchId || ''),
    escapeCSV(c.branchDetail || c.branch || ''),
    escapeCSV(c.consent ? 'Opted In (Yes)' : 'Opted Out (No)'),
    escapeCSV(c.customerType || 'Regular'),
    escapeCSV(c.status || 'Active'),
    escapeCSV(c.lastInteraction || ''),
    escapeCSV(c.customerSince || ''),
    escapeCSV(c.purchases?.total || ''),
    escapeCSV(c.purchases?.orders ?? ''),
    escapeCSV(c.purchases?.avgOrderValue || ''),
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');
}

/**
 * Triggers a browser download of the customer CSV file.
 * @param {Array<Object>} customers - Customers to export
 * @param {string} [prefix='rs_customers_selected'] - File prefix
 */
export function downloadCustomersCSV(customers, prefix = 'rs_customers_selected') {
  if (!customers || customers.length === 0) return;

  const csvContent = generateCustomersCSV(customers);
  const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], {
    type: 'text/csv;charset=utf-8;',
  }); // UTF-8 BOM for Excel compatibility

  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const timeStr = new Date().toTimeString().slice(0, 5).replace(/:/g, '');
  const filename = `${prefix}_${dateStr}_${timeStr}.csv`;

  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
