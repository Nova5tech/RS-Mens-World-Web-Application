/**
 * Utility functions for Indian phone numbers (+91)
 */

export function normalizePhone(input: string): {
  isValid: boolean;
  raw: string;
  e164: string;
  error?: string;
} {
  if (!input) {
    return { isValid: false, raw: '', e164: '', error: 'Phone number is required' };
  }

  // Remove spaces, dashes, parentheses
  let cleaned = input.trim().replace(/[\s\-()]/g, '');

  // Strip leading +91 or 91 or 0
  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.substring(1);
  }

  // Must be 10 digits starting with 6, 7, 8, 9
  if (!/^\d{10}$/.test(cleaned)) {
    return {
      isValid: false,
      raw: input,
      e164: '',
      error: 'Must be a 10-digit mobile number',
    };
  }

  if (!/^[6-9]/.test(cleaned)) {
    return {
      isValid: false,
      raw: input,
      e164: '',
      error: 'Indian mobile number must start with 6, 7, 8, or 9',
    };
  }

  const e164 = `+91${cleaned}`;
  return { isValid: true, raw: input, e164 };
}

export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '—';

  // If already "+919876543210" or similar
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+91') && cleaned.length === 13) {
    const p1 = cleaned.substring(3, 8);
    const p2 = cleaned.substring(8);
    return `+91 ${p1} ${p2}`;
  }

  if (cleaned.length === 10) {
    return `+91 ${cleaned.substring(0, 5)} ${cleaned.substring(5)}`;
  }

  return phone;
}
