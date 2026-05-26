// ============================================================
// NextGen Media -- GHL Webhook Receiver
// Netlify Serverless Function
//
// SETUP INSTRUCTIONS:
// 1. Place this file at: /netlify/functions/ghl-webhook.js
//
// 2. Set Netlify environment variables:
//      SUPABASE_URL         = https://dghlytwuslldhogqscho.supabase.co
//      SUPABASE_SERVICE_KEY = (service role key from Supabase Settings > API)
//      GHL_WEBHOOK_SECRET   = nextgenmedia2026  (must match GHL workflow header)
//
// 3. In GHL workflow Webhook action:
//      URL:    https://next-gen.media/.netlify/functions/ghl-webhook
//      Header: x-webhook-secret: nextgenmedia2026
// ============================================================

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// -- HELPERS --

// Safe string coercion -- never crashes on objects/null/undefined
function str(v) {
  return typeof v === 'string' ? v.trim() : '';
}

// Parse a monetary value from GHL -- handles "$1,500", "1500.00", numbers
function parseMoney(v) {
  if (v === null || v === undefined || v === '') return 0;
  const n = parseFloat(String(v).replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : n;
}

// Constant-time string comparison to resist timing attacks
function safeEqual(a, b) {
  try {
    const ba = Buffer.from(String(a));
    const bb = Buffer.from(String(b));
    if (ba.length !== bb.length) return false;
    return crypto.timingSafeEqual(ba, bb);
  } catch (_) {
    return false;
  }
}

// -- CLIENT LOOKUP --
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

// -- SOURCE NORMALIZATION --
function normalizeSource(payload) {
  const attribution = (payload.contact && payload.contact.attributionSource) || {};

  const rawSource = (
    str(payload.source) ||
    str(payload.attributionSource) ||
    str(attribution.utm_source) || str(attribution.utmSource) ||
    str(attribution.sessionSource) ||
    ''
  ).toLowerCase();

  const rawMedium = (
    str(payload.medium) ||
    str(attribution.utm_medium) || str(attribution.utmMedium) ||
    str(attribution.medium) ||
    ''
  ).toLowerCase();

  if (rawSource.includes('facebook') || rawSource.includes('fb') || rawSource.includes('meta')) return { source: 'facebook_ads', medium: 'paid' };
  if (rawSource.includes('google'))                               return { source: 'google_ads',   medium: 'paid' };
  if (rawSource.includes('instagram'))                            return { source: 'instagram',    medium: 'paid' };
  if (rawSource.includes('tiktok'))                               return { source: 'tiktok_ads',   medium: 'paid' };
  if (rawSource.includes('organic'))                              return { source: 'organic',      medium: 'organic' };
  if (rawSource.includes('referral'))                             return { source: 'referral',     medium: 'referral' };
  if (rawSource.includes('email'))                                return { source: 'email',        medium: 'email' };
  if (rawSource.includes('direct') || rawSource === '')           return { source: 'direct',       medium: 'direct' };
  if (rawMedium === 'manual' || rawSource.includes('crm'))        return { source: 'crm',          medium: 'manual' };
  return { source: rawSource || 'unknown', medium: rawMedium || 'unknown' };
}

// -- STATUS NORMALIZATION --
function normalizeStatus(v) {
  const s = str(v).toLowerCase();
  if (s === 'new' || s === 'open')         return 'new';
  if (s === 'contacted')                   return 'contacted';
  if (s === 'quoted' || s === 'proposal')  return 'quoted';
  if (s === 'won' || s === 'closed_won')   return 'closed_won';
  if (s === 'lost' || s === 'closed_lost') return 'closed_lost';
  return 'new';
}

// -- MAIN HANDLER --
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Require webhook secret -- fail closed if not configured
  const secret = process.env.GHL_WEBHOOK_SECRET;
  if (!secret) {
    console.error('FATAL: GHL_WEBHOOK_SECRET env var is not set. Rejecting all requests.');
    return { statusCode: 500, body: 'Webhook not configured' };
  }
  const sig = event.headers['x-ghl-signature'] || event.headers['x-webhook-secret'] || '';
  if (!safeEqual(sig, secret)) {
    console.error('Webhook secret mismatch');
    return { statusCode: 401, body: 'Unauthorized' };
  }

  // Require Supabase credentials
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.error('FATAL: SUPABASE_URL or SUPABASE_SERVICE_KEY env var is not set.');
    return { statusCode: 500, body: 'Database not configured' };
  }

  // Parse body -- GHL workflows send JSON; some triggers send form-encoded
  let payload;
  try {
    const allHeaders = event.headers || {};
    const ct = (
      Object.entries(allHeaders).find(([k]) => k.toLowerCase() === 'content-type')?.[1] || ''
    ).toLowerCase();

    if (ct.includes('application/x-www-form-urlencoded')) {
      payload = Object.fromEntries(new URLSearchParams(event.body).entries());
    } else {
      if (event.body && event.body.length > 500000) {
        console.error('Payload too large:', event.body.length);
        return { statusCode: 413, body: 'Payload too large' };
      }
      payload = JSON.parse(event.body || '{}');
    }
  } catch (e) {
    console.error('Failed to parse body:', e.message, '| Raw:', (event.body || '').substring(0, 200));
    return { statusCode: 400, body: 'Invalid request body' };
  }

  console.log('GHL webhook received:', JSON.stringify(payload, null, 2));

  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  // Extract location ID -- GHL nests it under payload.location.id
  const rawLocation = payload.location;
  const locationId =
    str(payload.locationId) ||
    str(payload.location_id) ||
    (rawLocation && typeof rawLocation === 'object' ? str(rawLocation.id) : str(rawLocation)) ||
    '';

  if (!locationId) {
    console.warn('No location ID found in payload. Keys:', Object.keys(payload));
    return { statusCode: 200, body: JSON.stringify({ skipped: true, reason: 'No location ID in payload' }) };
  }

  const clientId = await getClientIdByLocation(sb, locationId);
  if (!clientId) {
    console.warn(`No client found for GHL location: ${locationId}`);
    return { statusCode: 200, body: JSON.stringify({ skipped: true, reason: 'No client for location', locationId }) };
  }

  // Extract contact ID -- only trust contact_id/contactId fields
  // Do NOT use payload.id -- it may be a workflow or opportunity ID, not the contact
  const ghlContactId =
    str(payload.contactId) ||
    str(payload.contact_id) ||
    str(payload.contact && payload.contact.id) ||
    '';

  if (!ghlContactId) {
    console.warn('No contact ID in payload -- cannot reliably dedup. Skipping.', Object.keys(payload));
    return { statusCode: 200, body: JSON.stringify({ skipped: true, reason: 'No contact ID in payload' }) };
  }

  // Determine monetary value and status in one place (not split across two blocks)
  const monValue = parseMoney(payload.monetaryValue || payload.opportunity_value);
  const rawStatus = str(payload.opportunityStatus || payload.status);
  const finalStatus = normalizeStatus(rawStatus || 'new');
  const closedAmount = (monValue > 0 && finalStatus === 'closed_won') ? monValue : null;
  const quoteAmount  = (monValue > 0 && finalStatus !== 'closed_won') ? monValue : null;

  const { source, medium } = normalizeSource(payload);

  // Safely extract notes -- customField may be an array or object in GHL
  let notes = null;
  if (typeof payload.notes === 'string' && payload.notes) {
    notes = payload.notes;
  } else if (payload.customField !== undefined && payload.customField !== null) {
    notes = typeof payload.customField === 'string'
      ? payload.customField
      : JSON.stringify(payload.customField);
  }

  // Use GHL's date_created for lead_date (not today's date -- prevents overwrite on re-fires)
  const leadDate =
    str(payload.date_created || payload.dateAdded || payload.created_at).substring(0, 10) ||
    new Date().toISOString().substring(0, 10);

  const leadName = (
    [str(payload.firstName || payload.first_name), str(payload.lastName || payload.last_name)]
      .filter(Boolean).join(' ') ||
    str(payload.name) ||
    str(payload.full_name)
  ).trim() || null;

  const leadRecord = {
    client_id:      clientId,
    lead_name:      leadName,
    lead_email:     str(payload.email) || null,
    lead_phone:     str(payload.phone || payload.phoneNumber || payload.phone_number) || null,
    source,
    medium,
    campaign:       str(payload.campaign || payload.utmCampaign || payload.utm_campaign) || null,
    utm_source:     str(payload.utmSource || payload.utm_source) || source,
    utm_medium:     str(payload.utmMedium || payload.utm_medium) || medium,
    utm_campaign:   str(payload.utmCampaign || payload.utm_campaign) || null,
    utm_content:    str(payload.utmContent || payload.utm_content) || null,
    utm_term:       str(payload.utmTerm || payload.utm_term) || null,
    status:         finalStatus,
    crm_source:     'ghl',
    crm_lead_id:    ghlContactId,
    ghl_contact_id: ghlContactId,
    notes,
    lead_date:      leadDate,
  };

  if (closedAmount !== null) leadRecord.closed_amount = closedAmount;
  if (quoteAmount !== null)  leadRecord.quote_amount  = quoteAmount;

  try {
    const { data, error } = await sb
      .from('leads')
      .upsert(leadRecord, {
        onConflict: 'ghl_contact_id,client_id',
        ignoreDuplicates: false,
      })
      .select()
      .maybeSingle(); // safe when upsert returns 0 rows (no-op update)

    if (error) {
      console.error('Supabase upsert error:', error);
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    const leadId = data ? data.id : 'existing-no-change';
    console.log('Lead saved:', leadId);
    return { statusCode: 200, body: JSON.stringify({ success: true, lead_id: leadId }) };

  } catch (err) {
    console.error('Unexpected error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};

// ============================================================
// ADDING MORE CRMs -- create /netlify/functions/hubspot-webhook.js etc.
// Same pattern: normalize payload into the same leadRecord shape.
// HubSpot:    crm_source: 'hubspot',    crm_lead_id: payload.objectId
// Pipedrive:  crm_source: 'pipedrive',  crm_lead_id: payload.data.id
// Salesforce: crm_source: 'salesforce', crm_lead_id: payload.sobject.Id
// ============================================================
