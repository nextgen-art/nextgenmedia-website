export interface Client {
  id: string;
  client_id: string;
  client_name: string;
  client_email: string;
  business_name: string;
  company_name: string;
  phone_number: string;
  status: string;
  created_at: string;
  package_name: string;
  budget: string;
  meeting_notes: string;
  notes: string;
  dropbox_link: string | null;
  rela_link: string | null;
  strategy_call_link: string | null;
  filming_date_link: string | null;
  contract_signed_date: string | null;
  services_needed: string | null;
  proposal_sent_date: string | null;
  proposal_approved_date: string | null;
  contract_sent_date: string | null;
  onboarding_started_date: string | null;
  form_submitted_date: string | null;
  templates_populated_date: string | null;
  invoice_sent_date: string | null;
  payment_received_date: string | null;
  welcome_email_sent_date: string | null;
  meeting_recap_sent_date: string | null;
  feedback_sent_date: string | null;
  auth_user_id: string | null;
  ad_spend: string | null;
  ad_management_fee: string | null;
  package_price: string | null;
  total_investment: string | null;
}

export interface PendingDocument {
  id: string;
  client_id: string;
  document_type: string;
  document_name: string;
  document_url: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_at: string;
  description: string | null;
  contract_status: "pending" | "sent" | "invoice_sent" | "invoice_paid" | null;
  clients: {
    client_id: string;
    client_name: string;
    client_email: string;
  };
}

export interface ActivityItem {
  id: string;
  date: string;
  label: string;
  type: "created" | "proposal" | "contract" | "invoice" | "payment" | "onboarding";
  clientName: string;
}

