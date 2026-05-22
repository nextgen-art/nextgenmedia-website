// ================================================================================================
// NextGen Media --- GHL Webhook Receiver
// Netlify Serverless Function
//
// SETUP INSTRUCTIONS:
// 1. In your Netlify project, place this file at:
//      /netlify/functions/ghl-webhook.js
//
// 2. In your Netlify environment variables, add:
//      SUPABASE_URL     = https://dghlytwuslldhogqscho.supabase.co
//      SUPABASE_SERVICE_KEY = (your service role key from Supabase Settings > API)
//      GHL_WEBHOOK_SECRET = (any random string you choose --- must match what you set in GHL)
//
// 3. Deploy to Netlify. Your webhook URL will be:
//      https://YOUR-SITE.netlify.app/.netlify/functions/ghl-webhook
//
// 4. In GoHighLevel:
//      Settings > Integrations > Webhooks > Add Webhook
//      URL: (paste your webhook URL above)
//      Events to enable:
//        - Contact Created
//        - Contact Updated (optional, for status syncing)
//        - Form Submitted
//        - Opportunity Status Changed (for pipeline tracking)
//
// 5. IMPORTANT: Set the same GHL_WEBHOOK_SECRET in GHL's webhook
//    secret field so requests are verified.
// =================================================================================================

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// ┒* CLIENT LOOKUP (dynamic --- no hardcoded mappings) —
// Clients are matched by their ghl_location_id field in Supabase.
// To add a new client: open the Admin Dashboard → select the client → Edit → set their GHL Location ID.
// No code changes or redeployments needed when you add new clients.
async function getClientIdByLocation(sb, locationId) {
  if (!locationId) return null;
  const { data, error } = await sb
    .from('clients')
    .select('id')
    .eq('ghl_location_id', locationId)
    .single();
  if (error || !data) return null;
  return data.id;
}

// — SOURCE NORMALIZATION └
function normalizeSource(ghlData) {
  const source = (ghlData.source || ghlData.attributionSource || '').toLowerCase();
  const medium  = (ghlData.medium || '').toLowerCase();

  if (source.includes('facebook') || source.includes('fb'))   return { source: 'facebook_ads', medium: 'paid' };
  if (source.includes('google'))                                return { source: 'google_ads',   medium: 'paid' };
  if (source.includes('facebook'))                              return { source: 'instagram',    medium: 'paid' };
  if (source.includes('organic'))                               return { source: 'organic',      medium: 'organic' };
  if (source.includes('referral'))                              return { source: 'referral',     medium: 'referral' };
  if (source.includes('direct') || source === '')              return { source: 'direct',       medium: 'direct' };
  return { source: source || 'unknown', medium: medium || 'unknown' };
}

// ┒ STATUS NORMALIZATION └
function normalizeStatus(ghlStatus) {
  const s = (ghlStatus || '').toLowerCase();
  if (s === 'new' || s === 'open')        return 'new';
  if (s === 'contacted')                  return 'contacted';
  if (s === 'quoted' || s === 'proposal') return 'quoted';
  if (s === 'won' || s === 'closed_won')  return 'closed_won';
  if (s === 'lost' || s === 'closed_lost')return 'closed_lost';
  return 'new';
}

