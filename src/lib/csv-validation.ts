import { stripHtml, truncate, isValidEmail } from "./sanitize";

export interface ValidatedContact {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  title: string;
}

const FIELD_LIMITS: Record<string, number> = {
  first_name: 100,
  last_name: 100,
  email: 254,
  phone: 50,
  company: 200,
  title: 200,
};

const VALID_FIELDS = Object.keys(FIELD_LIMITS);

export function validateCsvRow(row: Record<string, string>): {
  valid: boolean;
  contact: Partial<ValidatedContact>;
  errors: string[];
} {
  const errors: string[] = [];
  const contact: Partial<ValidatedContact> = {};

  for (const [key, value] of Object.entries(row)) {
    const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, "_");

    if (!VALID_FIELDS.includes(normalizedKey)) {
      continue; // Skip unknown fields
    }

    // Strip HTML tags from all values
    let sanitized = stripHtml(String(value || "").trim());

    // Truncate to max length
    const maxLen = FIELD_LIMITS[normalizedKey];
    sanitized = truncate(sanitized, maxLen);

    // Validate email format
    if (normalizedKey === "email") {
      if (sanitized && !isValidEmail(sanitized)) {
        errors.push(`Invalid email format: "${sanitized}"`);
        continue;
      }
    }

    // Validate phone format (allow digits, +, -, spaces, parens)
    if (normalizedKey === "phone" && sanitized) {
      if (!/^[+\d\s\-().]{0,50}$/.test(sanitized)) {
        errors.push(`Invalid phone format: "${sanitized}"`);
        continue;
      }
    }

    (contact as Record<string, string>)[normalizedKey] = sanitized;
  }

  return {
    valid: errors.length === 0,
    contact,
    errors,
  };
}

export function validateCsvData(
  rows: Record<string, string>[]
): {
  validContacts: Partial<ValidatedContact>[];
  skippedRows: { row: number; errors: string[] }[];
} {
  const validContacts: Partial<ValidatedContact>[] = [];
  const skippedRows: { row: number; errors: string[] }[] = [];

  rows.forEach((row, index) => {
    const result = validateCsvRow(row);
    if (result.valid && Object.keys(result.contact).length > 0) {
      validContacts.push(result.contact);
    } else if (result.errors.length > 0) {
      skippedRows.push({ row: index + 1, errors: result.errors });
    }
  });

  return { validContacts, skippedRows };
}