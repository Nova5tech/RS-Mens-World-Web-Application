/**
 * Lightweight, robust in-browser CSV parser.
 * Handles quoted fields, line breaks inside quotes, and escapes.
 */
export function parseCSV(csvText = '') {
  const lines = [];
  let row = [''];
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        row[row.length - 1] += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push('');
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      if (row.length > 1 || (row.length === 1 && row[0].trim() !== '')) {
        lines.push(row);
      }
      row = [''];
    } else {
      row[row.length - 1] += char;
    }
  }

  if (row.length > 1 || (row.length === 1 && row[0].trim() !== '')) {
    lines.push(row);
  }

  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = lines[0].map(h => h.trim());
  const rows = lines.slice(1).map(line => {
    const obj = {};
    headers.forEach((header, idx) => {
      obj[header] = line[idx] !== undefined ? line[idx].trim() : '';
    });
    return obj;
  });

  return { headers, rows };
}

/**
 * Generates sample Petpooja CSV text for demonstration and testing.
 */
export function generateSamplePetpoojaCSV() {
  return `Customer Name,Mobile Number,Store Branch,Email,Date of Birth,Anniversary,Marketing Consent
Srinivas Reddy,9848112233,B1,srinivas.r@example.com,1985-05-12,2010-11-20,Yes
K. Venkat Rao,9989223344,B1,venkat.rao@example.com,1990-08-22,,Yes
Murali Krishna,9440334455,B2,murali.k@example.com,1987-03-15,2014-06-18,Yes
D. Rajesh,9866445566,B3,,1992-12-05,,No
Suresh Varma,9848022334,B1,suresh.varma@example.com,1988-06-15,2015-11-20,Yes
P. Kiran Kumar,9701556677,B2,kiran.p@example.com,,,Yes
Bad Number User,12345,B1,,,No
Naveen Chandra,9848556677,B4,naveen.c@example.com,1994-01-30,,Yes`;
}
