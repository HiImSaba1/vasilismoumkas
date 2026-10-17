"use server";

import { z } from "zod";
import { getSmtpTransport, smtpConfigured } from "@/lib/email-delivery";
import { createLead } from "@/lib/leads";

const schema = z.object({
  name: z.string().trim().min(1).max(255),
  email: z.email().max(320),
  planning: z.string().trim().max(80).optional(),
  phone: z.string().trim().max(60).optional(),
  instagram: z.string().trim().max(120).optional(),
  message: z.string().trim().max(5000).optional(),
  date: z.string().trim().max(100).optional(),
  location: z.string().trim().max(255).optional(),
});

const escape = (value: string) =>
  value.replace(/[&<>"']/g, (char) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!,
  );

export async function sendEmail(raw: unknown) {
  try {
    const data = schema.parse(raw);
    const eventType = /christening|baptism/i.test(data.planning ?? "") ? "baptism" : "wedding";
    const leadId = await createLead({
      eventType,
      coupleNames: data.name,
      email: data.email,
      phone: data.phone || null,
      eventDate: null,
      ceremonyLocation: data.location || null,
      receptionLocation: null,
      guestCount: null,
      source: "website-inquiry",
      notes:
        [
          data.planning && `Planning: ${data.planning}`,
          data.instagram && `Instagram: ${data.instagram}`,
          data.date && `Requested date: ${data.date}`,
          data.message,
        ]
          .filter(Boolean)
          .join("\n") || null,
    });

    // Website inquiries intentionally never schedule or send Template 000.
    // The studio selects GR/EN, reviews the content and sends it explicitly from CRM.
    if (smtpConfigured()) {
      const safe = (value?: string) => escape(value || "Not provided");
      await getSmtpTransport().sendMail({
        from: `Website Inquiry <${process.env.SMTP_FROM_EMAIL}>`,
        to: process.env.INQUIRY_NOTIFICATION_EMAIL ?? process.env.SMTP_USERNAME,
        replyTo: data.email,
        subject: `New enquiry: ${data.planning ?? "Photography"} - ${data.name}`,
        html: `<h2>New Website Enquiry</h2><p><strong>Name:</strong> ${safe(data.name)}</p><p><strong>Email:</strong> ${safe(data.email)}</p><p><strong>Planning:</strong> ${safe(data.planning)}</p><p><strong>Date:</strong> ${safe(data.date)}</p><p><strong>Location:</strong> ${safe(data.location)}</p><p><strong>Phone:</strong> ${safe(data.phone)}</p><p><strong>Instagram:</strong> ${safe(data.instagram)}</p><p><strong>Message:</strong><br>${safe(data.message)}</p>`,
      });
    }

    return {
      success: true,
      leadId,
      acknowledgement: "manual-required" as const,
      internalNotification: smtpConfigured() ? ("sent" as const) : ("smtp-disabled" as const),
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof z.ZodError
          ? (error.issues[0]?.message ?? "Invalid inquiry.")
          : "Your inquiry could not be saved. Please contact the studio directly.",
    };
  }
}
