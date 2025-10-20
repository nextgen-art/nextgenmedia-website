// Edge Function to send email notifications when contact form is submitted
// Deployed to Supabase Edge Functions
// Triggered by database webhook on new contact_inquiries row

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const OWNER_EMAIL = Deno.env.get("OWNER_EMAIL") || "info@nextgenmedia.com";

interface ContactInquiry {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  created_at: string;
}

serve(async (req) => {
  try {
    // Parse the webhook payload from Supabase
    const payload = await req.json();
    const record: ContactInquiry = payload.record;

    if (!record) {
      return new Response(
        JSON.stringify({ error: "No record found in payload" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Format the email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f4f4f4; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #555; }
          .value { margin-left: 10px; }
          .message { background-color: #f9f9f9; padding: 15px; border-left: 4px solid #4CAF50; margin-top: 20px; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🎯 New Contact Form Submission</h2>
            <p style="margin: 0; color: #666;">Submitted on ${new Date(record.created_at).toLocaleString()}</p>
          </div>

          <div class="field">
            <span class="label">Name:</span>
            <span class="value">${record.first_name} ${record.last_name}</span>
          </div>

          <div class="field">
            <span class="label">Email:</span>
            <span class="value"><a href="mailto:${record.email}">${record.email}</a></span>
          </div>

          ${record.phone ? `
          <div class="field">
            <span class="label">Phone:</span>
            <span class="value"><a href="tel:${record.phone}">${record.phone}</a></span>
          </div>
          ` : ''}

          ${record.company ? `
          <div class="field">
            <span class="label">Company:</span>
            <span class="value">${record.company}</span>
          </div>
          ` : ''}

          <div class="message">
            <div class="label">Message:</div>
            <p>${record.message.replace(/\n/g, '<br>')}</p>
          </div>

          <div class="footer">
            <p>This email was sent from your NextGen Media website contact form.</p>
            <p>View all submissions in your <a href="https://dghlytwuslldhogqscho.supabase.co">Supabase Dashboard</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email via Resend API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "NextGen Media <noreply@yourdomain.com>", // Update with your verified domain
        to: [OWNER_EMAIL],
        subject: `New Contact: ${record.first_name} ${record.last_name} - ${record.company || 'No Company'}`,
        html: emailHtml,
        reply_to: record.email,
      }),
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.text();
      console.error("Resend API error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: error }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const emailData = await emailResponse.json();
    console.log("Email sent successfully:", emailData);

    return new Response(
      JSON.stringify({ success: true, emailId: emailData.id }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
