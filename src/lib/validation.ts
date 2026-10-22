import { z } from "zod";

// Shared enums for booking (doc 7.1 four-step flow)
const EVENT_TYPE_IDS = [
  "wedding",
  "corporate",
  "birthday",
  "college",
  "private",
  "virtual",
] as const;

// Server-side lead validation (doc 11: schema validation on every input)
export const leadSchema = z.object({
  // Step 1 — event + date + city
  eventType: z.enum(EVENT_TYPE_IDS, { message: "Select an event type" }),
  eventDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Select your event date")
    .refine((d) => {
      const date = new Date(d + "T00:00:00");
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return !isNaN(date.getTime()) && date >= today;
    }, "The event date cannot be in the past"),
  city: z.string().trim().min(2, "City is required").max(60, "City name is too long"),
  // Step 2 — audience & budget
  guests: z.coerce
    .number({ message: "Enter approximate guest count" })
    .int("Whole number please")
    .min(1, "At least 1 guest")
    .max(10000, "For audiences above 10,000 please call us directly"),
  venueType: z.string().max(40).optional().or(z.literal("")),
  duration: z.string().max(40).optional().or(z.literal("")),
  budget: z.string().min(1, "Select a budget range").max(40),
  // Step 3 — contact
  name: z.string().trim().min(2, "Your name is required").max(80, "Name is too long"),
  phone: z
    .string()
    .trim()
    .regex(/^(\+91[\s-]?)?[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  email: z.email("Enter a valid email address").max(120),
  notes: z.string().trim().max(1000, "Notes are limited to 1000 characters").optional().or(z.literal("")),
  // Step 4 — DPDP consent (doc 11 privacy)
  consent: z.literal(true, { message: "Consent is required to submit the enquiry" }),
  // Anti-spam honeypot (doc 9.4) — must stay empty; humans never see it
  website: z.string().max(0, "Spam detected").optional().or(z.literal("")),
  // Attribution (doc 7.2 UTM capture)
  utmSource: z.string().max(120).optional().or(z.literal("")),
  utmMedium: z.string().max(120).optional().or(z.literal("")),
  utmCampaign: z.string().max(120).optional().or(z.literal("")),
  landingPage: z.string().max(200).optional().or(z.literal("")),
  referrer: z.string().max(300).optional().or(z.literal("")),
});

export type LeadInput = z.infer<typeof leadSchema>;

export const leadStatusSchema = z.object({
  status: z.enum([
    "new",
    "contacted",
    "quote",
    "negotiation",
    "advance",
    "confirmed",
    "completed",
    "lost",
  ]),
  lostReason: z.string().max(200).optional().or(z.literal("")),
});

export const availabilityQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Month must be YYYY-MM"),
});

export const availabilityToggleSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  status: z.enum(["open", "blocked"]),
  note: z.string().max(120).optional().or(z.literal("")),
});