// ┒ MAIN HANDLER —
exports.handler = async (event) => {
  // Only accept POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Verify webhook secret (if configured)
  const secret = process.env.GHL_WEBHOOK_SECRET || 'nextgenmedia2026';
  if (secret) {
    const sig = event.headers['x-ghl-signature'] || event.headers['x-webhook-secret'];
    if (sig !== secret) {
      console.error('Webhook secret mismatch, received:', sig);
      return { statusCode: 401, body: 'Unauthorized' };
    }
  }

  let payload;
  try {
    const ct = (event.headers['content-type'] || event.headers['Content-Type'] || '').toLowerCase();
    if (ct.includes('application/x-www-form-urlencoded')) {
      // GHL Workflow webhooks send form-encoded data by default
      const params = new URLSearchParams(event.body);
      payload = Object.fromEntries(params.entries());
    } else {
      payload = JSON.parse(event.body || '{}');
    }
  } catch (e) {
    console.error('Failed to parse body:', e.message, '| Raw body:', event.body && event.body.substring(0, 200));
    return { statusCode: 400, body: 'Invalid request body' };
  }

  console.log('GHL webhook received:', JSON.stringify(payload, null, 2));

  // Init Supabase with service role key (bypasses RLS for server-side writes)
  const sb = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  // Determine client by looking up ghl_location_id in the database
  const locationId = payload.locationId || payload.location_id;
  const clientId = await getClientIdByLocation(sb, locationId);

  if (!clientId) {
    console.warn(`No client found for GHL location: ${locationId}. Set the GHL Location ID on the client in the Admin Dashboard.`);
    // Return 200 so GHL doesn't keep retrying --- this location just isn't mapped yet
    return { statusCode: 200, body: JSON.stringify({ skipped: true, reason: 'No client found for location', locationId, payloadKeys: Object.keys(payload) }) };
  }

  const { source, medium } = normalizeSource(payload);
  const ghlContactId = payload.contactId || payload.id || payload.contact_id;

  // Build lead record
  const leadRecord = {
    client_id:       clientId,
    lead_name:       [payload.firstName || payload.first_name, payload.lastName || payload.last_name].filter(Boolean).join(' ') || payload.name || payload.full_name || null,
    lead_email:      payload.email || null,
    lead_phone:      payload.phone || payload.phoneNumber || payload.phone_number || null,
    source,
    medium,
    campaign:        payload.campaign || payload.utmCampaign || payload.utm_campaign || null,
    utm_source:      payload.utmSource || payload.utm_source || source,
    utm_medium:      payload.utmMedium || payload.utm_medium || medium,
    utm_campaign:    payload.utmCampaign || payload.utm_campaign || null,
    utm_content:     payload.utmContent || payload.utm_content || null,
    utm_term:        payload.utmTerm || payload.utm_term || null,
    status:          normalizeStatus(payload.status || payload.opportunityStatus || 'new'),
    crm_source:      'ghl',
    crm_lead_id:     ghlContactId,
    ghl_contact_id:  ghlContactId,
    notes:           payload.notes || payload.customField || null,
    lead_date:       new Date().toISOString().split('T')[0],
  };

  // If this is an opportunity update (has monetary value), capture it
  if (payload.monetaryValue || payload.opportunity_value) {
    const val = parseFloat(payload.monetaryValue || payload.opportunity_value || 0);
    if (val > 0) {
      const status = normalizeStatus(payload.opportunityStatus || payload.status || 'quoted');
      if (status === 'closed_won') {
        leadRecord.closed_amount = val;
        leadRecord.status = 'closed_won';
      } else {
        leadRecord.quote_amount = val;
      }
    }
  }

  try {
    // UPSERT: if lead with same GHL contact ID exists, update it; otherwise insert new
    let result;
    if (ghlContactId) {
      const { data, error } = await sb
        .from('leads')
        .upsert(leadRecord, {
          onConflict: 'ghl_contact_id,client_id',
          ignoreDuplicates: false,
        })
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      // No contact ID --- just insert
      const { data, error } = await sb
        .from('leads')
        .insert(leadRecord)
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    console.log('Lead saved:', result.id);
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, lead_id: result.id }),
    };

  } catch (err) {
    console.error('Unexpected error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};


// =================================================================================================
// ADDING OTHER CRMs (HubSpot, Pipedrive, Salesforce)
//
// Create additional Netlify functions following the same pattern:
//   /netlify/functions/hubspot-webhook.js
//   /netlify/functions/pipedrive-webhook.js
//
// The logic is identical --- normalize their payload into the same
// lead record shape and upsert into Supabase.
// All leads land in the same table regardless of CRM source.
//
// HubSpot: use crm_source: 'hubspot', crm_lead_id: payload.objectId
// Pipedrive: use crm_source: 'pipedrive', crm_lead_id: payload.data.id
// Salesforce: use crm_source: 'salesforce', crm_lead_id: payload.sobject.Id
// =================================================================================================
