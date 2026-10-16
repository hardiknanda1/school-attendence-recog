"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  emptyContact,
  institutionTypes,
  limits,
  normaliseContact,
  validateContact,
  type ContactErrors,
  type ContactField,
  type ContactInput,
} from "@/lib/contact-schema";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "not_configured" }
  | { kind: "error"; message: string };

const fieldOrder: ContactField[] = [
  "fullName",
  "email",
  "institution",
  "institutionType",
  "phone",
  "studentCount",
  "message",
];

const serverMessages: Record<string, string> = {
  rate_limited: "Too many messages have been sent from your connection. Please try again in a few minutes.",
  delivery_failed: "We couldn’t deliver your message just now. Please try again shortly.",
  payload_too_large: "Your message is too long. Please shorten it and try again.",
  rejected: "Your message couldn’t be accepted. Please wait a moment and try again.",
};

export function ContactForm() {
  const [values, setValues] = useState<ContactInput>(emptyContact);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const inFlight = useRef(false);
  const startedAt = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const update = (field: ContactField, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    // Once the visitor has tried to submit, keep errors in sync as they type.
    if (attempted) setErrors(validateContact(normaliseContact(next)));
  };

  const focusFirstError = (errs: ContactErrors) => {
    const first = fieldOrder.find((f) => errs[f]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  };

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;

    setAttempted(true);
    const input = normaliseContact(values);
    const clientErrors = validateContact(input);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) {
      setStatus({ kind: "idle" });
      focusFirstError(clientErrors);
      return;
    }

    inFlight.current = true;
    setStatus({ kind: "submitting" });
    const honeypot = new FormData(event.currentTarget).get("website");

    let next: Status;
    let focusStatus = true;
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, website: honeypot ?? "", startedAt: startedAt.current }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        code?: string;
        errors?: ContactErrors;
      };

      if (res.ok && data.ok) {
        next = { kind: "success" };
      } else if (data.code === "not_configured") {
        next = { kind: "not_configured" };
      } else if (data.code === "invalid" && data.errors) {
        setErrors(data.errors);
        focusFirstError(data.errors);
        focusStatus = false;
        next = { kind: "error", message: "Please correct the highlighted fields and try again." };
      } else {
        next = {
          kind: "error",
          message: serverMessages[data.code ?? ""] ?? "Something went wrong. Please try again shortly.",
        };
      }
    } catch {
      next = {
        kind: "error",
        message: "We couldn’t reach the server. Please check your connection and try again.",
      };
    } finally {
      inFlight.current = false;
    }

    setStatus(next);
    if (next.kind === "success") {
      setValues(emptyContact);
      setAttempted(false);
    }
    if (focusStatus) requestAnimationFrame(() => statusRef.current?.focus());
  }

  if (status.kind === "success") {
    return (
      <div
        ref={statusRef}
        tabIndex={-1}
        role="status"
        className="rounded-2xl border border-line bg-paper p-8 outline-none md:p-10"
      >
        <span className="grid size-12 place-items-center rounded-full bg-accent-soft text-accent-deep" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <h2 className="mt-6 font-display text-4xl text-navy">Thank you — message received.</h2>
        <p className="mt-3 max-w-md leading-relaxed text-muted">
          Your enquiry has been delivered to our team. We’ll reply to the email address you provided.
        </p>
        <button
          type="button"
          onClick={() => {
            startedAt.current = Date.now();
            setStatus({ kind: "idle" });
          }}
          className="mt-8 text-sm font-medium text-accent-deep underline underline-offset-4"
        >
          Send another message
        </button>
      </div>
    );
  }

  const submitting = status.kind === "submitting";
  const errorCount = Object.keys(errors).length;

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={onSubmit}
      aria-describedby="form-note"
      className="relative rounded-2xl border border-line bg-paper p-6 sm:p-8 md:p-10"
    >
      <p id="form-note" className="text-sm text-muted">
        Fields marked <span aria-hidden="true">*</span>
        <span className="sr-only">as required</span> are required.
      </p>

      <div ref={statusRef} tabIndex={-1} aria-live="polite" className="outline-none">
        {status.kind === "not_configured" && (
          <Notice tone="warning" title="Message not sent — contact form setup required">
            This form isn’t connected to an email service or backend yet, so your message was not
            delivered. The site owner needs to configure a delivery provider (see the README). Please
            use another way to reach the team in the meantime.
          </Notice>
        )}
        {status.kind === "error" && (
          <Notice tone="error" title="Message not sent">
            {status.message}
          </Notice>
        )}
        {attempted && errorCount > 0 && status.kind === "idle" && (
          <p className="sr-only">
            {errorCount === 1 ? "1 field needs attention." : `${errorCount} fields need attention.`}
          </p>
        )}
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <Field label="Full name" name="fullName" required error={errors.fullName}>
          {(props) => (
            <input
              {...props}
              type="text"
              autoComplete="name"
              maxLength={limits.fullName}
              value={values.fullName}
              onChange={(e) => update("fullName", e.target.value)}
            />
          )}
        </Field>
        <Field label="Official email address" name="email" required error={errors.email}>
          {(props) => (
            <input
              {...props}
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={limits.email}
              value={values.email}
              onChange={(e) => update("email", e.target.value)}
            />
          )}
        </Field>
        <Field label="School or institution name" name="institution" required error={errors.institution}>
          {(props) => (
            <input
              {...props}
              type="text"
              autoComplete="organization"
              maxLength={limits.institution}
              value={values.institution}
              onChange={(e) => update("institution", e.target.value)}
            />
          )}
        </Field>
        <Field label="Institution type" name="institutionType" required error={errors.institutionType}>
          {(props) => (
            <select
              {...props}
              value={values.institutionType}
              onChange={(e) => update("institutionType", e.target.value)}
            >
              <option value="" disabled>
                Select an option
              </option>
              {institutionTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Phone number" name="phone" error={errors.phone}>
          {(props) => (
            <input
              {...props}
              type="tel"
              autoComplete="tel"
              maxLength={limits.phone}
              value={values.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          )}
        </Field>
        <Field
          label="Approx. student or user count"
          name="studentCount"
          error={errors.studentCount}
        >
          {(props) => (
            <input
              {...props}
              type="text"
              inputMode="numeric"
              maxLength={limits.studentCount + 3}
              value={values.studentCount}
              onChange={(e) => update("studentCount", e.target.value)}
            />
          )}
        </Field>
        <div className="sm:col-span-2">
          <Field
            label="Message"
            name="message"
            required
            error={errors.message}
            hint="Tell us about your school and what you’d like to explore."
          >
            {(props) => (
              <textarea
                {...props}
                rows={6}
                maxLength={limits.message}
                value={values.message}
                onChange={(e) => update("message", e.target.value)}
              />
            )}
          </Field>
        </div>
      </div>

      {/* Honeypot: hidden from people and assistive technology; bots tend to fill it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-sm text-xs leading-relaxed text-muted">
          Please don’t include sensitive student information in your message. See our{" "}
          <a href="/privacy" className="underline underline-offset-2 hover:text-navy">
            Privacy Policy
          </a>
          .
        </p>
        <button
          type="submit"
          disabled={submitting}
          aria-disabled={submitting}
          className="inline-flex h-12 min-w-44 items-center justify-center gap-2 rounded-full bg-navy px-7 text-sm font-medium text-paper transition-colors hover:bg-ink disabled:cursor-wait disabled:opacity-70"
        >
          {submitting && (
            <svg className="size-4 animate-spin motion-reduce:hidden" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2.5" />
              <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          )}
          {submitting ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}

type ControlProps = {
  id: string;
  name: string;
  required?: boolean;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  className: string;
};

function Field({
  label,
  name,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  name: ContactField;
  required?: boolean;
  error?: string;
  hint?: string;
  children: (props: ControlProps) => ReactNode;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-navy">
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-0.5 text-accent-deep">
            *
          </span>
        ) : (
          <span className="ml-1.5 font-normal text-muted">(optional)</span>
        )}
      </label>
      {hint && (
        <p id={hintId} className="mt-1 text-sm text-muted">
          {hint}
        </p>
      )}
      {children({
        id,
        name,
        required,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
        className: `mt-2 block w-full rounded-lg border bg-white px-3.5 py-3 text-[0.95rem] text-ink shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] transition-colors placeholder:text-muted/70 focus:border-accent focus:outline-2 focus:outline-offset-0 focus:outline-accent/30 ${
          error ? "border-[#b42318]" : "border-stone hover:border-muted/60"
        }`,
      })}
      {error && (
        <p id={errorId} className="mt-2 flex items-start gap-1.5 text-sm text-[#b42318]">
          <span aria-hidden="true">!</span>
          {error}
        </p>
      )}
    </div>
  );
}

function Notice({
  tone,
  title,
  children,
}: {
  tone: "warning" | "error";
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      role="alert"
      className={`mt-6 rounded-xl border px-5 py-4 text-sm leading-relaxed ${
        tone === "warning"
          ? "border-[#e6c27a] bg-[#fdf6e7] text-[#5c4210]"
          : "border-[#f1b5ae] bg-[#fdf0ee] text-[#7a1f14]"
      }`}
    >
      <p className="font-semibold">{title}</p>
      <p className="mt-1">{children}</p>
    </div>
  );
}
