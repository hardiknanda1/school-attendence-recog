/**
 * Contact form validation shared by the browser form and the API route, so
 * both sides enforce identical rules.
 */

export const institutionTypes = [
  { value: "k12", label: "K–12 school" },
  { value: "private", label: "Private or independent school" },
  { value: "network", label: "School network or multi-campus institution" },
  { value: "higher-ed", label: "College or university" },
  { value: "other", label: "Other" },
] as const;

export type InstitutionType = (typeof institutionTypes)[number]["value"];

export type ContactInput = {
  fullName: string;
  email: string;
  institution: string;
  institutionType: InstitutionType | "";
  phone: string;
  studentCount: string;
  message: string;
};

export type ContactField = keyof ContactInput;
export type ContactErrors = Partial<Record<ContactField, string>>;

export const emptyContact: ContactInput = {
  fullName: "",
  email: "",
  institution: "",
  institutionType: "",
  phone: "",
  studentCount: "",
  message: "",
};

export const limits = {
  fullName: 120,
  email: 254,
  institution: 160,
  phone: 32,
  studentCount: 9,
  message: 4000,
  messageMin: 10,
} as const;

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;
const PHONE_RE = /^[+()\-.\s\d]{7,}$/;
// Single-line fields must not contain control characters (e.g. CR/LF used for
// header injection in email subjects).
const CONTROL_RE = /[\u0000-\u001f\u007f]/;

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Normalises untrusted input into a ContactInput (unknown keys are dropped). */
export function normaliseContact(raw: unknown): ContactInput {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const type = str(r.institutionType);
  return {
    fullName: str(r.fullName),
    email: str(r.email).toLowerCase(),
    institution: str(r.institution),
    institutionType: institutionTypes.some((t) => t.value === type)
      ? (type as InstitutionType)
      : "",
    phone: str(r.phone),
    studentCount: str(r.studentCount).replace(/[,\s]/g, ""),
    message: typeof r.message === "string" ? r.message.trim() : "",
  };
}

export function validateContact(input: ContactInput): ContactErrors {
  const errors: ContactErrors = {};

  if (!input.fullName) errors.fullName = "Please enter your full name.";
  else if (CONTROL_RE.test(input.fullName)) errors.fullName = "Please enter your name on a single line.";
  else if (input.fullName.length > limits.fullName)
    errors.fullName = `Please enter a name under ${limits.fullName} characters.`;

  if (!input.email) errors.email = "Please enter your official email address.";
  else if (input.email.length > limits.email || !EMAIL_RE.test(input.email))
    errors.email = "Please enter a valid email address, e.g. name@school.org.";

  if (!input.institution) errors.institution = "Please enter your school or institution name.";
  else if (CONTROL_RE.test(input.institution))
    errors.institution = "Please enter the institution name on a single line.";
  else if (input.institution.length > limits.institution)
    errors.institution = `Please keep this under ${limits.institution} characters.`;

  if (!input.institutionType) errors.institutionType = "Please choose an institution type.";

  if (
    input.phone &&
    (input.phone.length > limits.phone || !PHONE_RE.test(input.phone) || CONTROL_RE.test(input.phone))
  )
    errors.phone = "Please enter a valid phone number, or leave this blank.";

  if (input.studentCount && !/^\d{1,9}$/.test(input.studentCount))
    errors.studentCount = "Please enter a whole number, or leave this blank.";

  if (!input.message) errors.message = "Please tell us a little about what you need.";
  else if (input.message.length < limits.messageMin)
    errors.message = `Please write at least ${limits.messageMin} characters.`;
  else if (input.message.length > limits.message)
    errors.message = `Please keep your message under ${limits.message} characters.`;

  return errors;
}

export function institutionLabel(value: InstitutionType | ""): string {
  return institutionTypes.find((t) => t.value === value)?.label ?? "";
}
