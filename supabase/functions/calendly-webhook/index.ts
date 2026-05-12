import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CALENDLY_SIGNING_KEY = Deno.env.get("CALENDLY_SIGNING_KEY")!;

// Map Calendly event type names (lowercase) to our event_type enum
function mapEventType(eventTypeName: string): string {
  const name = eventTypeName.toLowerCase();
  if (name.includes("strategy") || name.includes("discovery")) return "strategy_call";
  if (name.includes("filming") || name.includes("film") || name.includes("shoot")) return "filming";
  if (name.includes("meeting") || name.includes("check")) return "meeting";
  if (name.includes("content") || name.includes("deadline")) return "content_deadline";
  return "meeting";
}

async function verifyCalendlySignature(request: Request, body: string): Promise<boolean> {
  const signature = request.headers.get("Calendly-Webhook-Signature");
  if (!signature || !CALENDLY_SIGNING_KEY) return false;

  // Calendly uses: t=timestamp,v1=signature format
  const parts = signature.split(",");
  const tPart = parts.find((p) => p.startsWith("t="));
  const v1Part = parts.find((p) => p.startsWith("v1="));
  if (!tPart || !v1Part) return false;

  const timestamp = tPart.replace("t=", "");
  const receivedSig = v1Part.replace("v1=", "");
  const toSign = `${timestamp}.${body}`;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(CALENDLY_SIGNING_KEY),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBytes = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(toSign));
  const expectedSig = Array.from(new Uint8Array(sigBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return expectedSig === receivedSig;
}

Deno.serve(async (req: Request) => {
  // Health check
  if (req.method === "GET") {
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const body = await req.text();

  // Verify signature (skip if no signing key configured yet)
  if (CALENDLY_SIGNING_KEY) {
    const valid = await verifyCalendlySignature(req, body);
    if (!valid) {
      return new Response("Invalid signature", { status: 401 });
    }
  }

  let payload: any;
  try {
    payload = JSON.parse(body);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  // Only handle invitee.created (new booking)
  const event = payload.event;
  if (event !== "invitee.created") {
    return new Response(JSON.stringify({ skipped: true, event }), { status: 200 });
  }

  const inviteeEmail: string = payload.payload?.email;
  const eventTypeName: string = payload.payload?.event_type?.name ?? "Meeting";
  const startTime: string = payload.payload?.scheduled_event?.start_time;
  const location: string = payload.payload?.scheduled_event?.location?.join_url
    ?? payload.payload?.scheduled_event?.location?.location
    ?? null;
  const inviteeName: string = payload.payload?.name ?? "";

  if (!inviteeEmail || !startTime) {
    return new Response(JSON.stringify({ error: "Missing email or start_time" }), { status: 400 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Find client by email
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("id, client_name")
    .eq("client_email", inviteeEmail.toLowerCase())
    .maybeSingle();

  if (clientError || !client) {
    // Not a registered client — ignore silently
    return new Response(JSON.stringify({ skipped: true, reason: "client not found" }), { status: 200 });
  }

  const eventDate = new Date(startTime);
  const dateStr = eventDate.toISOString().slice(0, 10); // YYYY-MM-DD
  const timeStr = eventDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Chicago", // adjust to your timezone
  });

  const mappedType = mapEventType(eventTypeName);

  // Avoid duplicate: check if an event already exists for same client + date + type
  const { data: existing } = await supabase
    .from("client_events")
    .select("id")
    .eq("client_id", client.id)
    .eq("event_date", dateStr)
    .eq("event_type", mappedType)
    .maybeSingle();

  if (existing) {
    return new Response(JSON.stringify({ skipped: true, reason: "duplicate" }), { status: 200 });
  }

  // Create the event
  const { error: insertError } = await supabase.from("client_events").insert({
    client_id: client.id,
    event_type: mappedType,
    title: eventTypeName,
    description: inviteeName ? `Booked by ${inviteeName}` : null,
    event_date: dateStr,
    event_time: timeStr,
    is_all_day: false,
    meeting_link: location ?? null,
    is_visible_to_client: true,
    reminder_days_before: 1,
    created_by: null,
  });

  if (insertError) {
    console.error("Insert error:", insertError);
    return new Response(JSON.stringify({ error: insertError.message }), { status: 500 });
  }

  console.log(`Created ${mappedType} event for client ${client.client_name} on ${dateStr}`);
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
});
