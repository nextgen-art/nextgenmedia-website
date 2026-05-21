const { createClient } = require('@supabase/supabase-js');

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

function normalizeSource(ghlData) {
  const source = (ghlData.source || ghlData.attributionSource || '').toLowerCase();
  const medium  = (ghlData.medium || '').toLowerCase();
  if (source.includes('facebook') || source.includes('fb'))   return { source: 'facebook_ads', medium: 'paid' };
  if (source.includes('google'))                              return { source: 'google_ads',   medium: 'paid' };
  if (source.includes('instagram'))                           return { source: 'instagram',    medium: 'paid' };
  if (source.includes('organic'))                             return { source: 'organic',      medium: 'organic' };
  if (source.includes('referral'))                            return { source: 'referral',     medium: 'referral' };
  if (source.includes('direct') || source === '')             return { source: 'direct',       medium: 'direct' };
  return { source: source || 'unknown', medium: medium || 'unknown' };
}

function normalizeStatus(ghlStatus) {
  const s = (ghlStatus || '').toLowerCase();
  if (s === 'new' || s === 'open')         return 'new';
  if (s === 'contacted')                   return 'contacted';
  if (s === 'quoted' || s === 'proposal')  return 'quoted';
  if (s === 'won' || s === 'closed_won')   return 'closed_won';
  if (s === 'lost' || s === 'closed_lost') return 'closed_lost';
  return 'new';
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const secret = process.env.GHL_WEBHOOK_SECRET;
  if (secret) {
    const sig = event.headers['x-ghl-signature'] || event.headers['x-webhook-secret'];
    if (sig !== secret) return { statusCode: 401, body: 'Unauthorized' };
  }

  let payload;
  try { payload = JSON.parse(event.body); }
  catch (e) { return { statusCode: 400, body: 'Invalid JSON' }; }

  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  const locationId = payload.locationId || payload.location_id;
  const clientId = await getClientIdByLocation(sb, locationId);

  if (!clientId) {
    return { statusCode: 200, body: JSON.stringify({ skipped: true, reason: 'No client found', locationId }) };
  }

  const { source, medium } = normalizeSource(payload);
  const ghlContactId = payload.contactId || payload.id || payload.contact_id;

  const leadRecord = {
    client_id: clientId,
    lead_name: [payload.firstName, payload.lastName].filter(Boolean).join(' ') || payload.name || null,
    lead_email: payload.email || null,
    lead_phone: payload.phone || payload.phoneNumber || null,
    source, medium,
    campaign: payload.campaign || payload.utmCampaign || payload.utm_campaign || null,
    utm_source: payload.utmSource || payload.utm_source || source,
    utm_medium: payload.utmMedium || payload.utm_medium || medium,
    utm_campaign: payload.utmCampaign || payload.utm_campaign || null,
    utm_content: payload.utmContent || payload.utm_content || null,
    status: normalizeStatus(payload.status || payload.opportunityStatus || 'new'),
    crm_source: 'ghl',
    crm_lead_id: ghlContactId,
    ghl_contact_id: ghlContactId,
    notes: payload.notes || null,
    lead_date: new Date().toISOString().split('T')[0],
  };

  if (payload.monetaryValue || payload.opportunity_value) {
    const val = parseFloat(payload.monetaryValue || payload.opportunity_value || 0);
    if (val > 0) {
      const st = normalizeStatus(payload.opportunityStatus || payload.status || 'quoted');
      if (st === 'closed_won') { leadRecord.closed_amount = val; leadRecord.status = 'closed_won'; }
      else { leadRecord.quote_amount = val; }
    }
  }

  try {
    const { data, error } = await sb.from('leads')
      .upsert(leadRecord, { onConflict: 'ghl_contact_id,client_id', ignoreDuplicates: false })
      .select().single();
    if (error) return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    return { statusCode: 200, body: JSON.stringify({ success: true, lead_id: data.id }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
